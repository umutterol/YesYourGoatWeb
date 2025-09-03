const EVENTS_URL = './resources/events/events.json';
const ROSTER_URL = './resources/roster.json';
const BARKS_URL  = './resources/barks/trait_barks.json';
const CLAMP_MIN = 0, CLAMP_MAX = 10;

const el = (id) => document.getElementById(id);
const fmtDelta = (v) => (v>0?`+${v}`:`${v}`);

const state = {
  meters: { funds: 5, reputation: 5, readiness: 5 },
  week: 1,
  events: [],
  rnc: [], // raid_night_check
  lastMsg: '',
  roster: [],           // [{id,name,traitId,morale}]
  barks: {},            // { traitId: [lines] }
  hookTraits: [],       // trait ids that matched last decision
  log: []               // decision log entries
};

function clamp(v) {
  return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, v));
}

function save() {
  const morale = Object.fromEntries(state.roster.map(m => [m.id, m.morale]));
  localStorage.setItem('yyg_state', JSON.stringify({ meters: state.meters, week: state.week, morale, log: state.log }));
}

function load() {
  const raw = localStorage.getItem('yyg_state');
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (s && s.meters && Number.isInteger(s.week)) {
      state.meters = { ...state.meters, ...s.meters };
      state.week = s.week;
      if (Array.isArray(s.log)) state.log = s.log.slice(-20);
      if (s.morale && state.roster.length) {
        for (const m of state.roster) {
          if (s.morale[m.id] != null) m.morale = clampMorale(s.morale[m.id]);
        }
      }
    }
  } catch {}
}

function clampMorale(v) { return Math.max(0, Math.min(100, Math.round(v))); }

function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function renderMeters() {
  const { funds, reputation, readiness } = state.meters;
  const set = (id, val) => {
    const p = clamp(val) / CLAMP_MAX * 100;
    el(id).style.setProperty('--p', `${p}%`);
  };
  set('m-funds', funds);
  set('m-reputation', reputation);
  set('m-readiness', readiness);
  el('week').textContent = String(state.week);
}

function renderStatus(msg, isLoss=false) {
  const s = el('status');
  s.innerHTML = '';
  const span = document.createElement('span');
  span.className = isLoss ? 'loss' : 'toast';
  span.textContent = msg;
  s.appendChild(span);
  // Append a bark from any matched trait
  if (!isLoss && state.hookTraits && state.hookTraits.length) {
    const tid = state.hookTraits[Math.floor(Math.random() * state.hookTraits.length)];
    const lines = state.barks[tid] || [];
    if (lines.length) {
      const b = document.createElement('div');
      b.className = 'toast';
      b.textContent = '“' + lines[Math.floor(Math.random() * lines.length)] + '”';
      s.appendChild(document.createElement('br'));
      s.appendChild(b);
    }
  }
}

function renderLog() {
  const container = document.getElementById('log');
  if (!container) return;
  container.innerHTML = '';
  for (const entry of state.log.slice(-8).reverse()) {
    const div = document.createElement('div');
    div.className = 'log-row';
    const title = document.createElement('div');
    title.className = 'log-title';
    title.textContent = `W${entry.week} — ${entry.title}`;
    const detail = document.createElement('div');
    detail.className = 'log-detail';
    detail.textContent = `${entry.choice}: ${entry.delta}`;
    div.appendChild(title);
    div.appendChild(detail);
    container.appendChild(div);
  }
}

function lossCheck() {
  const { funds, reputation, readiness } = state.meters;
  if (funds <= 0) return 'Guild Funds hit 0 - you lose.';
  if (reputation <= 0) return 'Server Reputation hit 0 - you lose.';
  if (readiness <= 0) return 'Raid Readiness hit 0 - you lose.';
  return null;
}

function drawEvent() {
  const week = state.week;
  const pool = (week % 3 === 0 && state.rnc.length) ? state.rnc : state.events;
  return weightedPick(pool);
}

function weightForEvent(ev) {
  const base = (ev.weights && typeof ev.weights.base === 'number') ? ev.weights.base : 1;
  let w = base;
  // Simple reputation-based adjustments
  const rep = state.meters.reputation;
  if (ev.weights && typeof ev.weights.rep_low === 'number' && rep <= 3) w += ev.weights.rep_low;
  if (ev.weights && typeof ev.weights.rep_high === 'number' && rep >= 8) w += ev.weights.rep_high;
  if (!Number.isFinite(w) || w <= 0) w = 1;
  return w;
}

function weightedPick(arr) {
  if (!arr || !arr.length) return null;
  const weights = arr.map(weightForEvent);
  const total = weights.reduce((a,b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function applyEffects(effects) {
  const m = state.meters;
  const deltas = [];
  const moraleDeltas = [];
  for (const [k, v] of Object.entries(effects || {})) {
    if (k in m && typeof v === 'number') {
      m[k] = clamp(m[k] + v);
      deltas.push(`${k}: ${fmtDelta(v)}`);
      continue;
    }
    if (k === 'morale_all' && typeof v === 'number') {
      for (const mem of state.roster) {
        mem.morale = clampMorale((mem.morale ?? 50) + v);
      }
      moraleDeltas.push(`morale_all: ${fmtDelta(v)}`);
      continue;
    }
    const mm = k.match(/^morale_(.+)$/);
    if (mm && typeof v === 'number') {
      const id = mm[1];
      const mem = state.roster.find(r => r.id === id);
      if (mem) {
        mem.morale = clampMorale((mem.morale ?? 50) + v);
        moraleDeltas.push(`${k}: ${fmtDelta(v)}`);
      }
      continue;
    }
  }
  const parts = [];
  if (deltas.length) parts.push(deltas.join('  •  '));
  if (moraleDeltas.length) parts.push(moraleDeltas.join('  •  '));
  state.lastMsg = parts.length ? parts.join('  •  ') : 'No change';
}

function parseMoraleWhen(expr) {
  const m = expr.match(/^morale:(<|<=|>|>=|==)(\d{1,3})$/);
  if (!m) return null; return { op: m[1], value: Number(m[2]) };
}

function evalMorale(cond) {
  const { op, value } = cond;
  for (const mem of state.roster) {
    const v = mem.morale ?? 50;
    if (op === '<'  && v <  value) return true;
    if (op === '<=' && v <= value) return true;
    if (op === '>'  && v >  value) return true;
    if (op === '>=' && v >= value) return true;
    if (op === '==' && v === value) return true;
  }
  return false;
}

function evaluateHooks(hooks) {
  const extraEffects = [];
  const matchedTraits = new Set();
  for (const h of (hooks || [])) {
    const w = h.when || '';
    if (w.startsWith('trait:')) {
      const tid = w.slice(6);
      if (state.roster.some(r => r.traitId === tid)) {
        extraEffects.push(h.effect || {});
        matchedTraits.add(tid);
      }
      continue;
    }
    const cond = parseMoraleWhen(w);
    if (cond && evalMorale(cond)) {
      extraEffects.push(h.effect || {});
    }
  }
  return { extraEffects, matchedTraits: Array.from(matchedTraits) };
}

function setCard(ev) {
  const card = el('card');
  if (!ev) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');
  el('ev-title').textContent = ev.title || 'Untitled';
  el('ev-body').textContent = ev.body || '';
  const left = ev.left || { label: 'Left', effects: {} };
  const right = ev.right || { label: 'Right', effects: {} };
  el('btn-left').textContent = left.label || 'Left';
  el('btn-right').textContent = right.label || 'Right';

  // Click handlers
  el('btn-left').onclick = () => {
    const { extraEffects, matchedTraits } = evaluateHooks(left.hooks);
    state.hookTraits = matchedTraits;
    applyEffects(left.effects);
    for (const ef of extraEffects) applyEffects(ef);
    const loss = lossCheck();
    state.log.push({ week: state.week, title: ev.title || 'Untitled', choice: left.label || 'Left', delta: state.lastMsg });
    if (loss) { renderMeters(); renderStatus(loss, true); renderLog(); save(); return; }
    state.week++;
    save();
    nextTurn();
  };
  el('btn-right').onclick = () => {
    const { extraEffects, matchedTraits } = evaluateHooks(right.hooks);
    state.hookTraits = matchedTraits;
    applyEffects(right.effects);
    for (const ef of extraEffects) applyEffects(ef);
    const loss = lossCheck();
    state.log.push({ week: state.week, title: ev.title || 'Untitled', choice: right.label || 'Right', delta: state.lastMsg });
    if (loss) { renderMeters(); renderStatus(loss, true); renderLog(); save(); return; }
    state.week++;
    save();
    nextTurn();
  };
}

function nextTurn() {
  renderMeters();
  renderStatus(state.lastMsg || '');
  renderLog();
  const ev = drawEvent();
  setCard(ev);
}

async function loadEvents() {
  const res = await fetch(EVENTS_URL);
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
  const data = await res.json();
  // Basic split by tag
  state.rnc = data.filter(e => (e.tags || []).includes('raid_night_check'));
  state.events = data.filter(e => !(e.tags || []).includes('raid_night_check'));
}

async function loadRoster() {
  const res = await fetch(ROSTER_URL);
  if (!res.ok) throw new Error(`Failed to load roster: ${res.status}`);
  const roster = await res.json();
  state.roster = (roster || []).map(m => ({ ...m, morale: clampMorale(m.morale ?? 50) }));
}

async function loadBarks() {
  const res = await fetch(BARKS_URL);
  if (!res.ok) throw new Error(`Failed to load barks: ${res.status}`);
  state.barks = await res.json();
}

async function main() {
  try {
    await loadRoster();
    await loadBarks();
    load();
    renderMeters();
    await loadEvents();
    nextTurn();
  } catch (err) {
    console.error(err);
    renderStatus(String(err.message || err), true);
  }
}

main();

// TODO: implement trait hooks and morale
// - Parse a simple roster with fixed traits
// - Apply conditional hooks (trait:* and morale thresholds)
// - Emit simple barks on thresholds
