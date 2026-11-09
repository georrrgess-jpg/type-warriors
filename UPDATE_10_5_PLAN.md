# Update 10.5: The Great Turkey Trot (a new casino game)

## 0. The decision
The owner offered three directions: a new casino game, a new mode (not wanted), or a new chest to pursue. This update is
**a casino game**, for three reasons:
- The casino has no **racing / spectator** game. It already has cards (Blackjack, Higher or Lower, Wildcard), chance (Slots,
  Roulette, Dice, Plinko, Nebula Scratch), ladders (Tower Climb, Rocket, Penalty Kings), skill (Crooked Cue, Quiz). A race you
  bet on and then watch is a new feeling: pick a runner, cheer, sweat a photo finish.
- A chest was shipped one update ago (the Harvest Chest). A second chest now would compete with it during the festival.
- It ties into the Harvest Festival (a Thanksgiving turkey trot at the harvest fair) without being a festival-only feature: the
  game stays in the casino all year, and during the festival it also pays a few acorns.

**The Great Turkey Trot**: six turkeys, each ridden by a tiny monster jockey in racing silks, race round a harvest-fair track.
Read the race card, back a turkey (or two, or three), watch the race, and cash out early if your runner is fading. No typing.

Goals: **fun in the first ten seconds** (one tap on a turkey, one tap on Start), **readable** (a newcomer understands odds from
the multiplier on the button), **fair** (every bet type returns about 95% over time, proven by a test), **lag-free**, and
**polished to the Penalty Kings / Crooked Cue standard** (baked art, rigs, sound, first-visit tutorial, tile, tests).

---

## 1. How it plays (player's view)
1. **The paddock (race card).** Six runners in rows: number cloth, portrait, name, running style, form (last five finishes as
   small medals), a one-line tip ("Loves a soft track", "Fades late"), and an **odds button** showing the payout multiplier for a
   win (e.g. `×4.2`). Today's **going** (Firm / Good / Muddy) and the weather sit above the card. Tapping a runner selects it.
2. **The bet slip** (right). Bet type tabs:
   - **Win**: your turkey finishes first.
   - **Top 2**: first or second (lower multiplier).
   - **Top 3**: anywhere in the first three (lowest multiplier).
   - **Exact 1-2**: pick the winner and the runner-up in order (big multiplier). The slip asks "1st?" then "2nd?".
   Stake with the usual casino bet bar (chips and the max 5,000 rule). "Add to slip" adds the bet; **up to three bets per race**
   (e.g. a Win and a Top 3 on two different turkeys). The slip shows each bet's possible return and the total, with
   "Max payout 20,000 per race".
3. **Start the race** (gold button, Space). Stakes are taken and saved now. A short "call to the post" fanfare, the turkeys step
   into the starting gate, the gate snaps open.
4. **The race** (about 20-25 s). Side-on track scrolling with the leaders across a baked harvest fair (barns, hay bales, bunting,
   pumpkin stacks, a monster crowd in the stands, the harvest moon at dusk). A **position strip** along the top (six number dots
   moving toward the finish flag), a **commentary ticker** at the bottom ("Gravy Train takes the lead!", "Pumpkin Spice stops to
   stare at a pie!", "Here comes Wishbone on the outside!"), your runners ringed in gold.
   Race events, all part of the simulation: a **hay-bale stumble**, a **corn kernel burst** (short boost), a **pie distraction**
   (the turkey stops for a beat), a **gust** that slows the field, a **late kick** by closers.
   **Cash out** (C or the button): while the race runs, each of your bets shows a live offer ("Cash out 340") priced from the race as
   it stands; take it and the bet is settled now. Offers update about once a second and are greyed in the last 10% of the race.
5. **Photo finish.** If the first two are within a hair at the line, the screen freezes into a sepia **photo** that develops,
   then reveals the winner by a beak.
6. **Results.** A podium (1st/2nd/3rd turkeys with their jockeys celebrating), your bets ticked or crossed with what each paid,
   the total, and buttons **Race again** (same stakes, new card; Enter), **New card**, **Back** (Esc).

First visit: a three-card How to Play (pick a turkey, choose a bet, watch and cash out). Help (?) reopens it.

---

## 2. The runners
A fixed stable of **12 turkeys**; each race draws six of them. Each has a personality the race model uses and the card shows:

| # | Name | Style | Personality (card tip) |
|---|---|---|---|
| 1 | Gravy Train | Front-runner | Fast away, can tire |
| 2 | Cranberry Comet | Closer | Saves a big late kick |
| 3 | Sir Gobblesworth | Stalker | Steady, rarely makes mistakes |
| 4 | Pumpkin Spice | Front-runner | Easily distracted by pies |
| 5 | Wishbone Willie | Closer | Loves a muddy track |
| 6 | Butterball Bolt | Stalker | Strong but heavy on a firm track |
| 7 | Maple Mayhem | Front-runner | Wild: big bursts, big stumbles |
| 8 | Drumstick Dash | Stalker | Quick in the gate |
| 9 | Acorn Annie | Closer | Small and nimble, hates gusts |
| 10 | Stuffing Stampede | Front-runner | Keeps going when others fade |
| 11 | Hayride Hank | Stalker | Old pro, loves a firm track |
| 12 | Duchess Thunderplume | Closer | Grand, slow to start, huge finish (a nod to the festival's Mythic turkey; the companion itself is not a racer) |

Stats per turkey (hidden numbers, shown as words and form): `spd` base speed, `sta` stamina, `kick` late burst, `gate` start,
`focus` (resists distractions), `going` preference (firm/good/mud bias), `wild` (variance). Jockeys: twelve small monsters from the
game's cast (a goblin, a mossling, a bat, a frost imp...) in silks of the turkey's colours, drawn on the turkey's back.

The stable keeps lifetime records in the save (starts, wins, places) and the card shows each turkey's last five finishes.

---

## 3. Fair odds (the core of the design)
- **One deterministic race model** (`gttSim(field, going, seed)`): fixed 30 Hz steps over a 1,000 m track. Each step every
  runner's speed = base × phase factor (gate / cruise / fatigue after `sta` / `kick` in the last third for closers) × going factor
  × a smoothed random walk (`wild`) × event effects. Events are rolled per runner per second from its stats (stumble, burst,
  distraction) and per race (gust). The race ends when all six cross the line; positions and finish times are exact.
- **The result is fixed when stakes are taken.** At Start the game draws a seed from `crypto.getRandomValues`, stores it with the
  bets in the save (`P.gtt.pend`), and the race shown is `gttSim` replayed from that seed. Nothing the player does after Start
  changes the result. A reload mid-race finishes the race from the save (shows the result screen with the same outcome) and pays
  exactly once. Leaving the casino mid-race (`CAS.flush`) settles the same way.
- **Pricing by Monte Carlo** when a card is drawn: run `gttSim` 4,000 times with other seeds (spread over a few frames, or in
  chunks during the paddock animation; the card shows "Setting the odds..." for at most ~0.5 s) to get each runner's P(win),
  P(top 2), P(top 3) and the 30 exact 1-2 probabilities.
  `multiplier = floor_to_step(GTT_RTP / p)`, with `GTT_RTP = 0.95`; steps: 0.05 below ×3, 0.1 below ×10, 0.5 below ×25, 1 above.
  Clamp: at least ×1.10; Win at most ×40, Exact at most ×150; a probability under 0.6% is not offered ("—" on the card).
  Exact 1-2 needs the most samples: use 6,000 runs for the exact table, or Laplace-smooth the 30 cells.
- **Cash out offer** for a live bet = `GTT_CO_RTP (0.93) × P(bet wins | race so far) × bet payout`, with the probability estimated
  by 300 short simulations forward from a copy of the current race state (continuations drawn with fresh seeds, not the hidden
  seed), spread over frames (about 60 per frame). No offer in the last 10% of the track or when the offer would be under 1 coin.
  Because the offer is below the bet's fair value, cashing out never beats letting it run over time.
- **Limits**: each bet 10-5,000 (`casCap`); the total staked per race at most 5,000 (same table limit as the rest of the casino);
  every race pays at most `GTT_CAP` 20,000 (like Penalty Kings and Tower Climb); a slip whose best case is above the cap shows
  "Capped at 20,000".
- **Proof (test)**: 200,000 headless races per bet type with the published multipliers: return between 0.90 and 0.965 for Win,
  Top 2, Top 3 and Exact; no runner is a must-back (each runner's Win return within 0.88-0.97); the cash-out strategy "always cash
  out at half way" returns less than holding.

---

## 4. Screens and art
All canvas art is **baked once** (backgrounds, turkey and jockey frames) and drawn as images per frame; the game screen is
HTML panels in the casino's style (indigo glass, gold, Pirata One titles, Poppins UI, chunky `#12081f` outlines).

**Paddock (race card) at 1600×900:** left 60%: six runner rows (92 px each) with a live idle portrait (a baked 6-frame strut,
on `LIVE`), number cloth in the silk colours, name, style chip, form medals, tip line, and the odds button for the selected bet
type. Top: "THE GREAT TURKEY TROT" title, race number, going and weather icons. Right 40%: the bet slip (tabs, stake bar, bet
lines, total return, Add to slip, Start race). Bottom-left: "New card" (draws a fresh field), stats link (wins, biggest payout,
favourite turkey). Selecting a turkey plays a short gobble and a strut in its row.

**Race screen:** full stage canvas.
- Background: three baked parallax layers (sky with harvest moon and clouds; far fair with barns, ferris wheel, bunting, crowd
  stands with a waving monster crowd in two frames; near rail, hay bales, pumpkin stacks, furlong posts with distance markers),
  one long track ribbon (dirt, muddy or firm tint by going), finish post with a checkered banner.
- Turkeys: a rig drawn from baked parts per turkey (body, fan tail in its colour pattern, wattle, head, two legs) with an
  8-frame run cycle baked per turkey at load (6 runners × 8 frames, small canvases), plus live bits: head bob, tail flutter,
  feathers puffing on a stumble, dust kicked up, a speed streak during a burst. Jockeys baked on top in silks (number on the back).
- Events: a hay bale that tumbles, a corn burst with sparkles, a pie on a fence post that the turkey stares at with "!?", a gust
  of leaves across the screen (reuse the festival leaf sprites).
- Camera: follows the leading group with easing; in the last 15% it widens to keep the first three in shot; screen shake only
  on the gate opening (off with reduced motion).
- HUD: position strip (top), your bets panel with live cash-out offers (right), commentary ticker (bottom), race clock.
- Photo finish: freeze, a sepia film frame that develops (opacity), a finish-line overlay and a "by a beak" label.

**Results:** podium with the top three turkeys and jockeys celebrating (tail fanned, jockey arms up), confetti, your bet lines
with ✓/✕ and amounts, totals, buttons. Big wins use the casino's `bigWin`.

**Casino tile** `TA.gtt` (SVG like `TA.pk`): turkeys mid-stride at the finish line under the harvest moon, bunting, a gold "NEW"
badge (reuse the Penalty Kings badge CSS). Placed first in GAMES while new.

---

## 5. Sound (Web Audio, synthesized like the other casino games)
Call-to-post bugle (short fanfare), starting gate clang, turkey footfalls (soft pitter-patter, pitched per runner), gobbles
(reuse `flcGobble` from 99o2), crowd murmur that swells to a roar in the final stretch, a commentator "ding" on ticker lines, a
camera shutter for the photo finish, a win jingle and podium fanfare, a soft thud for a lost bet. All behind the existing sound
switches; nothing plays when muted.

---

## 6. Festival tie-in, trophies, stats
- **During the festival** (`flOn()`): a race where any of your bets wins pays **+5 acorns** through `fleGive` (at most 10 races a
  day, 50 acorns), shown on the results line "+5 acorns". A new Gratitude task "Back a winner in the Great Turkey Trot" may join the
  task pool (+20 acorns) if the 99q task code accepts new tasks cleanly; otherwise skip it.
- **Trophies** (in `ACH`, category Casino; small coin rewards like other casino trophies):
  - *Off to the Races*: run your first race.
  - *Backed a Winner*: win a Win bet.
  - *Longshot*: win a Win bet at ×15 or more.
  - *Called It*: win an Exact 1-2 bet.
  - *By a Beak*: your runner wins a photo finish.
  - *Smart Money*: cash out a bet for more than its stake.
- **Stats** `P.gtt`: races, bets, wins, best payout, longshot record, favourite turkey (most backed), per-turkey records.
- **Help / How to Play**: three illustrated cards; the casino help lists the game.

---

## 7. Code plan (prefix `gtt`, constants `GTT*`, save `P.gtt`)
Prefix check: `gtt` / `GTT` are unused today (verify again with a grep before writing; `TRT` and `tt*` are taken by Trick-or-
Treat and the time trial). Modules after `99t_update89.js`, registered in both build lists with `tools/addmod.sh`:

| Module | Contents |
|---|---|
| `99u_gtt_data.js` | `GTT` constants (RTP, cap, limits, steps), the 12 runners, jockeys, silks, tips, going and weather, commentary lines; save normaliser `gttNorm()` (repairs `P.gtt` on load) |
| `99u2_gtt_sim.js` | seeded PRNG, `gttSim`, step function, events, `gttPrice(card)` (Monte Carlo odds, chunked), `gttLive(state)` cash-out estimator, `gttSettle(bets,result)`; pure functions, no DOM, usable headless by tests |
| `99u3_gtt_art.js` | baked backgrounds, turkey rigs and run cycles, jockeys, props, photo-finish frame, podium, `TA.gtt` tile; `gttDraw*` |
| `99u4_gtt_game.js` | paddock and race screens, slip, stake flow (`cTake`/`cPay`), pending race in the save and resume on load, `CAS.flush`, keyboard, results, trophies, acorns, `GAMES` entry, first-visit tutorial |
| `99u5_gtt_audio.js` | all sounds |
| `99u6_gtt_style.js` | CSS for paddock, slip, HUD, results, tutorial; fits 1600×900, 1280×720, 1024×640 |

Integration rules (from CLAUDE.md and how Penalty Kings did it):
- Money only through `cTake` / `cPay` (the 98t / 98v cheat guard must keep working; tests use `window.TW_AC_TEST`). Stakes are
  taken and saved at Start; payouts happen once, from `gttSettle`, with the pending record removed in the same save.
- `CAS.flush` settles a running race on leave; the lobby and game list are locked while a race runs.
- Keyboard: 1-6 pick a turkey, W / T / 3 / E bet type, + / - stake, Enter add to slip or race again, Space start, C cash out,
  N new card, Esc back. Touch: everything is a button.
- Performance mode / reduced motion: no camera shake, no crowd waving, fewer particles, no leaf gust animation; the race still
  shows every event clearly.
- `GTTDBG` read / poke handle for tests (like `PKDBG`): force a seed, read the sim state, skip to the finish.
- DEV cheats: "Turkey Trot: next race seed", "fast race (×4)", "show hidden stats".
- No Updates-tab notice unless the owner asks for one.

---

## 8. Tests (`t_gtt105.py`, about 40 checks, plus `node tools/gtt/rtp.js` headless)
- Registration: the tile is first in the casino, opens the paddock; the game is listed in Help.
- Determinism: the same seed gives the same race (positions every 30 frames and finish times) on two page loads.
- Odds: every multiplier respects the steps and clamps; probabilities sum to 1 (Win), 2 (Top 2), 3 (Top 3).
- RTP (headless, 200k races per bet type): each bet type 0.90-0.965; each runner's Win return 0.88-0.97; cash-out at half way
  returns less than holding; the cap never pays above 20,000.
- Money: Start takes the stakes once; a win pays once; a loss pays nothing; three bets settle independently; cash out settles a
  bet once and removes it; the totals match the ledger; the 98t / 98v guard enforced (`TW_AC_TEST`): payouts go through, a console
  write to the coins is refused.
- Reload mid-race: the result screen shows the same outcome and pays once; a second reload pays nothing more.
- Limits: a bet over 5,000 or a slip over 5,000 total is refused; a fourth bet is refused; Exact needs two different turkeys.
- UI: paddock, slip, race, photo finish, results and tutorial at 1600×900, 1280×720, 1024×640 with no overlaps or clipping
  (`tools/td/rpu_ovl.js`); keyboard flow; Esc / Back; first visit tutorial once.
- Frame cost: race frame draw under ~2 ms in software rendering with six runners, crowd and a gust (and below the Penalty Kings
  stadium frame); no `shadowBlur`, `ctx.filter`, `backdrop-filter`; no canvas created per frame.
- Festival: acorns paid only while `flOn()`, at most 10 a day; nothing paid with `FL_FORCE=-1`.
- No page errors. Screenshots in `shots/w105_gtt/`.
- Add to `tools/regress.sh`; the full regression must pass before delivery.

---

## 9. Build order (for the implementation sessions)
Agents in isolated workspaces (`tools/ws.sh new NAME`), merged by the lead:
1. **Core (agent A):** 99u data + 99u2 sim, pricing, cash-out, settle; `tools/gtt/rtp.js` headless RTP check; tune the stats until
   the races look varied (favourites win about 30-35%, longshots now and then, photo finishes in about 1 race in 8) and every RTP
   bound holds. Publish the interface (`gttSim`, `gttPrice`, `gttLive`, `gttSettle`, the state shape) in a short note for B and C.
2. **Art (agent B, starts at the same time against the state shape):** 99u3 backgrounds, turkeys, jockeys, events, photo finish,
   podium, tile. Contact sheet of all 12 turkeys and jockeys for review; frame cost measured.
3. **Game and UI (agent C, after A's interface note):** 99u4 / 99u5 / 99u6 screens, flow, money, save and resume, keyboard,
   sound, tutorial, trophies, festival acorns; t_gtt105.py.
4. **Lead:** merge, register modules, play it start to finish at three sizes, balance check, screenshots, HANDOFF 10.5 section,
   CLAUDE.md test line, full regression, delivery (both html files, zip, commit, push, game file and screenshots to the owner).

## 10. Open questions for the owner (defaults in brackets; the build goes ahead on the defaults)
- Name: [The Great Turkey Trot] or "Harvest Derby".
- Six runners per race [yes] or eight.
- Cash out mid-race [yes].
- Festival acorns from winning races [yes, +5, up to 10 races a day].
- An Updates-tab notice when it ships [only if the owner asks].
