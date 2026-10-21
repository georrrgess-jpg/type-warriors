import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};title();dcMenu(title)}");await pg.wait_for_timeout(600)
    await pg.evaluate("()=>document.getElementById('rrcalb').click()");await pg.wait_for_timeout(400)
    print(await pg.evaluate("()=>[document.getElementById('rrcalm').hidden,document.activeElement.id,S.view]"))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
    print(await pg.evaluate("()=>[document.getElementById('rrcalm')&&document.getElementById('rrcalm').hidden,document.activeElement.id,S.view,!!document.getElementById('rr')]"))
    print(er);await b.close()
asyncio.run(main())
