import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// Data URLs (served from public/)
const EVENTS_URL = '/resources/events/events.json'
const ROSTER_URL = '/resources/roster.json'
const BARKS_URL  = '/resources/barks/trait_barks.json'

// Color palette from provided image
const COLORS = {
  orange: '#d7913a',
  lightGreen: '#b9db82', 
  darkOlive: '#5f4c0c',
  taupe: '#a28f65',
  lavender: '#9484bc',
  darkSlate: '#364652'
}

// Types
type Meters = { funds: number; reputation: number; readiness: number }
type Effects = Partial<Meters & { morale_all: number }> & Record<string, number>

type Hook = { when: string; effect: Effects }

type Choice = {
  label: string
  effects: Effects
  hooks?: Hook[]
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

type LogEntry = { week: number; title: string; choice: string; delta: string }

type ChatMsg = { speakerId?: string; speakerName: string; text: string }

const CLAMP_MIN = 0, CLAMP_MAX = 10

function clamp(v: number) { return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, v)) }
function clampMorale(v: number) { return Math.max(0, Math.min(100, Math.round(v))) }

function fmtDelta(v: number) { return v > 0 ? `+${v}` : `${v}` }

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
function generatePartyEvent(member: Member, week: number): EventCard {
  const events = [
    {
      id: `${member.id}_drama_${week}`,
      title: `${member.name} has a problem`,
      body: `${member.name} is causing issues in the guild. How do you handle this?`,
      left: {
        label: "Support them",
        effects: { [`morale_${member.id}`]: 2, reputation: -1 },
        hooks: member.traitId === 'drama_queen' ? [{ when: 'trait:drama_queen', effect: { reputation: -1 } }] : undefined
      },
      right: {
        label: "Discipline them", 
        effects: { [`morale_${member.id}`]: -2, reputation: 1 },
        hooks: member.traitId === 'hardcore_permadeather' ? [{ when: 'trait:hardcore_permadeather', effect: { readiness: -1 } }] : undefined
      }
    },
    {
      id: `${member.id}_request_${week}`,
      title: `${member.name} makes a request`,
      body: `${member.name} wants something from the guild. What do you do?`,
      left: {
        label: "Grant it",
        effects: { [`morale_${member.id}`]: 1, funds: -1 },
        hooks: member.traitId === 'meta_slave' ? [{ when: 'trait:meta_slave', effect: { readiness: 1 } }] : undefined
      },
      right: {
        label: "Deny it",
        effects: { [`morale_${member.id}`]: -1, funds: 0 },
        hooks: member.traitId === 'afk_farmer' ? [{ when: 'trait:afk_farmer', effect: { readiness: -1 } }] : undefined
      }
    },
    {
      id: `${member.id}_conflict_${week}`,
      title: `${member.name} conflicts with others`,
      body: `${member.name} is having trouble with other guild members.`,
      left: {
        label: "Mediate",
        effects: { [`morale_${member.id}`]: 1, readiness: -1 },
        hooks: member.traitId === 'guild_leader' ? [{ when: 'trait:guild_leader', effect: { reputation: 1 } }] : undefined
      },
      right: {
        label: "Let them sort it out",
        effects: { [`morale_${member.id}`]: -1, readiness: 1 },
        hooks: member.traitId === 'theorycrafter' ? [{ when: 'trait:theorycrafter', effect: { readiness: 1 } }] : undefined
      }
    }
  ]
  return events[Math.floor(Math.random() * events.length)]
}

export default function App() {
  const [meters, setMeters] = useState<Meters>({ funds: 5, reputation: 5, readiness: 5 })
  const [week, setWeek] = useState<number>(1)
  const [events, setEvents] = useState<EventCard[]>([])
  const [raidChecks, setRaidChecks] = useState<EventCard[]>([])
  const [roster, setRoster] = useState<Member[]>([])
  const [barks, setBarks] = useState<Record<string, string[]>>({})
  const [log, setLog] = useState<LogEntry[]>([])
  const [victory, setVictory] = useState<string>('')
  const [perfStreak, setPerfStreak] = useState<number>(0)
  const [legendStreak, setLegendStreak] = useState<number>(0)
  const [chat, setChat] = useState<ChatMsg[]>([])
  const [currentEventMember, setCurrentEventMember] = useState<Member | null>(null)

  function pushChat(msg: ChatMsg) {
    setChat(prev => [...prev, msg].slice(-40))
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
      const withMorale = rosterData.map(m => ({ ...m, morale: clampMorale(m.morale ?? 50) }))
      const active = shuffle(withMorale).slice(0, 5)
      setRoster(active)

      setBarks(barksData)

      // Restore save now that active roster is set
      const raw = localStorage.getItem('yyg_state_ts')
      if (raw) {
        try {
          const s = JSON.parse(raw)
          if (s?.meters) setMeters((prev) => ({ ...prev, ...s.meters }))
          if (Number.isInteger(s?.week)) setWeek(s.week)
          if (Array.isArray(s?.log)) setLog(s.log.slice(-20))
          if (s?.morale) {
            setRoster(prev => prev.map(m => ({ ...m, morale: clampMorale(s.morale[m.id] ?? m.morale ?? 50) })))
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
    const morale = Object.fromEntries(roster.map(m => [m.id, m.morale ?? 50]))
    localStorage.setItem('yyg_state_ts', JSON.stringify({ meters, week, morale, log }))
  }, [meters, week, roster, log])

  const cardPool = useMemo(() => {
    return (week % 3 === 0 && raidChecks.length) ? raidChecks : events
  }, [week, raidChecks, events])

  const currentCardRef = useRef<EventCard | null>(null)
  function drawCard(): EventCard | null {
    // For party-based events, generate from a random party member
    if (week % 3 !== 0 && roster.length) {
      const member = roster[Math.floor(Math.random() * roster.length)]
      const partyEvent = generatePartyEvent(member, week)
      setCurrentEventMember(member)
      currentCardRef.current = partyEvent
      return partyEvent
    }
    
    // For raid checks, use existing system
    const card = weightedPick(cardPool, (e) => weightForEvent(e, meters.reputation, meters.readiness))
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

  function applyEffects(effects?: Effects): string {
    if (!effects) return 'No change'
    const next = { ...meters }
    const deltas: string[] = []
    const moraleDeltas: string[] = []
    for (const [k, v] of Object.entries(effects)) {
      if (k in next && typeof v === 'number') {
        // @ts-expect-error narrowed by key check
        next[k] = clamp((next as any)[k] + v)
        deltas.push(`${k}: ${fmtDelta(v)}`)
        continue
      }
      if (k === 'morale_all' && typeof v === 'number') {
        setRoster(prev => prev.map(mem => ({ ...mem, morale: clampMorale((mem.morale ?? 50) + v) })))
        moraleDeltas.push(`morale_all: ${fmtDelta(v)}`)
        continue
      }
      const mm = k.match(/^morale_(.+)$/)
      if (mm && typeof v === 'number') {
        const id = mm[1]
        setRoster(prev => prev.map(mem => mem.id === id ? { ...mem, morale: clampMorale((mem.morale ?? 50) + v) } : mem))
        moraleDeltas.push(`${k}: ${fmtDelta(v)}`)
        continue
      }
    }
    setMeters(next)
    const parts: string[] = []
    if (deltas.length) parts.push(deltas.join('  •  '))
    if (moraleDeltas.length) parts.push(moraleDeltas.join('  •  '))
    return parts.length ? parts.join('  •  ') : 'No change'
  }

  function lossCheck(): string | null {
    if (meters.funds <= 0) return 'Guild Funds hit 0 - you lose.'
    if (meters.reputation <= 0) return 'Server Reputation hit 0 - you lose.'
    if (meters.readiness <= 0) return 'Raid Readiness hit 0 - you lose.'
    return null
  }

  function winCheck(nextMeters: Meters, nextWeek: number) {
    if (victory) return
    if (nextWeek >= 25) {
      setVictory('Victory — Survivor: Your guild endured to Week 25!')
      return
    }
    const allHigh = nextMeters.funds >= 8 && nextMeters.reputation >= 8 && nextMeters.readiness >= 8
    const nextPerf = allHigh ? perfStreak + 1 : 0
    const nextLegend = nextMeters.reputation === 10 ? legendStreak + 1 : 0
    setPerfStreak(nextPerf)
    setLegendStreak(nextLegend)
    if (nextPerf >= 10) {
      setVictory('Victory — Perfectionist: Maintained all meters ≥ 8 for 10 weeks!')
      return
    }
    if (nextLegend >= 10) {
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
    
    const deltaA = applyEffects(choice.effects)
    for (const ef of extraEffects) applyEffects(ef)
    const loss = lossCheck()
    const delta = deltaA
    setLog(prev => [...prev, { week, title: ev.title ?? 'Untitled', choice: choice.label ?? side, delta }].slice(-20))
    if (loss) {
      return
    }
    const nextWeek = week + 1
    const nextMeters = { ...meters }
    winCheck(nextMeters, nextWeek)
    setWeek(prev => prev + 1)
    setCurrent(drawCard())
  }

  function newRun() {
    localStorage.removeItem('yyg_state_ts')
    setMeters({ funds: 5, reputation: 5, readiness: 5 })
    setWeek(1)
    setLog([])
    setVictory('')
    setPerfStreak(0)
    setLegendStreak(0)
    setRoster(prev => {
      if (!prev.length) return prev
      const pool = prev
      const active = shuffle(pool).slice(0, 5)
      return active.map(m => ({ ...m, morale: clampMorale(m.morale ?? 50) }))
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

  // UI
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${COLORS.darkSlate} 0%, ${COLORS.darkOlive} 100%)`,
      color: COLORS.lightGreen,
      fontFamily: 'monospace'
    }}>
      {/* Top Resources Bar */}
      <header style={{ 
        padding: '12px 24px', 
        background: COLORS.taupe,
        borderBottom: `2px solid ${COLORS.darkOlive}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: 14, fontWeight: 'bold' }}>
          Week {week} • Guild Master
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Resource Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💰</span>
            <span style={{ fontSize: 12 }}>{meters.funds}/10</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ fontSize: 12 }}>{meters.reputation}/10</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚔️</span>
            <span style={{ fontSize: 12 }}>{meters.readiness}/10</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 60px)',
        padding: '24px'
      }}>
        
        {/* Center Event Card */}
        {current && (
          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <div style={{
              background: COLORS.taupe,
              border: `3px solid ${COLORS.darkOlive}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '100%',
              textAlign: 'center',
              boxShadow: `0 8px 24px rgba(0,0,0,0.3)`
            }}>
              {/* Event Title */}
              <h2 style={{ 
                margin: '0 0 16px', 
                fontSize: 18, 
                color: COLORS.lightGreen,
                fontWeight: 'bold'
              }}>
                {current.title}
              </h2>
              
              {/* Event Body */}
              <p style={{ 
                margin: '0 0 24px', 
                fontSize: 14,
                color: COLORS.lightGreen,
                opacity: 0.9,
                lineHeight: 1.4
              }}>
                {current.body}
              </p>

              {/* Character Portrait */}
              {currentEventMember && (
                <div style={{ marginBottom: 24 }}>
                  <img 
                    src={`/resources/portraits/${currentEventMember.portrait || 'peon.png'}`}
                    alt={currentEventMember.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      border: `2px solid ${COLORS.lavender}`,
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ 
                    marginTop: 8, 
                    fontSize: 14, 
                    color: COLORS.lightGreen,
                    fontWeight: 'bold'
                  }}>
                    {currentEventMember.name}
                  </div>
                </div>
              )}

              {/* Choice Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button 
                  disabled={!!victory}
                  onClick={() => decide('left')}
                  style={{
                    background: COLORS.orange,
                    border: `2px solid ${COLORS.darkOlive}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: COLORS.darkOlive,
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: victory ? 'not-allowed' : 'pointer',
                    opacity: victory ? 0.5 : 1
                  }}
                >
                  {current.left.label}
                </button>
                <button 
                  disabled={!!victory}
                  onClick={() => decide('right')}
                  style={{
                    background: COLORS.lightGreen,
                    border: `2px solid ${COLORS.darkOlive}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: COLORS.darkOlive,
                    fontSize: 14,
                    fontWeight: 'bold',
                    cursor: victory ? 'not-allowed' : 'pointer',
                    opacity: victory ? 0.5 : 1
                  }}
                >
                  {current.right.label}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Victory Banner */}
        {victory && (
          <div style={{ 
            background: COLORS.lavender,
            border: `2px solid ${COLORS.darkOlive}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 16, marginBottom: 8, color: COLORS.darkOlive, fontWeight: 'bold' }}>
              {victory}
            </div>
            <button 
              onClick={newRun}
              style={{
                background: COLORS.orange,
                border: `2px solid ${COLORS.darkOlive}`,
                borderRadius: 6,
                padding: '8px 16px',
                color: COLORS.darkOlive,
                fontSize: 12,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              New Run
            </button>
          </div>
        )}

        {/* Chat Box */}
        <div style={{ 
          background: COLORS.darkSlate,
          border: `2px solid ${COLORS.darkOlive}`,
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          height: 120,
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: COLORS.lightGreen, fontWeight: 'bold' }}>
            Guild Chat
          </div>
          {chat.slice(-20).map((c, i) => (
            <div key={i} style={{ 
              fontSize: 11, 
              marginBottom: 4,
              textAlign: 'left'
            }}>
              <span style={{ color: COLORS.orange, fontWeight: 'bold' }}>{c.speakerName}:</span>
              <span style={{ color: COLORS.lightGreen, marginLeft: 8 }}>{c.text}</span>
            </div>
          ))}
          {chat.length === 0 && (
            <div style={{ fontSize: 11, opacity: 0.6, color: COLORS.lightGreen }}>
              No chatter yet...
            </div>
          )}
        </div>

        {/* Bottom Roster */}
        <div style={{ 
          background: COLORS.taupe,
          border: `2px solid ${COLORS.darkOlive}`,
          borderRadius: 8,
          padding: 12
        }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: COLORS.lightGreen, fontWeight: 'bold' }}>
            Party Roster
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {roster.map(m => {
              const morale = clampMorale(m.morale ?? 50)
              const borderColor = morale <= 30 ? COLORS.orange : morale <= 60 ? COLORS.lightGreen : COLORS.lightGreen
              return (
                <div key={m.id} style={{ 
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    border: `3px solid ${borderColor}`,
                    borderRadius: 8,
                    padding: 4,
                    background: COLORS.darkSlate
                  }}>
                    <img 
                      src={`/resources/portraits/${m.portrait || 'peon.png'}`}
                      alt={m.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 4,
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ 
                    fontSize: 10, 
                    marginTop: 4, 
                    color: COLORS.lightGreen,
                    fontWeight: 'bold'
                  }}>
                    {m.name}
                  </div>
                  <div style={{ 
                    fontSize: 9, 
                    color: COLORS.lightGreen,
                    opacity: 0.7
                  }}>
                    {morale}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
