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
| `agnes_handmade` | A Little Something Handmade | bond (Agnes) | Chapter 1 cleared | Clock Tower → Market Ring, Ash Lane | 12–15 min | Planned | No |
| `bram_bread` | The Smell of Fresh Bread | bond (Bram) | Chapter 1 cleared | St. Hesper's (bakery smell) → Market, Ash Lane | 12–18 min | Planned | No |
| `lark_couldnt_save` | The Things We Couldn't Save | bond (Naomi & Theo) | Chapter 1 cleared | St. Lucia's | 15–20 min | Planned | No |
| `cass_prayer` | A Prayer of Her Own | bond (Cassie) | Chapter 1 cleared | Old chapel *(new district, needs approval)* | 15–20 min | Planned | No |
| `lucas_mem_bread` | The Things We Remember A·1 · The Bread Incident | memory (Lucas) | Chapter 1 cleared; Lucas captured | St. Hesper's (memory object) | 6–8 min | Planned | No |
| `lucas_mem_plan` | The Things We Remember A·2 · The Worst Plan | memory (Lucas) | after `lucas_mem_bread` | St. Hesper's / Clock Tower | 6–8 min | Planned | No |
| `lucas_mem_room` | The Things We Remember A·3 · Old Roommates | memory (Lucas) | after `lucas_mem_plan` | St. Hesper's (their old room, a memory walk) | 8–10 min | Planned | No |
| `dess_experiment` | The Girl in the Experiment | bond (Dess) · **special unlock** | all 7 prerequisite quests completed (§ 3.2) | Clock Tower → Institute annex *(new district, `lab` art)* | 15–20 min | Planned | No |
| `lucas_hang_route` | The Things We Remember B·4 · A Familiar Route | hangout (Lucas) | **Chapter 2 rescue** | Hesper, Market, Plaza | 8–10 min | Blocked (needs Chapter 2) | No |
| `lucas_hang_remember` | The Things We Remember B·5 · The Things We Remember | hangout (Lucas) | after B·4 | Clock Tower | 6–8 min | Blocked (needs Chapter 2) | No |
| `lucas_hang_promise` | The Things We Remember B·6 · A Promise Kept | hangout (Lucas) | after B·5 | St. Hesper's / Clock Tower | 6–8 min | Blocked (needs Chapter 2) | No |
| `side_morning_after` | The Morning After | side | Chapter 1 cleared | Festival Square (fountain) | 8–10 min | Planned | No |
| `side_names_paper` | Names on Paper | side | Chapter 1 cleared | Concord Office | 8–12 min | Planned | No |
| `side_sunday_cups` | Sunday Cups | side | Chapter 1 cleared | Market Ring, Cloister, Ash Lane | 8–10 min | Planned | No |
| `side_festival_forgot` | The Festival We Forgot | side | Chapter 1 cleared | Festival Square, St. Hesper's | 8–10 min | Planned | No |
| `side_empty_chapel` | The Empty Chapel | side | Chapter 1 cleared | Old chapel | 8–10 min | Planned | No |
| `side_unofficial_prayer` | The Unofficial Prayer | side | after `side_empty_chapel` | Ash Lane (after dark) | 8–10 min | Planned | No |
| `side_missing_page` | The Missing Page | side | Chapter 1 cleared | Office → Cloister → Hesper → Plaza | 10–12 min | Planned | No |
| `side_beyond_wall` | Beyond the Wall | side | Chapter 1 cleared | Ash Lane / Market Ring | 6–8 min | Planned | No |

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

### `agnes_handmade` · A Little Something Handmade
- **Category:** bond · **Character:** Agnes Calder (`ines`)
- **Story:** Kairos catches Agnes at the hideout workbench fixing something that isn't kit: a strap, stitched with care. She calls it maintenance, then admits she likes making things. The party gathers what she needs, and she finishes it and tests it.
- **Start:** Clock Tower · **Giver:** Agnes (after the workbench has been used once)
- **Prerequisites:** none · **Unlock:** `when:['fugitive']`
- **Objectives:**
  1. Talk to Agnes.
  2. Collect three materials in any order: leather offcut from the Market Ring, thread from the laundress on Ash Lane, brass rings from the fish vendor's tackle. This is a multi-objective step.
  3. Assembly minigame: an order puzzle built on `showPuzzle`.
  4. Test it with Agnes in a short target drill on the roof. This reuses the Drill activity's flag logic.
  5. A scene at the bench.
- **NPCs:** Agnes, the fish vendor, the laundress, Rosa
- **Environments:** tower, market, ashlane
- **Activities:** collection, puzzle, timed drill
- **Combat:** none (the drill is the challenge)
- **Rewards:**
  - Bond +1 · Agnes
  - 40 Stardust
  - 1 Keepsake
  - Journal collectible "Agnes's strap"
  - Optional: a Star Fragment as the "equipment" reward
- **Story flags:** `agnes.crafted`
- **Spoilers:** none. **Canon:** her crafting is a *new characterisation* (logged in LORE_ADDITIONS). She stays dry, competent and in control.
- **Status:** Planned · **Tested:** No

### `bram_bread` · The Smell of Fresh Bread
- **Category:** bond · **Character:** Bram (`bram`)
- **Story:** Near St. Hesper's the smell from the bakery stops Bram mid-sentence: his grandmother's bread. He can't remember the whole recipe. The party gathers ingredients, he bakes, and Vices come for the warm kitchen.
- **Start:** St. Hesper's · **Giver:** a discovery spot (the smell), or Bram at the tower
- **Prerequisites:** none · **Unlock:** `when:['fugitive']`
- **Objectives:**
  1. Follow the smell.
  2. Collect ingredients from Rosa, the market and the Ash Lane shopkeeper (multi-objective).
  3. Baking minigame: an `mxSeqStep`-style ordered sequence.
  4. Defend the bakery, a hub fight (`mxFight`, theme `street`, Gossip and Hothead).
  5. A scene.
- **NPCs:** Bram, Rosa, the Ash Lane shopkeeper, the baker (new townsperson)
- **Environments:** hesper, market, ashlane
- **Activities:** collection, sequence minigame, fight
- **Combat:** one small fight (8 kills)
- **Rewards:**
  - Bond +1 · Bram
  - 40 Stardust
  - a Star Fragment (defensive)
  - Journal collectible "Grandmother's recipe"
- **Story flags:** `bram.recipe`
- **Canon:**
  - The grandmother is a *new addition* and does not replace his mother or Tomas.
  - The "Tomas" line and his mother's decline are untouched.
  - Nothing is said about how his grandmother died.
- **Status:** Planned · **Tested:** No

### `lark_couldnt_save` · The Things We Couldn't Save
- **Category:** bond · **Characters:** Naomi (`noemi`) and Theo (`theo`)
- **Story:** An old chart at St. Lucia's is missing dates and doesn't add up. Naomi and Theo rebuild the timeline of a patient they couldn't help before Chapter 1.
- **Start:** St. Lucia's · **Giver:** the misfiled chart (discovery), or Naomi at the tower
- **Prerequisites:** none · **Unlock:** `when:['fugitive']`
- **Objectives:**
  1. Read the chart.
  2. Collect four pages of notes around the ward (multi-objective).
  3. Timeline puzzle: put the pages in order (`showPuzzle`).
  4. Use Theo's box to find the odd reading.
  5. Defend Naomi while she works (hub fight, hospital theme).
  6. A scene.
- **NPCs:** Naomi, Theo, the ward nurse
- **Environments:** ward
- **Activities:** collection, ordering puzzle, find-the-reading, fight
- **Combat:** one fight
- **Rewards:**
  - Bond +1 · Naomi and Bond +1 · Theo
  - 40 Stardust
  - 1 Keepsake
  - Journal collectible "Naomi's notebook"
- **Story flags:** `lark.casefile`
- **Spoilers / canon:**
  - The patient's decline is **unexplained**: no link to the water or the Mercy (Chapter 2 Scene 3 keeps that reveal).
  - Their marriage stays warm and supportive.
- **Status:** Planned · **Tested:** No

### `cass_prayer` · A Prayer of Her Own
- **Category:** bond · **Character:** Cassie (`cass`)
- **Story:**
  - A prayer book reminds Cassie of her mother. She knows the words but not the face of the woman who taught them.
  - It leads to an old chapel where people keep writings the Church no longer recognises.
  - She keeps her faith and her right to question.
- **Start:** Cloister wall → old chapel · **Giver:** the prayer book (discovery), or Cassie at the tower
- **Prerequisites:** none · **Unlock:** `when:['fugitive']`
- **Objectives:**
  1. Read the book.
  2. Find the old chapel.
  3. Recover three damaged writings (multi-objective).
  4. Symbol puzzle (`showPuzzle`).
  5. Talk to the keepers.
  6. Defend the chapel (hub fight, chapel theme).
  7. A scene.
- **NPCs:** Cassie, two text-keepers (new)
- **Environments:** chapel, **old chapel (new district, chapel art)**
- **Activities:** collection, puzzle, dialogue, fight
- **Combat:** one fight
- **Rewards:**
  - Bond +1 · Cassie
  - 40 Stardust
  - a Star Fragment (support)
  - Journal collectible "Cassie's prayer book"
- **Story flags:** `cass.prayer`, `oldchapel.found` (shared with `side_empty_chapel`)
- **Spoilers / canon:**
  - Her faith stays sincere, and the story criticises the institution, not faith.
  - Gnosis and the Buried Books ([DRAFT]) appear only as rumour.
- **Status:** Planned · **Tested:** No · **Needs approval:** the old chapel district (§ 6)

### `lucas_mem_bread` · A·1 The Bread Incident
- **Category:** memory · **Character:** Lucas (`lucan`), as a child · **Start:** St. Hesper's kitchen window
- **Story:**
  - A different bread theft from Scene 9: an earlier, failed one.
  - The imaginary cat is introduced as the joke.
  - It does **not** repeat Scene 9's "the cat did it" lines.
- **Unlock:** `when:['fugitive']`; Lucas `captured` or `rescued`
- **Discovery:** the empty saucer
- **Objectives:**
  1. Remember: a flashback, as cutscene panels with KID sprites (`mxScene`).
  2. Sneak through the kitchen: a short memory walk.
  3. Choose the excuse.
- **Rewards:**
  - Bond +1 · Lucas (stored for later; Lucas is not playable until he is rescued)
  - 20 Stardust
  - Journal collectible "The saucer"
- **Flags:** `lucas.mem1` · **Status:** Planned · **Tested:** No

### `lucas_mem_plan` · A·2 The Worst Plan
- **Category:** memory · **Pre:** `lucas_mem_bread`
- **Story:** The two boys try to sneak up the clock tower. The tower they now live in was locked even then.
- **Objectives:**
  1. A flashback.
  2. A timing/hide minigame that reuses Hide-and-Seek's spot logic.
  3. Caught by Sister Agathe (`matron`).
- **Rewards:** 20 Stardust, 1 Keepsake, collectible "The tower key that didn't fit"
- **Flags:** `lucas.mem2` · **Status:** Planned · **Tested:** No

### `lucas_mem_room` · A·3 Old Roommates
- **Category:** memory · **Pre:** `lucas_mem_plan`
- **Story:** A memory walk through their old room: find 5 objects that show the friendship.
- **Objectives:**
  1. Enter the memory (orphanage theme, KID sprites).
  2. Find 5 objects (multi-objective).
  3. Kairos, in the present, at the empty bunk.
- **Rewards:** Bond +1 · Lucas, 30 Stardust, collectible "Two names on a bedpost"
- **Flags:** `lucas.mem3` · **Status:** Planned · **Tested:** No

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

### World side quests
For every side quest:
- **Unlock:** `when:['fugitive']`, plus a `pre` where one is listed.
- **Default reward:** 30–40 Stardust, 1 Keepsake, and a Journal record.
- **Combat:** none unless noted.

| ID | Giver / discovery | Objectives (summary) | Activities | NPCs | Environments | Story flags | Spoiler guard |
|---|---|---|---|---|---|---|---|
| `side_morning_after` | An old woman by the fountain (new) | Hear her account; find 3 objects from that night (a sodden hymnal, a tile, a stopped watch); put her memories in order | dialogue, collection, ordering puzzle | old woman, Rosa | plaza, market | `side.morning` | The night of the rain and the fountain, **not** a "rift". Nothing explains why people forget |
| `side_names_paper` | A junior clerk at the Concord Office | Compare 3 conflicting birth entries; find the missing ledger page in the folders | investigation, Misfiled Folders variant | clerk | office | `side.names` | Hints at the Registry; Kairos's blank record is not re-explained |
| `side_sunday_cups` | Rosa ("tastes like pennies") | Ask 4 residents what they forgot after Sunday; note the pattern | dialogue, clue board | Rosa, Matteo, fish vendor, laundress | market, ashlane, chapel | `side.cups` | Pattern only. **No** conclusion that the water causes it (Chapter 2) |
| `side_festival_forgot` | A box of old Festival decorations at St. Hesper's | Find 3 old decorations and sketches; ask 3 people how the Festival used to be | collection, dialogue | Sister Agathe, Matteo, a lantern seller | hesper, plaza | `side.festival` | Sketches and paintings, not photographs. The Festival before the fountain is told differently by each person |
| `side_empty_chapel` | The keepers' sign on the old chapel door | Recover and shelve 4 writings; light the reading lamp | collection, sequence | 2 keepers | old chapel | `side.chapel`, `oldchapel.found` | Gnosis as "the Old Heresy" rumour; Buried Books as rumour |
| `side_unofficial_prayer` | **Pre:** `side_empty_chapel`. A whisper on Ash Lane | Follow chalk signs at dusk; witness the prayer; choose to keep their secret or not | follow-the-clues, choice | 3 pray-ers | ashlane | `side.prayer` | Keepers / Unbound / Hollow Choir appear only as names and rumours; nobody is all good or all bad |
| `side_missing_page` | A torn index in the Office's history shelf | Trail across 4 districts: the Office, the Cloister sundial, the Hesper archive box, the plaza plaque | multi-location trail | archivist | office, chapel, hesper, plaza | `side.page` | The official history is incomplete; no answers |
| `side_beyond_wall` | A traveller (new) near the Ash Lane cart | Hear the story; check 3 details (a map, a stone, a coin); decide whether to believe it | dialogue, inspection | traveller | ashlane, market | `side.wall` | The traveller is unreliable. Nothing is confirmed past the Wall |

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
6. **"The Morning After"** says "the first major rift event". The canon says that night was a **rain and the fountain rising**, not a rift. Proposed: write it as the night of the rain.
7. **Bram's Eastern Rift.** The spec says Agnes *saved his life* there. The canon says Bram *followed her into* the Rift ("Fourteen Vices. He had a shield and no plan."). Keep to the canon wording unless you approve the stronger claim.
