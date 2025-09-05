import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// Data URLs (served from public/)
const EVENTS_URL = '/resources/events/events.json'
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
  const cardRef = useRef<HTMLDivElement>(null)

  function pushChat(msg: ChatMsg) {
    setChat(prev => [...prev, msg].slice(-40))
  }

  // Swipe handling functions
  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (victory || !current) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setSwipeStart({ x: clientX, y: clientY })
    setSwipeOffset(0)
    setIsDragging(true)
  }

  const handleSwipeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !swipeStart || victory || !current) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const deltaX = clientX - swipeStart.x
    
    // Limit swipe distance
    const maxSwipe = 150
    const limitedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX))
    setSwipeOffset(limitedDeltaX)
  }

  const handleSwipeEnd = () => {
    if (!isDragging || !swipeStart || victory || !current) return
    
    const swipeThreshold = 100
    const swipeDirection = swipeOffset > swipeThreshold ? 'right' : swipeOffset < -swipeThreshold ? 'left' : null
    
    if (swipeDirection) {
      decide(swipeDirection)
    }
    
    // Reset swipe state
    setSwipeStart(null)
    setSwipeOffset(0)
    setIsDragging(false)
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
    setRoster(prev => {
      if (!prev.length) return prev
      const pool = prev
      const active = shuffle(pool).slice(0, 5)
      return active.map(m => ({ ...m, morale: clampMorale(5 + Math.floor(Math.random() * 3)) })) // Random morale 5-7
    })
    setCurrent(null)
    setCurrent(drawCard())
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
      {/* Top Bar with Roster + Day/Week + Resources */}
      <div style={{
        background: COLORS.secondary,
        border: `2px solid ${COLORS.border}`,
        borderRadius: '8px',
        padding: window.innerWidth < 768 ? '10px 15px' : '15px 20px',
        marginBottom: '5px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap'
      }}>
        {/* Left side: Party Roster */}
        <div style={{ 
          display: 'flex', 
          gap: window.innerWidth < 768 ? '10px' : '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          flex: 1,
          margin: window.innerWidth < 768 ? '0 0 10px 0' : '0 20px'
        }}>
          {roster.map(member => {
            const morale = clampMorale(member.morale ?? 5)
            const borderColor = morale <= 3 ? COLORS.danger : morale <= 5 ? COLORS.warning : COLORS.success
            return (
              <div key={member.id} style={{ 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`/resources/portraits/${member.portrait || 'peon.png'}`}
                    alt={member.name}
                    style={{
                      width: window.innerWidth < 768 ? '60px' : '80px',
                      height: window.innerWidth < 768 ? '60px' : '80px',
                      borderRadius: '8px',
                      border: `3px solid ${borderColor}`,
                      objectFit: 'cover'
                    }}
                  />
                  {/* Morale number anchored to bottom center of portrait */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: COLORS.secondary,
                    border: `2px solid ${borderColor}`,
                    borderRadius: '50%',
                    width: window.innerWidth < 768 ? '20px' : '24px',
                    height: window.innerWidth < 768 ? '20px' : '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: window.innerWidth < 768 ? '10px' : '12px',
                    fontWeight: 'bold',
                    color: COLORS.text
                  }}>
                    {morale}
                  </div>
                </div>
                <div style={{ 
                  fontSize: window.innerWidth < 768 ? '12px' : '14px', 
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
          gap: window.innerWidth < 768 ? '10px' : '15px'
        }}>
          {/* Day/Week info */}
          <div style={{ 
            fontSize: window.innerWidth < 768 ? '14px' : '18px', 
            fontWeight: 'bold', 
            color: COLORS.highlight,
            textAlign: 'center'
          }}>
            {`Day ${day} (Week ${Math.floor((day - 1) / 7) + 1})`}
          </div>

          {/* Resource Icons */}
          <div style={{ 
            display: 'flex', 
            gap: window.innerWidth < 768 ? '20px' : '30px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Funds - Simple icon with number */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '24px' : '32px',
                textAlign: 'center'
              }}>💰</div>
              <span style={{ 
                fontSize: window.innerWidth < 768 ? '14px' : '16px', 
                fontWeight: 'bold', 
                color: COLORS.text 
              }}>{meters.funds}</span>
            </div>
            
            {/* Reputation - Simple icon with number */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '24px' : '32px',
                textAlign: 'center'
              }}>⭐</div>
              <span style={{ 
                fontSize: window.innerWidth < 768 ? '14px' : '16px', 
                fontWeight: 'bold', 
                color: COLORS.text 
              }}>{meters.reputation}</span>
            </div>
            
            {/* Readiness - Simple icon with number */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '24px' : '32px',
                textAlign: 'center'
              }}>⚔️</div>
              <span style={{ 
                fontSize: window.innerWidth < 768 ? '14px' : '16px', 
                fontWeight: 'bold', 
                color: COLORS.text 
              }}>{meters.readiness}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        padding: '0'
      }}>
        
        {/* Center Event Card - Responsive Size */}
        {current && (
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: window.innerWidth < 768 ? '20px' : '35px', // GAP: Adjust this value to change spacing between event box and chat box
            height: window.innerWidth < 768 ? '400px' : '500px' // Responsive height
          }}>
            <div 
              ref={cardRef}
              style={{
                background: COLORS.accent,
                border: `3px solid ${COLORS.border}`,
                borderRadius: '12px',
                padding: window.innerWidth < 768 ? '20px' : '30px',
                width: window.innerWidth < 768 ? '95%' : '700px', // Responsive width
                maxWidth: '700px',
                height: window.innerWidth < 768 ? '360px' : '460px', // Responsive height
                textAlign: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                // Swipe transform
                transform: `translateX(${swipeOffset}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                // Visual feedback for swipe direction
                opacity: isDragging ? Math.max(0.7, 1 - Math.abs(swipeOffset) / 200) : 1,
                // Rotation based on swipe
                rotate: isDragging ? `${swipeOffset * 0.1}deg` : '0deg'
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Large Character Portrait */}
              {currentEventMember && (
                <div style={{ marginBottom: window.innerWidth < 768 ? '15px' : '20px' }}>
                  <img 
                    src={`/resources/portraits/${currentEventMember.portrait || 'peon.png'}`}
                    alt={currentEventMember.name}
                    style={{
                      width: window.innerWidth < 768 ? '120px' : '200px',
                      height: window.innerWidth < 768 ? '120px' : '200px',
                      borderRadius: '12px',
                      border: `4px solid ${COLORS.highlight}`,
                      objectFit: 'cover',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
                    }}
                  />
                </div>
              )}

              {/* Event Content - Responsive container */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Event Title */}
                <h2 style={{ 
                  margin: '0 0 15px', 
                  fontSize: window.innerWidth < 768 ? '18px' : '24px', 
                  color: COLORS.text,
                  fontWeight: 'bold'
                }}>
                  {current.title}
                </h2>
                
                {/* Event Body */}
                <p style={{ 
                  margin: '0 0 20px', 
                  fontSize: window.innerWidth < 768 ? '14px' : '16px',
                  color: COLORS.textDim,
                  lineHeight: '1.4',
                  maxHeight: window.innerWidth < 768 ? '60px' : '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {current.body}
                </p>
              </div>

              {/* Swipe Instructions */}
              <div style={{ 
                fontSize: window.innerWidth < 768 ? '10px' : '12px', 
                color: COLORS.textDim, 
                marginBottom: '15px',
                opacity: isDragging ? 0.5 : 1
              }}>
                Swipe left or right, or click buttons below
              </div>

              {/* Choice Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: window.innerWidth < 768 ? '10px' : '20px', 
                justifyContent: 'center',
                flexWrap: window.innerWidth < 768 ? 'wrap' : 'nowrap'
              }}>
                <button 
                  disabled={!!victory}
                  onClick={() => decide('left')}
                  style={{
                    background: COLORS.warning,
                    border: 'none',
                    borderRadius: '8px',
                    padding: window.innerWidth < 768 ? '10px 16px' : '12px 24px',
                    color: COLORS.secondary,
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    fontWeight: 'bold',
                    cursor: victory ? 'not-allowed' : 'pointer',
                    opacity: victory ? 0.5 : 1,
                    minWidth: window.innerWidth < 768 ? '120px' : '140px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    // Visual feedback for swipe direction
                    transform: isDragging && swipeOffset < -50 ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  ← {current.left.label}
                </button>
                <button 
                  disabled={!!victory}
                  onClick={() => decide('right')}
                  style={{
                    background: COLORS.success,
                    border: 'none',
                    borderRadius: '8px',
                    padding: window.innerWidth < 768 ? '10px 16px' : '12px 24px',
                    color: COLORS.secondary,
                    fontSize: window.innerWidth < 768 ? '14px' : '16px',
                    fontWeight: 'bold',
                    cursor: victory ? 'not-allowed' : 'pointer',
                    opacity: victory ? 0.5 : 1,
                    minWidth: window.innerWidth < 768 ? '120px' : '140px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                    // Visual feedback for swipe direction
                    transform: isDragging && swipeOffset > 50 ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  {current.right.label} →
                </button>
              </div>
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
    </div>
  )
}
