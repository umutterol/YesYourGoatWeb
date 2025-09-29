<!--
Sync Impact Report
- Version change: none → 1.0.0
- Modified principles: n/a (initial ratification)
- Added sections: Core Principles; Scope & Non‑Goals; Workflow, Validation & Collaboration; Governance
- Removed sections: n/a
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md (reference path to constitution)
  ✅ README.md (no change needed)
  ⚠ docs/run_blueprint.md (ensure arcs added reference this constitution when updated)
- Follow-up TODOs: none
-->

# Guilds of Arcana Terra Constitution

## Core Principles

### I. Two‑Choice Precision (NON‑NEGOTIABLE)
All player interactions are exactly two choices. Each choice must apply bounded effects only in the range −3..+3 to exactly these meters: Funds (💰), Server Reputation (⭐), Raid Readiness (⚔️). No other meters or side systems are allowed without updating this constitution and the validator.

### II. Every Card Changes Something
Every surfaced event must modify at least one meter or persistent memory. Pure flavor is disallowed. Intros/tutorials are one‑shots that, once seen, never reappear. Memory variants must be tied to prior choices and acknowledge the player’s history.

### III. Predictable Cadence, Replay Meta, and Portrait Identity
- Inject `raid_night_check` every 3rd event in a run (authored outcome, not RNG combat).
- Enforce sensible cooldowns for `meta:council` and `meta:rival` so they don’t appear back‑to‑back.
- Portraits must identify speakers on character‑facing events; copy is DM/whisper tone (no external narrator).
- Replay unlocks subtle wrongness (runs ≥3), Devil offers (runs ≥7), and the final reveal (runs ≥9) culminating in the truth: the player is AI #47 inside the “Arcana Terra” simulation.

### IV. Data, Tags, and Schema Are Law
Events are authored as packs in `resources/events/packs/yesyourgoat/*.json` and merged into `web-ts/public/resources/yesyourgoat.events.json`. Each event has a strict unique id, enforced bounds on effects, and required tags:
- `phase:1..5`
- `character:<role>`
- `chain:<role>:<step>` when applicable
- gating via `require:*` (e.g., `require:choice:<id>:left|right`, `require:seen:event:<id>`, `require:run>=N`, meter thresholds)
- meta tags: `raid_night_check`, `meta:council`, `meta:rival`, `meta:collapse`, `meta:lore`
- optional `random_pool:<category>` for filler pools

### V. Quality, Accessibility, and Static Delivery
- UX: mobile‑first; high contrast; 44px touch targets; clear meter deltas; meters clamped to 0–10; full keyboard fallback.
- Performance: initial load <1.5s desktop / <3s mobile; JS bundle <300KB gzipped (images excluded); 60fps interactions; zero console errors; no blocking network calls.
- Security/Privacy: no auth and no PII; use localStorage only for run memory; static assets; CSP‑friendly by default.

## Scope & Non‑Goals
Purpose: small, replayable, readable 5–10 minute runs with clear tradeoffs and a slow‑burn meta reveal.

Non‑Goals (explicitly out of scope):
- No tactical combat UI; no randomized combat simulators.
- No networked accounts or online services.
- No deep inventories/roster simulation systems.
- No new meters/systems or changes to reveal cadence without updating this constitution and the validator.

## Workflow, Validation & Collaboration

### Selection & Gating Logic
1) Inject `raid_night_check` every 3rd event.  
2) Prioritize active `chain:*` steps when eligible.  
3) Route by low meters before drawing from `random_pool`.  
4) Always respect `require:*` gates and one‑shot intros/tutorials.  
5) Persist run memory: `seen.intro`, `seen.event`, `choices`, `chainProgress`.

Phase gates: wrongness content requires run ≥3; Devil content requires run ≥7; reveal requires run ≥9.

### Authoring Rules
- Titles ≤50 chars; bodies ≤120 chars.
- Exactly two choices per event.
- Effects limited to meters in −3..+3; must be explicit.
- Speaker and portrait required on character‑facing cards.
- Copy uses DM/whisper tone; no global narrator voice.
- One‑shot intros/tutorials never reappear within or across runs once seen.
- Memory variants require explicit `require:*` ties to prior choices or seen events.

### Data/Schema Constraints
- Packs live in `resources/events/packs/yesyourgoat/*.json` and are merged to `web-ts/public/resources/yesyourgoat.events.json` during build.
- Strict unique ids; enforced bounds on effects; required and meta tags per Principle IV.
- Random pool categories are supported via `random_pool:*` tags for pacing only.

### Validation/Testing & CI
- Prebuild validator enforces: text lengths, effect bounds, ids uniqueness, required/meta tags, and resolves `require:*` references.
- Unit checks cover gating, chain progression, and memory persistence.
- CI sequence: on merge → validate → `tsc` → `vite` build. PRs must pass validator/build and note affected `phase`/triggers. Update `docs/run_blueprint.md` when adding arcs.

### Acceptance
- New players finish a run in 5–10 minutes and understand meter tradeoffs.
- Intros never repeat once seen.
- Wrongness escalates runs 3–6 → Devil 7–8 → reveal ≥9.
- Memory variants acknowledge choices.
- Ending remains fixed canon (AI #47 revelation and reset in Phase 5).

## Governance
This constitution supersedes conflicting guidance. Amendments require a PR that:
- Proposes the change with rationale and validator impact.
- Updates this document and validator checks as needed.
- Updates affected templates and `docs/run_blueprint.md` when principles alter authoring or cadence.

Versioning policy: semantic versioning.
- MAJOR: backward‑incompatible governance/principle removals or redefinitions.
- MINOR: new principle/section added or materially expanded guidance.
- PATCH: clarifications or non‑semantic refinements.

Compliance: All reviews must verify conformance with principles and non‑negotiables. Any feature introducing new meters/systems or altering reveal cadence MUST update the constitution and validator in the same PR.

**Version**: 1.0.0 | **Ratified**: 2025-09-29 | **Last Amended**: 2025-09-29