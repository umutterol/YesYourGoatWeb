# Feature Specification: UI Rework — Reigns-like Interaction & Flow

**Feature Branch**: `002-rework-the-ui`  
**Created**: 2025-09-29  
**Status**: Draft  
**Input**: User description: "rework the ui make it similar to @https://www.reignsgame.com/reigns functionality."

## Execution Flow (main)
```
1. Parse user description from Input
2. Extract key concepts from description
   → Reigns-like card deck, swipe/drag left-right decisions, minimal chrome, readable meters
3. For unclear aspects → mark with [NEEDS CLARIFICATION]
4. Fill User Scenarios & Testing
5. Generate Functional Requirements
6. Identify Key Entities
7. Run Review Checklist
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Match Reigns-like interaction model: swipeable card with left/right previews, minimal UI chrome, clear resource feedback, immediate loop pacing
- ❌ Do not change core rules: two choices only; effects −3..+3; Funds/⭐/⚔️ only; reveal cadence
- 👥 Tone/identity remain: DM/whisper copy; portraits identify speakers

### Section Requirements
- Mandatory sections completed below

---

## Clarifications

### Session 2025-09-30
- Q: How should swipe commit behave? → A: A (Distance threshold only)

Applied: Commit a choice when the card is dragged beyond a horizontal distance threshold of ≥33% of card width and released. Velocity does not trigger commits by itself.

## User Scenarios & Testing (mandatory)

### Primary User Story
As a player, I see a single large card centered on screen with a speaker portrait and DM/whisper text. Dragging the card left/right previews the choice label and meter deltas; releasing past a threshold commits the choice, applies effects with a brief meter animation, and draws the next card. The top shows three meters with legible changes. Runs take ~5–10 minutes.

### Acceptance Scenarios
1. Given the main view, When I drag left/right ≥ threshold, Then the respective choice fires and the next card slides in smoothly at 60fps.
2. Given keyboard-only access, When I press Left/Right, Then the same choices trigger with visible delta feedback.
3. Given mobile viewport, When I play, Then touch drag interactions feel responsive, targets ≥44px, and text remains readable.
4. Given a decision that adjusts meters, When it resolves, Then I see clear +/− indicators and the meters clamp 0–10.
5. Given one‑shot intros/tutorials, When seen, Then they no longer appear in later runs.

### Edge Cases
- Very short titles/bodies still center well; long bodies wrap without layout shift.
- Portrait load failure shows a fallback avatar.
- Performance: animations remain smooth on mid‑range mobile; bundle size kept under budget.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The game MUST present a single central card with swipe/drag left-right to select, with visible left/right previews before commit (Reigns-like). Commit occurs only when drag distance ≥33% of card width on release (distance threshold; no velocity commit).
- **FR-002**: The UI MUST show three meters (Funds/💰, Reputation/⭐, Readiness/⚔️) at the top with clear delta feedback after each choice.
- **FR-003**: The UI MUST keep interactive targets ≥44px, high contrast, and support keyboard Left/Right and Enter.
- **FR-004**: The card MUST display speaker portrait/name; DM/whisper text; two choices; and respect one‑shot rules.
- **FR-005**: Animations MUST run at 60fps on desktop and feel smooth on mobile; no layout jank on card swap.
- **FR-006**: The loop MUST keep predictable pacing (raid cadence 5th–7th) without blocking animations.
- **FR-007**: The design MUST preserve constitutional constraints (two choices, −3..+3, reveal cadence) and existing selection logic.

### Non-Functional / UX
- Bundle JS gzip <300KB (images excluded); initial TTI <1.5s desktop / <3s mobile.
- Portraits responsive; fallback avatar on error.
- No console errors; CSP-friendly.

### References
- Reigns interaction reference: [Reigns official site](https://www.reignsgame.com/reigns)

### Key Entities
- Visual Card: speaker, portrait, title, body, left/right choices, preview overlays.
- Resource Bar: three meters with delta animations.
- Input Layer: unified gesture → decision (touch/mouse/keyboard).

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
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
- [x] Review checklist passed

---
