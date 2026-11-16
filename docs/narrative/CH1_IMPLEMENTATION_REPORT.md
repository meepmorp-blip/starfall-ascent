# Chapter 1 Revision · Implementation report

Branch `ch1-revision` · blueprint v3.1 · lore `docs/Lore_Updates_v1.2.md` · tracker `CH1_IMPLEMENTATION_TRACKER.md` · QA `docs/CH1_QA_REPORT.md`.

## What changed, scene by scene (all playable)
| Scene | Was | Now: what the player does |
|---|---|---|
| **R6 St. Lucia's** | Exam, reader puzzle, ward rift, a short ward walk; Naomi joins | Same start, then **Rounds with Naomi**: 3 optional patients (birthday, a drawing of a fountain never seen), and bed four's drawer watch plus the nurses' chart as clues for the **ward-clock puzzle** (turn it forward one minute). Optional medicine shelf (30 Stardust). Theo proposes the Office; **Naomi stays**, Theo gives her a **ticker**. `{leave:'noemi'}` |
| **R7 Concord Office** | Lucas is the clerk at the window; Marr's guards take Kairos | **A walk through the hall** (clock-log board, Houses directory, the Festival notice, Agnes and Bram as NPCs; Theo goes to file his report). A **records clerk** finds nothing. **Choice** `c_office_plead` / `c_office_angry`. **Lucas** crosses the hall, reads the slip, `c_truth`/`c_lie`, "Records don't go missing. They go to the Registry", keeps the slip and leaves. **Marr** at the next window offers a consultation; Kairos **goes willingly**. Theo returns: three lines of history. The Institute gate refuses them |
| **R8 Institute** | Three cutscene panels | **A walk in the consultation room**: Theo's decommissioned reader, the G-7 log, the humming cabinet, Dess, the roster and the "patrons" letter (20 + 20 Stardust). The needle (kept choice). The **little star** core (kept). **Core Resonance**: pick the core pulsing at 140 a minute. **G-7's memory** as a 3-object walk. **Containment Failure**: defense of the containment pylon, solo. After: "retained indefinitely", 23:15; Dess hides the real core |
| **R9 Lucas** | One walk (`longway`) and cutscenes | **The archive** (his own intake page; clues unlock in order) → `longway` → **Sister Agathe** (a choice that only orders the telling) → **the old wing** (3 childhood objects, a Keepsake for all three) → **Forgotten Memory** (solo; every returning memory slows time and gives +10%) → the fire (kept) → **the morning after**, played as nine-year-old Lucas → **`c_lucas_door`** (knock or walk past) → the cup → **the transfer register and courier pass** |
| **R10 The Plan** | Safehouse cutscene; Lucas knocks | Safehouse with Agnes, Bram, Theo. **Ticker decode puzzle** (a half-torn code card: LAUNDRY / SERVICE STAIRS). Opens **Ash Lane** |
| **R11 Breakout** | assault, sneak, cores puzzle, escape | **Lights Out** (Agnes, Bram, Theo defend the laundry cart from spotlight Vices) → **Lucas through the courier lift** → `assault` (pick from Agnes, Bram, Theo, Lucas) → held minute + `sneak` (kept) → Dess's own reasons → cores puzzle (kept) → **choice `c_cores_free`/`c_cores_keep`** → **Escape: protect Dess at three seal doors** (pick 2) → **Marr in the gallery** → "I'm sorry / you came back" → **Lucas leaves** |
| **R12 Crane house** | One cutscene | **A walk as Lucas** (his childhood chair, the commendation, the silver cup), then the confrontation (kept) with **choice `c_crane_why`/`c_crane_warn`**. He takes his coat |
| **R13 Clock Tower** | Walk with everyone (Naomi, Lucas present); rooftop scene before it | **Evening walk without Lucas**: Bond talks (Agnes's report, Bram's toast, Theo's drone, **Naomi by ticker**, Dess's line follows the cores choice), K+L carved on a beam, an emergency marble (25 Stardust), **the stopped-clock gear puzzle** (the children's tally marks on the wall) → **Cassie in the bell loft** (in her habit, praying; `c_cass_ask`/`c_cass_leave`; the Mercy vial; "be gone in two days") → **Lucas arrives at 02:00** from his own memory (`rejoin`) → **night walk**: Lucas's vow, **Cassie's dropped hymnal page** (Star Fragment), the dead-clock vision (kept) → Lyra (kept, trimmed) |
| **R14 Naomi's Warning** | (new) | The last ticker messages (the wire is cut). A **debate** where everyone has a reason, Agnes says no, and **Kairos decides**: `c_fest_tessa`/`c_fest_answers`. Armbands and veils |
| **R15 Festival** | Walk + cutscenes + defense | **Festival walk**: 3 clues about the water (40 Stardust), **stewards who turn you back**, Bram's errand (kept), Lucas and Dess as NPCs, Cassie (kept; lines follow the tower). **Cassie covers for them** → **the Cistern Stair** fight (waxers first) → the vats (nothing provable) → **the Unburdening** (`c_unburden_*`) → Tessa's mother (kept) → Cassie's badge (kept) → eclipse → **the Lantern Rig** (stopped-minute rescue) → Cassie joins → **Protect the Crowd** (pick 3 of 7) → Vices turn to the Registry → **Marr's unseen panel** → the **afternoon lockdown and dusk** |
| **R16 Registry → dawn** | Cutscenes + gates + Stacks + Window 1 | **The Registry hall walk** (aisles by House, warm "Unburdened" folders, two charts for one woman, "FORWARD: ARCHIVE", a Keepsake for all four; Theo's cart line if all 3 Festival clues) → gates (kept) → **the Stacks with the Record Keepers** (glowing Collectors carry records; a lost one seals a shelf) → Intake Window 1 / Horaios (kept) → **"I came back"** (`c_lucas_door`) → the Gate → collapse → **Naomi arrives at dawn**: seven on the roof → coda (kept) |

## New and changed battles
| Fight | Rule |
|---|---|
| Containment Failure | Defense of a pylon; Devourers pull you off it |
| Forgotten Memory | Solo; memory phases buff Lucas |
| Lights Out | Defense of a cart against spotlight lines |
| Escape | Defense of Dess across 3 timed doors |
| The Cistern Stair | Kill the healers first |
| The Lantern Rig | Stopped-minute rescue |
| The Stacks | + the Record Keepers rule |
| `assault` | 17 kills (from 20), no healer |
| `festival` | 90 s (from 100), pick of 7 |

**Retired:** the rooftop `cass` fight (kept in code).

## Puzzles
| Scene | Puzzle |
|---|---|
| R6 | Ward clock (new); reader (kept) |
| R8 | Core Resonance (new) |
| R10 | Ticker decode (new) |
| R11 | Cores (kept) |
| R13 | Gear train (new); Agnes's report and Theo's drone (kept) |
| R15 | Lantern signs (kept) |
| R16 | House gates (kept) |

## Choices (new)
`c_office_plead`/`c_office_angry` · `c_lucas_door`/`lucas_walked` · `c_cores_free`/`c_cores_keep` · `c_crane_why`/`c_crane_warn` · `c_cass_ask`/`c_cass_leave` · `c_fest_tessa`/`c_fest_answers` · `c_unburden_write`/`c_unburden_skip`.

Each is read later where the blueprint says.

## Optional finds (once per save, existing currencies)
| Scene | Find | Reward |
|---|---|---|
| R6 | Medicine shelf | 30 Stardust |
| R8 | Roster, letter | 20 + 20 Stardust |
| R9 | 3 childhood objects | Keepsake |
| R13 | Marble | 25 Stardust |
| R13 | Hymnal page | Star Fragment |
| R15 | 3 clues | 40 Stardust |
| R16 | 4 reads | Keepsake |

## Engine changes (small, generic)
- **Sequence steps:** `{leave}` / `{rejoin}`, and `ch1b.met`, which the Meridian "met" check reads.
- **Save migration:** runs at start-up, after a snapshot, and keeps the original as `ch1b_pre_rev`.
- **Walks:**
  - Locked objects never show their content early; they show a "Not yet" line.
  - Church stewards can walk short beats and turn the player back.
- **Fights:**
  - `memory` phases for kill fights.
  - `doors` for defense fights.
  - Ward drawings for the pylon, the cart and Dess at a door.
  - `goalText` on defense goals.
- **The Stacks:** Record Keepers runners and shelf seals.
- **Ash Lane:** unlocks at the plan's flag, or at old Scene 10+.

## Files
- `index.html`: the game.
- New tests: `tools/ch1_revised_test.js`, `tools/ch1_save_migration_test.js` (with `tools/fixtures/ch1_old_saves.json`), `tools/ch1_migration_test.js`.
- Updated tests: `tools/core_probe_test.js`, `tools/run_tests.js`.
- Docs:
  - `docs/narrative/CH1_REVISION_BLUEPRINT.md`
  - `docs/narrative/CH1_IMPLEMENTATION_TRACKER.md`
  - `docs/narrative/CH1_IMPLEMENTATION_REPORT.md`
  - `docs/CH1_QA_REPORT.md`
  - `docs/Lore_Updates_v1.2.md`
