# Pool (The Crooked Cue) test tools

All scripts open `type-warriors-source/out.html` (build with `bash tools/bld.sh` first) in headless Chromium at 1600x900.
Common page prelude (used by every script): `RS_ASK=false;PZ_TUT_OFF=true;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=100000;P.pz=null`.
`PZ_TUT_OFF=true` switches the 9.5 first-time tutorials off (a fresh save would otherwise open the hub tour over everything); `tut.py` and `tours.py` leave it on to walk them.

| script | what it does |
|---|---|
| `phys.test.js`, `ladder.js` | Node tests of physics/rules and the AI ladder (`node tools/pz/phys.test.js`) |
| `snap.py OUT.png "js" [wait]` | run JS in the page, screenshot |
| `hub.py OUTDIR` | 9.5 hub: mid-entrance, settled, keyboard pick and stake, hover, Shade, resume banner, new player, The Regulars and back |
| `tours.py OUTDIR` | the first-visit tours (hub, Trick Shots, Cue Rack), one screenshot per step |
| `tut.py OUTDIR` | the first-match lessons (welcome, aim, power, break) and the monster's-turn lesson, with a real mouse break |
| `howto.py OUTDIR` | How to Play: every tab, and the pause-menu version |
| `scen.py OUTDIR` | special states: break, ball in hand, call the 8, slow-mo 8, taunt, pause, settings, rules, forfeit, results, cue rack |
| `ui.py OUTDIR` | hub (every opponent, Shade), results win/lose, cue rack tabs |
| `seq.py OUTDIR [opp] [speed] [frames] [ms] [x,y,w,h]` | fire the break in slow motion and capture frames |
| `zoom.py OUT.png "x,y,w,h" [scale] [js]` | close-up crop of a match screen |
| `sheet.py OUT.png cols scale frames...` | contact sheet of several PNGs |
| `auto.py OPP [seed] [speed] [dir]` | AI plays both sides of a whole match at accelerated time; reports stuck states, errors, payouts |
| `mouse.py` | real-mouse aiming/power-drag/shoot test |

## Useful page hooks (global functions/state)
- Enter: `casinoOpen(); gameOpen('pz')` shows the hub. Start a match: `pzStart({opp:'gloop'|'moldwick'|'grizzle'|'vesper'|'barnacle'|'hootsworth'|'mortimer'|'shade', stake:200, seed:5, practice:false})`; click `#pzintro` to skip the VS intro.
- `PZ` is the match state: `PZ.ph` ('intro'|'aim'|'stroke'|'roll'|'settle'|'ai'|'rerack'|'endhold'|'over'), `PZ.mode` ('aim'|'place'), `PZ.st` (rules state: turn, grp, bih, brk, open), `PZ.M` (match: score, race, stake, mult), `PZ.B` (balls, index = id, 0 = cue), `PZ.aim` {ang,pow,a,b}, `PZ.speed` (time multiplier for debugging).
- `window.SC` (from scen.js, tests only): `SC.ready()` waits for the human's aim phase, `SC.on8()`, `SC.bih()`, `SC.slow()`, `SC.taunt()`.
- Money: `P.gold`, `PZS()` is the pool save (`P.pz`).
- Never run a Playwright script with `pkill -f`; close the browser from inside the script.
