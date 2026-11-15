# Progression & Economy · Audit

An audit of `index.html` before Gameplay Expansion 02. STARFALL already has a complete progression stack; most of the work is connecting it, not adding to it.

## What exists

| System | How it works | Code |
|---|---|---|
| **Memories (character EXP)** | Vices drop Memories during a stage (`memDrop`: 4.5 per Vice, 12 elite, 30 champion). The total is split across the party at the end (`memShare`). Story missions add a flat 20; Battle adds 10 + 40 on a win; the Chapter 1 clear gives 200 to all eight (60 on replays). | `memDrop`, `giveXp`, `awardRun`, `storyMissionAward`, `showCh1End` |
| **Recollection level** | Lv 1 to 20. Memories to the next level: `80 + 60 × Lv` (12,920 total to Lv 20). | `xpNeed`, `MAX_LVL` |
| **Stat growth** | Per level, by role: HP +3 to 5%, ATK +2 to 5%, DEF +0.3 points. | `ROLE_W`, `makeMember` |
| **Milestones** | Lv 5, 10, 15, 20 bonuses, awakened once the level is reached, for Mastery `Lv/5 × 2` and Stardust `Lv × 8`. | `MILESTONES`, `msCost` |
| **Skill Mastery** | Five skills per character, Lv 1 to 10, each level +5% to that skill. Upgrade cost: Mastery = current Lv, Stardust = 15 × Lv. A skill can't pass the character's level. | `SKILLS`, `skCost`, `skMul` |
| **Mastery points (character material)** | Per character. +2 per story mission, 1 to 6 per Battle run, 4/7/10 from Clocktower Drills (tier 1/2/3), 5 to all eight on the first Chapter 1 clear. | `giveMp`, `riftRewards` |
| **Star Fragments (equipment)** | Three slots (Sun = ATK, Moon = DEF + cooldowns, Rising = HP). Rarity Common / Rare / Star-born, 1 to 3 traits, element sets at 2 and 3 pieces, aspects from the character's chart. 150 max held. | `rollFrag`, `fragFx`, `SETS` |
| **Fragment upgrades** | Attune Lv 1→5 (25 × Lv Stardust; +25% per level, extra at Lv 3 and 5), Retrograde (reroll a trait, 40), Transit (nudge 1° toward exact, 30 × n, five times), Salvage (+10/30/80 + 10 per level). | `showBuilds` |
| **Stardust (currency)** | Earned from kills (0.5 each), story missions (5 + kills × 0.5), Chapter 1 clear (100 / 30), Starlight Rift sparks, star ratings (+20 per new star, once), salvage, a full inventory (10 per extra fragment), Meridian quests and hidden records. Spent on milestones, skills and fragment upgrades. | `save.dust` |
| **Bonds** | Story-only +4% HP/ATK per heart, up to 5, from story choices. | `bondUp`, `BOND_FX` |
| **Repeatable activities** | Rifts: elemental (fragments), Memory Wells (Memories), Starlight (Stardust), Clocktower Drills (Mastery), three tiers each. Trials of Mercury and Mars. Horaios gives one Star-born fragment per difficulty per week. | `RIFTS`, `riftRewards`, `bossWeekly` |
| **Meridian** | Six quests, Stardust rewards, one Star Fragment, two hidden records with Stardust. | `MX_QUESTS`, `MX_FINDS` |
| **Saving** | One localStorage key. `loadSave` fills defaults per character. Backup/restore panel. | `loadSave`, `persist` |

## What is disconnected or incomplete
1. **Benched characters fall behind.** Memories only go to the three in the party. Outside the one Chapter 1 clear, there is no way to raise a character you don't play, which works against "all eight stay viable".
2. **Exploration does not feed characters.** Meridian pays only Stardust, so quests don't feel like progression.
3. **No account-level progression.** Nothing grows with the player across modes.
4. **Rewards are granted ad hoc.** Every source adds to `save.dust` its own way. There is no shared way to say "this reward is claimed once", which future World Bosses and rifts will need.
5. **The save has no version step.** `s.v=1` is written but never checked.

## What does NOT need changing
- Level curve, stat growth, milestones, skills and fragment upgrades are balanced against current combat, and every Stardust sink is worth less than its cost when salvaged, so no currency loops exist.
- Star ratings, the weekly Horaios fragment, Meridian quests and hidden records are all already one-time.
- Chapter 1 replays pay a reduced amount by design.

## Duplication and exploit check
| Source | Repeatable? | Guard |
|---|---|---|
| Chapter 1 clear | Yes, 60 Memories / 30 Stardust after the first | Intentional; an hour per replay |
| Star rating bonus | No | `save.stars[k]` stores the best |
| Horaios weekly fragment | Weekly | `save.bossWeek[diff]` |
| Meridian quests | No | quest state `done` |
| Meridian records | No | `save.mx.found` |
| Salvage | Per fragment | refund < upgrade cost (Attune Lv 5 costs 250, salvage returns at most 120) |
| Full inventory | Per drop | 10 Stardust, needs a fight |
