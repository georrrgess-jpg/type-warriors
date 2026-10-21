# python3 ovl.py : text-overlap and clipping sweep of the caravan screens at 7 viewports (run from tools/wr)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html');JS=open('overlap.js').read()
VP=[(1920,1080),(1600,900),(1366,768),(1280,720),(1024,768),(820,1180),(390,844)]
STATES={
 'hub':("wagonMenu(title);await sl(500);","document.getElementById('wrhub')"),
 'workshop':("wagonMenu(title);await sl(300);wrWorkshop();await sl(500);","document.querySelector('.wrws')"),
 'log':("wagonMenu(title);await sl(300);WRP().med.mill=3;WRP().med.pines=1;wrRouteLog();await sl(500);","document.querySelector('.wrlog')"),
 'howto':("wagonMenu(title);await sl(300);wrHowTo();await sl(500);","document.querySelector('.wrhow')"),
 'pause':("wrStart('mill');for(let i=0;i<200;i++)wrUpdate(1/60);wrPause(true);await sl(500);","document.querySelector('.wrpause')"),
 'result':("wrStart('pines');WRX.int=3;WRX.ok=90;WRX.chars=100;WRX.kills=9;WRX.repairs=2;WRX.coins=40;WRX.time=75;WRX.x=WRX.rt.len;for(let i=0;i<400;i++)wrUpdate(1/60);await sl(1500);","document.querySelector('.wrres')"),
 'home':("title();await sl(500);","document.getElementById('dkwagon')"),
}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();tot=0
    for vw,vh in VP:
      for k,(js,root) in STATES.items():
        pg=await b.new_page(viewport={'width':vw,'height':vh});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
        await pg.goto('file://'+H);await pg.wait_for_timeout(1100)
        await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=4200;P.pet='bramble';delete P.wr;WRP().intro=1;title()}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{"+JS+"}")
        await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));"+js+"}")
        await pg.wait_for_timeout(300)
        r=await pg.evaluate("()=>{const R="+root+";return R?__ovl(R):['NO ROOT']}")
        await pg.screenshot(path=f'ov_{vw}x{vh}_{k}.png')
        if r or er:print(f'{vw}x{vh} {k}:',r[:10],er[:2])
        tot+=len(r);await pg.close()
    print('TOTAL',tot);await b.close()
asyncio.run(main())
