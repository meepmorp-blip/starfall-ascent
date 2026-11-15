# Pre-Chapter 2 Narrative Expansion · Implementation Audit and Decisions

Source specification: *Pre-Chapter 2 Narrative Expansion: Character Recollections, Hangouts & World Side Quests* (owner, 2026-11-16).
Canon authority: `Starfall_Lore_Bible_v2.pdf`, `Lore_Updates_v1.1.md`.
Audited against `index.html` at `fcd37fc` (World Expansion Stages 1–3; Stage 4 Ash Lane in progress).

## 1. Reusable systems (found in code)
| System | Code | Used for |
|---|---|---|
| Quests | `MX_QUESTS`, `mxStart`, `mxTick`, `mxTracked`, Journal (`showJournal`) | All Bond Stories and side quests (extended with states and prerequisites, not replaced) |
| People and dialogue | `mxPeople(d)` with `say`/`then`/`mark`, `amb:1` small talk, `MX_ROUTES`, `MX_VOICE` (murmurs) | Quest givers, clue NPCs |
| Records and readables | `MX_FINDS`, `MX_LOOKS`, Records in the Journal | Collectibles and story documents |
| Scripted sequences | `runSeq(seq,{roster,flags,save,end})`: cutscene panels (`pn(bg,cast,lines)`), choices, walk scenes, fight missions; child sprites (`KID`), speakers `kidk`/`kidl` | Character scenes, Lucas memories, Dess trigger |
| Fights | `addMission(id,{type:'fight',…})`, `startMission(id,party,done)` | Small battles |
| Activities | Drill (timed), `mxSeqStep` (ordered), pages/folders (collect + `showPuzzle`), hide-and-seek, Odd Things (clue hunt), push/break/lever objects | Minigames |
| Rewards | `grantReward(reward,key)` + `save.claims`; Stardust, Keepsakes, Mastery, Star Fragments | Once-only quest rewards |
| Character progress | Bonds: `bondUp`, `bondOf`, `BOND_MAX=5`, `bondHearts` | "Bond Story" progress |
| World map | `WORLD_LOCS` with `need`, `wmStatus`, `drawWorldMap` | Quest markers, the hideout |
| Story progress | `save.ch1b` (`k` scene key, `done`), `save.ch1Clears`, `ch1Scene()` | Era switch, gating |

## 2. Decisions (approved by the owner, 2026-11-16)
1. **Story era.** After Chapter 1 is cleared, Meridian enters a **Fugitives** state:
   - The party lives at the Clock Tower hideout.
   - Party members no longer stand around the Garrison Yard or St. Lucia's.
   - Wanted notices go up, and townsfolk get a few post-Chapter 1 lines.
   - Before the clear, the hub stays "before the Festival" exactly as it is.
2. **Naming.** The quests are **Bond Stories**, not "Recollections". Recollection already means character level, and it is also the name of Dess's Ultimate. "Recollection progress" rewards become **+1 Bond**.
3. **Dess.**
   - Records about an unnamed **"Subject"** with dates that fit her age, in Marr's hand. Nothing confirms it is her childhood (that is Chapter 2's reveal, Lore Part 18).
   - The girl of light stays unexplained.
   - Location: a disused **Institute annex**, reusing the `lab` art.
4. **The Mercy.**
   - The Naomi & Theo story and "Sunday Cups" show worsening memory without explaining it.
   - Neither links it to the water; Chapter 2 Scene 3 keeps that reveal.
5. **Lucas.**
   - Part A, episode 1 is a different bread memory and does not repeat Scene 9's "the cat did it" lines.
   - Part B is built as *locked by story* (Chapter 2 rescue) with no content until Chapter 2 exists.
   - Present-day Lucas never appears before the rescue.
6. **Lore that isn't canon yet.**
   - The Buried Books and old chapels ([DRAFT]) and the Keepers, Unbound and Hollow Choir (new) appear as rumour and hints.
   - The Beyond-the-Wall traveller is unreliable.
   - Sketches and paintings, not photographs.
   - Every new fact is logged in `docs/narrative/LORE_ADDITIONS.md`.

## 3. Stages
| Stage | Content |
|---|---|
| **A · Foundation** | Fugitives era; quest states and prerequisites; quest markers in the world and on the map; hub↔fight↔hub and hub↔scene glue; the Clock Tower hideout |
| B | Bram · *The Smell of Fresh Bread* |
| C | Agnes · *A Little Something Handmade* |
| D | Naomi & Theo · *The Things We Couldn't Save* |
| E | Lucas · Part A (three memories); Part B locked by story |
| F | Cassie · *A Prayer of Her Own* (old chapel) |
| G | Dess · *The Girl in the Experiment* (unlocks after B–F) |
| H, I | World side quests, two batches of four |

## 4. Quest states
`locked_by_story` · `locked_by_prerequisite` · `undiscovered` · `available` · `active` · `completed`, derived from:
- `save.mx.q[id]` (`active` / `done`, existing)
- `save.mx.qseen[id]` (discovered)
- each quest's `story` condition (for example `ch1Scene()>=99`) and `pre` list (quest ids that must be completed)

## 5. Save compatibility
- New fields live only under `save.mx` (`qseen`, `era` is derived, not stored) and `save.claims`. Bonds use the existing `save.bonds`.
- Old saves load unchanged.
- The pre-Festival hub is unchanged for players who haven't cleared Chapter 1.

## 6. Stage A · Foundation (built)
| Piece | Code |
|---|---|
| Era | `mxEra()`: `'before'` until Chapter 1 is cleared, then `'fugitive'`. Derived, never stored |
| Fugitive hub | Party members leave the Yard and St. Lucia's (`cond` checks the era); the Meridian menu reads "after the Registry"; wanted notices in the Market Ring and Festival Square (`MX_LOOKS` entries with `era:'fugitive'`); Matteo, Rosa and the fish vendor get one fugitive-era line each (their quest lines still come first) |
| Hideout | District `tower` (World Expansion Stage 5): six party members, workbench → Builds, notice board → Journal · Stories |
| Quest states | `mxQState(id)`; quests may carry `kind` (`'bond'`/`'side'`), `story()`, `pre:[ids]`, `at`, `giver`; steps may carry `at` |
| Discovery | `mxDiscover(id)` sets `save.mx.qseen[id]` and shows a "New story" banner; `mxStart` also marks a quest seen |
| Markers | `mxQuestPlaces()`: a gold "!" on world-map places and beside exit labels leading to an available quest's giver or an active quest's current step |
| Journal | A **Stories** tab lists Bond and world stories that are available, active or completed, and counts the locked ones |
| Rewards | `grantReward({bond:[ids]})` raises Bond by 1 each (once per claim key) |
| Glue | `mxFightTheme(theme,opts)` builds a hub fight; `mxFight(id,party,cb)` and `mxScene(panels,cb)` return to the same district afterwards |

Test: `tools/narrative_foundation_test.js` (33 checks, desk/phone/small).
