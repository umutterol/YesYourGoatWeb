const EVENTS_URL = './resources/events/events.json';
const CLAMP_MIN = 0, CLAMP_MAX = 10;

const el = (id) => document.getElementById(id);
const fmtDelta = (v) => (v>0?`+${v}`:`${v}`);

const state = {
  meters: { funds: 5, reputation: 5, readiness: 5 },
  week: 1,
  events: [],
  rnc: [], // raid_night_check
  lastMsg: ''
};

function clamp(v) {
  return Math.max(CLAMP_MIN, Math.min(CLAMP_MAX, v));
}

function save() {
  localStorage.setItem('yyg_state', JSON.stringify({ meters: state.meters, week: state.week }));
}

function load() {
  const raw = localStorage.getItem('yyg_state');
  if (!raw) return;
  try {
    const s = JSON.parse(raw);
    if (s && s.meters && Number.isInteger(s.week)) {
      state.meters = { ...state.meters, ...s.meters };
      state.week = s.week;
    }
  } catch {}
}

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
}

function lossCheck() {
  const { funds, reputation, readiness } = state.meters;
  if (funds <= 0) return 'Guild Funds hit 0 — you lose.';
  if (reputation <= 0) return 'Server Reputation hit 0 — you lose.';
  if (readiness <= 0) return 'Raid Readiness hit 0 — you lose.';
  return null;
}

function drawEvent() {
  const week = state.week;
  const pool = (week % 3 === 0 && state.rnc.length) ? state.rnc : state.events;
  return randPick(pool);
}

function applyEffects(effects) {
  const m = state.meters;
  const deltas = [];
  for (const [k, v] of Object.entries(effects || {})) {
    if (k in m && typeof v === 'number') {
      m[k] = clamp(m[k] + v);
      deltas.push(`${k}: ${fmtDelta(v)}`);
    }
  }
  state.lastMsg = deltas.length ? deltas.join('  •  ') : 'No change';
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
    applyEffects(left.effects);
    const loss = lossCheck();
    if (loss) { renderMeters(); renderStatus(loss, true); save(); return; }
    state.week++;
    save();
    nextTurn();
  };
  el('btn-right').onclick = () => {
    applyEffects(right.effects);
    const loss = lossCheck();
    if (loss) { renderMeters(); renderStatus(loss, true); save(); return; }
    state.week++;
    save();
    nextTurn();
  };
}

function nextTurn() {
  renderMeters();
  renderStatus(state.lastMsg || '');
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

async function main() {
  try {
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
