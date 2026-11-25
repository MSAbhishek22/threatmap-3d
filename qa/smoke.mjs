// ThreatMap 3D — automated smoke test.
// Serves the project locally, drives headless Chromium over CDP, and
// exercises the real controls: load, filters, search, campaign view,
// timeline, node click (canvas + panel), connection jump, reset.
// Usage: node qa/smoke.mjs   (exit code 0 = all checks pass)

import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync } from 'node:fs';

const PORT = 8907;
const CDP_PORT = 9341;
const PAGE_URL = `http://127.0.0.1:${PORT}/index.html`;
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`;

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
});
const chrome = spawn(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${CDP_PORT}`,
  '--window-size=1280,900', 'about:blank',
], { stdio: 'ignore' });

async function waitFor(fn, timeoutMs, label) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const v = await fn();
    if (v) return v;
    await sleep(200);
  }
  throw new Error(`timeout waiting for ${label}`);
}

let ws, msgId = 0;
const pending = new Map();
const consoleErrors = [];
function send(method, params = {}) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) {
    throw new Error(`evaluate failed: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`);
  }
  return res.result.value;
}
const state = () => evaluate('window.__TM ? window.__TM.getState() : null');

try {
  const targets = await waitFor(async () => {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await r.json();
      return list.find((t) => t.type === 'page') ? list : null;
    } catch { return null; }
  }, 15000, 'CDP target list');
  const page = targets.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(`exception: ${msg.params.exceptionDetails?.exception?.description || ''}`);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(`console.error: ${msg.params.args.map((a) => a.value || a.description || '').join(' ')}`);
    } else if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      consoleErrors.push(`log: ${msg.params.entry.text}`);
    }
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');

  // 1 — Load.
  await send('Page.navigate', { url: PAGE_URL });
  const s0 = await waitFor(async () => {
    const s = await state().catch(() => null);
    return s && s.nodeCount > 0 ? s : null;
  }, 20000, 'app boot (__TM)');
  check('page loads and the board boots', !!s0, `${s0.nodeCount} nodes, ${s0.edgeCount} edges`);
  check('all pins visible at start', s0.visibleCount === s0.nodeCount, `${s0.visibleCount}/${s0.nodeCount}`);
  check('no console errors on load', consoleErrors.length === 0, consoleErrors.join(' | '));

  // Findings rendered into the page.
  const fText = await evaluate(`({
    connected: document.getElementById('f-connected-name').textContent,
    campaign: document.getElementById('f-campaign-name').textContent,
    bridge: document.getElementById('f-bridge-name').textContent })`);
  check('case notes are filled from the data',
    fText.connected === 'Emotet' && fText.campaign === 'Emotet ecosystem' && fText.bridge.length > 2,
    JSON.stringify(fText));

  // Screenshot of the board for the record.
  await evaluate('document.getElementById("board").scrollIntoView({ block: "center" })');
  await sleep(1200);
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(new URL('./smoke-board.png', import.meta.url), Buffer.from(shot.data, 'base64'));
  check('board screenshot captured', shot.data.length > 10000, `${Math.round(shot.data.length * 0.75 / 1024)} KB`);

  // 2 — Type filter: hide hashes.
  await evaluate('window.__TM.setTypeVisible("hash", false)');
  await sleep(150);
  const s1 = await state();
  check('filter hides hash pins', s1.visibleCount === s0.nodeCount - 3 && !s1.types.includes('hash'),
    `visible=${s1.visibleCount}`);
  await evaluate('window.__TM.setTypeVisible("hash", true)');
  await sleep(150);
  const s1b = await state();
  check('filter restores hash pins', s1b.visibleCount === s0.nodeCount, `visible=${s1b.visibleCount}`);

  // 3 — Search finds a node and selects it.
  await evaluate(`document.getElementById('search-input').value = 'WannaCry';
    document.getElementById('search-btn').click()`);
  await sleep(300);
  const s2 = await state();
  const dLabel = await evaluate('document.getElementById("d-label").textContent');
  check('search finds and selects WannaCry', s2.selected === 'wannacry' && dLabel === 'WannaCry',
    `selected=${s2.selected}`);
  const connCount = await evaluate('document.querySelectorAll("#d-conn button").length');
  check('detail card lists its connections', connCount >= 3, `${connCount} connections`);

  // Search for a name that does not exist.
  await evaluate(`document.getElementById('search-input').value = 'NoSuchThing';
    document.getElementById('search-btn').click()`);
  await sleep(150);
  const msg = await evaluate('document.getElementById("search-msg").textContent');
  check('search says so when there is no match', /No pin called/.test(msg), msg);

  // 4 — Connection jump from the detail card.
  await evaluate('window.__TM.selectNode("emotet")');
  await sleep(150);
  await evaluate(`[...document.querySelectorAll('#d-conn button')]
    .find(b => b.textContent.includes('TrickBot')).click()`);
  await sleep(200);
  const s3 = await state();
  check('clicking a connection jumps to that pin', s3.selected === 'trickbot', `selected=${s3.selected}`);

  // 5 — Real canvas click selects a pin (project Emotet to screen space).
  const clickPoint = await evaluate(`(() => {
    const c = document.getElementById('board');
    const r = c.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  })()`);
  // Use the app's own projection via a synthetic event at the node position:
  // graph positions are internal, so instead click the canvas centre after
  // focusing Emotet — the focused pin sits at the centre of the view.
  await evaluate('window.__TM.selectNode(null); window.__TM.focusNode("emotet")');
  // The flight takes ~0.9s of wall time — wait for it to finish BEFORE
  // the first click (a click mid-flight cancels the flight, as it should:
  // the user takes control). Then click the centre, retrying a few times
  // in case a slow frame delayed the landing.
  await sleep(1400);
  let s4 = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    await sleep(400);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: clickPoint.x, y: clickPoint.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: clickPoint.x, y: clickPoint.y, button: 'left', clickCount: 1 });
    await sleep(200);
    s4 = await state();
    if (s4.selected === 'emotet') break;
    if (s4.selected) await evaluate('window.__TM.selectNode(null)');
  }
  check('clicking the focused pin on the canvas selects it', s4.selected === 'emotet', `selected=${s4.selected}`);

  // 6 — Campaign view.
  await evaluate('window.__TM.setCampaign("solarwinds")');
  await sleep(200);
  const s5 = await state();
  const onlySolar = s5.visibleIds.every((id) => {
    return id === 'sunburst' || id === 'avsvmcloud' || id === 'solarwinds-domain' ||
      id === 'hash-sunburst' || id === 'camp-solarwinds';
  });
  check('campaign view shows only that campaign', s5.campaign === 'solarwinds' && onlySolar && s5.visibleCount === 5,
    `visible=${s5.visibleCount}: ${s5.visibleIds.join(',')}`);
  await evaluate('window.__TM.setCampaign("all")');
  await sleep(150);

  // 7 — Timeline.
  await evaluate('window.__TM.setMaxYear(2010)');
  await sleep(150);
  const s6 = await state();
  check('timeline to 2010 leaves only the oldest pins',
    s6.maxYear === 2010 && s6.visibleIds.length > 0 &&
    s6.visibleIds.every((id) => ['zeus', 'qakbot', 'camp-qakbot', 'camp-zeus', 'stuxnet', 'camp-olympic'].includes(id)),
    `visible=${s6.visibleIds.join(',')}`);
  await evaluate('window.__TM.setMaxYear(2020)');
  await sleep(150);
  const s6b = await state();
  check('timeline back to 2020 restores the board', s6b.visibleCount === s0.nodeCount, `visible=${s6b.visibleCount}`);

  // 8 — Reset button restores everything.
  await evaluate('window.__TM.setTypeVisible("ip", false); window.__TM.setCampaign("mirai"); window.__TM.setMaxYear(2016);');
  await sleep(150);
  await evaluate('document.getElementById("reset-btn").click()');
  await sleep(200);
  const s7 = await state();
  check('reset restores the full board',
    s7.visibleCount === s0.nodeCount && s7.campaign === 'all' && s7.maxYear === 2020 && s7.selected === null,
    `visible=${s7.visibleCount}, campaign=${s7.campaign}, year=${s7.maxYear}`);

  // 9 — Findings "Show on the board" button selects the bridge pin.
  await evaluate(`[...document.querySelectorAll('.finding-card button')]
    .find(b => b.textContent.includes('Show on the board'))?.click()`);
  // (first card = most connected)
  await sleep(200);
  const s8 = await state();
  check('finding card button selects its pin', s8.selected === 'emotet', `selected=${s8.selected}`);

  // 10 — Whole session error-free.
  check('no console errors in the whole session', consoleErrors.length === 0, consoleErrors.join(' | '));
} catch (err) {
  check(`harness completed (${err.message})`, false);
} finally {
  try { ws && ws.close(); } catch {}
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
}

const failed = results.filter((r) => !r.ok);
console.log(`\nSMOKE SUMMARY: ${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
