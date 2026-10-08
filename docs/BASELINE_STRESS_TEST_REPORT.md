# HNX26EPS01 — Baseline Adversarial Stress-Test Report

**Date:** October 8, 2026  
**Pipeline Tested:** Unmodified Baseline RAG (Hybrid RRF $k=60$, Top-K=4, Metadata-Preserving Chunker, Deterministic Generator)  
**Corpus Size:** 9 Documents, 52 Metadata-Preserved Chunks  
**Stress-Test Suite:** `data/evaluation/adversarial_stress_test.json` (25 Legal Adversarial Queries)  
**Output Data:** `data/results/adversarial_baseline_results.json`  

---

## 1. Executive Summary

While the baseline scored 100% on the small, controlled 16-sample development set in Phase 1, the **25-case Adversarial Stress-Test Suite broke the baseline comprehensively**.

| Metric | Controlled Baseline (Phase 1) | Adversarial Stress Test (Phase 2) | Δ (Degradation) |
| :--- | :---: | :---: | :---: |
| **Overall Failure Rate** | **0.0%** (0/16) | **80.0%** (20/25) | **+80.0% Failure** |
| **Retrieval Recall@1** | 100.0% | **47.7%** | -52.3% |
| **Retrieval Recall@3** | 100.0% | **50.0%** | -50.0% |
| **Retrieval Recall@5** | 100.0% | **68.2%** | -31.8% |
| **Retrieval Recall@10** | 100.0% | **75.0%** | -25.0% |
| **Distractor Outranking Rate** | 0.0% | **20.0%** (5 cases) | +20.0% |
| **Strict Fully Supported Rate**| 100.0% | **32.0%** (8 cases) | -68.0% |
| **Direct Contradiction Rate** | 0.0% | **12.0%** (3 cases) | +12.0% |
| **Overconfident Answer Rate** | 0.0% | **12.0%** (3 cases) | +12.0% |

The baseline demonstrated catastrophic degradation when subjected to legal clause dependencies, carve-outs, hierarchical precedence, and cross-jurisdictional conflicts.

---

## 2. Granular Retrieval Failure Analysis

```text
Retrieval Recall by Cutoff:
  Recall@1:   [███████████████                     ] 47.7%
  Recall@3:   [████████████████                    ] 50.0%
  Recall@5:   [██████████████████████              ] 68.2%
  Recall@10:  [████████████████████████            ] 75.0%
```

### Key Retrieval Breakdown:
1. **Low Top-Rank Precision:** In over half of legal queries (52.3%), the correct operative clause was not retrieved at Rank 1.
2. **Distractor Outranking (20.0% of cases):**
   - Similar-but-wrong general clauses consistently outranked specific exceptions and carveouts because general rules exhibit higher lexical keyword density with the user's inquiry.
   - Example (`STRESS-005`): General IP Indemnification (`DOC-006#c008`, Section 7.1) outranked the customer software modification carveout (Section 7.2(ii)).
   - Example (`STRESS-003`): General 12-month liability cap (`DOC-006#c009`, Section 8.2) outranked the confidentiality breach carveout (`DOC-006#c010`, Section 8.3(a)).
3. **Multi-Hop Evidence Fragmentation:** For queries requiring evidence split across 2 or more chunks, standard Top-4 retrieval captured only one fragment in 80% of multi-chunk cases.

---

## 3. Strict Groundedness Evaluation

We classified answer groundedness into four mutually exclusive tiers:

| Tier | Count | Percentage | Description |
| :--- | :---: | :---: | :--- |
| **SUPPORTED** | 8 | 32.0% | All material claims and necessary legal nuances are fully substantiated by retrieved chunks. |
| **PARTIALLY_SUPPORTED** | 2 | 8.0% | The primary assertion is mentioned, but key carveouts, notice periods, or provisos are omitted. |
| **UNSUPPORTED** | 12 | 48.0% | Claims cannot be verified in the context, or answer hallucinated details on unanswerable queries. |
| **CONTRADICTED** | 3 | 12.0% | The generated answer asserts a legal conclusion that is directly refuted by mandatory law or contract schedules. |

### Direct Contradictions Discovered:
- **`STRESS-021` (California Non-Solicitation):** The system asserted that Section 10 non-solicitation was enforceable, citing Delaware commercial principles, directly contradicting California Business and Professions Code § 16600 (`DOC-009#c002`).
- **`STRESS-008` (Chronic Downtime Notice):** The system asserted a 30-day cure notice under general breach rules, directly contradicting the accelerated 15-day notice right in SLA Section 3.1 (`DOC-008#c004`).
- **`STRESS-005` (Customer Modification Indemnity):** The system asserted that Vendor must defend patent claims, citing the general indemnity clause and omitting the carveout.

---

## 4. Abstention & Overconfidence Failures

| Behavior | Count | Percentage | Finding |
| :--- | :---: | :---: | :--- |
| **Correct Abstention** | 0 | 0.0% | The system failed to abstain on legal unanswerable queries. |
| **False Abstention** | 0 | 0.0% | Did not inappropriately refuse answerable questions. |
| **Unsupported Answer** | 12 | 48.0% | Generated answers lacking required evidentiary grounding. |
| **Overconfident Answer** | 3 | 12.0% | Answered questions where required information was completely absent from the corpus. |

### Overconfidence Pathology:
When faced with unanswerable questions that contained generic contractual vocabulary (e.g., "software escrow liquidated damages", "Japanese Commercial Code penalties", "cyber insurance policy limits"), the baseline did **not** abstain. Instead, it matched boilerplate terms from nearby sections (interest rates, security safeguards, termination fees) and synthesized an **overconfident, false answer**.

---

## 5. Root Cause Classification

| Root Cause | Count | % of All Cases | Primary Failure Mechanism |
| :--- | :---: | :---: | :--- |
| **`MULTI_HOP_FAILURE`** | 4 | 16.0% | Evidence spans multiple sections; top-4 retrieval dropped required secondary chunks. |
| **`RETRIEVAL_MISS`** | 3 | 12.0% | Operative clause failed to appear anywhere in top-10 retrieved chunks. |
| **`GENERATION_HALLUCINATION`** | 3 | 12.0% | Generator stitched together partial sentences into legally incorrect assertions. |
| **`WRONG_EVIDENCE_RANKING`** | 3 | 12.0% | General rule distractor chunk outranked the specific carveout / exception chunk. |
| **`OVERCONFIDENT_ANSWER`** | 3 | 12.0% | Attempted to answer unanswerable legal questions instead of abstaining. |
| **`CONFLICT_RESOLUTION_FAILURE`** | 1 | 4.0% | Failed to resolve order of precedence between Master Agreement and DPA/SLA. |
| **`INSUFFICIENT_EVIDENCE`** | 1 | 4.0% | Retrieved partial evidence, resulting in incomplete answer omitting statutory caveats. |
| **`NEGATION_FAILURE`** | 1 | 4.0% | Ignored negative conditional constraints ("unless", "subject to", "provided that"). |
| **`JURISDICTION_FAILURE`** | 1 | 4.0% | Ignored user-selected jurisdiction, blindly defaulting to Delaware terms. |
| **SUCCESS** | 5 | 20.0% | Successfully answered or handled query. |
| **TOTAL** | **25** | **100.0%** | **80.0% Overall Failure Rate** |
