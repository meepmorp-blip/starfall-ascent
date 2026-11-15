# Map Exploration · Audit (Expansion 04)

## What exists
| Area | State before this expansion |
|---|---|
| Explorable maps | Five Meridian districts (Market Ring, Festival Square, Garrison Yard, The Cloister, St. Lucia's), one screen each. The arena width adapts to the screen (about 700 to 900 units wide, 400 high). |
| Collision | Player clamped to the arena; `m.solids` holds circles and boxes (`collideSolids`). Districts had three solids in total: two fountains and the sundial. The painted props (stalls, benches, beds, trees) have no collision. |
| Interaction | Nearest walk-scene NPC or `spot` within 50 px; "Press F / Tap ⚔". Bubbles: `!` quest, `…` new, `?` unread spot. |
| NPCs | 20 people, all standing still. Lines change with quest state and Chapter 1 progress. |
| Rewards | `grantReward(reward, key)` with `save.claims`; Stardust, Keepsakes, Mastery, Star Fragments. Meridian Renown counts districts, records and quests. |
| Chests | Battle has random chests (`spawnChest` / `drawChests`) that drop fragments; nothing in Meridian. |
| Audio | Fully synthesized with Web Audio: an sfx bus (respects the Sound effects slider), noise, tone, sweep, thump and growl helpers, a 45 ms repeat guard per sound. **No audio files exist** in the project. |
| Save | `save.mx` for Meridian, `save.claims` for one-time rewards, save v2. |

## What was missing
- Reasons to come back: nothing changed from day to day.
- Things to do besides talking: no activities, nothing to touch, no obstacles.
- NPCs never moved.
- No voice for ordinary townsfolk.

## Constraints that shaped the design
- Painted props have no collision, so new obstacles must be drawn at runtime with matching collision (using the existing `crate2`, `barrel` painters) rather than repainting maps.
- Chest spots must avoid the exits (walking into an edge zone changes district), NPC homes and routes, and the new obstacles.
- The day must be computed on the device (GitHub Pages, no server).
- Party characters (Agnes, Bram, Naomi, Theo) keep their places; only townsfolk move.
