# Combat tuning v1 (branch `combat-tuning`)

No save data changed. All new values are constants in `index.html`.

## 1. St. Lucia's Ward (`rift_water`)
| What | Old | New |
|---|---|---|
| Patient HP | 100 | 100 (unchanged) |
| Vices that chase the patients | 50% of all spawns, no limit (up to 6 seen at once) | 50%, but **at most 3 alive at a time** (`WARD_CHASE_MAX`, in `targetFor`) |
| Damage per Vice touching the patients, per second | `2.5 + tier`: I 3.5 · II 4.5 · III 5.5 | `WARD_DPS`: I 3.5 · II 3.6 · III 3.75 |
| Vices counted when several touch at once | all of them | at most 3 |
| On-field cap, spawn rate, kill goal, Water Fragment drop | unchanged | unchanged |

**Measured** (player parked in a corner, not fighting; 3 runs each; time until the patients fall):

| Tier | Old | New |
|---|---|---|
| I | 13.7–19.2 s | 15.1–24.3 s (noisy; about the same) |
| II | 12.3–31.3 s | 17.0–27.2 s |
| III | 12.2–14.4 s | 13.4–16.9 s |

Most of the Tier III gain comes in real play: before, 4–6 Vices could pile onto the patients at once (up to 33 HP/s). Now it's at most 3 × 3.75 = 11.25 HP/s, which leaves time to intercept. Patients still fall in about 15 s if ignored.

## 2. Kairos · Riptide (Sun skill)
| What | Old | New |
|---|---|---|
| Aim | `aimDir(220)`: weighted by facing and the joystick, so it could pick a farther enemy | **The nearest valid enemy within 400 px** (`ripAim`, `RIP_RANGE`). Falls back to the old aim if there is none |
| 2nd dash | re-aimed freshly | **Same target** (`p.ripTgt`). If it died or became invalid, it takes the next nearest |
| 2nd-dash window (active time) | 3 s | **2.5 s** (`RIP_WIN`); kit text updated |
| Damage, distance, trail, visuals | unchanged | unchanged |

Note: Riptide now ignores mouse aim too.

## 3. Entrance feedback (`entranceFx`, `ENT_FX`)
Shake goes through `shake()`, so the Screen Shake option and Reduce Motion (×0.3) still apply. Hit-stop is the existing `slowReal` (time at 30%). A ring in the character's colour marks the landing.

| Character | Entrance | Shake (strength / time) | Hit-stop |
|---|---|---|---|
| Kairos | Borrowed Hour | copies the source's feel ×1.1; own dash 3 / 0.10 s | 0.06 s |
| Agnes | Overwatch Drop | 2.5 / 0.09 s | 0.05 s |
| Bram | Coming Through! | 5 / 0.16 s (was 4 / 0.12 s) | 0.09 s |
| Naomi | House Call | 1.5 / 0.08 s | none |
| Theo | Field Test | 2 / 0.08 s | none |
| Lucas | Cold Entry | 3 / 0.10 s | 0.05 s |
| Cassie | Charge of Faith | 4.5 / 0.14 s | 0.08 s |
| Dess | Unlocked | 1.5 / 0.08 s | none |

Before, only Bram had any shake. Support entrances (heals, shields) stay soft.

## Tests
- `tools/combat_tuning_test.js`: ward at Tiers I–III (also runnable against an old copy with `SF_PAGE`), Riptide targeting, all 8 Entrances on desktop and iPhone 13, and every rift at every tier.
- Dev-only hooks added to `__sf`: `fx`, `swap`, `sun`.
