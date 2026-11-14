# Asset pipeline

## How art works in the game today
There are **no image assets** besides the three app icons in `icons/`. Everything is drawn at runtime on a canvas, in `index.html`:

| Art | Drawn by |
|---|---|
| Playable characters and party NPCs | `drawChar(ctx, id, x, y, opts)` |
| Townsfolk | `drawNPC(...)` |
| Vices and bosses | `drawEnemyBody(e)`, boss drawing code |
| District maps | `paintTheme(ctx, theme)` (yard, market, plaza, chapel, office, pier, roof, ring, lobby, hospital, lab, street, rooftop, orphanage) |
| Cutscene backgrounds | `cutBg(key)` |
| Effects | particles, rings, telegraphs, drawn per frame |

The world is rendered into a low-resolution buffer and scaled up with hard pixels, which gives the pixel-art look.

## Two ways to improve visuals
1. **Code-drawn art (default).** Edit the drawing functions. Free, instant, offline, consistent. Use `tools/shots.js` and `tools/compare.py` to review.
2. **Image assets (when needed).** For splash art, portraits or key art:
   - Produce the PNG (generated or hand-made).
   - Process it with `tools/assets.py`: `key` (transparent background), `pal` (palette), `scale` (crisp resize), `trim`.
   - Embed it in `index.html` as a data URI (`assets.py b64`) so the game stays a single file and still works offline, or add the file to the service worker's cache list.

## Commands (run inside `starfall_ascent/tools/`)

Export sprite sheets from the game's own art (96 px frames):

```bash
node sprites.js 96
```

Animated preview of a sheet (10 fps, 3× size):

```bash
python assets.py gif out/sprites/kairos_walk.png 96 out/sprites/kairos_walk.gif 10 3
```

Cut a sheet into frames:

```bash
python assets.py slice out/sprites/bram_idle.png 96
```

Reduce to a 16-colour palette:

```bash
python assets.py pal in.png out.png 16
```

Crisp 4× enlarge:

```bash
python assets.py scale in.png out.png 4
```

Make a flat background colour transparent:

```bash
python assets.py key in.png out.png #ff00ff 12
```

Print a data URI for embedding:

```bash
python assets.py b64 out.png
```

All output goes to `tools/out/`, which is not committed.
