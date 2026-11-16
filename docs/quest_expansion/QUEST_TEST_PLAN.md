# Quest Test Plan · Pre-Chapter 2 Expansion

**Conventions** (the same as the existing `tools/*_test.js`)
- Playwright tests, served by `tools/serve.js` on port 5190. Run them **one at a time**.
- `node <test>.js [desk|phone|small]`:
  - desk is 1280×720.
  - phone is 844×390, touch.
  - small is 667×375, touch.
- Each writes `tools/out/<prefix>_<mode>_log.txt` with `PASS` / `FAIL` / `CRASH` lines and saves screenshots to `tools/out/`.
- Audio is muted (`music:0, sfx≈0`); the tutorial is pre-dismissed.
- The day is fixed with `window.__mxDay`.
- Saves are seeded with `localStorage` fixtures.
- Hooks come from `window.__sf` (localhost only).
- Story content tests also run the quest's text through a spoiler regex taken from `NARRATIVE_CANON_CHECKLIST.md`.

## 1. Test files
| File | Prefix | Covers |
|---|---|---|
| `narrative_foundation_test.js` | `nar` | Era switch, Clock Tower hideout, wanted notices, first quest states, fight and scene glue |
| `quest_system_test.js` | `qsys` | The Quest System Foundation, using temporary `tq_*` quests (§ 2) |
| `bond_agnes_bram_test.js` | `ab` | Agnes and Bram, played together and interleaved: story lock, world discovery, "!" markers, gathering, reload mid-story, puzzle (wrong answer, leave, finish), bake order (reset), two fights, endings, rewards once, Journal, HUD overlap, canon regex. 45 checks ×3 |
| *(next stages)* | — | Each story: discovery, steps, rewards, canon regex (§ 3) |

## 2. Foundation cases (`quest_system_test.js`, all automated)
| # | Area | Case | Status |
|---|---|---|---|
| 1 | Registration | Test quests register in `MX_QUESTS` and report a state | Pass |
| 2 | Discovery | Giver "!" over the NPC; talking gives the offer and starts the quest | Pass |
| 2 | Discovery | Reading a notice (`MX_LOOKS`) discovers a readable-found quest | Pass |
| 2 | Discovery | Entering a district discovers a location-found quest | Pass |
| 3 | Availability | Unseen → `undiscovered`; fresh save → `locked_by_story` | Pass |
| 4 | Prerequisites | Dess-style `pre` stays locked with 1 or 2 of 3 done, and when a prerequisite is only started | Pass |
| 5 | Multiple objectives | A two-objective step shows "0 / 2", "1 / 2", then advances, done in reverse order | Pass |
| 6 | Progression | The next step marks its district; a location step completes on arrival | Pass |
| 7 | Completion | `completed` state; banner; `onDone` event fires once | Pass |
| 8 | Rewards | Stardust, Keepsake, Fragment (equipment), Bond, Memories, Journal collectible, story flag | Pass |
| 9 | Duplicates | A restart attempt, `mxTick` and a direct `grantReward` with the same key pay nothing | Pass |
| 9 | Repeatables | A daily quest pays first-clear plus daily once; blocked the same day; available the next; the repeat pays daily only | Pass |
| 10 | Persistence | States and claims survive a reload; nothing is paid again after the reload | Pass |
| 11 | Save compatibility | A fresh save gets empty `qseen`/`mem`; an existing save keeps Stardust, Keepsakes, levels, Mastery, Bond, claims, opened chests, Chapter 1 progress, Meridian discoveries and talks; malformed new fields are reset | Pass |
| 12 | Recollection | Bond +1 and Memories (character XP) go to the named character | Pass |
| 13 | Dess | The last of three prerequisites, in any order, unlocks **and** auto-discovers | Pass |
| 14 | Lucas | `free` → `captured` after Chapter 1; memories playable; hangouts `locked_by_story` (enforced even without `when`); can't start; no Lucas at the tower; the `ch2.lucasRescued` flag unlocks them | Pass |
| — | Battles | Winning a hub fight completes a `won` objective | Pass |
| — | Journal UI | The Stories tab lists found stories and collectibles; never locked hangouts; fits the width; no duplicates in Quests | Pass |
| — | Flexible order | Prerequisites done B-then-A (and A-then-B in `narrative_foundation_test.js`) | Pass |
| — | Markers | World-map / exit "!" places come from available givers and unfinished objectives (`mxQuestPlaces`); the drawn "!" is checked in screenshots | Pass |

Each row passes at **desk, phone and small** (49 checks each).

## 3. Per-story cases (to write with each content stage)
For every story quest:
1. It can be **found in the world** (NPC, object or place) without opening the Journal, and the right "!" appears.
2. It is **unavailable** before the Chapter 1 clear (`locked_by_story`).
3. Every objective completes through real input: keyboard interact on desk; the same handler on touch viewports.
4. Puzzles and minigames can be finished and failed. Failing never loses quest progress.
5. A fight win advances the quest; a loss returns to the hub with the quest still active.
6. Rewards are paid exactly once. The collectible appears in Stories.
7. Reload in the middle of the quest: it resumes on the same step.
8. Text passes the canon regex for its checklist rows.
9. Reachability flood fill for every new NPC and spot. `chest_spots.js check` stays OK.
10. Screenshots at 3 viewports: nothing under the HUD or touch controls (`exploration_polish_test.js` rules).

**Specific checks**
- **Dess (Stage 8):**
  - Test permutations of finishing the 7 real prerequisites.
  - She stays locked after 6, and when the 7th is only active.
  - She unlocks on the 7th, with a banner and a "!" on Dess.
- **Lucas Part A:**
  - Playable while `captured`.
  - No Scene 9 cat lines (compare with the Chapter 1 sequence text).
  - The order is enforced.
- **Lucas Part B:**
  - Hidden while `captured`.
  - Unlocked only by `ch2.lucasRescued`.

## 4. Regression suite (run after every stage)
```
node chest_spots.js check
for m in desk phone small: quest_system, narrative_foundation, ashlane, office, hesper, worldmap, exploration_polish
for m in desk phone: exploration_test, meridian_playtest, economy_test
```

### Results, 2026-11-16 (Quest System Foundation)
| Test | desk | phone | small |
|---|---|---|---|
| `chest_spots.js check` | ALL SPOTS OK (5 viewports) | | |
| `quest_system_test.js` | 49/49 | 49/49 | 49/49 |
| `narrative_foundation_test.js` | 33/33 | 33/33 | 33/33 |
| `ashlane_test.js` | 32/32 | 32/32 | 32/32 |
| `office_test.js` | 24/24 | 24/24 | 24/24 |
| `hesper_test.js` | 31/31 | 31/31 | 31/31 |
| `worldmap_test.js` | 22/22 | 22/22 | 22/22 |
| `exploration_polish_test.js` | 33/33 | 33/33 | 33/33 |
| `exploration_test.js` | 36/36 | 36/36 | — |
| `meridian_playtest.js` | 41/41 | 41/41 | — |
| `economy_test.js` | 29/29 | 29/29 | — |
| `live_smoke.js` (the **deployed** build, which doesn't have this work yet) | 12/12 | | |

## 5. Manual checks before release
- Play one story end-to-end on a real phone (touch).
- Check that the "!" next to exit labels is readable at the smallest supported size.
- Load a real pre-expansion save from a Builds → Backup code.

### Results, 2026-11-16 (Stage 3: Agnes and Bram)
All passing:
- `bond_agnes_bram_test.js`: 45/45 at desk, phone and small.
- `quest_system_test.js`: 49/49 ×3.
- `narrative_foundation_test.js`: 33/33 ×3. One assertion was narrowed: Bram's real story now also marks the tower.
- `ashlane`, `office`, `hesper`, `worldmap`: ×3.
- `exploration_polish`: 33/33 ×3, now including the tower.
- `exploration_test`, `meridian_playtest`, `economy_test`: desk and phone.
- `chest_spots.js check`: OK.
