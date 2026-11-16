# Technical Safety Audit (Phase 2, read-only)

- **Date:** 2026-11-16
- **Inspected:** `index.html` (958 KB, 9,375 lines, about 612 top-level functions), `sw.js`, `manifest.webmanifest`, `tools/`
- **Changes made:** none to the game. This is a report only.
- **Severity scale:**
  - **High:** can lose player data or break progress.
  - **Medium:** integrity or regression risk.
  - **Low:** hygiene.

## Summary
| # | Finding | Severity |
|---|---|---|
| A1 | The save is one `localStorage` key, with no automatic second copy | **High** (on iPhone) |
| A2 | Backups are manual and the game never reminds you | **High** (on iPhone) |
| A3 | Restoring a code overwrites the current save with no undo copy | Medium |
| A4 | Mid-Chapter 1 resume is keyed by scene text (`"Scene 10#3"`) | Medium (matters for the Chapter 1 revision) |
| A5 | Broken-save copies are kept forever and never cleaned up | Low |
| B1 | **The test toolkit `window.__sf` is live on the public site for everyone**, with or without `?debug` (a missing-brace bug) | **Medium** |
| B2 | `window.__mxDay` lets the console reset daily rewards | Low |
| C1 | Painted props and their collision are two separate hand-kept copies in older districts | Medium |
| C2 | Hub people and objects are built once on district entry; changes inside a visit are easy to miss | Medium |
| C3 | One central "who says what" function decides all NPC lines | Medium |
| C4 | The single 958 KB file, global state, and exact-string patching | Medium (long-term) |

---

## A. Save safety (iPhone Safari / home-screen app)
### How it works (evidence)
- **Saving**
  - `SAVE_KEY='starfall-ascent-save'` (line 1407).
  - `persist()` writes the **whole save** as JSON to `localStorage` on every change (line 1437). If that fails, the title screen shows a warning (line 6393).
- **Loading**
  - `loadSave()` (line 1423) parses the save.
  - If the save can't be read, it keeps a copy under `starfall-ascent-save-broken-<time>` and starts a new save, with a warning (lines 1426–1428).
  - It then fills in safe defaults (`v=2`, `claims`, `keep`, `chars`).
  - Newer systems add their fields lazily: `mxS()`, `storyFlags()`, and `mxMigrate()` (the one-time Keepsake catch-up).
- **Backups**
  - Builds → Backup shows a text code: `SFA1-` + base64 JSON (`exportCode` / `importCode`, lines 1439–1446). It can be copied, and pasting one restores it after a `confirm()`.
- **PWA**
  - `sw.js` caches the app shell. The page is network-first, so updates arrive at once.
  - The service worker only caches files, **not saves**.
  - Not used: `navigator.storage.persist()`, IndexedDB, any second save slot.

### Risks
1. **A1 · Storage eviction**
   - iOS Safari can clear a site's script-written storage after a period without use, and under storage pressure.
   - Home-screen web apps are treated more leniently than Safari tabs, but **nothing guarantees permanence.**
   - Separately, **the home-screen app and a Safari tab have separate storage** (different saves), and **deleting the home-screen icon deletes its save.**
   - Today one key holds everything; if it goes, the progress is gone.
2. **A2 · No reminder:** the only mention of backups appears when saving has *already* failed. A player who never opens Builds → Backup has no copy.
3. **A3 · Restore is one-way:** restoring a wrong or old code replaces the current save, and the previous one isn't kept.
4. **A4 · Resume keys:**
   - `save.ch1b.k` stores scene labels.
   - Renaming or reordering Chapter 1 scenes (the planned revision) strands players who are mid-chapter, unless an old-to-new key map is added.
   - Saves that have already cleared Chapter 1 are safe (`ch1Scene()` returns 99).
5. **A5:** broken copies pile up, which slowly uses storage quota.

### Proposed fixes (none break existing saves)
| Fix | Effort | Notes |
|---|---|---|
| **Rolling snapshots:** on certain milestones (a chapter clear, a quest completed, once a day), copy the save to `starfall-ascent-save-snap-1..3` | Small | If the main key is missing or broken, offer "Restore the latest snapshot". This doesn't help if the browser wipes *all* storage |
| **Ask for persistent storage:** call `navigator.storage.persist()` once, when available | Tiny | Best effort; Safari may ignore it. Report the result in Settings |
| **Backup reminders:** a gentle banner on the title screen when the last backup is more than 7 days old *and* real progress was made since. Store `lastBackupAt` | Small | Never blocks play |
| **Download backup file:** next to "Copy code", also offer a `.txt` download through the share sheet | Small | Easier than copy-pasting a long code on iPhone |
| **Safe restore:** before replacing, keep the current save as `starfall-ascent-save-prev`, with an "Undo restore" button | Tiny | |
| **Chapter 1 key map:** a `CH1_KEY_MAP` from old scene keys to new ones, applied in `loadSave()` | Small | Required before the Chapter 1 revision ships |
| **Clean broken copies:** keep only the newest 2 | Tiny | |

**Tests to add**
- Load each historic save shape (fresh, pre-Expansion 02, mid-Chapter 1 old keys, cleared).
- Snapshot written and restored.
- Reminder appears and dismisses.
- Restore then undo.
- A full storage quota still shows the warning.
- The existing `quest_system_test` save-compatibility cases.

**Manual iPhone checks**
- Install the home-screen app, play, close it, reopen it a day later.
- Make a backup, delete the app, reinstall, restore.
- Check that Safari and the home-screen app really hold separate saves.

## B. Debug mode exposure
### Evidence
Line 9331:
```js
if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||/[?&]debug/.test(location.search))window.__sf_spots=MX_CHEST_SPOTS;window.__sf_hide=HIDE_SPOTS; … window.__sf={…};
```
- Without braces, **only the first assignment** (`__sf_spots`) is conditional.
- Everything after it, including `window.__sf`, runs on **every** host, including the live GitHub Pages site and the artifact. No `?debug` is needed.
- `window.__sf` includes:
  - `grant(reward,key)`: pay any reward.
  - `save()`: the live save object, freely editable.
  - `setStory`, `qstart`, `mxGo` and `ch1(...)`: jump anywhere.
  - `win()` / `kill()`: finish any fight.
  - `mission(...)` and `mem(...)`.
- `window.__mxDay` (line 4837) overrides the date used for daily rewards.

### Assessment
- **Integrity:** this is a single-player game with no leaderboards or trading, so cheating only affects the cheater.
- **Real risks:**
  - A curious player can corrupt their own save beyond repair (for example `__sf.save().chars={}`), and Backup would then copy the broken state.
  - Any browser extension or injected script on the page has the same power.
  - The intended behaviour (tools off unless local or `?debug`) is not what ships, so the current code doesn't do what its own guard says.

### Proposed fix (keeps the test workflow)
1. Wrap the block in braces behind one flag:
   `const DEV=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)||/[?&]debug/.test(location.search); if(DEV){ … }`
   - Every Playwright test runs on localhost, so nothing changes for them.
2. Optionally require `?debug` **and** a stored opt-in (`localStorage['sf-dev']='1'`) on non-local hosts. That stops a shared `?debug` link from enabling the tools by accident.
3. Read `window.__mxDay` only when `DEV` is on.

**Tests**
- On localhost the whole suite passes unchanged (the hooks exist).
- A new test loads the page on a non-local hostname and checks that `window.__sf` is `undefined`. It can be simulated by serving under `127.0.0.2`, or by reading the guard through an injected `location` check.

## C. Large-file architecture
### Fragile areas (found by real bugs in this project)
| # | Area | Evidence | Risk | Safer pattern (no big refactor) |
|---|---|---|---|---|
| C1 | **Paint vs collision** | St. Hesper's, the Office, Ash Lane and the tower keep hand-written collision lists (`mxPaintedSolids`) beside separate paint code. St. Maren's, the Annex and the dormitory use one shared list (`oldChapelGeo`, `annexGeo`, `dormGeo`). Collision shapes were also *drawn* as brown boxes over the art until this week (`inv` fix) | A prop moved in the art keeps its old collision; invisible walls | Move older districts to shared geometry lists when they are next edited; keep the reachability and collision tests (already in place) |
| C2 | **Hub lists built on entry** | `mxPeople`/`mxExtras` run once per district visit. Objects that appear mid-visit need `hide` callbacks, not `cond`; the bed and grey-visitor bugs came from this | Quest objects missing until you leave and come back | Rule: anything that depends on quest state uses `hide:()=>…`. Documented; consider a lint-style test that steps a quest inside one visit (some tests do this now) |
| C3 | **Who says what** | `mxNpcs` → `n.lines` chooses between `MX_QLINES`, `say()` quest lines, offers and small talk | Two quests on one NPC collide (the Rosa/flour/Sunday Cups bug) | The order is now documented and tested (`side_quests_test`); keep all new quest dialogue in `MX_QLINES` |
| C4 | **Copied list entries** | Walk and hub entries are copied (`Object.assign`); closures that captured the original saw no coordinates (`bed.x` bug) | Silent misbehaviour | Use `this` or the passed-in `n` (done); keep a note in the docs |
| C5 | **Story resume keys** | `ch1b.k` holds scene labels; `ch1Scene()` parses numbers; world unlocks use `need:{ch1:n}` | The Chapter 1 revision can break resume and unlock points | Key map (A4); add `ch1:'R9'`-style ids that don't depend on numbering |
| C6 | **Two theme painters** | `case 'chapel'` and others appear twice: a base layer (`paintTheme`) and a detail layer | Edits land in the wrong layer | Comment headers exist; keep both layers named in the theme list |
| C7 | **Test hooks on one 4.3 KB line** | Line 9331 | Hard to review; it hid the missing brace (B1) | Split one hook per line inside the `DEV` block |
| C8 | **Global mutable state** | `state`, `room`, `save`, `sq`, `player`, `mxFold`, `mxOdd`, … | Cross-feature side effects (stale `sq.flags` read through `cutFlags()` in the hub) | Leave as is; guard reads (e.g. reset `sq` after a sequence ends) when touched |
| C9 | **Edit workflow** | Changes are applied by exact-string patch scripts on one file | Safe (they assert each match) but slow to review | Keep the asserts; keep committing per stage |

### Candidates for modularising later (only if wanted, one at a time)
The file already has clear section banners, so these could become separate `<script>` files without changing behaviour. The order runs from safest to riskiest:
1. Character art (`drawChar` and the per-character looks): about 700 lines, pure drawing.
2. Theme painters and atmosphere: about 900 lines, pure drawing.
3. Mission and Chapter 1 sequence data (`CH1_SEQ`, `addMission` tables): data plus a few functions.
4. The Meridian hub (districts, people, quests): the biggest and most coupled. Last, if ever.

Each split needs the service worker's `CORE` list updated and the full suite run. **Not recommended before the Chapter 1 revision.**

### Duplicated logic worth knowing about
- Quest-step NPC lines live in two styles: older `say()` branches inside people, and the newer `MX_QLINES`. Both work, and the priority order is tested.
- Several districts have near-identical "find N things" activities (Folders, Odd Things, Pages, quest objects); `MX_FINDS` with `quest:` covers most of them.
- Puzzles all use `showPuzzle` (multiple choice). That's one system, which is good, but it's also why many puzzles feel the same (Phase 5).

## Recommended order
1. **B1:** wrap the debug hooks in a `DEV` block. Tiny, high value, all tests stay green.
2. **A1–A3, A5:** snapshots, `persist()`, a backup reminder, a download option, safe restore.
3. **A4 / C5:** the Chapter 1 key map, as the first step of the Chapter 1 revision.
4. C1 / C7 opportunistically, when those districts or hooks are next touched.

---

## Implementation status (updated 2026-11-16, local only, not deployed)
| # | Finding | Status | Where |
|---|---|---|---|
| B1 | Developer tools live on the public site | **Fixed locally.** One flag, `SF_DEV` (localhost, 127.0.0.1, [::1], or `file:`), gates the whole `window.__sf` block. `?debug` no longer enables anything on other hosts | `index.html` (`SF_DEV`, the developer-tools block); test `tools/security_test.js` (8/8): the published hostname with `?debug` has no globals, and localhost keeps them |
| B2 | `window.__mxDay` date override | **Fixed locally:** read only when `SF_DEV` | `mxDay()` |
| — | Other globals | `__wmSel`, `__mxChime`, `__mxMurmurs` are now development-only. `window.__cf` (cutscene flag scratch space) is harmless and kept | |
| A1 | Single save key | **Mitigated:** three rolling automatic backups; recovery on load | `snapshotSave`, `loadSave`; `docs/quest_expansion/SAVE_PROTECTION.md` |
| A2 | No reminder | **Fixed:** title-screen reminder after 7 days, dismissable | `backupDue()` |
| A3 | One-way restore | **Fixed:** validation, kept previous save, Undo restore | `restoreBackup`, `undoRestore` |
| A5 | Broken copies pile up | **Fixed:** keeps the newest 2 | `cleanBroken()` |
| — | Persistent storage | **Requested when supported;** the result is shown honestly | `requestPersistentStorage()` |
| — | Backup file | **Added:** `.json` download / share sheet | `downloadBackup()` |
| A4 | Chapter 1 resume keys | **Not started** (waiting on the Chapter 1 blueprint approval) | — |

**The live site is not fixed** until these changes are pushed and GitHub Pages redeploys.
