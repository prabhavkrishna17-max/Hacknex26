# Hacknex26 — HNX Legal Intelligence

> **“The bar is verifiability, not fluency.”**  
> High-assurance legal document intelligence, evidence-backed notice drafting, and jurisdiction-aware retrieval for HackNEX 2026 (Problem Statement: `HNX26EPS01`).

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.121+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react&logoColor=0A0F1D)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Evaluation](https://img.shields.io/badge/Track-HNX26EPS01-00F0FF.svg)](docs/PROBLEM_STATEMENT.md)

---

## 1. Project Overview & Value Proposition

**HNX Legal Intelligence** is an evidentiary legal reasoning engine built for corporate legal teams, regulatory auditors, and contract specialists. Traditional Large Language Models often output grammatically persuasive yet completely hallucinated legal citations and false contractual claims. 

HNX Legal Intelligence enforces a strict evidentiary standard: **every assertion must be entailed by an explicit, verifiable document chunk**, cross-references and precedence clauses must be mathematically resolved, and the system **must abstain** (`INSUFFICIENT_EVIDENCE`) when source documents do not support a conclusion.

---

## 2. Project Status

- **Status:** Advanced Hackathon MVP / Research Benchmark (HackNEX 2026).
- **Track Code:** `HNX26EPS01` — Agentic Legal Assistant.
- **Evaluation Baseline:** Empirically evaluated with reproducible baseline, stress test, and ablation suites (`run_baseline.py`, `run_stress_test.py`, `run_ablation.py`).

---

## 3. The Core Challenge & Problem Addressed

Modern contracts and regulatory specifications are non-linear dependency graphs:
1. **Carveout Inversion:** A general liability limitation (e.g., Section 8.1) is often subordinated by a carveout (Section 8.3) through language like *"Notwithstanding Section 8.1..."*. Standard vector retrieval frequently surfaces the general rule while omitting the governing carveout due to lexical distance.
2. **Jurisdiction Mismatch:** Standard RAG treats jurisdiction as passive query keywords rather than statutory precedence boundaries, allowing Delaware contract boilerplate to accidentally override mandatory local statutes (e.g., California BPC § 16600).
3. **Fluency vs. Verifiability:** LLMs generate plausible-sounding legal notices even when factual prerequisites are missing from the evidentiary record.

---

## 4. Architectural Innovation: JC-PAR

HNX Legal Intelligence introduces **JC-PAR** (*Jurisdiction-Conditioned Precedence-Aware RAG*), augmenting hybrid retrieval with structured legal governance layers:

```
User Query + Target Jurisdiction + Scoped PDF / Corpus
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Hybrid Retriever (RRF)      │
       │   • BM25 Lexical Ranking      │
       │   • Dense Gemini Embeddings   │
       └───────────────┬───────────────┘
                       │ Top Candidate Chunks
                       ▼
       ┌───────────────────────────────┐
       │ 1. JARF (Jurisdiction Router) │ ──► Boosts canonical schedules (+2.5)
       │    src/interventions/jarf.py   │     Penalizes conflicting statutory text (-2.0)
       └───────────────┬───────────────┘
                       │ De-polluted Candidates
                       ▼
       ┌───────────────────────────────┐
       │ 2. CPDE (Clause Precedence)   │ ──► Traverses "Notwithstanding", "Subject to"
       │    src/interventions/cpde.py   │     Inverted cross-reference graph expansion
       └───────────────┬───────────────┘
                       │ Expanded Evidence Pool
                       ▼
       ┌───────────────────────────────┐
       │ 3. ESV (Sufficiency Verifier) │ ──► Validates claim-level evidentiary support
       │    src/interventions/esv.py   │
       └───────────────┬───────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[State: SUFFICIENT]             [State: INSUFFICIENT / NO_EVIDENCE]
Grounded Legal Synthesis        Calibrated Safe Abstention
• Strict Clause Citations       • Explicit Missing Prerequisite Audit
• Evidentiary Dossier           • Zero Fabricated Hallucinations
```

---

## 5. Implemented Features

- **Document-Scoped PDF Ingestion:** Upload and parse complex PDF contracts (`pypdf`, `src/ingestion/pdf.py`) with metadata preservation, section indexing, and bounding coordinates.
- **Hybrid Reciprocal Rank Fusion (RRF):** Blends BM25 lexical token matching with dense vector representation to capture both exact statutory phrases and semantic intents.
- **Clause Precedence Resolution (CPDE):** Inverted clause locator identifies dependency pointers (*"Subject to Section X"*, *"Notwithstanding Section Y"*) and pulls dependent carveouts into context.
- **Evidence-Backed Notice Drafting:** Generates structured formal legal notices with embedded clause references, evidentiary grounding scores, and jurisdictional headers.
- **Calibrated Safe Abstention:** Explicitly signals when factual prerequisites are missing from the evidentiary dossier instead of inventing answers.
- **Three-Pane Archival UI:** React 19 / Vite workspace with an evidentiary dossier desk, live contract inspection, and legal drafting CTA.

---

## 6. Technology Stack

### Backend
- **Language:** Python 3.11+ / Python 3.13
- **API Framework:** FastAPI (`0.121.3`), Uvicorn (`0.38.0`)
- **LLM & Embeddings:** Google GenAI SDK (`google-genai==2.29.0`)
- **Retrieval & Mathematics:** NumPy (`2.3.1`), Scikit-learn (`1.9.1`)
- **Document Processing:** PyPDF (`6.19.0`), Python-Multipart

### Frontend
- **Framework:** React 19 (`19.2.8`), Vite (`8.3.0`), TypeScript (`~6.0.2`)
- **Motion & Styling:** Framer Motion (`13.4.4`), CSS Modules / Custom Tokens
- **Linting:** Oxlint (`1.81.0`)

---

## 7. Repository Structure

```text
Hacknex26/
├── data/                       # Synthetic evaluation corpora and benchmark contracts
├── docs/                       # Research specifications, ablation data, baseline architecture
│   ├── HACKNEX.md              # Workspace engineering directives
│   ├── PROBLEM_STATEMENT.md    # HNX26EPS01 track requirements
│   ├── JC_PAR_ARCHITECTURE.md  # Detailed algorithm specifications
│   └── PHASE3_ABLATION_RESULTS.md # Empirical ablation results
├── frontend/                   # React 19 + TypeScript lawyer workspace
│   ├── src/                    # Components, state, and API bindings
│   ├── package.json
│   └── vite.config.ts
├── src/                        # Core Python intelligence backend
│   ├── api/                    # FastAPI endpoints (`main.py`, upload, query, draft)
│   ├── core/                   # Document structures, schemas, and config
│   ├── evaluation/             # Synthetic evaluation harnesses and metrics
│   ├── generation/             # Grounded notice generator & prompt contracts
│   ├── ingestion/              # PDF parsing & chunking pipelines
│   ├── interventions/          # JC-PAR components (JARF, CPDE, ESV)
│   ├── retrieval/              # BM25, dense indexing, and hybrid RRF
│   └── pipeline.py             # End-to-end execution pipeline
├── tests/                      # Automated pipeline test cases
├── requirements.txt            # Pinned backend dependencies
├── run_baseline.py             # Baseline evaluation script
├── run_stress_test.py          # Benchmark stress testing
└── run_ablation.py             # JC-PAR ablation validation harness
```

---

## 8. Prerequisites

- Python 3.11 or higher
- Node.js 18.x or higher
- A Google Gemini API key (`GEMINI_API_KEY`) for dense embeddings and grounded synthesis

---

## 9. Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/prabhavkrishna17-max/Hacknex26.git
cd Hacknex26
```

### 2. Backend Environment Setup
```bash
# Create and activate a Python virtual environment
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Populate `.env` with safe credentials:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
PORT=8000
HOST=0.0.0.0
```

### 4. Frontend Setup
```bash
cd frontend
npm install
```

---

## 10. Running the Application

### Start Backend API Server
```bash
# From repository root
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```
API docs available at: `http://localhost:8000/docs`

### Start Frontend Workspace
```bash
cd frontend
npm run dev
```
Navigate to: `http://localhost:5173`

---

## 11. Running Benchmarks & Empirical Evaluations

Run the verified test and evaluation harnesses from the root directory:

```bash
# Run the reproducible baseline benchmark
python run_baseline.py

# Run the adversarial stress-test suite (carveouts & cross-references)
python run_stress_test.py

# Run the JC-PAR ablation study
python run_ablation.py
```

Frontend production build check:
```bash
cd frontend
npm run build
```

---

## 12. Known Limitations

- **Syntactic Precedence Parsing:** CPDE detects explicit cross-reference markers (*"Notwithstanding Section X"*, *"Subject to Section Y"*). Highly informal or non-standard contractual phrasing may require manual verification.
- **Document Scoping:** PDF ingestion processes standard textual and selectable PDFs; scanned rasterized contracts require an upstream OCR pipeline.
- **Statutory Authority Schedule:** Jurisdictional statutory boosts are currently calibrated for major common-law and regulatory jurisdictions (`US-CAL`, `US-DEL`, `UK-ENG`, `EU-GDPR`, `SG`).

---

## 13. Security, Privacy & Legal Disclaimers

> **IMPORTANT LEGAL NOTICE:**  
> HNX Legal Intelligence is an experimental evidentiary analysis and research prototype developed for the HackNEX 2026 hackathon. It is designed to assist licensed attorneys and legal professionals in document indexing and citation verification. **It does not constitute legal advice and does not create an attorney-client relationship.** Automated outputs must always be reviewed by qualified legal counsel.

---

## 14. Contributors & Credits

- **Prabhav Krishna R** ([@prabhavkrishna17-max](https://github.com/prabhavkrishna17-max)) — System architecture, JC-PAR interventions, evaluation pipelines, frontend UI.
- **Dev Harshith S** ([@devharshith142](https://github.com/devharshith142)) — Collaborative hackathon setup and engineering support.

---

## 15. Useful Links

- [Track HNX26EPS01 Problem Statement](docs/PROBLEM_STATEMENT.md)
- [JC-PAR Architecture Specification](docs/JC_PAR_ARCHITECTURE.md)
- [Empirical Ablation Report](docs/PHASE3_ABLATION_RESULTS.md)
