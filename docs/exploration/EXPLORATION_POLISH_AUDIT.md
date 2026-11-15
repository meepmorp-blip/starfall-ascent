# Exploration Polish · Audit (Expansion 05)

Audit of Expansion 04 (`eae97d3`), done by measuring, not guessing. `tools/chest_spots.js check` and `tools/exploration_polish_test.js` reproduce every finding below.

## Findings

| # | Area | Finding | How it was found |
|---|---|---|---|
| 1 | Chests, mobile | **21 of 35 chest spots overlapped the HUD on phones.** Spots near the top sat under the objective bar or the HP panel. Spots in the bottom-right corner sat under the touch buttons, which cover roughly the right 28% and bottom 45% of the play area. | World-to-screen projection of each spot against the real HUD and button rectangles, at 844×390 and 667×375 |
| 2 | Interactables, mobile | Six older interactables had the same problem: the hidden coin, the Aster map, the drill board, the ward clock, the festival poster and the intake ledger. | Same check, extended to every spot and object |
| 3 | Text | All world text (NPC names, the "Press F" prompt, exit names, candle engravings) was drawn into the low-resolution pixel buffer at 8 world units. On a phone that is about 8 CSS px and soft. | Font sizes against `scale` (about 0.98 on phones) |
| 4 | Prompt | The prompt was always drawn under the target, so when Kairos stood below an NPC it covered him. | Screenshots |
| 5 | Candles | The engravings were 16×12 world units, about 2 to 3 mm on a phone; the clue text was fine, but the symbols were hard to match. | Screenshots |
| 6 | NPC | **The Sister at the Cloister started at her old fixed spot, beside the hidden sundial chest**, not at the start of her route. She stood there and was picked instead of the chest. | The Expansion 04 test failed once spots changed. Real bug. |
| 7 | Chests | The three tiers differed only in body colour (common and fine looked the same), and there was no feedback for getting close. | Code review and screenshots |
| 8 | Edges | Prompts and floating reward text near the left or right edge were cut off. | Screenshots at 667×375 |
| 9 | Murmurs | Volume, the Sound effects slider, mute, and no repeats in a row all worked. No murmurs played during quests, records, chests or story. | Tests (no change needed) |
| 10 | Save | Daily state, claims and pruning worked. Nothing persistent was missing. | Tests (no change needed) |

## Not changed (working as intended)
- Daily rotation: two or three chests per district out of seven spots, a seeded pick, claim keys and pruning. Only the spot coordinates changed.
- Reward amounts.
- The NPC route model (no pathfinding).
