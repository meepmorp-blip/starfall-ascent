# STARFALL: THE ASCENT — Full QA Audit

Build audited: `index.html` at commit `bab3e74` (12 Nov 2026), 5,791 lines, ~513 KB, single file, vanilla JS + Canvas 2D.
Auditor scope: code review, automated browser playtesting through the game's own test hook (`window.__sf`), damage simulations, lore cross-check against `docs/Starfall_Lore_Bible_v1.pdf` and `docs/Chapter1_Script.md`.
No game files were modified during this audit.

> **Roster note.** The audit brief lists five characters (Kairos, Seren, Elias, Dr. Sophia Arden, Cyrus Crane). That is the *old* cast. The current build ships eight: **Kairos, Ines, Bram, Noemi, Theo, Lucan, Cass, Dess**. Seren/Elias/Sophia/Cyrus survive only as dead legacy code. This report audits the eight that actually ship.

---

## 0. Fix status (updated 12 Nov 2026)

| Item | Status | Commit | Verified |
|---|---|---|---|
| P0-1 Lucan Lance nerf | Done (0.9 s charge, 320%) | 653200c | Lance 94 → 54 DPS; boss 31.5 s → 54.6 s |
| P0-2 Bram knockback | Done (300 → 90) | 653200c | 8.2 DPS vs a chasing enemy (BUG-04's 1.7 figure came from a stationary dummy and overstated it) |
| P0-3 Save hardening | Done | 653200c | Corrupt save copied to backup key + home-screen warning |
| P0-4 Buff leak | Done | 653200c | All timed buffs 0 in next room |
| P1-1 Story progression | Done | 33768e7 | Missions give XP/Stardust; chapter clear +200 XP all 8, 100 Stardust, 2 Fragments |
| P1-2 Scene-key saves | Done | 33768e7 | Resume finds the scene even with a wrong index |
| P1-3 Additive damage buckets | Done | 33768e7 | Bonus and vulnerability buckets |
| P1-4 Lore (Mercy, life B) | Done | faec18c, 29a0bd1 | See `docs/Lore_Updates_v1.1.md` |
| P1-5 Text pass | Done | 33768e7 | Guide, Training, README, dossiers |
| P1-6 Kairos Shell | Done (120% pulse on cast) | 33768e7 | |
| P1-7 Battle farm | Done (rewards scale with starting Blessings; Battle boss 1 Fragment) | 33768e7 | Code only |
| P2-1 Ultimates too rare | Done (Pneuma scales with hit size up to 3×, +2/s in combat) | this sprint | First Ultimate at 20–30 s for every character; Lucan via Lance ~15 s |
| P2-2 Level scaling | Done (enemy + boss HP ×(1 + 4.5% per avg party level above 1)) | this sprint | Boss 2,990 HP at avg Lv ~4; Kairos kills in 45.8 s |
| P2-3 Cass burn | Done (0.7 → 0.5 × ATK per tick) | this sprint | Cass 118 DPS on 3 targets vs Kairos 248 |
| P2-5 Burn sticks | Done (reset when burn ends) | this sprint | Code only |
| P2-6 Exposition | Done (Mercy reveal removed; Wall/Aster talk moved to the camp) | faec18c, this sprint | Full chapter runs with no errors |
| P2-7 Dodge spam | Done (cooldown 0.55 → 0.8 s) | this sprint | Code only |
| P3-1 Debug hooks | Done (only on localhost or `?debug`) | this sprint | |
| P3-4 Element text | Done | 33768e7 | |
| P2-4 Blessings vs kits | Done (each Blessing feeds one play style: Mars burn, Mercury crit, Jupiter Ultimates, Saturn shields, Venus healing, Uranus switching, Neptune debuffs/summons) | this sprint | Lv 3 measured: ignite 29%, crit 14.7%, shield +46%, heal +45%, mark 8→14 s, Ultimate cuts cooldowns 6 s, Entrance 3 s faster |
| P2-8 iPhone playtest | **Open (you)** | | |
| P3-2 Dead legacy code | Done (old Vigil story mode, checkpoints, story previews, old cast speakers, unused helpers: −26 KB, −257 lines) | this sprint | Home, Builds, Guide, Battle, Climb, death, pause, Training and full Chapter 1 run with no errors |
| P3-3 Reduce-effects toggle | Done (Pause → Reduce effects: ~65% fewer particles, softer zones, small hit rings off, no hit-stop; saved) | this sprint | Heavy fight 685 → 473 ms per 90 frames (−31%) |
| P3-5 Rooftop/lab art | **Open** | | |
| P3-6 Choice callbacks | **Open** | | |

---

## 1. Executive Summary

**Overall health: Playable prototype, stable, but unbalanced and split into two games that don't talk to each other.**

- **Stability is good.** Across every automated session (full Chapter 1, full Climb run, all 8 kits, boss fights, 120 s stress runs with 40+ enemies) there were **zero runtime JavaScript errors**.
- **Combat identity is broken at the top.** Kairos is billed as the main DPS, but Lucan holding his charged Lance does **94 DPS single-target vs Kairos's 55**, and kills the boss in **31.5 s vs 55.6 s**. Cass (a "burn healer") does **121 DPS on 3 targets**, close to Kairos's 166.
- **Two disconnected modes.** Story (Chapter 1, 52 steps, ~40 min) gives **no XP, no Fragments, no Stardust**. Battle/Climb gives all progression but has no story context, and still carries the old "Vigil/Barnabas" framing. Story difficulty silently depends on how much you farmed in Battle.
- **Narrative is the strongest asset** after the v3 rewrite (cold open, Kairos's voice, Lucan arc, Marr), but it **contradicts the Lore Bible on the Mercy**, repeats its own reveals, and still front-loads exposition in the hospital.
- **Lots of stale text.** Guide, Training, README and the Lore Bible still describe systems and characters that no longer exist.

**Biggest strengths:** stable engine; strong moment-to-moment feel (perfect dodge slow-mo, entrances, Aspect combos); readable telegraphs; boss has real phases and forces dodging; Chapter 1 is a complete, playable story arc with missions of varied types.

**Biggest weaknesses:** DPS hierarchy inverted; knockback fights its own melee range (Bram); multiplicative buff stacking with no ceiling; progression split between modes; stale/contradictory text everywhere; save system fragile (silent reset on corruption, index-based story saves).

**Verdict:** Fix balance and the foundations (progression link, saves, stale text) before writing Chapter 2.

---

## 2. Testing Coverage

### Methods
| Method | What |
|---|---|
| Code review | Every system section of `index.html`; kits, damage pipeline, enemies, boss, rooms, saves, story sequencer |
| Automated play (browser) | Local server, driven by `window.__sf` hooks + synthetic keyboard events (J/Q/E/R/Space/1-3) |
| DPS simulation | Each character, 20 s, 1 and 3 targets, real cooldowns and real attack timing; bench allies disabled to isolate the character |
| Boss simulation | Horaios TTK with god mode (damage only) and without (survival) |
| Full-flow runs | Chapter 1 end-to-end (all 52 steps, all choices, Horaios loss); a full Climb (6 stops + boss) |
| Stress | 40+ enemies, 120 s of continuous combat with swapping/skills; timed ticks and frames |
| Lore check | Script vs `Starfall_Lore_Bible_v1.pdf` vs `Chapter1_Script.md` |

### Results
| Feature | Inspected | Actually exercised | Result |
|---|---|---|---|
| New game / Ch1 start / resume | ✔ | ✔ | Works; resumes at saved step |
| Movement, attack, charged attack | ✔ | ✔ (synthetic keys) | Works |
| Dodge / perfect dodge | ✔ | ✔ dodge; perfect dodge code-reviewed only | Works |
| Sun/Moon skills, Aspect combos | ✔ | ✔ all 8 kits | Fire, no errors |
| Switching + Entrances | ✔ | ✔ | Works |
| Pneuma + Ultimates | ✔ | ✔ all 8 | Works; charge is slow (see §4) |
| Enemies (7 Vices + elites) | ✔ | ✔ | Work |
| Horaios (3 phases) | ✔ | ✔ | Works; forced-loss variant works |
| Blessings | ✔ | ✔ (picked in Climb) | Work |
| Trials (Mercury, Mars) | ✔ | ✔ Mars; Mercury code-only | Mars works |
| Lethe Spring | ✔ | ✗ (not rolled in test run) | Code-reviewed only |
| Recollection (levels) | ✔ | ✔ (XP awarded by Battle runs) | Works |
| Star Fragments / chests | ✔ | Partly (boss drops) | Works |
| Houses & rules | ✔ | ✔ 5 of 6 houses entered | Work |
| Save/load | ✔ | ✔ normal path; corruption path code-only | See BUG-02 |
| Game over / retry | ✔ | ✔ | Works |
| Story missions (walk, frozen, escort, defense, stealth, split, fight, rescue, loss) | ✔ | ✔ (auto-won) | Complete without errors |
| Tutorial (story 9 steps) | ✔ | ✔ every step | Works |

### Not tested / limitations
- **No real hands-on play.** Inputs were synthetic; "feel", timing windows and difficulty for a human were judged from numbers, not play.
- **No iPhone / touch testing.** Mobile layout, touch buttons, Safari audio, PWA install were **not** verified.
- **Screenshots unreliable**: the browser pane was hidden, so visual review relied on canvas captures of backgrounds and cutscene frames, not the full HUD in motion.
- Mission wins were forced with `__sf.win()`; mission *difficulty* was not measured except the first-fight tutorial and boss.
- Lethe and Trial of Mercury were not rolled in the automated Climb; reviewed in code only.

---

## 3. Critical Bugs

No crash bugs were found. Everything below is **confirmed by code**, and where marked, **confirmed in play**.

| ID | Severity | Summary |
|---|---|---|
| BUG-01 | High | Team buffs leak into the next room |
| BUG-02 | High | Corrupt save is silently replaced → total progress loss |
| BUG-03 | High | Story saves are a raw step index; script edits will misplace players |
| BUG-04 | High | Bram's knockback pushes enemies out of his own reach (measured) |
| BUG-05 | Medium | Cass burn damage "sticks" to enemies forever |
| BUG-06 | Medium | Story mode awards no progression |
| BUG-07 | Medium | Battle mode farm: Lv 3 Blessings + full rewards |
| BUG-08 | Low | Guide/Training/README describe removed systems |
| BUG-09 | Low | Debug/cheat hooks ship in production |

**BUG-01 · Team buffs leak between rooms**
- Repro: In Climb, cast Ines Killzone / Theo Overclock / Dess Tidal Focus / Noemi Triage near the end of a district, then pick a door.
- Expected: buffs end with the room.
- Actual: `resetField()` (line ~2283) and `finishRoom()` (line ~2346) clear `shield, timeStop, tailwind, benedT…` but **not** `killzone, overclock, atkBuffT/atkBuffV, stand, stim, dessDmgT, cdmgT, crT`. They tick down during the "between" screen time and continue in the next room.
- Fix: reset all timed team fields in `resetField()` from one list (the same list `updateTeam` decrements).

**BUG-02 · Silent save wipe on corruption**
- Repro: put invalid JSON in `localStorage['starfall-ascent-save']` (or `{"chars":null}`), reload, play.
- Actual: `loadSave()` (line ~957) catches the parse error and returns a fresh save; the next `persist()` overwrites the corrupt blob. All levels/fragments are gone with no warning. `persist()` also swallows write errors (Safari private mode / quota), so progress can silently fail to save.
- Fix: on parse failure, copy the raw blob to a backup key and show a notice; add a `v` version field; show a one-time warning if `persist()` throws.

**BUG-03 · Index-based story save**
- `runSeq` saves `save.ch1b = {i, roster, flags}` where `i` is the position in `CH1_SEQ`. v2→v3 kept 52 steps by luck. Adding or removing one step will resume players in the wrong scene with the wrong roster.
- Fix: save the nearest `sc` label (scene id) + an explicit step key; resume by key, falling back to the scene start.

**BUG-04 · Bram can't hit what he shoves (confirmed in play)**
- `bram.tap`: range 54, `knock:300`. Dummy test: **1.7 DPS** when the target is free to fly back, **11.8 DPS** when pinned in place. After the first bash the enemy is out of range.
- Same effect, smaller, on Kairos/Cass melee (Kairos 26.8 → 55.4 DPS free vs pinned).
- Fix: lower basic-hit knockback (e.g. Bram 300 → 90 on hits 1–2, keep 300 on the finisher/hold); or add a short forward step on Bram's bash.

**BUG-05 · Burn damage sticks**
- `playerHit`: `t.burnDmg = max(t.burnDmg, src is Cass ? atk*0.7 : 3)`. Never reset when the burn ends. Any later burn from any source (e.g. the Fire Fragment trait *Spark*) ticks at Cass's value.
- Fix: clear `burnDmg` when `burnT` reaches 0, or store burn per source.

**BUG-06 · Story gives nothing back**
- `awardRun()` is only called from Battle/Climb result screens. Finishing Chapter 1 (~40 min, 13 missions) grants **0 XP, 0 Fragments, 0 Stardust**. Meanwhile `makeMember()` scales story characters by `save.chars[id].lvl`, so story difficulty depends on Battle farming.
- Fix: award XP per mission (and a chapter-clear bonus) through the same `awardRun` path; or fix story character levels per mission.

**BUG-07 · Reward farm in Battle**
- Battle → Archon Gate with "All Lv 3" Blessings: XP = 15 + 60 + kills×1.5 and **2 guaranteed Fragments** per boss kill (`bossDie → gainFrag ×2`). Test: Lucan party kills the boss in ~31 s.
- Fix: scale or disable rewards when starting Blessings > 0; or reduce Battle-mode boss drops to 1 / chance-based.

**BUG-08 · Stale text (confirmed by grep)**
- Guide: "Chapter 1 · Vigil. A fixed party… boss Horaios at the end" (now a forced loss with 8 characters); "spirits stay when you switch" (Dess no longer has spirits); "arrows, shields, a healing drone"; "every 3rd or 4th hit is a finisher… Kairos dashes into the enemy" (5th hit, spin).
- Training room: "Barnabas runs you through the basics" (removed character).
- Title/README: "100 years after the first Starfall… the last city" vs Story: "last free city of Aster".
- Fix: one text pass (see Sprint).

**BUG-09 · Cheats in production**
- `window.__sf` exposes `win`, `god`, `kill`, `pn`, `battle`, `boss` etc. on the live site.
- Fix: only attach when `location.hostname==='localhost'` or a `?debug` flag.

---

## 4. Combat Balance Report

### 4.1 Base stats (Lv 1)
| Char | Role | HP | ATK | DEF | Atk/s | Speed | Range |
|---|---|---|---|---|---|---|---|
| Kairos | Main DPS | 100 | 12 | 12% | 3.4 | 172 | Close |
| Ines | Sub DPS | 85 | 13 | 8% | 1.25 | 150 | Long |
| Bram | Shielder | 170 | 6 | 32% | 1.8 | 132 | Close |
| Noemi | Healer | 90 | 7 | 15% | 2.4 | 152 | Mid |
| Theo | Sub DPS | 88 | 8 | 12% | 2.6 | 155 | Mid |
| Lucan | DPS (long) | 92 | 12 | 12% | 1.4 | 160 | Long |
| Cass | Burn / heal | 105 | 9 | 18% | 2.0 | 156 | Mid |
| Dess | Support | 110 | 8 | 20% | 2.4 | 150 | Mid |

Level scaling (`makeMember`): HP ×(1+w.hp·(L−1)), ATK ×(1+w.atk·(L−1)); DPS role w.atk = 5%/lvl → Lv 20 ≈ ×1.95 ATK, then ×1.1 at Lv 20.

### 4.2 Damage formula (`playerHit`, line ~1517)
```
final = base × roomMult × spotlight × o.mult × Spotted(1.15) × Ana(1.15) × atkBuff(1+v)
      × DessFocus(1.2) × DessTeam(1.05) × DessMark(1.1) × Soak(1.1) × CassBurning(1.1)
      × TheoTurret(1.2) × starFx × KairosUlt(1.35) × Drowsy(1.15/1.25) × Lucan far(1.15)
      × Mars stacks(≤1.9) × crit(2 + 0.4 Dess + 0.5 Lucan) × fragment dmgPct × heat
```
Every term is **multiplicative**, none capped.

**Worst-case stack (reachable in one fight):** Spotlight 2 × Resonance 1.2 × Spotted 1.15 × Soak 1.1 × Noemi 1.25 × Dess 1.2 × 1.05 × Mark 1.1 × Cass 1.1 ≈ **5.8×**, × crit 2.9 = **16.8×**, × Mars Lv3 basics (1.9) ≈ **32×**. A Lucan Lance (4.4 × 12 ATK = 52.8) becomes ~1,690 damage — 65% of Horaios's 2,600 HP in one hit.
→ Not a bug, but there is no design ceiling. Recommend grouping buffs into additive buckets ("damage bonus %" summed, then one multiplier).

### 4.3 Measured DPS (20 s, real cooldowns, bench disabled, targets pinned in place)
| Char | 1 target | 3 targets | Notes |
|---|---|---|---|
| **Lucan (hold Lance)** | **94.1** | 115.8 | Spamming hold. No cost, 0.45 s recovery |
| Kairos (tap) | 55.4 | **166.2** | Real AoE king |
| Theo | 45.7 | 45.7 | Auto-aim pistol; no AoE in sim |
| Lucan (tap) | 41.4 | 46.5 | |
| Cass | 40.8 | 121.4 | Burns + wide swings |
| Ines | 32.6 | 36.2 | Before her bench sniping |
| Noemi | 13.4 | — | (unpinned) as intended |
| Dess | 12.3 | 12.9 | As intended |
| Bram | 11.8 | 35.5 | 1.7 if not pinned (BUG-04) |

Boss (Horaios 2,600 HP), god mode, standing under him:
| Party lead | Time to kill |
|---|---|
| Lucan, hold Lance only | **31.5 s** |
| Kairos, tap + skills | 55.6 s |
| Bram (+Dess, Noemi) | 120 s, boss at 44% |

Survival: Kairos/Lucan/Noemi standing still under Horaios, no dodging → party wiped at **59 s**, boss at 31%. Boss demands dodging — good.

### 4.4 Character findings
- **Lucan is the best DPS in the game, by a lot.** Hold = 4.4× ATK, pierce, auto-target, no resource, 0.45 s recovery. It out-damages Kairos single-target by 70% and makes him the obvious boss pick. *Fix:* 1.0 s charge or a cooldown/"Focus" meter on Lance; or drop to ~3.0×.
- **Kairos only leads on groups.** His identity ("main DPS, strong skills") holds only on 3+ targets. Shell (moon) does **0 damage** unless an enemy hits him during 1.2 s — against ranged or slow enemies it's dead weight.
- **Cass is a second DPS, not a support.** 121 DPS on 3 targets with burns + 10% team mitigation + heals. Either trim burn (0.7 → 0.45 × ATK) or accept her as a DPS and rename her role.
- **Theo** is fine single-target (45.7) and gets +20% with a turret up; his Big Idea mech remains the strongest ult in raw damage (423 in 5 s in earlier tests). Watch it.
- **Bram** is effectively zero damage until BUG-04 is fixed.
- **Ines** is balanced as a sub-DPS; her value is the +15% Spotted and bench sniping. OK.
- **Noemi/Dess** sit where they should (12–13 DPS).
- **Ultimates are rare.** Pneuma after 20 s of combat: Kairos 69, Bram 43, Dess 33, Ines 22, Lucan 23. Most characters fire an Ultimate once per district at best; ranged characters almost never. Pneuma gain is per *hit*, which punishes slow, heavy attackers (Ines, Lucan). Consider gain per *damage* or a flat trickle.

### 4.5 Enemies
Base HP × 1.15 × room scale (room 1 = 0.82, room 3 = 1.08, room 6 = 1.47). Damage × atkScale (0.82 → 1.27).
| Vice | HP r1 / r6 | Dmg (charge) | Speed | Notes |
|---|---|---|---|---|
| Hothead | 32 / 57 | 8 (14) | 66 | Charger |
| Gossip | 17 / 30 (+2 kids 8 HP) | 5 | 108 | Splits on death |
| Waxer | 26 / 47 | 4 | 88 | Healer + shots |
| Deadline | 57 / 101 | 10 | 46 | 0.8 armor, grows |
| Spotlight | 25 / 44 | 12 | 72 | Beam |
| Devourer | 40 / 71 | 6 | 56 | Drain bloom |
| Collector | 28 / 51 | 5 | 125 | Steals Pneuma |
| Champion | 1000 | 13 (22) | 92 | Trial of Mars |
| Elites | ×2.2 HP | | | hasted / shielded / volatile |

- Kairos clears a room-6 Hothead (57 HP) in ~1 s. Normal Vices die too fast to show their mechanics once players have any levels. Elites carry the difficulty.
- **Boss HP is not level-scaled** (fixed 2,600). At Lv 20 (×2.1 ATK) the boss will melt; at Lv 1 Bram teams can't finish it.
- **Dodge spam is strong.** Dodge cooldown 0.55 s with 0.32 s i-frames → ~58% invulnerable uptime when spammed. An idle party mashing dodge survived 90 s in a district vs 57 s doing nothing. Perfect dodge (+6 Pneuma, slow-mo) is a good reward; normal dodge is too cheap.

---

## 5. Gameplay and Systems Report

**Works well**
- Switching + Entrances + bench passives (Ines snipe, Bram Oops, Cass aura) make switching worthwhile.
- Aspect combos are a clear, learnable reward.
- Houses each have a distinct rule (rush, split, spotlight, pairs, deadline, fog).
- Story mission variety (walk/talk, frozen time, escort, defense, stealth, split teams, forced loss) is the most interesting content in the game.

**Weak**
- **Two games, no bridge.** Story uses Bonds and fixed missions; Climb uses Blessings/Fragments/levels. Nothing earned in Story carries over; nothing in Climb explains why you're there (still "Vigil", "Serpent", "Chapter 1 · Vigil" in Guide).
- **Blessings are mostly flat stat bumps.** 7 planets, 3 levels. Mercury/Mars/Saturn are pure numbers. Uranus (switch shockwave) and Neptune (dodge mist) are the only ones that change how you play. Nothing interacts with the new 8 kits (burn, Spotted, turrets, crit).
- **Recollection levels are pure stats**, and the multiplicative damage stack makes late levels trivialize everything (no enemy level scaling).
- **Ultimates too rare** (see 4.4) to be a decision.
- **Lethe** is a coin-flip heal; fine, but it's the only non-combat stop.
- **Trials:** Mercury (collect sparks) is unrelated to any kit; Mars (beat a 1000 HP Champion in 60 s) is trivial for Kairos/Lucan (~20 s).
- **Choices in Story** only change a few reaction lines. That matches the stated design, but players may expect more after the first two.

**Redesign candidates (problem-driven only)**
1. Link Story → progression (BUG-06).
2. Put kits and Blessings in the same language: e.g. Mars = "+burn/+Spotted", Jupiter = "+Pneuma", so Blessings support the 8 identities.
3. Enemy/boss scaling by party level, or level-locked difficulty per mode.

---

## 6. Visual and UI/UX Report

Verified on desktop canvas captures; **not** verified on phone.

- **New maps** (hospital, lab, street, rooftop, orphanage) match their scenes; the "hospital on grass" issue is fixed. Rooftop map is sparse and dark; the lab's dark floor lowers contrast for the grey/blue Vices (Gossip/Waxer).
- **Characters**: improved faces and details read well at cutscene scale; at gameplay scale (≈1×) the new details (chevrons, pens) are sub-pixel noise. Fine, but don't add more.
- **Cutscene framing**: characters at `y ≥ 0.72` get cropped on wide screens at default zoom (seen in the cold-open frame); the crack effect is placed for the default focus only.
- **Cutscene choices** sit on the right of the stage; on a phone in landscape they may cover characters. Untested on device.
- **HUD**: status text stacks (e.g. Lucan "COMPOSURE · CRIT DMG · VOW") can pile up; three-line status on small screens is likely cramped. Untested on device.
- **Combat readability**: number popups (`dmgText`) + burns + turret beams + Spotted marks + soak pools + fire zones overlap in Cass/Theo/Ines parties. Consider a "reduce effects" option (there is `reduceMotion`, but it only affects shake).
- **Inconsistent element language**: Guide says "Water slows, Earth shields, Air speeds you up", but Dess's *Water* skill buffs damage, Lucan's *Water* skill stuns, Theo's *Air* skill builds turrets. Either update the Guide or drop the rule.
- **Stale UI copy**: see BUG-08.

---

## 7. Narrative QA Report

**Confirmed story content:** Chapter 1 v3 (`CH1_SEQ`, 52 steps, 14 scenes). **Existing but incomplete:** Lore Bible v1 (still uses the old cast), `docs/Chapter1_Script.md` (v1 draft, now outdated). **Proposals** are marked *(proposal)*.

### Lore contradictions (script vs Lore Bible [CANON])
1. **The Mercy.** Bible: "the Mercy" is the Church's name for **the Blotting**, a cosmic memory wipe 20 years ago; the Church *sells Lethe water*. Game: "the Mercy" is **holy water** handed out at a festival. This is the biggest lore conflict. Decide one and update the other.
2. **Life B / the cloaked man.** Bible: life B **dies in the same instant** as the Blotting. Game: the cloaked man (clearly life B, same mark) is **alive** in the final scene talking to Lyra. Either the bible changes or the final scene's figure must be something else (the Serpent?).
3. **Nightly Starfalls.** Bible and title screen: "Starfalls every night". Market guard: "Not a single Vice inside the walls for a month." Pick one (*proposal:* "Nothing gets past the Wall's rooftop guns" keeps both).
4. **The Wall / Aster.** "Last free city on the continent of Aster" and "no maps past the Wall in 80 years" are new; the bible says the First Starfall was 100 years ago. Add both to the bible.
5. **The Lore Bible still lists Seren, Elias, Vigil, Mother Noa, Barnabas** as current. It is no longer a "single source of truth".

### Internal inconsistencies
- **Lucan's age/title:** dossier says "19 · Council aide"; script says he and Kairos were both 9 eleven years ago (→ 20) and calls him "senior clerk".
- **"Someone else told me that once"** (Kairos to Lyra): the only person who said "don't drink the water" was the cloaked man, to a newborn. Implies Kairos remembers his own birth — either intentional (then it needs to be called out later) or a plot hole.

### Pacing and repetition
- **The Mercy is "revealed" three times:** Noemi explains it (Scene 6), Lucan's flashback shows it erasing him (Scene 9), then the Festival plays it as a discovery ("Oh. That's what the Mercy does", Scene 12). Cut the explanation from Scene 6 and let the Festival land.
- **Hospital scene (Scene 6) is still an exposition block:** Theo explains the clocks, the continent, the Wall; Noemi explains the Mercy — all while a rift is about to open. Move world-explaining to the camp (Scene 11) or Theo's job offer.
- **Scenes 9–10 move fast** after a slow first half: Lucan remembers, joins, the breakout, Dess, escape and Cass all happen in one night. The joins of Dess and Cass have less setup than Ines/Bram.
- **Lyra appears twice and says the same kind of thing.** Fine as a mystery, thin as a character.

### Character writing
- **Strong:** Kairos's inner voice; Lucan's cold → vow arc with the fire/adoption twist; Marr's gaslighting ("You signed. You just don't remember."); Bram's humor; Ines's dryness.
- **Weak:** Theo and Noemi are mostly exposition carriers; Cass converts in one festival scene; Dess's "little star" hint and the freckle are good, but she gets no scene of her own before joining.
- **Choices:** good tone, but 3 of 8 choices are jokes with no later echo; players will learn to ignore them. Give each choice at least one callback.

### Rewrite / expand / delay / remove
| Element | Action |
|---|---|
| The Mercy definition | **Rewrite** to match a single canon (bible or game) |
| Final hooded-man scene | **Rewrite or delay** until the bible decides life B's fate |
| Noemi's Mercy explanation (Sc. 6) | **Remove** |
| Theo's continent/Wall explanation (Sc. 6) | **Move** to camp |
| Dess introduction | **Expand** (one short beat before the breakout) |
| Cass's turn | **Expand** slightly (one line of doubt earlier, at the rooftop) |
| Lore Bible cast/names | **Update** before Chapter 2 |
| Chapter1_Script.md | **Update** or mark as superseded |

---

## 8. Technical Report

- **Errors:** 0 runtime errors across all automated sessions (Chapter 1 full run, Climb full run, 8 kits, boss ×4, stress).
- **Performance (desktop, hidden tab):** 5 s of simulation with 43 enemies = 180 ms; 30 rendered frames = 210 ms (~7 ms/frame). Fine on desktop; **unknown on iPhone** — expect 2–3× slower. Particles capped at 300, texts at 50; `decals`, `beams`, `zones` are filtered by life, no unbounded growth seen. Heap stayed ~6–7 MB over 120 s.
- **Architecture:** one 5,791-line file with global mutable state (`player`, `team`, `room`, `run`, `enemies`…). Workable for one developer, but every system can mutate every other. Significant **dead code** from the old cast and old story: `STORY` scenes (Barnabas/Seren/Elias/Cyrus), `sentence()`, `anaT`/`indict`/`scales` fields, `startStory`/`continueStory`/checkpoints behind `window.__oldStory`.
- **Saves:** `localStorage` only, no version field, silent reset on corruption (BUG-02), index-based story position (BUG-03). The Backup-code export is good — surface it more.
- **Service worker:** network-first for the page (updates arrive), cache name `starfall-v1` never bumped (icons/fonts can go stale; low risk).
- **Browser compat:** Canvas 2D `filter` (grey statues) is not supported in older Safari; code has a fallback. Web Audio requires a user gesture (handled by `ensureAudio`). `100dvh` in CSS needs iOS 15.4+.
- **Exploitable states:** debug hooks in production (BUG-09); Battle farm (BUG-07); dodge-spam uptime (§4.5).

---

## 9. Recommended Development Roadmap

### P0 — Critical, fix now
| # | Problem | Why | Solution | Impact | Complexity | Depends |
|---|---|---|---|---|---|---|
| P0-1 | Lucan out-damages Kairos (94 vs 55 DPS, boss 31 s vs 56 s) | Breaks the stated main-DPS identity; one correct play pattern | Lance: 1.0 s charge or ~3.0× ATK, or a short cooldown | Restores role hierarchy | Low | — |
| P0-2 | Bram knockback out-ranges his bash (1.7 DPS free) | Character feels broken | Knock 300 → ~90 on normal hits | Bram usable | Low | — |
| P0-3 | Silent save wipe | Total progress loss | Backup corrupt blob, version field, warn on write failure | Protects players | Low | — |
| P0-4 | Buffs leak between rooms | Free damage, confusing HUD | Reset all timed team fields in `resetField` | Correctness | Low | — |

### P1 — High, before new content
| # | Problem | Why | Solution | Impact | Complexity | Depends |
|---|---|---|---|---|---|---|
| P1-1 | Story gives no progression | 40 min with no reward; split modes | Award XP/dust per mission + chapter clear | Ties modes together | Low–Med | — |
| P1-2 | Index-based story saves | Script edits will misplace saves | Save by scene key | Safe script iteration | Medium | — |
| P1-3 | Multiplicative buff stacking (up to ~32×) | Trivializes boss, hard to balance | Additive "damage bonus" bucket | Balance becomes predictable | Medium | P0-1 |
| P1-4 | Mercy / life-B lore contradictions | Canon drift before Ch2 | Decide canon, update bible + script | Narrative integrity | Low (writing) | — |
| P1-5 | Stale Guide/Training/README/Bible text | Teaches wrong mechanics | One text pass | Onboarding | Low | — |
| P1-6 | Kairos Shell does nothing unless hit | Dead skill vs many enemies | Give Shell a small pulse on cast, bigger on counter | Kit feel | Low | — |
| P1-7 | Battle reward farm | Makes progression meaningless | Scale rewards by starting Blessings; 1 boss fragment | Economy | Low | P1-1 |

### P2 — Medium
| # | Problem | Solution | Complexity |
|---|---|---|---|
| P2-1 | Ultimates too rare for ranged chars | Pneuma per damage, or +trickle | Low |
| P2-2 | Boss/enemies don't scale with level | Scale boss HP by party avg level or cap levels per mode | Medium |
| P2-3 | Cass DPS too high for a support role | Burn 0.7 → ~0.45×ATK, or reclassify | Low |
| P2-4 | Blessings ignore the 8 kits | Rework 2–3 Blessings to feed burn/Spotted/Pneuma | Medium |
| P2-5 | Burn value sticks to enemies (BUG-05) | Reset on expiry | Low |
| P2-6 | Exposition in Scene 6; triple Mercy reveal | Trim/move lines | Low |
| P2-7 | Dodge-spam uptime 58% | Dodge cd 0.55 → ~0.8 s, keep perfect dodge reward | Low |
| P2-8 | Mobile untested | One real iPhone session: HUD, choices, touch, perf | Low (time) |

### P3 — Polish
| # | Problem | Solution | Complexity |
|---|---|---|---|
| P3-1 | Debug hooks in production | Gate behind localhost/`?debug` | Low |
| P3-2 | Dead legacy code | Remove old STORY/cast code | Medium |
| P3-3 | Effect clutter in mixed parties | "Reduce effects" toggle | Low |
| P3-4 | Element rules in Guide don't match kits | Update text | Low |
| P3-5 | Rooftop map sparse, lab low contrast | Art tweak | Low |
| P3-6 | Choice callbacks | 1 echo per choice | Low (writing) |

---

## 10. Next Development Sprint (in order)

1. **Nerf Lucan's Lance** (P0-1) and **fix Bram's knockback** (P0-2). Re-run the DPS table; target: Kairos ≥ everyone single-target on sustained DPS.
2. **Reset all team buffs between rooms** (P0-4).
3. **Harden saves** (P0-3): version field, backup on corrupt, warn on write failure.
4. **Give Story progression** (P1-1): XP + Stardust per mission, bonus on chapter clear.
5. **Switch story saves to scene keys** (P1-2) before any more script edits.
6. **Collapse damage multipliers into an additive bonus bucket** (P1-3); re-check boss TTK (target 60–90 s for an average party).
7. **Lore decision meeting (you):** what "the Mercy" is, and whether life B is alive (P1-4). Then update bible + script.
8. **Text pass** (P1-5): Guide, Training, README, title, dossier ages/titles.
9. **Kairos Shell + Pneuma tuning** (P1-6, P2-1).
10. **One real iPhone playtest** (P2-8) and write down what feels wrong.

---

## 11. Final Verdict

- **Is it fun?** The moment-to-moment combat (switching, entrances, perfect dodges) is fun in short bursts. Chapter 1's missions are the most enjoyable part. Climb runs feel samey after one or two.
- **Is combat balanced?** No. Lucan's Lance dominates single-target, Cass out-damages her role, Bram's basic barely connects, and buffs multiply without a ceiling.
- **Are the mechanics cohesive?** Partly. The 8 kits are now coherent on their own, but Blessings, Fragments and Recollection were built for the old cast and don't speak the kits' language; Story and Climb share no progression.
- **Is the narrative compelling?** The v3 Chapter 1 has a real hook and two strong arcs (Kairos, Lucan). It is held back by lore contradictions (the Mercy), repeated reveals, and an exposition block in the hospital.
- **What prevents it from feeling like a polished RPG?** No progression loop through the story; balance driven by stacking multipliers; stale tutorial/guide text that teaches the wrong game; untested mobile experience.
- **What NOT to develop yet:** Chapter 2, new characters, new Blessings, new enemy types, more maps, more art passes.
- **What I'd prioritize as lead designer:** Sprint items 1–6. Make Kairos the clear main DPS, make Story feed progression, make saves safe. Then lock the lore canon and only then write Chapter 2.
