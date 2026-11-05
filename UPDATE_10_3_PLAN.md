# Tower Defense 10.3: Potions

Goal: a polished, balanced potion system for Runestone Tower Defense. Potions are brewed between battles with coins and carried
into battle in a three-slot satchel; in battle each is used once for a short, clearly visible effect. They help a player who uses
them well, but they never decide a map on their own and never replace towers.

## 1. The potions (start numbers, tuned by the balance test)
| Potion | Kind | Effect | Brew cost | Opens |
|---|---|---|---|---|
| Fury Draught (red) | drink | every tower deals +25% damage for 12 s | 300 | from the start |
| Quicksilver Tonic (silver) | drink | every tower fires 30% faster for 10 s | 300 | from the start |
| Frostbite Flask (blue) | throw | monsters within 110 px freeze for 2.5 s (bosses and slow-immune: 50% slow instead) | 350 | from the start |
| Dragonfire Bomb (orange) | throw | 260 damage within 90 px, then burning ground 5 s (40/s) | 400 | 6 stars |
| Elixir of Mending (green) | drink | the castle regains 5 health over 5 s (never above its maximum) | 450 | 12 stars |
| Hourglass Brew (violet) | drink | every monster on the map moves 35% slower for 6 s | 500 | 18 stars |
| Gilded Tonic (gold) | drink | kills give +50% supply for 20 s (coins unchanged) | 350 | World 2 open |
| Seer's Tincture (teal) | drink | for 15 s towers see through fog and hiding (dive, glimmer, leap) and gain +15% range | 400 | World 3 open |

## 2. Rules that keep them fair
- A satchel of three slots, chosen before a battle; each slot is used once per battle (at most three potions per battle).
- Potions share a 20 s cooldown after any use; none in the first 10 s of wave 1.
- Brewing costs coins (a coin sink); at most 5 of each potion in stock. A first-time gift: one Fury Draught and one Frostbite Flask.
- Drink effects do not stack with themselves; the strongest of a kind applies. Thrown potions follow the 10.1/10.2 interaction rules
  (hidden monsters are not hit, bosses take reduced crowd control, slow-immune venting golems are not frozen).
- Championship (endless Wonderland) runs may use potions with the same limits; the results and the board entry show a small satchel
  mark with the potions used.
- Potions used are spent whether the battle is won or lost.

## 3. Screens and feel
- **Apothecary** on the tower-defense hub: a candle-lit alchemy room (shelves of bottles, a bubbling cauldron), the eight potions as
  cards (art, effect, stock, cost, lock reason), hold-to-brew with a cauldron animation and a bottle that drops into the stock, and the
  satchel (three slots) to fill by click or drag.
- **Battle:** a potion belt beside the abilities (three bottles, keys 4 / 5 / 6, stock and cooldown sweep, tooltip). Drinks: the
  bottle uncorks, a coloured wave rolls over the map and a buff chip with a timer appears. Throws: aim like the Slow Field with a
  range ring; the bottle arcs from the castle and shatters with a splash. Rune Typing gets words for potions.
- Results: potions used. First-time tips. Help and How to Play texts. DEV cheats for potions.
- Art in the game style (chunky #12081f outlines, indigo glass, gold), baked bottles, cheap effects (perf rules), reduced motion and
  Performance mode versions.

## 4. Balance targets (bot test)
- A bot that uses three potions well gains a little: on the nine campaign maps, a few more health or one more star at most where it
  was close; endless Wonderland reach at most about +5 waves over the same build without potions.
- No potion alone turns a lost bot build into a win on the harder maps more often than one extra mid-price tower would.
- Each potion's value is within a sensible band of the others (no must-pick, no useless one).

## 5. Modules and tests
`99h_rp_potion_data.js` (data, save `P.rp.pot`), `99i_rp_potion_art.js` (bottles, effects), `99j_rp_potion.js` (battle, belt,
Apothecary), prefix `rppt`; test `t_pot103.py` (mechanics of every potion, limits, cooldowns, interactions, save repair, UI fit at
three sizes, frame cost, no errors) and a balance test `t_potbal103.py`. No Updates-tab notice.
