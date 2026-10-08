#!/usr/bin/env python
"""HNX26EPS01 Baseline Runner & Evaluation CLI

Executes document ingestion, metadata-preserving chunking, hybrid retrieval,
grounded generation, and quantitative evaluation against the benchmark test set.
"""

from __future__ import annotations
import argparse
import sys
from pathlib import Path
from src.core.config import BaselineConfig
from src.evaluation.harness import EvaluationHarness
from src.pipeline import BaselineRAGPipeline


def parse_args():
    parser = argparse.ArgumentParser(description="HNX26EPS01 Baseline Evaluation Runner")
    parser.add_argument(
        "--mode",
        choices=["eval", "query", "stats"],
        default="eval",
        help="Execution mode: 'eval' runs the benchmark harness, 'query' answers a single query, 'stats' shows corpus statistics."
    )
    parser.add_argument(
        "--query",
        type=str,
        default=None,
        help="Query text when running in 'query' mode."
    )
    parser.add_argument(
        "--retrieval-mode",
        choices=["hybrid_rrf", "hybrid_linear", "bm25", "dense"],
        default="hybrid_rrf",
        help="Retrieval algorithm to benchmark."
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=4,
        help="Number of chunks to retrieve."
    )
    parser.add_argument(
        "--output",
        type=str,
        default="data/results/baseline_benchmark_results.json",
        help="Path to save evaluation benchmark results JSON."
    )
    return parser.parse_args()


def main():
    args = parse_args()
    config = BaselineConfig()
    config.retrieval_mode = args.retrieval_mode
    config.top_k = args.top_k

    pipeline = BaselineRAGPipeline(config=config)
    print(f"[*] Ingesting documents from: {config.corpus_dir}")
    chunks = pipeline.ingest_and_index()
    print(f"[+] Ingestion complete: Loaded {len(pipeline.documents)} documents, created {len(chunks)} metadata-preserved chunks.")

    if args.mode == "stats":
        print("\n--- Corpus Metadata Summary ---")
        for doc in pipeline.documents:
            print(f"  • {doc.doc_id}: {doc.title} (chars: {len(doc.content)}, meta: {doc.metadata})")
        print("\n--- Chunk Sample (First 3) ---")
        for c in chunks[:3]:
            print(f"  [{c.chunk_id}] Path: {' > '.join(c.heading_path)} | Length: {len(c.text)} chars | Tokens: {c.token_count}")
        return 0

    elif args.mode == "query":
        if not args.query:
            print("[!] Error: --query argument required in query mode.")
            return 1
        print(f"\n[*] Executing query: '{args.query}' (retrieval: {args.retrieval_mode}, top_k: {args.top_k})")
        answer = pipeline.query(args.query, top_k=args.top_k)
        print("\n=== GENERATED ANSWER ===")
        print(answer.answer_text)
        print("\n=== CITATIONS ===")
        for cit in answer.citations:
            print(f"  • [{cit.chunk_id}] Claim: {cit.claim[:80]}... (snippet: {cit.quote_snippet})")
        print("\n=== RETRIEVED CHUNKS ===")
        for cid in answer.retrieved_chunks:
            print(f"  • {cid}")
        print("\n=== LATENCY BREAKDOWN ===")
        for k, v in answer.latency_ms.items():
            print(f"  • {k}: {v:.2f} ms")
        return 0

    elif args.mode == "eval":
        testset_path = config.testset_path
        print(f"[*] Running Evaluation Harness on: {testset_path}")
        harness = EvaluationHarness(testset_path=testset_path)
        summary = harness.evaluate_pipeline(pipeline=pipeline, corpus_chunks=chunks)

        out_path = Path(args.output)
        harness.save_results(summary=summary, output_path=out_path)
        print(f"[+] Evaluation results saved to: {out_path}\n")

        # Print formatted summary table
        markdown_report = harness.format_summary_markdown(summary)
        print(markdown_report)
        return 0


if __name__ == "__main__":
    sys.exit(main())
