from __future__ import annotations
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.core.config import BaselineConfig
from src.core.models import AnswerPayload
from src.pipeline import BaselineRAGPipeline
from src.interventions.jc_par_pipeline import JCPARPipeline

app = FastAPI(
    title="HNX Legal Intelligence API",
    description="Jurisdiction-Conditioned Precedence-Aware RAG API for HNX26EPS01",
    version="1.0.0",
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instance
config = BaselineConfig()
base_pipeline = BaselineRAGPipeline(config=config)
pipeline = JCPARPipeline(
    base_pipeline=base_pipeline,
    use_jarf=True,
    use_cpde=True,
    use_esv=True,
)

# Auto-ingest default corpus on startup if directory exists
corpus_path = config.corpus_dir
if corpus_path.exists():
    try:
        base_pipeline.ingest_and_index(corpus_path)
        pipeline.cpde.index_corpus(base_pipeline.chunks)
    except Exception as e:
        print(f"[Warning] Startup corpus ingestion error: {e}")


class QueryRequest(BaseModel):
    query: str
    selected_jurisdiction: Optional[str] = "United States"
    top_k: Optional[int] = 4


class IngestRequest(BaseModel):
    directory_path: Optional[str] = None


@app.get("/api/health")
def health_check() -> Dict[str, Any]:
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
    docs = []
    for doc in base_pipeline.documents:
        docs.append({
            "id": doc.doc_id,
            "title": doc.title,
            "filename": Path(doc.filepath).name if getattr(doc, "filepath", None) else doc.doc_id,
            "jurisdiction": doc.metadata.get("jurisdiction", "United States"),
            "total_chars": len(doc.content) if hasattr(doc, "content") else 0,
            "section_count": len(doc.metadata.get("sections", [])),
        })
    return docs


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

    # Execute JC-PAR pipeline
    answer: AnswerPayload = pipeline.query(
        query=req.query,
        selected_jurisdiction=req.selected_jurisdiction,
        top_k=req.top_k or 4,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.server:app", host="127.0.0.1", port=8000, reload=True)
