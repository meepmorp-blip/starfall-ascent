# STARFALL: THE ASCENT · Post-Release Review and Roadmap

Date: 2026-11-17.

**Labels**
- **[FACT]:** confirmed from the code, Git or tests.
- **[REC]:** a recommendation.
- **[Q]:** an open question for you.

Nothing in this document changes the game, the live site or canon.

---

## 1. Current release status
| | |
|---|---|
| Live | https://meepmorp-blip.github.io/starfall-ascent/ · `main` = `32d18c8` = `ch1-revision` [FACT] |
| What shipped | Chapter 1 revision (stages 1–8), the visual and UX pass (19 fixes), the QA-06/07 fixes, the dev-queue tasks 1–10 [FACT] |
| Verified live | The page loads with no errors; developer tools are off; Story → Chapter 1 starts at the cold open; the menu says "About two hours" [FACT] |
| Not verified | A human playthrough on a real iPhone; real playtime; touch feel of the new walks and fights [FACT] |
| Working tree | Clean. The other session's "Ash Lane" commit `548db13` is an old commit already in history; it changed nothing now [FACT] |

### 1.1 What was implemented [FACT]
- **R6–R16 rebuilt and playable:**
  - the ward rounds and clock puzzle; Naomi stays, with the ticker
  - the Office walk, Lucas's new introduction, and Marr's offer
  - the Institute investigation: Core Resonance, G-7's memory, Containment Failure, Dess's own choice
  - Lucas's solo thread: the archive, the orphanage, Forgotten Memory, the playable morning after, the door choice, the courier pass, the Crane house
  - the ticker decode, Lights Out, the breakout with the cores choice and the escape protecting Dess
  - the tower: two walks, the gear puzzle, Cassie in the bell loft, Lucas's return
  - Naomi's warning and the debate
  - the Festival: clues, stewards, the cistern fight, the Unburdening, the Lantern Rig rescue
  - the Registry hall and the Record Keepers; Naomi at dawn
- **Save migration:** live at start-up, with a snapshot first and the original kept as `ch1b_pre_rev`.
- **New content:** 7 new choice pairs, 7 optional finds, Lore Updates v1.2.

### 1.2 What was simplified, changed or omitted against blueprint v3.1 [FACT]
| Blueprint | Shipped | Effect on the player |
|---|---|---|
| Forgotten Memory: phases at 75/50/25% boss HP | Phases at each quarter of a 12-kill goal | It feels like a wave fight with three "memory beats" rather than one boss |
| Lights Out: a moving cart | A defense of a stationary cart for 45 s | Similar to Containment Failure in structure (both are defenses); the difference is the enemy rule |
| Escape: an escort | A defense of Dess across 3 timed doors | Works; it reads as "hold the room" |
| A solo-fight level floor | Not added; enemies tuned low instead | **Risk:** a fresh save's Lucas may be level 1 in his solo fight. Tuned, but not human-tested |
| Rescue: people out, then wedge the beam | The old frozen rescue (carry 3 people, 24 s) | No "order" puzzle. The visuals are the old frozen-fire shards |
| Stopped Clock: the gear ticks if you stand still | Tally marks on the wall only | Fine; one less subtle hint |
| Record Keepers: arena shrinks to 60% | Up to 2 shelf blocks per lane | A runner can get stuck at a closed gate (harmless) |
| Containment: spawns from the cabinet side | Edge spawns | Less positional than designed |
| Kept but unused | The rooftop `cass` fight is still in the code | Dead code until a Cassie trial uses it |

### 1.3 Known bugs, limitations, technical debt
| # | Item | Severity | Label |
|---|---|---|---|
| L1 | No real-device playthrough of the new chapter | High (unknown) | [FACT] |
| L2 | Chapter length unmeasured: estimate ≈ 106 min main + ≈ 18 optional, about double the old chapter; the menu says "About two hours" | Medium | [FACT] |
| L3 | Solo fights without a level floor (Containment lvl 2, Forgotten Memory lvl 2) | Medium | [FACT] |
| L4 | Story fight difficulty was only tested by automation (instant wins), not by human play | Medium | [FACT] |
| L5 | The Lantern Rig uses frozen-fire visuals | Low | [FACT] |
| L6 | `index.html` is ~1 MB in one file; the full suite takes ~20 min and sometimes flakes under load (passes alone) | Medium (dev speed) | [FACT] |
| L7 | Lore Bible v2 PDF not updated; v1.1 and v1.2 updates sit in separate markdown files | Low now, High before Chapter 2 writing | [FACT] |
| L8 | Open UX decisions UX-R1–R6 (e.g. the combat HUD shown in Meridian) | Low–Medium | [FACT] |
| L9 | Bond unlocks undecided; the top Renown rank is reachable before Chapter 2 | Low | [FACT] |
| L10 | Old migration code stays forever (it must, for players returning later) | Low | [FACT] |
| L11 | Tests drive the game through developer hooks. They prove the logic, not the feel: touch timing, readability, pacing | — | [FACT] |

### 1.4 Consistency: implementation vs. Lore Bible vs. v1.2
- **Removed events** (rooftop ambush, lodging fire, Lucas at Window 3, Naomi travelling with the party): no references found anywhere outside Chapter 1 [FACT, by text search]. Meridian's 1,400+ lines were searched, not all read; a light read-through is recommended [REC].
- **Cassie:** her identity is unchanged (a vowed Sister and Office agent). Hub lines and her Bond Story don't mention the rooftop [FACT].
- **The Lore Bible PDF** still describes the old Scenes 7–12. `Lore_Updates_v1.2.md` overrides it, but that's easy to miss when writing Chapter 2 [FACT].
- **Mysteries kept:** the Mercy's mechanism is unstated (the cistern is "nothing provable"); the Demiurge isn't named; Lyra and the cloaked man are unexplained; Mercury appears only as a stamp; Horaios stays the Moon's Kosmokrator [FACT].
- **[Q] Two Mercury hints** (the "FORWARD: ARCHIVE" stamp and Cassie's "seven" page). Are they the intended level of foreshadowing for Chapter 2?

### 1.5 What could affect Chapter 2 [FACT]
- **Flags Chapter 2 must read:**
  - `c_lucas_door` (the rescue beat)
  - `c_cores_*`, `g7_seen` (Marr)
  - `c_crane_*` (Crane)
  - `cass_page`, `c_cass_*` (Cassie)
  - `c_fest_*`, `c_unburden_*`, `mercy_clues`, `registry_reads`
- **Where state lives:** flags live in `save.ch1b.flags`. Post-chapter systems read story state through `save.story` and `ch1Scene()`, so Chapter 2 needs a small, deliberate bridge to read Chapter 1 choices [REC].
- **Lucas:** captured in hub logic (`lucasState()`); his Bond waits for `ch2.lucasRescued` (already wired).
- **The scene sequencer** is linear, keyed by scene tags. A Chapter 2 sequence can reuse it directly; the migration pattern exists if Chapter 2 is ever revised.

---

## 2. Real-iPhone playtest plan

### 2.1 Before you start
1. Back up first: Builds → Backup → Download backup file.
2. Fully close the home-screen app and reopen it, so it loads the new version.
3. If you have an old mid-chapter save, note its scene. Migration will move you to the start of that revised scene. That's expected.

### 2.2 Checklist
**PWA and screen**
- [ ] Opens from the home screen; no blank screen; the title appears in under ~3 s.
- [ ] Landscape both ways; nothing under the notch or Dynamic Island; portrait shows the rotate notice.
- [ ] Text in dialogue and puzzle panels is readable at arm's length.

**Controls**
- [ ] The joystick moves smoothly in walks and fights; it stops when you lift your thumb.
- [ ] Talk/attack: one tap opens a conversation and it stays open (QA-07).
- [ ] Skills, dodge, ultimate and party-switch portraits respond while you're moving.
- [ ] Menus, tabs and toggles are easy to hit (the UX pass made their tap areas larger).

**Scenes to watch closely** (new mechanics, highest risk)

| Scene | Watch for |
|---|---|
| R6 ward clock | Can you work out the answer from the room? |
| R7 Office | Does Lucas's introduction feel natural? |
| R8 Core Resonance + G-7's memory | Is it clear what to do? |
| R8 Containment Failure (Kairos alone) | Too easy, too hard? |
| R9 Forgotten Memory (Lucas alone) | **Difficulty at your level**; do the "memory" beats register? |
| R9 the morning after | Does the kid walk read clearly? |
| R11 Lights Out, Escape | Is it clear what you protect, and does the goal panel stay out of the way? |
| R13 the gear puzzle | Do the tally marks make sense? |
| R13 Lucas arriving | Does his return land? |
| R15 stewards | Does "move along" feel fair? |
| R15 the cistern | Waxers |
| R15 the Lantern Rig | Do the visuals read as falling lanterns? |
| R16 the Stacks | Can you see the glowing runners? Do shelf seals feel fair? |
| R16 the ending | Naomi's arrival, the seven on the roof |

**Saves and transitions**
- [ ] Close the app mid-scene, reopen, Continue: you're at the same scene.
- [ ] Lose a fight on purpose: Retry restarts it, and nothing is lost.
- [ ] Pause → World map → Close → Resume works in Meridian (QA-06).

**Performance**
- [ ] No long stutters in the Festival (the most NPCs) or busy fights; no crash or reload; the phone doesn't get very hot.

**Pacing (please time it)**
- [ ] Note the clock time at the start of R6, R9, R13, R15 and the ending. This replaces the estimate with real numbers.

### 2.3 Bug report template
```
Where:      (scene, e.g. "R11 Escape" or "Meridian · Market Ring")
What I did: (steps, as exact as you can)
What happened:
What I expected:
How often:  always / sometimes / once
Severity:   blocks me / annoying / cosmetic
Phone:      model, iOS version, Safari or home-screen app
Screenshot: (attach if you can)
```

---

## 3. Priorities (ranked) [REC]
| Rank | Area | Why it matters now |
|---|---|---|
| **1** | **Playtest fixes for Chapter 1** (your iPhone run) | Chapter 1 just doubled in size and was never played by a human. Everything later builds on it, and the first chapter decides whether people keep playing |
| **2** | **Chapter 1 pacing and balance** (from your timings) | ~1h45 is long for a first chapter. Real numbers will show which optional or slow parts to tighten, and whether the solo fights need a level floor (L3/L4) |
| **3** | **Chapter 2 preparation and continuity** | Fold Lore v1.1 and v1.2 into the Bible (L7), list every Chapter 1 flag Chapter 2 reads, and decide the Archive's scope. Cheap now, expensive if skipped |
| **4** | **Technical groundwork for content** (L6) | A flag/consistency checker (every flag read somewhere is set somewhere), a faster "story smoke" test set, and small scene-authoring helpers. Chapter 2 will be as big as Chapter 1; this makes it safer and faster |
| **5** | **Remaining UI/UX decisions** (UX-R1–R6) | Mostly small, but R1 (combat buttons shown in the hub) affects every Meridian session |
| **6** | **Combat balance** (story vs. Rifts and Trials levels) | Matters once real-play data exists; no evidence of problems yet |
| **7** | **Progression** (Bond unlocks, Renown ranks for Chapter 2) | Needs your design decision; it can ride along with Chapter 2 |
| **8** | **Recollections and optional quests** | Good content exists. Add more only where it serves Chapter 2's cast (e.g. a Cassie trial using the retired fight, a Theo/Marr story), not just for more content |
| **9** | **World exploration and immersion** | The hub is already rich. Revisit after Chapter 2's places are known |

---

## 4. Phases [REC]
| Phase | Content | Depends on | Priority | Definition of done |
|---|---|---|---|---|
| **A · Playtest fixes** | Fix what your iPhone run finds; rerun the related tests and visual checks | Your report | P0 | Every "blocks me" and "annoying" item fixed or consciously deferred; a second short iPhone check of the fixed scenes; deployed only with your approval |
| **B · Pacing and balance pass** | Use your timings to tighten slow spots (no story beats cut without approval); decide on a solo-fight level floor; check story-fight difficulty at typical levels | A | P1 | The main path is in the range you choose; solo fights beatable at the levels a normal player has; the Story menu's time is honest |
| **C · Canon consolidation** | Fold v1.1 + v1.2 into Lore Bible v3 (or one consolidated markdown); a Chapter 1 → Chapter 2 continuity sheet (flags, open threads, who knows what) | — (can run beside A/B) | P1 | One source of truth for Chapter 2 writing; you sign it off |
| **D · Content tooling** | A flag consistency checker; a quick "story smoke" test (< 3 min); helpers for walks, puzzles and fights; keep the suite under ~10 min if possible | — | P2 | Checker runs in the suite; adding a scene needs no new test scaffolding |
| **E · UX decisions** | UX-R1–R6 as you decide | Your decisions | P2 | Decided items done and verified at all five sizes |
| **F · Chapter 2 blueprint** | Design "The Archive" with the v3 method (play, don't watch), based on C | C (and A/B lessons) | P1 after C | Your approval of the blueprint |
| **G · Progression and optional content for Chapter 2** | Bond unlocks, Renown ranks, Chapter 2-relevant Recollections | F | P3 | Designed with F, built with Chapter 2 |

**Recommended order:** A → B (with C alongside) → D → F → E/G as Chapter 2 needs them.

---

## 5. Open questions for you [Q]
1. What length do you want for Chapter 1 (keep ~1h45, or trim toward ~75–90 min)?
2. Should solo fights get a level floor (fair for every save), or stay tuned low?
3. UX-R1: hide or relabel the combat buttons in Meridian?
4. Bond unlocks and Renown ranks for Chapter 2: design now or with Chapter 2?
5. Are the Mercury and Archive hints at the right strength for Chapter 2's reveal?

---

## 6. The single most important next step [REC]
After your playthrough: **a Chapter 1 stabilisation pass driven by your notes and timings** (Phases A + B).

The revised chapter is the biggest change the game has had, and it has only been played by automation. Fixing what a real player hits, and tuning its length and the two solo fights, protects everything that comes after. Chapter 2 work should start only once Chapter 1 feels right in your hands.
