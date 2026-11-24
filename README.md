# ThreatMap 3D

See how attacks connect.

One break-in is rarely one thing. A trojan opens the door, a shared tool
takes control, a ransomware crew walks in last. ThreatMap 3D pins the
pieces of famous attacks to an evidence board — in 3D, in the browser —
and draws the string between them, so you can walk around the web and
read it the way an analyst does.

Built for the **Apart Research Threat Intelligence & Threat Modelling
Hackathon** (submissions close 7 Dec 2026, 17:29 IST).

## What you can do with it

- **Walk around the board.** Drag to orbit, scroll to zoom, or use the
  arrow keys. Click any pin to read its card: what it is, when it was
  first seen, what it connects to, why it matters — in plain words.
- **Filter the evidence.** Tick boxes show or hide malware families,
  domains, IPs, file hashes and campaigns.
- **Find a pin.** Search flies the camera to it.
- **Spotlight a campaign.** Pick a story — the SolarWinds supply-chain
  attack, the Emotet ecosystem, Lazarus — and the rest of the board dims.
- **Scrub time.** A timeline slider reveals pins by the year they were
  first seen, 2007 to 2020. The whole modern era assembles in front of
  you.
- **Read the case notes.** The page works out three findings from the
  data itself: the most connected pin (Emotet), the biggest campaign
  (the Emotet ecosystem), and the bridge pin whose removal would split
  stories apart (Qakbot). Change the data and the notes change.

## The data — honestly

Every pin and string is a **teaching sample drawn from public
reporting**: Europol and FBI announcements, the FireEye/Mandiant
SolarWinds disclosure, government attribution statements, vendor
research. Famous things only — Emotet, WannaCry, NotPetya, SUNBURST,
Mirai, Stuxnet, Zeus. The full source list is in `DATA_SOURCE.md`.

It is not a live feed. It is not scraped. Nothing here is secret, and
the page says so in its header and footer. Where a relationship is a
general pattern rather than one event ("Qakbot often drops Cobalt
Strike"), the string says so.

## How it is built

- Plain static files. No build step, no server code, no network calls.
- Real **Three.js** (r160, vendored in `vendor/`, pinned by SHA-256)
  renders the board: one instanced mesh for the pins, one line set for
  the strings, canvas sprites for the labels. A small deterministic
  force layout arranges the board once at load — same board every
  visit, like a real case wall.
- The findings are computed in `js/findings.js` (degrees, campaign
  sizes, and Brandes betweenness for the bridge) from the same data
  file the board draws. Nothing in the case notes is hand-written.

## Run it

Serve the folder with anything static, for example:

```
python3 -m http.server 8000
```

then open `http://127.0.0.1:8000/`. It also works from the deployed
site — see `DEPLOY.md`.

## Tests

```
node qa/check-data.mjs   # 15 checks on the data and the findings
node qa/smoke.mjs        # 18 checks in a real (headless) browser
```

Both suites pass; the record, including what failed on the way and how
it was fixed, is in `qa/QA_RESULTS.md`. Every control on the page is
listed in `qa/INTERACTION_INVENTORY.md`.

## Files

- `index.html`, `style.css` — the page: problem → board → case notes → outcome
- `js/graph.js` — the Three.js board (orbit, picking, filters, flights)
- `js/app.js` — controls, detail card, case notes wiring
- `js/findings.js` — the computed findings
- `data/threat-data.js` — the sample dataset (the only data there is)
- `DATA_SOURCE.md` — where every fact comes from
- `SUBMISSION_PACK.md` — the Apart filing notes and report outline
- `DEPLOY.md` — the exact remaining steps to put it live and file it
