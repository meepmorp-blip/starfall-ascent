# Meridian Exploration · Audit

Audit of `index.html` (about 7,700 lines, one file, Canvas 2D), done before Gameplay Expansion 01.

## What already exists

| Area | What is there | Where |
|---|---|---|
| Maps | 14 painted themes: `market` (Market Ring), `plaza` (Festival Square), `yard` (Garrison / Vigil Yard), `chapel` (The Cloister), `hospital` (St. Lucia's), `office` (Concord Offices), `lobby` (Registry Hall), `lab` (Institute), `pier`, `ring`, `street`, `rooftop`, `roof`, `orphanage` | `paintTheme()`, `ATMO` |
| Map model | Each map is **one screen** (800×400 world units). The background is painted once and cached (`ensureBG`). The floor is open; buildings are painted along the top edge. | `render()`, `ensureBG()` |
| Movement and collision | WASD or left-thumb joystick. The player is clamped to the arena bounds `AX0..AX1`, `AY0..AY1`. Missions add circle and box `solids` (`collideSolids`). | `updatePlayer()`, `collideSolids()` |
| Map transitions | **None.** Rooms change only through `enterRoom()` between fights or story steps, behind a banner. | `enterRoom()` |
| NPC interaction | The **walk scene** (`type:'walk'`): NPCs with `lines`, `again`, `wait`, `after`, `need`, `puzzle`, `solved`, `on`, `flag`, `bond`, `hide`, `spot` (look-at points). Nearest NPC within 50 px shows a gold ring and a "Press F / Tap ⚔ to talk" pill. Bubbles show `!` (needed) or `…`. | `initExtra()`, `missionExtra()`, `drawExtra()` |
| Dialogue | `showDialog(lines)` with speaker table `SPK`, portraits for party characters, narration (`n`) and thought (`th`) lines, Skip button, flag-aware lines (`flagLines`). | `showDialog()`, `SPK` |
| Puzzles | `showPuzzle()`: multiple-choice rounds, hints after two misses. | `showPuzzle()` |
| Quests | **None as a system.** Chapter 1 has per-scene goals (`m.goals`) and story flags (`sq.flags`), but nothing persistent or optional. | `CH1_SEQ`, `cutFlags()` |
| Interactive objects | `spot` NPCs (gold diamond, `?` bubble), the market chalkboard (drawn only). | `drawExtra()` |
| Shops and inventory | **None.** Stardust is the only currency; Star Fragments are the only items. | `save.dust`, `save.frags` |
| Activity menus | Home menu: Story, Battle (Rifts, Horaios, Trials, Climb), Builds, Training, Guide. Battle has its own party select and stage list. | `goHome()`, `showPartySelect()`, `showBattleMenu()` |
| Progression | Memories (XP), levels 1 to 20, milestones, Mastery, Bonds, Star Fragments, Stardust. | `giveXp()`, `bondUp()`, `gainFrag()` |
| Saving | One localStorage key `starfall-ascent-save` (`save` object, `persist()`), with corrupt-save backup and a Backup/Restore panel. Chapter 1 progress lives in `save.ch1b` (scene, roster, flags). Preferences in a separate key. | `loadSave()`, `persist()` |
| Offline | Service worker `sw.js` caches the page; manifest for Home Screen install. | `sw.js` |

## What can be reused for exploration
- **The walk scene engine** almost entirely: NPC placement, nearest-NPC detection, talk input on desktop and touch, dialogue, puzzles, look-at spots, the objective bar at the top.
- **The painted district themes** as the districts themselves. No new art is needed for the first milestone.
- **`enterRoom()`** for changing district inside one run (music, banner and background follow the theme automatically).
- **`save` and `persist()`** for exploration state, in a new `save.mx` branch.
- **`gainFrag()`, `save.dust`** for rewards. **`save.ch1b.roster`** to tell which characters the player has already met in Chapter 1.
- **The menu card styles** (`.ss`, `.tm-menu`, `.form`) for the Meridian menu and Journal.

## What needs improvement
- Walk scenes end as soon as every `need` NPC is done. A hub must never end on its own.
- NPC `done` state lasts only for the scene. A hub needs talk state that survives between visits.
- Bubbles only know "needed" or "not needed". A hub needs "has a quest step", "has something new to say", and "nothing new".
- There is no way back to a place you have already visited outside the story.

## What is genuinely missing
1. Connected districts with exits and arrival points.
2. A persistent, optional quest system (title, description, objective, progress, rewards, main or optional).
3. A discovery system (readable lore, hidden objects, small finds) with a record the player can reread.
4. A Journal and a Meridian map screen.
5. Named slots for the five future activities.

## Technical risks
| Risk | Mitigation |
|---|---|
| Changing the walk engine could break Chapter 1 walk scenes (market, ward, queue, longway, tower, fest). | Every change is gated on `M.hub`. Chapter 1 walk scenes take the exact old code path. Re-test Tuesday Errands after the change. |
| Spoiling Chapter 2 (the Mercy causes forgetting). | Exploration writing follows the Lore v1.1 reveal schedule: clues only, never stated. |
| Story continuity: after Chapter 1 the city is hunting Kairos. | Exploration is set in **Meridian before the Festival**, the same week as Chapter 1's town scenes. Party characters only appear once the player has met them in Chapter 1. |
| Save compatibility. | New state lives in `save.mx`, created on demand. Nothing existing is renamed or reset. Old saves load unchanged. |
| One-screen maps feel small. | Five districts linked by edge exits make one connected walk; each screen gets 3 to 6 things to do. |
| Mobile: small exit targets, talk button. | Exits are wide edge zones you walk into (no tapping). Talk reuses the existing ⚔ / TALK button. |

## Recommended order
1. Hub mode on the walk engine (gated), district registry, exits and transitions.
2. Persistent NPC talk state and contextual lines.
3. Quest system and five starter quests.
4. Discoveries and the Records list.
5. Meridian menu with map and Journal; home menu entry.
6. Activity slots in the world (signposted, not built).
7. Playtest: movement, exits, talk, quests, saves, phone, and a Chapter 1 regression check.
