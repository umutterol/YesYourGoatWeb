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

Recent Updates (v0.18)

- **Guaranteed Multi-Step Events**: Ensured every run includes at least one complex narrative:
  - **Priority Weighting**: Multi-step events receive 1000x weight when not yet encountered
  - **State Tracking**: Added hasMultiStepEvent flag to track multi-step event completion
  - **Early Selection**: Multi-step events prioritized early in each run for maximum impact
  - **Run Reset**: Multi-step tracking resets on new run initialization
  - **Reliable Experience**: Every playthrough now guaranteed to include branching narratives
  - **Improved Logic**: Enhanced event selection to ensure multi-step events appear consistently

Recent Updates (v0.17)

- **Multi-Step Events System**: Implemented complex branching event chains:
  - **Guild Bank Scandal**: 4-step investigation with theft, redemption, and surveillance
  - **Raid Leader Crisis**: 3-step leadership transition with multiple candidate paths
  - **Server Transfer Drama**: 2-step decision between expensive/cheap servers or staying
  - **Loot Council Revolution**: 2-step transparency vs corruption investigation
  - **Guild Merger**: 3-step merger negotiations with officer status and team structure
  - **Immediate Effects**: Every step has immediate consequences and resource costs
  - **Branching Paths**: Player choices determine which steps follow
  - **Narrative Depth**: Events create ongoing story arcs with escalating consequences
  - **State Management**: Added pendingMultiStep state and nextStep property to choices

Recent Updates (v0.16)

- **Character Expansion**: Added 15 new characters with realistic names and new portraits:
  - **New Characters**: Alex, Beth, Carl, Dana, Eric, Fiona, Greg, Helen, Ivan, Julia, Kevin, Luna, Mike, Nina, Oscar
  - **Portrait Assignment**: Each new character assigned to unused portraits from the existing `portraits/` folder
  - **Trait Distribution**: Balanced trait assignment across all character types
  - **Roster Size**: Expanded from 20 to 35 total characters for more variety
  - **Name Quality**: Replaced generic names (Meta, AFK, etc.) with proper realistic names
  - **Character Diversity**: Mix of male/female names and various trait combinations

Recent Updates (v0.15)

- **Massive Event Expansion**: Added 50+ additional dramatic WoW guild scenarios:
  - **Server Drama**: Trash-talking other guilds, server forum reputation damage, community conflicts
  - **Serious Issues**: Racism/harassment, stalking, strategy leaks, griefing, exploit usage
  - **Performance Problems**: AFK during raids, refusing to learn mechanics, showing up drunk
  - **Schedule Complications**: Timezone conflicts, school/military/medical issues, childcare, relationships
  - **Loot Corruption**: Loot whoring, council corruption, trading with other guilds, gambling, hoarding
  - **Social Drama**: Cross-guild drama, voice chat toxicity, gossip spreading, bullying
  - **Technical Issues**: Hardware failures, software conflicts, network problems, audio/display issues
  - **Economic Theft**: Guild bank theft, price gouging, service selling, dues refusal
  - **Crisis Scenarios**: 10 different quit threat scenarios covering every major issue
  - **Total Events**: 95+ events covering every aspect of WoW guild management

Recent Updates (v0.14)

- **Dramatic Event Rewrite**: Completely overhauled all events with authentic WoW guild scenarios:
  - **Loot Drama**: Legendary weapon disputes, ninja-looting, loot council favoritism, hoarding
  - **Performance Issues**: Parse obsession, underperforming players, connection problems, spec refusal
  - **Social Conflicts**: Guild-hopping, officer drama, cliques, bullying, chat toxicity, rumors
  - **Technical Problems**: Addon issues, computer crashes, internet problems, voice chat refusal
  - **Economic Drama**: Consumable costs, guild bank abuse, gold loans, resource hoarding
  - **Schedule Conflicts**: Work changes, family emergencies, chronic lateness, raid time disputes
  - **Crisis Events**: Quit threats, betrayal, redemption arcs, officer promotions
  - **Realistic Consequences**: Higher impact values (-20 morale, -3 reputation, -200 funds)
  - **Authentic Choices**: Decisions that reflect real guild management dilemmas

Recent Updates (v0.13)

- **Mobile Responsiveness**: Optimized UI for phones and tablets:
  - **Breakpoint**: 768px responsive breakpoint for mobile vs desktop
  - **Resource Bars**: Smaller bars (35x18px vs 50x25px) and reduced font sizes
  - **Party Roster**: Smaller portraits (60x60px vs 80x80px) and tighter spacing
  - **Event Cards**: 95% width on mobile with smaller character portraits (120x120px vs 200x200px)
  - **Text Sizing**: Responsive font sizes throughout (14px vs 18px for titles)
  - **Button Layout**: Smaller buttons with wrap layout for mobile
  - **Chat Box**: Reduced height (150px vs 200px) and smaller text
  - **Touch Optimization**: Maintained swipe mechanics with mobile-friendly sizing

Recent Updates (v0.12)

- **Reigns-Style Swipe Mechanics**: Added intuitive touch and mouse controls:
  - **Touch Support**: Full touch event handling for mobile devices
  - **Mouse Dragging**: Click and drag support for desktop users
  - **Visual Feedback**: Card rotates and fades during swipe with smooth animations
  - **Swipe Thresholds**: 100px minimum swipe distance to trigger decisions
  - **Direction Indicators**: Arrows on buttons and visual scaling during swipe
  - **Dual Input**: Both swipe and traditional button clicking work simultaneously
  - **Smooth Animations**: 0.3s ease transitions for natural feel

Recent Updates (v0.11)

- **UI Fixes and Darker Palette**: Addressed layout and visual issues:
  - **Morale Positioning**: Numbers now anchored to bottom center of roster portraits with circular badges
  - **Fixed Event Card Size**: 700x460px fixed dimensions prevent layout shifts from varying text length
  - **Darker Color Palette**: New atmospheric scheme with better contrast:
    - Primary: Dark brown (#2c1810), Secondary: Very dark gray (#1a1a1a)
    - Accent: Saddle brown (#8b4513), Highlight: Goldenrod (#daa520)
    - Text: Beige (#f5f5dc), Success: Forest green (#228b22)
  - **Reduced Gaps**: All sections now have 5px margins for tighter, more cohesive layout
  - **Visual Consistency**: Unified color scheme across all UI elements

Recent Updates (v0.10)

- **Complete UI Redesign**: Restructured layout to match provided design:
  - **Top Resource Bar**: Filling flat color bars with resource icons and values
  - **Party Roster**: Moved directly under resource bar with larger portraits (80x80px)
  - **Event Card**: Much larger character portrait (200x200px) with bigger text and buttons
  - **Chat Box**: Moved to bottom with improved styling and larger text
  - **Visual Hierarchy**: Better spacing, larger fonts, improved contrast
  - **Layout Flow**: Resource bar → Party roster → Event card → Chat box

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

Files Changed (v0.18)

- `web-ts/src/App.tsx`
  - Added hasMultiStepEvent state to track multi-step event completion per run
  - Modified drawCard function with priority weighting for multi-step events
  - Multi-step events receive 1000x weight when not yet encountered in current run
  - Updated decide function to mark multi-step events when encountered
  - Enhanced newRun function to reset hasMultiStepEvent flag
  - Guaranteed every run includes at least one complex branching narrative

Files Changed (v0.17)

- `web-ts/public/resources/events/events.json`
  - Added 5 multi-step event chains with 20+ total steps
  - Guild Bank Scandal: 4 steps (investigation → results → redemption/surveillance → final outcome)
  - Raid Leader Crisis: 3 steps (resignation → demands/candidates → leadership struggles)
  - Server Transfer Drama: 2 steps (decision → costs/recruiting challenges)
  - Loot Council Revolution: 2 steps (transparency → favoritism/investigation)
  - Guild Merger: 3 steps (proposal → officer status → team structure)
  - Each step includes immediate effects and resource costs
  - Events branch based on player choices with realistic consequences

- `web-ts/src/App.tsx`
  - Added nextStep property to Choice type for multi-step event support
  - Added pendingMultiStep state to track ongoing event chains
  - Updated drawCard function to handle multi-step event progression
  - Modified decide function to check for nextStep and continue event chains
  - Updated newRun function to reset multi-step state
  - Multi-step events don't advance week counter until chain completes

Files Changed (v0.16)

- `web-ts/public/resources/roster.json`
  - Added 15 new characters with realistic names and new portraits
  - Expanded roster from 20 to 35 total characters
  - New characters: Alex, Beth, Carl, Dana, Eric, Fiona, Greg, Helen, Ivan, Julia, Kevin, Luna, Mike, Nina, Oscar
  - Assigned unused portraits from existing folder (beastmaster.png, blademaster.png, chieftain.png, darkranger.png, deathknight.png, demonhunter.png, dreadlord.png, farseer.png, keeper.png, lich.png, pandarenbrewmaster.png, priestess.png, seawitch.png, shadowhunter.png, warden.png)
  - Balanced trait distribution across all character types
  - Maintained varied morale values (52-69) for realistic character diversity

Files Changed (v0.15)

- `web-ts/public/resources/events/events.json`
  - Added 50+ additional dramatic WoW guild scenarios (total now 95+ events)
  - Expanded drama events with server reputation, racism, stalking, strategy leaks
  - Added performance issues: griefing, exploits, AFK behavior, learning resistance, intoxication
  - Created comprehensive schedule conflicts: timezone, school, military, medical, childcare, relationships
  - Added loot corruption scenarios: whoring, council corruption, trading, gambling, hoarding
  - Expanded social drama: cross-guild conflicts, voice chat toxicity, gossip, bullying
  - Added technical problems: hardware failures, software conflicts, network, audio, display issues
  - Created economic theft events: guild bank theft, price gouging, service selling, dues refusal
  - Added 10 crisis scenarios covering every major quit threat reason
  - Maintained realistic consequences and authentic decision points throughout

Files Changed (v0.14)

- `web-ts/public/resources/events/events.json`
  - Completely rewrote all 41 events with dramatic WoW-specific scenarios
  - Added realistic loot drama events (ninja-looting, legendary disputes, hoarding)
  - Created performance crisis events (parse obsession, underperforming, technical issues)
  - Implemented social conflict events (guild-hopping, officer drama, cliques, bullying)
  - Added economic drama events (consumable costs, guild bank abuse, gold loans)
  - Created schedule conflict events (work changes, family emergencies, lateness)
  - Added crisis events (quit threats, betrayal, redemption, officer promotions)
  - Increased event weights and impact values for more meaningful consequences
  - Removed all generic placeholder events in favor of authentic scenarios

Files Changed (v0.13)

- `web-ts/src/App.tsx`
  - Added responsive breakpoint detection (768px) throughout UI
  - Implemented mobile-specific sizing for all components
  - Reduced resource bar dimensions and font sizes for mobile
  - Made party roster portraits and spacing responsive
  - Created responsive event card with 95% width on mobile
  - Adjusted character portrait sizes and text scaling
  - Optimized button layout and sizing for touch interaction
  - Reduced chat box height and font sizes for mobile
  - Maintained swipe mechanics across all screen sizes

Files Changed (v0.12)

- `web-ts/src/App.tsx`
  - Added swipe state management (swipeStart, swipeOffset, isDragging)
  - Implemented touch and mouse event handlers for drag detection
  - Added global mouse event listeners for smooth dragging experience
  - Enhanced event card with swipe transform, rotation, and opacity effects
  - Added visual feedback with button scaling and direction indicators
  - Included swipe instructions and maintained dual input methods
  - Applied smooth transitions and animations throughout

Files Changed (v0.11)

- `web-ts/src/App.tsx`
  - Fixed morale number positioning to bottom center of roster portraits with circular badges
  - Implemented fixed event card dimensions (700x460px) to prevent layout shifts
  - Applied new darker color palette throughout all UI elements
  - Reduced gaps between sections from 10px to 5px for tighter layout
  - Updated resource bars, party roster, event card, and chat box with new colors
  - Improved visual consistency and atmospheric feel

Files Changed (v0.10)

- `web-ts/src/App.tsx`
  - Complete UI layout restructure to match provided design
  - Resource bar with filling flat color bars instead of simple icons
  - Party roster moved to top section with larger portraits (80x80px)
  - Event card redesigned with much larger character portrait (200x200px)
  - Increased font sizes throughout for better readability
  - Improved button styling with shadows and better contrast
  - Chat box moved to bottom with enhanced styling
  - Removed duplicate roster section from bottom

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

Files Changed (v0.19)

- `web-ts/src/App.tsx`
  - Fixed loss screen bug - loss conditions now properly display victory/loss screen
  - Added loss checking during both decision making and week progression
  - Enhanced game flow with clear feedback when players lose
  - Fixed variable naming conflict in loss detection logic

Next Steps (Planned)

- Hidden content discovery system (rare events, trait combinations)
- Achievement system to guide exploration
- Meta-progression unlocks between playthroughs
- Character backstories and relationship dynamics
- Seasonal content and replayability features
