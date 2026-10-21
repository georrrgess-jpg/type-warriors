import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900})
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=5000;title();dcMenu(title)}");await pg.wait_for_timeout(500)
    await pg.evaluate("()=>rrUse('r')");await pg.wait_for_timeout(700)
    for c in 'crane':await pg.keyboard.press(c)
    await pg.keyboard.press('Enter')
    for i in range(6):
      await pg.wait_for_timeout(230);await pg.screenshot(path=f'f{i}.png',clip={'x':500,'y':150,'width':460,'height':180})
    an=await pg.evaluate("()=>[getComputedStyle(document.querySelector('#rrgrid .rrt')).animationName,getComputedStyle(document.querySelector('#rrgrid .rrrw[data-r=\"1\"] .rrt.gh')||document.body,'::before').content]")
    await pg.evaluate("()=>{rrHostPick=()=>'oct';rrHostStart('open');rrHostMode('cheer',1.6,1)}");await pg.wait_for_timeout(700);await pg.screenshot(path='kc.png',clip={'x':20,'y':80,'width':340,'height':620})
    print(an);await b.close()
asyncio.run(main())
