# GOAT: Guild Collapse Spinoff — Implementation Specification

This specification defines how to pivot the existing **YesYourGoatWeb** prototype into the new **Guild Collapse Spinoff** structure, as discussed. It is written as a developer-facing document, detailed enough to be consumed by AI coding/content agents.

---

## 1. Core Design Shift

- Every run ends in **inevitable guild collapse**, mirroring Reigns' "the king must die."  
- Player goal: **survive as long as possible** before collapse.  
- On collapse, player restarts with a new guild.  
- **Archetypes persist** across runs, but each run re-skins them with different **class identities** (e.g., General may be Warrior, Paladin, or Warden).  
- **Replayability** comes from:
  - Archetype event decks (short guild drama).  
  - Meta Archetype story anchors (big arcs).  
  - Unlocking new archetypes and meta events across collapses.  

---

## 2. Archetype System

### 2.1 Base Archetypes (Always Present)
- **The General** (Tank role)
- **The Witch** (Magic DPS role)
- **The Priest** (Healer role)
- **The Rogue** (Physical DPS role)

Each archetype:
- Has an **event deck of 6–8 events**.
- Events focus on recurring guild drama (loot disputes, aggro drama, healer burnout, DPS ego).  
- Tags: `archetype:<name>` (e.g., `archetype:general`).

### 2.2 Unlockable Archetypes
- **The Merchant** (Economy/Support) → unlock after 3 collapses.
- **The Bard** (Morale/Support) → unlock after healer-related collapse.
- **The Recruiter** (Guild Growth) → unlock after fame-related collapse.
- **The Exile** (Wildcard narrative figure) → unlock after 5+ collapses.

Unlock logic: stored in `localStorage.collapse_count`. When threshold reached, add archetype deck to pool.

### 2.3 Class Skins
- Archetypes re-roll their class each run:
  - General → Warrior / Paladin / Warden
  - Witch → Mage / Arcanist / Druid
  - Priest → Cleric / Bard / Druid
  - Rogue → Rogue / Ranger / Monk
- Class is **cosmetic + flavor text only**. Event decks remain tied to role/archetype.

---

## 3. Meta Archetype System

Meta Archetypes represent the **overarching story beats**. They are guaranteed to appear each run at set intervals.

### 3.1 The Moderator
- Role: Narrator, sarcastic commentator.  
- Appears: Run intro and outro.  
- Optional mid-run comments triggered by collapse warnings.  
- Always reminds player collapse is inevitable.

### 3.2 The Council
- Role: Faceless MMO authority.  
- Appears: Every ~5 cards.  
- Demands minimum **Funds, Reputation, or Readiness** levels.  
- Failure to comply accelerates collapse.  
- Tags: `meta:council`.

### 3.3 The Rival Guildmaster
- Role: Antagonist.  
- Appears: At least once per run (mid-game).  
- Taunts player, claims superiority, may sabotage.  
- Later reveals **they also collapse**.  
- Tags: `meta:rival`.

### 3.4 The Exile (The Leaver)
- Role: Former member who knows the truth.  
- Appears: Rare mid/late game event chain.  
- Reveals across multiple runs that collapse is systemic.  
- Unlocks after collapse_count ≥ 5.  
- Tags: `meta:exile`.

---

## 4. Event System

### 4.1 Event Format (JSON)
Schema remains consistent with current prototype (`events.json`). Required fields:
- `id`: unique string
- `title`: short string (≤50 chars)
- `body`: short string (≤120 chars)
- `tags`: array of strings (archetype/meta)
- `left` / `right`: choice objects
  - `label`: short string
  - `effects`: `{ funds|reputation|readiness|morale_all|morale_<charId> }` (values −3..+3)
  - `nextStep`: optional, for multi-step arcs

### 4.2 Archetype Events
- Each archetype has 3 core story points → 2–3 escalating events each.
- Example: General Leadership Crisis → Step 1 (demand raid lead), Step 2 (DPS resentment), Step 3 (threaten to quit).

### 4.3 Meta Events
- Injected at set cadence:
  - Moderator → start & end.
  - Council → every ~5 cards.
  - Rival → once mid-run.
  - Exile → rare, conditional on unlock.
- Guaranteed injection logic similar to existing `raid_night_check` cadence.

### 4.4 Collapse Events
- When collapse condition triggers, show **thematic collapse event**:
  - Morale collapse → mass exodus event.
  - Reputation collapse → forgotten guild event.
  - Funds collapse → bankrupt guild event.
  - Council failure → charter revoked event.
  - Rival surpasses → mocked into disbanding event.

---

## 5. Game Flow

### 5.1 Run Structure
1. **Intro** (Moderator event)
2. **Early Events** (archetypes)
3. **Council demand** (forced meta event)
4. **Midgame archetype drama**
5. **Rival event**
6. **Late events** (archetypes, escalating)
7. **Possible Exile whisper**
8. **Collapse event**
9. **Outro** (Moderator event)

### 5.2 Restart
- After collapse, reset meters and morale.
- Re-roll class skins for archetypes.
- Add collapse log entry: `Guild #X survived Y weeks. Cause: <reason>.`

---

## 6. Progression & Unlocks

### 6.1 Collapse Counter
- Persist across runs in `localStorage`.
- Increment on every collapse.

### 6.2 Unlock Rules
- Collapse_count ≥ 3 → unlock Merchant archetype.
- Collapse_count ≥ 5 → unlock Exile meta arc.
- Collapse_count ≥ 7 → unlock Bard archetype.
- Collapse_count ≥ 10 → unlock Recruiter archetype.

### 6.3 Guild History Log
- Maintain a list of past guilds: survival length + cause of collapse.
- Accessible via a History screen.

---

## 7. Technical Implementation Notes

### 7.1 Event Deck Handling
- Archetype decks loaded every run.
- Meta events injected at cadence (like `raid_night_check`).
- Collapse events override standard event draw when triggered.

### 7.2 State Management
- Track: `funds`, `reputation`, `readiness` (1–10 scale).  
- Track: per-character morale (1–10).  
- Track: collapse_count (persistent).  
- Track: unlocked_archetypes (persistent array).  

### 7.3 Restart Logic
- On collapse: reset meters, randomize class skins, increment collapse_count, reinitialize decks with unlocked archetypes.

### 7.4 UI Additions
- Collapse screen: cause of failure, Moderator sarcastic line, guild survival summary.
- New Guild screen: show archetypes with re-rolled class skins.
- History screen: list past guilds.

---

## 8. Acceptance Criteria

- **Runs always collapse**; no survival-only wins.
- **Intro/outro events** from Moderator always trigger.
- **Council events** injected at least once per run.
- **Rival event** injected at least once per run.
- **Exile arc** appears after 5+ collapses.
- Collapse causes correct thematic collapse event.
- Collapse_count increments correctly; unlocks fire at thresholds.
- New Guild screen shows archetypes with new class skins.
- Guild history log persists between runs.

---

## 9. Content Budget (Initial Build)

- Archetypes: 4 base × 6 events each = 24 events.
- Meta: 6 Council events, 4 Rival events, 2 Exile events = 12 events.
- Collapse endings: 5 total (morale, funds, reputation, council, rival).  
- Moderator: 4 intro/outro quips.

Total Initial Deck: **~45 events**.

---

## 10. Roadmap

### Phase 1: Archetypes
- Implement event tagging system.
- Author base archetype decks.

### Phase 2: Meta Archetypes
- Implement Council/Rival/Moderator events.
- Add injection cadence.

### Phase 3: Collapse & Restart
- Add collapse events and restart flow.
- Implement collapse log persistence.

### Phase 4: Unlocks
- Implement collapse_count, unlock Merchant.
- Expand with Bard, Recruiter, Exile.

### Phase 5: Polish
- History screen.
- More Moderator lines.
- Additional archetype events.

---

## 11. Dungeon Progression Layer (Legendary Dungeon Goal)

### 11.1 Purpose
Establish a clear **aspirational end goal** for each run: *prepare the guild to attempt the Legendary Dungeon*. The player advances along a visible progress track while juggling archetype drama and meta pressures. Collapse typically occurs before the final milestone, reinforcing the cyclical satire.

### 11.2 Player-Facing Framing
- Run intro (Moderator): “Another guild, another dream — the Legendary Dungeon awaits.”
- UI: Add a horizontal **Journey Track** with milestones (Camp → Approach → Gate → Antechamber → Descent → Boss Door).
- Each milestone is reached after **N events survived** (configurable; default: 3/6/9/12/15/18).

### 11.3 System Behavior
- On reaching a milestone, inject a **Dungeon Milestone Event** (tag: `meta:dungeon_progress`).
- Milestone events apply small effects (±1) and short flavor, may read current meters to branch text.
- Final milestone (Boss Door) is **locked** in early game; later runs may unlock a special attempt (see 11.6).
- Collapse interrupts the journey and is logged with current milestone.

### 11.4 Cadence & Priority
Event draw priority tiers (highest → lowest):
1. **Collapse Overrides** (when a collapse condition is met)
2. **Meta Injections** (Moderator intro/outro, Council cadence, Rival appearance, Exile if unlocked)
3. **Dungeon Milestones** (when threshold reached)
4. **Archetype Deck Events**

### 11.5 Tuning (Defaults)
- Milestone thresholds (events survived): `[3, 6, 9, 12, 15, 18]`.
- Milestone effects should be **low impact** (±1 net across meters) to avoid overshadowing archetypes/meta.
- Council cadence unchanged (every ~5 cards), can coincide with milestone events (draw back-to-back).

### 11.6 Long-Term Meta Unlocks (Optional “True Attempt”)
- After **collapse_count ≥ 7**, unlock a **Boss Door Attempt** chain (2–3 cards) tagged `meta:dungeon_attempt`.
- Attempt checks current meters; generally fails (satire), but yields **unique lore** and a cosmetic reward.
- Exile lines update to acknowledge player reached the door.

### 11.7 Data Requirements
- New tags: `meta:dungeon_progress`, `meta:dungeon_attempt`.
- New milestone config: `journey.milestones` array in code or settings JSON.
- History log entry gains: `milestoneReached` and `eventsSurvived`.

### 11.8 UI Additions
- Journey Track: 6 nodes with labels; fill as player survives events.
- Collapse summary includes: “Journey: Reached **Antechamber (12/18)**.”

### 11.9 Acceptance Criteria (Additions)
- Milestone event triggers precisely at configured thresholds.
- Journey Track updates visually on milestone reach.
- Collapse summary shows highest milestone reached.
- Boss Door Attempt chain appears only when unlocked (collapse_count ≥ 7).

---

**End of Specification**

