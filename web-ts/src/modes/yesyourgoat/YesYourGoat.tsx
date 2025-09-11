import { useEffect, useMemo, useState } from 'react'
import ResourceBar from '../../components/ResourceBar/ResourceBar'
import ResourceAnimations from '../../components/ResourceBar/ResourceAnimations'
import CardStack from '../../components/Card/CardStack'
import JourneyTrack from '../../components/JourneyTrack/JourneyTrack'
import { calculateChaosChance, getAvailableChaosEvents, drawChaosEvent } from '../../utils/chaosEvents'
import type { ChaosEvent } from '../../utils/chaosEvents'
import { calculateGlitchChance, getAvailableGlitchEvents, drawGlitchEvent } from '../../utils/glitchEvents'
import type { GlitchEvent } from '../../utils/glitchEvents'
import { calculateGameMasterChance, getAvailableGameMasterOffers, drawGameMasterOffer, applyGameMasterEffects } from '../../utils/gameMasters'
import type { GameMasterOffer } from '../../utils/gameMasters'
import { getCurrentStoryBeat, getStoryBeatProgress, getStoryBeatColorTheme, getStoryBeatDescription } from '../../utils/storyBeats'
import { getVisualProgression, getGuildHallDescription, getVisualEffectsCSS } from '../../utils/visualProgression'
import { achievements, checkAchievement, getAchievementRarityColor, getAchievementCategoryIcon } from '../../utils/achievements'
import type { Achievement } from '../../utils/achievements'

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
  
  // Check for high all meters (legend)
  if (funds >= 8 && reputation >= 8 && readiness >= 8) return 'legend'
  
  // Check for martyr (high rep, low funds)
  if (reputation >= 7 && funds <= 3) return 'martyr'
  
  // Check for dreamer (high readiness, low rep)
  if (readiness >= 7 && reputation <= 3) return 'dreamer'
  
  // Check for pragmatist (balanced)
  const balance = Math.abs(funds - reputation) + Math.abs(funds - readiness) + Math.abs(reputation - readiness)
  if (balance <= 4) return 'pragmatist'
  
  return 'unknown'
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

const EVENTS_URL = '/resources/events/yesyourgoat.events.json'

export default function YesYourGoat() {
  const [meters, setMeters] = useState<Meters>({ funds: 5, reputation: 5, readiness: 5 })
  const [day, setDay] = useState(1)
  const [events, setEvents] = useState<EventCard[]>([])
  const [current, setCurrent] = useState<EventCard | null>(null)
  const [nextCard, setNextCard] = useState<EventCard | null>(null)
  const [journeyCount, setJourneyCount] = useState(0)
  const [sawRival, setSawRival] = useState(false)
  const [victoryText, setVictoryText] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [chaosEvent, setChaosEvent] = useState<ChaosEvent | null>(null)
  const [glitchEvent, setGlitchEvent] = useState<GlitchEvent | null>(null)
  const [gameMasterOffer, setGameMasterOffer] = useState<GameMasterOffer | null>(null)
  const [summaryMeters, setSummaryMeters] = useState<Meters | null>(null)
  const [summaryDay, setSummaryDay] = useState<number | null>(null)
  const [previousMeters, setPreviousMeters] = useState<Meters | null>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([])
  const [maxSurvivedDays, setMaxSurvivedDays] = useState(0)
  const [chaosEventsExperienced, setChaosEventsExperienced] = useState(0)
  const [glitchEventsExperienced, setGlitchEventsExperienced] = useState(0)
  const [gameMasterOffersReceived, setGameMasterOffersReceived] = useState(0)
  const [characterGrowth] = useState<Record<string, number>>({})
  const [collapseHistory, setCollapseHistory] = useState<Array<{ collapseType: string; day: number }>>([])
  const [legacyPoints, setLegacyPoints] = useState<LegacyPoints>({
    martyr: 0,
    pragmatist: 0,
    dreamer: 0,
    survivor: 0,
    legend: 0
  })
  const [debugLog, setDebugLog] = useState<{
    id: string; title: string; choice: string; pre: Meters; post: Meters; effects: Effects
  }[]>([])

  const milestones = useMemo(() => [3, 6, 9, 12, 15, 18], [])
  const nextMilestone = milestones.find(m => day <= m) ?? null
  const collapseCount = Number(localStorage.getItem('yyg_collapse_count') || '0')
  const [usedMilestoneIds, setUsedMilestoneIds] = useState<string[]>([])

  // Story beat and visual progression
  const currentStoryBeat = getCurrentStoryBeat(day)
  const storyBeatProgress = getStoryBeatProgress(day)
  const visualProgression = getVisualProgression(legacyPoints, currentStoryBeat, characterGrowth)

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

  // Check achievements
  useEffect(() => {
    const gameState = {
      legacyPoints,
      maxSurvivedDays: Math.max(maxSurvivedDays, day),
      chaosEventsExperienced,
      glitchEventsExperienced,
      gameMasterOffersReceived,
      characterGrowth,
      currentStoryBeat: currentStoryBeat.act,
      collapseHistory
    }

    const newAchievements: Achievement[] = []
    achievements.forEach(achievement => {
      if (!achievement.unlocked && checkAchievement(achievement, gameState)) {
        const unlockedAchievement = { ...achievement, unlocked: true, unlockedAt: Date.now() }
        newAchievements.push(unlockedAchievement)
      }
    })

    if (newAchievements.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newAchievements])
    }
  }, [legacyPoints, day, chaosEventsExperienced, glitchEventsExperienced, gameMasterOffersReceived, characterGrowth, currentStoryBeat.act, collapseHistory, maxSurvivedDays])

  // Update max survived days
  useEffect(() => {
    setMaxSurvivedDays(prev => Math.max(prev, day))
  }, [day])
  const [usedEventIds, setUsedEventIds] = useState<string[]>([])
  
  // Platform features available for future use
  // const platformFeatures = usePlatformFeatures()

  useEffect(() => {
    fetch(EVENTS_URL).then(r => r.json()).then((data: EventCard[]) => {
      setEvents(data)
      const intro = data.find(e => (e.tags || []).includes('run:intro'))
      setCurrent(intro || null)
    }).catch(err => console.error('YYG load error', err))

    // restore basic meta
    const cc = Number(localStorage.getItem('yyg_collapse_count') || '0')
    if (!Number.isNaN(cc)) {
      // no-op for now; kept for future UI
    }
  }, [])

  function collapseIfAnyZero(m: Meters): string | null {
    if (m.funds <= 0) return 'Collapse — Bankrupt Guild'
    if (m.reputation <= 0) return 'Collapse — Forgotten Name'
    if (m.readiness <= 0) return 'Collapse — Unready Roster'
    return null
  }

  function drawNext(): EventCard | null {
    if (!events.length) return null
    
    // Check for Game Master offers first (highest priority)
    const gameMasterChance = calculateGameMasterChance(meters, legacyPoints, day)
    if (Math.random() < gameMasterChance) {
      const availableOffers = getAvailableGameMasterOffers(legacyPoints)
      const offer = drawGameMasterOffer(availableOffers)
      if (offer) {
        setGameMasterOffer(offer)
        return null // Will be handled by game master system
      }
    }
    
    // Check for glitch events second
    const glitchChance = calculateGlitchChance(meters, legacyPoints, day)
    if (Math.random() < glitchChance) {
      const availableGlitchEvents = getAvailableGlitchEvents(meters, legacyPoints, day)
      const glitchEvent = drawGlitchEvent(availableGlitchEvents)
      if (glitchEvent) {
        setGlitchEvent(glitchEvent)
        return null // Will be handled by glitch event system
      }
    }
    
    // Check for chaos events third
    const chaosChance = calculateChaosChance(meters, legacyPoints, day)
    if (Math.random() < chaosChance) {
      const availableChaosEvents = getAvailableChaosEvents(meters, legacyPoints, day)
      const chaosEvent = drawChaosEvent(availableChaosEvents)
      if (chaosEvent) {
        setChaosEvent(chaosEvent)
        return null // Will be handled by chaos event system
      }
    }
    
    // Collapse override handled at decide time
    // Inject milestone when threshold hits
    if (nextMilestone && day === nextMilestone) {
      const milestoneCard = events.find(e => (e.tags || []).includes('meta:dungeon_progress') && !usedMilestoneIds.includes(e.id))
      if (milestoneCard) {
        setUsedMilestoneIds(prev => [...prev, milestoneCard.id])
        return milestoneCard
      }
    }
    // Determine council cooldown from recent events (last 2)
    const recent2 = usedEventIds.slice(-2)
    const councilOnCooldown = recent2.some(id => (events.find(e => e.id === id)?.tags || []).includes('meta:council'))

    // Council cadence ~ every 5 (ease early pressure) respecting cooldown
    if (!councilOnCooldown && day % 5 === 0) {
      const councilEvents = events.filter(e => (e.tags || []).includes('meta:council') && !usedEventIds.includes(e.id))
      if (councilEvents.length > 0) {
        // Randomly select from available council events
        const randomIndex = Math.floor(Math.random() * councilEvents.length)
        return councilEvents[randomIndex]
      }
    }
    // Ensure Rival at least once mid-run (~day 8)
    if (!SawRivalMid() && day >= 8) {
      const rival = events.find(e => (e.tags || []).includes('meta:rival'))
      if (rival) { setSawRival(true); return rival }
    }
    // Otherwise pick any archetype/meta non-intro/outro, filtered by unlocks
    const unlocked = new Set<string>(['general','witch','priest','rogue'])
    if (collapseCount >= 3) unlocked.add('merchant')
    if (collapseCount >= 7) unlocked.add('bard')
    if (collapseCount >= 10) unlocked.add('recruiter')
    let pool = events.filter(e => {
      const tags = e.tags || []
      if (tags.includes('run:intro') || tags.includes('run:outro')) return false
      if (tags.includes('meta:dungeon_progress')) return false
      if (tags.includes('meta:collapse')) return false
      if (tags.includes('disabled')) return false
      if (tags.some(t => t.startsWith('race:'))) return false
      if (usedEventIds.includes(e.id)) return false
      const at = tags.find(t => t.startsWith('archetype:'))
      if (!at) return true
      const id = at.split(':')[1]
      return unlocked.has(id)
    })
    // Bias: use event weights, aggressive anti-repetition, and balance meter targeting with narrative phases
    const bias = (ev: EventCard) => {
      const effects = [ev.left?.effects || {}, ev.right?.effects || {}]
      const dropsRep = effects.some(e => typeof e.reputation === 'number' && e.reputation < 0)
      const dropsReady = effects.some(e => typeof e.readiness === 'number' && e.readiness < 0)
      const dropsFunds = effects.some(e => typeof e.funds === 'number' && e.funds < 0)

      // Start with base weight from event data
      let w = ev.weights?.base || 1

      // AGGRESSIVE anti-repetition: completely block events that appeared in last 5 events
      const recentEvents = usedEventIds.slice(-5)
      if (recentEvents.includes(ev.id)) {
        return 0 // Completely block recently used events
      }

      // Strong penalty for similar event types (same prefix) in recent history
      const eventPrefix = ev.id.split('_')[0]
      const similarRecentCount = recentEvents.filter(id => id.startsWith(eventPrefix)).length
      if (similarRecentCount > 0) {
        w = Math.max(0.01, w * (0.1 ** similarRecentCount)) // Much stronger penalty
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
    if (!pool.length) return null
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
    // Handle Game Master offers first
    if (gameMasterOffer) {
      const choice = side === 'left' ? gameMasterOffer.left : gameMasterOffer.right
      const preMeters: Meters = { ...meters }
      
      // Apply both visible and hidden effects
      const nextMeters = applyGameMasterEffects(meters, side, gameMasterOffer)
      
      // Log the game master offer
      setDebugLog(prev => [...prev, {
        id: gameMasterOffer.id,
        title: gameMasterOffer.title,
        choice: choice.label,
        pre: preMeters,
        post: nextMeters,
        effects: choice.visibleEffects || {}
      }])
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setGameMasterOffer(null)
      
      // Track game master offer
      setGameMasterOffersReceived(prev => prev + 1)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      
      // Set next card for preview
      const nextNxt = drawNext()
      setNextCard(nextNxt)
      return
    }
    
    // Handle glitch events second
    if (glitchEvent) {
      const choice = side === 'left' ? glitchEvent.left : glitchEvent.right
      const preMeters: Meters = { ...meters }
      const nextMeters: Meters = { ...meters }
      
      for (const [k, v] of Object.entries(choice.effects || {})) {
        if (k in nextMeters && typeof v === 'number') {
          // @ts-expect-error key narrowing
          nextMeters[k] = clamp((nextMeters as any)[k] + v)
        }
      }
      
      // Log the glitch event
      setDebugLog(prev => [...prev, {
        id: glitchEvent.id,
        title: glitchEvent.title,
        choice: choice.label,
        pre: preMeters,
        post: nextMeters,
        effects: choice.effects || {}
      }])
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setGlitchEvent(null)
      
      // Track glitch event
      setGlitchEventsExperienced(prev => prev + 1)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      
      // Set next card for preview
      const nextNxt = drawNext()
      setNextCard(nextNxt)
      return
    }
    
    // Handle chaos events third
    if (chaosEvent) {
      const choice = side === 'left' ? chaosEvent.left : chaosEvent.right
      const preMeters: Meters = { ...meters }
      const nextMeters: Meters = { ...meters }
      
      for (const [k, v] of Object.entries(choice.effects || {})) {
        if (k in nextMeters && typeof v === 'number') {
          // @ts-expect-error key narrowing
          nextMeters[k] = clamp((nextMeters as any)[k] + v)
        }
      }
      
      // Log the chaos event
      setDebugLog(prev => [...prev, {
        id: chaosEvent.id,
        title: chaosEvent.title,
        choice: choice.label,
        pre: preMeters,
        post: nextMeters,
        effects: choice.effects || {}
      }])
      
      setPreviousMeters(meters)
      setMeters(nextMeters)
      setChaosEvent(null)
      
      // Track chaos event
      setChaosEventsExperienced(prev => prev + 1)
      
      // Continue to next event
      const newDay = day + 1
      setDay(newDay)
      const nxt = drawNext()
      if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
      setCurrent(nxt)
      
      // Set next card for preview
      const nextNxt = drawNext()
      setNextCard(nextNxt)
      return
    }
    
    if (!current) return
    const choice = side === 'left' ? current.left : current.right
    const preMeters: Meters = { ...meters }
    const nextMeters: Meters = { ...meters }
    for (const [k, v] of Object.entries(choice.effects || {})) {
      if (k in nextMeters && typeof v === 'number') {
        // @ts-expect-error key narrowing
        nextMeters[k] = clamp((nextMeters as any)[k] + v)
      }
    }
    setDebugLog(prev => [{
      id: current.id,
      title: current.title,
      choice: choice.label,
      pre: preMeters,
      post: nextMeters,
      effects: choice.effects || {}
    }, ...prev].slice(0, 20))
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
      const collapseType = determineCollapseType(nextMeters, causeTag.replace('cause:', ''))
      const newLegacyPoints = updateLegacyPoints(legacyPoints, collapseType)
      setLegacyPoints(newLegacyPoints)
      
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

    // track milestone consumption
    if ((current.tags || []).includes('meta:dungeon_progress')) {
      setJourneyCount(j => j + 1)
    }

    const newDay = day + 1
    setDay(newDay)
    const nxt = drawNext()
    if (nxt) setUsedEventIds(prev => [...prev, nxt.id])
    setCurrent(nxt)
    
    // Set next card for preview
    const nextNxt = drawNext()
    setNextCard(nextNxt)
  }

  return (
    <div className="min-h-screen w-full bg-[var(--reigns-bg)] text-[var(--reigns-text)] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--reigns-text)]">
            YesYourGoat — Collapse Run
          </h1>
          <div className="text-sm px-3 py-2 rounded-full border border-[var(--reigns-border)] bg-[var(--reigns-card)] text-[var(--reigns-text-secondary)]">
            Deck: YesYourGoat ({events.length})
          </div>
        </div>

        {/* Resource Bar */}
        <ResourceBar 
          funds={meters.funds}
          reputation={meters.reputation}
          readiness={meters.readiness}
        />

        {/* Resource Change Animations */}
        <ResourceAnimations
          funds={meters.funds}
          reputation={meters.reputation}
          readiness={meters.readiness}
          previousFunds={previousMeters?.funds}
          previousReputation={previousMeters?.reputation}
          previousReadiness={previousMeters?.readiness}
        />

        {/* Journey Track */}
        <JourneyTrack 
          milestones={milestones}
          currentDay={day}
          journeyCount={journeyCount}
        />

        {/* Story Beat Display */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className={`bg-gradient-to-r ${getStoryBeatColorTheme(currentStoryBeat)} border border-[var(--reigns-border)] rounded-lg p-4 ${getVisualEffectsCSS(visualProgression.effects)}`}>
            <h3 className="text-lg font-bold text-white mb-2 text-center">
              {currentStoryBeat.theme}
            </h3>
            <p className="text-sm text-white/80 text-center mb-3">
              {getStoryBeatDescription(currentStoryBeat, day)}
            </p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${storyBeatProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Guild Hall Display - Hidden for now */}
        {false && (
          <div className="mt-4 max-w-4xl mx-auto">
            <div className="bg-[var(--reigns-card)] border border-[var(--reigns-border)] rounded-lg p-4">
              <h3 className="text-lg font-bold text-[var(--reigns-text)] mb-3 text-center">
                Guild Hall
              </h3>
              <div className="text-center">
                <div className={`text-2xl font-bold bg-gradient-to-r ${visualProgression.colorTheme} bg-clip-text text-transparent`}>
                  Level {visualProgression.guildHallLevel}
                </div>
                <div className="text-sm text-[var(--reigns-text-secondary)] mt-1">
                  {getGuildHallDescription(visualProgression.guildHallLevel)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Points and Achievements - Hidden during gameplay, shown in summary */}

        {/* Main Game Area */}
        <div className="flex justify-center">
          {gameMasterOffer ? (
            <div className="reigns-card card-desktop p-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">👤</div>
                <div className="text-sm text-purple-400 font-bold">MYSTERIOUS OFFER</div>
              </div>
              
              {/* Portrait and Speaker */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {gameMasterOffer.speaker.charAt(0)}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-4 text-[var(--reigns-text)]">
                {gameMasterOffer.title}
              </h2>
              
              <p className="text-lg text-center mb-8 text-[var(--reigns-text-secondary)] leading-relaxed">
                {gameMasterOffer.body}
              </p>
              
              {/* Choices */}
              <div className="space-y-4">
                <button
                  onClick={() => decide('left')}
                  className="w-full p-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                >
                  {gameMasterOffer.left.label}
                </button>
                <button
                  onClick={() => decide('right')}
                  className="w-full p-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                >
                  {gameMasterOffer.right.label}
                </button>
              </div>
            </div>
          ) : glitchEvent ? (
            <div className="reigns-card card-desktop p-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">⚠️</div>
                <div className="text-sm text-orange-400 font-bold">SYSTEM GLITCH</div>
              </div>
              
              {/* Portrait and Speaker */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {glitchEvent.speaker.charAt(0)}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-4 text-[var(--reigns-text)]">
                {glitchEvent.title}
              </h2>
              
              <p className="text-lg text-center mb-8 text-[var(--reigns-text-secondary)] leading-relaxed">
                {glitchEvent.body}
              </p>
              
              {/* Choices */}
              <div className="space-y-4">
                <button
                  onClick={() => decide('left')}
                  className="w-full p-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                >
                  {glitchEvent.left.label}
                </button>
                <button
                  onClick={() => decide('right')}
                  className="w-full p-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                >
                  {glitchEvent.right.label}
                </button>
              </div>
            </div>
          ) : chaosEvent ? (
            <div className="reigns-card card-desktop p-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🌟</div>
                <div className="text-sm text-yellow-400 font-bold">CHAOS EVENT</div>
              </div>
              
              {/* Portrait and Speaker */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {chaosEvent.speaker.charAt(0)}
                </div>
              </div>

              {/* Event Title */}
              <div className="text-2xl font-bold text-center mb-6 text-[var(--reigns-text)]">
                {chaosEvent.title}
              </div>

              {/* Event Body */}
              <div className="text-lg leading-relaxed mb-8 text-[var(--reigns-text-secondary)] flex-1 px-2">
                {chaosEvent.body}
              </div>

              {/* Choice Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={() => decide('left')}
                  className="reigns-button flex-1"
                >
                  {chaosEvent.left?.label || 'Left'}
                </button>
                <button 
                  onClick={() => decide('right')}
                  className="reigns-button flex-1"
                >
                  {chaosEvent.right?.label || 'Right'}
                </button>
              </div>
            </div>
          ) : current && (
            <CardStack 
              current={current}
              next={nextCard}
              onChoice={decide}
            />
          )}
        </div>

        {/* Debug Panel */}
        {debugLog.length > 0 && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="text-xs bg-[var(--reigns-card)]/60 border border-[var(--reigns-border)] rounded-lg p-4">
              <div className="font-bold mb-3 text-[var(--reigns-text)]">Debug Log (last {debugLog.length})</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {debugLog.map((d, i) => (
                  <div key={i} className="flex flex-col p-2 bg-[var(--reigns-bg)]/50 rounded">
                    <div className="opacity-80 text-[var(--reigns-text-secondary)]">
                      {d.title} — {d.choice}
                    </div>
                    <div className="flex gap-4 text-xs">
                      <div>pre: 💰{d.pre.funds} ⭐{d.pre.reputation} ⚔️{d.pre.readiness}</div>
                      <div>post: 💰{d.post.funds} ⭐{d.post.reputation} ⚔️{d.post.readiness}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Victory Text */}
        {!!victoryText && (
          <div className="mt-6 text-center">
            <div className="text-xl font-semibold text-[var(--reigns-accent)]">
              {victoryText}
            </div>
          </div>
        )}

        {/* Collapse Summary Modal */}
        {showSummary && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--reigns-card)] text-[var(--reigns-text)] rounded-lg border-2 border-[var(--reigns-border)] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="text-2xl font-bold mb-4 text-center">Run Collapsed</div>
              <div className="opacity-90 mb-6 text-center">{victoryText}</div>
              
              <div className="text-sm mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="opacity-80">Day:</span> 
                  <span className="font-mono font-bold">{summaryDay ?? day}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Milestones reached:</span> 
                  <span className="font-mono font-bold">{journeyCount}/{milestones.length}</span>
                </div>
                <div className="mt-4 flex justify-between">
                  <div>💰 <span className="font-mono">{(summaryMeters ?? meters).funds}</span></div>
                  <div>⭐ <span className="font-mono">{(summaryMeters ?? meters).reputation}</span></div>
                  <div>⚔️ <span className="font-mono">{(summaryMeters ?? meters).readiness}</span></div>
                </div>
              </div>

              {/* Guild Legacy Display */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--reigns-text)] mb-3 text-center">
                  Guild Legacy
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{legacyPoints.martyr}</div>
                    <div className="text-sm text-[var(--reigns-text-secondary)]">Martyr</div>
                    <div className="text-xs text-[var(--reigns-text-secondary)]">High Rep, Low Funds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{legacyPoints.pragmatist}</div>
                    <div className="text-sm text-[var(--reigns-text-secondary)]">Pragmatist</div>
                    <div className="text-xs text-[var(--reigns-text-secondary)]">Balanced Collapse</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{legacyPoints.dreamer}</div>
                    <div className="text-sm text-[var(--reigns-text-secondary)]">Dreamer</div>
                    <div className="text-xs text-[var(--reigns-text-secondary)]">High Readiness, Low Rep</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{legacyPoints.survivor}</div>
                    <div className="text-sm text-[var(--reigns-text-secondary)]">Survivor</div>
                    <div className="text-xs text-[var(--reigns-text-secondary)]">Deck Exhaustion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{legacyPoints.legend}</div>
                    <div className="text-sm text-[var(--reigns-text-secondary)]">Legend</div>
                    <div className="text-xs text-[var(--reigns-text-secondary)]">High All Meters</div>
                  </div>
                </div>
              </div>

              {/* Achievements Display */}
              {unlockedAchievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[var(--reigns-text)] mb-3 text-center">
                    🏆 New Achievements Unlocked!
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {unlockedAchievements.slice(-5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-[var(--reigns-bg)] rounded">
                        <div className="text-2xl">{getAchievementCategoryIcon(achievement.category)}</div>
                        <div className="flex-1">
                          <div className={`font-bold ${getAchievementRarityColor(achievement.rarity)}`}>
                            {achievement.name}
                          </div>
                          <div className="text-sm text-[var(--reigns-text-secondary)]">
                            {achievement.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
        )}
      </div>
    </div>
  )
}


