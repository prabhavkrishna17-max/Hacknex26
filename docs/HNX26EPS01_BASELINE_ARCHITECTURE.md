# HNX26EPS01 Baseline Architecture & Technical Specification

## 1. Problem Formulation: HNX26EPS01
In mission-critical engineering, regulatory, and industrial systems (such as the AeroGrid distributed energy telemetry platform), standard RAG systems suffer from three catastrophic failure modes:
1. **Hallucinated & Unsupported Claims:** Generating plausible-sounding operational assertions that are not backed by official engineering standards.
2. **Fabricated Citations:** Appending citation markers to non-existent document fragments or citing chunks that do not substantiate the claim.
3. **Failure to Abstain / Susceptibility to Adversarial Traps:** Fabricating answers for out-of-domain questions or adopting false premises in user prompts.

This baseline establishes a strictly reproducible, modular foundation to measure and benchmark these failure modes before applying novel research interventions.

---

## 2. Architecture Overview

```mermaid
flowchart TD
    subgraph Ingestion & Chunking
        Docs[Raw Documents: Markdown/TXT] --> Parser[DocumentParser]
        Parser --> MetadataChunker[MetadataPreservingChunker]
        MetadataChunker --> Chunks[Chunks with Heading Breadcrumbs & Offsets]
    end

    subgraph Indexing & Hybrid Retrieval
        Chunks --> BM25Idx[BM25 Okapi Index]
        Chunks --> DenseIdx[Dense Vector Embedder]
        Query[User Query] --> BM25Idx
        Query --> DenseIdx
        BM25Idx --> RRF[Reciprocal Rank Fusion / Linear Combiner]
        DenseIdx --> RRF
        RRF --> TopChunks[Top-K Scored Chunks]
    end

    subgraph Generation & Citation
        TopChunks --> Gen[Grounded Generator Engine]
        Query --> Gen
        Gen --> Citations[Extracted Inline Citations]
        Gen --> Answer[Validated AnswerPayload]
    end

    subgraph Evaluation Harness
        Answer --> EvalHarness[Evaluation Harness]
        Citations --> EvalHarness
        GroundTruth[Explicit Testset: Answerable / Unanswerable / Adversarial] --> EvalHarness
        EvalHarness --> Metrics[Recall@K, Groundedness, Unsupported %, Fabricated %, Usefulness, Latency]
    end
```

---

## 3. Module Breakdown

### 3.1 Document Ingestion & Metadata-Preserving Chunking
- **Parser (`src/ingestion/parser.py`):** Ingests structured technical documentation, extracting document identifiers, versions, security classifications, and domain attributes.
- **Chunker (`src/ingestion/chunker.py`):**
  - Hierarchical Markdown heading tracking (`heading_path`: e.g. `["Storage Tiering Overview", "Hot Tier"]`).
  - Sliding-window segmentation with configurable character limits (`target_chunk_chars=900`, `overlap_chars=150`) respecting paragraph boundaries.
  - Deterministic chunk identifiers (`DOC-XXX#cYYY`).
  - Strict preservation of parent metadata, start/end character offsets, and word token counts.

### 3.2 Hybrid Retrieval Pipeline
- **Lexical BM25 (`src/retrieval/bm25.py`):**
  - Full Okapi BM25 implementation ($k_1=1.5, b=0.75$) with domain-preserving tokenization, alphanumeric keyword parsing, and Robertson-Spärck Jones IDF.
  - Indexes enriched text: `heading_path + section_heading + chunk_text`.
- **Dense Vector Retrieval (`src/retrieval/dense.py`):**
  - Self-contained deterministic subword character n-gram projection with L2 normalization (zero external GPU/PyTorch dependencies).
  - Native fallback support for Gemini API embeddings (`models/text-embedding-004`).
- **Hybrid Fusion (`src/retrieval/hybrid.py`):**
  - Reciprocal Rank Fusion ($RRF(d) = \sum \frac{1}{60 + \text{rank}(d)}$).
  - Normalized linear combination mode ($S = \alpha S_{\text{dense}} + (1 - \alpha) S_{\text{bm25}}$).

### 3.3 Grounded Generation Engine
- **Interface (`src/generation/base.py`):** Abstract `BaseGenerator` contract returning validated `AnswerPayload`.
- **Deterministic Synthesizer (`src/generation/deterministic.py`):**
  - Fully offline, reproducible generator for zero-API-key testing.
  - Detects out-of-domain keywords and triggers explicit abstentions.
  - Identifies adversarial false premises and refutes them with cited quotes.
  - Generates verifiable inline bracket citations `[DOC-XXX#cYYY]`.
- **LLM Generator (`src/generation/llm_generator.py`):**
  - Google Gemini API wrapper with structured system prompt instructions and Pydantic validation.
  - Automatic graceful fallback to deterministic generator if network or API quotas fail.

### 3.4 Evaluation Harness & Quantitative Metrics
- **Recall@K:** Measures presence of target documents in top-K retrieved chunks.
- **Groundedness:** Evaluates lexical/semantic entailment between cited claims and the actual content of referenced chunks.
- **Unsupported Claims:** Tracks assertions made without context substantiation.
- **Fabricated Citations:** Detects citations to non-existent or irrelevant chunks.
- **Usefulness Score:** Composite metric assessing factual completeness on answerable queries, successful abstention on unanswerable queries, and refutation of adversarial queries.
- **Latency:** Microsecond-resolution timing of retrieval, generation, and end-to-end execution.

---

## 4. Modular Research Intervention Hooks

The pipeline (`src/pipeline.py`) is engineered specifically for upcoming research interventions without altering the core baseline:

```python
pipeline = BaselineRAGPipeline()
pipeline.ingest_and_index()

# Intervention Hook 1: Custom Reranker / Retrieval Intervention
pipeline.set_retriever(MyResearchInterventionRetriever())

# Intervention Hook 2: Custom Generator / Verification Loop Intervention
pipeline.set_generator(MyResearchInterventionGenerator())
```
