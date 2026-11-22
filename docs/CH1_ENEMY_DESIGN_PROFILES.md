# Chapter 1 Enemy Design · Phase 1 profiles

**Status:** design only. No gameplay code, assets or encounters were changed. Roster approved with adjustments; see `CH1_ENEMY_ROSTER.md` §6.

**Tags:**
- **[CANON]** Lore Bible v2, Lore Updates v1.1 and v1.2.
- **[EXISTING]** in `index.html` today (values from `makeEnemy`, `VICE_INFO` and missions).
- **[PROPOSED]** new in this design.

**Placement rule (approved):** the five new Vices debut in **Rifts and Runs only**. No Chapter 1 story encounter is rewritten to add them. The one story change is #14, which reworks the existing Forgotten Memory fight and keeps its story structure. It needs your sign-off again at Phase 3.

**Shared rules for all new Vices:**
- No new elements, gauges or currencies.
- Counters use what exists: **Stagger** (100 = 2 s stun, breaks shields), Burn, Slow, Stun, Spotted, Drowsy, Wet, knockback and interrupts (`hitT`).
- Elites (Hasted, Shielded, Volatile) can apply to any non-boss.
- Drops use existing Pneuma orbs and Memories (`memDrop`).
- HP figures below are **base values** before the existing ×1.15 × level scale × tier, written the way `makeEnemy` writes them.

**Readability rule at gameplay scale:**
- **Size:** each Vice is about 7–22 px radius on a 711 × 400 field.
- **Silhouette:** each must be identifiable by its silhouette alone, and by one signature colour from the existing palette (`colorOf`). The new Vices get new, distinct colours.

---

## Low grade

### 1 · Gossip [CANON][EXISTING]
- **Grade, first fight:** low · First Fight (R1).
- **Memory:** forgotten words, names and promises (Mercury · deceit).
- **Narrative purpose:** the city's constant background noise of forgetting. It is the most common Vice, so it teaches "small and many".
- **Visual (existing):** small lime-green biter (`C.lime`) that zigzags with a snapping maw. Children are smaller (r 7).
- **Stats (existing):** HP 18, r 10, speed 108, damage 5. Children: HP 8, r 7, speed 130.
- **Attacks (existing):**
  - zigzag approach;
  - a lunge every 0.5–1.5 s;
  - splits into 2 children on death.
- **Counter:** wide swings and area effects (Kairos's arcs, Dess's pulses) catch the split.
- **System interactions:** children never chase Ward patients (balance pass).
- **Placement:** most story fights, every Rift pool, Runs.
- **Reward:** 4.5 Memories (1.5 per child).
- **Memory fragment (new text, optional):** *"I'll tell you tomorrow," she said. Tomorrow had other things to say.*

### 2 · Hothead [CANON][EXISTING]
- **Grade, first fight:** low · First Fight.
- **Memory:** forgotten anger and reckless daring (Mars).
- **Narrative purpose:** what happens when will has nowhere to go.
- **Visual (existing):** red-orange (`C.mars`) round body with a forward horn line. It flashes red before charging.
- **Stats (existing):** HP 34, r 13, speed 66, contact 8, charge 14.
- **Attacks (existing):** red flash telegraph, a straight rush, stunned if it hits a wall.
- **Counter:** sidestep and bait it into walls.
- **Placement:** story fights, Rifts, Runs.
- **Reward:** 4.5 Memories.
- **Memory fragment:** *He kicked the door so hard it never shut right again. He fixed it the next morning, and never said why.*

### 3 · Waxer [CANON][EXISTING]
- **Grade, first fight:** low · Garrison (R3).
- **Memory:** every life's last day; the Moon's burden of processing the dead (growing and waning).
- **Narrative purpose:** the Cistern Stair ("kill the healers first") makes it the Festival's warning sign.
- **Visual (existing):** cream wax figure (`C.wax`) with drips and a wick-like crown.
- **Stats (existing):** HP 28, r 11, speed 88, damage 4. Heals every 2 s and shoots every 1.2–2 s.
- **Attacks (existing):** follows wounded Vices to heal them and lobs wax.
- **Counter:** a priority target. Spotted helps focus it; Agnes reaches it at range.
- **Placement:** Garrison, Breakout, Escape, Cistern, Festival, Rifts.
- **Reward:** 4.5 Memories.
- **Memory fragment:** *The candle by the bed burned down twice that night. Somebody kept lighting it.*

### 4 · Crumbkin [PROPOSED]
- **Grade, first appearance:** low (swarm) · **Rifts:** Festival Sparks and Market Ring Waves pools; **Runs:** districts 1–3.
- **Memory [anonymous]:** someone baking bread for the people they loved: warm kitchens, flour on sleeves, somebody waiting to eat. The emotion that remains is *fond and full*, not sad. **No owner is named.** An optional later link to Bram's bread story is allowed only if that story establishes it, without new family history or any death.
- **Narrative purpose:** shows that Vices can come from *happy* memories. Defeating one should feel bittersweet, not grotesque.
- **Visual (proposed):**
  - **Silhouette:** a small, round, loaf-shaped body. A crust "cap" scored with three cuts (instantly readable), two oven-mitt nubs for hands, a cracked serving-plate base.
  - **Core:** a glowing crumb-core showing through the top score, warm amber `#F2B45A`.
  - **Palette:** crust brown `#9A6236`, flour cream `#F1E3C4`, core amber. Distinct from Waxer's cream because of the brown crust and the amber glow.
  - **Size:** r 8.
  - **Animation:** a soft bounce walk; puffs of flour when hit.
  - **Damage state:** crust cracks show at 50%.
  - **Death:** it breaks into crumbs and a brief warm glint, no gore.
- **Role:** swarm with a **unique verb, huddle**. Spawns in groups of 3–4. If 3+ Crumbkins are left alive and close for 4 s, they merge into a **Warm Loaf**.
  - **Warm Loaf:** HP = the sum of those left, r 16, speed 55. A slow body slam (0.7 s wind-up, crust glows) with a short knockback.
  - Merging is shown 1 s ahead: they glow and drift together.
- **Attacks:**
  - **Crumb scatter:** every 3–4 s, tosses 3 crumbs that land in 0.4 s and stay 2 s as small hazard dots (2 damage on touch, r 6). It never aims directly at the player.
  - **Contact:** 3 damage.
- **Counter:** clear them before they huddle. Area skills, Burn (spreads the "baked" feel) and knockback all split huddles. A merge is cancelled if any member is stunned or knocked away during the 1 s warning.
- **Why it doesn't overlap:** Gossip *splits apart* on death; Crumbkin *joins together* if ignored. Deadline grows over time *alone*; Crumbkin grows only by *merging*, and players can prevent it.
- **System interactions:**
  - Burn: +25% damage taken (crusts burn).
  - Wet: −30% speed while wet.
  - Elites: Hasted only, no Shielded (too fiddly for fodder).
- **Stats (base):** HP 10, r 8, speed 95, contact 3.
- **Reward:** 2.5 Memories each; a Warm Loaf drops 1 extra Pneuma orb.
- **Memory fragment:** *Flour first. Hands second. Then you wait somewhere warm and let it rise on its own.* (This deliberately echoes the cadence of Bram's "Gran's rule" without naming anyone.)

### 5 · Paperling [PROPOSED]
- **Grade, first appearance:** low (harasser) · **Rifts:** Garrison Yard and Institute Overload pools; **Runs:** districts 2–5.
- **Memory:** a message never sent: unposted letters, apologies folded and kept. The emotion that remains is *unfinished*.
- **Narrative purpose:** Mercury's other face (Gossip = words *lost*; Paperling = words *never said*). It foreshadows the Registry's paper world without spoiling it.
- **Visual (proposed):**
  - **Silhouette:** a fluttering diamond of folded paper (like a paper bird seen from above), with two flapping wing-sheets.
  - **Core:** a wax-seal disc in the middle, ink-blue `#3A5A9A`.
  - **Palette:** off-white paper `#E8E2D4`, ink-blue seal, faint ruled lines.
  - **Size:** r 9.
  - **Animation:** it bobs 6 px up and down while flying.
  - **Damage:** tears appear at 50%.
  - **Death:** scatters into 5 drifting scraps that fade in 0.8 s.
- **Role:** harasser with a **unique verb, misdirect**.
- **Attacks:**
  - **Paper darts:** every 2.2 s, 2 small darts in a 20° spread. Speed 220; 4 damage each. Short ivory streaks, clearly visible.
  - **Decoy fold:** every 7 s (with a 0.5 s paper-shuffle telegraph), drops a **folded decoy**: a stationary paper shape, r 9, 1 HP, lasting 4 s. Auto-aim *can* pick it, because it is a real target.
- **Rules:**
  - It reforms **once**: at 0 HP it bursts into scraps, then re-folds at 40% HP 1.5 s later. Killing it during the re-fold ends it.
  - Never more than 2 decoys at once on the field. There is no screen overlay and no aim jitter.
- **Counter:** aim matters (manual aim on desktop, facing on touch). Killing decoys is cheap, and area skills clear decoys and Paperlings together. Spotted marks the real one.
- **System interactions:**
  - Burn: double damage while burning (paper).
  - Wet: the re-fold is cancelled if Wet at 0 HP.
  - Elites: all three allowed.
- **Stats (base):** HP 16, r 9, speed 90 (keeps 140–220 px from the player), darts 4.
- **Reward:** 4.5 Memories.
- **Memory fragment:** *Dear —. I'm sorry about the —. I should have —. (Folded twice. Never sent.)*

### 6 · Collector [CANON][EXISTING]
- **Grade, first fight:** low (thief) · St. Lucia's ward, The Stacks.
- **Memory:** forgotten hope and greed: saving, wanting, fearing there will never be enough (Jupiter).
- **Narrative purpose:** at the Registry, as the glowing "Record Keepers", it literally carries records away.
- **Visual (existing):** purple-gold (`C.jupiter`), quick, carries a hoard.
- **Stats (existing):** HP 30, r 11, speed 125, damage 5. Steals every 6 s.
- **Attacks (existing):** rushes to steal Pneuma, flees, returns; the hoard drops on death ("HOARD DROPPED").
- **Counter:** chase or ranged; Slow and Drowsy stop the escape.
- **Placement:** Ward, Forgotten Memory (until #14), Stacks, Rifts.
- **Reward:** 4.5 Memories plus the returned hoard.
- **Memory fragment:** *A jar under the floorboard. Coins for a coat. Every winter, one more coin, never the coat.*

### 7 · Candlewisp [PROPOSED]
- **Grade, first appearance:** low (support) · **Rifts:** Ash Lane Blaze and St. Lucia's Ward pools (Tier II+); **Runs:** districts 3–6.
- **Memory:** someone keeping watch beside a sick bed through a long night. The emotion that remains is *steadfast, quiet*.
- **Narrative purpose:** the Moon's tender side. It pairs naturally with St. Lucia's (a hospital), without touching its story.
- **Visual (proposed):**
  - **Silhouette:** a small hovering glass lantern with a folded-blanket "cloak" trailing below. **It floats** (no shadow contact; its shadow is offset).
  - **Core:** the flame inside the glass, soft gold `#FFD38A`.
  - **Palette:** pale glass blue `#BFD8E8`, blanket grey-violet `#7A6E8E`, flame gold.
  - **Size:** r 9.
  - **Animation:** a slow sway; the flame flickers.
  - **When it shelters:** a thin gold thread links it to the ally it protects.
  - **Damage state:** the glass cracks.
  - **Death:** the flame gutters out, then a small wisp of smoke.
- **Role:** support with a **unique verb, shelter**. Waxer *heals HP*; Candlewisp *reduces damage taken*.
- **Attacks:**
  - **Watch:** links to the most-hurt ally within 160 px (gold thread; 0.6 s link telegraph). The linked ally takes **−35% damage**. One link at a time, re-chosen every 5 s.
  - **Dim when alone:** with no ally within 160 px it can't link, and it drifts toward the nearest one.
  - It never attacks the player directly; its contact damage is 0.
- **Counter:**
  - Hitting the Candlewisp **interrupts** the link for 2 s (existing `hitT`).
  - **Stun** breaks the link for its duration; killing it removes the shelter.
  - Knocking the sheltered ally more than 160 px away also breaks the link.
- **Why it doesn't overlap:** Waxer heals and lobs; Candlewisp only shelters. The two stack in Tier II+ rifts, which gives a readable "two supports, pick an order" puzzle.
- **System interactions:**
  - **Wet:** link range −40%.
  - Stagger: 60 Stagger extinguishes it for 3 s.
  - Elites: Hasted and Volatile only.
- **Stats (base):** HP 20, r 9, speed 70, contact 0.
- **Reward:** 4.5 Memories.
- **Memory fragment:** *Four o'clock. The fever broke at four. She'd counted every hour to it.*

## Mid grade

### 8 · Devourer [CANON][EXISTING]
- **Grade, first fight:** mid (ambusher) · Containment Failure (R8).
- **Memory:** deceptive desire (Venus).
- **Narrative purpose:** at the Institute, it drags you off the pylon you are guarding.
- **Visual (existing):** a closed flower bud (`C.venus`) that blooms open.
- **Stats (existing):** HP 42, r 13, speed 56, damage 6. Blooms every 2–3.5 s, with a warning.
- **Attacks (existing):** stalk, a bloom warning, then pull and drain.
- **Counter:** dodge out during the warning; an escape window always exists.
- **Placement:** Containment, Ward, Festival, Rifts.
- **Reward:** 4.5 Memories.
- **Memory fragment:** *She wanted the blue dress in the window for a whole year. She has no idea what she was going to wear it to.*

### 9 · Spotlight [CANON][EXISTING]
- **Grade, first fight:** mid (artillery) · Lights Out (R11).
- **Memory:** pride, arrogance (Sun).
- **Narrative purpose:** the Breakout's searchlights.
- **Visual (existing):** sun-gold (`C.sun`) lens body; a red aim line before the beam.
- **Stats (existing):** HP 26, r 11, speed 72, damage 12. Fires every 1–2 s.
- **Attacks (existing):** lock-on line, then a beam.
- **Counter:** step off the line.
- **Placement:** Lights Out, Rifts (Fire, Air, Waves, Sparks).
- **Reward:** 4.5 Memories.
- **Memory fragment:** *Third row, centre. He bowed for a full minute after the applause stopped.*

### 10 · Deadline [CANON][EXISTING]
- **Grade, first fight:** mid (tank) · Breakout assault (R11).
- **Memory:** "the lie that waits": Saturn, time, everything else.
- **Narrative purpose:** pressure that grows the longer you hesitate.
- **Visual (existing):** heavy, slow (`C.saturn`); grows in size.
- **Stats (existing):** HP 60, r 15, speed 46, damage 10, armour ×0.8. Grows every 10 s; slams every 1.5 s.
- **Attacks (existing):** walk you down, slam up close, grow.
- **Counter:** burst it down early; Stagger and stuns.
- **Placement:** assault, Escape, Festival, Rifts (Earth, Air).
- **Reward:** 4.5 Memories.
- **Memory fragment:** *"Next week," he said, every week, for eleven years.*

### 11 · The Last Stand [PROPOSED]
- **Grade, first appearance:** mid (guard) · **Rifts:** Garrison Yard (Earth) and Institute Overload pools, Tier II+; **Runs:** districts 4–6.
- **Memory:** someone who stayed behind so others could get away (anonymous: not a named Garrison soldier, no specific battle). The emotion that remains is *resolve, and fear held down*.
- **Narrative purpose:** honours courage without glorifying war. It fits the Mars "war-arm" office and the Garrison's world, without touching Agnes's or Bram's history.
- **Visual (proposed):**
  - **Silhouette:** a broad, squat figure behind a **large dented round shield** held forward (the shield's arc is the read at gameplay scale). Mismatched armour plates, a torn banner strip down its back, a repaired spear-haft.
  - **Core:** a dull red ember in the chest, **visible only from behind or when the shield drops**.
  - **Palette:** iron grey `#6E6A66`, rust `#8A4A2A`, banner faded blue `#4A5E7A`, ember red. Distinct from Deadline (Saturn violet) and Hothead (bright red).
  - **Size:** r 16.
  - **Animation:** a heavy, measured walk. The shield thumps the ground before a charge.
  - **Damage state:** at 50% the shield shows a crack.
  - **Death:** the shield falls last, then the figure kneels and fades.
- **Role:** guard with a **unique verb, cover**.
- **Attacks:**
  - **Hold the line:**
    - Faces the player and raises the shield: a front arc of 120°.
    - Frontal hits deal **−70%** damage.
    - Vices directly behind it (within 60 px) are covered too: shots are blocked by the shield arc.
    - It turns slowly (90° per second).
  - **Shield rush:** every 6 s, a ground thump (0.8 s telegraph, dust ring), then a 160 px rush. 12 damage and a knockback.
  - **Recovery:** after the rush, the shield is down for **1.2 s**. Its back and front both take full damage.
- **Counter:**
  - **Flank** (it turns slowly), hit it in the post-rush window, or **Stagger it**. Bram's bash and charged attacks build Stagger *through* the shield at the normal rate, and a 100 Stagger stun drops the shield for the full 2 s.
  - Spotted and Analyzed still apply through the shield.
- **Why it doesn't overlap:** Deadline is a walking threat that grows. The Shielded elite has a damage-absorbing *bubble*. The Last Stand is *directional cover for others*: the only enemy that changes where you have to stand.
- **System interactions:**
  - Rift tier scaling applies normally.
  - It may not roll the Shielded elite (no double shield); Hasted and Volatile are allowed.
- **Stats (base):** HP 55, r 16, speed 50, contact 6, rush 12.
- **Reward:** 12 Memories (elite-equivalent); a Fragment roll at the existing "elite" odds.
- **Memory fragment:** *"Go. I've got the door." He didn't have the door. He had the time it took.*

### 12 · The Humming Core *(working title)* [PROPOSED]
**Grade, first appearance:** mid (special: controller) · **Rifts:** Institute Overload pool (Tier II+) and **Runs:** district 5–6 only. It is a rare spawn: at most 1 per fight.

**Memory:** a song hummed by a woman, heard through a Vice core. **[CANON anchor, kept unresolved]**
- In the Institute scene, a core plays "a woman's voice, tired and kind". Lore v2 calls it Dess's mother's.
- **This design never names her and never confirms whose memory it is.**
- The girl of light stays unexplained.
- It must not repeat or quote the "little star" line. It hums without words, to avoid spoiling or flattening that scene.

**Narrative purpose:** shows that cores still hold *people*. It deepens the Institute's mystery (and Dess's) without solving it.

**Visual (proposed):**
- **Silhouette:** a hovering faceted core, like a small music-box cylinder turned on its side, with two thin metal "comb" fins either side.
- **Core:** the cylinder itself, turning slowly; a soft sea-glass teal `#7FE3D0` with a pulsing inner light.
- **Beat visual:** a **ring of 8 note-marks** on the floor around it lights up one by one with the beat.
- **Palette:** teal glow, brass fins `#B8925A`, deep-night outline.
- **Size:** r 14.
- **Damage state:** the hum pitch-bends; the ring flickers.
- **Death:** the cylinder stops turning, the last note lingers 1 s, then silence.

**Role:** controller with a **unique verb, rhythm**.

**Attacks:**
- **Lullaby:** a 4-beat bar, 0.75 s per beat, shown on the floor ring.
  - On beats 1–3 the ring is *calm*: nearby Vices (within 180 px) move 25% slower and do not attack.
  - **Beat 4 is the "swell":** a wave of the hum expands from the core to 140 px. It deals 8 damage, and the next 2 bars speed up 25%.
  - The swell is always telegraphed by the ring flashing gold on beat 3.
- **Turning:** after 4 bars, the song "turns". The calm effect ends for 3 s (all nearby Vices act normally and speed up 15%), then the lullaby resumes.
- It never chases. It drifts toward the arena centre at speed 30.

**Counter:**
- Stand outside 140 px on beat 4, or dodge through the swell (perfect-dodge timing works, using the existing system).
- Killing it during a *calm* phase is the reward for reading the rhythm.
- Hits on beat 3 **delay** the swell by one beat (an interrupt that teaches the timing).

**System interactions:**
- Drowsy (Riptide) and Slow lengthen its beats (an easier rhythm).
- Stun skips one swell.
- Elites: none (a special enemy).

**Stats (base):** HP 40, r 14, speed 30, swell 8.

**Reward:** 12 Memories; drops 2 Pneuma orbs.

**Memory fragment:** *(no words, just the hum: four notes, the last one held a little too long, like someone not ready to stop.)*

## Story mini-bosses and boss

### 13 · Champion · Trial of Mars [EXISTING][kept as optional]
- **Grade, first appearance:** optional mini-boss · Battle → Trials, and now the **trial roster** in the Garrison Yard (World Update).
- **Memory [proposed text]:** a duel someone refused to lose, long after the reason was forgotten.
- **Narrative purpose:** the Trial of Mars as a test of will. It makes the Yard's roster meaningful.
- **Visual (existing):** a large Mars-coloured champion (r 22).
- **Stats (existing):** HP 1000, speed 92, damage 13, charge 22. Recovers if you stop hitting it.
- **Attacks (existing):** must be destroyed within 60 s; it recovers if left alone, so you have to keep hitting it.
- **Counter:** sustained pressure, Burn and Stagger.
- **Change proposed:** none to mechanics. Add a Bestiary or Records line only (see §Fragments).
- **Reward (existing):** 30 Memories, a Fragment (trial odds), best time and stars.
- **Memory fragment:** *Again. Again. Again. Nobody remembered who'd won the first time.*

### 14 · The Memory That Carried Him [PROPOSED rework of the existing "Forgotten Memory" encounter]
**What stays (encounter structure) [EXISTING][CANON]:**
- **Setting:** St. Hesper's roof, solo as Lucas, recommended level 2. The brief stays "A Vice that carries pieces of you…".
- **Three remembered moments,** with the exact existing lines:
  1. "Bread, still warm…"
  2. "Someone counting to sixty under a blanket…"
  3. "Smoke. A hand that won't let go."
- **Each moment:** a 0.9 s time-stutter and +10% attack (stacking to 3), as today.
- **Story position:** unchanged in R9, between the old wing and the fire.

**What changes:**
- The generic Collector is replaced by **one named Vice**. Phases follow **its HP** (75 / 50 / 25%) instead of "every 3 kills".
- The small Gossips become **"loose words" it sheds**. They are optional and don't gate progress.
- This removes the "kill-count stand-in" compromise noted in the Chapter 1 tracker.

**Memory [CANON v1.2]:** the Vice carries Lucas's own taken childhood: the orphanage years erased when he was "discharged to the household of A. Crane".

**Narrative purpose:** the only boss in Chapter 1 that is *one person's* memory and fights back as that person's past. Lucas literally takes himself back.

**Visual (proposed; must not read as "big Collector"):**
- **Silhouette:**
  - A tall, thin, stooped shape **wearing an orphanage blanket like a hooded cloak**, much taller than a child.
  - Its arms are **too long, holding things close**.
  - Its outline is broken by **objects caught in the blanket's folds**, all from canon:
    - a small silver cup;
    - three glass marbles;
    - a folded intake page;
    - a heel of bread.
  - **No Collector purple and no coins.**
- **Core:** the **silver cup**, held to its chest. It glows a warm silver-white `#E8EEF5`, the only bright colour on it.
- **Palette:** dormitory-blanket grey-brown `#6A5A4A`, soot black, ash cream. Each memory object glints in its own colour (bread gold, marble blue, paper cream).
- **Size:** r 24 (a boss presence), drawn at 1.4× height.
- **Animation:**
  - It **sways like someone rocking a child**.
  - When hit it pulls the objects tighter.
- **Losing a phase:** the matching object **falls from the cloak and lands on the roof** (bread, then the blanket corner with the counting tally, then the cup at death), and Lucas's memory line plays.
- **Damage state:** the cloak thins and tears with each phase.

**Attacks (memory-based):**
- **Phase 1, Bread (100–75%): "Breakfast table".**
  - Slides warm "plates" across the roof in straight lanes. 3 lanes, 0.6 s red-gold lane telegraph, 8 damage each.
  - Sheds 2 loose words (Gossip-like, HP 8) every 8 s.
- **Phase 2, Counting (75–50%): "Sixty".**
  - It **counts aloud**: a 6-second ring of numbers around the arena. On each 10th count, a ring pulse expands from the cloak (dodgeable, 10 damage).
  - It **hides** (a cloak curl, taking −50% damage) between pulses 1–2, then uncurls, open to hits.
  - This echoes hide-and-seek without stating who counted.
- **Phase 3, Smoke (50–25%): "A hand that won't let go".**
  - Grey smoke patches drift slowly across the roof: Slow and 4 damage per second inside, telegraphed by a 0.8 s haze.
  - A **"hand" grab:** a 1.0 s wind-up arm reach. If it connects, it holds Lucas for 1 s (6 damage). Dodge or interrupt it with a hit during the wind-up.
- **Final (25–0%):**
  - All three patterns at a slower cadence.
  - At 0 HP: no explosion. The cloak settles, the cup rolls to Lucas, and there is the existing hand-off to the fire scene.
  - **Not a "kill" but a "take back".** The banner is "Remembering · 3" as now, and the defeat line is "Remembered."

**Counter:**
- **Range:** the existing brief says "Stay at range". Lucas's shards and charged pierce suit this.
- **Interrupts:** in phase 3, hits break the grab wind-up.
- **Stagger:** 100 opens the curl in phase 2.
- **Drowsy and Slow** are effective.

**Difficulty:** solo, level 2, so tuned *low*. Total HP is about 3× a level-2 Deadline. Every attack has a telegraph of 0.6 s or more. No off-screen attacks. On phones, the lane telegraphs use the existing red-line style.

**Reward (existing):** unchanged. It is a story fight; no new drop.

**Memory fragment (Journal, after the scene):** *A cup with a dent in the rim, the shape of a small thumb pressed there every morning.*

**Must not:**
- reveal the cloaked man;
- explain how the memories were taken (Chapter 2);
- add any new family history for Lucas.

### 15 · Horaios, Kosmokrator of the Moon [CANON][EXISTING]
- **Grade, first fight:** boss · Intake Window 1 (R16) and Battle.
- **Identity [CANON]:** the Moon's gatekeeper and clerk, who processes the dead at the Gate. He is administrative, solemn and procedural, not a demon king.
- **Narrative purpose:** the chapter's climax. The party is "stamped, processed, grey"; only Kairos moves inside the stopped minute.
- **Visual (existing):** a lunar clerk presence (`drawBoss`): stamps, paper, filing.
- **Stats (existing):** HP 3,500 / 7,000 / 12,000 (Normal / Hard / Nightmare) × level scale.
- **Phases (existing):**
  - **I · Intake:** stamps and pages.
  - **II · Paperwork Storm:** spirals and filing walls. Filing Shields from phase 2 cut damage 80%; Stagger hits break them 3× faster.
  - **III · Registry Rewrite:** the big stamp, swapping your character, the queue.
  - **IV (Nightmare) · Intake Window Closed:** the Moon Gate pulls you in.
  - He enrages at 2 minutes in Hard and Nightmare. "Order overruled" skips a pattern.
- **Change proposed:** **none.** Profile and fragment text only.
- **Story constraints:** the fight must still lead into the grey-stamping, the Gate and Lucas being taken. Don't resolve the larger mystery.
- **Memory fragment (Records):** *Form 1, Window 1. Name. Sign. Hour. Remainder: retained.*

---

## Fragments and Bestiary approach (no new system)
**Where fragments go:** in the **Guide → Vices** page (existing `VICE_INFO`) as one extra line per Vice, unlocked after the first defeat. This is tracked with the existing `run.seen` and saved via the claims key `vice:<id>`. No new menu.

**Story mini-bosses:** #14's fragment is a **Journal Record** (existing Records list), added when the scene ends.

## Summary table
| # | Enemy | Status | Unique verb | Debut |
|---|---|---|---|---|
| 1 | Gossip | existing | split | story |
| 2 | Hothead | existing | rush | story |
| 3 | Waxer | existing | heal | story |
| 4 | Crumbkin | proposed | huddle (merge if ignored) | Rifts and Runs |
| 5 | Paperling | proposed | misdirect (decoys, re-fold once) | Rifts and Runs |
| 6 | Collector | existing | steal | story |
| 7 | Candlewisp | proposed | shelter (−35% damage link) | Rifts and Runs |
| 8 | Devourer | existing | pull | story |
| 9 | Spotlight | existing | beam | story |
| 10 | Deadline | existing | grow | story |
| 11 | The Last Stand | proposed | cover (directional shield for allies) | Rifts and Runs (Tier II+) |
| 12 | The Humming Core | proposed | rhythm (calm, then swell) | Rifts and Runs (rare) |
| 13 | Champion | existing | endure | Trial of Mars |
| 14 | The Memory That Carried Him | proposed rework | take back (phase objects) | Forgotten Memory (R9) |
| 15 | Horaios | existing | process | Intake Window 1 |

## Canon risks to watch
- **#12:** never name the woman, never use the "little star" line, keep the girl of light unexplained.
- **#4:** no owner named, no death, no new Bram family history.
- **#14:** stays inside canon v1.2 (the archive, St. Hesper's, the fire, the Crane discharge). Only one story fight changes, and only its mechanics.
- **#11:** anonymous; no Garrison names or specific battles.

## Approval needed for Phase 2 (visual references)
1. The five new designs (silhouettes, palettes, cores) as written.
2. The #14 rework approach: HP phases replacing kill-count phases, with the same three lines and beats.
3. The fragments in the Guide's Vices page plus one Journal Record (no new Bestiary menu).
