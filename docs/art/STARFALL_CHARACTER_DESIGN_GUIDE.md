# Character design guide

**Status: deferred.** The owner chose to do environments and layout first and character sprites later. This file records the established designs so nothing drifts when that work starts.

## Established identities (from the game, do not change)
| Character | Read at a glance | Signature |
|---|---|---|
| Kairos | Messy dark navy hair, warm brown skin, dark navy jacket with rolled cream sleeves and an open cream shirt with a violet panel, starry violet scarf (long tail down his back with a gold ring sigil), brown belt with a small gold clock medallion and blue tassel, navy and cream tabard panels, fingerless gloves, brown boots with navy bands (redesigned 15 Nov 2026 from the owner's reference). Front, back and side views | Twin water blades shaped like clock hands (hidden in ordinary scenes) |
| Sgt. Agnes Calder | Black bob with a side fringe, navy scarf and tattered navy half-cape, black strapped tactical gear, navy tabard and armband with a pale arrow sigil, knee pads, dark boots, gold Garrison pin (redesigned 15 Nov 2026 from the owner's reference) | Long dark rifle |
| Big Boy Bram | Very large and round; messy brown hair, rust-orange scarf, dark strapped leather coat, orange-over-steel shoulder plates, belt with pouches, torn rust cloth, knee plates, steel-toed boots (redesigned 15 Nov 2026 from the owner's reference) | Oval steel shield with a rust-orange boss |
| Dr. Naomi Lark | Wavy dark-green bob with an ivory bow, forest-green hooded capelet with gold trim, a white cross and a gold brooch, ivory dress with green side panels, brown belt with vials, brown medical satchel with a cross, brown gloves, dark tights, buckled brown boots (redesigned 15 Nov 2026 from the owner's reference). Front, back and side views | Dart syringe (hidden in ordinary scenes) |
| Theo Lark | Wild orange curls, goggles | Brass devices, turrets |
| Lucas Crane | Pale hair, sharp grey coat | Pistol |
| Sister Cassie Vire | Grey and red habit | Chained censer that drips fire |
| Dess Marr | Dark hair, lab apron, freckle under the left eye | Vice cores; a small girl of blue light |

## Three presentation levels (when this phase starts)
1. **Gameplay sprite:** small, top-down, silhouette first. Extend `drawChar` with more frames and facings before considering image sprites.
2. **Dialogue portrait:** larger anime-style bust with expressions. Candidate for generated art using the exported sprite as the reference (see `docs/tooling/STARFALL_MCP_AND_CONNECTORS.md`: image generation needs a paid key or the manual Gemini-app route).
3. **Special illustration:** full art for intros and Ultimates.

Kairos is the benchmark. No other character is redesigned until his sprite, portrait and pipeline are approved.
