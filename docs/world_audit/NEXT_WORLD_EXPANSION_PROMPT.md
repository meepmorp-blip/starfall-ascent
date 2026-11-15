# Next World Expansion: ready-to-use prompt

Copy everything below the line into a new Claude Code session in this repository.

---

STARFALL: THE ASCENT
WORLD EXPANSION 02: ST. HESPER'S ORPHANAGE BECOMES A MERIDIAN DISTRICT

You are working on the existing STARFALL: THE ASCENT project (single file `starfall_ascent/index.html`, HTML + CSS + JavaScript, Canvas 2D, single-screen maps, GitHub Pages, iPhone Safari PWA in landscape). The world audit is in `docs/world_audit/`; read `WORLD_MAP_INVENTORY.md` and `WORLD_EXPANSION_ROADMAP.md` first. This milestone adds **one** new explorable district: **St. Hesper's Orphanage**. Do not add any other location.

## 1. What already exists (reuse it, do not recreate it)
- **The environment is finished.** Theme `orphanage`:
  - Base paint in `paintTheme` (`case 'orphanage'`, "St. Hesper's yard"): cobbles, the building band with windows, the gate in the top centre with its dead clock drawn by `drawClockProp(g, W/2, 16, …)`, the iron fence, trees, two benches, two lamps.
  - Dressing in `enrichTheme` (`case 'orphanage'`): lit windows, soot above the far-right (kitchen) window, the back step and the chipped saucer at about (W·0.7, H·0.74), chalk hopscotch at about (W·0.36, H·0.6), a chalk sun at (W·0.5, H·0.82), the bakery next door glowing at the left edge (x ≈ 6, y ≈ H·0.36), a rope swing at the right (W−30, 128).
  - Atmosphere `ATMO.orphanage` is a **night** grade. Keep it: the district is "St. Hesper's, at dusk".
- **Existing story content** (Chapter 1, do not change it):
  - The cold open uses `pn('orphanage')` cutscenes.
  - Scene 9 "There Wasn't a Cat" includes `addMission('longway', …)`, Lucas's walk with four spots (bread, window, step, gate). The gate clock reads 11:59.
  - Sister Agathe is the speaker `matron` in `SPK`.
- **Story hooks in Meridian already point here.** Matteo's list in Chapter 1 ("Three mackerel for St. Hesper's. Twelve loaves from the baker.") is an errand for the orphanage.
- **Hub architecture, reuse all of it:**
  - Districts: `MX_DISTRICTS`, `MX_ORDER`, `addMission('mx_'+d, {type:'walk', hub:1, …})`.
  - Exits and fades: `mxExitPos`, `mxEnter`, `mxUpdate`, `mxDrawUnder`.
  - People: `mxPeople(d)` with `say` / `then` / `mark` and `amb:1` for small talk; `MX_ROUTES` for walking; `MX_VOICE` for murmurs.
  - Records: `MX_FINDS`. Readables: `MX_LOOKS`. Quests: `MX_QUESTS` with `mxStart` / `mxTick`.
  - Daily chests: `MX_CHEST_SPOTS`, `mxChests`. Objects: `mxObjDefs` (wall, push, break, lever). Puzzles: `mxSeqStep`.
  - Rewards: `grantReward(reward, key)` with `save.claims`. Renown: `mxRenown`.
  - Crisp labels: `wlabel`. Meridian menu map: `mxMapGrid`. Journal: `showJournal`.
  - Chapter 1 progress: `save.ch1b` (`.roster`, `.i`, `.k` scene key such as `'Scene 9#3'`, `.done`) and `save.ch1Clears`; `mxMet(id)` checks who has been met.

## 2. What to implement
1. **District entry.** Add `MX_DISTRICTS.hesper`: `name: 'St. Hesper's'`, `theme: 'orphanage'`, blurb "The orphanage where Kairos grew up, at dusk."
   - Add it to `MX_ORDER`.
   - **Connection:** a new **east exit in Festival Square** (`plaza` exits `[['w','market'],['e','hesper']]`) and a **west exit in St. Hesper's** (`[['w','plaza']]`). This geography is a proposal; the lore does not place the orphanage. Ask before choosing a different edge.
   - Solid for the gate pillar if needed. Add invisible solids that match the two painted benches and the big tree, so the yard feels solid.
2. **"Know the Streets" must not change for existing players.** Its step checks every district in `MX_ORDER`. Freeze that step to the original five districts with an explicit list, so finished quests stay finished and active ones don't gain a sixth stop. Renown gains +5 for visiting St. Hesper's automatically through `mxRenown`; update the documented totals.
3. **Story gating** (avoid Chapter 1 spoilers):
   - **The district is always visitable.** The orphanage is shown from the cold open on.
   - **Lines about the kitchen fire, the "cat", Lucas as a child, or the gate clock's meaning** only appear once the player has reached Scene 9. Write `mxCh1Reached(tag)` using `save.ch1b.k` and `save.ch1Clears`. Before that, the clock is just "the clock that has always said 11:59".
   - **Lucas never appears here.** Before the Festival he is the Chancellor's son, and he does not remember the orphanage; that is a Chapter 1 reveal.
   - **Never state that the Mercy causes forgetting** (Lore v1.1 reveal schedule). Kairos "got a spoon every Sunday" and felt nothing; children who drink are vague. Clues only.
4. **People** (3 to 4, use `mxPeople` and routes):
   - **Sister Agathe** (`matron`, voice `oldwoman`): warm and stern. Strolls between the gate and the back step.
   - **Two orphans** (small NPCs, voices `child`): one plays on the hopscotch (wander route), one sits on the rope swing.
   - **The baker next door** (voice `man`): stands in the bakery glow at the left. He has a quest step.
   - Party characters: none required. Optionally Bram, gated by `mxMet('bram')`, delivering his mother's bread (Lore: his family is warm and devout). Ask first.
5. **One quest** (optional kind, `MX_QUESTS`): **"Twelve Loaves"**. It continues Matteo's errand list.
   - Get the St. Hesper's bread order from the baker.
   - Carry it to Sister Agathe.
   - Tell Matteo it arrived (Market Ring).
   - Reward through `grantReward`: about 30 Stardust + 1 Keepsake (`mxq:loaves`). Shows in the Journal automatically.
6. **One activity:** **Hide-and-Seek.**
   - Read the chalk board or talk to an orphan to start.
   - Three children hide behind props (behind the benches, by the swing tree, beside the bakery wall). Use `MX_ROUTES`-style positions. Children are hidden until Kairos comes within about 45 units (the same pattern as `hidden` records).
   - Find all three within 40 seconds. Show a timer in the objective bar like the drill (`m.act`).
   - Rewards: first clear 1 Keepsake (`act:hideseek`), then 10 Stardust once a day (`act:hideseek:<day>`). First clear adds 10 Renown.
   - Hiding spots rotate daily with the same seeded approach as chests (`mulberry(hashStr(day+':hesper'))`).
7. **Records (3, `MX_FINDS`, counted):**
   - The gate clock: "11:59. It has said 11:59 for as long as anyone remembers." Add the deeper line only after Scene 9.
   - The chalk sun: a child's drawing with names written in the rays.
   - The scorched kitchen window: the new frame and the old soot. Add the fire line only after Scene 9.
   - Optionally one hidden record, reward 15 Stardust once: a tin under the back step with an old drawing of two boys. Gate it after Scene 9 and don't name Lucas.
8. **Readables (`MX_LOOKS`, no reward):**
   - The saucer of milk on the back step ("Nobody's cat drinks from it.").
   - The rope swing.
9. **Daily chests:** add `MX_CHEST_SPOTS.hesper` with seven spots chosen by `node tools/chest_spots.js`. Add the district and its exit list to that tool and to the test validators first.
10. **One object** from the existing set:
    - **Suggested:** a loose fence picket (`push`) near the right edge that opens a gap to a small corner behind the tree, with a **secret** (`sec:hesper.corner`, 15 Stardust, +5 Renown): Kairos's old hiding place, with chalk tally marks.
    - Use `mxObjDefs` and keep it modest.
11. **Meridian menu map:**
    - `mxMapGrid` is 3×3. Add St. Hesper's as a cell east of Festival Square (a 3×4 grid), and make sure it still fits at 667×375.
    - Update `showMeridian` counts (districts / records / quests) automatically from `MX_ORDER` and `MX_FINDS`.

## 3. Rules
- **Reuse, don't duplicate.** No new theme, no new engine code paths beyond what the district needs. No new currency; rewards go through `grantReward` with unique keys.
- **No Chapter 1 or Chapter 2 changes.** Do not edit `CH1_SEQ`, the `longway` mission, or any story scene. Do not reveal Chapter 2 material.
- **Mobile:**
  - Every interactable and chest must be clear of the HUD and touch controls at 844×390, 667×375, 932×430 and 1024×768 touch, plus 1280×720 desktop. Extend `tools/chest_spots.js` and `tools/exploration_polish_test.js` (`hudBad` check) to cover the new district.
  - Use `wlabel` for any new text.
- **Saves:** existing saves must load unchanged. New state goes only in `save.mx` and `save.claims`. Players who finished "Know the Streets" must keep it finished.
- **Night district:** keep the night grade. Check that labels, prompts, chests and children are readable against it.

## 4. Implementation order
1. Read the audit docs and the code listed in section 1. Write `docs/world/ST_HESPERS_DISTRICT.md` with the layout (people, routes, records, activity spots, chest spots, object), all in arena fractions.
2. District entry, exits (plaza east and hesper west), solids, the menu map cell, and the "Know the Streets" freeze.
3. People, routes, voices, story-gated lines.
4. The "Twelve Loaves" quest.
5. Records, readables, the secret object.
6. The Hide-and-Seek activity.
7. Chest spots via `tools/chest_spots.js`.
8. Tests:
   - Extend `tools/exploration_test.js`, `tools/exploration_polish_test.js` and `tools/meridian_playtest.js` (exit tables and district lists). Do not weaken any existing check.
   - Add `tools/hesper_test.js` covering:
     - travel in both directions;
     - collision with the new solids;
     - each NPC's lines, including the gating before and after Scene 9 (use test saves with `ch1b.k` before and after Scene 9);
     - the quest end to end;
     - Hide-and-Seek: success, timeout, the once-a-day reward, and positions that are the same on reload and different on another day;
     - records and the secret paying once;
     - chests;
     - murmurs only on small talk;
     - no Lucas;
     - an old save loading with "Know the Streets" done.
   - Run all suites on desktop, 844×390 and 667×375: exploration 36, polish 33, Meridian 41, economy 29 (or more, never fewer). Then run `tools/live_smoke.js` after deploying.
9. Update `docs/exploration/*`, `docs/economy/PROGRESSION_BALANCE_TABLE.md` (new rewards, Renown total), and `docs/world_audit/WORLD_MAP_INVENTORY.md` (St. Hesper's moves to "Freely explorable").
10. Commit locally. Push only when I say "push".

## 5. Report at the end
- Files changed.
- What was reused.
- The district layout.
- Gating rules.
- Rewards and keys.
- Test results per suite and viewport.
- Remaining issues.
