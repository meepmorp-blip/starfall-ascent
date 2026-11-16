# STARFALL: THE ASCENT · Visual Design & UX QA Report

Date: 2026-11-16 · Branch: `qa/dev-queue` · Build: local `index.html`.
Method: a scripted screen tour plus real-input walkthroughs in headless Chromium, then screenshot review by eye. Physical devices were not used; see the end of this report.

---

## 1. How the inspection was done

**`tools/ux_tour.js` (new).** Opens 45 screens and flows at five sizes, saves a screenshot of each, and runs layout checks on the rendered page:
- clipped or cut-off text
- controls off screen with no way to scroll to them
- text under 10.5 px
- low contrast
- **dark-on-dark text** inside the dark panels
- **content spilling out of its panel**
- touch targets under 30 px on touch screens
- overlapping buttons
- overlays with no visible way out

Usage: `node ux_tour.js <label> [screen] [size]`. Output goes to `tools/out/ux_<label>/`, with screenshots and `report.json`.

**Sizes:**

| Name | Viewport | Notes |
|---|---|---|
| desk | 1280×720 | DPR 1 |
| hd | 1920×1080 | DPR 1 |
| phone | 844×390 | DPR 2, touch (iPhone landscape) |
| small | 667×375 | DPR 2, touch (small iPhone landscape) |
| ipad | 1180×820 | DPR 2, touch |

**Screens toured:**
- **Title and menus:** title, title with backup reminder, Story menu
- **Builds:** Fragments, Skills, Level & milestones, and the fragment detail sheet
- **Backup:** the backup screen, and a bad restore code
- **Guide:** Start here, Controls, Team, Characters, Vices
- **Practice modes:** Training; party select; Rifts, Horaios, Trials, Climb
- **Meridian:** Meridian menu, world map; Journal (Quests, Stories, Records, Map); Renown
- **Hub:** Market, tower markers, dialogue, a story offer, the workbench puzzle, pause, pause → map
- **Fights:** fight HUD, fight pause, Rift HUD, Rift won, Rift lost
- **Chapter 1** (looked at, not changed): cutscene, choice, join card, team pick, Bond card, mission failed, chapter end

**`tools/ux_walk_test.js` (new).** Realistic sequences with real clicks and taps, at desk, phone and small:
- Builds: 4 characters × 3 tabs, picking and equipping a fragment, closing its sheet, then Backup → Back → Back
- Guide: all 8 tabs → Back
- Journal: tabs ×2 → Back
- Renown: claim → Back ×2
- Battle: party → stages → Rift → win → Stages → Rift → pause → Quit
- a story offer: talk to reveal it, talk again to accept
- 24 menu round-trips from the title, with listener and DOM-node counts

**`tools/menu_flow_test.js`** (from QA-06) still covers pause / map / Journal / Guide / Resume in six districts with real input.

---

## 2. Issues found and fixed

All fixes preserve the existing look: same fonts, colours, gold accents and pixel art. They are refinements only, with no redesign. Each was re-checked on the rendered page at desktop and phone sizes.

### High

| ID | Screen | Problem | Root cause | Fix | Verified |
|---|---|---|---|---|---|
| UX-01 | Chapter 1 team pick ("Defend St. Lucia's" and every story party pick) | Character names were **nearly invisible**: dark text on a dark card, about 1.2:1 contrast | The dark re-skin of panels (`.form`/`.vault`/`.gwrap`) swaps `--paper` to the dark background. `.slot` used `color: var(--paper)`, so its text turned the same dark as the panel | `.slot` inside those panels uses the panel's light text colour (`--ink`) | Screenshots before and after; the new dark-on-dark check finds 0 |
| UX-02 | Meridian menu, short phones and 1280×720 | The panel's title rode **over its top border** and the eyebrow was **cut off and unreachable** | `.ss` panels are fixed-height flex columns with `justify-content: flex-end`. Content taller than the panel overflows upward, where scrolling can't reach | Content is pushed down with an auto top margin, which keeps it bottom-aligned while it fits and never goes negative. The panel scrolls when content is taller. Very short screens get tighter menu-row spacing so everything fits | 667×375, 844×390 and 1280×720: overflow 0 px, header inside, Back visible |
| UX-03 | Builds → tapping a fragment (detail sheet) | The sheet's **name, rarity and × close button were above the screen** and unreachable. After Equip there was no visible way to close it | The sheet centred its content with `align-items: center` inside `overflow: auto`. Taller content is cut at the top | Centred with auto margins instead (`.bv-detail > * { margin: auto }`) | × visible and tappable at desk and small; × closes the sheet (`ux_walk_test`) |

### Medium

| ID | Screen | Problem | Root cause | Fix | Verified |
|---|---|---|---|---|---|
| UX-04 | Team pick cards | Long names were cut with "…" ("Big Boy B…") | `white-space: nowrap` + ellipsis on `.slot .nm` | Names on pick cards wrap to two lines | Screenshot |
| UX-05 | Meridian menu map | District notes stopped mid-word: "…above St", "…on the road to St" | The note was `blurb.split('.')[0]`, which splits at the full stop in "St." | New `firstSentence()` skips St./Dr./Mt./Mr./Mrs./No. It avoids regex look-behind, which older iPhone Safari lacks | Unit check and screenshot: "…above St. Hesper's", "…on the road to St. Lucia's" |
| UX-06 | Builds slot list | "SUN · ATK" collided with the SELECTED badge; "ATK" broke onto its own line | Flex row items shrank and wrapped internally | Each label stays whole; the badge wraps below when space runs out | Screenshot |
| UX-07 | Backup screen | Browser-default grey "Choose File / No file chosen" control, unlike everything else | Bare `<input type=file>` | A game-styled outline button, "Choose a backup file…", with the real picker inside it (a `<label>`, so iOS opens it). Behaviour unchanged | Screenshot; `ux_walk_test`; `save_protection_test` |
| UX-08 | Renown, Journal lists | The list scrolls with **hidden scrollbars**. A row cut in half was the only hint more ranks existed below | Scrollbars hidden game-wide | A soft fade at the list's bottom edge, plus extra bottom padding so the last row clears the fade | Screenshot; `ux_walk_test` |
| UX-09 | Battle → Rifts / Trials cards | Rift rules were cut to **3 lines on desktop and 1 line on phones**, hiding the mechanic ("Vices that die while burning explode and hurt other…") | `-webkit-line-clamp` | Up to 5 lines on desktop (all current rules fit) and 3 on short screens. The stage list scrolls if needed | Desk shows the rule in full; small shows 3 lines |
| UX-10 | Builds fragment filters, small phones | "Good fits" and the sort menu were **pushed off-screen** in a sideways-scrolling row with no scrollbar | `.fbar { flex-wrap: nowrap; overflow-x: auto }` at short heights | The filter row wraps to a second line; "Good fits" no longer breaks inside its pill | Screenshot |
| UX-11 | Touch screens: Builds tabs, Battle tabs, tier picker, Hard/Normal, pause toggles, volume sliders, cutscene Auto/Menu/Skip, dialogue Skip | Targets only **16–25 px tall** | Small pill controls designed for mouse | On touch screens only: an invisible tap area 9 px above and below (same look), and 30 px tall slider tracks. The tab rows stop clipping so the larger area works | Tapping 6 px above or below a tab or tier pill hits it. Slider 30 px |
| UX-12 | Meridian districts | "?" / "!" markers could be **hidden behind counters and walls** (Market Ring, bottom-left counter) | Markers were drawn with each person, before solid props | Markers are queued and drawn after the whole scene (`qBubble` / `flushBubbles`) | Before and after crops of the same spot. Every marked object in the Market was also checked reachable on foot |
| UX-13 | Chapter 1 team pick | Only "Go"; **no way back to the main menu**, unlike every story scene | Not offered | A "Main menu" button. It appears only inside the Chapter 1 sequence, which has already saved at this step, and uses the same `leaveStory()` as the scene Menu button | Screenshot; `core_probe` Chapter 1 playthrough |

| UX-17 | Backup, Journal, Renown, team pick… on phones narrower than 720 px | Panels stuck out **28 px past the right edge**: right border missing, and the page scrolled sideways | `.form` is `width:100%` plus padding with content-box sizing, so on screens narrower than its max-width the padding overflowed | Below 720 px wide, panels count their padding inside (`box-sizing: border-box`). Desktop widths are unchanged | Sideways overflow 0 px on Builds, Backup and Journal at 667, 844 and 1280 wide. Added an `h-overflow` check to the tour |

| UX-18 | World map (from the menu and from pause), phones | The map panel stuck out about 20 px and the screen scrolled sideways | `.wm` is `98vw` wide inside the overlay's 16 px padding | `.wm { max-width: 100% }` | 0 px sideways overflow at 844 and 667 |
| UX-19 | Pause menu, small phones | **Introduced by UX-11 and caught by the new check:** the slider minimum width pushed the volume "%" value 20 px off-screen | My own change | Minimum width removed; the taller touch strip is kept | 0 px overflow; value visible |

### Low

| ID | Screen | Problem | Fix |
|---|---|---|---|
| UX-14 | Builds | The best-fit fragment's pulsing glow was **cut square** by its scroll box | Glow peak toned down (36 → 16 px) and the box padding raised (10 → 18 px). Close-up checked on phone |
| UX-15 | Journal, Renown | **Back was the gold primary button**; elsewhere Back is an outline button | Outline style, consistent with Builds, Guide, Backup and Battle |
| UX-16 | Rift/Trial card tags, role labels, story-scene buttons, pause section titles | 8–9 px text on short phones | Lifted to 9–10.5 px |

**Regression caught during the fixes:** UX-16 first raised the card tags to 9.5 px, which made "WATER / EARTH FRAGMENTS · ★★★" wrap and cover the card title on phones. Tags are now 9 px on one line with tighter spacing. A check of all 10 Rift, Trial and Horaios cards at both phone sizes found no overlap and no ellipsis.

---

## 3. Inspected and left as they are

- The "?" markers on objects are by design (readables and secrets). The ghost names behind the party-select sprites are decoration.
- The tour's "no exit" flag on the title screen and the join card: both are expected.
- Talking to Bram reveals his story, and talking again starts it. That's the designed discovery flow (the marker becomes "!").
- The pause, Journal and Guide flows, and the map-from-pause fix from QA-06: re-checked with real input.
- Very large screens (1920×1080) keep the HUD at its normal size. Readable; not a defect.

---

## 4. Remaining issues that need your decision (not changed)

| ID | Severity | What | Why it needs you |
|---|---|---|---|
| UX-R1 | Medium | In Meridian, the **combat HUD** is shown where there is no combat: the Pneuma bar, the Sun/Moon/Ultimate buttons and "0%". The big button is Talk there | Hiding or re-labelling HUD elements per area changes the HUD layout everyone has learned |
| UX-R2 | Low | Plain townsfolk name labels fade when far away (by design). On the light Market paving a few ("Tessa", "Fish vendor") are faint | Could get a darker outline; changes the canvas label style |
| UX-R3 | Low | On the phone title screen a faint round decoration of the background art sits behind the word "Practice" | Background art |
| UX-R4 | Low | Many small all-caps labels are 9–10 px on desktop: eyebrows, role tags | It's the game's typographic style; raising them globally would change the look |
| UX-R5 | Low | The Backup screen is long, and its Back button is at the bottom (Esc also works) | Could add a header Back; changes the form layout |
| UX-R6 | Low | Builds → Level & milestones on phones: the milestone list continues below the fold in a scroll box with no visible scrollbar (the cut row is the only hint) | The same fade as UX-08 could be added; it would touch the whole Builds body |

---

## 5. Tests and results

**UX tour** (45 screens × 5 sizes): before and after. See `tools/out/ux_before*/` and `tools/out/ux_after_*/`.

| Check (count of findings) | desk 1280×720 | hd 1920×1080 | phone 844×390 | small 667×375 | ipad 1180×820 |
|---|---|---|---|---|---|
| Page errors | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| Dark-on-dark text¹ | (8) → 0 | 8 → 0 | (8) → 0 | 8 → 0 | 8 → 0 |
| Low contrast | 8 → 0 | 8 → 0 | 8 → 0 | 8 → 0 | 8 → 0 |
| Clipped text | 1 → 0 | 1 → 0 | 1 → 0 | 2 → 0 | 1 → 0 |
| Content spilling from its panel² | – → 0 | – → 0 | – → 0 | – → 0 | – → 0 |
| Sideways overflow² | – → 0 | – → 0 | – → 0 ³ | – → 0 ³ | – → 0 |
| Touch targets < 30 px (visual size) | – | – | 66 → 62 ⁴ | 65 → 61 ⁴ | 59 → 55 ⁴ |
| Overlay with no exit | 4 → 2 ⁵ | 4 → 2 | 4 → 2 | 4 → 2 | 4 → 2 |
| Text under 10.5 px | 161 → 168 ⁶ | 161 → 168 | 136 → 131 | 136 → 131 | 158 → 165 |

1. The check was added during the pass. The before figures in brackets come from the same eight pick-card names flagged as low contrast.
2. Checks added during the pass. They first found the Meridian, map and pause overflows (UX-02, UX-17, UX-18, UX-19); all are now 0. One remaining "spill" in Builds → Level was a scrollable list, a false positive, and the check was corrected.
3. Re-checked on the map and pause screens at both phone sizes after the last two fixes.
4. The visual size of pill controls is unchanged by design; their tap area grew by 18 px (UX-11). The rest are mostly 26–29 px buttons.
5. The two left are the title screen and the Chapter 1 join card, both expected. The team pick now has "Main menu".
6. More screens now render full text (Rift rules, district notes), so more small labels are counted. No label became smaller.

**Walkthrough** (`ux_walk_test.js`): desk 26/26, phone 26/26, small 25/25. The fragment step is skipped when a run happens to have no Sun fragment; the sheet was checked separately at small.

**Regression:** full suite plus reruns, no reproducible failures. See `docs/QA_REPORT.md`, “Visual & UX pass”.

---

## 6. Not tested on real devices

- Real iPhone rendering of the canvas `filter` (statues) and of `mask-image` (list fade). Both have fallbacks: no filter means faded figures, and no mask means no fade.
- How the larger tap areas feel under a finger, and safe areas around the notch / Dynamic Island in landscape.
- Scrolling momentum of the scrollable panels on iOS.
