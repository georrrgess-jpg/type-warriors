# python3 ab.py A.html B.html : rAF frame time in the caravan with and without the wagon drawn, for two builds
import asyncio,os,sys
from playwright.async_api import async_playwright
JS="""async()=>{RS_ASK=false;P.pet='bramble';const M=()=>new Promise(res=>{const a=[];let l=performance.now(),n=0;const f=t=>{a.push(t-l);l=t;if(++n<150)requestAnimationFrame(f);else res(+(a.reduce((p,q)=>p+q,0)/a.length).toFixed(1))};requestAnimationFrame(f)});
 wrStart('mill');WRX.spawnT=99;WRX.hazT=99;await new Promise(r=>setTimeout(r,600));const w0=wrWagonDraw,o={with:[],without:[]};
 for(let k=0;k<4;k++){o.with.push(await M());window.wrWagonDraw=()=>{};o.without.push(await M());window.wrWagonDraw=w0}const av=a=>+(a.reduce((p,q)=>p+q,0)/a.length).toFixed(1);return [av(o.with),av(o.without),+(av(o.with)-av(o.without)).toFixed(1)]}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--disable-gpu-vsync','--disable-frame-rate-limit'])
    for f in sys.argv[1:]:
      pg=await b.new_page(viewport={'width':1600,'height':900});await pg.goto('file://'+os.path.realpath(f));await pg.wait_for_timeout(1300)
      print(os.path.basename(f),'[with, without, wagon cost] ms',await pg.evaluate(JS));await pg.close()
    await b.close()
asyncio.run(main())
