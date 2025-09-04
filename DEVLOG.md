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

Recent Updates (v0.9)

- **Reigns-Style Event Complexity**: Enhanced events with sophisticated scenarios:
  - **Crisis Events**: Threats to quit, betrayal revealed, health concerns
  - **Psychological Events**: Paranoia, ego problems, gaming addiction, obsession
  - **Supernatural Events**: Prophecies, curses, visions, rituals, immortality quests
  - **Character Arc Events**: Redemption, ascension, fall from grace, legacy concerns
  - **Multiple Trait Hooks**: Each choice can trigger multiple trait interactions
  - **Higher Stakes**: Dramatic events have higher weight values (6 vs 3-5)
  - **Deeper Consequences**: More complex resource trade-offs and morale impacts

Recent Updates (v0.8)

- **Complete Event Rewrite**: All events now party-based with dynamic member substitution:
  - Events come from specific roster members and directly affect their morale
  - Template system with {member} and {memberId} placeholders
  - 20 member-specific event types covering all aspects of guild life
  - Dynamic event generation based on active roster members
- **Event Categories**: Comprehensive coverage including:
  - Drama, requests, conflicts, burnout, performance issues
  - Attendance, strategy disagreements, social drama, gear requests
  - Alt characters, voice comms, parse obsession, meta complaints
  - Poaching attempts, break requests, role changes, consumables
  - Schedule conflicts, bench requests, mentoring opportunities

Recent Updates (v0.7)

- **Complete UI Redesign**: Reigns-style layout with provided color palette:
  - Top resource bar with icons (💰 Funds, ⭐ Reputation, ⚔️ Readiness) instead of progress bars
  - Center event card with character portrait and dialogue
  - Bottom chat box with WoW-style green text on dark background
  - Bottom roster with mini portraits and morale-colored borders
- **Party-Based Event System**: Events now come from active roster members:
  - Generated dynamically from party members' traits and personalities
  - Character portraits displayed in event cards
  - Direct morale effects on the specific character causing the event
  - Three event types: drama, requests, and conflicts
- **Color Palette**: Applied provided color scheme throughout:
  - Orange (#d7913a), Light Green (#b9db82), Dark Olive (#5f4c0c)
  - Taupe (#a28f65), Lavender (#9484bc), Dark Slate (#364652)
- **Chat Styling**: WoW-style left-aligned green text on dark background with speaker names

Recent Updates (v0.6)

- **Win Conditions**: Added three victory paths:
  - Survivor: Reach week 25+
  - Perfectionist: Maintain all meters ≥8 for 10 consecutive weeks  
  - Legend: Maintain reputation = 10 for 10 consecutive weeks
- **Pseudo Chat Panel**: Added chat UI in roster sidebar showing:
  - Trait-triggered barks attributed to speaking roster members
  - Random chatter every 4-10 seconds (50% chance) using trait barks
  - 30-message history with speaker names and colored text
- **Roster Expansion**: Expanded from 6 to 20 roster members, randomly selecting 5 per session
- **UI Improvements**: Enhanced bar color contrast with bold white text and shadows for better readability
- **Victory Flow**: Added victory detection, celebration banner, and "New Run" reset button

Files Changed (v0.9)

- `web-ts/public/resources/events/events.json`
  - Added 25+ Reigns-style complex events with multiple trait hooks
  - Introduced crisis events (weight 6) with dramatic consequences
  - Added psychological and supernatural event categories
  - Implemented character arc progression events
  - Enhanced trait interactions with multiple hooks per choice
  - Increased complexity of resource trade-offs and morale impacts

Files Changed (v0.8)

- `web-ts/public/resources/events/events.json`
  - Complete rewrite of all events to be party-based
  - Added 20 member-specific event templates with placeholders
  - Implemented {member} and {memberId} substitution system
  - Removed generic events, replaced with character-driven content
- `web-ts/src/App.tsx`
  - Updated generatePartyEvent function to use template system
  - Added dynamic placeholder replacement for member names and IDs
  - Enhanced event generation to use actual event templates
  - Improved fallback system for missing templates
- `gdd.md` & `DEVLOG.md`
  - Updated documentation to reflect v0.8 changes

Files Changed (v0.7)

- `web-ts/src/App.tsx`
  - Complete UI redesign to Reigns-style layout
  - Implemented party-based event generation system
  - Added character portraits to event cards
  - Redesigned chat box with WoW-style green text
  - Moved roster to bottom with mini portraits
  - Applied provided color palette throughout
  - Removed unused state variables and functions
- `gdd.md` & `DEVLOG.md`
  - Updated documentation to reflect v0.7 changes

Files Changed (v0.6)

- `web-ts/src/App.tsx`
  - Added win condition tracking with streak counters
  - Implemented chat state and pushChat helper function
  - Added random chatter timer loop (4-10s intervals)
  - Enhanced bar styling with better contrast
  - Added victory UI with reset functionality
- `web-ts/public/resources/roster.json`
  - Expanded roster from 6 to 20 members with diverse traits
  - Added 10 new characters with existing trait IDs

Next Steps (Planned)

- Hidden content discovery system (rare events, trait combinations)
- Achievement system to guide exploration
- Meta-progression unlocks between playthroughs
- Character backstories and relationship dynamics
- Seasonal content and replayability features
