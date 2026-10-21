# python3 menus.py : screenshots of the hub, the workshop, the route log, how to play, the result card, the home card and the mode sheet
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-route'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate
    await E("()=>{RS_ASK=false;P.gold=4000;P.pet='bramble';delete P.wr;save();title()}");await pg.wait_for_timeout(900);await pg.screenshot(path=OUT+'/m1_home.png')
    print('home',await E("()=>{const c=document.getElementById('dkwagon');return [!!c,c&&c.textContent.trim().slice(0,60),!!document.getElementById('go'),!!document.getElementById('dkev')]}"))
    await E("()=>modeSheet()");await pg.wait_for_timeout(600);await pg.screenshot(path=OUT+'/m2_modesheet.png')
    print('sheet',await E("()=>{const c=document.getElementById('dmwr');return [!!c,c&&c.textContent.trim().slice(0,40)]}"))
    await E("()=>dkClose(true)");await pg.wait_for_timeout(300);await pg.keyboard.press('w');await pg.wait_for_timeout(900);await pg.screenshot(path=OUT+'/m3_hub.png')
    print('hub',await E("()=>[S.view,!!document.getElementById('wrhub'),document.querySelectorAll('.wrrt').length,getComputedStyle(document.getElementById('cn')).display,WRP().seen85]"))
    await E("()=>wrWorkshop()");await pg.wait_for_timeout(700);await pg.screenshot(path=OUT+'/m4_workshop.png')
    print('workshop',await E("()=>[document.querySelectorAll('.wrchip').length,document.querySelectorAll('.wrchip.lock').length]"))
    await E("()=>{wrModal(null);WRP().med.mill=3;WRP().med.pines=2;wrUnlockSweep();wrRouteLog()}");await pg.wait_for_timeout(600);await pg.screenshot(path=OUT+'/m5_log.png')
    await E("()=>{wrModal(null);wrHowTo()}");await pg.wait_for_timeout(700);await pg.screenshot(path=OUT+'/m6_howto.png')
    await E("()=>{wrModal(null);wagonMenu(title)}");await pg.wait_for_timeout(500)
    print('cards after medals',await E("()=>[...document.querySelectorAll('.wrrt')].map(b=>[b.dataset.id,b.classList.contains('lock'),b.querySelector('em').textContent])"))
    await pg.keyboard.press('ArrowDown');await pg.wait_for_timeout(200);print('select',await E("()=>[wrSel,document.getElementById('wrgot').textContent]"))
    await pg.keyboard.press(' ');await pg.wait_for_timeout(800);await pg.screenshot(path=OUT+'/m7_intro.png');print('intro',await E("()=>[!!document.querySelector('.wrhow'),S.mode]"))
    await E("()=>document.getElementById('wrhowgo').click()");await pg.wait_for_timeout(500);print('started',await E("()=>[S.mode,WRX&&WRX.rt.id,WRP().intro]"))
    await E("()=>{WRX.int=4;WRX.ok=100;WRX.chars=104;WRX.kills=7;WRX.repairs=2;WRX.coins=38;WRX.time=61;WRX.maxCombo=31;WRX.x=WRX.rt.len;for(let i=0;i<400;i++)wrUpdate(1/60)}");await pg.wait_for_timeout(1800);await pg.screenshot(path=OUT+'/m8_result.png')
    print('result',await E("()=>[S.mode,WRX&&WRX.result&&[WRX.result.won,WRX.result.med,WRX.result.total,WRX.result.unl,WRX.result.ttl],P.wr.med,BTY().own['t:caravanmaster']]"))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(600);print('home after',await E("()=>[S.mode,!!document.getElementById('dkwagon'),!!WRX,S.wr]"))
    print('err',er[:8]);await b.close()
asyncio.run(main())
