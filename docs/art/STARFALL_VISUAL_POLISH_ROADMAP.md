# Visual polish roadmap

The owner's order: **environments and layout first, character sprites later.**

| Phase | Scope | Status |
|---|---|---|
| 1. Art direction + benchmark environment | Mood system for all 14 districts (baked colour grade, vignette, contact shade; live lamp flicker, motes, cloud shadows). Market Ring repainted as the benchmark (ring court, fountain, dressed stalls, carts, puddles, bunting foreground) | **Done, approved** |
| 2. Environment upgrade | Detail layer for the other 13 districts (`enrichTheme`): landmarks, story details, light sources, dressed edges. Before/after sheets: `districts_before.jpg`, `districts_after.jpg` | **Done, awaiting review** |
| 3. Characters | Kairos benchmark (sprite facings, portrait), then the other seven | Deferred by owner |
| 4. Combat | Attack poses, trails, hit-stop, boss presentation | After 3 |
| 5. UI finishing | Icons, borders, portraits in dialogue, transitions; no layout redesign | After 4 |
| 6. Integration | Consistency and phone performance pass | Last |

## Phase 1 results
- 30 of 30 screenshots render with no page errors after the change.
- Changed pixels versus before: Market Ring 30–35%, Ash Lane rooftops about 15% (mood and lamp light only).
- All live atmosphere turns off with **Reduce effects**.
- Not yet checked: frame rate on the owner's iPhone. The additions are a few dozen small rectangles and gradients per frame, so the cost should be low, but it needs a real-device look.

## Phase 2 results
- 30 of 30 screenshots render with no page errors.
- Added per district: Festival Square (cup line, lantern posts, stalls, cups on the fountain rim), St. Hesper's (scorched kitchen window, the saucer on the back step, chalk games, bakery light), clock tower (dead clock at 11:59, gears, a camp), Concord Offices (window light, wall clock, queue ropes, desk lamps), Registry Hall (moonlight, numbered chairs, records counter, floor inlays), Institute (core shelves, containment ring, screen glow), Ash Lane (window light, awnings, laundry, cart), rooftops (smoke, water tank, pigeon coop), St. Lucia's (daylight, nurses' station, floor lines, carts), Cloister (stained-glass light, candles, sundial, columns), Garrison Yard (dummies, weapon rack, well, hay), Arena (torches, benches with a crowd, scoreboard), Canals (fog lamps, nets, catch barrels).
- `tools/maps.js` exports every district map and a contact sheet for review.
