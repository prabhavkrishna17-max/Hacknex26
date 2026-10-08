from __future__ import annotations
import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class BaselineConfig:
    # Directory paths
    base_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent)
    corpus_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "data" / "corpus")
    testset_path: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "data" / "evaluation" / "benchmark_qa_testset.json")
    results_dir: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "data" / "results")

    # Chunking configuration
    target_chunk_chars: int = 900
    overlap_chars: int = 150
    min_chunk_chars: int = 120

    # Retrieval configuration
    top_k: int = 4
    bm25_k1: float = 1.5
    bm25_b: float = 0.75
    hybrid_alpha: float = 0.5  # 0.0 = pure BM25, 1.0 = pure Dense
    rrf_k: int = 60
    retrieval_mode: str = "hybrid_rrf"  # "hybrid_rrf", "hybrid_linear", "bm25", "dense"

    # Generation configuration
    generator_type: str = "deterministic"  # "deterministic" or "gemini"
    gemini_model: str = "gemini-1.5-flash"
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    temperature: float = 0.0
    max_tokens: int = 1024

    # Confidence and abstention threshold
    abstention_similarity_threshold: float = 0.025

    def ensure_directories(self) -> None:
        self.corpus_dir.mkdir(parents=True, exist_ok=True)
        self.testset_path.parent.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)
