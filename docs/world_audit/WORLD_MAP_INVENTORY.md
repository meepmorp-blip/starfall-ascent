# World Map Inventory

Audit of `index.html` at commit `4875c06`, compared against `Starfall_Lore_Bible_v2.pdf` and `Lore_Updates_v1.1.md`. Audit only: nothing in the game was changed.

## How environments are built
- **Every playable environment is one screen.** The world is 400 units tall and 620 to 900 units wide (the width follows the screen's aspect ratio). There is no scrolling camera.
- **An environment is a painted theme.** `paintTheme(g, theme)` paints the base (`index.html` about line 7793) and `enrichTheme(g, theme)` adds the dressing (about line 7660). `ATMO` holds the colour grade, light, motes and night flag (about line 7520). Each theme is painted once into a cached background.
- **Rooms and missions point at a theme.** `ROOMS` covers Battle districts, trials, the boss and training (about line 1716). `RIFTS` covers rifts (about line 2883). `MISSIONS` / `addMission` cover Chapter 1 missions (about line 3199). `MX_DISTRICTS` covers Meridian exploration (about line 4003).
- **Story cutscenes paint the same themes** through `cutBg(key)` (about line 3010), plus three plain backdrops: `night` (the city skyline, `paintNight`), `black` and `white`.

**There are 14 painted themes plus 1 cutscene skyline, so 15 unique environments.** Several locations share a theme; those are counted once.

> **Update (World Expansion 01):** St. Hesper's Orphanage is now freely explorable (Stage 2); there is a regional world map with fast travel (Stage 1). See `docs/world/`.

## Inventory

Legend for the Contains columns: **N** NPCs · **I** interactables · **C** combat.

### A. Freely explorable (5)
| Location | Theme | Code | Story use | Access | Unique env | N | I | C | Transition | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **Market Ring** | `market` | `MX_DISTRICTS.market`; Ch1 `market`, `chase`, `first`, `garrison`; House 3; Rift `rift_xp`; Night Market arena | Cold open, Scenes 1–4 | Meridian (hub centre), Battle, Story | Yes | Matteo, Rosa, fish vendor, Tessa | Records ×4, chests, crate-corner secret, barrels, scarf, bounty board | Battle/Story only | Exits W/E/N/S | Complete |
| **Festival Square** | `plaza` | `MX_DISTRICTS.plaza`; Ch1 `fest`, `festival`; House 5; `rift_dust` | Scene 12 | Meridian, Battle, Story | Yes | Lantern seller, woman with basket | Records ×3, chests, programme pages, lantern switch, fountain coins, rift scar | Battle/Story | Exit W | Complete |
| **Garrison Yard** | `yard` | `MX_DISTRICTS.yard`; House 1; `rift_earth`; Training ("Vigil Yard drills") | Training, Ch1 garrison scenes | Meridian, Battle, Training | Yes | Soldier, Agnes*, Bram* | Records ×3, chests, drill course, dummies, barrels, helmet, trial roster | Battle/Training | Exit E | Complete |
| **The Cloister** | `chapel` | `MX_DISTRICTS.chapel`; House 7 | (none in Ch1 story) | Meridian, Battle | Yes | Sister at the gate, woman on bench | Records ×3, chests, Hour Candles, alcove | Battle | Exit S | Complete, sparsest district |
| **St. Lucia's (east ward)** | `hospital` | `MX_DISTRICTS.ward`; Ch1 `lucia`, `ward`; `rift_water` | Scene 6 | Meridian, Battle, Story | Yes | Nurse, patient, Naomi*, Theo* | Records ×2, chests, cart brake, hatch secret, ward clock | Battle/Story | Exit N | Complete |

\* Appears once the player has met them in Chapter 1.

### B. Story locations, not freely explorable (8)
| Location | Theme | Code | Story | Also in Battle? | Unique env | N | I | C | Transition | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **St. Hesper's Orphanage** (yard, gate, back step, bakery next door) | `orphanage` (night) | `addMission('longway')`; cutscenes `pn('orphanage')` | Cold open; Scene 9 "There Wasn't a Cat" (Lucas's walk) | **No** | Yes: iron fence, gate clock stopped at 11:59, chalk games, scorched kitchen window, saucer on the back step, bakery glow, rope swing | Story only (Sister Agathe, kids) | 4 spots in the `longway` walk | No | Story only | Complete art, story-only |
| **Ash Lane** (street) | `street` (night) | `MISSIONS.carry`, `MISSIONS.rescue`; `pn('street')` | Scene 5 escort; Scene 10 lodging-house fire | **No** | Yes: terraced houses, awnings, laundry, cart | Fire civilians | Escort/rescue objects | Yes (story) | Story only | Complete art, story-only |
| **Meridian skyline** | `night` (`paintNight`) | `cutBg('night')` | Cold open | No | Yes (cutscene backdrop only) | — | — | — | — | Backdrop |
| **Concord Office** | `office` | `addMission('queue')`; `pn('office')`; House 10 | Scene 7 walk-around (the queue) | Yes: House 10 "Career" (deadline rule) | Yes: queue, desks, filing, wall clock, ladders | Queue NPCs: woman in the queue, mother, boy, widow, records clerk | Queue walk | Battle | Story + Battle | Complete |
| **The Institute, third sub-level** | `lab` | `MISSIONS.sneak`, `assault`, `escape`; `rift_air` | Scene 8; Breakout | Yes: Rift "Institute Overload" | Yes: core tanks, containment ring, consoles | Story | Stealth objects | Yes | Story + Battle | Complete |
| **Ash Lane rooftops** | `rooftop` (night) | `addMission('cass')`; `rift_fire` | Scene 10 Inquisitor | Yes: Rift "Ash Lane Blaze" | Yes: roofs, plank bridges, chimneys, skylights | — | — | Yes | Story + Battle | Complete |
| **St. Hesper's clock tower** (also "Clocktower roofs") | `roof` (night) | `addMission('tower')`; `trialMercury`; `rift_mastery` | Scene 11 (the party's evening at the tower) | Yes: Trial of Mercury, Clocktower Drills | Yes: the dead clock at 11:59, gears, a camp | Party (story) | Agnes's report puzzle | Yes | Story + Battle | Complete |
| **Registry Hall / Intake Window 1** | `lobby` | `ROOMS.boss`; `m_horaios`; `pn('lobby')` | Scene 14 (destroyed at the end of Ch1) | Yes: Horaios (weekly) | Yes: moonlight, numbered chairs, the great desk, inlaid wheel | — | — | Boss | Story + Battle | Complete |

### C. Combat-only (2)
| Location | Theme | Code | Access | Unique env | Status |
|---|---|---|---|---|---|
| **Drowned Canals** | `pier` | `ROOMS.house12` (12th House · Pisces, fog rule); first room for Kairos in Climb | Battle | Yes: docks, channels, boats, nets, fog lamps | Complete art; no story, no NPCs |
| **Garrison Arena** (also "Vigil Arena" in comments) | `ring` | `ROOMS.trialMars` | Battle › Trials | Yes: sand ring, stands, banners, torches, scoreboard | Complete art; combat only |

### D. Partially implemented (2)
| Location | What exists | What is missing |
|---|---|---|
| **The Stacks / Registry of Births** | Ch1 Scene 13 split mission `stacks` (`MISSIONS.stacks`, `initSplit`) on the `office` theme with mission walls, gates and levers | No art of its own: it reuses the Concord Office paint. Destroyed in the story. |
| **Night Market** | `ROOMS.arena` "Vice Gallery · Night Market" | No environment: it is the Market Ring in daylight. |

Naming leftovers to tidy later: "Vigil Yard drills" (training) and the "Vigil Arena" comment are v1 names for the Garrison (Lore v1.1 renamed Vigil to Meridian Garrison).

### E. Lore and dialogue only (9, plus one sky feature)
| Location | Where it is mentioned | Notes |
|---|---|---|
| **The Wall** | Lore v2 Part 7; Ch1 Scene 11; the Aster map record | Edge of the known world |
| **Aster beyond the Wall** | Lore Part 7; `yard.map` record | Unmapped for 80 years |
| **The Moon Gate** | Horaios phase IV banner; Ch1 ending | Took Lucas; a doorway, not a place |
| **The Archive** (Window 2, filing halls, tubes) | Ch1 end card; Lore Part 18 [PROPOSED] | Chapter 2's main setting |
| **The harbour** | Cold open ("another over the harbor"); a Lore puzzle | Possibly the same as the Drowned Canals; not confirmed |
| **Theo's workshop** | Lore Part 18 (Ch2 Scene 1 hideout) [PROPOSED] | Chapter 2 |
| **Church cellars** | Lore Part 18 (Fountain Raid) [PROPOSED] | Chapter 2 |
| **Old chapels / the Buried Books** | Lore Part 8 [DRAFT] | Heretic scriptures |
| **Institute core vault** | Lore Part 18 ending | Marr takes it |
| *Sky Seam* | Ch1 Scene 11; Lore Part 7 | A feature in the sky, not a location |

## Totals
| Category | Count |
|---|---|
| Unique implemented environments | **15** (14 themes + the skyline) |
| A. Freely explorable | **5** |
| B. Story locations not explorable | **8** (3 story-only, 5 story + Battle) |
| C. Combat-only | **2** |
| D. Partially implemented | **2** |
| E. Lore/dialogue only | **9** (+ the Sky Seam) |
