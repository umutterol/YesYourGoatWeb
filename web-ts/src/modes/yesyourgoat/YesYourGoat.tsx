import { useEffect, useState } from 'react'
import ReignsScreen from '../../components/Reigns/ReignsScreen'
import { calculateChaosChance, getAvailableChaosEvents, drawChaosEvent } from '../../utils/chaosEvents'
import type { ChaosEvent } from '../../utils/chaosEvents'
import { calculateGlitchChance, getAvailableGlitchEvents, drawGlitchEvent } from '../../utils/glitchEvents'
import type { GlitchEvent } from '../../utils/glitchEvents'
import { calculateGameMasterChance, getAvailableGameMasterOffers, drawGameMasterOffer, applyGameMasterEffects } from '../../utils/gameMasters'
import type { GameMasterOffer } from '../../utils/gameMasters'
import { getCurrentMetaNarrativePhase, getPhaseEventModifiers } from '../../utils/metaNarrativeProgression'
import { getAvailableNarrativeEvents, getNarrativeEventChance } from '../../utils/narrativeEvents'
import type { NarrativeEvent } from '../../utils/narrativeEvents'

type Meters = { funds: number; reputation: number; readiness: number }
type Effects = Partial<Meters> & Record<string, number>
type Choice = { label: string; effects: Effects; nextStep?: string }
type EventCard = { id: string; title: string; body: string; tags?: string[]; speaker?: string; portrait?: string; weights?: { base?: number }; left: Choice; right: Choice }

// Legacy Points System
type LegacyPoints = {
  martyr: number;      // High rep, low funds collapses
  pragmatist: number;  // Balanced collapses  
  dreamer: number;     // High readiness, low rep collapses
  survivor: number;    // Deck exhaustion collapses
  legend: number;      // High all meters collapses
}

type CollapseType = 'martyr' | 'pragmatist' | 'dreamer' | 'survivor' | 'legend' | 'unknown'

const CLAMP_MIN = 0, CLAMP_MAX = 10
function clamp(v: number) { return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, v)) }

// Legacy Points System Functions
function determineCollapseType(meters: Meters, cause: string): CollapseType {
  const { funds, reputation, readiness } = meters
  
  // Check for deck exhaustion
  if (cause === 'exhausted') return 'survivor'
  
  // Check for high all meters (legend) - all meters were high before collapse
  if (funds >= 7 && reputation >= 7 && readiness >= 7) return 'legend'
  
  // Check for martyr (high rep, low funds) - reputation was high but funds were low
  if (reputation >= 6 && funds <= 4) return 'martyr'
  
  // Check for dreamer (high readiness, low rep) - readiness was high but reputation was low
  if (readiness >= 6 && reputation <= 4) return 'dreamer'
  
  // Check for pragmatist (balanced) - all meters were reasonably balanced
  const balance = Math.abs(funds - reputation) + Math.abs(funds - readiness) + Math.abs(reputation - readiness)
  if (balance <= 6) return 'pragmatist'
  
  // Default to pragmatist for any other balanced collapse
  return 'pragmatist'
}

function updateLegacyPoints(legacyPoints: LegacyPoints, collapseType: CollapseType): LegacyPoints {
  const newPoints = { ...legacyPoints }
  
  switch (collapseType) {
    case 'martyr':
      newPoints.martyr += 1
      break
    case 'pragmatist':
      newPoints.pragmatist += 1
      break
    case 'dreamer':
      newPoints.dreamer += 1
      break
    case 'survivor':
      newPoints.survivor += 1
      break
    case 'legend':
      newPoints.legend += 1
      break
    case 'unknown':
      // No points for unknown collapse types
      break
  }
  
  return newPoints
}

const EVENTS_URL = '/events/packs/yesyourgoat/tutorial_and_characters.json'

export default function YesYourGoat() {
  const [meters, setMeters] = useState<Meters>({ funds: 5, reputation: 5, readiness: 5 })
  const [day, setDay] = useState(1)
  const [events, setEvents] = useState<EventCard[]>([])
  const [current, setCurrent] = useState<EventCard | null>(null)
  const [sawRival, setSawRival] = useState(false)
  const [victoryText, setVictoryText] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [chaosEvent, setChaosEvent] = useState<ChaosEvent | null>(null)
  const [glitchEvent, setGlitchEvent] = useState<GlitchEvent | null>(null)
  const [gameMasterOffer, setGameMasterOffer] = useState<GameMasterOffer | null>(null)
  const [summaryMeters, setSummaryMeters] = useState<Meters | null>(null)
  const [summaryDay, setSummaryDay] = useState<number | null>(null)
  const [previousMeters, setPreviousMeters] = useState<Meters | null>(null)
  const [collapseHistory, setCollapseHistory] = useState<Array<{ collapseType: string; day: number }>>([])
  const [legacyPoints, setLegacyPoints] = useState<LegacyPoints>({
    martyr: 0,
    pragmatist: 0,
    dreamer: 0,
    survivor: 0,
    legend: 0
  })

  const collapseCount = Number(localStorage.getItem('yyg_collapse_count') || '0')

  // Meta-narrative progression
  const runCount = collapseCount + 1
  const currentMetaPhase = getCurrentMetaNarrativePhase(legacyPoints, runCount)
  const [narrativeEvent, setNarrativeEvent] = useState<NarrativeEvent | null>(null)

  // Load legacy points from localStorage
  useEffect(() => {
    const savedLegacy = localStorage.getItem('yyg_legacy_points')
    if (savedLegacy) {
      try {
        const parsed = JSON.parse(savedLegacy)
        setLegacyPoints(parsed)
      } catch (e) {
        console.warn('Failed to parse legacy points:', e)
      }
    }
  }, [])

  // Save legacy points to localStorage
  useEffect(() => {
    localStorage.setItem('yyg_legacy_points', JSON.stringify(legacyPoints))
  }, [legacyPoints])

  const [usedEventIds, setUsedEventIds] = useState<string[]>([])
  // Raid cadence tracking (every 5th–7th event)
  const RAID_KEY = 'yyg_last_raid_index'
  const [lastRaidIndex, setLastRaidIndex] = useState<number | null>(null)
  // ---- Intro/tutorial gating & simple unlocks (persist across runs) ----
  type SeenState = { intro: Record<string, true>; tutorial: Record<string, true>; event: Record<string, true> }
  type MetaSeen = { council?: boolean; rival?: boolean; logs?: boolean }
  type ChainProgress = Record<string, number>
  const SEEN_KEY = 'yyg_seen'
  const CHOICE_KEY = 'yyg_choice'
  const META_KEY = 'yyg_meta_seen'
  const CHAIN_KEY = 'yyg_chain_progress'
  const LAST_SEEN_MAP_KEY = 'yyg_event_last_seen_day'
  const TUTORIAL_COMPLETED_KEY = 'yyg_tutorial_completed'

  const [seenState, setSeenState] = useState<SeenState>({ intro: {}, tutorial: {}, event: {} })
  const [choiceState, setChoiceState] = useState<Record<string, 'left' | 'right'>>({})
  const [metaSeen, setMetaSeen] = useState<MetaSeen>({})
  const [chainProgress, setChainProgress] = useState<ChainProgress>({})
  const [lastSeenDayMap, setLastSeenDayMap] = useState<Record<string, number>>({})
  const [tutorialCompleted, setTutorialCompleted] = useState(false)
  const [storylinesThisRun, setStorylinesThisRun] = useState<Set<string>>(new Set())

  function loadPersisted() {
    try { const s = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); if (s) setSeenState({ intro: s.intro || {}, tutorial: s.tutorial || {}, event: s.event || {} }) } catch {}
    try { const c = JSON.parse(localStorage.getItem(CHOICE_KEY) || '{}'); if (c) setChoiceState(c) } catch {}
    try { const m = JSON.parse(localStorage.getItem(META_KEY) || '{}'); if (m) setMetaSeen(m) } catch {}
    try { const cp = JSON.parse(localStorage.getItem(CHAIN_KEY) || '{}'); if (cp) setChainProgress(cp) } catch {}
    try { const lm = JSON.parse(localStorage.getItem(LAST_SEEN_MAP_KEY) || '{}'); if (lm) setLastSeenDayMap(lm) } catch {}
    try { const tc = localStorage.getItem(TUTORIAL_COMPLETED_KEY); if (tc === 'true') setTutorialCompleted(true) } catch {}
    // storylinesThisRun is cleared on each run start, not loaded
  }

  function persistSeen(next: SeenState) { setSeenState(next); localStorage.setItem(SEEN_KEY, JSON.stringify(next)) }
  function persistChoice(next: Record<string, 'left' | 'right'>) { setChoiceState(next); localStorage.setItem(CHOICE_KEY, JSON.stringify(next)) }
  function persistMeta(next: MetaSeen) { setMetaSeen(next); localStorage.setItem(META_KEY, JSON.stringify(next)) }
  function persistChain(next: ChainProgress) { setChainProgress(next); localStorage.setItem(CHAIN_KEY, JSON.stringify(next)) }

  function getRoleTag(e: EventCard): string | null { const t = (e.tags || []).find(x => x.startsWith('character:')); return t ? t.split(':')[1] : null }
  function parseChainTag(e: EventCard): { role: string; step: number } | null {
    const t = (e.tags || []).find(x => x.startsWith('chain:'))
    if (!t) return null
    const parts = t.split(':')
    if (parts.length >= 3) { const step = Number(parts[2]); if (Number.isFinite(step)) return { role: parts[1], step } }
    return null
  }

  function eligibleByRequirements(ev: EventCard): boolean {
    const tags = ev.tags || []
    
    // Check new-style conditions object
    if ((ev as any).conditions) {
      const conditions = (ev as any).conditions
      
      // Check chainProgress conditions
      if (conditions.chainProgress) {
        for (const [storyline, requirement] of Object.entries(conditions.chainProgress)) {
          const req = requirement as any
          const progress = chainProgress[storyline] || 0
          if (req.eq !== undefined && progress !== req.eq) return false
          if (req.gte !== undefined && progress < req.gte) return false
          if (req.lte !== undefined && progress > req.lte) return false
        }
      }
      
      // Check seen conditions
      if (conditions.seen && Array.isArray(conditions.seen)) {
        for (const eventId of conditions.seen) {
          if (!seenState.event?.[eventId]) return false
        }
      }
      
      // Check flags conditions
      if (conditions.flags) {
        // For now, just pass - flags aren't fully implemented yet
      }
      
      // Check legacy conditions
      if (conditions.legacy) {
        // For now, just pass - legacy isn't fully implemented yet
      }
    }
    
    // Check old-style tag-based requirements
    for (const t of tags) {
      if (!t.startsWith('require:')) continue
      const cond = t.slice('require:'.length)
      if (cond.startsWith('run>=')) {
        const n = Number(cond.split('>=')[1]); if ((collapseCount + 1) < n) return false
      } else if (cond.startsWith('intro:')) {
        const role = cond.replace('intro:', ''); if (!seenState.intro?.[role]) return false
      } else if (cond.startsWith('seen:event:')) {
        const id = cond.replace('seen:event:', ''); if (!seenState.event?.[id]) return false
      } else if (cond.startsWith('not:seen:event:')) {
        const id = cond.replace('not:seen:event:', ''); if (seenState.event?.[id]) return false
      } else if (cond.startsWith('choice:')) {
        const [, id, side] = cond.split(':'); if ((choiceState as any)[id] !== side) return false
      } else if (cond.startsWith('meter:')) {
        const m = cond.match(/meter:(funds|reputation|readiness)(<=|>=)(\d+)/); if (m) {
          const [, key, op, val] = m; const v = (meters as any)[key]; const n = Number(val)
          if (op === '<=' && !(v <= n)) return false
          if (op === '>=' && !(v >= n)) return false
        }
      } else if (cond.startsWith('meta:')) {
        const k = cond.replace('meta:', '') as keyof MetaSeen; if (!metaSeen[k]) return false
      } else if (cond.startsWith('chain:')) {
        const m = cond.match(/^chain:([^>]+)>=([0-9]+)$/); if (m) { const have = chainProgress[m[1]] || 0; if (have < Number(m[2])) return false }
      }
    }
    return true
  }

  function markPresented(ev: EventCard | null) {
    if (!ev) return
    const tags = ev.tags || []
    const role = getRoleTag(ev)
    const nextSeen: SeenState = { intro: { ...seenState.intro }, tutorial: { ...seenState.tutorial }, event: { ...seenState.event } }
    nextSeen.event[ev.id] = true
    if (tags.includes('meta:intro') && role) nextSeen.intro[role] = true
    if (tags.includes('tutorial')) nextSeen.tutorial[ev.id] = true
    persistSeen(nextSeen)

    const nextMeta: MetaSeen = { ...metaSeen }
    if (tags.includes('meta:council')) nextMeta.council = true
    if (tags.includes('meta:rival')) nextMeta.rival = true
    if (tags.includes('policy:logs')) nextMeta.logs = true
    persistMeta(nextMeta)

    const ch = parseChainTag(ev)
    if (ch) {
      const nextCP = { ...chainProgress }
      nextCP[ch.role] = Math.max(nextCP[ch.role] || 0, ch.step)
      persistChain(nextCP)
    }
    // Track last seen day for cooldown/decay weighting
    if (ev?.id) {
      const nextLM = { ...lastSeenDayMap, [ev.id]: day }
      setLastSeenDayMap(nextLM)
      localStorage.setItem(LAST_SEEN_MAP_KEY, JSON.stringify(nextLM))
    }
  }
  
  // Platform features available for future use
  // const platformFeatures = usePlatformFeatures()

  useEffect(() => {
    // Keyboard fallback: Left/Right arrows trigger choices
    function onKey(e: KeyboardEvent) {
      if (!current) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        decide('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        decide('right')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current])

  useEffect(() => {
    loadPersisted()
    fetch(EVENTS_URL).then(r => r.json()).then((data: EventCard[]) => {
      setEvents(data)
      const intro = data.find(e => (e.tags || []).includes('run:intro'))
      setCurrent(intro || null)
      markPresented(intro || null)
    }).catch(err => console.error('YYG load error', err))

    // restore basic meta
    const cc = Number(localStorage.getItem('yyg_collapse_count') || '0')
    if (!Number.isNaN(cc)) {
      // no-op for now; kept for future UI
    }
    // restore last raid index
    const storedRaid = Number(localStorage.getItem(RAID_KEY) || '')
    if (!Number.isNaN(storedRaid) && storedRaid > 0) setLastRaidIndex(storedRaid)
  }, [])

  function collapseIfAnyZero(m: Meters): string | null {
    if (m.funds <= 0) return 'Collapse — Bankrupt Guild'
    if (m.reputation <= 0) return 'Collapse — Forgotten Name'
    if (m.readiness <= 0) return 'Collapse — Unready Roster'
    return null
  }

  function drawNext(): EventCard | null {
    if (!events.length) {
      console.log('No events loaded')
      return null
    }
    // Priority: active chain steps first
    const chainPool = events.filter(e => (e.tags || []).some(t => t.startsWith('chain:')))
      .filter(e => !usedEventIds.includes(e.id))
      .filter(e => eligibleByRequirements(e))
    if (chainPool.length > 0) {
      // Prefer next step for roles already in progress
      const prioritized = chainPool.sort((a, b) => {
        const ca = parseChainTag(a)
        const cb = parseChainTag(b)
        const ap = ca ? (chainProgress[ca.role] || 0) : 0
        const bp = cb ? (chainProgress[cb.role] || 0) : 0
        return bp - ap
      })
      return prioritized[0]
    }
    
    // Check for narrative events first (highest priority for story progression)
    const availableNarrativeEvents = getAvailableNarrativeEvents(
      currentMetaPhase.phase,
      legacyPoints,
      runCount,
      collapseHistory.map(c => c.collapseType)
    )
    
    if (availableNarrativeEvents.length > 0) {
      // Calculate narrative event chance based on phase modifiers
      const phaseModifiers = getPhaseEventModifiers(currentMetaPhase)
      const baseNarrativeChance = 0.25 * phaseModifiers.metaEvents
      
      if (Math.random() < baseNarrativeChance) {
        // Weight events by rarity and phase
        const weightedEvents = availableNarrativeEvents.map(event => ({
          event,
          weight: getNarrativeEventChance(event, currentMetaPhase.phase, 0.1)
        }))
        
        const totalWeight = weightedEvents.reduce((sum, w) => sum + w.weight, 0)
        if (totalWeight > 0) {
          let random = Math.random() * totalWeight
          for (const { event, weight } of weightedEvents) {
            random -= weight
            if (random <= 0) {
              setNarrativeEvent(event)
              return null // Will be handled by narrative event system
            }
          }
        }
      }
    }
    
    // Check for Game Master offers second
    const gameMasterChance = calculateGameMasterChance(meters, legacyPoints, day) * 
      getPhaseEventModifiers(currentMetaPhase).gameMasterChance
    if (Math.random() < gameMasterChance) {
      const availableOffers = getAvailableGameMasterOffers(legacyPoints)
      const offer = drawGameMasterOffer(availableOffers)
      if (offer) {
        setGameMasterOffer(offer)
        return null // Will be handled by game master system
      }
    }
    
    // Check for glitch events third
    const glitchChance = calculateGlitchChance(meters, legacyPoints, day) * 
      getPhaseEventModifiers(currentMetaPhase).glitchChance
    if (Math.random() < glitchChance) {
      const availableGlitchEvents = getAvailableGlitchEvents(meters, legacyPoints, day)
      const glitchEvent = drawGlitchEvent(availableGlitchEvents)
      if (glitchEvent) {
        setGlitchEvent(glitchEvent)
        return null // Will be handled by glitch event system
      }
    }
    
    // Check for chaos events fourth
    const chaosChance = calculateChaosChance(meters, legacyPoints, day) * 
      getPhaseEventModifiers(currentMetaPhase).chaosChance
    if (Math.random() < chaosChance) {
      const availableChaosEvents = getAvailableChaosEvents(meters, legacyPoints, day)
      const chaosEvent = drawChaosEvent(availableChaosEvents)
      if (chaosEvent) {
        setChaosEvent(chaosEvent)
        return null // Will be handled by chaos event system
      }
    }
    
    // Collapse override handled at decide time
    // Inject Raid Night check on a predictable cadence (every 5th–7th)
    const sinceLastRaid = lastRaidIndex == null ? day - 1 : day - lastRaidIndex
    if (sinceLastRaid >= 5) {
      const mustInject = sinceLastRaid >= 7
      const shouldInject = mustInject || Math.random() < 0.6 // prefer around 6th
      if (shouldInject) {
        const raidPool = events.filter(e => (e.tags || []).includes('raid_night_check'))
        if (raidPool.length > 0) {
          const raid = raidPool[Math.floor(Math.random() * raidPool.length)]
          // persist reservation point
          setLastRaidIndex(day)
          localStorage.setItem(RAID_KEY, String(day))
          return raid
        }
      }
    }
    // Determine council/rival cooldown from recent events (last 3)
    const recent3 = usedEventIds.slice(-3)
    const councilOnCooldown = recent3.some(id => (events.find(e => e.id === id)?.tags || []).includes('meta:council'))
    const rivalOnCooldown = recent3.some(id => (events.find(e => e.id === id)?.tags || []).includes('meta:rival'))

    // Council cadence ~ every 5 (ease early pressure) respecting cooldown
    if (!councilOnCooldown && day % 5 === 0) {
      const councilEvents = events.filter(e => (e.tags || []).includes('meta:council') && !usedEventIds.includes(e.id))
      if (councilEvents.length > 0) {
        // Randomly select from available council events
        const randomIndex = Math.floor(Math.random() * councilEvents.length)
        return councilEvents[randomIndex]
      }
    }
    // Ensure Rival at least once mid-run (~day 8), respecting cooldown
    if (!SawRivalMid() && day >= 8 && !rivalOnCooldown) {
      const rival = events.find(e => (e.tags || []).includes('meta:rival') && !usedEventIds.includes(e.id))
      if (rival) { setSawRival(true); return rival }
    }
    // Handle tutorial sequence first (days 1-4) - but only if not completed before
    if (day <= 4 && !tutorialCompleted) {
      const tutorialEvents = events
        .filter(e => (e.tags || []).includes('chain:tutorial:') && !usedEventIds.includes(e.id))
        .sort((a, b) => {
          // Ensure tutorial events appear in the correct order
          const order = ['intro_old_guildmaster', 'intro_three_meters', 'intro_choices_matter', 'intro_old_guildmaster_final']
          const aIndex = order.indexOf(a.id)
          const bIndex = order.indexOf(b.id)
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1
          return 0
        })
      if (tutorialEvents.length > 0) {
        return tutorialEvents[0]
      }
      // If we've seen all 4 tutorial events, mark tutorial as completed
      if (seenState.event['intro_old_guildmaster'] && 
          seenState.event['intro_three_meters'] && 
          seenState.event['intro_choices_matter'] && 
          seenState.event['intro_old_guildmaster_final']) {
        setTutorialCompleted(true)
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true')
      }
    }
    
    // Handle character-driven narrative progression (days 5-15)
    if (day <= 15) {
      const characterEvents = events
        .filter(e => {
          const tags = e.tags || []
          const isCharacterEvent = tags.includes('character:intro') || tags.includes('character:followup') || tags.includes('character:crisis')
          if (!isCharacterEvent || usedEventIds.includes(e.id)) return false
          
          // Extract storyline name from chain tag (e.g. "chain:leeroy:1" -> "leeroy")
          const chainTag = tags.find(t => t.startsWith('chain:'))
          if (chainTag) {
            const storyline = chainTag.split(':')[1]
            // Skip if this storyline already triggered in this run
            if (storylinesThisRun.has(storyline)) return false
          }
          
          return true
        })
        .sort((a, b) => {
          // Prioritize character progression: intro -> followup -> crisis
          const aTags = a.tags || []
          const bTags = b.tags || []
          const aPriority = aTags.includes('character:crisis') ? 3 : aTags.includes('character:followup') ? 2 : 1
          const bPriority = bTags.includes('character:crisis') ? 3 : bTags.includes('character:followup') ? 2 : 1
          return aPriority - bPriority
        })
      if (characterEvents.length > 0) {
        // Mark this storyline as used in this run
        const event = characterEvents[0]
        const chainTag = (event.tags || []).find(t => t.startsWith('chain:'))
        if (chainTag) {
          const storyline = chainTag.split(':')[1]
          const newStorylines = new Set(storylinesThisRun)
          newStorylines.add(storyline)
          setStorylinesThisRun(newStorylines)
        }
        return characterEvents[0]
      }
    }
    
    // Prefer unseen character/tutorial intros early in a fresh profile (slow onboarding)
    if (day <= 8) {
      const introPool = events
        .filter(e => (e.tags || []).includes('meta:intro') && !usedEventIds.includes(e.id))
        .filter(e => { const role = getRoleTag(e); return role ? !seenState.intro?.[role] : true })
      if (introPool.length > 0) {
        const idx = Math.floor(Math.random() * introPool.length)
        return introPool[idx]
      }
    }
    // Otherwise pick any archetype/meta non-intro/outro, filtered by unlocks
    const unlocked = new Set<string>(['general','witch','priest','rogue'])
    if (collapseCount >= 3) unlocked.add('merchant')
    if (collapseCount >= 7) unlocked.add('bard')
    if (collapseCount >= 10) unlocked.add('recruiter')
    let pool = events.filter(e => {
      const tags = e.tags || []
      if (tags.includes('run:intro') || tags.includes('run:outro')) return false
      if (tags.includes('tutorial')) return false // Tutorial events are handled separately
      if (tags.includes('character:intro') || tags.includes('character:followup') || tags.includes('character:crisis')) return false // Character events are handled separately
      if (tags.includes('meta:dungeon_progress')) return false
      if (tags.includes('meta:collapse')) return false
      if (tags.includes('disabled')) return false
      if (tags.some(t => t.startsWith('race:'))) return false
      if (usedEventIds.includes(e.id)) return false
      // Honor explicit cooldown:N (skip if seen within N days)
      const cdTag = tags.find(t => t.startsWith('cooldown:'))
      if (cdTag) {
        const n = Number(cdTag.split(':')[1])
        const last = lastSeenDayMap[e.id]
        if (Number.isFinite(n) && typeof last === 'number' && (day - last) < n) return false
      }
      // one-shot intros
      if (tags.includes('meta:intro')) { const role = getRoleTag(e); if (role && seenState.intro?.[role]) return false }
      // authoring-time gating
      if (!eligibleByRequirements(e)) return false
      const at = tags.find(t => t.startsWith('archetype:'))
      if (!at) return true
      const id = at.split(':')[1]
      return unlocked.has(id)
    })
    // Low-meter routing: prioritize events that touch low meters (≤3)
    const lowMeters: Array<keyof Meters> = []
    if (meters.funds <= 3) lowMeters.push('funds')
    if (meters.reputation <= 3) lowMeters.push('reputation')
    if (meters.readiness <= 3) lowMeters.push('readiness')
    if (lowMeters.length > 0) {
      const targeted = pool.filter(ev => {
        const effs = [ev.left?.effects || {}, ev.right?.effects || {}]
        return lowMeters.some(m => effs.some(eff => typeof eff[m] === 'number'))
      })
      if (targeted.length > 0) pool = targeted
    }
    // Bias: use event weights, aggressive anti-repetition, and balance meter targeting with narrative phases
    const bias = (ev: EventCard) => {
      const effects = [ev.left?.effects || {}, ev.right?.effects || {}]
      const dropsRep = effects.some(e => typeof e.reputation === 'number' && e.reputation < 0)
      const dropsReady = effects.some(e => typeof e.readiness === 'number' && e.readiness < 0)
      const dropsFunds = effects.some(e => typeof e.funds === 'number' && e.funds < 0)

      // Start with base weight from event data
      let w = ev.weights?.base || 1

      // Per-event soft cooldown/decay based on last seen day
      const last = lastSeenDayMap[ev.id]
      if (typeof last === 'number') {
        const delta = day - last
        if (delta <= 3) return 0 // cooldown window
        if (delta <= 6) w *= 0.5 // resume at 0.5 then back to 1.0
      }

      // Moderate anti-repetition: reduce weight for events that appeared in last 3 events
      const recentEvents = usedEventIds.slice(-3)
      if (recentEvents.includes(ev.id)) {
        console.log('Reducing weight for recent event:', ev.id, 'recent:', recentEvents)
        return 0.1 // Heavily reduce weight instead of blocking completely
      }

      // Moderate penalty for similar event types (same prefix) in recent history
      const eventPrefix = ev.id.split('_')[0]
      const similarRecentCount = recentEvents.filter(id => id.startsWith(eventPrefix)).length
      if (similarRecentCount > 0) {
        w = Math.max(0.1, w * (0.5 ** similarRecentCount)) // Moderate penalty
      }

      // Additional council cooldown at weight level
      const tags = ev.tags || []
      const isCouncil = tags.includes('meta:council')
      if (isCouncil && councilOnCooldown) {
        return 0
      }

      // Narrative phases: early (1-4), mid (5-10), late (11+)
      const isRival = tags.includes('meta:rival')
      const isMaintenance = tags.includes('meta:maintenance') || tags.includes('meta:pr')
      const isArchetype = tags.some(t => t.startsWith('archetype:')) || tags.some(t => t.startsWith('race:'))

      if (day <= 4) {
        // Early: favor archetype/race onboarding; suppress council/rival/maintenance
        if (isArchetype) w += 1
        if (isCouncil) w *= 0.3
        if (isRival) w *= 0.5
        if (isMaintenance) w *= 0.6
      } else if (day <= 10) {
        // Mid: allow rival/council, balanced
        if (isRival) w += 0.5
        if (isCouncil) w += 0.3
      } else {
        // Late: higher stakes meta/maintenance and council pressure
        if (isMaintenance) w += 0.7
        if (isCouncil) w += 0.5
      }

      // Balance meter targeting: steer toward the current highest meter to even out failures
      const highest = Math.max(meters.funds, meters.reputation, meters.readiness)
      if (meters.funds === highest && dropsFunds) w += 1
      if (meters.reputation === highest && dropsRep) w += 1
      if (meters.readiness === highest && dropsReady) w += 1

      return w
    }
    if (!pool.length) {
      console.log('No events available in pool, falling back to any unused event', { 
        totalEvents: events.length, 
        usedEventIds: usedEventIds.length,
        collapseCount,
        unlocked: Array.from(unlocked)
      })
      
      // Fallback: allow any non-intro/outro/collapse event that hasn't been used recently
      const fallbackPool = events.filter(e => {
        const tags = e.tags || []
        if (tags.includes('run:intro') || tags.includes('run:outro') || tags.includes('meta:collapse')) return false
        if (tags.includes('disabled')) return false
        if (tags.some(t => t.startsWith('race:'))) return false
        // Only exclude events used in the very last 2 events
        const veryRecent = usedEventIds.slice(-2)
        return !veryRecent.includes(e.id)
      })
      
      if (fallbackPool.length > 0) {
        console.log('Using fallback pool with', fallbackPool.length, 'events')
        const randomIndex = Math.floor(Math.random() * fallbackPool.length)
        return fallbackPool[randomIndex]
      }
      
      return null
    }
    const total = pool.reduce((a,e)=>a+bias(e),0)
    let r = Math.random()*total
    for (const ev of pool) {
      r -= bias(ev)
      if (r <= 0) return ev
    }
    return pool[pool.length-1]
  }

  function SawRivalMid() { return sawRival }

  function decide(side: 'left' | 'right') {
    // Handle narrative events first (highest priority for story progression)
    if (narrativeEvent) {
      const choice = side === 'left' ? narrativeEvent.left : narrativeEvent.right
      const nextMeters: Meters = { ...meters }
      
      // Apply effects
      Object.entries(choice.effects).forEach(([key, value]) => {
        if (key in nextMeters) {
          nextMeters[key as keyof Meters] = clamp(nextMeters[key as keyof Meters] + value)
        }
      })
      
      // Log the narrative event (removed debugLog)
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setNarrativeEvent(null)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      markPresented(nxt)
      return
    }
    
    // Handle Game Master offers second
    if (gameMasterOffer) {
      // Apply both visible and hidden effects
      const nextMeters = applyGameMasterEffects(meters, side, gameMasterOffer)
      
      // Log the game master offer (removed debugLog)
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setGameMasterOffer(null)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      markPresented(nxt)
      return
    }
    
    // Handle glitch events second
    if (glitchEvent) {
      const choice = side === 'left' ? glitchEvent.left : glitchEvent.right
      const nextMeters: Meters = { ...meters }
      
      for (const [k, v] of Object.entries(choice.effects || {})) {
        if (k in nextMeters && typeof v === 'number') {
          // @ts-expect-error key narrowing
          nextMeters[k] = clamp((nextMeters as any)[k] + v)
        }
      }
      
      // Log the glitch event (removed debugLog)
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setGlitchEvent(null)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      markPresented(nxt)
      return
    }
    
    // Handle chaos events third
    if (chaosEvent) {
      const choice = side === 'left' ? chaosEvent.left : chaosEvent.right
      const nextMeters: Meters = { ...meters }
      
      for (const [k, v] of Object.entries(choice.effects || {})) {
        if (k in nextMeters && typeof v === 'number') {
          // @ts-expect-error key narrowing
          nextMeters[k] = clamp((nextMeters as any)[k] + v)
        }
      }
      
      // Log the chaos event (removed debugLog)
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setChaosEvent(null)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      return
    }
    
    if (!current) return
    const choice = side === 'left' ? current.left : current.right
    const nextMeters: Meters = { ...meters }
    
    // Handle both old and new effect schemas
    const effects = choice.effects || {}
    
    // Check if using new nested schema (has 'meters' property)
    if (effects.meters && typeof effects.meters === 'object') {
      // New schema: effects.meters.funds, effects.meters.reputation, etc.
      for (const [k, v] of Object.entries(effects.meters)) {
        if (k in nextMeters && typeof v === 'number') {
          // @ts-expect-error key narrowing
          nextMeters[k] = clamp((nextMeters as any)[k] + v)
        }
      }
    } else {
      // Old schema: effects.funds, effects.reputation, etc.
      for (const [k, v] of Object.entries(effects)) {
        if (k in nextMeters && typeof v === 'number') {
          // @ts-expect-error key narrowing
          nextMeters[k] = clamp((nextMeters as any)[k] + v)
        }
      }
    }
    // debugLog removed
    const collapse = collapseIfAnyZero(nextMeters)
    if (collapse) {
      const causeTag = nextMeters.funds <= 0 ? 'cause:funds' : nextMeters.reputation <= 0 ? 'cause:reputation' : 'cause:readiness'
      let collapseCard: EventCard | null = events.find(e => (e.tags || []).includes('meta:collapse') && (e.tags || []).includes(causeTag)) ?? null
      if (!collapseCard) {
        collapseCard = events.find(e => (e.tags || []).includes('meta:collapse')) ?? null
      }
      setMeters(nextMeters)
      setCurrent(collapseCard || null)
      setVictoryText(collapse)
      setSummaryMeters(nextMeters)
      setSummaryDay(day)
      // Determine collapse type and update legacy points
      // Use the meters that caused the collapse, not the collapsed meters
      const collapseType = determineCollapseType(meters, causeTag.replace('cause:', ''))
      const newLegacyPoints = updateLegacyPoints(legacyPoints, collapseType)
      setLegacyPoints(newLegacyPoints)
      
      // Debug logging
      console.log('Collapse detected:', {
        cause: causeTag.replace('cause:', ''),
        meters: meters,
        collapseType,
        newLegacyPoints
      })
      
      // Update collapse history
      setCollapseHistory(prev => [...prev, { collapseType, day }])
      
      // persistence: collapse_count and history
      const prev = Number(localStorage.getItem('yyg_collapse_count') || '0')
      localStorage.setItem('yyg_collapse_count', String(prev + 1))
      const histRaw = localStorage.getItem('yyg_history')
      const hist = Array.isArray(JSON.parse(histRaw || '[]')) ? JSON.parse(histRaw || '[]') : []
      hist.push({ 
        day, 
        cause: causeTag.replace('cause:',''), 
        meters: nextMeters,
        collapseType,
        legacyPoints: newLegacyPoints
      })
      localStorage.setItem('yyg_history', JSON.stringify(hist))
      setShowSummary(true)
      return
    }
    setPreviousMeters(meters)
    setMeters(nextMeters)
    // Persist player's decision for unlock requirements
    try {
      const nextChoice = { ...choiceState, [current.id]: side }
      persistChoice(nextChoice)
    } catch {}

    // milestone tracking removed

    const newDay = day + 1
    setDay(newDay)
    const nxt = drawNext()
    console.log('Drawing next event:', { nxt, day: newDay, usedEventIds: usedEventIds.length, totalEvents: events.length })
    if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
    setCurrent(nxt)
    markPresented(nxt)
  }

  // Convert special events to regular EventCard format for ReignsScreen
  const displayEvent: EventCard | null = 
    gameMasterOffer ? {
      id: gameMasterOffer.id,
      title: gameMasterOffer.title,
      body: gameMasterOffer.body,
      speaker: gameMasterOffer.speaker,
      portrait: '/resources/portraits/dreadlord.png',
      left: { label: gameMasterOffer.left.label, effects: gameMasterOffer.left.visibleEffects || {} },
      right: { label: gameMasterOffer.right.label, effects: gameMasterOffer.right.visibleEffects || {} }
    } :
    glitchEvent ? {
      id: glitchEvent.id,
      title: glitchEvent.title,
      body: glitchEvent.body,
      speaker: glitchEvent.speaker,
      portrait: glitchEvent.portrait,
      left: glitchEvent.left,
      right: glitchEvent.right
    } :
    chaosEvent ? {
      id: chaosEvent.id,
      title: chaosEvent.title,
      body: chaosEvent.body,
      speaker: chaosEvent.speaker,
      portrait: chaosEvent.portrait,
      left: chaosEvent.left,
      right: chaosEvent.right
    } :
    narrativeEvent ? {
      id: narrativeEvent.id,
      title: narrativeEvent.title,
      body: narrativeEvent.body,
      speaker: narrativeEvent.speaker,
      portrait: narrativeEvent.portrait,
      left: narrativeEvent.left,
      right: narrativeEvent.right
    } :
    current;

  const summaryModal = showSummary ? (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--reigns-card)] text-[var(--reigns-text)] rounded-lg border-2 border-[var(--reigns-border)] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-2xl font-bold mb-4 text-center">Run Collapsed</div>
              <div className="opacity-90 mb-6 text-center">{victoryText}</div>
              
              <div className="text-sm mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-80">Day:</span> 
                  <span className="font-mono font-bold">{summaryDay ?? day}</span>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>💰 <span className="font-mono">{(summaryMeters ?? meters).funds}</span></div>
                  <div>⭐ <span className="font-mono">{(summaryMeters ?? meters).reputation}</span></div>
                  <div>⚔️ <span className="font-mono">{(summaryMeters ?? meters).readiness}</span></div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  className="reigns-button"
                  onClick={() => setShowSummary(false)}
                >
                  Close
                </button>
                <button
                  className="reigns-button bg-[var(--reigns-accent)] border-[var(--reigns-accent)]"
                  onClick={() => { setShowSummary(false); window.location.reload() }}
                >
                  New Run
                </button>
              </div>
            </div>
          </div>
  ) : null;

  return (
    <ReignsScreen
      meters={meters}
      previousMeters={previousMeters || undefined}
      currentEvent={displayEvent}
      onChoice={decide}
      showSummary={showSummary}
      summaryContent={summaryModal}
    />
  )
}
