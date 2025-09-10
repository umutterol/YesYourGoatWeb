import { useEffect, useMemo, useState } from 'react'
import ResourceBar from '../../components/ResourceBar/ResourceBar'
import Card from '../../components/Card/Card'
import JourneyTrack from '../../components/JourneyTrack/JourneyTrack'
import InputHandler from '../../components/Input/InputHandler'

type Meters = { funds: number; reputation: number; readiness: number }
type Effects = Partial<Meters> & Record<string, number>
type Choice = { label: string; effects: Effects; nextStep?: string }
type EventCard = { id: string; title: string; body: string; tags?: string[]; speaker?: string; portrait?: string; weights?: { base?: number }; left: Choice; right: Choice }

const CLAMP_MIN = 0, CLAMP_MAX = 10
function clamp(v: number) { return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, v)) }

const EVENTS_URL = '/resources/events/yesyourgoat.events.json'

export default function YesYourGoat() {
  const [meters, setMeters] = useState<Meters>({ funds: 5, reputation: 5, readiness: 5 })
  const [day, setDay] = useState(1)
  const [events, setEvents] = useState<EventCard[]>([])
  const [current, setCurrent] = useState<EventCard | null>(null)
  const [journeyCount, setJourneyCount] = useState(0)
  const [sawRival, setSawRival] = useState(false)
  const [victoryText, setVictoryText] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [summaryMeters, setSummaryMeters] = useState<Meters | null>(null)
  const [summaryDay, setSummaryDay] = useState<number | null>(null)
  const [debugLog, setDebugLog] = useState<{
    id: string; title: string; choice: string; pre: Meters; post: Meters; effects: Effects
  }[]>([])

  const milestones = useMemo(() => [3, 6, 9, 12, 15, 18], [])
  const nextMilestone = milestones.find(m => day <= m) ?? null
  const collapseCount = Number(localStorage.getItem('yyg_collapse_count') || '0')
  const [usedMilestoneIds, setUsedMilestoneIds] = useState<string[]>([])
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
      // persistence: collapse_count and history
      const prev = Number(localStorage.getItem('yyg_collapse_count') || '0')
      localStorage.setItem('yyg_collapse_count', String(prev + 1))
      const histRaw = localStorage.getItem('yyg_history')
      const hist = Array.isArray(JSON.parse(histRaw || '[]')) ? JSON.parse(histRaw || '[]') : []
      hist.push({ day, cause: causeTag.replace('cause:',''), meters: nextMeters })
      localStorage.setItem('yyg_history', JSON.stringify(hist))
      setShowSummary(true)
      return
    }
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

        {/* Journey Track */}
        <JourneyTrack 
          milestones={milestones}
          currentDay={day}
          journeyCount={journeyCount}
        />

        {/* Main Game Area */}
        <div className="flex justify-center">
          <InputHandler onChoice={decide}>
            {current && (
              <Card 
                event={current}
                onChoice={decide}
              />
            )}
          </InputHandler>
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
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[var(--reigns-card)] text-[var(--reigns-text)] rounded-lg border-2 border-[var(--reigns-border)] p-8 w-[90%] max-w-md">
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


