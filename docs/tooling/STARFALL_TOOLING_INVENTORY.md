# Starfall tooling inventory (14 November 2026)

Machine: Windows 11, the project owner's laptop. Game folder: `starfall_ascent/`. Tools live in `starfall_ascent/tools/`.

"Fable" is a model (Fable 5.2) running inside Claude Code, not a separate program. It uses exactly the same tools, files and MCP servers as any other model in Claude Code, so one setup covers both.

## What was already installed
| Tool | Version | Use |
|---|---|---|
| Node.js / npm / npx | 22.18.0 | Runs the tool scripts and Playwright |
| Python / pip | 3.12.10 | Asset processing, PDF building |
| Pillow | 13.0.0 | Image processing |
| reportlab, pypdf, pypdfium2 | — | Lore Bible PDF |
| Git | — | Version control (GitHub Pages hosting) |
| Claude Code CLI | 2.1.295 | The development agent |
| Claude desktop built-in browser | — | Interactive checks of the game (works, but screenshots go stale while its pane is hidden) |

## What was installed in this pass
| Tool | Purpose | Installed | Works in Claude Code (any model, incl. Fable) | Test result | Limits |
|---|---|---|---|---|---|
| Playwright 1.65.1 (npm, in `tools/`) | Headless browser: real screenshots of the game at desktop, laptop and iPhone-landscape sizes | Yes | Yes | `node shots.js baseline` produced 30 screenshots (10 screens × 3 sizes), 0 page errors | Chromium only. It emulates an iPhone viewport and touch; it is not real iOS Safari |
| Chromium headless shell (Playwright build 1255) | The browser Playwright drives | Yes (123.8 MB, Playwright's own installer) | Yes | Used by every run above | — |
| Playwright MCP server (`@playwright/mcp`, user scope) | Lets the agent drive a browser step by step through MCP tools | Yes | Yes: `claude mcp list` reports "Connected" | Health check passed | New MCP tools appear in sessions started after the install |
| numpy 2.5.4, imageio 2.38.1 (pip) | GIF previews, pixel maths | Yes | Yes | Built `kairos_walk.gif` (8 frames) | — |
| `tools/shots.js` | One command, all key screens, three device sizes | Written | Yes | 30/30 ok | Uses the game's localhost test hooks |
| `tools/compare.py` | Before / after / changed-pixels image for every screen | Written | Yes | Title screen: 0.0–0.1% changed between two runs | Animated screens always differ slightly |
| `tools/sprites.js` | Exports sprite sheets from the game's own drawing code | Written | Yes | 8 characters × (8-frame walk + 4-frame idle) + 7 Vices | Poses limited to what `drawChar` exposes |
| `tools/assets.py` | slice, sheet, gif, scale, trim, palette, colour-key, base64 | Written | Yes | slice 4 frames; trim; palette 16 colours 30,142 → 16,012 bytes; gif | — |
| Test hooks `__sf.charPng`, `__sf.vicePng`, `__sf.ids` | Give the tools access to character and Vice art | Added to `index.html` (localhost / `?debug` only) | Yes | Used by `sprites.js` | Not available on the live site, by design |

## Not installed, and why
| Tool | Decision |
|---|---|
| Image generation (any provider) | **Needs your authorization.** No image-generation tool is available in this environment, and every hosted option needs an account and API key, most of them paid. See `STARFALL_MCP_AND_CONNECTORS.md` |
| Aseprite | Paid. Not purchased |
| LibreSprite | Free, but a standalone program downloaded from GitHub releases. Not needed yet: the Pillow pipeline covers slicing, palettes and previews. Can be added on request |
| ImageMagick, pngquant, oxipng | Not needed: Pillow does the same jobs here |
| Blender + Blender MCP | Skipped. The game is 2D pixel art drawn in code; 3D would add complexity with no clear gain |
| rembg (AI background removal) | Skipped. Large model download, and only useful once generated images exist |
