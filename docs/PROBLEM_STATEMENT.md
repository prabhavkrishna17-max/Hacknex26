# HackNEX 2026 — Problem Statement: HNX26EPS01

## 1. Problem Statement Overview: HNX26EPS01
- **Track Code:** HNX26EPS01
- **Focus Area:** High-Assurance Grounded Document Intelligence & Question Answering
- **Core Challenge:** Eliminating hallucinated claims and fabricated citations in enterprise/industrial telemetry and regulatory specifications, while ensuring reliable abstention on out-of-scope and adversarial queries.
- **Current Phase:** Research Baseline Establishment (strictly pre-intervention).

## 2. Target Persona & User Journey
- **Persona:** Industrial Grid Operators, Site Reliability Engineers, and Regulatory Auditors.
- **User Journey:** Ingests complex specification corpora; executes precise technical lookups; receives strictly grounded answers with verifiable inline chunk citations; flags ungrounded queries or false premises.

## 3. Evaluation Dimensions
- Retrieval Recall@K
- Groundedness (Claim-level entailment against source chunks)
- Unsupported Claim Rate (Hallucinations)
- Fabricated Citation Rate (Invalid or irrelevant citations)
- Usefulness & Abstention Accuracy
- Execution Latency (Retrieval, Generation, End-to-End)
