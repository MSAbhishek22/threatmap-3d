// ThreatMap 3D — page wiring: controls, detail card, case notes.

import { NODES, EDGES, TYPE_LABELS } from '../data/threat-data.js';
import { buildIndex, computeFindings } from './findings.js';
import { createGraph } from './graph.js';

const { byId, neighbours } = buildIndex();
const findings = computeFindings();

const $ = (id) => document.getElementById(id);
const canvas = $('board');

const graph = createGraph(canvas, { onSelect: (id) => showDetail(id) });

// ---------- counts ----------
function syncCount() {
  const vis = graph.visibleIds().length;
  const visEdges = EDGES.filter((e) =>
    graph.isVisible(byId.get(e.source)) && graph.isVisible(byId.get(e.target))).length;
  $('count-line').textContent =
    `Showing ${vis} of ${NODES.length} pins · ${visEdges} of ${EDGES.length} strings`;
}

// ---------- detail card ----------
function showDetail(id) {
  graph.select(id);
  const empty = $('detail-empty');
  const body = $('detail-body');
  if (!id || !byId.get(id)) {
    empty.classList.remove('hidden');
    body.classList.add('hidden');
    syncCount();
    return;
  }
  const n = byId.get(id);
  empty.classList.add('hidden');
  body.classList.remove('hidden');
  $('d-type').textContent = TYPE_LABELS[n.type];
  $('d-label').textContent = n.label;
  const val = $('d-value');
  if (n.value) { val.textContent = n.value; val.classList.remove('hidden'); }
  else val.classList.add('hidden');
  const camp = NODES.find((c) => c.type === 'campaign' && c.campaign === n.campaign);
  $('d-meta').textContent =
    `First seen in public reporting: ${n.year}` +
    (camp && camp.id !== n.id ? ` · Story: ${camp.label}` : '');
  $('d-note').textContent = n.note;
  const list = $('d-conn');
  list.innerHTML = '';
  const rels = EDGES.filter((e) => e.source === id || e.target === id);
  for (const e of rels) {
    const otherId = e.source === id ? e.target : e.source;
    const other = byId.get(otherId);
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '';
    const relSpan = document.createElement('span');
    relSpan.className = 'rel';
    relSpan.textContent = e.source === id ? `${e.rel} → ` : `← ${e.rel} — `;
    btn.append(relSpan, document.createTextNode(other.label));
    btn.addEventListener('click', () => {
      if (!graph.isVisible(other)) {
        $('search-msg').textContent =
          `${other.label} is filtered out right now. Reset the board to see it.`;
        return;
      }
      showDetail(otherId);
      graph.focus(otherId);
    });
    li.append(btn);
    list.append(li);
  }
  syncCount();
}
$('detail-close').addEventListener('click', () => showDetail(null));

// ---------- search ----------
const nameList = $('pin-names');
for (const n of [...NODES].sort((a, b) => a.label.localeCompare(b.label))) {
  const o = document.createElement('option');
  o.value = n.label;
  nameList.append(o);
}
function doSearch() {
  const q = $('search-input').value.trim().toLowerCase();
  const msg = $('search-msg');
  if (!q) { msg.textContent = 'Type a name first — for example "Emotet".'; return; }
  const hit = NODES.find((n) => n.label.toLowerCase() === q) ||
    NODES.find((n) => n.label.toLowerCase().includes(q));
  if (!hit) {
    msg.textContent = `No pin called "${$('search-input').value.trim()}" in this sample.`;
    return;
  }
  if (!graph.isVisible(hit)) {
    msg.textContent =
      `${hit.label} is on the board but filtered out right now. Loosen the filters or reset the board.`;
    return;
  }
  msg.textContent = '';
  showDetail(hit.id);
  graph.focus(hit.id);
}
$('search-btn').addEventListener('click', doSearch);
$('search-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

// ---------- type filters ----------
document.querySelectorAll('.type-filter').forEach((box) => {
  box.addEventListener('change', () => {
    const on = [...document.querySelectorAll('.type-filter:checked')].map((b) => b.value);
    graph.setTypes(on);
    if (graph.state.selected && !graph.isVisible(byId.get(graph.state.selected))) showDetail(null);
    syncCount();
  });
});

// ---------- campaign view ----------
const campSelect = $('campaign-select');
const campaigns = NODES.filter((n) => n.type === 'campaign')
  .sort((a, b) => a.label.localeCompare(b.label));
for (const c of campaigns) {
  const o = document.createElement('option');
  o.value = c.campaign;
  o.textContent = c.label;
  campSelect.append(o);
}
campSelect.addEventListener('change', () => {
  graph.setCampaign(campSelect.value);
  syncCount();
});

// ---------- timeline ----------
const timeline = $('timeline');
timeline.addEventListener('input', () => {
  $('timeline-year').textContent = timeline.value;
  graph.setMaxYear(Number(timeline.value));
  if (graph.state.selected && !graph.isVisible(byId.get(graph.state.selected))) showDetail(null);
  syncCount();
});

// ---------- reset ----------
$('reset-btn').addEventListener('click', () => {
  document.querySelectorAll('.type-filter').forEach((b) => { b.checked = true; });
  graph.setTypes(Object.keys(TYPE_LABELS));
  campSelect.value = 'all';
  graph.setCampaign('all');
  timeline.value = '2020';
  $('timeline-year').textContent = '2020';
  graph.setMaxYear(2020);
  $('search-input').value = '';
  $('search-msg').textContent = '';
  showDetail(null);
  graph.resetView();
  syncCount();
});

// ---------- findings (case notes) ----------
function fillFinding(nameId, textId, node, text) {
  $(nameId).textContent = node.label;
  $(textId).textContent = text;
  const card = $(nameId).closest('.finding-card');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Show on the board';
  btn.addEventListener('click', () => {
    document.getElementById('board').scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!graph.isVisible(node)) {
      $('reset-btn').click();
    }
    showDetail(node.id);
    graph.focus(node.id);
  });
  card.append(btn);
}
const mc = findings.mostConnected;
fillFinding('f-connected-name', 'f-connected-text', mc.node,
  `${mc.node.label} has ${mc.count} strings on this board — more than any other pin. ` +
  `Delivery networks like this are why one small infection so often becomes a whole-company incident.`);
const bc = findings.biggestCampaign;
fillFinding('f-campaign-name', 'f-campaign-text', bc.campaign,
  `${bc.count} pins belong to this story (not counting the campaign pin itself). ` +
  `It is the largest single web on the board.`);
const br = findings.bridge;
fillFinding('f-bridge-name', 'f-bridge-text', br.node,
  `${br.node.label} is the bridge: it sits on more shortest paths between other pins than any other, ` +
  `joining ${br.joinedLabels.join(' and ')}. Pull this pin out and those stories fall apart from each other.`);

syncCount();

// ---------- test / inspection API ----------
window.__TM = {
  getState() {
    return {
      nodeCount: NODES.length,
      edgeCount: EDGES.length,
      visibleCount: graph.visibleIds().length,
      visibleIds: graph.visibleIds(),
      selected: graph.state.selected,
      campaign: graph.state.campaign,
      maxYear: graph.state.maxYear,
      types: [...graph.state.types],
      findings: {
        mostConnected: { id: findings.mostConnected.node.id, count: findings.mostConnected.count },
        biggestCampaign: { id: findings.biggestCampaign.campaign.id, count: findings.biggestCampaign.count },
        bridge: { id: findings.bridge.node.id, joined: findings.bridge.joinedLabels },
      },
    };
  },
  selectNode(id) { showDetail(id); },
  focusNode(id) { graph.focus(id); },
  setCampaign(id) { campSelect.value = id; campSelect.dispatchEvent(new Event('change')); },
  setMaxYear(y) {
    timeline.value = String(y);
    timeline.dispatchEvent(new Event('input'));
  },
  setTypeVisible(type, on) {
    const box = document.querySelector(`.type-filter[value="${type}"]`);
    box.checked = on;
    box.dispatchEvent(new Event('change'));
  },
};
