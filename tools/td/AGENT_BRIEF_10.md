# Brief for the 10.0 art agents (Three Worlds update)

You are one of six agents building parts of the Runestone Tower Defense 10.0 update in parallel. Read these first:
- `/home/user/type-warriors/CLAUDE.md` - project rules (art style, performance rules, owner rules). They are binding.
- `/home/user/type-warriors/TD_WORLDS_PLAN.md` - the spec for the whole update. Your part is described there and in your prompt.
- `type-warriors-source/98a_rp_worlds_data.js` in your workspace - the new maps, monsters, stats and the art registries / hooks.

## Your workspace
- Work ONLY in your workspace: `/tmp/tw_ws/<NAME>/work` (a copy of `type-warriors-source/` and `tools/`). Do not edit anything under
  `/home/user/type-warriors` except saving screenshots to `/home/user/type-warriors/type-warriors-source/shots/w10_<NAME>/`.
  Never run git commit or push. Never edit existing modules: add new module files (and a test script) only. If you need a hook
  that does not exist, add it in your own module by wrapping the function (`{const f0=fn;fn=function(){...;return f0.apply(this,arguments)}}`).
- Register each new module once: `cd /tmp/tw_ws/<NAME>/work && bash tools/addmod.sh <your_module.js> 98a_rp_worlds_data.js`
  (for a second module, register it after your first). Build: `bash tools/bld.sh` must print `CMP OK` and `SYNTAX_OK`; the game is
  `work/type-warriors-source/out.html`.
- Test with Playwright in Python (Chromium is preinstalled: `from playwright.async_api import async_playwright`, `p.chromium.launch()`).
  A battle can be started straight away:
  ```
  await pg.goto('file:///tmp/tw_ws/<NAME>/work/type-warriors-source/out.html'); await pg.wait_for_timeout(1500)
  await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.new99j=1;r.dragon=1;r.stars={moss:3,frost:3,ember:3};for(const k in r.tut)r.tut[k]=1;save()}")
  await pg.evaluate("()=>{rpStart('coral');RPX.tut=null}")   # any map id; rpLeave() ends it
  ```
  Useful: `rpSpawn(id,pathIndex)` spawns a monster on the running map; `rpStep(RPX,1/30)` advances the simulation; `rpDraw()` draws a
  frame; `RPX` is the battle state; `rpBuild(pad,type)` then `pad.tw.build=1` places a finished tower; `rpUpgrade(tw)`.
- Look at your screenshots with the Read tool and compare them with World 1's art (Mossgate Hollow, Frostfang Pass, Ember Crown, the
  Wonderland, their monsters and towers). Iterate until the quality clearly matches or beats it. Quality is the main goal.

## Rules for the code
- Same style as the modules around it: compact, a header comment that explains the module, short comments where they help.
- Prefix every global you add with your prefix (given in your prompt) so the six agents never collide.
- Performance: bake static art once into canvases; per-frame drawing stays small (< ~1 ms for your layer on a full battle);
  no `shadowBlur`, no `ctx.filter`, no `screen` / `soft-light` blends (`lighter` for glows is fine, as in World 1). Respect
  `R.lite` / `RPFX.lite` and reduced motion (`R.rm`) by drawing less.
- Do not change gameplay outside your part. The core module (98b, written in parallel by the lead) owns unlocks, waves, the hub,
  monster abilities and twist rules; it sets the state fields listed in the plan (section 6). For your tests, set those fields by hand.

## Your final report (the lead integrates your work from it)
Under ~400 words: the files you created (module names and the register order), the globals / registry entries you provide, anything
the core must call or know, how you tested (test script name, checks), screenshot paths, frame cost numbers, and known gaps.
