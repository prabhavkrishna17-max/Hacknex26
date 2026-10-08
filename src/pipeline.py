from __future__ import annotations
import time
from pathlib import Path
from typing import List, Optional
from src.core.config import BaselineConfig
from src.core.models import AnswerPayload, Chunk, Document, ScoredChunk
from src.generation.base import BaseGenerator
from src.generation.deterministic import DeterministicBaselineGenerator
from src.generation.llm_generator import GeminiLLMGenerator
from src.ingestion.chunker import MetadataPreservingChunker
from src.ingestion.parser import DocumentParser
from src.retrieval.bm25 import BM25Retriever
from src.retrieval.dense import DenseRetriever, DenseVectorEmbedder
from src.retrieval.hybrid import HybridRetriever


class BaselineRAGPipeline:
    """End-to-End Baseline RAG Pipeline for HNX26EPS01.

    Orchestrates ingestion, metadata-preserving chunking, hybrid retrieval,
    and grounded generation with source references.
    """

    def __init__(self, config: Optional[BaselineConfig] = None):
        self.config = config or BaselineConfig()
        self.config.ensure_directories()

        # Ingestion & Chunking
        self.parser = DocumentParser()
        self.chunker = MetadataPreservingChunker(
            target_chunk_chars=self.config.target_chunk_chars,
            overlap_chars=self.config.overlap_chars,
            min_chunk_chars=self.config.min_chunk_chars,
        )

        # Retrieval components
        self.bm25 = BM25Retriever(k1=self.config.bm25_k1, b=self.config.bm25_b)
        self.embedder = DenseVectorEmbedder(
            api_key=self.config.gemini_api_key,
            model_name=self.config.gemini_embedding_model,
            strict=self.config.strict_providers,
        )
        self.dense = DenseRetriever(embedder=self.embedder)
        self.retriever = HybridRetriever(
            bm25_retriever=self.bm25,
            dense_retriever=self.dense,
            rrf_k=self.config.rrf_k,
            alpha=self.config.hybrid_alpha,
            mode=self.config.retrieval_mode,
        )

        # Generator selection
        if self.config.generator_type == "gemini" and self.config.gemini_api_key:
            self.generator: BaseGenerator = GeminiLLMGenerator(
                api_key=self.config.gemini_api_key,
                model_name=self.config.gemini_model,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                strict=self.config.strict_providers,
            )
        else:
            self.generator = DeterministicBaselineGenerator()

        self.documents: List[Document] = []
        self.chunks: List[Chunk] = []

    # Modular intervention hooks
    def set_retriever(self, retriever) -> None:
        """Allows plugging in experimental research retrievers / rerankers."""
        self.retriever = retriever
        if self.chunks:
            self.retriever.index(self.chunks)

    def set_generator(self, generator: BaseGenerator) -> None:
        """Allows plugging in experimental research generators / verification loops."""
        self.generator = generator

    def ingest_and_index(self, corpus_dir: Optional[Path] = None) -> List[Chunk]:
        """Ingests raw documents from corpus_dir, applies metadata chunking, and indexes them."""
        target_dir = corpus_dir or self.config.corpus_dir
        self.documents = self.parser.load_directory(target_dir)
        self.chunks = self.chunker.chunk_documents(self.documents)
        self.retriever.index(self.chunks)
        return self.chunks

    def retrieve(self, query: str, top_k: Optional[int] = None) -> List[ScoredChunk]:
        """Executes hybrid retrieval over indexed chunks."""
        k = top_k or self.config.top_k
        return self.retriever.retrieve(query, top_k=k)

    def generate(
        self,
        query: str,
        retrieved_chunks: List[ScoredChunk],
        question_id: Optional[str] = None,
        jurisdiction_context: Optional[str] = None,
    ) -> AnswerPayload:
        """Generates grounded answer text with inline citations."""
        answer = self.generator.generate(
            query,
            retrieved_chunks,
            question_id=question_id,
            jurisdiction_context=jurisdiction_context,
        )
        if answer.generated_by is None:
            answer.generated_by = type(self.generator).__name__
        return answer

    def query(
        self,
        query: str,
        question_id: Optional[str] = None,
        top_k: Optional[int] = None,
        jurisdiction_context: Optional[str] = None,
    ) -> AnswerPayload:
        """Executes full end-to-end question answering pipeline."""
        t_start = time.perf_counter()

        t_ret_start = time.perf_counter()
        retrieved = self.retrieve(query, top_k=top_k)
        retrieval_ms = (time.perf_counter() - t_ret_start) * 1000.0

        answer = self.generate(
            query,
            retrieved,
            question_id=question_id,
            jurisdiction_context=jurisdiction_context,
        )
        total_ms = (time.perf_counter() - t_start) * 1000.0

        answer.latency_ms["retrieval_ms"] = retrieval_ms
        answer.latency_ms["total_ms"] = total_ms

        return answer
