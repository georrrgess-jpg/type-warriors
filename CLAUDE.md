# Type Warriors

A single-file browser typing game. Everything ships as `type-warriors.html`; the source modules are in
`type-warriors-source.zip`. Read `type-warriors-source/HANDOFF.md` (inside the zip) for the history and
internals of every mode. The latest update is 9.7 (announced in the bell as public update 8.7, The Crooked Cue), The Crooked Cue menus rebuilt from the owner's concept art: the hub (table with the regulars in medallions, stake bar), the Trick Shots chalkboard, How to Play (five illustrated tabs) and the Cue Rack (wall rack, felts in perspective, a ball-set table where a cue plays with the real physics), a hold-to-buy coin button with a purchase celebration, and cue mastery (10 levels per cue, `P.pz.mast`) (modules `96zg`–`96zj`; read the 9.7 section of `HANDOFF.md`). Before that 9.6: the Tidecaller repriced to 600 (same power) and the Hex Shaman pile glitch fixed in tower defense (`95q`), and in The Crooked Cue eight ball sets with new materials, redrawn cues, a square player portrait, the Crooked Cue emblem (hub, casino tile), smooth ball slow-down instead of the old auto 2x tail, and a guide that no longer simulates the shot (modules `96zb`–`96ze`; read the 9.6 section of `HANDOFF.md`). Before that 9.5, The Crooked Cue polished: a rebuilt hub (the pool mode's main menu), The Regulars stats screen, an illustrated How to Play, a wall-rack Cue Rack with hold-to-buy, new results, pause and settings, first-time pop-up tutorials (engine `pzCoach` in `96q`; `PZ_TUT_OFF=true` switches them off in test scripts) and gameplay-feel fixes from a first-time playtest (modules `96q`–`96za`; read the 9.5 section of `HANDOFF.md`). Before that 9.4, The Crooked Cue (a pool mode in the casino: 8-ball against seven bar-room monsters and a hustler, Trick Shots, a Cue Rack; code prefix `pz`, modules `96a`–`96p`, save `P.pz`; read the 9.4 section of `HANDOFF.md` and `POOL_PLAN.md`). Before that 9.3 (casino limits: 5,000 max bet except Blackjack, Higher or Lower and Tower Climb; Mines was removed from the casino after 9.7, `96zl`). Before that 9.2 (the Tidecaller Shrine, a redesigned tower bar and build ring, smoother towers, pads clear of map features, an easier endless Wonderland, smooth menu transitions; modules `95c5`, `95l`–`95p`). Before that 9.1 (the Dragon Roost reworked) and 9.0: Runestone Tower Defense, formerly Runestone Ramparts, a tower-defense mode: harder maps, the Celestial Prism, the endless Wonderland with tiers 4–5, the Dragon Roost, the Wonderland Championship leaderboard with its prize and the Tower Skins screen; code prefix `rp`, modules `95a`–`95j`, `95b2`, `95c3`, `95c4`, `95h2`).

## Setup in a new session
1. `unzip -q type-warriors-source.zip` at the repo root (the folder is git-ignored; the zip is the tracked copy).
2. `bash tools/bld.sh` must print `CMP OK` and `SYNTAX_OK`. See `tools/README.md` for the test scripts.

## How the code is built
- The modules in `type-warriors-source/*.js` are concatenated, in the order listed in `build.sh` and
  `build_ast3.sh`, into one global script. Add a new module to both lists (with `sed`), never by hand-editing
  `out.html`.
- Make changes as new modules or careful overrides. A later `function` declaration wins; wrap with
  `{const o=fn;fn=function(){...}}`; `const` globals cannot be reassigned.
- Back up a file before editing it, next to it, as `name.rNbak` / `.uNbak` / `.vNbak` (next free number).
- The game draws on a fixed 1600×900 stage scaled by `#wrap`. Do not use vw/vh units or viewport media
  queries; size from `ov.clientWidth/Height` the way `rrFit` does.
- Animated canvases register on `LIVE` (`{cv,fn,slow,ph}`); entries are dropped when the canvas leaves the DOM.

## Art style
Chunky `#12081f` outlines, indigo glass panels, gold accents, Pirata One for titles, Poppins for UI,
springy animations. New art should sit next to the fishing mode without looking out of place.

## Performance rules (the game must stay lag-free)
- No `backdrop-filter`; no `soft-light` or `screen` blends.
- No animated `box-shadow` or `filter`; no infinite `background-position` animations.
- Animate only `transform` and `opacity`.
- No `ctx.filter` or `shadowBlur` in canvas art. Bake static art once; keep per-frame draws under ~1 ms.
- Measure frame times before and after (`tools/rr/rfps.py`, `rlive.py`).

## Hard rules from the owner
- **Never add or push an Updates-tab (bell) notification unless explicitly asked, and ask for an okay first.**
  (The 8.4, 8.6, 8.7 and 8.8 notices already exist and were approved; small wording edits to them are fine. 8.7 is The Crooked Cue, `96zk_update87.js`, code CROOKEDCUE; 8.8 is Penalty Kings, `96zy_update88.js`, code PENALTYKINGS.)
- Do not change the Celestial or Graveyard chest animations.
- No Wix, no Firebase.
- Kill test servers by PID only (`tools/servers.sh stop`), never `pkill -f`.
- No model IDs in anything committed to the repository.
- The owner dislikes long waits: run long jobs in the background and keep working.
- Keep replies short and plain; do not paste long blocks of code or shell output into chat unless asked.

## Verifying
- Screenshot every visual change (Playwright, Chromium is preinstalled; `tools/rr/snap.py` is the template).
- Riddle changes: `python3 t_riddle.py` (43 checks) from `type-warriors-source`, then `tools/rr/ovl.py` and
  `tools/rr/touch.py` must report no overlaps.
- Caravan changes: `python3 t_wagon.py` (37 checks) from `type-warriors-source`, then `tools/wr/ovl.py` and
  `tools/wr/touch.py` must report no overlaps.
- Tower defense (Ramparts) changes: `python3 t_ramparts.py` (about 57 checks plus a bot that plays every map and the endless Wonderland; `--quick` for map 1 only).
- The Wonderland Championship has its own season calendar (`rpSeason`/`rpSeasonEnd`/`rpSeaStart` in 95j): season 1 ends 11 Nov 2026 21:00 UTC, then six-week seasons; Wildcard Ranked keeps `rkSeason`.
- Championship or Dragon Roost changes: `PYTHONPATH=../../pylib python3 t_rpboard.py` (28 checks, starts its own local relays).
- Tidecaller, tower bar/ring, pads, Wonderland curve or menu transitions: `python3 t_ui92.py` (15 checks).
- Tidecaller balance, waves and health: `python3 t_td96.py` (13 checks); Tidecaller aim, twin jet, swept wave, push-back cap and the leads of other towers: `python3 t_td97.py` (13 checks).
- Thunder Mortar (the eighth tower, 9.8): `python3 t_td98.py` (18 checks: targeting, dead zone, splash, craters, cluster, barrage, art, info panel, frame cost, a Wonderland wave).
- Alchemist's Still (the ninth tower, 9.9, key P): `python3 t_td99.py` (22 checks: soaking and armor melt, the damage bonus, puddles, Midas coins, glue, Celestial gold, oozes and the Tidecaller, art, info panel, frame cost, a Wonderland wave). Ten towers since 9.9i: t_ui92, t_ramparts, t_rpboard, t_td98 and t_td99 expect ten cards.
- Starfall Observatory (the tenth tower, 9.9i, key U, 450; the Tower Vote winner; `97d` art, `97e` battle): `python3 t_sf99.py` (18 checks: whole-map reach, marks, finishing, bosses, the telescope spring, shards, comet, meteor shower, art per tier, frame cost, info panel, a Wonderland wave, the poll switched off, the Storm Bell art fix).
- Tower Vote poll (96zz; Bone Crypt vs Starfall Observatory; closed 29 Oct 2026 20:30 UTC; Starfall won; switched off in `97f` with the code kept: `TPOLL.off = 0` brings it back): `python3 t_poll99.py` (12 checks; it switches the poll on with `window.TPOLL_ON` and fakes the clock). Players never see results: voting shows "Thanks for voting!" and pays 1,000 coins once. Results for the owner, as percentages only: `python3 tools/poll/results.py` (needs network access to the Nostr relays relay.damus.io, nos.lol, relay.primal.net, nostr.mom). The first-open window is suppressed under browser automation unless `window.TPOLL_FORCE` is set.
- Pool 8-ball fix and guide (97b): `python3 t_pz99.py` (6 checks). Endless healers and the curve past wave 50 (97c): `python3 t_end99.py` (9 checks).
- Casino limits: `python3 t_cas93.py` (13 checks). Casino balance and exploits (Higher or Lower, Quiz, Rocket, Tower boost, Blackjack shoe, Slots, Plinko nerf and 20,000 cap, trophy bet floor): `python3 t_cas97.py` (16 checks).
- Penalty Kings (casino, 9.8b; rigs, scoreboard and 20,000 cap 9.8c in `96zt`), the tower bar sort and the Choose a mode sheet: `python3 t_pk98.py` (17 checks, including the exact-save rule).
- Pool (The Crooked Cue) changes: `python3 t_pool.py` (about 86 checks, including the 9.5 hub, tutorials, Regulars, How to Play, hold-to-buy and aim fixes; code hygiene, save repair, physics/rules/AI, hub and cue rack, a full match with the money checked, resume/forfeit/shot clock, Trick Shots, frame cost); `node tools/pz/phys.test.js` (28 checks, no browser); `python3 tools/pz/flow.py` (reload/resume/Shade flows); `node tools/pz/trick.js` (every Trick Shot is solvable); see `tools/pz/README.md`. 9.6 pool art, speed and guide: `python3 t_pool96.py` (17 checks). 9.7 menus: `python3 t_pz97a.py` (hub + Trick Shots, 34), `t_pz97b.py` (How to Play, 50), `t_pz97c.py` (Cue Rack + mastery, 23).
- Before delivery: `tools/servers.sh start`, `tools/regress.sh` (60 tests), `tools/servers.sh stop`.
  `t_fishing` can time out under load and `t_leaderboard` fails in a frozen copy; rerun either alone.

## Delivery, every time
1. Copy `type-warriors-source/out.html` to both `type-warriors.html` and `type-warriors-act6-TEST.html`
   (they must be identical).
2. Rebuild `type-warriors-source.zip` from the source folder, excluding `out.html`, `out.js`,
   `out_ast.html`, `out_ast.js`, `before.html`, `shots/` and `__pycache__/`.
3. Add a section to `HANDOFF.md` for the round.
4. Commit with a clear message and push to the working branch; then send the game file and screenshots
   and give a short, honest summary (say plainly if anything failed or was skipped).
