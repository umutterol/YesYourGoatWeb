import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// Data URLs (served from public/)
const EVENTS_URL = '/resources/events/events.json'
const ADVENTURE_EVENTS_URL = '/resources/events/adventure_events.json'
const ROSTER_URL = '/resources/roster.json'
const BARKS_URL  = '/resources/barks/trait_barks.json'

// Color palette from provided image
const COLORS = {
  // Darker, more atmospheric palette
  primary: '#2c1810',      // Dark brown
  secondary: '#1a1a1a',    // Very dark gray
  accent: '#8b4513',       // Saddle brown
  highlight: '#daa520',    // Goldenrod
  text: '#f5f5dc',         // Beige
  textDim: '#d2b48c',      // Tan
  border: '#654321',       // Dark brown
  success: '#228b22',      // Forest green
  warning: '#ff8c00',      // Dark orange
  danger: '#dc143c'        // Crimson
}

// Types
type Meters = { funds: number; reputation: number; readiness: number }
type Effects = Partial<Meters & { morale_all: number }> & Record<string, number>

type Hook = { when: string; effect: Effects }

type Choice = {
  label: string
  effects: Effects
  hooks?: Hook[]
  nextStep?: string
  substeps?: {
    a?: {
      title: string
      body: string
      left: Choice
      right: Choice
    }
    b?: {
      title: string
      body: string
      left: Choice
      right: Choice
    }
  }
}

type EventCard = {
  id: string
  title: string
  body: string
  tags?: string[]
  weights?: { base: number; rep_low?: number; rep_high?: number }
  left: Choice
  right: Choice
}

type AdventureEvent = {
  step: number
  type: 'gameplay' | 'story'
  id: string
  title: string
  body: string
  tags?: string[]
  adventure: string
  nextStep: string
  effects?: Effects
  left?: Choice
  right?: Choice
}

type Adventure = {
  id: string
  name: string
  description: string
  difficulty: string
  targetWinRate: number
  steps: AdventureEvent[]
}

type GameMode = 'menu' | 'regular' | 'adventure'

type Member = { id: string; name: string; traitId: string; morale?: number; portrait?: string }

type LogEntry = { day: number; title: string; choice: string; delta: string }

type ChatMsg = { speakerId?: string; speakerName: string; text: string }

const CLAMP_MIN = 0, CLAMP_MAX = 10

function clamp(v: number) { return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, v)) }
function clampMorale(v: number) { return Math.max(1, Math.min(10, Math.round(v))) }

function fmtDelta(v: number) { return v > 0 ? `+${v}` : `${v}` }

// Enhanced Morale System Functions
function canTriggerPositiveEffects(morale: number): boolean {
  return morale >= 5
}

// Dynamic Portrait Effects based on Morale - Vertical Gradient Saturation
function getPortraitStyle(morale: number, baseStyle: React.CSSProperties): React.CSSProperties {
  const saturation = Math.max(0.2, morale / 10) // 0.2 to 1.0 based on morale
  const brightness = Math.max(0.6, 0.4 + (morale / 10) * 0.6) // 0.6 to 1.0 based on morale
  const contrast = Math.max(0.8, 0.6 + (morale / 10) * 0.4) // 0.8 to 1.0 based on morale
  
  return {
    ...baseStyle,
    position: 'relative',
    transition: 'filter 0.3s ease',
    // Apply filters to the image itself
    filter: `saturate(${saturation}) brightness(${brightness}) contrast(${contrast})`
  }
}

// Create a gradient overlay component for portrait saturation effect
function PortraitWithGradient({ morale, baseStyle, src, alt }: { 
  morale: number; 
  baseStyle: React.CSSProperties; 
  src: string; 
  alt: string; 
}) {
  // Reverse the gradient: high morale = less overlay, low morale = more overlay
  const gradientPosition = Math.max(0, Math.min(100, ((10 - morale) / 10) * 100))
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img 
        src={src}
        alt={alt}
        style={getPortraitStyle(morale, baseStyle)}
      />
      {/* Gradient overlay for desaturation effect - reversed for correct morale display */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(to top, 
          rgba(0,0,0,0) 0%, 
          rgba(0,0,0,0) ${100 - gradientPosition}%, 
          rgba(0,0,0,0.6) ${100 - gradientPosition + 5}%, 
          rgba(0,0,0,0.8) 100%
        )`,
        pointerEvents: 'none',
        borderRadius: baseStyle.borderRadius || '8px'
      }} />
    </div>
  )
}

function getPortraitBorderColor(morale: number): string {
  if (morale <= 2) return COLORS.danger
  if (morale <= 4) return COLORS.warning
  if (morale <= 6) return COLORS.highlight
  return COLORS.success
}

function getDepartureChance(morale: number): number {
  if (morale >= 3) return 0
  if (morale === 2) return 0.25
  if (morale === 1) return 0.35
  return 1 // morale 0 = immediate departure
}

function checkCharacterDepartures(roster: Member[]): { departed: Member[], remaining: Member[] } {
  const departed: Member[] = []
  const remaining: Member[] = []
  
  for (const member of roster) {
    const morale = member.morale ?? 5
    const departureChance = getDepartureChance(morale)
    
    if (morale === 0 || Math.random() < departureChance) {
      departed.push(member)
    } else {
      remaining.push(member)
    }
  }
  
  return { departed, remaining }
}

function eventHasReadinessDecrease(ev: EventCard): boolean {
  const lr = [ev.left, ev.right]
  for (const c of lr) {
    if (typeof c?.effects?.readiness === 'number' && c.effects.readiness < 0) return true
  }
  return false
}

function weightForEvent(ev: EventCard, reputation: number, readiness: number): number {
  const base = ev.weights?.base ?? 1
  let w = base
  // Reputation-based adjustments
  if (typeof ev.weights?.rep_low === 'number' && reputation <= 3) w += ev.weights!.rep_low!
  if (typeof ev.weights?.rep_high === 'number' && reputation >= 8) w += ev.weights!.rep_high!
  // Readiness-balancing heuristic: when readiness is high, surface more cards that can reduce readiness
  // When readiness is low, slightly avoid further reductions to prevent spirals
  const hasRedDown = eventHasReadinessDecrease(ev)
  if (readiness >= 8 && hasRedDown) w += 2
  if (readiness <= 3 && hasRedDown) w -= 1
  if (!Number.isFinite(w) || w <= 0) w = 1
  return w
}

function weightedPick<T>(arr: T[], weightFn: (t: T) => number): T | null {
  if (!arr.length) return null
  const weights = arr.map(weightFn)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i]
    if (r <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}



function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Generate party-based events from roster members
function generatePartyEvent(member: Member, day: number, eventTemplates: EventCard[]): EventCard {
  // Filter for member-based events (excluding raid checks)
  const memberEvents = eventTemplates.filter(e => e.id.startsWith('member_'))
  if (!memberEvents.length) {
    // Fallback if no member events found
    return {
      id: `${member.id}_fallback_${day}`,
      title: `${member.name} has a problem`,
      body: `${member.name} is causing issues in the guild. How do you handle this?`,
      tags: ["player_drama"],
      weights: { base: 5 },
      left: {
        label: "Support them",
        effects: { [`morale_${member.id}`]: 2, reputation: -1 }
      },
      right: {
        label: "Discipline them",
        effects: { [`morale_${member.id}`]: -2, reputation: 1 }
      }
    }
  }
  
  const template = memberEvents[Math.floor(Math.random() * memberEvents.length)]
  
  // Replace placeholders in the template
  const replaceMember = (text: string) => text.replace(/{member}/g, member.name)
  const replaceMemberId = (effects: Effects) => {
    const newEffects: Effects = {}
    for (const [key, value] of Object.entries(effects)) {
      const newKey = key.replace('{memberId}', member.id)
      newEffects[newKey] = value
    }
    return newEffects
  }
  
  return {
    ...template,
    id: `${member.id}_${template.id}_${day}`,
    title: replaceMember(template.title),
    body: replaceMember(template.body),
    left: {
      ...template.left,
      effects: replaceMemberId(template.left.effects)
    },
    right: {
      ...template.right,
      effects: replaceMemberId(template.right.effects)
    }
  }
}

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('menu')
  const [adventures, setAdventures] = useState<Record<string, Adventure>>({})
  const [currentAdventure, setCurrentAdventure] = useState<Adventure | null>(null)
  const [adventureStep, setAdventureStep] = useState<number>(0)
  const [adventureSubstep, setAdventureSubstep] = useState<'a' | 'b' | null>(null)
  const [adventureChoice, setAdventureChoice] = useState<'left' | 'right' | null>(null)
  
  const [meters, setMeters] = useState<Meters>({ funds: 5, reputation: 5, readiness: 5 })
  const [day, setDay] = useState<number>(1)
  const [events, setEvents] = useState<EventCard[]>([])
  const [raidChecks, setRaidChecks] = useState<EventCard[]>([])
  const [nextRaidDay, setNextRaidDay] = useState<number>(6)
  const [roster, setRoster] = useState<Member[]>([])
  const [barks, setBarks] = useState<Record<string, string[]>>({})
  const [log, setLog] = useState<LogEntry[]>([])
  const [victory, setVictory] = useState<string>('')
  const [perfStreak, setPerfStreak] = useState<number>(0)
  const [legendStreak, setLegendStreak] = useState<number>(0)
  const [chat, setChat] = useState<ChatMsg[]>([])
  const [currentEventMember, setCurrentEventMember] = useState<Member | null>(null)
  const [pendingMultiStep, setPendingMultiStep] = useState<string | null>(null)
  const [hasMultiStepEvent, setHasMultiStepEvent] = useState<boolean>(false)
  const [departureNotification, setDepartureNotification] = useState<{ member: Member; reason: string } | null>(null)
  
  // Swipe mechanics
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  function pushChat(msg: ChatMsg) {
    setChat(prev => [...prev, msg].slice(-40))
  }

  // Main menu functions
  function startRegularMode() {
    setGameMode('regular')
    setVictory('')
    setDay(1)
    setMeters({ funds: 5, reputation: 5, readiness: 5 })
    setLog([])
    setChat([])
    setDepartureNotification(null)
    setPendingMultiStep(null)
    setHasMultiStepEvent(false)
  }

  function startAdventureMode(adventureId: string) {
    const adventure = adventures[adventureId]
    if (!adventure) return
    
    setCurrentAdventure(adventure)
    setAdventureStep(0)
    setAdventureSubstep(null)
    setAdventureChoice(null)
    setGameMode('adventure')
    setVictory('')
    setMeters({ funds: 5, reputation: 5, readiness: 5 })
    setLog([])
    setChat([])
    setDepartureNotification(null)
  }

  function returnToMenu() {
    setGameMode('menu')
    setCurrentAdventure(null)
    setAdventureStep(0)
    setAdventureSubstep(null)
    setAdventureChoice(null)
    setVictory('')
  }

  // Adventure mode functions
  function getCurrentAdventureEvent(): AdventureEvent | null {
    if (!currentAdventure) return null
    return currentAdventure.steps[adventureStep] || null
  }

  function handleAdventureChoice(choice: 'left' | 'right') {
    const event = getCurrentAdventureEvent()
    if (!event || !event.left || !event.right) return

    setAdventureChoice(choice)
    
    const selectedChoice = choice === 'left' ? event.left : event.right
    
    // Apply effects
    if (selectedChoice.effects) {
      setMeters(prev => {
        const newMeters = { ...prev }
        Object.entries(selectedChoice.effects).forEach(([key, value]) => {
          if (key in newMeters) {
            newMeters[key as keyof Meters] = clamp(newMeters[key as keyof Meters] + value)
          }
        })
        return newMeters
      })
    }

    // Check for loss
    const newMeters = { ...meters }
    if (selectedChoice.effects) {
      Object.entries(selectedChoice.effects).forEach(([key, value]) => {
        if (key in newMeters) {
          newMeters[key as keyof Meters] = clamp(newMeters[key as keyof Meters] + value)
        }
      })
    }

    if (newMeters.funds <= 0 || newMeters.reputation <= 0 || newMeters.readiness <= 0) {
      setVictory('Adventure Failed!')
      return
    }

    // Check if there are substeps
    if (selectedChoice.substeps) {
      setAdventureSubstep('a') // Default to first substep
    } else {
      // Move to next step
      nextAdventureStep()
    }
  }

  function handleAdventureSubstep(choice: 'left' | 'right') {
    const event = getCurrentAdventureEvent()
    if (!event || !adventureChoice) return

    const selectedChoice = adventureChoice === 'left' ? event.left : event.right
    if (!selectedChoice || !selectedChoice.substeps) return

    const substepKey = adventureSubstep || 'a'
    const substep = selectedChoice.substeps[substepKey]
    if (!substep) return

    const selectedSubstep = choice === 'left' ? substep.left : substep.right
    if (!selectedSubstep) return

    // Apply substep effects
    if (selectedSubstep.effects) {
      setMeters(prev => {
        const newMeters = { ...prev }
        Object.entries(selectedSubstep.effects).forEach(([key, value]) => {
          if (key in newMeters && typeof value === 'number') {
            newMeters[key as keyof Meters] = clamp(newMeters[key as keyof Meters] + value)
          }
        })
        return newMeters
      })
    }

    // Check for loss
    const newMeters = { ...meters }
    if (selectedSubstep.effects) {
      Object.entries(selectedSubstep.effects).forEach(([key, value]) => {
        if (key in newMeters && typeof value === 'number') {
          newMeters[key as keyof Meters] = clamp(newMeters[key as keyof Meters] + value)
        }
      })
    }

    if (newMeters.funds <= 0 || newMeters.reputation <= 0 || newMeters.readiness <= 0) {
      setVictory('Adventure Failed!')
      return
    }

    // Move to next step
    nextAdventureStep()
  }

  function nextAdventureStep() {
    if (!currentAdventure) return

    const nextStep = adventureStep + 1
    if (nextStep >= currentAdventure.steps.length) {
      // Adventure completed successfully
      setVictory('Adventure Completed!')
      return
    }

    setAdventureStep(nextStep)
    setAdventureSubstep(null)
    setAdventureChoice(null)
  }

  // Swipe handling functions
  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (victory) return
    if (gameMode === 'regular' && !current) return
    if (gameMode === 'adventure' && !getCurrentAdventureEvent()) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setSwipeStart({ x: clientX, y: clientY })
    setSwipeOffset(0)
    setIsDragging(true)
  }

  const handleSwipeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !swipeStart || victory) return
    if (gameMode === 'regular' && !current) return
    if (gameMode === 'adventure' && !getCurrentAdventureEvent()) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - swipeStart.x
    
    // Limit swipe distance
    const maxSwipe = 150
    const limitedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    setSwipeOffset(limitedDeltaX)
    
    // Update swipe direction for visual feedback
    if (limitedDeltaX > 20) {
      setSwipeDirection('right')
    } else if (limitedDeltaX < -20) {
      setSwipeDirection('left')
    } else {
      setSwipeDirection(null)
    }
  }

  const handleSwipeEnd = () => {
    if (!isDragging || !swipeStart || victory) return
    if (gameMode === 'regular' && !current) return
    if (gameMode === 'adventure' && !getCurrentAdventureEvent()) return
    
    const swipeThreshold = 100
    const finalDirection = swipeOffset > swipeThreshold ? 'right' : swipeOffset < -swipeThreshold ? 'left' : null
    
    if (finalDirection) {
      if (gameMode === 'regular') {
        decide(finalDirection)
      } else if (gameMode === 'adventure') {
        if (adventureSubstep) {
          handleAdventureSubstep(finalDirection)
        } else {
          handleAdventureChoice(finalDirection)
        }
      }
    }
    
    // Reset swipe state
    setSwipeStart(null)
    setSwipeOffset(0)
    setIsDragging(false)
    setSwipeDirection(null)
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleSwipeStart(e)
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleSwipeStart(e)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    handleSwipeMove(e)
  }

  const handleTouchEnd = () => {
    handleSwipeEnd()
  }

  // Load static data and restore
  useEffect(() => {
    const run = async () => {
      const [rRes, bRes] = await Promise.all([
        fetch(ROSTER_URL),
        fetch(BARKS_URL)
      ])
      if (!rRes.ok) throw new Error(`Failed roster: ${rRes.status}`)
      if (!bRes.ok) throw new Error(`Failed barks: ${bRes.status}`)
      const rosterData: Member[] = await rRes.json()
      const barksData: Record<string, string[]> = await bRes.json()

      // Build pool and select active 5 for this session
      const withMorale = rosterData.map(m => ({ ...m, morale: clampMorale(5 + Math.floor(Math.random() * 3)) })) // Random morale 5-7
      const active = shuffle(withMorale).slice(0, 5)
      setRoster(active)

      setBarks(barksData)

      // Restore save now that active roster is set
      const raw = localStorage.getItem('yyg_state_ts')
      if (raw) {
        try {
          const s = JSON.parse(raw)
          if (s?.meters) setMeters((prev) => ({ ...prev, ...s.meters }))
          if (Number.isInteger(s?.day)) setDay(s.day)
          else if (Number.isInteger(s?.week)) setDay(s.week)
          if (Number.isInteger(s?.nextRaidDay)) setNextRaidDay(s.nextRaidDay)
          if (Array.isArray(s?.log)) setLog(s.log.slice(-20))
          if (s?.morale) {
            setRoster(prev => prev.map(m => ({ ...m, morale: clampMorale(s.morale[m.id] ?? m.morale ?? 5) })))
          }
        } catch {}
      }

      const eRes = await fetch(EVENTS_URL)
      if (!eRes.ok) throw new Error(`Failed events: ${eRes.status}`)
      const data: EventCard[] = await eRes.json()
      setRaidChecks(data.filter(e => (e.tags ?? []).includes('raid_night_check')))
      setEvents(data.filter(e => !(e.tags ?? []).includes('raid_night_check')))
    }

    run().catch(err => {
      console.error(String(err?.message ?? err))
    })
  }, [])

  // Load adventure data
  useEffect(() => {
    const loadAdventures = async () => {
      try {
        const res = await fetch(ADVENTURE_EVENTS_URL)
        if (!res.ok) throw new Error(`Failed adventures: ${res.status}`)
        const data = await res.json()
        setAdventures(data.adventures)
      } catch (err) {
        console.error('Failed to load adventures:', err)
      }
    }
    loadAdventures()
  }, [])

  // Persist: save morale for active roster only
  useEffect(() => {
    const morale = Object.fromEntries(roster.map(m => [m.id, m.morale ?? 5]))
    localStorage.setItem('yyg_state_ts', JSON.stringify({ meters, day, nextRaidDay, morale, log }))
  }, [meters, day, nextRaidDay, roster, log])

  const cardPool = useMemo(() => {
    return events
  }, [events])

  const currentCardRef = useRef<EventCard | null>(null)
  function drawCard(): EventCard | null {
    // Check for pending multi-step event
    if (pendingMultiStep) {
      const nextEvent = [...events, ...raidChecks].find(e => e.id === pendingMultiStep)
      if (nextEvent) {
        setPendingMultiStep(null)
        currentCardRef.current = nextEvent
        setCurrentEventMember(null)
        return nextEvent
      }
    }
    // If it's raid day, draw a raid check
    if (day === nextRaidDay && raidChecks.length) {
      const raidCard = weightedPick(raidChecks, (e) => weightForEvent(e, meters.reputation, meters.readiness)) || raidChecks[0]
      currentCardRef.current = raidCard
      setCurrentEventMember(null)
      return raidCard
    }
    
    // For party-based events, generate from a random party member
    if (roster.length) {
      const member = roster[Math.floor(Math.random() * roster.length)]
      const partyEvent = generatePartyEvent(member, day, events)
      setCurrentEventMember(member)
      currentCardRef.current = partyEvent
      return partyEvent
    }
    
    // Default weighted pick
    const card = weightedPick(cardPool, (e) => {
      // If we haven't had a multi-step event yet and this is a multi-step event, give it high priority
      if (!hasMultiStepEvent && e.id.startsWith('multistep_')) {
        return 1000 // Very high weight to ensure it gets selected
      }
      return weightForEvent(e, meters.reputation, meters.readiness)
    })
    currentCardRef.current = card
    setCurrentEventMember(null)
    return card
  }

  // On first ready state, ensure a card exists
  const [current, setCurrent] = useState<EventCard | null>(null)
  useEffect(() => {
    if (!current && cardPool.length) {
      setCurrent(drawCard())
    }
  }, [cardPool, current])

  function parseMoraleWhen(expr: string) {
    const m = expr.match(/^morale:(<|<=|>|>=|==)(\d{1,3})$/)
    if (!m) return null
    return { op: m[1], value: Number(m[2]) } as const
  }

  function evalMorale(op: string, value: number): boolean {
    for (const mem of roster) {
      const v = mem.morale ?? 50
      if (op === '<'  && v <  value) return true
      if (op === '<=' && v <= value) return true
      if (op === '>'  && v >  value) return true
      if (op === '>=' && v >= value) return true
      if (op === '==' && v === value) return true
    }
    return false
  }

  // Hooks/traits should only check the active 5
  function evaluateHooks(hooks?: Hook[]) {
    const extraEffects: Effects[] = []
    const matchedTraits = new Set<string>()
    for (const h of hooks ?? []) {
      const w = h.when ?? ''
      if (w.startsWith('trait:')) {
        const tid = w.slice(6)
        if (roster.some(r => r.traitId === tid)) {
          extraEffects.push(h.effect || {})
          matchedTraits.add(tid)
        }
        continue
      }
      const cond = parseMoraleWhen(w)
      if (cond && evalMorale(cond.op, cond.value)) {
        extraEffects.push(h.effect || {})
      }
    }
    return { extraEffects, matchedTraits: Array.from(matchedTraits) }
  }

  function applyEffects(effects?: Effects, allowPositiveEffects: boolean = true): string {
    if (!effects) return 'No change'
    const next = { ...meters }
    const deltas: string[] = []
    const moraleDeltas: string[] = []
    for (const [k, v] of Object.entries(effects)) {
      if (k in next && typeof v === 'number') {
        // Block positive effects if morale is too low
        if (!allowPositiveEffects && v > 0) {
          continue
        }
        // @ts-expect-error narrowed by key check
        next[k] = clamp((next as any)[k] + v)
        deltas.push(`${k}: ${fmtDelta(v)}`)
        continue
      }
      if (k === 'morale_all' && typeof v === 'number') {
        setRoster(prev => prev.map(mem => ({ ...mem, morale: clampMorale((mem.morale ?? 5) + v) })))
        moraleDeltas.push(`morale_all: ${fmtDelta(v)}`)
        continue
      }
      const mm = k.match(/^morale_(.+)$/)
      if (mm && typeof v === 'number') {
        const id = mm[1]
        setRoster(prev => prev.map(mem => mem.id === id ? { ...mem, morale: clampMorale((mem.morale ?? 5) + v) } : mem))
        moraleDeltas.push(`${k}: ${fmtDelta(v)}`)
        continue
      }
    }
    setMeters(next)
    
    // Check for immediate loss conditions after meter changes
    if (next.funds <= 0) {
      setVictory('Guild Funds hit 0 - you lose.')
      return 'Guild Funds hit 0 - you lose.'
    }
    if (next.reputation <= 0) {
      setVictory('Server Reputation hit 0 - you lose.')
      return 'Server Reputation hit 0 - you lose.'
    }
    if (next.readiness <= 0) {
      setVictory('Raid Readiness hit 0 - you lose.')
      return 'Raid Readiness hit 0 - you lose.'
    }
    
    const parts: string[] = []
    if (deltas.length) parts.push(deltas.join('  •  '))
    if (moraleDeltas.length) parts.push(moraleDeltas.join('  •  '))
    return parts.length ? parts.join('  •  ') : 'No change'
  }

  function lossCheck(): string | null {
    if (meters.funds <= 0) return 'Guild Funds hit 0 - you lose.'
    if (meters.reputation <= 0) return 'Server Reputation hit 0 - you lose.'
    if (meters.readiness <= 0) return 'Raid Readiness hit 0 - you lose.'
    if (roster.length < 3) return 'Guild collapsed - not enough members to continue.'
    return null
  }

  function winCheck(nextMeters: Meters, nextDay: number) {
    if (victory) return
    const nextWeeks = Math.floor((nextDay - 1) / 7) + 1
    if (nextWeeks >= 25) {
      setVictory('Victory — Survivor: Your guild endured to Week 25!')
      return
    }
    const allHigh = nextMeters.funds >= 8 && nextMeters.reputation >= 8 && nextMeters.readiness >= 8
    const nextPerf = allHigh ? perfStreak + 1 : 0
    const nextLegend = nextMeters.reputation === 10 ? legendStreak + 1 : 0
    setPerfStreak(nextPerf)
    setLegendStreak(nextLegend)
    if (nextPerf >= 70) { // 10 weeks
      setVictory('Victory — Perfectionist: Maintained all meters ≥ 8 for 10 weeks!')
      return
    }
    if (nextLegend >= 70) { // 10 weeks
      setVictory('Victory — Legend: Maintained Reputation = 10 for 10 weeks!')
      return
    }
  }

  function decide(side: 'left' | 'right') {
    if (victory) return
    const ev = current
    if (!ev) return
    const choice = side === 'left' ? ev.left : ev.right
    const { extraEffects, matchedTraits } = evaluateHooks(choice.hooks)
    
    // Route trait-triggered barks to chat with a matching speaker
    if (matchedTraits.length) {
      const tid = matchedTraits[Math.floor(Math.random() * matchedTraits.length)]
      const candidates = roster.filter(r => r.traitId === tid)
      const speaker = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : roster[Math.floor(Math.random() * Math.max(1, roster.length))]
      const lines = barks[tid] || []
      if (speaker && lines.length) {
        const line = lines[Math.floor(Math.random() * lines.length)]
        pushChat({ speakerId: speaker.id, speakerName: speaker.name, text: line })
      }
    }
    
    // Check if any character has low morale that would block positive effects
    const hasLowMorale = roster.some(member => !canTriggerPositiveEffects(member.morale ?? 5))
    
    const deltaA = applyEffects(choice.effects, !hasLowMorale)
    for (const ef of extraEffects) applyEffects(ef, !hasLowMorale)
    
    // Check for character departures after morale changes
    const { departed, remaining } = checkCharacterDepartures(roster)
    if (departed.length > 0) {
      setRoster(remaining)
      // Show departure notification for the first departed member
      const firstDeparted = departed[0]
      const morale = firstDeparted.morale ?? 5
      let reason = "Low morale"
      if (morale === 0) reason = "Morale completely broken"
      else if (morale === 1) reason = "Extremely low morale"
      else if (morale === 2) reason = "Very low morale"
      
      setDepartureNotification({ 
        member: firstDeparted, 
        reason: reason 
      })
      
      // Add departure messages to chat
      for (const member of departed) {
        pushChat({ 
          speakerId: member.id, 
          speakerName: member.name, 
          text: `I can't take this anymore. I'm leaving the guild.` 
        })
      }
    }
    
    const loss = lossCheck()
    const delta = deltaA
    setLog(prev => [...prev, { day, title: ev.title ?? 'Untitled', choice: choice.label ?? side, delta }].slice(-20))
    if (loss) {
      setVictory(loss)
      return
    }
    
    // Mark that we've encountered a multi-step event if this was one
    if (ev.id.startsWith('multistep_')) {
      setHasMultiStepEvent(true)
    }
    
    // Check for multi-step event
    if (choice.nextStep) {
      setPendingMultiStep(choice.nextStep)
      setCurrent(drawCard())
      return
    }
    
    const nextDay = day + 1
    const nextMeters = { ...meters }
    
    // Check for loss conditions after effects are applied
    const lossMessage = lossCheck()
    if (lossMessage) {
      setVictory(lossMessage)
      return
    }
    
    // If a raid card was played today, schedule the next raid in 5–7 days
    const wasRaid = (currentCardRef.current?.tags ?? []).includes('raid_night_check')
    if (wasRaid) {
      const interval = 5 + Math.floor(Math.random() * 3) // 5,6,7
      setNextRaidDay(nextDay + interval)
    }

    winCheck(nextMeters, nextDay)
    setDay(prev => prev + 1)
    setCurrent(drawCard())
  }

  function newRun() {
    localStorage.removeItem('yyg_state_ts')
    setMeters({ funds: 5, reputation: 5, readiness: 5 })
    setDay(1)
    // First raid scheduled between day 6–8
    setNextRaidDay(1 + (5 + Math.floor(Math.random() * 3)))
    setLog([])
    setVictory('')
    setPerfStreak(0)
    setLegendStreak(0)
    setPendingMultiStep(null)
    setHasMultiStepEvent(false)
    setDepartureNotification(null)
    
    // Get fresh characters from the full roster pool
    fetch(ROSTER_URL)
      .then(res => res.json())
      .then((rosterData: Member[]) => {
        const withMorale = rosterData.map((m: Member) => ({ ...m, morale: clampMorale(5 + Math.floor(Math.random() * 3)) })) // Random morale 5-7
        const active = shuffle(withMorale).slice(0, 5)
        setRoster(active)
        setCurrent(null)
        setCurrent(drawCard())
      })
      .catch(err => {
        console.error('Failed to load roster for new run:', err)
        // Fallback: use current roster if fetch fails
        setRoster(prev => {
          if (!prev.length) return prev
          const pool = prev
          const active = shuffle(pool).slice(0, 5)
          return active.map(m => ({ ...m, morale: clampMorale(5 + Math.floor(Math.random() * 3)) }))
        })
        setCurrent(null)
        setCurrent(drawCard())
      })
  }

  // Random chatter loop
  useEffect(() => {
    if (victory) return
    let timer: any
    function schedule() {
      const delay = 4000 + Math.random() * 6000
      timer = setTimeout(() => {
        if (roster.length) {
          if (Math.random() < 0.5) {
            const mem = roster[Math.floor(Math.random() * roster.length)]
            const lines = barks[mem.traitId] || []
            if (lines.length) {
              const line = lines[Math.floor(Math.random() * lines.length)]
              pushChat({ speakerId: mem.id, speakerName: mem.name, text: line })
            }
          }
        }
        schedule()
      }, delay)
    }
    schedule()
    return () => { if (timer) clearTimeout(timer) }
  }, [roster, barks, victory])

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleSwipeMove(e as any)
    }

    const handleGlobalMouseUp = () => {
      handleSwipeEnd()
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, swipeStart, swipeOffset, victory, current])

  // UI
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
      color: COLORS.text,
      fontFamily: 'monospace',
      padding: window.innerWidth < 768 ? '5px' : '10px'
    }}>
      {/* Main Menu */}
      {gameMode === 'menu' && (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-8">
          <h1 className="text-4xl md:text-5xl text-center m-0" style={{ color: COLORS.highlight }}>
            Guilds of Arcana Terra
          </h1>
          
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={startRegularMode}
              className="px-6 py-3 text-lg font-bold min-w-[200px] rounded-md border-2 transition"
              style={{
                background: COLORS.accent,
                color: COLORS.text,
                borderColor: COLORS.highlight
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = COLORS.highlight
                e.currentTarget.style.color = COLORS.primary
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = COLORS.accent
                e.currentTarget.style.color = COLORS.text
              }}
            >
              Regular Mode
            </button>
            <a href="/yesyourgoat" className="underline text-base" style={{ color: COLORS.highlight }}>
              YesYourGoat Mode (Collapse Run)
            </a>
            
            <div className="text-center max-w-[400px] text-base" style={{ color: COLORS.textDim }}>
              Manage your guild week by week with random events and resource management
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-2xl" style={{ color: COLORS.highlight, margin: 0 }}>
              Adventure Mode
            </h2>
            
            {Object.values(adventures).map(adventure => (
              <div key={adventure.id} className="flex flex-col items-center gap-2.5">
                <button
                  onClick={() => startAdventureMode(adventure.id)}
                  className="px-6 py-3 text-base font-bold min-w-[200px] rounded-md border-2 transition"
                  style={{
                    background: COLORS.accent,
                    color: COLORS.text,
                    borderColor: COLORS.highlight
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = COLORS.highlight
                    e.currentTarget.style.color = COLORS.primary
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = COLORS.accent
                    e.currentTarget.style.color = COLORS.text
                  }}
                >
                  {adventure.name}
                </button>
                
                <div className="text-sm text-center max-w-[300px]" style={{ color: COLORS.textDim }}>
                  {adventure.description}
                </div>
                
                <div className="text-xs font-bold" style={{ color: COLORS.highlight }}>
                  Difficulty: {adventure.difficulty} • Target Win Rate: {adventure.targetWinRate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Mode UI */}
      {gameMode === 'regular' && (
        <>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              100% { transform: scale(1.05); }
            }
          `}</style>
      {/* Top Bar - Responsive Layout */}
      <div style={{
        background: COLORS.secondary,
        border: `2px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: window.innerWidth < 768 ? '10px 15px' : '15px 20px',
        marginBottom: '5px'
      }}>
        {/* Mobile Layout: Stacked */}
        {window.innerWidth < 768 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Day/Week + Resources Row */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {/* Day/Week */}
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: COLORS.highlight
              }}>
                {`Day ${day} (Week ${Math.floor((day - 1) / 7) + 1})`}
              </div>

              {/* Resources - Reigns Style */}
              <div style={{ 
                display: 'flex', 
                gap: '20px',
                alignItems: 'center'
              }}>
                {/* Funds */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '2px',
                    marginBottom: '2px'
                  }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: i < meters.funds ? COLORS.text : 'transparent',
                          border: `1px solid ${COLORS.text}`,
                          opacity: i < meters.funds ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '20px' }}>💰</div>
                </div>
                
                {/* Reputation */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '2px',
                    marginBottom: '2px'
                  }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: i < meters.reputation ? COLORS.text : 'transparent',
                          border: `1px solid ${COLORS.text}`,
                          opacity: i < meters.reputation ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '20px' }}>⭐</div>
                </div>
                
                {/* Readiness */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '2px',
                    marginBottom: '2px'
                  }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: i < meters.readiness ? COLORS.text : 'transparent',
                          border: `1px solid ${COLORS.text}`,
                          opacity: i < meters.readiness ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '20px' }}>⚔️</div>
                </div>
              </div>
            </div>

            {/* Roster Row */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {roster.map(member => {
                const morale = clampMorale(member.morale ?? 5)
                const borderColor = getPortraitBorderColor(morale)
                return (
                  <div key={member.id} style={{ 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <PortraitWithGradient
                        morale={morale}
                        src={`/resources/portraits/${member.portrait || 'peon.png'}`}
                        alt={member.name}
                        baseStyle={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          border: `3px solid ${borderColor}`,
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: COLORS.secondary,
                        border: `2px solid ${borderColor}`,
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: COLORS.text
                      }}>
                        {morale}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: COLORS.text,
                      fontWeight: 'bold',
                      marginTop: '8px'
                    }}>
                      {member.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Desktop Layout: Side by side */
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center'
          }}>
            {/* Left side: Party Roster */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              flex: 1,
              margin: '0 20px'
            }}>
              {roster.map(member => {
                const morale = clampMorale(member.morale ?? 5)
                const borderColor = getPortraitBorderColor(morale)
                return (
                  <div key={member.id} style={{ 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                    <div style={{ position: 'relative' }}>
                      <PortraitWithGradient
                        morale={morale}
                        src={`/resources/portraits/${member.portrait || 'peon.png'}`}
                        alt={member.name}
                        baseStyle={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '8px',
                          border: `3px solid ${borderColor}`,
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: COLORS.secondary,
                        border: `2px solid ${borderColor}`,
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: COLORS.text
                      }}>
                        {morale}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: COLORS.text,
                      fontWeight: 'bold',
                      marginTop: '8px'
                    }}>
                      {member.name}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right side: Day/Week + Resource Icons */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px'
            }}>
              {/* Day/Week info */}
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: COLORS.highlight,
                textAlign: 'center'
              }}>
                {`Day ${day} (Week ${Math.floor((day - 1) / 7) + 1})`}
              </div>

              {/* Resource Icons - Reigns Style */}
              <div style={{ 
                display: 'flex', 
                gap: '40px',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Funds */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '3px',
                    marginBottom: '4px'
                  }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: i < meters.funds ? COLORS.text : 'transparent',
                          border: `1px solid ${COLORS.text}`,
                          opacity: i < meters.funds ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '32px' }}>💰</div>
                </div>
                
                {/* Reputation */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '3px',
                    marginBottom: '4px'
                  }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: i < meters.reputation ? COLORS.text : 'transparent',
                          border: `1px solid ${COLORS.text}`,
                          opacity: i < meters.reputation ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '32px' }}>⭐</div>
                </div>
                
                {/* Readiness */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '3px',
                    marginBottom: '4px'
                  }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: i < meters.readiness ? COLORS.text : 'transparent',
                          border: `1px solid ${COLORS.text}`,
                          opacity: i < meters.readiness ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '32px' }}>⚔️</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        padding: '0'
      }}>
        
        {/* Center Event Card - Reigns Style */}
        {current && (
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: window.innerWidth < 768 ? '20px' : '35px',
            height: window.innerWidth < 768 ? '400px' : '450px'
          }}>
            <div 
              ref={cardRef}
              style={{
                background: COLORS.accent,
                border: `3px solid ${COLORS.border}`,
                borderRadius: '12px',
                padding: window.innerWidth < 768 ? '25px' : '35px',
                width: window.innerWidth < 768 ? '95%' : '650px',
                maxWidth: '650px',
                height: window.innerWidth < 768 ? '370px' : '420px',
                textAlign: 'left',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                // Swipe transform
                transform: `translateX(${swipeOffset}px) ${isDragging ? `rotate(${swipeOffset * 0.1}deg)` : ''}`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                // Enhanced visual feedback for swipe direction
                opacity: isDragging ? Math.max(0.6, 1 - Math.abs(swipeOffset) / 300) : 1,
                // Scale effect during swipe
                scale: isDragging ? Math.max(0.95, 1 - Math.abs(swipeOffset) / 1000) : 1,
                // Background color hint based on swipe direction
                backgroundColor: swipeDirection === 'left' ? '#8b4513' : swipeDirection === 'right' ? '#8b4513' : COLORS.accent
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Event Text - Prominently at Top */}
              <div style={{ 
                marginBottom: window.innerWidth < 768 ? '20px' : '25px',
                textAlign: 'left'
              }}>
                <h2 style={{ 
                  margin: '0 0 15px', 
                  fontSize: window.innerWidth < 768 ? '20px' : '28px', 
                  color: COLORS.text,
                  fontWeight: 'bold',
                  lineHeight: '1.3'
                }}>
                  {current.title}
                </h2>
                
                <p style={{ 
                  margin: '0', 
                  fontSize: window.innerWidth < 768 ? '16px' : '18px',
                  color: COLORS.textDim,
                  lineHeight: '1.5'
                }}>
                  {current.body}
                </p>
              </div>

              {/* Character Portrait - Embedded in Card */}
              {currentEventMember && (
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: window.innerWidth < 768 ? '20px' : '25px',
                  position: 'relative'
                }}>
                  <div style={{
                    background: COLORS.secondary,
                    border: `3px solid ${COLORS.highlight}`,
                    borderRadius: '12px',
                    padding: window.innerWidth < 768 ? '15px' : '20px',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.4)'
                  }}>
                    <img 
                      src={`/resources/portraits/${currentEventMember.portrait || 'peon.png'}`}
                      alt={currentEventMember.name}
                      style={{
                        width: window.innerWidth < 768 ? '100px' : '150px',
                        height: window.innerWidth < 768 ? '100px' : '150px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      textAlign: 'center',
                      marginTop: '8px',
                      fontSize: window.innerWidth < 768 ? '12px' : '14px',
                      color: COLORS.text,
                      fontWeight: 'bold'
                    }}>
                      {currentEventMember.name}
                    </div>
                  </div>
                </div>
              )}

              {/* Swipe Instructions - Subtle */}
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '12px' : '14px', 
                color: COLORS.textDim, 
                textAlign: 'center',
                opacity: isDragging ? 0.3 : 0.7,
                marginTop: 'auto',
                paddingTop: '15px'
              }}>
                Swipe left or right to choose
              </div>

              {/* Choice Preview - Enhanced during swipe */}
              {isDragging && swipeDirection && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: swipeDirection === 'right' ? '20px' : 'auto',
                  right: swipeDirection === 'left' ? '20px' : 'auto',
                  transform: 'translateY(-50%)',
                  background: swipeDirection === 'right' ? COLORS.success : COLORS.warning,
                  color: COLORS.secondary,
                  padding: window.innerWidth < 768 ? '10px 16px' : '12px 20px',
                  borderRadius: '12px',
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
                  opacity: 1, // Always full opacity
                  pointerEvents: 'none',
                  border: `2px solid ${COLORS.secondary}`,
                  zIndex: 10,
                  // Animation for better visibility
                  animation: 'pulse 0.5s ease-in-out infinite alternate'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '18px' }}>
                      {swipeDirection === 'right' ? '→' : '←'}
                    </div>
                    <div>
                      {swipeDirection === 'right' ? current.right.label : current.left.label}
                    </div>
                  </div>
                </div>
              )}

              {/* Swipe Direction Indicators */}
              {isDragging && (
                <>
                  {/* Left Arrow Indicator */}
                  <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '24px',
                    color: COLORS.textDim,
                    opacity: swipeDirection === 'left' ? 1 : 0.3,
                    transition: 'opacity 0.2s ease'
                  }}>
                    ←
                  </div>
                  {/* Right Arrow Indicator */}
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '24px',
                    color: COLORS.textDim,
                    opacity: swipeDirection === 'right' ? 1 : 0.3,
                    transition: 'opacity 0.2s ease'
                  }}>
                    →
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Victory Banner */}
        {victory && (
          <div style={{ 
            background: COLORS.highlight,
            border: `2px solid ${COLORS.border}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '5px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px', color: COLORS.secondary, fontWeight: 'bold' }}>
              {victory}
            </div>
            <button 
              onClick={newRun}
              style={{
                background: COLORS.warning,
                border: `2px solid ${COLORS.border}`,
                borderRadius: '6px',
                padding: '8px 16px',
                color: COLORS.secondary,
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              New Run
        </button>
          </div>
        )}

        {/* Departure Notification */}
        {departureNotification && (
          <div style={{ 
            background: COLORS.danger,
            border: `2px solid ${COLORS.border}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '5px',
            textAlign: 'center',
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px', color: COLORS.text, fontWeight: 'bold' }}>
              ⚠️ Guild Member Left! ⚠️
            </div>
            <div style={{ fontSize: '16px', marginBottom: '8px', color: COLORS.text }}>
              <strong>{departureNotification.member.name}</strong> has left the guild due to <strong>{departureNotification.reason}</strong>
            </div>
            <div style={{ fontSize: '14px', marginBottom: '12px', color: COLORS.textDim }}>
              {roster.length < 3 ? '⚠️ WARNING: Guild is at risk of collapse!' : `Guild members remaining: ${roster.length}`}
            </div>
            <button 
              onClick={() => setDepartureNotification(null)}
              style={{
                background: COLORS.warning,
                border: `2px solid ${COLORS.border}`,
                borderRadius: '6px',
                padding: '8px 16px',
                color: COLORS.secondary,
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Chat Box */}
        <div style={{ 
          background: COLORS.secondary,
          border: `2px solid ${COLORS.border}`,
          borderRadius: '8px',
          padding: window.innerWidth < 768 ? '10px' : '15px',
          height: window.innerWidth < 768 ? '150px' : '200px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            fontSize: window.innerWidth < 768 ? '14px' : '18px', 
            marginBottom: '10px', 
            color: COLORS.highlight, 
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Guild Chat
          </div>
          {chat.slice(-20).map((c, i) => (
            <div key={i} style={{ 
              fontSize: window.innerWidth < 768 ? '12px' : '14px', 
              marginBottom: '5px',
              textAlign: 'left'
            }}>
              <span style={{ color: COLORS.warning, fontWeight: 'bold' }}>{c.speakerName}:</span>
              <span style={{ color: COLORS.text, marginLeft: '8px' }}>{c.text}</span>
            </div>
          ))}
          {chat.length === 0 && (
            <div style={{ 
              fontSize: window.innerWidth < 768 ? '12px' : '14px', 
              opacity: 0.6, 
              color: COLORS.textDim 
            }}>
              No chatter yet...
            </div>
          )}
        </div>
      </div>
        </>
      )}

      {/* Adventure Mode UI */}
      {gameMode === 'adventure' && currentAdventure && (
        <>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); }
              100% { transform: scale(1.05); }
            }
          `}</style>
          <div>
          {/* Top Bar - Adventure Mode */}
          <div style={{
            background: COLORS.secondary,
            border: `2px solid ${COLORS.border}`,
            borderRadius: '8px',
            padding: window.innerWidth < 768 ? '10px 15px' : '15px 20px',
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={returnToMenu}
                style={{
                  padding: '8px 16px',
                  background: COLORS.accent,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.highlight}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Menu
              </button>
              
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.highlight }}>
                {currentAdventure.name}
              </div>
              
              <div style={{ fontSize: '14px', color: COLORS.textDim }}>
                Step {adventureStep + 1} of {currentAdventure.steps.length}
              </div>
            </div>

            {/* Resources - Same as regular mode */}
            <div style={{ display: 'flex', gap: '20px' }}>
              {Object.entries(meters).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ fontSize: '20px' }}>
                    {key === 'funds' ? '💰' : key === 'reputation' ? '⭐' : '⚔️'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{value}</div>
                  {/* Fill dots */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: i < value ? COLORS.highlight : COLORS.border,
                          transition: 'background 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adventure Event Card */}
          {getCurrentAdventureEvent() && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <div
                ref={cardRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  width: window.innerWidth < 768 ? '95%' : '650px',
                  maxWidth: '650px',
                  height: window.innerWidth < 768 ? '370px' : '420px',
                  background: COLORS.secondary,
                  border: `3px solid ${COLORS.highlight}`,
                  borderRadius: '12px',
                  padding: window.innerWidth < 768 ? '15px' : '20px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.4)',
                  cursor: 'grab',
                  userSelect: 'none',
                  position: 'relative',
                  transform: isDragging ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.1}deg)` : 'none',
                  opacity: isDragging ? 0.9 : 1,
                  transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
                  backgroundColor: swipeDirection ? (swipeDirection === 'left' ? '#4a1a1a' : '#1a4a1a') : COLORS.secondary
                }}
              >
                {/* Event Title */}
                <div style={{
                  fontSize: window.innerWidth < 768 ? '18px' : '22px',
                  fontWeight: 'bold',
                  color: COLORS.highlight,
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  {getCurrentAdventureEvent()?.title}
                </div>

                {/* Event Body */}
                <div style={{
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  lineHeight: '1.4',
                  marginBottom: '20px',
                  textAlign: 'center',
                  color: COLORS.text
                }}>
                  {getCurrentAdventureEvent()?.body}
                </div>

                {/* Character Portrait */}
                {currentEventMember && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: COLORS.secondary,
                      border: `3px solid ${COLORS.highlight}`,
                      borderRadius: '12px',
                      padding: window.innerWidth < 768 ? '15px' : '20px',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.4)'
                    }}>
                      <img
                        src={`/resources/portraits/${currentEventMember.portrait || 'peon.png'}`}
                        alt={currentEventMember.name}
                        style={{
                          width: window.innerWidth < 768 ? '100px' : '150px',
                          height: window.innerWidth < 768 ? '100px' : '150px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      <div style={{
                        textAlign: 'center',
                        marginTop: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: COLORS.highlight
                      }}>
                        {currentEventMember.name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Choice Buttons */}
                {getCurrentAdventureEvent()?.left && getCurrentAdventureEvent()?.right && (
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => adventureSubstep ? handleAdventureSubstep('left') : handleAdventureChoice('left')}
                      style={{
                        padding: '12px 20px',
                        background: COLORS.accent,
                        color: COLORS.text,
                        border: `2px solid ${COLORS.highlight}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minWidth: '120px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = COLORS.highlight
                        e.currentTarget.style.color = COLORS.primary
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = COLORS.accent
                        e.currentTarget.style.color = COLORS.text
                      }}
                    >
                      {adventureSubstep ? 
                        (getCurrentAdventureEvent()?.left?.substeps?.[adventureSubstep]?.left?.label || 'Left') :
                        (getCurrentAdventureEvent()?.left?.label || 'Left')
                      }
                    </button>
                    
                    <button
                      onClick={() => adventureSubstep ? handleAdventureSubstep('right') : handleAdventureChoice('right')}
                      style={{
                        padding: '12px 20px',
                        background: COLORS.accent,
                        color: COLORS.text,
                        border: `2px solid ${COLORS.highlight}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        minWidth: '120px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = COLORS.highlight
                        e.currentTarget.style.color = COLORS.primary
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = COLORS.accent
                        e.currentTarget.style.color = COLORS.text
                      }}
                    >
                      {adventureSubstep ? 
                        (getCurrentAdventureEvent()?.left?.substeps?.[adventureSubstep]?.right?.label || 'Right') :
                        (getCurrentAdventureEvent()?.right?.label || 'Right')
                      }
                    </button>
                  </div>
                )}

                {/* Swipe Instructions */}
                <div style={{
                  textAlign: 'center',
                  marginTop: '15px',
                  fontSize: '12px',
                  color: COLORS.textDim,
                  fontStyle: 'italic'
                }}>
                  Swipe left or right to choose
                </div>

                {/* Swipe Visual Feedback */}
                {isDragging && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: COLORS.highlight,
                    color: COLORS.primary,
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: `2px solid ${COLORS.secondary}`,
                    zIndex: 10,
                    animation: 'pulse 0.5s ease-in-out infinite alternate'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '18px' }}>
                        {swipeDirection === 'right' ? '→' : '←'}
                      </div>
                      <div>
                        {swipeDirection === 'right' ? 
                          (adventureSubstep ? 
                            (getCurrentAdventureEvent()?.left?.substeps?.[adventureSubstep]?.right?.label || 'Right') :
                            (getCurrentAdventureEvent()?.right?.label || 'Right')
                          ) : 
                          (adventureSubstep ? 
                            (getCurrentAdventureEvent()?.left?.substeps?.[adventureSubstep]?.left?.label || 'Left') :
                            (getCurrentAdventureEvent()?.left?.label || 'Left')
                          )
                        }
                      </div>
                    </div>
                  </div>
                )}

                {/* Swipe Direction Indicators */}
                {isDragging && (
                  <>
                    <div style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '24px',
                      color: COLORS.textDim,
                      opacity: swipeDirection === 'left' ? 1 : 0.3,
                      transition: 'opacity 0.2s ease'
                    }}>
                      ←
                    </div>
                    <div style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '24px',
                      color: COLORS.textDim,
                      opacity: swipeDirection === 'right' ? 1 : 0.3,
                      transition: 'opacity 0.2s ease'
                    }}>
                      →
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Victory/Loss Screen */}
          {victory && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: COLORS.secondary,
                border: `3px solid ${victory.includes('Failed') ? COLORS.danger : COLORS.success}`,
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                maxWidth: '400px',
                margin: '20px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: victory.includes('Failed') ? COLORS.danger : COLORS.success,
                  marginBottom: '20px'
                }}>
                  {victory}
                </div>
                
                <div style={{
                  fontSize: '16px',
                  marginBottom: '20px',
                  color: COLORS.text
                }}>
                  {victory.includes('Failed') ? 
                    'Your guild couldn\'t handle the challenge. Better luck next time!' :
                    'Congratulations! Your guild successfully completed the adventure!'
                  }
                </div>
                
                <button
                  onClick={returnToMenu}
                  style={{
                    padding: '12px 24px',
                    background: COLORS.accent,
                    color: COLORS.text,
                    border: `2px solid ${COLORS.highlight}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Return to Menu
                </button>
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  )
}
