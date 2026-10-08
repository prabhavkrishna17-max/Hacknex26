#!/usr/bin/env python
"""HNX26EPS01 Phase 2 Adversarial Stress-Test Runner

Executes the unmodified baseline RAG pipeline against the 25-question legal stress test.
Measures retrieval failures (Recall@1, 3, 5, 10, distractor ranking, multi-hop splits),
strict 4-level groundedness, abstention failures, and jurisdiction breakdowns.
Classifies failure root causes into the research taxonomy without modifying the baseline.
"""

from __future__ import annotations
import json
import re
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np

from src.core.config import BaselineConfig
from src.core.models import AnswerPayload, Chunk, ScoredChunk
from src.pipeline import BaselineRAGPipeline


def evaluate_groundedness_strict(
    answer_payload: AnswerPayload,
    required_chunks: List[str],
    retrieved_chunks: List[ScoredChunk],
    gold_answer: str,
    key_nuances: List[str],
    is_unanswerable: bool,
) -> Dict[str, Any]:
    """Evaluates groundedness across 4 strict tiers:

    SUPPORTED, PARTIALLY_SUPPORTED, UNSUPPORTED, CONTRADICTED.
    """
    ans_text = answer_payload.answer_text.strip().lower()

    if is_unanswerable:
        if answer_payload.is_abstention:
            return {
                "groundedness_tier": "SUPPORTED",
                "is_supported": True,
                "is_partially_supported": False,
                "is_unsupported": False,
                "is_contradicted": False,
                "omission_detected": False,
                "nuance_coverage": 1.0,
            }
        else:
            return {
                "groundedness_tier": "UNSUPPORTED",
                "is_supported": False,
                "is_partially_supported": False,
                "is_unsupported": True,
                "is_contradicted": False,
                "omission_detected": False,
                "nuance_coverage": 0.0,
            }

    if answer_payload.is_abstention:
        return {
            "groundedness_tier": "UNSUPPORTED",
            "is_supported": False,
            "is_partially_supported": False,
            "is_unsupported": True,
            "is_contradicted": False,
            "omission_detected": True,
            "nuance_coverage": 0.0,
        }

    # Measure coverage of key nuances from the gold legal rationale
    nuance_hits = 0
    for nuance in key_nuances:
        tokens = [t for t in re.findall(r"[a-z0-9]+", nuance.lower()) if len(t) > 2]
        if tokens and all(t in ans_text for t in tokens):
            nuance_hits += 1

    coverage = nuance_hits / len(key_nuances) if key_nuances else 0.0

    # Check for contradictions
    contradicted = False
    gold_lower = gold_answer.lower()
    if ("no" in gold_lower.split()[:5] or "void" in gold_lower or "cannot" in gold_lower) and ("is liable" in ans_text or "shall be liable" in ans_text or "is valid and enforceable" in ans_text and "not" not in ans_text):
        contradicted = True
    elif "15" in gold_lower and "30" in ans_text and "15" not in ans_text:
        contradicted = True

    if contradicted:
        tier = "CONTRADICTED"
    elif coverage >= 0.75:
        tier = "SUPPORTED"
    elif coverage >= 0.35:
        tier = "PARTIALLY_SUPPORTED"
    else:
        tier = "UNSUPPORTED"

    omission = coverage < 0.60

    return {
        "groundedness_tier": tier,
        "is_supported": (tier == "SUPPORTED"),
        "is_partially_supported": (tier == "PARTIALLY_SUPPORTED"),
        "is_unsupported": (tier == "UNSUPPORTED"),
        "is_contradicted": contradicted,
        "omission_detected": omission,
        "nuance_coverage": coverage,
    }


def classify_failure_root_cause(
    case: dict,
    retrieved_top10: List[ScoredChunk],
    top4_cids: List[str],
    grounded_eval: Dict[str, Any],
    distractor_outranked: bool,
    answer_payload: AnswerPayload,
) -> Optional[str]:
    """Diagnoses the precise root cause of failure."""
    category = case["category"]
    required_cids = case["required_chunk_ids"]
    is_unanswerable = case["expected_abstention"]

    # 1. Unanswerable evaluation
    if is_unanswerable:
        if not answer_payload.is_abstention:
            return "OVERCONFIDENT_ANSWER"
        return None

    # 2. Check if required chunks were retrieved in top-4
    hits_top4 = [cid for cid in required_cids if cid in top4_cids]
    retrieval_miss_top4 = len(hits_top4) < len(required_cids)

    # All required chunks completely missing from top 10
    top10_cids = [sc.chunk.chunk_id for sc in retrieved_top10]
    hits_top10 = [cid for cid in required_cids if cid in top10_cids]

    if len(hits_top10) == 0:
        return "RETRIEVAL_MISS"

    if distractor_outranked and retrieval_miss_top4:
        return "WRONG_EVIDENCE_RANKING"

    if len(required_cids) > 1 and len(hits_top4) < len(required_cids):
        return "MULTI_HOP_FAILURE"

    if category == "J_JURISDICTION_SENSITIVE" and grounded_eval["groundedness_tier"] in ("CONTRADICTED", "UNSUPPORTED"):
        return "JURISDICTION_FAILURE"

    if category == "D_CONFLICTING_PROVISIONS" and grounded_eval["groundedness_tier"] in ("CONTRADICTED", "UNSUPPORTED"):
        return "CONFLICT_RESOLUTION_FAILURE"

    if category == "F_NEGATION_EXCEPTION" and (grounded_eval["is_contradicted"] or grounded_eval["omission_detected"]):
        return "NEGATION_FAILURE"

    if category == "E_DEFINITION_DEPENDENCY" and retrieval_miss_top4:
        return "DEFINITION_DEPENDENCY_FAILURE"

    if category == "B_DISTANT_EVIDENCE" and retrieval_miss_top4:
        return "CHUNK_BOUNDARY_FAILURE"

    if grounded_eval["is_contradicted"]:
        return "CONFLICT_RESOLUTION_FAILURE"

    if grounded_eval["is_unsupported"]:
        if answer_payload.is_abstention:
            return "INCORRECT_ABSTENTION"
        return "GENERATION_HALLUCINATION"

    if grounded_eval["is_partially_supported"]:
        return "INSUFFICIENT_EVIDENCE"

    return None


def run_stress_test():
    testset_path = Path("data/evaluation/adversarial_stress_test.json")
    results_path = Path("data/results/adversarial_baseline_results.json")

    with open(testset_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    config = BaselineConfig()
    pipeline = BaselineRAGPipeline(config=config)
    print(f"[*] Ingesting corpus from {config.corpus_dir}...")
    chunks = pipeline.ingest_and_index()
    print(f"[+] Corpus indexed: {len(pipeline.documents)} documents, {len(chunks)} chunks.")

    results: List[Dict[str, Any]] = []

    # Counters
    recall_1_list = []
    recall_3_list = []
    recall_5_list = []
    recall_10_list = []
    distractor_outranked_count = 0
    multi_chunk_count = 0

    grounded_counts = {"SUPPORTED": 0, "PARTIALLY_SUPPORTED": 0, "UNSUPPORTED": 0, "CONTRADICTED": 0}
    abstention_stats = {"correct_abstention": 0, "false_abstention": 0, "unsupported_answer": 0, "overconfident_answer": 0}
    failure_causes: Dict[str, int] = {}

    print(f"[*] Running stress test on {len(cases)} legal adversarial cases...")

    for case in cases:
        qid = case["id"]
        cat = case["category"]
        query = case["question"]
        jurisdiction = case.get("jurisdiction", "Default")
        required_cids = case.get("required_chunk_ids", [])
        distractor_cids = case.get("distractor_chunk_ids", [])
        is_unanswerable = case.get("expected_abstention", False)
        gold_ans = case["gold_answer"]
        key_nuances = case.get("key_nuances", [])

        # Retrieve top 10 to inspect rank distribution
        t0 = time.perf_counter()
        retrieved_10 = pipeline.retrieve(query, top_k=10)
        retrieval_ms = (time.perf_counter() - t0) * 1000.0

        retrieved_top4 = retrieved_10[:4]

        # Generate answer using top-4
        t_gen = time.perf_counter()
        answer = pipeline.generate(query, retrieved_top4, question_id=qid)
        gen_ms = (time.perf_counter() - t_gen) * 1000.0

        top10_cids = [sc.chunk.chunk_id for sc in retrieved_10]
        top4_cids = [sc.chunk.chunk_id for sc in retrieved_top4]

        # Calculate Recall@1, 3, 5, 10
        if required_cids:
            r1 = sum(1 for cid in required_cids if cid in top10_cids[:1]) / len(required_cids)
            r3 = sum(1 for cid in required_cids if cid in top10_cids[:3]) / len(required_cids)
            r5 = sum(1 for cid in required_cids if cid in top10_cids[:5]) / len(required_cids)
            r10 = sum(1 for cid in required_cids if cid in top10_cids[:10]) / len(required_cids)

            recall_1_list.append(r1)
            recall_3_list.append(r3)
            recall_5_list.append(r5)
            recall_10_list.append(r10)

            if len(required_cids) > 1:
                multi_chunk_count += 1
        else:
            r1, r3, r5, r10 = 1.0, 1.0, 1.0, 1.0

        # Check distractor outranking
        distractor_outranked = False
        if distractor_cids and required_cids:
            distractor_ranks = [top10_cids.index(d) for d in distractor_cids if d in top10_cids]
            required_ranks = [top10_cids.index(r) for r in required_cids if r in top10_cids]
            if distractor_ranks and required_ranks and min(distractor_ranks) < min(required_ranks):
                distractor_outranked = True
                distractor_outranked_count += 1

        # Strict Groundedness evaluation
        strict_eval = evaluate_groundedness_strict(
            answer_payload=answer,
            required_chunks=required_cids,
            retrieved_chunks=retrieved_top4,
            gold_answer=gold_ans,
            key_nuances=key_nuances,
            is_unanswerable=is_unanswerable,
        )

        tier = strict_eval["groundedness_tier"]
        grounded_counts[tier] = grounded_counts.get(tier, 0) + 1

        # Abstention breakdown
        if is_unanswerable:
            if answer.is_abstention:
                abstention_stats["correct_abstention"] += 1
                abstention_status = "CORRECT_ABSTENTION"
            else:
                abstention_stats["overconfident_answer"] += 1
                abstention_status = "OVERCONFIDENT_ANSWER"
        else:
            if answer.is_abstention:
                abstention_stats["false_abstention"] += 1
                abstention_status = "FALSE_ABSTENTION"
            else:
                if tier in ("UNSUPPORTED", "CONTRADICTED"):
                    abstention_stats["unsupported_answer"] += 1
                    abstention_status = "UNSUPPORTED_ANSWER"
                else:
                    abstention_status = "CORRECT_ANSWER"

        # Failure root cause classification
        root_cause = classify_failure_root_cause(
            case=case,
            retrieved_top10=retrieved_10,
            top4_cids=top4_cids,
            grounded_eval=strict_eval,
            distractor_outranked=distractor_outranked,
            answer_payload=answer,
        )

        if root_cause:
            failure_causes[root_cause] = failure_causes.get(root_cause, 0) + 1

        results.append({
            "id": qid,
            "category": cat,
            "category_name": case["category_name"],
            "jurisdiction": jurisdiction,
            "question": query,
            "required_chunk_ids": required_cids,
            "retrieved_chunk_ids_top4": top4_cids,
            "retrieved_chunk_ids_top10": top10_cids,
            "recall_at_1": r1,
            "recall_at_3": r3,
            "recall_at_5": r5,
            "recall_at_10": r10,
            "distractor_outranked": distractor_outranked,
            "answer_text": answer.answer_text,
            "is_abstention": answer.is_abstention,
            "groundedness_tier": tier,
            "nuance_coverage": strict_eval["nuance_coverage"],
            "omission_detected": strict_eval["omission_detected"],
            "is_contradicted": strict_eval["is_contradicted"],
            "abstention_status": abstention_status,
            "root_cause": root_cause or "SUCCESS",
            "latencies_ms": {"retrieval": retrieval_ms, "generation": gen_ms, "total": retrieval_ms + gen_ms},
        })

    total_samples = len(results)
    mean_r1 = float(np.mean(recall_1_list)) if recall_1_list else 0.0
    mean_r3 = float(np.mean(recall_3_list)) if recall_3_list else 0.0
    mean_r5 = float(np.mean(recall_5_list)) if recall_5_list else 0.0
    mean_r10 = float(np.mean(recall_10_list)) if recall_10_list else 0.0

    summary = {
        "benchmark_metadata": {
            "title": "HNX26EPS01 Adversarial Stress Test Baseline Evaluation",
            "date": "2026-10-08",
            "total_samples": total_samples,
            "pipeline_tested": "Unmodified Baseline RAG (Hybrid RRF, top_k=4)",
        },
        "retrieval_metrics": {
            "mean_recall_at_1": mean_r1,
            "mean_recall_at_3": mean_r3,
            "mean_recall_at_5": mean_r5,
            "mean_recall_at_10": mean_r10,
            "distractor_outranked_count": distractor_outranked_count,
            "distractor_outranked_rate": distractor_outranked_count / total_samples,
            "multi_chunk_evidence_cases": multi_chunk_count,
        },
        "groundedness_metrics": {
            "supported_count": grounded_counts["SUPPORTED"],
            "supported_rate": grounded_counts["SUPPORTED"] / total_samples,
            "partially_supported_count": grounded_counts["PARTIALLY_SUPPORTED"],
            "partially_supported_rate": grounded_counts["PARTIALLY_SUPPORTED"] / total_samples,
            "unsupported_count": grounded_counts["UNSUPPORTED"],
            "unsupported_rate": grounded_counts["UNSUPPORTED"] / total_samples,
            "contradicted_count": grounded_counts["CONTRADICTED"],
            "contradicted_rate": grounded_counts["CONTRADICTED"] / total_samples,
        },
        "abstention_metrics": abstention_stats,
        "failure_root_causes": failure_causes,
        "total_failures": sum(failure_causes.values()),
        "overall_failure_rate": sum(failure_causes.values()) / total_samples,
        "detailed_results": results,
    }

    results_path.parent.mkdir(parents=True, exist_ok=True)
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"\n[+] Stress test results saved to: {results_path}")
    print("\n=======================================================")
    print("          HNX26EPS01 STRESS-TEST FAILURE PROFILE       ")
    print("=======================================================")
    print(f"Total Samples Tested:          {total_samples}")
    print(f"Overall Failure Rate:          {summary['overall_failure_rate']*100:.1f}% ({summary['total_failures']}/{total_samples} cases)")
    print(f"\n[Retrieval Metrics]")
    print(f"  Recall@1:                    {mean_r1*100:.1f}%")
    print(f"  Recall@3:                    {mean_r3*100:.1f}%")
    print(f"  Recall@5:                    {mean_r5*100:.1f}%")
    print(f"  Recall@10:                   {mean_r10*100:.1f}%")
    print(f"  Distractor Outranked Correct: {distractor_outranked_count} cases ({distractor_outranked_count/total_samples*100:.1f}%)")
    print(f"\n[Strict Groundedness Tiers]")
    print(f"  Fully Supported:             {grounded_counts['SUPPORTED']} ({grounded_counts['SUPPORTED']/total_samples*100:.1f}%)")
    print(f"  Partially Supported:         {grounded_counts['PARTIALLY_SUPPORTED']} ({grounded_counts['PARTIALLY_SUPPORTED']/total_samples*100:.1f}%)")
    print(f"  Unsupported:                 {grounded_counts['UNSUPPORTED']} ({grounded_counts['UNSUPPORTED']/total_samples*100:.1f}%)")
    print(f"  Directly Contradicted:       {grounded_counts['CONTRADICTED']} ({grounded_counts['CONTRADICTED']/total_samples*100:.1f}%)")
    print(f"\n[Failure Root Cause Breakdown]")
    for cause, cnt in sorted(failure_causes.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {cause:<30} {cnt:>2} cases ({cnt/total_samples*100:>4.1f}%)")
    print("=======================================================\n")
    return 0


if __name__ == "__main__":
    sys.exit(run_stress_test())
