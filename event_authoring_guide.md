# Event Authoring Guide – GOAT: Guild Collapse Spinoff (Reigns Style)

This guide defines strict rules for writing Reigns-style events in the **Guild Collapse Spinoff**. It is intended for AI agents and human designers to follow exactly.

---

## 1. Structure

Every event is one JSON object:
```
{
  "id": "unique_snake_case_id",
  "title": "≤50 chars",
  "body": "≤120 chars",
  "tags": ["archetype:general"],
  "left": {"label": "≤28 chars", "effects": {"funds": -1, "readiness": +1}},
  "right": {"label": "≤28 chars", "effects": {"reputation": +1}},
  "nextStep": "optional_id" // only if chaining multi-step arcs
}
```

**Constraints:**
- Title = 3–5 words max.
- Body = 1–2 short sentences.
- Exactly **2 choices**.
- Each choice must have ≥1 effect.
- Effects must be integers within **–3..+3**.
- At least one `archetype:` or `meta:` tag required.

---

## 2. Tone Rules

### 2.1 Brevity
- Use very short, direct sentences.
- Never explain outcomes in the body — meters show results.
- *Wrong:* “If you fund potions, healing improves.”
- *Right:* “The Priest asks for potion money.”

### 2.2 Satirical Deadpan
- Present absurd scenarios with a straight face.
- Humor emerges from seriousness about ridiculous things.
- Example: *“The Rogue insists skipping bosses saves time.”*

### 2.3 Archetypal Voices
Each archetype speaks consistently:
- **General:** pompous, commanding, bureaucratic.  
  *“Only I can lead us to glory.”*
- **Witch:** cryptic, reckless, addicted to danger.  
  *“What’s one more ritual between friends?”*
- **Priest:** exhausted, guilt-tripping, martyr complex.  
  *“Perhaps I should let someone die… as a lesson.”*
- **Rogue:** smug, greedy, self-serving.  
  *“Oh, this? I was just holding it.”*
- **Council:** bureaucratic, cold, faceless.  
  *“Your guild charter requires proof of competence.”*
- **Rival:** mocking, arrogant, boastful.  
  *“We’ll clear the dungeon before you even leave camp.”*
- **Exile:** whispering, bitter, prophetic.  
  *“It always ends the same. Don’t you see?”*
- **Moderator:** sarcastic, meta-aware narrator.  
  *“Another guild, another failure waiting to happen.”*

### 2.4 MMO Satire
- Always tie to MMO culture (logs, parses, loot, trash packs, cooldowns).
- Parody guild drama and MMO absurdities, not generic fantasy.

### 2.5 Moral Ambiguity
- Both choices have downsides.
- No “perfect” or “nothing happens” outcomes.

### 2.6 Straight-Faced Absurdity
- Extreme events must sound casual.
- Example: *“The Witch suggests summoning fire in the guild hall.”*

---

## 3. Consequences
- Effects can only target: `funds`, `reputation`, `readiness`, `morale_all`, `morale_<id>`.
- Each choice must affect ≥1 meter.
- Values must be between **–3..+3**.
- Trade-offs preferred: one stat rises, another falls.

---

## 4. Tags
- **Archetypes:** `archetype:general|witch|priest|rogue|merchant|bard|recruiter`
- **Meta:** `meta:moderator|council|rival|exile|dungeon_progress|dungeon_attempt|collapse`
- **Run framing:** `run:intro`, `run:outro`
- **Collapse causes:** `cause:funds|morale|reputation|council|rival`

At least one `archetype:` or `meta:` tag must be present.

---

## 5. Chaining
- Use `nextStep` for 2–3 beat arcs.
- Escalate tension with each step.
- Example:
  1. *“The General demands to lead.”*
  2. *“The raid resents his command.”*
  3. *“The General threatens to leave.”*

---

## 6. Validation Checklist
- [ ] Title ≤ 50 chars (3–5 words).
- [ ] Body ≤ 120 chars (1–2 sentences).
- [ ] Exactly 2 choices, labels ≤ 28 chars.
- [ ] Both choices have effects in range –3..+3.
- [ ] At least one archetype/meta tag included.
- [ ] Reads with Reigns brevity + satirical MMO tone.

---

## 7. Examples

### Event: *Healer’s Threat*
**Body:** *“The Priest sighs: ‘Maybe I should let them die.’”*  
- Left: *Reassure in public* → `{ "reputation": +1 }`  
- Right: *Dismiss privately* → `{ "readiness": -1 }`

### Event: *Loot Drama*
**Body:** *“The Rogue pockets a jewel, ‘by mistake.’”*  
- Left: *Crack down* → `{ "reputation": +1 }`  
- Right: *Let it slide* → `{ "readiness": +1, "reputation": -1 }`

### Event: *Forbidden Ritual*
**Body:** *“The Witch wants to test a volatile ritual mid-run.”*  
- Left: *Approve* → `{ "readiness": +2, "reputation": -1 }`  
- Right: *Refuse* → `{ "readiness": -1, "reputation": +1 }`

---

**End of Authoring Guide**

