# Chapter 1 Enemy Design · Phase 3 gameplay specification

**Status:** spec only. No gameplay code, assets or encounters were changed. Phases 0–2 are approved; see the roster, profiles and visual reference documents.

**Scope:**
- The five new Vices **add to** the roster and **debut in Rifts and Runs only**.
- The seven existing Vices, the Champion and Horaios are **unchanged**; their specs are not repeated here, see `makeEnemy` and `updateEnemies`.
- **#14 (The Memory That Carried Him)** is specified as two options for you to choose between (§7). The current Forgotten Memory fight stays unchanged unless you pick one.

## 1. Engine conventions (reuse, no new systems)
| Need | Existing hook to reuse | Notes |
|---|---|---|
| Stats | `makeEnemy` `switch(type)`: one `case` per new type | HP = base × 1.15 × `room.hpScale` × `lvlScale()`, as today |
| Behaviour | `updateEnemies` `switch(e.type)`: one `case` each | Movement uses the existing `spd`, `slowT` and `stunT` handling |
| Ground warnings | `tels` (`{x,y,r,t,dur,dmg}`); `updateTels` resolves them | Telegraph shape and colour as existing (red circle filling up) |
| Projectiles | `bullets` (`{x,y,vx,vy,r,dmg,life}`) | Collide with the player through the existing path |
| Damage to the player | `hurtPlayer(d)` | Already applies `room.atkScale` (tier), shields, iframes and dodges |
| Interrupts | `e.hitT` (set on every hit), `e.stunT`, `e.stag` → 100 = stun 2 s | No new gauge |
| Status effects | `burnT`, `slowT`, `wetT`, `markT` (Spotted), `drowsyT`, `anaT` | New types *read* these; no new statuses |
| Elites | `rollElite`; per-type exclusions listed below | HP ×2.2, ring outline, as existing |
| Drops | `memDrop` (values below), Pneuma orbs, `rollFrag('elite')` | No new currency |
| Readability | `colorOf(e)` (new colours), `drawEnemyBody` (one `case` each) | Sprites follow the approved Phase 2 sheets |
| Codex text | `VICE_INFO` entry + the fragment line in Guide → Vices | No Bestiary menu (approved) |
| Spawning | `room.def.pool` (Rifts), `HOUSES` pools (Runs), `poolType()` | Debut weights in §6 |

**Fairness rules (all new enemies):**
1. Every damaging action has a **telegraph of at least 0.5 s**, drawn on the ground or on the enemy. None start off-screen.
2. No attack follows the player after its telegraph begins (no tracking after the warning).
3. **Phone readability:** telegraph lines are at least 2 screen px wide at about 0.98 px per world px, which means `lineWidth ≥ 2/scale` in world units. This also settles the open Candlewisp question: its link line is drawn at `max(1, 2/scale)`.
4. Caps on how many can be on screen at once are listed per enemy.
5. Kairos's "time runs 0.8×" on telegraphs (in `updateTels`) applies to all new telegraphs automatically.

---

## 2. Crumbkin (low · swarm · HUDDLE)
**Stats (base):** HP 10 · r 8 · speed 95 · contact 3 · `memDrop` 2.5.

**Spawning:** 3–4 at once (one "group" counts as 1 spawn toward the field cap). At most 8 Crumbkins alive at a time.

**Elites:** Hasted only. Shielded and Volatile are excluded.

**States:**

| State | Behaviour | Timing |
|---|---|---|
| `walk` | Moves toward the player, keeping 40–70 px away. Members of a group keep 14–24 px apart | — |
| `toss` | Stops; its core brightens (0.4 s). Throws 3 crumbs to random points 30–70 px around itself, **never at the player's position**. Each crumb is a `tel` (r 6, dur 0.4) that becomes a **hazard dot** for 2.0 s (2 damage on touch, at most once per 0.5 s) | Every 3–4 s per Crumbkin (randomised so a group doesn't fire together) |
| `huddleWarn` | Starts if **3 or more** Crumbkins have been within 26 px of each other for **4 s**. For **1.0 s** their cores pulse in sync and a dashed gold ring connects them. They drift together at speed 30 | 1.0 s |
| `loaf` | The group becomes one **Warm Loaf**: HP = the sum of the members' current HP, r 16, speed 55, contact 5 | — |
| `loafSlam` | 0.7 s wind-up (the crust glows) with a `tel` r 46 under it, then 9 damage + knockback 120 | Every 4 s, only if the player is within 90 px |

**Cancelling a huddle:** any member being **stunned, knocked back more than 12 px, or killed** during `huddleWarn` cancels the merge. The 4 s count restarts.

**Counters:** area attacks, knockback, Burn. **Burn: +25% damage taken. Wet: −30% speed.**

**Drops:** a Warm Loaf drops +1 Pneuma orb and 2.5 × members in Memories.

## 3. Paperling (low · harasser · MISDIRECT)
**Stats (base):** HP 16 · r 9 · speed 90 · keeps 140–220 px from the player · `memDrop` 4.5.

**Caps:** at most 3 Paperlings and 2 decoys on the field.

**Elites:** all three are allowed.

**States:**

| State | Behaviour | Timing |
|---|---|---|
| `hover` | Strafes sideways at its preferred distance; bobs 6 px | — |
| `darts` | 0.5 s tell: the wings fold back. Then fires 2 `bullets` in a ±10° spread at the player's **position at tell start** (speed 220, r 3, 4 damage, life 1.6 s) | Every 2.2 s |
| `fold` | 0.5 s tell: the paper shuffles (the lines jitter). Drops a **decoy** at its own position, then dashes 60 px sideways | Every 7 s, only while fewer than 2 decoys exist |
| `scraps` | At 0 HP the **first time**: becomes untargetable scraps for 1.5 s, then **re-folds at 40% HP** where it fell. The re-fold is shown as scraps spiralling inward | Once |

**The decoy:**
- It is an enemy entry with `decoy:1`: HP 1, r 9, speed 0, life 4 s.
- **No seal, no attacks**, and it never counts toward kill goals.
- Auto-aim *can* select it; that is the point.
- When it dies it puffs into scraps and gives no reward.

**Counters:** manual aim on desktop; facing on touch; area skills. **Spotted** shows on the real one only. **Burn: ×2 damage.** If it is **Wet** at 0 HP, it skips the re-fold.

**Fair-play rule:** decoys never block shots aimed at the real Paperling. Projectiles pass through decoys unless the decoy was the auto-aim target.

## 4. Candlewisp (low · support · SHELTER)
**Stats (base):** HP 20 · r 9 · speed 70 · contact 0 (it never damages the player) · `memDrop` 4.5.

**Caps:** at most 2 per field.

**Elites:** Hasted and Volatile. Shielded is excluded.

**States:**

| State | Behaviour | Timing |
|---|---|---|
| `drift` | Floats toward the ally with the lowest HP fraction within 220 px; hovers 50–80 px from it. It never approaches the player on purpose | — |
| `linkWarn` | 0.6 s: the gold thread draws out from the flame to the chosen ally | 0.6 s |
| `watch` | While linked, the ally takes **−35% damage** (applied in `hitEnemy` when `e.shelterT>0`). The ally gets a faint gold ring. The link is re-chosen every 5 s | Continuous |
| `gutter` | **Any hit** on the Candlewisp breaks the link for **2 s**: the flame turns to smoke. A **stun** breaks it for the stun's length. **Stagger 60** puts it out for **3 s** (uses the existing `stag` value; it doesn't need to reach 100) | 2–3 s |

**The link also breaks if:**
- the ally moves more than 160 px away (Wet shortens this to 96 px);
- the ally dies.

**Rules:**
- **Bosses and Champions can't be linked.**
- Two Candlewisps can't link the same ally (no stacking).
- Damage reduction never stacks above −35%.

**Counters:** hit it once to pause the shelter, or kill it; knock the ally away; Wet.

## 5. The Last Stand (mid · guard · COVER)
**Stats (base):** HP 55 · r 16 · speed 50 · contact 6 · rush 12 · `memDrop` 12 (elite-equivalent) · Fragment roll at `rollFrag('elite')` odds.

**Caps:** at most 1 per field (2 at Tier III).

**Elites:** Hasted and Volatile. Shielded is excluded (no double shield).

**States:**

| State | Behaviour | Timing |
|---|---|---|
| `guard` | Faces the player. **Turns at 90°/s.** The front **120° arc** blocks: hits from inside it deal **−70%** (the source angle is checked in `playerHit` using `e.face`). Walks toward the player at speed 50, staying 60–120 px away | — |
| `cover` | Any other Vice within 60 px **behind** it gets the cover: bullets and shots whose path crosses the shield arc are absorbed by the shield | Passive |
| `rushWarn` | Ground thump: dust-ring `tel` r 30 under it, plus a red-line lane 160 px long in the facing direction (the existing line style). **0.8 s**. The direction locks at the start | Every 6 s, if the player is within 220 px |
| `rush` | Moves 160 px along the lane in 0.35 s. 12 damage + knockback 140 to anything in the lane | 0.35 s |
| `open` | **Shield down for 1.2 s**: full damage from all sides, and the ember is visible | 1.2 s after each rush |
| `stagger` | The existing `stag` builds **at the normal rate even through the shield** (Bram's bash and charged attacks). At **100**: stunned 2 s, shield down for the full 2 s | Existing |

**Damage from behind** (more than 60° off its facing): normal damage, plus the existing crit rules.

**Counters:** flank (it turns slowly), punish the 1.2 s window, Stagger. Spotted and Analyzed apply through the shield.

## 6. The Humming Core (mid · special controller · RHYTHM)
**Stats (base):** HP 40 · r 14 · speed 30 · swell 8 · `memDrop` 12 · +2 Pneuma orbs.

**Caps:** **at most 1 per fight**; a rare spawn (see §8).

**Elites:** none.

**The bar:** 4 beats × **0.75 s** (one bar = 3 s), shown on the **floor ring** (8 marks, r 30 around the core, drawn under the Vices).

| Beat | Ring | Effect |
|---|---|---|
| 1 | 2 hollow teal marks lit | **Calm:** Vices within 180 px move −25% and **won't start attacks** (attacks already started finish) |
| 2 | 4 lit | Calm |
| 3 | **Gold diamonds, a double ring, inward chevrons** | Calm; **the swell is coming**. A hit on the core during beat 3 **delays the swell by one beat** (once per bar) |
| 4 | **Jagged orange wave** expands from the core to **140 px** over 0.35 s | 8 damage to the player if inside the wave (dodge i-frames avoid it, using the existing perfect-dodge timing). The next 2 bars play **25% faster** (0.6 s beats) |

**Turning:**
- **When:** after every 4 bars.
- **Visual:** the ring breaks apart (marks scatter).
- **Effect:** for 3 s the calm stops, and nearby Vices get **+15% speed**.
- **Afterwards:** the lullaby restarts at normal tempo.

**Movement:** drifts toward the arena centre at speed 30. It never chases.

**Statuses:**
- **Drowsy:** beats ×1.3 longer.
- **Slow:** beats ×1.15 longer.
- **Stun:** skips the next swell.

**Sound:** a 4-note hum. The visuals are complete without it (Phase 2 rule).

## 7. The Memory That Carried Him: two options for your decision
**Unchanged in both options [existing]:**
- **Setting:** solo Lucas on St. Hesper's roof, level 2.
- **Brief:** "A Vice that carries pieces of you…"
- **Three memory beats** with their exact lines, each with 0.9 s of slow time and +10% attack (stacking).
- **Story position:** R9.
- **Rewards and the hand-off to the fire scene.**

**What's open:** how the beats are triggered (kill count or the boss's HP) and how big the change is.

### Option A · Presence only (recommended first step: smallest change)
- **The fight:** unchanged, still `kills:12`, `pool:['collector','gossip','gossip']`, beats every 3 kills.
- **The Memory:** stands at the far edge of the roof as a **non-combat presence**: it can't be targeted and does no damage. It holds the objects.
- **Each memory beat:** the matching object **falls from its cloak onto the roof** (bread, then the counting blanket corner, then the cup). The Memory steps back.
- **The end:** the Memory settles and the cup rolls to Lucas (the visual described in the profile).
- **Risk:** very low. No balance change; only a draw call and three small events.
- **Gain:** the emotional presence and the Phase 2 design, with no gameplay risk.

### Option B · Full boss
- **Fight structure:** the fight becomes one named enemy. The memory beats trigger at **75 / 50 / 25% of its HP** instead of every 3 kills.
- **Stats:** HP about 3× a level-2 Deadline; r 24.
- **Loose words:** Gossip-like adds (HP 8) shed every 8 s; at most 4. They are optional.

| Phase | Pattern | Telegraph | Damage |
|---|---|---|---|
| Bread (100–75%) | **Breakfast table:** 3 lanes; a plate slides down each | 0.6 s gold-dashed lane | 8 |
| Counting (75–50%) | **Sixty:** a ring of numbers; a pulse ring expands at each 10th count (every 1.0 s; 6 pulses). It curls (−50% damage taken) between pulses 1 and 2; Stagger 100 uncurls it | 0.5 s count-flash before each pulse | 10 |
| Smoke (50–25%) | **Smoke patches** (Slow, 4/s) drift across the roof, plus the **hand**: a 1.0 s arm wind-up, then a 1 s hold (6 damage) | 0.8 s haze; 1.0 s reach | 4/s, 6 |
| Final (25–0%) | All three at 0.7× cadence | as above | as above |

- **At 0 HP:** no explosion. "Remembered." The cup rolls to Lucas → fire scene.
- **Risk:** medium. It changes a story fight's difficulty and needs a solo-Lucas balance pass (bot plus a human playthrough).
- **Recommendation:** ship **Option A** first. Consider Option B in a later pass if you want this beat to be a real boss fight.

## 8. Debut placement (Rifts and Runs only)
Weights are added by **appending entries to existing pools**: no other entries change and no story pools change.

| Enemy | Rifts (pool, tier) | Runs (district) | Notes |
|---|---|---|---|
| Crumbkin | Market Ring Waves (all tiers), Festival Sparks (all) | Market Ring (house3) | Groups count as one spawn |
| Paperling | Concord-flavoured: Garrison Yard (Earth) Tier II+, Institute Overload (Air) Tier II+ | Concord Offices (house10) | — |
| Candlewisp | St. Lucia's Ward Tier II+, Ash Lane Blaze Tier II+ | The Cloister (house7), Drowned Canals (house12) | At most 2 |
| The Last Stand | Garrison Yard (Earth) Tier II+, Institute Overload Tier III | Garrison Yard (house1), from Tier/district 4+ | At most 1 (2 at Tier III) |
| The Humming Core | Institute Overload Tier II+ (10% chance per fight) | Drowned Canals (house12, 15% per room) | At most 1 per fight |

**First-encounter notes:** each new Vice uses the existing "NEW VICE" note (`room.notes` with `VICE_INFO`), so players get a one-line explanation the first time.

**Balance guard:**
- After adding the new Vices, re-run `tools/_balance_sim.js` on every Rift and tier with all four parties.
- **Acceptance:** win rates within ±1 of each cell's current value and median times within ±15%.
- **The Ward:** Candlewisp must not make Ward Tier III unfair. If it does, keep it out of the Ward.

## 9. Test matrix
| Enemy | Automated (new `tools/ch1_enemies_test.js`) | Sim (`_balance_sim.js`) | Manual (desktop and iPhone) |
|---|---|---|---|
| Crumbkin | Spawns in groups of 3–4; crumb hazards land away from the player; a merge needs 3 Crumbkins within 26 px for 4 s; stun or knockback in the warning cancels it; the Loaf's HP equals the members' sum; Burn ×1.25 | Waves and Sparks rifts T1–T3 × 4 parties | The merge warning is readable; it reads on dirt |
| Paperling | Darts aim at the tell-start position; at most 2 decoys; decoys have 1 HP and no reward; auto-aim can pick a decoy; re-fold exactly once, at 40%; Wet skips the re-fold; Burn ×2 | Earth and Air T2–T3 | Decoy vs real readable on the phone; it never feels like aim is "broken" |
| Candlewisp | Link after 0.6 s; −35% on the linked ally only; a hit → 2 s break; stun → break; Stagger 60 → 3 s out; 160 px range (96 when Wet); never links bosses; no stacking | Ward and Fire T2–T3 (the Ward must stay ±1) | The link line is ≥ 2 px on the phone |
| The Last Stand | Frontal hits −70% within 120°; turns at 90°/s; covers allies within 60 px behind; rush telegraph 0.8 s and locked; 1.2 s open window; Stagger 100 → 2 s shield down; no Shielded elite | Earth T2–T3, Air T3; the Damage and Support parties without Bram stay within ±1 | Flanking feels possible on touch |
| The Humming Core | Bar = 4 × 0.75 s; calm stops new attacks within 180 px; beat-3 hit delays the swell once per bar; swell reaches 140 px for 8 damage; 2 faster bars after a swell; turning every 4 bars; at most 1 per fight; Drowsy and Slow stretch beats | Air T2–T3 with a forced spawn | **Playable with the sound off**; colour-blind check (shape cues) |
| #14 Option A | The Memory is untargetable and does no damage; objects fall at kills 3, 6 and 9; the fight's kill goal, lines and rewards are unchanged | Forgotten Memory unchanged (bot) | Emotional beat lands; no clutter |
| #14 Option B | Phases at 75/50/25% HP; the same three lines; every attack telegraphed; solo Lucas level 2 win rate is reasonable | Solo Lucas runs | Human playthrough required |
| Regression | Existing Vices' stats unchanged (snapshot of `makeEnemy` values); story fight pools unchanged; saves unaffected (no new save fields except Guide-seen keys) | Full Rift matrix vs the current release | Full suite |

## 10. Open decisions for you (Phase 3 approval)
1. **#14:** Option **A** (presence only, recommended), Option **B** (full boss), or no change yet?
2. **Candlewisp link:** approve the phone rule (at least 2 screen px).
3. **Debut table (§8):** approve the pools and caps, or adjust them.
4. **Codex:** the "NEW VICE" first-encounter note plus the fragment line in the Guide (approved in Phase 1). Please confirm it applies to all five.

Phase 4 (the staged implementation plan) only begins after this approval, and code changes need a separate go-ahead.
