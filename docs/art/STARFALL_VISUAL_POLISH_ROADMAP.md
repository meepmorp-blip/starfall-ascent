# Visual polish roadmap

The owner's order: **environments and layout first, character sprites later.**

| Phase | Scope | Status |
|---|---|---|
| 1. Art direction + benchmark environment | Mood system for all 14 districts (baked colour grade, vignette, contact shade; live lamp flicker, motes, cloud shadows). Market Ring repainted as the benchmark (ring court, fountain, dressed stalls, carts, puddles, bunting foreground) | **Done, awaiting review** |
| 2. Environment upgrade | Repaint the other districts to the benchmark, in the order in `STARFALL_ENVIRONMENT_ART_GUIDE.md` | Next |
| 3. Characters | Kairos benchmark (sprite facings, portrait), then the other seven | Deferred by owner |
| 4. Combat | Attack poses, trails, hit-stop, boss presentation | After 3 |
| 5. UI finishing | Icons, borders, portraits in dialogue, transitions; no layout redesign | After 4 |
| 6. Integration | Consistency and phone performance pass | Last |

## Phase 1 results
- 30 of 30 screenshots render with no page errors after the change.
- Changed pixels versus before: Market Ring 30–35%, Ash Lane rooftops about 15% (mood and lamp light only).
- All live atmosphere turns off with **Reduce effects**.
- Not yet checked: frame rate on the owner's iPhone. The additions are a few dozen small rectangles and gradients per frame, so the cost should be low, but it needs a real-device look.
