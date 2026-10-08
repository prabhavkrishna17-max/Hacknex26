from __future__ import annotations
import os
from dataclasses import dataclass, field
from pathlib import Path


def _load_env_file() -> None:
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass


_load_env_file()


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

    # Dense embedding configuration
    embedding_dimension: int = 128
    dense_embedder_type: str = "auto"  # "auto", "gemini", "lsa"

    # Generation configuration
    generator_type: str = field(default_factory=lambda: "gemini" if os.getenv("GEMINI_API_KEY") else "extractive")
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-3.5-flash"))
    gemini_embedding_model: str = field(default_factory=lambda: os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001"))
    gemini_api_key: str = field(default_factory=lambda: os.getenv("GEMINI_API_KEY", ""))
    temperature: float = 0.0
    max_tokens: int = 4096  # headroom for thinking tokens, which count against the output limit

    # strict_providers=True: real LLM/embedding failures raise instead of silently falling back
    # to the extractive generator / LSA (required for valid benchmark runs).
    strict_providers: bool = False

    # Confidence and abstention threshold
    abstention_similarity_threshold: float = 0.025

    # Server configuration
    server_host: str = "127.0.0.1"
    server_port: int = 8000

    def ensure_directories(self) -> None:
        self.corpus_dir.mkdir(parents=True, exist_ok=True)
        self.testset_path.parent.mkdir(parents=True, exist_ok=True)
        self.results_dir.mkdir(parents=True, exist_ok=True)
