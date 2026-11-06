# Update 10.4: the Harvest Festival (fall / Thanksgiving)

A large seasonal update to the same standard as the Halloween update (Graveyard Crate with its midnight ritual, twelve Halloween
relics with a gear ability, Trick-or-Treat with candy corn and the Candy Stall, Monster Mash, the events card on the home screen).
The festival runs from 6 November to 1 December 2026 (local time; Thanksgiving is 26 November). Shared ids, names, dates and prices
live in `99m_fl_core.js` (prefix `fl`); every part below uses them.

## 1. The Harvest Chest (agent A; `99o*`, prefix `flc`)
- A new chest in the spirit of the Graveyard Crate: crate key `f`, count `P.fcr`, name "Harvest Chest". Its own painted chest (a
  wicker-and-oak harvest chest wrapped in vines, a carved pumpkin lock, wheat sheaves, a lantern) and its own full opening sequence:
  a moonlit pumpkin patch and corn field under a rising harvest moon, a scarecrow turning to watch, a gust whirls the leaves, one
  harvest lantern lights per rarity tier with a deep wooden chime, crows burst from the corn at Epic, the moon turns gold at
  Legendary, and at Mythic the cornucopia spills gold and the Mythic turkey's feathered silhouette fans across the moon. Every sound
  synthesized live and timed to the picture, like the Graveyard ritual (`84f_gy_crate.js`). The Graveyard and Celestial chest
  animations are not touched.
- Drops: the twelve harvest relics (section 2) by rarity, coins / XP / acorns as filler, and a small chance of the Rare and
  Legendary harvest companions (section 3). Odds shown in the shop the same way as the Graveyard Crate (Legendary/Mythic odds secret).
- Ways to get it: the Harvest Market (acorns), Harvest Moon Rush rewards, the Harvest Calendar, and the shop for coins.
- The crates menu and the shop get a Harvest Chest card and a "Harvest Collection" window like the Graveyard Collection (`68e`).

## 2. Harvest gear (agent B; `99n*`, prefix `flg`)
Six armors and six weapons, one per rarity, drawn through the kit renderer like the Halloween relics (`83_hw_gear.js`,
`83b_hw_weapons.js`), with the same stat bands per rarity.
| Rarity | Armor | Weapon |
|---|---|---|
| Common | Harvest Smock `flsmock` | Hayfork `fl_fork` |
| Uncommon | Orchard Keeper's Vest `florch` | Baker's Rolling Pin `fl_pin` |
| Rare | Maplewarden Mail `flmaple` | Maple Longbow `fl_maple` |
| Epic | Cornstalk Sentinel `flcorn` | Acorn Flail `fl_acorn` |
| Legendary | Harvest Moon Regalia `flmoon` | Cranberry Glaive `fl_glaive` |
| Mythic | Feastlord's Aegis `flfeast` | Horn of Plenty `fl_horn` |
- The two Mythics are sold in the shop (100,000 coins each, 175,000 for both, like the Halloween Mythics) and can drop from the chest.
- They carry a new gear ability, **Bountiful Harvest** (`84g_gear_ability.js` style), stronger as a set: a harvest meter fills on
  correct words; when full, a cornucopia bursts over the field (damage / slow / bonus score on screen, bosses partly spared), with its
  own art and sound. Balanced against Soul Harvest.

## 3. Harvest companions (agent C; `99p*`, prefix `flp`)
One per pet rarity, in the companion system (`87a`-`87j`, Mythic tier in `87i_pet_mythic.js`):
- Rare **Acorn Scamp** `flsquir`: a red squirrel in an acorn-cap helmet with a stash of acorns.
- Legendary **Emberleaf** `flfox`: a fox whose tail is a plume of glowing maple leaves.
- Mythic **Thunderplume, the Harvest Turkey** `flturkey`: a great turkey with a fanned tail of autumn feathers and a woven harvest
  crown. Epic ability **Grand Feast**: after a run of correct words it fans its tail and lets out a thunderous gobble; a shockwave of
  feathers and leaves stuns the field, every monster drops a feast morsel (score / heal) and the turkey's banquet buff runs for a few
  seconds. Full hatch animation, Hall portrait, card, idle and ability animations, sound.
- Not in the Runeshell / Crownheart / Starforge pools. Rare and Legendary: Harvest Chest (small chance) and the Harvest Market.
  Thunderplume: the Golden Harvest Egg, sold in the Harvest Market (acorns) and the shop (coins), and on Thanksgiving day in the
  Calendar for players who claimed every earlier day.

## 4. The Harvest Festival event (agent D; `99q*`, prefix `fle`)
- **Acorns** (`P.fl.ac`), the festival currency: earned by playing (campaign, endless, tower defense, the riddle, Harvest Moon Rush),
  daily Gratitude tasks and the Calendar. After the festival leftover acorns stay spendable for seven days, then the market closes.
- **Harvest Market** stall (like the Candy Stall): Harvest Chests, the Rare / Legendary companions, the Golden Harvest Egg, a fall
  hero trail and title, and the festival's cosmetic extras.
- **Harvest Calendar**: one present per day from 6 November to Thanksgiving (26 November) with bigger days on weekends and a feast on
  Thanksgiving; a missed day can be caught up with acorns.
- **Gratitude tasks**: three small daily tasks across modes.
- **Home**: the events card shows the Harvest Festival (Halloween events stay reachable until they end on 8 November), and falling
  leaves drift over the home screen during the festival (cheap, off with reduced motion / Performance mode).
- Festival trophies.

## 5. Harvest Moon Rush (agent E; `99r*`, prefix `flr`)
A limited-time Endless variant like Monster Mash (`84a`-`84c`): a pumpkin patch, a corn maze and an orchard under the harvest moon;
nine fall monsters (scarecrows, crows, gourd golems, corn wraiths...) and three bosses; each level a seasonal twist on the words
(gusts blow letters, leaf piles cover parts of words, a crow steals a letter...). Pays acorns and Harvest Chests, works with every
weapon, armor, boon and companion.

## 6. Rules
Same art style and performance rules as the rest of the game; every screen checked at 1600x900, 1280x720 and 1024x640 with no
overlaps; tests per part; no Updates-tab notice without the owner's okay; save data repaired on load; the cheat guard untouched
(coins only through the game's own code).
