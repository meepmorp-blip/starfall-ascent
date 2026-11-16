# Chapter 1 Revision · Implementation tracker

Branch: `ch1-revision`. Source of truth: `CH1_REVISION_BLUEPRINT.md` v3.1. Lore: `docs/Lore_Updates_v1.2.md`.

| Stage | Scenes | Status | Commit | Tests |
|---|---|---|---|---|
| 1 | Infrastructure: `leave`/`rejoin`, `met`, migration | ✔ Done | `3caee0a`, `e89a06a` | `ch1_migration_test` 11/11 |
| 2 | R6 St. Lucia's, R7 Concord Office | ✔ Done | `8b98243` | `ch1_revised_test` part 2: 24/24 desk, 24/24 phone |
| 3 | R8 the Institute | ✔ Done | `8b98243` | part 3: 14/14 |
| 4 | R9 Lucas's thread, R12 the Crane house | ✔ Done | `8b98243` | part 4 (with R10–R11): 32/32 |
| 5a | R10 the plan + ticker, R11 the breakout | ✔ Done | `8b98243` | (in part 4) |
| 5b | R13 the clock tower, R14 Naomi's warning | ✔ Done | `a44d437` | part 5: 15/15 |
| 6 | R15 the Festival | ✔ Done | `0b49894` | part 6: 14/14 |
| 7 | R16 the Registry → dawn; migration ON; Lore v1.2 | ✔ Done | `0b49894` | part 7: 11/11; `ch1_save_migration_test` 23/23 (live) |
| 8 | Full Chapter 1 QA, fixes, release | ✔ Done | (release commit) | full suite 86/86 runs after fixes; final rerun 13/13 runs (555 checks); see `docs/CH1_QA_REPORT.md` |

## Where each scene lives (`CH1_SEQ` tags)
| Tag | Scene |
|---|---|
| Scene 6 | St. Lucia's |
| Scene 7 | The Concord Office |
| Scene 8 | This Won't Hurt |
| Scene 9 | The Long Way |
| Scene 9.5 | The Plan |
| Scene 9.6 | Breakout |
| Scene 9.8 | The Crane House |
| Scene 11 | The Clock Tower |
| Scene 11.5 | Naomi's Warning |
| Scene 12 | Festival of the Mercy |
| Scene 13 | The Registry |
| Scene 14 | Intake Window 1 |

Scene 10 (the rooftop) is retired.

## Compromises against the v3.1 battle specs (existing systems only)
| Spec | Built as | Why |
|---|---|---|
| Forgotten Memory: phases at 75/50/25% boss HP | Phases at each quarter of the **kill goal** (Collector + Gossips). Each phase: 0.9 s slow-motion ("time stutters"), a memory line, +10% attack (stacks to 3) | The fight system counts kills, not one boss's HP. Same feel, no new boss AI |
| Lights Out: a cart moving along a path | **Defense of the laundry cart** (45 s) against Spotlight Vices' lines and Hotheads | Escort moves a carrier character, not a prop. The distinct rule (break spotlight lines) is kept |
| Escape: escort of Dess | **Defense of Dess at the seal doors** (36 s, three timed doors; each door opening heals her a little). You pick 2 fighters and Dess isn't one | Same reason. "Protect someone who has to stand still" is kept |
| Containment: spawns from the cabinet side | Spawns from the arena edges (as all defense fights) | No side-spawn option in defense; the devourer pull is kept |
| Solo-fight level floor | Not added. Solo fights are tuned low instead (Containment lvl 2; Forgotten Memory lvl 2 with 12 kills) | Avoids touching character stats; numbers checked in play tests |
| Rescue: "move people, then wedge the beam" | The existing frozen rescue: carry 3 people out from under the rig in 24 s. No separate beam step | The frozen mission has no wedge object; the order-under-a-clock idea is kept by the timer |
| Stopped Clock: "the right gear ticks if you stand still" | The chalk tallies on the wall are the clue (read them, then turn the gears) | No idle-detection hook in walks |
| The Record Keepers' "arena shrinks to 60%" | A record reaching the far wall seals a shelf block into that lane (up to 2 per lane) | The split arena is two lanes; blocks narrow a lane without new collision code |

## Notes for later
- Chapter 2 rescue: one beat reads `c_lucas_door`. Marr's Chapter 2 file reads `g7_seen` and `c_cores_*`.
- The retired `cass` rooftop fight is still defined (unused) for a future Cassie trial.
