from __future__ import annotations
import re
from typing import List
from src.core.models import Document, Chunk


class MetadataPreservingChunker:
    """Chunks documents into retrievable fragments while strictly preserving

    hierarchical heading paths, character offsets, and document-level metadata.
    """

    def __init__(self, target_chunk_chars: int = 900, overlap_chars: int = 150, min_chunk_chars: int = 100):
        self.target_chunk_chars = target_chunk_chars
        self.overlap_chars = overlap_chars
        self.min_chunk_chars = min_chunk_chars

    def chunk_document(self, document: Document) -> List[Chunk]:
        raw_text = document.content
        lines = raw_text.splitlines(keepends=True)

        sections: List[dict] = []
        current_heading_path: List[str] = [document.title]
        current_section_heading: str = document.title
        current_lines: List[str] = []
        section_char_start: int = 0
        current_offset: int = 0
        current_page: Optional[int] = document.metadata.get("total_pages", None) and 1

        md_header_regex = re.compile(r"^(#{1,6})\s+(.*)$")
        legal_header_regex = re.compile(r"^((?:Section|Clause|Article)\s+[0-9IVX]+(?:\.[0-9]+)*[.:]?\s+.*)$", re.IGNORECASE)
        page_regex = re.compile(r"^---\s*Page\s+(\d+)\s*---$", re.IGNORECASE)

        for line in lines:
            trimmed = line.strip()

            page_match = page_regex.match(trimmed)
            if page_match:
                current_page = int(page_match.group(1))
                current_offset += len(line)
                continue

            md_match = md_header_regex.match(trimmed)
            legal_match = legal_header_regex.match(trimmed) if not md_match else None

            if md_match or legal_match:
                # Flush previous section if any content accumulated
                section_text = "".join(current_lines).strip()
                if section_text:
                    sections.append({
                        "heading_path": list(current_heading_path),
                        "section_heading": current_section_heading,
                        "text": section_text,
                        "char_start": section_char_start,
                        "char_end": section_char_start + len("".join(current_lines)),
                        "page": current_page,
                    })

                if md_match:
                    level = len(md_match.group(1))
                    heading_title = md_match.group(2).strip()
                    if level == 1:
                        current_heading_path = [heading_title]
                    elif level == 2:
                        current_heading_path = [current_heading_path[0] if current_heading_path else document.title, heading_title]
                    elif level >= 3:
                        base = current_heading_path[:2] if len(current_heading_path) >= 2 else [document.title]
                        current_heading_path = base + [heading_title]
                else:
                    heading_title = legal_match.group(1).strip()
                    current_heading_path = [current_heading_path[0] if current_heading_path else document.title, heading_title]

                current_section_heading = heading_title
                current_lines = [line]
                section_char_start = current_offset
            else:
                current_lines.append(line)

            current_offset += len(line)

        # Flush final section
        if current_lines:
            section_text = "".join(current_lines).strip()
            if section_text:
                sections.append({
                    "heading_path": list(current_heading_path),
                    "section_heading": current_section_heading,
                    "text": section_text,
                    "char_start": section_char_start,
                    "char_end": current_offset,
                    "page": current_page,
                })

        # Sub-chunk sections if they exceed target_chunk_chars
        chunks: List[Chunk] = []
        chunk_counter = 1

        for sec in sections:
            sec_text = sec["text"]
            sec_start = sec["char_start"]
            sec_page = sec.get("page")

            if len(sec_text) <= self.target_chunk_chars:
                token_count = len(sec_text.split())
                chunk_id = f"{document.doc_id}#c{chunk_counter:03d}"
                chunks.append(Chunk(
                    chunk_id=chunk_id,
                    doc_id=document.doc_id,
                    document_title=document.title,
                    section_heading=sec["section_heading"],
                    heading_path=sec["heading_path"],
                    text=sec_text,
                    char_start=sec_start,
                    char_end=sec_start + len(sec_text),
                    token_count=token_count,
                    page=sec_page,
                    metadata=dict(document.metadata),
                ))
                chunk_counter += 1
            else:
                # Sliding window chunking respecting paragraph/sentence breaks
                paragraphs = re.split(r"\n\s*\n", sec_text)
                buffer = ""
                buf_start = sec_start
                local_offset = 0

                for para in paragraphs:
                    para_clean = para.strip()
                    if not para_clean:
                        continue

                    if buffer and (len(buffer) + len(para_clean) + 2 > self.target_chunk_chars):
                        # Commit current buffer
                        token_count = len(buffer.split())
                        chunk_id = f"{document.doc_id}#c{chunk_counter:03d}"
                        chunks.append(Chunk(
                            chunk_id=chunk_id,
                            doc_id=document.doc_id,
                            document_title=document.title,
                            section_heading=sec["section_heading"],
                            heading_path=sec["heading_path"],
                            text=buffer,
                            char_start=buf_start,
                            char_end=buf_start + len(buffer),
                            token_count=token_count,
                            page=sec_page,
                            metadata=dict(document.metadata),
                        ))
                        chunk_counter += 1

                        # Carry over overlap
                        overlap_point = max(0, len(buffer) - self.overlap_chars)
                        overlap_text = buffer[overlap_point:].strip()
                        buffer = (overlap_text + "\n\n" + para_clean).strip()
                        buf_start = sec_start + local_offset
                    else:
                        if buffer:
                            buffer = buffer + "\n\n" + para_clean
                        else:
                            buffer = para_clean
                            buf_start = sec_start + local_offset

                    local_offset += len(para) + 2

                if buffer and len(buffer) >= self.min_chunk_chars:
                    token_count = len(buffer.split())
                    chunk_id = f"{document.doc_id}#c{chunk_counter:03d}"
                    chunks.append(Chunk(
                        chunk_id=chunk_id,
                        doc_id=document.doc_id,
                        document_title=document.title,
                        section_heading=sec["section_heading"],
                        heading_path=sec["heading_path"],
                        text=buffer,
                        char_start=buf_start,
                        char_end=buf_start + len(buffer),
                        token_count=token_count,
                        page=sec_page,
                        metadata=dict(document.metadata),
                    ))
                    chunk_counter += 1

        return chunks

    def chunk_documents(self, documents: List[Document]) -> List[Chunk]:
        all_chunks: List[Chunk] = []
        for doc in documents:
            all_chunks.extend(self.chunk_document(doc))
        return all_chunks
