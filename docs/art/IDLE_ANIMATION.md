# Menu idle animation (Party Setup, Builds)

On these two screens characters are drawn by `drawCharIdle()` in `index.html` instead of `drawChar()`.
The art is the approved side-view sprite; the actions add new poses and props drawn in the same style and palette.

## Two layers
1. **Resting idle**: stepped breathing (legs planted, torso and head rise), blinking, and sway on hair, scarf, veil and coat tips.
2. **Idle action**: a short authored sequence, frame by frame at 12 fps, played every 18 to 27 seconds (varied a little each time,
   and offset so party members do not act together). Each frame is a pose: hand position, head tilt, eyelids, prop state, effects.

## The actions (frame sheets in `docs/art/idle_actions/`)
| Character | Action | Frames |
|---|---|---|
| Kairos | Calls a water-clock blade into his hand, inspects the edge, turns it, tosses it twice, catches it, lets it run back to water | 58 |
| Agnes | Lifts the rifle, wipes the barrel with a cloth, polishes the scope, shoulders it to check the sight, lowers it | 60 |
| Bram | Rolls his shoulders, a shoulder plate drops loose, he freezes (sweat drop), pushes it back, pats it flat, nods | 54 |
| Naomi | Takes a medicine bottle from her satchel, holds it to the light, checks it, puts it back, tidies the satchel | 62 |
| Theo | Digs a gadget out of his coat, tinkers, it sparks in his face and smokes, he shakes it back to life, pockets it | 64 |
| Lucas | Draws his pistol, sights along the barrel, twirls it twice, holsters it, straightens his cuff | 60 |
| Cassie | Hand to her heart, head bowed, eyes closed in prayer (a faint Concord mark rises), then straightens her veil | 66 |
| Dess | Opens her notebook and reads, turns a page, spots something (!), leans in, then flusters and pushes up her glasses | 64 |

On these screens Kairos, Naomi, Theo, Lucas, Cassie and Dess stand with empty hands or holstered weapons so the action can start from rest.
Agnes and Bram keep their weapons, because their actions use them.

## Code
- `IDLE_CFG`: breathing, blink timing. `IDLE_ACT`: frame count, interval, pose function, effects, unarmed flag.
- The art functions read `ACT` (the current pose), `SW` (sway) and `HX`/`HY` (body offset). All are null or 0 in gameplay, so combat and story drawing are unchanged.
- Reduced motion: one still frame, no loop. Each screen runs one loop at about 22 fps that stops when the screen is left.

## Checks
- `node tools/act_frames.js <ids>`: every frame of each action as a numbered sheet.
- `node tools/act_gif.js`: all eight actions side by side, as frames for a GIF.
- `node tools/idle_screens.js`: both screens at desktop and phone size, all eight characters, interaction and error check.
