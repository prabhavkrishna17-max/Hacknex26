# HNX26EPS01 — Phase 3 Ablation Results & Empirical Evaluation

**Evaluation Date:** October 8, 2026  
**Benchmark Suite:** `data/evaluation/adversarial_stress_test.json` (25 Legal Adversarial Cases)  
**Artifact Directory:** `data/results/ablation/` (`baseline.json`, `jarf.json`, `cpde.json`, `esv.json`, `full.json`, `comparison.json`)  

---

## 1. Multi-System Ablation Comparison Matrix

| System Configuration | Recall@5 | Distractor Outranked | Strict Supported | Direct Contradiction | Overconfident Answers | Correct Abstention | Overall Failure Rate | Mean Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **System A: Baseline** | **68.2%** | 20.0% (5) | 32.0% (8) | 12.0% (3) | 3 cases | 0.0% (0/3) | **80.0%** (20/25) | 0.54 ms |
| **System B: + JARF** | 54.5% | 16.0% (4) | 32.0% (8) | 8.0% (2) | 3 cases | 0.0% (0/3) | **84.0%** (21/25) | 0.59 ms |
| **System C: + CPDE** | 63.6% | 20.0% (5) | 32.0% (8) | 8.0% (2) | 3 cases | 0.0% (0/3) | **80.0%** (20/25) | 0.73 ms |
| **System D: + ESV** | **68.2%** | 20.0% (5) | 40.0% (10) | 12.0% (3) | 1 case | **66.7%** (2/3) | **72.0%** (18/25) | 0.57 ms |
| **System E: Full JC-PAR** | 54.5% | **12.0%** (3) | **44.0%** (11) | **4.0%** (1) | **0 cases** | **100.0%** (3/3) | **72.0%** (18/25) | 0.80 ms |

---

## 2. Component-by-Component Empirical Analysis

### 2.1 Evidence Sufficiency Verifier (ESV) — Clear Empirical Winner
- **Hypothesis Validated:** $H_3$ is strongly supported.
- **Impact on Abstention & Overconfidence:**
  - In the Baseline, 100% of unanswerable legal queries (`STRESS-013`, `STRESS-014`, `STRESS-015`) resulted in **overconfident hallucinated answers** because query words matched generic contract boilerplate.
  - Adding ESV alone reduced overconfidence from 3 cases to 1 case and increased correct abstention from 0.0% to 66.7%.
  - In Full JC-PAR, ESV achieved **100% correct abstention (3/3 cases)** with **0 overconfident answers**, converting these failure cases into clean, verifiable evidence-based abstentions.
- **Latency Overhead:** Virtually undetectable (+0.03 ms over baseline).

### 2.2 Clause-Precedence Dependency Expander (CPDE) — Effective on Carveouts, Discovered Fixed-Window Penalty
- **Hypothesis Validated:** $H_2$ is partially supported.
- **Impact on Contradictions:**
  - CPDE reduced direct legal contradictions from 12.0% to 8.0% in isolation, and to 4.0% in Full JC-PAR.
  - In `STRESS-005` (Customer software modification carveout) and `STRESS-008` (SLA chronic downtime accelerated termination), CPDE traversed `"Subject to Section 8.3"` and `"Notwithstanding Section 9.2"`, successfully pulling the operative exception into the top ranks.
- **Discovered Failure / Tradeoff ("Fixed-Window Eviction Penalty"):**
  - Notice that Recall@5 dropped from 68.2% to 63.6% in CPDE and 54.5% in Full JC-PAR.
  - **Causal Mechanism:** When CPDE expands 2 dependent chunks into a rigid `top_k=4` or `top_k=5` window, it physically evicts lower-ranked multi-hop chunks from the context window! While the carveout is gained, secondary multi-hop fragments can be pushed outside the evaluation window.
  - **Engineering Implication:** Downstream architectures must use a dynamic evidence buffer ($k_{expanded} = k_{base} + k_{deps}$) rather than a hard static truncation.

### 2.3 Jurisdiction Authority Router & Filter (JARF) — Fixed Contradictions, Required Topical Guardrail
- **Hypothesis Validated:** $H_1$ is partially supported.
- **Impact on Jurisdiction Contradictions:**
  - In `STRESS-021` (California non-solicitation voidness under Cal. Bus. & Prof. Code § 16600):
    - Baseline asserted Delaware enforceability (`DOC-009#c003`), committing a direct contradiction.
    - JARF boosted the California schedule (`DOC-009#c002`) to Rank 1 and suppressed the conflicting Delaware schedule, fixing the contradiction.
  - In Full JC-PAR, direct contradictions dropped from 12.0% (3 cases) to **4.0% (1 case)**.
- **Discovered Failure / Tradeoff:**
  - When tested in isolation without topical relevance filtering, naive authority boosting increased the overall failure rate to 84.0% because non-statutory questions were polluted by promoted schedule chunks.
  - JARF requires joint relevance gating so that jurisdiction schedules are promoted *only* when the query addresses a topic covered by that schedule.

---

## 3. Representative Case Transitions

| Query ID | Category | Baseline Outcome | Full JC-PAR Outcome | Causal Intervention |
| :--- | :--- | :--- | :--- | :--- |
| **`STRESS-013`** | Unanswerable (Escrow damages) | OVERCONFIDENT_ANSWER (Hallucinated fee terms) | **SUCCESS** (Correctly abstained: missing escrow clause) | ESV core phrase facet detection |
| **`STRESS-014`** | Unanswerable (Japanese Code) | OVERCONFIDENT_ANSWER (Cited Delaware interest) | **SUCCESS** (Correctly abstained: Japanese law absent) | ESV substantive coverage check |
| **`STRESS-015`** | Unanswerable (Cyber Insurance) | OVERCONFIDENT_ANSWER (Cited encryption terms) | **SUCCESS** (Correctly abstained: insurance absent) | ESV substantive coverage check |
| **`STRESS-021`** | Jurisdiction (California non-compete) | WRONG_RANKING / CONTRADICTED (Cited Delaware) | **SUCCESS** (Cited Cal. Bus. & Prof. Code § 16600) | JARF schedule authority boost |
| **`STRESS-008`** | Conflicting Provisions (Notice) | CONFLICT_FAILURE (Cited 30-day cure) | **SUCCESS** (Cited 15-day SLA override DOC-008 §3.1) | CPDE notwithstanding traversal |

---

## 4. Summary of Empirical Tradeoffs & Verdict

1. **Overall Progress:** Full JC-PAR increased the strictly supported rate from **32.0% to 44.0%**, eliminated 100% of overconfident answers (from 3 cases to 0), and slashed direct legal contradictions by **66.7%** (from 12.0% to 4.0%).
2. **Components Retained:**
   - **ESV:** Fully retained. Zero downsides, significant hallucination reduction.
   - **CPDE:** Retained with recommendation for dynamic window sizing.
   - **JARF:** Retained with joint relevance-authority gating.
3. **Latency Footprint:** End-to-end execution remained sub-millisecond across all configurations (Baseline: 0.54 ms, Full JC-PAR: 0.80 ms), proving that structured algorithmic governance adds negligible runtime cost.
