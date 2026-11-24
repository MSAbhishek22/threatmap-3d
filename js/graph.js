// ThreatMap 3D — the board itself.
// Real Three.js (vendored r160, see vendor/). Nodes are pins on an
// evidence board; edges are string. Layout is a small force simulation
// run once at load, then the board holds still like a real board.

import * as THREE from 'three';
import { NODES, EDGES, TYPE_LABELS } from '../data/threat-data.js';
import { buildIndex, degrees } from './findings.js';

export const TYPE_COLORS = {
  malware: 0xe4572e,
  domain: 0x4f9da6,
  ip: 0x7fb069,
  hash: 0x9b7ede,
  campaign: 0xe0b458,
};

const STRING_DIM = new THREE.Color(0x3d434b);
const STRING_BASE = new THREE.Color(0x646c75);
const STRING_HOT = new THREE.Color(0xd64541);
const NODE_DIM_FACTOR = 0.16;

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic force layout: same board every visit, like a real case wall.
function layout(nodes, edges) {
  const rand = mulberry32(20261124);
  const pos = new Map();
  for (const n of nodes) {
    pos.set(n.id, new THREE.Vector3(
      (rand() - 0.5) * 60, (rand() - 0.5) * 40, (rand() - 0.5) * 60));
  }
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const arr = nodes.map((n) => pos.get(n.id));
  const vel = nodes.map(() => new THREE.Vector3());
  const tmp = new THREE.Vector3();
  for (let step = 0; step < 420; step++) {
    const cooling = 1 - step / 420;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        tmp.subVectors(arr[i], arr[j]);
        const d2 = Math.max(tmp.lengthSq(), 0.01);
        const f = 340 / d2;
        tmp.normalize().multiplyScalar(f);
        vel[i].add(tmp); vel[j].sub(tmp);
      }
    }
    for (const e of edges) {
      const a = arr[idx.get(e.source)], b = arr[idx.get(e.target)];
      const va = vel[idx.get(e.source)], vb = vel[idx.get(e.target)];
      tmp.subVectors(b, a);
      const d = Math.max(tmp.length(), 0.01);
      tmp.normalize().multiplyScalar((d - 19) * 0.045);
      va.add(tmp); vb.sub(tmp);
    }
    for (let i = 0; i < arr.length; i++) {
      vel[i].addScaledVector(arr[i], -0.012); // gentle pull to centre
      vel[i].multiplyScalar(0.82);
      arr[i].addScaledVector(vel[i], 0.28 * cooling + 0.02);
    }
  }
  // A board is a wall: keep real depth, but flatten it, then scale the
  // whole wall to a known radius so the first view frames every pin.
  let maxR = 0;
  for (const p of arr) { p.z *= 0.55; maxR = Math.max(maxR, p.length()); }
  const k = 34 / (maxR || 1);
  for (const p of arr) p.multiplyScalar(k);
  return pos;
}

function makeLabel(text, isCampaign) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 112;
  const g = c.getContext('2d');
  g.font = `${isCampaign ? '600 ' : ''}44px Georgia, 'Times New Roman', serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 10;
  g.fillStyle = isCampaign ? '#e8cf8f' : '#e8e4da';
  g.fillText(text, 256, 56);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(12, 2.64, 1);
  return spr;
}

export function createGraph(canvas, opts = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { byId, neighbours } = buildIndex();
  const deg = degrees();
  const positions = layout(NODES, EDGES);
  const nodeIndex = new Map(NODES.map((n, i) => [n.id, i]));
  const radiusOf = (n) => 1.15 + deg.get(n.id) * 0.30;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0d10);
  scene.fog = new THREE.FogExp2(0x0b0d10, 0.0038);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);
  camera.position.set(0, 26, 78);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0xfff2dd, 1.6);
  key.position.set(30, 50, 40);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x88aaff, 0.5);
  rim.position.set(-40, -20, -30);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  // --- nodes: one InstancedMesh, colour + scale per pin ---
  const sphereGeo = new THREE.SphereGeometry(1, 20, 14);
  const sphereMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 });
  const mesh = new THREE.InstancedMesh(sphereGeo, sphereMat, NODES.length);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const baseColors = NODES.map((n) => new THREE.Color(TYPE_COLORS[n.type]));
  const dummy = new THREE.Object3D();
  NODES.forEach((n, i) => {
    dummy.position.copy(positions.get(n.id));
    dummy.scale.setScalar(radiusOf(n));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, baseColors[i]);
  });
  group.add(mesh);

  // --- labels ---
  const labels = new Map();
  for (const n of NODES) {
    const spr = makeLabel(n.label, n.type === 'campaign');
    const p = positions.get(n.id);
    spr.position.set(p.x, p.y + radiusOf(n) + 2.4, p.z);
    group.add(spr);
    labels.set(n.id, spr);
  }

  // --- edges: one LineSegments, vertex colours carry state ---
  const edgePos = new Float32Array(EDGES.length * 6);
  const edgeCol = new Float32Array(EDGES.length * 6);
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3).setUsage(THREE.DynamicDrawUsage));
  edgeGeo.setAttribute('color', new THREE.BufferAttribute(edgeCol, 3).setUsage(THREE.DynamicDrawUsage));
  const lines = new THREE.LineSegments(edgeGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
  group.add(lines);

  // --- selection ring ---
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.07, 10, 40),
    new THREE.MeshBasicMaterial({ color: 0xd64541 }));
  ring.visible = false;
  group.add(ring);

  // ---------- state ----------
  const state = {
    types: new Set(Object.keys(TYPE_LABELS)),
    campaign: 'all',
    maxYear: 2020,
    selected: null,
    hovered: null,
  };

  const isVisible = (n) =>
    state.types.has(n.type) && n.year <= state.maxYear &&
    (state.campaign === 'all' || n.campaign === state.campaign || n.id === state.campaign);

  // When a node is selected or a campaign is spotlighted, the rest dims.
  function emphasisSet() {
    if (state.selected) {
      const s = new Set([state.selected, ...neighbours.get(state.selected)]);
      return s;
    }
    return null;
  }

  function refresh() {
    const emph = emphasisSet();
    NODES.forEach((n, i) => {
      const vis = isVisible(n);
      dummy.position.copy(positions.get(n.id));
      dummy.scale.setScalar(vis ? radiusOf(n) : 0.0001);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      let col = baseColors[i];
      if (vis && emph && !emph.has(n.id)) col = baseColors[i].clone().multiplyScalar(NODE_DIM_FACTOR);
      if (vis && state.hovered === n.id) col = baseColors[i].clone().lerp(new THREE.Color(0xffffff), 0.35);
      mesh.setColorAt(i, col);
      const spr = labels.get(n.id);
      spr.visible = vis;
      spr.material.opacity = vis && emph && !emph.has(n.id) ? 0.25 : 1;
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    EDGES.forEach((e, i) => {
      const a = byId.get(e.source), b = byId.get(e.target);
      const bothVis = isVisible(a) && isVisible(b);
      const pa = positions.get(e.source), pb = positions.get(e.target);
      const o = i * 6;
      if (bothVis) {
        edgePos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], o);
      } else {
        edgePos.set([0, -999, 0, 0, -999, 0], o);
      }
      let col = STRING_BASE;
      if (emph && !(emph.has(e.source) && emph.has(e.target))) col = STRING_DIM;
      if (state.selected && (e.source === state.selected || e.target === state.selected)) col = STRING_HOT;
      edgeCol.set([col.r, col.g, col.b, col.r, col.g, col.b], o);
    });
    edgeGeo.attributes.position.needsUpdate = true;
    edgeGeo.attributes.color.needsUpdate = true;

    if (state.selected && isVisible(byId.get(state.selected))) {
      const p = positions.get(state.selected);
      ring.visible = true;
      ring.position.copy(p);
      ring.scale.setScalar(radiusOf(byId.get(state.selected)) + 0.7);
    } else {
      ring.visible = false;
    }
  }

  // ---------- camera: small orbit control (drag / wheel / keys / pinch) ----------
  const orbit = { theta: 0, phi: 1.05, dist: 80, target: new THREE.Vector3(0, 0, 0) };
  let flight = null;
  function applyCamera() {
    const sp = Math.sin(orbit.phi), y = Math.cos(orbit.phi);
    camera.position.set(
      orbit.target.x + orbit.dist * sp * Math.sin(orbit.theta),
      orbit.target.y + orbit.dist * y,
      orbit.target.z + orbit.dist * sp * Math.cos(orbit.theta));
    camera.lookAt(orbit.target);
    ring.quaternion.copy(camera.quaternion);
  }
  function flyTo(vec, dist = 30, done) {
    if (reducedMotion) {
      orbit.target.copy(vec);
      orbit.dist = dist;
      applyCamera();
      if (done) done();
      return;
    }
    flight = {
      startedAt: performance.now(),
      fromT: orbit.target.clone(), toT: vec.clone(),
      fromD: orbit.dist, toD: dist, done,
    };
  }

  let userMoved = false;
  const pointers = new Map();
  let pinchDist = 0;
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    userMoved = true;
    flight = null;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) {
      // hover picking (mouse only, no buttons held)
      if (e.pointerType === 'mouse') updateHover(e);
      return;
    }
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [p1, p2] = [...pointers.values()];
      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (pinchDist) orbit.dist = THREE.MathUtils.clamp(orbit.dist * (pinchDist / d), 18, 220);
      pinchDist = d;
      return;
    }
    orbit.theta -= (e.clientX - prev.x) * 0.005;
    orbit.phi = THREE.MathUtils.clamp(orbit.phi - (e.clientY - prev.y) * 0.005, 0.15, Math.PI - 0.15);
    applyCamera();
  });
  const endPointer = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchDist = 0; };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    userMoved = true;
    orbit.dist = THREE.MathUtils.clamp(orbit.dist * (e.deltaY > 0 ? 1.12 : 0.89), 18, 220);
    applyCamera();
  }, { passive: false });
  canvas.addEventListener('keydown', (e) => {
    const step = 0.12;
    if (e.key === 'ArrowLeft') orbit.theta -= step;
    else if (e.key === 'ArrowRight') orbit.theta += step;
    else if (e.key === 'ArrowUp') orbit.phi = Math.max(0.15, orbit.phi - step);
    else if (e.key === 'ArrowDown') orbit.phi = Math.min(Math.PI - 0.15, orbit.phi + step);
    else if (e.key === '+' || e.key === '=') orbit.dist = Math.max(18, orbit.dist * 0.88);
    else if (e.key === '-') orbit.dist = Math.min(220, orbit.dist * 1.14);
    else return;
    e.preventDefault();
    userMoved = true;
    applyCamera();
  });

  // ---------- picking ----------
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(mesh);
    for (const h of hits) {
      const n = NODES[h.instanceId];
      if (n && isVisible(n)) return n.id;
    }
    return null;
  }
  let downAt = null;
  canvas.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    if (moved > 6) return; // it was a drag, not a click
    const id = pick(e);
    if (opts.onSelect) opts.onSelect(id);
  });
  function updateHover(e) {
    const id = pick(e);
    if (id !== state.hovered) {
      state.hovered = id;
      canvas.style.cursor = id ? 'pointer' : 'grab';
      refresh();
    }
  }

  // ---------- resize / render loop ----------
  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();
  applyCamera();
  refresh();

  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });
  const clock = new THREE.Clock();
  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (flight) {
      // Wall-clock progress: the flight takes 0.9s of real time even on a
      // slow machine where frames are far apart.
      const raw = Math.min((performance.now() - flight.startedAt) / 900, 1);
      const t = 1 - Math.pow(1 - raw, 3);
      orbit.target.lerpVectors(flight.fromT, flight.toT, t);
      orbit.dist = flight.fromD + (flight.toD - flight.fromD) * t;
      if (raw >= 1) { const d = flight.done; flight = null; if (d) d(); }
    } else if (!userMoved && !reducedMotion) {
      orbit.theta += dt * 0.02; // gentle idle drift until first touch
    }
    if (ring.visible) ring.quaternion.copy(camera.quaternion);
    applyCamera();
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);

  // ---------- public API (UI + tests) ----------
  const api = {
    state,
    isVisible,
    setTypes(types) { state.types = new Set(types); refresh(); },
    setCampaign(id) {
      state.campaign = id;
      if (id !== 'all') {
        const pin = NODES.find((n) => n.type === 'campaign' && n.campaign === id);
        if (pin) flyTo(positions.get(pin.id).clone(), 52);
      }
      refresh();
    },
    setMaxYear(y) { state.maxYear = y; refresh(); },
    select(id, { fly = false } = {}) {
      state.selected = id;
      if (id && fly) flyTo(positions.get(id).clone(), 30);
      refresh();
    },
    focus(id) { if (byId.get(id)) flyTo(positions.get(id).clone(), 30); },
    resetView() {
      state.selected = null;
      flyTo(new THREE.Vector3(0, 0, 0), 80);
      refresh();
    },
    visibleIds() { return NODES.filter(isVisible).map((n) => n.id); },
    positionOf(id) { const p = positions.get(id); return p ? { x: p.x, y: p.y, z: p.z } : null; },
    renderer, scene, camera,
  };
  return api;
}
