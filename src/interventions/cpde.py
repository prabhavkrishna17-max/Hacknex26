from __future__ import annotations
import re
from typing import Any, Dict, List, Optional, Set, Tuple
from src.core.models import Chunk, ScoredChunk


class ClausePrecedenceExpander:
    """Clause-Precedence Dependency Expander (CPDE).

    Detects explicit contractual dependency links ('subject to', 'notwithstanding',
    'except as provided in', 'as defined in', 'prevail over') in retrieved chunks and
    deterministically expands the evidence set to include legally decisive carveouts.
    Operates dynamically without any hardcoded document IDs.
    """

    # Precedence & dependency extraction patterns
    PATTERNS = [
        # "Subject to Section 8.3", "subject to Section 8"
        (re.compile(r"subject\s+to\s+Section\s+([0-9]+(?:\.[0-9]+)?)", re.IGNORECASE), "CARVEOUT"),
        # "Notwithstanding Section 9.2", "notwithstanding the thirty (30) day notice period specified in Section 9.2"
        (re.compile(r"notwithstanding\s+(?:the\s+[^.]*?\s+specified\s+in\s+)?Section\s+([0-9]+(?:\.[0-9]+)?)", re.IGNORECASE), "OVERRIDE"),
        # "Except as provided in Section 7.2", "except as set forth in Section 3.1"
        (re.compile(r"except\s+as\s+(?:provided|set\s+forth)\s+in\s+Section\s+([0-9]+(?:\.[0-9]+)?)", re.IGNORECASE), "CARVEOUT"),
        # "As defined in Section 1", "defined pursuant to Section 1"
        (re.compile(r"(?:defined\s+(?:in|pursuant\s+to)|definitions?)\s+Section\s+([0-9]+(?:\.[0-9]+)?)", re.IGNORECASE), "DEFINITION"),
        # Carveouts from indemnity: "Section 7.1 and Section 7.2"
        (re.compile(r"Section\s+([0-9]+\.[0-9]+(?:\([a-z0-9]+\))?)", re.IGNORECASE), "REFERENCE"),
    ]

    def __init__(self, max_expansions: int = 2):
        self.max_expansions = max_expansions
        self.clause_index: Dict[Tuple[str, str], Chunk] = {}
        self.doc_index: Dict[str, List[Chunk]] = {}
        self.section_to_chunks: Dict[str, List[Chunk]] = {}

    def index_corpus(self, chunks: List[Chunk]) -> None:
        """Builds an inverted clause locator index mapping (doc_id, section_num) -> Chunk."""
        self.clause_index = {}
        self.doc_index = {}
        self.section_to_chunks = {}

        section_regex = re.compile(r"(?:Section|Schedule|##|\*\*|^|\s)\s*([0-9]+(?:\.[0-9]+)?)", re.IGNORECASE)

        for chunk in chunks:
            doc_id = chunk.doc_id
            self.doc_index.setdefault(doc_id, []).append(chunk)

            # Search heading and text for section numbering
            full_header = " ".join(chunk.heading_path) + " " + chunk.section_heading
            matches = section_regex.findall(full_header)
            for m in matches:
                m_clean = m.strip()
                if m_clean:
                    self.clause_index[(doc_id, m_clean)] = chunk
                    self.section_to_chunks.setdefault(m_clean, []).append(chunk)
                    if "." in m_clean:
                        top_sec = m_clean.split(".")[0]
                        self.clause_index.setdefault((doc_id, top_sec), chunk)
                        self.section_to_chunks.setdefault(top_sec, []).append(chunk)

            # Also scan chunk text for section declarations (e.g. "8.3 Express Carveouts" or "3.1 **Accelerated Termination:**")
            text_sec_matches = re.findall(r"(?:^|\n)\s*(?:\*\*)?([0-9]+\.[0-9]+)\b", chunk.text)
            for tm in text_sec_matches:
                self.clause_index[(doc_id, tm)] = chunk
                self.section_to_chunks.setdefault(tm, []).append(chunk)

    def _find_target_chunk(self, current_doc_id: str, sec_clean: str) -> Optional[Chunk]:
        """Dynamically finds the chunk corresponding to sec_clean across current doc and then corpus."""
        # 1. Exact match in the same document
        target = self.clause_index.get((current_doc_id, sec_clean))
        if target:
            return target

        # 2. Section heading match within the same document
        for dc in self.doc_index.get(current_doc_id, []):
            if f"{sec_clean} " in dc.section_heading or f"Section {sec_clean}" in dc.section_heading:
                return dc

        # 3. Match across other documents in the indexed corpus
        corpus_matches = [c for c in self.section_to_chunks.get(sec_clean, []) if c.doc_id != current_doc_id]
        if corpus_matches:
            return corpus_matches[0]
        all_matches = self.section_to_chunks.get(sec_clean, [])
        if all_matches:
            return all_matches[0]

        # 4. Fallback search across all indexed chunks for explicit Section header
        for doc_id, doc_chunks in self.doc_index.items():
            for dc in doc_chunks:
                if f"Section {sec_clean}" in dc.section_heading or dc.section_heading.startswith(f"{sec_clean} "):
                    return dc

        return None

    def expand_dependencies(
        self,
        retrieved_chunks: List[ScoredChunk],
        query: str,
    ) -> Tuple[List[ScoredChunk], List[Dict[str, Any]]]:
        """Scans retrieved chunks for clause precedence links and expands the evidence set."""
        if not retrieved_chunks:
            return retrieved_chunks, []

        existing_cids: Set[str] = {sc.chunk.chunk_id for sc in retrieved_chunks}
        expanded_chunks: List[ScoredChunk] = list(retrieved_chunks)
        expansion_log: List[Dict[str, Any]] = []

        added_count = 0

        for sc in retrieved_chunks:
            if added_count >= self.max_expansions:
                break

            chunk = sc.chunk
            text = chunk.text

            for pattern, relation in self.PATTERNS:
                matches = pattern.findall(text)
                for sec_num in matches:
                    sec_clean = sec_num.strip().rstrip(".")
                    target_chunk = self._find_target_chunk(chunk.doc_id, sec_clean)

                    if target_chunk and target_chunk.chunk_id not in existing_cids:
                        existing_cids.add(target_chunk.chunk_id)
                        added_count += 1

                        expanded_sc = ScoredChunk(
                            chunk=target_chunk,
                            score=sc.score + 0.15,
                            dense_score=sc.dense_score,
                            lexical_score=sc.lexical_score,
                            rank=sc.rank + 1,
                        )
                        expanded_chunks.append(expanded_sc)

                        expansion_log.append({
                            "source_chunk_id": chunk.chunk_id,
                            "referenced_section": sec_clean,
                            "relation": relation,
                            "target_chunk_id": target_chunk.chunk_id,
                        })

                        if added_count >= self.max_expansions:
                            break

        expanded_chunks.sort(key=lambda x: x.score, reverse=True)
        for rank, item in enumerate(expanded_chunks, start=1):
            item.rank = rank

        return expanded_chunks, expansion_log
