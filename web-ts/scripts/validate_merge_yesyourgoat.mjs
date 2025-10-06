import { promises as fs } from 'fs'
import path from 'path'

const repoRoot = path.resolve(process.cwd())
// Prefer top-level packs if present; fallback to local web-ts packs
const topLevelPacks = path.join(repoRoot, '..', 'resources', 'events', 'packs', 'yesyourgoat')
const localPacks = path.join(repoRoot, 'resources', 'events', 'packs', 'yesyourgoat')
let packsDir = localPacks
try {
  const st = await fs.stat(topLevelPacks)
  if (st.isDirectory()) packsDir = topLevelPacks
} catch {}
// Output to the top-level resources path
const outFile = path.join(repoRoot, '..', 'resources', 'events', 'packs', 'yesyourgoat', 'merged.events.json')

function fail(msg) {
  console.error(`[YYG Validate] ${msg}`)
  process.exit(1)
}

function validateEvent(ev) {
  if (!ev || typeof ev !== 'object') fail('Event not an object')
  if (!ev.id || typeof ev.id !== 'string') fail('Event.id missing')
  if (!ev.title || ev.title.length > 50) fail(`Event ${ev.id} title invalid (≤50)`)    
  if (!ev.body || ev.body.length > 120) fail(`Event ${ev.id} body invalid (≤120)`)   
  
  // Handle both old and new schema
  const hasOldSchema = ev.phase !== undefined
  const hasNewSchema = Array.isArray(ev.tags) && ev.tags.length > 0
  
  if (!hasOldSchema && !hasNewSchema) {
    fail(`Event ${ev.id} must have either phase field or tags array`)
  }
  
  if (!ev.left || !ev.right) fail(`Event ${ev.id} must have two choices`)
  
  // conversational authoring: require speaker for most runtime cards
  const tags = ev.tags || []
  const isCollapse = tags.includes('meta:collapse') || (ev.trigger && ev.trigger.meters)
  const isRunMeta = tags.includes('run:intro') || tags.includes('run:outro')
  
  if (!isCollapse && !isRunMeta) {
    if (!ev.speaker || typeof ev.speaker !== 'string') {
      console.warn(`[YYG Validate] warn — Event ${ev.id} missing speaker (recommended)`) 
    }
    // speakers allowlist - expanded for new events
    const allowedSpeakers = new Set([
      'Council Moderator','Treasurer','Councilor','Tank','Officer','Healer','Priest','Rogue','Bard','Mage','Arcanist','Lifebinder','Recruiter','Streamer','Dev Liaison','Scout','Rival','Game Master','System','Compliance','PR','Ranged DPS','Rival Guild','Recruit','Loot Master','Drama Queen','Benched Rogue','Attendant','Unknown','Crafter','Theorycrafter','AFK Farmer'
    ])
    if (ev.speaker && !allowedSpeakers.has(ev.speaker)) {
      console.warn(`[YYG Validate] warn — Event ${ev.id} speaker '${ev.speaker}' not in canonical roster`) 
    }
    // portrait is optional but recommended; if provided, must be a string
    if (ev.portrait !== undefined && typeof ev.portrait !== 'string') fail(`Event ${ev.id} portrait must be string if provided`)
  }
  // enforce archetype allowlist if present
  const archetype = (ev.tags || []).find(t => t.startsWith('archetype:'))
  if (archetype) {
    const id = archetype.split(':')[1]
    const allowed = new Set(['general','witch','priest','rogue','merchant','bard','recruiter'])
    if (!allowed.has(id)) fail(`Event ${ev.id} archetype ${id} not allowed`)
  }
  for (const side of ['left','right']) {
    const ch = ev[side]
    if (!ch || !ch.label) fail(`Event ${ev.id} ${side}.label missing`)
    if (!ch.effects || typeof ch.effects !== 'object') fail(`Event ${ev.id} ${side}.effects missing`)
    
    // Handle both old and new effect structures
    const effects = ch.effects
    const hasOldEffects = effects.funds !== undefined || effects.reputation !== undefined || effects.readiness !== undefined
    const hasNewEffects = effects.meters !== undefined || effects.legacy !== undefined || effects.flags !== undefined
    
    if (hasOldEffects) {
      // Old schema: direct meter effects
      for (const [k, v] of Object.entries(effects)) {
        if (!['funds','reputation','readiness','morale_all'].some(ok => k === ok) && !k.startsWith('morale_')) {
          fail(`Event ${ev.id} has invalid effect key ${k}`)
        }
        if (!Number.isInteger(v) || v < -3 || v > 3) fail(`Event ${ev.id} effect ${k}=${v} out of bounds [-3..3]`)
      }
    } else if (hasNewEffects) {
      // New schema: nested effects (meters, legacy, flags)
      // For now, just validate that the structure exists - we'll handle the complex validation later
      console.warn(`[YYG Validate] warn — Event ${ev.id} uses new effect schema (nested structure)`)
    } else if (Object.keys(effects).length === 0) {
      // Empty effects are allowed (no-op choices)
      console.warn(`[YYG Validate] warn — Event ${ev.id} ${side} has empty effects`)
    } else {
      fail(`Event ${ev.id} ${side} has no valid effects structure`)
    }
  }
}

async function run() {
  // gather packs
  let files = []
  try {
    const entries = await fs.readdir(packsDir)
    files = entries.filter(f => f.endsWith('.json') && !f.includes('merged')).map(f => path.join(packsDir, f))
  } catch (e) {
    fail(`Packs dir missing: ${packsDir}`)
  }
  if (!files.length) fail('No yesyourgoat packs found')

  const all = []
  const ids = new Set()
  for (const file of files) {
    const text = await fs.readFile(file, 'utf-8')
    let data
    try { data = JSON.parse(text) } catch {
      fail(`Invalid JSON: ${file}`)
    }
    if (!Array.isArray(data)) fail(`Pack must be an array: ${file}`)
    for (const ev of data) {
      validateEvent(ev)
      if (ids.has(ev.id)) fail(`Duplicate id ${ev.id}`)
      ids.add(ev.id)
      all.push(ev)
    }
  }

  await fs.mkdir(path.dirname(outFile), { recursive: true })
  await fs.writeFile(outFile, JSON.stringify(all, null, 2))
  console.log(`[YYG Validate] ok — ${all.length} events → ${path.relative(repoRoot, outFile)}`)
}

run().catch(e => fail(e?.message || String(e)))
