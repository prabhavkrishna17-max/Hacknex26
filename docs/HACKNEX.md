# HackNEX 2026 — Workspace Blueprint

## 1. Hackathon Overview
- **Event:** HackNEX 2026 (24-Hour Offline Hackathon)
- **Track / Theme:** AI & Emerging Technologies
- **Team:** No Sleep Till Deploy
- **Team Size:** 4
- **Sprint Goal:** Deliver a production-grade, highly reliable, technically deep MVP optimized for judging impact and live demonstration.

---

## 2. Workspace Architecture & Governance

```text
Hacknex26/
├── .agents/
│   ├── rules/
│   │   └── hacknex.md            # Hackathon pace, P0/P1 scoping, and stability rules
│   └── skills/
│       └── hackathon-builder/
│           └── SKILL.md          # 8-Phase builder workflow for Antigravity
├── docs/
│   ├── HACKNEX.md                # This workspace guide
│   └── PROBLEM_STATEMENT.md     # Dedicated landing zone for the official problem statement
├── .env.example                  # Template for all secrets & configuration
├── .gitignore                    # Cross-stack ignore file (Node, Python, secrets, builds)
└── AGENTS.md                     # Root persistent engineering instructions & autonomy guardrails
```

---

## 3. Engineering Principles & Directives
1. **Vertical-Slice MVP First:** Implement the end-to-end critical path before touching secondary screens or cosmetic features.
2. **Deterministic-First AI:** Use deterministic algorithms wherever possible; deploy LLMs/AI models exclusively for reasoning and semantic transformation.
3. **Continuous Verification:** Every meaningful change must be verified via actual builds, tests, or runtime execution. Never claim working status without evidence.
4. **Resilience & Fallbacks:** Always guard against API rate limits and connection drops with cached fallbacks or simulated offline responses.
5. **Clean Data Hygiene:** Keep real secrets out of git; populate demo interfaces with realistic domain-specific data.

---

## 4. Customization Locations
- **Workspace Rules:** Located at [`.agents/rules/hacknex.md`](file:///c:/Prabhav/Hacknex26/.agents/rules/hacknex.md). Loaded automatically by Antigravity for all operations in this project.
- **Agent Skills:** Located at [`.agents/skills/hackathon-builder/SKILL.md`](file:///c:/Prabhav/Hacknex26/.agents/skills/hackathon-builder/SKILL.md). Provides the structured 8-phase workflow (Understand → Scope → Architecture → Implementation → Integration → Verification → Demo Hardening → Presentation).
- **Persistent Instructions:** Located at [`AGENTS.md`](file:///c:/Prabhav/Hacknex26/AGENTS.md). Root-level instructions governing autonomy, git checkpointing, and technical constraints.

---

## 5. Git Checkpoint Strategy
- **Frequent Atomic Commits:** Commit every functional unit with a conventional commit message (e.g., `feat(api): add parser`, `test: verify pipeline`).
- **Checkpoint Before Refactoring:** When transitioning between phases or undertaking non-trivial refactoring, create a checkpoint:
  ```bash
  git checkout -b checkpoint/<phase-or-feature>
  ```
  or commit the current stable state on `main` before proceeding.
- **Always Keep Main Runnable:** Code on the primary branch should be demo-ready at any given point during the 24 hours.

---

## 6. Problem Statement Ingestion
Once the official problem statement is announced:
1. Paste the full text and rubric into [`docs/PROBLEM_STATEMENT.md`](file:///c:/Prabhav/Hacknex26/docs/PROBLEM_STATEMENT.md).
2. The agent will activate the `hackathon-builder` skill starting with **Phase 1 (Understand)** and **Phase 2 (Scope)**.
3. Architecture and tech stack selection will be decided immediately following the scoping phase.
