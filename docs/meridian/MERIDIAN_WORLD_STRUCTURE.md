# Meridian · World Structure (Milestone 01)

## Setting and continuity
- **When:** Meridian in the ordinary days before the Festival of the Mercy, the same week as Chapter 1's town scenes (Tuesday Errands, Ward Rounds, The Queue). Nothing here happens after the Festival.
- **Who:** Kairos walks the city. Party characters appear in their usual places **only after the player has met them in Chapter 1** (read from `save.ch1b.roster` or a Chapter 1 clear).
- **The Mercy:** follows the Lore v1.1 schedule. Exploration may show clues (people who drink every Sunday are vague; people who don't are sharp) but never says the water causes forgetting.
- **Canon used:** Meridian is the last free city on Aster; past the Wall nothing has been mapped in 80 years; Vices fall every night and the Garrison's rooftop guns stop most of them; the fountain rose from the stones of Festival Square twenty years ago and the Concord Church calls its water the Mercy.

## Districts (all existing painted maps)

```
                 [ The Cloister ]           (Concord Church grounds, theme: chapel)
                        |
 [ Garrison Yard ] — [ Market Ring ] — [ Festival Square ]
                        |
                 [ St. Lucia's ]            (front hall, theme: hospital)
```

| District | Theme | Exits | Character | Activity slot (future) |
|---|---|---|---|---|
| **Market Ring** (start) | `market` | W Garrison Yard · E Festival Square · N The Cloister · S St. Lucia's | The everyday heart: stalls, Matteo, Rosa, the fish vendor, the chalkboard. | **Weekly World Boss**: the Garrison bounty board |
| **Festival Square** | `plaza` | W Market Ring | The fountain of the Mercy and festival preparations. | **Astral Rifts**: a rift scar in the paving |
| **Garrison Yard** | `yard` | E Market Ring | Barracks, drills, the rooftop gun roster. Agnes and Bram. | **Constellation Trials**: the trial roster |
| **The Cloister** | `chapel` | S Market Ring | Concord Church grounds: vespers, silver cups, the hymn board. | **Memory Expeditions**: a quiet alcove |
| **St. Lucia's** | `hospital` | N Market Ring | The front hall of the hospital. Naomi and Theo. | (none yet) |

**Exits** are wide zones along a screen edge, marked by a soft gold arrow and the name of the place beyond. You walk into one to cross, with a short fade. You arrive at the matching exit on the other side, a few steps in, facing into the district.

**Why these five:** they all appear in Chapter 1 (Market Ring, Festival Square, Garrison Yard, St. Lucia's, The Cloister) and already have painted maps. Concord Offices, Ash Lane, St. Hesper's and the Institute are left for later milestones; St. Hesper's and the Institute are story-sensitive.

## What lives where

| District | People | Discoveries (Records) | Quests |
|---|---|---|---|
| Market Ring | Old Matteo, Rosa, Fish vendor, Tessa | Chalkboard, Fountain plaque of the Ring, A coin under the stall (hidden) | Starts *Know the Streets*, *Matteo's Glasses*; ends *The Duty Roster* |
| Festival Square | Lantern seller, Festival mother | The Mercy fountain plaque, Festival poster, Rift scar | *Matteo's Glasses* (glasses found here), *Lanterns for Vespers* starts |
| Garrison Yard | Garrison soldier, Agnes, Bram | Starfall tally board, The map of Aster (hidden) | *The Duty Roster* starts |
| The Cloister | Sister at the gate, Woman in the line | Hymn board, The shelf of silver cups, Memory alcove | *Lanterns for Vespers* ends |
| St. Lucia's | Naomi, Theo, a patient | The intake ledger, A child's drawing | *Rounds* (ask three people their birthday, Naomi) |

## State saved (`save.mx`)
```
mx = {
  v: 1,
  at: 'market',                 // last district, to resume there
  seen: { market: 1, ... },     // districts visited
  talk: { 'market.matteo': 2 }, // times talked, per NPC
  found: { 'plaza.plaque': 1 }, // discoveries
  q: { glasses: { s: 'active'|'done', n: 0, step: 'find' } },
  items: { glasses: 1 }         // quest items carried
}
```
