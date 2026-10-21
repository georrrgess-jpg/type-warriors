import asyncio,sys,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=4200;title()}");await pg.wait_for_timeout(500)
    await pg.screenshot(path='w0_home.png')
    await pg.evaluate("()=>dcMenu(title)");await pg.wait_for_timeout(700)
    await pg.click('[data-pw=r]');await pg.wait_for_timeout(500);await pg.screenshot(path='w1_reveal.png')
    for c in 'crane':await pg.keyboard.press(c);await pg.wait_for_timeout(30)
    await pg.keyboard.press('Enter');await pg.wait_for_timeout(1900)
    w=await pg.evaluate("()=>rrWord(rrKey())")
    for c in w:await pg.keyboard.press(c);await pg.wait_for_timeout(30)
    await pg.keyboard.press('Enter');await pg.wait_for_timeout(520);await pg.screenshot(path='w2_flip.png')
    await pg.wait_for_timeout(1250);await pg.screenshot(path='w3_burst.png')
    await pg.wait_for_timeout(1000);await pg.screenshot(path='w4_res.png')
    await pg.wait_for_timeout(2200);await pg.screenshot(path='w5_res2.png')
    r=await pg.evaluate("()=>[P.gold,JSON.stringify(P.rr.d[rrKey()]),P.rr.st]")
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(400);await pg.screenshot(path='w6_board.png')
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(700);await pg.screenshot(path='w7_home.png')
    print(w,r,er);await b.close()
asyncio.run(main())
