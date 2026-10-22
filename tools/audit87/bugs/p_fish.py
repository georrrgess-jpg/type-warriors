from h import *
async def waitst(g,sts,ms=15000):
    for i in range(ms//100):
        s=await g.E("()=>FS.st")
        if s in sts: return s
        await g.pg.wait_for_timeout(100)
    return 'TIMEOUT:'+str(await g.E("()=>FS.st"))
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=5000;delete P.fish;save();title();PFW.asked=true}")
    await E("()=>fishing()");await pg.wait_for_timeout(800)
    pr('hub',await E("()=>[S.mode,S.view,ov.className,FS.on,LIVE.length]"))
    await E("()=>fsPond()");await pg.wait_for_timeout(800)
    pr('pond',await E("()=>[S.mode,S.view,FS.st,FS.tut,ov.className,LIVE.length]"))
    if await E("()=>FS.tut"):
        await pg.keyboard.press(' ');await pg.wait_for_timeout(400)
    pr('tut closed',await E("()=>[FS.st,FS.tut]"))
    for rnd in range(3):
        await pg.keyboard.press(' ');s=await waitst(g,['reel'])
        pr('round',rnd,'st',s,await E("()=>FS.cur&&[FS.cur.id,FS.cur.rk,FS.words]"))
        if rnd==0:
            # blur during reel: does the timer keep running?
            a=await E("()=>FS.tLeft");await E("()=>window.dispatchEvent(new Event('blur'))");await pg.wait_for_timeout(1500);b=await E("()=>[FS.tLeft,FS.st,ov.className,S.mode]")
            pr('blur during reel tLeft',a,'->',b)
        while await E("()=>FS.st")in('reel','stage'):
            st=await E("()=>FS.st")
            if st=='stage': await pg.wait_for_timeout(100);continue
            w=await E("()=>FS.word.slice(FS.typed)")
            for c in w: await pg.keyboard.press(c);await pg.wait_for_timeout(15)
            await pg.wait_for_timeout(150)
        s=await waitst(g,['show','reveal','idle','escape'])
        pr(' after reel',s)
        if s=='show':
            await pg.wait_for_timeout(1300);await pg.keyboard.press(' ');s=await waitst(g,['reveal','idle'])
        pr(' state',s,await E("()=>[FS.pend&&FS.pend.id,P.gold,fsP().cr.length]"))
        if s=='reveal':
            g0=await E("()=>P.gold")
            if rnd==0:
                # fast double Enter = quick sell (ask + confirm); then a third Enter
                await pg.keyboard.press('Enter');await pg.keyboard.press('Enter');await pg.keyboard.press('Enter');await pg.wait_for_timeout(300)
                pr(' triple enter',await E("()=>[FS.st,P.gold,fsP().cr.length,FS.pend]"),'gold0',g0)
            else:
                await pg.keyboard.press('k');await pg.wait_for_timeout(300);pr(' keep',await E("()=>[FS.st,fsP().cr.length]"))
        await waitst(g,['idle'])
    await pg.screenshot(path=SP+'/shots/fish_pond.png')
    # Esc to hub, Esc to title
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(600)
    pr('esc1',await E("()=>[S.mode,S.view,FS.on,FS.st,ov.className,fm7Want(),LIVE.length]"))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(600)
    pr('esc2',await E("()=>[S.mode,S.view,FS.on,FS.st,ov.className,fm7Want(),getComputedStyle($('cn')).display,$('cn').className]"))
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
