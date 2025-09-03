YesYourGoatWeb – Dev Log

This document summarizes the changes and additions made so far to migrate the project to a web-focused setup and to deliver a working web prototype.

Scope Completed

- Web-focused docs and paths
  - Updated references from Unity/Docs paths to local web resources.
  - Switched guidance from Unity runtime to web runtime and static JSON loading.
- Minimal static web prototype
  - Added a zero-dependency prototype under `web/` that loads events and runs the core loop: draw event → choose left/right → apply effects → clamp meters → week progression → loss check (every 3rd week draws a raid_night_check event).
- Deployment-ready data layout
  - Copied event data into `web/resources` and pointed the app to those files so it can deploy on static hosts (e.g., Vercel) without additional build steps.
- Trait hooks, morale, and barks
  - Implemented conditional hooks: `trait:<id>` and `morale:<op><value>` evaluated against a simple roster.
  - Added morale tracking (0..100), supporting `morale_all` and `morale_<charId>` effects.
  - Persist meters, week, and morale to `localStorage`.
  - Show a random bark line when a trait hook triggers.

Files Changed

- `readme.md`
  - Replaced `Docs/YesYourGoat/...` paths with `resources/...` and added web prototype run note.
- `gdd.md`
  - Replaced Unity path references with web equivalents.
  - Adjusted data locations to `resources/events` and web runtime notes.
  - Renamed “Unity Architecture Outline” → “Web Architecture Outline”; save to `localStorage`.
- `resources/events/schema.md`
  - Authoring/runtime paths updated to `resources/events/events.json` (web serving).
- `GDDv1-1.md`
  - Converted “Unity 6+ Implementation Notes” to “Web Implementation Notes”.
  - Replaced ScriptableObject/Scene/PlayerPrefs/UI Toolkit items with JSON/TS modules, SPA routing, LocalStorage/IndexedDB, and web UI patterns.

New Files (Prototype)

- `web/index.html`
  - Basic UI: meters, week, event card with left/right choices.
- `web/style.css`
  - Minimal styling; meter bars reflect value via a CSS var.
- `web/app.js`
  - Core loop, meters clamp, loss conditions.
  - Loads events from `./resources/events/events.json`.
  - Trait hooks: evaluates `trait:*` and `morale:<op><value>`; applies extra effects when matched.
  - Morale: supports `morale_all` and `morale_<charId>`; clamps 0..100; persists in `localStorage`.
  - Barks: loads trait bark lines and displays one when a trait hook fires.
- `web/resources/events/events.json`
  - Copy of `resources/events/events.json` bundled for static deploy.
- `web/resources/roster.json`
  - Sample roster (six members) with `id`, `name`, `traitId`, `morale`.
- `web/resources/barks/trait_barks.json`
  - Trait bark lines for use in the prototype.

Run Locally

- Python 3: `cd web && python -m http.server 5173`
- Open: `http://localhost:5173/`

Deploy (Vercel)

- Set Root Directory to `web` and Framework Preset to “Other”.
- Import the repository and deploy (no build necessary for the static prototype).

Next Steps (Planned)

- Weighted event selection using `weights.base` plus `rep_low` / `rep_high` adjustments.
- Decision log UI: recent choices and deltas recap.
- Optional schema validation (AJV) for `events.json` against `resources/events/schema.json`.
- Mobile polish: swipe gestures and subtle animations; accessibility passes.
