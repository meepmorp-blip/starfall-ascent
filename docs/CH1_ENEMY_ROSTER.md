# Chapter 1 Enemy Design · Phase 0 audit and proposed roster

**Brief:** `STARFALL_Chapter1_Enemy_Design_Master_Prompt.pdf`, Phase 0 only.

**Scope:** documentation only. No code or assets were changed. Branch `ch1-enemy-design`, uncommitted.

**Sources checked:**
- `index.html` at `main` `0ee88f5`: `makeEnemy`, `VICE_INFO`, `ELITE_INFO`, `playerHit`, `hitEnemy`, `drawEnemyBody`, `memDrop`, `rollElite`, `MISSIONS` and `addMission` pools, `drawBoss`.
- `Starfall_Lore_Bible_v2.pdf` (text extracted).
- `Lore_Updates_v1.1.md` and `Lore_Updates_v1.2.md` (v1.2 overrides v2).

**Not checked:** the brief's mood-board images. They could not be rendered here (no PDF image renderer), so only the PDF text was used.

## 1. What exists today (verified in code)
| Enemy | Planet · meaning (in game) | How it fights | Where it appears in Chapter 1 |
|---|---|---|---|
| **Hothead** | Mars · reckless daring | Charger: red flash, straight rush, stunned on walls | First Fight, Garrison, Breakout (assault), Escape, Cistern, Festival, Lights Out; rifts |
| **Gossip** | Mercury · deceit | Zigzag biter, lunges; splits into 2 children on death | Almost every fight; Forgotten Memory; Containment |
| **Waxer** | Moon · growing and waning | Healer: follows wounded Vices, lobs wax | Garrison, assault, Escape, **Cistern Stair** ("kill the healers first"), Festival |
| **Spotlight** | Sun · arrogance | Red aim line, then a beam | **Lights Out** (spotlight lines), rifts |
| **Deadline** | Saturn · the lie that waits | Tank: walks you down, slams, grows every 10 s; armour 0.8 | assault, Escape, Festival; rifts |
| **Devourer** | Venus · deceptive desire | Stalks, blooms, pulls in and drains | **Containment Failure**, Festival |
| **Collector** | Jupiter · greed | Steals Pneuma, flees, returns; the hoard drops on death | **Forgotten Memory** (Lucas's memory), **The Stacks** (the "Record Keepers" carry records) |
| **Champion** | (Trial of Mars) | 1000 HP; recovers if you stop hitting it | Battle → Trials only |
| **Horaios** | Kosmokrator of the Moon | 3 phases, Filing Shields from phase 2, Nightmare 4th phase (Moon Gate pull); story version in the stopped minute | Chapter 1 climax (Intake Window 1); Battle |

**Systems that already exist (reuse, don't duplicate):**
- **Elites:** Hasted (+40% speed), Shielded (regrowing shield), Volatile (explodes on death). HP ×2.2.
- **Break:** the **Stagger** gauge (100 → stun 2 s, breaks shields). There is no separate "Fracture" system and none should be added.
- **Status effects on enemies:** Burn, Slow, Stun, Spotted (+15%), Analyzed, Drowsy (Riptide tide stacks), Wet, Indict, knock-slow, plus the Undertow and Soak marks.
- **Elements:** skills carry a tag (Water, Earth, Air or Fire), **but enemies have no weaknesses or resistances.** The only "matching" system is sign Resonance in Run districts (`resOf`). An elemental weakness system would be new; it is not proposed here.
- **Drops:** Pneuma orbs, Memories (`memDrop`: 4.5 normal, 12 elite, 1.5 for a Gossip child, 30 for the Champion), Fragments (elite and boss rolls), Collector hoards. No new currency is needed.
- **Bestiary:** there is no bestiary screen. `VICE_INFO` appears in the Guide's "Vices" page and as a first-encounter note in runs. A memory-fragment reveal could reuse the Journal's **Records** list (existing system).
- **Art:** every enemy is **drawn in code** (`drawEnemyBody`, per-type canvas drawing). There are no enemy sprite files. New enemies mean new draw code, not imported art.
- **Images:** no image-generation tool is available. Phase 2 "visual sheets" would be in-engine renders (the existing `tools/shots.js` pipeline) plus written specs.

## 2. Conflicts between the brief and current canon or code
| # | Brief says | What is actually canon or implemented | Proposed resolution |
|---|---|---|---|
| C1 | **#14 Sister Cassie, The Inquisitor**: Chapter 1 boss, "her story beat with Vane and the frozen-fire rescue must remain intact" | **Lore v1.2 [CHANGE]:** Cassie's rooftop ambush and Father Vane are **removed from Chapter 1**. She is met in the bell loft and **joins at the Festival**. The rooftop `cass` fight is kept in code, unused, "for a later Cassie trial". The third held minute is now the **Festival lantern rig**, not a fire | Replace #14 with a story mini-boss that *is* in Chapter 1 (see roster). Keep the Inquisitor fight for a later optional trial |
| C2 | **#12 Concord Enforcer, #13 Correction Marksman** as Chapter 1 enemies | No human combat enemies exist. The Lore Bible places **fighting the Office of Correction in Chapter 2** (the Fountain Raid). In Chapter 1, humans are *obstacles*: stealth guards in the Breakout and Festival stewards who turn you back | Don't add them to Chapter 1. Hold both for Chapter 2, where the brief's designs fit well |
| C3 | Roster omits **Deadline** | Deadline is canon (Saturn) and appears in 3 Chapter 1 story fights | Include it |
| C4 | Roster omits the **Champion** | Implemented (Trial of Mars) | Include it as a mini-boss, or confirm it's out of scope |
| C5 | #11 calls the core voice Dess's mother | Lore v2: "Dess's core plays her mother's voice". **In game the text says only "a woman's voice, tired and kind"** | Write it the way the game does: a woman's voice. Never confirm whose |
| C6 | #01 Crumbkin is linked to Bram's grandmother | In game, Bram's bread story names "Gran" and **never says she died**. Lore v2 Chapter 2 notes say **Bram's mother** is alive (in the re-registration line) | Keep the link optional and anonymous: "someone's bread". Never state a death |
| C7 | #02 Candlewisp (support) vs Waxer (support); #10 Last Stand (guard and tank) vs Deadline (tank) and the Shielded elite | Roles overlap | Give each a distinct verb (below) and reuse Stagger, not new gauges |
| C8 | #03 Paperling "obscures the player's aim" | Aim is auto-aim. Blocking it would feel like a bug and adds clutter on phones | Use "misdirects": a decoy target that auto-aim may pick, which is readable and fair |
| C9 | Weaknesses "only from existing element types" | Enemies have no weaknesses (see above) | Phase 1 uses existing **status** interactions (Stagger, Burn, Spotted, Drowsy) as counters, not elements |

## 3. Chapter 1 beats and their enemies (current game)
| Scene | Fight | Enemies |
|---|---|---|
| R1–R5 | First Fight, Garrison, Carry Him, Chase the Voice | Gossip, Hothead, Waxer |
| R6 St. Lucia's | Ward defence | Gossip, Hothead, Devourer, Collector |
| R8 Institute | **Containment Failure** | Devourer, Gossip *(the "little star" core is a story object here)* |
| R9 Lucas | **Forgotten Memory** | Collector + Gossips (memory phases) |
| R11 Breakout | Lights Out, assault, sneak (guards), Escape | Spotlight, Hothead; Waxer, Gossip, Deadline; human guards (non-combat) |
| R15 Festival | Cistern Stair, Lantern Rig, Protect the Crowd | Waxer-led; frozen rescue; mixed with Devourer and Deadline |
| R16 Registry | **The Stacks** (Record Keepers), Intake Window 1 | Collectors carrying records; **Horaios** |

## 4. Proposed final roster (exactly 15) for approval
Grades: **L** = low, **M** = mid, **S** = story mini-boss, **B** = boss. Planets follow the Lore Bible's offices; new memories are anonymous.

| # | Name | Grade | Status | Planet / memory | Role (one verb) | First Chapter 1 appearance |
|---|---|---|---|---|---|---|
| 1 | **Gossip** | L | existing | Mercury · forgotten words | swarm: zigzag, **split** | First Fight |
| 2 | **Hothead** | L | existing | Mars · forgotten anger | charger: **rush** (bait into walls) | First Fight |
| 3 | **Waxer** | L | existing | Moon · last days | support: **heal** | Garrison |
| 4 | **Crumbkin** | L | **new** | Moon-leaning · someone baking for family | swarm: **scatter** crumbs (brief, small hazards); several left alone **huddle** into one warm loaf that hits harder | St. Lucia's ward or Festival |
| 5 | **Paperling** | L | **new** | Mercury · words never sent | harasser: **misdirect** (paper decoys that auto-aim may pick; reforms once) | The Stacks (Registry) |
| 6 | **Collector** | L | existing | Jupiter · fear of never enough | thief: **steal** Pneuma | St. Lucia's ward |
| 7 | **Candlewisp** | L | **new** | Moon · keeping watch through a night | support: **shelter** (a small damage-reduction pulse on one ally; interrupt by hitting it). Waxer *heals*, Candlewisp *protects* | Escape (Breakout) |
| 8 | **Devourer** | M | existing | Venus · deceptive desire | ambusher: **pull** and drain | Containment Failure |
| 9 | **Spotlight** | M | existing | Sun · pride | artillery: **beam** down a red line | Lights Out |
| 10 | **Deadline** | M | existing | Saturn · the lie that waits | tank: **grow** and slam | Breakout assault |
| 11 | **The Last Stand** | M | **new** | Mars-leaning · someone who stayed behind so others got away | guard: **cover** (frontal shield protecting allies behind it; turns slowly; Stagger or a flank breaks the stance) | Festival (Protect the Crowd) |
| 12 | **The Humming Core** *(working title; was "The Mother's Song")* | M / special | **new** | Moon / Mercury · a lullaby in a core (whose: unresolved) | controller: **rhythm** (a sung pattern of safe and unsafe beats; it calms nearby Vices, then turns) | Containment Failure, as a special core event |
| 13 | **Champion** | S | existing | Mars · the trial | duelist: **endure** (recovers if you stop) | Trial of Mars (optional) |
| 14 | **The Memory That Carried Him** *(replaces "Cassie, Inquisitor")* | S | **new form of an existing fight** | Jupiter-leaning · Lucas's taken childhood (canon v1.2: "a Vice that carries his memories") | mini-boss: a **large Collector** that holds the memories. Each quarter of its HP returns one (this builds on the fight's existing memory phases) | Forgotten Memory (R9) |
| 15 | **Horaios, Kosmokrator of the Moon** | B | existing | Moon · the Gate's clerk | boss: **process** (Filing Shields, stopped minute, Moon Gate in Nightmare) | Intake Window 1 (R16) |

**Kept out of Chapter 1, for later:**
- Concord Enforcer and Correction Marksman (Chapter 2, Office of Correction).
- Sister Cassie, Inquisitor (a future optional trial; the fight already exists in code).

**Why it holds together:**
- **Moon:** loss and care (Waxer, Crumbkin, Candlewisp, Mother's Song, Horaios).
- **Mercury:** words and records (Gossip, Paperling), which leads into the Registry.
- **Mars:** courage and anger (Hothead, Last Stand, Champion).
- **Lucas's thread:** gets its own named memory (#14).

Every new enemy is a *verb* the current roster doesn't have: scatter and huddle, misdirect, shelter, cover, rhythm.

## 5. Open questions for you
1. **Slot 14.** Is "The Memory That Carried Him" (Lucas's Forgotten Memory mini-boss) the right replacement for the Inquisitor, given Lore v1.2? Or do you want Cassie's Inquisitor fight restored somewhere? That would be a canon change.
2. **Human enemies.** Confirm they stay out of Chapter 1 (Chapter 2 Office of Correction).
3. **Champion.** Keep it in the 15, or swap it for something else (for example a Record Keeper variant)?
4. **New-enemy placement.** Adding Crumbkin, Paperling, Candlewisp, Last Stand or Mother's Song to *story* fights changes Chapter 1 fights you approved. Alternatively they could appear first in Rifts and Runs and only later in story fights. Which do you prefer?
5. **Visual sheets (Phase 2).** These will be in-engine renders of code-drawn enemies plus written specs, not painted art. Is that acceptable?

**Next step:** Phase 1 (full profiles in `docs/CH1_ENEMY_DESIGN_PROFILES.md`) after you approve or edit this roster.


## 6. Owner decisions on Phase 0 (approved with adjustments)
1. **Slot 14 · The Memory That Carried Him:** kept.
   - It has its own visual identity: blanket cloak, canon objects, silver-cup core. It is **not** a big Collector.
   - Its attacks are built from Lucas's memories.
   - The Forgotten Memory fight keeps its narrative structure: the same three lines and the same beats.
2. **Human enemies:** out of Chapter 1. The Concord Enforcer and Correction Marksman are reserved for Chapter 2 (Office of Correction).
3. **Champion:** kept as an optional mini-boss (Trial of Mars).
4. **New Vices** (Crumbkin, Paperling, Candlewisp, The Last Stand, The Humming Core) debut in **Rifts and Runs only**. No Chapter 1 story fight is changed to add them.
   - They may appear later in optional character stories.
   - Crumbkin *may* connect to Bram's bread story, but only if that story establishes it, without invented family history.
5. **Visuals:** in-engine renders plus written specs are acceptable. Each enemy gets its own reference (full body, silhouette, palette, core or weak point, key attack animations), checked at gameplay scale.
6. **Other adjustments:**
   - "The Mother's Song" is renamed **The Humming Core**; the voice stays unresolved.
   - The seven existing Vices are preserved.
   - Every new Vice has a distinct role.
   - Crumbkin stays anonymous.
   - No elemental weakness system and no separate Break gauge: Stagger and the existing status effects only.

**Phase 1 output:** `docs/CH1_ENEMY_DESIGN_PROFILES.md`.
