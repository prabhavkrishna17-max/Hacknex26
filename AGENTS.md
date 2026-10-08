# HackNEX 2026 — Engineering Instructions & Operational Rules

## 1. Hackathon Context & Objectives

- **Event:** HackNEX 2026 (24-Hour Offline Hackathon)
- **Theme:** AI & Emerging Technologies
- **Team:** No Sleep Till Deploy (4 Members)
- **Core Directives:**
  - Maximize MVP working quality, technical depth, real-world utility, reliability, demo quality, and development velocity.
  - Optimize every technical choice for the 24-hour time constraint: simple, bulletproof systems beat complex, fragile architectures every time.
  - Do **not** pre-assume the final stack or problem domain until the official problem statement is released.

---

## 2. Core Engineering Principles

### 2.1 MVP-First & Scoping
- **Deliver the Critical Path First:** Build the core user loop end-to-end before touching secondary features, settings pages, or cosmetic fluff.
- **Simplicity Over Complexity:** Default to the simplest architecture capable of solving the problem. Avoid microservices, distributed architectures, or multi-repo setups unless explicitly required.
- **Preserve Working Code:** Never break a functioning build or working demo to add speculative features. Keep the `main` branch always runnable.
- **Deterministic Logic First:** Use rule-based, deterministic logic, regex, or structured algorithms wherever possible. Use LLMs/AI only where generative, semantic, or perceptual capabilities are genuinely required.

### 2.2 Verification & Quality Standards
- **Verify Every Change:** Never assume code compiles, runs, or produces correct results. Run builds, type checks, linting, or tests after meaningful changes.
- **No Unverified Claims:** Never claim a feature works without executing code, checking logs, or verifying output.
- **Reliable Fallbacks & Error Handling:** Validate all AI/LLM outputs with schemas (e.g. Zod, Pydantic). Handle API timeouts, rate limits, and network errors gracefully with fallbacks or clear UI feedback.
- **Minimize Model Latency & Costs:** Cache repeatable prompts, use efficient token windows, and minimize redundant model invocations.

### 2.3 Security, Secrets & Demo Data
- **Zero Secrets in Code:** Always use environment variables (`.env` backed by `.env.example`). Never hardcode API keys, database credentials, or tokens.
- **Realistic Demo Data:** Use realistic, contextual domain data for mock inputs or seed data. Avoid placeholder gibberish (e.g., "foo", "asdf").
- **Transparency on Data Sources:** Clearly distinguish mock/synthetic demo data internally in code from real live outputs.
- **Truth in Presentation:** Avoid making unsubstantiated claims about accuracy, benchmark metrics, or real-world deployment impact.

### 2.4 User Interface & Presentation
- **Professional, Usable UI:** Prioritize clean layout, intuitive navigation, and high legibility over flashy visual gimmicks. Avoid excessive animations or distracting effects that degrade demo stability.
- **Demo-Hardened UX:** Design the UI so that judging personas can instantly understand what problem is being solved within 15 seconds of interaction.

---

## 3. Git Checkpoint & Version Control Strategy

- **Frequent, Meaningful Commits:** Commit after every functional milestone, passing test suite, or stable feature integration.
- **Pre-Refactor Checkpoints:** Always create a Git commit or checkpoint branch before embarking on any structural refactoring or high-risk architectural change.
- **Atomic Rollbacks:** Keep changes incremental so that any failing experiment can be reverted cleanly in under 60 seconds.

---

## 4. Agent Operational Autonomy & Guardrails

### 4.1 Permitted Autonomous Actions
The AI assistant is instructed to work autonomously on routine engineering tasks without repeatedly requesting confirmation:
- Creating, updating, and structuring source code files within the workspace.
- Installing explicit dependencies after the tech stack is selected.
- Running builds, unit tests, linters, formatters, and development verification commands.
- Diagnosing errors, inspecting logs, and executing iterative fixes.
- Writing tests, configuration files, and documentation.

### 4.2 Strict Guardrails & Prohibitions
Under NO circumstances may the assistant:
1. **Delete the entire project or root directory.**
2. **Modify, inspect, or write to files outside the workspace root (`c:\Prabhav\Hacknex26`).**
3. **Expose, commit, or log credentials, tokens, or private environment variables.**
4. **Intentionally break or delete already verified working functionality.**
5. **Make irreversible destructive changes without explicit user authorization.**
