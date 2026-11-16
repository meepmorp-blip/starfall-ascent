# Chapter 1 Revision · Blueprint (v3: narrative + gameplay design)

**Status:** design approved in direction ("Chapter 1 Complete Narrative Revision & Gameplay Expansion", 2026-11-17). Implementation runs in stages on branch `ch1-revision`. Nothing is published.

**v3 changes** (from v2)
- Every scene now has a **gameplay layer**: exploration, battles with their own mechanic, puzzles, optional content and rewards.
- Lucas's solo battle has phases.
- The Institute is a playable investigation with a "Containment Failure" fight.
- The breakout is interactive: security switches, Dess's doors, a choice about the cores.
- The tower has a clock puzzle and becomes a returnable place.
- The Festival has clue gathering, a guarded cistern, the Unburdening, and a timed rescue.
- The Registry is explored before the Stacks.
- The v2 timeline (§ 3), the Theo/Marr history (§ 4), the canon table (§ 9) and the save migration (§ 10) are kept; they are appended at the end.

**Visual references:** the owner's reference images did not arrive with the brief (text only). This design follows the shipped game's own art: top-down pixel art, the existing `ATMO` themes, character scale and the UI. When the images arrive they will be checked against § 12 before the Stage 3–7 maps are dressed.

**Tags**
- **[CANON]:** Lore Bible or shipped game.
- **[CHANGE]:** the owner's brief changes canon.
- **[NEW]:** a proposed addition. Documented in § 9 and `Lore_Updates` v1.2, and never silently made canon.

---

## 0. Design pillars (how every scene is judged)
1. **Play it, don't watch it.** Every major beat has a verb: walk, look, choose, fight, solve. Cutscenes are short and frame the play.
2. **Every fight has a reason and a rule.** No plain wave fights in the story. Each battle changes one thing: an objective, an enemy mix, a phase change, or the arena.
3. **Puzzles reward looking.** Answers are in the room: a pattern, a mark, a sound. They are never in an NPC's mouth. A wrong answer explains why it's wrong.
4. **Quiet after loud.** After each revelation or big fight comes a walkable breather (the hub-style walks the game already has).
5. **Existing systems only:**
   - Walk scenes with interact points, NPCs and kid sprites
   - `fight` with pools and kill goals
   - `defense` (protect an object)
   - `escort`
   - `stealth` (guards and checkpoints)
   - `frozen` (stopped time)
   - `split` teams
   - the puzzle panel and scene choices
   - the story sequencer

   The only new internals are `{leave}` / `{rejoin}` and `ch1b.met` (built in Stage 1).

---

## 1. What stays, changes, goes, and is new
- **Kept** [CANON]:
  - Act I as built.
  - The stopped minute (three held minutes).
  - Agnes and Bram, the hospital rift, Theo's lost minute.
  - Marr's experiment and the "little star" core; Dess and the girl of light; the breakout.
  - The clock tower, Lyra, the Festival and Tessa's mother, the eclipse and the five rifts.
  - The Registry, the Stacks, Intake Window 1, Horaios, Lucas taken, the dawn rooftop with seven, Crane's broadcast, the coda.
- **Changed** [CHANGE]:
  - Why people move.
  - Naomi stays at St. Lucia's.
  - Lucas's introduction and his own thread.
  - Marr's approach (an offer, not a seizure).
  - Cassie's introduction (the tower, not a rooftop ambush).
  - The Festival's motive (Naomi's warning).
  - Ash Lane's unlock point.
- **Removed:**
  - The Ash Lane rooftop ambush (`cass` fight).
  - Father Vane's lodging-house fire.

  Kept for later: the `cass` boss design becomes a future Cassie trial, and the frozen-fire rescue mechanic moves to the Festival.
- **New** (gameplay):
  - The hospital patients' clues.
  - The Office scene played as a room.
  - The Institute investigation, the core puzzle and "Containment Failure".
  - Lucas's archive, orphanage, "Forgotten Memory" fight and playable morning after.
  - Theo's ticker decode.
  - Agnes's "Lights Out" opener.
  - Security switches in the sneak; Dess's escort escape; the cores choice.
  - Lucas's Crane-house walk.
  - The tower clock puzzle and the tower as a returnable place.
  - Festival clue gathering, the guarded cistern fight, the Unburdening, the timed rescue.
  - Registry exploration, the "Record Keepers" fight.

---

## 2. Scene-by-scene design
Format per scene:
- **Why** (the motive that moves the party here)
- **Play** (what the player does)
- **Battle** / **Puzzle** / **Optional** / **Reward**
- **Flags**
- **Est.** (estimated minutes)

### Act I · An Ordinary Tuesday (R0–R5): kept as built (≈ 10 min)
Cold open; `market`, Tessa's choice; `chase` (held minute #1); `first`, `garrison`, Agnes and Bram join; "Who are you?"; `carry` (escort).

---

### R6 · St. Lucia's (Day 1, evening) · revised (≈ 7 min)
- **Why here:** Kairos glowed and collapsed; Agnes and Bram carry him in (`carry`).
- **Play:**
  1. Naomi's exam (kept). The arm writing; `c_noemi_*` (kept).
  2. **Theo's reader puzzle** (kept): sixty seconds; the centre was Kairos; the Seam grew.
  3. **Ward rift `lucia`** (kept): pick 3 of 5, defend the beds.
  4. **`ward` walk, extended into "Rounds with Naomi"** [NEW]: three patients from the minute can be visited.
     - Each one fails a simple question differently: "What day is your birthday?" "…Spring, I think." / a man who keeps his own wristwatch an exact minute behind / a girl who drew the fountain without knowing why.
     - Naomi notes each one ("Write it down while it's still strange").
- **Puzzle (light, observational):** the ward clock and the patients' watches. Set the ward's master clock to the minute the patients lost. Read the stopped wristwatch at bed 4, then turn the clock's key the right number of times. A wrong setting makes the ward clock chime wrong, and Naomi frowns: "That's not when it happened."
  - Rewards Theo's line: "Exactly sixty seconds. Everywhere. Every clock."
- **Why Theo comes and Naomi stays:**
  - Theo: "Every clock log *and* every birth chart in Meridian is filed at the Concord Office. If your chart says anything, it's there."
  - Naomi: "I've got three patients who can't remember their birthdays. Somebody has to keep writing it down."
  - Theo gives her one of a pair of **brass ticker boxes** [NEW, § 9.5] that tap short messages over the speaking-horn wires.
- **Roster:** Naomi and Theo join for `lucia`. After `ward`: `{leave:'noemi'}`. She stays *met* for the hub.
- **Optional:** the medicine shelf (a one-time 30 Stardust); a nurse's chart reading "Patients forgetting: 3 this week" (a seed).
- **Flags:** `noemi_clues` (0–3 patients visited); `ward_clock` (puzzle solved first try).
- **Continuity:** Naomi draws **no conclusion** about the Mercy [CANON reveal schedule].

### R7 · The Concord Office (Day 2, morning) · revised heavily (≈ 5 min)
- **Why here:** the clock logs and his chart (R6).
- **Play:** the `queue` walk becomes **a room to explore** [NEW]:
  - the clock-log board (all stopped at 11:52 last night)
  - the Houses directory: drawers labelled by planet; reading it is optional
  - a public notice "Festival of the Mercy · Friday" (a seed)
  - Theo goes to the clock-report window ("Don't sign anything") and **leaves the party view**
- **The records window** (a scene with choices):
  1. The **records clerk** (`rclerk`) searches twice. "Every child in Meridian is registered within the hour" (kept).
  2. Kairos's frustration builds. **Choice `c_office_*`**:
     - "St. Hesper's. Nine years. Sister Agathe can tell you." (`c_office_plead`)
     - "Then your book is wrong." (`c_office_angry`)

     Either way, voices rise. Agnes's hand on his shoulder; Bram steps between him and the guards.
  3. **Lucas** [CHANGE]: a senior clerk crossing the hall with a stack of transfer forms. "Is there a problem with this record?"
     - Kairos recognises him; Lucas doesn't.
     - **Choice (kept): `c_truth` / `c_lie`.**
     - Lucas is polite, uncomfortable, and *professional*. "Records don't go missing. They go to the Registry." He keeps the search slip: "I'll look into it." He does not follow them.
  4. **Marr** [CHANGE]: at the Office collecting the Garrison's Vice reports [NEW]. He saw the **clock mark** on Kairos's collarbone in the scuffle.
     - "St. Lucia's couldn't tell you what's wrong with you. I can. Tonight, if you like."
     - Kairos goes **willingly**: he wants an answer. Agnes: "I don't like how fast he smiles." She can't stop a free man.
  5. **Theo returns.** Bram: "He went with a Dr. Marr. Said he could help." Theo goes white. Three lines only (§ 4):
     - "I worked for him. Two years."
     - "He measured a man until the man forgot his own name."
     - "We go. Now."
- **Moves on by:** the Institute gate. "The patient signed in voluntarily." Agnes stops Bram forcing it (kept line). They need a way in.
- **No battle here:** a public office stays a quiet scene. Tension comes from the choices.
- **Flags:** `c_office_plead` / `c_office_angry` (read by Lucas in R9a); `c_truth` / `c_lie` (kept).

### R8 · This Won't Hurt (Day 2, afternoon) · expanded into a playable investigation (≈ 9 min)
- **Why here:** Kairos accepted Marr's offer (R7).
- **Play as Kairos,** in `lab` theme, walk mission `lab_wait` [NEW]: "Wait here, Mr. … Kairos. The doctor will be a moment."
  - Exploring the consultation suite while Marr is "a moment":
    - the clock on the wall (kept)
    - **Theo's old reader prototype** on a shelf, tagged "LARK · DECOMMISSIONED" (Theo was here)
    - an observation log: "Volunteer G-7. Day 9: cannot recall volunteering. Continue"
    - a locked cabinet of labelled cores, all humming at different speeds
    - Dess at a desk (an NPC), nervous, who answers one question about the cores
  - Optional reads, each a one-time 20 Stardust: the shift roster ("23:00 shift change"; it matters later), a Concord funding letter ("on behalf of our patrons" [NEW, one line]).
- **Puzzle · Core Resonance** [NEW, observational]:
  - Marr returns, kept lines: the needle, `c_marr_*`, "you signed… you just don't remember".
  - He sets three cores on a tray: "Hold the one that feels warm." In play, each core **pulses** at a different speed (a drawn glow).
  - Kairos's **heartbeat** shows on the monitor. The right core is the one pulsing in time with it.
  - Wrong pick: "Nothing. Cold glass." Marr writes something down. Nothing is lost.
- **The memory inside the core** [NEW, a short playable fragment]:
  - Kairos "steps into" the core: a 40-second walk as an **unknown man in Garrison grey** (G-7), with three interact points: a kitchen, a child's drawing, a door.
  - Each one fades when touched. **Kairos can see memories inside cores** [CHANGE, as the brief asks].
  - Back in the room, the core is cold, and Marr's pen has stopped.
- **Battle · Containment Failure** [NEW, `defense`]:
  - The core's pulse jumps to the other cores, the cabinet cracks, and Vices pour out of the samples.
  - **Protect the containment unit** (a `defense` ward; a drawn pylon like Bram's oven) for 40 s, **Kairos alone**. Pool: devourers (they pull you toward the cabinet) and gossips.
  - Marr does **not** help: he watches through the glass, writing.
  - Losing (the unit breaks): Retry, nothing lost.
- **After the fight:**
  - Marr, delighted and quiet: "Observation, retained indefinitely." Night transfer at the 23:00 shift change.
  - **Dess's progression:** pushes back (kept); watches which shelf (kept); **reads "retained indefinitely" and recognises the wording** from a file she was never allowed to open [NEW]; swaps the core for a blank (kept, now motivated).
  - Her decision is **active**: she tells no one, and she hides the real "little star" core in her coat.
- **Flags:** `core_first_try`, `g7_seen` (all three memory points touched; read by Dess in R11 and by Marr's file in Chapter 2), `c_marr_*` (kept).
- **Continuity:**
  - Marr doesn't know *what* Kairos is, only that he is valuable.
  - The girl of light is **not** shown here.
  - Dess's "My mother called me that" (kept) stays the only hint about her childhood.

### R9 · The Long Way (Day 2, 18:00–21:30) · Lucas, solo (≈ 13 min)
Full timeline in § 3 and sequence in § 5 (kept from v2), with these gameplay upgrades:
- **a. The archive** (`office` theme walk as Lucas, after hours):
  - the search slip (his thought changes with `c_office_*` and `c_truth` / `c_lie`)
  - the St. Hesper's intake shelf; Kairos's line ("Foundling. 11:59. No chart.")
  - **his own intake page** two lines below, which he has never seen
- **b. `longway`** (kept): bread, window, saucer, gate clock.
- **c. Sister Agathe** at the gate (a choice that only orders the same information).
- **d. The orphanage, partly kept** [NEW, `orphanage` theme walk]:
  - The playroom and the old dorm, as they are now.
  - Childhood objects: a saucer of milk by the kitchen door ("There wasn't a cat", a kept motif), a bunk with two sets of initials scratched, a loose floorboard with a tin.
  - Each object gives a **fragment line** in a voice he almost knows.
- **e. Battle · Forgotten Memory** [NEW, `fight`, solo, party `['lucan']`]:
  - **The Vice that remembers him:** the Collector type, renamed and bigger, with gossip adds.
  - At 75%, 50% and 25% health, **time stutters** (the existing frozen tint, 1 s). A memory fragment shows ("bread, still warm" · "someone counting to sixty" · "smoke"), and Lucas gains **Remembering** (+10% damage, stacking).
  - The fight gets *easier* as he remembers: the emotion is the mechanic.
  - It introduces his kit (long range, marks).
  - Losing: Retry; the Vice keeps the stacks it took.
- **f. The core / the fire** (kept panels): the curtains, time stopping, Kairos pulling him out, the hands.
- **g. The morning after** (playable; KID sprite walk, as built for Part A):
  - Agathe hands over his bag; the window where a boy with bandaged hands sleeps.
  - **`c_lucas_door`:** knock ("I'll come back for you") or keep walking.
  - At the carriage: the tower, and kid Kairos's voice: "Inspection's over at nine. Meet at the tower."
- **h. The cup** (two lines).
- **i. The step:** what he remembers and what he doesn't. He knows Kairos mattered, and that he has lived nine years as someone else's son.
- **The choice to help** [NEW, a quiet beat, no menu]: at the Office (his clearance) he reads the **transfer register**: Marr's order, 23:00. He signs out a courier pass under his own name. That's the commitment, and it can be traced to him.
- **Flags:** `lucas_frag` (0–3 orphanage objects), `c_lucas_door` (kept), `lucas_knock`.

### R10 · The Plan (Day 2, 21:00) · revised, with a Theo moment (≈ 3 min)
- **Why:** the gate won't open (R7).
- **Play:**
  - Agnes's Garrison safehouse (a cutscene).
  - **Puzzle · The Ticker** [NEW]: Naomi's message comes through as a tape of long and short taps. Theo has a card of the code (part of it is torn).
    - The player matches the tape to the card. The torn letters can be worked out from context ("LAUNDRY CART 23:00 SERVICE STAIRS").
    - Theo talks the whole time (character moment).
    - A wrong decode makes Theo laugh, "'Lunatic cart'? No…", and the player tries again.
  - Plan: three ride in on Naomi's laundry cart and open the service stairs from inside.
  - Theo: "I know the public floors. I never got below sub-level one" (rewritten canon line).
- **Ash Lane unlocks here** [CHANGE]: the cart's route runs up Ash Lane (§ 9.7).
- **Flags:** `ticker_decoded`, `ch1b.flags.ashlane`.

### R11 · Breakout (Day 2, 23:00–23:40) · kept core, made interactive (≈ 11 min)
- **a. Lights Out** [NEW, Agnes's moment, `fight` with an objective]:
  - From the laundry cart, the outside team (pick 3 of Agnes, Bram, Theo; Agnes recommended as lead) must **put out the yard's spotlights**: Spotlight Vices that lock lines on the cart.
  - Goal: defeat 4 spotlights before the cart reaches the door (a `defense` timer with the cart as the ward).
  - Agnes's sniping and Spotted marks make this her scene.
- **b. `assault`** (kept, pick 3, with Lucas's convergence):
  - Mid-fight a **courier lift** opens: Lucas steps out. "You said 'next'." / "This afternoon I didn't remember a kitchen fire" (kept).
  - `join:'lucan'` for the rest of the breakout.
- **c. `sneak`** (Kairos inside, `stealth`, kept), extended:
  - **two security switches** (interact points) must be thrown before the exit counts. The guards and cameras are as built.
  - Held minute #2, kept: "someone's holding it with me".
- **d. The sealed door → Dess:**
  - Dess with the key card (kept), now **her decision**: she gives Kairos the real core she hid in R8. "It sings when you're near. It never sang for him."
  - Cores puzzle (kept) → the girl of light (kept, not explained).
  - **Choice `c_cores_*`** [NEW]:
    - release the trapped cores (`c_cores_free`: they drift up the stairwell like lanterns)
    - leave them sealed (`c_cores_keep`: "We can't carry the dead out tonight")

    It changes Dess's line in R13 and one Marr line in Chapter 2.
  - Dess joins.
- **e. `escape`** → **escort** [CHANGE of type, existing system]:
  - Dess must open three seal doors; she is the escort carrier, slower when hit.
  - Pick 2 more from Kairos, Lucas, Agnes, Bram and Theo.
  - Each door takes a few seconds of her working while Vices come (her lab knowledge in play).
- **f. Marr** [NEW, one panel]: in the observation gallery, calm, writing: "Subject retained. Observation continues." He is not caught. He reports a "heretic break-in" to the Council.
- **After:**
  - The service yard, "I'm sorry" / "You came back."
  - **Lucas leaves** (`{leave:'lucan'}`): "I have to ask my father something. Tonight, while I still remember the question."
- **Flags:** `c_cores_*`, `lights_fast` (the cart took no hits).

### R12 · The Crane House (Day 2, ~00:30) · Lucas, a short walk (≈ 3 min)
- **Play** (`office` theme as Crane's study): the silver cup on the shelf; the framed Registry commendation; his own childhood chair. "I accepted it on your behalf" (kept).
- **Choice `c_crane_*`** [NEW]:
  - "Why me?" (`c_crane_why`): Crane doesn't answer; it's kept for Chapter 2
  - "Don't send anyone after me." (`c_crane_warn`)
- He takes his coat. Leaving the Chancellor costs him a home and a name, and the scene lets it land: no music, the door, the stairs.
- **Flags:** `c_crane_*`.

### R13 · The Clock Tower (Day 3, 00:15 → morning) · the hideout (≈ 9 min)
- **Why here:** Kairos proposes it. Locked and dead, and he and Lucas hid there as children [CANON].
- **Play:** the `tower` walk becomes **the hideout map**, the same map the post-Chapter 1 hub uses, so players come back to it.
- **Exploration:**
  - carved initials on a beam (K + L, the third try, matching Part A)
  - a bread tin
  - the stopped clock's mechanism room
  - the bell loft (locked)
- **Puzzle · The Stopped Clock** [NEW]: the bell-loft hatch is wired to the clock train.
  - The four gears each have chalk tally marks scratched by children ("the third try").
  - Turning them in the order of the tallies (1-2-3-4, *read from the wall*, not told) lifts the hatch.
  - Wrong order: the gears grind back with a clunk.
  - Kairos's held-minute sense also helps: if you stand still near the mechanism, the right gear **ticks once**. That's a subtle hint, not an answer.
- **Cassie in the bell loft** [CHANGE]:
  - Office of Correction, off duty, reading the St. Hesper's **Sunday spoon ledger** (children brought in the week of the fountain night).
  - She recognises Kairos from tonight's warrant and doesn't arrest him. Cold and guarded.
  - **Choice `c_cass_ask` / `c_cass_leave`.**
  - She drinks from a small Mercy vial before she leaves ("for bad nights"). Her parting line: "The Office searches St. Hesper's in two days. Be gone by then."
- **Hidden document (optional):**
  - Her hymnal page, left in the ledger: "The seven who were set to keep the gates have forgotten their keeping" [NEW lore hint, subtle].
  - Reading it gives a one-time Fragment and the flag `cass_page`; Cassie mentions it at the Festival.
- **Bond talks (optional):** the existing tower Bond walk, recast:
  - Naomi's beats become **Theo at the ticker with Naomi**, the Bond granted to both
  - Dess's line follows `c_cores_*`
  - Bram's bread, Agnes's watch
- **Lucas arrives** (~02:00) from his own memory of the tower. **`rejoin:'lucan'`** (no card), with a reunion that shows *new* things only:
  - "I said I'd come back." (if `c_lucas_door` = knock)
  - "I walked past your window." (if not)
- **Lyra on the beam** (kept, trimmed): "Don't drink anything they give you."
- **Flags:** `clock_hatch`, `cass_page`, `c_cass_*`, `c_breakfast` / `c_job` (kept).

### R14 · Naomi's Warning (Day 3, morning) · new (≈ 3 min)
- **Ticker scene:** the Office and the Garrison searched St. Lucia's; they asked about Naomi.
- **News:** the Church has requisitioned every water cart and clean cup. "The Festival of One Cup": everyone in the Square drinks.
- Naomi's pattern: her birthday patients all went to Sunday service. She writes it down and **draws no conclusion** [CANON].
- **The debate** [NEW, characters disagree]:
  - **Agnes: no.** "We're seven fugitives. We'd be walking into a square of stewards."
  - **Theo: yes.** "An eclipse at noon tomorrow. Seam stress at the same hour a whole city drinks."
  - **Lucas, quietly:** "Every attendee is filed by cup number. I've stamped those forms for years and never asked why."
  - **Dess:** "The cores sang louder when I carried them past the fountain."
  - **Bram:** "My mother goes every year."
  - **Kairos decides.** Choice `c_fest_why`:
    - "For Tessa." (`c_fest_tessa`)
    - "For answers." (`c_fest_answers`)
  - Agnes agrees on one condition: steward armbands for her and Bram, mourners' veils for the rest, moving in pairs.
- **Flags:** `c_fest_*`.

### R15 · Festival of the Mercy (Day 4) · revised and expanded (≈ 13 min)
- **Why:** R14.
- **Play:** the `fest` walk becomes the chapter's richest map (Festival Square, existing).
- **Warm first, then unsettling:**
  - Lantern stalls, the choir, children with paper suns.
  - Rosa's "pennies", the widow, the believer (kept).
  - Bram's errand: his mother calls him Tomas [CANON].
- **Investigation (3 clues → the flag `mercy_clues`):**
  1. The water carts come **from the Church cistern**, not the wells (a carter).
  2. Every cup has a **number**, and clerks write names next to them (a Registry clerk; Lucas recognises the form).
  3. People who drank last year can't name what they grieved (two townsfolk, gently).

  Clues are optional. With 3 of them, Theo says one extra line at the Registry ("Same timetable as the carts").
- **Patrols:** Church stewards walk routes. Get too close and "Move along" sets you back a few steps. Nothing fails (light, as decided).
- **Restricted area · the cistern** [NEW, `fight`]:
  - Behind the fountain, a gated stair is guarded by **Waxer Vices that keep the others alive**: take the healers down first.
  - The pick: 3 of 7; **Cassie isn't playable yet**.
  - Inside: the vats, the stamped cups, and **nothing provable**. It sets up the dread without revealing the mechanism.
- **The Unburdening** [NEW, interactive]: people write a grief on a slip and burn it in a lantern. Kairos may write one too.
  - `c_unburden_write`: he holds the pen and can't think of anything. He has no grief he remembers, and that is its own answer.
  - `c_unburden_skip`
- **Tessa's mother** (kept): "Tessa, why was I crying?" **Cassie** witnesses it (kept, gradual):
  1. Vane makes her drink, and she can't find her anger: "Then why does it feel like being robbed?" (kept).
  2. **New:** she covers for Kairos's pair at a patrol: "These two are mine."
  3. At the eclipse, the badge goes on the fountain rim (kept). She joins: "Don't make it strange" (kept). Her line varies with `cass_page`.
- **The eclipse:** five rifts (kept).
- **The rescue · held minute #3** [CHANGE, the moved `rescue` frozen mission]:
  - A lantern rig falls over the cup line where Tessa and her mother stand. Kairos asks; something answers (kept).
  - In stopped time, **move the people out of the rig's shadow and wedge the beam** before the minute runs out (the frozen mission's timer).
  - It's a puzzle of *order*: the beam can only be wedged after the people are clear.
- **Battle · Protect the Crowd** (`festival` defense, kept): pick 3 of 7, Cassie playable, crowd as the ward.
- **Moves on by:** every Vice turns toward the Registry (kept). Theo's reader points the way the cup carts went.
- **Marr seed** (one panel): eclipse readings at the Square's edge. The party doesn't see him.
- **Flags:** `mercy_clues` (0–3), `c_unburden_*`, `cistern_done`.

### R16 · The Registry → Intake Window 1 → Dawn · kept climax, better build-up (≈ 11 min)
- **Why follow:**
  - Lucas: every record in Meridian, and one blank one.
  - Theo: whatever pulls Vices is what pulled the minute (+ the cart line if `mercy_clues` = 3).
  - Agnes: night staff are inside.
- **Play · The Registry hall** [NEW, `office`/`lobby` walk]:
  - **Records filed by House** (planet signs on every aisle).
  - A drawer of **"warm" files**: people who drank today; the paper is warm.
  - Two charts for one person, with different birthdays.
  - Outgoing forms stamped with **Mercury's sign** and "FORWARD: ARCHIVE".
  - All optional reads. The main path needs only the gate.
- Lucas's father's keys (kept) → **the gates puzzle** (kept).
- **Battle · The Record Keepers** (`stacks` split, kept), with a **rule:**
  - Collector Vices **steal records off the shelves**. If one reaches the far wall with a record, a shelf seals and the arena narrows.
  - Team A pushes; Team B protects the index (each team keeps its existing split goal).
- **Intake Window 1** (kept): the vision "I've been here"; **Horaios** (Kosmokrator of the Moon, the cosmic clerk); the forced loss; Lucas takes Kairos's place through the white Gate.
  - `c_lucas_door` adds one line before the Gate: "I'm not losing you twice" (canon) gains "I came back".
  - The collapse; Bram carries him.
- **Dawn rooftop** (kept): Crane's broadcast frames them; the toast; `c_been`; `c_job`. **Naomi arrives** with her bag: seven on the roof [CANON]. The Lyra and cloaked-man coda (kept).
- **Flags:** `registry_reads` (0–4).

---

## 3a. Battles at a glance (every story fight has a rule)
| Fight | Scene | Type | The rule | Party |
|---|---|---|---|---|
| `first`, `garrison` | R3 | fight | kept | Kairos / + Agnes, Bram |
| `lucia` | R6 | fight (pick 3/5) | defend the ward beds | |
| **Containment Failure** | R8 | defense | protect the containment unit; devourers pull you in | Kairos solo |
| **Forgotten Memory** | R9 | fight | three phases; each returned memory makes Lucas stronger | Lucas solo |
| **Lights Out** | R11 | defense | spotlight Vices lock lines on the laundry cart; kill 4 before it reaches the door | pick 3 (Agnes led) |
| `assault` | R11 | fight | kept; Lucas joins mid-fight | pick 3 |
| `sneak` | R11 | stealth | kept + 2 security switches | Kairos |
| **escape** | R11 | escort | protect Dess while she opens 3 seal doors | Dess + 2 |
| **The cistern** | R15 | fight | waxers heal the others; kill healers first | pick 3/7 |
| `rescue` | R15 | frozen | order: people out, then wedge the beam, before the minute ends | Kairos |
| `festival` | R15 | defense | protect the crowd | pick 3/7 |
| **Record Keepers** (`stacks`) | R16 | split | collectors steal records; a lost record seals a shelf | 2 × 3 |
| Horaios | R16 | loss | kept (scripted) | pick 3 |

- **Retired:** `cass` (rooftop), kept for a future Cassie trial.
- **Losing any fight:** Retry at the start of the fight, nothing lost (existing `missionFail`).
- **Balance (from v2 § 11):** with no healer in R11–R16, pressure drops 10–15% through each mission's own enemy counts and levels.

## 3b. Puzzles at a glance (all observational, none told by an NPC)
| Puzzle | Scene | Clue in the room | Wrong answer |
|---|---|---|---|
| Theo's reader | R6 | kept | kept |
| Ward clock | R6 | the stopped wristwatch at bed 4 | the clock chimes wrong; Naomi frowns |
| Core Resonance | R8 | the heartbeat on the monitor | "Cold glass"; Marr writes |
| The Ticker | R10 | the code card + context | Theo laughs at the nonsense word |
| Cores (kept) | R11 | kept | kept |
| The Stopped Clock | R13 | children's tally marks on the wall; the gear ticks if you wait | the gears grind back |
| Rescue order | R15 | the beam can't be wedged with people under it | the minute runs out → Retry |
| Gates (kept) | R16 | kept | kept |

## 3c. Optional content and rewards (existing currencies only; once per save via `claims`)
| Where | What | Reward |
|---|---|---|
| R6 | medicine shelf; the nurse's chart | 30 Stardust; lore |
| R8 | shift roster; patrons letter | 20 + 20 Stardust |
| R9 | 3 orphanage objects | a Keepsake if all 3 |
| R13 | hymnal page | 1 Star Fragment |
| R13 | Bond talks | Bond (existing) |
| R15 | 3 Mercy clues | 40 Stardust and Theo's line |
| R16 | 4 Registry reads | 1 Keepsake if all 4 |
| Chapter clear | kept | kept (`ch1:first`) |

## 3d. New story flags (all default to a neutral line when absent)
`noemi_clues`, `ward_clock`, `c_office_plead`/`c_office_angry`, `core_first_try`, `g7_seen`, `lucas_frag`, `lucas_knock`, `ticker_decoded`, `ashlane`, `c_cores_free`/`c_cores_keep`, `lights_fast`, `c_crane_why`/`c_crane_warn`, `clock_hatch`, `cass_page`, `c_cass_ask`/`c_cass_leave`, `c_fest_tessa`/`c_fest_answers`, `mercy_clues`, `c_unburden_write`/`c_unburden_skip`, `cistern_done`, `registry_reads`.

Kept: `c_bread`/`c_earnest`/`c_joke`, `c_ines_*`, `c_noemi_*`, `c_truth`/`c_lie`, `c_marr_*`, `c_lucas_door`, `c_breakfast`/`c_job`, `c_been`.

Retired (harmless in old saves): `c_cass_name`, `c_cass_joke`.

## 3e. Pacing and length
| Act | Scenes | Est. min | Mix |
|---|---|---|---|
| I | R0–R5 | 10 | kept |
| II | R6–R8 | 21 | puzzle → fight → walk → quiet → choice → investigation → fight |
| III | R9–R12 | 30 | solo walk → solo fight → playable memory → puzzle → 3 fights + stealth → quiet walk |
| IV | R13–R14 | 12 | exploration, puzzle, bonds, debate |
| V | R15–R16 | 24 | festival exploration, fight, ritual, timed rescue, defense, exploration, split fight, finale |
| **Total** | | **≈ 75 min** (≈ 65 with no optional content) | |

- Rhythm rule: no two cutscenes back-to-back over 2 minutes.
- Every revelation is followed by a walk or a fight.

## 3f. Character moments (who gets to be themselves)
| Character | Moment |
|---|---|
| Kairos | the minute, the core memory, the stopped-clock sense, the rescue |
| Agnes | Lights Out (precision), the voice of caution at R14 |
| Bram | stepping in front of the guards (R7), protecting the cart (R11), his mother (R15) |
| Naomi | the ward rounds and the ward-clock puzzle; the ticker; arrives at dawn |
| Theo | the reader, the ticker decode, the history with Marr |
| Lucas | the archive, the orphanage, the solo fight, the playable memory, the courier pass, the Crane house |
| Cassie | the spoon ledger, the hymnal page, covering at the patrol, the badge |
| Dess | the hidden core, the doors in the escape, the cores choice |

## 12a. Visual direction and asset needs
- **Reused (no new maps):**
  - `hospital` (R6), `office` (R7, R9a, R12, R16)
  - `lab` (R8, R11), `orphanage` / `dorm` (R9), `street` (R9b, R10)
  - `rooftop` / `roof` (R11 yard, R16 dawn), the tower map (R13), `plaza` (R15), `lobby` (R16)
- **Small new drawings, in the same pixel style and scale:**
  - a containment pylon (like the oven ward)
  - the laundry cart as a ward
  - a lantern rig for the rescue
  - a ticker box (cutscene prop)
  - core trays with pulsing glows
  - chalk tally marks; the cistern stair gate

  Each is drawn in canvas code like the existing props.
- **No new UI:**
  - The ticker uses cutscene panels with a brass frame tint.
  - The decode and the clock use the existing puzzle panel or interact points.

---

## 15. Implementation stages (v3)
| Stage | Content | Tests |
|---|---|---|
| 1 ✔ | Infrastructure: `{leave}`, `{rejoin}`, `ch1b.met`, the migration map (off) | `ch1_migration_test` (11/11) |
| 2 | R6 hospital (rounds, ward clock, ticker) and R7 Office (room, choices, Lucas, Marr, Theo's three lines) | `ch1_revised_test` part 1 |
| 3 | R8 Institute (exploration, Core Resonance, the G-7 memory, Containment Failure, Dess) | part 2 |
| 4 | R9 Lucas (archive, orphanage, Forgotten Memory, kid walk, `c_lucas_door`, courier pass) and R12 Crane house | part 3 |
| 5 | R10 ticker, R11 breakout (Lights Out, switches, Dess's escort escape, cores choice, Marr gallery), R13 tower (clock puzzle, Cassie, Lucas rejoins), R14 debate | part 4 |
| 6 | R15 Festival (clues, patrols, cistern, Unburdening, timed rescue) | part 5 |
| 7 | R16 Registry (hall, Record Keepers rule), dawn with Naomi; the migration switched on; Ash Lane rule; `Lore_Updates` v1.2 | part 6 + `ch1_migration_test` (all rows) |
| 8 | Balance, full chapter playthroughs (all choices, deliberate losses), save and load in every scene, desktop and mobile, visual and UX tour of the new screens, `docs/CH1_QA_REPORT.md` | full suite |

**Tracker:** the status of each stage is kept in `docs/DEV_QUEUE_CHECKPOINT.md` (Chapter 1 section).

## 16. Decisions (owner, 2026-11-16: "use recommendations")
1. **The ticker** over the speaking-horn wires.
2. **Theo's tenure:** about two years, eight years ago, as written.
3. **`c_lucas_door`:** read in Chapter 1 (R13, R16), with one beat at the Chapter 2 rescue (noted for Chapter 2).
4. **"Meet at the tower":** yes, kid Kairos may say it.
5. **Courier passes for senior clerks:** yes, as new world detail.
6. **Marr seed at the Festival:** kept, one unseen panel, as in R15.

Implementation follows § 15, stage by stage.


## Kept from v2 (still valid)

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

