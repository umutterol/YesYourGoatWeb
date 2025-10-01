# Event Authoring Guide — Guilds of Arcana Terra

**Canonical reference for writing events. Supersedes all prior authoring docs.**

Aligned with Constitution v1.0.0 and informed by Reigns' proven patterns.

---

## 1. Structure (NON-NEGOTIABLE)

Every event is exactly this JSON shape:

```json
{
  "id": "unique_snake_case_id",
  "title": "≤50 chars",
  "body": "≤120 chars",
  "speaker": "Tank",
  "portrait": "/resources/portraits/mountainking.png",
  "tags": ["phase:1", "character:tank", "require:run>=1"],
  "weights": { "base": 1.0 },
  "left": {
    "label": "≤40 chars",
    "effects": { "funds": -1, "readiness": 1 }
  },
  "right": {
    "label": "≤40 chars",
    "effects": { "reputation": 1 }
  }
}
```

**Required fields:** id, title, body, speaker, portrait, tags, left, right  
**Optional fields:** weights

**Constraints (enforced by validator):**
- Exactly two choices
- Effects only: `funds`, `reputation`, `readiness` (no other keys)
- Effect values: integers −3..+3
- Tags: must include `phase:1..5` and at least one of `character:<role>`, `chain:<role>:<step>`, `raid_night_check`, or `meta:*`

---

## 2. Tone & Voice (DM/Whisper Style)

**Copy is always direct dialog from a character, never narrator:**
- ✅ "We need more potions. Can you spare the funds?"
- ❌ "The healer approaches and asks for potion money."

**MMO-specific, satirical, deadpan:**
- Reference parses, logs, cooldowns, loot, meters, comps, trash packs
- Treat absurd MMO scenarios with complete seriousness
- Humor emerges from treating ridiculous guild ops as life-or-death

**Archetypal voices (examples):**
- **Tank:** commanding, protective, demands respect
- **Healer:** exhausted, martyrdom complex, passive-aggressive
- **DPS:** competitive, parse-obsessed, impatient
- **Support:** helpful chaos, experiments constantly
- **Council Moderator:** bureaucratic, cold, quota-driven
- **Treasurer:** penny-pinching, spreadsheet-obsessed
- **Rival:** mocking, boastful, taunting
- **Game Master:** cryptic, meta-aware, offers with hidden costs

---

## 3. Effects & Balance

**Every card must change something:**
- No pure flavor; at least one meter or memory must shift
- Typical net impact: ±1 or ±2 across all meters
- Crisis cards may reach ±3 but sparingly

**Trade-offs preferred:**
- ✅ `{ "funds": -2, "readiness": 1 }`
- ✅ `{ "reputation": 2, "funds": -1 }`
- ❌ `{ "funds": 3 }` (no downside)

**Effect bounds (validator enforces):**
- Minimum: −3
- Maximum: +3
- Must be integers

---

## 4. Tags & Gating

**Required tags (at least one from each group):**
- Phase: `phase:1`, `phase:2`, `phase:3`, `phase:4`, `phase:5`
- Identity: `character:<role>`, `chain:<role>:<step>`, `raid_night_check`, or `meta:council|rival|collapse|lore`

**Gating tags (optional, use for requirements):**
- `require:run>=N` — only appears on run N or later
- `require:intro:<role>` — requires that role's intro seen
- `require:seen:event:<id>` — requires prior event seen
- `require:choice:<id>:left|right` — requires specific past choice
- `require:meter:funds<=3` or `require:meter:reputation>=7` — meter thresholds
- `require:meta:council` — requires council beat seen this run

**Optional tags:**
- `random_pool:logistics|economy|community` — filler pool category
- `meta:intro` — one-shot character intro (never repeats)
- `tutorial` — one-shot tutorial (never repeats)
- `policy:logs` — marks a specific policy decision for cross-arc triggers

---

## 5. Chaining & Multi-Step Arcs

Use `chain:<role>:<step>` tags for arcs:

```json
// Step 1
{ "id": "arc_compliance_hook_01", "tags": ["phase:3", "chain:compliance:1"], ... }

// Step 2 (requires step 1 complete)
{ "id": "arc_compliance_sweep_02", "tags": ["phase:3", "chain:compliance:2", "require:chain:compliance>=1"], ... }

// Step 3 (requires step 2)
{ "id": "arc_compliance_climax_03", "tags": ["phase:3", "chain:compliance:3", "require:chain:compliance>=2"], ... }
```

**Chain rules:**
- 2–4 steps max per arc
- Escalate tension/stakes with each step
- Final step pays off or collapses the arc

---

## 6. Memory Variants (Choice Callbacks)

Events that react to prior choices:

```json
{
  "id": "healer_gratitude_01",
  "tags": ["phase:2", "character:healer", "require:choice:healer_budget_01:left"],
  "title": "Budget Thanks",
  "body": "You funded my potions. The raid went smoother.",
  ...
}
```

**Rules:**
- Use `require:choice:<eventId>:left|right` to gate
- Reference specific prior event IDs
- Acknowledge the player's history in copy

---

## 7. Cadence & Special Beats

**Raid night check (every 5th–7th event):**
- Tag: `raid_night_check`
- Authored outcome (not RNG combat)
- Example: "Raid tonight. Ready?" → choices affect readiness/rep

**Council (appears ~every 5–7 events, cooldown enforced):**
- Tag: `meta:council`
- Speaker: "Council Moderator" or "Councilor"
- Pressure/quota theme
- Cooldown: won't appear back-to-back

**Rival (once per run, mid-run):**
- Tag: `meta:rival`
- Speaker: "Rival"
- Taunt or sabotage
- Cooldown: won't appear back-to-back

**Collapse:**
- Tag: `meta:collapse`
- Optional: `cause:funds|reputation|readiness` to target specific meter
- Shown when any meter hits 0

---

## 8. Weights & Rarity (Reigns-inspired)

Add `weights` object to tune selection probability:

```json
{
  "weights": { "base": 1.0 }  // default
}
```

**Weight guidelines:**
- Common events: 1.0
- Uncommon: 0.5–0.7
- Rare (Devil, wrongness): 0.2–0.4
- Very rare (reveal): 0.05–0.1

Selection applies soft cooldowns and decay automatically (see constitution FR-011).

---

## 9. Phase Gates & Wrongness Escalation

**Phase 1 (Runs 1–2):** Normal ops; no glitches
- Tag: `phase:1`
- Intros, early asks, raid checks, council/rival intro

**Phase 2 (Runs 3–4):** Subtle wrongness + escalations
- Tag: `phase:2`, `require:run>=3`
- Wrongness seeds: deja vu, memory glitches, repeated DMs
- Escalated asks from Phase 1 roles

**Phase 3 (Runs 5–6):** Deeper arcs
- Tag: `phase:3`, `require:run>=5`
- Multi-step chains: Compliance, Campaign, Ethics, Economy

**Phase 4 (Runs 7–8):** Devil-as-GM
- Tag: `phase:4`, `require:run>=7`
- Pact offers with hidden costs; weight-capped

**Phase 5 (Run ≥9):** Revelation
- Tag: `phase:5`, `require:run>=9`
- AI #47 reveal and reset

---

## 10. Copy Micro-Rules

- **Present tense; active voice**
- **No ellipses spam; no emojis**
- **1–2 sentences max for body**
- **3–5 words max for title**
- **Choice labels are player's internal voice** ("only sane person" tone)

**Examples:**

✅ **Good:**
```json
{
  "title": "Potion Budget Request",
  "body": "We're low on potions. Can you spare 200 gold?",
  "speaker": "Healer",
  "left": { "label": "Fund it", "effects": { "funds": -1, "readiness": 1 } },
  "right": { "label": "They'll manage", "effects": { "reputation": -1 } }
}
```

❌ **Bad (narrator voice):**
```json
{
  "body": "The healer approaches you nervously and requests funding for potions..."
}
```

---

## 11. Validation Checklist (Pre-Commit)

Run `npm run build` in `web-ts/` (validator auto-runs). Check for:

- [ ] No duplicate IDs
- [ ] Title ≤50, body ≤120, labels readable
- [ ] Effects only use allowed keys; values −3..+3
- [ ] Required tags present (`phase`, identity tag)
- [ ] Speaker in canonical list (see validator allowedSpeakers)
- [ ] Portrait path valid
- [ ] `require:*` references existing event IDs or valid conditions
- [ ] Reads like MMO guild satire (not generic fantasy)

---

## 12. Authoring Workflow

1. **Plan the beat** (reference `docs/run_blueprint.md`)
2. **Write JSON** in appropriate pack (`resources/events/packs/yesyourgoat/*.json`)
3. **Run validator:** `cd web-ts && npm run build`
4. **Fix errors** if any
5. **Playtest:** `npm run dev` → http://localhost:5173/
6. **Iterate** based on flow/tone
7. **Commit** when satisfied

---

## 13. File Locations

- **Authoring:** `resources/events/packs/yesyourgoat/*.json`
- **Runtime (merged):** `web-ts/public/resources/events/yesyourgoat.events.json`
- **Validator:** `web-ts/scripts/validate_merge_yesyourgoat.mjs`
- **Flow reference:** `docs/run_blueprint.md`
- **Schema:** `resources/events/schema.md`

---

**End of Authoring Guide**

