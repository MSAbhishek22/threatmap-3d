# Design Constitution — ThreatMap 3D

**Project:** ThreatMap 3D — a 3D threat-intelligence relationship explorer
**Event:** Apart Research — Threat Intelligence & Threat Modelling Hackathon
(submissions close 7 Dec 2026, 17:29 IST)
**Date written:** 24 Nov 2026, before any frontend code.

## The one-sentence identity

**A dark evidence board at night: string-and-pin connections you can walk
around.** The 3D graph is a detective's wall made spatial — every node is a
pinned card, every edge is a piece of string, and the analyst (the visitor)
moves the camera like stepping closer to the board.

## Design research (inspected 24 Nov 2026, before building)

1. **threeui.com** (his reference set) — browsed the Particles and UI
   component galleries. Inspected: the "Cortexa" intelligence-platform hero
   (procedural point-cloud figure, data haze, pointer-following torch) and
   the "Betawise" globe with orbital arcs. Learning: an intelligence product
   can carry its whole mood in one restrained 3D field with a pointer light;
   the scene should feel like *signal in haze*, not a diagram on a page.
   Not copied: their point-cloud busts and bloom-heavy heroes — our scene is
   a working tool, not a hero backdrop.
2. **dark.design** (his reference set) — browsed the curated dark-site
   gallery (featured: Langbase, Vercel Ship, deeo). Learning: deep grounds,
   restrained colour, typography-led layout; one accent colour earns its
   place by being rare. Not copied: luxury-brand minimalism — our page is a
   working analyst surface, denser than a brand page.
3. **godly.website** (his reference set) — browsed the recent design feed.
   Learning: the strongest current work uses one strong visual idea per
   screen and quiet edges. Applied as: one screen = the board; panels stay
   at the edges and never compete with it.
4. **reallygooddesigns.com — "17 Inspiring Dark Mode Websites"** (survey of
   shipped dark sites: Qase's deep-space product page, Cosmos Studio's
   immersive universe, Walbi's glow-green-on-black fintech). Learning: dark
   data products read as "deep space with instruments" — glow is used for
   *data*, chrome stays matte. Applied as: nodes glow, UI panels do not.
5. **tasteskill.dev** (his reference set; applied via its published
   principles, also used on Night Touge) — one motif per project, design the
   dark room first. Our single motif: **string on an evidence board**.
   Everything — edge rendering, panel borders, the findings "case notes" —
   speaks that one language.

## Identity decisions

- **Visual metaphor:** an evidence board / case wall, in 3D. Not a
  dashboard, not a globe, not a network "hairball" screenshot.
- **Palette:** board-black ground `#0b0d10`; card ink `#e8e4da` (paper
  white, slightly warm); string red `#d64541` reserved for the selected
  node's connections and the bridge finding; type colours are muted
  evidence-tag colours — malware `#e4572e` (burnt orange), domain
  `#4f9da6` (teal), IP `#7fb069` (soft green), hash `#b388eb`→ toned to
  `#9b7ede` (violet), campaign `#e0b458` (brass). No purple-blue gradient
  anywhere; no glassmorphism; panels are matte, 1px-ruled, like index
  cards taped to the board.
- **Typography:** a serif display for the case-file headings (Georgia /
  "Iowan Old Style" system serif — evidence-folder feel), a plain system
  sans for body and labels, and a monospace for hashes, IPs and numbers
  (the "typed evidence" voice). No webfonts — everything system, so the
  page works offline.
- **Layout:** problem section (short, three beats) → the board
  (full-width 3D stage with a left control rail and a right detail card) →
  findings ("case notes" computed from the data) → outcome section →
  footer with the honest data note. The board is the product; the page
  around it is the case file.
- **Interaction model:** direct manipulation only — orbit, zoom, click a
  pin, filter by evidence type, search-and-fly, campaign spotlight,
  timeline scrub. Every control changes the board immediately; nothing is
  decorative.
- **Motion system:** slow, physical. Camera flights ease like a person
  leaning in; nodes settle with a gentle force layout and then hold still
  (a board does not jitter). Timeline changes fade pins in by year.
  `prefers-reduced-motion` disables flights and idle drift.
- **3D treatment:** real Three.js (vendored r160). Nodes are spheres sized
  by connection count with sprite labels; edges are lines whose colour
  carries state (dim string → red string when selected). The 3D is the
  product's purpose: relationships are the data.

## Hard rules carried into the build

- Every visible control works and is listed in qa/INTERACTION_INVENTORY.md.
- The page states plainly that the dataset is a teaching sample drawn from
  public reporting. No "live" claims anywhere.
- Plain human words in all copy. No marketing hype, no "revolutionary",
  no "cutting-edge".
- Performance: capped data (tens of nodes), one shared geometry/material
  per type, sprite labels, pixel-ratio cap, pause when the tab is hidden.
