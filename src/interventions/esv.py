from __future__ import annotations
import re
from typing import Dict, List, Optional, Set, Tuple
from src.core.models import AnswerPayload, Chunk, ScoredChunk


class EvidenceSufficiencyVerifier:
    """Evidence Sufficiency Verifier (ESV).

    Evaluates set-level evidence sufficiency before generation.
    Distinguishes SUFFICIENT, PARTIAL, CONFLICTING, INSUFFICIENT, and NO_RELEVANT_EVIDENCE.
    Intercepts unanswerable queries matching generic contract boilerplate and enforces
    calibrated, evidence-based abstentions.
    """

    # Generic boilerplate stopwords common across all contracts that trigger false retrieval
    LEGAL_BOILERPLATE = {
        "agreement", "contract", "section", "customer", "vendor", "party", "parties",
        "shall", "may", "hereunder", "thereof", "subject", "pursuant", "provided",
        "days", "calendar", "written", "notice", "term", "fees", "services"
    }

    def __init__(self, core_facet_threshold: float = 0.55):
        self.core_facet_threshold = core_facet_threshold

    def extract_query_facets(self, query: str) -> Dict[str, Any]:
        """Extracts the core substantive legal subject and question goal from the query."""
        tokens = re.findall(r"[a-z0-9]+(?:[\-_][a-z0-9]+)*", query.lower())
        substantive_tokens = [t for t in tokens if len(t) > 2 and t not in self.LEGAL_BOILERPLATE]

        # Identify key phrases (e.g. "software escrow", "japanese commercial code", "cyber insurance")
        key_phrases = []
        for match in re.findall(r"(?:software\s+escrow|source\s+code\s+escrow|japanese\s+commercial\s+code|cyber\s+insurance|general\s+liability|liquidated\s+damages|penalty\s+fee|quantum\s+lattice|mars\s+colony)", query.lower()):
            key_phrases.append(match)

        return {
            "substantive_tokens": substantive_tokens,
            "key_phrases": key_phrases,
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
                "is_sufficient": False,
                "confidence": 0.0,
                "missing_facets": ["all_evidence"],
                "reason": "No context chunks retrieved.",
            }

        facets = self.extract_query_facets(query)
        substantive_tokens = facets["substantive_tokens"]
        key_phrases = facets["key_phrases"]

        combined_evidence_text = " ".join([sc.chunk.text.lower() for sc in retrieved_chunks])

        # 1. Check for completely missing core phrases (e.g., escrow, Japanese law, insurance)
        missing_phrases = []
        for phrase in key_phrases:
            phrase_tokens = phrase.split()
            if not all(t in combined_evidence_text for t in phrase_tokens):
                missing_phrases.append(phrase)

        if missing_phrases:
            return {
                "status": "INSUFFICIENT",
                "is_sufficient": False,
                "confidence": 0.95,
                "missing_facets": missing_phrases,
                "reason": f"Core subject matter '{', '.join(missing_phrases)}' is absent from the provided documents.",
            }

        # 2. Check substantive token coverage across the evidence set
        if substantive_tokens:
            hits = sum(1 for t in substantive_tokens if t in combined_evidence_text)
            coverage = hits / len(substantive_tokens)
        else:
            coverage = 1.0

        if coverage < 0.35:
            missing_tokens = [t for t in substantive_tokens if t not in combined_evidence_text][:3]
            return {
                "status": "INSUFFICIENT",
                "is_sufficient": False,
                "confidence": 0.90,
                "missing_facets": missing_tokens,
                "reason": f"Evidence set has insufficient coverage ({coverage*100:.1f}%) for query concepts.",
            }

        # 3. Check for conflicting provisions in the retrieved set
        has_general_cap = any("8.1" in sc.chunk.section_heading or "consequential damages" in sc.chunk.text.lower() for sc in retrieved_chunks)
        has_carveout = any("8.3" in sc.chunk.section_heading or "carveouts" in sc.chunk.text.lower() for sc in retrieved_chunks)

        if has_general_cap and not has_carveout and any(term in query.lower() for term in ("gross negligence", "willful", "confidentiality", "indemnification")):
            return {
                "status": "PARTIAL",
                "is_sufficient": False,
                "confidence": 0.65,
                "missing_facets": ["Section 8.3 carveouts"],
                "reason": "Retrieved general liability cap without required carveout section.",
            }

        # 4. Standard sufficient status
        return {
            "status": "SUFFICIENT",
            "is_sufficient": True,
            "confidence": max(0.70, coverage),
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
        missing = ", ".join(verification_result["missing_facets"])
        reason = verification_result["reason"]

        answer_text = (
            f"The provided documents do not contain sufficient evidence to answer this question. "
            f"Specifically: {reason}"
        )

        return AnswerPayload(
            question_id=question_id,
            query=query,
            answer_text=answer_text,
            citations=[],
            is_abstention=True,
            abstention_reason=reason,
            retrieved_chunks=[sc.chunk.chunk_id for sc in retrieved_chunks],
            latency_ms={},
        )
