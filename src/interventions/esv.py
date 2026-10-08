from __future__ import annotations
import re
from typing import Any, Dict, List, Optional, Set, Tuple
from src.core.models import AnswerPayload, Chunk, EvidenceState, ScoredChunk


class EvidenceSufficiencyVerifier:
    """Evidence Sufficiency Verifier (ESV).

    Evaluates set-level evidence sufficiency before generation using genuine
    facet coverage, semantic relevance, and conflict analysis.
    Distinguishes SUFFICIENT, PARTIAL, CONFLICTING, INSUFFICIENT, and NO_RELEVANT_EVIDENCE.
    Intercepts unanswerable queries matching generic contract boilerplate and enforces
    calibrated, evidence-based abstentions without query-specific or corpus-specific hardcoding.
    """

    # Common generic legal / English stopwords that convey little topical specificity
    LEGAL_BOILERPLATE: Set[str] = {
        "a", "an", "the", "and", "or", "of", "to", "in", "for", "on", "with", "by", "at",
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
        "what", "which", "who", "whom", "this", "that", "these", "those", "how", "why", "when", "where",
        "can", "could", "shall", "should", "will", "would", "may", "might", "must",
        "agreement", "contract", "section", "clause", "provision", "document", "party", "parties",
        "hereunder", "thereof", "herein", "pursuant", "provided", "subject", "set", "forth",
        "applicable", "specified", "including", "respect", "accordance", "following",
    }

    # Polarity markers for conflict detection
    AFFIRMATIVE_MARKERS: Set[str] = {
        "valid", "enforceable", "permitted", "allowed", "shall apply", "is liable", "shall be liable", "entitled"
    }
    NEGATIVE_MARKERS: Set[str] = {
        "void", "unenforceable", "prohibited", "shall not apply", "not liable", "shall not be liable", "excluded"
    }

    def __init__(self, min_facet_coverage: float = 0.40):
        self.min_facet_coverage = min_facet_coverage

    def extract_query_facets(self, query: str) -> Dict[str, Any]:
        """Extracts substantive topic tokens and multi-word phrases dynamically."""
        raw_tokens = re.findall(r"[a-z0-9]+(?:[\-_][a-z0-9]+)*", query.lower())
        substantive = [t for t in raw_tokens if len(t) > 2 and t not in self.LEGAL_BOILERPLATE]

        # Extract consecutive substantive phrases (bi-grams and tri-grams)
        phrases: List[str] = []
        for i in range(len(raw_tokens) - 1):
            w1, w2 = raw_tokens[i], raw_tokens[i + 1]
            if w1 not in self.LEGAL_BOILERPLATE and w2 not in self.LEGAL_BOILERPLATE:
                phrases.append(f"{w1} {w2}")
                if i + 2 < len(raw_tokens):
                    w3 = raw_tokens[i + 2]
                    if w3 not in self.LEGAL_BOILERPLATE:
                        phrases.append(f"{w1} {w2} {w3}")

        return {
            "substantive_tokens": substantive,
            "key_phrases": phrases,
            "raw_query": query,
        }

    def verify_sufficiency(
        self,
        query: str,
        retrieved_chunks: List[ScoredChunk],
        selected_jurisdiction: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Verifies whether the retrieved evidence set as a whole is sufficient to answer the query."""
        if not retrieved_chunks:
            return {
                "status": "NO_RELEVANT_EVIDENCE",
                "evidence_state": EvidenceState.INSUFFICIENT,
                "is_sufficient": False,
                "confidence": 0.0,
                "missing_facets": ["all_evidence"],
                "reason": "No context chunks retrieved.",
            }

        facets = self.extract_query_facets(query)
        substantive_tokens = facets["substantive_tokens"]
        key_phrases = facets["key_phrases"]

        combined_evidence_text = " ".join([sc.chunk.text.lower() for sc in retrieved_chunks])

        # 1. Check for missing substantive phrases
        missing_phrases = []
        for phrase in key_phrases:
            if phrase not in combined_evidence_text:
                missing_phrases.append(phrase)

        # 2. Check substantive token coverage across evidence
        if substantive_tokens:
            hits = sum(1 for t in substantive_tokens if t in combined_evidence_text)
            coverage = hits / len(substantive_tokens)
        else:
            coverage = 1.0

        if coverage < self.min_facet_coverage or (key_phrases and len(missing_phrases) == len(key_phrases) and coverage < 0.5):
            missing_tokens = [t for t in substantive_tokens if t not in combined_evidence_text]
            missing_items = missing_phrases if missing_phrases else missing_tokens
            missing_str = ", ".join(missing_items[:3]) if missing_items else "inquiry subject matter"
            return {
                "status": "INSUFFICIENT",
                "evidence_state": EvidenceState.INSUFFICIENT,
                "is_sufficient": False,
                "confidence": 0.85,
                "missing_facets": missing_items,
                "reason": f"Core subject matter '{missing_str}' is absent from the provided documents.",
            }

        # 3. Dynamic contradiction detection across the evidence set
        has_affirmative = any(any(m in sc.chunk.text.lower() for m in self.AFFIRMATIVE_MARKERS) for sc in retrieved_chunks)
        has_negative = any(any(m in sc.chunk.text.lower() for m in self.NEGATIVE_MARKERS) for sc in retrieved_chunks)

        if has_affirmative and has_negative:
            # Check if one explicitly overrides the other (e.g. Schedule or carveout vs general section)
            has_precedence_link = any(
                re.search(r"(?:notwithstanding|supersede|void|except\s+as\s+provided)", sc.chunk.text, re.IGNORECASE)
                for sc in retrieved_chunks
            )
            if not has_precedence_link:
                return {
                    "status": "CONFLICTING",
                    "evidence_state": EvidenceState.CONFLICTING,
                    "is_sufficient": True,
                    "confidence": 0.75,
                    "missing_facets": [],
                    "reason": "Retrieved evidence contains conflicting provisions across documents/clauses.",
                }

        # 4. Partial coverage check
        if coverage < 0.65:
            missing_tokens = [t for t in substantive_tokens if t not in combined_evidence_text][:2]
            return {
                "status": "PARTIAL",
                "evidence_state": EvidenceState.PARTIAL,
                "is_sufficient": True,
                "confidence": coverage,
                "missing_facets": missing_tokens,
                "reason": f"Evidence provides partial coverage for query facets: {', '.join(missing_tokens)} missing.",
            }

        return {
            "status": "SUFFICIENT",
            "evidence_state": EvidenceState.SUPPORTED,
            "is_sufficient": True,
            "confidence": max(0.80, coverage),
            "missing_facets": [],
            "reason": "Evidence set contains sufficient substantive grounding for the query.",
        }

    def generate_calibrated_abstention(
        self,
        query: str,
        verification_result: Dict[str, Any],
        retrieved_chunks: List[ScoredChunk],
        question_id: Optional[str] = None,
    ) -> AnswerPayload:
        """Constructs an explicit evidence-based abstention response when evidence is insufficient."""
        reason = verification_result.get("reason", "The provided documents do not contain sufficient evidence.")
        answer_text = (
            f"The provided documents do not contain sufficient evidence to answer this inquiry. "
            f"Specifically: {reason}"
        )

        return AnswerPayload(
            question_id=question_id,
            query=query,
            answer_text=answer_text,
            citations=[],
            is_abstention=True,
            abstention_reason=reason,
            evidence_state=EvidenceState.INSUFFICIENT,
            retrieved_chunks=[sc.chunk.chunk_id for sc in retrieved_chunks],
            latency_ms={},
        )
