# Update 8.5 — Lantern Caravan (the Wagon Route mode)

Implementation plan. Phase 1 (this document) is done; Phase 2 builds it; Phase 3 polishes and smooths the animations.
Read `CLAUDE.md` and `type-warriors-source/HANDOFF.md` first. Everything below names real functions and files in
the current source so the builder can go straight to them. Line numbers are approximate; search by name.

---

## 0. The concept in one paragraph

A night-time side-scroller. A goblin-driven wagon with a huge glowing lantern rolls left-to-right along a stone
bridge toward a village gate. The player's hero and pet walk beside it. Monsters come in from the right carrying a
word on a red sword tag; type the word and the hero cuts them down. Now and then the wagon's wheel jams on a rock
(or mud, a branch, loose cargo): a blue wrench bubble appears at the wheel with a repair verb (MEND, BRACE, PATCH…);
type it and the wagon rolls again. Monsters that reach the wagon knock off one **Wagon Integrity** shield (4 total).
Reach the gate: route complete, medal, coins, XP. Lose all shields: breakdown. Medals unlock **convoy cosmetics**
(lanterns, banners, wagon paint). Tagline: *Clear the road. Repair the wagon. Reach the gate.*

Names used throughout: mode **Lantern Caravan**; a single play-through is a **route**; code prefix **`wr`**
(wagon route); save namespace **`P.wr`**; state object **`WR`**; module prefix **`93`**.

---

## 1. Architecture decision: a canvas mode like the Arena, not an engine `kind`

Run the whole route on the main `#c` canvas with its own state, by wrapping `update`/`draw` the way the Warden's
Arena does (`84l_arenaui.js:2-3`: `if(S.wa)return waUpdate(dt)` / `waDraw()`), with `S.mode='wagon'`.

Why not an engine mode (`start(0,'wagon')` with `modeSetup`/`modeTick` like the Graveyard)? The engine assumes the
hero stands at `KX=210` and enemies stop at the hero; dozens of `S.mode==='play'` wrappers (pets, gear abilities,
mythic, boons) would fire with wrong assumptions. The wagon needs the hero mid-screen, a moving world, static hazard
entities and a different damage target. A standalone mode keeps full control and still **reuses the painters**:

| Need | Reuse |
|---|---|
| Hero (walk, lunge, victory, dead) | `drawHero(g,{arm:P.armor,wp:P.weapon,col:P.col,t,lg,walk,pose,pu})` (`30_hero.js:2`), feet at origin, faces right, ~135 units |
| Projectiles for archer/mage | `projArt(g,j,t)` (`30_hero.js:73`) |
| Pet beside the hero | `petDraw(g,P.pet,Object.assign({t,pose:'walk'|'idle',u},petLook(P.pet)))` (`87b:573`); hover flag `PDEF[id].hover` |
| Monsters | `MON[id].d(g,t,{lg})` feet at origin, facing **left** (`20_monsters.js:196`); scale `h/M.th` as in `drawEnemy` (`50_game.js:222`) |
| Goblin driver | `rrkDraw(g,RRK[0],t,{mode,k})` (`92g:192`) — Professor Nickels; clip him behind the driver's board (no seated pose exists) |
| Lantern | `rrkLantern(g,x,y,swing,t,lit)` (`92g:80`) as the starting point for the bobber family; `rrkGlow` for the halo |
| Parallax | `abSprite(key,w,h,fn)` + `abDrift(g,spr,x0,y,speed,t,al,sc)` (`75a_actbg.js:26`) for seamless strips; `abRidge`, `abPine`, `abDead`, `abCastle`, `abMoon`, `abStars`, `abCloud`, `abFog` |
| Masonry | the bevelled-block recipe in `rrBgPaint`/`rrArchBake` (`92j_riddle_arch2.js`) for the bridge |
| Waterfall | the scrolling sheet technique in `90k2_loc_grotto.js:107-110` |
| Particles | `ptBurst(FX,x,y,n,c,{k:'star'|'dust'|'glow',up,sp,v,l})` + `ptFxStep(g,FX,dt)` (`87h_pet_fx.js:28-35`); `ptTexts` for pop-ups |
| Glows and sparkles | `pGlow(g,x,y,r,hex,a)` (`87b:12`), `pStar4`, `sparkle` (`22_rift.js:3`), `coin(g,x,y,r)` (`29_weapons.js:81`) |
| Medal emblem | `waEmblem(b,i,sz)` and `waSvgCup` (`84l:91,69`) as the SVG template for bronze/silver/gold |
| Word tag | copy `pill`/`pillGeom` (`50_game.js:207-220`) into `wrTag` (do **not** call `pill`, it reads `S`) |
| Pause | reuse `#pb` the way `waPBHook`/`waPB` do (`84l:6-8`), plus a CSS class that moves it top-right (`#pb.wrpb{top:14px;right:14px;left:auto;bottom:auto}`) |
| Result/pause/menu screens | `show(html,cls)` + `S.back` as the arena's `waResult`/`waPauseMenu` |
| Coin flight | the riddle's `rrCoins`/`rrCount`/`rrLoc` pattern (`92b:231-235`) |

Rules that follow from this: never call `pill`, `burst`, `float`, `drawEnemy`, `zoneBG` or `drawHUD` (they read `S`
and the global `ctx`); keep the hero's `OL` outline convention; no `ctx.filter`/`shadowBlur` (so the monster hit
flash is your own: brief white silhouette via an offscreen canvas and `source-atop`, cached per monster id, or a
squash-and-sparks instead).

---

## 2. Modules (build order: after `92k_riddle_menu2.js`, before `70c_ttmenu.js` and `70_main.js`)

Add each to **both** `build.sh` and `build_ast3.sh` with `sed`, never by hand-editing `out.html`.

| Module | Holds |
|---|---|
| `93a_wagon_data.js` | `WR_ROUTES`, monster rosters, hazard table, `WR_WORDS`, pay tables, `WR_COS` cosmetics, `WRP()` save normaliser, medal rules |
| `93b_wagon_art.js` | `wrWagonDraw`, `wrLanternDraw`, `wrBannerDraw`, `wrDriverDraw`, `wrGateDraw`, `wrBake()` parallax strips, `wrShield` icon, `wrMedalSVG`, mode icon `MG.wagon` |
| `93c_wagon_game.js` | `WR` state, `wrStart`, `wrUpdate`, `wrDraw`, `wrKey`, hazards, Lantern Flare, pause, finish, rewards |
| `93d_wagon_ui.js` | `wagonMenu`, route select, cosmetics workshop, intro strip, result card, pause menu, hooks into `modeSheet`/`title`/`homeKey`/`HELP`/`BTPL`/dev cheats/`fsBusy` |
| `93e_wagon_style.js` | CSS (`document.createElement('style')`) |
| `93f_wagon_audio.js` | music "Lantern Road" + effects, built on the `92i` recipes |
| `93g_wagon_polish.js` | **reserved for Phase 3** — overrides only, no new systems |

Load-order gotcha (from `70_main.js:2-3`): `ac`, `mg`, `sg`, `mt` are in their temporal dead zone while `93*`
modules run. Touch them only inside functions; use `$('mt')`, not `mt`. `note` is hoisted, so wrapping it is fine.

---

## 3. Data (`93a_wagon_data.js`)

### 3.1 Routes
```
WR_ROUTES=[
 {id:'mill', n:'Millbrook Bridge', sub:'to the Village Gate', legs:3, len:1800, d:1,
  sky:['#0b0a2a','#2a1b5c'], far:'village', mobs:['gob','skel','bat'], haz:['rock','branch'],
  pay:420, xp:60, unlock:null},
 {id:'pines', n:'Hollow Pines', sub:'to the Woodcutter\'s Rest', legs:4, len:2600, d:2,
  sky:['#07061e','#1d1448'], far:'forest', mobs:['wolf','spid','weaver','gob','shaman','bat'], haz:['rock','branch','mud'],
  pay:700, xp:100, unlock:{route:'mill',med:1}},
 {id:'gallows', n:'Gallows Pass', sub:'to Hollowmere Keep', legs:5, len:3400, d:3,
  sky:['#060416','#2b0f3a'], far:'keep', mobs:['skel','dknight','ghost','hound','garg','gydigger','gywisp'], haz:['rock','branch','mud','cargo'],
  boss:'bhorse', pay:1050, xp:150, unlock:{route:'pines',med:1}}]
```
`len` is the travel distance in world units; the wagon's base speed is 60 units/s, so a clean Millbrook run is about
30 s of rolling plus stops. Each leg ends at a waypoint (the progress bar dots). `d` scales spawn rate, monster speed
and word length (`pickWord(role, WR_WORDS, d*8, onScreen)` — `pickWord` accepts an array pool, `10_data.js:282`).
The three routes share one engine and one scene painter; `far` and `sky` select the baked backdrop variant, and
the mob roster changes the feel. Gallows Pass ends with the Headless Horseman (`bhorse`) riding alongside the wagon
for the last leg: three words to banish him, each hit knocks him back.

### 3.2 Monsters on the road
Use existing ids only (all have `MON[id].d` and `th`): `gob`, `shaman`, `skel`, `dknight`, `bat`, `garg`, `wolf`,
`warg`, `hound`, `spid`, `weaver`, `ghost`, `zomb`, `gydigger`, `gywisp`, `gycat`; boss `bhorse`. Role by id for
word length: flyers (`bat`,`garg`,`gywisp`) role 1 (short words, fast), tanks (`dknight`,`zomb`) role 2 (long words,
slow), the rest role 0. Each spawn: `{id, x:W+80, w:word, i:0, sp, h:MON[id].h, lg:0, fl:0, state:'walk'|'attack'|'back'|'dead', t0}`.

### 3.3 Hazards
```
WR_HAZ={rock:{n:'Jammed wheel',verbs:['mend','brace','patch','wedge','lever'],fuse:8,ico:'wrench'},
 branch:{n:'Fallen branch',verbs:['chop','clear','hack','shove'],fuse:7,ico:'axe'},
 mud:{n:'Mud rut',verbs:['heave','push','haul','grit'],fuse:9,ico:'boot'},
 cargo:{n:'Loose cargo',verbs:['lash','tie','strap','cinch'],fuse:6,ico:'rope'}}
```
A hazard is a static entity pinned to the wagon's wheel (`x=wagonX+118`). Its bubble is **blue with a wrench**,
distinct from the red sword monster tags. While a hazard is open the wagon is stopped (wheel locked, sparks). If the
fuse runs out the axle cracks: −1 integrity, the hazard clears itself, and the wagon lurches on. Hazards schedule every
10–16 s (scaled by `1/d`), never during the final 10% of a route, never two at once, and never while a monster is
in attack range (the pressure comes from monsters arriving *while* you are stuck, not from stacking).

### 3.4 Targeting (copy the rules of `key(c)`, `50_game.js:153`)
- An open hazard is always the preferred target when its first letter matches.
- Otherwise the nearest monster (smallest `x`) whose `w[0]===c` when nothing is targeted or the target has `i===0`.
- Tab cycles targets; Backspace does nothing; wrong letter: forgiven once per word (`slip`), then combo breaks,
  tag shakes (`bad` flag) and the miss sound plays.
- Enter fires the Lantern Flare when the meter is full.

### 3.5 Lantern Flare (the fury analogue)
Meter fills by 1 per correct letter and 6 per kill, 60 to fill. On fire: a warm radial wash from the lantern (one-shot,
0.6 s), every monster on screen is flung back off the right edge and dies (no coins), the wagon surges at 2.2× for
3 s with motion streaks, +1 integrity if below max. Meter resets. Pets with a Scholar/Guardian trait could add +10%
fill; optional, keep behind a flag.

### 3.6 Medals and pay
- **Bronze**: reach the gate. **Silver**: reach it with ≥2 integrity. **Gold**: 4/4 integrity *and* ≥92% accuracy.
- Pay = `route.pay × (0.55 + 0.15×integrity) × accuracyFactor (0.8–1.1)`; breakdown pays `0.25×pay × progress`.
  First completion of a route per day ×1.5 (`P.wr.day`/`P.wr.dayDone[id]`). Clamp with `Math.min(1e12,…)`, pay
  with `P.gold+=n; stat('gold',n,'add')`. Lantern Flare kills pay nothing; normal kills pay `max(1,len/4)×2`
  coins as canvas coin particles that fly to the HUD coin counter (`coin()` art, like `waCoin`).
- XP: `const l0=lvl(P.xp); const xp=xpMode(Math.round(route.xp*prog*xpMulRun())); P.xp+=xp; const lg=levelGold(l0,lvl(P.xp)); save();`
  (`88h_xp_pacing.js:38`, `60_ui.js:134`). Show `xpNoteH()` on the card. Keep the result HTML containing "Earned"
  and a `<div class="row">` so the animated XP bar injects (`88h:50-53`, needs `S.mode==='over'`).
- Title **Caravan Master** at all three gold: `BT_TITLES.push(['caravanmaster','Caravan Master',1e9])`, grant with
  `BTY().own['t:caravanmaster']=1`, and wrap `bountyBoard` to show "Earn: gold on every route" (riddle pattern, `92d:47`).

### 3.7 Cosmetics (`WR_COS`)
Three families, each drawn by `93b`; unlocked by medals, owned in `P.wr.own`, equipped in `P.wr.lan/ban/paint`.
```
lan: brass (default) · ironcage (bronze on Millbrook) · moonglass (silver on Pines) · emberheart (gold on Gallows) · wisp (all silver)
ban: none (default) · lanterncaravan (bronze any route) · wolfpine (silver on Pines) · gallowsgold (gold on Gallows) · royal (Caravan Master)
paint: oak (default) · cherry (bronze on Pines) · indigo (silver on Gallows) · gilt (all gold)
```
The **banner** is a pennant on the wagon's rear post (the concept's "Player Banner · Lantern Caravan"); the **lantern
bobber** is the big lantern's cage, glass and glow colour; **paint** recolours the wagon body and wheel rims. All
three show in-run, on the menu's live preview and on the home card.

### 3.8 Save (`P.wr`) via a lazy normaliser `WRP()` in the `wcSt` style (`89d_wc_menus.js:4`)
```
{med:{mill:0,pines:0,gallows:0}, best:{}, runs:0, clears:0, lan:'brass', ban:'none', paint:'oak',
 own:{}, seen:{}, day:'', dayDone:{}, seen85:0, intro:0}
```
Small, no per-day maps that grow. `49_savesafe.js` does not validate it, so `WRP()` must type-check every field
and drop unknown cosmetic ids. Wrap `load` only if a migration is ever needed.

---

## 4. The scene (`93b_wagon_art.js`)

Design space 1600×900, ground line **GY=770** (same as the fight). Layers, back to front, with scroll factors on
the world offset `WR.x` (units travelled):

1. **Sky** (static per route): vertical gradient, `abStars`, `abMoon` top-right with halo, 3 drifting `abCloud`s (0.02).
2. **Far ridge** (0.08): mountains via `abRidge`, baked once into a 2400-wide strip with `abSprite`, scrolled with `abDrift`.
3. **Far set** (0.2): `village` = a hill town of towers and lit windows (twinkle by toggling window alpha on a 0.7 s
   phase, baked as two strips swapped, no per-window draws); `forest` = pine wall with fog; `keep` = a castle silhouette
   with red windows. Reuse `abCastle`, `abPine`, `abDead`.
4. **Waterfall and river** (0.35): under the bridge, a scrolling sheet (grotto technique) plus 6 mist puffs.
5. **Bridge** (1.0): the deck is a repeating 480-wide bevelled-stone tile (masonry recipe) with arches below, balusters
   and a lantern post every 480 units (post lanterns use a small baked glow sprite). The gate itself is a one-off
   sprite placed at `x=route.len+600` so it scrolls in during the last leg.
6. **Characters** on the deck: hero at world 560, pet at 430, wagon body 620–980, hazards at wheel 740, monsters from 1680.
7. **Foreground** (1.4): bushes and vines along the bottom 90 px, baked strip, `abDrift`.
8. **Vignette**: one baked radial, drawn last with `globalAlpha` (cheap).

Budget: the per-frame draw is `drawImage` of ≤8 strips + characters + particles. Target **≤ 4 ms per frame** on the
main canvas in headless Chromium (the current fight background is ~45% of a frame; this must be cheaper, since it
is all pre-baked). Rebake only when the route changes. Honour `PFM()==='low'` by dropping the mist, embers and
window twinkle.

### The wagon (`wrWagonDraw(g,t,o)`, body origin at the rear axle, ~360 wide)
Parts and their motion:
- **Wheels**: two spoked wheels; rotation `= WR.x/radius`; iron rim highlight; the front wheel is the one that jams.
- **Body**: plank box with a chunky `#12081f` outline, paint colour from `WR_COS.paint`; bob `sin(WR.x/40)*2` while
  rolling; tilt −3° when jammed; crate and sack cargo on top that bounce with a 60 ms lag.
- **Lantern**: the big glass lantern on the gold frame; pendulum swing lags the wagon's acceleration (`swing += (−swing×6 − accel×0.4)×dt`);
  glow is a baked radial sprite drawn additive (`lighter`) with alpha `0.75 + 0.1×sin(t×7)` and ×1.3 during a Flare.
- **Driver**: `rrkDraw` goblin at 0.62 scale, clipped by the seat board; modes `idle` (reins), `think` while a hazard
  is open, `cheer` on a kill, `sad` on a shield loss, `point` on the gate reveal.
- **Banner**: pennant on the rear post; flutters with a 3-segment wave driven by speed.
- **Shadow**: an ellipse under the body that stretches with speed.

### Monster tag (`wrTag`)
Red rounded pill above the monster with a sword glyph (`bP`-style path drawn in canvas), word in the fight's bold
24 px monospace; typed letters in `WCOL()`, caret bar under the next letter; a small triangle pointer; bobs
`sin(t×3+i)*3`. Hazard bubble is the same geometry in blue (`#6ab0ff` border, `#1a2550` fill) with a wrench glyph.

### The gate
A stone arch with two wooden doors and torches; on arrival the doors swing open over 0.8 s (`cubic-bezier(.3,1.5,.5,1)`
feel, implement as an overshoot ease), warm light spills out as a one-shot wedge, bells ring, the wagon rolls in and
the screen fades to the result card.

---

## 5. The run (`93c_wagon_game.js`)

### 5.1 Lifecycle
- `wrStart(routeId)`: `reset()`; `S.mode='wagon'; S.view='wagon'; S.wr=1`; build `WR={route,x:0,v:0,int:4,max:4,
  legs,legIdx,mobs:[],haz:null,tgt:null,flare:0,combo,acc:{ok,all},coins,fx:[],tx:[],t:0,st:'intro'|'roll'|'gate'|'done',
  pause:false,tk:++token}`; `hide()`; `wrBake(route)`; show the objective toast; start the music via `wraWant()`.
- `update` wrapper: `if(S.wr)return wrUpdate(dt)`; `draw` wrapper: `if(S.wr)return wrDraw()`.
- Pause: `WR.pause` flag; `wrUpdate` returns early; Esc, `#pb`, window `blur` and `visibilitychange` all pause
  (arena pattern `84l:24-25`); the pause menu is `show('<div class="wrpause">…')` with Resume / How to play / Restart /
  Quit, `S.back=wrResume`. `#pb` must be re-shown every frame in wagon mode because `update` hides it (`50_game.js:175`).
- `title` wrapper clears `S.wr` and `WR` (like `84l:4`); `wrQuit()` for the menu buttons; music stops through the
  `show` hook in `93f`.
- Add `'wagon'` to `fsBusy()` (`88m_fs_bigscreen.js:15`) so Big Screen treats it as play.

### 5.2 Input
One capture-phase `keydown` registered once (`window.__wrk` flag), guarded by `S.wr && !WR.pause`, using
`stopImmediatePropagation` (arena `84l:10-15`). Letters also arrive through the hidden `#inp` (`70_main.js:73`): wrap
`key(c)` — later `function key` wins, so define `{const k0=key;key=function(c){if(S.wr)return wrKey(c);return k0.apply(this,arguments)}}`.
Enter → Flare, Tab → cycle, Escape → pause, Space ignored.

**Touch:** the shared `#kb` only shows for `S.mode==='play'` (`kbWant` is a `const`, `63_touch.js:18`), so build a
compact DOM keyboard `wrKeys` modelled on `rrKeys` (`92b:250`) inside `#ov`, kept visible with a transparent
pass-through class (`#ov.wrx{background:none;pointer-events:none;justify-content:flex-end}`, keys `pointer-events:auto`),
shown only when `TM()`. Buttons call `wrKey(c)`; add Flare and Pause keys. Verify with a `tools/wr/touch.py` run.

### 5.3 Simulation (`wrUpdate(dt)`, clamp `dt` to 1/20)
- Wagon speed `v` eases toward target: 60 (rolling), 0 (hazard open or a monster within 140 px of the front), 132
  during a Flare; `x += v*dt`. Leg boundaries at `len×k/legs` light the waypoint and toast the leg name.
- Spawner: per leg, waves of 1–3 monsters every 4.5–7 s ÷ `d`, biased so a wave lands ~2 s after a hazard opens
  about a third of the time. Max on screen: 3 (+1 per `d`). The last leg of each route is an ambush (double wave);
  Gallows Pass spawns `bhorse` instead.
- Monster: walks left at `sp` (MON `sp` × 0.9 × (1+0.15d)); at `front+40` switches to `attack`: lunge `lg` 0→1→0
  over 0.5 s, −1 integrity at the peak, wagon shake 12, then `back` 60 px over 0.4 s and a fresh word (`i=0`)
  and a 2.5 s cooldown before the next attack. Flyers dive in an arc instead of walking.
- Kill: `state='dead'`, squash to 1.25×0.7 then 0 over 0.3 s with a tumble, `ptBurst` bones/ash in the monster's
  hue, coins fly to the HUD, hero `lg=1` decaying at 4/s (and a projectile for archer/mage via `projArt`), pet hop.
- Accuracy and WPM tracked like `S.ok/S.chars`; `wrFinish(won)` computes the medal, pay and XP, writes `P.wr`,
  `btyAdd('wagon',1)`, `save()`, then `S.late` → result card (Graveyard pattern, `84c:84-88`).

### 5.4 HUD (canvas, in `wrDraw`, following the concept layout)
- Top-left glass panel: **Wagon Integrity** label, four shield glyphs (gold filled / grey cracked), `3 / 4`.
- Top-centre: route progress bar with the destination name and percent (`Village Gate · 65%`), waypoint dots that
  ping when passed, a small wagon marker that slides, a gate glyph at the end.
- Top-right: the `#pb` pause button moved by CSS.
- Right of the bar: coin counter (coins fly into it) and the Lantern Flare meter (a lantern outline that fills with
  light; when full it pulses and shows "Enter").
- Bottom-centre: objective toast at the start ("Clear the road. Repair the wagon. Reach the gate."), reused for leg
  names, "Axle cracked!", "Lantern Flare!" and "Ambush!".
- Panel style: `rgba(6,4,16,.55)` fill, 14 px radius, 1 px lavender border, Poppins 700 — match `drawHUD`
  (`50_game.js:255`) so the mode looks native.

### 5.5 Intro strip (first run only, and from Help)
The concept's bottom panels become a one-time `show()` overlay before the first route: **Repair or defend** with the
three mini-canvases (1. Wheel gets jammed → 2. Type the word → 3. Wagon keeps moving, each a tiny looping LIVE canvas
at `slow:2`) and **Earn route medals · unlock convoy cosmetics** with two cosmetic previews. "Hitch up" starts the
route. Sets `P.wr.intro=1`.

---

## 6. Menus (`93d_wagon_ui.js`, CSS in `93e`)

- `wagonMenu(back)`: a hub in the Moonlit Fishing style (`screenshots/fishing-v7/01-menu-calmer.png` is the approved
  reference): Pirata One title "Lantern Caravan", subtitle, a live preview canvas on the right (the wagon idling at a
  lantern post: lantern swinging, hero breathing, pet blinking, embers; `LIVE.push({cv,fn,slow:2})`, skipped under
  `dkRM()`), a route card list on the left with medal slots, best time and pay, a gold **Hitch up** primary button
  (Space), and bottom cards: **Convoy Workshop** (cosmetics), **Route Log** (medals, clears, runs), **How to play**.
  `S.mode='title'`, `S.view='wagon'`, `show(html,'wrmenu nosb')`, `S.back=back`. Hide the corner buttons
  (`#cn.dkhid`) and call `dkCorner()` on leaving, as the riddle does.
- Route cards: locked routes show the unlock line ("Bronze on Millbrook Bridge"), the Gallows card shows the horseman.
- **Convoy Workshop**: three rows (Lanterns, Banners, Paint) of chips; hovering/focusing a chip previews it on the
  live wagon; Equip writes `P.wr.lan/ban/paint`; locked chips show the medal needed. NEW pips via `P.wr.seen`.
- Result card (`wrResult`): medal stamp slam (scale 2→1 overshoot, ring, sparkles), route name, stats grid
  (`.res` style via your own markup, time, accuracy, WPM, kills, repairs), coin count-up with the flight, XP line
  with `xpNoteH()`, unlock reveal cards for any cosmetic just earned, buttons **Ride again / Routes / Home**.
  Esc = Home (`overKey` handles `#hm`, `71_home.js:35`).
- Hooks (all in `93d`):
  - `modeSheet` wrapper: insert a **featured full-width card** at the top of `.dkpv[data-v="m"] .dkmg`
    (`style="grid-column:1/-1"`, id `dmwr`, `NEW` pill `.dkmnew`, icon `mico('wagon',58)` after adding
    `MG.wagon`/`MA.wagon` in `93b`). Do not displace Fishing or the Riddle; they own `#dma`/`#dmd`.
  - `title` wrapper: home card `#dkwagon` with a live mini-canvas (riddle `rrHomeCard` pattern, `92d:33`) in the
    `.dksc` row, **replacing the third slot (Endless `#go`)** — Endless stays in Choose mode and on the E key.
    `NEW` badge until `P.wr.seen85`. Check `.dks3`, `#ov.dknar` and `dkshort` CSS still fit (`88_dock.js:346,354`).
  - `homeKey` wrapper: **W** opens the menu (free key; taken: c e r p g m a k l b s x o t h d , f).
  - `HELP.Modes.unshift([...])`, `HELP.Shortcuts.push(['W','Lantern Caravan from the main menu.'])`.
  - Bounty: `const t={k:'wagon',tier:1,ok:()=>true,mk:r=>({n:1}),txt:c=>'Finish a Lantern Caravan route'}; BTPL.push(t); BTK.wagon=t;`
    (`80_bounty.js`; note it reshuffles the tier-1 seeded pool once).
  - Dev cheats: wrap `dvxHTML` (a 'Lantern Caravan' `sec`) and `dvxAct` with `x:wrgo` (open the menu), `x:wrstart:<id>`,
    `x:wrmed` (all gold), `x:wrcos` (own everything), `x:wrreset`.
  - Play-tab highlight: add `wrmenu` to the `dkDetect` regex (`88_dock.js:42`).
- **No Updates-tab (bell) entry and no News card.** The owner must explicitly ask first (CLAUDE.md). Leave a stub
  `WR_UPD85` text in `93d` but do not push it to `UPDATES`. Likewise no redeem code unless asked.

---

## 7. Audio (`93f_wagon_audio.js`)

Copy the structure of `92i_riddle_audio.js` (state object, `rraRes`-style shared resources, instrument recipes,
`rraBars`/`rraMel` score, `rraStart`/`rraKill`/`rraSched` player, `rraWant`/`rraDuck`/`rraPump` handover, the four
hooks on `note`, `applyVol`, `visibilitychange` and `show`). Name everything `wra*`.

- **"Lantern Road"**: a travelling tune, D major, 104 bpm, 32 bars, ~74 s loop. Pizzicato bass on 1 and 3, woodblock
  clip-clop on the off-beats (this doubles as the wagon's rhythm; mute it while the wagon is stopped), recorder
  melody, harp sparkle fills. Layers by state: **danger** (low brass drone + drum) fades in while any monster is
  within 500 px of the wagon; **flare** (tambourine + bell run) during a Lantern Flare; **gate** fanfare (3 s) on
  arrival; **wah** on breakdown. Instrument swap every other loop like the riddle.
- Effects via `sg` (bail when `!ac||!sg||ST.svol<=0`): key tick rising with combo (`beep(700+min(combo,30)*15,.04)`
  as in the fight), miss `beep(110,.08,'sawtooth',.6)`, wrench clink on each hazard letter (short bright triangle
  with a 160 ms echo), wheel-free "clunk + roll", shield crack (noise burst + low thud), monster hit (per role),
  Flare whoosh (filtered noise sweep up), coin chime (`1318+rand*300`), gate bells, medal stamp.
- `wraWant()` returns the track key when `S.wr` is set (in-run) or `S.view==='wagon'` (menu, calmer mix at 88 bpm
  with no clip-clop). Volume follows `ST.mute`/`ST.mvol`; the menu gets a music button beside the coin chip that
  clicks `#mt` (`92k:10` pattern).

---

## 8. Phase 2 — build order with acceptance checks

Work in milestones; build (`bash tools/bld.sh` → `CMP OK`, `SYNTAX_OK`) and screenshot after each. Back up any
existing file before editing it (`name.rNbak`). Deliver per `CLAUDE.md` at the end.

| # | Milestone | Done when |
|---|---|---|
| M1 | `93a` data + `WRP()`; `93c` skeleton: `wrStart`, update/draw wrappers, a grey box wagon, scrolling ground, `wrKey` with a static monster word, pause via `#pb` and Esc, quit back to `title()` with no page errors | `python3 t_wagon.py` first 8 checks pass (start, type a word, kill, hazard clears, pause, resume, quit, no errors) |
| M2 | `93b` scene bake + parallax + bridge + gate; real wagon with wheels/lantern/driver/banner; hero and pet walking; monsters from `MON` with tags | Screenshot at 1600×900 and 1280×720 matches the concept's composition; `tools/wr/fps.py` ≤ 4 ms mean on the main canvas idle, ≤ 6 ms with 4 monsters |
| M3 | Full rules: hazards with fuses, attacks and integrity, Flare, legs/waypoints, ambush, horseman, finish, medals, pay, XP, bounty, title | `t_wagon.py` rules section (≈20 checks) passes; pay/XP numbers printed and sane |
| M4 | `93d`/`93e`: menu hub, route select, workshop, intro strip, result card with coin flight and medal slam, mode-sheet card, home card, W key, help, dev cheats | `tools/wr/ovl.py` (copy `tools/rr/ovl.py`, swap the root selector) reports no overlaps at 7 viewports; touch sizes OK |
| M5 | `93f` music + effects | `tools/wr/mus.py` (copy of `rr/mus.py`): starts in run, keeps playing on pause with the clip-clop muted, danger layer rises with a monster near, stops on leave; `#mt` mute works |
| M6 | Regression: `tools/servers.sh start`, `tools/regress.sh` (add `t_wagon` after `t_riddle`, bump the count), `tools/servers.sh stop`; HANDOFF section; zip; both html files identical; commit and push | All green except the known `t_fishing`/`t_leaderboard` caveats |

Tests to write (`type-warriors-source/t_wagon.py`, same shape as `t_riddle.py`: `chk(name,r,ok)`, `E=pg.evaluate`,
`typ(w)` with `pg.keyboard.press`):
start/quit, word targeting (first letter picks nearest), Tab cycling, slip forgiveness, hazard open/close/fuse, attack
→ integrity, breakdown at 0, Flare clears monsters, leg toasts, gate arrival, medal rules (3 cases via forced state),
pay math, first-of-day bonus, XP through `xpMode`, cosmetic unlock on medal, workshop equip persists through `WRP()`,
mode-sheet card present and clickable, home card present, W hotkey, pause on blur, no page errors. Drive the sim
with `WR.x=…` and `wrUpdate(1/60)` loops from `page.evaluate` rather than waiting in real time.

---

## 9. Phase 3 — polish checklist (Opus; put overrides in `93g_wagon_polish.js`)

Measure first (`tools/wr/fps.py`, `rlive.py`-style wrapper on `draw`), then smooth:
1. **Wagon motion**: acceleration curves (ease-out on stop, ease-in on start), wheel/bob/cargo lag so the wagon feels
   heavy; lantern pendulum damping; banner flutter.
2. **Hazard beats**: jam = wheel lock + sparks + 3° tilt + driver "!" within 100 ms; each letter a clink and spark;
   free = kick-spin and dust puff, wagon lurch; fuse warning at 3 s (bubble pulses red, driver sweats).
3. **Combat beats**: hero lunge timing versus monster death squash (the hit must read before the squash); hit
   flash without `ctx.filter`; flyers' dive arcs; the horseman's knock-backs.
4. **Shield loss**: shake magnitude and decay, shield crack animation (two halves, rotate and fall, 0.5 s), last-shield
   red rim pulse at 1.4 Hz.
5. **Flare**: the wash's gradient and timing, monster fling tumble, surge streaks, meter fill pop.
6. **Gate arrival**: door swing overshoot, light wedge, ember shower, fade timing into the result card; medal slam.
7. **Menu**: live preview idle life (blink, breathe, embers), chip hover lift 2–4 px and press squish to 0.9,
   staggered card entrances, workshop preview crossfade.
8. **Reduced motion** (`ccReduce()`): no shake, no fling tumble, no door overshoot, static preview.
9. **Perf**: every per-frame draw ≤ 1 ms per layer; vignette and glows baked; `PFM()==='low'` drops mist/embers;
   `slow` on menu canvases; final `rfps`-style before/after numbers in the HANDOFF section.
10. Overlap and touch sweeps again after every CSS change (`tools/wr/ovl.py`, `touch.py`).

---

## 10. Decisions for the owner (defaults chosen; change them in the Phase 2 prompt if you disagree)

1. Mode name **Lantern Caravan** (the concept's banner name); the in-game word is "route". Alternative: "Wagon Route".
2. Three routes on one engine (Millbrook Bridge → Hollow Pines → Gallows Pass with the Headless Horseman). Alternative: one route first.
3. Home card takes the **Endless** slot; Endless stays reachable in Choose mode and on E. Alternative: a 2×2 card row.
4. Hotkey **W**. Update number **8.5**.
5. No bell notification, no News card, no redeem code are planned. Say so explicitly if you want any of them.
6. Economy: Millbrook ≈ 420–690 gold per clean run (~45 s), Gallows ≈ 1050–1730, first-of-day ×1.5; XP 60/100/150
   through the soft cap. These sit between the Graveyard and the Riddle. Adjust `pay`/`xp` in `WR_ROUTES` if you
   want it tighter.
