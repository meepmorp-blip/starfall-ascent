# World Expansion Progress

| Stage | Content | Status |
|---|---|---|
| 1 | Regional world map, unlocks, fast travel | **Done** |
| 2 | St. Hesper's Orphanage (Expansion 06) | **Done** |
| 3 | Concord Office (Expansion 07) | **Done** |
| 4 | Ash Lane (Expansion 08) | **Done** |
| 5 | St. Hesper's Clock Tower (Expansion 09) | **Done** (built as the hideout in Narrative Stage A) |
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

## Stage 3 · Concord Office (Expansion 07)
- **Existed before:** the `office` theme (base paint + dressing: back wall, shelves, window light, wall clock, TAKE A NUMBER counter, queue rope, desk and cabinet columns down both sides, rug, pot plants, paper stacks). It was used by Chapter 1 Scene 7 "The Queue", Scene 13 "The Stacks" and Battle House 10. It was not explorable.
- **Reused:** the painted hall as-is; the district, NPC, route, voice, record, readable, chest, reward and Renown systems; `showPuzzle` for the filing step.
- **Added:**
  - **District** `office`, reached through a new east exit from The Cloister (south door back), with a fast-travel arrival point.
  - **Unlock:** Chapter 1 Scene 7. The Cloister's east exit stays closed and undrawn until then (`mxExits` filters exits by world-map unlock).
  - **Collision for the painted hall:** back wall, both sealed desk and cabinet columns, the queue rope, the counter, pot plants.
  - **People** (new townsfolk; Scene 7's couple, mother, widow and records clerk stay story-only): the counter clerk, a filing clerk walking the aisles, a man with ticket 206, and Tobin the apprentice. All murmur on small talk.
  - **Misfiled Folders:**
    - Tobin dropped four coloured folders, each for a House. They lie at four of eight spots, which change daily.
    - Walk over them, return to Tobin, then file them First House to Twelfth (`showPuzzle`, three rounds; a wrong drawer is explained).
    - Reward: first time 1 Keepsake (`act:folders`), then 12 Stardust once a day (`act:folders:<day>`). First clear +10 Renown.
  - **Records:** the motto "YOUR CHART IS YOUR CALLING" (canon), the notice board (Re-charting, the Church's public face), the waiting benches, plus a hidden APPROVED stamp (10 Stardust once).
  - **Readables:** the ticket machine (number changes daily), the rolling ladder.
  - **Daily chests:** seven spots from `tools/chest_spots.js`; the tool now avoids folder spots.
- **Story rules held:** nothing about Kairos's record, Window 3, the Archive, Lucas, the Ledger or confessions ([DRAFT] lore). The test fails on any of them.
- **Save:** new state is `save.mx.seen.office`, records and claims only.
- **New test:** `tools/office_test.js` (24 checks). It includes a **reachability flood fill**: every person, record, readable, chest spot and folder spot must be reachable on foot from the door.
- **Bugs found and fixed during Stage 3:**
  - The office readables along the top sat under the objective bar on phones; they moved to the strip above the queue rope, and two office chest spots moved with them.
  - The daily precious chest could be placed in a story-locked district (unreachable that day). It now picks only from districts the player can reach.
- **Tests:**

| Suite | Desktop | Phone (844×390) | Small (667×375) |
|---|---|---|---|
| `office_test.js` (new) | 24/24 | 24/24 | 24/24 |
| St. Hesper's | 31/31 | 31/31 | 31/31 |
| World map | 22/22 | 22/22 | 22/22 |
| Exploration polish (now includes the office) | 33/33 | 33/33 | 33/33 |
| Exploration | 36/36 | 36/36 | — |
| Meridian | 41/41 | 41/41 | — |
| Economy | 29/29 | 29/29 | — |
| Chest spots vs HUD + routes (5 sizes) | all OK | | |

## Stage 4 · Ash Lane (Expansion 08)
- **Existed before:** the `street` theme (base paint + night dressing: terraced houses, awnings, washing line, lamps, cart, crates, a barrel, a striped bench, kerb posters, wall clutter). It was used by Chapter 1 Scene 5 "Carry Him" and Scene 10 "The Frozen Fire". It was not explorable.
- **Reused:** the painted street as-is; the district, NPC, route, voice, record, readable, chest, reward and Renown systems.
- **Added:**
  - **District** `ashlane`, reached through a new east exit from St. Lucia's (west exit back).
  - **Unlock:** Chapter 1 Scene 10, after the Lane's story events. The exit stays closed and undrawn until then.
  - **Collision** for the houses, crates, barrel, bench, cart, lamps, kerb posters, and the six wall crates and barrels.
    - The wall clutter is placed by the dressing's seeded random generator. `streetClutter()` re-derives it from the same seed.
    - While the background bakes, the painter records where it actually drew them (`bgProps`). The test checks the two match.
  - **People:** a laundress, the lamplighter (walks the lamps), a shopkeeper, and a kid with a hoop. All murmur on small talk.
  - **Odd Things on the Lane** (observation):
    - The shopkeeper gives three clues each day, chosen from six odd objects (a teacup on the rain barrel, a boot by the cart, a kite on the washing, a ribbon on a lamp, a chalk arrow on the crates, a thimble on the bench).
    - Only today's three appear. Find them, then return.
    - Reward: first time 1 Keepsake (`act:oddities`), then 12 Stardust a day (`act:oddities:<day>`). First clear +10 Renown.
  - **Records:** kerb posters, the awnings, Lamp No. 7, plus hidden chalk marks (10 Stardust once).
  - **Readables:** the handcart, the washing line.
  - **Daily chests:** seven spots from `tools/chest_spots.js`.
- **Story rules held:** no fire, lodging house, Inquisitor, rooftops or Lucas. The test fails on any of them.
- **New test:** `tools/ashlane_test.js` (32 checks): story gating, painted collision, reachability flood fill, the activity, the secret, chests, travel, reload.

## Stage 5 · St. Hesper's Clock Tower (built with Narrative Stage A)
- **District** `tower` (roof theme, night), reached through a new east exit from St. Hesper's (south exit back). Opens after Chapter 1 is cleared.
- **Collision** for the four chimneys, the four gears and the bread crate. The clock face is walkable.
- **The party's hideout:** Agnes, Bram, Naomi, Theo, Cassie and Dess, each with three post-Chapter 1 lines. Lucas is not there.
- **Stations:** a workbench (opens Builds) and a notice board (opens the Journal's Stories tab).
- **Readables:** the view from the tower, the bedrolls.
- **No daily chests** on the tower. The precious chest pool skips districts with no chest spots.
- See `docs/narrative/PRE_CH2_IMPLEMENTATION_AUDIT.md` § 6 for the era and quest foundation.
