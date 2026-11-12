# Update 10.6: premium ball sets for The Crooked Cue

Owner request: "more balls that are visually appealing, and more expensive" for the pool mode.

## Goal
Six premium ball sets in the Cue Rack, priced above everything sold today (the dearest shop set is Neon Nights at 8,000):
| Set | Price | Material | The look |
|---|---|---|---|
| Harvest Amber (`amber`) | 15,000 | warm translucent resin | solids: tinted amber with trapped leaves, seeds and bubbles; stripes: cream resin caps; 8: smoked black amber |
| Cathedral Glass (`cathedral`) | 20,000 | stained glass | solids: leaded mosaic of glowing glass cells in the ball's colour; stripes: frosted clear caps; 8: black glass with gold lead lines |
| Glacier Crystal (`glacier`) | 25,000 | ice | solids: tinted ice with fracture lines and frost; stripes: frosted white caps with sparkling crystals; 8: black ice |
| Dragonscale (`dragon`) | 35,000 | overlapping scales | beveled scales with metallic sheen; stripes: ivory pearl scales; 8: black scales with a molten edge |
| Aurora Opal (`opal`) | 50,000 | precious opal | milky body tinted in the ball's colour with shifting rainbow flashes; stripes: white opal; 8: black opal |
| Diamond Brilliance (`diamond`) | 75,000 | brilliant-cut diamond | fine radiating facets, rainbow fire and star glints; solids: fancy coloured diamonds; stripes: white diamond; 8: black diamond |

All six obey the owner's ball rule (CLAUDE.md, enforced by `t_pzb102.py`): solids coloured all over, stripes with clearly lighter caps above and
below a coloured band, the 8 clearly the darkest ball with a high-contrast disc, a white cue ball, readable numbers. Each set looks different from
every older set (Gemstone's coarse facets, Starfall's nebula, Champion Gold's chrome, Moonstone's pearl).

## Code
- `97b6_pz_balls105.js` (lead; prefix pzb3): one shared painter `pzb3Paint` (a copy of 97b5's with the material pulled out into a callback) and
  `pzb3Reg({id, n, price, tag, pal, mat})`. `pzbPaint` hands registered sets to it; older sets paint exactly as before.
- `97b7` (amber, glacier), `97b8` (cathedral, opal), `97b9` (dragon, diamond): one module per pair of sets, built by three agents in parallel.
- Lead: the Cue Rack's ball tab (14 sets no longer fit one row of cards: a scrolling strip with arrows and a PREMIUM mark), tag lines, prices,
  tests, HANDOFF 10.6, regression, delivery. No Updates-tab notice unless the owner asks.
## Tests
`t_pzb102.py` measures every set in `PZ_BALLS` (so the new ones are checked automatically); `t_pzb105.py` adds: the six sets exist with the right
prices, are bought in the Cue Rack (hold to buy, coins taken once, owned and equipped), draw in a match and in Trick Shots, the Cue Rack fits at
three sizes with fourteen sets, paint cost per ball within budget, no page errors.
