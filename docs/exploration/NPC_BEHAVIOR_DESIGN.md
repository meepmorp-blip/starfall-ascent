# NPC Behaviour and Murmurs

## Movement
Townsfolk follow a **route**: a short list of points (as fractions of the district) with a pause at each, walked in a loop. There is no pathfinding search; routes are drawn by hand to go around solids. A small push-out keeps an NPC off any solid if one ever drifts.

| Pattern | Who | Behaviour |
|---|---|---|
| Stays | Fish vendor, Lantern seller, Matteo, the patient, the woman on the bench | Stays at their place and turns to look around now and then. |
| Strolls | Rosa (Market), Woman with a basket (Square), Sister at the gate (Cloister) | Walks between two or three places with long pauses. Rosa stops beside Matteo to chat. |
| Patrols | Garrison soldier | Walks the yard's east side and back, pausing at each end. |
| Plays | Tessa | Wanders between three points close to her mother's stall. |
| Busy | Ward nurse | Walks between the beds. |

Party characters (Agnes, Bram, Naomi, Theo) keep their spots.

**Rules**
- Walking speed: 22 to 34 units a second, slower than the player.
- An NPC stops when the player comes within about 40 units, faces the player, and stays put while they talk. It resumes afterwards.
- NPCs do not block the player; they have no collision with the player.
- Quest lines, bubbles and talk work the same whether the NPC is walking or standing.

## Murmurs
When you talk to an **ordinary** townsperson on the map (their line is small talk, not a quest step), they make one short, wordless voice sound as the dialogue opens: a hum, a little "oh", an "mm-hm", a curious rising "hm?".
- **Never** for story scenes, quest steps (Matteo's glasses, the roster, the lantern, rounds), records, chests, or party characters.
- **Synthesized**, in the game's existing Web Audio style: a voiced source through two vowel formants with a pitch contour. Each speaker has a voice (child, woman, man, older man, and so on); four patterns are picked at random, never the same one twice in a row.
- Routed through the existing sound effects bus, so the Sound effects slider and mute apply. Quiet by design.

**Limitation:** a synthesized murmur is an approximation. For real character in the voices, record 3 to 4 short nonverbal takes per voice type (child, young woman, woman, man, older man, older woman). Use OGG or M4A, 0.2 to 0.6 seconds, peak at -6 dB. Store them in `audio/voice/<type>_<n>.m4a`. `mxMurmur()` is the single place to switch to playing files.

## Expansion 05 changes
- Routed townsfolk **start on their route** (fixes the Sister standing beside the hidden sundial chest).
- Each NPC gets its own walking speed (±15%) and varied pauses (70 to 130% of the route value).
- While pausing they turn now and then, as if looking around the stall or the square.
- Tessa's play area moved a little west, so her name no longer collides with the "Festival Square" exit label.
- Murmurs were reviewed and left as they are: volume, slider and mute, variation, and the rule that only small talk murmurs.
