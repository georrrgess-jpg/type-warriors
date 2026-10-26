"""python3 tools/pz/tut.py OUTDIR : walks the first-time tutorials (first match lessons) with screenshots and checks."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]))
    await pg.goto(H);await pg.wait_for_timeout(1500)
    E=pg.evaluate
    await E("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=5000;P.pz=null;save();0;}")
    await E("()=>{const Z=PZS();Z.tut.hub=1;save();pzStart({opp:'gloop',stake:100,seed:3});0;}");await pg.wait_for_timeout(500)
    await E("()=>{const i=document.getElementById('pzintro');if(i)i.click();0;}")
    for i in range(30):
      await pg.wait_for_timeout(200)
      if await E("()=>!!document.querySelector('.pztu')"):break
    await pg.wait_for_timeout(500)
    for k in range(3):
      await pg.screenshot(path=f'{out}/m1_{k+1}.png');print('step',k+1,await E("()=>document.querySelector('.pztut')&&document.querySelector('.pztut').textContent"))
      await pg.click('.pztun');await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{out}/m1_4.png');print('step 4',await E("()=>document.querySelector('.pztut')&&document.querySelector('.pztut').textContent"),'clock',await E("()=>PZ.clock"))
    # a real break with the mouse: press on the table, pull back, release
    await pg.mouse.move(700,434);await pg.mouse.down();await pg.mouse.move(560,434,steps=8);await pg.mouse.move(420,434,steps=8);await pg.mouse.up()
    for i in range(80):
      await pg.wait_for_timeout(250)
      if await E("()=>!!document.querySelector('.pztu')&&PZS().tut.m1&&!!PZS().tut"):break
    print('after shot: m1',await E("()=>PZS().tut.m1"),'turn',await E("()=>PZ.st.turn"),'ph',await E("()=>PZ.ph"))
    for i in range(60):
      await pg.wait_for_timeout(250)
      t=await E("()=>document.querySelector('.pztut')?document.querySelector('.pztut').textContent:''")
      if t:break
    await pg.screenshot(path=f'{out}/m2_next.png');print('next lesson:',t,await E("()=>JSON.stringify(PZS().tut)"))
    print('errors',er)
    await b.close()
asyncio.run(main())
