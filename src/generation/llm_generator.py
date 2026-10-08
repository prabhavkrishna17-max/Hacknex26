from __future__ import annotations
import re
import time
from typing import List, Optional
from src.core.models import AnswerPayload, Citation, ScoredChunk
from src.generation.base import BaseGenerator
from src.generation.deterministic import DeterministicBaselineGenerator
from src.generation.prompts import SYSTEM_PROMPT, format_context_prompt


class GeminiLLMGenerator(BaseGenerator):
    """LLM Generator using Google Gemini API with fallback to DeterministicBaselineGenerator."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-1.5-flash",
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ):
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.fallback = DeterministicBaselineGenerator()

    def generate(
        self,
        query: str,
        retrieved_chunks: List[ScoredChunk],
        question_id: Optional[str] = None,
    ) -> AnswerPayload:
        if not self.api_key or len(self.api_key) < 5:
            # Fallback directly when no API key is provided
            return self.fallback.generate(query, retrieved_chunks, question_id)

        start_time = time.perf_counter()
        prompt = format_context_prompt(query, retrieved_chunks)

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name=self.model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config={
                    "temperature": self.temperature,
                    "max_output_tokens": self.max_tokens,
                }
            )

            response = model.generate_content(prompt)
            raw_text = response.text if response and response.text else ""
            elapsed = (time.perf_counter() - start_time) * 1000.0

            # Extract bracket citations [DOC-XXX#cYYY]
            citation_pattern = re.compile(r"\[([A-Za-z0-9\-_]+#c\d{3})\]")
            cited_chunk_ids = list(set(citation_pattern.findall(raw_text)))

            chunk_map = {sc.chunk.chunk_id: sc.chunk for sc in retrieved_chunks}
            citations: List[Citation] = []
            for cid in cited_chunk_ids:
                is_valid = cid in chunk_map
                snippet = chunk_map[cid].text[:100] if is_valid else None
                citations.append(Citation(
                    claim=f"Cited chunk {cid}",
                    chunk_id=cid,
                    quote_snippet=snippet,
                    verified=is_valid,
                ))

            # Detect abstention phrasing
            abstain_signals = [
                "does not contain", "not mentioned", "cannot answer", "no information",
                "absent from the documentation", "out of scope"
            ]
            is_abstention = any(s in raw_text.lower() for s in abstain_signals)

            return AnswerPayload(
                question_id=question_id,
                query=query,
                answer_text=raw_text.strip(),
                citations=citations,
                is_abstention=is_abstention,
                abstention_reason="LLM identified lack of supporting context" if is_abstention else None,
                retrieved_chunks=[sc.chunk.chunk_id for sc in retrieved_chunks],
                raw_model_output=raw_text,
                latency_ms={"generation_ms": elapsed},
            )
        except Exception:
            # On network timeout, rate limit, or auth failure, safely fall back
            fallback_res = self.fallback.generate(query, retrieved_chunks, question_id)
            fallback_res.latency_ms["generation_ms"] = (time.perf_counter() - start_time) * 1000.0
            return fallback_res
