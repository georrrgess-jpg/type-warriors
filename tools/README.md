# Tools

Helper scripts for building and testing Type Warriors. The game source lives in `type-warriors-source.zip`;
unzip it at the repo root first (`unzip -q type-warriors-source.zip`), which gives `type-warriors-source/`
(git-ignored, since the zip is the tracked copy).

| Script | What it does |
|---|---|
| `bld.sh` | Builds `type-warriors-source/out.html` from the module lists in `build.sh`/`build_ast3.sh`, prints `CMP OK` and `SYNTAX_OK`. |
| `servers.sh start\|stop` | Local MQTT broker (ws 127.0.0.1:18083) and Nostr relay (18090) for the network tests. Stops by PID file only. |
| `regress.sh` | The 44-test regression (`t_riddle` and `t_wagon` first, the 8.7 tests, `t_ramparts`, `t_rpboard` and `t_ui92` at the end). About 40 minutes. |
| `wr/` | Lantern Caravan checks: `snap.py` (screenshot after running JS), `run.py` (a full Millbrook run: monsters, hazard, repair, kill, flare, gate, result), `run2.py` (Hollow Pines, Gallows Pass with the Horseman, a breakdown, the pause menu, draw cost), `cond.py` and `cast.py` (the conductor, lash timing, hero and pet motion), `menus.py` (hub, workshop, route log, how to play, intro, result, home card, mode sheet), `ovl.py` (overlap sweep, 7 viewports × 7 screens), `touch.py` (4 touch sizes, the on-screen keyboard), `fps.py` (rAF frame times against the campaign fight), `prof.py` (draw cost by part), `mus.py` (music starts, ducks, mutes, stops; track levels), `wagon.py PREFIX` (wagon close-ups for each paint, jam, breakdown, hub, workshop), `ab.py A.html B.html` (the wagon's frame cost in two builds), `polish.py` (the 8.5b beats: pull-away, jam alarm, letter flash, kill hold and squash, breakdown, gate sparks, result, hub, workshop). Run them from inside `tools/wr`. |
| `ws.sh new\|diff\|apply NAME` | Isolated lean copies of the source and tools under `/tmp/tw_ws/NAME/{base,work}` so several agents can build and test at once; `apply` patches the real repo (build lists excluded). |
| `addmod.sh NEW.js AFTER.js` | Registers a module in both `build.sh` and `build_ast3.sh` right after another one. |
| `perf87/frames.py` | rAF frame times (mean, p95, max; median of 3 runs) for the hub, dock screens, Fishing, Riddle, Caravan, a fight, the calendar, the Astral map and the Casino; `--throttle` for a 4x CPU slowdown. Output in `perf87/out/`. |
| `ui/sweep.py` (+ `lib.py`) | Opens every menu screen; records open time, Back/Esc, Tab focus, overlaps at 3 viewports, controls covered by the dock, fonts and errors. `--only`, `--viewports`. Output in `ui/out/`. |
| `ui/anim_guard.js`, `ui/anim_scan.py` | Lists running infinite or non-compositor animations and box-shadow/filter/size transitions on each screen (chest openings excluded). |
| `econ/sim.py` | Coins per minute per mode at 30/45/70 WPM with an honest bot (campaign, Endless, Graveyard, Beginner, Astral, caravan) plus Higher or Lower's return. `--quick`. |
| `audit87/` | Raw scripts from the 8.7 planning audits (economy sims, menu sweep, gameplay bug probes). See `audit87/README.md` and `UPDATE_8.7_PLAN.md`. |
| `rr/` | Runestone Riddle checks: `snap.py` (screenshot after running JS), `j.py` (arch at several warmth levels), `win.py` (full win: flip, burst, result), `host.py`/`hs.py` (keeper poses), `ovl.py` (overlap sweep, 7 viewports × 6 states), `touch.py` (4 touch sizes), `rfps.py`/`fps.py` (frame times), `rlive.py` (per-canvas draw cost), `mus.py` (music starts, mutes, stops). Run them from inside `tools/rr`. |

One-time setup on a fresh machine:

```
pip install playwright && python3 -m playwright install chromium   # skip the install step if Chromium is preinstalled
pip install --target tools/pylib amqtt pyyaml                        # only for servers.sh / the network tests
pip install pillow
```

`t_leaderboard` needs an `lbt/` folder at the repo root for its relay logs (`mkdir -p lbt`; git-ignored).

Overlap checks use `rr/overlap.js`, a copy of `type-warriors-source/t_riddle_ovl.js`; copy it again after editing the original.
