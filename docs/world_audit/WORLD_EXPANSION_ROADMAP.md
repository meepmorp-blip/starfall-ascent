# World Expansion Roadmap

Ranked by value for cost. Everything below reuses the existing single-screen walk-scene architecture (`MX_DISTRICTS`, exits, `mxNpcs`, `MX_FINDS`, chests, objects, `grantReward`). None of it needs a new engine.

## Recommended first: St. Hesper's Orphanage as a Meridian district
1. **Why:** it is Kairos's home and the emotional centre of Chapter 1. The 11:59 gate clock is the series' central image. Matteo's errand list is already a delivery for St. Hesper's (three mackerel, twelve loaves), so it ties straight into the existing Market content.
2. **Reuse:** the `orphanage` theme is complete (base + dressing + night grade), and the `longway` walk scene already has four story spots (bakery, kitchen window, back step, gate clock).
3. **Work:** a district entry, one new exit, NPC writing (Sister Agathe, children, the baker next door), records, chest spots (via `tools/chest_spots.js`), one activity, story-gated lines.
4. **Mechanics:** a hide-and-seek activity with the children; records in the chalk games and the gate; a bakery delivery quest that continues Matteo's list.
5. **NPCs:** Sister Agathe (an existing speaker, `matron`), two or three orphans, the baker next door.
6. **Story:** before the Festival, Kairos still runs errands for the home. Content tied to Scene 9 (the kitchen fire, the "cat") unlocks only after the player has reached Scene 9.
7. **Complexity:** low to medium. About one milestone, similar in size to one Expansion 01 district plus Expansion 04/05 content.

## Immediate improvements (small, high value)
1. **Collision for painted props** in the five districts: stall fronts, benches, beds, the pond, statues. Use invisible solids that match the art. This is the biggest boost to "real place" feel.
2. **Fast travel** from the Meridian menu map: tap a visited district to start there. It reuses `mxBegin` with a chosen district.
3. **Naming tidy-up:** change "Vigil Yard drills" and the "Vigil Arena" comment to Garrison names (Lore v1.1).
4. **Give the Cloister life:** a vespers routine (the Sister walks to light lamps at intervals) and one more townsperson.

## Short-term map expansions
1. **St. Hesper's Orphanage** (above).
2. **Concord Office district** (`office`). Reuse the Scene 7 queue NPCs and their lines. Activities: read the notices, help the records clerk find a form (a memory puzzle that does not copy Chapter 2's Archive puzzle). Connect it from The Cloister's east edge (Church and Council are bound together in the lore; this geography is proposed, not canon).

## Medium-term regional expansion
1. **A Meridian regional map:** extend the Meridian menu's 3×3 grid into a city map with three kinds of node:
   - explorable districts (travel there);
   - story places (greyed, "visited in Chapter 1");
   - Battle places (open the Battle menu at that stage).

   This makes the world feel joined up without changing gameplay.
2. **Ash Lane as the road between the Market Ring and St. Lucia's.** Reuse the `street` theme. Night-only, or add a dusk `ATMO` grade. The lodging house shows its state after Scene 10.
3. **Time of day** for the hub: an `ATMO` dusk/night grade per district, plus NPC schedules (the roadmap's Milestone 02).

## Long-term world development
1. **Chapter 2 places:** Theo's workshop (the fugitive hub), Church cellars (mission), the Drowned Canals made explorable after the Gate-leak reveal, the Archive (its own region with the Filed mechanic).
2. **The Wall vantage** (a rooftop view of the edge of the known world) as the first look beyond Meridian.
3. **Regions beyond the Wall,** only once the story leaves the city.

## Do not expand yet
| Location | Reason |
|---|---|
| Institute | Story-sensitive (Marr, Dess); keep it as a mission place |
| Registry Hall / The Stacks | Destroyed in Chapter 1 |
| Drowned Canals (exploration) | Holds Chapter 2's Gate-leak reveal |
| The Archive | Chapter 2 story comes first |
| Clock tower hideout | The hideout only exists after Chapter 1; add it to St. Hesper's later, gated on a Chapter 1 clear |
