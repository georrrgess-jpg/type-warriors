from h import *
KB="()=>[S.mode,S.view,kb.classList.contains('on'),getComputedStyle(kb).display,inp.getAttribute('inputmode'),!!$('wrkb'),!!$('rrkb'),[...document.querySelectorAll('#ov button[data-c],#ov button[data-k]')].filter(b=>b.offsetParent).length]"
async def main():
  async with async_playwright() as p:
    g=await openp(p,vw=900,vh=600,touch=True,mobile=False);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;ST.touch='on';try{saveST()}catch(e){};P.gold=5000;P.pet='bramble';WRP().intro=1;fsP().tut=1;save();applyLayout();title()}");await pg.wait_for_timeout(600)
    pr('TM',await E("()=>[TM(),matchMedia('(pointer:coarse)').matches]"))
    await E("()=>start(1)");await pg.wait_for_timeout(700);pr('campaign',await E(KB))
    await pg.screenshot(path=SP+'/shots/touch_campaign.png')
    await E("()=>title()");await pg.wait_for_timeout(400)
    await E("()=>fsPond()");await pg.wait_for_timeout(800)
    await E("()=>{if(FS.tut)fsTutClose()}");await pg.wait_for_timeout(200)
    await E("()=>fsCast()")
    for i in range(150):
        if await E("()=>FS.st==='reel'"): break
        await pg.wait_for_timeout(100)
    pr('fishing reel',await E(KB),await E("()=>[FS.st,FS.word]"))
    await pg.screenshot(path=SP+'/shots/touch_fish_reel.png')
    # tap the canvas as a touch player would during reel
    await pg.touchscreen.tap(450,300);await pg.wait_for_timeout(200)
    pr('after tap',await E("()=>[document.activeElement&&document.activeElement.id,inp.getAttribute('inputmode'),FS.st]"))
    await E("()=>{fsStop();title()}");await pg.wait_for_timeout(400)
    await E("()=>rrMenu(title)");await pg.wait_for_timeout(800);pr('riddle',await E(KB))
    await E("()=>{RR=null;title()}");await pg.wait_for_timeout(400)
    await E("()=>{wagonMenu(title)}");await pg.wait_for_timeout(600);await E("()=>$('wrgo').click()");await pg.wait_for_timeout(700);pr('caravan',await E(KB))
    await pg.screenshot(path=SP+'/shots/touch_wagon.png')
    await E("()=>title()");await pg.wait_for_timeout(400);pr('after title',await E(KB),await E("()=>[ov.className,wrap.style.top,wrap.style.transform]"))
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
