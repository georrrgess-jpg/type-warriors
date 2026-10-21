# python3 wagon.py PREFIX : close-ups of the wagon (each paint, jammed, broken) and the hub, into screenshots/wagon-detail/
import asyncio,os,sys
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-detail'));P=sys.argv[1] if len(sys.argv)>1 else 'w'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900},device_scale_factor=1);er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate
    clip={'x':330,'y':380,'width':1000,'height':420}
    for paint,lan,ban in [('oak','brass','lanterncaravan'),('cherry','moonglass','wolfpine'),('indigo','emberheart','gallowsgold'),('gilt','wisp','royal')]:
      await E("a=>{RS_ASK=false;P.pet='bramble';const w=WRP();for(const f of['lan','ban','paint'])for(const k of WR_COSK[f])w.own[f+':'+k]=1;w.paint=a[0];w.lan=a[1];w.ban=a[2];wrLeave();wrStart('mill');WRX.spawnT=99;WRX.hazT=99;for(let i=0;i<240;i++)wrUpdate(1/60)}",[paint,lan,ban])
      await pg.wait_for_timeout(120);await pg.screenshot(path=f'{OUT}/{P}_{paint}.png',clip=clip)
    await E("()=>{WRX.hazT=0;wrUpdate(1/60);for(let i=0;i<20;i++)wrUpdate(1/60)}");await pg.wait_for_timeout(80);await pg.screenshot(path=f'{OUT}/{P}_jam.png',clip=clip)
    await E("()=>{WRX.haz=null;WRX.int=1;WRX.mobs=[];const e=wrSpawn('gob',0);e.x=e.sx;e.st='attack';e.at=0;e.hit=0;for(let i=0;i<110;i++)wrUpdate(1/60);WRX.mobs=[]}");await pg.wait_for_timeout(80);await pg.screenshot(path=f'{OUT}/{P}_broken.png',clip=clip)
    await E("()=>{wrLeave();WRP().paint='oak';WRP().lan='brass';WRP().ban='none';wagonMenu(title)}");await pg.wait_for_timeout(900);await pg.screenshot(path=f'{OUT}/{P}_hub.png')
    await E("()=>wrWorkshop()");await pg.wait_for_timeout(700);await pg.screenshot(path=f'{OUT}/{P}_workshop.png')
    print('err',er[:6]);await b.close()
asyncio.run(main())
