# python3 run.py : drives a Millbrook run headlessly with stepped wrUpdate calls and screenshots the key beats into screenshots/wagon-route/
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-route'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate
    await E("()=>{RS_ASK=false;P.gold=1000;P.pet='bramble';wrStart('mill')}")
    step=lambda n:E("n=>{for(let i=0;i<n;i++)wrUpdate(1/60)}",n)
    await step(400);await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'/s2_monsters.png')
    r=await E("()=>WRX.mobs.map(e=>[e.id,e.w,Math.round(e.x),e.st])");print('mobs',r)
    await E("()=>{WRX.hazT=0;WRX.mobs=[];wrUpdate(1/60)}");await step(30);await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'/s3_hazard.png')
    r=await E("()=>WRX.haz&&[WRX.haz.k,WRX.haz.w]");print('haz',r)
    if r:
      for ch in r[1][:-1]:await pg.keyboard.press(ch);await pg.wait_for_timeout(40)
      await pg.screenshot(path=OUT+'/s4_typing.png');await pg.keyboard.press(r[1][-1]);await pg.wait_for_timeout(250);await pg.screenshot(path=OUT+'/s5_repaired.png')
    print('after repair',await E("()=>[!!WRX.haz,WRX.repairs,WRX.flare,Math.round(WRX.v)]"))
    await step(500);r=await E("()=>WRX.mobs.filter(e=>e.st!=='dead').map(e=>[e.id,e.w,Math.round(e.x),e.st])");print('mobs2',r)
    if r:
      w=r[0][1]
      for ch in w:await pg.keyboard.press(ch);await pg.wait_for_timeout(30)
      await pg.wait_for_timeout(120);await pg.screenshot(path=OUT+'/s6_kill.png');print('kill',await E("()=>[WRX.kills,WRX.combo,WRX.coinFly.length,!!WRX.dash]"))
    await E("()=>{WRX.flare=60}");await pg.keyboard.press('Enter');await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'/s7_flare.png');print('flare',await E("()=>[WRX.flares,WRX.flareOn>0,WRX.mobs.map(e=>e.st)]"))
    await E("()=>{WRX.int=2;WRX.x=WRX.rt.len-30}");await step(120);await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'/s8_gate.png');print('gate',await E("()=>[WRX.st,Math.round(WRX.gx-WRX.x)]"))
    await step(150);await pg.wait_for_timeout(1500);await pg.screenshot(path=OUT+'/s9_result.png');print('result',await E("()=>[S.mode,WRX&&WRX.result&&[WRX.result.won,WRX.result.med,WRX.result.total,WRX.result.xp],P.wr&&P.wr.med]"))
    print('err',er[:8]);await b.close()
asyncio.run(main())
