# World & Exploration Update

**Branch:** `world-exploration`, cut from `exploration-guidance` (`57585c6`), which sits on top of `main` (`9828aa4`, live).

**Not pushed, merged or deployed.**

**Final full suite:** 92 runs, 2,822 checks. Six runs failed on the first pass:
- `indicators` (desk, phone, small): expected the old plain `!` for story offers.
- `meridian` (desk, phone): reading the rift scar now opens the Rifts.
- `chest_spots`: a new Yard notice sat next to a chest spot.

The notice was moved, and the tests were updated for the new marks and the new scar behaviour. All six pass on rerun. `world_update` passes 49/49 on desktop and on phone.

## Phase 0 · Baseline (before any change in this update)

### Integration of `exploration-guidance`
- **Branch state:** one commit on top of `main`, so it fast-forwards cleanly. It was complete and tested (15/15 checks on desktop and phone). It is taken as the starting point.
- **What it adds:**
  - a gold story `?` (`'?*'`) on objects that can start a story;
  - the workbench label "Agnes left something here";
  - an overgrown gate on Ash Lane and a padlocked hatch in the Clock Tower;
  - Journal rumours;
  - Dess's in-person hint after 4 of her 7 prerequisite stories;
  - a Guide page, "Exploring".
- **It changes no unlock rules.**

### Systems as found
| System | Behaviour today | Code |
|---|---|---|
| World map | Parchment map. Each place shows one state: here, discovered (fast travel), not discovered (`?`), story-locked (padlock), or not built. A gold `!` badge marks places with an available or active quest step. The side panel shows the blurb and the requirement text | `showWorldMap`, `drawWorldMap`, `wmStatus`, `mxQuestPlaces` |
| Navigation | Gold arrows at district edges. Exits into locked places are removed | `mxExits` |
| Journal | Quests (main and optional), Stories (side, bond and memory), Records (n / 26), and a district grid on the Map tab | `showJournal`, `mxStoriesList` |
| Quest discovery | States: completed, active, locked by story, locked by prerequisite, available, undiscovered. Quests are found by talking to an NPC, by a `found()` trigger, or by `autoFind` | `mxQState`, `mxDiscoverPass`, `mxOfferAt` |
| NPC marks | `!` = something to offer or hand in. `?` = unheard small talk, a post-story follow-up, an unread object, or an unfound record. Gold `?` (branch) = can start a story | `mxNpcs` (`mkf`), `talkBubble` |
| Unlocks | `wmUnlocked` handles walk, ch1, ch1orFlag, flag and clear. **`need.ch` isn't handled**, so the Canals return locked forever, by accident rather than by rule | `wmUnlocked` |
| Stardust income | **One-off:** quests about 215, finds 65, Renown ranks 790, plus chests. **Repeatable:** daily activities 10–40 each, the Sparks rift 45 / 90 / 135, Runs | `grantReward`, `riftRewards` |
| Stardust sinks | **Builds already has real sinks:** fragment Attune (25 × level), Retrograde (40), Transit (30 × n), skill Mastery (15 × level, plus Mastery Points), level milestones (8 × level). The audit's "almost no sinks" was too strong. What's missing is a way to turn Stardust into *progress resources* (Keepsakes, Mastery Points, Fragments) | `showBuilds` (`spend`, `skCost`, `msCost`) |
| Shops | **None.** The Ash Lane shopkeeper only has dialogue | `mxPeople('ashlane')` |
| Rifts and Trials | Only from Battle → party select → `showBattleMenu`. The in-world rift scar and trial roster are text only ("in the Battle menu") | `showBattleMenu`, `MX_FINDS` (`act`) |
| Bond stories | 5 bond stories, 3 Lucas memories and 8 side stories. Agnes's (crafting with `agnesAssemble`) and Bram's (baking stations plus a Vice defence) are already full multi-step stories | `MX_QUESTS` |
| Hangouts | Planned kind `hangout` in `MX_STORY_KINDS`; **0 implemented** | — |
| Saves | One browser save with a backup, snapshots and the Chapter 1 migration. The Meridian state is `save.mx` (`q`, `qseen`, `seen`, `found`, `looked`, `talk`, `flags`, `mem`) | `persist`, `mxS`, `ch1MigrateSave` |

### Tests at baseline
- Full suite: 88 runs, about 2,750 checks, about 25 minutes. The last full run passed except for load-timing flakes that pass when rerun.
- `exploration_guidance` passes 15/15 on desktop and on phone.

---

## Phase 1 · Exploration guidance and quest discovery · PASSED
| Area | Change |
|---|---|
| World map | **✦** on places where a still-hidden story can be started (story triggers only, not records, to keep the map calm). **✓** on districts with nothing left to find. The existing **!** quest badge and **padlock** are kept. The side panel now lists stories in progress and waiting there, "something here could start a story", and records found here (x / y). The legend explains all four marks |
| NPC marks | Gold **!** = new quest. Rose **!** = a friend's story is waiting. Green **!** = the next step of something already started. Gold **?** = could start a story. Pale **?** = new small talk or something to read. No mark = nothing new. Marks are recomputed every frame from quest state, so they update as quests complete (`mxNpcWant`, `mkStyle`) |
| Journal | **Quests** opens with a **Main story** card (Chapter 1 progress, or what to do after it). **Stories** sorts in progress → available → done, shows **Where** (or "somewhere you have not been yet") and **with whom**, and lists locked stories *without their titles*, with their requirement (n / m). The rumours from `exploration-guidance` stay |
| Unlocks | **`wmUnlocked` now handles `need.ch`** through `chapterOpen(c)`: a chapter after 1 opens only when its story sets `chN.open`. No such flag exists yet, so the Canals stay locked, now by rule. Every location was checked; no hidden area opens early (tested) |
| Guide | The "Exploring" page covers the marks, the map, battles in the city, the shop, the Journal tabs and going back to places |

## Phase 2 · Stardust shop · PASSED
**Where:** a counter (✦) beside the Ash Lane shopkeeper. His own dialogue still runs the daily Odd Things game.

The shop sells only existing resources; there is no new currency.

| Item | Price | Limit | Gives |
|---|---|---|---|
| The shopkeeper's welcome | ✦ 90 | once per save | 3 Keepsakes |
| Keepsake | ✦ 60 | 3 a week | 1 Keepsake (120 Memories) |
| Practice notes | ✦ 90 | 2 a week | +1 Skill Mastery for every character |
| A sealed Star Fragment | ✦ 140 | 2 a week | a Fragment rolled at Tier II rift quality |

**How buying works:**
- Buy → Confirm, with a two-step button.
- Shows your balance; disables Buy and says how much more is needed when short.
- Blocks Fragments when the 150-Fragment case is full.
- One-time ownership is checked against `save.shop.once`; weekly stock lives in `save.shop.n` and resets every week.
- Everything is saved straight away (`persist`).

**Economy reasoning:**
- **Income:** about 1,100 one-off (quests 215, finds 65, Renown 790, plus chests), plus repeatable sources: dailies at 10–40 each, Sparks 45 / 90 / 135 per clear, Runs.
- **Existing sinks:** Builds already spends Stardust on Attune, Retrograde, Transit, Mastery and milestones.
- **The shop adds** a capped ✦ 730 a week of extra sinks. Weekly caps, not high prices, stop players buying everything early.

## Phase 3 · Rifts and Trials from the city · PASSED
**Where:**
- The **rift scar** in Festival Square (marked ⚔ once read) opens the existing party select, then the Battle menu on the **Rifts** tab.
- The **trial roster** in the Garrison Yard does the same, on the **Trials** tab.

**Coming back:** the menus and the results screen offer "Back to Festival Square" (or the Yard), and Builds from the results returns there too. The Battle menu from the main menu is unchanged and still says "Home" (`battleFrom`, `openWorldActivity`, `backToWorld`).

**Unchanged:** no Rift or Trial definitions, tiers, rewards or star logic changed; it is the same `startBattle`.

## Phase 4 · Character stories (Recollection framework) · PASSED, with a naming note
**Naming.**
- The approved Pre-Chapter 2 decision (16 Nov) is that players see **Bond Stories**. In the game "Recollection" already names character level ("Recollection Lv") and Dess's Ultimate.
- The framework is `RECOLLECTIONS` in code. The player-facing label is one constant (`STORY_LABEL`) if you'd rather rename it.

**Framework.**
- **Structure:** every character story stays an ordinary `MX_QUESTS` entry (kind bond, memory or hangout, with `char`).
- **Grouping:** `RECOLLECTIONS` groups the stories per character.
- **Beats:** `REC_BEATS` tags each step's beat: intro → explore → activity → combat (optional) → resolution.
- **What it gives automatically:** discovery, marks, map badges, the Journal and persistence all already work for any new story.
- **How to add a story:**
  1. Write the quest.
  2. List it under its character.
  3. Tag its steps.

**Tracking.** A new Journal tab, **Bond Stories**, has one card per character with Bond hearts. Each story shows as one of:
- ✓ done;
- in progress, with the current step, its beat and "step n of m";
- ready to start, with its giver;
- locked, with its requirement;
- not found yet, with a rumour.

Before Chapter 1 is done, the tab says when the stories open.

**Agnes and Bram.** Both stories from the brief **already existed in full**, so they were wired in rather than duplicated:
- **Agnes, "A Little Something Handmade":** found by using the workbench → gather materials → craft at the workbench → test the sling → a talk with Agnes.
- **Bram, "The Smell of Fresh Bread":** found at the bakery window → gather ingredients → a baking-order minigame "the way Gran did" → Vices smell it too (a fight) → share the bread.
- Nothing states that Gran died.

**Future characters.**
- Naomi & Theo, Cassie, Dess and Lucas's three memories are listed.
- Kairos and Lucas get an in-world "not yet" line.
- No new stories were written for them.

## Phase 5 · Exploration rewards and revisits · PASSED
- **Records milestones** (once each, claimed in `save.claims`): 12 records → a Keepsake; 20 → a sealed Fragment; all → a Star-born Fragment. Older saves past a milestone receive it on their next record.
- **Hidden places:** the first step into St. Maren's or the Institute Annex gives one Keepsake, once.
- **After Chapter 1**, three new readables echo Chapter 1 without touching Chapter 2:
  - the rooftop roster with two names struck through (Garrison Yard);
  - "records requests suspended" at the Office queue;
  - Naomi's note about bed four's drawing (St. Lucia's).
- **No new dailies.** The existing daily activities are unchanged.

## Phase 6 · Architecture, saves, QA
**Architecture assessment.** No file split was done in this update. Splitting into separate scripts is feasible without a build step, but it would also change `sw.js` (offline file list and cache name), which is a release risk for iPhone players. The safe boundaries, for a gradual move:

| Block | What | Move |
|---|---|---|
| 1 | `MX_QUESTS`, `MX_POST`, `MX_FINDS`, `MX_LOOKS`, `RECOLLECTIONS`, `SHOP_ITEMS` | Pure data, easy to move first into `data/meridian.js` |
| 2 | `CH1_SEQ` and story missions | Data plus small callbacks, into `data/ch1.js` |
| 3 | `CHARS`, `KITS` | Mixed data and behaviour; move last |
| 4 | Engine, rendering, saves | Stays in `index.html` |

**Steps for that move:**
1. Load the data files with plain `<script>` tags before the main script.
2. Add them to `sw.js` CORE and bump `CACHE`.
3. Run the full suite plus an offline check.

Do this as its own small release before Chapter 2.

**Save compatibility.**
- **New fields:** `save.shop` (created lazily) and claim keys `mxrec:*` and `mxh:*`. No migration was needed.
- **Old saves:** all 19 old-save fixtures (`tools/fixtures/ch1_old_saves.json`) load with Stardust, Keepsakes, levels and Fragments unchanged, and open the shop, every Journal tab and the hideout without errors.
- **Existing tests:** the save-migration and save-protection suites still pass.

## New and modified files
| File | Change |
|---|---|
| `index.html` | All game changes |
| `docs/WORLD_EXPLORATION_UPDATE.md` | This document |
| `tools/world_update_test.js` | New: 49 checks, desktop and phone |
| `tools/run_tests.js` | Registers the new test |
| `tools/bond_*_test.js`, `chapel_quests_test.js`, `quest_system_test.js` | Updated: friends' story offers now expect the rose `!b`, and steps in progress the green `!a`. The marks changed on purpose; each case was checked |

From `exploration-guidance`: `tools/exploration_guidance_test.js` and `docs/WORLD_EXPLORATION_AND_QUEST_GUIDE.md`.

## Postponed (out of scope)
- Chapter 2 content, including the Canals district.
- Weekly World Bosses and Memory Expeditions.
- Achievements.
- New stories for the other six characters.
- The file split (planned above).

## Manual iPhone checklist (not yet done on a real device)
1. **Install and update.** Add to the Home Screen, play, close the app. After a new deploy, reopen twice and check the new build appears.
2. **Landscape layout.** HUD, touch controls, safe areas (notch side).
3. **World map.** !, ✦, ✓ and padlock are readable; tapping a place updates the panel; Travel works.
4. **Journal.** All five tabs scroll; the Bond Stories tab is readable.
5. **NPC marks.** Gold, rose and green ! are distinguishable in daylight; the gold vs pale ? too.
6. **Shop.** Buy → Confirm, short of Stardust, weekly limit, purchases kept after force-quitting.
7. **Rift scar and trial roster.** Start, finish, "Back to …" returns to the district.
8. **Agnes's and Bram's stories.** Crafting and baking taps, the sling test, the bread fight.
9. **Combat.** Touch, Entrances, Riptide.
10. **Saves.** Force-quit mid-district and resume.
11. **Long session.** About 45 minutes: heat, frame rate, memory.

## Recommended next priorities
1. Play the update on the iPhone with the checklist above.
2. Write one new story with the framework (for example Theo & Naomi). It is the real test of the template.
3. Do the low-risk data-file split as its own release.
4. Prepare Chapter 2's flags (`ch2.open`) and progress.
