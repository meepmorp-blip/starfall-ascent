# Daily Treasure System

## The day
- **Day key:** the device's local calendar date, `YYYY-MM-DD`. Chests reset at local midnight, wherever the player lives. Changing the device clock can move to another day; with no server, that is accepted (the rewards are small).
- If the day changes while you are in Meridian, the new chests appear the next time you enter a district.

## Placement
- Each district has **seven hand-picked spots** (`MX_CHEST_SPOTS`), chosen to be reachable, off the main paths, near corners, behind the new crates and barrels, or by walls. None is near an exit, an NPC's home or route, or a solid.
- Every day, a seeded generator (`mulberry(hashStr(dayKey + ':' + district))`) picks **2 or 3** of those spots. The same day always gives the same chests, reloads included. A new day gives a new pick.

## Tiers
| Tier | How many | Reward |
|---|---|---|
| Common | most chests | 6 Stardust |
| Fine | the first chest in each district on about half the days | 12 Stardust |
| Precious | one chest per day in the whole city | 20 Stardust · 1 Keepsake |

A full day of chests is about 13 chests: roughly 100 Stardust and 1 Keepsake, about as much as four Battle stages. That's useful, but it doesn't replace fighting or the story.

## Claiming
- Opening a chest calls `grantReward(reward, 'chest:<day>:<district>:<n>')`. A second open on the same day pays nothing.
- `save.mx.day = {key, opened}` stores today's opened chests, so they stay open after a reload.
- When the day changes, `opened` is reset and older `chest:` claims are deleted from `save.claims`, so the save does not grow every day.

## Feedback
- Chests are small and dark. Once every few seconds a glint shows on them, so they can be found without being obvious.
- Opening a chest throws the lid, plays a burst of particles and a chime, and floats the reward text above it. Opened chests stay open (dimmed) until the next day.

## Expansion 05 changes
- **Spots re-picked** with `tools/chest_spots.js`. Every spot is checked against solids, people and their routes, objects, exits, and the real HUD and touch-control rectangles at five screen sizes (844×390, 667×375, 932×430, 1024×768 touch; 1280×720 desktop). Run `node tools/chest_spots.js check` after any map change. The daily logic, tiers and claim keys are unchanged.
- **Tiers look different:** common is plain wood with iron bands; fine is dark wood with silver-blue bands and pale motes when you are near; precious is indigo with gold bands, a gold star on the lid and violet motes.
- **Discovery:** the first time Kairos comes within reach of a closed chest on a visit, a soft two- or three-note chime plays (on the sound effects bus) and a ring flashes. The glint also comes faster when you are close. Nothing shows from a distance.
- **Opening:** the lid flips up with a small bounce, a burst sized by tier plays, then two lines float up: the tier name, then exactly what you got ("+12 Stardust").
