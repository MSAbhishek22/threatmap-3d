# Submission Pack — Apart Threat Intelligence & Threat Modelling

**Event:** Apart Research — Threat Intelligence & Threat Modelling
Hackathon (with Security Level 5)
**Submissions close:** 7 Dec 2026, 17:29 IST (6 Dec 11:59 PM AoE)
**Prize:** $5,000 cash ($2,500 / $1,250 / $750 / $250 / $250)
**Teams:** 1–5, solo fine · Public data only · Defensive framing required
**Deliverables:** the build (this app) + a research report, ≤ 8 pages

## What is being submitted

**ThreatMap 3D** — a 3D threat-intelligence relationship explorer. A
working web app that turns a sourced sample of public threat reporting
into an explorable evidence board, plus computed findings (hub,
largest campaign, bridge node) that demonstrate the threat-modelling
thinking the event asks for: which connections matter, and what breaks
if a node is removed.

Defensive framing throughout: the app teaches defenders how attacks
hang together. It contains no live indicators feed, no offensive
tooling, and no non-public data. Every fact is from named public
sources (`DATA_SOURCE.md`).

## The report (≤ 8 pages) — outline

1. **The problem in one page.** Incident data arrives as lists of
   indicators; the relationships — delivery chains, shared tooling,
   campaign membership — are where the defensive value sits, and lists
   hide them.
2. **Method.** How the sample was built: famous, multiply-reported
   cases only; every edge required a public source; general patterns
   labelled as patterns; years = first seen in public reporting. The
   honesty rules in `DATA_SOURCE.md`, summarised.
3. **The model.** Nodes (5 indicator types), edges as plain-words
   relations, campaign membership as first-class structure. Why a
   graph, why 3D (spatial memory, cluster separation), what the layout
   does and does not claim (positions are readability, not evidence).
4. **Findings.** The three computed results, with the working shown:
   - Emotet is the hub (degree 5) — delivery networks as force
     multipliers, and what the 2021 takedown did and did not change.
   - The Emotet ecosystem is the largest web (5 pins) — an economy,
     not a gang.
   - Qakbot is the bridge (highest betweenness among non-campaign
     nodes): a 2008 banking trojan, delivered by Emotet, handing
     victims to shared tooling — the node whose removal most
     disconnects the map. What that teaches about defence priorities:
     shared loaders and shared tools deserve hub-level attention.
   - A short note on the disconnected clusters (Lazarus, Mirai,
     Sandworm, Stuxnet): the board honestly shows that some famous
     cases share no publicly reported string with the others — and
     that absence is itself intelligence.
5. **Threat-model reading.** For one campaign (SolarWinds): assets,
   trust boundaries (the update channel), the bridge into victims,
   and the mitigations that follow from the graph rather than from a
   checklist.
6. **Limits.** Sample, not a feed; reporting bias toward famous
   Western-covered cases; attribution language follows the public
   statements and is labelled as such; betweenness on a 35-node
   teaching graph is a demonstration, not an operational metric.
7. **What production would need.** Licensed feeds, confidence scoring
   per edge, analyst curation workflow, temporal edges — stated as
   future work, not claimed as built.

## Filing checklist

- [ ] App deployed at a public HTTPS URL (see DEPLOY.md)
- [ ] Demo video recorded from the LIVE deployment (user step)
- [ ] Report written from the outline above, ≤ 8 pages, PDF
- [ ] Submission form filed on the Apart event page before
      7 Dec 2026, 17:29 IST — safe target: 6 Dec evening IST
- [ ] Ledger entry added after the filing receipt exists

## Paste-ready short description (for the submission form)

ThreatMap 3D is a working 3D evidence board of famous attacks, built
from public threat reporting. Thirty-five pins — malware families,
domains, IPs, file hashes, campaigns — are joined by the strings
public reporting supports, and the visitor explores them the way an
analyst works: orbit the board, click a pin for its card, filter by
evidence type, spotlight one campaign, scrub a 2007–2020 timeline.
The page computes its own case notes from the data (the hub, the
largest campaign, and the bridge node by betweenness), which is the
submission's threat-modelling core: it shows which connections carry
the web, and what falls apart when a bridge is removed. The dataset
is a clearly labelled teaching sample from named public sources
(Europol, FBI, Mandiant, government attribution statements) — no live
feed is claimed, and the defensive framing is the point: follow the
string, defend the connections.
