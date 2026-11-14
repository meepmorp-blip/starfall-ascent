# Environment art guide

## Rules for every map
- **Do not move gameplay.** Arena bounds, solids, spawn edges and interactive objects stay where they are. Art changes are paint only.
- **Three layers.**
  1. Background: the painted map (`paintTheme`), cached.
  2. Middle: characters, Vices, effects.
  3. Foreground: `drawAtmosOver` (motes, bunting). Keep it thin and mostly at the edges so it never hides a telegraph.
- **Landmark.** Each district gets one thing you would describe it by (the Market's fountain and ring, the Festival fountain, the dead clock).
- **Shape says place.** Paving patterns, not just props: rings and spokes for the Market, a cross path for the Cloister, aisles for the Registry.
- **Edges are busy, the middle is calm.** Stalls, carts, crates and plants hug the border band.
- **Light.** Use `lamp()` and `lantern()` for light sources: they glow in the painted map and are registered so they flicker live.

## How to add atmosphere to a district
Edit the `ATMO` table in `index.html`:

| Field | Meaning |
|---|---|
| `grade` | `[lightColour, lightStrength, shadeColour, shadeStrength]`, baked top-left to bottom-right |
| `vig` | Vignette strength (0.2 light, 0.45 heavy) |
| `motes` | `{n, col, kind}` where kind is `dust`, `petal`, `firefly`, `ember`, `rise`, `mist` or `float` |
| `clouds` | Slow cloud shadows (outdoor day maps) |
| `night` | Stronger lamp glow |
| `bunting`, `fountain` | Market and Festival extras |

All live atmosphere is skipped when the player turns on **Reduce effects**.

## Market Ring (benchmark, done)
Round pale-paved court with two ring courses and eight spokes, worn footpaths from the side gates, a stone fountain with live sparkle, trade houses with signs and window boxes, stalls with crates of goods and a lantern each, a flower cart and a hay cart, puddles, drain grates, bunting strung across both ends.

## Next districts, in order
1. **Festival Square**: lantern strings, the Mercy fountain as a true centrepiece, a queue path, festival stalls.
2. **St. Hesper's and the clock tower**: the dead clock, gears, ironwork.
3. **Concord Offices and Registry Hall**: cabinets to the ceiling, numbered chairs, the great desk.
4. **The Institute**: tanks of cores, cables, warning light.
5. **Ash Lane and rooftops**: chimney smoke, lit windows, laundry lines.
6. **St. Lucia's, the Cloister, Garrison Yard, Arena, Canals.**
