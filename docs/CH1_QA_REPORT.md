# Chapter 1 Revision · QA report

Date: 2026-11-17 · Branch: `ch1-revision`.

All testing is automated in headless Chromium, playing the real sequencer:
- cutscenes, choices, walks, puzzles and fights
- desktop 1280×720
- phone landscape 844×390, touch, DPR 2

**No physical-iPhone playthrough has been done yet.**

## A. Verdict
**PASS WITH WARNINGS.**
- Every revised scene plays end to end.
- Every new mechanic has been exercised.
- Old saves migrate without losing anything.
- The full suite passes.

Warnings:
- A human playthrough hasn't been timed.
- The compromises against the v3.1 battle specs are listed in the tracker.
- Real-device feel (touch and pacing) is still to be checked.

## B. What was tested
| Area | Test | Result |
|---|---|---|
| R6 → R7 (hospital, Office) | `ch1_revised_test` part 2 | 24/24 desk, 24/24 phone |
| R8 (Institute) | part 3 | 14/14 |
| R9 → R12 (Lucas, plan, breakout, Crane house) | part 4 | 32/32 desk, 32/32 phone |
| R13 → R14 (tower, warning) | part 5 | 15/15 |
| R15 (Festival) | part 6 | 14/14 |
| R16 → dawn (Registry, ending) | part 7 | 11/11 |
| Whole chapter, start to clear, including a deliberate loss and a reload mid-chapter | `core_probe_test` | 20/20 desk and phone |
| Save migration, live | `ch1_save_migration_test` (19 real-shaped old saves) | 23/23 |
| Infrastructure | `ch1_migration_test` | 11/11 |
| **Full suite** | `run_tests.js` (all 31 test files at their sizes) | see § E |

**What the scene tests check:**
- **Puzzles:** every new puzzle is answered wrong first (the right feedback), then right.
- **Choices:** every new choice sets its flag, and later scenes read it:
  - Dess remembers the cores
  - Lucas's "I came back" before the Gate
  - Theo's cart line
  - Cassie's lines at the Festival
- **Rewards:** every optional reward pays exactly once.
- **Party (§ 3g):**
  - Naomi is off the party after R6 but still met.
  - Lucas leaves after R11 and rejoins at R13.
  - Dess joins at R11; Cassie at R15.
  - Every pick offers only who is there (the cistern pick is 6, the Festival 7, the escape 2 plus Dess protected).
- **Battles:**
  - Containment Failure: lost on purpose, then Retry restarts it.
  - Forgotten Memory: phases stack +10% to +30%.
  - Lights Out: fixed party.
  - Escape: the doors open as you hold.
  - Record Keepers: a runner appears.
  - The scripted Horaios loss plays out.
- **Ending:** Naomi arrives at dawn; the chapter is marked cleared.

## C. Bugs found during implementation and fixed
| # | Bug | Fix |
|---|---|---|
| 1 | Locked walk objects showed their full text early (the walk fell back to the normal lines when no "wait" line existed) | Every locked object now shows a "Not yet" line; the new ones have their own wait lines |
| 2 | Escape: Dess was both the protected NPC and a fighter in the party ("DESS IS DOWN" while she stood at the door) | Pick 2 fighters; Dess is only the one protected |
| 3 | Defense goals lower-cased names ("Protect dess…") | `goalText` on the new fights |
| 4 | On phones the goal panel covered the protected object (all defense fights) | The object moved below the panel |
| 5 | Ward and Festival: a floating "?", the clerk standing on the fountain, Dess under the touch buttons, a steward label over Tessa's | Positions fixed |
| 6 | Tower: Kairos started inside a gear prop | New start point |
| 7 | Stacks: the record-runner spawned on top of the party | Spawns a third of the way down the aisle |

## D. Save safety
- Migration runs once at start-up:
  - a forced snapshot first
  - the original kept as `ch1b_pre_rev`
  - only `ch1b` replaced
- Already-migrated, empty and damaged saves are left alone.
- **19 real-shaped old saves** cover every row of the § 10 table, plus a new player, a cleared chapter, already migrated, no Chapter 1 data, and damaged. Each resumes at the start of the right revised scene with **exactly the party that scene expects**.
- Nothing is lost: levels, equipped fragments, Stardust, Keepsakes, claims, Bonds, star ratings, finished quests, story flags, clears.
- Continue really resumes there.
- A cleared save keeps its place and gets only the `met` list.
- Ash Lane stays open for anyone past the old Scene 10.

## E. Regression
**First full run after Stages 2–7:** 86 runs, 2,680 checks, 20 min, 6 at a time. 80 runs passed and 6 failed, all of them tests that encoded the *old* chapter:

| Test | Old expectation | Fix |
|---|---|---|
| `core_probe` ×2 | Naomi in the party at the end | Now: all eight met, Naomi at the hospital |
| `ch1_migration` | "nothing moves while the switch is off" | Now: migrates on load |
| `quest_system` ×3 | A cleared save's `ch1b` byte-identical | Now: the progress fields identical; the revision only adds `met` |

**Rerun of those 6 plus the scene test:** 8 runs, 408 checks, **all passed**.

After the last fixes (the defense object position, NPC moves):
- `ch1_revised` phone part 4: 32/32.
- Defense and chapter regression: see the line below.

**Final rerun** (`story_battles`, `bond_agnes_bram` with Bram's oven defense, `core_probe` with the full chapter on desktop and phone, `ch1_revised` desktop and phone, `ch1_save_migration`, `qa_probe` at 3 sizes): **13 runs, 555 checks, all passed.**

## F. Duration
- **Content:**
  - 96 sequence steps (was 65)
  - 18 scenes (was 15)
  - 109 cutscene panels with 684 lines, plus the walk dialogue
  - 28 missions (was 18), plus the Stacks and the Horaios fight
  - 15 cutscene choices, 6 sequence puzzles, and the walk puzzles
- **Automated playthrough** (cutscenes skipped, fights won instantly): about 6.5 min desktop, 8.5 min phone. This is *not* a human time.
- **Human time is not measured yet.** The blueprint estimate stands: ≈ 106 min main + ≈ 18 min optional. It should be checked by timing one real playthrough on the iPhone.

## G. Known issues and warnings
- **Battle-spec compromises:** Forgotten Memory uses kill phases, Lights Out and Escape are defenses, there is no solo level floor, and the rescue has no separate beam wedge. See the tracker. Each keeps its distinct rule.
- **The Lantern Rig rescue** reuses the frozen-fire mission's look: the stopped debris draws as white shards, which reads as shattered lanterns mid-fall.
- **Not yet checked on a real phone:**
  - touch feel of the new walks
  - the stewards' "move along" push-back on touch
  - reading comfort of the longer scenes
- **Not human-timed:** the length of the chapter.
