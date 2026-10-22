# Type Warriors

A single-file browser typing game. Everything ships as `type-warriors.html`; the source modules are in
`type-warriors-source.zip`. Read `type-warriors-source/HANDOFF.md` (inside the zip) for the history and
internals of every mode. The latest update is 8.7 (fixes, fair economy with caravan daily contracts, gold ledger, menu pass; see `UPDATE_8.7_PLAN.md`).

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
  (The 8.4 notice already exists and was approved; small wording edits to it are fine.)
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
- Before delivery: `tools/servers.sh start`, `tools/regress.sh` (41 tests), `tools/servers.sh stop`.
  `t_fishing` can time out under load and `t_leaderboard` fails in a frozen copy; rerun either alone.

## Delivery, every time
1. Copy `type-warriors-source/out.html` to both `type-warriors.html` and `type-warriors-act6-TEST.html`
   (they must be identical).
2. Rebuild `type-warriors-source.zip` from the source folder, excluding `out.html`, `out.js`,
   `out_ast.html`, `out_ast.js`, `before.html`, `shots/` and `__pycache__/`.
3. Add a section to `HANDOFF.md` for the round.
4. Commit with a clear message and push to the working branch; then send the game file and screenshots
   and give a short, honest summary (say plainly if anything failed or was skipped).
