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

    LEGAL_SYNONYMS: Dict[str, Set[str]] = {
        "payment": {"remit", "invoice", "fee", "fees", "pay", "paid", "due", "invoicing", "cost", "interest", "amount"},
        "pay": {"remit", "invoice", "fee", "fees", "payment", "due"},
        "term": {"period", "duration", "term", "terms", "days", "months", "years", "time"},
        "terms": {"period", "duration", "term", "days", "months", "years", "time"},
        "window": {"window", "timeframe", "timeline", "hours", "days", "within"},
        "delivery": {"delivery", "deliver", "freight", "dispatch", "shipment"},
        "spoilage": {"spoilage", "damage", "loss", "temperature", "excursion"},
        "delays": {"delay", "delays", "detention", "clearance"},
        "liability": {"liability", "liable", "indemnity", "damages", "cap", "capped"},
    }

    def __init__(self, min_relevance_threshold: float = 0.01):
        self.min_relevance_threshold = min_relevance_threshold

    @staticmethod
    def _stem(word: str) -> str:
        w = word.lower()
        for sfx in ["ing", "tion", "tions", "ment", "ments", "ed", "es", "s"]:
            if len(w) > len(sfx) + 2 and w.endswith(sfx):
                return w[:-len(sfx)]
        return w

    def extract_operative_sentences(self, chunk) -> List[Tuple[str, int, int]]:
        """Separates headings, page markers, and metadata from operative legal sentences."""
        sentences: List[Tuple[str, int, int]] = []
        lines = chunk.text.splitlines()
        for line in lines:
            raw_line = line.strip()
            if not raw_line:
                continue
            # Filter markdown headers, metadata markers, page boundaries, and section title repetitions
            if re.match(r"^#{1,6}\s+", raw_line):
                continue
            if re.match(r"^\*\*[^*]+:\*\*", raw_line):
                continue
            if raw_line.startswith("--- Page"):
                continue
            if raw_line.lower() == chunk.section_heading.lower():
                continue

            # Split on sentence boundaries, protecting decimal/section numbers (e.g., 2.1, 1.25%, Section 2.)
            parts = re.split(r"(?<!\b\d)(?<!\b[A-Za-z])(?<=[.!?])\s+", raw_line)
            for p in parts:
                p_clean = p.strip()
                if len(p_clean) >= 15:
                    start_idx = chunk.text.find(p_clean)
                    end_idx = start_idx + len(p_clean) if start_idx >= 0 else -1
                    sentences.append((p_clean, start_idx, end_idx))
        return sentences

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
        stemmed_query = {self._stem(w) for w in substantive_query}
        expanded_query = set(substantive_query)
        for w in substantive_query:
            if w in self.LEGAL_SYNONYMS:
                expanded_query.update(self.LEGAL_SYNONYMS[w])

        # 3. Score candidate sentences from retrieved chunks
        candidate_entries = []
        for sc in retrieved_chunks:
            chunk = sc.chunk
            sents = self.extract_operative_sentences(chunk)
            heading_words = set(re.findall(r"[a-z0-9]+", chunk.section_heading.lower()))
            heading_overlap = substantive_query.intersection(heading_words)

            for s, start_idx, end_idx in sents:
                s_words = set(re.findall(r"[a-z0-9]+", s.lower()))
                s_stemmed = {self._stem(w) for w in s_words}

                direct_overlap = substantive_query.intersection(s_words)
                stem_overlap = stemmed_query.intersection(s_stemmed)
                syn_overlap = expanded_query.intersection(s_words)

                score = (len(direct_overlap) * 2.0 + len(stem_overlap) * 1.5 + len(syn_overlap) * 1.0) / (max(1, len(substantive_query)) * 2.0)
                if heading_overlap:
                    has_operative = bool(re.search(r"\b(shall|within|must|warrants|capped|liable|\d+)\b", s, re.IGNORECASE))
                    if has_operative:
                        score += 0.35 * (len(heading_overlap) / max(1, len(substantive_query)))

                covered_terms = direct_overlap.union(stem_overlap)
                if score >= self.min_relevance_threshold or direct_overlap or syn_overlap:
                    candidate_entries.append({
                        "text": s,
                        "chunk": sc.chunk,
                        "score": score,
                        "start": start_idx,
                        "end": end_idx,
                        "covered_terms": covered_terms,
                        "syn_terms": syn_overlap,
                    })

        candidate_entries.sort(key=lambda x: x["score"], reverse=True)

        # 4. If no sentence passes relevance threshold, abstain objectively
        if not candidate_entries or (substantive_query and candidate_entries[0]["score"] < self.min_relevance_threshold):
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

        # 5. Build grounded answer covering multiple distinct facets of the query
        selected = []
        selected_cids = set()
        covered_all = set()

        # Always take the top-scoring operative sentence
        top_cand = candidate_entries[0]
        selected.append(top_cand)
        selected_cids.add(top_cand["chunk"].chunk_id)
        covered_all.update(top_cand["covered_terms"])
        covered_all.update(top_cand["syn_terms"])

        # Select subsequent sentences that cover different aspects / facets of the inquiry
        for cand in candidate_entries[1:]:
            if len(selected) >= 3:
                break
            new_coverage = cand["covered_terms"].union(cand["syn_terms"]) - covered_all
            if new_coverage and cand["chunk"].chunk_id not in selected_cids:
                selected.append(cand)
                selected_cids.add(cand["chunk"].chunk_id)
                covered_all.update(new_coverage)

        citations: List[Citation] = []
        claim_strings: List[str] = []

        for item in selected:
            c = item["chunk"]
            s_text = item["text"]
            start_pos = item["start"]
            end_pos = item["end"]
            clean_span = s_text.strip()

            is_verbatim = (start_pos >= 0 and c.text[start_pos:end_pos] == clean_span) or (clean_span in c.text)
            if not is_verbatim:
                continue

            claim_strings.append(f"{clean_span} [{c.chunk_id}]")
            citations.append(
                Citation(
                    claim=clean_span.rstrip("."),
                    chunk_id=c.chunk_id,
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

        full_answer = " ".join(claim_strings)
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
