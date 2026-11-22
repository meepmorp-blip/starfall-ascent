# World & Exploration Update

**Branch:** `world-exploration`, cut from `exploration-guidance` (`57585c6`), which sits on top of `main` (`9828aa4`, live).

**Not pushed, merged or deployed.** This document is updated as each phase lands.

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
