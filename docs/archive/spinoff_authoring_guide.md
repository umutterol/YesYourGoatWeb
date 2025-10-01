# Authoring Guide for AI Agents — GOAT: Guild Collapse Spinoff

This document defines **strict guidelines** for generating content (events, meta beats, barks) consistent with the **Guild Collapse** design. Follow precisely.

---

## 1) Tone & Theme
- **Satirical MMO guild management.** Wry, concise, never purple.  
- **Reigns-like brevity.** Title ≤ 50 chars, body ≤ 120 chars.  
- **Two choices only.** Left/Right with short labels (≤ 28 chars).  
- **Every choice affects systems.** Use 1–10 scale deltas only (−3..+3).  
- **Collapse is inevitable.** Text should hint at pressure and entropy.

### Do
- Use specific MMOisms (parses, comps, cooldowns, logs).
- Keep humor dry and grounded in guild life.
- Tie flavor to mechanics (why this costs rep/funds/readiness).

### Don’t
- Don’t write long exposition or lore dumps.
- Don’t introduce new systems beyond Funds/Reputation/Readiness/Morale.
- Don’t exceed effect bounds (−3..+3) or use RNG in JSON.

---

## 2) Event Taxonomy & Tags
- **Archetype events:** `archetype:general|witch|priest|rogue|merchant|bard|recruiter`  
- **Meta events:** `meta:moderator|council|rival|exile|dungeon_progress|dungeon_attempt|collapse`  
- **Run framing:** `run:intro`, `run:outro`  
- **Collapse cause:** `cause:morale|funds|reputation|council|rival`

Each event **must** include at least one archetype or meta tag.

---

## 3) JSON Event Shape (Required)
```
{
  "id": "string_unique",
  "title": "≤50 chars",
  "body": "≤120 chars",
  "tags": ["archetype:general"],
  "left": {"label": "≤28 chars", "effects": {"readiness": +1}},
  "right": {"label": "≤28 chars", "effects": {"reputation": -1}},
  "nextStep": "optional_id" // only for chained arcs
}
```
- **Effects keys:** `funds`, `reputation`, `readiness`, `morale_all`, `morale_<charId>`.
- Values **must** be integers within **−3..+3**.
- Use `nextStep` to create 2–3 beat chains; do **not** advance week until chain ends if required by design.

---

## 4) Archetype Story Points (Use as Seeds)
**General (Tank):** raid lead demands, aggro drama, defensive loot priority.
**Witch (Magic DPS):** risky rituals, collateral AoE, forbidden tomes.
**Priest (Healer):** burnout, supply budgets, martyr plays.
**Rogue (Phys DPS):** loot theft, meter obsession, speedrun skips.
**Merchant (Economy):** private stash, selling loot, guild tax. (Unlocked ≥3 collapses)
**Bard (Morale):** hype vs honesty, anthem requests, burnout cover. (Unlocked ≥7)
**Recruiter (Growth):** trial spam, standards vs numbers, poaching. (Unlocked ≥10)

---

## 5) Meta Beats (Cadence)
- **Moderator:** mandatory at run start/end.  
- **Council:** appears **~every 5 events** with quotas; failing stacks pressure.  
- **Rival:** at least **once mid-run**, taunt or sabotage.  
- **Exile:** rare whisper chain, unlocked ≥5 collapses.  
- **Dungeon Progress:** inject milestone cards on thresholds (default events survived: 3,6,9,12,15,18).  
- **Dungeon Attempt:** special chain unlocked ≥7 collapses.

---

## 6) Effects & Balancing Rules
- **Keep totals small.** Typical card net impact is ±1 or ±2 across meters.  
- **Crisis cards** may reach ±3 but not every card.  
- **Morale usage:** prefer `morale_all` unless the event names a specific member (then `morale_<id>`).  
- **No instant wins.** Cards should never set all meters to safe ranges.

---

## 7) Copy Rules (Micro-Style)
- Present tense; active voice.  
- Avoid proper nouns unless roster-provided.  
- No ellipses spamming; no emojis.  
- Flavor first sentence, consequence implied by choice labels.

**Examples (Good):**
- Title: *Healer’s Threat* — Body: *“I could just stop trying.”*  
- Left: *Reassure in public* → `{"reputation": +1}`  
- Right: *Dismiss privately* → `{"readiness": -1}`

---

## 8) Validation Checklist (Agents Must Enforce)
- [ ] IDs unique, kebab_or_snake case.  
- [ ] Title/body within limits.  
- [ ] Exactly two choices.  
- [ ] Effects only from allowed keys; values −3..+3.  
- [ ] At least one required tag present.  
- [ ] Chains reference valid `nextStep` IDs.  
- [ ] No RNG, no timers in JSON.  
- [ ] Reads like MMO guild satire; no generic medieval filler.

---

## 9) Test Flow (Manual QA Script)
1. Start a run → confirm Moderator intro.  
2. Survive 3 events → milestone card appears; Journey Track updates.  
3. Play 5 events → Council quota triggers.  
4. Encounter at least one event from each base archetype.  
5. Force a collapse cause (funds/reputation/readiness) → correct collapse event shows; History logs milestone.  
6. Restart → class skins re-roll; collapse_count increments.  
7. After 3 collapses → Merchant events begin to appear.

---

## 10) File & Folder Conventions
- Event data: `resources/events/events.json` (merged by build scripts).  
- Trait/roster (if used): existing locations unchanged.  
- Author new decks into `resources/events/packs/` and run merge step.

---

**End of Authoring Guide**

