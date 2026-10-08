# HNX26EPS01 — Design Decisions Log

This document records the engineering and methodological design choices made for the reproducible baseline of HNX26EPS01.

---

### Decision 1: Metadata-Preserving Chunking with Heading Breadcrumbs
- **Context:** Standard naive chunkers split documents solely by token count or character length, stripping away section headers, document titles, and hierarchy.
- **Decision:** Implement `MetadataPreservingChunker` that tracks Markdown heading paths (e.g. `["Storage Lifecycle", "Hot Tier"]`) and embeds these breadcrumbs into chunk representations, alongside exact `char_start` and `char_end` offsets.
- **Rationale:** Technical specs frequently reuse identical parameter names (e.g., "Retention Duration" or "Latency Target") across different subsections. Without heading breadcrumbs, retrieval and downstream generators conflate specifications between Hot, Warm, and Cold tiers.

---

### Decision 2: Hybrid Retrieval (BM25 + Dense) via Reciprocal Rank Fusion (RRF)
- **Context:** Pure dense retrieval often misses exact alphanumeric error codes (e.g. `RESOURCE_EXHAUSTED`), port numbers, or cryptographic cipher suites (`TLS_AES_256_GCM_SHA384`). Conversely, pure BM25 struggles with conversational or semantic synonyms.
- **Decision:** Combine Okapi BM25 with dense vector cosine similarity using Reciprocal Rank Fusion ($k=60$).
- **Rationale:** RRF is parameter-free, scale-invariant, and avoids fragile manual score calibration while consistently outperforming single-retriever baselines.

---

### Decision 3: Deterministic Baseline Generator with Dual Execution Modes
- **Context:** Evaluating research interventions requires a strictly deterministic, 100% reproducible baseline that does not fluctuate due to external API latency, rate limits, or temperature randomness.
- **Decision:** Build `DeterministicBaselineGenerator` as the primary local baseline, alongside `GeminiLLMGenerator` as an optional live model client.
- **Rationale:** Ensures that the entire test suite and evaluation harness can execute in continuous integration or offline hackathon environments without credentials, while producing structured citation payloads.

---

### Decision 4: Tripartite Evaluation Benchmark Taxonomy
- **Context:** Evaluating RAG solely on answerable factual queries hides catastrophic failure modes in real enterprise deployments.
- **Decision:** Structure the test set into three distinct categories:
  1. **Answerable (8 samples):** Direct multi-clause factual questions.
  2. **Unanswerable (4 samples):** Out-of-scope or absent technical questions testing abstention fidelity.
  3. **Adversarial (4 samples):** Questions containing false premises, prompt injection attempts, or contradictory parameters.
- **Rationale:** Measuring abstention accuracy and adversarial resilience is essential to demonstrate high-assurance reliability for HNX26EPS01.

---

### Decision 5: Explicit Separation of Groundedness, Unsupported Claims, and Fabricated Citations
- **Context:** Many RAG benchmarks collapse all generation errors into a single "faithfulness" score.
- **Decision:** Measure three distinct citation error metrics:
  - **Groundedness:** Percentage of claims supported by cited chunks.
  - **Unsupported Claims:** Factual assertions made without source evidence.
  - **Fabricated Citations:** Citations that reference non-existent chunk IDs or chunks that do not mention the claimed fact.
- **Rationale:** In regulatory and enterprise audits, citing a real document that doesn't say what you claimed (fabrication) is legally distinct from mere omission.

---

### Decision 6: Zero Heavy Dependencies (Numpy + Pydantic Only)
- **Context:** Installing heavyweight PyTorch / CUDA or C++ wheels on Windows Python 3.13 introduces environment fragility, network transfer latency, and version conflicts.
- **Decision:** Implement dense vector projections, BM25, and similarity mathematics using pure Python and standard `numpy`.
- **Rationale:** Yields sub-millisecond per-query execution latency (<0.5 ms end-to-end), 100% reproducibility, and zero install friction.

---

### Decision 7: Pluggable Modular Interface for Research Interventions
- **Context:** The baseline must serve as the control group against which our team's upcoming research intervention will be measured.
- **Decision:** Implement `set_retriever(...)` and `set_generator(...)` on `BaselineRAGPipeline`.
- **Rationale:** Allows plugging in research interventions (such as dynamic reranking, iterative citation verification, or self-correcting generation) with zero modifications to the underlying evaluation harness or corpus.
