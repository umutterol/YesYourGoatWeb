# Events JSON Schema (Prototype)

## Purpose
- Defines the authoring format for swipeable event cards used by the Guild Swipe prototype.
- Optimized for readability and quick iteration; validated manually during content reviews.

## Files
- Authoring: `resources/events/events.json`
- Web runtime: `resources/events/events.json` (served statically or copied by bundler)

## Top-Level
- The file is a JSON array of `Event` objects.

## Event Object
- `id`: unique string, lowercase snake case (e.g., `loot_drama_01`).
- `title`: short string (≤ 50 chars).
- `body`: concise description (≤ 120 chars).
- `tags`: array of strings from the allowed set (see Tags).
- `weights`: object
  - `base`: int, default selection weight (1–10; typical 3–6)
  - `rep_low` (optional): int delta to weight when Server Reputation is low
  - `rep_high` (optional): int delta to weight when Server Reputation is high
- `left`: `Choice`
- `right`: `Choice`

## Choice
- `label`: short string (≤ 40 chars)
- `effects`: object with any of the keys below and values in −3..+3
  - `funds`: int
  - `reputation`: int  (UI label: Server Reputation)
  - `readiness`: int
  - `morale_all`: int
  - `morale_<charId>`: int (e.g., `morale_rix`)
- `hooks`: array of `ConditionalEffect` (optional)

## ConditionalEffect
- `when`: string condition using the limited DSL
  - Trait: `trait:<id>` (e.g., `trait:theorycrafter`)
  - Morale threshold: `morale:<op><value>` where `<op>` is one of `<,<=,>,>=,==` and value is 0..100
- `effect`: same shape as `effects` (additive)

## Tags (Allowed)
- `player_drama`
- `raid_logistics`
- `dev_server`
- `meta_shifts`
- `community_pr`
- `meta_economy`
- `raid_loot`
- `raid_night_check`

Additions are allowed if documented in the GDD and used consistently.

## Constraints & Rules
- Both `left` and `right` are required.
- Effects are additive; meters clamp to 0..10 in-game.
- Keep typical deltas to ±1; uncommon ±2; rare crises may reach ±3 once.
- Keep copy punchy; avoid real MMO names (parody only).

## Example
```
{
  "id": "loot_drama_01",
  "title": "Loot Council Meltdown",
  "body": "Two DPS claim BiS daggers from last night’s raid.",
  "tags": ["player_drama", "raid_loot"],
  "weights": {"base": 5, "rep_low": 1},
  "left": {
    "label": "Follow logs; award to top parse",
    "effects": {"reputation": -1, "readiness": 1},
    "hooks": [{"when": "trait:theorycrafter", "effect": {"readiness": 1}}]
  },
  "right": {
    "label": "Split tokens; defer BiS",
    "effects": {"funds": -1, "reputation": 1},
    "hooks": [{"when": "trait:drama_queen", "effect": {"morale_all": -1}}]
  }
}
```

## Validation Checklist
- IDs are unique and snake_case.
- Titles ≤ 50 chars; bodies ≤ 120 chars.
- Only allowed tags present; at least one tag per event.
- Effects keys limited to schema; deltas within −3..+3.
- Hooks use only `trait:*` or `morale:<op><value>`.
- `raid_night_check` entries exist (4+) and appear every 3rd week in rotation.

## Changelog
- v0.1: Initial schema for prototype content.
