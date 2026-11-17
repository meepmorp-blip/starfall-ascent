# Gameplay Balance Pass · Implementation report

**Branch:** `balance-pass`, cut from `combat-tuning`, so it includes Riptide nearest-target and Entrance feedback.

**Not pushed, merged or deployed.** Story, flags, lore and save data are untouched, and no save fields were added.

**Reference:** `docs/GAMEPLAY_BALANCE_AUDIT.md`

## Changes (old → new)

### 1. St. Lucia's Ward (`rift_water`)
| What | Live (`main`) | Now |
|---|---|---|
| Who hurts patients | Any Vice touching the 64 px circle | **Only chasers** (`e.rt`) |
| How | Touch aura, `2.5 + tier` HP/s per Vice | **0.6 s wind-up** (`WARD_WIND`), then one hit of **5** (`WARD_HIT`, all tiers), then 1.2 s before the next (`WARD_CD`) |
| Interrupt | none | Hitting or stunning a chaser during the wind-up cancels it ("INTERRUPTED") |
| Chasers | 50% of spawns, no limit | 50%, **at most 3 alive** (`WARD_CHASE_MAX`) |
| Gossip children | Rolled 50% to chase | **Never chase** |
| Patient recovery | none | **+1.5%/s** after 1 s with no chaser attacking (`WARD_REGEN`) |
| Indicator | none | A red pip over each chaser, a faint dashed line to the patients, and a filling red ring during the wind-up |
| Patient HP, kill goal, spawns, Water Fragment drop | — | Unchanged |

If you ignore the chasers, the patients still fall: in about 40 s at Tier I and about 22 s at Tier III (in testing, the player stood in a corner).

### 2. Daily modifier
| | Old | New |
|---|---|---|
| "Vices heal if nobody hits them for 3 s" | On in every rift | **Off in the Ward and Institute Overload** (`MOD_SKIP_REGEN`). The banner and status line say "Vices heal (off in this rift)" |

### 3. Readability
| What | Old | New |
|---|---|---|
| Damage numbers | One per hit | Hits on the same Vice within 0.25 s **merge into one number** |
| Floating texts | Up to 50 | **At most 6** at once (`TEXT_MAX`); old damage numbers are dropped first. Dialogue bubbles aren't counted |
| Text near objectives | Could cover the patient bar or a ward | Text that would land on a ward, patient or cart is **moved to the side** (`objZones`) |
| Status list (top left) | Up to about 7 lines | **At most 4** (`STATUS_MAX`). The rift line comes first; extra effects fold into one compact line |
| Today's modifier text | Long | Shortened when off, so it fits the phone banner |

### 4. Screen shake
- **Entrance shake:** kept from `combat-tuning`, with the same per-character values. Bram's is the strongest, at 5 / 0.16 s.
- **On phones:** all shake is now scaled by screen size, to ×0.65 on a phone.
- **Settings:** the Screen Shake option and Reduce Motion still apply.
- **Ordinary attacks:** no shake added.

### 5. Tier III scaling (chosen: **option A**)
| | Old | New |
|---|---|---|
| Tier III enemy HP (`RIFT_TIER[3].hp`) | ×2.4 | **×2.1** |
| Tier III enemy ATK | ×1.5 | ×1.5 (unchanged) |

**Why A rather than B** (≈ +40% ATK for tanks and healers at Lv 12): in a side-by-side Tier III test (5 rifts × 4 parties × 2 runs), both shortened slow parties' clears similarly. Only A made the Earth support party win (0/2 → 2/2, against 0/2 with B). A also changes **rifts only**, while B would change every story fight. B wasn't applied.

### 6. Garrison Yard (Earth)
| | Old | New |
|---|---|---|
| Sun, Moon and Ultimate hits against shields | ×1 | **×2** (`SKILL_SHIELD_X`), with a "SHIELD BROKEN" pop |
| Shielded share | 45% | 45% at Tiers I–II, **35% at Tier III** (`EARTH_SHIELDED`) |
| Stagger break (Bram, charged attacks) | Unchanged | Unchanged |

### 7. Characters
| | Old | New | Why |
|---|---|---|---|
| Kairos · Riptide cooldown | 5 s | **6 s** | Tested against 2nd dash 300% → 220%. Cooldown 6: single 134 → 107, group 521 → 449. 220%: single 134 → 130. The cooldown does the job and keeps the 2nd dash's punch |
| Kairos · Riptide 2nd-dash window | 3 s (live) | 2.5 s (from `combat-tuning`) | |
| Kairos · Riptide aim | weighted by facing | nearest enemy, kept for the 2nd dash (from `combat-tuning`) | |
| Agnes · rifle tap | 160%, stops at the first Vice | **180%, passes through up to 2 Vices** (`AGNES_TAP`, `maxHits`) | See bug 1: her group damage was a test artifact. She is single-target by design, so this is a modest lift |
| Everyone else | — | unchanged | Supports and tanks deal low damage by role; their output is appropriate |

## Bugs found and fixed
1. **The audit's "Agnes 7 DPS vs a group" was a harness artifact.** Knockback pushed the test dummies out of the arena. With dummies held in place she does 45 single-target and 36 against a group. The harness was fixed (pinned dummies, 60 s windows).
2. **Patients took damage from Vices that weren't targeting them.** Fixed by the rework.
3. **Gossip children could become patient chasers.** Fixed.
4. **The phone banner overflowed its box** with the long modifier text. Fixed.

## Before → after simulations
The method is the same as the audit: a bot plays inside the real game build at a fixed timestep, at levels 1, 6 and 12, with 3 runs per cell. Each cell shows wins and the median clear time.

### Win rates (main → balance-pass)
| Rift | Party | Tier I | Tier II | Tier III |
|---|---|---|---|---|
| **Ward** | Balanced | 3/3 → 3/3 | **0/3 → 3/3** | **0/3 → 3/3** (36 s) |
| | Damage | 3/3 → 3/3 | **0/3 → 3/3** | **0/3 → 3/3** (30 s) |
| | Support | 3/3 → 3/3 | **0/3 → 3/3** | **0/3 → 1/3** |
| | Tank | 3/3 → 3/3 | **0/3 → 3/3** | **0/3 → 1/3** |
| **Earth** (Tier III with 35% Shielded, 4 runs) | Balanced | 3/3 → 3/3 | 3/3 → 3/3 | 3/3 66 s → 4/4 50 s |
| | Damage (no Bram) | 3/3 → 3/3 | 3/3 → 3/3 | 3/3 54 s → 4/4 49 s |
| | Support (no Bram) | 3/3 → 3/3 | 3/3 → 3/3 | **0/3 → 2/4** |
| | Tank | 3/3 → 3/3 | 3/3 → 3/3 | 2/3 92 s → 3/4 100 s |
| Fire | all | 12/12 → 12/12 | 12/12 → 12/12 | 12/12 → 12/12 |
| Air | all | 12/12 → 12/12 | 12/12 → 12/12 | 9/12 → 10/12 |
| Waves (XP) | all | 12/12 → 12/12 | 12/12 → 12/12 | 12/12 → 12/12 |
| Drills | all | 12/12 → 12/12 | 12/12 → 12/12 | 12/12 → 12/12 |
| Sparks | — | the bot doesn't collect sparks (not measurable) | | |

A separate 4-runs-per-cell Ward check gave Tier II 16/16 and Tier III 13/16. The patients' lowest HP was often 5–20%, so it's still tense.

### Tier III clear times (median, main → new)
| Party | Air | Earth | Fire | Waves | Drills |
|---|---|---|---|---|---|
| Balanced | 52 → 54 s | 66 → 50 s | 42 → 43 s | 89 → 86 s | 64 → 56 s |
| Damage | 75 → 56 s | 54 → 49 s | 37 → 37 s | 89 → 84 s | 46 → 50 s |
| Support | 80 → 78 s | — → 52 s | 57 → 42 s | 116 → 102 s | 61 → 54 s |
| Tank | 170 → 165 s | 92 → 100 s | 78 → 69 s | 171 → 124 s | 64 → 56 s |

Tier I and II times are unchanged within noise.

### Character damage per second (Lv 6, alone, 60 s, dummies held in place)
| | Kairos | Lucas | Agnes | Theo | Dess | Cassie | Bram | Naomi |
|---|---|---|---|---|---|---|---|---|
| 1 target, before | 146 | 117 | 45 | 42 | 27 | 25 | 21 | 15 |
| 1 target, after | **125** | 116 | **50** | 42 | 27 | 25 | 21 | 15 |
| 5-pack total, before | 529 | 118 | 36 | 73 | 32 | 125 | 72 | 32 |
| 5-pack total, after | **436** | 112 | **40** | 73 | 33 | 125 | 72 | 32 |

The top-to-Agnes gap went from 3.2× to 2.5×. Kairos is still the strongest; Lucas is unchanged.

## Tests
- `tools/balance_pass_test.js` (new): **18/18**. It covers:
  - Ward rules: non-chasers do no damage, the wind-up, interrupting, regen, Gossip children, the 3-chaser cap;
  - ignoring the chasers still loses at Tiers I and III;
  - the modifier is off in the Ward and on elsewhere;
  - damage-number merging, the 6-text cap, objective clearance;
  - Earth shields, Agnes's pierce, the Riptide cooldown and text;
  - desktop and phone screenshots.
- `tools/combat_tuning_test.js`: Riptide targeting, Entrances on desktop and phone, and every rift at every tier.
- **Full suite:** see the end of this report.

## Remaining limitations
- **The bot isn't a human.** It doesn't dodge bullets, so all-support and all-tank parties lose more than a real player would. Absolute win rates are rough.
- **Air at Tier III with the Tank party** is still about 165 s. Hatched cores add elites, which snowballs for slow parties. Option B (tank and healer ATK growth) would help, but it changes all content; this is left for a decision.
- **Kairos against groups** (436 total) is still far above everyone. His basic-attack arcs are the main source, and I didn't change them, to keep his identity.
- **Sparks (Dust) rift** isn't measured by the bot.
- **Visual changes** (chaser marker, merged numbers, status folding) were checked with screenshots, not in a long human session.

## Recommendations for future balancing
1. Run a human playtest on the Ward at Tier III with a non-Kairos party.
2. If Tank and Support parties still feel slow, try option B for tanks only (Bram), not healers.
3. Watch Kairos's group damage. If he still flattens everything, trim the finisher arc radius rather than his numbers.
4. Teach the bot to collect sparks so the Dust rift can be measured.

## Full suite
- **Full suite:** 88 runs and 2,735 checks with 4 running at a time; 87 runs passed.
- **The one failure:** `meridian` desk ("pinning the roster advances the quest") failed under parallel load. It passed when rerun alone: 2 runs, 82/82.
- **Save compatibility:** the save-protection and Chapter 1 save-migration tests pass, and no save fields were added.
