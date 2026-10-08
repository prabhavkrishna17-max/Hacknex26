from __future__ import annotations
import re
from pathlib import Path
from typing import List, Optional
from src.core.models import Document


class DocumentParser:
    """Parses raw text and Markdown documents into structured Document models."""

    @staticmethod
    def parse_file(filepath: Path) -> Document:
        text = filepath.read_text(encoding="utf-8")
        return DocumentParser.parse_text(text, default_id=filepath.stem, filepath=str(filepath))

    @staticmethod
    def parse_text(text: str, default_id: str = "DOC-UNKNOWN", filepath: Optional[str] = None) -> Document:
        lines = text.splitlines()

        # Extract title from first markdown header
        title = default_id
        for line in lines:
            if line.startswith("# "):
                title = line.lstrip("# ").strip()
                break

        # Extract Document ID
        doc_id_match = re.search(r"\*\*Document ID:\*\*\s*([A-Za-z0-9\-_]+)", text)
        if doc_id_match:
            doc_id = doc_id_match.group(1).strip()
        else:
            # Fallback to default_id or filename
            doc_id = default_id

        # Extract Version, Classification, Domain metadata if present
        metadata = {}
        version_match = re.search(r"\*\*Version:\*\*\s*([^\n\r]+)", text)
        if version_match:
            metadata["version"] = version_match.group(1).strip()

        class_match = re.search(r"\*\*Classification:\*\*\s*([^\n\r]+)", text)
        if class_match:
            metadata["classification"] = class_match.group(1).strip()

        domain_match = re.search(r"\*\*Domain:\*\*\s*([^\n\r]+)", text)
        if domain_match:
            metadata["domain"] = domain_match.group(1).strip()

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
        return documents
