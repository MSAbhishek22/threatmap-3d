# Data sources — ThreatMap 3D

**What the data is:** a small, fixed teaching sample of famous, publicly
documented threat indicators and the relationships between them, of the
kind that appear in public threat-intelligence reporting. It exists so a
visitor can learn how analysts read connections. It is bundled with the
page as `data/threat-data.js`.

**What it is not:** it is not a live feed, it is not scraped, it contains
no private or leaked data, and nothing on the page claims otherwise. The
page itself carries the label "Sample dataset — drawn from public
reporting, not a live feed" in the header, the footer and this file.

**Years** are "first seen in public reporting" — the year a family,
campaign or indicator was first publicly described — which is how
analysts date these things. Reasonable sources sometimes differ by a
year; the year here follows the most commonly cited public account.

## Where the facts come from (named public sources)

- **Emotet, TrickBot, IcedID, Ryuk cluster and the January 2021
  takedown** — Europol's public announcement of the Emotet disruption
  (January 2021) and the US Department of Justice's Emotet/TrickBot
  indictments and statements.
- **Qakbot and Operation Duck Hunt** — FBI / US Department of Justice
  public announcement of the Qakbot disruption (August 2023).
- **SUNBURST / SolarWinds** — FireEye (Mandiant) December 2020
  disclosure, including the published SUNBURST sample MD5
  `b91ce2fa41029f6955bff20079468448` and the `avsvmcloud.com` domain;
  Microsoft's and CISA's public analyses of the campaign; US/UK
  government attribution statements (SVR).
- **NotPetya and Sandworm** — US and UK government attribution
  statements (2018) naming Russia's GRU; vendor analyses (Microsoft,
  Kaspersky and others) that published the NotPetya SHA-256
  `027cc450ef5f8c5f653329641ec1fed91f694e0d229928963b30f6b0d7d3a745`.
- **WannaCry, the kill-switch domain and Lazarus attribution** — UK
  NCSC and US government attribution statements; the public account of
  Marcus Hutchins registering the kill-switch domain; vendor analyses
  publishing the WannaCry sample MD5
  `db349b97c37d22f5ea1d1841e3c89eb4`. The North Korean address block
  175.45.176.0/22 is the country's publicly known IP allocation.
- **Stuxnet / Olympic Games** — widely reported public accounts,
  including Symantec's W32.Stuxnet dossier and subsequent government
  and press reporting on the operation.
- **ShadowPad and APT41** — Kaspersky's 2017 ShadowPad disclosure
  (NetSarang supply-chain compromise); FireEye/Mandiant's APT41
  reporting (2019) and the US Department of Justice APT41 indictments
  (2020).
- **PlugX and Mustang Panda** — vendor reporting by Recorded Future,
  CrowdStrike and others on Mustang Panda's PlugX campaigns.
- **Mirai and the Dyn attack** — Dyn's public post-incident account of
  the 21 October 2016 attack; US Department of Justice guilty pleas of
  Mirai's authors (2017).
- **Zeus** — the long public record of the Zeus banking trojan from
  2007 and its 2011 source-code leak, as covered in vendor research
  and FBI statements of the period.
- **Cobalt Strike as shared criminal tooling** — routine vendor
  reporting (including FireEye/Microsoft's SolarWinds analysis, which
  documented Cobalt Strike as a second-stage tool, and the many
  reports of Qakbot delivering Cobalt Strike beacons).

## Honesty rules applied to this dataset

- Only relationships stated in public reporting are drawn as strings.
  Where a relationship is a general pattern rather than a single event
  (for example "Qakbot often drops Cobalt Strike"), the edge label says
  so in plain words.
- Shared tools (PlugX, Cobalt Strike) are labelled as shared — the data
  does not pretend one tool identifies one attacker.
- Hashes are reproduced exactly as published by the named vendor
  analyses above, and are labelled as sample fingerprints.
- If a fact could not be stated confidently from public reporting, it
  was left out. The board shows less than the real world knows — on
  purpose.
