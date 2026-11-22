# Chapter 1 Enemy Design · Phase 4 implementation plan

**Status:** plan only. Nothing is implemented. No code, asset or encounter changes, and no commit, push, merge or deploy.

**Inputs (all approved):**
- `CH1_ENEMY_ROSTER.md`
- `CH1_ENEMY_DESIGN_PROFILES.md`
- `CH1_ENEMY_VISUAL_REFERENCE.md` (+ `docs/art/ch1_enemies/`)
- `CH1_ENEMY_GAMEPLAY_SPEC.md`

**Owner decisions for Phase 3 (recorded):**
- **#14 = Option A.** The Memory is an untargetable, non-combat presence. Forgotten Memory is **unchanged**: kill goal 12, pool `collector, gossip, gossip`, the three lines, timing, rewards and progression. It drops the bread, the counting blanket corner and the cup at the three existing memory moments; at the end the cup rolls to Lucas. Option B is not approved.
- **Candlewisp and all telegraph lines:** at least 2 screen px on phones.
- **Debut placements and caps:** approved as specified. **Candlewisp stays out of St. Lucia's Ward if the sim shows patient protection becomes unfair.**
- **"NEW VICE" notes and Guide entries:** approved for all five.

## 1. Files that will change
| File | Change | Section(s) |
|---|---|---|
| `index.html` | All game changes, in the stages below | `VICE_INFO` (l.1951), `colorOf` (l.2035), `rollElite` (l.2039), `makeEnemy` (l.2045), `hitEnemy` (l.2104), `playerHit` (l.2114), `updateEnemies` (l.2227), `memDrop` (l.1793), rift `pool`s in `ROOMS` (l.3041+), `HOUSES` pools (l.1842+), the `lucas_alone` mission draw and memory-beat hook (l.4276), `drawEnemyBody` (l.9172), `drawNote` (l.10164), `guidePage('enemies')` (l.7958), `viceIcon` |
| `tools/ch1_enemies_test.js` | **New:** per-enemy automated checks (spec §9) | — |
| `tools/forgotten_memory_test.js` | **New:** Option A checks; the fight is otherwise identical | — |
| `tools/run_tests.js` | Registers the two new tests (desk and phone) | — |
| `tools/_balance_sim.js` | Optional `FORCE` env to force-spawn a type; a 5-pack DPS run against the new types | — |
| `docs/CH1_ENEMY_*.md` | Implementation notes and results | — |
| `sw.js` | **No change.** Still one HTML file; the cache name is unchanged, as in every release so far | — |

**Not changed:**
- existing Vice stats and AI;
- story mission pools;
- Chapter 1 sequences;
- save format, apart from new claim keys (§5).

## 2. Stages (small, reviewable; each passes its gate before the next)
| # | Stage | Contents | Depends on | Gate |
|---|---|---|---|---|
| **S1** | **Scaffolding** (no new enemies spawn yet) | `VICE_INFO` entries for the five; `colorOf` colours; `memDrop` values; `rollElite` exclusions; a shared **`minLine()`** helper (`max(1, 2/scale)` world units) used by all new telegraphs and links; a persistent **"met" record** (`save.claims['vice:<id>']`) written where the "NEW VICE" note is raised | — | Full suite green; no behaviour change (snapshot of existing enemies' `makeEnemy` values identical) |
| **S2** | **Crumbkin** | `makeEnemy` and `updateEnemies` cases: walk, toss (crumb hazards via `tels`, then a 2 s hazard list), huddle warn (the merge rule), Warm Loaf and slam. Burn ×1.25, Wet slow. `drawEnemyBody` from the Phase 2 sheet. Group spawn counts as 1; cap 8 | S1 | `ch1_enemies_test` (Crumbkin) green; forced-spawn screenshot desktop and phone; no pool changes yet |
| **S3** | **Paperling** | Hover, darts (`bullets`), decoys (enemy entries with `decoy:1`: no reward, not counted toward kills), a single re-fold. Burn ×2; Wet skips the re-fold. Auto-aim may pick decoys; shots pass decoys unless one is the target | S1 | Tests green; check kill goals ignore decoys (Rift budgets, mission kills) |
| **S4** | **Candlewisp** | Drift, link warn, watch (**`e.shelterT`** read in `hitEnemy`: −35%), gutter (hit 2 s, stun, Stagger 60 → 3 s). Range 160 (96 when Wet). No bosses or Champion; no stacking. Link drawn with `minLine()` | S1 | Tests green; the −35% applies only to the linked ally |
| **S5** | **The Last Stand** | Guard (facing, 90°/s; frontal −70% checked in `playerHit` from the attack's source angle), cover (absorbs shots crossing the arc for allies within 60 px behind), rush warn (dust `tel` and a locked lane), rush, the 1.2 s open window, Stagger through the shield. No Shielded elite. Fragment roll at elite odds | S1 | Tests green; flanking verified on touch (manual) |
| **S6** | **The Humming Core** | A bar of 4 × 0.75 s; the floor ring drawn **under** enemies; calm (within 180 px: −25% speed, no new attacks); beat-3 hit delays the swell; the swell (a `tel`-like expanding wave, 8 damage, dodgeable); tempo up; turning every 4 bars. Drowsy and Slow stretch beats; stun skips a swell. At most 1 per fight. Audio hum optional (visuals complete without it) | S1 | Tests green; **sound-off playtest**; colour-blind check (shape cues) |
| **S7** | **The Memory That Carried Him (Option A)** | In `lucas_alone` only: an extra **non-combat prop** in the mission's draw layer (not an enemy: never targetable, never damaging, ignored by auto-aim and kill counts). At each existing memory beat (the l.4276 hook, unchanged otherwise) its object falls: bread → blanket corner → cup. At the finish, the cup rolls to Lucas before the existing hand-off | S1 | `forgotten_memory_test` proves kills, pool, lines, timing, rewards and the next scene are **identical**; visual check |
| **S8** | **Debut placements** | Append entries to the approved Rift pools and `HOUSES` pools (spec §8), plus spawn chances for the Humming Core. No story pools touched | S2–S6 | **Balance gate (below)**; drop Candlewisp from the Ward if needed |
| **S9** | **Guide and notes** | `drawNote` already shows "NEW VICE · name" using `VICE_INFO`, so the five get it automatically. Guide → Vices: the seven canon Vices stay listed as now; a second group, **"Others you’ve met"**, shows each new Vice **only once met**, with its memory line. Unmet ones are hidden. The heading stays true to canon: "The Seven Vices", plus the new section | S1, S8 | Guide test on desk and phone; spoiler check (unmet hidden) |
| **S10** | **Full QA and docs** | Full suite, the sim matrix, desktop and iPhone checks, doc updates | all | All checks below |

## 3. Balance gate (S8)
The comparison is `tools/_balance_sim.js` against the current release, with every Rift × Tier I–III × 4 parties (3 runs per cell).

| Check | Pass condition |
|---|---|
| Win rate per cell | Within ±1 win of the current release |
| Median clear time per cell | Within ±15% |
| **St. Lucia's Ward with Candlewisp** | Tier II–III win rates unchanged (±1), and the patients' minimum HP is not lower on average. **If either fails → remove Candlewisp from the Ward pool** (keep it in Fire, the Cloister and the Canals) |
| The Last Stand without Bram | Damage and Support parties at Earth Tier II–III within ±1 |
| Forced-spawn runs | Each new type force-spawned in its debut Rift: no softlocks, no unkillable states, and every attack has a telegraph |

If a cell fails, the fix order is:
1. caps or spawn weight;
2. timing (a longer telegraph);
3. HP.

The approved mechanics are never changed to pass the gate.

## 4. Risks and mitigations
| Risk | Where | Mitigation |
|---|---|---|
| Decoys counted as kills, or soaking Rift budgets | Paperling | Exclude `decoy` from `run.kills`, `room.spawned` and `memDrop`; covered by a test |
| A frontal-shield angle check feels wrong with auto-aim | The Last Stand | Use the **attack's source** position (`src`), not the hit point; tested with melee, ranged and area hits |
| Candlewisp shelter stacking with Shielded elites or other buffs | Candlewisp | Applied as a final multiplier in `hitEnemy`, capped; tested |
| The Humming Core's calm stalling AI states mid-attack | Humming Core | Only blocks *starting* an attack (checks `cd` gates), never interrupts one |
| Huddle merge in tight spaces (the Ward, Air tanks) | Crumbkin | Merge only if every member has line of sight in open floor; cap 8 |
| Visual clutter on phones | All | Floor rings drawn under enemies; `minLine()`; caps; the existing 6-text cap |
| Performance (more `tels` and rings) | All | Hazard dots pooled; at most 1 Humming Core; a profiling pass in the iPhone check |
| Forgotten Memory regressions | #14 A | No change to the mission's numbers or hooks except draw calls and three object drops; dedicated identical-behaviour test |
| Save compatibility | S1, S9 | Only new `claims` keys (`vice:<id>`). Old saves simply have none; tested against the 19 old-save fixtures |
| Canon ("the seven Vices") | S9 | The seven stay presented as the canon Vices; the new ones are grouped separately and named by their memories |

## 5. Save changes
- **New keys only:** `save.claims['vice:crumbkin' | 'vice:paperling' | 'vice:candlewisp' | 'vice:laststand' | 'vice:hummingcore']`, set on first encounter.
- **No migration needed.** All 19 old-save fixtures must load and show the Guide without errors.

## 6. Testing requirements
- **Automated (new):** `tools/ch1_enemies_test.js`, desk and phone, using the spec §9 rows. `tools/forgotten_memory_test.js` asserts these are identical:
  - kill goal and pool;
  - the three lines and their order;
  - slow-time and attack-buff values;
  - rewards;
  - the next scene.

  It also checks that the Memory prop is never targetable and never deals damage.
- **Regression:**
  - the full suite (about 92 runs);
  - the existing combat tests (`combat_tuning`, `balance_pass`);
  - `ch1_revised` (story fights unchanged);
  - `ch1_save_migration` and `save_protection`;
  - the Guide and menu tests.
- **Sim:** the balance gate (§3) plus a forced-spawn run per new type.
- **Visual:** in-game screenshots of each new Vice (all states) on desktop 1280 × 720 and iPhone landscape, compared with the Phase 2 sheets.

## 7. Desktop and iPhone validation (manual)
| Check | Desktop | iPhone (landscape, home-screen app) |
|---|---|---|
| Each new Vice readable at play scale; telegraphs clear | ✓ | ✓ (warning and link lines at least 2 px) |
| Paperling decoys don't make aim feel broken | mouse aim | touch facing |
| Flanking The Last Stand | ✓ | ✓ (joystick) |
| The Humming Core with **sound off** | ✓ | ✓ (silent switch) |
| Candlewisp link visible against grass, stone and the ward floor | ✓ | ✓ |
| Forgotten Memory: objects fall at the right moments; the cup rolls; the fight is otherwise identical | ✓ | ✓ |
| Guide → Vices: new entries appear only after meeting them | ✓ | ✓ |
| Frame rate in a busy Tier III Rift with new Vices | ✓ | ✓ (watch heat over a 20-minute session) |

**What needs you on a real iPhone:** the iPhone column. I can only emulate it.

## 8. Implementation order and effort
| Stage | Effort |
|---|---|
| S1 | small |
| S2–S6 | about one medium session each |
| S7 | small |
| S8 | medium (sim time) |
| S9 | small |
| S10 | medium |

- **Commits:** one per stage on `ch1-enemy-design` (or a fresh `ch1-enemies` branch from `main`).
- **Review stops:** you can review after S1, after S6 (all five enemies, not yet spawning anywhere) and after S8 (balance).
- **No push, merge or deploy** without your explicit go-ahead.

## 9. Approval needed
1. Approve this plan, or reorder or split stages.
2. Branch: continue on `ch1-enemy-design`, or cut `ch1-enemies` from `main`?
3. Confirm the Guide presentation: the canon seven plus "Others you’ve met".
4. A separate go-ahead to start **S1** (code changes).
