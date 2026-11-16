# Narrative Canon Checklist · Pre-Chapter 2 Expansion

**Check every quest's text against this list before it is marked Implemented.**
- **Authority:** `Starfall_Lore_Bible_v2.pdf` and `Lore_Updates_v1.1.md`. Lore Bible references are by Part or section.
- **New facts:** log them in `docs/narrative/LORE_ADDITIONS.md`.
- **Tags:**
  - **[CANON]**: established; must not be contradicted.
  - **[NEW]**: proposed by the expansion spec; allowed, and logged as an addition.
  - **[NO]**: must not appear before the main story reveals it.

## Established canon to protect

| # | Topic | [CANON] fact | Quest rules |
|---|---|---|---|
| 1 | Bram's family | His mother never misses a Sunday. She called him **Tomas**, his brother's name. Bram's faith is warm and sincere | [NEW] A grandmother who baked is **added**, never a replacement. Don't change the Tomas line or his mother's decline. Don't say how the grandmother died |
| 2 | Agnes | Sergeant, 31: dry, sharp, in control, an older sister to her squad. Works every Sunday "on purpose". Protective of Bram ("Fourteen Vices. He had a shield and no plan."). Bram followed her into the Eastern Rift | [NEW] Her crafting is an addition. It must not soften her competence or discipline. She admits the hobby reluctantly |
| 3 | Naomi & Theo | ER doctor, 30. Writes the scary truths on her arm. Notices patients forgetting birthdays. Theo is a rift researcher, 31, building machines. **Married, warm, supportive** | [NEW] The patient they couldn't save is an addition. No marital conflict played for drama. Theo supports her without dismissing her |
| 4 | Dess & Marr | Dess, 20, is Dr. Ezekiel Marr's daughter and lab assistant. She hears memories in cores. A core plays a mother's voice: "little star". A **girl of light with Dess's freckle** rises from a core. Dess: "I'm smart enough to guess. I'm not brave enough to know." | [NEW] Records about an unnamed "Subject". [NO] Confirmation that the core is Dess's childhood (Chapter 2 [PROPOSED]). [NO] The girl's identity. [NO] Marr's full motive. [NO] Resolving her mother |
| 5 | Girl of light | Unexplained after Chapter 1 | Stays unexplained |
| 6 | Lucas's capture | At the Registry, Horaios reaches for Kairos; Lucas breaks through and is taken through the Moon Gate ("Don't you dare forget me"). Last seen at Window 1, unable to write his own name. Chapter 2 is *The Archive* | **No present-day Lucas** anywhere until `ch2.lucasRescued`. The Chapter 1 ending is not touched |
| 7 | Lucas & Kairos | Roommates at St. Hesper's. Bread and the imaginary cat joke. The kitchen fire at nine: Kairos burned his hands saving him. The Chancellor chose Lucas while Kairos was sick from the fire. A silver cup of the Mercy erased Kairos from Lucas. He remembers through bread and the cat joke (Scene 9). The vow: "I'm not losing you twice" | Part A episodes are **other** memories. Don't repeat Scene 9's lines (approved decision 5). The fire is not replayed |
| 8 | Cassie | Former Office of Correction agent, 21. Drank the Mercy every Sunday since six. Can't remember her mother's face ("the Office calls that grace"). Hesitated when Vane ordered the lodging house burned. Left the Church at the Festival: "I've kept my vows my whole life. That's exactly why I can't stay." Her faith is sincere | Her faith stays sincere. Criticise the institution, never faith itself |
| 9 | The Mercy | Holy water from the fountain that rose after the rain twenty years ago. It **wears memory away**. Reveal schedule: Chapter 1 clues only; **Chapter 2 reveals the water causes the forgetting**; later, the Demiurge is behind it | Side quests may show **symptoms and patterns** (Sunday Cups, Naomi's patient). [NO] Saying the water causes it. [NO] Naming the Demiurge |
| 10 | Horaios & the Archive | Horaios, Kosmokrator of the Moon, a clerk of moonlight who moves inside the stopped minute: "You're not the only one who's done this before." The Archive is where the Order files every processed life ([PROPOSED] for Chapter 2, run by Ailoaios) | Don't depict the Archive's inside. Don't give Horaios new motives |
| 11 | Kairos's divine identity | Hidden. The cloaked man, Lyra and "I've been here" are open mysteries | [NO] Any hint beyond what Chapter 1 already shows |
| 12 | Meridian's world | The last free city on Aster. Nothing has been mapped past the Wall in 80 years. Gnosis is "the Old Heresy". The Buried Books are [DRAFT] (hidden beneath old chapels) | The Beyond-the-Wall traveller is **unreliable**. The Buried Books, Keepers, Unbound and Hollow Choir appear only as rumour (approved decision 6) |
| 13 | After Chapter 1 | Seven on a rooftop at dawn, wanted. The Council frames the party for the Registry and for "kidnapping" Lucas. The hideout is St. Hesper's dead clock tower | Built in Stage A (wanted notices, hideout) |
| 14 | Twenty years ago | The rain fell, and the next morning the fountain had risen in Festival Square | "The Morning After" is about that night, **not** a "rift" (tracker § 6.6) |
| 15 | Photographs | No photography in canon art direction | Sketches, paintings and prints only |

## Proposed additions in this expansion (all [NEW])
- Agnes enjoys making things by hand.
- Bram's grandmother and her bread.
- Naomi and Theo's earlier patient.
- Cassie's prayer book and the old chapel's keepers.
- Marr's "Subject" records and the Institute annex.
- Lucas's other childhood memories (the failed theft, the tower plan, the room).
- The Morning After witness, the clerk, the traveller, the old Festival decorations.
- The Keepers, the Unbound, the Hollow Choir: rumour only.

## Per-quest sign-off
Before a quest is marked Implemented, its test must check its text against the spoiler regex for its row. This follows the existing convention, for example `ashlane_test.js` `SPOIL`.

| Quest | Rows to check |
|---|---|
| `agnes_handmade` | 2 |
| `bram_bread` | 1, 2, 9 |
| `lark_couldnt_save` | 3, 9 |
| `cass_prayer` | 8, 9, 12 |
| `lucas_mem_*` | 6, 7 |
| `dess_experiment` | 4, 5, 9, 11 |
| `lucas_hang_*` | 6, 7, 10 |
| `side_morning_after` | 9, 14 |
| `side_names_paper` | 9, 13 |
| `side_sunday_cups` | 9 |
| `side_festival_forgot` | 9, 15 |
| `side_empty_chapel` | 8, 12 |
| `side_unofficial_prayer` | 12 |
| `side_missing_page` | 9, 12 |
| `side_beyond_wall` | 12 |
