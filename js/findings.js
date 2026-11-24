// Findings — everything in the "case notes" panel is computed from the
// bundled data at load. Nothing here is hand-written per node.

import { NODES, EDGES } from '../data/threat-data.js';

export function buildIndex(nodes = NODES, edges = EDGES) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const neighbours = new Map(nodes.map((n) => [n.id, new Set()]));
  for (const e of edges) {
    neighbours.get(e.source)?.add(e.target);
    neighbours.get(e.target)?.add(e.source);
  }
  return { byId, neighbours };
}

export function degrees(nodes = NODES, edges = EDGES) {
  const { neighbours } = buildIndex(nodes, edges);
  const out = new Map();
  for (const n of nodes) out.set(n.id, neighbours.get(n.id).size);
  return out;
}

export function mostConnected(nodes = NODES, edges = EDGES) {
  const deg = degrees(nodes, edges);
  let best = null;
  for (const n of nodes) {
    if (!best || deg.get(n.id) > deg.get(best.id)) best = n;
  }
  return { node: best, count: deg.get(best.id) };
}

export function campaignSizes(nodes = NODES) {
  const sizes = new Map();
  for (const n of nodes) {
    if (n.type === 'campaign') continue;
    sizes.set(n.campaign, (sizes.get(n.campaign) || 0) + 1);
  }
  return sizes;
}

export function biggestCampaign(nodes = NODES) {
  const { byId } = buildIndex(nodes, []);
  const sizes = campaignSizes(nodes);
  let bestId = null;
  for (const [id, size] of sizes) {
    if (bestId === null || size > sizes.get(bestId)) bestId = id;
  }
  const campNode = nodes.find((n) => n.type === 'campaign' && n.campaign === bestId);
  return { campaign: campNode || byId.get(bestId), count: sizes.get(bestId) };
}

// Brandes betweenness centrality on the undirected graph.
// The "bridge" is the non-campaign node sitting on the most shortest
// paths between other nodes — remove it and clusters fall apart.
export function betweenness(nodes = NODES, edges = EDGES) {
  const { neighbours } = buildIndex(nodes, edges);
  const cb = new Map(nodes.map((n) => [n.id, 0]));
  for (const s of nodes) {
    const stack = [];
    const pred = new Map(nodes.map((n) => [n.id, []]));
    const sigma = new Map(nodes.map((n) => [n.id, 0]));
    const dist = new Map(nodes.map((n) => [n.id, -1]));
    sigma.set(s.id, 1);
    dist.set(s.id, 0);
    const queue = [s.id];
    while (queue.length) {
      const v = queue.shift();
      stack.push(v);
      for (const w of neighbours.get(v)) {
        if (dist.get(w) < 0) {
          dist.set(w, dist.get(v) + 1);
          queue.push(w);
        }
        if (dist.get(w) === dist.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          pred.get(w).push(v);
        }
      }
    }
    const delta = new Map(nodes.map((n) => [n.id, 0]));
    while (stack.length) {
      const w = stack.pop();
      for (const v of pred.get(w)) {
        delta.set(v, delta.get(v) + (sigma.get(v) / sigma.get(w)) * (1 + delta.get(w)));
      }
      if (w !== s.id) cb.set(w, cb.get(w) + delta.get(w));
    }
  }
  // Undirected: every pair was counted twice.
  for (const [k, v] of cb) cb.set(k, v / 2);
  return cb;
}

export function bridgeNode(nodes = NODES, edges = EDGES) {
  const cb = betweenness(nodes, edges);
  const deg = degrees(nodes, edges);
  let best = null;
  for (const n of nodes) {
    if (n.type === 'campaign') continue;
    if (!best || cb.get(n.id) > cb.get(best.id) ||
        (cb.get(n.id) === cb.get(best.id) && deg.get(n.id) > deg.get(best.id))) {
      best = n;
    }
  }
  const { byId, neighbours } = buildIndex(nodes, edges);
  const joined = new Set();
  for (const nb of neighbours.get(best.id)) {
    const camp = byId.get(nb).campaign;
    if (camp !== best.campaign) joined.add(camp);
  }
  const joinedLabels = [...joined].map((cid) => {
    const c = nodes.find((n) => n.type === 'campaign' && n.campaign === cid);
    return c ? c.label : cid;
  });
  return { node: best, score: cb.get(best.id), joinedLabels };
}

export function computeFindings(nodes = NODES, edges = EDGES) {
  return {
    mostConnected: mostConnected(nodes, edges),
    biggestCampaign: biggestCampaign(nodes),
    bridge: bridgeNode(nodes, edges),
  };
}
