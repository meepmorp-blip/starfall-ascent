# World Expansion Progress

| Stage | Content | Status |
|---|---|---|
| 1 | Regional world map, unlocks, fast travel | **Done** |
| 2 | St. Hesper's Orphanage (Expansion 06) | In progress |
| 3 | Concord Office (Expansion 07) | Not started (map shows it once Scene 7 is reached) |
| 4 | Ash Lane (Expansion 08) | Not started (unlocks at Scene 10) |
| 5 | St. Hesper's Clock Tower (Expansion 09) | Not started (unlocks after Chapter 1) |
| 6 | Drowned Canals (Expansion 10) | Prepare only; story-locked until Chapter 2 |

## Stage 1 · World map and fast travel
- **Existed before:** five districts joined by walk-off exits; a 3×3 district grid in the Meridian menu and Journal; no regional view; no fast travel.
- **Reused:** the district registry (`MX_DISTRICTS`), the exit fade, `enterRoom`/`mxEnter`, `save.mx.seen` for discovery, Chapter 1 progress in `save.ch1b`, the overlay and panel styles, the sound effects bus.
- **Added:**
  - `WORLD_LOCS` (10 places) and `WORLD_ROADS`.
  - Story unlocks (`ch1Scene`, `wmUnlocked`) and five map states.
  - The illustrated parchment map (`drawWorldMap`, `wmIcon`) with a selection panel.
  - Fast travel with a fade, arrival points, an arrival ring and chime.
  - Entry points: a HUD map button, the M key, the pause menu, the Meridian menu and the Journal.
- **Save:** no new fields. Fast travel changes only `save.mx.at`.
- **Tests:**

| Suite | Desktop | Phone (844×390) | Small (667×375) |
|---|---|---|---|
| `worldmap_test.js` (new) | 22/22 | 22/22 | 22/22 |
| Exploration polish | 33/33 | 33/33 | 33/33 |
| Exploration | 36/36 | 36/36 | — |
| Meridian | 41/41 | 41/41 | — |
| Economy | 29/29 | 29/29 | — |
| Chest spots vs HUD (5 sizes) | all OK | | |

- **Bug found and fixed:** `replaceChildren` printed a literal "null" in the map's side panel.
