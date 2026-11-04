# Tower Defense 10.2: two new towers and a battle-UI upgrade

Goal: a mini update that makes Runestone Tower Defense clearly better. Two new towers (one a strong value pick, slightly
overpowered but not game-breaking), and quality-of-life features and UI fixes in battle, on results and on the hub.
Built by three agents in isolated workspaces (`tools/ws.sh`), merged and balanced by the lead.

## 1. Moonblade Sentinel (tower 13, key M, id `moon`, prefix `rpmb`) - the value pick
A carved moonstone guardian on a plinth holding a crescent glaive. It hurls spinning crescent glaives that fly out along a
curve through the target, past it to the edge of its range, and boomerang back to its hand. A glaive damages every monster it
passes through, once on the way out and once on the way back. Ground and air, armor-piercing.
- Start numbers (to be tuned): cost 300/220/420/850/1450, range 210/225/240/255/270, damage per pass 30/46/70/105/160,
  reload 1.4/1.3/1.2/1.1/1.0 s, glaives 1/1/2/2/3, armor-piercing 2/3/all/all/all.
- Tier 2 Keen Edge: sharper, faster glaives. Tier 3 Twin Moons: two glaives on mirrored curves. Tier 4 (Mythic) Moonlit Wake:
  glaives leave a silver trail on the road that slows monsters 20% for 1.5 s. Tier 5 (Celestial) Eclipse: every 5th throw an
  eclipse crescent circles the tower for 3 s and cuts everything it touches.
- Balance target: slightly overpowered. About 15-25% more value per supply than the other towers in the bot tests, never a
  one-tower win: Ballista-only-style builds of Moonblades must still lose the harder maps, and the endless Wonderland reach
  with it in the strong build stays within about +10 waves of the reference.

## 2. Phantom Lantern (tower 14, key L, id `lant`, prefix `rpln`) - the showpiece
A haunted iron lantern hanging from a gnarled grave-post over a small crypt, a hooded spectral keeper inside the glass.
- Soul wisps: fires ghostly wisps that home on monsters, deal damage and Haunt them (damage over time that ignores armor).
- Soul harvest: monsters that die within its range (from any tower) send their soul into the lantern (the jar fills).
- Phantom Host: with enough souls the lantern sends a phantom knight down the road the wrong way (from the road point nearest
  the lantern towards the spawn). It cuts every ground monster it walks through until its will is spent or it fades.
- Start numbers: cost 450/300/560/1050/1750, range 220/232/245/258/270, wisp 40/58/84/120/175, reload 1.2/1.1/1.0/0.95/0.9 s,
  haunt 8/12/18/26/38 per s for 3 s, souls needed 6/6/6/5/5, phantom damage 60/90/130/180/260 per monster, will 4/5/6/7/9
  monsters, phantoms walk 70 px/s for at most 8 s.
- Tier 3 Grave Chill: phantoms chill (30% slow, 2 s) and wisps jump to a second monster. Tier 4 (Mythic) Spectral Legion: two
  phantoms per release. Tier 5 (Celestial) The Reaper: every third release is the Reaper, a huge phantom with a scythe that
  finishes non-boss monsters below 15% health (bosses take heavy damage).
- Balance target: level with the Prism, Dragon Roost and Hive per supply.

## 3. Both towers (each agent)
Art module (five tiers: tier 4 violet Mythic, tier 5 white-gold Celestial like the others; baked sprites, idle animation,
live parts under ~0.15 ms per tower), battle module (RP_TW / RP_TWORDER / RP_KEYS / RPTW entries, info panel lines, help and
How to Play texts, five mastery skins in RPY_SET, Target modes, Overcharge, jams, fog, hidden monsters, Glowcap range,
Performance mode / lite / reduced motion), a test (`t_moon102.py`, `t_lant102.py`) and a bot balance check.

## 4. Battle UI and features (agent, prefix `rpq`, module `99e_rp_ui102.js`, test `t_ui102.py`)
- Damage meter: damage dealt per tower (attributed to the tower that caused it), shown in the info panel; a results card
  section with the MVP tower and the top towers' damage bars.
- Call the next wave early: while a wave runs, the Next Wave panel (and Space / Enter) sends the next wave now for bonus supply
  scaled by the time saved. Auto-start next wave toggle in TD Settings.
- A richer Next Wave preview: up to three monster types with counts and flying / armored / boss / ability badges, with a hover
  card.
- The tower bar, build ring, How to Play, Tower Skins and results scale to 14 towers with no overlaps at 1600x900, 1280x720
  and 1024x640.
- Any other battle / hub UI and functionality problems found on the way (with screenshots and the overlap audit).

## 5. Lead
Merge, register modules (99a-99f after 98v), mastery skins and DEV cheats for the new towers, balance with
`tools/td/world_balance.py` and the bots, screenshots, HANDOFF 10.2, full regression, delivery. No Updates-tab notice.
