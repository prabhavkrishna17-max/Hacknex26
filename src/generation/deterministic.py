from __future__ import annotations
import logging
import re
import time
from typing import Dict, List, Optional, Tuple
from src.core.models import AnswerPayload, Citation, EvidenceState, ScoredChunk
from src.generation.base import BaseGenerator

logger = logging.getLogger(__name__)


class PrincipledExtractiveGenerator(BaseGenerator):
    """Principled, corpus-agnostic extractive generator and fallback.

    Extracts verbatim source spans from retrieved evidence based on lexical and
    semantic alignment with the query. Completely free of hardcoded question literals,
    domain assumptions, or synthetic answer templates.
    """

    def __init__(self, min_relevance_threshold: float = 0.01):
        self.min_relevance_threshold = min_relevance_threshold

    def generate(
        self,
        query: str,
        retrieved_chunks: List[ScoredChunk],
        question_id: Optional[str] = None,
        jurisdiction_context: Optional[str] = None,
    ) -> AnswerPayload:
        start_time = time.perf_counter()
        trace_log: List[str] = [f"Extractive generation initiated for query: '{query}'"]

        retrieved_cids = [sc.chunk.chunk_id for sc in retrieved_chunks]
        trace_log.append(f"Candidate chunks evaluated: {retrieved_cids}")

        # 1. Check for empty evidence
        if not retrieved_chunks:
            elapsed = (time.perf_counter() - start_time) * 1000.0
            trace_log.append("Abstention: No context chunks available in candidate pool.")
            return AnswerPayload(
                question_id=question_id,
                query=query,
                answer_text="The provided documents do not contain information to answer this query.",
                evidence_state=EvidenceState.INSUFFICIENT,
                citations=[],
                is_abstention=True,
                abstention_reason="No relevant context chunks were retrieved from the provided documents.",
                retrieved_chunks=[],
                latency_ms={"generation_ms": elapsed},
                trace_log=trace_log,
                jurisdiction_context=jurisdiction_context,
            )

        # 2. Extract substantive query terms
        query_words = set(re.findall(r"[a-z0-9]+", query.lower()))
        stopwords = {
            "the", "a", "an", "is", "are", "was", "were", "what", "which", "who", "whom",
            "this", "that", "these", "those", "in", "on", "at", "by", "for", "with", "about",
            "against", "between", "into", "through", "during", "before", "after", "above",
            "below", "to", "from", "up", "down", "in", "out", "of", "and", "or", "but",
            "if", "because", "as", "until", "while", "of", "does", "do", "did", "must",
            "shall", "can", "could", "would", "should", "may", "might"
        }
        substantive_query = {w for w in query_words if len(w) > 2 and w not in stopwords}

        # 3. Score candidate sentences from retrieved chunks
        candidate_sentences: List[Tuple[str, ScoredChunk, float, int, int]] = []

        for sc in retrieved_chunks:
            chunk = sc.chunk
            # Split into sentences preserving punctuation
            raw_sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", chunk.text) if len(s.strip()) > 15]

            for s in raw_sentences:
                # Find exact character indices in chunk text
                start_idx = chunk.text.find(s)
                end_idx = start_idx + len(s) if start_idx >= 0 else -1

                s_words = set(re.findall(r"[a-z0-9]+", s.lower()))
                overlap = len(substantive_query.intersection(s_words))

                if substantive_query:
                    relevance_score = (overlap / len(substantive_query))
                else:
                    relevance_score = sc.score or 1.0

                if overlap >= 1 or relevance_score >= self.min_relevance_threshold:
                    candidate_sentences.append((s, sc, relevance_score, start_idx, end_idx))

        candidate_sentences.sort(key=lambda x: x[2], reverse=True)

        # 4. If no sentence passes relevance threshold, abstain objectively
        if not candidate_sentences or (substantive_query and candidate_sentences[0][2] < self.min_relevance_threshold):
            elapsed = (time.perf_counter() - start_time) * 1000.0
            trace_log.append("Abstention: Semantic overlap between inquiry and retrieved evidence fell below threshold.")
            return AnswerPayload(
                question_id=question_id,
                query=query,
                answer_text="The provided documents do not contain sufficient evidence to answer this inquiry.",
                evidence_state=EvidenceState.INSUFFICIENT,
                citations=[],
                is_abstention=True,
                abstention_reason="Retrieved clauses do not establish evidentiary support for the query terms.",
                retrieved_chunks=retrieved_cids,
                latency_ms={"generation_ms": elapsed},
                trace_log=trace_log,
                jurisdiction_context=jurisdiction_context,
            )

        # 5. Build grounded answer from top verified verbatim spans
        selected_claims: List[str] = []
        citations: List[Citation] = []
        seen_cids = set()

        for sent_text, sc, score, start_pos, end_pos in candidate_sentences[:3]:
            chunk = sc.chunk
            clean_span = sent_text.strip()
            # Double check verbatim inclusion
            is_verbatim = (start_pos >= 0 and chunk.text[start_pos:end_pos] == clean_span) or (clean_span in chunk.text)

            if is_verbatim and chunk.chunk_id not in seen_cids:
                seen_cids.add(chunk.chunk_id)
                claim_text = clean_span.rstrip(".")
                selected_claims.append(f"{clean_span} [{chunk.chunk_id}]")

                citations.append(
                    Citation(
                        claim=claim_text,
                        chunk_id=chunk.chunk_id,
                        quote_snippet=clean_span[:200],
                        char_start=start_pos if start_pos >= 0 else None,
                        char_end=end_pos if end_pos >= 0 else None,
                        verified=True,
                        evidence_state=EvidenceState.SUPPORTED,
                        verification_reason="Verbatim substring match confirmed in source chunk",
                    )
                )

        elapsed = (time.perf_counter() - start_time) * 1000.0
        trace_log.append(f"Generated {len(citations)} verified citations in {elapsed:.2f}ms")

        # Determine evidence state
        evidence_state = EvidenceState.SUPPORTED if len(citations) >= 1 else EvidenceState.PARTIAL

        full_answer = " ".join(selected_claims)
        return AnswerPayload(
            question_id=question_id,
            query=query,
            answer_text=full_answer,
            evidence_state=evidence_state,
            citations=citations,
            is_abstention=False,
            abstention_reason=None,
            retrieved_chunks=retrieved_cids,
            latency_ms={"generation_ms": elapsed},
            trace_log=trace_log,
            jurisdiction_context=jurisdiction_context,
        )


# Backward compatibility alias
DeterministicBaselineGenerator = PrincipledExtractiveGenerator
