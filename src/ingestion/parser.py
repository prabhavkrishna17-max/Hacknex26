from __future__ import annotations
import re
from pathlib import Path
from typing import List, Optional
from src.core.models import Document


class DocumentParser:
    """Parses raw text and Markdown documents into structured Document models."""

    @staticmethod
    def parse_file(filepath: Path) -> Document:
        suffix = filepath.suffix.lower()
        if suffix == ".pdf":
            try:
                import io
                from pypdf import PdfReader
                reader = PdfReader(str(filepath))
                pages_text = []
                for i, page in enumerate(reader.pages):
                    pt = page.extract_text() or ""
                    pages_text.append(f"--- Page {i + 1} ---\n{pt}")
                full_text = "\n\n".join(pages_text)
                return DocumentParser.parse_text(
                    full_text,
                    default_id=filepath.stem,
                    filepath=str(filepath),
                    total_pages=len(reader.pages),
                )
            except Exception as e:
                # Fallback to empty document if PDF reading fails
                return Document(
                    doc_id=filepath.stem,
                    title=filepath.stem,
                    content=f"[PDF extraction error: {e}]",
                    metadata={"error": str(e)},
                    filepath=str(filepath),
                )

        text = filepath.read_text(encoding="utf-8", errors="replace")
        return DocumentParser.parse_text(text, default_id=filepath.stem, filepath=str(filepath))

    @staticmethod
    def parse_text(
        text: str,
        default_id: str = "DOC-UNKNOWN",
        filepath: Optional[str] = None,
        total_pages: Optional[int] = None,
    ) -> Document:
        lines = text.splitlines()

        # Extract title: first markdown header (# ) or uppercase/substantive contract title line
        title = default_id
        for line in lines:
            trimmed = line.strip()
            if not trimmed or trimmed.startswith("--- Page"):
                continue
            if trimmed.startswith("# "):
                title = trimmed.lstrip("# ").strip()
                break
            # Heuristic for plain text agreements: all-caps or contains 'Agreement'/'Contract'/'Lease'/'Policy'
            if any(term in trimmed.upper() for term in ["AGREEMENT", "CONTRACT", "LEASE", "POLICY", "TERMS", "SCHEDULE"]):
                clean = re.sub(r"^[#*_\-\s]+|[#*_\-\s]+$", "", trimmed)
                if len(clean) > 5 and len(clean) < 100:
                    title = clean
                    break

        # Extract Document ID
        doc_id_match = re.search(r"\*\*Document ID:\*\*\s*([A-Za-z0-9\-_]+)", text)
        if doc_id_match:
            doc_id = doc_id_match.group(1).strip()
        else:
            # Fallback to clean default_id or filename stem
            doc_id = re.sub(r"[^A-Za-z0-9\-_]", "_", default_id)

        # Extract Version, Classification, Domain metadata if present
        metadata = {}
        if total_pages:
            metadata["total_pages"] = total_pages

        version_match = re.search(r"\*\*Version:\*\*\s*([^\n\r]+)", text)
        if version_match:
            metadata["version"] = version_match.group(1).strip()

        class_match = re.search(r"\*\*Classification:\*\*\s*([^\n\r]+)", text)
        if class_match:
            metadata["classification"] = class_match.group(1).strip()

        domain_match = re.search(r"\*\*Domain:\*\*\s*([^\n\r]+)", text)
        if domain_match:
            metadata["domain"] = domain_match.group(1).strip()

        # Identify section count heuristically
        section_matches = re.findall(r"(?:^|\n)(?:#{1,4}\s+|(?:\d+\.|\bSection\s+\d+|\bClause\s+\d+|\bArticle\s+[IVX\d]+)\b)", text, re.IGNORECASE)
        metadata["section_count"] = max(1, len(section_matches))

        return Document(
            doc_id=doc_id,
            title=title,
            content=text,
            metadata=metadata,
            filepath=filepath,
        )

    @classmethod
    def load_directory(cls, directory_path: Path) -> List[Document]:
        documents: List[Document] = []
        for path in sorted(directory_path.glob("*.md")):
            documents.append(cls.parse_file(path))
        for path in sorted(directory_path.glob("*.txt")):
            documents.append(cls.parse_file(path))
        for path in sorted(directory_path.glob("*.pdf")):
            documents.append(cls.parse_file(path))
        return documents
