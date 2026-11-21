# World Exploration and Quest Guide (as implemented)

Traced from `index.html` at `main` `9828aa4`, 22 Nov 2026. No code was changed.

The key code:
- `WORLD_LOCS` and `wmUnlocked`: world map areas and their locks
- `MX_DISTRICTS`: district exits
- `mxExits`: hides exits into locked areas
- `MX_QUESTS`, `mxQState`, `mxDiscoverPass`, `mxOfferAt`: quests
- `MX_FINDS`: records and activity spots
- `MX_LOOKS`: look-at objects
- `LUCAS_MEM_SPOTS`: Lucas's memory spots

Screenshots were taken with a test save that has Chapter 1 complete: Ash Lane, the Cloister, the Clock Tower and St. Hesper's.

## 0. The two eras (the most important rule)
`mxEra()` is **"before"** until Chapter 1 is complete, and **"fugitive"** after it (`ch1Scene() >= 99`).

Almost everything optional in Meridian (all side stories, bond stories and Lucas's memories) needs the fugitive era. Before the end of Chapter 1, Meridian only has Matteo's errands.

The game says this in one place only, the Journal's Stories tab: "Stories open up after Chapter 1."

## 1. Areas and exact unlock rules
**How travel works:**
- You move between districts by walking off a gold arrow at an edge.
- Exits into locked areas are **removed entirely** (`mxExits`), so no locked door or arrow shows.
- Once you've visited an area, you can fast-travel to it from the world map.

| Area | Exits | Unlock rule (code) | Automatic? | How the player learns it |
|---|---|---|---|---|
| Market Ring | Yard (W), Square (E), Cloister (N), St. Lucia's (S) | always open | yes | start point |
| Festival Square | Market (W), St. Hesper's (E) | always open | yes | arrow |
| Garrison Yard | Market (E) | always open | yes | arrow |
| The Cloister | Market (S), Concord Office (E) | always open | yes | arrow |
| St. Lucia's | Market (N), Ash Lane (E) | always open | yes | arrow |
| St. Hesper's | Square (W), Clock Tower (E) | `need.walk` (open from the start, but only reached on foot) | needs a walk | Map: "Walk there from Festival Square (east)." |
| Concord Office | Cloister (S) | Chapter 1 reaches Scene 7 | automatic | Map: "You first go there in Chapter 1, Scene 7." |
| Ash Lane | St. Lucia's (W), St. Maren's (E) | Chapter 1 reaches Scene 10, **or** the `ch1.ashlane` flag (set at "The Plan") | automatic | Map: "Opens once Chapter 1 reaches 'The Plan'." |
| St. Hesper's Clock Tower | St. Hesper's (S), Annex (N) | Chapter 1 complete | automatic | Map: "Opens after Chapter 1 is complete." The name shows as "Unknown place" until Scene 11 |
| **St. Maren's** (hidden) | Ash Lane (W) | Chapter 1 complete **and** the `oldchapel.found` flag. **Only** set when you **start Cassie's bond story "A Prayer of Her Own"** | needs player action | Map: "Unknown place · Somebody would have to tell you it is there." |
| **The Institute Annex** (hidden) | Clock Tower (S) | Chapter 1 complete **and** the `annex.found` flag. **Only** set when you **start Dess's story "The Girl in the Experiment"** (see §2.3: it needs 7 stories done) | needs player action | Map: "Unknown place · Somebody would have to show you where it is." |
| Drowned Canals | none built | `need:{ch:2}`. `wmUnlocked` has no `ch` branch, so it is **always locked** | never (for now) | Map: "Opens later in the story." |

**Confirmed oddities:**
- **Canals can never unlock.** The `ch:2` condition isn't handled, and the district doesn't exist yet. That's fine today, but Chapter 2 work must add both.
- **St. Hesper's never shows as "locked".** It counts as unlocked from the start, but nothing points the player east from Festival Square except the map text.

## 2. Quests

### 2.1 How a quest becomes available (`mxQState`)
A quest is checked in this order:
1. **completed**
2. **active**
3. **locked_by_story:** its `when` era or `story()` condition is false
4. **locked_by_prerequisite:** its `pre` quests aren't all completed
5. **available:** you have *discovered* it
6. **undiscovered:** none of the above yet

Discovery happens in one of three ways:
- **Talking to the giver.** An NPC with an `offer` shows **`!`**; talking to them discovers and offers the quest.
- **A `found()` trigger.** Reading an object, using the workbench, or talking to a party member enough times. A "New story" banner then appears.
- **`autoFind`.** The quest is discovered as soon as it unlocks (only Dess's story).

### 2.2 Meridian errands (any era, kind main/optional)
| Quest | Giver / start | Requirements | Steps |
|---|---|---|---|
| Know the Streets (main) | Old Matteo, Market Ring (`!`) | none | Visit Market, Square, Yard, Cloister and St. Lucia's, then tell Matteo |
| Matteo's Glasses | Matteo, after you start Streets | Streets started | Fountain, Festival Square → Matteo |
| The Duty Roster | Garrison soldier, Yard | — | Pin it on the Market board → back to the Yard |
| Lanterns for Vespers | Lantern seller, Square | — | Take it to the Sister at the Cloister gate |
| Rounds | Ward nurse, St. Lucia's | — | Ask Matteo, Rosa and the fish vendor their birthdays → the nurse |
| Meridian Records | "Found on your own" | — | Find 8 of about 26 records: notices, plaques, corners. 6 are **hidden**: invisible until you're within about 70 px |

### 2.3 Stories (fugitive era only: Chapter 1 complete)
| Story | Kind | Where | How it's discovered | Prerequisites | Unlocks |
|---|---|---|---|---|---|
| The Morning After | side | Old Hanne, Festival Square | Talk to her (`!`) | — | — |
| Names on Paper | side | Pim, Concord Office | Talk (`!`) | — | — |
| Sunday Cups | side | Rosa, Market Ring | Talk (`!`) | — | — |
| The Festival We Forgot | side | Sister Agathe, St. Hesper's | Read the **box of old decorations** (St. Hesper's) **or** talk to Agathe 3 times | — | — |
| The Missing Page | side | Mr. Ambrose, Concord Office | Talk (`!`) | — | — |
| Beyond the Wall | side | Ivo the traveller, Ash Lane | Talk (`!`) | — | — |
| The Empty Chapel | side | Ottilie, **St. Maren's** | Talk (`!`) | `oldchapel.found` (Cassie's story started) | — |
| The Unofficial Prayer | side | The lamplighter, Ash Lane | Talk (`!`) | The Empty Chapel **completed** | — |
| A Little Something Handmade | bond (Agnes) | Clock Tower | **Use the workbench** in the tower | — | — |
| The Smell of Fresh Bread | bond (Bram) | Clock Tower | Read the **bakery window** (St. Hesper's) **or** talk to Bram once | — | — |
| The Things We Couldn't Save | bond (Naomi) | Clock Tower | Read the **chart** in the tower **or** talk to Naomi twice | — | — |
| A Prayer of Her Own | bond (Cassie) | Clock Tower | Read the **prayer book by the wall** (Cloister) **or** talk to Cassie twice | — | **Starting it reveals St. Maren's** |
| The Things We Remember ×3 | memory (Lucas) | St. Hesper's: loose board by the bakery → tower door → dormitory window | Interact with each spot (`?`, then `!`) | Each needs the previous one completed | — |
| The Girl in the Experiment | bond (Dess) | Clock Tower | Automatic ("New story" banner) | **All 7:** Agnes, Bram, Naomi, Cassie, and all 3 Lucas memories completed | **Starting it reveals the Institute Annex** |

The Clock Tower notice board opens the Journal's Stories tab.

### 2.4 Activity spots (lore only)
| Spot | Mode | Status |
|---|---|---|
| Rift scar, Festival Square | Astral Rifts | Text says they're in the Battle menu, and will open from here in a later update |
| Bounty board, Market | Weekly World Bosses | Not implemented (`now:null`); the board text already says "in a later update" |
| Trial roster, Yard | Constellation Trials | In the Battle menu |
| Quiet alcove, Cloister | Memory Expeditions | **Not implemented**; text says "in a later update" |

## 3. What the player is told (guidance review)
| Signal | What it does | Verdict |
|---|---|---|
| `!` over an NPC or spot | Something to start or hand in | Clear, but **never explained** in-game |
| `?` over an NPC or object | Unread flavour, an unfound record, an undiscovered memory spot, *or* a story trigger | **Overloaded.** In the screenshots: Ash Lane has 7 `?`, the Cloister 6, the tower 7. The one `?` that unlocks a story (prayer book, decoration box, bakery window) looks the same as a plaque |
| World map | Status (here / discovered / not discovered / story locked) and a requirement line | Good for story locks. Hidden areas say "Unknown place" plus a riddle line, but **where on the map** isn't secret: the dot and road are drawn |
| Locked exits | Removed | Hidden areas give **no in-world hint** (no east arrow in Ash Lane, no north arrow in the tower) |
| Journal · Stories | Available and active stories, plus "N more stories are still hidden or locked" | Shows a count only, **no hints** at what kind of thing unlocks them |
| Journal · Records | `???` per record with its district; hidden ones say "Something hidden, off the beaten path." | Good |
| Guide (main menu) | Start, Controls, Combat, Team, Characters, Vices, Runs, Builds | **No exploration or Meridian page** |
| NPC dialogue | Ottilie and Ivo exist; Cassie's prayer book has the stamp "ST. MAREN'S · ASH LANE" | The prayer-book clue is good, but only if you read it |

### Confirmed communication gaps (ranked)
1. **The Institute Annex is behind a 7-story chain that nothing mentions.** The map says "Somebody would have to show you where it is." Nothing tells you that finishing the hideout stories and Lucas's three memories is the path.
2. **St. Maren's depends on starting Cassie's story.** Players who don't talk to Cassie twice or read the prayer book never see it. The Ash Lane east edge looks like a wall.
3. **`?` means five different things.** Story triggers are indistinguishable from flavour, and that's the main reason players miss hidden starts (decoration box, bakery window, workbench).
4. **The Agnes and Dess story starts are invisible.** Agnes's story starts by *using the workbench*, which reads as "open Builds". Dess's starts only after the chain.
5. **Nothing explains `!` / `?` or the two eras**, apart from one Journal line.
6. ~~Two activity spots point at modes that don't exist yet.~~ Correction: both already say "in a later update".

### Not bugs, but worth knowing
- St. Hesper's is "open" from the start, yet reaching it requires walking east from the Square.
- Canals can't unlock (correct for now; see §1).

## 4. Recommendations (keep discovery, remove dead ends)
In priority order:
1. **Give story triggers their own mark.** For example, a small gold `?`, or a sparkle on objects that can start a story. Keep the plain `?` for flavour and records. This one change fixes most "I never found it" cases without revealing anything.
2. **In-world hints at hidden exits.** A faint, boarded-up path on Ash Lane's east edge ("Weeds through an old gate. Nobody uses it.") and a locked hatch at the top of the tower. Once the area is found they become normal arrows. The secret stays; the player just knows *something* is there.
3. **Riddle hints in the Journal**, not answers. Under "N more stories hidden", add one rotating clue per locked story, written in-world. For example:
   - "Cassie keeps something from a chapel nobody uses."
   - "Dess will talk when the others have."
4. **Tell the Annex chain through dialogue.** After 4 of the 7 stories, Dess (or Theo) says a line like "When everyone's had their say… I've got something to show you." Optionally add a "Hideout stories 4/7" progress note on the tower notice board.
5. **One Guide page, "Exploring Meridian".** Cover `!` and `?`, gold arrows, the world map, the Journal tabs, and that stories open after Chapter 1. No spoilers.
6. **A clearer workbench prompt** when Agnes's story is discoverable. For example, the prompt reads "Workbench · Agnes left something here" instead of only opening Builds.
7. ~~Mark not-yet-built activities~~: already done in the game (audit error).
8. **Before Chapter 2:** handle `need.ch` in `wmUnlocked` and build the Canals district.

None of these change unlock conditions or story progression. They only change what the player is told.

---

## Player-facing explanation (short, spoiler-light)
- **Finish Chapter 1 first.** Meridian's stories, the hideout and most secrets open after the Festival. Before that, help Matteo and the townsfolk around the Market.
- **`!` means someone has something for you.** Talk to them.
- **`?` means something worth a look.** Read it. Some of these quietly start a story.
- **Walk the edges.** Gold arrows lead to new districts. St. Hesper's is east of Festival Square, and the Clock Tower is beyond it.
- **Spend time at the hideout.** Talk to your friends more than once, use the workbench, and look around St. Hesper's. Old memories are waiting there.
- **Listen and read.** Some places aren't on any road until somebody gives them away. A stamp in a book, a friend's story, a promise to "show you something".
- **Check the Journal.** Stories shows what's open and how many are still hidden. Records lists what's left to find, by district.

---

## Implemented (branch `exploration-guidance`)
No unlock condition, quest prerequisite or story step changed. Only what the player sees and reads changed.

| # | Change | Where |
|---|---|---|
| 1 | **Story mark.** A brighter gold `?` (`'?*'`, colour `MK_STORY`) on anything that can start a story: the prayer book, decoration box, bakery window, Naomi's chart, the workbench and Lucas's memory spots. It shows only while that story is undiscovered and reachable. Ordinary spots keep the pale `?` | `LOOK_TRIG`, `mxTrig`, bubble drawing |
| 2 | **Workbench label:** "workbench · Agnes left something here" while her story waits | `tower.bench` |
| 3 | **Hidden-exit hints.** An overgrown gate on Ash Lane's east edge and a padlocked hatch in the Clock Tower roof, each with a short read. Both disappear once the place is found | `MX_LOOKS` `look.oldgate`, `look.hatch` (new `vis`/`draw` fields) |
| 4 | **Journal rumours.** The Stories tab shows up to 3 in-world rumours for stories not found yet. They rotate daily, and only appear after Chapter 1. Dess's rumour shows progress (n / 7). No places or givers are named | `hint` on quests, `mxStoriesList` |
| 5 | **Dess hints in person** after 4 of the 7 stories: "When everyone's had their say… I've got something to show you." | `h_dess` |
| 6 | **New Guide page, "Exploring":** `!` and `?`, gold arrows and the map, the Journal, after Chapter 1, and a no-spoiler secrets tip | `GUIDE_TABS`, `guidePage('explore')` |

**Not changed:**
- **Canals:** that's Chapter 2 work.
- **Activity spot texts:** they already say "in a later update".

**Test:** `tools/exploration_guidance_test.js` passed 15/15 on desktop and on phone.
