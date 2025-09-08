import { promises as fs } from 'fs'
import path from 'path'

const deckPath = path.join(process.cwd(), 'public', 'resources', 'events', 'yesyourgoat.events.json')
const events = JSON.parse(await fs.readFile(deckPath, 'utf-8'))

function clamp(v, a=0, b=10) { return Math.max(a, Math.min(b, v)) }

function runOnce() {
  let meters = { funds: 5, reputation: 5, readiness: 5 }
  let day = 1
  const used = new Set()
  const usedMilestones = new Set()
  const milestones = [3,6,9,12,15,18]
  let sawRival = false
  // draw helpers
  const draw = () => {
    // milestone
    const nm = milestones.find(m => day === m)
    if (nm) {
      const m = events.find(e => (e.tags||[]).includes('meta:dungeon_progress') && !usedMilestones.has(e.id))
      if (m) { usedMilestones.add(m.id); return m }
    }
    if (day % 5 === 0) {
      const c = events.find(e => (e.tags||[]).includes('meta:council'))
      if (c) return c
    }
    if (!sawRival && day >= 8) {
      const r = events.find(e => (e.tags||[]).includes('meta:rival'))
      if (r) { sawRival = true; return r }
    }
    // pool
    const pool = events.filter(e => {
      const t = e.tags || []
      if (t.includes('run:intro')||t.includes('run:outro')||t.includes('meta:dungeon_progress')||t.includes('meta:collapse')) return false
      return !used.has(e.id)
    })
    if (!pool.length) return null
    return pool[Math.floor(Math.random()*pool.length)]
  }
  const intro = events.find(e => (e.tags||[]).includes('run:intro'))
  if (intro) used.add(intro.id)
  while (true) {
    const ev = day===1 && intro ? intro : draw()
    if (!ev) return { days: day-1, cause: 'exhausted', meters }
    used.add(ev.id)
    // random choice
    const choice = Math.random()<0.5 ? ev.left : ev.right
    const next = { ...meters }
    for (const [k,v] of Object.entries(choice.effects||{})) {
      if (k in next && Number.isFinite(v)) next[k] = clamp(next[k]+v)
    }
    meters = next
    if (meters.funds<=0 || meters.reputation<=0 || meters.readiness<=0) {
      let cause='funds'; if (meters.reputation<=0) cause='reputation'; if (meters.readiness<=0) cause='readiness'
      return { days: day, cause, meters }
    }
    day++
    if (day>200) return { days: 200, cause: 'cap', meters }
  }
}

const RUNS = 100
const results = Array.from({length: RUNS}, runOnce)
const days = results.map(r=>r.days)
const avg = days.reduce((a,b)=>a+b,0)/RUNS
const max = Math.max(...days)
const min = Math.min(...days)
const causes = results.reduce((m,r)=>{ m[r.cause]=(m[r.cause]||0)+1; return m },{})

console.log(JSON.stringify({ runs: RUNS, avgDays: avg, minDays: min, maxDays: max, causes, sample: results.slice(0,5) }, null, 2))


