# Phase 2 — HNX26EPS01 Baseline Attack & Stress-Test Report

**Date:** October 8, 2026  
**Track:** HNX26EPS01 (High-Assurance Grounded Legal & Regulatory Intelligence)  
**Baseline Tested:** Unmodified Baseline RAG (Commit `9b24cbb`: Hybrid RRF $k=60$, Top-K=4, Metadata-Preserving Chunker, Deterministic Generator)  
**Corpus:** 9 Documents (AeroGrid Tech Specs + Cloud Master Services Agreement, DPA, SLA, and Jurisdiction Schedules), 52 Chunks  
**Stress-Test Suite:** `data/evaluation/adversarial_stress_test.json` (25 Legal Adversarial Queries)  
**Full Raw Results:** `data/results/adversarial_baseline_results.json`  

---

## 1. Objective
The objective of Phase 2 was **not** to build production features or validate that the baseline works, but to **systematically stress-test and break the existing standard RAG pipeline**. By constructing an adversarial, legal-contract test suite covering complex multi-hop dependencies, clause carveouts, definition chains, and jurisdictional conflicts, we aimed to uncover the true empirical failure profile of standard RAG under HNX26EPS01.

---

## 2. Stress-Test Methodology
1. **Unmodified System Execution:** The baseline pipeline was evaluated with zero modifications to chunking, retrieval weights, prompts, or generation logic.
2. **Granular Retrieval Probing:** Retrieval performance was evaluated independently from generation across four cutoff thresholds: Recall@1, Recall@3, Recall@5, and Recall@10. We tracked distractor outranking (whether similar-but-wrong clauses outranked operative exceptions) and multi-chunk evidence dispersion.
3. **Strict 4-Tier Groundedness:** We replaced binary overlap scoring with a strict 4-tier rubric:
   - `SUPPORTED`: All material facts and contractual caveats substantiated by context.
   - `PARTIALLY_SUPPORTED`: Primary rule cited, but critical exceptions or statutory provisos omitted.
   - `UNSUPPORTED`: Claims absent from context, or false details hallucinated on unanswerable queries.
   - `CONTRADICTED`: Legal assertion directly refuted by governing law or schedule provisions.
4. **Abstention Calibration:** Explicitly separated correct abstentions, false abstentions, unsupported answers, and overconfident answers on unanswerable queries.
5. **Jurisdiction Conditioning:** Evaluated queries conditioned upon an authoritative user-selected jurisdiction parameter (`document + selected jurisdiction + query`).

---

## 3. Dataset Composition

The 25-sample benchmark (`data/evaluation/adversarial_stress_test.json`) spans 10 challenging legal categories:

| Category Code | Category Name | Sample Count | Key Stress Dimension |
| :--- | :--- | :---: | :--- |
| **A** | Multi-Hop Questions | 2 | Requires evidence synthesized across separate contract sections or documents. |
| **B** | Distant-Evidence Questions | 2 | Operative carveout separated from general rule by thousands of characters. |
| **C** | Similar-But-Wrong Evidence | 2 | General affirmative clauses that share query vocabulary but are subject to carveouts. |
| **D** | Conflicting Provisions | 2 | Clauses in direct apparent conflict (e.g. Master Agreement vs DPA / SLA precedence). |
| **E** | Definition Dependency | 2 | Substantive interpretation altered by defined terms in Section 1. |
| **F** | Negation / Exception Cases | 2 | Clauses governed by "subject to", "unless", "provided that", or "except". |
| **G** | Unanswerable Questions | 3 | Contractual scenarios genuinely absent from the corpus (escrow, Japanese law, insurance). |
| **H** | Adversarial Premises | 3 | User queries assuming false legal premises designed to bait incorrect confirmation. |
| **I** | Cross-Document Questions | 2 | Inquiries requiring joint reasoning across MSA, DPA, and Jurisdiction Schedules. |
| **J** | Jurisdiction-Sensitive | 5 | Same clause producing opposite legal outcomes under California, Delaware, UK, EU, Singapore. |
| **TOTAL** | — | **25** | — |

---

## 4. Failure Categories Breakdown

Out of 25 adversarial cases, **20 cases failed**, representing an **80.0% Overall Failure Rate**.

```text
Failure Distribution:
  MULTI_HOP_FAILURE:            [████████] 4 cases (16.0%)
  RETRIEVAL_MISS:               [██████  ] 3 cases (12.0%)
  WRONG_EVIDENCE_RANKING:       [██████  ] 3 cases (12.0%)
  GENERATION_HALLUCINATION:     [██████  ] 3 cases (12.0%)
  OVERCONFIDENT_ANSWER:         [██████  ] 3 cases (12.0%)
  CONFLICT_RESOLUTION_FAILURE:  [██      ] 1 cases ( 4.0%)
  INSUFFICIENT_EVIDENCE:        [██      ] 1 cases ( 4.0%)
  NEGATION_FAILURE:             [██      ] 1 cases ( 4.0%)
  JURISDICTION_FAILURE:         [██      ] 1 cases ( 4.0%)
  SUCCESSFUL CASES:             [██████████] 5 cases (20.0%)
```

---

## 5. Granular Retrieval Results

| Cutoff / Metric | Score | Finding |
| :--- | :---: | :--- |
| **Recall@1** | **47.7%** | In over half of cases (52.3%), the correct operative clause was missed at Rank 1. |
| **Recall@3** | **50.0%** | Only half of required clauses appeared in the top-3. |
| **Recall@5** | **68.2%** | Significant recall gain from top-3 to top-5, demonstrating evidence truncation at top-4. |
| **Recall@10** | **75.0%** | One quarter (25.0%) of required evidence was not retrieved even in top-10. |
| **Distractor Outranked Correct** | **20.0%** (5 cases) | High-overlap general clauses pushed specific carveouts down the ranking. |
| **Multi-Chunk Evidence Cases** | **5 cases** | In 80% of multi-chunk cases, standard Top-4 captured only 1 of the required chunks. |

---

## 6. Groundedness Results

| Groundedness Tier | Count | Percentage | Primary Cause |
| :--- | :---: | :---: | :--- |
| **SUPPORTED** | 8 | 32.0% | Simple single-clause lookups where no distractor or carveout was present. |
| **PARTIALLY_SUPPORTED** | 2 | 8.0% | Main rule found, but secondary statutory notice or exception dropped. |
| **UNSUPPORTED** | 12 | 48.0% | Unanswerable queries answered with irrelevant clauses; missing evidence in multi-hop. |
| **CONTRADICTED** | 3 | 12.0% | Asserted affirmative rule when governing law or schedule explicitly voided the clause. |

---

## 7. Abstention Results

| Category | Count | Rate | Evaluation Finding |
| :--- | :---: | :---: | :--- |
| **Correct Abstention** | 0 | 0.0% | Baseline failed to abstain on all 3 legal unanswerable queries. |
| **False Abstention** | 0 | 0.0% | Did not falsely refuse answerable questions. |
| **Unsupported Answer** | 12 | 48.0% | Produced assertions without supporting proof. |
| **Overconfident Answer** | 3 | 100% of unanswerable | Fabricated answers for non-existent provisions due to boilerplate token overlap. |

**Crucial Distinction:** The failure to abstain was not because retrieval failed to find chunks, but because **partial boilerplate overlap tricked the retriever into returning adjacent clauses, and tricked the generator into guessing an answer**.

---

## 8. Jurisdiction-Related Findings

The user-selected jurisdiction parameter fundamentally altered legal outcomes in Category J:
- **California vs. Delaware Non-Solicitation:**
  - When Delaware was selected (`STRESS-022`), Section 10 is fully enforceable.
  - When California was selected (`STRESS-021`), Section 10 is strictly void under Cal. Bus. & Prof. Code § 16600.
  - **Baseline Failure:** The baseline was blind to the jurisdiction parameter; it retrieved the general Master Agreement Section 10 and declared it enforceable for California personnel, committing a **direct legal contradiction**.
- **UK UCTA Negligence Exclusion:**
  - Under UK law (`STRESS-023`), excluding liability for negligence causing personal injury is void under UCTA 1977. The baseline cited the general consequential damages waiver, ignoring UK mandatory law.
- **Singapore PDPA vs. EU GDPR Breach Timelines:**
  - Singapore mandates notification within 3 calendar days (`DOC-009 Section 6.1`), whereas GDPR mandates 72 hours (`DOC-009 Section 5.2`). The baseline conflated the two regimes.

---

## 9. Representative Failures

### Case 1: Carveout Inversion (`STRESS-005` Similar-But-Wrong)
- **Query:** *"Is Vendor obligated to defend Customer against patent infringement claims that arise from Customer's own modifications to the software?"*
- **What Baseline Did:** Retrieved Section 7.1 (`DOC-006#c008`, Vendor IP Indemnity) at Rank 1. Ignored Section 7.2(ii) carveout.
- **Generated Answer:** *"Vendor shall defend Customer against any third-party claim alleging that the Services directly infringe a valid copyright or registered patent..."*
- **Legal Reality:** Directly false. Section 7.2 explicitly carves out customer modifications.

### Case 2: Multi-Hop Precedence Override (`STRESS-008` Conflicting Provisions)
- **Query:** *"Does Customer have thirty days or fifteen days written notice to terminate the Agreement if uptime falls below 95% for two consecutive months?"*
- **What Baseline Did:** Retrieved general breach cure period from Section 9.2 (`DOC-006#c011`) at Rank 1.
- **Generated Answer:** Asserted 30 days notice.
- **Legal Reality:** DOC-008 Section 3.1 creates an accelerated 15-day termination right that explicitly overrides Section 9.2.

### Case 3: Boilerplate Overconfidence (`STRESS-013` Unanswerable)
- **Query:** *"What liquidated damages must Vendor pay if software source code is not deposited into an escrow account within sixty days?"*
- **What Baseline Did:** Retrieved payment and interest clauses from Section 3 and SLA credit tiers.
- **Generated Answer:** Hallucinated payment terms and cited general fee provisions, failing to state that escrow terms are absent.

---

## 10. Root-Cause Analysis

Across the 20 failures, three structural architectural deficits were identified:
1. **Flat Bag-of-Chunks Assumption:** Standard chunking segments documents into flat text bags, destroying the semantic dependency links represented by phrases like *"Subject to Section 8.3"*, *"Notwithstanding Section 9.2"*, or *"As defined in Section 1"*.
2. **Lexical Dominance of General Rules over Specific Carveouts:** General rules use broad, affirmative terminology that matches query words with high frequency; carveouts use narrow negative terminology that receives lower BM25 and dense scores.
3. **Absence of Authority Governance:** Standard RAG cannot treat user-selected jurisdiction as a hard authority mask, allowing general contract boilerplate to override jurisdiction-specific statutory schedules.

---

## 11. Most Important Weakness Discovered

The single most critical failure mode discovered is:
> **Clause-Level Precedence Inversion under Jurisdiction and Contractual Carveouts.**  
> Standard RAG systematically retrieves and asserts the *general rule* while dropping or outranking the *specific carveout or jurisdiction override*, leading to authoritative-sounding but legally false answers.

---

## 12. Candidate Research Intervention: JC-PAR

We propose **Jurisdiction-Conditioned Precedence-Aware RAG (JC-PAR)**, a targeted architectural intervention containing three specific modules:

1. **Jurisdiction Authority Router & Filter (JARF):**
   - Applies an explicit authority mask based on the user-selected jurisdiction parameter.
   - Boosts and prioritizes statutory overrides from applicable Jurisdiction Schedules before general contract boilerplate is evaluated.
2. **Clause-Precedence Dependency Expander (CPDE):**
   - Traverses contractual link signals (`"Subject to Section X"`, `"Notwithstanding Section Y"`, `"Defined in Section 1"`).
   - If a general rule chunk is retrieved, CPDE automatically follows the dependency edge to retrieve the linked exception/carveout chunk into the context window.
3. **Calibrated Set-Level Evidence Sufficiency Verifier (CSL-ESV):**
   - Assesses whether the retrieved chunk set contains positive proof for all query facets.
   - Detects when query terms match only boilerplate contract language without answering the core proposition, triggering calibrated abstention.

---

## 13. Literature Comparison

| Approach | Venue / Year | Solves Distractor Carveouts? | Solves Dynamic Jurisdiction? | Solves Boilerplate Overconfidence? |
| :--- | :--- | :---: | :---: | :---: |
| **LegalBench-RAG** | Guha et al., 2023 | ❌ No | ❌ No | ❌ No |
| **LIT-RAGBench** | ACL 2024 | ❌ No | ❌ No | ⚠️ Partial (General QA) |
| **SURE-RAG** | ArXiv 2024 | ⚠️ Partial (General NLI) | ❌ No | ⚠️ Partial (Multi-hop) |
| **Ontology Legal RAG** | MDPI 2024 | ⚠️ Manual graphs | ⚠️ Static rules | ❌ No |
| **JC-PAR (Proposed)** | Phase 3 Proposal | ✅ **Yes (via CPDE)** | ✅ **Yes (via JARF)** | ✅ **Yes (via CSL-ESV)** |

---

## 14. Differentiation & Novelty Assessment

- **Theoretical Novelty:** We explicitly **disclaim** any claim of novel foundation model theory or pretraining mathematics.
- **Architectural Differentiation:** JC-PAR is genuinely differentiated as a **systems-level, domain-grounded pipeline** that treats jurisdiction as an authoritative governance parameter and resolves contractual dependency graphs before generation. It is specifically tailored to solve the empirical 80% failure rate exposed in this report.

---

## 15. Proposed Research Hypothesis

> **Hypothesis $H_1$:**  
> Augmenting hybrid retrieval with Jurisdiction Authority Routing (JARF) and Clause-Precedence Dependency Expansion (CPDE) will reduce the Adversarial Stress-Test failure rate from **80.0% to < 20.0%**, increasing Recall@5 from **68.2% to > 90.0%** and eliminating 100% of direct legal contradictions on jurisdiction-conditioned queries.

---

## 16. Proposed Ablation Plan for Phase 3

We will evaluate four distinct system configurations on the 25-case stress test:
1. **$M_0$ (Baseline):** Current Unmodified Baseline (Hybrid RRF, Top-K=4).
2. **$M_1$ (Baseline + JARF):** Baseline + Jurisdiction Authority Routing (isolating jurisdiction gains).
3. **$M_2$ (Baseline + CPDE):** Baseline + Clause-Precedence Dependency Expansion (isolating carveout gains).
4. **$M_3$ (Full JC-PAR):** Baseline + JARF + CPDE + Calibrated Sufficiency Verifier.

---

## 17. What Should NOT Be Changed Yet
- Do **not** modify `src/ingestion/parser.py` or baseline core data structures.
- Do **not** modify `benchmark_qa_testset.json` (it remains our controlled control group).
- Do **not** build a frontend UI.
- Do **not** install heavyweight neural dependencies.
- Keep the baseline pipeline independently runnable via `run_baseline.py`.

---

## 18. Recommendation for Phase 3
Transition to **Phase 3 (Research Intervention Implementation)**:
1. Implement the `JurisdictionAuthorityRouter` and `ClausePrecedenceExpander` as pluggable modules using the existing `pipeline.set_retriever(...)` hook.
2. Execute the full ablation study ($M_0$ through $M_3$) against `data/evaluation/adversarial_stress_test.json`.
3. Document empirical gains and statistical significance in the Phase 3 report.
