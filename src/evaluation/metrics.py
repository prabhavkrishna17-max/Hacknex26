from __future__ import annotations
import re
from typing import Dict, List, Set
from src.core.models import AnswerPayload, Chunk, EvidenceState, ScoredChunk


class EvaluationMetrics:
    """Computes quantitative RAG evaluation metrics with claim-level verbatim span verification."""

    @staticmethod
    def compute_recall_at_k(retrieved_chunks: List[ScoredChunk], target_doc_ids: List[str]) -> float:
        if not target_doc_ids:
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
        """Calculates Groundedness, Unsupported Claims, and Fabricated Citations with verbatim verification."""
        retrieved_cids = {sc.chunk.chunk_id for sc in retrieved_chunks}
        citations = answer_payload.citations

        if answer_payload.is_abstention:
            return {
                "groundedness": 1.0,
                "unsupported_claim_count": 0,
                "unsupported_claim_rate": 0.0,
                "fabricated_citation_count": 0,
                "fabricated_citation_rate": 0.0,
                "verbatim_span_match_rate": 1.0,
            }

        if not citations:
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", answer_payload.answer_text) if len(s.strip()) > 10]
            claim_count = max(len(sentences), 1)
            return {
                "groundedness": 0.0,
                "unsupported_claim_count": claim_count,
                "unsupported_claim_rate": 1.0,
                "fabricated_citation_count": 0,
                "fabricated_citation_rate": 0.0,
                "verbatim_span_match_rate": 0.0,
            }

        total_citations = len(citations)
        fabricated_citations = 0
        grounded_claims = 0
        unsupported_claims = 0
        verbatim_matches = 0

        for cit in citations:
            cid = cit.chunk_id
            if cid not in retrieved_cids or cid not in corpus_chunks_map:
                fabricated_citations += 1
                unsupported_claims += 1
                continue

            chunk = corpus_chunks_map[cid]
            chunk_text = chunk.text
            chunk_text_lower = chunk_text.lower()

            # 1. Exact verbatim span verification
            quote = cit.quote_snippet.strip() if cit.quote_snippet else ""
            has_verbatim = False
            if quote:
                if quote in chunk_text or quote.lower() in chunk_text_lower:
                    has_verbatim = True
                    verbatim_matches += 1
                elif cit.char_start is not None and cit.char_end is not None:
                    span = chunk_text[cit.char_start:cit.char_end]
                    if span.strip().lower() == quote.lower():
                        has_verbatim = True
                        verbatim_matches += 1

            # 2. Claim-level factual entailment against chunk text
            claim_clean = re.sub(r"\[DOC-[^\]]+\]", "", cit.claim).strip()
            claim_tokens = set(re.findall(r"[a-z0-9]+", claim_clean.lower()))
            significant_tokens = [t for t in claim_tokens if len(t) > 2]

            if not significant_tokens:
                grounded_claims += 1
                continue

            matches = sum(1 for t in significant_tokens if t in chunk_text_lower)
            match_ratio = matches / len(significant_tokens)

            # A claim is verified grounded if verbatim quote exists in chunk or strong entailment match
            if has_verbatim:
                grounded_claims += 1
            elif match_ratio >= 0.50:
                grounded_claims += 1
            else:
                unsupported_claims += 1
                if match_ratio < 0.15:
                    fabricated_citations += 1

        groundedness = grounded_claims / total_citations if total_citations > 0 else 0.0
        unsupported_rate = unsupported_claims / total_citations if total_citations > 0 else 0.0
        fabricated_rate = fabricated_citations / total_citations if total_citations > 0 else 0.0
        verbatim_rate = verbatim_matches / total_citations if total_citations > 0 else 0.0

        return {
            "groundedness": float(groundedness),
            "unsupported_claim_count": unsupported_claims,
            "unsupported_claim_rate": float(unsupported_rate),
            "fabricated_citation_count": fabricated_citations,
            "fabricated_citation_rate": float(fabricated_rate),
            "verbatim_span_match_rate": float(verbatim_rate),
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
            if answer_payload.is_abstention:
                return 1.0
            return 0.0

        elif q_type == "adversarial":
            refutation_signals = [
                "false premise", "incorrect premise", "contradicts", "not permitted",
                "prohibited", "strictly prohibited", "mandates", "exclusively", "rejected"
            ]
            refuted = any(sig in ans_text for sig in refutation_signals)
            if refuted and groundedness >= 0.70:
                return 1.0
            elif refuted:
                return 0.75
            return 0.20

        else:
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
