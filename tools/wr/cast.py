# python3 cast.py : the conductor's lash, speech, the hero behind the wagon and the pet, in a run (screenshots/wagon-cast/)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-cast'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate;shot=lambda n:pg.screenshot(path=OUT+'/'+n+'.png')
    step=lambda n:E("n=>{const u=window.__wu||wrUpdate;for(let i=0;i<n;i++)u(1/60)}",n)
    await E("()=>{RS_ASK=false;P.pet='bramble';WRP().intro=1;wrStart('mill');WRX.spawnT=99;WRX.hazT=99}")
    await step(260);await pg.wait_for_timeout(1200);await shot('c1_run');await E("()=>{window.__wu=wrUpdate;window.wrUpdate=function(){}}")
    await E("()=>{WRX.mobs=[];const a=wrSpawn('skel',0);a.x=1130;a.w='lantern';a.i=0;const b2=wrSpawn('gob',0);b2.x=1330;b2.w='oak';b2.i=0}");await step(20)
    for c in 'lanter':await pg.keyboard.press(c)
    await pg.keyboard.press('n');await step(7);await pg.wait_for_timeout(30);await shot('c2_lash_strike')
    await step(6);await pg.wait_for_timeout(30);await shot('c3_lash_hold')
    await step(25);await pg.wait_for_timeout(30);await shot('c4_after')
    await E("()=>{WRX.mobs=[];WRX.hazT=0;__wu(1/60)}");await step(25);await pg.wait_for_timeout(60);await shot('c5_jam_toot')
    print('hero x range',await E("()=>{const o=[];WRX.haz=null;WRX.hazT=99;for(let i=0;i<300;i++){__wu(1/60);if(i%30===0)o.push([+WRX.hs.x.toFixed(1),+WRX.hs.g.toFixed(0),+WRX.hs.wb.toFixed(2),+WRX.ps.x.toFixed(0),WRX.ps.walk])}return JSON.stringify(o)}"))
    print('err',er[:6]);await b.close()
asyncio.run(main())
