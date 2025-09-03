import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

// Data URLs (served from public/)
const EVENTS_URL = '/resources/events/events.json'
const ROSTER_URL = '/resources/roster.json'
const BARKS_URL  = '/resources/barks/trait_barks.json'

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

type Member = { id: string; name: string; traitId: string; morale?: number }

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

function barColor(value: number, max: number) {
  const pct = (value / max) * 100
  if (pct <= 30) return '#dc2626'   // red - bad
  if (pct <= 60) return '#d97706'   // orange - caution  
  return '#059669'                  // green - good
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [meters, setMeters] = useState<Meters>({ funds: 5, reputation: 5, readiness: 5 })
  const [week, setWeek] = useState<number>(1)
  const [events, setEvents] = useState<EventCard[]>([])
  const [raidChecks, setRaidChecks] = useState<EventCard[]>([])
  const [roster, setRoster] = useState<Member[]>([])
  const [barks, setBarks] = useState<Record<string, string[]>>({})
  const [hookTraits, setHookTraits] = useState<string[]>([])
  const [lastMsg, setLastMsg] = useState<string>('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [victory, setVictory] = useState<string>('')
  const [perfStreak, setPerfStreak] = useState<number>(0) // all meters >=8 for consecutive weeks
  const [legendStreak, setLegendStreak] = useState<number>(0) // reputation == 10 for consecutive weeks
  const [chat, setChat] = useState<ChatMsg[]>([])

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
      setRoster(withMorale)
      const active = shuffle(withMorale).slice(0, 5)
      setRoster(active)

      setBarks(barksData)

      // Restore save now that active roster is set (apply morale mapping for active only)
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
      setLastMsg(String(err?.message ?? err))
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
    const card = weightedPick(cardPool, (e) => weightForEvent(e, meters.reputation, meters.readiness))
    currentCardRef.current = card
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
    if (victory) return // already won
    // Survivor: reach week 25+
    if (nextWeek >= 25) {
      setVictory('Victory — Survivor: Your guild endured to Week 25!')
      return
    }
    // Update streaks
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
    setHookTraits(matchedTraits)
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
    setLastMsg(loss ?? delta)
    setLog(prev => [...prev, { week, title: ev.title ?? 'Untitled', choice: choice.label ?? side, delta }].slice(-20))
    if (loss) {
      return
    }
    // Compute next state for win checks (week advances by 1 after decision)
    const nextWeek = week + 1
    const nextMeters = { ...meters }
    winCheck(nextMeters, nextWeek)
    setWeek(prev => prev + 1)
    setCurrent(drawCard())
  }

  function newRun() {
    // Simple reset; keep content loaded
    localStorage.removeItem('yyg_state_ts')
    setMeters({ funds: 5, reputation: 5, readiness: 5 })
    setWeek(1)
    setLog([])
    setLastMsg('')
    setHookTraits([])
    setVictory('')
    setPerfStreak(0)
    setLegendStreak(0)
    // Reroll active roster
    setRoster(prev => {
      if (!prev.length) return prev
      const pool = prev
      const active = shuffle(pool).slice(0, 5)
      return active.map(m => ({ ...m, morale: clampMorale(m.morale ?? 50) }))
    })
    setCurrent(null)
    setCurrent(drawCard())
  }

  // Compute a bark line when a trait hook triggered
  const barkLine = useMemo(() => {
    if (!hookTraits.length) return ''
    const tid = hookTraits[Math.floor(Math.random() * hookTraits.length)]
    const lines = barks[tid] || []
    if (!lines.length) return ''
    return '"' + lines[Math.floor(Math.random() * lines.length)] + '"'
  }, [hookTraits, barks])

  // Random chatter loop: periodically post a line from a random active member's trait barks
  useEffect(() => {
    if (victory) return
    let timer: any
    function schedule() {
      const delay = 4000 + Math.random() * 6000 // 4-10s
      timer = setTimeout(() => {
        if (roster.length) {
          // 50% chance to emit chatter to avoid spam
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
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <header style={{ paddingBottom: 12, borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: 18, opacity: 0.8 }}>Yes, Your Goat — React/TS</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['funds','reputation','readiness'] as (keyof Meters)[]).map(k => {
            const v = clamp(meters[k])
            const color = barColor(v, CLAMP_MAX)
            const label = k === 'reputation' ? 'Reputation' : k[0].toUpperCase()+k.slice(1)
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 80, fontSize: 12, opacity: 0.7 }}>{label}</span>
                <div style={{ position: 'relative', width: 200, height: 14, background: '#1a1a1a', borderRadius: 999, overflow: 'hidden', border: '1px solid #333' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v / CLAMP_MAX * 100}%`, background: color }} />
                  <div style={{ position: 'relative', textAlign: 'center', fontSize: 11, lineHeight: '14px', color: '#ffffff', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{v}/10</div>
                </div>
              </div>
            )
          })}
          <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>Week: {week}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start', marginTop: 16 }}>
        {/* Roster Panel */}
        <aside style={{ background: '#161a22', border: '1px solid #242a36', borderRadius: 12 }}>
          <div style={{ padding: 12, borderBottom: '1px solid #242a36', fontSize: 12, opacity: 0.8 }}>Roster</div>
          <div style={{ padding: 12 }}>
            {roster.map(m => {
              const morale = clampMorale(m.morale ?? 50)
              const color = barColor(morale, 100)
              return (
                <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px dashed #242a36' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 12 }}>{m.name} <span style={{ opacity: 0.6 }}>({m.traitId})</span></div>
                  </div>
                  <div style={{ marginTop: 6, position: 'relative', width: '100%', height: 10, background: '#1a1a1a', borderRadius: 999, overflow: 'hidden', border: '1px solid #333' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${morale}%`, background: color }} />
                    <div style={{ position: 'relative', textAlign: 'center', fontSize: 10, lineHeight: '10px', color: '#ffffff', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>{morale}/100</div>
                  </div>
                </div>
              )
            })}
          </div>
          {hookTraits.length > 0 && (
            <div style={{ padding: 12, borderTop: '1px solid #242a36', fontSize: 12 }}>
              <div style={{ opacity: 0.8, marginBottom: 6 }}>Last Trigger:</div>
              <div>{hookTraits.join(', ')}</div>
            </div>
          )}
          <div style={{ padding: 12, borderTop: '1px solid #242a36' }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Chat</div>
            <div style={{ height: 180, overflowY: 'auto', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 8, padding: 8 }}>
              {chat.slice(-30).map((c, i) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: '#93c5fd' }}>{c.speakerName}:</span> <span style={{ color: '#cbd5e1' }}>{c.text}</span>
                </div>
              ))}
              {chat.length === 0 && (
                <div style={{ fontSize: 12, opacity: 0.6 }}>No chatter yet…</div>
              )}
            </div>
          </div>
        </aside>

        <main>
          {current && (
            <section style={{ background: '#161a22', border: '1px solid #242a36', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: 20 }}>
                <h2 style={{ margin: '0 0 6px' }}>{current.title}</h2>
                <p style={{ margin: '0 0 16px', opacity: 0.8 }}>{current.body}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button disabled={!!victory} onClick={() => decide('left')}>{current.left.label}</button>
                  <button disabled={!!victory} onClick={() => decide('right')}>{current.right.label}</button>
                </div>
              </div>
            </section>
          )}

          {victory && (
            <section style={{ marginTop: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>{victory}</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={newRun}>New Run</button>
              </div>
            </section>
          )}

          <section style={{ marginTop: 12, minHeight: 20, fontSize: 12, opacity: 0.75 }}>
            {lastMsg}
            {barkLine && (
              <div style={{ marginTop: 4, fontStyle: 'italic', color: '#8b949e' }}>{barkLine}</div>
            )}
          </section>

          <section style={{ marginTop: 16, borderTop: '1px solid #242a36', paddingTop: 12 }}>
            {log.slice(-8).reverse().map((entry, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px dashed #242a36' }}>
                <div style={{ fontSize: 12 }}>{`W${entry.week} — ${entry.title}`}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{`${entry.choice}: ${entry.delta}`}</div>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}
