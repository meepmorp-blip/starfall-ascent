# Progression & Economy · Design (Expansion 02)

## Principles
- Keep what works. The level curve, skills, milestones and Star Fragments stay exactly as they are.
- One new resource only, and only because it fills a real gap.
- Every reward goes through one function that knows whether it was already claimed.

## The resource set
| Resource | Category | Scope | Earned from | Spent on |
|---|---|---|---|---|
| **Stardust** ✦ | General currency | Account | Kills, story missions, Chapter 1, Starlight Rifts, star ratings, salvage, Meridian quests and records, Renown ranks | Milestones, skill upgrades, Attune, Retrograde, Transit |
| **Memories** | Character EXP | Per character | Fights (split across the party), story missions, Chapter 1, Memory Well Rifts, Keepsakes | Levels (automatic) |
| **Keepsakes** (new) | EXP material | Account, used on any one character | Meridian quests, Renown ranks, first Chapter 1 clear, the daily precious chest, first clears of the drill and the programme | +120 Memories to the character you choose, in Builds › Level & milestones |
| **Mastery** | Character material | Per character | Story missions, Battle, Clocktower Drills, Chapter 1, Renown rank 3 | Skills, milestones |
| **Star Fragments** | Equipment | Account | Fights, chests, elemental Rifts, Trials, Horaios weekly, Meridian Records, Renown rank 5 | Equipped; upgraded with Stardust; salvaged into Stardust |

**Why Keepsakes:** Memories only reach the three characters in the party. Keepsakes are Memories you can carry to a character on the bench, so all eight can keep up. One Keepsake is about one Battle stage of Memories. Keepsakes come from exploration and account progress, not from fighting, so they never replace playing.

## Account progression: Meridian Renown
Renown measures how well you know the city. Points come from what you have already done, so nothing new is grinded:

| Action | Renown |
|---|---|
| Visit a district for the first time | 5 |
| Find a record | 5 |
| Complete an optional quest | 15 |
| Complete the main quest | 30 |

There are five ranks. Each rank's reward is claimed once from **Meridian › Renown**. They are not handed out automatically, so exploring stays quiet.

## The reward architecture
```
grantReward(reward, key)   // key: a string such as 'mxq:streets', 'renown:3', 'ch1:first'
  · if save.claims[key] is set, nothing happens and null is returned
  · otherwise it applies the reward, records save.claims[key], saves, and returns the lines to show
reward = { dust, keep, mpAll, frag: 'boss'|'star'|'chest' }
```
Future activities plug in by choosing a key:
| Activity | Key pattern | Reward shape |
|---|---|---|
| Astral Rift first clear per tier | `rift:<id>:<tier>` | dust + fragments |
| Weekly World Boss | `wboss:<boss>:<week>` | `frag:'star'`, keep, mpAll |
| Constellation Trial rung | `trial:<sign>:<rung>` | dust, keep |
| Memory Expedition | `memx:<char>:<n>` | keep, mpAll |

## Where players see it
- **Builds › Level & milestones**: the Keepsake count, what one does, "Use 1" and "Use to next level", with a preview of the result.
- **Meridian menu**: the Renown rank, Stardust and Keepsakes on the info line, and a Renown entry with claim buttons. It shows "rewards to claim" when one is waiting.
- **Journal**: each quest lists its reward, now including Keepsakes.
- **Banners**: quest completion and Renown claims list exactly what was gained.

## Save compatibility
- `loadSave` sets `save.keep` (0) and `save.claims` ({}) when missing and moves the save to `v: 2`. Nothing existing is renamed or removed.
- Players who finished Meridian quests before this update receive those quests' Keepsakes once (`mxMigrate`, keyed by `mxq:<id>`). Stardust they already received is not paid again.
