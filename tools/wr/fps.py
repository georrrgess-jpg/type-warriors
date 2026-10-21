# python3 fps.py : rAF frame times (mean, p95, max ms) for the campaign fight, the caravan idle, and the caravan busy (4 monsters + a hazard)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--disable-gpu-vsync','--disable-frame-rate-limit']);pg=await b.new_page(viewport={'width':1600,'height':900})
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate
    M="""const M=()=>new Promise(res=>{const a=[];let l=performance.now(),n=0;const f=t=>{a.push(t-l);l=t;if(++n<180)requestAnimationFrame(f);else{a.sort((x,y)=>x-y);res([Math.round(a.reduce((p,q)=>p+q,0)/a.length*10)/10,Math.round(a[Math.floor(a.length*.95)]*10)/10,Math.round(a[a.length-1]*10)/10])}};requestAnimationFrame(f)});"""
    r=await E("async()=>{RS_ASK=false;P.pet='bramble';"+M+"start(1);await new Promise(r=>setTimeout(r,800));const fight=await M();wrStart('mill');await new Promise(r=>setTimeout(r,800));const idle=await M();WRX.mobs=[];for(const id of['gob','skel','bat','gob'])wrSpawn(id,0);WRX.mobs.forEach((e,i)=>{e.x=1000+i*150});WRX.hazT=0;WRX.spawnT=99;const busy=await M();return {fight,idle,busy}}")
    print(r);await b.close()
asyncio.run(main())
