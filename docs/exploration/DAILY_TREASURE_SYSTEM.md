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
