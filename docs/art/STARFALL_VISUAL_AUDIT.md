# Visual audit (14 November 2026)

Based on 30 headless screenshots (`tools/shots.js`: 10 screens at desktop, laptop and iPhone landscape) and a read of the drawing code.

## How the game is drawn
- No image files. Every map, character, Vice and effect is canvas code in `index.html`.
- Maps are painted once per room into a cached canvas (`paintTheme`), then characters and effects are drawn on top each frame. The world is rendered small and scaled up with hard pixels.
- 14 map themes: yard, market, plaza, chapel, office, pier, roof, ring, lobby, hospital, lab, street, rooftop, orphanage.

## Findings before this pass
| Area | State | Problem |
|---|---|---|
| Environments | Tidy pixel maps with houses, stalls, props | Flat and evenly lit. No time of day, no depth between floor and buildings, nothing moves. Every district had the same brightness and colour temperature |
| Market Ring | Plain cobbles, a pillar, two rows of identical stalls | Did not read as "a round square with a ring road". No landmark. Stalls had no goods in front |
| Lighting | Lamps had a fixed painted glow | No flicker, no mood difference between day and night maps |
| Foreground | None | Everything sat on one layer, so the world felt like a board |
| Characters | Chunky, readable, distinct colours | Few animation frames; one facing. Deferred by the owner: "sprites later" |
| Combat effects | Readable rings, trails, telegraphs | Functional, not yet expressive. Later phase |
| Menus | Recently unified dark style with gold accents | Consistent. Small NPC name labels are hard to read on a phone |
| Phone | Layouts fit landscape | Real iOS Safari still needs owner checks |

## What this pass changed
See `STARFALL_VISUAL_POLISH_ROADMAP.md`, Phase 1. Before/after images: `compare_story-market-desktop.jpg`, `compare_fight-rift-desktop.jpg` in this folder.
