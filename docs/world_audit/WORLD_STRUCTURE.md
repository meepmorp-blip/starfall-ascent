# World Structure

## How the world is reached today
There is **no world map or regional navigation**. Places are reached in three separate ways:

1. **Meridian (exploration):** the five districts are joined by walk-off exits at the screen edges. The Meridian menu shows a 3×3 grid of them, and "Continue" resumes in the last district.
2. **Story (Chapter 1):** `CH1_SEQ` moves through cutscenes and missions in a fixed order. Locations are entered by the script, never by the player.
3. **Battle menu:** Rifts, Trials, Horaios and Climb (a run of six Houses with Blessings between them) are picked from lists. Each stage is an isolated single screen.

## Diagram

```
MERIDIAN · exploration hub (walk-off exits, fade transitions)

                      [The Cloister]  chapel
                            │ N
 [Garrison Yard] ──W── [MARKET RING] ──E── [Festival Square]
     yard                   │ S                 plaza
                      [St. Lucia's]  hospital

MERIDIAN · story-only places (reached only through Chapter 1, in order)
  Meridian skyline (cold open) ─► St. Hesper's Orphanage (cold open, Scene 9)
  Market Ring (1–4) ─► Ash Lane street (5) ─► St. Lucia's (6) ─► Concord Office (7)
  ─► Institute sub-level (8, breakout) ─► St. Hesper's (9) ─► Ash Lane rooftops / lodging house (10)
  ─► St. Hesper's clock tower (11) ─► Festival Square (12) ─► The Stacks (13) ─► Registry Hall (14)
  ─► [Moon Gate] ─► [The Archive: Chapter 2, not built]

BATTLE MENU · isolated stages (no walking between them)
  Houses:  1 Garrison Yard · 3 Market Ring · 5 Festival Square · 7 The Cloister · 10 Concord Office · 12 Drowned Canals
  Rifts:   Ash Lane rooftops · St. Lucia's · Institute · Garrison Yard · Market Ring · Clocktower roofs · Festival Square
  Trials:  Mercury (Clocktower roofs) · Mars (Garrison Arena)
  Boss:    Registry Hall (Horaios, weekly)
  Other:   Vice Gallery (Night Market = Market Ring paint) · Training (Garrison Yard)

OUTSIDE MERIDIAN (lore only)
  The Wall ─ Aster beyond (unmapped 80 years) · Moon Gate ─ The Archive (Ch2)
```

## Inside Meridian or outside?
- **All 15 implemented environments are inside Meridian**, including the Drowned Canals, which the Lore Bible lists as a Meridian district.
- **Nothing outside the city exists yet.** The Archive (reached through the Moon Gate) is the first place beyond it, and it belongs to Chapter 2.

## Shared environments
One theme can serve several purposes:

| Theme | Explore | Story | Battle |
|---|---|---|---|
| `market` | Market Ring | Scenes 1–4 | House 3, Market Ring Waves, Night Market |
| `plaza` | Festival Square | Scene 12 | House 5, Festival Sparks |
| `yard` | Garrison Yard | Training | House 1, Garrison Yard rift |
| `chapel` | The Cloister | — | House 7 |
| `hospital` | St. Lucia's | Scene 6 | St. Lucia's Ward rift |
| `office` | — | Scenes 7, 13 | House 10 |
| `lab` | — | Scene 8, breakout | Institute Overload |
| `rooftop` | — | Scene 10 | Ash Lane Blaze |
| `roof` | — | Scene 11 | Trial of Mercury, Clocktower Drills |
| `lobby` | — | Scene 14 | Horaios |
| `street` | — | Scenes 5, 10 | — |
| `orphanage` | — | Cold open, Scene 9 | — |
| `pier` | — | — | House 12 |
| `ring` | — | — | Trial of Mars |

**Isolated environments**, with no way to move to a neighbour, are every Battle stage and every story location. Only the five Meridian districts connect to anything.
