# Development Queue · Checkpoint

**Working rules:** local only. Nothing committed, pushed or deployed. The Chapter 1 narrative is not touched. Test saves only.

**Backup of `index.html` before this queue:** a scratchpad copy (`pre_queue.html`). `git diff` shows everything changed.

| # | Task | Status | Files |
|---|---|---|---|
| 1 | Debug security fix | Done, tested (`security_test.js` 8/8) | `index.html`, `tools/security_test.js`, `tools/run_tests.js` |
| 2 | Save protection | Done, tested (`save_protection_test.js` 32/32 desk and phone) | `index.html`, `tools/save_protection_test.js`, `docs/quest_expansion/SAVE_PROTECTION.md`, `docs/TECHNICAL_AUDIT.md` |
| 3 | Fugitive system | Done, tested (`fugitive_test.js` 20/20 desk and phone) | `index.html` (`MX_FUG`, `MX_WATCHED`, the officials), `tools/fugitive_test.js` |
| 4 | NPC dialogue corrections | Done with task 3: fugitive small talk for 22 townsfolk and 4 quest offers reworded; no stale lines in 90 conversations | same |
| 5 | Map consistency | Done, tested (`map_consistency_test.js` 22/22 ×3): menu map 4×4 with the tower and annex, shows only open places; edge labels kept inside the world map; watched or safe notes after Chapter 1 | `index.html`, `tools/map_consistency_test.js` |
| 6 | Interaction indicators | Done, tested (`indicators_test.js` 14/14 ×3; Meridian playtest updated, 41/41): `!` quest or step; `?` a readable, a secret, or a person who can reveal a story (`talkFind`); nothing on small talk | `index.html` (`n.mkf`, `mxTalkHint`), `tools/indicators_test.js`, `tools/meridian_playtest.js` (one check) |
| 7 | Post-Recollection dialogue | Done, tested (`post_story_test.js` 23/23 ×3): `MX_POST` follow-ups for Agnes, Bram, Naomi, Theo, Cassie, Dess, Ottilie, Agathe and the ward nurse. Lucas (captured) is acknowledged by Bram and by his bedroll; Kairos's reflection is on the tower view | `index.html`, `tools/post_story_test.js` |
| 8 | Bond improvements | Done, tested (`bond_test.js` 9/9 desk and phone): honest reward lines (hearts, effect, "already full"); a captured Lucas's Bond is kept and added on rescue; Guide card and Journal hearts line. Bond unlocks: deliberately not added. No new Bond rewards were invented; the current system (+4% HP and ATK per heart in story battles) stays as is, and unlocks remain a future design decision | `index.html` (`bondGainLine`, `applyPendingBonds`), `tools/bond_test.js` |
| 9 | Renown and reward balancing | Done, tested (`renown_test.js` 7/7): measured 330 Renown before the clear and 605 before Chapter 2; ranks 1–5 kept, ranks 6–8 added at 340 / 460 / 570; other rewards reviewed and unchanged | `index.html` (`MX_RANKS`), `tools/renown_test.js`, `docs/economy/PROGRESSION_BALANCE_TABLE.md` |
| 10 | Recollection gameplay improvements | Done | Story fights differ (Agnes: spotlights; Bram: protect the oven, 45 s defence; Lark: waxer healers; Cass: collectors; Dess: devourers + deadline). Story-fight level = max(written, ⌈party avg/2⌉). Giveaway hints removed (Dess rebuild 2, Lark 3, Hanne 1–2). Test: `story_battles_test.js`. |

**QA pass (2026-11-16):** see `docs/QA_REPORT.md`. Fixed QA-01 (Horaios loss-scene freeze and crash), QA-02 (damaged saves crashing at Meridian). Full suite green after test updates.

**Next action:** your review. Open: QA-03 design decision; real-iPhone checks (QA_REPORT § F); merging the branch to `main` deploys the live site, so that waits for your go-ahead.
