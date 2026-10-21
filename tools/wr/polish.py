# python3 polish.py : screenshots of the 8.5 polish beats into screenshots/wagon-polish/
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-polish'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate;shot=lambda n:pg.screenshot(path=OUT+'/'+n+'.png')
    step=lambda n:E("n=>{for(let i=0;i<n;i++)wrUpdate(1/60)}",n)
    await E("()=>{RS_ASK=false;P.gold=3000;P.pet='bramble';WRP().intro=1;wrStart('mill');WRX.spawnT=99;WRX.hazT=99}")
    await step(40);await pg.wait_for_timeout(60);await shot('p1_pull_away');print('pitch',await E("()=>[WRX.pitch.toFixed(3),Math.round(WRX.v),WRX.dust.length]"))
    await step(200);await E("()=>{WRX.hazT=0;wrUpdate(1/60);WRX.haz.t=2.2}");await step(20);await pg.wait_for_timeout(80);await shot('p2_jam_low_fuse')
    await E("()=>{WRX.haz=null;WRX.hazT=99;WRX.mobs=[];const a=wrSpawn('skel',0);a.x=1150;a.w='lantern';const b2=wrSpawn('gob',0);b2.x=1380;b2.w='oak'}");await step(30)
    for c in 'lant':await pg.keyboard.press(c)
    await pg.wait_for_timeout(40);await shot('p3_letter_flash')
    for c in 'ern':await pg.keyboard.press(c)
    await pg.wait_for_timeout(20);await shot('p4_kill_hold')
    await pg.wait_for_timeout(300);await shot('p5_kill_squash')
    await E("()=>{WRX.mobs=[];WRX.int=1;const e=wrSpawn('gob',0);e.x=e.sx;e.st='attack';e.at=0;e.hit=0}");await step(30);await step(70);await pg.wait_for_timeout(60);await shot('p6_breakdown_wheel')
    await step(100);await pg.wait_for_timeout(60);await shot('p7_breakdown_landed')
    await E("()=>{wrLeave();wrStart('mill');WRX.spawnT=99;WRX.hazT=99;WRX.int=3;WRX.x=WRX.rt.len-5}");await step(80);await pg.wait_for_timeout(60);await shot('p8_gate_sparks')
    await E("()=>{WRX.flare=60;wrFlare()}");await step(2)
    await step(110);await pg.wait_for_timeout(1700);await shot('p9_result')
    await E("()=>{wrLeave();wagonMenu(title)}");await pg.wait_for_timeout(900);await shot('p10_hub')
    await E("()=>wrWorkshop()");await pg.wait_for_timeout(700);await shot('p11_workshop')
    print('err',er[:6]);await b.close()
asyncio.run(main())
