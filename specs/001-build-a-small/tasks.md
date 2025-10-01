# Tasks: Guilds of Arcana Terra — YesYourGoat Mode

**Input**: Design documents from `/specs/001-build-a-small/`  
**Prerequisites**: plan.md (present), spec.md (present)

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure (Vite + React + TS; single mode)
2. Load optional design documents:
   → data-model.md: N/A (not generated yet)
   → contracts/: N/A (no backend)
   → research.md: N/A
   → quickstart.md: N/A
3. Generate tasks by category (TDD order and dependencies)
4. Apply task rules: [P] = different files/no deps; tests before implementation
5. Number tasks sequentially (T001, T002...)
6. Create parallel execution examples
7. Write this file
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup
- [x] T001 Ensure validator allowlist contains canonical speakers (incl. “Game Master”) in `web-ts/scripts/validate_merge_yesyourgoat.mjs`
- [x] T002 [P] Confirm prebuild pipeline writes deck to `web-ts/public/resources/events/yesyourgoat.events.json`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
- [ ] T003 [P] Unit test eligibleByRequirements (require:run, seen, choice, meter, meta) in `web-ts/src/utils/__tests__/selection.spec.ts`
- [ ] T004 [P] Unit test one‑shot persistence for intros/tutorials in `web-ts/src/utils/__tests__/persistence.spec.ts`
- [ ] T005 [P] Unit test raid cadence reservation (5th–7th index) in `web-ts/src/utils/__tests__/cadence.spec.ts`
- [ ] T006 [P] Unit test random_pool cooldown/decay (FR‑011) in `web-ts/src/utils/__tests__/random_pool.spec.ts`
- [ ] T007 [P] Integration test selection order (chains → low‑meter → random_pool) in `web-ts/src/utils/__tests__/selection_order.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T008 Implement selection helpers `eligibleByRequirements`, `pickPriorityChain`, `pickByLowMeter`, `pickFromRandomPool` in `web-ts/src/utils/narrativeEvents.ts`
- [x] T009 Implement raid cadence reservation (every 5th–7th) in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx`
- [x] T010 Wire selection order in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx` (chains → low‑meter → random_pool; respect one‑shots)
- [x] T011 Implement random_pool cooldown/decay per FR‑011 in `web-ts/src/utils/narrativeEvents.ts`
- [x] T012 Persist `yyg_seen`, `yyg_choice`, `yyg_meta_seen`, `yyg_chain_progress` in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx`

## Phase 3.4: Integration
- [ ] T013 Add clear meter delta UI feedback in `web-ts/src/components/Card/Card.tsx`
- [ ] T014 Ensure keyboard Left/Right triggers choices in `web-ts/src/modes/yesyourgoat/YesYourGoat.tsx`
- [ ] T015 Enforce portrait rendering and responsive sizing in `web-ts/src/components/Portrait/Portrait.tsx`
- [ ] T016 Add council/rival sensible cooldowns in `web-ts/src/utils/narrativeEvents.ts`

## Phase 3.5: Polish
- [ ] T017 [P] Update `docs/run_blueprint.md` to mark implemented [NEW] beats as added
- [ ] T018 [P] Performance check: bundle gzip <300KB; 60fps card drag; zero console errors
- [ ] T019 [P] CI: Add step `node web-ts/scripts/validate_merge_yesyourgoat.mjs && cd web-ts && tsc -b && vite build`
- [ ] T020 [P] Add failure rules (optional): phase≥2 require speaker; unresolved require:* → fail in CI config

## Dependencies
- Tests (T003–T007) before implementation (T008–T012)
- T008 blocks T011 and T016
- T009 blocks T010
- Implementation before polish (T017–T020)

## Parallel Example
```
# Launch unit tests in parallel once scaffolds exist:
Task: "Unit test eligibleByRequirements in web-ts/src/utils/__tests__/selection.spec.ts" [P]
Task: "Unit test raid cadence 5th–7th in web-ts/src/utils/__tests__/cadence.spec.ts" [P]
Task: "Unit test random_pool cooldown/decay in web-ts/src/utils/__tests__/random_pool.spec.ts" [P]
```

## Notes
- Respect constitution non‑negotiables: two choices only; effects −3..+3; portraits on character‑facing cards; reveal cadence unchanged.
- Use localStorage only; no backend.
- Build using `npm run build` in `web-ts/` (prebuild validator runs automatically).

