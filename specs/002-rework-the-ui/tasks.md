# Tasks: UI Rework — Reigns-inspired React Frontend

**Input**: Design documents from `/specs/002-rework-the-ui/`  
**Prerequisites**: plan.md (present), spec.md (present)

## Execution Flow (main)
```
1. Load plan.md and spec.md
2. Generate tasks by category (TDD order and dependencies)
3. Mark [P] for tasks in different files/no deps
4. Number tasks sequentially
5. Provide parallel examples
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [ ] T001 [P] Add swipe commit threshold config (33%) in `web-ts/src/components/Card/CardPhysics.tsx`
- [ ] T002 [P] Ensure keyboard parity (Left/Right/Enter) handling in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx`

## Phase 3.2: Tests First (TDD)
- [ ] T003 [P] Unit test swipe commit threshold (distance≥33%) in `web-ts/src/components/Card/__tests__/card_swipe.spec.tsx`
- [ ] T004 [P] Unit test left/right preview overlays render deltas in `web-ts/src/components/Card/__tests__/card_preview.spec.tsx`
- [ ] T005 [P] Unit test resource bar delta animation trigger in `web-ts/src/components/ResourceBar/__tests__/delta_anim.spec.tsx`
- [ ] T006 [P] Integration test keyboard fallback triggers choices in `web-ts/src/modes/yesyourgoat/__tests__/keyboard.spec.tsx`

## Phase 3.3: Core Implementation
- [x] T007 Implement distance-threshold commit in `web-ts/src/components/Card/CardPhysics.tsx` (touch+mouse)
- [x] T008 Implement left/right preview overlays showing meter deltas in `web-ts/src/components/Card/Card.tsx`
- [x] T009 Implement resource delta animation after decision in `web-ts/src/components/ResourceBar/ResourceAnimations.tsx`
 - [x] T010 Ensure portrait fallback avatar on error in `web-ts/src/components/Portrait/Portrait.tsx`

## Phase 3.4: Integration
- [ ] T011 Wire selection flow to maintain 60fps (avoid expensive reflows) in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx`
- [ ] T012 Verify raid cadence injection does not conflict with animations in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx`

## Phase 3.5: Polish
- [ ] T013 [P] Mobile sizing audit: 44px targets; text legibility across breakpoints
- [ ] T014 [P] Performance budget check: bundle gzip <300KB; no console errors
- [ ] T015 [P] Update `DEVLOG.md` with UI rework notes and acceptance checks

## Dependencies
- Tests (T003–T006) before implementation (T007–T010)
- T007 blocks T008
- Implementation before integration checks (T011–T012)
- Everything before polish (T013–T015)

## Parallel Example
```
# Run unit tests in parallel once scaffolds exist:
Task: "card_swipe threshold test" [P]
Task: "card_preview overlays test" [P]
Task: "resource delta anim test" [P]
Task: "keyboard fallback test" [P]
```

## Notes
- Preserve constitutional constraints: two choices; −3..+3; cadence 5th–7th; 44px touch targets.
- Keep animations CSS-transform based (translate/rotate/opacity) to avoid layout thrash.

## Phase 3.6: Clean Reigns Shell (Destructive UI Simplification)
- [x] T016 Remove legacy chrome (chat, extra panels) from `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx` leaving only selection+decide API
- [x] T017 Create `web-ts/src/components/Reigns/ReignsCard.tsx` (portrait, title, body, two choices) using current styles
- [x] T018 Create `web-ts/src/components/Reigns/SwipeLayer.tsx` (33% commit + overlay previews) and compose with ReignsCard
- [ ] T019 Create `web-ts/src/components/Reigns/ReignsScreen.tsx` (ResourceBar + SwipeLayer + minimal container)
- [ ] T020 Wire `web-ts/src/main.tsx` to render ReignsScreen only
- [ ] T021 [P] Delete or archive unused UI components (chat, unused panels) and references
- [ ] T022 [P] Update tests to target Reigns components (`__tests__/reigns_*.spec.tsx`)

Dependencies
- T016 before T019–T020
- T017–T018 before T019
- Cleanup (T021) after wiring (T020)
