from __future__ import annotations
import re
from typing import Dict, List, Optional, Set, Tuple
from src.core.models import Chunk, ScoredChunk


class JurisdictionAuthorityRouter:
    """Jurisdiction Authority Router & Filter (JARF).

    Treats the user's explicit jurisdiction selection as structured pipeline context.
    Identifies applicable statutory schedules, boosts authoritative governing rules,
    and suppresses conflicting out-of-jurisdiction default provisions.
    """

    JURISDICTION_MAP: Dict[str, Dict[str, Any]] = {
        "california": {
            "key": "US-CAL",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"California",
            "statutory_keywords": ["california", "16600", "1668", "civil code", "business and professions"],
            "overridden_sections": ["10", "8.1"],  # Overrides Section 10 (Non-solicitation)
        },
        "delaware": {
            "key": "US-DEL",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"Delaware",
            "statutory_keywords": ["delaware", "freedom of contract"],
            "overridden_sections": [],
        },
        "england": {
            "key": "UK-ENG",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"England|United Kingdom",
            "statutory_keywords": ["ucta", "unfair contract terms", "1977", "england", "wales", "cavendish"],
            "overridden_sections": ["8.1"],
        },
        "united kingdom": {
            "key": "UK-ENG",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"England|United Kingdom",
            "statutory_keywords": ["ucta", "unfair contract terms", "1977", "england", "wales", "cavendish"],
            "overridden_sections": ["8.1"],
        },
        "european union": {
            "key": "EU-GDPR",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"European Union|GDPR",
            "statutory_keywords": ["gdpr", "article 82", "article 33", "supervisory authority", "72 hours"],
            "overridden_sections": ["8.1", "8.2"],
        },
        "gdpr": {
            "key": "EU-GDPR",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"European Union|GDPR",
            "statutory_keywords": ["gdpr", "article 82", "article 33", "supervisory authority", "72 hours"],
            "overridden_sections": ["8.1", "8.2"],
        },
        "singapore": {
            "key": "SG",
            "schedule_doc_id": "DOC-009",
            "schedule_heading_pattern": r"Singapore",
            "statutory_keywords": ["singapore", "pdpa", "pdpc", "3 calendar days", "third parties act"],
            "overridden_sections": [],
        },
    }

    def __init__(self, authority_boost: float = 2.5):
        self.authority_boost = authority_boost

    def normalize_jurisdiction(self, selected_jurisdiction: Optional[str]) -> Optional[str]:
        if not selected_jurisdiction:
            return None
        sj = selected_jurisdiction.lower().strip()
        for pattern_key, config in self.JURISDICTION_MAP.items():
            if pattern_key in sj:
                return config["key"]
        return sj

    def filter_and_route(
        self,
        retrieved_chunks: List[ScoredChunk],
        selected_jurisdiction: Optional[str],
        query: str,
    ) -> List[ScoredChunk]:
        """Applies jurisdiction authority routing to retrieved candidates."""
        if not selected_jurisdiction or selected_jurisdiction.lower() in ("default", "none", "unknown"):
            return retrieved_chunks

        norm_jur = self.normalize_jurisdiction(selected_jurisdiction)
        if not norm_jur:
            return retrieved_chunks

        # Find matching jurisdiction config
        matched_config = None
        for config in self.JURISDICTION_MAP.values():
            if config["key"] == norm_jur:
                matched_config = config
                break

        if not matched_config:
            return retrieved_chunks

        reranked: List[ScoredChunk] = []
        conflicting_suppressed = 0

        for sc in retrieved_chunks:
            chunk = sc.chunk
            boosted_score = sc.score
            is_active_authority = False

            # Check if this chunk belongs to the authoritative schedule for selected jurisdiction
            if chunk.doc_id == matched_config["schedule_doc_id"]:
                path_text = " ".join(chunk.heading_path) + " " + chunk.section_heading
                if re.search(matched_config["schedule_heading_pattern"], path_text, re.IGNORECASE):
                    is_active_authority = True
                    boosted_score += self.authority_boost

            # Check if chunk belongs to a CONFLICTING schedule of another jurisdiction
            is_conflicting_schedule = False
            if chunk.doc_id == "DOC-009" and not is_active_authority:
                # Chunk is from DOC-009 but for a DIFFERENT jurisdiction
                for other_config in self.JURISDICTION_MAP.values():
                    if other_config["key"] != norm_jur:
                        path_text = " ".join(chunk.heading_path) + " " + chunk.section_heading
                        if re.search(other_config["schedule_heading_pattern"], path_text, re.IGNORECASE):
                            is_conflicting_schedule = True
                            break

            if is_conflicting_schedule:
                # Suppress out-of-jurisdiction schedule to prevent legal pollution
                conflicting_suppressed += 1
                boosted_score = max(0.0, boosted_score - 2.0)

            # Preserve metadata
            new_sc = ScoredChunk(
                chunk=chunk,
                score=boosted_score,
                dense_score=sc.dense_score,
                lexical_score=sc.lexical_score,
                rank=sc.rank,
            )
            reranked.append(new_sc)

        # Sort by boosted score
        reranked.sort(key=lambda x: x.score, reverse=True)

        # Re-assign ranks
        for rank, item in enumerate(reranked, start=1):
            item.rank = rank

        return reranked

    def get_jurisdiction_context_header(self, selected_jurisdiction: Optional[str]) -> str:
        """Generates an explicit authority guidance string for the generator."""
        if not selected_jurisdiction or selected_jurisdiction.lower() in ("default", "none"):
            return "GOVERNING JURISDICTION: Default Commercial Law (Delaware, USA / Unspecified)"

        norm = self.normalize_jurisdiction(selected_jurisdiction)
        return (
            f"GOVERNING JURISDICTION: {selected_jurisdiction} (Normalized Authority: {norm})\n"
            f"LEGAL DIRECTIVE: The user has selected {selected_jurisdiction} as authoritative. "
            f"If the selected jurisdiction's statutory schedule conflicts with general contract boilerplate, "
            f"the statutory rules of {selected_jurisdiction} supersede."
        )
