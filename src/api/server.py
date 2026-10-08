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
        "embedder": config.dense_embedder,
        "generator": config.generator_type,
    }


@app.get("/api/documents")
def get_documents() -> List[Dict[str, Any]]:
    docs = []
    for doc in base_pipeline.documents:
        docs.append({
            "id": doc.doc_id,
            "title": doc.title,
            "filename": doc.filename,
            "jurisdiction": doc.jurisdiction,
            "total_chars": doc.total_chars,
            "section_count": len(doc.sections),
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

    return answer.model_dump()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.server:app", host="127.0.0.1", port=8000, reload=True)
