from h import *
Q="()=>[S.mode,S.view,!!S.wa,S.wa&&S.wa.pause,S.wa&&S.wa.over,S.wa&&S.wa.wave,S.wa&&S.wa.t,ov.className,P.gold,waP().runs,mk(),getComputedStyle(pb).display]"
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=5000;P.petSt=2;P.pets={bramble:{b:0}};P.pet='bramble';petNorm();delete P.wa;save();title()}")
    await E("()=>waStart(0)");await pg.wait_for_timeout(600)
    pr('start',await E(Q))
    await pg.keyboard.press('Enter');await pg.wait_for_timeout(400);pr('guide closed',await E(Q))
    await pg.wait_for_timeout(2000)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
    a=await E(Q);await pg.wait_for_timeout(1000);b=await E(Q);pr('esc pause',a,'\n   1s later',b)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300);pr('esc resume',await E(Q))
    await E("()=>window.dispatchEvent(new Event('blur'))");await pg.wait_for_timeout(200);pr('blur',await E(Q))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
    # let it play unattended until over (hero gets hit); speed by stepping update
    for i in range(60):
        r=await E("()=>{for(let i=0;i<120;i++){if(!S.wa||S.wa.over)break;update(1/30)}return [S.mode,S.wa&&S.wa.over,S.wa&&S.wa.hp]}")
        if r[1]: break
    await pg.wait_for_timeout(2500)
    pr('lost',r,await E(Q),await E("()=>(document.querySelector('#ov h1,#ov h2')||{}).textContent"))
    await pg.screenshot(path=SP+'/shots/arena_over.png')
    btns=await E("()=>[...document.querySelectorAll('#ov button')].filter(b=>b.offsetParent).map(b=>b.id+':'+b.textContent.trim().slice(0,20)+(b.classList.contains('sm')?'(sm)':''))");pr('btns',btns)
    g1=await E("()=>[P.gold,waP().runs]")
    await pg.keyboard.press('Enter');await pg.keyboard.press('Enter');await pg.wait_for_timeout(500)
    pr('double enter',await E(Q),g1)
    await E("()=>title()");await pg.wait_for_timeout(400);pr('title',await E(Q))
    await E("()=>start(1)");await pg.wait_for_timeout(400);pr('camp',await E("()=>[S.mode,!!S.wa,mk(),S.en.length]"))
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
