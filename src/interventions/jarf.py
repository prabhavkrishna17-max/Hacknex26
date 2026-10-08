from __future__ import annotations
import re
from typing import Any, Dict, List, Optional
from src.core.models import Chunk, ScoredChunk


class JurisdictionAuthorityRouter:
    """Jurisdiction Authority Router & Filter (JARF).

    Treats the user's explicit jurisdiction selection as structured pipeline context.
    Identifies applicable statutory schedules, boosts authoritative governing rules,
    and suppresses conflicting out-of-jurisdiction provisions across any ingested documents.
    Operates generically without hardcoding document IDs.
    """

    JURISDICTION_PATTERNS: Dict[str, Dict[str, Any]] = {
        "california": {
            "key": "US-CAL",
            "aliases": ["california", "us-cal", "ca"],
            "statutory_keywords": ["california", "16600", "1668", "civil code", "business and professions"],
        },
        "delaware": {
            "key": "US-DEL",
            "aliases": ["delaware", "us-del", "de"],
            "statutory_keywords": ["delaware", "general corporation law", "freedom of contract"],
        },
        "england": {
            "key": "UK-ENG",
            "aliases": ["england", "wales", "united kingdom", "uk", "uk-eng", "english law"],
            "statutory_keywords": ["ucta", "unfair contract terms", "1977", "england", "wales", "cavendish"],
        },
        "european union": {
            "key": "EU-GDPR",
            "aliases": ["european union", "eu", "gdpr", "eu-gdpr"],
            "statutory_keywords": ["gdpr", "article 82", "article 33", "supervisory authority", "72 hours"],
        },
        "singapore": {
            "key": "SG",
            "aliases": ["singapore", "sg", "pdpa"],
            "statutory_keywords": ["singapore", "pdpa", "pdpc", "3 calendar days", "third parties act"],
        },
        "new york": {
            "key": "US-NY",
            "aliases": ["new york", "us-ny", "ny"],
            "statutory_keywords": ["new york", "general obligations law", "ny court of appeals"],
        },
        "texas": {
            "key": "US-TX",
            "aliases": ["texas", "us-tx", "tx"],
            "statutory_keywords": ["texas", "business and commerce code", "covenant not to compete"],
        },
        "india": {
            "key": "IN",
            "aliases": ["india", "in", "indian law"],
            "statutory_keywords": ["indian contract act", "section 27", "restraint of trade", "delhi", "bombay"],
        },
    }

    def __init__(self, authority_boost: float = 2.5):
        self.authority_boost = authority_boost

    def normalize_jurisdiction(self, selected_jurisdiction: Optional[str]) -> Optional[str]:
        if not selected_jurisdiction:
            return None
        sj = selected_jurisdiction.lower().strip()
        for _, config in self.JURISDICTION_PATTERNS.items():
            for alias in config["aliases"]:
                if alias == sj or f" {alias} " in f" {sj} " or sj.startswith(f"{alias},") or sj.startswith(f"{alias} "):
                    return config["key"]
        return sj.upper()

    def _chunk_jurisdiction_affiliation(self, chunk: Chunk) -> Optional[str]:
        """Detects if a chunk explicitly belongs to a specific jurisdiction schedule or clause."""
        context_text = (
            f"{chunk.document_title} "
            f"{' '.join(chunk.heading_path)} "
            f"{chunk.section_heading} "
            f"{chunk.text[:200]}"
        ).lower()

        # Check if this chunk is part of a schedule, addendum, rider, or governing law section
        is_schedule_or_law = bool(
            re.search(r"(?:schedule|addendum|rider|annex|appendix|governing\s+law|jurisdiction)", context_text)
        )

        for _, config in self.JURISDICTION_PATTERNS.items():
            for alias in config["aliases"]:
                # If it's a schedule/rider/law section mentioning the jurisdiction
                if is_schedule_or_law and re.search(r"\b" + re.escape(alias) + r"\b", context_text):
                    return config["key"]
                # Or if the heading specifically names the jurisdiction (e.g., "Schedule US-CAL: State of California")
                if re.search(r"\b" + re.escape(alias) + r"\b", chunk.section_heading.lower()):
                    return config["key"]

        return None

    def filter_and_route(
        self,
        retrieved_chunks: List[ScoredChunk],
        selected_jurisdiction: Optional[str],
        query: str,
    ) -> List[ScoredChunk]:
        """Applies jurisdiction authority routing to retrieved candidates without corpus hardcoding."""
        if not selected_jurisdiction or selected_jurisdiction.lower() in ("default", "none", "unknown", ""):
            return retrieved_chunks

        norm_jur = self.normalize_jurisdiction(selected_jurisdiction)
        if not norm_jur:
            return retrieved_chunks

        reranked: List[ScoredChunk] = []

        for sc in retrieved_chunks:
            chunk = sc.chunk
            boosted_score = sc.score
            chunk_jur = self._chunk_jurisdiction_affiliation(chunk)

            if chunk_jur:
                if chunk_jur == norm_jur:
                    # Authoritative match for the user's selected jurisdiction
                    boosted_score += self.authority_boost
                else:
                    # Conflicting out-of-jurisdiction schedule -> suppress to avoid cross-jurisdiction pollution
                    boosted_score = max(0.0, boosted_score - 2.0)
            else:
                # General contract chunk: check if text explicitly mentions selected jurisdiction keywords
                jur_keywords = []
                for cfg in self.JURISDICTION_PATTERNS.values():
                    if cfg["key"] == norm_jur:
                        jur_keywords = cfg.get("statutory_keywords", [])
                        break
                if any(kw in chunk.text.lower() for kw in jur_keywords):
                    boosted_score += 0.5

            new_sc = ScoredChunk(
                chunk=chunk,
                score=boosted_score,
                dense_score=sc.dense_score,
                lexical_score=sc.lexical_score,
                rank=sc.rank,
            )
            reranked.append(new_sc)

        reranked.sort(key=lambda x: x.score, reverse=True)
        for rank, item in enumerate(reranked, start=1):
            item.rank = rank

        return reranked

    def get_jurisdiction_context_header(self, selected_jurisdiction: Optional[str]) -> str:
        """Generates an explicit authority guidance string for the generator."""
        if not selected_jurisdiction or selected_jurisdiction.lower() in ("default", "none", ""):
            return "GOVERNING JURISDICTION: Default Commercial Law (Unspecified)"

        norm = self.normalize_jurisdiction(selected_jurisdiction)
        return (
            f"GOVERNING JURISDICTION: {selected_jurisdiction} (Normalized: {norm})\n"
            f"LEGAL DIRECTIVE: The user has selected {selected_jurisdiction} as authoritative. "
            f"If the selected jurisdiction's statutory rules or schedules conflict with general boilerplate, "
            f"the statutory rules of {selected_jurisdiction} supersede."
        )
