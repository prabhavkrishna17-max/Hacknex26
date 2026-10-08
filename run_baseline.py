#!/usr/bin/env python
"""HNX26EPS01 Baseline Runner & Evaluation CLI

Executes document ingestion, metadata-preserving chunking, hybrid retrieval,
grounded generation, and quantitative evaluation against the benchmark test set.
"""

from __future__ import annotations
import argparse
import hashlib
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
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
        "--providers",
        choices=["gemini", "local"],
        default="gemini",
        help="'gemini' = real Gemini LLM + Gemini embeddings (requires GEMINI_API_KEY; no silent fallback). "
             "'local' = extractive generator + LSA embeddings, no LLM (offline smoke test only).",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="data/results/baseline_benchmark_results.json",
        help="Path to save evaluation benchmark results JSON."
    )
    return parser.parse_args()


def _sha256_files(paths) -> str:
    h = hashlib.sha256()
    for p in sorted(paths):
        h.update(p.name.encode("utf-8"))
        h.update(p.read_bytes())
    return h.hexdigest()


def _git_state(base_dir: Path) -> dict:
    try:
        commit = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=base_dir, text=True).strip()
        dirty = bool(subprocess.check_output(["git", "status", "--porcelain", "--", "src", "run_baseline.py"], cwd=base_dir, text=True).strip())
        return {"commit": commit, "uncommitted_src_changes": dirty}
    except Exception:
        return {"commit": None, "uncommitted_src_changes": None}


def build_run_metadata(args, config: BaselineConfig, pipeline: BaselineRAGPipeline, summary) -> dict:
    """Records exactly which models, retrieval settings, corpus and testset produced the result."""
    corpus_files = [p for p in config.corpus_dir.iterdir() if p.is_file()]
    llm_real = args.providers == "gemini"
    generated_by = Counter(r.details.get("generated_by") for r in summary.results)
    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "git": _git_state(config.base_dir),
        "providers": args.providers,
        "llm": {
            "provider": "google-gemini" if llm_real else "none (extractive, no LLM)",
            "model": config.gemini_model if llm_real else None,
            "generator_class": type(pipeline.generator).__name__,
            "temperature": config.temperature if llm_real else None,
            "max_output_tokens": config.max_tokens if llm_real else None,
            "strict_no_fallback": config.strict_providers,
        },
        "embeddings": {
            "backend": pipeline.embedder.active_backend,
            "model": config.gemini_embedding_model if pipeline.embedder.use_api else "local TF-IDF+TruncatedSVD (LSA)",
            "dimension": pipeline.embedder.api_dimension if pipeline.embedder.use_api else pipeline.embedder.dimension,
            "document_task_type": "RETRIEVAL_DOCUMENT" if pipeline.embedder.use_api else None,
            "query_task_type": "RETRIEVAL_QUERY" if pipeline.embedder.use_api else None,
        },
        "retrieval": {
            "mode": config.retrieval_mode,
            "top_k": config.top_k,
            "rrf_k": config.rrf_k,
            "hybrid_alpha": config.hybrid_alpha,
            "bm25_k1": config.bm25_k1,
            "bm25_b": config.bm25_b,
        },
        "chunking": {
            "target_chunk_chars": config.target_chunk_chars,
            "overlap_chars": config.overlap_chars,
            "min_chunk_chars": config.min_chunk_chars,
        },
        "corpus": {
            "dir": config.corpus_dir.relative_to(config.base_dir).as_posix(),
            "num_documents": len(pipeline.documents),
            "doc_ids": [d.doc_id for d in pipeline.documents],
            "num_chunks": len(pipeline.chunks),
            "sha256": _sha256_files(corpus_files),
        },
        "testset": {
            "path": Path(config.testset_path).relative_to(config.base_dir).as_posix(),
            "num_items": summary.total_samples,
            "sha256": _sha256_files([Path(config.testset_path)]),
        },
        "metrics": [
            "recall_at_k", "groundedness", "unsupported_claim_rate", "fabricated_citation_rate",
            "usefulness_score", "abstention_accuracy", "latency_ms",
        ],
        "generation_counts": dict(generated_by),
    }


def main():
    args = parse_args()
    config = BaselineConfig()
    config.retrieval_mode = args.retrieval_mode
    config.top_k = args.top_k

    if args.providers == "gemini":
        if not config.gemini_api_key:
            print("[!] BLOCKER: GEMINI_API_KEY is not set (env var or .env in repo root).")
            print("    Real-provider runs require it. Refusing to fall back to the extractive/LSA path.")
            print("    Use --providers local only for an offline smoke test (no LLM).")
            return 2
        config.generator_type = "gemini"
        config.strict_providers = True
        print(f"[*] Providers: LLM={config.gemini_model}, embeddings={config.gemini_embedding_model} (strict, no fallback)")
    else:
        config.generator_type = "extractive"
        config.gemini_api_key = ""
        print("[*] Providers: LOCAL (extractive generator + LSA embeddings, NO LLM)")

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
            print(f"  • [{cit.chunk_id}] verified={cit.verified} Claim: {cit.claim[:80]}... (quote: {cit.quote_snippet})")
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
        summary.run_metadata = build_run_metadata(args, config, pipeline, summary)

        out_path = Path(args.output)
        harness.save_results(summary=summary, output_path=out_path)
        print(f"[+] Evaluation results saved to: {out_path}\n")

        # Print formatted summary table
        markdown_report = harness.format_summary_markdown(summary)
        print(markdown_report)
        return 0


if __name__ == "__main__":
    sys.exit(main())
