# Meridian · Gameplay Roadmap

## Milestone 01 · Exploration foundation (this milestone)
- Hub mode on the existing walk engine, five connected districts, exits with a fade.
- Persistent NPC talk state, `!` / `…` bubbles that mean something, lines that change with progress and with Chapter 1 progress.
- Quest system: main or optional, objective, progress, rewards, saved.
- Discoveries: readable, hidden, and small finds, kept in the Journal's Records.
- Meridian menu (map of visited districts, Journal) and a home menu entry.
- Activity slots placed in the world and listed in `MX_ACTIVITIES`.

## The five activities and where they plug in
| Activity | District and object | Today | Integration point |
|---|---|---|---|
| Astral Rifts | Festival Square, the rift scar | Rifts exist in Battle. The scar explains this and points there. | `MX_ACTIVITIES.rifts.open()` → `showPartySelect('battle')` later, with a return to the Square |
| Weekly World Bosses | Market Ring, the bounty board | Not built. The board says the Garrison posts bounties "from next week". | New `ROOMS.wboss_*`, a weekly seed from the date, `save.mx.wboss` for claimed rewards |
| Constellation Trials | Garrison Yard, the trial roster | Trials of Mercury and Mars exist in Battle. The roster points there. | `MX_ACTIVITIES.trials.open()` → trial list; later a ladder in `save.mx.trials` |
| Memory Expeditions | The Cloister, the quiet alcove | Not built. The alcove is a discovery that hints at it. | Character-focused walk or fight missions via `addMission()`, unlocked by Bond level |
| Meridian Exploration | Everywhere | This milestone. | `MX_DISTRICTS`, `MX_QUESTS`, `MX_FINDS` |

## Milestone 02 · Living city (recommended next)
1. **Time of day**: morning and evening versions of each district (the themes already have day and night palettes), with NPC schedules.
2. **Two more districts**: Concord Offices (theme `office`, ties to The Queue) and Ash Lane (theme `street`, evening only).
3. **Repeatable dailies**: three small requests a day from a pool (deliveries, look-for, ask-around), rewarding Stardust.
4. **Rift scar opens**: start an Astral Rift from Festival Square and return there afterwards.
5. **Shop**: the fish vendor and baker sell small consumables for Battle, using Stardust (needs a small inventory in `save.mx.items`).

## Milestone 03 · Activities
- Weekly World Boss (one boss, weekly seed, three reward tiers).
- Constellation Trials ladder (one trial per sign, unlocked in order).
- First Memory Expedition (Agnes or Bram, Bond 3).

## Rules for adding content
- New district: add to `MX_DISTRICTS` with `theme`, `exits`, `npcs`, `finds`. Exits must be two-way.
- New quest: add to `MX_QUESTS` with `title`, `desc`, `kind` (`main`/`optional`), `steps`, `reward`. Steps are checked with `mxStep()`; never reference story flags that Chapter 1 does not set.
- New discovery: add to `MX_FINDS` with `at`, `x`, `y`, `title`, `text`, optional `hidden`, `reward`.
- Writing: Chapter 1 continuity, Lore v1.1 reveal schedule, no Demiurge.
