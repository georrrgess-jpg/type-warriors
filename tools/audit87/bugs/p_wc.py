from h import *
import time
AG='/home/user/type-warriors/type-warriors-source/t_wc_agent.js'
Q="()=>[ov.className,!!$('wct'),!!$('wcr'),WX.G&&WX.G.phase,WX.G&&WX.G.turns,P.gold,wcSt().g,wcSt().net,cst().net,CAS.on]"
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=5000;P.ccUsed={};delete P.wc;save();title();casinoOpen()}");await pg.wait_for_timeout(600)
    await pg.add_script_tag(path=AG)
    await E("()=>{wcHome();wcStartSolo('c250')}");await pg.wait_for_timeout(5000)
    pr('playing',await E(Q))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(200)
    a=await E(Q);await pg.wait_for_timeout(4000);b=await E(Q)
    pr('menu open',a,'\n  4s later',b,await E("()=>[!$('wcmod').hidden,$('wcmod').className]"))
    await E("()=>$('wcquit').click()");await pg.wait_for_timeout(600)
    pr('forfeit',await E(Q))
    await E("()=>wcStartSolo('c250')");await pg.wait_for_timeout(300)
    t0=time.time()
    while time.time()-t0<300:
        await pg.wait_for_timeout(500)
        if await E("()=>!!document.getElementById('wcr')"):break
    pr('finished',await E(Q),await E("()=>{const R=wcRank(WX.G);return R.indexOf(WX.me)}"),await E("()=>window.__ag&&__ag.errs"))
    await pg.wait_for_timeout(1500)
    s0=await E(Q)
    btns=await E("()=>[...document.querySelectorAll('#ov button')].filter(b=>b.offsetParent).map(b=>b.id+':'+b.textContent.trim().slice(0,20))");pr('btns',btns)
    await pg.keyboard.press('Enter');await pg.keyboard.press('Enter');await pg.wait_for_timeout(800)
    pr('double enter',await E(Q),'was',s0)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(600);pr('esc1',await E(Q))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(600);pr('esc2',await E(Q))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(600);pr('esc3',await E(Q),await E("()=>[S.mode,S.view,wcMusic()]"))
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
