# Map Activities, Obstacles and Interactables

## Activities (three, one per kind)
| Activity | District | Kind | How it works | Reward |
|---|---|---|---|---|
| **Agnes's Drill Course** | Garrison Yard | Timed checkpoints (Agnes-inspired) | Read the drill board to start. Six numbered flags light up in order; touch each one within 25 seconds. Run out of time and the course resets. | First clear: 40 Stardust + 1 Keepsake (`act:drill`). Then once a day: 10 Stardust (`act:drill:<day>`). Best time is kept. |
| **The Hour Candles** | The Cloister | Environmental puzzle (observation, Dess-inspired) | Four candles stand around the sundial, each engraved with the sun or moon at a different hour. The rim reads: "From first light to last, then the moon." Light them in that order (rising sun, high sun, setting sun, moon). A wrong candle snuffs them all. Solving it opens a hidden chest by the east statue. | One time: 30 Stardust + a Star Fragment (`act:sundial`). |
| **The Festival Programme** | Festival Square | Collection | The wind has scattered the printed programme. Six pages lie around the Square, in places that change every day. Walk over a page to pick it up. Return to the empty programme stand when you have all six. | First time: 1 Keepsake (`act:pages`). Then once a day: 15 Stardust (`act:pages:<day>`). |

All three also add to Meridian Renown, 10 points each on the first clear.

## Obstacles (collision added)
| District | Obstacle | Why it is there |
|---|---|---|
| Market Ring | Stacked crates (west), barrels (east) | Stall stock waiting to be unpacked. Chests hide behind them. |
| Festival Square | Festival crates (south-west), barrels (north-east) | Lantern stock for the Festival. |
| Garrison Yard | Two training dummies, a crate stack | The drill course runs between them. |
| The Cloister | Four hour candles (small) | Part of the puzzle. |
| St. Lucia's | A supply cart | Linen and bandages on the ward floor. |

Obstacles sit away from exits, NPC routes and the main walking lines.

## Interactables (world-building, no reward)
| District | Object | Text |
|---|---|---|
| Market Ring | A scarf on the crates | A knitted scarf left neatly folded, with a note asking finders to leave it. |
| Festival Square | Coins in the fountain | Wishing coins nobody fishes out. |
| Garrison Yard | A dented helmet | A name inside, and a size: LARGE (larger). |
| St. Lucia's | The ward clock | Stopped at 9:04. Nobody has wound it; Theo asked them not to. |

Each shows `?` until read, then goes quiet. They are not Records, so Records and Renown are unchanged.

## Expansion 05: interactive objects and secrets
A small reusable set (`mxObjDefs`, `mxObjEnter`, `mxObjUpdate`, `mxObjDraw`). Positions are relative to the arena edges, so they hold on every screen width.

| Kind | Behaviour | Saved |
|---|---|---|
| `wall` | Solid crate wall | n/a |
| `push` | Walk into it for about 0.2 s to slide it one step (24 units). It stops at solids, walls, people and the map edge, with a dull knock when blocked. | Position, permanently (`save.mx.obj`) |
| `break` | Interact to break: wood chips fly, a small reward through `grantReward`, collision removed. `once` stays broken forever; `daily` comes back the next day. | `save.mx.obj` / today's `save.mx.day.obj` |
| `lever` | Interact to pull. `toggle` flips on and off; `once` stays released. | `save.mx.obj` |

| District | Object | Result | Reward |
|---|---|---|---|
| Market Ring | **The stall-keepers' corner**: a crate wall in the south-west corner with one loose crate in the gap. Push it in to open the corner. | A hidden path to a rainy-day tin | 25 Stardust, once (`sec:market.alcove`) |
| Garrison Yard | An old barrel (west) | Breaks for good | 10 Stardust, once (`brk:yard.oldbarrel`) |
| Garrison Yard | A Garrison supply crate (south) | A new one every day | 4 Stardust a day (`brk:yard.supply:<day>`) |
| Festival Square | The lantern switch (south-west) | Lights the eight lantern posts and the bunting; on and off | none |
| St. Lucia's | The cart brake | The supply cart rolls aside and uncovers a loose floor tile with a note | 15 Stardust, once (`sec:ward.hatch`) |

The two secrets add 5 Renown each (total available: 225).

## Expansion 05: Hour Candles polish
- Each correct candle flares as it lights and plays a rising note (four steps up a scale).
- A wrong candle flashes red, the others puff out with smoke, and a "Wrong hour" line appears.
- When solved, all four flare with a beam to the sundial, the dial rings, and a column of light marks the chest behind the east statue for a moment.
- The engravings are 1.45× larger. When Kairos is close, each candle also shows its word ("Sun rising", "Sun high", "Sun setting", "Moon") in crisp text.
- The ordered-sequence rule is now a reusable function (`mxSeqStep`) for future puzzles.

## Expansion 05: text and prompts
- Names, prompts, exit labels and engraving words are drawn after the pixel buffer is scaled up, at a fixed on-screen size: names and exit labels at 11 px, prompts at 13 px. They stay sharp and readable on phones, and the art itself is not scaled.
- The prompt now names its target ("F · talk · Rosa", "Tap ⚔ to break · supply crate"). It moves above the target when Kairos stands below it, replacing that target's bubble so it never covers him.
- Prompts and floating text are kept inside the screen near the edges.
