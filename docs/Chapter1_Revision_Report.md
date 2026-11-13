# Chapter 1 revision: final report (14 November 2026)

**Files modified**
- `index.html`: the Chapter 1 story sequence (`CH1_SEQ`), new walk missions, the walk-scene engine, the puzzle panel, and the Horaios fight prompt.
- `docs/Chapter1_Full_Script.md`: regenerated from the game.
- `docs/Starfall_Lore_Bible_v2.pdf`: the synopsis and the full-script appendix updated.

**Validation**
- An automated play-through ran the whole chapter twice, with different choices each time, from the cold open to "Chapter 1 complete". It covered:
  - every cutscene
  - all 9 puzzles
  - all 6 walk scenes
  - every mission
  - the scripted loss to Horaios
- Neither run produced JavaScript errors.
- Story flags and Bonds save correctly.
- The puzzle panel was checked at phone size.

## 1. What changed, by act

| Act | Scenes | Revisions |
|---|---|---|
| I · An Ordinary Tuesday | Cold open, 1–3 | **Cold open:** unchanged. **Scene 1:** opening thoughts cut down. The reaching-hand and Mercy-spoon memories move to the Clock Tower and to Lyra. **Errand Run:** the player reads Matteo's list once, then delivers it by memory. **Scene 3:** Kairos tries to stop time himself and fails ("So it wasn't me. Or not only me."). Agnes's tutorial line becomes natural speech. |
| II · The Unwritten | 4–8 | **Scene 6:** Theo's exposition is replaced by the **Find the Lost Minute** puzzle. Theo's scope shows the Seam grew a hand's width at 9:04, so "every time I hold the minute, the sky tears a little more" is shown, not just said. **Ward Rounds** added. **Scene 7:** the clerk's explanation is replaced by **The Queue**, where citizens show what records do to them. **Scene 8:** Dess pushes back on Marr, Marr gets his own reasoning ("Imagine giving it back to them"), and Dess watches which shelf the core goes on. |
| III · What Was Taken | 9–10 | **Scene 9:** Lucas is playable on **The Long Way Home**. A new scene in the Chancellor's study ("Everything you have, I gave you."); Lucas leaves without answering. **Safehouse:** Lucas doesn't know which version of himself is real. **Steel door:** "I don't know who I am to you yet." **Core Listening** puzzle: Dess had already swapped the little star core for a blank. **Escape:** the conversation acknowledges what Kairos lost. **Scene 10:** Kairos knows he can't hold the minute alone, the Seam visibly twitches, and Cassie stays to count the families. |
| IV · The Things We Keep | 11–12 | **Recap:** rewritten as banter. The Bond menu is replaced by a walkable **Clock Tower evening**; every talk raises Bond, and Lucas's talk is required. Lucas's line "I don't need to be who I was. I just need to be someone who doesn't leave" comes before the vow. Optional activities: Agnes's report (she leaves Kairos's name out), Theo's drone, Naomi and the burn scars, Bram's toast, Dess. **Festival walk** before the horror. **Cassie's turn:** Vane makes her drink, her anger vanishes, she asks why it feels like being robbed, and she sets her badge on the fountain. |
| V · Intake Window 1 | 13–14, coda | The Stacks get atmosphere (drawers of names, a gap where Kairos should be) and the **House Gates** puzzle. Kairos *asks* for the minute instead of claiming it, both in the cutscene and in the fight prompt. A silent panel follows the Gate ("Mine doesn't have one. His does now."), and Bram carries him out. The coda and the Chapter 2 card are unchanged. |

## 2. Character arcs strengthened
- **Lucas:** he remembers through things he finds while walking, not just a flashback. He confronts the Chancellor, doubts which self is real, and chooses who to be now. His sacrifice lines are unchanged.
- **Dess:** she questions Marr, swaps the core on her own initiative, and leads the core-listening puzzle.
- **Cassie:** she sincerely defends the Mercy, then experiences it herself. Her departure costs her something, and the badge gesture replaces a speech.
- **Marr:** he has reasoning the player can follow, while staying unethical.
- **Agnes:** she protects Kairos through paperwork, not only Bram.
- **Bram:** his mother's errand shows his faith and his grief without making him a joke.
- **Naomi and Theo:** their marriage shows in small actions ("Left pocket.").

## 3. Gameplay and interactivity report

**Engine additions (all inside the existing walk-mission system):**
- examine spots
- lines that change with story flags
- required, optional and "only after X" NPCs
- characters from the party drawn as NPCs
- Bond increases from conversations
- a reusable puzzle panel with tap, mouse and number-key input. Wrong answers explain why, after two misses the right answer glows, and optional puzzles have a "Leave it" button.

| Activity | Where | Required? | Puzzle or flags |
|---|---|---|---|
| Errand Run (G1) | Scene 1 Market Ring | Yes | 3 memory puzzles |
| The Vendor's Routine (G2) | Scene 1, talk to Matteo again | Optional | — |
| Find the Lost Minute (G3) | Scene 6 | Yes | 3-step puzzle |
| Ward Rounds (G4) | Scene 6 | Only Naomi is required | `c_ward` |
| The Queue (G5) | Scene 7 | Only the window is required | — |
| Core Listening (G6) | Scene 9 steel door | Yes | 3-step puzzle |
| The Long Way Home (G7) | Scene 9, playing as Lucas | Yes | 4 examine spots |
| Clock Tower evening (G8) | Scene 11 | Lucas and the dead clock are required | `vision`, Bonds |
| Agnes's Report (G11) | Scene 11 | Optional | 2-step puzzle |
| Theo's Drone | Scene 11 | Optional | 2-step puzzle |
| Festival walk + Bram's errand + lantern stall (G9) | Scene 12 | Cassie and Tessa are required | errand chain, lantern puzzle, Bond |
| House Gates (G10) | Scene 13 | Yes | 3-step puzzle |

**Progression flags:**
- **New:** `c_ward`.
- **Preserved:** every existing flag.
- **Save placement:** saves still resume by scene. A save made in the middle of a scene restarts near the same point in that scene.

## 4. Unresolved or proposed but not built
- NPC reactions after the Registry falls: not added, because the chapter ends on the rooftop and a Market Ring return would compete with the climax.
- A Mission-objective log beyond the on-screen goal line: not added.
- The "name on an old photograph" quest: not added, to avoid revealing too much early.
- Bram gains Bond twice per playthrough (once at the tower, once at the festival). This is intended but worth a balance check.
- The Lore Bible synopsis keeps the original summaries after each revised note. Merge them on the next bible revision.
- This chapter is now about 55–60 minutes. The story screen now says "About an hour".

## 5. Technical risks
- The new walk scenes have no exit back to the menu except through the pause menu. That is the same as the existing Market walk.
- Puzzle text is in English only, like the rest of the game.
- Nothing about the dialogue, choices or flags changed for battle mode or Practice. The new mission ids (`ward`, `queue`, `longway`, `tower`, `fest`) are story-only.
