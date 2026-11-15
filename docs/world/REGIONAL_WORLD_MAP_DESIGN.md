# Regional World Map · Design

## Architecture decision
- **Each place stays a single-screen environment.** The renderer paints one 620 to 900 × 400 arena per place and caches it, and every system (collision, NPCs, chests, objects, activities) is built per screen. A continuous scrolling world would mean rewriting the camera, background caching, the HUD-safe placement work and every placement table. That isn't justified.
- **The world map is the connected layer.** It shows the region as one place, and fast travel moves between screens with a short fade. The game does **not** pretend to be a continuous open world: each place is still a separate environment, but you never have to go through a menu chain or a sequence of rooms to reach a place you know.
- **Walking exits stay** for players who prefer to walk.

## What the map shows (`WORLD_LOCS`, `WORLD_ROADS`)
- **Background:** a parchment map in the game's palette (ink, muted browns, gold accents), a dotted ring for the city wall, the canal running down the low west side, and roads between connected places.
- **Places:** each has a pixel icon (fountain, cross, lantern, shield, red cross, gate, papers, houses, clock, waves) on a gold disc. Labels are drawn crisp at the screen's resolution.
- **States:**

| State | Look | Can travel? |
|---|---|---|
| **here** | Gold disc, red pin above it | — |
| **open** (discovered) | Gold disc, solid road | Yes |
| **found** (reachable, not yet visited) | Faded, with "?" | No: walk there first |
| **soon** (story allows it, not built yet) | Faded, dashed road | No |
| **locked** (story) | Faded with a lock; name hidden as "???" until the story has shown it | No |

- **Selecting a place:** tap or click it, or use the arrow keys. The side panel shows its name, status, description, what unlocks it, and Travel and Close buttons.

## Proposed geography
The Lore Bible places only a few of these. Positions not set by canon are proposals and can be moved by editing `WORLD_LOCS`.

| Place | Map position | Basis |
|---|---|---|
| Market Ring | centre | Lore: "all roads meet here" (hub) |
| The Cloister | north of the Ring | Existing exit |
| Festival Square | east | Existing exit |
| Garrison Yard | west | Existing exit |
| St. Lucia's | south | Existing exit |
| St. Hesper's | east of Festival Square | **Proposal** (World Audit): new east exit |
| St. Hesper's Clock Tower | above St. Hesper's | Lore: the orphanage's old clock tower |
| Concord Office | east of The Cloister | **Proposal:** Church and Council are bound together in the lore |
| Ash Lane | south-east, beside St. Lucia's | Lore: "the road to St. Lucia's" |
| Drowned Canals | south-west, on the canal | **Proposal:** low side of the city |

## Extending it
Add a `WORLD_LOCS` entry (with `d` once a district exists in `MX_DISTRICTS`, plus `need` for its unlock) and add roads to `WORLD_ROADS`. Nothing else changes. Future candidates from the audit (The Wall, the harbour, Theo's workshop, Church cellars, old chapels, the Archive) stay off the map until their chapter needs them, so the map never spoils them.
