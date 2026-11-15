# Fast Travel

## Opening the map
| Where | How |
|---|---|
| Exploring (touch) | The gold map button to the left of pause |
| Exploring (keyboard) | **M** (M or Esc closes it) |
| Pause menu | **World map** (Journal moved one row down) |
| Meridian menu | **World map**: pick where to start |
| Journal › Map | "Open the world map" |

Opening the map from the field pauses play (`state='panel'`); closing it resumes.

## Travelling
1. Pick a discovered place and press **Travel**.
2. In the field: the overlay closes, the screen fades out over 0.32 s, and the target district loads through the normal `enterRoom` → `mxEnter` path.
3. Kairos arrives at the district's `arrive` point, an open floor spot clear of solids and exits. A gold ring and sparkles mark the arrival, with a soft two-note chime on the sound effects bus and a short "Fast travel" banner under the place name.
4. From the Meridian menu, travel sets `save.mx.at` and starts the run there with the same arrival effect.

## What is kept
- **Party:** the explore run continues; nothing is reset.
- **Daily state:** chests, pages, the drill, breakables and levers are all keyed to the day or saved, and travelling doesn't touch them.
- **Save:** only `save.mx.at` changes, the same as walking. No new save fields.

## What is not allowed
- Travel to places that aren't discovered, aren't built, or are story-locked (Travel is disabled, with the reason shown).
- Travel during dialogue (the map opens only in play, or from pause or a menu).
