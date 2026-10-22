from h import *
async def waitst(g,sts,ms=20000):
    for i in range(ms//100):
        s=await g.E("()=>FS.st")
        if s in sts: return s
        await g.pg.wait_for_timeout(100)
    return 'TIMEOUT'
async def reel(g):
    pg=g.pg;E=g.E
    while await E("()=>FS.st") in ('reel','stage'):
        if await E("()=>FS.st")=='stage': await pg.wait_for_timeout(100);continue
        w=await E("()=>FS.word.slice(FS.typed)")
        for c in w: await pg.keyboard.press(c);await pg.wait_for_timeout(15)
        await pg.wait_for_timeout(150)
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=5000;delete P.fish;save();title();PFW.asked=true;fsP().tut=1;fsP().seen=1;save()}")
    await E("()=>{fishing();fsPond()}");await pg.wait_for_timeout(800)
    # force a Legendary bite so the show is long (5.2 s)
    await E("()=>{const r0=fsRoll;window.__r0=r0;fsRoll=function(){let c;for(let i=0;i<20000;i++){c=r0();if(c.rk==='l')break}return c}}")
    await pg.keyboard.press(' ');s=await waitst(g,['reel']);pr('reel',s,await E("()=>[FS.cur.id,FS.cur.rk,FS.words]"))
    c0=await E("()=>[P.gold,fsP().cr.length,JSON.stringify(fsP().log&&fsP().log[FS.cur.id]||fsP().f&&fsP().f[FS.cur.id]||null)]")
    await reel(g);s=await waitst(g,['show','reveal','idle']);pr('state after reel',s)
    pr('show',await E("()=>[FS.show&&FS.show.c.val,FS.show&&FS.show.c.id,P.gold,fsP().cr.length,JSON.stringify(fsP().s||{}).slice(0,300)]"))
    await pg.wait_for_timeout(600)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(800)
    pr('esc during show',await E("()=>JSON.stringify(fsP().s||{}).slice(0,300)"),await E("()=>[S.view,FS.st,P.gold,fsP().cr.length,fsFound()]"),'before',c0)
    # Back button during reel (no confirm)
    await E("()=>{fsRoll=__r0;fsPond()}");await pg.wait_for_timeout(800)
    await pg.keyboard.press(' ');s=await waitst(g,['reel'])
    await E("()=>$('fsback').click()");await pg.wait_for_timeout(500);pr('Back button during reel',await E("()=>[S.view,FS.st]"))
    await pg.screenshot(path=SP+'/shots/fish_after_show_esc.png')
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
