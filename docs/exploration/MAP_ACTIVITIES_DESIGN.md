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
