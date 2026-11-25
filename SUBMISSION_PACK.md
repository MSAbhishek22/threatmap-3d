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

**VERIFIED ON THE LIVE EVENT PAGE 25 Nov 2026 (supersedes the assumptions below):**
- Prize split on the page is **$3,000 / $1,500 / $500** (not the $2,500/$1,250/$750/$250/$250 above).
- He was NOT signed up for this sprint — sign-up is a separate step and the project submission form only appears after it. Sign-up filed 25 Nov 2026.
- The report MUST use the **official template** (Google Doc linked in the Guidelines tab) and must include: project title + **abstract of 150–250 words**, author names and affiliations, and a **required "Limitations and Dual-Use / Ethical Considerations" appendix**. Max 8 pages excluding references and appendices.
- **TEMPLATE LINK — VERIFIED 25 Nov 2026 ~09:23 IST (read twice from the Guidelines tab link targets): https://docs.google.com/document/d/1vbJBxspRtoSvn95dPYdXSqHtHKhTSDRU8t-h_lz-kRw/copy?usp=sharing — use ONLY this. ⚠️ The older link recorded in the overnight notes (…/d/1Rr9hSjOlfZf4q6zLk_7B6h1Q2RND1Q1U_9d7I3dZ9gU/copy) is DEAD (Google Docs "file does not exist", confirmed 25 Nov ~09:20 IST) — never use it again. The Guidelines FAQ warns: "Always use the one linked on the Guidelines tab. The template in any account, email, or link from elsewhere may be outdated." Abstract per the page: "up to 250 words" (our 198-word abstract fits). Submission is a PDF through "the official submission form on the Sprint page" — NO form is visible on the page yet (checked 25 Nov, all four tabs, signed out); it appears in the sprint window (4–6 Dec). Guidelines: "Don't email it to us." Deadline on the Schedule tab: "Sunday December 6, 11:59pm AoE".
- Video demo is **OPTIONAL** (3–5 min suggested; ours is 2:05). Public GitHub repo optional (ours exists).
- Resubmission rule: filing again with the same title replaces the earlier submission.
- Confirmation arrives by email after submitting.

- [x] App deployed at a public HTTPS URL (https://msabhishek22.github.io/threatmap-3d/)
- [x] Demo video recorded from the LIVE deployment (threatmap-demo.mp4, 2:05 — optional deliverable)
- [x] Report REWRITTEN into the official template — DONE 25 Nov 2026 ~10:48 IST: copy "ThreatMap 3D — Apart Threat Intelligence Report" in his Drive (bdps account), https://docs.google.com/document/d/1O5jZ1kP44hDWu6hl2h0Y-ZeSdrcCQqnKD5qRRkbyniI/edit — title + abstract (198 words) + all 7 sections + findings table + Code and Data + References (only the sources §2 names) + required Limitations/Dual-Use appendix + LLM Usage Statement; template's "How to use" box deleted; headings adapted per the template's own allowance ("strong guidance but not rigid"). 8 pages total, body ~5 pages — inside the 8-page body limit. NOT submitted anywhere yet; the filing copy is the PDF export of this Doc, made at filing time.
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
