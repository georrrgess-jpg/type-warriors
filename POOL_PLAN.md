# Update 9.4 — The Crooked Cue (a pool mode in the casino)

Implementation plan. This document is phase 1 (the plan). Phase 2 builds the mode; phase 3 polishes it.
Read `CLAUDE.md` and `type-warriors-source/HANDOFF.md` first. Everything below names real functions and files in the current
source so the builder can go straight to them; line numbers are approximate, search by name.

**Working prototypes and concept art are in `pool_plan/`.** They are not part of the build. Port them; do not reinvent them:

| File | What it is | Status |
|---|---|---|
| `pool_plan/pzphys.js` | Ball physics: sliding/rolling friction, draw/follow/stun, english, ball–ball, cushions, jaws, pockets, rack | Tested in Node (see §6) |
| `pool_plan/pzrules.js` | 8-ball tavern rules: break, open table, groups, fouls, ball in hand, the 8, golden break | Tested in AI-vs-AI play |
| `pool_plan/pzai.js` | Opponent AI: ghost-ball candidates, analytic pot chance, simulated look-ahead, position play, safeties, ball in hand | Calibrated (§8.4) |
| `pool_plan/aisim.js`, `ptest.js`, `trace.js` | Node harnesses: physics checks, AI-vs-AI ladder, a shot-by-shot rack trace | Run with `node` |
| `pool_plan/pzball.js` | Per-pixel rolling ball renderer (numbers and stripes roll in 3D under a fixed lamp highlight) | Measured: 0.72 ms for 16 balls at 52 px |
| `pool_plan/poolart.js` | Concept-art helpers: tavern, table, balls, cue, the eight monsters | Reference look only |
| `pool_plan/1_match.png` | The match screen | Visual target |
| `pool_plan/2_roster.png` | The eight regulars | Visual target |
| `pool_plan/3_hub.png` | The tavern hub | Visual target |
| `pool_plan/4_moments.png` | The break, the slow-motion 8, the taunt, the victory | Animation targets |
| `pool_plan/5_balls.png` | Ball renderer reference | Rendering target |
| `pool_plan/run.py` | Re-renders the concept PNGs: `python3 pool_plan/run.py 1_match 2_roster ...` | Tool |

---

## 0. The concept in one paragraph

Behind a velvet curtain in the Dragon Casino is **The Crooked Cue**, a lamp-lit tavern pool hall where monsters drink, gossip and
hustle. You play 8-ball on a real-physics table against the **Regulars**, seven bar-goers with their own faces, voices, habits
and house rules, climbing a chalkboard ladder from Gloop the slime to Mortimer Bonechalk, the four-hundred-year-old lich champion.
Now and then a stranger in a fedora, **Slick Shade**, slides into the booth and offers a game. Shots feel right (draw, follow,
english, banks, rattles in the jaws), balls roll with their numbers turning under the lamp, monsters lean in, chalk up, mutter,
gloat and sulk. Because this is Type Warriors, when a monster misses you can **type a taunt** to rattle its next shot. Win the race,
take the pot, earn their signature cues. Tagline: *Rack 'em up. Read the regulars. Run the table.*

**Pillars** (every decision should serve one):
1. **It feels like real pool.** The physics in `pzphys.js` is the heart; never fake a pot.
2. **It looks alive.** A warm lamp pool on green felt; rolling balls; monsters that are always doing something.
3. **The regulars are characters.** Different looks, voices, habits, AI styles and house rules.
4. **No waiting.** Shots settle in about 4 s; the AI thinks while it chalks; every animation can be skipped by clicking.
5. **Fair money.** It is a skill game: easy monsters pay little, hard ones pay well; the 5,000 table limit applies.

---

## 1. Names and namespaces

| Thing | Name |
|---|---|
| Mode name (UI) | **The Crooked Cue** (casino tile: "Crooked Cue Pool") |
| Casino game id | `'pz'` |
| Code prefix | `pz` (unused anywhere today; checked) — constants `PZ_*`, state `PZ`, functions `pz*` |
| Save namespace | `P.pz`, normalised by `PZS()` |
| CSS | root class `pzx` (used together with `casbg`); element classes `pz*` |
| Modules | `96a`–`96n` (§3), added after `95p_menu_fx.js` with `bash tools/addmod.sh 96a_pz_data.js 95p_menu_fx.js`, then each next one after the previous |
| Tests | `t_pool.py` (Playwright), `tools/pz/*.js` (Node: physics, rules, AI calibration) |
| Update number | 9.4 (latest is 9.3) |

**Global name traps** (from `10_data.js:2`): `W`, `H`, `K`, `GY`, `KX`, `TAU` are already `const`. The prototypes use `W`/`H`
inside `PZP` only; keep it that way. Never declare `const R=`, `const B=` or similar short names at top level.

**Rename when porting** (the prototypes were written standalone; the game is one global script):

| Prototype name | Game name |
|---|---|
| `PZP`, `PZT` (pzphys) | `PZ_PHY`, `PZ_TBL` |
| `SOL`, `STR`, `grpOf` (pzrules) | `pzSol`, `pzStr`, `pzGrp` |
| `PZAIM`, `PZSLACK`, `erf`, `clear`, `clone` (pzai) | `PZ_AIM`, `PZ_SLACK`, `pzErf`, `pzClear`, `pzClone` |
| `PZB`, `PZ2`, `PZCOL`, `pzbInit`/`pzbDraw` (slow path) (pzball) | `PZ_BS`, `PZ_BA`, `PZ_COL`; drop the slow path, keep `pzbInit2`/`pzbPaint`/`pzbBlit`/`pzbRoll`/`pzbRot` |
| **`MON`**, `MONINFO`, `O`, `glow`, `txt`, `ttl`, `panel`, `rr`, `mix`, `lin`, `rnd`, `ball`, `cue`, `table`, `tavern`, `eye`, `blob` (poolart, concept only) | **never copy as-is**: `MON` is the game's monster table. Use `PZ_ART[id]` for the monster drawers, `PZO='#12081f'` for the outline, and existing helpers where they fit (`rpMix`, `rpGlow`, `ptBurst`) |

Drop the `require`/`module.exports` lines; in Node the tests load the modules through `tools/pz/load.js` (§3).

---

## 2. Architecture: a casino mode like Wildcard, drawn on its own canvas

**Entry** (copy `89f_wc_casino.js:2-9`):
```js
TA.pz=`<svg ...>`;   // tile art: green felt, a cue and the 8-ball (the TA pattern of 66e_ctiles.js); leave TCAT.pz unset
                     // (the "All games" grid lists every GAMES entry; the Special tab card below is the featured way in)
GAMES.unshift({id:'pz',n:'Crooked Cue Pool',d:'NEW · Play 8-ball against the tavern regulars.',m:()=>pzHub()});
{const g0=gameOpen;gameOpen=function(id){if(id==='pz'){CAS.tok++;cFlush();pzHub();return}return g0.apply(this,arguments)}}
```
- Add a feature card to the Special tab by wrapping `twLobby` the way `89f:16-18` does (a `pzFeat()` card and a `.nssw` switcher
  button `data-sp="pz"`), defaulting to Wildcard as today (`CAS.sp||'wc'`).
- Add a "Choose a mode" dock card like `94f_ui87.js:31-35` (`casinoOpen();gameOpen('pz')`).
- **Do not** add an Updates-tab (bell) notice. The owner must ask for one and okay it first (CLAUDE.md hard rule).

**Screens** keep `S.mode==='title'` (the casino requires it) and use `show(html,'casbg pzx')`:
- `casbg` gives: no sidebar, casino key routing, full-quality performance mode (`88l`: `PFM()==='high'`), main-canvas draw skipped.
- **Never** add the `wcx` class (it would start Wildcard's music and fit logic).
- Each screen root is a 1600×900 absolutely positioned div: CSS like `89m:13,16`
  (`#ov.pzx{display:block;padding:0;overflow:hidden}#ov.pzx>div{position:absolute;left:0;top:0}` and
  `.pzh,.pzm,.pzr{position:relative;width:1600px;height:900px;overflow:hidden}`).
- Touch mode moves `#ov` out of `#wrap` (`63_touch.js:20-27`): write `pzFitTM()` exactly like `wcFitTM()` (`89m:377-384`), wrapping
  `show` and running only when `ov.classList.contains('pzx')`.

**The match screen** is one full-stage canvas plus a DOM HUD on top (the fishing pattern, `90f_fish_ui.js:13,24`):
```js
show(`<div class="pzm" id="pzm"><canvas id="pzcv" width="1600" height="900"></canvas> ...HUD DOM...</div>`,'casbg pzx');
const cv=$('pzcv'),g=cv.getContext('2d');LIVE.push({cv,fn:()=>{try{pzFrame(g)}catch(e){console.error(e)}}});  // no `slow`: every frame
```
- `pzFrame` uses its **own clock** (`performance.now()`), not `S.t`, and steps physics with a fixed-step accumulator (`1/120` s per
  step, `pzpStep` subdivides internally). Cap catch-up at 0.1 s so a hidden tab never explodes the simulation.
- The hub and results are DOM screens with small `LIVE` canvases for animated portraits (`slow:2`, like `wcLive`, `89d:35`).

**Leaving**: `pzLeave()` = `PZ.tok++; pzStop(); try{lobby()}catch(e){title()}` (like `wcLeaveHome`, `89d`). `S.back` on every pz
screen: hub → `pzLeave`; match → the pause menu; pause menu → resume; results → hub.

**Keys**: one `window` keydown listener that acts only when `$('pzm')` or `$('pzh')` exists, the overlay is visible, no pz modal is
open, and focus is not in an input (pattern: `89c:216-218`). During a taunt prompt, letters go to the taunt (§11.4) and nothing else.
`Escape` is already routed to `S.back` by `70_main.js:52-65`.

**Pointer**: stage coordinates from the canvas rect, as `rpStageXY` (`95e:296`):
`px=(e.clientX-r.left)/r.width*1600, py=(e.clientY-r.top)/r.height*900`. Use pointer events with `setPointerCapture`
(`67e_nebula.js:262,356`), and treat `pointerType==='touch'` as touch (bigger hit targets, the power slider; §11).

---

## 3. Modules (build order: after `95p_menu_fx.js`, before `70c_ttmenu.js`)

| Module | Contents | Key API |
|---|---|---|
| `96a_pz_data.js` | Constants, the regulars table, cues/felts/ball sets, trophies, lines, save normaliser | `PZ_REG`, `PZ_CUES`, `PZ_FELT`, `PZ_BALLS`, `PZS()` |
| `96b_pz_phys.js` | Port of `pzphys.js` (rename `PZP`→`PZ_PHY`, functions `pzp*` kept) | `pzpTable`, `pzpStrike`, `pzpStep`, `pzpRun`, `pzpRack` |
| `96c_pz_rules.js` | Port of `pzrules.js` + house rules + match/race state | `pzrNew`, `pzrJudge`, `pzrTargets`, `pzMatchNew` |
| `96d_pz_ai.js` | Port of `pzai.js` + personalities + time slicing | `pzaDecide`, `pzaPlace`, `pzaNoise`, `pzAiTurn` |
| `96e_pz_balls.js` | Port of `pzball.js` (optimised path only) + shadows + pocket-drop + tray balls | `pzbInit2`, `pzbPaint`, `pzbBlit`, `pzbRoll` |
| `96f_pz_table.js` | Table bake (felt, cushions, rails, diamonds, pockets, brass), tavern backdrop bake, lamp | `pzTableBake(felt)`, `pzBackBake()` |
| `96g_pz_cast.js` | The eight monster rigs (baked parts, expressions, idle quirks, poses) + the player's hero with a cue | `pzMonBake(id)`, `pzMonDraw(g,id,st,t)`, `pzHeroDraw` |
| `96h_pz_cue.js` | Cue sprites and skins, aim guide, spin widget, power bar logic | `pzCueSprite(skin)`, `pzGuide(g,...)` |
| `96i_pz_game.js` | Match screen: mount, frame loop, input, camera, FX, turn flow, pocket/tray animation, banners | `pzMatch(opp,stake)`, `pzFrame(g)` |
| `96j_pz_ui.js` | Hub, VS intro, pause, results, cue rack, house rules/how-to, settings, tutorial tips, modals | `pzHub()`, `pzResults()`, `pzRack()` |
| `96k_pz_style.js` | All CSS (one `<style>` injection) | — |
| `96l_pz_audio.js` | Tavern music (wraps `note`), SFX, voice blips | `pzMusic()`, `pzScore`, `pzFx(name,arg)` |
| `96m_pz_casino.js` | Casino entry, Special-tab card, dock card, trophies (`A(...)`), econ tags | — |
| `96n_pz_trick.js` | Trick Shots (10 puzzles) — milestone M10 | `pzTrick()` |

Physics, rules and AI (`96b`–`96d`) must stay **pure**: no DOM, no `Math.random` inside physics (randomness only in the rack and
the AI noise, both through a seeded RNG `pzRng(seed)` — copy `dcRng`/mulberry32 from `73c_dc_game.js:12`). That lets
`tools/pz/load.js` run them in Node with `vm.runInNewContext` (concatenate the three files, evaluate, call the functions).

---

## 4. The regulars (data in `96a`, art in `96g`)

All monsters are new (do not reuse `MON[...]`). Concept: `pool_plan/2_roster.png`; their draw code in `pool_plan/poolart.js` is a
starting point for the rigs. Each has: name, title, colour, stakes, race length, pay multiplier, house rule, AI personality
(§8.3), voice (§13), idle quirk, signature cue, and lines (Appendix A).

| # | Id | Name | Who | Stakes | Race | Pays | House rule | Signature cue (beat 3×) |
|---|---|---|---|---|---|---|---|---|
| 1 | `gloop` | **Gloop** — *The Spilled Drink* | A cheerful lime slime in a bow tie; hits everything hard | 50 · 100 · 200 | 1 | ×1.6 | none (the tutorial table) | Slime Stick (glows green) |
| 2 | `moldwick` | **Granny Moldwick** — *Slow and Steady* | A mushroom-capped granny in spectacles; plays soft and safe | 100 · 250 · 500 | 1 | ×1.75 | Spore cloud: tiny spores drift over the table (cosmetic) | Mycelium Cue |
| 3 | `grizzle` | **Grizzle** — *The Breaker* | A one-eyed cyclops bouncer in a tank top; monster breaks | 200 · 500 · 1,000 | 2 | ×1.9 | Winner breaks | Smasher (iron-banded) |
| 4 | `vesper` | **Vesper Nightwing** — *Queen of Safeties* | An elegant vampire bat; hides the cue ball | 300 · 500 · 1,000 · 2,000 | 2 | ×2.0 | Lights low: darker table edges | Nightwing Cue (bat-wing butt) |
| 5 | `barnacle` | **Cap'n Barnacle** — *Banks and Kicks* | A crab pirate in a tricorn; loves rails | 500 · 1,000 · 2,000 · 3,000 | 2 | ×2.2 | Bank the 8: the 8 must touch a cushion before it drops | Driftwood Harpoon |
| 6 | `hootsworth` | **Professor Hootsworth** — *Position Master* | An owl scholar with brass spectacles; plans three shots ahead | 1,000 · 2,000 · 3,000 · 4,000 | 3 | ×2.5 | Short guide only (no object-ball line) | Scholar's Quill |
| 7 | `mortimer` | **Mortimer Bonechalk** — *Champion of the Crooked Cue* | A crowned lich with ghost-blue eyes; spins the cue ball like magic | 2,000 · 3,000 · 4,000 · 5,000 | 3 | ×3.0 | 25-second shot clock | Bonechalk Scepter |
| — | `shade` | **Slick Shade** — *The Hustler* | A living shadow in a fedora, yellow eyes, white grin | any (≤ 5,000) | 2 (→3) | ×2.4 (→×3.2) | Hustle (§12.4) | Shadow Cue + Moonstone ball set |

- **Unlocks:** Gloop is open. Beating a regular once unlocks the next. The hub chalkboard shows beaten ones with "✓ beaten ×N" and
  locked ones as "? ? ?" (concept 3).
- **Stakes** never exceed `CAS_LIM` (5,000); read the cap through `casCap('pz')` (it returns 5,000) so a future change applies.

---

## 5. Table geometry and layout (1600×900 stage)

- **Physics playfield** = 880×440 px, mapped 1:1 to stage pixels with origin at **(360,214)** (the cushion nose). Ball radius
  `R=12`. Concept 1 is drawn on exactly this geometry (`TB={x:360,y:214,w:880,h:440,rail:44}` in `poolart.js`).
- Rails 44 px; cushions 14 px inside the rails; pocket graphics: corners r=34 (hole 23), sides r=30 (hole 20), positions in
  `pockets()` of `poolart.js`. The physics capture circles are in `pzpTable()` (`P` list) — keep the art holes centred on them.
- **Screen layout** (concept `1_match.png`):
  - Top HUD (y 14–118): your card (left), match card (centre: race, rack, pot), opponent card (right, portrait at its left end).
  - Table centre; the pendant lamp's shade just under the HUD.
  - Left of the table (x 0–330): **your hero** (`drawHero`) holding your cue. Right (x 1290–1600): **the opponent**, half body,
    with a speech bubble.
  - Bottom bar (x 300–1300, y 742–882): spin widget, power bar, hint line, shot clock ring, guide toggle. Menu button bottom-left.
  - Ball-return tray along the front apron (y ≈ 700): pocketed balls roll into it (§9.6).

---

## 6. Physics (port `pool_plan/pzphys.js` into `96b`)

Model (read the header comment in the file):
- Each ball has centre velocity `v` and **roll velocity** `u` (surface speed from spin). `u==v` is pure rolling; `u=0` is
  stun/sliding; `u` opposite to `v` is draw. While `|u-v|` is large the ball slides: friction `μs·g` pulls them together (`v` gains,
  `u` loses 2.5× as much, a solid sphere); when they meet it rolls and slows by `μr·g`. **This one rule produces draw, follow and
  stun naturally**: a ball–ball hit swaps the normal component of `v` but leaves `u` alone.
- Side spin `es` decays slowly and adds a tangential kick on cushion contact (running/reverse english).
- Ball–ball: equal masses, restitution 0.95, positional de-overlap. Cushions and jaws: line segments with restitution 0.78; the
  normal part of `u` is reversed at 40% so follow/draw bend the path off a rail.
- Pockets: a ball whose centre enters a capture circle drops. The jaws are angled segments, so balls rattle and get rejected for
  real.
- Substeps adapt to the fastest ball (≤ 4 px per substep); balls at rest are skipped (big speed-up).

**Measured** (`node pool_plan/ptest.js`):

| Check | Result |
|---|---|
| Cut shot into the far corner | potted, cue ball stays up, settles in 1.9 s |
| Straight shot into a side pocket from 260 px, low / centre / high hit | draw pulls the cue ball back ~230 px; stun-from-distance rolls on ~100 px (as on a real table); follow scratches in the same pocket |
| Ball rolled along the rail | drops into the corner |
| Break (40 racks) | 1.13 balls pocketed on average, no scratches, 0 golden breaks, settles in ≤ 4.3 s, balls spread ~208 px |
| Cost | a full break ≈ 4.6 ms to simulate; a typical shot ≈ 2.8 ms (Node). Budget ×2.5 on a Chromebook. |

**Tunables** (`PZP` in the prototype): `MUS .2`, `MUR .035`, `EB .95`, `EC .78`, `CF .97`, `ENG .35`, `CM 31` (corner mouth),
`SM 27` (side mouth), `MAXV 3200` px/s (100% power), `STOP 3` px/s. Change them only with the Node checks running; record any change
in HANDOFF.

**Port rules**:
- Keep the event list (`{t:'bb'|'cu'|'pk',a,b,s,p}`): rules, sound and FX all read it. Add the shot time `tm` to each event when
  stepping live so the FX can be placed at the exact moment.
- Live play: call `pzpStep(B, 1/120, ev)` from the accumulator. AI/tests: `pzpRun(B,maxT)`.
- Add `pzpCanPlace(B,x,y,kitchen)` for ball in hand (inside the playfield by R+1, no overlap with any ball, `x<=220` when
  `kitchen`).
- The 8 re-spot (8 on the break with a scratch): put it on the foot spot (660,220) or the nearest free point behind it on the line.

---

## 7. Rules and match flow (port `pool_plan/pzrules.js` into `96c`)

The tavern rules are written at the top of `pzrules.js` (break, open table, groups, fouls, ball in hand, the 8, golden break).
Points the builder must keep:
- Legality of the first contact is judged against the table **as it was before the shot** (the prototype had a bug here; fixed).
- **Calling the 8**: when the shooter is on the 8, the six pockets pulse and the player clicks one (keyboard: `1`–`6`). The HUD
  shows "8 → top-right". The AI sets `st.call` from its chosen pocket. Pocketing the 8 elsewhere loses the rack.
- **Ball in hand**: anywhere (behind the head string only after a break scratch). The cue ball follows the pointer as a ghost
  with a green ring when the spot is legal, red when not; click to place; it can be re-placed until the first aim drag. Keyboard:
  arrows move it 6 px (Shift 24 px), Enter places.
- **Shot clock**: 45 s (Mortimer 25 s); warning ring turns amber at 10 s and pulses at 5 s; expiry = foul. Off in Practice.
- **Match**: a race to N racks (§4). Break order: you break rack 1; then alternate, except at Grizzle's table (winner breaks).
- **House rules** live in `PZ_REG[id].house` and are applied in `pzrJudge` (`bank8`: the 8 needs a `cu` event after the cue
  ball's first contact and before its `pk`) or in the UI (`shortGuide`, `clock:25`, `lightsLow`, `winnerBreaks`).
- **Stats per shot** (for trophies/AI/FX): pocketed list, first contact, banks (`cu` on the object ball between first contact and
  its `pk`), combos (object ball pocketed after being hit by another object ball), run length, break-and-run (a rack where the
  breaker never gives up the table), golden break.

---

## 8. The opponents' AI (port `pool_plan/pzai.js` into `96d`)

### 8.1 How it chooses
1. **Candidates**: each legal target × each pocket. Ghost-ball aim point `target − 2R·u` (u = unit vector target→pocket aim point
   `PZAIM`). Both lines (cue→ghost, target→pocket) must be clear; cut < 80°; side pockets need a squarish entry.
2. **Analytic pot chance**: aim tolerance `tolA = (slack/dist_target_pocket) · 2R·cos(cut) / dist_cue_ghost`; with Gaussian aim error
   σ the chance is `erf(tolA/(σ√2))`.
3. **Look-ahead**: the best `look` candidates are simulated noise-free with 3 spins × 2 powers; reject scratches, misses and
   early 8s; score = pot chance + `pos` × (best pot chance of the next shot from where the cue ball stops).
4. **Safety**: if the best chance is below `safe`, try `sTry` soft legal shots and keep the one that leaves the opponent the
   lowest best chance.
5. **Ball in hand**: try a grid of spots and place where the best next shot is easiest (`pzaPlace`).
6. **Execute** with noise on angle (σ degrees), power (`psig`) and spin.

Banks and kicks (Barnacle and up): add one-rail bank candidates (mirror the pocket aim point across each rail) and one-rail kicks
(mirror the ghost point) when nothing direct is open; score them with the analytic chance halved. The prototype does not have this
yet: write it in M5 and check it in the ladder.

### 8.2 Time slicing (no freezes on a Chromebook)
The AI runs **only while the table is still**, inside the monster's pre-shot routine (§9.5). Split `pzaDecide` into a generator
(`function*`) that yields after each simulated shot; `pzFrame` resumes it until 5 ms of the frame are used. Typical decision:
20–45 simulations × ~7 ms (Chromebook estimate) ≈ 0.2–0.3 s of work spread over the 1.2–2.5 s routine. Hard cap: if the routine
ends first, use the best result so far.

### 8.3 Personalities (data in `PZ_REG[id].ai`)
| Id | σ aim° | psig | pos | safe | sTry | look | Style notes |
|---|---|---|---|---|---|---|---|
| gloop | 2.6 | .14 | 0 | 0 | — | 3 | Always power ×1.3 (overhits), never plays safe, often scratches |
| moldwick | 1.9 | .10 | .1 | .15 | 12 | 4 | Power ×0.8 (soft), takes the easiest ball even if it leaves nothing |
| grizzle | 1.6 | .12 | .1 | 0 | — | 4 | Break power 1.0 and σ 0.8 on the break; otherwise blunt |
| vesper | 1.25 | .08 | .25 | .40 | 24 | 5 | Plays safe whenever the best chance < 40% |
| barnacle | 1.0 | .07 | .3 | .3 | 20 | 5 | Prefers banks: bank candidates get ×1.4 score |
| hootsworth | 0.75 | .05 | .6 | .3 | 24 | 6 | Strong position play, uses draw/follow freely |
| mortimer | 0.32 | .03 | .8 | .3 | 28 | 8 | Uses side spin (try a=±.5 in the look-ahead), near-perfect (0.5 was too close to Hootsworth, §8.4) |
| shade | mirrors the hardest regular you have beaten (rack 1 at σ×1.5, the "hustle") | | | | | | |

The style notes (Gloop's overhitting, Moldwick's soft power, Grizzle's break, Barnacle's bank preference, Mortimer's side spin)
are **not in the prototype**: the ladder in §8.4 ran on the σ/psig/pos/safe/look numbers alone. Add the styles in M5 and re-run the
ladder; they should make each regular *feel* different without moving the win rates much.

**Rattled** (after a successful taunt, §11.4): the next shot uses σ×1.6 and psig×1.5, and the monster's face shows it.

### 8.4 Calibration (AI vs AI, N=40 racks each, `node pool_plan/aisim.js a:b`)
| Match (A vs B) | Racks | A wins | Avg shots per rack | Note |
|---|---|---|---|---|
| Gloop vs Moldwick | 40 | 33% | 35 | |
| Moldwick vs Grizzle | 40 | 45% | 31 | |
| Grizzle vs Vesper | 40 | 43% | 31 | |
| Vesper vs Barnacle | 40 | 40% | 41 | Vesper's safeties make longer racks |
| Barnacle vs Hootsworth | 40 | 40% | 37 | the prototype has no banks yet (M5 adds them for Barnacle) |
| Hootsworth vs Mortimer (σ 0.5) | 40 | 55% | 29 | too close: Mortimer retuned |
| Hootsworth vs Mortimer (σ 0.32, pos .8, look 8) | 80 | 33% | 26 | **use this** |
| Barnacle vs Mortimer (σ 0.32) | 80 | 28% | 26 | |
| Gloop vs Mortimer (σ 0.5) | 40 | 8% | 29 | |
| Gloop vs Gloop / Mortimer vs Mortimer | 40 | 55% / 50% | 30 / 31 | sanity: mirror matches are even |

Each step up the ladder wins about 55–72% of racks against the regular below (±8% noise at 40 racks). Weak regulars lose many
racks by blundering the 8 (early, wrong pocket, or with a foul): that is part of their charm and gives beginners wins.
Simulation speed: 0.6–1.5 s of CPU per AI-vs-AI rack in Node.

Use `aisim.js` to re-check after any physics or AI change; each regular should beat the one below about 55–70% of racks.
Human testing will decide the final σ values; adjust them in `PZ_REG`, not in code.

---

## 9. Rendering and animation (the heart of "brilliant")

### 9.1 Layers per frame (budget in brackets, measured or estimated on headless Chromium)
1. Baked backdrop: tavern walls, shelf, floor, table frame, felt, lamp pool, diamonds, pockets — one `drawImage` (0.1 ms).
2. Lamp light: one cached radial sprite with `'lighter'` at the lamp's swing offset (±6 px, 7 s period) (0.05 ms).
3. Ball shadows: a contact shadow (small dark ellipse) plus a soft lamp shadow stretched away from the lamp centre; one baked
   sprite drawn rotated/scaled (0.1 ms).
4. Balls: from the atlas (`pzbBlit`), repainting only the ones that moved (`pzbPaint` ≤ 0.8 ms with all 16 moving at 52 px).
5. Aim guide and ghost ball, the cue (one sprite, rotated) (0.1 ms).
6. FX: particles (`ptBurst`-style but own pool, cap 120), impact flashes, pocket glints (≤ 0.3 ms).
7. The two characters (baked parts with transforms, §9.4) (≤ 0.4 ms).
8. DOM HUD on top (only text changes; animations are transform/opacity).

Total target ≤ 2.5 ms per frame while balls roll; ≤ 1 ms at rest. **Lite mode** turns on when the 2-second average frame time is
over 28 ms: balls painted at 36 px, particle cap 40, no lamp sway, no crowd FX.

Never use `ctx.filter`, `shadowBlur`, `backdrop-filter`, `soft-light`/`screen` blends, or animated `box-shadow`/`filter` (CLAUDE.md).

### 9.2 Baked art (`96f`)
- **Felt**: two-stop vertical gradient per felt colour + 1,400 light/dark specks + a warm radial lamp pool + darker edges
  (`lightsLow` makes the edges darker still). Head string as a faint dashed line; head and foot spots.
- **Cushions**: a darker felt band 14 px wide with an inner shadow line and a 2 px highlight on the nose.
- **Rails**: wood gradient (`#8a4a20 → #6a3414 → #7a3e18`) with grain curves, a 2 px top highlight, mother-of-pearl diamonds
  (18 sights), brass corner plates.
- **Pockets**: brass rim with a highlight arc, leather throat (radial black → `#2a1a14`), a faint inner ring.
- **Apron and legs**, floor shadow under the table.
- **Tavern backdrop**: plank wall, shelf of glowing bottles, string lights, floor planks, vignette (concept 1 and 3; code in
  `poolart.js` `tavern()`). Bake at stage size once per felt; keep the canvases (≈ 6 MB), drop them when leaving.
- Bake on entry to the hub in idle slices (like `cdPre`, `66d:34`) so the match opens instantly.

### 9.3 Balls (`96e`, port `pzball.js` optimised path)
- 2× atlas (52 px per ball for a 24 px ball) so the stage can scale up to 2× and stay crisp; repaint only moving balls.
- Orientation per ball: a 3×3 matrix updated every physics frame with `pzbRoll(M, ux, uy, dt, R)` using the **roll velocity**
  `u` (a sliding ball's numbers don't turn as fast as it moves: that is correct and looks great on draw shots), plus a z-rotation
  from `es` (side spin visibly spins the number).
- Numbers: glyphs from Poppins 800 baked to 64×64 alpha masks (wait for the font: `document.fonts.check('800 40px Poppins')`, then
  rebuild the masks once if it loads late).
- Ball sets (cosmetic): Classic, Gemstone (jewel tones + gold numbers), Moonstone (pale, glowing numbers; Shade's prize).

### 9.4 Characters (`96g`)
- **Rig**: bake each monster into parts on entry (body, head per expression, eyes-open/eyes-closed layer, arm+cue, accessories).
  Draw per frame with transforms only. Expressions: `neutral`, `happy`, `smug`, `sad`, `angry`, `think`, `rattled`.
- **Always alive** (all of these on every monster): breathing (body scaleY 1±0.012, 3.2 s), blink every 2–5 s (90 ms), a slow head
  tilt (±2°, 5 s), a weight shift (x ±3 px, 7 s), and the monster's **idle quirk**:
  - Gloop: wobble (skewX sin, 1.6 s), bubbles rising inside, sips a glowing soda.
  - Moldwick: spores puff from the cap every 6–9 s; pushes up her spectacles.
  - Grizzle: cracks his knuckles (2-frame shake), his eye darts left/right.
  - Vesper: wings ruffle (scaleX pulse), sips a red drink, fang glint sparkle.
  - Barnacle: claws clack open/shut, eye stalks bob out of phase.
  - Hootsworth: head swivels (rotation ±25° and back), lenses glint, scribbles in a notebook.
  - Mortimer: ghost-flame motes rise from the crown, eyes pulse, floats ±4 px.
  - Shade: smoke edges ripple, grin widens and narrows, flickers to 80% opacity now and then.
- **Reactions** (spring on scale/rotation/position, 0.4–0.8 s):
  - Good shot by the monster: `happy` + a hop (y −18, ease-out-back) + a line.
  - Monster misses: `sad`/`angry`, slump (rotate 4°, y +6).
  - You pot a great one: `smug` → `sad` "...lucky" or an impressed whistle (by personality).
  - Foul: whoever fouled shows `angry`; the other `smug`.
  - Match point: the monster leans in (scale 1.04), sweat drop on the timid ones.
  - Win/lose: celebrate (jump ×2, confetti in its colour) / sulk (head down, ears droop, looks away).
- **Your hero** stands on the left: `drawHero(g,{arm:P.armor,wp:P.weapon,col:P.col,t,lg:0,walk:0,pose})` at scale 2.1, feet at
  (176,770), holding your equipped cue sprite in front (concept 1). Bake 2 frames per pose into sprites on entry to stay inside the
  budget; leans toward the table when it is your shot.

### 9.5 Cue and the pre-shot routine
- **Your cue**: follows the aim with a critically damped spring (ω ≈ 30 rad/s) so it glides, never snaps. While idle it breathes
  (±2 px along its axis). **Power**: drag back from the cue ball (or the power bar); the cue slides back 0–120 px with the power
  and the power bar fills (transform scaleX). Releasing plays the **stroke**: ease-in from the pulled-back position to the ball in
  70–120 ms (faster at high power) → physics starts on the contact frame → follow-through 20 px → the cue fades out (opacity
  0.3 s) while balls roll → it slides in again (0.25 s, ease-out) when it is your turn.
- **Monster's routine** (this is what makes them feel alive; the AI thinks during it, §8.2): its cue appears with its skin; it
  **considers** 2–3 candidate angles (the cue sweeps between them with the spring), chalks (a chalk cube rises, 2 twists, blue
  dust puff), settles on the final angle, takes 2–3 practice strokes (±25 px, 0.35 s each, ease-in-out), pauses 0.2 s, shoots.
  Length by personality: Gloop 0.8 s (no practice strokes), Moldwick 2.6 s, Hootsworth 2.2 s, Mortimer 1.6 s (one stroke).
  A click skips to the shot.

### 9.6 Ball events: what you see and hear for each physics event
- **Ball–ball** (`bb`): if speed > 600, 3–6 white specks and a 60 ms flash at the contact point; click sound by speed (§13).
- **Cushion** (`cu`): over 900 speed, a puff of felt dust along the cushion; thud sound.
- **Pocket** (`pk`): the ball slides into the hole over 160 ms (ease-in): moves to the pocket centre, scales to 0.72, darkens to
  black, clipped by the hole; a gold glint ring on the pocket rim; rattle-and-drop sound. Then it **appears in the return tray**
  on the apron, rolling in from the right with its numbers turning, and clacks against the previous ball.
- **Cue ball scratch**: the cue ball drops the same way; the HUD shows a red "Scratch!" banner (shake ±6 px, 0.3 s); the cue ball
  floats back up from the pocket (scale 0.7→1, 0.4 s) to become the ball-in-hand ghost.
- **Golden break**: everything freezes for 0.25 s on the frame the 8 drops, gold ring burst, "GOLDEN BREAK!" banner, coin shower.

### 9.7 Camera and time
- **Break**: a 120 ms shake (±5 px, decaying) on contact with the rack.
- **The deciding 8**: when the 8 is within 90 px of its called pocket and heading in, time scales to 0.35 over 0.15 s and the
  camera zooms to 1.6× around the pocket (ease-in-out 0.4 s); letterbox bars slide in (transform), the crowd hushes. After the drop:
  hold 0.3 s, zoom back out, cheer. Concept `4_moments.png` panel 2.
- Camera = `g.setTransform` on the canvas; the baked backdrop is drawn scaled during the zoom (brief softness is fine).

### 9.8 HUD and screen transitions (DOM, transform/opacity only)
- **Turn banner** ("Your shot" / "Vesper's shot"): slides in from the top (translateY −40 → 0, 0.3 s, ease-out-back), holds 0.8 s,
  fades out.
- **Foul banner**: red, shakes. **Group assigned**: the 7 group balls under your name pop in one by one (scale 0→1, 40 ms stagger).
- **Potted balls in the cards**: the slot dims to 25% with a little scale pulse when that ball drops.
- **Score change**: the centre numbers flip (rotateX 90° → 0) and glow.
- **Racks**: between racks the remaining balls fly back into a triangle (arcs with 30 ms stagger), the wooden triangle frame
  slides in, settles, lifts away (0.9 s total). Skippable.
- **VS intro** (match start, 2.4 s, skippable): the monster slides in from the right and your hero from the left; names and the
  stake; two chip stacks fly into the centre pot; the rack drops; "You break!".
- **Results** (concept 4 panel 4): coins fountain into the gold counter (`balUp`), the payout counts up, unlock cards flip in,
  the monster sulks or gloats, buttons Rematch (Enter) / Back to the bar (Esc).

---

## 10. Screens (`96j`)

1. **The hub** (concept `3_hub.png`): title "The Crooked Cue"; left buttons Practice Table, Trick Shots, Cue Rack, House Rules;
   centre chalkboard "Tonight's Tables" (the ladder; hovering a row previews the monster on the right); right: the selected
   opponent's panel (portrait animated, title, stars, quote, style, house rule, stake chips, "Win pays X · race to N", today's
   multiplier if tapered), the big **Rack 'em up!** button; bottom: other regulars at the bar and a small table (they idle and
   react when you hover their row). Gold counter top-right; "‹ Casino" top-left. A "Resume match vs …" banner when `P.pz.live`
   exists.
2. **Match** (concept `1_match.png`) with the pause menu (Resume, House rules, Settings, Forfeit — with a confirm that says the
   stake is lost).
3. **Results** (concept 4 panel 4).
4. **Cue Rack**: tabs Cues / Felts / Balls; a large preview (the cue rotates slowly, the felt shows a mini table, the ball set
   rolls); locked items say how to earn them; equipped badge.
5. **House Rules / How to play**: short illustrated cards (aim, power, spin, ball in hand, calling the 8, fouls, taunts).
6. **Settings** (in pause and hub): Guide (Full / Short / Pro), Taunts (on/off), Shot clock (on/off; on is forced in paid
   matches), sounds.
7. **First-time tips** (coach marks, once each, stored in `P.pz.tut`): aim → power → spin → ball in hand → calling the 8 → taunt.
8. **Practice Table**: free play against any unlocked regular, or solo (re-rack button, no clock, full guide). No stakes,
   no rewards, no trophies except "First rack".

---

## 11. Controls

### 11.1 Mouse
Move to aim (the cue spring-follows the pointer around the cue ball). Press and drag back to set power; release to shoot; drag
back to zero to cancel. Right-click or `Esc` while dragging cancels. Scroll wheel fine-tunes the angle (0.05°/notch, Shift 0.5°).

### 11.2 Keyboard
`←/→` fine aim (0.1°; Shift 1°), `↑/↓` power ±5%, `W/A/S/D` move the spin dot, `R` reset spin, `Space`/`Enter` shoot at the set
power, `G` cycle the guide, `1`–`6` call a pocket for the 8, `Esc` pause. During ball in hand: arrows move the ghost, `Enter` places.

### 11.3 Touch (Chromebook touchscreens)
Drag on the table to aim (the angle from the cue ball to your finger), a vertical **power slider** at the table's right edge
(pull down, release to shoot), tap the spin widget. Hit targets ≥ 44 px. Pinch is not needed.

### 11.4 Typing taunts (the Type Warriors twist)
After a monster misses (no foul needed), 40% of the time — at most once per rack, never on match point, only if Taunts are on —
a prompt slides up: **"TAUNT! type it:"** + a short line chosen for that monster (Appendix A, ≤ 20 characters), with a draining bar
(3.0 s + 0.12 s per character). Typed letters turn gold; mistakes shake the line (no penalty). Finish in time and the monster is
**rattled** for its next shot (§8.3): `rattled` face, a reply ("Hmph!"), its practice strokes jitter. Fail and it laughs. The
prompt never blocks play; it disappears when your shot starts. Concept `4_moments.png` panel 3.

### 11.5 Spin and guide
- Spin widget: a cue-ball face with a red dot; click/drag inside the circle (radius clamps to 0.8). Top = follow, bottom = draw,
  left/right = english. Shows "draw", "follow", "left" labels.
- Guide (Full / Short / Pro):
  - Full: dashed line to the ghost ball, ghost outline, the object ball's path (170 px), the cue ball's tangent path (90 px,
    bending forward or back by the spin estimate).
  - Short: the ghost ball and 60 px of the object path.
  - Pro: the line to the first contact only.
  Hootsworth's table forces Short. Trophy for beating Mortimer on Pro.

---

## 12. Money, progression and fairness

### 12.1 Stakes and pay
- Stake chips per regular (§4); max 5,000 (`casCap('pz')`). Taking the stake: `cTake(stake)` at "Rack 'em up!" (refuse if gold is
  short, show the cheaper chips). Win: `ecSrc('pool',()=>cPay(stake, Math.round(stake*mult)))`. Lose: `cPay(stake,0)` (records the
  play). Tag every grant with `ecSrc('pool',…)` so the 9.x ledger can tell pool income apart.
- **Bonuses** (paid with the win, also through `cPay`'s `pay` argument): break-and-run +10% of the stake (max 500) per rack;
  golden break +25% (max 1,000).
- **Daily paid matches**: 20 (like `WCE.DAILY`); after that, matches are friendly (no stake) until tomorrow (day key like
  `wcDay()`, protected by 94d's clock guard).

### 12.2 "They're wise to you" (anti-farming)
Each win against the same regular on the same day lowers that regular's multiplier by 0.1 (floor ×1.3; Gloop's floor ×1.2).
The hub shows it ("Gloop is wise to you: ×1.4 today"). Resets daily. This keeps easy tables from being farmed while leaving the
ladder rewarding.

### 12.3 Forfeit and resume
- Leaving mid-match (pause → Forfeit, or `Esc` on the hub-return path) asks for confirmation; forfeit = loss.
- The match snapshot is saved to `P.pz.live` at the start of every turn (balls `[[id,x,y,on]]`, groups, turn, ball-in-hand,
  score, rack, breaker, stake, opponent, multiplier, house state). Reloading the page and opening the hub offers **Resume**;
  declining forfeits. No refunds by refreshing.

### 12.4 Slick Shade, the hustler
- Can appear when you open the hub, with 12% chance, if you have beaten Grizzle, hold ≥ 2,000 gold, and he hasn't appeared today.
  He slides into the empty booth (smoke) with a line, and his row appears on the chalkboard until you leave the hub.
- Plays at the level of the hardest regular you have beaten, but rack 1 at σ×1.5 (the hustle). Race to 2, pays ×2.4.
- **"Let it ride"**: if you win rack 1, he offers to extend to a race to 3 for ×3.2 total (same stake; the cap holds).
  Accept/decline buttons; his skill drops the act (full σ) after the offer.
- Beat him 3 times: Shadow Cue + Moonstone ball set. Trophy "Hustled the Hustler".

### 12.5 Cosmetics (`P.pz.cue/cues`, `felt/felts`, `balls/ballsets`)
- **Cues**: House Cue (free), the 7 signature cues (beat each regular 3 times), Shadow Cue (Shade), and shop cues bought with gold in
  the Cue Rack: Maple Classic 1,500, Ember Cue 4,000, Frost Cue 4,000, Dragonbone 12,000. Cosmetic only (no stat changes).
- **Felts**: Tavern Green (free), Crimson (beat Grizzle), Royal Blue (beat Vesper), Midnight Violet (beat Hootsworth),
  Champion Gold (beat Mortimer).
- **Ball sets**: Classic (free), Gemstone (shop 6,000), Moonstone (Shade).

### 12.6 Trophies (`96m`, `A(id,'Casino',tier,name,desc,target,()=>value,gold)`; stats via `stat()`; `achCheck()` after each match)
| Id | Tier | Name | Goal | Gold |
|---|---|---|---|---|
| pz1 | 0 | First Rack | Win a rack | 100 |
| pz100 | 1 | Pocket Full | Pocket 100 balls | 300 |
| pzbnr | 2 | Run the Table | A break-and-run | 600 |
| pzgold | 2 | Golden Break | Pocket the 8 on the break | 600 |
| pzbank | 1 | Bank Artist | 10 bank shots | 300 |
| pzall | 2 | Regular | Beat all seven regulars | 1,000 |
| pzchamp | 3 | Champion of the Crooked Cue | Beat Mortimer | 2,000 |
| pzpro | 3 | No Training Wheels | Beat Mortimer with the Pro guide | 2,500 |
| pzshade | 2 | Hustled the Hustler | Beat Slick Shade | 800 |
| pztaunt | 0 | Silver Tongue | Rattle 10 monsters with taunts | 150 |
| pztrick | 2 | Trick Shot Master | 3 stars on all 10 trick shots | 1,000 |

---

## 13. Audio (`96l`)

- **Music**: wrap `note` like Wildcard (`89j:45`): `if(pzMusic())return pzScore(t,n)` with
  `pzMusic=()=>CAS.on&&ov.classList.contains('pzx')&&!ov.classList.contains('hide')`. A swing tavern loop at 96 bpm: walking bass
  (triangle), brushed snare (filtered noise), soft electric-piano chords (sine+triangle with tremolo), a lazy clarinet-ish lead
  (filtered square). Levels: hub (bass + piano), match (+ drums), tension (on the 8: stop-time hits, lead drops out), slow-mo
  (everything ducks to 20%). Route through `kInit()` buses so the Music mute works; set `KS.on=0` when taking over.
- **SFX** (route to `sg`, respect `ST.svol`; synthesise, no samples):
  - cue strike: 15 ms high-passed noise + a "tock" sine 1.2 kHz → 600 Hz (40 ms), volume by power
  - ball click: sines 2.8 kHz + 3.6 kHz (50 ms decay) + 5 ms noise, volume ∝ impact speed, ±5% pitch; max 8 voices at once
  - cushion: sine 140 → 90 Hz (80 ms) + low-passed noise
  - pocket: wooden clunk (220 + 330 Hz, 60 ms) then a rattle (noise bursts at 30 Hz for 0.4 s, low-pass 900 Hz)
  - tray clack, chalk squeak (band-passed noise, 120 ms), crowd ooh (noise swell, band-pass rising), cheer, groan
- **Voices**: each line plays a burst of syllable beeps (one per 2 characters, 55 ms apart): Gloop sine 330 Hz with wobble;
  Moldwick shaky triangle 520 Hz; Grizzle sawtooth 110 Hz; Vesper breathy sine 700 Hz; Barnacle square 260 Hz with claw-clack
  noise; Hootsworth triangle 440 Hz with a "hoo" glide; Mortimer sine 180 Hz with two echoes; Shade a band-passed whisper.

---

## 14. Save data (`PZS()` in `96a`, the `wcSt()` pattern from `89d:4-8`)

```js
P.pz = { v:1, beat:{gloop:0,...}, wins:0, losses:0, racks:0, pots:0, bnr:0, golden:0, banks:0, taunts:0,
         streak:0, best:0, day:'', dayN:0, rep:{},            // rep = wins per regular today (taper)
         cue:'house', cues:{house:1}, felt:'tavern', felts:{tavern:1}, balls:'classic', ballsets:{classic:1},
         guide:'full', tauntsOn:true, clockOn:true, trick:{}, shade:{day:'',beat:0},
         live:null, tut:{} }
```
Normalise every key by type on access (defaults copied with `JSON.parse(JSON.stringify(d))`), reset `dayN`/`rep` when the day key
changes, validate `cue`/`felt`/`balls` against owned items, and drop a `live` snapshot that fails validation (forfeit it).

---

## 15. Testing

1. **Node** (`tools/pz/`): `load.js` evaluates `96b`+`96c`+`96d` in a `vm` context. `phys.test.js` turns the `ptest.js` checks into
   asserts. `rules.test.js`: golden break, break scratch (kitchen), 8 on the break with a scratch (re-spot), illegal break, wrong
   ball first, no rail, 8 too early, 8 in the wrong pocket, 8 with a foul, balls pocketed on a foul stay down, group assignment, bank-8
   house rule. `ladder.js` = `aisim.js` with expected bands. Run all three in M1/M5 and before delivery.
2. **`t_pool.py`** (Playwright, ~45 checks; patterns from `t_cas93.py` and `t_ui92.py`): casino tile and Special card open the hub;
   back paths; ladder locks; stake chips capped at 5,000 and `cTake` on start; the rack is 15 balls in a triangle; mouse aim
   rotates the cue; drag power fills the bar; a shot moves balls and settles; ball-in-hand ghost legal/illegal; calling the 8;
   foul banner; the AI shot completes and its think slices stay under 6 ms (instrument `pzAiTurn`); win and loss pay through
   `cPay` (wrap it like `t_cas93`); taper; daily cap; forfeit modal; **resume after reload**; trophies; cosmetics equip; taunt
   typing rattles the AI (σ ×1.6); reduced motion skips slow-mo and shakes; `Esc`/back; touch fit (`pzFitTM`); no page errors.
   Use a seeded RNG hook (`PZ.seed`) so racks are deterministic in tests.
3. **Screenshots** (Playwright, `tools/rr/snap.py` as template): hub, VS intro, aiming with the full guide, mid-break, ball in hand,
   calling the 8, slow-mo 8, taunt prompt, results win and loss, cue rack, house rules, each monster in the match seat (8 shots),
   touch layout at 1280×720. Compare against `pool_plan/*.png`.
4. **Performance**: copy `tools/rr/rfps.py` to `tools/pz/fps.py` and point it at `casinoOpen();gameOpen('pz')` → a match → a break.
   Record mean/p95 frame times before and after; `tools/rr/rlive.py` shows the `pzcv` LIVE cost. Targets in §9.1.
5. **Regression**: add `t_pool` to `tools/regress.sh`; run the whole suite before delivery (`tools/servers.sh start/stop`).

---

## 16. Milestones (build in this order; each ends with its checks green and a screenshot)

| M | Scope | Done when |
|---|---|---|
| M0 | Modules created with `addmod.sh`; CSS root; casino tile + Special card + dock card open an empty hub; back paths | Opens from the casino and returns; no page errors |
| M1 | Port physics + rules into `96b`/`96c`; `tools/pz` loader and Node tests | `phys.test.js` and `rules.test.js` pass |
| M2 | Table + tavern bake, ball renderer + shadows, a static racked table on the match canvas | Screenshot matches `1_match.png` table/balls; ≤ 1 ms at rest |
| M3 | Your shot: aim spring, power drag, spin widget, guide, stroke animation, live physics, pocket drop, return tray, sounds (basic) | Shots feel right; break ≤ 2.5 ms/frame |
| M4 | Match flow: turns, fouls, ball in hand, calling the 8, racks + race, HUD, banners, shot clock, results, payouts, resume/forfeit | `t_pool` flow checks pass vs a dummy opponent that taps the cue ball |
| M5 | AI port + time slicing + banks/kicks + personalities; monster pre-shot routine; calibration | Ladder within bands; think slices ≤ 6 ms |
| M6 | The eight monster rigs (expressions, idle quirks, reactions), your hero with a cue, speech bubbles + lines, taunt typing | Screenshot each monster seated; taunt check passes |
| M7 | Hub (chalkboard ladder, opponent panel, stakes, taper, bar regulars), VS intro, Slick Shade | `3_hub.png` look; Shade check passes |
| M8 | Audio: music levels, SFX set, voices | Mute/volume respected |
| M9 | Cue Rack, cosmetics, trophies, House Rules, settings, first-time tips, Practice Table | Checks pass |
| M10 | Trick Shots (10 layouts with 1–3 stars, one-time 200 gold per 3★) | Each layout solvable (a Node check simulates the intended shot) |
| M11 | **Polish pass**: walk §9 line by line; slow-mo 8, camera, rack animation, FX; lite mode; perf | Every item in §17 ticked |
| M12 | Full regression, HANDOFF section, CLAUDE.md lines, delivery (both html files identical, zip, commit, push, screenshots) | Delivered; **no bell notice** unless the owner asks |

---

## 17. Animation and quality checklist (tick every line before calling it done)

- [ ] The cue never snaps: aim, appear, disappear and the monster's angle sweeps all use the spring or an ease.
- [ ] Balls roll: numbers and stripes turn with the roll velocity; side spin visibly spins the number; the highlight stays fixed.
- [ ] Every ball has a contact shadow and a lamp shadow that stretches away from the lamp.
- [ ] Pocketed balls slide into the hole, darken and then roll into the return tray with a clack.
- [ ] Hard hits make specks and a flash; hard cushion hits puff dust; the break shakes the camera briefly.
- [ ] The lamp sways gently and its light pool moves with it.
- [ ] Each monster breathes, blinks, tilts and does its idle quirk, and reacts to every shot outcome within 0.3 s.
- [ ] The monster's pre-shot routine: considers angles, chalks, practice strokes, shoots; skippable with a click.
- [ ] Your hero holds your equipped cue and leans in on your turn.
- [ ] Turn, foul, scratch, group, score and rack changes each have their own short animation (transform/opacity).
- [ ] The deciding 8: slow motion, zoom on the pocket, letterbox, hush, cheer.
- [ ] Re-rack animation between racks; VS intro at the start; results with the coin fountain.
- [ ] Reduced motion (`ccReduce()` / `prefers-reduced-motion`): no shakes, no zoom, no slow-mo; fades only.
- [ ] Nothing waits on an animation: clicks skip intros, routines, re-racks and results count-ups.
- [ ] Frame budget met (§9.1) during the break on headless Chromium and with CDP CPU throttling ×4 (lite mode kicks in).
- [ ] Looks right at 1600×900 and at 1280×720 (touch layout), compared side by side with `pool_plan/*.png`.

---

## 18. Risks and how to avoid them

| Risk | Avoid it by |
|---|---|
| Physics feels floaty or balls tunnel | Keep the prototype's adaptive substeps and the ≤ 4 px rule; never raise `MAXV` without re-running `ptest.js` |
| AI freezes the page | Generator + 5 ms slices; cap the routine; no full rack simulations in one frame |
| Ball repaint too slow on Chromebooks | Repaint only moving balls; lite mode drops to 36 px (0.33 ms for 16) |
| `S.t` clock jumps or stalls | Own `performance.now()` clock with a 0.1 s catch-up cap |
| Name collisions in the global script | `pz` prefix everywhere; no short top-level names |
| Wildcard hooks firing | Never use the `wcx` class; check `pzx` in every wrapper |
| Farming easy tables | Taper (§12.2), stake ranges, daily cap |
| Refresh to dodge a loss | `P.pz.live` resume/forfeit |
| Font not loaded for ball numbers | Check `document.fonts`, rebuild the glyph masks once when it loads |
| Scope creep | Trick Shots (M10) and Shade (part of M7) can ship in a follow-up if time runs out; the core (M0–M9, M11–M12) cannot |

---

## 19. Delivery (CLAUDE.md, every time)

1. `bash tools/bld.sh` prints `CMP OK` and `SYNTAX_OK`.
2. Copy `type-warriors-source/out.html` to `type-warriors.html` and `type-warriors-act6-TEST.html` (identical).
3. Rebuild `type-warriors-source.zip` (exclude `out.html`, `out.js`, `out_ast.*`, `before.html`, `shots/`, `__pycache__/`).
4. HANDOFF.md section for 9.4; CLAUDE.md: latest update line, the `t_pool.py` line under Verifying, regress count.
5. Commit, push, send the game file and screenshots, and give a short, honest summary (what failed or was skipped).
6. **No Updates-tab notice** unless the owner asks for one and okays it.

---

## Appendix A — Lines (speech bubbles; `PZ_REG[id].lines`)

Each regular: `hi` (match start), `pot` (its good shot), `miss` (its miss), `you` (your good shot), `foul` (your foul), `win`, `lose`,
`taunted` (after your taunt lands), and `taunt` (what **you** type at it).

**Gloop** — hi: "Ooh, a new friend! I hit 'em HARD." · "Rack 'em! Blub!" | pot: "SPLAT! In it goes!" · "Did you see that?!" |
miss: "Whoops, too much juice." · "Aw, blub." | you: "Wow, you're sticky-good!" | foul: "Hee! Your turn's mine now!" |
win: "Best. Night. Ever!" | lose: "You beat me fair and square... wanna play again?" | taunted: "M-my wobble!" |
taunt (you type): "stay solid, jelly" · "all wobble no aim" · "you leak" · "drip drip"

**Granny Moldwick** — hi: "Patience, dearie. The pockets aren't going anywhere." | pot: "Slow and steady." · "Mm-hm." |
miss: "My eyes aren't what they were." | you: "Oh, lovely stroke, dear." | foul: "Tsk. Rushing again." |
win: "Spore and done." | lose: "You remind me of my late husband. He was also good." | taunted: "Well I NEVER." |
taunt: "mold is old" · "time to retire" · "hurry up granny" · "spore loser"

**Grizzle** — hi: "ONE EYE. ONE SHOT. ONE BIG BREAK." | pot: "SMASH!" · "HA! Eye see you." | miss: "...the table moved." |
you: "Hrrm. Lucky." | foul: "HA HA! Bad shot, tiny." | win: "GRIZZLE WINS!" | lose: "Grr... rematch. NOW." |
taunted: "WHO SAID THAT." | taunt: "eye spy a miss" · "blink and miss" · "all brawn" · "keep an eye out"

**Vesper Nightwing** — hi: "Oh, a guest. How delicious." | pot: "Darling, please." · "Effortless." |
miss: "The light was in my eyes." | you: "Mm. Not bad... for a mortal." | foul: "How dreadful for you." |
win: "Do come back. I'll be hungry." | lose: "...beginner's luck." | taunted: "Hmph!" |
taunt: "nice try, fang face" · "batty shot" · "sucks to be you" · "go hang upside down"

**Cap'n Barnacle** — hi: "Off the rail, into the hold! Har!" | pot: "Bank it, me hearties!" · "Har har!" |
miss: "Blasted tide." | you: "Shiver me shells, fine shot!" | foul: "Walk the plank, landlubber!" | win: "The treasure be mine!" |
lose: "Ye've sunk me ship." | taunted: "Me claws be shakin'!" | taunt: "crabby aim" · "shell shocked" · "sideways again" · "abandon ship"

**Professor Hootsworth** — hi: "Elementary geometry, my young friend." | pot: "Precisely as calculated." |
miss: "A rounding error." | you: "Hoo! Most commendable." | foul: "A fundamental misunderstanding." |
win: "Class dismissed." | lose: "I shall revise my notes." | taunted: "That is... most irregular." |
taunt: "who gives a hoot" · "check your math" · "owl be winning" · "pop quiz, prof"

**Mortimer Bonechalk** — hi: "I have played this game for four hundred years." | pot: "Inevitable." · "As it was foretold." |
miss: "...interesting. You will not see that twice." | you: "Ah. A spark of talent." | foul: "Death and fouls are certain." |
win: "Another soul for the ledger." | lose: "Impossible... I demand a rematch in a century." | taunted: "You DARE?" |
taunt: "bone dry aim" · "rattle your bones" · "skull and bones" · "dead on arrival"

**Slick Shade** — hi: "Friendly game? Small stakes... for now." | pot: "Funny how that works." |
miss: "Oh, would you look at that." | you: "Well, well. You've got hands." | foul: "That's gonna cost ya." |
offer: "Let it ride? Race to three. Pays better." | win: "Pleasure doing business." | lose: "...you're good. I'll be back." |
taunted: "Easy, pal." | taunt: "shady business" · "lights on, shade" · "not so slick" · "fade away"

## Appendix B — Trick Shots (M10)

Ten layouts in `PZ_TRICK` (`[{n,balls:[[id,x,y]...],cue:[x,y],goal:{pot:[ids],any:true|false,bank:true?},hint}]`):
1 Straight in · 2 The cut · 3 Draw back for the next · 4 Follow through · 5 One-rail bank · 6 Kick around the blocker ·
7 Combination (2 into the corner) · 8 Carom off the 8 · 9 Three-ball pot with one stroke · 10 The Bonechalk: bank the 8 two rails.
Stars: first try ★★★, ≤ 3 tries ★★, otherwise ★. Each layout must have a Node check that simulates its intended shot and pots.
