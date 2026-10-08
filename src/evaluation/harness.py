from __future__ import annotations
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
from src.core.models import (
    AnswerPayload,
    BenchmarkSummary,
    Chunk,
    EvaluationResult,
    ScoredChunk,
)
from src.evaluation.metrics import EvaluationMetrics


class EvaluationHarness:
    """Executes benchmark test sets and produces detailed quantitative evaluation reports."""

    def __init__(self, testset_path: Path):
        self.testset_path = testset_path
        self.test_cases: List[dict] = self._load_testset()

    def _load_testset(self) -> List[dict]:
        with open(self.testset_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def evaluate_pipeline(
        self,
        pipeline,
        corpus_chunks: List[Chunk],
    ) -> BenchmarkSummary:
        chunk_map: Dict[str, Chunk] = {c.chunk_id: c for c in corpus_chunks}
        results: List[EvaluationResult] = []

        type_counts: Dict[str, int] = {}
        abstention_correct_count = 0

        for item in self.test_cases:
            qid = item["id"]
            q_type = item["type"]
            query = item["question"]
            target_docs = item.get("target_doc_ids", [])
            expected_abstain = item.get("expected_abstention", False)

            type_counts[q_type] = type_counts.get(q_type, 0) + 1

            # Run query through RAG pipeline with timing
            t0 = time.perf_counter()
            retrieved_chunks: List[ScoredChunk] = pipeline.retrieve(query)
            answer_payload: AnswerPayload = pipeline.generate(query, retrieved_chunks, question_id=qid)
            total_time_ms = (time.perf_counter() - t0) * 1000.0

            # 1. Recall@K
            recall = EvaluationMetrics.compute_recall_at_k(retrieved_chunks, target_docs)
            hit = recall > 0.0

            # 2. Citations & Groundedness
            citation_eval = EvaluationMetrics.evaluate_citations_and_groundedness(
                answer_payload, retrieved_chunks, chunk_map
            )

            # 3. Usefulness
            usefulness = EvaluationMetrics.compute_usefulness(
                item, answer_payload, citation_eval["groundedness"]
            )

            # 4. Abstention Correctness
            abstain_correct = (answer_payload.is_abstention == expected_abstain)
            if abstain_correct:
                abstention_correct_count += 1

            eval_res = EvaluationResult(
                question_id=qid,
                question_type=q_type,
                query=query,
                recall_at_k=recall,
                retrieval_hit=hit,
                groundedness=citation_eval["groundedness"],
                unsupported_claim_count=int(citation_eval["unsupported_claim_count"]),
                unsupported_claim_rate=citation_eval["unsupported_claim_rate"],
                fabricated_citation_count=int(citation_eval["fabricated_citation_count"]),
                fabricated_citation_rate=citation_eval["fabricated_citation_rate"],
                usefulness_score=usefulness,
                abstention_correctness=abstain_correct,
                latency_ms=total_time_ms,
                details={
                    "answer_text": answer_payload.answer_text,
                    "citations": [c.model_dump() for c in answer_payload.citations],
                    "retrieved_chunk_ids": [sc.chunk.chunk_id for sc in retrieved_chunks],
                    "is_abstention": answer_payload.is_abstention,
                    "pipeline_latencies": answer_payload.latency_ms,
                }
            )
            results.append(eval_res)

        # Aggregate summary statistics
        latencies = [r.latency_ms for r in results]
        p90_lat = float(np.percentile(latencies, 90)) if latencies else 0.0
        mean_lat = float(np.mean(latencies)) if latencies else 0.0

        summary = BenchmarkSummary(
            total_samples=len(results),
            samples_by_type=type_counts,
            mean_recall_at_k=float(np.mean([r.recall_at_k for r in results])),
            mean_groundedness=float(np.mean([r.groundedness for r in results])),
            mean_unsupported_claim_rate=float(np.mean([r.unsupported_claim_rate for r in results])),
            mean_fabricated_citation_rate=float(np.mean([r.fabricated_citation_rate for r in results])),
            mean_usefulness_score=float(np.mean([r.usefulness_score for r in results])),
            mean_latency_ms=mean_lat,
            p90_latency_ms=p90_lat,
            abstention_accuracy=float(abstention_correct_count / len(results)) if results else 0.0,
            results=results,
        )

        return summary

    def save_results(self, summary: BenchmarkSummary, output_path: Path) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(summary.model_dump_json(indent=2))

    @staticmethod
    def format_summary_markdown(summary: BenchmarkSummary) -> str:
        lines = []
        lines.append("## HNX26EPS01 Baseline Evaluation Benchmark Summary\n")
        lines.append(f"- **Total Test Samples:** {summary.total_samples}")
        lines.append(f"- **Sample Distribution:** {summary.samples_by_type}")
        lines.append(f"- **Mean Recall@K:** {summary.mean_recall_at_k * 100:.2f}%")
        lines.append(f"- **Mean Groundedness:** {summary.mean_groundedness * 100:.2f}%")
        lines.append(f"- **Unsupported Claim Rate:** {summary.mean_unsupported_claim_rate * 100:.2f}%")
        lines.append(f"- **Fabricated Citation Rate:** {summary.mean_fabricated_citation_rate * 100:.2f}%")
        lines.append(f"- **Mean Usefulness Score:** {summary.mean_usefulness_score * 100:.2f}%")
        lines.append(f"- **Abstention Accuracy:** {summary.abstention_accuracy * 100:.2f}%")
        lines.append(f"- **Mean End-to-End Latency:** {summary.mean_latency_ms:.2f} ms (P90: {summary.p90_latency_ms:.2f} ms)\n")

        lines.append("### Breakdown by Question Type\n")
        lines.append("| Type | Count | Recall@K | Groundedness | Unsupported % | Fabricated Citations % | Usefulness |")
        lines.append("| :--- | :---: | :---: | :---: | :---: | :---: | :---: |")

        for q_type in ("answerable", "unanswerable", "adversarial"):
            sub = [r for r in summary.results if r.question_type == q_type]
            if not sub:
                continue
            cnt = len(sub)
            rec = np.mean([r.recall_at_k for r in sub]) * 100
            grd = np.mean([r.groundedness for r in sub]) * 100
            unsup = np.mean([r.unsupported_claim_rate for r in sub]) * 100
            fab = np.mean([r.fabricated_citation_rate for r in sub]) * 100
            use = np.mean([r.usefulness_score for r in sub]) * 100
            lines.append(f"| **{q_type}** | {cnt} | {rec:.1f}% | {grd:.1f}% | {unsup:.1f}% | {fab:.1f}% | {use:.1f}% |")

        lines.append("\n### Per-Sample Detailed Log\n")
        lines.append("| ID | Type | Query | Hit | Grounded | Unsupp. | Fab. | Useful | Latency (ms) |")
        lines.append("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |")
        for r in summary.results:
            short_q = (r.query[:45] + "...") if len(r.query) > 45 else r.query
            hit_str = "Yes" if r.retrieval_hit else "No"
            lines.append(
                f"| `{r.question_id}` | {r.question_type} | {short_q} | {hit_str} | {r.groundedness*100:.0f}% | {r.unsupported_claim_count} | {r.fabricated_citation_count} | {r.usefulness_score*100:.0f}% | {r.latency_ms:.1f} |"
            )

        return "\n".join(lines)
