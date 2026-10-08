from __future__ import annotations
import re
from typing import Dict, List, Set
from src.core.models import AnswerPayload, Chunk, EvaluationResult, ScoredChunk


class EvaluationMetrics:
    """Computes quantitative RAG evaluation metrics."""

    @staticmethod
    def compute_recall_at_k(retrieved_chunks: List[ScoredChunk], target_doc_ids: List[str]) -> float:
        if not target_doc_ids:
            # If no target docs (e.g. unanswerable), recall is 1.0 if handled correctly
            return 1.0

        retrieved_docs: Set[str] = {sc.chunk.doc_id for sc in retrieved_chunks}
        hits = sum(1 for target in target_doc_ids if target in retrieved_docs)
        return float(hits / len(target_doc_ids))

    @staticmethod
    def evaluate_citations_and_groundedness(
        answer_payload: AnswerPayload,
        retrieved_chunks: List[ScoredChunk],
        corpus_chunks_map: Dict[str, Chunk],
    ) -> Dict[str, float]:
        """Calculates Groundedness, Unsupported Claims, and Fabricated Citations."""
        retrieved_cids = {sc.chunk.chunk_id for sc in retrieved_chunks}
        citations = answer_payload.citations

        if answer_payload.is_abstention:
            return {
                "groundedness": 1.0,
                "unsupported_claim_count": 0,
                "unsupported_claim_rate": 0.0,
                "fabricated_citation_count": 0,
                "fabricated_citation_rate": 0.0,
            }

        if not citations:
            # Answer generated but no citations provided -> 100% unsupported claims
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", answer_payload.answer_text) if len(s.strip()) > 10]
            claim_count = max(len(sentences), 1)
            return {
                "groundedness": 0.0,
                "unsupported_claim_count": claim_count,
                "unsupported_claim_rate": 1.0,
                "fabricated_citation_count": 0,
                "fabricated_citation_rate": 0.0,
            }

        total_citations = len(citations)
        fabricated_citations = 0
        grounded_claims = 0
        unsupported_claims = 0

        for cit in citations:
            cid = cit.chunk_id
            # 1. Check if chunk exists in retrieved set
            if cid not in retrieved_cids or cid not in corpus_chunks_map:
                fabricated_citations += 1
                unsupported_claims += 1
                continue

            chunk = corpus_chunks_map[cid]
            chunk_text_lower = chunk.text.lower()

            # 2. Check if claim content is grounded in chunk text
            claim_tokens = set(re.findall(r"[a-z0-9]+", cit.claim.lower()))
            # Remove short stopwords
            significant_tokens = [t for t in claim_tokens if len(t) > 2]
            if not significant_tokens:
                grounded_claims += 1
                continue

            matches = sum(1 for t in significant_tokens if t in chunk_text_lower)
            match_ratio = matches / len(significant_tokens)

            # Check if quote snippet exists in chunk if provided
            if cit.quote_snippet and cit.quote_snippet.lower() in chunk_text_lower:
                match_ratio = max(match_ratio, 0.9)

            if match_ratio >= 0.40:  # Threshold for factual entailment
                grounded_claims += 1
            else:
                unsupported_claims += 1
                # If chunk was cited but content is completely irrelevant, count as fabricated citation
                if match_ratio < 0.15:
                    fabricated_citations += 1

        groundedness = grounded_claims / total_citations if total_citations > 0 else 0.0
        unsupported_rate = unsupported_claims / total_citations if total_citations > 0 else 0.0
        fabricated_rate = fabricated_citations / total_citations if total_citations > 0 else 0.0

        return {
            "groundedness": float(groundedness),
            "unsupported_claim_count": unsupported_claims,
            "unsupported_claim_rate": float(unsupported_rate),
            "fabricated_citation_count": fabricated_citations,
            "fabricated_citation_rate": float(fabricated_rate),
        }

    @staticmethod
    def compute_usefulness(
        question_item: dict,
        answer_payload: AnswerPayload,
        groundedness: float,
    ) -> float:
        """Evaluates usefulness based on question category and ground truth."""
        q_type = question_item.get("type", "answerable")
        ans_text = answer_payload.answer_text.lower()
        key_facts = question_item.get("key_facts", [])

        if q_type == "unanswerable":
            # For unanswerable questions, usefulness requires correct abstention
            if answer_payload.is_abstention:
                return 1.0
            return 0.0

        elif q_type == "adversarial":
            # Must detect and refute the false premise / injection
            refutation_signals = ["false premise", "incorrect premise", "contradicts", "not permitted", "prohibited", "strictly prohibited", "mandates"]
            refuted = any(sig in ans_text for sig in refutation_signals)
            if refuted and groundedness >= 0.70:
                return 1.0
            elif refuted:
                return 0.75
            return 0.20

        else:
            # Answerable questions: should NOT abstain, and must mention key facts
            if answer_payload.is_abstention:
                return 0.0

            if not key_facts:
                return 1.0 if groundedness >= 0.70 else 0.5

            fact_hits = 0
            for fact in key_facts:
                fact_tokens = [t for t in re.findall(r"[a-z0-9]+", fact.lower()) if len(t) > 1]
                if fact_tokens and all(t in ans_text for t in fact_tokens):
                    fact_hits += 1

            fact_coverage = fact_hits / len(key_facts) if key_facts else 1.0
            score = 0.5 * groundedness + 0.5 * fact_coverage
            return float(min(1.0, max(0.0, score)))
