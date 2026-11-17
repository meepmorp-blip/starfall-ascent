# Gameplay Feel, Difficulty and Balance Audit

17 Nov 2026 · audit only, no game code changed.

## How this was measured
- **Played in the real game.** A scripted bot ran inside the real game build, at a fixed 60 fps timestep. It plays like a decent player who isn't an expert:
  - targets the nearest Vice (in the Ward, it prefers Vices near the patients);
  - keeps melee or ranged distance;
  - steps out of red circles;
  - uses Sun and Moon on cooldown and the Ultimate when full;
  - switches every 7 s, so Entrances fire.
  
  It does **not** dodge bullets or collect sparks.
- **Runs:** 7 Rifts × Tiers I–III × 4 parties × 2 runs (168 runs).
  - Party levels matched each tier's recommendation: 1, 6 and 12.
  - The parties:
    - **Balanced:** Kairos · Agnes · Bram
    - **Damage:** Lucas · Cassie · Agnes
    - **Support:** Naomi · Theo · Dess
    - **Tank:** Bram · Naomi · Cassie
- **St. Lucia's Ward, extra runs:** 3 runs per party per tier on the live build (`main`) and on the `combat-tuning` branch. A separate pass measured *who* is touching the patients.
- **Damage per second (DPS):** each character alone at Lv 6 for 20 s, against 1 dummy and against a pack of 5.
- **Screenshots:** Tier III Ward, Fire and Air, mid-fight (`tools/out/audit_*.png`).
- **Caveats:**
  - A bot isn't a human. Treat absolute win rates as rough and the *differences* between Rifts as the signal.
  - Today's Rift modifier was **"Vices heal if nobody hits them for 3 s"**, and it was active in every run.

## Key numbers (current code)
| System | Values |
|---|---|
| Tier scaling `RIFT_TIER` | HP ×1 / 1.6 / 2.4 · ATK ×1 / 1.25 / 1.5 · kill goal 12 / 16 / 20 · elite chance 8 / 18 / 30% · recommended level 1 / 6 / 12 |
| On-field cap | 4 + tier (5 / 6 / 7) |
| Level growth, Lv 1 → 12 | Kairos ATK 12 → 18.6 (+55%) · Lucas 16.5 → 24.7 · Agnes 13 → 18.7 · **Bram 6 → 7.3 (+22%)** · Naomi 7 → 8.9 · Theo 8 → 11.5 · Cassie 9 → 13 · Dess 8 → 10.2 |
| Enemy base HP (×1.15 × level scale × tier) | Hothead 34 · Gossip 18 (children 8) · Waxer 28 · Deadline 60 · Spotlight 26 · Devourer 42 · Collector 30 (speed 125, the fastest) |
| Enemy damage (× tier ATK) | Hothead 8 / charge 14 · Spotlight 12 · Deadline 10 · Gossip 5 |
| Ward (live) | Patients 100 HP; each Vice *touching* them deals `2.5 + tier`/s (3.5 / 4.5 / 5.5); 50% of spawns chase them, no limit |
| Ward (`combat-tuning`, not merged) | At most 3 chasers alive; 3.5 / 3.6 / 3.75 per Vice per second; at most 3 counted |
| Rewards | Elemental Rifts: 1 / 2 / 3 Fragments · Waves: 12.5 × waves × tier XP · Sparks: 3 × tier × sparks Stardust · Drills: 4 / 7 / 10 Mastery |

## Results by Rift (bot wins; median clear time)
| Rift | Tier I | Tier II | Tier III | Notes |
|---|---|---|---|---|
| **St. Lucia's Ward, live** | 11/12 · 21 s | **0/12** | **0/12** (patients gone in 10–19 s) | The objective fails long before the kill goal can be reached |
| **St. Lucia's Ward, branch** | 10/12 | 7/12 | **0/12** (15–34 s) | The branch fix helps Tier II only |
| Ash Lane Blaze (Fire) | 8/8 · 22 s | 8/8 · 33 s | 8/8 · 52 s | Healthy curve |
| Institute Overload (Air) | 8/8 · 27 s | 8/8 · 42 s | 7/8 · 72 s; Tank 155–205 s | Fair, but a slog for low-damage parties |
| Garrison Yard (Earth) | 8/8 · 29 s | 7/8 | **4/8**; Support 0/2, Damage 1/2 | Depends on party composition |
| Market Ring Waves (XP) | 8/8 · 66 s | 8/8 · 86 s | 8/8 · 105 s; Tank 132–174 s | Healthy, but long |
| Clocktower Drills (Mastery) | 8/8 · 26 s | 8/8 · 42 s | 8/8 · 62 s | Best-tuned Rift |
| Festival Sparks (Dust) | n/a | n/a | n/a | The bot doesn't collect sparks. Party damage taken climbs steeply: up to 3× party HP (healed back) for Support at Tier III |

Time-to-clear grows about ×2.3 from Tier I to Tier III, which is reasonable. The Ward is the only Rift where the *objective* fails faster than the fight can be won.

## Damage per second by character (Lv 6, alone, 20 s)
| | Kairos | Lucas | Agnes | Theo | Dess | Cassie | Bram | Naomi |
|---|---|---|---|---|---|---|---|---|
| 1 target | **109** | **94** | 39 | 32 | 25 | 23 | 16 | 14 |
| 5-pack (total) | 117 | 108 | **7** (?) | 58 | 65 | **114** | 22 | 29 |

---

# Confirmed problems (measured)

### 1. St. Lucia's Ward is effectively unwinnable at Tiers II–III · **Critical**
**Affects:** `rift_water`, mostly Tiers II–III.

**What happens now:** on the live build, the bot lost 24 of 24 runs at Tiers II–III, with every party. The patients fell in 10–19 s at Tier III. A normal Tier III Rift takes 45–75 s to clear.

**Why it feels unfair.** I checked the causes directly instead of assuming the HP was too low:
1. **Patient damage is a touch effect from *any* Vice.** The code is `Math.hypot(e,o) < o.r + e.r` for every enemy. **30–40% of the touch time came from Vices that weren't chasing the patients.** These were Vices chasing the player, or Gossip children, crossing a 64 px circle in the middle of the room. So guarding the patients pulls fights onto them: the correct play is punished.
2. **The patient budget doesn't grow with the fight.** Patients have 100 HP at every tier, but a Tier III fight is about 2.5× longer: enemy HP ×2.4 and a kill goal of 20 instead of 12. On live, damage *also* rose ×1.57.
3. **Chasers have no limit on live**, and the fastest Vices arrive first: Collectors (speed 125) and Gossips (108). A Collector reaches the centre in about 2 s.
4. **Nothing shows which Vices are chasing the patients.** The screenshot shows the patient bar buried under floating text ("HOARD DROPPED", stamps).
5. **The daily "regen" modifier** heals chasers that the player isn't hitting, which is every chaser while you fight elsewhere.

**Relevant values:** `o.hp=100`, `2.5+tier`, `e.rt=rand()<0.5`, `o.r=64`, `room.cap=4+tier`. The `combat-tuning` branch only addresses point 3 and part of point 2: Tier II 7/12, Tier III still 0/12.

**Recommended adjustment** (keeps the rule "protect the patients"):
- **a. Only chasers hurt the patients**, using a short attack wind-up of about 0.6 s with a visible swing instead of a touch aura. This removes the "passing through" damage and gives you a moment to intercept.
- **b. Mark chasers** with a thin tether or a small icon toward the patients, in the existing UI style.
- **c. Scale the budget with tier** without changing the "tiny bar" feel. For example, patients recover 1.5% per second when nothing is attacking them, or have 100 / 140 / 180 HP. Pick **one**; I'd use regen, because it rewards clearing chasers.
- **d. Keep the 3-chaser limit from the branch.** Gossip children shouldn't inherit chasing.

**Expected improvement:** a human who plays well wins Tier III about half to two-thirds of the time. Ignoring the patients still loses in about 15 s. Tiers I–II stay about where they are.

**Re-test before merging:** treat `combat-tuning`'s Ward change as a partial fix.

### 2. Garrison Yard (Earth) at Tier III locks out some parties · **High**
**What happens now:** the bot won 4 of 8 Tier III runs. Support lost 2 of 2 and Damage lost 1 of 2, while Balanced and Tank (both with Bram) won.

**Why:** 45% of Vices are Shielded, on top of 30% elites. A shield only breaks on a Stagger stun, and only Bram and charged attacks stagger well, so a party without them chips at 2.2× HP shielded elites under ×2.4 tier HP.

**Values:** `rollElite` gives Earth 0.45 Shielded; `shMax = hp*0.4`; Shielded elite HP ×2.2.

**Recommended adjustment:** keep the identity, but give shields a second way to break. For example, Sun and Moon skills deal 2× to shields, or the Shielded share drops to 35% at Tier III.

**Expected improvement:** Bram stays the best pick, not the only one.

### 3. Tier III becomes a slog for low-damage parties · **High**
**What happens now:** the Tank and Support parties took 130–205 s for Air and Waves at Tier III, against 50–100 s for Balanced. That's long fights with no tension.

**Why:** enemy HP ×2.4 grows faster than the party's ATK. From Lv 1 to 12, ATK only rises 22–55%; Bram +22% and Naomi +27%.

**Values:** `RIFT_TIER[3].hp = 2.4`; `ROLE_W` gives low ATK growth to tank and healer.

**Recommended adjustment:** pick one of these, not both:
- Tier III HP ×2.4 → ×2.1; or
- give tank and healer roles a little more ATK growth (about +40% at Lv 12).

Keep enemy ATK ×1.5, because the danger is what should define Tier III.

**Expected improvement:** Tier III is "think and survive", not "hit for three minutes".

### 4. Kairos and Lucas out-damage everyone 3–7× · **High**
**What happens now:** single-target DPS is Kairos 109 and Lucas 94, against Agnes 39 (the designated sniper), Cassie 23 and Bram 16. Kairos alone clears like a full party.

**Why:** Kairos's attack speed is 3.4 and Riptide is 300% × 2 every 5 s, plus Finishers. The other "damage" roles can't compete, so party choice narrows to Kairos + Lucas.

**Recommended adjustment:** keep both strong; **lift Agnes rather than nerf hard.**
- Riptide's second dash 300% → 220%, or cooldown 5 → 6 s.
- Agnes's tap 160% → 190%.

**Expected improvement:** a top-to-mid gap of about 2× instead of 3–7×, with every damage pick valid.

### 5. Agnes is much weaker against packs · **Medium (verify)**
**What happens now:** against 5 clustered dummies she did 7 DPS in total, compared with 39 on one target. That shouldn't happen: total damage should go *up* with more targets.

**Possible cause:** her auto-aim may keep re-picking an edge target, so piercing shots miss the pack. The harness may also be the cause; check by hand before tuning.

### 6. Floating text crowds the screen and covers objectives · **Medium**
**What happens now:**
- **Ward, Tier III (screenshot):** five overlapping texts ("FINISHER", "HOARD DROPPED", aspect and blessing stamps, the patient label) sit on the patient bar.
- **Fire:** damage numbers stack into "55 5 5 OOPS".
- **Status list:** the top-left list reaches 7 lines.

**Recommended adjustment:**
- Merge damage numbers on one target within about 0.25 s.
- Keep stamps and banners out of a box around the objective.
- Show at most about 6 floating texts at once.
- Fold the status lines into about 4.

**Expected improvement:** you can see the threat you need to react to. This matters most for objective Rifts.

### 7. The daily "regen" modifier punishes objective Rifts · **Medium**
**What happens now:** "Vices heal if nobody hits them for 3 s" is mild in kill Rifts. In the Ward and Air, the Vices you aren't hitting are exactly the ones you need to reach next.

**Recommended adjustment:** don't roll regen for `water` and `air`, or halve it there.

### 8. Ward rewards don't reflect its difficulty · **Low** (revisit after fix 1)
**What happens now:** the Ward pays the same 1 / 2 / 3 Fragments as easier Rifts. Once fix 1 lands, this is probably fair, so re-check then rather than now.

---

# Subjective recommendations (design opinion)
| # | Area | Observation | Suggestion | Priority |
|---|---|---|---|---|
| S1 | Hit feedback | Already good: impact sparks, a hit-stop on big hits, shake on heavies; the branch adds Entrance shake | Leave it; don't add more shake | Low |
| S2 | Enemy hit reactions | Small Vices flash but barely react to light hits | A 1–2 px push on basic hits for small Vices only | Low |
| S3 | Air Rift | Cores hatching an elite in 6 s is good pressure. At Tier III the slow parties drag on (see 3) | Fixed by 3 | — |
| S4 | Sparks Rift | Party damage taken climbs steeply with tier (Support takes about 3× party HP at Tier III, healed back) | Check with a human; maybe Spotlight damage ×0.85 there | Low |
| S5 | Drills Rift | The best-tuned Rift: clear, fair, and it rewards switching | Use it as the reference for the others | — |
| S6 | Targeting | Auto-aim weights facing direction, which can feel random (as Riptide did). The branch fixes Riptide | Consider the same nearest-first rule for Agnes and Lucas skill shots | Low |

---

# The five most important improvements, in order
1. **Rework St. Lucia's Ward properly** (Problem 1): only chasers hurt the patients, with a wind-up; chasers are marked; the patient budget scales by tier; keep the 3-chaser cap. Revise the `combat-tuning` Ward change into this before merging it.
2. **Combat readability around objectives** (Problem 6): merge damage numbers, keep text off objectives, cap floating text. This is cheap and helps every Rift.
3. **Tier III pacing** (Problem 3): trim Tier III HP *or* give tanks and healers more ATK growth, so Tier III is about danger rather than length.
4. **Break the Earth Rift's dependence on Bram** (Problem 2), and keep "regen" off objective Rifts (Problem 7).
5. **Damage spread** (Problems 4 and 5): a light trim to Kairos's Riptide and a lift for Agnes, after checking her multi-target behaviour by hand.

Each step is small and re-testable with the same harness. Stop after step 1 and play it yourself before tuning further.

---

# Implementation results (balance pass, branch `balance-pass`)
All five priorities were implemented. Full details are in `docs/GAMEPLAY_BALANCE_IMPLEMENTATION_REPORT.md`.

| Problem | Status | Result |
|---|---|---|
| 1. Ward | Done: chasers only, 0.6 s wind-up, interrupt, marker, 3-chaser cap, +1.5%/s regen, Gossip children don't chase | Tier II 0/12 → 12/12; Tier III 0/12 → 8/12. Ignoring the chasers still loses (about 22 s at Tier III) |
| 2. Earth | Done: skills ×2 against shields; 35% Shielded at Tier III | Tier III without Bram: Damage 4/4, Support 0/3 → 2/4 |
| 3. Tier III pacing | Done: option A, HP ×2.4 → ×2.1 | Slow-party clears 5–30% faster; Air with Tank still slow (open) |
| 4. Kairos and Lucas gap | Done: Riptide cooldown 5 → 6 s | Kairos single 146 → 125, group 529 → 436; Lucas unchanged |
| 5. Agnes against groups | The audit's figure was a harness artifact; she was buffed modestly anyway | Tap 160 → 180%, passes through 2; single 45 → 50 |
| 6. Text clutter | Done: merge, cap of 6, objective clearance, 4-line status | Checked in tests and screenshots |
| 7. Regen modifier | Done: off in the Ward and Air | |
| 8. Ward rewards | Not changed (fair now) | |

## Release follow-up
All the implementation report's open items are resolved: the Air snowball, Kairos's group damage, and Sparks testing (which found and fixed tier-blind sparks). The only remaining item is the all-support party at Tier III; it's left as intended composition difficulty. See `docs/GAMEPLAY_RELEASE_REPORT.md`.
