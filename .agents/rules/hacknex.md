# HackNEX 2026 Workspace Rules

## 1. 24-Hour Time Management Cadence
- **Hours 00–02 (Sprint Kickoff):** Deconstruct the problem statement, define the Must-Have MVP scope, design system architecture, and establish interface contracts.
- **Hours 02–08 (Core Engine / MVP):** Build the single critical user journey end-to-end (P0 only). No secondary screens or optional enhancements.
- **Hours 08–16 (Integration & UI):** Connect frontend, backend, models, and realistic seed data. Verify working end-to-end flow.
- **Hours 16–20 (Feature Freeze & Polish):** Code freeze on new features. Harden error boundaries, add fallback responses, and eliminate latency bottlenecks.
- **Hours 20–24 (Demo Hardening & Pitch Prep):** Rehearse the live walkthrough, prepare local offline fallbacks, and record a fail-safe backup video.

## 2. Core vs. Optional Boundary
- **P0 (Must-Have):** The single unbroken workflow demonstrating the core innovation. If this fails, the demo fails. Protect this code above all else.
- **P1 (Should-Have):** Usability enhancements that elevate the core experience (e.g., export, history). Implement ONLY after P0 is verified end-to-end.
- **P2 (Nice-to-Have):** Extra integrations, themes, advanced filters. Never start P2 while P0 or P1 has any outstanding bugs or unverified states.

## 3. Demonstrability First
- Build with the 3-minute judging pitch in mind.
- Optimize the user journey for immediate comprehension: input -> processing state -> undeniable impactful output.
- Avoid hidden menus or complex configuration setups during judging presentations.

## 4. Repo Stability & Continuous Verification
- Ensure the codebase remains in a runnable state at all times.
- Run builds, linters, or smoke tests after every feature integration before declaring a task complete.
- When facing bugs under time pressure, prefer simpler, working implementations over complex debugging marathons.
