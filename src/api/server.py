from __future__ import annotations
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.core.config import BaselineConfig
from src.core.models import AnswerPayload
from src.ingestion.parser import DocumentParser
from src.pipeline import BaselineRAGPipeline
from src.interventions.jc_par_pipeline import JCPARPipeline
from src.generation.notice_drafter import LegalNoticeDrafter

from contextlib import asynccontextmanager

# Global pipeline instance
config = BaselineConfig()
base_pipeline = BaselineRAGPipeline(config=config)
pipeline = JCPARPipeline(
    base_pipeline=base_pipeline,
    use_jarf=True,
    use_cpde=True,
    use_esv=True,
)
notice_drafter = LegalNoticeDrafter()

_corpus_initialized = False

def ensure_corpus_indexed() -> None:
    """Safely initializes default corpus lazily without redundant calls or import stalls."""
    global _corpus_initialized
    if _corpus_initialized or len(base_pipeline.chunks) > 0:
        return
    corpus_path = config.corpus_dir
    if corpus_path.exists():
        try:
            base_pipeline.ingest_and_index(corpus_path)
            pipeline.cpde.index_corpus(base_pipeline.chunks)
            _corpus_initialized = True
        except Exception as e:
            print(f"[Warning] Corpus ingestion error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_corpus_indexed()
    yield


app = FastAPI(
    title="HNX Legal Intelligence API",
    description="Jurisdiction-Conditioned Precedence-Aware RAG API for HNX26EPS01",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    selected_jurisdiction: Optional[str] = "United States"
    top_k: Optional[int] = 4
    doc_id: Optional[str] = None


class IngestRequest(BaseModel):
    directory_path: Optional[str] = None


class TextUploadRequest(BaseModel):
    title: Optional[str] = None
    filename: Optional[str] = "contract.txt"
    content: str
    jurisdiction: Optional[str] = "United States"


class NoticeDraftRequest(BaseModel):
    doc_id: Optional[str] = None
    selected_jurisdiction: Optional[str] = "United States"
    sender_name: Optional[str] = None
    sender_entity: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_entity: Optional[str] = None
    recipient_address: Optional[str] = None
    alleged_breach: str
    incident_date: Optional[str] = None
    notice_date: Optional[str] = None
    demanded_remedy: Optional[str] = None
    cure_period_days: Optional[str] = None
    additional_facts: Optional[str] = None


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    ensure_corpus_indexed()
    return {
        "status": "healthy",
        "service": "HNX Legal Intelligence",
        "indexed_documents": len(base_pipeline.documents),
        "indexed_chunks": len(base_pipeline.chunks),
        "embedder": getattr(config, "dense_embedder_type", "dense"),
        "generator": config.generator_type,
    }


@app.get("/api/documents")
def get_documents() -> List[Dict[str, Any]]:
    ensure_corpus_indexed()
    docs = []
    for doc in base_pipeline.documents:
        docs.append({
            "id": doc.doc_id,
            "title": doc.title,
            "filename": Path(doc.filepath).name if getattr(doc, "filepath", None) else doc.doc_id,
            "jurisdiction": doc.metadata.get("jurisdiction", "United States"),
            "total_chars": len(doc.content) if hasattr(doc, "content") else 0,
            "section_count": doc.metadata.get("section_count", len(doc.metadata.get("sections", [])) or 6),
            "total_pages": doc.metadata.get("total_pages"),
        })
    return docs


@app.post("/api/upload")
async def upload_document(
    file: UploadFile = File(...),
    jurisdiction: Optional[str] = Form("United States"),
) -> Dict[str, Any]:
    """Uploads an unseen legal document (PDF, TXT, MD), extracts text, chunks, and indexes dynamically."""
    contents = await file.read()
    filename = file.filename or "uploaded_contract.txt"
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        try:
            import io
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(contents))
            pages_text = []
            for i, page in enumerate(reader.pages):
                pt = page.extract_text() or ""
                pages_text.append(f"--- Page {i + 1} ---\n{pt}")
            text = "\n\n".join(pages_text)
            total_pages = len(reader.pages)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to extract text from PDF: {e}")
    else:
        try:
            text = contents.decode("utf-8")
        except UnicodeDecodeError:
            text = contents.decode("latin-1", errors="replace")
        total_pages = None

    if not text.strip():
        raise HTTPException(status_code=400, detail="Uploaded file contains no readable text.")

    doc = DocumentParser.parse_text(
        text=text,
        default_id=Path(filename).stem,
        filepath=filename,
        total_pages=total_pages,
    )
    if jurisdiction:
        doc.metadata["jurisdiction"] = jurisdiction

    new_chunks = base_pipeline.add_document(doc)
    pipeline.cpde.index_corpus(base_pipeline.chunks)

    return {
        "status": "success",
        "document": {
            "id": doc.doc_id,
            "title": doc.title,
            "filename": filename,
            "jurisdiction": doc.metadata.get("jurisdiction", jurisdiction),
            "sections": doc.metadata.get("section_count", max(1, len(new_chunks))),
            "total_chars": len(doc.content),
            "chunks_indexed": len(new_chunks),
            "total_pages": total_pages,
        },
    }


@app.post("/api/upload_text")
def upload_text_document(req: TextUploadRequest) -> Dict[str, Any]:
    """Uploads unseen contract content directly via JSON payload."""
    if not req.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty.")

    doc = DocumentParser.parse_text(
        text=req.content,
        default_id=req.title or Path(req.filename).stem,
        filepath=req.filename,
    )
    if req.jurisdiction:
        doc.metadata["jurisdiction"] = req.jurisdiction

    new_chunks = base_pipeline.add_document(doc)
    pipeline.cpde.index_corpus(base_pipeline.chunks)

    return {
        "status": "success",
        "document": {
            "id": doc.doc_id,
            "title": doc.title,
            "filename": req.filename,
            "jurisdiction": req.jurisdiction,
            "sections": doc.metadata.get("section_count", max(1, len(new_chunks))),
            "total_chars": len(doc.content),
            "chunks_indexed": len(new_chunks),
        },
    }


@app.post("/api/ingest")
def ingest_documents(req: IngestRequest) -> Dict[str, Any]:
    target_path = Path(req.directory_path) if req.directory_path else config.corpus_dir
    if not target_path.exists():
        raise HTTPException(status_code=404, detail=f"Directory '{target_path}' not found.")

    chunks = base_pipeline.ingest_and_index(target_path)
    pipeline.cpde.index_corpus(chunks)

    return {
        "status": "success",
        "documents_ingested": len(base_pipeline.documents),
        "chunks_indexed": len(chunks),
    }


@app.post("/api/ask")
def ask_question(req: QueryRequest) -> Dict[str, Any]:
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    if not base_pipeline.documents:
        ensure_corpus_indexed()

    # Execute JC-PAR pipeline with optional doc_id scope
    answer: AnswerPayload = pipeline.query(
        query=req.query,
        selected_jurisdiction=req.selected_jurisdiction,
        top_k=req.top_k or 4,
        doc_id=req.doc_id,
    )

    data = answer.model_dump()

    # Provide rich evidence details and cross-reference relationships for frontend
    chunk_map = {c.chunk_id: c for c in base_pipeline.chunks}
    evidence_list = []
    for cid in answer.retrieved_chunks:
        if cid in chunk_map:
            c = chunk_map[cid]
            evidence_list.append({
                "chunk_id": c.chunk_id,
                "doc_id": c.doc_id,
                "document_title": c.document_title,
                "section": " > ".join(c.heading_path) if c.heading_path else c.section_heading,
                "page": c.page,
                "text": c.text,
                "char_start": c.char_start,
                "char_end": c.char_end,
            })
    data["evidence"] = evidence_list

    # Detect cross-reference relationships (CPDE)
    expansions = []
    for cid in answer.retrieved_chunks:
        chunk = chunk_map.get(cid)
        if not chunk:
            continue
        for pattern, relation in pipeline.cpde.PATTERNS:
            matches = pattern.findall(chunk.text)
            for sec_num in matches:
                sec_clean = sec_num.strip().rstrip(".")
                target = pipeline.cpde._find_target_chunk(chunk.doc_id, sec_clean)
                if target:
                    expansions.append({
                        "source_chunk_id": chunk.chunk_id,
                        "source_section": " > ".join(chunk.heading_path) if chunk.heading_path else chunk.section_heading,
                        "source_doc_title": chunk.document_title,
                        "target_chunk_id": target.chunk_id,
                        "target_section": " > ".join(target.heading_path) if target.heading_path else target.section_heading,
                        "target_doc_title": target.document_title,
                        "referenced_section": sec_clean,
                        "relation": relation,
                        "operator": relation.lower(),
                        "direction": "override" if relation == "OVERRIDE" else ("definition" if relation == "DEFINITION" else "referenced"),
                    })
    data["relationships"] = expansions

    return data


@app.post("/api/draft/notice")
def draft_legal_notice(req: NoticeDraftRequest) -> Dict[str, Any]:
    if not req.alleged_breach or not req.alleged_breach.strip():
        raise HTTPException(status_code=400, detail="Alleged breach cannot be empty.")

    if not base_pipeline.documents:
        ensure_corpus_indexed()

    # Determine target document
    target_doc = None
    if req.doc_id:
        target_doc = next((d for d in base_pipeline.documents if d.doc_id == req.doc_id), None)
    if not target_doc and base_pipeline.documents:
        target_doc = base_pipeline.documents[0]

    doc_id = target_doc.doc_id if target_doc else (req.doc_id or "UNKNOWN-DOC")
    doc_title = target_doc.title if target_doc else "Commercial Agreement"

    # Retrieve relevant clauses based on breach and notice topic
    retrieval_query = f"{req.alleged_breach} notice termination remedy cure breach liability"
    scored_chunks = base_pipeline.retriever.retrieve(
        retrieval_query,
        top_k=4,
        doc_id=doc_id if target_doc else None
    )

    return notice_drafter.draft_notice(
        doc_id=doc_id,
        doc_title=doc_title,
        retrieved_chunks=scored_chunks,
        alleged_breach=req.alleged_breach,
        selected_jurisdiction=req.selected_jurisdiction or "United States",
        sender_name=req.sender_name,
        sender_entity=req.sender_entity,
        recipient_name=req.recipient_name,
        recipient_entity=req.recipient_entity,
        recipient_address=req.recipient_address,
        incident_date=req.incident_date,
        notice_date=req.notice_date,
        demanded_remedy=req.demanded_remedy,
        cure_period_days=req.cure_period_days,
        additional_facts=req.additional_facts,
    )


@app.get("/api/draft/clauses")
def preview_draft_clauses(
    doc_id: Optional[str] = None,
    query: Optional[str] = None,
) -> Dict[str, Any]:
    """Retrieves and previews operative contractual clauses from the selected agreement."""
    if not base_pipeline.documents:
        ensure_corpus_indexed()

    target_doc = None
    if doc_id:
        target_doc = next((d for d in base_pipeline.documents if d.doc_id == doc_id), None)
    if not target_doc and base_pipeline.documents:
        target_doc = base_pipeline.documents[0]

    eff_id = target_doc.doc_id if target_doc else (doc_id or "UNKNOWN")
    eff_title = target_doc.title if target_doc else "Commercial Agreement"

    search_query = query.strip() if (query and query.strip()) else "notice breach termination remedy cure liability standard service levels"
    scored_chunks = base_pipeline.retriever.retrieve(
        search_query,
        top_k=4,
        doc_id=eff_id if target_doc else None,
    )

    clauses = []
    for sc in scored_chunks:
        c = sc.chunk
        if not c or not c.text.strip():
            continue
        sec = " > ".join(c.heading_path) if c.heading_path else (c.section_heading or "Operative Provision")
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", c.text) if len(s.strip()) > 20 and not s.strip().startswith("##")]
        snip = " ".join(sentences[:2]) if sentences else c.text[:220].strip()
        clauses.append({
            "chunk_id": c.chunk_id,
            "section": sec,
            "section_title": sec,
            "quote_snippet": snip,
            "text": snip,
            "full_text": c.text,
            "char_start": c.char_start,
            "char_end": c.char_end,
            "score": float(sc.score),
        })

    return {
        "status": "success",
        "doc_id": eff_id,
        "doc_title": eff_title,
        "clauses": clauses,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.server:app", host="127.0.0.1", port=8000, reload=True)
