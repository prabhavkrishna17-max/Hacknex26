#!/usr/bin/env python
"""HNX26EPS01 Phase 3 Ablation Runner

Evaluates five distinct systems against the identical 25-case adversarial stress test:
1. Baseline: Standard untouched RAG (Hybrid RRF, Top-K=4)
2. Baseline + JARF: Jurisdiction Authority Router & Filter
3. Baseline + CPDE: Clause-Precedence Dependency Expander
4. Baseline + ESV:  Evidence Sufficiency Verifier
5. Full JC-PAR:     JARF + CPDE + ESV

Stores results in data/results/ablation/ without modifying or overwriting baseline files.
"""

from __future__ import annotations
import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np

from src.core.config import BaselineConfig
from src.core.models import AnswerPayload, Chunk, ScoredChunk
from src.interventions.jc_par_pipeline import JCPARPipeline
from src.pipeline import BaselineRAGPipeline
from run_stress_test import classify_failure_root_cause, evaluate_groundedness_strict


def evaluate_system(
    system_name: str,
    pipeline_wrapper: JCPARPipeline,
    cases: List[dict],
    use_jurisdiction_routing: bool,
    use_dependency_expansion: bool,
    use_sufficiency_verification: bool,
) -> Dict[str, Any]:
    print(f"\n=======================================================")
    print(f"  Evaluating System: {system_name.upper()}")
    print(f"  (JARF={use_jurisdiction_routing}, CPDE={use_dependency_expansion}, ESV={use_sufficiency_verification})")
    print(f"=======================================================")

    results: List[Dict[str, Any]] = []

    recall_1_list = []
    recall_3_list = []
    recall_5_list = []
    recall_10_list = []
    distractor_outranked_count = 0

    grounded_counts = {"SUPPORTED": 0, "PARTIALLY_SUPPORTED": 0, "UNSUPPORTED": 0, "CONTRADICTED": 0}
    abstention_stats = {"correct_abstention": 0, "false_abstention": 0, "unsupported_answer": 0, "overconfident_answer": 0}
    failure_causes: Dict[str, int] = {}
    latencies: List[float] = []
    evidence_sizes: List[int] = []

    jurisdiction_cases = [c for c in cases if c.get("category") == "J_JURISDICTION_SENSITIVE"]
    jurisdiction_correct = 0

    for case in cases:
        qid = case["id"]
        cat = case["category"]
        query = case["question"]
        jur = case.get("jurisdiction", "Default")
        required_cids = case.get("required_chunk_ids", [])
        distractor_cids = case.get("distractor_chunk_ids", [])
        is_unanswerable = case.get("expected_abstention", False)
        gold_ans = case["gold_answer"]
        key_nuances = case.get("key_nuances", [])

        # 1. Retrieval
        t0 = time.perf_counter()
        retrieved_10, ret_meta = pipeline_wrapper.retrieve(query, selected_jurisdiction=jur if use_jurisdiction_routing else None, top_k=10)
        ret_ms = (time.perf_counter() - t0) * 1000.0

        retrieved_top4 = retrieved_10[:4]
        top10_cids = [sc.chunk.chunk_id for sc in retrieved_10]
        top4_cids = [sc.chunk.chunk_id for sc in retrieved_top4]

        # Calculate Recall
        if required_cids:
            r1 = sum(1 for cid in required_cids if cid in top10_cids[:1]) / len(required_cids)
            r3 = sum(1 for cid in required_cids if cid in top10_cids[:3]) / len(required_cids)
            r5 = sum(1 for cid in required_cids if cid in top10_cids[:5]) / len(required_cids)
            r10 = sum(1 for cid in required_cids if cid in top10_cids[:10]) / len(required_cids)
            recall_1_list.append(r1)
            recall_3_list.append(r3)
            recall_5_list.append(r5)
            recall_10_list.append(r10)
        else:
            r1, r3, r5, r10 = 1.0, 1.0, 1.0, 1.0

        # Check distractor outranking
        distractor_outranked = False
        if distractor_cids and required_cids:
            dist_ranks = [top10_cids.index(d) for d in distractor_cids if d in top10_cids]
            req_ranks = [top10_cids.index(r) for r in required_cids if r in top10_cids]
            if dist_ranks and req_ranks and min(dist_ranks) < min(req_ranks):
                distractor_outranked = True
                distractor_outranked_count += 1

        # 2. Query execution (End-to-End)
        t_q = time.perf_counter()
        answer = pipeline_wrapper.query(
            query=query,
            selected_jurisdiction=jur if use_jurisdiction_routing else None,
            question_id=qid,
            top_k=4,
        )
        total_time_ms = (time.perf_counter() - t_q) * 1000.0
        latencies.append(total_time_ms)
        evidence_sizes.append(len(retrieved_top4))

        # 3. Groundedness Evaluation
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

        # 4. Abstention Evaluation
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

        # 5. Jurisdiction Accuracy
        if cat == "J_JURISDICTION_SENSITIVE" and tier == "SUPPORTED":
            jurisdiction_correct += 1

        # 6. Failure Root Cause
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
            "jurisdiction": jur,
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
            "root_cause": root_cause or "SUCCESS",
            "latency_ms": total_time_ms,
        })

    total_samples = len(results)
    total_failures = sum(failure_causes.values())
    failure_rate = total_failures / total_samples

    summary = {
        "system_name": system_name,
        "configuration": {
            "use_jarf": use_jurisdiction_routing,
            "use_cpde": use_dependency_expansion,
            "use_esv": use_sufficiency_verification,
        },
        "retrieval": {
            "mean_recall_at_1": float(np.mean(recall_1_list)),
            "mean_recall_at_3": float(np.mean(recall_3_list)),
            "mean_recall_at_5": float(np.mean(recall_5_list)),
            "mean_recall_at_10": float(np.mean(recall_10_list)),
            "distractor_outranked_count": distractor_outranked_count,
            "distractor_outranked_rate": distractor_outranked_count / total_samples,
        },
        "groundedness": {
            "supported_count": grounded_counts["SUPPORTED"],
            "supported_rate": grounded_counts["SUPPORTED"] / total_samples,
            "partially_supported_count": grounded_counts["PARTIALLY_SUPPORTED"],
            "partially_supported_rate": grounded_counts["PARTIALLY_SUPPORTED"] / total_samples,
            "unsupported_count": grounded_counts["UNSUPPORTED"],
            "unsupported_rate": grounded_counts["UNSUPPORTED"] / total_samples,
            "contradicted_count": grounded_counts["CONTRADICTED"],
            "contradicted_rate": grounded_counts["CONTRADICTED"] / total_samples,
        },
        "abstention": {
            "correct_abstention": abstention_stats["correct_abstention"],
            "overconfident_answer": abstention_stats["overconfident_answer"],
            "false_abstention": abstention_stats["false_abstention"],
            "unsupported_answer": abstention_stats["unsupported_answer"],
            "abstention_accuracy": (abstention_stats["correct_abstention"] / 3.0) if 3.0 > 0 else 0.0,
        },
        "jurisdiction": {
            "total_jurisdiction_cases": len(jurisdiction_cases),
            "correct_jurisdiction_cases": jurisdiction_correct,
            "jurisdiction_accuracy": jurisdiction_correct / len(jurisdiction_cases) if jurisdiction_cases else 0.0,
        },
        "operational": {
            "mean_latency_ms": float(np.mean(latencies)),
            "p90_latency_ms": float(np.percentile(latencies, 90)),
            "mean_evidence_size": float(np.mean(evidence_sizes)),
        },
        "failures": {
            "total_failures": total_failures,
            "failure_rate": failure_rate,
            "root_causes": failure_causes,
        },
        "detailed_results": results,
    }

    print(f"  • Overall Failure Rate:     {failure_rate*100:.1f}% ({total_failures}/{total_samples})")
    print(f"  • Recall@5:                 {summary['retrieval']['mean_recall_at_5']*100:.1f}%")
    print(f"  • Distractor Outranked:     {distractor_outranked_count} cases ({distractor_outranked_count/total_samples*100:.1f}%)")
    print(f"  • Fully Supported:          {summary['groundedness']['supported_rate']*100:.1f}%")
    print(f"  • Directly Contradicted:    {summary['groundedness']['contradicted_rate']*100:.1f}%")
    print(f"  • Overconfident Answers:    {abstention_stats['overconfident_answer']} cases")
    print(f"  • Correct Abstentions:      {abstention_stats['correct_abstention']}/3 cases ({summary['abstention']['abstention_accuracy']*100:.1f}%)")
    print(f"  • Jurisdiction Accuracy:    {jurisdiction_correct}/{len(jurisdiction_cases)} ({summary['jurisdiction']['jurisdiction_accuracy']*100:.1f}%)")
    print(f"  • Mean Latency:             {summary['operational']['mean_latency_ms']:.2f} ms")

    return summary


def run_ablation(system_arg: str):
    testset_path = Path("data/evaluation/adversarial_stress_test.json")
    out_dir = Path("data/results/ablation")
    out_dir.mkdir(parents=True, exist_ok=True)

    with open(testset_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    # Initialize baseline pipeline once
    config = BaselineConfig()
    base_pipeline = BaselineRAGPipeline(config=config)
    print(f"[*] Ingesting corpus from {config.corpus_dir}...")
    base_pipeline.ingest_and_index()
    print(f"[+] Corpus indexed: {len(base_pipeline.documents)} documents, {len(base_pipeline.chunks)} chunks.")

    systems_to_run = []
    if system_arg == "baseline":
        systems_to_run = [("baseline", False, False, False)]
    elif system_arg == "jarf":
        systems_to_run = [("jarf", True, False, False)]
    elif system_arg == "cpde":
        systems_to_run = [("cpde", False, True, False)]
    elif system_arg == "esv":
        systems_to_run = [("esv", False, False, True)]
    elif system_arg == "full":
        systems_to_run = [("full", True, True, True)]
    elif system_arg == "all":
        systems_to_run = [
            ("baseline", False, False, False),
            ("jarf", True, False, False),
            ("cpde", False, True, False),
            ("esv", False, False, True),
            ("full", True, True, True),
        ]
    else:
        print(f"[!] Unknown system: {system_arg}")
        return 1

    comparison_table = []
    all_summaries: Dict[str, Any] = {}

    for sys_name, use_j, use_c, use_e in systems_to_run:
        wrapper = JCPARPipeline(
            base_pipeline=base_pipeline,
            use_jarf=use_j,
            use_cpde=use_c,
            use_esv=use_e,
        )
        summary = evaluate_system(
            system_name=sys_name,
            pipeline_wrapper=wrapper,
            cases=cases,
            use_jurisdiction_routing=use_j,
            use_dependency_expansion=use_c,
            use_sufficiency_verification=use_e,
        )
        all_summaries[sys_name] = summary

        sys_out_file = out_dir / f"{sys_name}.json"
        with open(sys_out_file, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        print(f"[+] Saved {sys_name} results to: {sys_out_file}")

        comparison_table.append({
            "System": sys_name.upper(),
            "Recall@5": f"{summary['retrieval']['mean_recall_at_5']*100:.1f}%",
            "Supported": f"{summary['groundedness']['supported_rate']*100:.1f}%",
            "Contradiction": f"{summary['groundedness']['contradicted_rate']*100:.1f}%",
            "Overconfidence": f"{summary['abstention']['overconfident_answer']} cases",
            "Abstention Acc": f"{summary['abstention']['abstention_accuracy']*100:.1f}%",
            "Jurisdiction Acc": f"{summary['jurisdiction']['jurisdiction_accuracy']*100:.1f}%",
            "Failure Rate": f"{summary['failures']['failure_rate']*100:.1f}%",
            "Latency (ms)": f"{summary['operational']['mean_latency_ms']:.2f}",
        })

    # Save comparison table if multiple systems run
    if len(systems_to_run) > 1:
        comp_file = out_dir / "comparison.json"
        with open(comp_file, "w", encoding="utf-8") as f:
            json.dump(all_summaries, f, indent=2)
        print(f"\n[+] Saved full multi-system comparison to: {comp_file}")

        print("\n" + "="*85)
        print("                        PHASE 3 ABLATION COMPARISON MATRIX                     ")
        print("="*85)
        header = f"{'System':<14} | {'Recall@5':<9} | {'Supported':<10} | {'Contradict':<11} | {'Overconf':<9} | {'Abstain':<8} | {'Jurisdict':<10} | {'Failure %':<9} | {'Latency':<8}"
        print(header)
        print("-" * len(header))
        for row in comparison_table:
            print(f"{row['System']:<14} | {row['Recall@5']:<9} | {row['Supported']:<10} | {row['Contradiction']:<11} | {row['Overconfidence']:<9} | {row['Abstention Acc']:<8} | {row['Jurisdiction Acc']:<10} | {row['Failure Rate']:<9} | {row['Latency (ms)']:<8}")
        print("="*85 + "\n")

    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HNX26EPS01 Phase 3 Ablation Runner")
    parser.add_argument(
        "--system",
        choices=["baseline", "jarf", "cpde", "esv", "full", "all"],
        default="all",
        help="System configuration to evaluate.",
    )
    args = parser.parse_args()
    sys.exit(run_ablation(args.system))
