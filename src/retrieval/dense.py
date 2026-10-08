from __future__ import annotations
import hashlib
import math
import re
from typing import List, Optional
import numpy as np
from src.core.models import Chunk, ScoredChunk


class DenseVectorEmbedder:
    """Computes dense semantic embeddings.

    Supports:
    1. Fast deterministic subword character n-gram hashing projection (zero external dependency).
    2. Optional Gemini API embedding model ('models/text-embedding-004') when api_key is configured.
    """

    def __init__(self, dimension: int = 256, api_key: Optional[str] = None):
        self.dimension = dimension
        self.api_key = api_key
        self.use_api = bool(api_key and len(api_key) > 5)

    def _hash_token(self, token: str, dim: int) -> int:
        h = int(hashlib.md5(token.encode("utf-8")).hexdigest()[:8], 16)
        return h % dim

    def embed_text(self, text: str) -> np.ndarray:
        if self.use_api:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                response = genai.embed_content(
                    model="models/text-embedding-004",
                    content=text,
                    task_type="retrieval_document"
                )
                vec = np.array(response["embedding"], dtype=np.float32)
                norm = np.linalg.norm(vec)
                return vec / (norm + 1e-10)
            except Exception:
                # Graceful fallback to deterministic local embedding on network/quota failure
                pass

        # Deterministic local subword & n-gram projection
        vec = np.zeros(self.dimension, dtype=np.float32)
        words = re.findall(r"[a-z0-9]+", text.lower())
        if not words:
            return vec

        for word in words:
            # Word unigram
            idx = self._hash_token(f"w_{word}", self.dimension)
            vec[idx] += 1.0

            # Subword character 3-grams & 4-grams for morphological/semantic matching
            if len(word) >= 3:
                for n in (3, 4):
                    for i in range(len(word) - n + 1):
                        ngram = word[i:i+n]
                        n_idx = self._hash_token(f"ng_{ngram}", self.dimension)
                        vec[n_idx] += 0.5

        # L2 normalize
        norm = np.linalg.norm(vec)
        if norm > 1e-10:
            vec = vec / norm
        return vec

    def embed_batch(self, texts: List[str]) -> np.ndarray:
        vectors = [self.embed_text(t) for t in texts]
        return np.vstack(vectors) if vectors else np.zeros((0, self.dimension), dtype=np.float32)


class DenseRetriever:
    """Dense vector retriever using cosine similarity over L2-normalized embeddings."""

    def __init__(self, embedder: Optional[DenseVectorEmbedder] = None):
        self.embedder = embedder or DenseVectorEmbedder()
        self.chunks: List[Chunk] = []
        self.chunk_embeddings: Optional[np.ndarray] = None

    def index(self, chunks: List[Chunk]) -> None:
        self.chunks = list(chunks)
        if not chunks:
            self.chunk_embeddings = None
            return

        texts = [
            f"{' '.join(c.heading_path)} {c.section_heading} {c.text}"
            for c in chunks
        ]
        self.chunk_embeddings = self.embedder.embed_batch(texts)

    def retrieve(self, query: str, top_k: int = 5) -> List[ScoredChunk]:
        if not self.chunks or self.chunk_embeddings is None:
            return []

        query_vec = self.embedder.embed_text(query)
        if np.linalg.norm(query_vec) < 1e-10:
            return []

        # Cosine similarity is dot product because vectors are unit L2 normalized
        similarities = np.dot(self.chunk_embeddings, query_vec)

        top_indices = np.argsort(similarities)[::-1][:top_k]

        results: List[ScoredChunk] = []
        for rank, idx in enumerate(top_indices, start=1):
            results.append(ScoredChunk(
                chunk=self.chunks[idx],
                score=float(similarities[idx]),
                dense_score=float(similarities[idx]),
                rank=rank,
            ))

        return results
