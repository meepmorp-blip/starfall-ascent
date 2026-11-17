# Gameplay Balance · Release report

**Branch:** `balance-pass` → `main`

This covers `combat-tuning` (Riptide targeting, Entrance feedback), the balance pass (`8d569c9`), and the final fixes below.

**Not changed:** story, flags, lore, Chapter 1, saves and progression. No save fields were added.

## All changes and final values
| Area | Before (live) | Final |
|---|---|---|
| **Ward:** who hurts patients | Any Vice touching them, `2.5 + tier` HP/s each | Only chasers: 0.6 s wind-up → 5 damage, then 1.2 s gap |
| **Ward:** stopping attacks | — | Hitting or stunning a chaser cancels its wind-up. **New:** a chaser can't wind up while the active character stands against it (body-block, `WARD_GUARD = 22`) |
| **Ward:** chasers | 50% of spawns, no limit; Gossip children too | At most 3; Gossip children never chase |
| **Ward:** recovery | none | +1.5%/s after 1 s without attacks |
| **Ward:** readability | none | Red pip, dashed line, and a wind-up ring on each chaser |
| **Daily "Vices heal"** | Every rift | Off in the Ward and Air (the game says so) |
| **Damage numbers** | One per hit | Merged per Vice within 0.25 s |
| **Floating text** | Up to 50, could cover objectives | At most 6; moved off objectives |
| **Status list** | Up to about 7 lines | At most 4 |
| **Screen shake** | Same pixels on every screen | ×0.65 on phones; Entrance shake tuned per character (1.5–5) |
| **Tier III enemy HP** | ×2.4 | ×2.1 (ATK still ×1.5) |
| **Earth:** shields | Only stagger breaks them; 45% Shielded | Skills deal ×2 to shields; 35% Shielded at Tier III |
| **Air:** hatched elites | Each adds +1 to the kill goal, no limit; cores keep coming | **New:** at most +4 to the goal (`AIR_HATCH_MAX`); no new cores while 2 hatched elites are alive (`AIR_HATCH_LIVE`) |
| **Sparks:** by tier | Same at every tier (4.5 s life, 0.9 s spawn, 130 px away) | **New:** life 4.5 / 3.8 / 3.2 s · spawn every 0.9 / 1.1 / 1.3 s · at least 130 / 170 / 210 px away |
| **Kairos:** Riptide | Cooldown 5 s; 3 s window; facing-based aim | Cooldown 6 s; 2.5 s window; nearest enemy, kept for the 2nd dash |
| **Kairos:** basic swings | Every enemy in the arc takes full damage | **New:** the 2 nearest take full damage, the rest 50% (`KAI_CLEAVE`). All are still hit and knocked back |
| **Agnes:** rifle tap | 160%, stops at the first enemy | 180%, passes through 2 |

## Why each final fix
- **Air snowball.** A slow party can't break cores in 6 s. Every hatch added a 2.2× HP elite *and* raised the goal, while cores kept spawning, so the fight could grow without end.
  - Now the goal can grow by at most 4.
  - New cores pause while 2 hatched elites are alive.
  - Hatches still happen, still spawn elites, and still need attention.
- **Kairos against groups.** Most of his group damage came from basic arcs and finisher circles hitting every enemy at full damage, plus his 3.4 attack speed. A soft cleave keeps the feel and leaves single-target damage untouched.
- **Sparks.** With a bot that collects sparks, every tier finished in about 20 s with almost no damage taken, while Tier III pays 3× the Stardust. The rift ignored tier, so the sparks now scale by tier.
- **Ward body-block.** Low-damage parties couldn't interrupt in time. Standing on a chaser now protects the patients, which rewards positioning and tanks.

## Simulations
A bot plays inside the real game build with a fixed timestep, at levels 1, 6 and 12, with 3 runs per cell. It now **collects sparks**, **sidesteps bullets** (for the objective re-runs), and **rushes a chaser that is winding up**.

### Win rates: live (`main` before) → release
| Rift | Party | Tier I | Tier II | Tier III |
|---|---|---|---|---|
| Ward | Balanced | 3/3 → 3/3 | 0/3 → 3/3 | 0/3 → 3/3 (4/4 with an attentive bot) |
| | Damage | 3/3 → 3/3 | 0/3 → 3/3 | 0/3 → 3/3 (3/4) |
| | Support | 3/3 → 3/3 | 0/3 → 3/3 | 0/3 → 0/3 (1/4) |
| | Tank | 3/3 → 3/3 | 0/3 → 3/3 | 0/3 → 2/3 (3/4) |
| Earth | Balanced / Damage | 6/6 → 6/6 | 6/6 → 6/6 | 6/6 → 6/6 (faster: 66 → 44 s, 54 → 43 s) |
| | Support (no Bram) | 3/3 → 3/3 | 3/3 → 2/3 | 0/3 → 0/3 (1/3 with dodging) |
| | Tank | 3/3 → 3/3 | 3/3 → 3/3 | 2/3 → 3/3 |
| Air | all | 12/12 → 12/12 | 12/12 → 12/12 | 9/12 → 11/12 (12/12 with dodging) |
| Fire, Waves, Drills | all | 36/36 → 36/36 | 36/36 → 36/36 | 36/36 → 36/36 |
| Sparks | all | 12/12, about 21 s | 12/12, about 26 s | 12/12, about 31 s (before: about 21 s at every tier) |

### Tier III clear times, median (live → release)
| Party | Air | Earth | Fire | Waves | Drills | Ward |
|---|---|---|---|---|---|---|
| Balanced | 52 → 50 s | 66 → 44 s | 42 → 39 s | 89 → 91 s | 64 → 57 s | lost → 38 s |
| Damage | 75 → 46 s | 54 → 43 s | 37 → 36 s | 89 → 80 s | 46 → 43 s | lost → 30 s |
| Support | 80 → 68 s | lost → lost | 57 → 62 s | 116 → 108 s | 61 → 56 s | lost → lost |
| Tank | **170 → 108 s** | 92 → 91 s | 78 → 88 s | **171 → 132 s** | 64 → 48 s | lost → 49 s |

### Character damage per second (Lv 6, alone, 60 s, dummies held in place)
| | Kairos | Lucas | Agnes | Theo | Dess | Cassie | Bram | Naomi |
|---|---|---|---|---|---|---|---|---|
| 1 target, live | 146 | 117 | 45 | 42 | 27 | 25 | 21 | 15 |
| 1 target, release | 125 | 107–116 | 50 | 42 | 28 | 25 | 21 | 15 |
| 5-pack, live | 529 | 118 | 36 | 73 | 32 | 125 | 72 | 32 |
| 5-pack, release | **361** | 118 | 40 | 73 | 33 | 125 | 72 | 32 |

Lucas didn't change; his range is run-to-run noise.

## Tests
**Full suite:** 88 runs, 2,753 checks; 87 runs passed, and the one load-timing flake passed when rerun alone (details in the implementation report).
- **`balance_pass_test` (22 checks).** It covers:
  - Ward rules and that ignoring the chasers still loses;
  - the modifier;
  - text merge and cap, and objective clearance;
  - Earth shields, Agnes's pierce, the Riptide cooldown;
  - the Kairos cleave, the Air hatch limit, spark lifetimes.
- **`combat_tuning_test` (46 checks).** It covers:
  - Riptide targeting, including when the target dies;
  - all 8 Entrances on desktop and phone;
  - every rift at every tier.
- **Screenshots** (Tier III Ward, Fire and Air; phone and desktop Ward) were checked by eye: markers, wind-up ring, "INTERRUPTED", merged numbers, and the phone banner fitting.

## Known limitations
- **An all-support party (Naomi, Theo, Dess) at Tier III** still usually loses the Ward and Earth. It has almost no damage. This is left as intended composition difficulty: every other party wins, and the bot is pessimistic.
- **The bot isn't a human.** It tests rules and numbers, not feel. A real-player check on iPhone is the next step.
- **Kairos is still the top damage dealer**, by design as the protagonist (single target 125 against Lucas about 110).
