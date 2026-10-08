from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List, Optional
from src.core.models import AnswerPayload, ScoredChunk


class BaseGenerator(ABC):
    """Abstract interface for LLM answer generation with grounded source citations."""

    @abstractmethod
    def generate(
        self,
        query: str,
        retrieved_chunks: List[ScoredChunk],
        question_id: Optional[str] = None,
    ) -> AnswerPayload:
        """Generate an answer grounded strictly on the retrieved context chunks."""
        pass
