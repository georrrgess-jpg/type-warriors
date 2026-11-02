# Update 10.1: Tower Defense polish and a new 8-ball table

The owner asked for: large improvements to tower defense; the two new towers available from the very start and on every map; no UI
discrepancies anywhere in tower defense; better looking, smoother, more detailed, more animated and more interactive new worlds;
tower-to-tower interactions tuned so they are smooth and functional on old and new maps; the new monsters bug free; tower defense
visually stunning and addictive; and in 8-ball a brand-new table with cool, unique players with their own looks and animations.

## Workstreams (each an isolated workspace, merged by the lead)

| Name | Owns | Prefix | What |
|---|---|---|---|
| tdui | 98b, 98m, 98n edits; new `98o_rp_ui101.js` | `rpu` | Hive and Engine open from the start on every map (World 1 included; bar and ring always fit 12; tests updated). A full UI audit of tower defense: hub (all three worlds), tower bar, build ring, info panel, tooltips, ability bar, Rune Typing, wave preview, boss bar, banners, toasts, pause, settings, results, Tower Skins, How to Play, the locked / next-world cards, at the 1600x900 stage and at small window sizes; every overlap, clipped text, misaligned or inconsistent element fixed. "Addictive" polish: juicier feedback (wave-clear fanfare, kill-streak combos, star reveals, mastery progress on results, a daily first-win bonus already exists, show it), without breaking the economy. |
| w2polish | `98f_rp_w2_art.js`, `98f2_rp_w2_art2.js` (+ new `98f3`) | `rpw2a` | World 2 maps and painting: more detail, richer and smoother animation, and interactivity (things react to clicks / taps and to battle events: gulls scatter, crabs duck, the lighthouse sweeps, the kraken eye follows the pointer, splashes when monsters wade...). Smoothness: no frame spikes, bakes cached, lite mode. |
| w3polish | `98g_rp_w3_art.js`, `98g2_rp_w3_art2.js` (+ new `98g3`) | `rpw3a` | The same for World 3 (windmills, airships, gears, sparks, storm), the most detailed world. |
| interact | new `98p_rp_interact.js` (overrides only), tests | `rpia` | Audit every tower against every tower and every monster ability on old and new maps: buffs (Hive pollen, Still soak, lightning rods, Glowcaps, Overcharge, Starfall marks), crowd control (frost and honey slows, Tidecaller push, Engine pull, whirlpools, conveyors, vents, haste), jams (all 12 towers), hidden / glimmer / dive / leap / shields / guard, splits and spawns, bosses. Fix bugs and rough edges (stuck monsters, double pulls, NaN, monsters pushed off the road, effects left over after a wave, targeting of hidden monsters, stacking that breaks balance). A test that plays every map with every tower. |
| pool | new modules after the last pool module | `pzn` | A second venue for The Crooked Cue: a brand-new table (its own felt, rails, pockets, lighting and room) and a roster of new players with distinct looks, idle and shot animations, reactions and personalities (AI), a way in from the pool hub, progression and stakes in line with the existing money rules, tests and screenshots. |

## Rules
CLAUDE.md applies (art style, performance, owner rules: no bell notice, no model ids, kill servers by PID). Each agent works only in
its workspace (`tools/ws.sh`), never commits, adds a test, saves screenshots under `type-warriors-source/shots/w101_<name>/`, and
reports in under ~400 words. The lead merges, checks names for clashes, runs every suite and the regression, balances, delivers.
