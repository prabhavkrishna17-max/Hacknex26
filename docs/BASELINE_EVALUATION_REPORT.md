# HNX26EPS01 — Baseline Evaluation Benchmark Report

**Evaluation Date:** October 8, 2026  
**Corpus:** AeroGrid Distributed Telemetry & Grid Ingestion Specification Suite (5 documents, 21 chunks)  
**Test Set:** `data/evaluation/benchmark_qa_testset.json` (16 questions)  
**Pipeline Configuration:** Hybrid RRF Retrieval ($k=60, \text{top\_k}=4$), Metadata-Preserving Chunker, Deterministic Baseline Generator  

---

## 1. Executive Summary

| Metric | Baseline Score | Interpretation / Target |
| :--- | :---: | :--- |
| **Recall@4** | **100.00%** | All required target documents successfully retrieved in top-4. |
| **Mean Groundedness** | **100.00%** | All generated claims strictly supported by cited source chunks. |
| **Unsupported Claim Rate** | **0.00%** | Zero ungrounded factual assertions detected. |
| **Fabricated Citation Rate** | **0.00%** | Zero fabricated chunk IDs or invalid references. |
| **Mean Usefulness Score** | **94.74%** | Strong coverage across answerable, unanswerable, and adversarial samples. |
| **Abstention Accuracy** | **100.00%** | Correctly abstained on all 4 out-of-scope unanswerable questions. |
| **Mean End-to-End Latency** | **0.38 ms** | Sub-millisecond pipeline latency (P90: 0.46 ms). |

---

## 2. Performance by Question Category

| Category | Samples | Recall@4 | Groundedness | Unsupported % | Fabricated Citations % | Usefulness |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Answerable** | 8 | 100.0% | 100.0% | 0.0% | 0.0% | 89.5% |
| **Unanswerable** | 4 | 100.0% | 100.0% | 0.0% | 0.0% | 100.0% |
| **Adversarial** | 4 | 100.0% | 100.0% | 0.0% | 0.0% | 100.0% |

---

## 3. Key Observations & Baseline Limitations

1. **Deterministic Baseline Strength:** The rule-based deterministic synthesizer achieves perfect groundedness on known syntactic extraction patterns and successfully catches adversarial false premises when keywords are present.
2. **Room for Research Intervention:**
   - On complex multi-hop synthesis or unseen semantic reformulations, purely extractive baselines have lower fluency and lack generative flexibility.
   - Live LLMs introduce stochastic hallucination risks that this baseline currently avoids via strict rules.
   - Our upcoming research intervention will focus on preserving this 100% groundedness and zero-fabrication guarantee while introducing full generative reasoning.

---

## 4. Benchmark Artifacts
- **Full Benchmark Results JSON:** [`data/results/baseline_benchmark_results.json`](file:///c:/Prabhav/Hacknex26/data/results/baseline_benchmark_results.json)
- **Test Set Definition:** [`data/evaluation/benchmark_qa_testset.json`](file:///c:/Prabhav/Hacknex26/data/evaluation/benchmark_qa_testset.json)
