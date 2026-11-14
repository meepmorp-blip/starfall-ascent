# Visual testing setup

## What it does
`tools/shots.js` starts a local server, opens the real game in a headless Chromium, mutes the audio, drives it to each key screen through the game's test hooks, and saves a PNG for three device sizes.

| Device | Viewport | Notes |
|---|---|---|
| desktop | 1440 × 810 | — |
| laptop | 1280 × 720 | — |
| iphone | 844 × 390, 2× pixel density, touch | iPhone landscape. Touch controls show |

Screens captured: title, party select, battle menu, Builds, Training menu, a Rift fight, the Horaios fight, the pause screen, a story cutscene, and the Market Ring walk scene.

## Commands (run inside `starfall_ascent/tools/`)

Capture everything under a label:

```bash
node shots.js before
```

Capture one screen only:

```bash
node shots.js after fight-rift
```

Compare two labels (writes before | after | changed-pixels images and prints the % changed):

```bash
python compare.py before after
```

Images are in `tools/out/<label>/` and `tools/out/compare_<before>_vs_<after>/`.

## Workflow for a visual change
1. `node shots.js before`
2. Make the change in `index.html`.
3. `node shots.js after`
4. `python compare.py before after`, then look at the screens that changed.
5. Show the owner the before/after images for approval.

## Adding a screen
Add an entry to `SCREENS` in `shots.js`: a name and a function that runs in the page. Useful hooks on `window.__sf` (localhost only): `battle(party, stageId, bless, opts)`, `ch1(fresh)`, `cutNext()`, `m()`, `step(seconds)`, `win()`, `god()`, `p()`, `boss()`.

## Limits
- This is Chromium emulating an iPhone-sized screen. Real iOS Safari behaviour (toolbars, safe areas, text sizing) still needs a check on the owner's phone.
- Screens with animation never match pixel for pixel; small percentages in `compare.py` are normal.
- First test after a Playwright upgrade may need `npx playwright install chromium`.
