import asyncio,sys,os
from playwright.async_api import async_playwright
async def run(H):
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900})
    await pg.goto('file://'+os.path.realpath(H));await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;P.gold=100000;delete P.fish;save();title();PFW.asked=true}");await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{fsPond()}");await pg.wait_for_timeout(1500)
    r=await pg.evaluate("()=>new Promise(res=>{const t=[];let l=performance.now();const f=n=>{t.push(n-l);l=n;if(t.length<150)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);res([Math.round(t.reduce((a,b)=>a+b)/t.length*10)/10,Math.round(t[Math.floor(t.length*.95)])])}};requestAnimationFrame(f)})")
    await b.close();return r
async def main():
  for k in range(2):
    for H in sys.argv[1:]:print(H.split('/')[-2],await run(H))
asyncio.run(main())
