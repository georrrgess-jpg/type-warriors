"""python3 tools/pz/tours.py OUTDIR : walks the first-visit tours (hub, trick shots, cue rack) with screenshots."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]))
    await pg.goto(H);await pg.wait_for_timeout(1500);E=pg.evaluate
    await E("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=3000;P.pz=null;save();PZ.sel=null;0;}")
    async def walk(tag,n):
      for i in range(40):
        await pg.wait_for_timeout(150)
        if await E("()=>!!document.querySelector('.pztuc.in')"):break
      await pg.wait_for_timeout(450)
      for k in range(n):
        t=await E("()=>{const e=document.querySelector('.pztut');return e?e.textContent:null}")
        await pg.screenshot(path=f'{out}/{tag}_{k+1}.png');print(tag,k+1,t)
        if not t:break
        await pg.click('.pztun');await pg.wait_for_timeout(520)
    await E("()=>{pzHub();0;}");await walk('hub',7)
    print('tut',await E("()=>JSON.stringify(PZS().tut)"),'on',await E("()=>PZ.on"))
    await E("()=>{pzTrick();0;}");await walk('trick',2)
    await E("()=>{pzCueRack();0;}");await walk('rack',3)
    print('tut',await E("()=>JSON.stringify(PZS().tut)"))
    print('errors',er)
    await b.close()
asyncio.run(main())
