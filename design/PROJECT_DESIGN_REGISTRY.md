# Project Design Registry — ThreatMap 3D vs the three most recent builds

Per ABHI_22 blueprint Part V: every project gets a distinct visual identity,
checked against the three most recent projects. Accent-colour swaps do not
count as distinct.

| Dimension | Night Touge (OpenGame) | TriageMate (Homingo) | FlagAgent (Toggle Wars) | **ThreatMap 3D (this project)** |
|---|---|---|---|---|
| Visual metaphor | A windscreen at 2 a.m.; UI as road furniture | Editorial triage desk | Change-desk / approval queue | **A detective's evidence board you can walk around** |
| Ground / palette | Near-black blue night; amber only | Light editorial paper | Light admin neutrals | **Board-black; warm paper ink; string-red reserved for selection; muted evidence-tag type colours** |
| Typography | Road-sign uppercase + mono instruments | Serif-leaning editorial | Sans, form-like | **Serif case-file headings + sans body + mono for hashes/IPs** |
| Layout | Full-viewport 3D canvas; HUD at corners | Reading column + cards | Split list / diff view | **Case-file page: problem → full-width 3D board with control rail + detail card → findings → outcome** |
| Interaction model | Real-time driving | Filter, tick, export | Approve/reject workflow | **Explore: orbit, click pins, type filters, search-and-fly, campaign spotlight, timeline scrub** |
| Motion system | Velocity itself: FOV kick, streaks | Page fades | Panel slides | **Slow physical camera flights; pins fade in by year; the board holds still** |
| 3D treatment | Full Three.js driving scene | None (tool UI) | None (tool UI) | **Full Three.js force-style graph: sized node spheres, sprite labels, state-coloured string edges** |
| Sound | WebAudio synth engine | None | None | **None — a quiet reading room; the board makes no noise** |

Distinct on every row: metaphor, palette, typography, layout, interaction,
motion and 3D treatment all differ from the three previous projects.
Engineering utilities reused: only habits (static files, vendored pinned
Three.js r160, honest QA files) — no visual template is reused.
