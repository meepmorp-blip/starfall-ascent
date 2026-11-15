# Map Exploration Assessment

## Shared facts for every map
- **Size:** one screen, 620 to 900 × 400 world units, about 60% of which is walkable floor (painted building rows take the top band).
- **Painted props have no collision.** Stalls, benches, beds, trees, tables, statues and carts painted into the background can be walked over. Only these block movement: fountains, the sundial, the Expansion 04/05 runtime objects (crates, barrels, dummies, cart, candles, the market crate wall), and mission solids.
- **No time of day:** each theme is fixed as day or night (`ATMO[theme].night`).
- **Detail is high.** Every theme has a base paint and an `enrichTheme` dressing pass (light shafts, clutter, props), plus an atmosphere grade and motes. The art quality is consistent across all 14 themes.

## Explorable districts
| District | Feel | NPCs | Interactables | Hidden | Activities | Weakness | Potential |
|---|---|---|---|---|---|---|---|
| **Market Ring** | Strong: the ring road, fountain, stalls on both rows | 4 (2 walk) | 4 records, board, scarf, barrels, crate wall | Coin, crate-corner tin | Quests | Busy; stalls can be walked through | Shops (roadmap), a time-of-day pass |
| **Festival Square** | Strong: the Mercy fountain, rope line, lanterns | 2 (1 walks) | 3 records, poster, coins, switch, scar, stand | Glasses (quest) | Programme pages | Large empty lawns at the edges | Festival preparations, Chapter 2 queue |
| **Garrison Yard** | Strong: training ring, pond, barracks | 1–3 (soldier patrols) | 3 records, board, helmet, trials board | Aster map | Drill course, breakables | Pond and posts have no collision | Agnes/Bram activities |
| **The Cloister** | Calm: cross paths, hedges, statues, sundial | 2 (1 walks) | 3 records, rim, candles | Sundial chest | Hour Candles | **Sparsest population;** it's a church district with no clergy activity | Vespers, a choir, a Buried Books hint (gated) |
| **St. Lucia's** | Clear: tiled ward, beds, windows | 2–4 (nurse walks) | 2 records, clock, cart, lever | Hatch, drawing | Rounds quest | **Beds have no collision;** it's an interior that can feel cramped | Night shift, patient care activity |

## Story and combat environments (not explorable)
| Environment | Visual identity | As an exploration space |
|---|---|---|
| **St. Hesper's yard** (`orphanage`) | Very strong: gate with the 11:59 clock, fence, chalk hopscotch and sun, the back step and saucer, bakery glow, rope swing. Night. | **Best candidate.** It is an outdoor yard with room to walk and readable props, and every object already carries story. A walk scene with spots already exists. |
| **Concord Office** (`office`) | Strong: queue, desks, window light, wall clock | Good. Daylight, an indoor hall, queue NPCs already written. The props are desks with no collision, and the floor is crowded. |
| **Ash Lane street** (`street`) | Strong: terraces, awnings, laundry | Good as a corridor or connector. Night-only. The lodging-house fire state depends on the chapter. |
| **Ash Lane rooftops** (`rooftop`) | Strong: roofs and plank bridges | Movement would need roof edges and gaps (new collision). Medium difficulty. |
| **Clocktower roofs** (`roof`) | Strong: the dead clock, gears, camp | Small; works as an annexe of St. Hesper's (the hideout) after Chapter 1. |
| **Drowned Canals** (`pier`) | Strong: docks, channels, boats, fog | Water would need collision. Chapter 2 gated. |
| **Garrison Arena** (`ring`) | Arena | Combat identity; keep as a Trial. |
| **Institute** (`lab`) / **Registry Hall** (`lobby`) | Strong | Keep story-only (see the lore comparison). |

## Maps that feel limited
- **The Cloister:** too empty for its importance.
- **St. Lucia's:** an interior whose props aren't solid.
- **Every district:** painted props without collision weaken the sense of a real place. This is the single biggest quality gap.

## Not recommended
- **Do not make districts bigger.** A scrolling camera would be a large architectural change, and the single-screen districts read well on phones.
- **Do not duplicate the Market for the Night Market.** If a night market is wanted, give it its own `ATMO` night grade rather than a new map.
