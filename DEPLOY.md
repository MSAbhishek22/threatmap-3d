# DEPLOY — ThreatMap 3D remaining steps

Status today (24 Nov 2026): the build is complete and QA-passed locally
(data 15/15, browser smoke 18/18 — see `qa/QA_RESULTS.md`). What remains
needs the user's browser/accounts. Per the blueprint, the project is
**INCOMPLETE/BLOCKED at the deployment gates** until these are done —
do not call it complete, and do not file it, before step 4.

The app is plain static files (no build step). The whole `threatmap/`
folder is the deployable unit (~1.5 MB, almost all of it the vendored
Three.js).

## Step 1 — GitHub repo (user's signed-in browser)

1. Create a public repo named `threatmap-3d` under MSAbhishek22
   (github.com/new — the established route; repo creation is not
   possible from the VM's connector).
2. Push this folder's contents to the repo's `main` branch.
3. Record the commit SHA here once pushed: `________________`

## Step 2 — GitHub Pages (same sitting)

1. Repo → Settings → Pages → Source: Deploy from a branch → `main` /
   root → Save.
2. Wait for the Pages build, then open the live URL
   (`https://msabhishek22.github.io/threatmap-3d/`).
3. On the live URL, repeat the quick pass: board loads, one filter,
   one search, one campaign, timeline both ends, click a pin, read a
   connection. (Same checks as `qa/smoke.mjs`, by eye.)
4. Write the verified live URL here: `________________`

## Step 3 — Device pass (user's laptop, 5 minutes)

1. Open the live URL on the laptop: play with orbit/zoom/click once.
2. Open it on a phone once: the layout stacks; confirm the board is
   usable and the rail controls work. Note anything broken here:
   `________________`

## Step 4 — Report + demo video (before filing)

1. Write the ≤8-page report from the outline in `SUBMISSION_PACK.md`
   (PDF). The findings numbers are already computed and quoted there.
2. Record the demo video from the **live** URL (never from localhost):
   problem (20 s) → orbit + click Emotet → filter → campaign spotlight
   on SolarWinds → timeline scrub 2020 → 2007 → case notes → close.
   About 2 minutes. Upload to YouTube as Public (user's tap).

## Step 5 — File it (deadline 7 Dec 2026, 17:29 IST)

1. File on the Apart Threat Intelligence hackathon page: live URL +
   repo URL + report PDF + video link, using the paste-ready text in
   `SUBMISSION_PACK.md`.
2. Safe target: **6 Dec 2026 evening IST**, not deadline day.
3. Keep the submission receipt/confirmation, then add the ledger entry
   in `~/workspace/hackathons/SUBMISSIONS_LEDGER.md`.

## If anything blocks

- Pages build fails → check that `index.html` is at the repo root
  (it is, in this folder) and that the import map path
  `./vendor/three.module.js` came along in the push.
- WebGL unavailable on a test machine → the page still shows all text
  sections and case notes; the board needs WebGL, which every current
  browser has. Note the machine here rather than working around it.
