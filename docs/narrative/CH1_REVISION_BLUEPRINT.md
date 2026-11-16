# Chapter 1 Revision · Blueprint (v2, for review)

**Status:** planning only. No game code, saves, assets or live site have been changed. Waiting for the owner's approval.

**v2 changes** (owner review of v1, 2026-11-16)
- Lucas's timeline made exact (§ 3).
- Theo and Marr's history checked against canon (§ 4).
- Lucas's playable sequence specified (§ 5).
- Length broken down (§ 8).
- Every canon change compared (§ 9).
- Save migration and systems impact (§ 10).
- Party and balance (§ 11).
- An identity guardrail (§ 12).
- Ash Lane's new unlock point corrected: the v1 idea (Lucas's walk) didn't fit the map.

**Sources**
- The owner's revision brief and v1 review notes.
- `Starfall_Lore_Bible_v2.pdf`: Part 13 (Chapter 1), Part 15 (characters), Part 16 (mysteries), the Chapter 2 plan.
- `index.html`: `CH1_SEQ`, the Chapter 1 missions, `seqKey`/`seqFind`, `ch1Scene`, `mxMet`, `WORLD_LOCS`.
- `docs/quest_expansion/*` (shipped post-Chapter 1 content).

**Tags**
- **[CANON]:** Lore Bible or shipped game.
- **[CHANGE]:** the owner's brief changes canon.
- **[NEW]:** proposed addition.
- **[Q]:** needs a decision.

The owner's ten v1 answers are applied as recommended. They are listed in § 13 so they can be checked at a glance.

---

## 1. What stays and what changes
- **Stays:**
  - The cold open, the stopped minute, Agnes and Bram, the hospital rift, Theo's lost minute.
  - Marr's experiment, the "little star" core, Dess's betrayal, the girl of light, the breakout.
  - The clock tower, Lyra, the Festival and Tessa's mother, the eclipse, the five rifts.
  - The Registry, the Stacks, Intake Window 1, Horaios, Lucas taken, the dawn rooftop, the coda.
  - All combat, UI, maps, art, progression and the party system.
- **Changes:** *why* people move, *who* is where, how Lucas and Cassie arrive, and why the party goes to the Festival.
- **Removed:** the Ash Lane rooftop ambush and the lodging-house fire. Their gameplay is rehomed: the time-stop rescue moves to the Festival.

---

## 2. Revised scene outline
**The timeline in brief**
- Day 1 (Tuesday): R1–R6.
- Day 2 (Wednesday): R7–R12. The breakout is at 23:00, and the night runs past midnight.
- Day 3 (Thursday): R13 runs from early hours to dawn, then R14.
- Day 4 (Friday, the Festival): R15–R16, and the dawn after.

Each scene answers the five questions: **Knows** (what the party knows), **Problem**, **Proposes** (who suggests the next move), **Why agree**, and **Moves on by**.

### Act I · An Ordinary Tuesday (unchanged)
| Id | Scene | Old | Kept as built |
|---|---|---|---|
| R0 | Cold open | CO | cutscene |
| R1 | Tuesday Errands | 1 | `market` walk, Tessa choice (`c_bread` / `c_earnest` / `c_joke`) |
| R2 | The Stopped Minute | 2 | `chase` |
| R3 | First Blood | 3 | `first`, `garrison`, Agnes choice (`c_ines_*`); Agnes and Bram join |
| R4 | Who Are You? | 4 | cutscene |
| R5 | Carry Him | 5 | `carry` |

### Act II · Records (Day 1 evening → Day 2)
**R6 · St. Lucia's** (old 6, revised). Day 1, evening.
- **Characters:** Kairos, Agnes, Bram, Naomi, Theo.
- **Knows:** time stopped, Kairos moved, he glowed, rifts opened inside the walls.
- **Problem:** what is wrong with him?
- **Plays:** kept as built: Naomi's exam and the arm writing, `c_noemi_*`, Theo's reader puzzle (sixty seconds, the centre was Kairos, the Seam grew), the ward rift `lucia` (pick 3 of 5) and `ward`.
- **Proposes:**
  - Naomi: "Medically, nothing is wrong with you. Which is what's wrong with you."
  - Theo: the Concord Office holds every clock log *and* every birth chart. "If your chart says anything about this, it's there."
- **Why agree:** Kairos has never seen his own chart. Nobody ever showed him [CANON, Scene 7's "Nobody ever showed me mine"].
- **Naomi stays** [CHANGE]: three of her minute patients can't remember their birthdays [CANON: she notices birthday loss]. "Somebody has to write it down while it's still strange."
- **The ticker** [NEW]: Theo gives her one of a pair of brass ticker boxes (§ 9.5). Short **Ticker** panels keep her in the story.
- **Moves on by:** the next morning, the Office.
- **Recruitment:** Naomi and Theo join for `lucia` and `ward`. Naomi then **leaves the roster** (new step `{leave:'noemi'}`). She stays *met* for the hub (§ 10).

**R7 · The Concord Office** (old 7, revised heavily). Day 2, morning.
- **Characters:** Kairos, Agnes, Bram, Theo, a records clerk, Lucas, Marr.
- **Problem:** get his chart, and file the anomaly.
- **Plays:** the `queue` walk (kept).
- **What happens:**
  1. Theo files the clock report at another window ("Don't sign anything").
  2. The **records clerk** (`rclerk`) searches twice and finds no record. "Every child in Meridian is registered within the hour" (kept line).
  3. Kairos **loses his temper** [NEW]: St. Hesper's, Sister Agathe, nine years, the bakery. Agnes holds his shoulder and Bram steps in front of the guards.
  4. The commotion draws **Lucas** [CHANGE], a senior clerk crossing the hall: reserved, polite. "Is there a problem with this record?" He reads the empty search slip. Kairos recognises him.
     - **Choice (kept):** `c_truth` "We shared a room for nine years." / `c_lie` "…No. Sorry. Wrong person."
     - Lucas doesn't believe him, but a missing record is *impossible* here. "Records don't go missing. They go to the Registry." He keeps the slip: "I'll look into it."
  5. **Marr** [CHANGE: he offers instead of seizing] is at the Office collecting the Garrison's Vice reports [NEW]. He overheard the shouting and sees the **clock mark** where Kairos's collar was pulled in the scuffle.
     - He offers a consultation: "St. Lucia's couldn't tell you what's wrong with you. I can."
     - Kairos **goes willingly**: he wants answers. Agnes: "I don't like how fast he smiles." She can't stop a free man.
  6. **Theo returns:** "Where's Kairos?" Bram: "With a Dr. Marr. He said he could help." Theo goes white. The history comes out in **three lines, no more** (§ 4).
- **Moves on by:** Theo leads them to the Institute gate. They're refused: "the patient signed in voluntarily". **Agnes stops Bram forcing the gate** (kept line, moved here). They need a way in.

**R8 · This Won't Hurt** (old 8, kept and extended). Day 2, afternoon. Institute, sub-level 3.
- **Plays:** kept as built: the clock on the wall, the needle, the Marr choice `c_marr_*`, "you signed… you just don't remember", the "little star" core, Dess: "My mother called me that."
- **Extension:**
  - Marr sees the core **sync to Kairos's pulse**: Kairos *interacts with* the memories in cores. He doesn't know what Kairos is, only that he's the most valuable subject he has ever had.
  - He changes the order from "consultation" to "**observation, retained indefinitely**, night transfer at 23:00 shift change".
- **Dess's progression:**
  1. She pushes back (kept).
  2. She watches which shelf he uses (kept).
  3. **New:** she reads "retained indefinitely" and recognises the wording from an old file she was never allowed to open. That echoes her Bond Story.
  4. She swaps the core for a blank (kept, now motivated).
- **Moves on by:** evening. Cut to Lucas.

### Act III · Two Ways In (Day 2 evening → night)
**R9 · The Long Way** (old 9 first half, expanded; Lucas alone). Day 2, 18:00–21:30. Full design in § 5.
- **Plays:** the Office archive (a short walk); the `longway` walk (kept); Sister Agathe; the **solo fight** `lucas_alone`; the fire flashback (kept); the playable "morning after" memory.
- **Moves on by:** Lucas goes back to the Office for the transfer register (§ 3).

**R10 · The Plan** (old 9 safehouse, revised). Day 2, 21:00. Agnes's Garrison safehouse.
- **Characters:** Agnes, Bram, Theo; Naomi on the ticker.
- **Knows:** Kairos is inside "on observation"; the gate won't open.
- **Proposes:**
  - Theo knows the public floors from his Institute years but never went below sub-level 1 (fixes the old "we don't even know which floor").
  - **Naomi**, by ticker: the Institute's linen and specimen bins go to St. Lucia's laundry every night, and the cart goes back at 23:00. She can put people on it.
  - Agnes decides: three ride in, and they open the service stairs from inside.
- **Why agree:** it's the only door that opens from the inside.
- **Ash Lane unlocks here** [CHANGE]: the laundry cart's route from St. Lucia's runs up Ash Lane, the city's washing street (§ 9.7).
- **Moves on by:** 23:00.

**R11 · Breakout** (old 9 second half, kept with a convergence). Day 2, 23:00–23:40.
- **Plays:** kept as built: `assault` (pick 3), Kairos's `sneak` ("someone's holding it with me": held minute #2), the sealed door, Dess with the key card, the cores puzzle, the girl of light, Dess joins, `escape`.
- **Convergence** (§ 3): mid-`assault`, a records-courier lift opens from inside and **Lucas** steps out. He joins for the rest of the breakout (`join:'lucan'`).
- **Marr** [NEW]: he watches from the observation gallery, calm, writing: "Subject retained. Observation continues." He is not caught, and reports a "heretic break-in" to the Council.
- **After the escape** (in the service yard; kept lines, trimmed): "I'm sorry" / "You came back." Then **Lucas leaves** (`{leave:'lucan'}`) **before** the hideout is chosen (§ 3).
- **Moves on by:** Agnes: "The safehouse is burned. Marr saw Bram's face." They need somewhere nobody checks. That leads into R13.

**R12 · The Crane House** (old 9 study scene, moved and shortened). Day 2, about 00:30.
- **Plays:** kept as built, trimmed to the confrontation: the silver cup on the shelf; "I accepted it on your behalf"; "He burned his hands for me." Lucas takes his coat.
- The player has already *seen* the morning after in R9, so the panel no longer re-explains it.
- **Moves on by:** Lucas has nowhere to go. He remembers one place (§ 3).

### Act IV · Sanctuary (Day 3)
**R13 · The Clock Tower** (old 11, revised; Cassie's introduction). Day 3, 00:15 → morning.
- **Proposes:** **Kairos.** The tower above St. Hesper's is locked, dead, and nobody climbs it. He and Lucas hid there as children [CANON, Scene 11].
- **Why agree:** it's the one roof he knows better than the Garrison does.
- **What happens:**
  1. Climb in. Toast. `c_breakfast` / `c_job` (kept). The Aster and the Wall talk (kept).
  2. **Cassie is already there** [CHANGE, motive per § 13]. Office of Correction, off duty, in the bell loft that looks down into St. Hesper's records room. She is reading the orphanage's Sunday spoon ledger for children brought in the week of the fountain night.
     - She recognises Kairos from tonight's warrant and **doesn't** arrest him: he's not her assignment, and she's busy.
     - A hymnal page pressed in her prayer book: "The seven who were set to keep the gates have forgotten their keeping" [NEW lore hint].
     - She drinks from a small vial of the Mercy before she leaves ("for bad nights") and doesn't explain.
     - **New choice:** `c_cass_ask` "Why are you really up here?" / `c_cass_leave` "We'll go if you want." Her answers stay guarded either way.
     - Parting line: "The Office searches St. Hesper's in two days. Be gone by then."
  3. **The Bond walk** `tower` (kept), with optional talks adjusted to who is present (§ 11).
  4. **Lucas arrives** at about 02:00 (§ 3) and **rejoins for good** (`join:'lucan'`).
  5. **Lyra on the beam** (kept, trimmed): "Don't drink anything they give you."
- **Moves on by:** morning, the ticker.

**R14 · Naomi's Warning** (new). Day 3, morning. The tower, by ticker.
- The Office and the Garrison search St. Lucia's for Kairos's chart and ask about Naomi.
- **Festival news:** the Church has requisitioned the hospital's water carts and every clean cup. This year the Mercy goes to everyone in the Square: "the Festival of One Cup" [NEW].
- Naomi's pattern: her birthday patients all went to Sunday service. She writes it on her arm and **draws no conclusion** [CANON reveal schedule].
- **Why each goes:**

| Character | Reason |
|---|---|
| Theo | An eclipse at noon tomorrow means Seam stress, at the same hour as a city-wide cup |
| Agnes, Bram | Protect thousands of civilians; her squad has Festival steward duty, so she knows the posts |
| Dess | The cores sang louder when she carried them past the fountain district |
| Lucas | The Registry files every Festival attendee by cup number. He's handled the forms for years and never asked why |
| Kairos | It all started at that fountain, twenty years ago |
| Naomi | Stays to take the wounded |

- **Careful entry:** Agnes's and Bram's steward armbands; mourners' veils for the rest [NEW]. They move in pairs.

### Act V · The Festival and the Registry (Day 4)
**R15 · Festival of the Mercy** (old 12, revised and expanded).
- **Plays:** the `fest` walk (kept), plus:
  - **Patrols:** existing route-walking NPCs (§ 12). Getting next to one shows "Move along" and puts you back a few steps. Nothing fails.
  - **The Unburdening** [NEW]: people write a grief on a slip, burn it in a lantern, drink, and the choir sings "Drink, and be forgiven. Drink, and let it go" (kept line). It is beautiful, and the faces afterwards are a little empty.
  - Optional NPCs (kept): the widow, the believer, Rosa's "pennies", and Bram's errand to his mother, who calls him Tomas [CANON].
- **Tessa's mother** (kept): "Tessa, why was I crying?"
- **Cassie's turn** (kept beats, made gradual):
  1. Vane makes her drink, and she can't find her anger: "Then why does it feel like being robbed?" (kept).
  2. **New:** she covers for Kairos's pair at a patrol: "These two are mine." Then she walks off.
  3. **At the eclipse:** the badge goes on the fountain rim, "I've kept my vows my whole life. That's exactly why I can't stay" (kept). She joins (`join:'cass'`): "Don't make it strange" (kept).
- **The eclipse:** five rifts (kept).
  - **Held minute #3** [CHANGE, moved from the old lodging fire]: a lantern rig falls over the cup line where Tessa and her mother stand. Kairos asks for help, something answers (kept lines), and the **`rescue`** mission plays in stopped time.
  - Then `festival` (pick 3 of 7).
- **Moves on by:** every Vice turns toward the Registry (kept). Theo's reader points the same way the cup carts went.
- **Marr seed** [NEW, one panel]: a man with glasses on a chain takes eclipse readings at the edge of the Square. The party doesn't see him.

**R16 · The Registry → Intake Window 1 → dawn** (old 13–14, kept, enriched).
- **Why follow:**
  - Lucas: every record in Meridian, and one blank one.
  - Theo: whatever pulls Vices is what pulled the minute.
  - Agnes: night staff are inside.
- **Plays:**
  - Kept: Lucas's father's keys; the gates puzzle; `stacks` split; the vision "I've been here"; Horaios; the forced loss; Lucas taken; the collapse; Bram carries him.
  - **New clues:** drawers filed by House; warm drawers for people who drank today; outgoing forms stamped with Mercury's sign and "FORWARD: ARCHIVE".
- **Dawn rooftop** (kept: Crane's broadcast, the toast, `c_been`, `c_job`, the Lyra and cloaked-man coda). **Naomi arrives** with her bag, having walked out of St. Lucia's after the search: seven on the rooftop [CANON].

---

## 3. Lucas's timeline (exact)
| Time | Where | What Lucas does | What he knows | Why |
|---|---|---|---|---|
| Day 2, 10:00 | Concord Office | Sees the scene, hears "St. Hesper's", keeps the search slip | A stranger says they were roommates; the stranger has no record | Professional: a missing record is impossible |
| 18:00 | Office archive (after hours) | Pulls St. Hesper's intake ledgers. Finds Kairos ("Foundling. 11:59. No chart.") and, two lines below, **his own intake page**: "Lucas, foundling. Discharged to the household of A. Crane", dated the morning after a kitchen fire | He *was* at St. Hesper's; nobody ever told him | He has never seen his own page |
| 19:00 | The long way (`longway`) | Walks to St. Hesper's and knows every turn | Déjà vu (bread, window, saucer, gate clock) | He wants to see the place |
| 19:30 | St. Hesper's gate | **Sister Agathe** recognises him: "You were the other boy." She tells him about the fire, the boy who pulled him out, and the Chancellor at the door | Kairos is real; Kairos saved him | — |
| 20:00 | Orphanage roof | **Solo fight**: a Vice carrying his memories (§ 5) | Flashes of bread, a laugh, smoke | It attacks the orphanage, the way Vices did after the fire [CANON] |
| 20:15 | Memory | The fire (kept), then the playable morning after (§ 5). Last fragment: Kairos's voice, "Inspection's over at nine. Meet at the tower." | The fire, the hands, the window, being taken, the cup, the tower | — |
| 21:30 | Concord Office (his clearance) | Reads the **transfer register**: Marr's order, "retained indefinitely", night transfer at the 23:00 shift change, sub-level 3 | Where Kairos is, and that tonight is the last easy chance | He decides to help |
| 23:00 | Institute, via the **records-courier lift** (senior clerks have courier passes [NEW]) | Comes up into the corridor where the outside team is fighting | — | **Convergence:** both plans use the 23:00 shift change, his from the register and the party's from Naomi's laundry schedule. It isn't luck; it's the same timetable |
| 23:40 | Service yard | Leaves **before** the hideout is chosen: "I have to ask my father something. Tonight, while I still remember the question." | He doesn't know where they'll hide | — |
| 00:30 | Crane house (R12) | Confronts the Chancellor and takes his coat | He can't go home | — |
| 02:00 | Clock tower (R13) | Guesses where Kairos would hide, from the R9 fragment ("Meet at the tower"), and climbs up | The tower from his recovered memory | He has nowhere else, and he thinks Kairos would choose it |

**Consistency checks**
- Lucas never learns the hideout from the party. He learns it from his own memory.
- He doesn't need the safehouse address, which fixes v1's continuity gap.
- In R11 he is *reserved*. Agnes: "You said 'next'." Lucas: "This afternoon I didn't remember a kitchen fire" (kept line).
- His full reunion beat moves to R13 (the tower), where he says what he remembers in his own words.

---

## 4. Theo and Marr: history check
**Canon checked**
- **Lore Bible:** Theo is "a rift researcher nobody takes seriously… Measured the lost minute and traced it to Kairos."
- **Theo's line [CANON]:** "I've been waiting six years for something weird enough to prove I'm not crazy."
- **Marr's line [CANON]:** "Mr. Lark", not "Dr.", already reads as condescension.
- **Theo's line [CANON]:** "The Institute is a fortress. We don't even know which floor." This **conflicts** with Theo having worked there, unless he never went below the public floors. v2 rewrites it as "I know the public floors. I never got below sub-level one."
- Nothing in canon says Theo was never at the Institute.

**Proposed history** [NEW, a proposed canon addition, not established]
1. About eight years ago, Theo joined the Institute's rift-instruments section and built the first Seam reader.
2. Marr ran Vice research on the lower floors. Marr asked for Theo's reader to measure cores "in living tissue". Theo saw the observation log of a Garrison volunteer who couldn't remember volunteering.
3. Theo refused to lend the reader and **resigned quietly**. There was no confrontation and no scandal.
4. Marr let it be known that Theo's rift work was "fringe". Funding and invitations stopped.
   - That is *why* nobody takes Theo seriously (it explains the canon line).
   - It also explains the **six years** (it fills them).
5. The rivalry is **professional, not personal melodrama:**
   - Marr: "Mr. Lark. Still measuring the sky?"
   - Theo: "Still taking things apart that don't come back together?"
   - Marr thinks Theo is gifted and sentimental. Theo thinks Marr is brilliant and dangerous.
   - Neither gives a speech about it.

**How it shows on screen**
- R7: three lines when Theo learns where Kairos went.
- R10: "I never got below sub-level one."
- One optional tower talk (R13).
- Nothing else in Chapter 1. More is left for Marr's return in Chapter 2.

---

## 5. Lucas's playable sequence (R9): gameplay design
Built only from **existing systems**: walk scenes, interact points, a fight mission, cutscene panels, the KID sprite option from the Part A memories, and choices.

| Part | Player does | System | Est. |
|---|---|---|---|
| a. The archive | Walks the empty Office at dusk as Lucas: reads the search slip, finds the St. Hesper's shelf, opens his own intake page | New small walk mission (Office art, 3 interact points) | 1.5 min |
| b. The long way | The kept `longway` walk: the bakery end piece, the kitchen window, the saucer, the gate clock (existing lines) | Kept mission | 2 min |
| c. Sister Agathe | Talks at the gate. One choice: ask about "the other boy" or about "the fire" (it only orders the same information) | Cutscene panels and a choice | 1.5 min |
| d. **The Vice on the roof** | Solo fight as Lucas (long-range DPS). A Vice that *carries his memories*: the larger Collector-type Vice the game already has, renamed "the Vice that remembers him". At 75%, 50% and 25% health it **freezes the screen for a beat** (the existing frozen tint) and shows a fragment line ("bread, still warm", "someone counting", "smoke"). Its adds are ordinary Gossips. It is tuned for one character with no swapping | New mission entry (`addMission`) using existing enemy types and the existing frozen tint; party `['lucan']` | 2.5 min |
| e. The core | Its core falls. Lucas picks it up, and the memory begins | Cutscene | — |
| f. **The fire** | Kept panels: the cat lines ("If Sister Agathe catches us…"), the curtains catching, time stopping, Kairos pulling him out, the hands | Kept cutscene | 1.5 min |
| g. **The morning after** (playable) | Walks as **nine-year-old Lucas** (KID sprite) across the St. Hesper's yard to the Chancellor's carriage at the gate. Interact points: Sister Agathe hands over his bag ("Your things. All of them"); a **window** where a boy with bandaged hands is asleep; the carriage. At the window, the choice `c_lucas_door`: **knock** ("I'll come back for you") or **keep walking**. At the carriage he looks up at the clock tower, and a fragment in Kairos's voice: "Inspection's over at nine. Meet at the tower." | Kid walk mission (as built for Part A), interact points, a choice | 2 min |
| h. The cup | Kept narration, trimmed: the silver cup that night, "So the new life can begin clean." He slept for two days | Cutscene (2 lines) | 0.5 min |
| i. Back on the step | Present day. Lucas holds the cold core. What he has: the fire, the hands, the window, the tower. What he doesn't: years of their friendship (the bread years, the plans, the room). Those come later, in Chapter 2 and in the Part A memories | Cutscene | 0.5 min |

**What the player learns that makes R11 and R13 meaningful**
1. Lucas was taken **because Kairos was sick** [CANON]. He now *saw* himself leave Kairos behind, with his own feet.
2. **New:** if he knocked, he promised to come back, and then the cup took the promise. The canon vow "I'm not losing you twice" now repays a promise the player watched him make.
3. The **tower** is *his* memory too, so his arrival at R13 is earned.

**Not revealed** (kept for later)
- Why the Chancellor wanted "the boy who counts".
- What the cup does in general.
- Why Vices gathered on the roof that night.

---

## 6. Character presence timeline
●: present / playable · ◐: remote (ticker or own scene) · ○: absent · ✕: taken

| Scene | Kairos | Agnes | Bram | Theo | Naomi | Lucas | Dess | Cassie | Marr |
|---|---|---|---|---|---|---|---|---|---|
| R1–R2 | ● | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| R3–R5 | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ |
| R6 | ● | ● | ● | ● | ● (leaves after) | ○ | ○ | ○ | ○ |
| R7 | ● | ● | ● | ● (steps away) | ◐ | ● NPC | ○ | ○ | ● |
| R8 | ● | ○ | ○ | ○ | ○ | ○ | ● NPC | ○ | ● |
| R9 | ○ | ○ | ○ | ○ | ○ | ● solo | ○ | ○ | ○ |
| R10 | ○ | ● | ● | ● | ◐ ticker | ○ (at the Office) | ○ | ○ | ○ |
| R11 | ● | ● | ● | ● | ○ | ● joins, then leaves | ● joins | ○ | ● watches |
| R12 | ○ | ○ | ○ | ○ | ○ | ● | ○ | ○ | ○ |
| R13 | ● | ● | ● | ● | ◐ | ● from 02:00 | ● | ● NPC, leaves | ○ |
| R14 | ● | ● | ● | ● | ◐ ticker | ● | ● | ○ | ○ |
| R15 | ● | ● | ● | ● | ○ | ● | ● | ● joins | ◐ unseen |
| R16 Registry | ● | ● | ● | ● | ○ | ● → ✕ | ● | ● | ○ |
| R16 dawn | ● | ● | ● | ● | ● | ✕ | ● | ● | ○ |

---

## 7. Choices and flags (one list, consistent with § 2)
| Flag | Set | Read | Status |
|---|---|---|---|
| `c_bread` / `c_earnest` / `c_joke` | R1 | R6 (`c_earnest`, now Naomi's last line before Kairos leaves), R13 (`c_joke`) | Kept |
| `c_ines_fight` / `c_ines_joke` | R3 | R4 | Kept |
| `c_noemi_joke` / `c_noemi_sharp` | R6 | — | Kept |
| `c_truth` / `c_lie` | R7 | R9a (Lucas's archive thoughts), R13 (Lucas's reunion line) | Kept |
| `c_marr_joke` / `c_marr_comply` / `c_marr_silent` | R8 | R11 (Dess) | Kept |
| `c_lucas_door` | R9g | R13 (Lucas: "I said I'd come back"), R16 (the last words before the Gate gain one line) | **New** |
| `c_cass_ask` / `c_cass_leave` | R13 | R15 (one Cassie line) | **New**, replaces `c_cass_name` / `c_cass_joke` |
| `c_cass_name` / `c_cass_joke` | (old 10) | — | **Retired**; left harmless in old saves |
| `c_breakfast` / `c_job` | R13 | R16 | Kept |
| `c_been` | R16 | — | Kept |

---

## 8. Length and pacing
### Estimated playtime by section
The current chapter's menu says "about an hour". My section estimates are scaled to match a measured total of about 55 minutes for today's version.

| Section | Dialogue | Exploration | Combat | Other | Revised total | Today |
|---|---|---|---|---|---|---|
| R0 Cold open | 1 | — | — | — | **1** | 1 |
| Act I (R1–R5) | 3 | 1.5 (market) | 3 (`chase`, `first`, `garrison`) | 1.5 (`carry`) | **9** | 9 |
| R6 Hospital | 2 | — | 2.5 (`lucia`, `ward`) | 1 (reader puzzle) | **5.5** | 5 |
| R7 Office | 2 | 1.5 (`queue`) | — | — | **3.5** | 2.5 |
| R8 Institute | 2 | — | — | — | **2** | 2 |
| **R9 Lucas's sequence** | 2.5 (Agathe, the cup, the step) | 3.5 (archive, `longway`) | 2.5 (solo) | 3.5 (the fire, the playable morning after) | **12** | 4 (Scene 9's Lucas part) |
| R10 Plan | 1 | — | — | — | **1** | 1 (safehouse) |
| R11 Breakout | 1.5 | 1.5 (`sneak`) | 4 (`assault`, `escape`) | 1 (cores puzzle) | **8** | 8 |
| R12 Crane house | 1 | — | — | — | **1** | 1.5 |
| Old Scene 10 rooftop | — | — | — | — | **0** | 4.5 (cutscene, `cass` boss, `rescue`) |
| R13 Clock tower | 3 (arrival, Cassie, Lucas, Lyra) | 3 (`tower` Bond walk, optional) | — | — | **6** | 4 |
| R14 Naomi's warning | 1.5 | — | — | — | **1.5** | 0 |
| **R15 Festival** | 3 (Tessa, Cassie, the ritual) | 3.5 (`fest` + patrols) | 2.5 (`festival`) | 1 (`rescue`) | **10** | 6.5 |
| **R16 Registry finale** | 3 (Window 1, dawn, coda) | — | 4 (`stacks`, the loss) | 0.5 (gates puzzle) | **7.5** | 7.5 |
| **Total** | | | | | **≈ 69 min** | **≈ 56 min** |

About 30 of the 69 minutes are dialogue-heavy, 17 exploration, 19 combat and 3 other.

### Slow or repeated spots, and the fix (no character moments removed)
1. **Lucas's memories told twice.** The player *plays* them in R9, then Lucas recounts them at R11 and R13. Fix: R11 gets one look and one line; R13 tells only what's *new* to Kairos (the window, the tower).
2. **Crane study vs. the R9 memory.** R12 is now a confrontation, not exposition; trimmed to about 1 minute.
3. **Two warnings about the water** (Lyra, then Naomi). Lyra keeps one line ("don't drink"); Naomi gives the facts. They are different kinds of information.
4. **Two people drink at the Festival** (Tessa's mother, Cassie). Both stay: one is a stranger's loss, the other a character's choice. The ritual intro is kept short.
5. **Theo explaining the minute** happens once (R6). R7 and R10 must not re-explain it.
6. **Act III keeps Kairos offscreen** from R9 to R10 (about 13 minutes). This is acceptable because R9 is the chapter's most personal gameplay.

---

## 9. Canon changes: comparison
| # | Lore Bible v2 / shipped game | Revised | Why | Affects later | Essential? |
|---|---|---|---|---|---|
| 9.1 | **Cassie's introduction:** an Office "Inquisitor" ambushes the party on the Ash Lane rooftops after the escape (Scene 10) | Met at the clock tower, already there on her own business; cold, doesn't join | The brief: the rooftop is a random confrontation with no setup | Cassie's Bond Story (compatible); Ash Lane rules; Chapter 2 references to "the roof" (none found) | **Essential** |
| 9.2 | **Father Vane's lodging-house fire** (canon: "Hesitates when Father Vane orders a lodging house burned") | Removed. Vane appears only at the Festival | It depends on 9.1; a second mass-casualty set piece crowds the chapter | Lore Bible Part 15 (Cassie's bio line); Vane's later role must not cite it | **Essential** (follows 9.1) |
| 9.3 | **Held minute #3:** Kairos stops the lodging fire (the `rescue` mission) | Kairos stops a falling lantern rig over the Festival cup line (same mission) | Keeps the coda's "Three times" true and gives the Festival an action beat | Coda wording (unchanged) | **Essential** (needed for the coda count) |
| 9.4 | **Theo** has no stated link to the Institute | Was on Marr's staff about two years, eight years ago; resigned quietly; Marr made him "fringe" | Gives the rivalry roots; explains "nobody takes seriously" and "six years" | Chapter 2 (Marr's return), Theo's future story; rewrites one line ("which floor") | Optional (strong) |
| 9.5 | **No ticker device** | Theo's paired brass ticker boxes, tapping short messages over the city's speaking-horn wires (the same network Crane uses at dawn) | Keeps Naomi present without a phone; fits "builds machines out of whatever he finds" | Chapter 2 communication (limit: short, slow, could be intercepted) | Optional (or replace with notes carried by a hospital runner) |
| 9.6 | **Cassie's motive:** a true believer who breaks at the Festival | Same break, but she was already privately investigating the spoon ledger, carries a Mercy vial for bad nights, and owns a hymnal page about the gate-keepers | The brief: her own agenda and her use of the Mercy as relief | Her Bond Story (it gains setup); Chapter 2 "Cassie after the reveal" | Essential in part (the agenda); optional in part (the vial, the hymnal page) |
| 9.7 | **Ash Lane unlocks** at Chapter 1 Scene 10 (`need:{ch1:10}`), tied to the rooftop | Unlocks at R10: Naomi's laundry cart runs up Ash Lane, the washing street. (v1's "Lucas's walk" didn't fit the map: Ash Lane is south-east, between St. Lucia's and the south; the Office and St. Hesper's are north and east) | Scene 10 is gone | `WORLD_LOCS.ashlane.need`, `ashlane_test` (save keys and its no-rooftop rule), `docs/world` | **Essential** |
| 9.8 | **Lucas** is the clerk who opens Kairos's blank record | A normal clerk; Lucas is drawn by the commotion | The brief | Chapter 2 references to Window 3 / the clerk (none found); the Lore Bible Scene 7 summary | **Essential** |
| 9.9 | **Lucas** remembers off-screen and knocks at the Garrison safehouse | His own playable thread; joins inside the Institute; leaves; finds the tower from memory | The brief; fixes the safehouse-address gap | Part A memories (no overlap, § 14); Chapter 2's rescue (stronger) | **Essential** |
| 9.10 | **Marr** takes Kairos with guards and "consent" | Offers help; Kairos goes willingly; consent becomes "retained indefinitely" inside | The brief; he's a manipulator, not a kidnapper in public | Dess's Bond Story wording ("retained"); Chapter 2 Marr | **Essential** |
| 9.11 | **Naomi** joins in Scene 6 and stays with the party | Stays at St. Lucia's (R6–R16) and arrives at dawn | The brief | Combat balance (§ 11); tower Bond talks; the hub's "met" check (§ 10) | **Essential** |
| 9.12 | **Festival motive:** Lyra's warning | Naomi's warning, the "Festival of One Cup", disguises | The brief | None | **Essential** |
| 9.13 | Lore hints | House-filed drawers, warm drawers, a Mercury "FORWARD: ARCHIVE" stamp; Marr's "patrons" | The brief (link to the cosmic system, an unnamed organisation) | Chapter 2 Archive / Ailoaios; the future organisation | Optional (recommended) |

After approval, these go into `Lore_Updates` as v1.2, so the Lore Bible is never silently overwritten.

---

## 10. Save compatibility and systems impact
### How resume works today (from the code)
- `save.ch1b = {i, k, roster, flags}`.
- `k` is the **scene tag plus a step offset**, for example `"Scene 9#4"` (`seqKey`).
- On load, `seqFind` finds the scene by tag and steps in by the offset. **If the tag no longer exists, it falls back to the raw index `i`**, which would land on the wrong step in a reordered chapter.
- `ch1Scene()` reads the number from the tag. World unlocks use it: the Office at `ch1:7`, Ash Lane at `ch1:10`.
- `mxMet(id)` reads `ch1b.roster` to decide who is "met" in the pre-clear hub.

### Impact
| System | Impact | Action |
|---|---|---|
| **Cleared saves** (`ch1Clears>0` or `done`) | None: `ch1Scene()` returns 99 and all post-Chapter 1 content is unaffected | Nothing |
| **Mid-chapter saves** | Old tags for Scenes 9, 10, 11 and 12 change meaning; Scene 10 disappears | **Key map** (below) |
| **Scene tags** | New scenes must keep numeric order for `ch1Scene()` | Use tags: R6 "Scene 6", R7 "Scene 7", R8 "Scene 8", R9 "Scene 9", R10 "Scene 9.5", R11 "Scene 9.6", R12 "Scene 9.8", R13 "Scene 11", R14 "Scene 11.5", R15 "Scene 12", R16 "Scene 13" and "Scene 14". "Scene 10" is retired. The regex reads the leading integer, so "Scene 9.5" counts as 9 |
| **Roster** | Naomi leaves after R6; Lucas leaves after R11 and returns at R13 | New `{leave:id}` step; the key map fixes old rosters |
| **"Met" in the hub** | `mxMet('noemi')` would turn false when she leaves the roster | Add `ch1b.met` (only grows); `mxMet` checks `met` *or* the roster. Old saves: `met` = old roster |
| **Ash Lane** | `need:{ch1:10}` would now unlock at the tower (11) | Change to `need:{ch1:9}` plus an R10 flag (`ch1b.flags.ashlane`), so it opens exactly at the laundry-cart scene |
| **The Office** | `ch1:7`, unchanged | Nothing |
| **Choice flags** | `c_cass_name` / `c_cass_joke` are no longer read | Leave them (harmless); new flags default to their neutral line |
| **Rewards** | The first-clear reward is once only (`ch1:first`), unchanged. Per-mission Memories and Stardust come from the missions played. The retired `cass` mission's star rating stays in old saves (harmless). New missions get ratings like any other | Nothing to migrate |
| **Bonds** | Kept in `save.bonds` across replays (unchanged). Tower Bond talks change cast (§ 11) | Naomi's tower Bond moment becomes a ticker exchange with Theo |
| **Achievements** | None in the game beyond star ratings and Renown | Nothing |
| **Tests** | `narrative_foundation`, `ashlane`, `meridian_playtest` and fixtures use `'Scene 9#2'`, `'Scene 10#3'`, `'Scene 14#9'` | Update the fixtures; add `ch1_revised_test.js` and `ch1_migration_test.js` |

### Migration strategy (one-time, non-destructive, in `loadSave()`)
**Rule:** resume at the **start of the first revised scene the player hasn't fully passed**, never in the middle of a changed scene. New content is played rather than skipped, unless the player is already past it.

| Old key | Resume at | Roster fix |
|---|---|---|
| `start` … `Scene 8#*` | Unchanged | Remove `noemi` if the resume point is after R6's `leave` |
| `Scene 9#*` before `assault` | R9 start (Lucas's sequence, new) | Remove `lucan` and `noemi` |
| `Scene 9#*` from `assault` on | R11 start (breakout) | Remove `lucan` (R11 re-adds him) and `noemi` |
| `Scene 10#*` (any) | R13 start (tower) | Remove `cass` and `noemi`; keep `lucan`; keep `dess` |
| `Scene 11#*` | R13 start | Same as above |
| `Scene 12#*` | R15 start (Festival) | Remove `cass` and `noemi` |
| `Scene 13#*` / `Scene 14#*` | Same tags, same offsets (unchanged scenes) | Remove `noemi` until dawn |

- **Safety:** before rewriting `ch1b`, copy it once to `ch1b_pre_rev` in the save, so it can be undone in development.
- **Tests:** load a fixture for every row and check the resume point, the roster, `met` and the Ash Lane unlock.

---

## 11. Party availability and combat balance
| Fight | Today's pool | Revised pool | Concern | Adjustment |
|---|---|---|---|---|
| `lucia`, `ward` (R6) | 5 incl. Naomi | Same | — | None |
| `lucas_alone` (R9) | — | Lucas only | A new solo fight; Lucas is long range with no healing | Tune the Vice's health and adds for one character; generous dodging windows; no fail-forward needed |
| `assault` (R11) | Pick 3 of Agnes, Bram, Naomi, Theo, Lucas | Pick 3 of Agnes, Bram, Theo, Lucas | **No healer** (Naomi's revive ultimate is gone) | Lower enemy health or damage about 10–15% via the mission's existing parameters; drop `prefer` Naomi |
| `sneak` (R11) | Kairos | Same | — | None |
| `escape` (R11) | Dess required + 2 | Dess + 2 of Kairos, Lucas, Agnes, Bram, Theo | Dess is pure support | None (it's an escape) |
| `rescue` (R15, moved) | Kairos in stopped time | Same | Same mission, new setting | Re-check its timer against the new layout |
| `festival` (R15) | Pick 3 of 8 | Pick 3 of 7 (no Naomi) | No healer; Cassie's passive (allies take 10% less damage) partly covers it | Lower about 10%; `prefer` Kairos, Cassie, Agnes |
| `stacks` (R16) | 2 teams of 3 from 7 | 2 teams of 3 from 7 (no Naomi) | Each team loses healing | Lower about 10% |
| The loss (R16) | Forced loss | Same | — | None |

- **Party switching** works as it does today. The roster is just smaller for R11–R16.
- **Naomi** is never placed where the story says she isn't. Her healer kit returns for every fight *after* Chapter 1, and in Chapter 1 replays she fights in R6.
- **Tower Bond walk:**
  - Naomi's canon Bond scenes at the tower ("Naomi checks his old burn scars"; the "Naomi and Theo" bond pick) become **Theo at the ticker with Naomi on the other end**: the same scene, apart.
  - The Bond is granted to both.

---

## 12. Keeping the game's identity
- **No new systems** except two small, internal ones: the `{leave}` sequence step and the `met` list. Both are invisible to players.
- Everything else reuses what exists: walk scenes, interact points, `addMission` fights with existing enemy types, cutscene panels and choices, KID sprites, and route-walking NPCs (patrols).
- **Patrols:** NPCs walking existing routes. Getting close shows "Move along" and puts you back a few steps. There are **no** view cones, detection meters or fail states.
- **Ticker panels** use the existing cutscene panel style with a small brass frame. No new UI.
- **The Office archive** and the **morning-after** walk reuse the Office and St. Hesper's art. **No new maps.**
- **Unchanged:** combat numbers apart from the balance scaling in § 11, the UI, the menus, the progression and the art style.

---

## 13. Decisions applied (the owner's v1 answers, as recommended)
1. Naomi arrives at the dawn rooftop. ✔ (R16)
2. Theo was on Marr's staff. ✔ Now specified (§ 4): about two years, eight years ago; resigned quietly.
3. Cassie's motive: (a) the spoon ledger, with no personal link yet. ✔
4. Cassie's Mercy use: duty since six, plus a vial lately. ✔
5. The `cass` boss fight is retired from Chapter 1, and its design kept for a later Cassie trial. ✔
6. Ash Lane's unlock moves. ✔ **Corrected** to R10, the laundry cart (§ 9.7).
7. Lyra's warning kept, trimmed. ✔
8. Light patrol avoidance only. ✔
9. The ticker device. ✔ Now specified (§ 9.5).
10. Marr's "patrons": one line. ✔ (R8 or R11, one line)

## 14. Existing content impact check
| Shipped content | Effect |
|---|---|
| Agnes, Bram, Side quests | None |
| Naomi & Theo (Mr. Odell) | Stronger: R6 and R14 seed the birthday pattern |
| Cassie, A Prayer of Her Own | Compatible; gains setup from her vial and the hymnal page |
| Lucas Part A memories (bread, the worst plan, the room) | No overlap: R9 covers the fire and the morning after; Part A covers ages six to nine. "Meet at the tower" fits *The Worst Plan* (they got up there on the third try) |
| Dess, The Girl in the Experiment | R8's "retained indefinitely" foreshadows the annex files. Keep the wording identical |
| The hideout (Stage A), wanted notices | "Seven persons" holds (Naomi at dawn) |
| Ash Lane | The unlock moves (§ 9.7); remove its "no rooftops/Inquisitor" text rule |

## 15. Implementation order (after approval)
| Stage | Content | Tests |
|---|---|---|
| 1 | Infrastructure: `{leave}`, `ch1b.met`, scene tags, the key map plus `ch1b_pre_rev`, Ash Lane's unlock rule | `ch1_migration_test` (every row of § 10); existing suite |
| 2 | R6–R8: hospital, Office, Institute | `ch1_revised_test` part 1 |
| 3 | R9–R12: Lucas's sequence, the plan, the breakout convergence, the Crane house | Part 2: the solo fight, the kid walk, `c_lucas_door`, roster leave and join |
| 4 | R13–R14: tower, Cassie, Lucas's arrival, Naomi's warning | Part 3 |
| 5 | R15–R16: Festival (patrols, ritual, `rescue`), Registry clues, dawn with Naomi; `Lore_Updates` v1.2 | Part 4: full chapter |
| 6 | Balance pass (§ 11), full suite, a manual chapter playthrough | Full `run_tests` |

## 16. Remaining open questions
1. **Ticker or runner?** A ticker over the speaking-horn wires (recommended), or handwritten notes carried by a St. Lucia's runner (lower-tech, slower, also fine).
2. **Theo's tenure:** "about two years, eight years ago". Shorter or longer?
3. **`c_lucas_door` consequences:** only a few lines (R13, R16), or should Chapter 2 use it too? Recommended: yes, one beat at the rescue.
4. **Lucas's "Meet at the tower" fragment:** it is spoken by kid Kairos. OK to put a line in kid Kairos's mouth that doesn't appear elsewhere?
5. **Courier passes for senior clerks** (Lucas's way into the Institute): OK as new world detail?
6. **Marr seed at the Festival:** keep (one unseen panel), or keep him fully absent until Chapter 2?
