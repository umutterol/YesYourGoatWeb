# Feature Specification: Guilds of Arcana Terra — YesYourGoat Mode

**Feature Branch**: `001-build-a-small`  
**Created**: 2025-09-29  
**Status**: Draft  
**Input**: User description: "Build a small, replayable, Reigns-style web game where the player is a newly appointed MMO guild master making two‑choice decisions that affect three meters (Funds, Reputation, Readiness). The experience uses satirical, grounded DM/whisper dialog that feels like real guild ops, gradually revealing (over multiple failed runs) that the player is AI #47 inside an “Arcana Terra” simulation."

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A casual player opens the game on mobile, is immediately placed as the Guild Master, and makes a series of two‑choice decisions presented as DMs/whispers from characters with portraits. Each decision changes Funds (💰), Server Reputation (⭐), or Raid Readiness (⚔️) within −3..+3. After several events (including periodic raid‑night checks), the run ends when any meter hits 0 or the player reaches the end of the authored sequence, showing a summary and hint. On subsequent runs, subtle wrongness appears (runs ≥3), Devil‑as‑GM offers appear (runs ≥7), and a final revelation triggers (run ≥9) that the player is AI #47 inside the Arcana Terra simulation.

### Acceptance Scenarios
1. **Given** a new profile with no prior runs, **When** the player completes a run in ~5–10 minutes, **Then** the UI shows a result summary, increments run count, and intros/tutorials do not repeat in future runs.
2. **Given** a returning player with run count ≥3, **When** eligible events are selected, **Then** subtle wrongness events can appear while respecting gating and cooldowns.
3. **Given** a player with run count ≥7, **When** Devil‑as‑GM content is eligible, **Then** at least one pact‑related event can surface during the run subject to rarity and cooldown.
4. **Given** a player with run count ≥9, **When** the run reaches the reveal trigger, **Then** the revelation overlay appears and the game resets to “new GM” tone on the next run.
5. **Given** any event with two choices and meter effects, **When** the player chooses left or right, **Then** only Funds/Reputation/Readiness change, values are clamped 0–10, and deltas are within −3..+3.

### Edge Cases
- Loss on early events: If a meter hits 0 before the first `raid_night_check`, show a concise loss summary with a hint tied to the collapse cause.
- One‑shots already seen: Intros/tutorials never resurface even after clearing localStorage of other keys.
- Conflicting gates: If multiple chains are eligible, prioritize active chain steps; otherwise route by low meter matrix; otherwise random_pool with cooldown.
- Performance constraints: Initial load stays within targets on mobile networks; no blocking network calls.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST present two‑choice cards with DM/whisper copy and a speaker portrait for character‑facing events.
- **FR-002**: The system MUST adjust only Funds, Reputation, and Readiness by integer deltas in −3..+3 and clamp each meter to 0–10 after each decision.
- **FR-003**: The system MUST inject a `raid_night_check` on a predictable cadence (every 5th to 7th event, per current constitution) and enforce sensible cooldowns for council/rival beats.
- **FR-004**: The system MUST gate content by run phases: Phase 1 (Runs 1–2), Phase 2 (Runs 3–4), Phase 3 (Runs 5–6), Phase 4 (Runs 7–8), Phase 5 (Run ≥9).
- **FR-005**: The system MUST persist `yyg_seen`, `yyg_choice`, `yyg_meta_seen`, and `yyg_chain_progress` in localStorage and respect one‑shot intros/tutorials.
- **FR-006**: The system MUST select events in this order: active chains → low meter routing (matrix) → random_pool with cooldown, while always injecting the raid cadence as above and respecting `require:*` tags.
- **FR-007**: The system MUST load content from validated JSON packs merged into a single runtime file; JSON MUST contain no business logic.
- **FR-008**: The system MUST be mobile‑first, high contrast, 44px targets, keyboard fallback, and display clear meter deltas.
- **FR-009**: The system MUST show a final revelation overlay on run ≥9 and reset the player tone to “new GM” after the reveal.
- **FR-010**: The system MUST keep the ending fixed canon and not introduce new meters/systems without constitutional and validator updates.

*Ambiguities explicitly marked:*
- **FR-011**: Random pool selection MUST use soft cooldowns and decay weights to balance novelty and pacing:
  - Base category weights: `random:logistics=1.0`, `random:economy=1.0`, `random:community=1.0` (equal by default).
  - Per-event soft cooldown: recently drawn events get `cooldown=3` runs where weight=0; after cooldown, weight resumes at 0.5 and linearly returns to 1.0 by run +6.
  - Repetition decay: events seen ≥2 times in the same run have weight=0 for the remainder of that run.
  - Chain/priority override: if any chain step is eligible, skip random_pool entirely (priority wins).
  - Low-meter routing override: if any meter ≤3, prefer the matching matrix over random_pool.
  - Raid cadence protection: if an index is reserved for `raid_night_check` (every 5th–7th), do not fill with random_pool.
  - Diversity bias: when multiple categories are tied, prefer the category not used in the last pick.
- **FR-012**: Exact list of canonical speakers beyond those in run blueprint [NEEDS CLARIFICATION: add "Game Master" to allowed speakers or map to an existing role].

### Key Entities *(include if feature involves data)*
- **Event**: id (unique), title (≤50), body (≤120), speaker, portrait, tags (`phase`, `character:<role>`, optional `chain:<role>:<step>`, `require:*`, meta tags), effects (funds|reputation|readiness in −3..+3), optional `random_pool:*`.
- **Run Memory**: runCount, seen.intro, seen.event, choices, chainProgress, metaSeen, lastRaidIndex.
- **Meters**: funds, reputation, readiness (0–10 clamped).

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (FR-012 pending canonical speakers list)
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
