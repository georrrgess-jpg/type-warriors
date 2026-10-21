# Tools

Helper scripts for building and testing Type Warriors. The game source lives in `type-warriors-source.zip`;
unzip it at the repo root first (`unzip -q type-warriors-source.zip`), which gives `type-warriors-source/`
(git-ignored, since the zip is the tracked copy).

| Script | What it does |
|---|---|
| `bld.sh` | Builds `type-warriors-source/out.html` from the module lists in `build.sh`/`build_ast3.sh`, prints `CMP OK` and `SYNTAX_OK`. |
| `servers.sh start\|stop` | Local MQTT broker (ws 127.0.0.1:18083) and Nostr relay (18090) for the network tests. Stops by PID file only. |
| `regress.sh` | The 35-test regression (`t_riddle` first). About 25 minutes. |
| `rr/` | Runestone Riddle checks: `snap.py` (screenshot after running JS), `j.py` (arch at several warmth levels), `win.py` (full win: flip, burst, result), `host.py`/`hs.py` (keeper poses), `ovl.py` (overlap sweep, 7 viewports × 6 states), `touch.py` (4 touch sizes), `rfps.py`/`fps.py` (frame times), `rlive.py` (per-canvas draw cost), `mus.py` (music starts, mutes, stops). Run them from inside `tools/rr`. |

One-time setup on a fresh machine:

```
pip install playwright && python3 -m playwright install chromium   # skip the install step if Chromium is preinstalled
pip install --target tools/pylib amqtt pyyaml                        # only for servers.sh / the network tests
pip install pillow
```

Overlap checks use `rr/overlap.js`, a copy of `type-warriors-source/t_riddle_ovl.js`; copy it again after editing the original.
