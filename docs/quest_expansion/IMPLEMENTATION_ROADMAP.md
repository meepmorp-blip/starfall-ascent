# Implementation Roadmap · Pre-Chapter 2 Expansion

**Architecture**
- Everything lives in `index.html`: vanilla JS, Canvas 2D, one file.
- **Quests** extend the existing `MX_QUESTS` / `mxTick` / `grantReward` / Journal; there is no second framework.
- **Places:** Meridian districts are walk scenes (`MX_DISTRICTS`, `mxPeople`, `MX_FINDS`, `MX_LOOKS`, `mxExtras`).
- **Fights:** use `startMission`.
- **Scenes:** use `runSeq` / `playCutscene`.
- **Tests** are Playwright scripts in `tools/`, run one at a time because `serve.js` uses port 5190.
  - Each takes `desk|phone|small`.
  - Each writes `out/<prefix>_<mode>_log.txt` with PASS/FAIL lines.

**Order vs. the recommended list**
- **Stages 1 and 2** are merged. The world-map markers were already needed by Stage A, so they are already built.
- **Stage 7 (side quests)** is split into two batches:
  - Batch 7a has no new district.
  - Batch 7b shares the old chapel with Cassie, so it comes after Stage 5.
- **Dess (Stage 8)** stays after every prerequisite story exists. Before that, her unlock can only be tested with test quests.

## Every stage must pass
- Its own test at **desk, phone and small**.
- `chest_spots.js check`.
- Regression: `narrative_foundation`, `ashlane`, `office`, `hesper`, `worldmap` and `exploration_polish` (×3 viewports); `exploration_test`, `meridian_playtest` and `economy_test` (desk and phone).
- No page errors.
- Canon check (`NARRATIVE_CANON_CHECKLIST.md`) for its quests.
- The `QUEST_CONTENT_TRACKER.md` rows updated.
- A local commit only with the owner's go-ahead. No push or publish without approval.

---

## Stage 0 · Narrative Stage A (done, `86d3cce`)
- **Scope:**
  - The fugitive era after the Chapter 1 clear.
  - The Clock Tower hideout (World Expansion Stage 5).
  - First quest states and markers.
  - Hub fight and scene glue.
- **Test:** `narrative_foundation_test.js`, 33 checks ×3, passing.

## Stage 1+2 · Quest System Foundation and discovery (done, `132b346`)
- **Scope:**
  - A data model for every story quest.
  - The six states, saved.
  - Discovery from NPCs, readables, records and places.
  - Givers with offers; "!" on NPCs, exits and the world map.
  - Multiple objectives per step.
  - Repeatables only by flag.
  - Rewards (Bond, Memories, collectibles).
  - Story flags.
  - Dess-style prerequisites; Lucas story states.
- **Features:**
  - Quest definition fields: `kind`, `char`, `at`, `giver`, `npc`, `offer`, `when`, `story`, `pre`, `found`, `autoFind`, `steps[].objs`, `reward`, `first`, `repeat`, `sets`, `onDone`.
  - `MXO` objective builders: `flag`, `item`, `find`, `look`, `visit`, `won`, `quest`.
  - Functions: `mxQState`, `mxDiscoverPass`, `mxOfferAt`, `mxNpcWanted`, `storyFlags`/`storyFlag`/`setStoryFlag`, `lucasState`, `MX_GATES`.
  - `grantReward` gains `xp` and `rec`.
  - The Journal Stories tab covers bond/memory/hangout/side; the Quests tab keeps the city quests.
- **Files:** `index.html`, `tools/quest_system_test.js`
- **Depends on:** Stage 0
- **Acceptance:** all 15 test-plan areas in `QUEST_TEST_PLAN.md` § 2 pass at desk, phone and small; regression green.
- **Possible regressions:**
  - Journal Quests tab: story kinds are now filtered out.
  - NPC marks: "!" takes priority.
  - `mxMigrate`: now limited to `main`/`optional` quests with a reward.
- **Done when:** the tests pass (see § Results below) and the owner approves.

## Stage 3 · Agnes and Bram (done, `d3ee5a0`)
- **Scope:** `agnes_handmade`, `bram_bread` (tracker § 4).
- **Features:**
  - Discovery: the workbench, then Agnes; the bakery smell at Hesper.
  - Material and ingredient objectives (`objs`).
  - Assembly puzzle (`showPuzzle`); baking sequence (an `mxSeqStep`-style sequence).
  - Roof target drill; bakery defence (`mxFightTheme('street')`).
  - Scenes via `mxScene`; Bond, Stardust, Keepsake and collectible rewards.
  - One new townsperson (the baker) with existing figure art.
- **Systems:** Stage 1+2, Drill, `mxSeqStep`, `showPuzzle`, `mxFight`, `mxScene`.
- **Files:** `index.html`, `tools/bond_agnes_bram_test.js` (new), `docs/narrative/LORE_ADDITIONS.md`.
- **Acceptance:**
  - Both stories can be found in the world without opening the Journal.
  - Both can be finished in either order.
  - Each pays once.
  - Bond +1 for the right character.
  - The collectible shows in Stories.
  - No canon-row violations (rows 1, 2, 9).
  - Chest spots still valid around any new NPC.
- **Possible regressions:** chest spots near new NPCs; the Hesper hide-and-seek spots; Ash Lane's Odd Things.

## Stage 4 · Naomi and Theo (Implemented, tested · not committed)
- **Scope:** `lark_couldnt_save`.
- **Features:**
  - The misfiled chart readable.
  - Four note pages (`objs`).
  - A timeline-order puzzle.
  - The "find the reading" mini-activity, reusing the Odd Things nearest-object logic.
  - The defend-Naomi hub fight (hospital theme).
- **Acceptance:**
  - The patient's decline is unexplained.
  - Spoiler regex: no "water", "Mercy causes" or "fountain" as the cause.
  - Bond +1 for Naomi and Theo.
- **Possible regressions:** the Rounds quest at the ward; ward chest spots.

## Stage 5 · Cassie (+ the old chapel district)
- **Needs approval first:** a new district (tracker § 6.2).
- **Scope:** `cass_prayer`; the old chapel walk district (chapel theme, painted props, collision, chest spots or none).
- **Features:**
  - The prayer-book readable at the Cloister.
  - Three writings to recover.
  - A symbol puzzle.
  - Two keepers (new NPCs).
  - A chapel defence.
  - A world-map entry: need `{clear:1}` plus `oldchapel.found`.
- **Acceptance:**
  - Faith is respected (canon row 8).
  - Rumour-only lore (row 12).
  - Reachability flood fill and painted-collision checks, as in `ashlane_test.js`.
- **Possible regressions:** the world-map layout; the precious-chest pool (district list); Renown totals.

## Stage 6 · Lucas Part A (memories)
- **Scope:** `lucas_mem_bread`, `lucas_mem_plan`, `lucas_mem_room`.
- **Features:**
  - Memory objects at Hesper.
  - Flashback panels with KID sprites.
  - A memory walk: a non-hub walk mission in the orphanage theme.
  - A hide/timing minigame reusing `HIDE_SPOTS` logic.
- **Acceptance:**
  - Playable only while Lucas is `captured` or later.
  - No present-day Lucas.
  - None of Scene 9's cat lines reused (a test compares against the Scene 9 text).
  - The chain is ordered (`pre`).
- **Possible regressions:** Chapter 1 sequence data (read-only use); hide-and-seek.

## Stage 7a · World side quests, batch 1
- **Scope:** `side_morning_after`, `side_names_paper`, `side_sunday_cups`, `side_festival_forgot`, `side_missing_page`, `side_beyond_wall`.
- **Features:** new townsfolk (old woman, clerk, traveller, archivist) as `mxPeople` entries; investigation via `objs`; Folders and puzzle reuse.
- **Acceptance:**
  - Each is found through a person or object.
  - None needs combat.
  - The Mercy appears as symptoms only (canon row 9).
  - The traveller stays unreliable (row 12).
  - Sketches, not photographs (row 15).

## Stage 7b · World side quests, batch 2
- **Scope:** `side_empty_chapel`, `side_unofficial_prayer`.
- **Depends on:** Stage 5 (the old chapel district).
- **Acceptance:** `side_unofficial_prayer` stays `locked_by_prerequisite` until `side_empty_chapel` is done. The factions appear as rumour only.

## Stage 8 · Dess · The Girl in the Experiment
- **Needs approval first:** the Institute annex district (tracker § 6.2) and the Lucas prerequisite set (§ 6.3).
- **Scope:** `dess_experiment` with `pre` set to the 7 ids, `autoFind:1`; the annex district (lab theme); the core-reaction event at the tower.
- **Acceptance:**
  - Locked until all 7 are **completed**, in every order tested (a permutation test with the real ids).
  - A banner plus a "!" on Dess when it unlocks.
  - No confirmation that the Subject is Dess; the girl of light unexplained (rows 4, 5).
- **Possible regressions:** Dess's existing hideout lines; the tower layout.

## Stage 9 · Lucas Part B (hangouts)
- **Blocked:** needs Chapter 2's rescue, which sets `setStoryFlag('ch2.lucasRescued')`.
- **Scope:** `lucas_hang_route`, `lucas_hang_remember`, `lucas_hang_promise`; present-day Lucas NPCs at the tower and Hesper (gated `lucasState()==='rescued'`).
- **Acceptance:**
  - Never visible while `captured`; that test already exists.
  - Unlocks on the flag.
  - The Chapter 1 ending is unchanged.

## Stage 10 · Final polish, regression and docs
- Full regression on every viewport.
- `live_smoke.js` after an approved publish only.
- Renown and economy totals updated in `docs/economy/PROGRESSION_BALANCE_TABLE.md`.
- `LORE_ADDITIONS.md` complete; tracker statuses final.

---

## Results · Stage 1+2 (2026-11-16)
| Test | desk | phone | small |
|---|---|---|---|
| `quest_system_test.js` | 49/49 | 49/49 | 49/49 |
| `narrative_foundation_test.js` | 33/33 | 33/33 | 33/33 |
| Regression (see `QUEST_TEST_PLAN.md` § 4) | see there | | |

**Known limitations**
- Quest definitions are code, not save data. A quest removed from the code leaves its saved state unused, which is harmless.
- `found()` conditions are checked on `mxTick`: entering a district, talking, reading, finishing a step. A condition that becomes true some other way is noticed at the next tick.
- The NPC "!" for an offer needs `npc` **and** `offer` on the quest. Content that needs custom branching keeps using `say()`.
- No cosmetic or accessory system exists, so cosmetic rewards are not supported (tracker § 6.4).
- `lucasState()` can only reach `rescued` through `setStoryFlag('ch2.lucasRescued')`. Nothing in the game sets it until Chapter 2 is built.

## Results · Stage 3 (2026-11-16)
**Built** (details in the tracker § 4)
- Both stories, playable from start to finish.
- New quest objects: the leather offcut and the cardamom tin.
- Four drawn bake stations on the roof.
- The workbench assembly puzzle.
- Two roof fights and two ending scenes.
- The post-Chapter 1 bakery-window readable.

**Changes outside the stories**
- A giver with a `found` condition only offers its story after the story has been discovered (`mxOfferAt`).
- `tower.view` moved to (0.6, 0.26): it sat under the objective bar on small phones.
- `exploration_polish_test.js` now includes the tower.

| Test | desk | phone | small |
|---|---|---|---|
| `bond_agnes_bram_test.js` | 45/45 | 45/45 | 45/45 |
| Full regression (`QUEST_TEST_PLAN.md` § 4) | pass | pass | pass |

**Not covered**
- A fight *loss* during the stories. There is no test hook to lose a fight. `mxFight` returns to the district and keeps the step either way.

## Results · Stage 4 (2026-11-16)
**Built** (details in the tracker § 4)
- 4 page quest objects.
- The patient folder, as discovery and then as the ordering puzzle.
- Naomi and Theo at the ward while the story is on.
- Theo's box: a hot-and-cold beep toward a bed that only shows its "!" when you are close.
- The ward fight and the ending scene.

**Fixes found while building**
- An interactable created on district entry for a later step did not appear when the step changed in the same district. The bed is now always created and hidden until its step.
- A hide check used the list entry's own coordinates, which are unset on the copy. It now uses `this`.
- The Stage 3 test's spoiler regex had lost its `\b`, so "mother" was not being checked. Fixed and re-run: it passes.

**Placement:** the bed and one page moved so nothing sits under the party portraits on small phones.

| Test | desk | phone | small |
|---|---|---|---|
| `bond_lark_test.js` | 35/35 | 35/35 | 35/35 |
| Full regression | pass | pass | pass |
