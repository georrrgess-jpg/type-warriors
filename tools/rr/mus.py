import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);await pg.mouse.click(5,5)
    E=lambda j:pg.evaluate(j)
    await E("()=>{try{RS_ASK=false}catch(e){};ST.mute=false;title()}");await pg.wait_for_timeout(600);await pg.click("#dcb");await pg.wait_for_timeout(1500)
    a0=await E("()=>[rraStats().players,typeof ac!='undefined'&&ac?ac.state:'none']");await pg.keyboard.press('a');await pg.wait_for_timeout(1500);a=[a0,await E("()=>[rraStats().players,rraStats().live]")]
    await E("()=>document.getElementById('rrmu').click()");await pg.wait_for_timeout(1500);m=await E("()=>[ST.mute,rraStats().players]")
    await E("()=>document.getElementById('rrmu').click()");await pg.wait_for_timeout(1500);u=await E("()=>[ST.mute,rraStats().players]")
    for c in 'crane':await pg.keyboard.press(c)
    await pg.keyboard.press('Enter');await pg.wait_for_timeout(2500)
    await E("()=>title()");await pg.wait_for_timeout(5500);t=await E("()=>[rraStats().players,rraStats().live]")
    print('open',a,'muted',m,'unmuted',u,'left',t,er);await b.close()
asyncio.run(main())
