import asyncio,sys,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=4200;title()}");await pg.wait_for_timeout(400)
    await pg.evaluate("()=>modeSheet()");await pg.wait_for_timeout(600);await pg.screenshot(path='p0_modes.png')
    await pg.evaluate("()=>{dcMenu(title)}");await pg.wait_for_timeout(500)
    await pg.click('.rrtabs [data-m=p]');await pg.wait_for_timeout(500)
    await pg.click('[data-pw=s]');await pg.wait_for_timeout(700);await pg.screenshot(path='p1_shat.png')
    w=await pg.evaluate("()=>rrCur().w")
    ws=[x for x in ['crane','pilot','mound','fudge','sweet','vivid','light','brown'] if x!=w][:6]
    for g in ws:
      for c in g:await pg.keyboard.press(c);await pg.wait_for_timeout(20)
      await pg.keyboard.press('Enter');await pg.wait_for_timeout(1750)
    await pg.wait_for_timeout(300);await pg.screenshot(path='p2_lose.png')
    await pg.wait_for_timeout(1200);await pg.screenshot(path='p3_res.png')
    r=await pg.evaluate("()=>[JSON.stringify(P.rr.pr),P.gold]")
    await pg.click('#rragain');await pg.wait_for_timeout(700);await pg.screenshot(path='p4_new.png')
    for c in 'zzzzz':await pg.keyboard.press(c)
    await pg.keyboard.press('Enter');await pg.wait_for_timeout(300);await pg.screenshot(path='p5_bad.png')
    print(w,r,er);await b.close()
asyncio.run(main())
