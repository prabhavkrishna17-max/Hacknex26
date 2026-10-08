from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Document(BaseModel):
    doc_id: str
    title: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    filepath: Optional[str] = None


class Chunk(BaseModel):
    chunk_id: str
    doc_id: str
    document_title: str
    section_heading: str
    heading_path: List[str] = Field(default_factory=list)
    text: str
    char_start: int
    char_end: int
    token_count: int
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def context_repr(self) -> str:
        """Formatted representation used when injecting chunk into prompt context."""
        path_str = " > ".join(self.heading_path) if self.heading_path else self.section_heading
        return f"[{self.chunk_id}] (Doc: {self.doc_id} | Section: {path_str})\n{self.text}"


class ScoredChunk(BaseModel):
    chunk: Chunk
    score: float
    dense_score: Optional[float] = None
    lexical_score: Optional[float] = None
    rank: int = 1


class Citation(BaseModel):
    claim: str
    chunk_id: str
    quote_snippet: Optional[str] = None
    verified: bool = False


class AnswerPayload(BaseModel):
    question_id: Optional[str] = None
    query: str
    answer_text: str
    citations: List[Citation] = Field(default_factory=list)
    is_abstention: bool = False
    abstention_reason: Optional[str] = None
    retrieved_chunks: List[str] = Field(default_factory=list)
    raw_model_output: Optional[str] = None
    latency_ms: Dict[str, float] = Field(default_factory=dict)


class EvaluationResult(BaseModel):
    question_id: str
    question_type: str  # answerable, unanswerable, adversarial
    query: str
    recall_at_k: float
    retrieval_hit: bool
    groundedness: float
    unsupported_claim_count: int
    unsupported_claim_rate: float
    fabricated_citation_count: int
    fabricated_citation_rate: float
    usefulness_score: float
    abstention_correctness: bool
    latency_ms: float
    details: Dict[str, Any] = Field(default_factory=dict)


class BenchmarkSummary(BaseModel):
    total_samples: int
    samples_by_type: Dict[str, int]
    mean_recall_at_k: float
    mean_groundedness: float
    mean_unsupported_claim_rate: float
    mean_fabricated_citation_rate: float
    mean_usefulness_score: float
    mean_latency_ms: float
    p90_latency_ms: float
    abstention_accuracy: float
    results: List[EvaluationResult] = Field(default_factory=list)
