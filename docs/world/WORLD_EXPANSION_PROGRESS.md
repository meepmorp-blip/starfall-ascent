# World Expansion Progress

| Stage | Content | Status |
|---|---|---|
| 1 | Regional world map, unlocks, fast travel | **Done** |
| 2 | St. Hesper's Orphanage (Expansion 06) | **Done** |
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

## Stage 2 · St. Hesper's Orphanage (Expansion 06)
- **Existed before:** the `orphanage` theme (base paint + dressing + night grade), used by the cold open and the Scene 9 `longway` walk. It was not explorable.
- **Reused:** the painted yard as-is (gate and its 11:59 clock, fence, benches, lamps, trees, chalk hopscotch and sun, back step, bakery glow, rope swing); the district, NPC, route, voice, record, readable, chest, reward and Renown systems; `matron` (Sister Agathe) from `SPK`.
- **Added:**
  - **District** `hesper`, reached through a new east exit from Festival Square (west exit back), with a fast-travel arrival point.
  - **Collision for the painted props** (`mxPaintedSolids('hesper')`): the building and fence band, flowerbeds, lamps, both benches, four trees, the back step.
  - **People:**
    - Sister Agathe strolls between the gate and the back step.
    - Pip plays on the hopscotch.
    - Wren sits by the swing.
    - The baker next door stands in the bakery's glow.
    - All four murmur on small talk.
  - **Hide-and-Seek:**
    - Talk to Pip and Wren hides at one of six spots (the benches, the swing tree, the bakery wall, the back step, the corner tree).
    - Every round picks a new spot, seeded by day and round.
    - Clues: a red ribbon peeks out, and "hee hee" plus a soft note when you're within reach.
    - Reward: first find 1 Keepsake (`act:hideseek`), then 10 Stardust once a day (`act:hideseek:<day>`). First find +10 Renown.
  - **Records:** the gate clock, the chalk sun, the chore board, plus three hidden marbles (10 Stardust once).
  - **Readables:** the rope swing, the bakery window, the hopscotch.
  - **Daily chests:** seven spots from `tools/chest_spots.js`; the tool now also avoids the hiding spots.
  - **Meridian menu map:** grows to four columns.
- **Story rules held:**
  - No kitchen fire, no "cat", no Lucas, no explanation of the clock ("It has said 11:59 for as long as anyone remembers").
  - No Twelve Loaves quest.
  - The test fails if any line mentions fire, cat, Lucas, end piece, the stopped minute or 9:04.
- **Save:**
  - New state: `save.mx.seen.hesper`, records and claims only.
  - "Know the Streets" is frozen to the original five districts (`MX_STREETS`), so finished quests stay finished and active ones don't gain a sixth stop.
- **Tools:** `chest_spots.js` and `exploration_test.js` now read exits and districts from the game (`window.__sf_exits`); `exploration_polish_test.js` covers St. Hesper's. New: `tools/hesper_test.js`.
- **Bugs found and fixed during Stage 2:**
  - On phones, the bakery window readable sat under the HP panel; it was moved.
  - A Garrison Yard chest spot sat beside the soldier's patrol path. When he walked past, the chest took the talk prompt, which broke "The Duty Roster" in the playtest. `chest_spots.js` now checks whole walking routes, not just their stops, and five spots (Market, Square, Yard, Cloister, Ward) were moved.
- **Tests:**

| Suite | Desktop | Phone (844×390) | Small (667×375) |
|---|---|---|---|
| `hesper_test.js` (new) | 31/31 | 31/31 | 31/31 |
| World map | 22/22 | 22/22 | 22/22 |
| Exploration polish (now includes St. Hesper's) | 33/33 | 33/33 | 33/33 |
| Exploration | 36/36 | 36/36 | — |
| Meridian | 41/41 | 41/41 | — |
| Economy | 29/29 | 29/29 | — |
| Chest spots vs HUD + routes (5 sizes) | all OK | | |
