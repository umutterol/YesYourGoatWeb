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
      const rosterWithMorale = rosterData.map(m => ({ ...m, morale: clampMorale(m.morale ?? 50) }))
      setRoster(rosterWithMorale)
      setBarks(barksData)

      // Restore save now that roster is set (so morale mapping works)
      const raw = localStorage.getItem('yyg_state_ts')
      if (raw) {
        try {
          const s = JSON.parse(raw)
          if (s?.meters) setMeters((prev) => ({ ...prev, ...s.meters }))
          if (Number.isInteger(s?.week)) setWeek(s.week)
          if (Array.isArray(s?.log)) setLog(s.log.slice(-20))
          if (s?.morale) {
            setRoster((prev) => prev.map(m => ({ ...m, morale: clampMorale(s.morale[m.id] ?? m.morale ?? 50) })))
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

  // Persist
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

  function decide(side: 'left' | 'right') {
    const ev = current
    if (!ev) return
    const choice = side === 'left' ? ev.left : ev.right
    const { extraEffects, matchedTraits } = evaluateHooks(choice.hooks)
    setHookTraits(matchedTraits)
    const deltaA = applyEffects(choice.effects)
    for (const ef of extraEffects) applyEffects(ef)
    const loss = lossCheck()
    const delta = deltaA
    setLastMsg(loss ?? delta)
    setLog(prev => [...prev, { week, title: ev.title ?? 'Untitled', choice: choice.label ?? side, delta }].slice(-20))
    if (loss) {
      // persist handled by effect; do not advance week
      return
    }
    setWeek(prev => prev + 1)
    setCurrent(drawCard())
  }

  // UI
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <header style={{ paddingBottom: 12, borderBottom: '1px solid #333' }}>
        <h1 style={{ margin: 0, fontSize: 18, opacity: 0.8 }}>Yes, Your Goat — React/TS</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['funds','reputation','readiness'] as (keyof Meters)[]).map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 80, fontSize: 12, opacity: 0.7 }}>{k === 'reputation' ? 'Reputation' : k[0].toUpperCase()+k.slice(1)}</span>
              <div style={{ position: 'relative', width: 160, height: 10, background: '#222836', borderRadius: 999 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${clamp(meters[k]) / CLAMP_MAX * 100}%`, background: '#68a0ff' }} />
              </div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, opacity: 0.7 }}>Week: {week}</div>
        </div>
      </header>

      <main style={{ marginTop: 16 }}>
        {current && (
          <section style={{ background: '#161a22', border: '1px solid #242a36', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: 20 }}>
              <h2 style={{ margin: '0 0 6px' }}>{current.title}</h2>
              <p style={{ margin: '0 0 16px', opacity: 0.8 }}>{current.body}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button onClick={() => decide('left')}>{current.left.label}</button>
                <button onClick={() => decide('right')}>{current.right.label}</button>
              </div>
            </div>
          </section>
        )}

        <section style={{ marginTop: 12, minHeight: 20, fontSize: 12, opacity: 0.75 }}>
          {lastMsg}
          {!lastMsg && hookTraits.length > 0 && (
            <>
              {/* Bark will show via decision; keep minimal here */}
            </>
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
  )
}
