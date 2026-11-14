# Update 10.7: The Gilded Hoard (The Crooked Cue)

Owner request (14 Nov 2026): a brand new pool table with cool new players whose top payout goes past 20,000; new pool balls that are
more expensive and more epic; new felts and similar extras.

## 1. The Gilded Hoard, a third venue (high-roller room)
A dragon's treasure vault turned into a high-roller pool room: mountains of coins, gem lanterns, a vault door, a chandelier of gold chains,
a table carved from dark wood with gold rails, ruby-lit pockets and a crimson-and-gold felt. Its own hub, room, table, music and VS intros,
built like Orbit 8 (97b1-97b4). Prefix `pzd` (cast art `pzdc`).

| Player | Who | House rule (reuses existing rules) | Stakes | Pays |
|---|---|---|---|---|
| Clasp | a mimic treasure chest, the vault's doorman (rookie of the room) | none | 2,500 - 5,000 | x2.0 |
| Zephyra | a smoke genie dealer who floats out of a lamp | winner breaks | 2,500 - 7,500 | x2.6 |
| Sir Brassknuckle | a clockwork brass golem bouncer with steam vents | short aim guide | 5,000 - 7,500 | x3.3 |
| Baron Hornsby | a minotaur high roller in a velvet suit and monocle | 30 s shot clock | 5,000 - 10,000 | x4.0 |
| Aurelion the Hoardwing (boss) | an ancient gold dragon banker on a pile of coins | aim line only | 5,000 - 10,000 | x5.0 |

- **Top payout 50,000** in this room (the tavern and Orbit 8 keep 15,000). Stakes up to 10,000 here only; the casino's 5,000 limit stays for every other game.
- Unlocked by beating Mortimer (tavern champion) or Empress Vantara (Orbit 8 boss). A vault-key button sits in both hubs' top bars; NEW until the first visit.
- Every other rule is reused: "wise to you" (-0.1 per win a day, floor per player), the 20 matches a day, resume / forfeit, results, The Regulars.
- Balance: a typical player's expected return stays below break-even, like the other rooms (AI strength measured with the pool bots).
- Each player has a cue (match only), lines, taunts, a quirk, voice, think timing, a tip, and beating each one the first time gives a new felt (below).

## 2. Three legendary ball sets (more expensive and more epic than 10.6)
Shared painter `pzb3Reg` (97b6). Each must pass the owner's ball rule (`t_pzb102.py`).
| Set | Price | Look |
|---|---|---|
| Phoenix Plume | 100,000 | molten feathers of fire with ember glow |
| Thunder Orb | 150,000 | lightning arcs trapped in dark storm glass |
| Gilded Hoard | 250,000 | coloured enamel under gold filigree with inset gems |
A LEGENDARY mark in the Cue Rack (above PREMIUM).

## 3. New felts and cues
- Six patterned felts for sale in the Cue Rack (about 5,000 - 40,000), baked once so they cost nothing per frame and never hide the balls:
  Starlight Velvet, Royal Damask, Abyssal Tide, Molten Forge, Aurora Frost, Sakura Bloom.
- The Gilded Hoard felt plus felts won from the new players.
- Three premium cues (about 20,000 - 60,000) with cue mastery like the others.
- The felts tab in the Cue Rack scrolls like the ball tab when it is full.

## 4. Code layout
| Module | Owner |
|---|---|
| 97bb_pzd_data.js, 97bd_pzd_venue.js, 97be_pzd_hub.js (+ small edits to 97b1 / 97b4 with backups) | venue agent |
| 97bc_pzd_cast.js | cast agent |
| 97bf_pz_balls107.js | ball agent |
| 97bg_pz_felts107.js | felt and cue agent |

## 5. Tests
`t_pzd107.py` (venue: unlock, hub, stakes, 50,000 cap, money and the cheat guard, resume, results, fit at three sizes, frame cost),
`t_pzd107c.py` (cast art), `t_pzb107.py` (balls), `t_pzf107.py` (felts and cues), plus `t_pzb102`, `t_pool`, `t_pzn101`, `t_pz97c`, `t_pool96`, the full regression.
No Updates-tab notice unless the owner asks.
