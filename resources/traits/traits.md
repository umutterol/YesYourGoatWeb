# Prototype Traits Pack

## Scope
- Six IRL Traits tuned for the Guild Swipe prototype. Each entry lists the ID, name, kiss/curse framing for authored hooks, common event tags, an example hook, and a few bark lines.

## Traits

### theorycrafter — Theorycrafter
- Kiss: Optimization-first choices grant small Readiness boosts.
- Curse: Band-aid or anti-data choices may nudge Server Reputation down.
- Tags: `meta_shifts`, `raid_logistics`, `raid_night_check`.
- Example Hook: `{ "when": "trait:theorycrafter", "effect": { "readiness": 1 } }`
- Barks:
  - "Check the logs first. Always."
  - "CD windows desync if we stall."
  - "Math says this is free."

### drama_queen — Drama Queen
- Kiss: High-visibility moves can raise Rep; attention fuels performance.
- Curse: Public controversy drains morale across the team.
- Tags: `player_drama`, `community_pr`.
- Example Hook: `{ "when": "trait:drama_queen", "effect": { "morale_all": -1 } }`
- Barks:
  - "Everyone watching? Good."
  - "I soloed it while on fire."
  - "Clip that. No, the other angle."

### afk_farmer — AFK Farmer
- Kiss: Planned downtime yields a bounce-back in Readiness next decision or week.
- Curse: Being forced to play through fatigue dings Server Reputation.
- Tags: `player_drama`, `raid_logistics`.
- Example Hook: `{ "when": "trait:afk_farmer", "effect": { "readiness": 1 } }`
- Barks:
  - "Brb, need snacks."
  - "Back. What did I miss?"
  - "AFK farm pays off in the end."

### guild_leader — Guild Leader
- Kiss: Structured plans and strict execution raise Server Reputation.
- Curse: Chaotic or laissez-faire choices erode Raid Readiness.
- Tags: `raid_night_check`, `raid_logistics`.
- Example Hook: `{ "when": "trait:guild_leader", "effect": { "reputation": 1 } }`
- Barks:
  - "Form up. Slot one follows calls."
  - "Plan > vibes. Every time."
  - "We lead by example."

### meta_slave — Meta Slave
- Kiss: Following the meta yields steady Readiness gains.
- Curse: Off-meta indulgence can lower morale_all for purists.
- Tags: `meta_economy`, `meta_shifts`.
- Example Hook: `{ "when": "trait:meta_slave", "effect": { "readiness": 1 } }`
- Barks:
  - "Tier list says S or bust."
  - "We don't invent the meta, we win with it."
  - "Swap to the build."

### hardcore_permadeather — Hardcore Permadeather
- Kiss: Bold, high-stakes calls slightly boost Rep when they land.
- Curse: Talk of risk spikes team anxiety (small morale_all dips) when pressured.
- Tags: `raid_night_check`, `player_drama`.
- Example Hook: `{ "when": "trait:hardcore_permadeather", "effect": { "reputation": 1 } }`
- Barks:
  - "If I die, delete me."
  - "No safety net. Play clean."
  - "One mistake. One reroll."

## Usage Notes
- Keep hook effects small (±1) to preserve meter readability and decision clarity.
- Prefer tag-driven hooks to keep events portable and maintainable.
- Reuse bark lines sparingly; cap at one bark every three decisions in UI.

## Changelog
- v0.1: Initial six-trait pack for prototype.
