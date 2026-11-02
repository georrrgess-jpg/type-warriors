# Runestone Tower Defense 10.0: Three Worlds, Tower Mastery and two new towers

The owner asked for: two brand-new worlds (three worlds in all), three maps in each new world, each map extremely high
quality and each world more detailed than the last; a new cast of monsters per world (the same cast on every map of that
world, each map with its own matching variant); new monster abilities and map dynamics that are sound; a mastery system for
every tower where every mastery level unlocks a new, colourful skin and the top levels the most epic ones; and two new towers
with creative designs and epic animations.

This file is the shared spec. Every module below follows it; anything that changes during the build is updated here.

---------------------------------------------------------------------------------------------------------------------------
## 1. Worlds and maps

| World | Name | Maps (id, name) | Max tower tier | Unlock |
|---|---|---|---|---|
| 1 | The Runestone Realm | moss Mossgate Hollow, frost Frostfang Pass, ember Ember Crown, wonder Wonderland (endless) | 3 (5 in the Wonderland) | as today |
| 2 | Tidebreak Isles | coral Coral Shallows, wreck Shipwreck Cove, abyss Kraken's Maw | 4 | 1 star on Ember Crown |
| 3 | Skyforge Heights | meadow Cloudspire Meadows, foundry Gearworks Foundry, storm Storm Citadel | 5 | 1 star on Kraken's Maw |

Inside a world each map needs 1 star on the one before (as today). Tier 4 in World 2 and tier 5 in World 3 are the
progression reward for going further (the Wonderland keeps tiers 4 and 5 and its Ascended collection; upgrades on the new
maps do not count as Wonderland ascension).

Difficulty (hit points, speed, coins) starts where Ember Crown ends and climbs map by map; World 3's last map is the
hardest campaign map in the game. Waves: coral 15, wreck 18, abyss 20, meadow 18, foundry 20, storm 25. Every map has a boss
on its last wave and Freeplay after the win, like World 1. Balance is checked with the endless_combo bot (section 8).

### World 2: Tidebreak Isles (a sunny archipelago, a pirate cove, a glowing deep-sea trench)
- **Coral Shallows** - one long road along a turquoise beach and over sandbars, palms, tide pools, starfish, a lighthouse
  and a seashell palace. *Twist: Rising Tide.* Every 26 s the tide rises for 9 s and floods the low stretches of road
  (`map.tide` circles): monsters wading there are slowed 25% but take 20% less damage, except from the Tidecaller, which deals
  50% more to them. Animated: waves lapping, the flood water rising and falling, gulls, sparkling sea.
- **Shipwreck Cove** - two sea caves feed a road that winds past a giant wrecked galleon in a misty cove, to a pirate-fort
  castle. *Twists: Fog banks and the wreck's cannons.* 2-3 fog banks drift across the map; a monster inside fog can only be
  targeted by towers within 150 px of it (fog hides it from far towers). Every 12 s the wreck's cannon fires at the monster
  closest to the castle (8% of its max HP, 3% on a boss). Animated: drifting fog, lantern glow, swaying ship, cannon smoke.
- **Kraken's Maw** - a bioluminescent deep-sea trench (dark navy, glowing coral, giant kelp, the Kraken's tentacles around the
  pit) with two roads around the maw to a sunken palace. *Twists: Whirlpools and Glowcaps.* Whirlpools on the road (`map.whirl`)
  sweep monsters forward (x1.4 speed inside). Glowcap lights (`map.glow`) light up the dark: towers within 150 px of one get
  +15% range. Animated: rising bubbles, pulsing glow, swaying kelp, tentacles.

### World 3: Skyforge Heights (floating islands, a steam foundry, a lightning citadel) - the most detailed world
- **Cloudspire Meadows** - grassy islands floating over a sea of clouds, linked by rope bridges, windmills and airships.
  *Twists: Rope bridges and gales.* Ground monsters on a bridge (`map.bridge` circles) sway and are slowed 15%. Every 18 s a
  gale blows: flyers are swept forward (x1.8 speed for 2.5 s); the wind is visible as streaks. Animated: drifting clouds
  (parallax), turning windmills, airships, birds.
- **Gearworks Foundry** - a brass-and-iron factory floor: conveyor belts, giant turning gears, molten-metal channels, chimneys.
  *Twists: The switch track, conveyors and furnace vents.* The road splits at a rail switch into a north and a south line that
  join again; the switch flips every wave (odd waves: north, even waves: south), and the lever shows which. Conveyor stretches
  (`map.conv`) carry monsters x1.3 faster. Furnace vents (`map.vents`, like Ember Crown's) erupt and burn monsters nearby.
  Animated: gears turning, belts moving, sparks, steam, molten glow.
- **Storm Citadel** - a mountain citadel in a thunderstorm: dark clouds, rain, lightning-lit spires, crackling lightning rods.
  *Twist: Thunderstorm.* Every 10 s lightning strikes the monster nearest the castle for 10% of its max HP (4% on a boss).
  Every 16 s lightning also strikes a random tower and jams it for 2 s - unless it stands within 130 px of a lightning rod
  (`map.rods`); a tower near a rod is never jammed by lightning and gains +10% damage while the storm rages (always). Animated:
  rain, lightning flashes, clouds, glowing rods.

Map art (sections 6-7): every map is baked once (ground, roads, props, castle) like World 1, plus a light animated layer
(< 1 ms per frame). Each world also gets its own world-map painting for the hub with its three map castles and roads.

---------------------------------------------------------------------------------------------------------------------------
## 2. Monsters

Each world has eight monsters (seven regulars and a boss). Every map of the world uses the same eight, each drawn in that
map's variant (the way World 1 has moss / frost / ember / wonder variants).

### World 2 cast - sea folk
| id | Name | Role | HP | Speed | Armor | Ability |
|---|---|---|---|---|---|---|
| crab | Crabling | swarm | 40 | 96 | 0 | **Scuttle**: a 1.6x sprint for 0.8 s every 4 s |
| shell | Shellback | armored | 130 | 46 | 5 | **Shell up**: every 6 s hides for 1.6 s: stops, armor 12 (at most 12 per group) |
| puffer | Puffer | bruiser | 120 | 58 | 2 | **Puff up**: below 50% HP it inflates: 25% bigger, 25% slower, armor +6 |
| jelly | Jellyglide | flyer | 70 | 72 | 0 | **Glimmer**: every 5 s turns translucent for 1.2 s and cannot be hit |
| brute | Barnacle Brute | tank | 440 | 34 | 14 | **Shedding shell**: its armor falls with its health (armor x HP%) |
| siren | Siren | support | 120 | 52 | 0 | **Song**: every 6 s shields monsters within 110 px for 12% of their max HP (4 s) |
| squid | Inkling | disruptor | 95 | 64 | 1 | **Ink**: the first time it drops below 60% HP it inks the nearest tower within 170 px: jammed 2.5 s |
| leviathan | Leviathan (boss) | boss | 4200 | 22 | 10 | **Dive**: at 75/50/25% HP it dives for 2.5 s (cannot be hit, 1.6x speed), then surfaces with 4 Crablings |

Variants (names per map): coral = tropical reef colours (coral pink, teal, sunny yellow; starfish, shells, little corals);
wreck = pirates (tricorns, bandanas, eye patches, rusty iron, barnacles, gold earrings, lanterns); abyss = deep-sea glow (dark
navy bodies, glowing cyan/magenta spots and lures, translucent fins).

### World 3 cast - clockwork constructs
| id | Name | Role | HP | Speed | Armor | Ability |
|---|---|---|---|---|---|---|
| cog | Cogling | swarm | 42 | 100 | 0 | fast wind-up bot (its key spins faster as it runs) |
| knight | Brass Knight | guard | 150 | 48 | 7 | **Guard**: other monsters (not knights) within 70 px behind it take 25% less damage (at most 12 per group) |
| steam | Steam Golem | tank | 500 | 32 | 9 | **Overpressure**: every 15% of HP lost it vents: x1.6 speed and slow-immune for 1.8 s |
| gyro | Gyrocopter | flyer | 85 | 94 | 0 | fast flyer |
| tinker | Chronotinker | support | 130 | 50 | 0 | **Haste**: monsters within 110 px move 25% faster |
| spring | Springjack | leaper | 105 | 56 | 3 | **Leap**: every 4.5 s jumps 80 px down the road (0.45 s in the air, cannot be hit) |
| jammer | Sparkjammer | disruptor | 115 | 60 | 4 | **EMP**: jams each tower it passes within 105 px for 1.8 s (once per tower; a tower is immune for 4 s after a jam; at most 4 per group) |
| titan | Titan Automaton (boss) | boss | 5600 | 20 | 14 | **Stomp**: every 8 s jams towers within 200 px for 1.6 s; at 66% and 33% HP it sheds plates: armor -4, +20% speed |

Variants: meadow = verdigris copper with moss, vines, flowers and little birds; foundry = soot-black iron, glowing furnace
orange, hazard stripes, smoke; storm = polished silver-blue with crackling electric arcs and lightning glow.

**Jammed towers** (new): `tw.jam` seconds; a jammed tower does not fire and shows its cause (ink splat or electric sparks).
Overcharge does not clear it. Abilities, shields, guard and haste never stack from several sources (the strongest counts).
Wave pools unlock the new monsters gradually (swarm first, the disruptors from mid-map waves).

---------------------------------------------------------------------------------------------------------------------------
## 3. Two new towers

### Clockwork Hive (key H, 350 supply; unlocked when World 2 opens) - swarm damage, ground and air
A brass-and-honeycomb beehive on an iron stand, a little copper queen weathervane on top. It sends out mechanical bees
(2/3/4/5/6 by tier) that fly in swarming curves to a target, orbit it and sting (damage over time, armor-piercing 2), coat
it in honey (15% slow, 1.5 s) and find the next target when it dies. Range 250-300.
- T3 Honeycomb: stings leave small honey puddles on the road (slow 25%, 3 s).
- T4 Royal Jelly: bees pollinate towers within 150 px: +10% damage (pollen motes on buffed towers; does not stack).
- T5 Queen's Court: a large Queen Bee joins the swarm and every 6 s releases a sting burst that hits everything within 90 px.
- Animations: hive door flaps, honey drips, bee wings blurring, figure-eight swarm paths, pollen trails, queen take-off.

### Singularity Engine (key G, 600 supply; unlocked when World 3 opens) - crowd control, ground only
A brass orrery with spinning rings around a contained black-hole core. It fires a gravity orb onto the road that opens a
gravity well for 2.5 s: ground monsters within the radius are pulled toward its centre along the road (bosses half as much;
total pull per monster capped, like the Tidecaller's push) and crushed (damage per second, more for each extra monster caught,
up to x2). It clumps monsters for splash towers.
- T3 Tidal lock: monsters leaving a well are slowed 30% for 2 s.
- T4 Event horizon: a well finishes monsters below 8% of their max HP (never bosses); wells last 3.2 s.
- T5 Collapse: every 4th well implodes at the end in a nova that hits everything within 140 px.
- Animations: rings spin faster while charging, the core glows, the orb arcs with a lensing ring, an accretion disk swirls on
  the road with debris spiralling in, the implosion flash and shock ring.

Both towers: 5 tiers with grander art at every tier (as all towers), an info-panel line, upgrade texts, hotkeys, Rune Typing
compatible, Performance-mode friendly. The tower bar fits twelve cards.

---------------------------------------------------------------------------------------------------------------------------
## 4. Tower Mastery (all twelve towers)

- **Mastery XP** per tower type, saved in `P.rp.mast[type]` (an integer). Every wave cleared gives each tower on the field
  `6 x tier` XP; every kill gives its tower 1 XP; a won map gives every tower type used 50 XP.
- **Levels** I-V at 300, 1200, 3200, 7000 and 14000 XP. A level-up shows a toast in battle and on the results screen.
- **Every level unlocks a skin** for that tower (skin ids `m1`-`m5`), 60 skins in all, each named and each different:
  - I *Material* - a fresh full recolour (jade, rose gold, coral, glacier...).
  - II *Elemental* - a bolder recolour with glowing accents and a soft aura.
  - III *Regal* - recolour + adornments (gem crest, banners, filigree halo) + sparkles.
  - IV *Arcane* - recolour + an orbiting ring of its element (petals, embers, runes, snowflakes, bubbles...) + a rotating
    ground sigil.
  - V *Mythic* - the most epic: a cosmic or iridescent recolour, wings or a halo of light, a light pillar, a trail of its element
    and the sigil.
- Rendering: a recolouring wrapper around the drawing context (every fill/stroke colour, gradient stop and baked sprite is
  mapped through the skin's palette once and cached), plus baked overlay sprites for the effects. Performance mode and reduced
  motion keep the recolour and drop the moving effects.
- **Tower Skins screen**: each tower shows its mastery level and XP bar; its skins (Classic, the star skin, the champion skin,
  the five mastery skins) in a grid; locked mastery skins say which level unlocks them.

---------------------------------------------------------------------------------------------------------------------------
## 5. Hub and UI
- A world switcher on the hub (World 1 / 2 / 3 tabs with names); each world shows its own painting with its map nodes, side
  panel, and armory bar. Locked worlds show a locked card: "Earn a star on Ember Crown to sail to the Tidebreak Isles".
- World 2/3 armory bars: stars of that world (/9) with coin chests at 3, 6 and 9 stars and a world title.
- Next-region cards lead into the next world. How to Play and Help gain sections for worlds, monster abilities, jams and mastery.
- Bestiary / monster names per variant in the wave preview.

---------------------------------------------------------------------------------------------------------------------------
## 6. Modules

| Module | Owner | Contents |
|---|---|---|
| `98a_rp_worlds_data.js` | main | worlds, the six maps (paths, twists, waves), monster stats/info/variant names, wave pools, mastery tables, art registries |
| `98b_rp_worlds_core.js` | main | unlocks, tier caps, hub world switcher and world armories, waves per world, monster abilities, twists, jams |
| `98d_rp_w2_mobs.js` | agent | World 2 monster art: 8 monsters x 3 variants, death bits, icons |
| `98e_rp_w3_mobs.js` | agent | World 3 monster art |
| `98f_rp_w2_art.js` | agent | World 2: three map bakes, castles, caves, animated layers, twist visuals, world painting |
| `98g_rp_w3_art.js` | agent | World 3: the same, most detailed |
| `98h_rp_hive_art.js`, `98i_rp_hive.js` | agent | Clockwork Hive art and battle |
| `98j_rp_grav_art.js`, `98k_rp_grav.js` | agent | Singularity Engine art and battle |
| `98m_rp_mastery.js` | main | mastery XP, levels, 60 skins (recolour + effects), UI |
| `98z_rp_worlds_late.js` | main | outermost hooks (jams block every tower's fire), final styles |

Art registries (in 98a, filled by the art modules; the core uses them when present and falls back to plain art):
- `RPW.bake[mapId] = map => B` returns the baked map like `rpBake` (`{c, pal, G, trees, cast, id}`).
- `RPW.amb[mapId] = (c, R) => {}` the animated layer drawn above the ground, below monsters (and `RPW.ambTop[mapId]` above).
- `RPW.twist[mapId] = (c, R) => {}` twist visuals (tide water, fog, whirlpools, gusts, switch lever, lightning...).
- `RPW.world[worldId] = () => ({c, nodes})` the 1600 x 900 world painting and map node positions.
- `RPW.icon[mapId] = (w, h) => canvas` the small map picture (next-region cards).
- `RPW.castleHit[mapId]` optional.
Monster art registers into the existing `RPMOB`/`RPMD`/`RPMB`/`RPMK` tables and handles its variants in `rpvDraw`/`rpvV`.

Twist state on `RPX` (read by the art): `R.tide = {k: 0..1 flood level, high: bool}`, `R.fog = [{x, y, rx, ry}]`,
`R.cannon = {t, x, y, fire: 0..1, tx, ty}`, `R.gust = {k: 0..1}`, `R.sw = 0|1` (switch: north|south) and `R.swK` (lever
animation), `R.bolts = [{x, y, t, d, tw}]`, `R.rodK = [0..1 per rod]`. Monster state: `e.shellT, e.puff, e.glim, e.shield,
e.dive, e.leap, e.vent, e.guardK, e.hasteK`. Tower state: `tw.jam, tw.jamBy ('ink'|'emp'|'bolt')`.

---------------------------------------------------------------------------------------------------------------------------
## 7. Quality bar for the art
- Same style as World 1: chunky `#12081f` outlines, bright fills with soft shading, cute-menacing faces, springy motion.
- World 2 has more prop kinds and an animated layer World 1 does not have (water, gulls, fog); World 3 has the most (parallax
  clouds, gears, belts, steam, rain, lightning). The Kraken's Maw and Storm Citadel are the showpieces of their worlds.
- Monsters: 8 baked frames (like 95b), readable at 0.85x on the road, each variant with real accessories, not just a recolour.
- Performance: everything static is baked once; per-frame layers stay under ~1 ms; no shadowBlur, ctx.filter or screen /
  soft-light blends. Performance mode thins the animated layers.

---------------------------------------------------------------------------------------------------------------------------
## 8. Testing and balance
- `t_w10a.py` (worlds, unlocks, hub, waves, abilities, twists, jams), `t_w10b.py` (mastery and skins), `t_hive.py`,
  `t_grav.py`, art tests from each agent (screenshots of every map, monster sheet, tower tier sheet).
- Balance with `tools/td/endless_combo.py` style bots on every new map: a sensible mixed build wins with 2-3 stars, a lazy
  build loses; the new towers are useful but not dominant.
- Regression: all 66 tests, plus the new ones.

## 9. Milestones
1. Plan (this file) and the data module; art agents start in parallel workspaces.
2. Core: worlds hub, unlocks, tier caps, waves, monster abilities, twists, jams - playable with placeholder art.
3. Mastery: XP, levels, 60 skins, Tower Skins screen.
4. Merge art: World 2 and 3 maps and monsters, Clockwork Hive, Singularity Engine.
5. Balance with bots, tests, screenshots, regression, delivery.
