# GOAT: Guild Swipe Prototype — PDR

## Overview

A fast, web-deployable prototype that fuses Yes, Your Grace (leadership tradeoffs) and Reigns (binary swipe decisions with resource meters) with GOAT’s MMO-guild world, tone, and systemic hooks (IRL Traits, light Morale, optional Affinity). The player, as Guild Master, moderates guild/MMO dilemmas week-by-week via left/right choices. Outcomes adjust meters, character morale, and guild state. Every third week injects a curated “Raid Night Check” event that reads current meters and traits (no simulation system).

Primary target: 5–10 minutes/session, mobile-friendly inputs, desktop/web build.

References: see `GDDv1-1.md` for trait, morale, and terminology; reuse tone and naming.

## Goals

- Small scope: ship in 7–10 days with data-driven content.
- Swipe-speed choices: immediate feedback, visible meter deltas, short text.
- GOAT identity: IRL Traits, Kiss/Curse framing, morale hooks, barks.
- Web deploy: HTML/CSS/TypeScript SPA; minimal assets, fast loads.

## Non-Goals (Prototype)

- No tactical combat UI; dungeon outcomes are simulated rolls.
- No full inventory/gear UI; use simple party “power” rating.
- No complex narrative graph; use linear weeks + random events pool.

## Core Loop (Week-Based)

1) Draw an event card (request/dilemma) with two options.  
2) Player swipes/chooses Left/Right.  
3) Apply resource deltas, morale changes, and trait hooks.  
4) Trigger barks and log entry.  
5) Every 3rd week, inject a “Raid Night Check” event (authored card that reacts to current meters/traits).  
6) Continue until loss (any meter at 0) or week cap reached (prototype win at week 12).

## Resources & Loss Conditions

- Guild Funds: budget for boosts, fees, and recovery. Loss at 0.
- Server Reputation: public standing on the server; affects event weights and rewards. Loss at 0.
- Raid Readiness: abstract “power/availability/comp” of the roster. Loss at 0.
- Morale: pulled from `GDDv1-1.md` thresholds; affects event outcomes and risk.

Prototype loss: any of Guild Funds, Server Reputation, or Raid Readiness hits 0. Soft fail states surface warnings at <20%.

## Systems Integration (GOAT Hooks)

- IRL Traits (Kiss/Curse): 4–6 sample traits influence event outcomes and certain “Raid Night Check” cards.  
  - E.g., Theorycrafter: Choices emphasizing optimization gain small bonuses; band-aid solutions may incur minor penalties later.  
- Morale (lightweight): tracked per-character for authored hooks and barks only (no global threshold rules in prototype).
- Barks: short flavor lines when thresholds are crossed or traits trigger.  
- Affinity (optional): +1% Readiness gain if two specific members “travel” together during contracts.

## Content Scope (Prototype)

- Event cards: 30 total (20 common, 8 uncommon, 2 rare “mini-crisis”). All events relate to MMO players, guild operations, or MMO platform/dev changes.
- Characters: 6 guild members with 1 fixed IRL Trait each. No leveling.
- Contracts: 3 templates (Easy/Medium/Hard) with risk-reward sliders.
- Barks: 5–8 per trait, 10 generic morale/threshold barks.
- Art/UI: simple card frame, icon meters, portrait placeholders.

## Event Card Format (Data-Driven)

JSON-like entry stored in `resources/events`, loaded at start.

```
{
  "id": "loot_drama_01",
  "title": "Loot Council Meltdown",
  "body": "Two DPS claim BiS daggers from last night’s raid.",
  "tags": ["player_drama", "raid_loot"],
  "weights": {"base": 5, "rep_low": +1},
  "left": {
    "label": "Follow logs; award to top parse",
    "effects": {"reputation": -1, "readiness": +1},
    "hooks": [
      {"when": "trait:meta_slave", "effect": {"morale_all": -1}},
      {"when": "trait:theorycrafter", "effect": {"readiness": +1}}
    ]
  },
  "right": {
    "label": "Split tokens; defer BiS",
    "effects": {"funds": -1, "reputation": +1},
    "hooks": [
      {"when": "trait:drama_queen", "effect": {"morale_all": -1}},
      {"when": "morale:<40", "effect": {"readiness": -1}}
    ]
  }
}
```

## Data Schema (Locked)

- File: `resources/events/events.json`
- Event fields:
  - `id`: string, unique
  - `title`: short string (≤50 chars)
  - `body`: short string (≤120 chars)
  - `tags`: array of strings (e.g., `player_drama`, `raid_night_check`)
  - `weights`: `{ base: int, rep_low?: int, rep_high?: int }`
  - `left` / `right`:
    - `label`: short string
    - `effects`: object with keys in `funds|reputation|readiness|morale_all|morale_<charId>` and values −3..+3
    - `hooks`: array of `{ when: string, effect: effects }`
- Conditions DSL (allowed):
  - `trait:<id>` (e.g., `trait:theorycrafter`)
  - `morale:<op><value>` using any member’s morale as the check (e.g., `morale:<40`)
- Notes:
  - UI labels: show `reputation` as “Server Reputation”.
  - No week math or RNG in schema; authored effects only.
  - Full details: see `resources/events/schema.md`.

### Repository Note: Event Data Location

- Authoring location in this repo: `resources/events/events.json` (for review/versioning).
- Runtime in web app: load the same file from `resources/events/events.json` (served statically or copied by bundler).

## MMO Event Categories

- Player Drama: loot disputes, AFK blowups, meter wars, grief reports.
- Raid Logistics: comp gaps, healer burnout, bench rotations, late starts.
- Dev/Server: hotfix nerfs, maintenance extended, server lag, rollback.
- Meta Shifts: patch notes, tier list swaps, emergent strats, exploit fixes.
- Community/PR: streamer review, world chat rumor, recruitment trials.
- Market/Economy: guild bank deficit, consumables spike, boost requests.

## Sample Event Seeds (Swipe Prompts)

- AFK Tank: “Main tank missed pull timer again.” Left: bench 1 week (Readiness -1, Rep +1). Right: warn only (Rep -1, Morale MT -1).
- Patch Nerf: “Your top build got nerfed 8%.” Left: swap comp (Funds -1, Readiness +1). Right: resist change (Rep -1, Morale mixed).
- Server Outage: “Unexpected downtime ruins raid night.” Left: reschedule weekend (Funds -1, Rep +1). Right: push backup content (Readiness -1, Funds +1).
- Parse War: “Two DPS flame each other over meters.” Left: public call-out (Rep -1, Readiness +1). Right: private mediation (Funds -1, Morale +1).
- Boost Request: “Whale offers gold for a carry.” Left: accept (Funds +2, Rep -1). Right: decline (Rep +1, Funds 0).
- Exploit Found: “Cheese strat trivializes boss.” Left: use it pre-hotfix (Readiness +2, Rep -2). Right: avoid (Rep +1, Readiness 0).
- Recruitment Trial: “Healer applicant with mixed logs.” Left: fast-track trial (Readiness +1, Funds -1). Right: require VODs (Rep +1, slower Readiness).
- Streamer Spotlight: “Mid-tier streamer covers your guild.” Left: invite collab (Funds -1, Rep +2). Right: ignore (Rep 0; Drama Queen -Morale).

## Raid Night Check (No Simulation)

- Cadence: inject one `raid_night_check` card every 3rd week.  
- Card behavior: authored effects that may read current `reputation`, `readiness`, and active `trait:*` hooks to modify deltas.  
- Outcomes: apply standard effects only; optional flavor log line summarizing “how raid went” based on chosen option and hooks.  
- No RNG or power calculations in prototype.

## UI/UX

- Layout: portrait or narrow landscape; top meter row; center card; bottom Left/Right buttons.  
- Inputs: swipe/touch, left/right arrow keys, A/D keys, or click buttons.  
- Feedback: animated meter ticks, brief color flashes, toast for trait hooks, running log.  
- Accessibility: color + icon for meter deltas; toggle fast text.

## Roster (Prototype)

- MT Kade — Role: Tank — Trait: Hardcore Permadeather (`hardcore_permadeather`) — Stoic raid dad; threatens to delete if he dies.
- Lina “VODs4Days” — Role: Healer — Trait: Theorycrafter (`theorycrafter`) — Sends spreadsheets at 3 a.m.
- Rix “Critlord” — Role: Melee DPS — Trait: Drama Queen (`drama_queen`) — Performs best when everyone’s watching.
- Nyx “Alt+Tab” — Role: Ranged DPS — Trait: AFK Farmer (`afk_farmer`) — AFK for snacks, top damage on return.
- Vale “TierListTV” — Role: Flex DPS — Trait: Meta Slave (`meta_slave`) — Only uses S-tier builds.
- Mara “Shotcaller” — Role: Support — Trait: Guild Leader (`guild_leader`) — Insists on slot 1 or bust.

Character IDs for morale hooks: `kade`, `lina`, `rix`, `nyx`, `vale`, `mara` (use as `morale_<id>` if needed).
See trait definitions and barks: `resources/traits/traits.md`.

## Trait Hook Cookbook (Prototype)

- Theorycrafter (`theorycrafter`):
  - Tags: `meta_shifts`, `raid_logistics`, `raid_night_check`.
  - Hooks: reward optimization choices (+readiness), penalize band-aids (−reputation) on repeat quick fixes.
  - Example: `{ when: "trait:theorycrafter", effect: { "readiness": +1 } }`.
- Drama Queen (`drama_queen`):
  - Tags: `player_drama`, `community_pr`.
  - Hooks: public call-outs lower morale_all; appeasement raises rep but risks morale dips later.
  - Example: `{ when: "trait:drama_queen", effect: { "morale_all": -1 } }`.
- AFK Farmer (`afk_farmer`):
  - Tags: `player_drama`, `raid_logistics`.
  - Hooks: postponing increases readiness next week; forcing play lowers reputation.
  - Example: `{ when: "trait:afk_farmer", effect: { "readiness": +1 } }`.
- Guild Leader (`guild_leader`):
  - Tags: `raid_night_check`, `raid_logistics`.
  - Hooks: structured plans boost rep; chaotic choices reduce readiness.
  - Example: `{ when: "trait:guild_leader", effect: { "reputation": +1 } }`.
- Meta Slave (`meta_slave`):
  - Tags: `meta_economy`, `meta_shifts`.
  - Hooks: following tier lists boosts readiness but may reduce morale_all on off-meta.
  - Example: `{ when: "trait:meta_slave", effect: { "readiness": +1 } }`.
- Hardcore Permadeather (`hardcore_permadeather`):
  - Tags: `raid_night_check`, `player_drama`.
  - Hooks: high-risk choices can boost rep but reduce morale_all on failure.
  - Example: `{ when: "trait:hardcore_permadeather", effect: { "reputation": +1 } }`.

## Web Architecture Outline

- EventDeck: loads `events.json`, filters by tags/weights, injects `raid_night_check` on weeks % 3 == 0.
- ChoiceResolver: applies effects and hook effects; clamps meters 0–10; appends to session log.
- MeterState: holds `funds`, `reputation`, `readiness`; per-character morale map; save/load to localStorage.
- TraitSystem: evaluates `trait:*` conditions against roster; exposes simple `HasTrait(id)`.
- BarkBus: rate-limited emitter for trait/morale barks; subscribes to ChoiceResolver outcomes.
- UI: meters bar, card panel, left/right buttons, swipe gesture; small toast system for deltas and barks.


## Tech Plan (Web Deploy)

- Stack: TypeScript + Vite + React (or Svelte/Vue).  
- Data: JSON for events, traits, and characters.  
- Architecture (Web):  
  - Systems: `EventDeck`, `ChoiceResolver`, `MeterState`, `TraitSystem`, `BarkBus`.  
  - Views: SPA with component-based UI; fetch static JSON.  
  - Save: localStorage; store meters, week, RNG seed.  
- Build: strip engine features; target <10–15MB initial load; limit audio.

## Acceptance Criteria

- 30 events playable end-to-end with visible meter changes.  
- Loss condition triggers and shows a summary.  
- Inject a `raid_night_check` card every 3 weeks that reacts to meters/traits (no sim).  
- 6 characters with fixed traits altering at least 10% of events.  
- Barks appear on: trait trigger, morale threshold, contract outcome.  
- Web build runs smoothly on desktop + mobile browser; inputs work.

## Test Checklist

- Meter clamping: never exceed [0, 10] in prototype.  
- Event weights adjust with Server Reputation low/high.  
- Hooks: at least one left/right choice uses a trait modifier.  
 - Raid Night cadence: every 3rd week draws from `raid_night_check` tag.  
- Save/Load: refresh preserves state across sessions.  
- Performance: target 60fps on desktop; acceptable on mobile.

## Content Budget (Prototype)

- Events: author 8 player_drama, 8 raid_logistics, 6 dev/server, 6 meta/economy, 2 rare crises.  
- Traits (sample): Theorycrafter, Drama Queen, AFK Farmer, Guild Leader, Meta Slave, Hardcore.  
- Raid Night Check: author 4 specialized cards tagged `raid_night_check` that reference meters/traits.  
- Bark Pool: 10-12 lines per trait (see `resources/barks/trait_barks.json`).

## Production Plan (7–10 days)

- Day 1: meters, state loop, stub UI.  
- Day 2: data loader, choice resolver, logging.  
- Day 3: traits and hooks, bark bus.  
- Day 4: finalize raid night cadence rules, loss flow.  
- Day 5: polish feedback, save/load.  
- Day 6–7: author 30 events + barks, balance.  
- Day 8–10: QA loop, web build tuning, cut risky extras.

## Future Extensions (Post-Prototype)

- Map view with contract selection and event preview.  
- Light roster UI and injury timers.  
- Affinity bonuses and duo events.  
- Tactical combat vignette for key crises.

## Links

- GOAT GDD (systems, traits, morale): `GDDv1-1.md`  
- Event schema (human): `resources/events/schema.md`  
- Event schema (machine): `resources/events/schema.json`  
- Prototype traits pack: `resources/traits/traits.md`  
- Event pack (authoring): `resources/events/events.json`  
- Trait bark pool: `resources/barks/trait_barks.json`

## Changelog

- v0.14: Completely rewrote all events with dramatic WoW-specific scenarios; replaced generic events with realistic guild drama including loot disputes, parse obsession, guild-hopping, officer drama, technical issues, economic problems, and social conflicts; increased event weights and impact values for more meaningful consequences; created authentic decision points that reflect real WoW guild management challenges.
- v0.13: Made UI fully responsive for mobile devices; reduced sizes and spacing for phones (768px breakpoint); optimized resource bars, party roster, event cards, and chat box for smaller screens; maintained swipe mechanics and visual feedback across all screen sizes; improved touch interaction and readability on mobile devices.
- v0.12: Added Reigns-style swipe mechanics; implemented touch and mouse drag support for event cards; added visual feedback with card rotation and opacity changes during swipe; included swipe direction indicators and button scaling; maintained traditional button clicking as alternative input method; enhanced user experience with smooth animations and responsive feedback.
- v0.11: Fixed UI issues and applied darker color palette; morale numbers now anchored to bottom center of roster portraits; event card fixed size (700x460px) to prevent layout shifts; new darker atmospheric color scheme with better contrast; reduced gaps between all sections for tighter layout; improved visual consistency throughout.
- v0.10: Complete UI redesign to match provided layout; resource icons on top with filling flat color bars; party roster moved underneath resource bar with larger portraits; event card redesigned with much larger character portrait (200x200px) and bigger text; chat box moved to bottom with improved styling; removed duplicate roster section; improved visual hierarchy and spacing throughout.
- v0.9: Enhanced events with Reigns-style complexity; added 25+ sophisticated scenarios with multiple trait hooks, conditional effects, and deeper narrative consequences; introduced crisis events (threats to quit, betrayal), psychological events (paranoia, ego, addiction), supernatural events (prophecies, curses, visions), and character arc events (redemption, ascension, fall from grace); implemented higher weight values for dramatic events and multiple trait interactions per choice.
- v0.8: Rewrote all events to be party-based with dynamic member substitution; events now come from specific roster members and directly affect their morale; implemented template system with {member} and {memberId} placeholders; 20 member-specific event types covering drama, requests, conflicts, burnout, performance, attendance, strategy, social issues, gear, alts, voice comms, parse obsession, meta complaints, poaching, breaks, role changes, consumables, schedules, bench requests, and mentoring.
- v0.7: Complete UI redesign to Reigns-style layout with provided color palette; implemented party-based event system where events come from active roster members; added character portraits in event cards; redesigned chat box with WoW-style green text on dark background; moved roster to bottom with mini portraits and morale-colored borders; top resource bar with icons instead of progress bars.
- v0.6: Added win conditions (Survivor: week 25+, Perfectionist: all meters ≥8 for 10 weeks, Legend: reputation=10 for 10 weeks); implemented pseudo chat panel with trait-triggered barks and random chatter; expanded roster to 20 members with random 5 selection per session; improved bar color contrast for readability.
- v0.5: Migrated prototype into YesYourGoatWeb; updated paths and web runtime notes.
- v0.4: Added JSON schema reference and prototype traits pack; linked authoring data location.
- v0.3: Removed simulation; added "Raid Night Check" cadence; locked data schema; added 6-member roster and IDs; morale set to light usage (authored hooks only).
- v0.2: Reframed all content around MMO players and MMO-world events; renamed resources to Guild Funds / Server Reputation / Raid Readiness; added MMO event categories and samples; replaced tax example with loot drama JSON.
- v0.1 (Initial): Added PDR for GOAT Kingdom Swipe Prototype, scoped for a 7–10 day web build.
