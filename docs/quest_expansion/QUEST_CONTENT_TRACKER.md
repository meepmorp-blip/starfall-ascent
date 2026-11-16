# Quest Content Tracker · Pre-Chapter 2 Expansion

**This is the central list of every quest in the Pre-Chapter 2 expansion.** Update it whenever a quest changes status.

**Sources**
- *Pre-Chapter 2 Narrative Expansion* (owner spec, 2026-11-16)
- `Starfall_Lore_Bible_v2.pdf`
- `docs/narrative/PRE_CH2_IMPLEMENTATION_AUDIT.md` (audit and approved decisions)
- `index.html`

**Statuses**
- Implementation: Not Started · Planned · In Progress · Implemented · Testing · Complete · Blocked
- Tested: No · Partial · Yes
- No quest is marked Complete or Tested until it has been built and its test has passed.

## Conventions
- **Quest IDs** are lower-case `snake_case`.
  - Prefixes: `<char>_` for character stories, `lucas_mem_` / `lucas_hang_` for Lucas, `side_` for world side quests.
  - IDs are the keys in `MX_QUESTS` and in the save (`save.mx.q[id]`).
  - Each quest's one-time reward key is `mxq:<id>`.
- **Categories (`kind`):**
  - `bond`: character story
  - `memory`: Lucas, before his capture
  - `hangout`: Lucas, after his rescue
  - `side`: world side quest
  - The existing `main` and `optional` stay as they are.
- **"Recollection" in the spec.** In the game, *Recollection* already means a character's level (Lv 1–20), and it is also Dess's Ultimate. By the approved decision (audit § 2.2):
  - The quests are labelled **Bond Stories** in the game.
  - "Recollection progress" is paid as **Bond +1**, using the existing `save.bonds`, which already makes characters stronger in story fights.
  - The quest system can also pay Memories (Recollection XP) to one character (`xp`). Whether to use that is the open question in § 6.
- **Times** are estimates for a first play-through, taken from the spec's 10–20 minute target.

## 1. Overview

| Quest ID | Quest | Category | Unlock Condition | Location | Est. Time | Status | Tested |
|---|---|---|---|---|---|---|---|
| `agnes_handmade` | A Little Something Handmade | bond (Agnes) | Chapter 1 cleared; use the hideout workbench | Clock Tower → Market Ring, Ash Lane | 10–14 min | Implemented | Yes |
| `bram_bread` | The Smell of Fresh Bread | bond (Bram) | Chapter 1 cleared; the bakery window or Bram | St. Hesper's → Clock Tower, Market, Ash Lane | 10–14 min | Implemented | Yes |
| `lark_couldnt_save` | The Things We Couldn't Save | bond (Naomi & Theo) | Chapter 1 cleared; the folder at St. Lucia's or Naomi | Clock Tower → St. Lucia's | 10–14 min | Implemented | Yes |
| `cass_prayer` | A Prayer of Her Own | bond (Cassie) | Chapter 1 cleared; the prayer book at the Cloister or Cassie | Clock Tower → St. Maren's (new district, approved) | 12–16 min | Implemented | Yes |
| `lucas_mem_bread` | The Things We Remember A·1 · The Bread Incident | memory (Lucas) | Chapter 1 cleared; Lucas captured | St. Hesper's (the loose fence board) | 5–7 min | Implemented | Yes |
| `lucas_mem_plan` | The Things We Remember A·2 · The Worst Plan | memory (Lucas) | after `lucas_mem_bread` | St. Hesper's (the tower door) | 5–7 min | Implemented | Yes |
| `lucas_mem_room` | The Things We Remember A·3 · Old Roommates | memory (Lucas) | after `lucas_mem_plan` | St. Hesper's (the dormitory window) → the old dormitory (memory) | 5–8 min | Implemented | Yes |
| `dess_experiment` | The Girl in the Experiment | bond (Dess) · **special unlock** | all 7 prerequisite quests completed (§ 3.2) | Clock Tower → Institute annex *(new district, `lab` art)* | 15–20 min | Planned | No |
| `lucas_hang_route` | The Things We Remember B·4 · A Familiar Route | hangout (Lucas) | **Chapter 2 rescue** | Hesper, Market, Plaza | 8–10 min | Blocked (needs Chapter 2) | No |
| `lucas_hang_remember` | The Things We Remember B·5 · The Things We Remember | hangout (Lucas) | after B·4 | Clock Tower | 6–8 min | Blocked (needs Chapter 2) | No |
| `lucas_hang_promise` | The Things We Remember B·6 · A Promise Kept | hangout (Lucas) | after B·5 | St. Hesper's / Clock Tower | 6–8 min | Blocked (needs Chapter 2) | No |
| `side_morning_after` | The Morning After | side | Chapter 1 cleared; talk to Old Hanne | Festival Square → Market Ring, Garrison Yard | 6–8 min | Implemented | Yes |
| `side_names_paper` | Names on Paper | side | Chapter 1 cleared; talk to Pim | Concord Office → the Cloister | 5–7 min | Implemented | Yes |
| `side_sunday_cups` | Sunday Cups | side | Chapter 1 cleared; talk to Rosa | Market Ring, Ash Lane, the Cloister | 5–7 min | Implemented | Yes |
| `side_festival_forgot` | The Festival We Forgot | side | Chapter 1 cleared; the old decorations box, then Sister Agathe | St. Hesper’s → Festival Square, St. Lucia’s | 6–8 min | Implemented | Yes |
| `side_empty_chapel` | The Empty Chapel | side | Chapter 1 cleared; St. Maren's known; talk to Ottilie | St. Maren's | 6–8 min | Implemented | Yes |
| `side_unofficial_prayer` | The Unofficial Prayer | side | after `side_empty_chapel`; talk to the lamplighter | Ash Lane → St. Lucia's → St. Maren's | 6–8 min | Implemented | Yes |
| `side_missing_page` | The Missing Page | side | Chapter 1 cleared; talk to Mr. Ambrose | Office → Cloister → St. Hesper’s → Festival Square | 6–8 min | Implemented | Yes |
| `side_beyond_wall` | Beyond the Wall | side | Chapter 1 cleared; talk to Ivo | Ash Lane → Clock Tower, Market Ring | 5–7 min | Implemented | Yes |

**19 quests in total:** 5 character stories, 3 Lucas memories, 3 Lucas hangouts and 8 world quests. The quest **system** they use is tracked in § 5.

## 2. Quest states (how every quest is evaluated)

`mxQState(id)` checks these in order:

| State | When |
|---|---|
| `completed` | `save.mx.q[id].s==='done'`. A daily repeatable becomes `available` again the next day |
| `active` | `save.mx.q[id]` exists and is not done |
| `locked_by_story` | the quest's story gate (`when` and/or `story()`) is false |
| `locked_by_prerequisite` | a quest in `pre` is not completed |
| `available` | discovered: `save.mx.qseen[id]`, or its `found()` condition has fired |
| `undiscovered` | otherwise |

- **"Discovered"** is a flag, not a separate state. A discovered quest shows as `available` once nothing locks it.
- If a quest is discovered while it is still locked, the discovery is kept and takes effect when the lock lifts.

## 3. Unlock logic

### 3.1 Ordinary character stories (flexible order)
- The four ordinary character stories, the first Lucas memory and the side quests (except the two chained ones) all need only:
  - `when:['fugitive']`, which is true once Chapter 1 has been cleared.
  - Their own discovery.
- None of them needs another story first, so they can be done in any order.
- Each one is found **in the world**, not from a menu:

| Quest | Discovery (`found`) | Marker |
|---|---|---|
| `agnes_handmade` | Talk to Agnes at the Clock Tower after using the workbench once | "!" over Agnes; tower "!" on the map |
| `bram_bread` | Visit St. Hesper's in the morning-bread readable spot (bakery smell), or talk to Bram at the tower | "!" on the bakery readable; Hesper "!" |
| `lark_couldnt_save` | Read the misfiled chart at St. Lucia's, or talk to Naomi at the tower | "!" on the chart; ward "!" |
| `cass_prayer` | Find the prayer book by the Cloister wall, or talk to Cassie | "!" on the book |
| `lucas_mem_bread` | Interact with the empty saucer under St. Hesper's kitchen window | "!" on the saucer |
| side quests | Talk to the NPC who gives them (§ 4) | "!" over the NPC and on the district |

### 3.2 Dess · The Girl in the Experiment (special unlock)
- **Definition:**
  - `when:['fugitive']`
  - `pre:['agnes_handmade','bram_bread','lark_couldnt_save','cass_prayer','lucas_mem_bread','lucas_mem_plan','lucas_mem_room']`
- **Completion flags it reads:** `save.mx.q[<each id>].s==='done'`, all seven.
  - Discovering, starting or half-finishing a prerequisite does **not** count.
- **States:**
  - Until all seven are done: `locked_by_prerequisite`. It is hidden in the Journal and only counted in "N more stories are still hidden or locked".
  - The last prerequisite completing calls `mxOnQuestDone`. That re-checks every quest with `pre`, and a quest that just became unlocked and has `autoFind:1` is discovered: a "New story" banner, plus a "!" over Dess at the Clock Tower.
- **The event:** Dess's core reacts (the spec's "a recovered memory core begins reacting to Dess").
- **Lucas's memories:** all three are required. The spec says "the pre-capture memory episodes". The open question is in § 6.

### 3.3 Lucas · story states
`lucasState()` returns one of three states:

| State | When | Allowed |
|---|---|---|
| `free` | Chapter 1 not cleared | Chapter 1 as built; no Bond Stories |
| `captured` | Chapter 1 cleared and `save.story['ch2.lucasRescued']` not set | Part A memories only (KID sprites, flashback panels). **No present-day Lucas** NPC, hangout or line anywhere |
| `rescued` | `save.story['ch2.lucasRescued']` set by Chapter 2 (not built) | Part B hangouts (`when:['lucasRescued']`) |

- The quest system **enforces** this: any quest with `kind:'hangout'` and `char:'lucan'` is `locked_by_story` unless Lucas is `rescued`, whatever its own definition says.
- The Clock Tower people list has no Lucas (tested).

## 4. Individual entries

### `agnes_handmade` · A Little Something Handmade · **Implemented, tested**
- **Category:** bond · **Character:** Agnes Calder (`ines`)
- **Story:** Kairos catches Agnes at the hideout workbench with something that is not Garrison issue. She calls it maintenance: a new sling for her rifle, held together with wire since the Eastern Rift, with a small stitched star where nobody will see it.
- **Start / giver:** Clock Tower, Agnes (`npc:'tower.h_agnes'`)
- **Discovery:** use the workbench once (`found: mxF('bench.used')`). Until then Agnes only has her small talk.
- **Unlock:** `when:['fugitive']`; no prerequisites
- **Objectives:**
  1. Gather, in any order:
     - a leather offcut (quest object, Market Ring scrap bin)
     - brass rings (the fish vendor)
     - waxed thread (the laundress, Ash Lane)
  2. The workbench assembly puzzle (3 rounds of `showPuzzle`). You can leave and retry; wrong answers get Agnes's correction.
  3. Test the sling: a hub fight on the roof with Agnes and Kairos (`mxf_roof_agnes`, 8 Vices).
  4. Talk to Agnes: the ending scene (camp art).
- **NPCs:** Agnes, the fish vendor, the laundress
- **Environments:** tower, market, ashlane
- **Activities:** collection, puzzle, fight, scene
- **Rewards:**
  - Bond +1 · Agnes
  - 40 Stardust
  - 1 Keepsake
  - 1 Fragment (chest grade)
  - Journal: "Agnes's practice piece"
- **Story flags:** `agnes.crafted`; items `ag_leather`, `ag_rings`, `ag_thread`; flags `ag_made`, `ag_end`, `bench.used`
- **Canon:** her crafting is new (logged). She stays dry and in control. The Eastern Rift is only referenced, not retold.
- **Test:** `tools/bond_agnes_bram_test.js`

### `bram_bread` · The Smell of Fresh Bread · **Implemented, tested**
- **Category:** bond · **Character:** Bram (`bram`)
- **Story:**
  - The bakery by St. Hesper's smells like Bram's gran's kitchen. He remembers the blue tiles and the dented pot, but not the recipe.
  - The party gathers the ingredients and bakes in a little brick oven on the tower roof.
  - The warmth draws Vices.
  - In the end, protecting people can also mean somewhere warm to stay.
- **Start / giver:** Clock Tower, Bram (`npc:'tower.h_bram'`)
- **Discovery:** the bakery window at St. Hesper's (a post-Chapter 1 version, `look.bakery.after`), or any talk with Bram at the hideout
- **Unlock:** `when:['fugitive']`; no prerequisites
- **Objectives:**
  1. Ingredients, in any order:
     - flour (Rosa, Market Ring)
     - honey (Sister Agathe, St. Hesper's)
     - cardamom (a tin on the Ash Lane shop step, quest object)
  2. Bake in Gran's order at 4 roof stations: flour sack → mixing bowl → resting bowl by the lantern → brick oven (`mxSeqStep`). A wrong order resets.
  3. Defend the roof: a hub fight with Bram and Kairos (`mxf_roof_bread`, 8 Vices).
  4. Share the bread: the ending scene.
- **NPCs:** Bram, Rosa, Sister Agathe; Agnes, Naomi and Theo in the scene
- **Environments:** hesper, tower, market, ashlane
- **Activities:** collection, ordered-sequence minigame, fight, scene
- **Rewards:**
  - Bond +1 · Bram
  - 40 Stardust
  - 1 Fragment (boss grade, "defensive equipment")
  - Journal: "Gran's recipe"
- **Story flags:** `bram.recipe`; items `br_flour`, `br_honey`, `br_spice`; flags `br_baked`, `br_end`
- **Canon:**
  - The grandmother is an addition.
  - His mother, Tomas and the Mercy are not mentioned (tested by regex).
  - Nothing is said about how his grandmother died.
- **Test:** `tools/bond_agnes_bram_test.js`

### `lark_couldnt_save` · The Things We Couldn't Save · **Implemented, tested**
- **Category:** bond · **Characters:** Naomi (`noemi`) and Theo (`theo`)
- **Story:**
  - Before the Festival, Naomi had a patient, Mr. H. Odell, a retired teacher. He forgot his street, then his daughter, then the ward.
  - Theo measured him every two weeks. They did everything right and still couldn't help him.
  - Four pages are missing from his folder. Put back in order, they show that week six was never measured: Naomi was on nights and Theo was in the Rift.
  - Theo's box reads his old bed as "emptier than empty". This stays **unexplained**.
- **Start / giver:** Clock Tower, Naomi (`npc:'tower.h_noemi'`)
- **Discovery:** the patient folder on the St. Lucia's nurses' desk (post-Chapter 1), or a second talk with Naomi at the hideout
- **Unlock:** `when:['fugitive']`; no prerequisites
- **Objectives:**
  1. Find 4 pages around the ward, in any order (quest objects): the admission note and weeks 2, 4 and 8.
  2. Put the folder in order at the nurses' desk (3-round `showPuzzle`; can leave and retry).
  3. Theo's box, a hot-and-cold search: it beeps faster near Mr. Odell's old bed, which only shows a "!" when you are close.
  4. Defend Naomi: a ward fight with Naomi, Theo and Kairos (`mxf_hospital_lark`).
  5. Talk to Theo or Naomi: the ending scene (hospital art).
- **NPCs:** Naomi and Theo come to the ward while the story is active, then leave.
- **Environments:** tower, ward
- **Activities:** collection, ordering puzzle, hot-and-cold search, fight, scene
- **Rewards:**
  - Bond +1 · Naomi and Bond +1 · Theo
  - 40 Stardust
  - 1 Keepsake
  - 1 Fragment (chest grade)
  - Journal: "Naomi's notebook"
- **Story flags:** `lark.casefile`; items `lt_p1`–`lt_p4`; flags `lt_chart`, `lt_order`, `lt_reading`, `lt_end`
- **Canon:**
  - No water, Mercy, cups or Sundays (tested by regex): Chapter 2 Scene 3 keeps the reveal.
  - The marriage stays warm: Theo supports her and never dismisses her.
  - Naomi's arm line follows the Lore Bible.
- **Test:** `tools/bond_lark_test.js`

### `cass_prayer` · A Prayer of Her Own · **Implemented, tested**
- **Category:** bond · **Character:** Cassie (`cass`)
- **Story:**
  - A rain-swollen prayer book by the Cloister wall is stamped ST. MAREN'S · ASH LANE.
  - Cassie knows its prayer by heart: "Light before the lamps. Door before the wall. Name before the paper. Keep me." She hears her mother's voice saying it, but not her face (canon).
  - At St. Maren's, a chapel the Office closed seventeen years ago, two people still keep the books: Ottilie, the old sacristan, and Fen, a copyist.
  - Cassie decides God is still there, and that she is allowed to ask questions in it.
- **Start / giver:** Clock Tower, Cassie (`npc:'tower.h_cass'`)
- **Discovery:** the prayer book at the Cloister (post-Chapter 1), or a second talk with Cassie
- **Unlock:** `when:['fugitive']`
- **Starting the story** sets the story flag `oldchapel.found`, which opens St. Maren's on the world map and the east exit from Ash Lane.
- **Objectives:**
  1. Find St. Maren's (Ash Lane, east end).
  2. Talk to Ottilie and recover three wet writings, in any order.
  3. Altar symbol puzzle: star, open door, open hand (3-round `showPuzzle`; can leave and retry).
  4. Defend the chapel: a fight with Cassie and Kairos in the chapel's own art (`mxf_oldchapel_cass`).
  5. The ending scene.
- **NPCs:** Cassie (in the chapel while the story is on), Ottilie, Fen
- **Environments:** chapel (the Cloister), tower, ashlane, **oldchapel**
- **Activities:** discovery, collection, symbol puzzle, fight, scene
- **Rewards:**
  - Bond +1 · Cassie
  - 40 Stardust
  - 1 Keepsake
  - 1 Fragment (chest grade)
  - Journal: "Cassie's prayer book"
- **Story flags:** `cass.prayer`, `oldchapel.found`; flags `cp_ottilie`, `cp_altar`, `cp_end`; items `cp_w1`–`cp_w3`
- **Canon:**
  - Her faith stays sincere, and the institution is criticised, not faith.
  - "The Old Heresy" and libraries under old chapels appear only as rumour or margin notes.
  - No faction names (tested by regex).
- **Test:** `tools/bond_cass_test.js`

#### St. Maren's (new district, `oldchapel`)
- **Art:** a new painted theme, `oldchapel`:
  - flagstones with moss and cracks, and a faded aisle runner
  - four rows of pews, one broken
  - a stripped altar with candles, under a broken stained-glass window
  - boarded side windows and the keepers' bookshelves
  - moonlight and rubble under a hole in the roof
  - the west door
- **Collision:** one shared list (`oldChapelGeo`) drives both the painting and the solids, so they always match.
- **People:** Ottilie and Fen, with three lines each; Fen walks the right aisle.
- **Records:** the door plaque and the hymn board, so the Journal now has 26 records. **Readable:** the hole in the roof.
- **No daily chests.** The precious-chest pool skips it.
- **Map:** world map place (cross icon, south-east of Ash Lane), a road from Ash Lane, and a Meridian-menu cell. It needs Chapter 1 cleared **and** the `oldchapel.found` story flag (new `need.flag` support).
- **Also reused by:** `side_empty_chapel` and `side_unofficial_prayer` (Stage 7b).

### Lucas · The Things We Remember, Part A · **Implemented, tested**
**How the memories work**
- **Unlock:** `when:['fugitive']`, so Lucas is `captured`.
- **Discovery:** a memory object at St. Hesper's. Only the next unlocked one is visible; the chain is ordered with `pre`.
- **Playing one:**
  1. Touching the object starts the quest.
  2. A short scene with KID sprites.
  3. A **playable memory walk**: a non-hub walk mission with `kid:1`, so the player and Lucas are drawn as children.
  4. A present-day reflection by Kairos.
  5. Back at St. Hesper's, the quest completes.
- **Leaving early:** quitting mid-memory leaves the quest active, and the object replays it.
- **No present-day Lucas:** Lucas appears only as a child (tested).
- **Scene 9:** none of its lines are reused (tested against the Scene 9 text). The fire, the Chancellor, Adoption Day and the cup are never shown.

#### `lucas_mem_bread` · A·1 The Bread Incident (age 6)
- **Object:** a loose board in the bakery fence.
- **Memory:**
  1. Lucas's plan to "rescue" the end pieces.
  2. Through the fence.
  3. A counting puzzle: the baker always stops at the eleventh loaf, so take the twelfth.
  4. Caught behind the coal shed. Lucas: "…Pigeons." Sister Agathe gives each of them a corner back: "Next time, ask."
- **Outro:**
  - The cat joke is **born**: "Next time I'm saying a cat." / "We don't have a cat." / "Even better. Nobody can check."
  - Kairos: "He's the one who had to forget."
- **Rewards:**
  - Bond +1 · Lucas (kept until he is back)
  - 20 Stardust
  - Journal: "The end piece"
- **Flags:** `lucas.mem1`

#### `lucas_mem_plan` · A·2 The Worst Plan (age 8)
- **Object:** the little door at the foot of the clock tower.
- **Memory:** Lucas's plan (stairs, laundry, door, with a stolen key) against Kairos, who knows Sister Agathe's rounds by heart:
  - stairs at 8:55
  - laundry at 9:00
  - tower door at 9:05
- **How to play:** go in the right order (laundry, then stairs). Going early gets "not yet" feedback. At the door the key turns out to be the pantry key, and they're caught.
- **Outro:** "Third try, we got up there… I still count, up there." This echoes Scene 11 without repeating it.
- **Rewards:** 20 Stardust, 1 Keepsake, Journal "The key that didn't fit"
- **Flags:** `lucas.mem2`

#### `lucas_mem_room` · A·3 Old Roommates (age 9)
- **Object:** the dormitory window.
- **Memory:** their old room, in a **new `dorm` theme**: plank floor, eight small beds, two moonlit windows and a rug. One geometry list drives both the art and the solid beds.
- **Find 5 things in any order:**
  - two names carved on the window bedpost
  - Lucas's button tin
  - Kairos's drawing of the clock at 11:59
  - emergency bread
  - Lucas's list, THINGS KAIROS REMEMBERS THAT I DON'T: "Doesn't matter. He'll tell me."
- **Last:** Lucas at the window: "If somebody ever picks one of us, the other one gets the window bed… We'll take turns. You count."
- **Rewards:**
  - Bond +1 · Lucas
  - 30 Stardust
  - Journal: "Two names on a bedpost"
- **Flags:** `lucas.mem3`

### `dess_experiment` · The Girl in the Experiment (special)
- **Category:** bond · **Character:** Dess (`dess`)
- **Unlock:** § 3.2
- **Story:**
  - A recovered core reacts to Dess.
  - The resonance matches an old Institute experiment.
  - In a disused annex the party finds Marr's records about an unnamed **"Subject"** with dates that fit her age.
- **Start:** Clock Tower → Institute annex (new district, `lab` art)
- **Objectives:**
  1. The core reacts (event).
  2. Reach the annex.
  3. Recover four records (multi-objective).
  4. Lab reconstruction puzzle.
  5. Core reactions.
  6. Fight a Vice tied to the experiment (hub fight, lab theme).
  7. A short memory sequence.
- **Rewards:**
  - Bond +1 · Dess
  - 60 Stardust
  - 2 Keepsakes
  - Journal collectible "Research log, Subject"
  - a Star-born Fragment
- **Flags:** `dess.annex`
- **Spoilers:**
  - Nothing confirms the Subject is Dess.
  - The girl of light stays unexplained.
  - Marr's motive stays open.
  - Her mother stays unresolved.
- **Status:** Planned · **Tested:** No · **Needs approval:** the annex district (§ 6)

### `lucas_hang_route` / `lucas_hang_remember` / `lucas_hang_promise` · B·4–6
- **Category:** hangout · `when:['lucasRescued']` (forced by the system as well)
- **Chain:** `pre`: B·5 needs B·4, and B·6 needs B·5
- **Content:** to be written with Chapter 2. Nothing is built now (approved decision 5).
- **Spec premises:**
  - B·4 revisits childhood places.
  - B·5 compares memories.
  - B·6 is the "not losing you twice" promise.
- **Status:** Blocked (needs Chapter 2's rescue and the `ch2.lucasRescued` flag) · **Tested:** No (only the lock is tested)

### World side quests (batch 7a) · **Implemented, tested**
**Common to all six**
- `kind:'side'`, `when:['fugitive']`.
- Found by talking to the giver, whose "!" shows over their head. Festival is the exception: its box must be found first.
- No combat.
- One-time rewards, plus a Journal keepsake and a story flag.
- Townsfolk join in through `MX_QLINES`: per-step lines on existing people, without rewriting their dialogue.

| ID | Giver (new?) | What you do | Ends with | Reward | Flag |
|---|---|---|---|---|---|
| `side_morning_after` | **Old Hanne** (new), Festival Square | Find her stopped watch (11:52, the Square), her roof tile (the Market Ring) and a Garrison whistle (the Yard), then put the night in order: cracks in the sky → shapes in the streets → rain → the fountain in the morning | "Everybody said it was a gift." | 35 Stardust, Keepsake, "Hanne's stopped watch" | `side.morning` |
| `side_names_paper` | **Pim** (new), junior clerk, Concord Office | Find a torn ledger page in the Office, get the baptism copy from the Sister at the Cloister gate, then compare: Ada Venn's Moon was "revised" two years after her birth | "The original went to the Registry. And the Registry is gone." | 35, Keepsake, "Three versions of Ada Venn" | `side.names` |
| `side_sunday_cups` | Rosa, Market Ring | Ask Matteo, the fish vendor, the laundress and the woman at the Cloister what they forgot last Monday, then tell Rosa who remembered everything | "The fish man. He's the only one who works on Sundays." (a hint, never stated) | 30, Keepsake, "Rosa's Monday list" | `side.cups` |
| `side_festival_forgot` | Sister Agathe (after the old decorations box at St. Hesper's is found) | Ask the lantern seller, the woman in the Square and the ward nurse how the Festival used to be; find an old programme (a sketch: a bandstand and a well, no fountain) | The Festival of Names. "I had forgotten that I sang." | 30, Keepsake, "An old Festival programme" | `side.festival` |
| `side_missing_page` | **Mr. Ambrose** (new), Concord Office | Follow the trail for page 212 ("The Founding Compact"), one step at a time: the Cloister sundial → the tin box behind St. Hesper's step → behind the plaque in Festival Square | Only the heading survives, cut off on purpose | 40, Keepsake, "The heading of page 212" | `side.page` |
| `side_beyond_wall` | **Ivo** (new), traveller, Ash Lane | Show his map to Agnes ("traced, the rest in a different ink"), his stone to Theo ("no granite in Meridian") and his coin to the fish vendor ("a star with no rays") | "Either a liar or a traveller. Most travellers are both." | 30, "A coin from nowhere" | `side.wall` |

**Canon checks (tested)**
- No Mercy, water, drinking, cups or Chapter 2 material.
- No faction names; no photographs.
- The traveller stays unreliable.
- The night twenty years ago follows the Chapter 1 cold open (rifts at 11:52) and the Lore Bible (the rain, then the fountain).

**Test:** `tools/side_quests_test.js` (41 checks ×3)

### World side quests (batch 7b) · **Implemented, tested**
| ID | Giver | What you do | Ends with | Reward | Flags |
|---|---|---|---|---|---|
| `side_empty_chapel` | Ottilie, St. Maren's. Needs `story: oldchapel.found`, so St. Maren's must be known (from Cassie's story) | Pick up 4 loose writings (a recopied psalter, an old hymn page, a catechism with older answers pasted in, an unsigned letter); help Fen shelve them (a 4-round puzzle); light the reading lamp, which is drawn and stays lit afterwards | Ottilie: the Office closed the chapels "because of what was on the shelves"; the Old Heresy; "people who go looking come back with stories, and nothing else" | 35 Stardust, Keepsake, "The keepers' shelf list" | `side.chapel` |
| `side_unofficial_prayer` | The lamplighter, Ash Lane. **Pre:** `side_empty_chapel` | Follow a chalk sign (a circle with a line through it), in order: under lamp seven on Ash Lane → behind St. Lucia's → the back wall of St. Maren's. Three visitors in grey appear at once. A scene: they pray **to forget** (grief: "My son died in the spring"; "some of us think forgetting is a door"), then a **choice**: keep their secret or tell Ottilie | The choice is remembered (`prayer.kept` / `prayer.told`). If told, Ottilie gets a new line: "I'll leave the door open anyway. Everyone needs somewhere." | 35, Keepsake, "A chalk circle with a line through" | `side.prayer` + the choice flag |

**Canon (tested)**
- The visitors are a hint at the proposed Hollow Choir, never named. Nobody is a villain ("He thinks they are tired").
- Gnosis appears only as "the Old Heresy" (canon term) and as rumour.
- No Mercy, water, Sundays or drinking.

**Test:** `tools/chapel_quests_test.js` (36 checks ×3), covering both choices.

## 5. System checklist (Implementation Phase 2: Quest System Foundation)

| Capability | Status | Tested |
|---|---|---|
| Quest data model (id, title, desc, kind, char, at, giver, found, when/story, pre, steps/objectives, reward, sets, repeat) | Implemented | Yes (`quest_system_test.js`) |
| Six quest states, saved, with safe defaults | Implemented | Yes |
| Multiple objectives per step (`objs`, any order) | Implemented | Yes |
| Discovery: NPC talk, district visit, readable or record, custom condition | Implemented | Yes |
| Markers: world-map "!", exit-label "!", NPC "!" for givers | Implemented | Yes |
| One-time rewards; repeatable only with `repeat:'daily'` | Implemented | Yes |
| Rewards: Stardust, Keepsakes, Mastery, Fragments (equipment), Bond, Memories (XP), Journal collectibles | Implemented | Yes |
| Story flags (`save.story`, `sets`) | Implemented | Yes |
| Dess multi-prerequisite unlock (`pre` + `autoFind`) | Implemented | Yes (with test quests) |
| Lucas states (`lucasState`, hangout enforcement) | Implemented | Yes |
| Hub fight and scene glue (`mxFight`, `mxScene`) | Implemented (Stage A) | Yes |
| Cosmetics | Not supported by the game (no cosmetic system) | n/a |

## 6. Open questions that need the owner's approval
1. **Recollection naming.** Pay "Recollection progress" as Bond +1 (as approved), as Memories XP to the character, or both? The system supports both.
2. **New districts:**
   - An **old chapel** for `cass_prayer` and `side_empty_chapel`, reusing the chapel art. Proposed: east of Ash Lane, found when either quest starts.
   - An **Institute annex** for `dess_experiment`, reusing the lab art and reached from the tower by night.
   - Both are new world-map places.
3. **Dess's prerequisites:** all three Lucas memories (proposed), or only some?
4. **Cosmetic and accessory rewards** ("unique Dess accessory", "paired accessory"): the game has no cosmetic or accessory system. Proposed: a Journal collectible plus a Fragment instead, with no new system.
5. **"Crafting materials":** there is no material system. Proposed: Fragments or Stardust. No new currency.
6. **"The Morning After":** ~~the canon says that night was a rain and the fountain rising, not a rift~~. **Corrected (Stage 6):** the Chapter 1 cold open shows rifts over the Market Ring and the harbour that night ("Meridian. Twenty years ago. 11:52 PM."), and the Lore Bible adds the rain and the fountain the next morning. Both are canon, so the quest can cover the rifts *and* the morning the fountain was there. Nothing needs approval.
7. **Bram's Eastern Rift.** The spec says Agnes *saved his life* there. The canon says Bram *followed her into* the Rift ("Fourteen Vices. He had a shield and no plan."). Keep to the canon wording unless you approve the stronger claim.
