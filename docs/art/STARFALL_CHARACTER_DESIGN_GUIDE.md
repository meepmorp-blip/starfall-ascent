# Character design guide

**Status: deferred.** The owner chose to do environments and layout first and character sprites later. This file records the established designs so nothing drifts when that work starts.

## Established identities (from the game, do not change)
| Character | Read at a glance | Signature |
|---|---|---|
| Kairos | Navy spiked hair, teal jacket | Chest emblem: a clock face with no hands. Twin curved silver-blue blades (the clock hands) |
| Sgt. Agnes Calder | Olive Garrison uniform, beret, auburn hair | Long rifle |
| Big Boy Bram | Very large, green helmet, beard | Round shield |
| Dr. Naomi Lark | White coat, dark hair | Writing on her forearm; dart tool |
| Theo Lark | Wild orange curls, goggles | Brass devices, turrets |
| Lucas Crane | Pale hair, sharp grey coat | Pistol |
| Sister Cassie Vire | Grey and red habit | Chained censer that drips fire |
| Dess Marr | Dark hair, lab apron, freckle under the left eye | Vice cores; a small girl of blue light |

## Three presentation levels (when this phase starts)
1. **Gameplay sprite:** small, top-down, silhouette first. Extend `drawChar` with more frames and facings before considering image sprites.
2. **Dialogue portrait:** larger anime-style bust with expressions. Candidate for generated art using the exported sprite as the reference (see `docs/tooling/STARFALL_MCP_AND_CONNECTORS.md`: image generation needs a paid key or the manual Gemini-app route).
3. **Special illustration:** full art for intros and Ultimates.

Kairos is the benchmark. No other character is redesigned until his sprite, portrait and pipeline are approved.
