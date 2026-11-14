# Sprite and animation plan

**Status: deferred until the environment phases are approved.**

## Today
- Characters are drawn by `drawChar(ctx, id, x, y, opts)`. Options include `face`, `moving`, `t` (time), `fall`, `hurt`, `glow`, `unarmed`, `scale`.
- Movement is a procedural bob and leg swing. Attacks are shown mostly by effects (swings, trails), not by body poses.
- `tools/sprites.js` exports the current look as sheets (8-frame walk, 4-frame idle) for reference.

## Target, per character
| Animation | Frames | Notes |
|---|---|---|
| Idle | 4 | Breathing, cloth or hair movement |
| Walk | 8 | Needs up / down / side facings; today there is one facing, mirrored |
| Basic attack | 3–5 per combo hit | Body commits to the swing |
| Charged attack | wind-up + release | Readable anticipation |
| Sun / Moon cast | 4 each | Distinct silhouettes per skill |
| Ultimate | 6–8 | Plus a special illustration |
| Hurt, defeat, switch-in | 2, 6, 4 | — |

## Approach
1. Add facings and pose frames to `drawChar` in code first (keeps the game one file, offline, and consistent).
2. Only if code-drawn frames can't reach the quality bar: move a character to image sprite sheets, embedded as data URIs, processed with `tools/assets.py`.
3. Kairos first, reviewed with `tools/sprites.js` GIF previews, then the other seven.
