import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};delete P.rr;save();title()}");await pg.wait_for_timeout(400)
    await pg.evaluate("()=>dcMenu(title)");await pg.wait_for_timeout(1500);await pg.screenshot(path='j0.png')
    for h in (.45,.8,1):
      await pg.evaluate(f"()=>{{RR.heat={h};const w=$('rrarchw');w.style.setProperty('--heat',{h});w.classList.toggle('hot',{h}>=.6);w.classList.toggle('blaze',{h}>=.85);$('rr').style.setProperty('--rheat',{h})}}")
      await pg.wait_for_timeout(1400);await pg.screenshot(path=f'j{int(h*100)}.png')
    print(er);await b.close()
asyncio.run(main())
