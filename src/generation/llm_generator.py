from __future__ import annotations
import logging
import re
import time
from typing import List, Optional
from pydantic import BaseModel, Field, ValidationError
from src.core.models import AnswerPayload, Citation, EvidenceState, ScoredChunk
from src.generation.base import BaseGenerator
from src.generation.deterministic import PrincipledExtractiveGenerator
from src.generation.prompts import LEGAL_SYSTEM_PROMPT, format_legal_context_prompt

logger = logging.getLogger(__name__)


class LLMClaim(BaseModel):
    claim_text: str = ""
    cited_chunk_id: str = ""
    verbatim_quote: str = ""


class LLMAnswer(BaseModel):
    """Response schema enforced on the model and validated on receipt."""
    evidence_state: str = "SUPPORTED"
    verdict_summary: str = ""
    detailed_answer: str = ""
    is_abstention: bool = False
    abstention_reason: Optional[str] = None
    claims: List[LLMClaim] = Field(default_factory=list)


class GeminiLLMGenerator(BaseGenerator):
    """Real LLM Generator using Google Gemini (google-genai SDK) with structured schema
    and span-level citation verification.

    strict=True (used for benchmark runs): a missing key or an API failure raises instead of
    silently substituting the extractive generator, so results can never mix LLM and non-LLM
    answers. strict=False keeps the extractive fallback for interactive/demo use.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: str = "gemini-3.5-flash",
        temperature: float = 0.0,
        max_tokens: int = 4096,
        strict: bool = False,
        max_retries: int = 4,
    ):
        self.api_key = api_key
        self.model_name = model_name
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.strict = strict
        self.max_retries = max_retries
        self.fallback = PrincipledExtractiveGenerator()
        self._client = None

    def _get_client(self):
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    def _fallback(self, query, retrieved_chunks, question_id, jurisdiction_context, trace_log, start_time):
        payload = self.fallback.generate(
            query, retrieved_chunks, question_id, jurisdiction_context=jurisdiction_context
        )
        payload.latency_ms["generation_ms"] = (time.perf_counter() - start_time) * 1000.0
        payload.trace_log = trace_log + payload.trace_log
        payload.generated_by = "extractive_fallback"
        return payload

    def _call_model(self, prompt: str):
        from google.genai import types

        config = types.GenerateContentConfig(
            system_instruction=LEGAL_SYSTEM_PROMPT,
            temperature=self.temperature,
            max_output_tokens=self.max_tokens,
            response_mime_type="application/json",
            response_schema=LLMAnswer,
        )
        last_err: Optional[Exception] = None
        for attempt in range(self.max_retries):
            try:
                return self._get_client().models.generate_content(
                    model=self.model_name, contents=prompt, config=config
                )
            except Exception as e:  # network / rate limit / 5xx
                last_err = e
                wait = 2 ** attempt * 2
                msg = str(e)
                if "429" in msg and "RESOURCE_EXHAUSTED" in msg:
                    if "PerDay" in msg:
                        raise  # daily quota exhausted; waiting seconds will not help
                    # Respect the API-provided retry delay (e.g. "'retryDelay': '29s'").
                    m = re.search(r"retryDelay'?\"?:\s*'?\"?(\d+(?:\.\d+)?)s", msg)
                    if m:
                        wait = float(m.group(1)) + 1.0
                logger.warning(f"Gemini call failed (attempt {attempt + 1}/{self.max_retries}): {e}; retrying in {wait}s")
                time.sleep(wait)
        raise RuntimeError(f"Gemini generate_content failed after {self.max_retries} attempts: {last_err}")

    def generate(
        self,
        query: str,
        retrieved_chunks: List[ScoredChunk],
        question_id: Optional[str] = None,
        jurisdiction_context: Optional[str] = None,
    ) -> AnswerPayload:
        start_time = time.perf_counter()
        trace_log: List[str] = [f"LLM Generation initiated for query: '{query}'"]

        if not self.api_key or len(self.api_key) < 5:
            if self.strict:
                raise RuntimeError("GEMINI_API_KEY is not set; strict mode forbids extractive fallback.")
            trace_log.append("No active Gemini API key configured; executing principled extractive generator.")
            return self._fallback(query, retrieved_chunks, question_id, jurisdiction_context, trace_log, start_time)

        chunk_map = {sc.chunk.chunk_id: sc.chunk for sc in retrieved_chunks}
        prompt = format_legal_context_prompt(query, retrieved_chunks, jurisdiction_context)

        try:
            trace_log.append(f"Invoking {self.model_name} with {len(retrieved_chunks)} context chunks.")
            response = self._call_model(prompt)
        except Exception as e:
            if self.strict:
                raise
            logger.warning(f"Gemini LLM invocation failed: {e}. Executing extractive fallback.")
            trace_log.append(f"Gemini LLM error: {str(e)}; falling back to extractive generator.")
            return self._fallback(query, retrieved_chunks, question_id, jurisdiction_context, trace_log, start_time)

        raw_output = (response.text if response is not None else None) or ""
        finish_reason = None
        try:
            finish_reason = str(response.candidates[0].finish_reason)
        except Exception:
            pass
        trace_log.append(f"Model response received (finish_reason={finish_reason}).")

        try:
            data = LLMAnswer.model_validate_json(raw_output)
        except ValidationError as e:
            # A malformed model response is a genuine baseline outcome, recorded as such.
            trace_log.append(f"Model output failed schema validation: {e.errors()[:2]}")
            if not self.strict:
                return self._fallback(query, retrieved_chunks, question_id, jurisdiction_context, trace_log, start_time)
            return AnswerPayload(
                question_id=question_id,
                query=query,
                answer_text="[LLM output could not be parsed]",
                evidence_state=EvidenceState.INSUFFICIENT,
                retrieved_chunks=[sc.chunk.chunk_id for sc in retrieved_chunks],
                raw_model_output=raw_output,
                latency_ms={"generation_ms": (time.perf_counter() - start_time) * 1000.0},
                trace_log=trace_log,
                jurisdiction_context=jurisdiction_context,
                generated_by=f"gemini:{self.model_name}:unparsed",
            )

        # Parse Evidence State
        try:
            evidence_state = EvidenceState(data.evidence_state.upper())
        except ValueError:
            evidence_state = EvidenceState.SUPPORTED

        is_abstention = data.is_abstention or (evidence_state == EvidenceState.INSUFFICIENT)
        abstention_reason = data.abstention_reason

        # Parse answer text
        detailed = data.detailed_answer
        verdict = data.verdict_summary
        if verdict and detailed and verdict not in detailed:
            answer_text = f"{verdict}\n\n{detailed}"
        else:
            answer_text = detailed or verdict or "No response generated."

        # Verify claims and citations against exact chunk text
        citations: List[Citation] = []
        for item in data.claims:
            cid = item.cited_chunk_id.strip()
            quote = item.verbatim_quote.strip()
            claim_text = item.claim_text.strip()

            if not cid or not claim_text:
                continue

            if cid not in chunk_map:
                trace_log.append(f"Citation rejected: cited chunk '{cid}' was not in the retrieved candidate set.")
                citations.append(
                    Citation(
                        claim=claim_text,
                        chunk_id=cid,
                        quote_snippet=quote,
                        verified=False,
                        evidence_state=EvidenceState.INSUFFICIENT,
                        verification_reason="Cited chunk ID does not exist in retrieved evidence pool.",
                    )
                )
                continue

            chunk = chunk_map[cid]
            # Verbatim source span verification
            char_start = chunk.text.find(quote) if quote else -1
            char_end = char_start + len(quote) if char_start >= 0 else None

            if char_start >= 0 and quote:
                is_verified = True
                reason = "Exact verbatim quote confirmed in source chunk."
                claim_state = EvidenceState.SUPPORTED
                trace_log.append(f"Citation verified: '{cid}' [{char_start}:{char_end}]")
            else:
                is_verified = False
                reason = "Quoted string could not be verified as an exact substring in the source chunk."
                claim_state = EvidenceState.PARTIAL
                trace_log.append(f"Citation unverified: quote not found verbatim in '{cid}'.")

            citations.append(
                Citation(
                    claim=claim_text,
                    chunk_id=cid,
                    quote_snippet=quote or chunk.text[:120],
                    char_start=char_start if char_start >= 0 else None,
                    char_end=char_end,
                    verified=is_verified,
                    evidence_state=claim_state,
                    verification_reason=reason,
                )
            )

        elapsed = (time.perf_counter() - start_time) * 1000.0
        return AnswerPayload(
            question_id=question_id,
            query=query,
            answer_text=answer_text,
            evidence_state=evidence_state,
            citations=citations,
            is_abstention=is_abstention,
            abstention_reason=abstention_reason,
            retrieved_chunks=[sc.chunk.chunk_id for sc in retrieved_chunks],
            raw_model_output=raw_output,
            latency_ms={"generation_ms": elapsed},
            trace_log=trace_log,
            jurisdiction_context=jurisdiction_context,
            generated_by=f"gemini:{self.model_name}",
        )
