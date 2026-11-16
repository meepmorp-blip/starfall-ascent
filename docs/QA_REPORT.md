# STARFALL: THE ASCENT · QA Report

Date: 2026-11-16 · Build: local working copy (`index.html`), development queue tasks 1–10 plus QA fixes.
Testing: automated Playwright (headless Chromium) at desktop 1280×720, phone landscape 844×390 (touch, DPR 2) and small phone 667×375 (touch, DPR 2). **No physical iPhone testing was done.**
All tests used temporary test saves in a fresh browser profile. The player's own save was never read or written.

---

## A. Executive summary

The game is in good shape overall. Progression, rewards and saves held up against deliberate abuse: repeat claims, reloads mid-fight and mid-dialogue, double-clicks, spammed quest ticks, damaged backups, and a full storage quota.

The QA pass found and fixed **two serious pre-existing bugs**:

1. **The final Chapter 1 fight could freeze the game** (QA-01). In the scripted Horaios defeat, each "processed" party member became a grey statue drawn with a canvas filter around hundreds of tiny shapes. Every frame took about 600 ms, the game ran at about 1 fps, and the headless browser tab crashed within about 40 seconds. That is the last fight before the Chapter 1 clear. Fixed: 60 fps, and Chapter 1 now plays start to finish in automated runs.
2. **Some damaged saves stopped the game at Meridian** (QA-02). A save whose character entry, `mx` block or skill slots were the wrong type loaded, then crashed on entering the hub. Fixed: such entries are repaired on load.

**Biggest remaining risks:**
- No real-device testing. iPhone Safari performance, touch feel, storage eviction and the share sheet are unverified (section F).
- How QA-01 behaved on iPhone is unknown. Safari supports canvas `filter` from iOS 18. Older iOS used the non-filter fallback and was probably never affected. On iOS 18 or later the slowdown may have happened. The fix removes the cost either way.
- One design question is open (QA-03: captured or unrecruited characters in free-play modes).

**Verdict: PASS WITH WARNINGS** (section H).

---

## B. Test coverage

Results are from the final runs after all fixes. "×3" means desktop, phone and small phone.

| System | How it was tested | Result |
|---|---|---|
| New game | Fresh profile → title screen, menu, default save (`core_probe`) | Pass |
| Main story: Chapter 1, start to clear | Automated playthrough of all 65 steps (scenes, choices rotated through every option, puzzles, 1 deliberately lost fight, the Horaios loss scene) (`core_probe` desk + phone) | Pass, after the QA-01 fix. It never finished before |
| Chapter 1 scene transitions | Same playthrough: cut → join card → mission → puzzle → bond hand-offs | Pass |
| Chapter 1 save and resume | Reload at the midpoint keeps scene index and key; Continue resumes there; the clear survives a reload | Pass |
| Character recruitment | Roster at the Chapter 1 end has all 7 | Pass |
| Losing a story fight | Chapter 1: Retry panel, then the chapter continues. Meridian: back in the same district, step kept, nothing won, retry works (`qa_probe`) | Pass |
| Party switching | 45 rapid switches while moving and dodging; switching to a downed ally is refused (`qa_probe` ×3) | Pass |
| Combat basics | Attacks damage the target; skill cooldown starts, and pressing again does not re-fire; HP stays within 0..max; no enemy leaves the arena; clearing all waves ends the fight (`core_probe`) | Pass |
| Story battles (Task 10) | Each Bond Story fight: mission type, enemy mix, oven defence, level scaling, win completes the step (`story_battles` ×3) | Pass |
| Bond Stories / Recollections | `bond_agnes_bram`, `bond_lark`, `bond_cass`, `bond_dess`, `bond_lucas`, `chapel_quests`, `side_quests` ×3 | Pass (see E for one test-expectation update) |
| Quest system | `quest_system` ×3, `narrative_foundation` ×3 | See section E |
| Bond progression | `bond_test` (hearts, "already full", captured Lucas waits, applied on rescue) | Pass |
| Renown | `renown_test`; double-click claim pays once (`qa_probe`) | Pass |
| Rewards, repeat claims | Same reward key twice pays once; finished quest ticked 120 times pays once; talking to an NPC 12 times gives nothing extra | Pass |
| NPC interactions and dialogue conditions | `fugitive`, `post_story`, `indicators`, `meridian_playtest`; talk spam; reload during an offer brings the offer back | Pass |
| World map, districts, locked places | `map_consistency` ×3, `worldmap` ×3; no street exit reaches the Annex or Old Chapel before they are found | Pass |
| Activities and minigames | Puzzles inside the Chapter 1 playthrough and Bond Story tests; `office`, `ashlane`, `hesper` tests | Pass |
| Title menus | Builds, Guide, Battle, Rift open without errors (`core_probe`) | Pass |
| Save and load | `save_protection` (32 checks), damaged-save loading (11 kinds), storage full | Pass after the QA-02 fix |
| Backup and restore | Undo restore, older backups, newer-version backup refused, garbage, truncated code, `{}`, `[]`, 3 MB input, `__proto__` payload | Pass |
| Security / debug | `security_test`: no developer globals on a published host, even with `?debug=1`, `#dev` and similar; dev hooks only on localhost or `file:` | Pass |
| Memory and listeners | 25 district changes + 6 menus: listeners 23 → 23, DOM nodes 76 → 77, JS heap 4 → 5 MB. Full Chapter 1: JS heap flat at about 10 MB | Pass |
| Rendering performance | Hub 60 fps; fights 58–60 fps; per-frame game work 4–7 ms (desktop CPU, headless) | Pass (headless only) |
| Mobile emulation | Touch joystick drag moves the player; portrait shows the rotate notice; repeated resizing; HUD-overlap checks in the story tests | Pass (emulated) |

**Full regression suite** (`node run_tests.js`, all 31 test files at their listed sizes): see section E.

---

## C. Bug findings

### QA-01 · High (Critical on affected browsers) · Chapter 1 final fight freezes, then the tab crashes
- **System:** combat rendering, the Horaios scripted loss (Chapter 1 step 63, "Intake Window 1").
- **Steps:**
  1. Reach Intake Window 1.
  2. Bring Horaios below 34% HP.
  3. He starts "processing" party members into grey statues.
- **Expected:** the scene plays at normal speed, and after about 25 seconds alone the chapter moves on.
- **Actual:** after the first statue, each frame took about 575–615 ms (about 1 fps), so game time ran at about 1/20 speed. In headless Chromium the renderer crashed after about 40 seconds ("Page crashed"). Chapter 1 could not be finished in automated runs.
- **Evidence:**
  - Frame trace before the fix: `fps 60 → 26 → 1`, `work 613.7 ms`, with only about 1,000 draw calls per frame.
  - The page crashed in 3 of 3 full-chapter runs.
  - Code: `drawStatues` and the cutscene grey path in `drawCutExtra`'s helper.
- **Root cause:** `ctx.filter='grayscale(1) brightness(1.15)'` was set and then `drawChar` drew a pixel-art character as hundreds of small `fillRect`s. A canvas filter applies per draw call, so that meant hundreds of full filter passes per statue per frame.
- **Fix:** each statue is drawn once into a cached greyscale image and reused every frame. The animated grey figures in cutscenes are drawn to one scratch canvas and copied with the filter once (`drawGreyed`). Browsers without canvas `filter` keep the old faded fallback. Pixel-art look unchanged: screenshots compared.
- **Retest:** 59–60 fps through the whole scene (5–8 ms per frame). Chapter 1 plays to the clear on desktop (96–120 s automated) and phone. Grey statues and cutscene figures look the same as before.

### QA-02 · High · Damaged saves stop the game at Meridian
- **System:** save loading.
- **Steps:** a save where a character entry is not an object, or `mx` is a string, or a character has no `slots` → load → enter Meridian.
- **Expected:** load and repair or default the bad part.
- **Actual:** the save loaded, then entering Meridian threw an exception, so the player could not reach the hub. 3 of 11 damage kinds failed.
- **Root cause:** `validSave` and `loadSave` checked only the top-level shape.
- **Fix:** `loadSave` now repairs entries:
  - drops non-object characters (defaults are re-created)
  - clamps `lvl` to 1..20 and `xp` to ≥0
  - re-creates missing slots
  - replaces a non-object `mx`, `bonds` or `story`, and the `mx` sub-tables
  Valid saves are untouched.
- **Retest:** 11/11 damage kinds reach Meridian without errors; `save_protection` and old-save checks pass.

### QA-03 · Medium · Captured Lucas, and characters not yet recruited, can be picked in Rifts, Battle and Trials. Not fixed: design decision
- **System:** party select (`showPartySelect` lists all of `CH_ORDER`).
- **Steps:** after the Chapter 1 clear (Lucas held by Horaios), open Battle or Rift → Lucas is selectable. On a new save, Dess and Cassie are selectable before they are met.
- **Expected:** undecided. Free-play modes may be meant to be non-canon.
- **Actual:** always selectable.
- **Fix:** none. This needs your call: hide or lock them, or keep them and label the modes as practice.

### QA-04 · Low · Device-clock changes can reset weekly and daily rewards. Not fixed
- **System:** `bossWeekly` (week index from `Date.now()`) and Meridian's day (`mxDay`).
- **Steps:** set the phone's clock forward a week, then claim the weekly boss fragment again.
- **Root cause:** offline game, no trusted clock. Normal for a single-player offline game.
- **Fix:** none recommended; the gain is small and only affects the player's own save.

### QA-05 · Low · Story-fight level scaling is stored on the shared mission definition
- **System:** `mxFight` (Task 10) writes `M.lvl` on the cached mission.
- **Effect:** none found. Every story fight recomputes it before starting, and those mission IDs are only used by `mxFight`. Recorded so future code doesn't read `M.lvl` for those IDs elsewhere.
- **Fix:** not needed now.

### Issues found in my own new code during QA (fixed before this report)
- Story-battle test checked the wrong win flag and sampled enemies too early. Test corrected; the game behaved correctly.
- The `bond_agnes_bram` expectation "no 'cardamom' after the story" conflicted with the new Task 7 follow-up line, which correctly mentions cardamom. The expectation now checks the offer wording instead.
- Test helpers that recognised only `fight` missions now accept the new `defense` story fight (13 test files).

---

## D. Exploits and edge cases tried

| Attempt | Result |
|---|---|
| Claim the same reward twice (same key) | Paid once |
| Finish a quest, then tick the quest system 120 times | Paid once |
| Double-click a Renown claim | One rank paid |
| Talk to one NPC 12 times in a row | No extra rewards; no dialogue left open |
| Reload during a quest offer | Offer returns and can be accepted; no half-started quest |
| Reload in the middle of a story fight | Back in Meridian, step kept, fight can be restarted and won |
| Lose a story fight on purpose (Meridian and Chapter 1) | No progress or reward; retry works |
| Switch characters 45 times mid-fight; pick a downed ally | Active hero always valid; downed ally refused |
| Reach the Annex or Old Chapel before they are found | No exit or map route leads there |
| Restore an older backup, then Undo | Works (`save_protection`) |
| Restore a newer-version backup | Refused with a clear message |
| Import garbage, a truncated code, `{}`, `[]`, 3 MB of text | Refused |
| Import a backup containing `__proto__` | No prototype pollution |
| Storage full (every write throws) | Game keeps running; warning text prepared; no crash |
| Hand-damaged save (11 kinds) | All load and reach Meridian (after QA-02) |
| Developer tools on the published host, including URL tricks | Not present (`security_test`) |
| Captured Lucas in free-play modes | Possible (QA-03, needs decision) |
| Device clock forward | Weekly reward repeatable (QA-04, accepted) |

Not attempted, automatically or otherwise: a mid-write power loss on a real device; two tabs open on the same save at once (the last write wins; snapshots limit the damage).

---

## E. Regression results

**First full run, after all fixes:**
- 73 runs, 2,179 checks, 14 m 49 s, 6 tests at a time.
- 68 runs passed; 5 failed:
  - `bond_lucas` (×3): two checks expected Lucas's Bond to rise at once while he is captured. That is the old behaviour. Task 8 deliberately keeps it as waiting Bond until he is back. The game behaves as designed; the test now counts added plus waiting Bond.
  - `qa_probe` desktop and phone, fight frame rate: 40–44 fps with 6 headless browsers running at once (58–60 fps alone). This is a load limit of the test machine, not a game regression. The threshold is now 30 fps under parallel load. The per-frame game cost (4–7 ms) is the meaningful number.
- **Retest:** `bond_lucas` and `qa_probe`: all pass (6 runs, 226 checks).

**Other systems:** no regressions in quests, NPC dialogue, the map, Ashlane, the Office, Hesper, exploration, economy, the Meridian playtest, or the earlier Bond Stories.

Tests updated in this pass, with the reason for each:
- 13 story tests now accept `defense` as a story-fight type (Bram's fight is a defence now).
- `bond_agnes_bram`: the "not offered again" check now looks for the offer line, not the word "cardamom", which the new post-story line legitimately uses.
- New tests:
  - `story_battles_test.js` (Task 10)
  - `qa_probe_test.js` (exploits, saves, backups, performance, touch)
  - `core_probe_test.js` (new game, Chapter 1 start to clear, combat, menus)

  All three are registered in `run_tests.js`.

---

## F. Mobile QA

**Automated, emulated (Chromium mobile emulation, touch, DPR 2, 844×390 and 667×375):**
- Touch joystick moves the player.
- Portrait shows the rotate notice.
- Window resizing raises no errors.
- HUD-overlap checks pass in the story tests.
- Dialogue, menus and the map pass at both phone sizes.
- Chapter 1 plays to the end on the phone size.
- Headless frame rate 58–60 fps in fights and the hub.

**Not tested on a real device (still required, on an iPhone home-screen install):**
1. Play Intake Window 1 (the QA-01 scene) and confirm it stays smooth.
2. Frame rate in a busy fight and in the Meridian hub on an older iPhone.
3. Joystick and button feel; multi-touch (move + attack + skill at once).
4. Text readability of dialogue and the Journal at the real size.
5. Save persistence across app close, a phone restart and a week unused (Safari may evict website storage; the in-game storage status line reports whether persistent storage was granted).
6. Backup → Download backup file (share sheet), then restore from Files.
7. The backup reminder and Undo restore.
8. Landscape safe areas (notch / Dynamic Island) on the HUD.

---

## G. Remaining issues

- QA-03 (captured or unrecruited characters in free-play modes): needs a design decision.
- QA-04 (clock-based weekly reward): accepted, no fix planned.
- QA-05 (shared mission level): harmless now; noted.
- Bond unlocks (Task 8): not implemented, needs design.
- Chapter 1 revision blueprint: awaiting your approval; not implemented.
- `RECOLLECTION_AUDIT.md`: not written. It was lower priority than implementation.
- Real-device testing: not done (section F).

---

## H. Overall QA verdict

**PASS WITH WARNINGS**

No known critical or high bugs remain open. The two serious ones found (QA-01 final-fight freeze, QA-02 damaged-save crash) are fixed and retested. Warnings:
- no physical iPhone testing
- one open design question (QA-03)
- performance numbers come from headless desktop-class hardware, not a phone

This verdict is based on the targeted probes and the full suite together, not on green automated tests alone.
