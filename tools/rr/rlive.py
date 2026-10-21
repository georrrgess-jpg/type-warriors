import asyncio,sys,os
from playwright.async_api import async_playwright
I="()=>{window.__T={};LIVE.forEach((x,i)=>{const f=x.fn,k=(x.cv.id||x.cv.parentNode.className||'c')+i;__T[k]=[0,0];x.fn=function(){const a=performance.now();const r=f.apply(this,arguments);__T[k][0]+=performance.now()-a;__T[k][1]++;return r}})}"
async def run(H,hot):
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900})
    await pg.goto('file://'+os.path.realpath(H));await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};delete P.rr;save();title()}");await pg.wait_for_timeout(400)
    await pg.evaluate("()=>dcMenu(title)");await pg.wait_for_timeout(1200)
    if hot:await pg.evaluate("()=>{RR.heat=1;rrHeatSet&&0}")
    await pg.evaluate(I);await pg.wait_for_timeout(4000)
    r=await pg.evaluate("()=>Object.entries(__T).map(([k,v])=>k+':'+(v[1]?(v[0]/v[1]).toFixed(2):'-')+'ms x'+v[1]).join('  ')")
    await b.close();return r
async def main():
  for H in sys.argv[1:]:
    for hot in (0,1):print('old' if 'home' in H else 'new','hot' if hot else 'idle',await run(H,hot))
asyncio.run(main())
