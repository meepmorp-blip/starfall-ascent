# Menu idle animation (Party Setup, Builds)

Characters on these two screens are drawn by `drawCharIdle()` in `index.html` instead of `drawChar()`.
It reuses the existing side-view art; no artwork was replaced.

How it works
- The character is drawn in bands: legs stay planted, torso and head rise with the breath, and the head dips for a few gestures.
- Every value is stepped (two to four states) and snapped to canvas pixels, so it reads as sprite frames, not smooth tweening.
- The art functions read five globals: `SW` (sway), `AC` (gesture 0..1), `AK` (which gesture), `HX`/`HY` (held-item offset).
  They are all 0 during gameplay, so combat and story drawing are unchanged.
- `IDLE_CFG` holds the per-character timing: breath depth and period, blink interval, gesture interval and length.
- Reduced-motion: the screens draw one still frame and run no loop.
- Each screen runs one loop at about 22 fps and stops when the screen is left.

Per character
| Character | Always | Rare gesture |
|---|---|---|
| Kairos | scarf tail and hair tufts sway | a small glint by the clock medallion or the scarf star |
| Agnes | shallow breath, cape hem sways | lifts the rifle a touch; shifts her stance |
| Bram | slow weight shift from foot to foot | shield rattles briefly |
| Naomi | bow ribbons and skirt hem sway | hand to her satchel, looks down |
| Theo | quicker breath, restless feet, tufts sway | lifts his gadget; nudges his goggles |
| Lucas | coat tail and hair sway | hand comes up to straighten his coat, chin lifts |
| Cassie | veil sways, censer swings | hand to her chest, head bowed, eyes closed; veil settles |
| Dess | ahoge, tail and tassel sway, double blink | lifts her notebook and looks down; pushes up her glasses |

Checks: `node tools/idle_sheet.js out/x.png <ids>` (pose sheet), `node tools/idle_screens.js` (both screens, desktop and phone).
