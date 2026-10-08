# HNX26EPS01 — Phase 3 Experimental Design

**Date:** October 8, 2026  
**Track:** HNX26EPS01 (High-Assurance Grounded Legal & Regulatory Intelligence)  
**Objective:** Empirically validate whether the proposed **JC-PAR** (Jurisdiction-Conditioned Precedence-Aware RAG) interventions materially improve upon the 80% failure baseline established in Phase 2.

---

## 1. Research Hypotheses

1. **Hypothesis $H_1$ (Jurisdiction Routing):** Explicitly conditioning retrieval on user-selected jurisdiction via authoritative schedule routing (JARF) eliminates direct legal contradictions caused by default jurisdiction pollution.
2. **Hypothesis $H_2$ (Precedence Expansion):** Dynamically expanding clause dependencies along explicit contractual cross-references (`"Subject to Section X"`, `"Notwithstanding Section Y"`) (CPDE) resolves carveout inversion where general rules outrank specific exceptions.
3. **Hypothesis $H_3$ (Evidence Sufficiency Verification):** Verifying set-level factual sufficiency before generation (ESV) significantly reduces overconfident hallucinated answers on unanswerable queries without destroying usefulness.
4. **Hypothesis $H_4$ (Composite JC-PAR):** Combining JARF + CPDE + ESV achieves synergistic improvements in groundedness, contradiction elimination, and calibrated abstention.

---

## 2. Experimental Controls & Guardrails

- **Constant Evaluation Benchmark:** All five systems are evaluated against the exact same 25-case stress test (`data/evaluation/adversarial_stress_test.json`).
- **Untouched Baseline Control:** The baseline implementation in `src/retrieval/`, `src/generation/`, and `src/pipeline.py` remains completely untouched as an independent experimental control.
- **Separation of Results:** All experimental ablation outputs are saved exclusively in `data/results/ablation/` and do not overwrite prior baseline artifacts.
- **Zero Prompt / In-place Tuning:** No parameters were retroactively tweaked to force specific test cases to pass.

---

## 3. Systems Under Evaluation

We benchmark five distinct system configurations:

1. **System A: Baseline (Control)**
   - Unmodified Standard RAG: Hybrid RRF ($k=60$), top-k=4, flat metadata-preserving chunking, deterministic generator.
2. **System B: Baseline + JARF**
   - Incorporates `JurisdictionAuthorityRouter`.
   - Authority boost (+2.5) applied to matching jurisdiction schedules (`DOC-009`); conflicting jurisdiction schedules suppressed (-2.0).
3. **System C: Baseline + CPDE**
   - Incorporates `ClausePrecedenceExpander`.
   - Inverted clause index over all corpus chunks. Detects `"subject to"`, `"notwithstanding"`, `"except as provided in"`, `"defined in"`, and dynamically expands up to 2 linked carveout chunks.
4. **System D: Baseline + ESV**
   - Incorporates `EvidenceSufficiencyVerifier`.
   - Deconstructs substantive query facets. Evaluates set-level coverage. Intercepts generation on `INSUFFICIENT` / `NO_RELEVANT_EVIDENCE` states with calibrated evidence-based abstention.
5. **System E: Full JC-PAR**
   - Full integrated pipeline: JARF + CPDE + ESV.

---

## 4. Evaluation Metrics

- **Retrieval:** Recall@1, Recall@3, Recall@5, Recall@10, Distractor Outranking Rate (frequency with which similar-but-wrong general rules outrank specific carveouts).
- **Groundedness & Fidelity:** Strict 4-tier groundedness (Supported, Partially Supported, Unsupported, Contradicted), Direct Contradiction Rate.
- **Abstention Calibration:** Correct Abstention Rate, Overconfident Answer Rate, False Abstention Rate.
- **Jurisdiction Accuracy:** Accuracy on Category J jurisdiction-sensitive queries.
- **Operational Efficiency:** Mean and P90 End-to-End Latency, Mean Evidence Set Size.
