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
- Raid Readiness: abstract "power/availability/comp" of the roster. Loss at 0.

**Loss Conditions:**
- Any meter (Funds, Reputation, Readiness) hits 0
- Soft fail states surface warnings at <20% for meters


## Systems Integration (GOAT Hooks)

- IRL Traits (Kiss/Curse): 4–6 sample traits influence event outcomes and certain "Raid Night Check" cards.  
  - E.g., Theorycrafter: Choices emphasizing optimization gain small bonuses; band-aid solutions may incur minor penalties later.  
- Affinity (optional): +1% Readiness gain if two specific members "travel" together during contracts.

## Content Scope (Prototype)

- Event cards: 30 total (20 common, 8 uncommon, 2 rare "mini-crisis"). All events relate to MMO players, guild operations, or MMO platform/dev changes.
- Contracts: 3 templates (Easy/Medium/Hard) with risk-reward sliders.
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
    "effects": {"reputation": -1, "readiness": +1}
  },
  "right": {
    "label": "Split tokens; defer BiS",
    "effects": {"funds": -1, "reputation": +1}
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
    - `effects`: object with keys in `funds|reputation|readiness` and values −3..+3
- Notes:
  - UI labels: show `reputation` as "Server Reputation".
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

## Worldbuilding (Races & Cultures)

- Ogrrynn Empire (Orcs): Highly civilized imperial orcs inspired by the Roman Empire. Urban high society, disciplined legions, bureaucratic prowess. Speech tends to be formal, legalistic, and proud; motifs of eagles, laurels, marble, and red-gold standards.
- Dwarven Sultanate: Desert-dwelling dwarves inspired by Ottoman/Persian courts. They tunneled under the sands to escape heat and discovered vast oil reserves. Culture blends artisan guilds with courtly titles; aesthetics of filigree brass, lapis, and oilpunk contraptions (pumps, automata, boilers).
- Elves (Jungle Tribes): Tribal, brutal civilizations inspired by Aztec/Inca traditions. Ritualistic, honor-bound, and fearsome. Language is direct, ceremonial; motifs of obsidian, jade, stepped pyramids, blood-red dyes, deep-canopy forests.
- Humans: Baseline “old empire” humans; adaptable, pragmatic, and administratively competent but culturally unremarkable compared to the others. Useful as a neutral foil for cross-cultural events.

Authoring Guidance
- Flavor lines and portraits should reflect speaker culture where relevant (titles, metaphors, materials).
- Avoid parody; ground dilemmas in socioeconomic, military, or spiritual pressures consistent with each culture.
- Cross-guild drama can include cultural friction; keep choices concise and respectful.

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

- **Reigns-Style Layout**: Top resource bar with fill dots, center event card with embedded character portrait, bottom roster display
- **Resource Display**: Horizontal icons (💰⭐⚔️) with 10-dot fill indicators above each icon based on resource levels (1-10 scale)
- **Event Card Design**: Large event text at top, embedded character portrait with dynamic saturation effects, no visible choice buttons
- **Character Portraits**: Dynamic vertical gradient saturation based on morale - low morale shows desaturation from bottom to top
- **Swipe Mechanics**: Touch and mouse drag support with visual feedback, choice previews during swipe, directional indicators
- **Inputs**: Swipe/touch, left/right arrow keys, A/D keys, or click buttons
- **Feedback**: Animated meter ticks, character portrait effects, choice previews, running log
- **Accessibility**: Color + icon for meter deltas, visual saturation effects for character state



## Web Architecture Outline

- EventDeck: loads `events.json`, filters by tags/weights, injects `raid_night_check` on weeks % 3 == 0.
- ChoiceResolver: applies effects; clamps meters 0–10; appends to session log.
- MeterState: holds `funds`, `reputation`, `readiness`; save/load to localStorage.
- UI: meters bar, card panel, left/right buttons, swipe gesture; small toast system for deltas.

### YesYourGoat Mode (Collapse Run)
- Route: `/yesyourgoat` (client-side routed in `web-ts`)
- Cadence: Moderator intro/outro, Council every ~5 events, Rival at least once mid-run, Journey milestones at events survived [3,6,9,12,15,18]
- Collapse Override: on any meter hitting 0, draw a matching `meta:collapse` event by `cause:*`
- Persistence: `yyg_collapse_count`, `yyg_history` in `localStorage`
- Event Source: `public/resources/events/yesyourgoat.events.json` generated via prebuild validator/merge
- Authoring Rules: enforced by `spinoff_authoring_guide.md` (two choices; effects keys funds|reputation|readiness|morale_*; values −3..+3; required tags)

#### Conversational Authoring (Reigns-like)
- Each event should read like a dialog: a single `speaker` addresses the Guildmaster; choices are short replies.
- Optional `portrait` string points to an image under `public/resources/portraits/`.
- Validator: recommends `speaker` for all non-collapse/non-runmeta events; warns if missing (non-blocking), enforces `portrait` type when present.
- UI: YesYourGoat card displays `speaker` and `portrait` above title; choices remain concise.
- **Player Response Tone**: All choice labels use "only sane person in the building" personality - exasperated, world-weary, and slightly condescending responses that make the player feel like the only rational person managing chaotic guild members.

Example (schema addition):
```
{
  "id": "council_audit_01",
  "title": "Surprise Audit",
  "speaker": "Treasurer",
  "portrait": "/resources/portraits/archmage.png",
  "body": "Your ledgers are… thin. Shall we settle the fees now, Guildmaster?",
  "tags": ["meta:council"],
  "left": {"label": "Pay up.", "effects": {"funds": -2}},
  "right": {"label": "Stall for time.", "effects": {"reputation": -2}}
}
```

### Tooling
- Tailwind CSS adopted in `web-ts` (utility-first styling)
- Prebuild validator+merge script at `web-ts/scripts/validate_merge_yesyourgoat.mjs` merges packs from `web-ts/resources/events/packs/yesyourgoat/*.json` to runtime file


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

- v0.25: **Complete Event System Overhaul**: Full rewrite of all 91 events according to authoring guide standards; removed morale system and simplified to 3-resource system (Funds/Reputation/Readiness); updated all speakers to canonical roster; implemented Reigns-style satirical deadpan tone with MMO-specific humor; added "only sane person in the building" personality to all player response choices; eliminated all morale_all references; ensured proper archetypal voices and moral ambiguity throughout.
- v0.21: **Reigns-Style UI Implementation**: Complete UI redesign to match Reigns game aesthetic; implemented horizontal resource bar with 10-dot fill indicators above icons; restructured event card with text on top and embedded character portraits; enhanced swipe mechanics with choice previews and directional indicators; improved visual feedback and animations throughout; maintained responsive design for mobile and desktop.
- v0.19: Fixed critical loss screen bug - loss conditions now properly display victory/loss screen instead of silently ending the game; added loss checking during both decision making and week progression; enhanced game flow with clear feedback when players lose; fixed variable naming conflict in loss detection logic.
- v0.15: Massively expanded event library with 50+ additional dramatic scenarios; added comprehensive coverage of WoW guild drama including server reputation issues, racism/harassment, stalking, strategy leaks, griefing, exploits, AFK behavior, learning resistance, intoxication, timezone conflicts, school/military/medical issues, loot corruption, gambling, hoarding, voice chat drama, hardware problems, economic theft, and multiple crisis scenarios; created 95+ total events covering every aspect of guild management with realistic consequences and authentic decision points.
- v0.14: Completely rewrote all events with dramatic WoW-specific scenarios; replaced generic events with realistic guild drama including loot disputes, parse obsession, guild-hopping, officer drama, technical issues, economic problems, and social conflicts; increased event weights and impact values for more meaningful consequences; created authentic decision points that reflect real WoW guild management challenges.
- v0.13: Made UI fully responsive for mobile devices; reduced sizes and spacing for phones (768px breakpoint); optimized resource bars, party roster, event cards, and chat box for smaller screens; maintained swipe mechanics and visual feedback across all screen sizes; improved touch interaction and readability on mobile devices.
- v0.12: Added Reigns-style swipe mechanics; implemented touch and mouse drag support for event cards; added visual feedback with card rotation and opacity changes during swipe; included swipe direction indicators and button scaling; maintained traditional button clicking as alternative input method; enhanced user experience with smooth animations and responsive feedback.
- v0.11: Fixed UI issues and applied darker color palette; event card fixed size (700x460px) to prevent layout shifts; new darker atmospheric color scheme with better contrast; reduced gaps between all sections for tighter layout; improved visual consistency throughout.
- v0.10: Complete UI redesign to match provided layout; resource icons on top with filling flat color bars; event card redesigned with much larger character portrait (200x200px) and bigger text; improved visual hierarchy and spacing throughout.
- v0.5: Migrated prototype into YesYourGoatWeb; updated paths and web runtime notes.
- v0.4: Added JSON schema reference and prototype traits pack; linked authoring data location.
- v0.3: Removed simulation; added "Raid Night Check" cadence; locked data schema.
- v0.2: Reframed all content around MMO players and MMO-world events; renamed resources to Guild Funds / Server Reputation / Raid Readiness; added MMO event categories and samples; replaced tax example with loot drama JSON.
- v0.1 (Initial): Added PDR for GOAT Kingdom Swipe Prototype, scoped for a 7–10 day web build.
