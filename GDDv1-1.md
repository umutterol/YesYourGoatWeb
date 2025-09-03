# **🎮 Guilds of Arcana Terra – Game Design Document (v1.1)**

## **🧭 Game Overview**

**Guilds of Arcana Terra** is a single-player, turn-based tactical RPG that blends the tension of *Darkest Dungeon*, the progression of *AFK Journey*, and the satirical charm of managing an MMO guild. You are not just commanding adventurers — you are the **Guild Master** of a fictional MMO world, curating a roster of eccentric, trait-driven characters who behave like real-life players.

Your job is to assemble balanced teams, conquer tactical dungeons, grow your reputation through seasonal leaderboards, and navigate the chaotic drama of your guild's internal ecosystem.

---

## **🧱 Core Gameplay Pillars**

1. **Tactical Turn-Based Combat**

   * Positioning, initiative, cooldowns, and status effects form a rich strategic layer.

2. **IRL Trait System**

   * Characters embody MMO player archetypes (e.g., Min-Maxer, Drama Queen), affecting skills, events, and team synergy.

3. **Guild Management**

   * Recruit, level, rotate, and retire characters. Balance classes, traits, and affinities.

4. **Progression Systems**

   * Gear upgrades, crafting, affinity bonds, morale stability, and fame-based cosmetics.

5. **Meta-Narrative Systems**

   * Chat-driven flavor, trait barks, mini-events, solo quests, and decision dilemmas.

---

## **💡 Design Philosophy**

* **Accessible Depth**: Easy to pick up, with layered mastery.

* **Systemic Humor**: IRL traits drive satire and emergent comedy.

* **No Bloat**: Streamlined mechanics; no skill trees, no rerolls.

* **Player Expression**: Wide room for creative comp building and story ownership.

* **Tactical Identity**: Each class feels distinct and strategically relevant.

---

## **📖 Table of Contents (v1.1)**

1. Stat System

2. Combat System

3. IRL Trait System

4. Morale System *(new)*

5. Combat Affinity System *(new)*

6. Trait Barks *(new)*

7. Classes & Specializations (5 base classes, 10 masteries)

8. Gear, Upgrades, Salvage & Crafting

9. Dungeon Flow & Enemy AI

10. Party Management

11. Guild System

12. Meta-Systems: Leaderboards, Solo Quests, Events

13. UI & Game Flow

14. Tutorial Design

---

## ***📊 1\. Stat System***

*Guilds of Arcana Terra uses a focused, impactful stat system designed to power both combat decisions and strategic team-building.*

### ***🧮 Primary Stats***

*Each character has 3 primary stats:*

* ***STR (Strength)** – Increases melee damage and tanking capability. Affects many Warrior, Paladin, and Berserker skills.*  
* ***AGI (Agility)** – Determines initiative (turn order), dodge chance, and crit rate. Core for Rogue, Monk, Ranger.*  
* ***INT (Intelligence)** – Powers magic damage, healing, and cooldown reduction. Essential for Mage, Cleric, Arcanist, Druid.*

### ***🛡 Secondary Stats***

*Derived or conditional effects:*

* ***DEF (Defense)** – Reduces incoming damage flatly.*  
* ***VIT (Vitality)** – Governs total HP.*  
* ***CRIT** – Chance to deal 150% damage. Derived from AGI.*  
* ***HIT** – Chance to avoid missing. Most attacks are guaranteed unless stated.*  
* ***DODGE** – Chance to evade an attack entirely. Derived from AGI and situational buffs.*  
* ***RESISTANCES** (future scope) – For resisting DOTs or CC.*

### ***🔁 Cooldown System***

*There is **no mana/energy system**. Instead:*

* *All active skills use cooldowns (CD) to pace usage.*  
* *Cooldowns begin ticking down the moment combat starts.*  
* *Every character has 1 Basic Attack (no CD).*  
* *Some effects and passives modify cooldown behavior (e.g. Mana Surge, Theorycrafter Trait).*

### ***🌀 Stat Progression***

*Characters level up to 20\. Each level grants:*

* *\+5 to a class-relevant primary stat*  
* *\+2 to a secondary stat (rotates between DEF/VIT/CRIT)*  
* *\+20 HP*  
* *Minor skill upgrades at level 5/10/15/20*

*Leveling is meant to reinforce class identity, not transform it.*

---

## **⚔️ 2\. Combat System**

Guilds of Arcana Terra features a tactical, turn-based battle system focused on skill timing, positioning, and trait synergy.

### **🌀 Turn Order**

* Initiative is determined at the start of each round based on AGI.  
* Higher AGI acts first; ties are broken randomly.  
* Turn order is updated at the start of each round — not live/dynamic.

### **🧭 Battlefield Layout**

* Two rows per side: **Frontline** and **Backline**.  
* Frontline: 3 max characters. Takes brunt of melee and AoE skills.  
* Backline: 2 max characters. Often safer but vulnerable to ranged or flanking attacks.

### **🎯 Targeting & Zones**

* Skills are zone-tagged: **Single-Target**, **Front Row AoE**, **Back Row AoE**, **Random 3**, **Full Field**, etc.  
* Positioning matters — AoE cleaves won't hit backline unless stated.

### **🔁 Cooldown Flow**

* Skills start **off cooldown** at the beginning of combat.  
* CDs reduce by 1 at the end of the user's turn.  
* Stunning, silencing, or delaying a unit does **not** pause cooldown timers.

### **🧠 Tactical Depth**

* Skill combos and timing are core: chaining a debuff \+ a finisher.  
* Control skills like **Stun**, **Slow**, and **Silence** shift initiative.  
* Traits and positioning determine risk/reward tradeoffs.  
* Revive Tokens add a layer of tension and second-chance mechanics.

### **🛡 Status Effects & Keywords**

| Keyword | Description |
| ----- | ----- |
| **Stun** | Target skips their next turn. Immune for 1 round after. |
| **Slow** | \-10% AGI for 2 turns. Affects dodge & turn order. |
| **Burn** | Deals 25% INT at start of turn (2 turns). |
| **Poison** | Deals 15% AGI and \-25% healing (3 turns). |
| **Bleed** | 20% AGI per turn. Stacks up to 3x. |
| **Silence** | Can't use skills for 1 turn. Can still basic attack. |
| **Shield** | Absorbs damage. Based on caster INT or flat value. |
| **Overdrive** | \+50% skill damage for 1 turn. Usually triggered by traits. |
| **Mark** | \+20% incoming damage from all sources. |
| **Camouflage** | Untargetable for 1 turn. Avoids all targeted abilities. |

---

## **⚔️ 2.1 Combat System Implementation Specification**

### **Overview**
Detailed implementation requirements for the turn-based tactical combat system, including turn management, skill execution, and status effect processing.

### **User Stories**
- As a player, I want clear turn order visibility so that I can plan my strategy effectively
- As a player, I want immediate feedback when skills are used so that I understand their effects
- As a player, I want status effects to be clearly displayed so that I can track ongoing conditions
- As a player, I want cooldown timers to be visible so that I can optimize skill usage

### **Acceptance Criteria**
- [ ] Turn order updates at the start of each round based on AGI values
- [ ] Skills execute in the correct order with proper targeting validation
- [ ] Status effects apply and expire at the correct timing
- [ ] Cooldown timers decrement properly at the end of each character's turn
- [ ] Position-based targeting rules are enforced (frontline/backline restrictions)
- [ ] Combat ends when all enemies are defeated or party is wiped

### **Technical Requirements**

#### **Input Handling**
- **Skill Selection**: Click/tap on skill icon + target selection
- **Targeting**: Click/tap on valid enemy/ally positions
- **Auto-Advance**: Automatic progression when no valid actions remain
- **Pause/Resume**: Combat can be paused and resumed

#### **Output Processing**
- **Animation System**: Each skill must have associated visual/audio feedback
- **Damage Calculation**: Real-time damage numbers with crit indicators
- **Status Effect Display**: Clear visual indicators for all active effects
- **Turn Queue Update**: Visual representation of upcoming turn order

#### **Dependencies**
- **Character Stats System**: AGI, STR, INT values for calculations
- **Skill Database**: All skill definitions, cooldowns, and effects
- **Status Effect Manager**: Handles application, duration, and removal
- **UI Combat Interface**: Displays combat state and player controls

#### **Edge Cases**
- **Character Death**: Handle skill targeting when characters die mid-turn
- **Status Immunity**: Prevent duplicate status applications
- **Invalid Actions**: Gracefully handle impossible skill combinations
- **Network Disconnection**: Save combat state for reconnection

### **Balancing Parameters**

#### **Timing Values**
- **Turn Duration**: Maximum 30 seconds per turn (configurable)
- **Animation Speed**: 0.5x to 2.0x multiplier for combat pace
- **Status Duration**: 1-5 turns based on skill power and resistance

#### **Damage Scaling**
- **Basic Attack**: 80-120% of primary stat (randomized)
- **Skill Damage**: 150-300% of primary stat (class-dependent)
- **Critical Hits**: 150% damage with 5-25% chance (AGI-based)

#### **Cooldown Balance**
- **Basic Skills**: 2-3 turn cooldowns
- **Power Skills**: 4-6 turn cooldowns  
- **Ultimate Skills**: 6-8 turn cooldowns
- **Trait Modifiers**: ±1-2 turns based on character traits

### **Performance Requirements**
- **Frame Rate**: Maintain 60 FPS during combat animations
- **Memory Usage**: Combat scene < 100MB RAM
- **Load Time**: Combat initialization < 2 seconds
- **Save State**: Combat state persistence < 1 second

### **Web Implementation Notes**
- Use **CSS/Canvas animations** for skill animations and transitions
- Implement **State Machine** pattern for combat flow management
- Utilize **Event System** for turn progression and event handling
- Use **JSON/TypeScript** modules for skill definitions and status effects
- Implement **Object Pooling** for damage numbers and visual effects

---

## **🎭 3\. IRL Trait System**

Every character in Guilds of Arcana Terra is not just an adventurer — they're a representation of a fictional MMO player with a unique behavioral identity. These personalities, known as **IRL Traits**, are the heart of the game's satire and systemic complexity.

### **🧠 What Traits Represent**

IRL Traits simulate real-world MMO player archetypes — like "Min-Maxers", "Drama Queens", or "AFK Farmers". They introduce:

* Unique personal gameplay modifiers  
* Team-wide passive effects  
* Negative quirks or limitations  
* Event triggers and bark generators

Each character has **one permanent IRL Trait**, locked at recruitment.

### **⚙️ Trait Structure**

An IRL Trait has:

* **Name** (e.g. "Hardcore Permadeather")  
* **Tagline** (flavor quote)  
* **Personal Modifier** – changes their own behavior, stats, or abilities  
* **Party Effect** – applies a passive or triggered bonus to the entire party  
* **Downside** – limits usage, behavior, or introduces risk

### Kiss/Curse Framing (MVP)
To reinforce readability and strategic tradeoffs, each trait is authored as a
pair of effects:

* **Kiss (Boon)**: a clear, condition-based benefit (personal or party). Budget
  is small sustained (+10–15%) or a short, gated burst (+30–50%, CD ≥ 2).
* **Curse (Cost)**: a symmetrical, readable cost that triggers on violation or
  specific events (e.g., repeating skills, breaking slot rules). Budget is mild
  sustained (-5–10%) or a short debuff with CD ≥ 2.

Stacking (optional): certain kisses/curses can stack additively with a default
cap of 3, duration 2 rounds, decaying by 1/turn if not refreshed. Party-wide
portions have diminishing returns on duplicate copies (second copy at 50%).

### **🔄 Combat Integration**

Traits affect how characters behave in battle:

* Some reward specific behaviors (e.g. not repeating skills)  
* Others penalize "off-brand" decisions (e.g. using basic attacks)  
* Traits can interact with cooldowns, morale, or affinity

### **📣 Narrative Integration**

* **Trait Barks** trigger during combat or events, reinforcing flavor  
* **Mini-Events** between dungeons may be based on trait interactions  
* **Whispers** simulate chat messages flavored by IRL Traits

### **📋 Trait List (v3.0 Sample Selection)**

| Trait | Flavor Quote | Personal Effect | Party Effect | Downside |
| ----- | ----- | ----- | ----- | ----- |
| **Theorycrafter** | "Knows every frame." | Kiss: +6% dmg per consecutive unique skill (stacks 3, decays 1/turn); first unique skill each round gets -1 CD | Party: -1 CD in round 1 | Curse: repeating a skill within 2 turns adds +1 CD to that skill |
| **AFK Farmer** | "I'll be back in 3 hours..." | Kiss: after skipping a turn, next action +30% dmg, +10% hit | Allies gain \+10% DEF if this unit skips | Curse: if acts first in a round, -10% AGI 1 turn |
| **Drama Queen** | "I soloed it while on fire." | Kiss: Overdrive on being hit by 3+ enemies (once/fight) | Party: +5% crit while any ally <50% HP | Curse: on crit, team -10 morale (CD 2) |
| **Hardcore Permadeather** | "If I die, delete me." | Kiss: +50% STR/AGI/INT until death | Party: revive tokens on others +20% stronger | Curse: cannot be revived; on death team -10 morale |
| **Meta Slave** | "Saw it on a tier list." | Kiss: apply 1 stack Mark on focus-fire target (+5% dmg taken, max 3, decays) | Party: +5% hit chance | Curse: off-targeting vs previous ally gives party -5% hit 1 turn |
| **Guild Leader** | "Follow my lead." | Kiss: while in slot 1, next 2 allies +10% dmg | If all traits unique: \-1 CD to all at round 1 | Curse: moved from slot 1 → lose leader kisses 2 turns; self -10% VIT |

Note: Final launch roster includes 12–15 traits, each with systemic hooks.

---

## **🎭 3.1 IRL Trait System Implementation Specification**

### **Overview**
Complete implementation requirements for the IRL Trait system, including trait definitions, bark generation, and integration with combat and narrative systems.

### **User Stories**
- As a player, I want to see how traits affect my characters' behavior so that I can build synergistic teams
- As a player, I want trait barks to trigger during gameplay so that I feel immersed in the MMO world
- As a player, I want trait effects to create meaningful strategic choices so that team composition matters
- As a player, I want to discover new trait interactions so that the game remains engaging over time

### **Acceptance Criteria**
- [ ] Each character has exactly one permanent IRL Trait that cannot be changed
- [ ] Trait effects apply correctly during combat and between-dungeon events
- [ ] Trait barks trigger contextually based on gameplay events
- [ ] Trait interactions create emergent gameplay opportunities
- [ ] All 12-15 traits are balanced and provide unique strategic value

### **Technical Requirements**

#### **Input Handling**
- **Trait Assignment**: Automatic assignment during character recruitment
- **Trait Display**: Clear tooltips showing all trait effects and downsides
- **Bark Triggers**: Automatic bark generation based on gameplay events

#### **Output Processing**
- **Combat Modifiers**: Real-time application of trait bonuses/penalties
- **Bark Generation**: Contextual text display in chat and combat popups
- **Event Triggers**: Mini-events and narrative moments based on trait presence

#### **Dependencies**
- **Character Database**: Stores trait assignments and bark pools
- **Combat System**: Applies trait modifiers during battle
- **Event System**: Triggers trait-specific narrative moments
- **Chat System**: Displays trait barks and interactions

#### **Edge Cases**
- **Trait Conflicts**: Handle incompatible trait combinations gracefully
- **Bark Duplication**: Prevent repetitive bark generation
- **Trait Stacking**: Manage multiple characters with same trait
- **Invalid States**: Handle trait effects when characters are incapacitated

### **Content Specifications**

#### **Required Trait Content (12-15 Total)**
Each trait must include:
- **Name & Tagline**: Unique identity and flavor quote
- **Personal Effect**: 1-2 mechanical bonuses for the character
- **Party Effect**: 1 team-wide benefit or synergy trigger
- **Downside**: 1-2 limitations or penalties
- **Bark Pool**: 5-10 contextual dialogue lines per trigger type

#### **Bark Trigger Categories**
- **Combat Start**: 3-5 unique lines per trait
- **Skill Usage**: 2-3 lines for signature abilities
- **Critical Moments**: 2-3 lines for kills, deaths, low HP
- **Trait Activation**: 2-3 lines when trait effects trigger
- **Affinity Milestones**: 2-3 lines for high-affinity pairs

#### **Trait Balance Guidelines**
- **Personal Bonus**: +10% to +50% in relevant stat/effect
- **Party Bonus**: +5% to +15% for team-wide effects
- **Downside Impact**: Should create interesting choices, not frustration
- **Synergy Potential**: Each trait should work well with 2-3 other traits

### **Balancing Parameters**

#### **Effect Magnitudes**
- **Stat Bonuses**: 10%, 15%, 20%, 25%, 30%, 50% (tiered system)
- **Cooldown Modifiers**: -1, -2, +1, +2 turns
- **Damage Multipliers**: 1.1x, 1.2x, 1.3x, 1.5x, 2.0x
- **Duration Modifiers**: 1, 2, 3, 4, 5 turns

#### **Trigger Conditions**
- **HP Thresholds**: 25%, 50%, 75% health levels
- **Turn Counters**: Every 2, 3, 4, 5 turns
- **Skill Usage**: After 1, 2, 3, 4 different skills
- **Position Requirements**: Frontline, backline, specific slots

#### **Bark Frequency**
- **Combat Barks**: Maximum 1 per 3 turns per character
- **Event Barks**: Maximum 2 per dungeon run
- **Affinity Barks**: Maximum 1 per affinity milestone reached

### **Implementation Requirements**

#### **Data Structure**
```json
{
  "trait_id": "theorycrafter",
  "name": "Theorycrafter",
  "tagline": "Knows every frame.",
  "personal_effect": {
    "type": "skill_damage_bonus",
    "condition": "no_repeat_within_turns",
    "value": 10,
    "duration": 3
  },
  "party_effect": {
    "type": "cooldown_reduction",
    "condition": "round_one",
    "value": -1,
    "target": "all_allies"
  },
  "downside": {
    "type": "basic_attack_limit",
    "value": 1,
    "scope": "per_combat"
  },
  "bark_pools": {
    "combat_start": ["line1", "line2", "line3"],
    "skill_usage": ["line1", "line2"],
    "trait_activation": ["line1", "line2", "line3"]
  }
}
```

#### **Performance Requirements**
- **Trait Calculation**: < 1ms per trait effect application
- **Bark Generation**: < 100ms for bark selection and display
- **Memory Usage**: < 50KB per trait including all bark data
- **Load Time**: Trait system initialization < 500ms

### **Web Implementation Notes**
- Use **JSON/TypeScript** modules for trait definitions
- Implement **Observer Pattern** for trait effect triggers
- Utilize **String Pool** for bark text management
- Leverage **Addressables System** for trait data caching
- Implement **Event System** for bark generation and display

---

## **🧠 4\. Morale System (Stress-lite)**

The **Morale System** simulates a character's mental state — a blend of motivation, focus, and psychological fatigue. Unlike health, morale doesn't determine life or death, but it **heavily influences performance and behavior**.

### **🎯 System Goals**

* Add long-term consequences to repeated use or poor synergy  
* Encourage roster rotation and downtime  
* Deepen the expression of IRL Traits and narrative tone

### **📉 Morale Scale**

Each character has a **Morale score (0–100)**:

* Starts at **100** for each dungeon run  
* Can persist between dungeons depending on rest, events, or outcomes

### **🛑 Negative Morale Triggers**

| Event | Morale Loss |
| ----- | ----- |
| Party member dies | \-25 |
| Dungeon failure | \-30 |
| Repeated skill use violating trait (e.g. for Theorycrafter) | \-10 |
| Benched too long (3+ dungeons) | \-15 |
| Trait-specific penalty (e.g. Drama Queen on crit) | \-10 to others |

### **✅ Positive Morale Triggers**

| Event | Morale Gain |
| :---- | :---- |
| Dungeon win | \+20 |
| Leaderboard Top 3 finish | \+25 |
| Trait synergy event | \+10 |
| Rest period / Guild Festival | \+20 |
| Solo quest success | \+10–15 |

### **⚠️ Morale Threshold Effects**

| Morale Range | Effect |
| :---- | :---- |
| 70–100 | No penalty |
| 40–69 | \-5% DEF and INT (fog of war, emotional distraction) |
| 20–39 | May randomly skip turn or reject buffs |
| 0–19 | Random skill use, disables trait bonuses |

Note: Morale is **visible in the character tooltip and party builder**, but not presented as a primary stat.

### **🛏 Rest & Recovery**

* **Rest tokens** are granted every few dungeon runs  
* Assigning a character to Rest removes them from the party for 1 run and restores **\+50 Morale**  
* Events, mini-games, and solo quests can also passively boost morale over time

### **🔄 Trait & Event Interactions**

* Traits can amplify or mitigate morale effects  
* Decisions in "Yes, Your GM" events often affect morale (e.g. siding with one guildmate)  
* Barks are triggered at morale breakpoints to add flavor and emotional feedback

---

## **🤝 5\. Combat Affinity System**

The **Combat Affinity System** tracks the relational bond between any two characters based on how often they fight together. This system supports strategic synergy, party experimentation, and narrative expression.

### **🎯 System Goals**

* Encourage party rotation and duo experimentation  
* Reward consistency and long-term character pairing  
* Add flavor, barks, and bonus effects without over-powering metas

### **🔗 Affinity Score**

Each unique pair of characters shares an **Affinity Score (0–100)**:

* Starts at 0, increases only when both characters are in the same dungeon run  
* Stored permanently in the Guild save file

### **📈 Gaining Affinity**

| Condition | Affinity Gain |
| ----- | ----- |
| Dungeon run together | \+10 |
| Synergy moment (buff → heal → kill) | \+5 |
| Shared victory with no deaths | \+5 |
| Mini-event featuring both characters | \+10–15 |

### **🧨 Optional Conflict (Future Scope)**

* Negative Affinity could be introduced for trait clashes or decision fallout (e.g. Bard vs. Drama Queen)

### **🎁 Affinity Threshold Rewards**

| Score | Reward |
| :---- | :---- |
| 25 | Unique barks between pair, new chatlines in \[Guild\] tab |
| 50 | Passive bonus (e.g. \+5% healing or crit chance when adjacent) |
| 75 | Combat combo bonus if acting back-to-back (e.g. \+10% crit or defense shred) |
| 100 | Unlock "Linked Trait" — minor shared passive or visual effect (cosmetic or narrative only) |

### **📊 UI & Feedback**

* Affinity is shown in the Party Builder as a **small icon or colored line** between slotted characters  
* Hovering shows numerical score \+ recent synergy history  
* Post-dungeon screen can display "Affinity Gain" pop-ups like EXP

### **🔄 Narrative Integration**

* Affinity affects mini-events (e.g. party arguments, joint missions)  
* Can be referenced in Whispers and Trait Barks  
* Affects likelihood of combo interactions (e.g. one character finishing the other's target)

Design Note: Affinity bonuses are **not power spikes** — they offer consistent flavor and mild tactical advantage, but never replace class synergy or trait design.

---

## **🎭 6\. Trait Barks System**

The **Trait Barks System** gives voice to each character's IRL personality, turning gameplay moments into flavorful, reactive text. Barks are brief lines of dialogue that trigger contextually and reflect the character's IRL Trait — contributing to immersion, humor, and emotional feedback.

### **🎯 System Goals**

* Add charm and reactivity to combat and events  
* Reinforce IRL Traits through behavior and dialogue  
* Provide emergent storytelling and meta-parody moments

### **🔄 When Barks Trigger**

| Category | Examples |
| ----- | ----- |
| **Combat** | On kill, on crit, on being downed, on dungeon start |
| **Morale Events** | When morale hits a threshold (e.g. drops below 40 or hits 100\) |
| **Trait Interactions** | A trait condition is met (e.g. Meta Slave follows someone's attack) |
| **Event System** | During Yes, Your GM decisions or solo quest outcomes |
| **Affinity Milestones** | Unique duo barks at affinity 25+ |

### **🎭 Bark Types**

* **Standard Barks**: Solo character reactions based on their IRL Trait  
* **Paired Barks**: Affinity-based dialog lines (e.g. "You again? Try not to die this time.")  
* **Meta Barks**: Refer to MMO culture and systems ("This fight feels like a DPS check.")

### **🗃 Trait Bark Structure**

Each IRL Trait has a **bark pool** of 5–10 lines per trigger type:

* **Drama Queen**  
  * \*"I soloed a world boss with one HP and a dream!"  
  * \*"Guess who's carrying again? You're welcome."  
* **AFK Farmer**  
  * \*"Wait… what phase are we in?"  
  * \*"Let me auto this real quick."  
* **Theorycrafter**  
  * \*"Not optimal… but statistically viable."  
  * \*"That was a 14.3% chance to proc. Calculated."

### **💬 Delivery Mechanism**

* Barks are shown in the **chat window** (\[Guild\], \[Local\], \[Whispers\])  
* Optional **combat popups** for critical events (downed, boss kill)  
* Audio delivery can be explored in future scope for VO expansion

### **📊 UI & Modularity**

* Players can toggle bark frequency in settings (e.g. Full / Important Only / None)  
* Barks are linked directly to trait JSON/TypeScript modules for extensibility  
* Event designers can plug bark triggers into event data structures

Design Note: Trait Barks do not affect gameplay outcomes but **may influence Morale or Affinity passively** when narrative decisions reference them.

---

## **🧙‍♂️ 7. Classes & Specializations**

GOAT ships with 5 base classes, each with 2 specializations (masteries). These 10 masteries cover the original 12 class identities while reducing art scope.

- **Warrior Race: Orc**
  - Guardian — Tank (Front). Taunt, stun, thorns. Covers Warrior/Warden tank.
  - Berserker — Melee DPS (Front). Rampage stacks, cleave, bleed.

- **Paladin Race: Dwarf**
  - Crusader — Shield Support/Tank (Front). Party shields, guard, mark cleanse.
  - Cleric — Healer/Shield (Back). Disc‑style burst heals + absorbs + cleanse.

- **Rogue Race: Dark Elf**
  - Assassin — ST Burst (Back). Camouflage, execute, crit chains.
  - Bard — Tempo Buffer/Debuffer (Back). Overdrive windows, CD tweaks, mark/crit setup.

- **Mage Race: Human**
  - Pyromancer — Burst AoE (Back). Burn stacks → detonate, long‑CD nukes.
  - Arcanist — Control/Barrier (Back). Silence, slows, party barrier.

- **Sage Race: Wood Elf**
  - Lifebinder — Regen Healer (Back). HoTs, DOT→heal conversions, nature shields.
  - Mystic — Control/Off‑tank Support (Front). Parries, stuns, self‑sustain.

All specializations use the cooldown-only system and support class/trait synergy.

### Kit structure per specialization
- 1 Basic Attack (no cooldown)
- 4 Active Skills (with cooldowns)
- 1 Passive (always-on)

Skills scale off primary stats (STR/AGI/INT), interlocking with targeting rules, traits, and row positioning.

### Sample skill themes by spec
- Guardian: Taunt, Shield, Stun, Mark, Counter.
- Berserker: Cleave, Bleed, Overdrive window, Self‑risk for power.
- Crusader: Party Shield, Cleanse-lite, Guard Ally, Light damage.
- Cleric: Single‑target burst heal, Absorb shield, Cleanse, Small AoE heal.
- Assassin: Camouflage, Execute threshold, Poison knife, Gap‑close.
- Bard: Song aura (buff), Debuff (crit/mark), Turn meter nudge, Overdrive.
- Pyromancer: Burn application, Ignite/Detonate, Cone/Line AoE, Big CD nuke.
- Arcanist: Silence, Slow field, Party Barrier, Dispel.
- Lifebinder: Heal‑over‑time, Convert enemy DOTs to minor heals, Nature shield.
- Mystic: Stun, Parry stance, Self‑heal on control, Frontline dash/peel.

---

See "Classes & Specializations" above for current base classes, masteries, and skills.

---

*...\[snip for brevity\]...*

---

## ***🧙‍♂️ 7\. Character Class Definitions***

*...\[snip for brevity\]...*

---

## ***🛠 8\. Gear, Upgrade, Salvage & Crafting System***

*Equipment progression in GOAT is designed to be linear, impactful, and synergistic with classes, traits, and dungeons — without overwhelming complexity.*

### ***🎒 Equipment Slots***

*Each character equips 4 core pieces:*

* ***Weapon***

* ***Helmet***

* ***Chest***

* ***Legs***

*Future scope: Cosmetic/offhand/vanity slots.*

*Each item provides:*

* ***\+DEF** (always)*

* ***\+VIT** (always)*

* ***\+Primary Stat** (STR/AGI/INT — item-dependent)*

### ***🌈 Item Rarity Tiers***

| *Rarity* | *Bonus Effects* |
| ----- | ----- |
| *Common* | *Basic stats only* |
| *Rare* | *Higher stat rolls* |
| *Epic* | *One secondary bonus (crit, hit, etc.)* |
| *Legendary* | *Set bonuses, unique effects* |

### ***🧩 Set Items***

*Each class has at least 2 dedicated item sets. Sets provide:*

* ***2-piece bonus** (stat buff or trigger)*

* ***4-piece bonus** (mechanic-altering effect)*

#### ***Example: Berserker Set***

* *2-piece: \+10 STR*

* *4-piece: If HP \< 50%, gain \+25% damage*

#### ***Example: Druid Set***

* *2-piece: \+10 INT*

* *4-piece: Poisons last 1 turn longer*

### ***🧪 Upgrade System***

*Items can be upgraded from **\+0 to \+5** using dungeon materials. Effects stack:*

| *Upgrade* | *Effect* |
| ----- | ----- |
| *\+1* | *Add \+1 to a stat* |
| *\+2* | *\+1 VIT or DEF* |
| *\+3* | *Add missing stat if not present* |
| *\+4* | *Double one stat bonus* |
| *\+5* | *Add minor passive or trigger if Epic+* |

*   
  ***Materials**:*

  * ***Basic Alloy**: Common/Rare*

  * ***Enchanted Filament**: Epic*

  * ***Legendary Core**: Legendary*

*Each upgrade consumes more material than the last.*

### ***♻️ Salvage System***

* *Salvaging items returns a % of their upgrade material:*

|  *Upgrade Level* |  *Material Returned* |
| ----- | ----- |
| *\+0* | *0%* |
| *\+1* | *25%* |
| *\+2* | *40%* |
| *\+3* | *60%* |
| *\+4* | *60%* |
| *\+5* | *60%* |

* *Only upgrade materials are returned — not base stats.*

* *Salvaging Legendary items gives only Legendary Cores.*

### ***🔧 Crafting Flow***

1. ***Find item in dungeon drop***

2. ***Use or salvage it***

3. ***Use materials to upgrade key gear***

### ***📦 Future Enhancements***

* *Dungeon-specific visual variants*

* *Named legendaries with story lore*

* *Class-specific relic slots or socketing*

---

## ***🗺 9\. Dungeon Flow & Enemy AI***

*Dungeons in GOAT are repeatable, instanced combat sequences featuring escalating enemy encounters and boss mechanics. Runs are handcrafted and deterministic (no procedural randomization within a run). Each dungeon rewards gear, materials, and leaderboard scores.*

### ***🧱 Dungeon Structure***

* *Each dungeon contains **3–5 encounters**, escalating in difficulty.*

* *Final room is a **Boss or Elite Encounter**.*

* *Enemy compositions and placements are **pre-authored per dungeon version**; no in-run randomization.*

### ***🧭 Encounter Flow***

1. ***Pre-Combat***

   * *Visual setup, enemy silhouettes, ability preview*

2. ***Combat Phase***

   * *Standard turn-based tactical battle*

3. ***Post-Combat***

   * *Loot, EXP, Morale/Affinity changes, scripted event triggers (if defined)*

### ***🔁 Dungeon Loop***

* *Party persists across encounters*

* *No HP/morale recovery between fights unless via trait/event/ability*

* *Revive Tokens usable **between** fights only*

#### Revive Tokens
- Consumable currency available in limited quantity per run/season
- Usable only during intermission between fights and on the Post‑Dungeon Screen
- Effects may be modified by traits (e.g., Hardcore Permadeather: tokens are stronger but cannot revive self in‑dungeon)
- Usage is recorded for Results Screen summaries and leaderboard audit

### ***🧠 Enemy Design Philosophy***

*Enemies are not generic mobs. They mimic the class-based structure of player characters, making skill reads and counterplay possible.*

#### 

#### 

#### ***AI Behavior Profiles***

| *AI Type* | *Description* |
| ----- | ----- |
| *Aggressor* | *Focuses lowest HP, burst damage priority* |
| *Disruptor* | *Applies status effects (DOTs, slows, debuffs)* |
| *Protector* | *Shields/tanks for allies, uses taunts* |
| *Healer* | *Prioritizes heals and cleanse under 50% HP* |
| *Wild Card* | *Unpredictable skill use, rotates patterns* |

#### ***Example Enemies (Craghold Excavation)***

* ***Tunnel Skirmisher** (Rogue-type, Aggressor)*

* ***Cult Pyromancer** (Mage-type, Disruptor)*

* ***Rebel Brawler** (Warrior-type, Protector)*

* ***Blood Acolyte** (Cleric-type, Healer)*

### ***💀 Boss Design Notes***

* *Bosses have 3 Active Skills, no passive or traits*

* *Always use Wild Card AI*

* *Trigger special mechanics based on turn or deaths*

#### ***Sample Boss: Foreman Vex***

* *Class Base: Mage/Warrior Hybrid*

* *Skills: Fireball, Arcane Bolt, Warcry*

* *Trait: Starts with shield, gains \+DMG when ally dies*

### ***⚔ Rewards Structure***

* *Per‑dungeon drop tables with themed loot (e.g., STR/AGI themed dungeons)*

* *Guaranteed base drops \+ materials per clear*

* *Bonus rewards for no deaths, fast clears, or trait synergy*

* *Seasonal cosmetics/frames may drop from high placements or special challenges*

Design Note: Rewards feed Gear and Guild systems, emphasizing replayability and optimization.

---

## **🗺 9.1 Dungeon System Implementation Specification**

### **Overview**
Complete implementation requirements for the dungeon system, including encounter loading/sequencing (handcrafted), enemy AI, progression tracking, and reward distribution.

### **User Stories**
- As a player, I want a varied catalog of dungeons and routes while each run is curated and learnable
- As a player, I want to see my progress through the dungeon so that I can plan my resource usage
- As a player, I want meaningful rewards from dungeon completion so that I feel progression
- As a player, I want to understand enemy behavior so that I can develop effective strategies

### **Acceptance Criteria**
- [ ] Each dungeon contains 3-5 unique, handcrafted encounters in a fixed order with escalating difficulty
- [ ] Enemy AI behaves consistently with their designated behavior profiles
- [ ] Dungeon rewards scale appropriately with difficulty and performance
- [ ] Progress tracking works correctly across multiple encounters
- [ ] Revive tokens function properly between encounters

### **Technical Requirements**

#### **Input Handling**
- **Dungeon Selection**: Choose from available dungeons with difficulty indicators
- **Encounter Navigation**: Progress through sequential combat encounters
- **Resource Management**: Use revive tokens and manage party health/morale
- **Reward Collection**: Claim and distribute dungeon rewards

#### **Output Processing**
- **Encounter Loading**: Pre-authored enemy compositions, positions, and encounter order
- **AI Behavior**: Enemy decision-making and skill usage
- **Progress Tracking**: Visual indicators of dungeon completion status
- **Reward Distribution**: Automatic loot and experience allocation

### **Changelog (Dungeon Canon Update)**
- Canon: Dungeons are set-run, handcrafted; no procedural randomization within a run.
- Replaced “Encounter Generation” with “Encounter Loading” (pre-authored compositions/positions/order).
- Updated Dungeon Structure to specify fixed enemy compositions per dungeon version.
- Converted “Encounter Generation Rules” to “Encounter Composition (Handcrafted) Rules”.

#### **Dependencies**
- **Combat System**: Handles individual encounter resolution
- **Enemy Database**: Stores enemy definitions and AI behaviors
- **Reward System**: Manages loot tables and drop rates
- **Save System**: Persists dungeon progress and state

#### **Edge Cases**
- **Party Wipe**: Handle complete party defeat gracefully
- **Disconnection**: Save progress for reconnection
- **Invalid States**: Prevent impossible encounter combinations
- **Performance Issues**: Handle large enemy groups efficiently

### **Content Specifications**

#### **Required Dungeon Content (Phase 1)**
- **Craghold Excavation** (Tutorial Dungeon)
  - 3 encounters: Tunnel Skirmisher, Cult Pyromancer, Foreman Vex (Boss)
  - Difficulty: Beginner (Level 1-5 characters)
  - Theme: Mining operation with cultist infiltration
  - Rewards: Basic gear, crafting materials, guild EXP

- **Shadowfen Marsh** (Intermediate Dungeon)
  - 4 encounters: Bog Stalker, Venomous Spitter, Marsh Guardian, Swamp Lord (Boss)
  - Difficulty: Intermediate (Level 5-10 characters)
  - Theme: Toxic swamp with corrupted nature spirits
  - Rewards: Intermediate gear, rare materials, higher guild EXP

- **Ironforge Depths** (Advanced Dungeon)
  - 5 encounters: Dwarven Defender, Steam Golem, Crystal Guardian, Ancient Forge, Iron Lord (Boss)
  - Difficulty: Advanced (Level 10-15 characters)
  - Theme: Ancient dwarven stronghold with mechanical guardians
  - Rewards: Advanced gear, legendary materials, maximum guild EXP

#### **Enemy AI Behavior Profiles**
Each enemy type must implement one of these behavior patterns:

**Aggressor AI**
- **Priority**: Target lowest HP enemy
- **Skill Selection**: 70% damage skills, 20% debuffs, 10% utility
- **Positioning**: Moves to optimal attack range when possible
- **Thresholds**: Uses defensive skills when HP < 30%

**Disruptor AI**
- **Priority**: Target highest threat enemy
- **Skill Selection**: 40% debuffs, 30% damage, 20% control, 10% utility
- **Positioning**: Maintains safe distance, prioritizes backline
- **Thresholds**: Focuses on status effect application

**Protector AI**
- **Priority**: Shield allies, taunt enemies
- **Skill Selection**: 50% defensive skills, 30% taunts, 20% damage
- **Positioning**: Frontline positioning, blocks for allies
- **Thresholds**: Activates defensive stance when allies < 50% HP

**Healer AI**
- **Priority**: Heal lowest HP ally
- **Skill Selection**: 60% healing, 25% cleansing, 15% buffs
- **Positioning**: Backline positioning, avoids direct threats
- **Thresholds**: Prioritizes healing when allies < 70% HP

**Wild Card AI**
- **Priority**: Variable targeting based on situation
- **Skill Selection**: Random distribution with context awareness
- **Positioning**: Adaptive positioning based on battlefield state
- **Thresholds**: Unpredictable behavior patterns

#### **Encounter Composition (Handcrafted) Rules**
- **Enemy Count**: 2-4 enemies per encounter (predefined per room)
- **Class Distribution**: Maximum 2 of same class per encounter (content rule)
- **Difficulty Escalation**: Power curve increases across rooms (pre-tuned values)
- **Positioning**: Enemies start in logical formations (tanks front, casters back)
- **Skill Scripts**: Enemy openers/threshold behaviors are fixed per encounter; bosses have defined phase scripts

### **Balancing Parameters**

#### **Difficulty Scaling**
- **Enemy HP**: Base HP × (1 + 0.15 × encounter_number)
- **Enemy Damage**: Base damage × (1 + 0.10 × encounter_number)
- **Enemy Accuracy**: Base accuracy + (2 × encounter_number)%
- **Enemy Critical**: Base crit + (1 × encounter_number)%

#### **Reward Scaling**
- **Base Rewards**: 100-500 guild EXP per dungeon
- **Performance Bonus**: +25% for no deaths, +15% for fast clear
- **Difficulty Multiplier**: 1.0x (beginner), 1.5x (intermediate), 2.0x (advanced)
- **Material Drops**: 2-8 materials per encounter, rarity based on difficulty

#### **Time Constraints**
- **Encounter Duration**: Target 5-15 minutes per encounter
- **Total Dungeon Time**: Target 20-45 minutes for complete run
- **Turn Limits**: Maximum 50 turns per encounter (configurable)
- **Auto-Save**: Every 2 encounters or major milestone

### **Implementation Requirements**

#### **Data Structure**
```json
{
  "dungeon_id": "craghold_excavation",
  "name": "Craghold Excavation",
  "difficulty": "beginner",
  "level_range": [1, 5],
  "encounters": [
    {
      "encounter_id": "tunnel_skirmisher",
      "name": "Tunnel Skirmisher",
      "enemies": [
        {
          "enemy_id": "tunnel_skirmisher_1",
          "class": "rogue",
          "behavior": "aggressor",
          "position": "frontline",
          "skills": ["basic_attack", "poison_dagger", "stealth"],
          "stats": {"hp": 120, "damage": 25, "accuracy": 85}
        }
      ],
      "rewards": {"exp": 50, "materials": ["basic_alloy", "herbs"]}
    }
  ],
  "boss_encounter": "foreman_vex",
  "total_rewards": {"exp": 200, "materials": ["rare_alloy", "enchanted_filament"]}
}
```

#### **Performance Requirements**
- **Encounter Generation**: < 1 second for complex encounters
- **AI Decision Making**: < 100ms per enemy turn
- **State Persistence**: < 500ms for save/load operations
- **Memory Usage**: < 150MB per dungeon instance
- **Load Time**: Dungeon initialization < 3 seconds

### **Web Implementation Notes**
- Use **SPA routing/view controller** for encounter management and transitions
- Implement **State Machine** for dungeon progression flow
- Use **JSON/TypeScript** modules for enemy definitions and AI behaviors
- Use **data attributes** or IDs for entity tagging and targeting
- Implement **Object Pooling** for enemy instances and effects
- Use **Event System** for encounter events and progression
- Leverage **LocalStorage/IndexedDB** for save/load and progress tracking

---

## ***🔧 10\. Party Management System***

*Party composition is a critical layer in GOAT's tactical and narrative gameplay. Players select and manage five active members from a larger roster of guild recruits, with decisions affecting performance, morale, synergy, and leaderboard viability.*

### ***🧩 Party Formation Rules***

* *Exactly **5 characters per dungeon run***

* ***No class or trait duplication restrictions***

* ***Frontline/Backline position** must be assigned manually*

* *Traits, Affinity, Morale, and gear should all be considered when selecting a party*

### ***↔️ Positioning Mechanics***

* *Frontline: absorbs melee and most AoE skills; ideal for tanks/melee*

* *Backline: safer for ranged/support; vulnerable to specific skills (e.g. multi-hit, teleport)*

### ***🔁 Rotation & Bench Behavior***

* ***Benched characters** do not participate in dungeons*

* *They do **not earn EXP**, unless under effects from solo quests or guild upgrades*

* *Characters left benched for **3+ runs** may suffer **\-15 morale***

* *Swapping characters is only allowed **between dungeons**, not mid-run*

### ***🧠 Party Synergy Factors***

1. ***Class Roles** – Ensure balanced distribution (Tank/Heal/DPS)*

2. ***IRL Traits** – Some traits punish or boost specific combinations*

3. ***Affinity** – High-affinity pairs gain bonus effects when placed together*

4. ***Morale** – Low morale characters are prone to failure or randomness*

5. ***Leader Traits** – Traits like "Guild Leader" require specific positioning*

### ***🧙‍♂️ Party UI Design***

* *Party Builder supports **drag & drop**, **filter by trait/class/stat***

* *UI displays:*

  * *Morale score*

  * *Trait summary*

  * *Gear score*

  * *Affinity lines between units*

### ***📋 Pre-Run Validation***

* *Validation ensures all slots filled*

* *Warns if:*

  * *Duplicate character (same class/trait combo)*

  * *Characters have low morale (\<20)*

  * *Illegal position traits (e.g. Guild Leader not in slot 1\)*

### 

### ***📈 EXP Distribution***

* ***Full EXP** awarded only to characters who completed the dungeon*

* *Special events or upgrades may offer **partial EXP to bench***

* *EXP sharing is **equal across party members***

---

## ***🧱 11\. Guild System***

*In GOAT, the player is the Guild Master — a fictional MMO account managing a roster of adventurers (characters). All progression, customization, and strategic expansion is driven by the Guild layer.*

### ***🏰 Guild Identity***

* *Players choose a **guild name**, **banner**, and **motto** at start*

* *Cosmetic upgrades unlock via Fame and Guild Level*

* *Guild UI serves as the main hub (roster, crafting, leaderboard, settings)*

### ***📈 Guild Level & Fame***

| *System* | *Function* |
| ----- | ----- |
| ***Guild EXP*** | *Earned from dungeon clears, boss kills, event outcomes* |
| ***Fame*** | *Gained from leaderboard placement, trait events, and long-term play* |
| ***Guild Level*** | *Unlocks more roster slots, better recruit odds, and cosmetic frames* |

#### ***Leveling Rewards***

* *\+1 Roster Slot every level (max 30 planned)*

* *\+5% chance to encounter Rare/Epic recruits*

* *Unlocks Guild Hall cosmetics, title cards*

### ***🧲 Recruitment System***

*There are three core recruitment paths:*

1. ***Looking for Guild Board***

   * *Rotating list of potential recruits*

   * *Shows class, trait, level, gear preview*

   * *Players may reroll options daily (uses Fame)*

2. ***Scout Other Guilds***

   * *Browse AI-controlled guild rosters*

   * *Attempt to recruit using persuasion (dialogue check \+ Fame cost)*

   * *Results influenced by shared class/trait preferences*

3. ***Incoming Applications***

   * *Recruits apply based on dungeon success or unique events*

   * *Higher Guild Level improves quality*

   * *May include pre-leveled or pre-affinitized characters*

### ***🚫 Roster Limits & Retirement***

* *Total characters capped by Guild Level*

* *Retiring a character is permanent but grants:*

  * *Partial Guild EXP refund*

  * *Transfer token (move trait or gear to a new character — future scope)*

### ***🧠 Trait Variety Rules***

* *Duplicate traits are allowed in roster, but discouraged*

* *Only **one exact duplicate** of a class \+ trait combo allowed at a time*

### ***🛠 Guild Upgrades (Planned)***

* *Systems to passively:*

  * *Train benched characters*

  * *Boost gear drop rates*

  * *Improve crafting yields*

* *Unlocked via Guild Level or mini-events*

---

## **🧱 11.1 Guild Management System Implementation Specification**

### **Overview**
Complete implementation requirements for the guild management system, including roster management, recruitment, progression, and guild operations.

### **User Stories**
- As a player, I want to manage my guild roster so that I can optimize team compositions for different challenges
- As a player, I want to recruit new characters so that I can expand my strategic options
- As a player, I want to see guild progression so that I feel rewarded for long-term investment
- As a player, I want to customize my guild identity so that I feel ownership over my MMO guild

### **Acceptance Criteria**
- [ ] Guild can recruit and manage up to 30 characters based on guild level
- [ ] Recruitment system provides daily rotating options with reroll mechanics
- [ ] Guild level progression unlocks new features and roster capacity
- [ ] Character retirement system works correctly with proper resource refunds
- [ ] Guild customization options are unlocked through progression

### **Technical Requirements**

#### **Input Handling**
- **Recruitment**: Browse, filter, and select new characters
- **Roster Management**: Drag & drop characters between active/bench positions
- **Guild Operations**: Access crafting, leaderboards, and settings
- **Customization**: Modify guild name, banner, and motto

#### **Output Processing**
- **Roster Display**: Grid/list view with character information and status
- **Progression Feedback**: Visual indicators for guild level and fame gains
- **Recruitment Results**: Clear feedback on recruitment success/failure
- **Resource Management**: Display of guild resources and upgrade costs

#### **Dependencies**
- **Character Database**: Stores all recruited character data
- **Progression System**: Tracks guild level, fame, and unlockables
- **Recruitment Engine**: Generates and manages potential recruits
- **Save System**: Persists guild state and character progress

#### **Edge Cases**
- **Roster Limits**: Handle attempts to exceed maximum capacity
- **Duplicate Prevention**: Manage character uniqueness constraints
- **Save Corruption**: Handle corrupted save data gracefully
- **Version Migration**: Support for save file format updates

### **Content Specifications**

#### **Guild Level Progression (1-20)**
| Level | Roster Slots | Unlock | Fame Cost |
|-------|--------------|---------|-----------|
| 1 | 5 | Basic recruitment | 0 |
| 2 | 6 | Guild banner customization | 100 |
| 3 | 7 | Crafting station | 250 |
| 4 | 8 | Advanced recruitment | 500 |
| 5 | 9 | Guild motto | 750 |
| 6 | 10 | Solo quests | 1000 |
| 7 | 11 | Enhanced crafting | 1500 |
| 8 | 12 | Guild hall upgrades | 2000 |
| 9 | 13 | Advanced events | 3000 |
| 10 | 14 | Legendary recruitment | 4000 |
| 15 | 19 | Elite features | 10000 |
| 20 | 30 | Master guild status | 25000 |

#### **Recruitment System Content**
- **Daily Recruits**: 6-8 characters available per day
- **Rarity Distribution**: 60% Common, 30% Rare, 8% Epic, 2% Legendary
- **Reroll Cost**: 50 Fame per reroll (maximum 3 per day)
- **Recruit Quality**: Based on guild level and fame standing

#### **Character Retirement System**
- **Retirement Cost**: 100 Fame per character
- **Resource Refund**: 50% of invested materials returned
- **Guild EXP**: 25% of character's earned EXP refunded
- **Transfer Token**: 1 token per retirement (future feature)

### **Balancing Parameters**

#### **Progression Rates**
- **Guild EXP**: 100-500 per dungeon clear (difficulty-based)
- **Fame Gain**: 25-100 per leaderboard placement
- **Level Requirements**: Exponential scaling (1000, 2000, 4000, 8000, etc.)
- **Recruitment Odds**: Improved by 5% per guild level

#### **Resource Costs**
- **Recruitment**: 0-500 Fame based on character rarity
- **Reroll**: 50 Fame per attempt
- **Retirement**: 100 Fame per character
- **Customization**: 100-1000 Fame per unlock

#### **Time Constraints**
- **Daily Reset**: Recruitment options refresh at midnight UTC
- **Reroll Limit**: Maximum 3 rerolls per day
- **Solo Quest Cooldown**: 1 quest per character per day
- **Event Frequency**: 1-3 events per week

### **Implementation Requirements**

#### **Data Structure**
```json
{
  "guild_data": {
    "guild_id": "unique_identifier",
    "name": "Guild Name",
    "banner": "banner_asset_id",
    "motto": "Guild motto text",
    "level": 5,
    "experience": 2500,
    "fame": 1250,
    "roster_capacity": 9,
    "unlocked_features": ["banner", "crafting", "motto"],
    "daily_recruits": ["char1", "char2", "char3"],
    "rerolls_used": 1,
    "last_reset": "2024-01-01T00:00:00Z"
  },
  "roster": {
    "active_characters": ["char1", "char2", "char3", "char4", "char5"],
    "benched_characters": ["char6", "char7", "char8"],
    "character_data": {
      "char1": {
        "id": "char1",
        "name": "Character Name",
        "class": "warrior",
        "specialization": "guardian",
        "trait": "theorycrafter",
        "level": 15,
        "morale": 85,
        "gear_score": 1250
      }
    }
  }
}
```

#### **Performance Requirements**
- **Guild Hall Load**: < 2 seconds for maximum roster size
- **Recruitment Generation**: < 500ms for daily recruit list
- **Roster Operations**: < 100ms for drag & drop operations
- **Save Operations**: < 1 second for full guild state
- **Memory Usage**: < 200MB for maximum guild size

### **Web Implementation Notes**
- Use **LocalStorage/IndexedDB** or in-memory store for guild data persistence
- Implement **client-side routing** for guild hall navigation
- Use a **component framework** and HTML5 Drag & Drop for roster management
- Leverage **LocalStorage/IndexedDB** for save/load operations
- Implement an **event bus** for guild state changes
- Use **CSS/Canvas animations** for UI transitions and feedback

---

## ***🌐 12\. Meta-Systems: Leaderboards, Solo Quests, Yes, Your GM***

*GOAT's metagame systems reward creativity, long-term investment, and humor. These systems give your guild identity beyond combat and contribute to persistent progression.*

### ***🏆 Leaderboards***

Each dungeon exposes two leaderboards, and there are two global leaderboards:

#### Per-Dungeon Boards
- **World First**: Tracks the first 100 unique guild clears ordered by UTC datetime. Once filled, the board is locked for that dungeon/season.
- **Speedrun**: Tracks fastest clear times per dungeon. Multiple entries per guild may be stored, but the board view shows the guild's best run. Also captures total turns and party composition (class + trait per character).

Per-run data captured:
- Guild name/id
- Dungeon id
- Clear datetime (UTC)
- Clear time (ms)
- Total turns
- Party composition (class + trait per character)
- Build/season version

#### Global Boards
- **Global World First**: Aggregates world-first placements across all dungeons into a global standing (policy: rank points per placement).
- **Global Speedrun**: Aggregates the best-per-guild-per-dungeon speedrun results across all dungeons to rank the fastest guilds overall.

#### Seasons
- Boards reset seasonally with archival; past seasons remain browsable.
- Season boundary and version are stored per entry for auditability.

Design Note: Leaderboards reinforce strategic optimization and competitive expression through both discovery (world first) and mastery (speedrun). Traits and composition variety are encouraged.

### ***🎒 Solo Quests (Offscreen Missions)***

*Benched characters can be assigned **solo quests** between dungeons.*

* *Runs parallel to main dungeon flow*  
* *One quest per benched character (limit: 2 active)*

#### ***Quest Parameters***

* ***Theme**: e.g. "Gather Herbs", "Train Recruits", "PvP Duel"*  
* ***Duration**: 1 dungeon run*  
* ***Success Chance**: Based on Trait synergy or match*  
* ***Outcome Range**: Failure / Partial / Success*

#### ***Rewards***

* *EXP for benched character*  
* *Crafting materials or gold*  
* *Temporary morale or affinity boosts*  
* *Rare chance of triggering a Mini-Event or Whisper*

*Purpose: Add passive reward flow \+ make bench management meaningful.*

### ***🎭 "Yes, Your GM" — Mini-Events***

*After each dungeon run, one **random event** may trigger based on:*

* *Traits in the active party*  
* *Combat outcomes*  
* *Affinity scores*

#### ***Event Format***

* *Text-based popup with brief setup and 2–3 choice options*  
* *Includes direct character quotes (uses Trait Barks)*

#### ***Examples***

* ***Pie Duel**: Bard and Cleric argue over buffs*  
* ***DPS Greed**: Rogue refuses to pass gear*  
* ***Injury Report**: Monk requests rest for morale*

#### ***Effects***

* *Morale changes*  
* *Affinity gain/loss*  
* *Temporary buffs/debuffs for next dungeon*  
* *Fame gains/losses if decision goes public (Whispers)*

*"Yes, Your GM" events turn downtime into storytelling. Over time, these build your guild's reputation and history.*

---

## ***🧭 13\. UI & Game Flow***

*GOAT presents a modular, clear UI system that reinforces its layered gameplay. Every interaction — from party management to dungeon results — happens within stylized but information-rich scenes.*

### ***🏠 Guild Hall (Main Hub)***

* *Central access point to:*  
  * ***Roster View***  
  * ***Recruitment Board***  
  * ***Party Builder***  
  * ***Crafting Station***  
  * ***Leaderboards***  
  * ***Settings & Saves***  
* *Shows guild level, fame, and visual customizations*

### ***🧙 Roster & Party Management***

* *Grid/list toggle of all characters*  
* *Shows: level, trait, class, morale, gear score, affinity lines*  
* *Drag and drop into party slots*  
* *Search / Sort / Filter by:*  
  * *Trait category*  
  * *Class role*  
  * *Primary/secondary stat focus*  
  * *Morale threshold*  
  * *Affinity presence (highlight pair synergies)*

#### Specialization Management
- Players can switch a character's specialization at any time in the Guild Hall.
- A dedicated two-option Spec Selection panel (per base class) mirrors familiar MMO flows: shows spec names, roles, brief kit summary, and key skills. Confirm swaps with a short cooldown lock and optional cost (future scope).

### ***🗺 Dungeon Selection Screen***

* *World map or dungeon list with:*  
  * *Leaderboard badges (World First filled? Your best Speedrun time)*  
  * *Enemy archetypes preview (e.g., Aggressor/Disruptor mix)*  
  * *Recommended level & trait tips*  
  * *Optional challenges/lockouts (seasonal/weekly)*  
  * *Preview of themed rewards (drop table summary)*

### ***⚔ Combat Interface***

* *Left panel: party (HP, CDs, buffs)*  
* *Right panel: enemies (same info)*  
* *Center: turn queue tracker*  
* *Bottom: skill bar (active, greyed out if on cooldown)*  
* *Status badges with durations for keywords (Stun, Slow, Burn, Poison, Bleed, Silence, Shield, Overdrive, Mark, Camouflage)*  
* *Immunity/resistance indicators when applicable*  
* *Row/slot position indicators (front/back) influencing targeting previews*  
* *Optional: trait tooltips on hover, bark overlays, log recap*

### ***📦 Post-Dungeon Screen***

* *Outcome: win/loss, clear time, total turns*  
* *Party summary (class + trait per character) and per-character outcomes (HP/morale)*  
* *EXP and loot breakdown (base + bonus rewards)*  
* *Leaderboard submission confirmation (world-first and speedrun), with rank delta if applicable*  
* *Revive Token flow (between fights only) and usage tracker*  
* *Morale and Affinity deltas (per character, with reasons)*  
* *Event or Solo Quest results summary*

### ***🏆 Leaderboard UI***

* *Per-dungeon and global*  
* *Columns:*  
  * *Guild name*  
  * *Party composition (class icons \+ trait tags)*  
  * *Time*  
* *Clicking opens gear summary and positioning preview*

### ***💬 Chat System UI***

* *\[Guild\], \[Local\], \[Whispers\] tabs*  
* *Barks appear inline with combat or event logs*  
* *Whispers used for Solo Quest returns or event consequences*

### ***⚙️ Settings***
* *Audio: master/music/SFX sliders; mute toggles*
* *UI: bark frequency (Full / Important Only / None), combat popups for critical barks*
* *Accessibility: colorblind‑safe status badges, font scaling, reduced VFX mode*
* *Gameplay: tutorial replay, confirmation prompts for Revive Tokens*

*Design Goal: Deliver fast, clear player feedback without sacrificing charm or narrative flavor.*

---

## **🧭 13.1 UI & Game Flow Implementation Specification**

### **Overview**
Complete implementation requirements for the user interface system, including navigation flow, information display, and accessibility features for optimal player experience.

### **User Stories**
- As a player, I want to navigate between game systems quickly so that I can focus on strategic decisions
- As a player, I want clear information display so that I can understand my guild's status at a glance
- As a player, I want responsive controls so that my interactions feel smooth and natural
- As a player, I want accessible UI options so that I can customize the experience to my needs

### **Acceptance Criteria**
- [ ] All UI screens load within 2 seconds and respond to input within 100ms
- [ ] Navigation between major systems requires maximum 2 clicks/taps
- [ ] Information density is appropriate for both new and experienced players
- [ ] Accessibility features work correctly across all UI elements
- [ ] UI scales appropriately for different screen resolutions and orientations

### **Technical Requirements**

#### **Input Handling**
- **Mouse/Touch**: Support for both input methods with appropriate feedback
- **Keyboard**: Full keyboard navigation for accessibility
- **Controller**: Gamepad support for console-like experience
- **Gestures**: Swipe and pinch gestures for mobile-friendly interactions

#### **Output Processing**
- **Visual Feedback**: Immediate response to all user actions
- **Audio Feedback**: Contextual sound effects for UI interactions
- **Haptic Feedback**: Vibration feedback for mobile devices
- **Animation**: Smooth transitions between states and screens

#### **Dependencies**
- **Scene Management**: Handles UI screen transitions and state
- **Input System**: Processes all user input methods
- **Audio System**: Manages UI sound effects and feedback
- **Localization**: Supports multiple languages and text scaling

#### **Edge Cases**
- **Screen Resolution**: Handle extreme aspect ratios gracefully
- **Input Lag**: Maintain responsiveness during heavy operations
- **Memory Constraints**: Efficient UI rendering for low-end devices
- **Accessibility**: Support for screen readers and assistive technologies

### **Content Specifications**

#### **Required UI Screens (Phase 1)**
- **Main Menu**: New game, continue, settings, credits
- **Guild Hall**: Central hub with navigation to all systems
- **Roster Management**: Character grid/list with detailed information
- **Party Builder**: Drag & drop interface for team composition
- **Dungeon Selection**: World map with difficulty indicators
- **Combat Interface**: Turn-based battle UI with skill management
- **Post-Dungeon**: Results, rewards, and progression summary
- **Leaderboards**: Global and per-dungeon rankings
- **Settings**: Audio, UI, accessibility, and gameplay options

#### **Information Display Hierarchy**
- **Primary Information**: Always visible (HP, cooldowns, turn order)
- **Secondary Information**: Available on hover/tap (detailed stats, tooltips)
- **Tertiary Information**: Accessible through menus (full character sheets, logs)
- **Contextual Information**: Appears when relevant (trait effects, affinity bonuses)

#### **UI Component Specifications**
- **Buttons**: Minimum 44x44 pixels for touch targets, clear hover states
- **Tooltips**: Appear after 0.5 seconds, disappear after 2 seconds of inactivity
- **Modals**: Darken background, prevent interaction with underlying content
- **Scrollbars**: Visible when content exceeds container, smooth scrolling
- **Loading Indicators**: Progress bars or spinners for operations > 1 second

### **Balancing Parameters**

#### **Performance Targets**
- **Frame Rate**: Maintain 60 FPS during UI interactions
- **Load Times**: < 2 seconds for major screen transitions
- **Memory Usage**: < 100MB for UI system total
- **Input Lag**: < 16ms (1 frame at 60 FPS) for button responses

#### **Accessibility Standards**
- **Color Contrast**: Minimum 4.5:1 ratio for text and interactive elements
- **Text Scaling**: Support for 100% to 200% text size increase
- **Focus Indicators**: Clear visual focus for keyboard navigation
- **Screen Reader**: Full compatibility with assistive technologies

#### **User Experience Metrics**
- **Task Completion**: 95% of users can complete core tasks without help
- **Error Rate**: < 5% of user actions result in errors or confusion
- **Learning Curve**: New users can navigate basic functions within 5 minutes
- **Satisfaction**: Target 4.5/5 rating for UI usability

### **Implementation Requirements**

#### **Data Structure**
```json
{
  "ui_screen": {
    "screen_id": "guild_hall",
    "name": "Guild Hall",
    "layout": "grid_3x2",
    "components": [
      {
        "component_id": "roster_button",
        "type": "button",
        "position": {"x": 0, "y": 0},
        "size": {"width": 200, "height": 100},
        "text": "Roster",
        "icon": "roster_icon",
        "action": "navigate_to_roster",
        "accessibility": {
          "label": "Roster Management",
          "description": "View and manage your guild characters"
        }
      }
    ],
    "navigation": {
      "previous": "main_menu",
      "next": ["roster", "party_builder", "dungeon_select"],
      "escape": "main_menu"
    }
  }
}
```

#### **Performance Requirements**
- **UI Rendering**: < 16ms per frame for smooth 60 FPS
- **Input Processing**: < 8ms for input to response cycle
- **Memory Allocation**: < 1MB per UI screen
- **Asset Loading**: < 500ms for UI texture and audio assets

### **Web Implementation Notes**
- Use a **component framework** (React/Svelte/Vue) or Web Components for UI
- Implement **router** for screen management and transitions
- Utilize **UI Theme System** for consistent visual styling
- Leverage **Animation System** for smooth transitions and feedback
- Implement **Input System** for customizable control schemes
- Use **JSON/TypeScript config** for UI data and configuration
- Leverage **portal/modal patterns** or **Canvas** for overlays and modals
- Implement **Accessibility** features using semantic HTML, ARIA roles, and focus management

### **Accessibility Implementation**
- **Screen Reader Support**: Use semantic HTML and ARIA roles
- **Keyboard Navigation**: Implement focus management with Tab/Shift+Tab
- **High Contrast Mode**: Provide alternative color schemes
- **Text Scaling**: Use dynamic font sizing based on user preferences
- **Audio Cues**: Provide audio feedback for visual-only information
- **Motion Reduction**: Respect user's motion sensitivity preferences

## ***🎓 14\. Tutorial Design – Guildmaster Certification Simulation***

*GOAT opens with a short, flavorful tutorial embedded in the world's fiction: a **Guildmaster Certification Trial** — a simulated onboarding exam for new MMO guild leaders.*

### ***🧠 Tutorial Philosophy***

* *Teach combat flow, trait interaction, positioning, and morale*  
* *Keep tone humorous and meta-aware*  
* *Lasts under 10 minutes*  
* *Prevent failure, but allow experimentation*

### ***🧪 Narrative Framing***

* *Set inside a holographic arena called the **Guildmaster Certification Room***  
* *Overseen by an AI NPC known as **"The Moderator"** — a sarcastic, all-knowing tutorial narrator*  
* *Tutorial characters are simulations with clearly labeled tags (e.g. "Simulated Warrior")*

### ***🧩 Tutorial Sequence (Scripted)***

1. ***Welcome & Trait Intro***  
   * *The Moderator introduces the concept of IRL Traits*  
   * *Tooltips show Trait effects and bark lines*  
2. ***Turn Order & Basic Attack***  
   * *1v1 with Warrior vs Dummy*  
   * *Learns turn queue and cooldown-less Basic Attacks*  
3. ***Skills & Cooldowns***  
   * *Adds Cleric and Mage to party*  
   * *Uses one skill per class to observe cooldown flow*  
4. ***Positioning & Zones***  
   * *Introduces front/back row logic*  
   * *Mage is targeted unless positioned in backline*  
5. ***Morale & Trait Conflict***  
   * *Trigger a scripted moment where the Cleric misuses a skill and the Moderator comments on morale loss*  
6. ***Final Wave – Mini Encounter***  
   * *Fight 3 Dummies with cooldowns refreshed*  
   * *Trainee must apply trait, targeting, and healing knowledge*

### ***🏆 Tutorial End***

* *Player receives:*  
  * ***\+1 Guild Fame***  
  * ***\+1 Revive Token***  
  * *Unlocks full access to:*  
    * *Guild Hall*  
    * *Party Management*  
    * *First Dungeon: Craghold Excavation*

*Design Note: The tutorial is repeatable from settings and intended to reflect the game's personality — snarky, strategic, and satirically self-aware.*

---

## **📋 Implementation Status & Next Steps**

### **✅ Completed Implementation Specifications**

#### **Phase 1: Core Systems (Ready for Development)**
1. **Combat System Implementation** (Section 2.1)
   - Complete technical requirements and balancing parameters
   - Godot 4.4.1 implementation notes included
   - Performance requirements and edge case handling defined

2. **IRL Trait System Implementation** (Section 3.1)
   - Full content specifications for 12-15 traits
   - Bark system implementation details
   - Data structures and performance requirements

3. **Guild Management System Implementation** (Section 11.1)
   - Complete guild progression and recruitment specifications
   - Roster management and retirement system details
   - Performance and scalability requirements

4. **Dungeon System Implementation** (Section 9.1)
   - Three complete dungeons with encounter specifications
   - Enemy AI behavior profiles and difficulty scaling
   - Content requirements and technical specifications

5. **UI & Game Flow Implementation** (Section 13.1)
   - Complete UI screen specifications and accessibility requirements
   - Performance targets and user experience metrics
   - Web implementation guidelines

### **🔄 Systems Requiring Implementation Specifications**

#### **Phase 2: Advanced Systems (Next Priority)**
1. **Morale System Implementation**
   - Specific morale calculation formulas
   - Event trigger specifications
   - UI integration requirements

2. **Combat Affinity System Implementation**
   - Affinity gain/loss mechanics
   - Threshold reward specifications
   - Narrative integration details

3. **Gear & Crafting System Implementation**
   - Item generation algorithms
   - Upgrade cost balancing
   - Set bonus specifications

4. **Leaderboard System Implementation**
   - Scoring algorithms and ranking
   - Data persistence requirements
   - Anti-cheat measures

#### **Phase 3: Meta-Systems (Future Scope)**
1. **Solo Quest System Implementation**
   - Quest generation algorithms
   - Success/failure mechanics
   - Reward distribution

2. **"Yes, Your GM" Event System**
   - Event trigger conditions
   - Choice consequence specifications
   - Narrative branching logic

3. **Tutorial System Implementation**
   - Step-by-step progression
   - Failure prevention mechanics
   - Learning outcome validation

### **📊 Content Creation Requirements**

#### **Immediate Needs (Phase 1)**
- **12-15 Complete IRL Traits**: All effects, downsides, and bark pools
- **3 Dungeon Environments**: Complete encounter designs and enemy specifications
- **5 Base Classes + 10 Specializations**: Skill kits and balancing
- **Basic Gear Sets**: Common through legendary items with set bonuses

#### **Short-term Needs (Phase 2)**
- **20+ Mini-Events**: "Yes, Your GM" scenarios with branching choices
- **30+ Bark Lines**: Per trait for all trigger categories
- **Affinity Milestone Rewards**: Unique bonuses and narrative moments
- **Guild Customization Options**: Banners, mottos, and visual themes

#### **Long-term Needs (Phase 3)**
- **Seasonal Content**: New dungeons, traits, and events
- **Advanced Guild Features**: Training systems, passive bonuses
- **Social Features**: Guild sharing, challenge modes
- **Expansion Content**: New classes, regions, and storylines

### **🔧 Technical Implementation Priorities**

#### **Web Compatibility**
- **Data Modules**: JSON/TypeScript-based data management
- **Routing**: Efficient client-side transitions and state management
- **Performance Optimization**: 60 FPS target across all systems
- **Memory Management**: Efficient asset loading and cleanup

#### **Development Workflow**
- **Modular Architecture**: Systems that can be developed independently
- **Data-Driven Design**: Easy content creation and balancing
- **Testing Framework**: Automated testing for core systems
- **Performance Profiling**: Continuous monitoring of system performance

### **📈 Success Metrics & Validation**

#### **Player Experience Targets**
- **Tutorial Completion**: 95% of players complete tutorial in < 10 minutes
- **First Dungeon Success**: 80% of players complete first dungeon on first attempt
- **Session Retention**: Average session length 20-45 minutes
- **Return Rate**: 70% of players return within 24 hours

#### **Technical Performance Targets**
- **Load Times**: < 3 seconds for all major systems
- **Frame Rate**: Consistent 60 FPS during gameplay
- **Memory Usage**: < 500MB total application memory
- **Save/Load**: < 1 second for all save operations

#### **Content Quality Targets**
- **Trait Balance**: No single trait provides > 20% advantage
- **Difficulty Curve**: Smooth progression from beginner to advanced
- **Replayability**: 10+ hours before content repetition
- **Emergent Gameplay**: New strategies discovered after 20+ hours

---

*This implementation status document serves as a roadmap for development teams. All Phase 1 systems are ready for immediate development with complete specifications. Phase 2 systems should be prioritized based on player feedback and development capacity. Regular updates to this document will track progress and identify new requirements.*
