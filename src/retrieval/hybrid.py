from __future__ import annotations
from typing import Dict, List, Optional
from src.core.models import Chunk, ScoredChunk
from src.retrieval.bm25 import BM25Retriever
from src.retrieval.dense import DenseRetriever


class HybridRetriever:
    """Combines BM25 lexical retrieval and Dense semantic vector retrieval

    using either Reciprocal Rank Fusion (RRF) or linear normalized weighted scoring.
    """

    def __init__(
        self,
        bm25_retriever: Optional[BM25Retriever] = None,
        dense_retriever: Optional[DenseRetriever] = None,
        rrf_k: int = 60,
        alpha: float = 0.5,
        mode: str = "hybrid_rrf",  # "hybrid_rrf", "hybrid_linear", "bm25", "dense"
    ):
        self.bm25 = bm25_retriever or BM25Retriever()
        self.dense = dense_retriever or DenseRetriever()
        self.rrf_k = rrf_k
        self.alpha = alpha
        self.mode = mode
        self.chunks: List[Chunk] = []

    def index(self, chunks: List[Chunk]) -> None:
        self.chunks = list(chunks)
        self.bm25.index(chunks)
        self.dense.index(chunks)

    def retrieve(self, query: str, top_k: int = 4) -> List[ScoredChunk]:
        if not self.chunks:
            return []

        if self.mode == "bm25":
            return self.bm25.retrieve(query, top_k=top_k)
        elif self.mode == "dense":
            return self.dense.retrieve(query, top_k=top_k)

        # Retrieve a broader pool from both models before fusion
        pool_size = max(top_k * 3, 10)
        bm25_results = self.bm25.retrieve(query, top_k=pool_size)
        dense_results = self.dense.retrieve(query, top_k=pool_size)

        if self.mode == "hybrid_linear":
            return self._linear_fusion(bm25_results, dense_results, top_k=top_k)
        else:
            return self._rrf_fusion(bm25_results, dense_results, top_k=top_k)

    def _rrf_fusion(
        self,
        bm25_results: List[ScoredChunk],
        dense_results: List[ScoredChunk],
        top_k: int = 4,
    ) -> List[ScoredChunk]:
        rrf_scores: Dict[str, float] = {}
        chunk_map: Dict[str, Chunk] = {}
        dense_score_map: Dict[str, float] = {}
        lexical_score_map: Dict[str, float] = {}

        for rank, res in enumerate(bm25_results, start=1):
            cid = res.chunk.chunk_id
            chunk_map[cid] = res.chunk
            lexical_score_map[cid] = res.score
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))

        for rank, res in enumerate(dense_results, start=1):
            cid = res.chunk.chunk_id
            chunk_map[cid] = res.chunk
            dense_score_map[cid] = res.score
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (self.rrf_k + rank))

        sorted_cids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)

        results: List[ScoredChunk] = []
        for rank, cid in enumerate(sorted_cids[:top_k], start=1):
            results.append(ScoredChunk(
                chunk=chunk_map[cid],
                score=rrf_scores[cid],
                dense_score=dense_score_map.get(cid, 0.0),
                lexical_score=lexical_score_map.get(cid, 0.0),
                rank=rank,
            ))

        return results

    def _linear_fusion(
        self,
        bm25_results: List[ScoredChunk],
        dense_results: List[ScoredChunk],
        top_k: int = 4,
    ) -> List[ScoredChunk]:
        # Normalize BM25 scores to [0, 1]
        bm25_max = max((r.score for r in bm25_results), default=1.0)
        bm25_min = min((r.score for r in bm25_results), default=0.0)
        bm25_range = bm25_max - bm25_min if bm25_max > bm25_min else 1.0

        # Normalize Dense scores to [0, 1]
        dense_max = max((r.score for r in dense_results), default=1.0)
        dense_min = min((r.score for r in dense_results), default=0.0)
        dense_range = dense_max - dense_min if dense_max > dense_min else 1.0

        combined: Dict[str, float] = {}
        chunk_map: Dict[str, Chunk] = {}
        dense_score_map: Dict[str, float] = {}
        lexical_score_map: Dict[str, float] = {}

        for res in bm25_results:
            cid = res.chunk.chunk_id
            chunk_map[cid] = res.chunk
            lexical_score_map[cid] = res.score
            norm_score = (res.score - bm25_min) / bm25_range
            combined[cid] = combined.get(cid, 0.0) + (1.0 - self.alpha) * norm_score

        for res in dense_results:
            cid = res.chunk.chunk_id
            chunk_map[cid] = res.chunk
            dense_score_map[cid] = res.score
            norm_score = (res.score - dense_min) / dense_range
            combined[cid] = combined.get(cid, 0.0) + self.alpha * norm_score

        sorted_cids = sorted(combined.keys(), key=lambda cid: combined[cid], reverse=True)

        results: List[ScoredChunk] = []
        for rank, cid in enumerate(sorted_cids[:top_k], start=1):
            results.append(ScoredChunk(
                chunk=chunk_map[cid],
                score=combined[cid],
                dense_score=dense_score_map.get(cid, 0.0),
                lexical_score=lexical_score_map.get(cid, 0.0),
                rank=rank,
            ))

        return results
