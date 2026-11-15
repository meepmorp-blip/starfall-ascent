# World Location Unlocks

Unlocks follow story progress, not levels. `ch1Scene()` reads the furthest Chapter 1 scene reached from `save.ch1b.k` (for example `'Scene 9#3'` → 9), or 99 once Chapter 1 is complete (`save.ch1Clears` or `save.ch1b.done`).

| Place | Condition | Then | Why |
|---|---|---|---|
| Market Ring, Festival Square, Garrison Yard, The Cloister, St. Lucia's | Always | Discovered on first visit | The original districts |
| **St. Hesper's** | Always reachable | Discovered by walking in from Festival Square's east edge | Known since the cold open; walking there is the discovery |
| **Concord Office** | Chapter 1 Scene 7 reached | Discovered by walking in (Stage 3) | The player first enters it in Scene 7 |
| **Ash Lane** | Chapter 1 Scene 10 reached | Discovered by walking in (Stage 4) | Ash Lane's story events run through Scene 10; opening it after them avoids contradicting them |
| **St. Hesper's Clock Tower** | Chapter 1 complete | Stage 5 | The tower is the party's place after Chapter 1 |
| **Drowned Canals** | Chapter 2 (not yet written) | Stays locked | Holds Chapter 2's reveal |

## Names on the map
A locked place shows "???" until the story has shown it:
- The Clock Tower's name appears from Scene 11.
- The Drowned Canals keep their name (already shown in Battle as the 12th House).

## Discovery
`save.mx.seen[district]` is set on the first visit (the same field Expansion 01 used). No new save fields.

## Status per stage
| Place | Stage | Built? |
|---|---|---|
| 5 districts | — | Yes |
| St. Hesper's | 2 | **Yes** |
| Concord Office | 3 | **Yes** (exit from The Cloister opens at Scene 7) |
| Ash Lane | 4 | **Yes** (exit from St. Lucia's opens at Scene 10) |
| Clock Tower | 5 | Not yet |
| Drowned Canals | 6 | Prepared only (story-locked) |
