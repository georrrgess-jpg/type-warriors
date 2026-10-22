from h import *
async def typ(pg,w):
    for c in w: await pg.keyboard.press(c);await pg.wait_for_timeout(10)
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=10000;delete P.rr;save();title()}")
    await E("()=>rrMenu(title)");await pg.wait_for_timeout(900)
    pr('menu',await E("()=>[S.mode,S.view,RR.mode,rrCur().w,rrCur().st,ov.className,rraWant()]"))
    ans=await E("()=>rrCur().w")
    wrong=await E("a=>RR_ANS.filter(w=>w!==a&&![...w].some(c=>a.includes(c))).slice(0,6)",ans)
    pr('wrong guesses',wrong)
    # 1) win on guess 1 with fast double-Enter and immediate reload
    await typ(pg,ans);await pg.keyboard.press('Enter');await pg.keyboard.press('Enter');await pg.wait_for_timeout(120)
    pr('right after enter',await E("()=>[rrCur().st,P.gold,RRP().wins,RRP().st,RRP().pl,JSON.parse(localStorage.getItem(KEY)||'{}').rr]"))
    await pg.reload();await pg.wait_for_timeout(1500)
    pr('after reload',await E("()=>{RR={key:rrKey(),mode:'d'};const R=RRP(),e=rrCur();return [e.st,e.c,P.gold,R.wins,R.st,R.pl,R.last]}"))
    await E("()=>{RR=null;RS_ASK=false;title();rrMenu(title)}");await pg.wait_for_timeout(1200)
    pr('reopen shows',await E("()=>[!!$('rrres')&&!$('rrres').hidden,($('rrres')||{}).textContent&&$('rrres').textContent.slice(0,200)]"))
    await pg.screenshot(path=SP+'/shots/rr_after_reload.png')
    pr(g.er[:10]);g.er.clear()
    # 2) practice: lose with 6 wrong guesses, then try leaving immediately
    await E("()=>{rrMenu(title,'p')}");await pg.wait_for_timeout(900)
    pa=await E("()=>rrCur().w")
    wrong=await E("a=>RR_ANS.filter(w=>w!==a).slice(0,6)",pa)
    for w in wrong[:5]:
        await typ(pg,w);await pg.keyboard.press('Enter');await pg.wait_for_timeout(1900);pr(' g',await E("()=>[rrCur().g.length,rrCur().st,RR.busy]"))
    await typ(pg,wrong[5]);await pg.keyboard.press('Enter');await pg.wait_for_timeout(50)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(50)
    pr('esc during last flip',await E("()=>[!!$('rr'),RR&&RR.busy,rrCur&&RR?rrCur().st:null]"))
    await pg.wait_for_timeout(3000)
    pr('after',await E("()=>[!!$('rr'),!!$('rrres')&&!$('rrres').hidden,RRP().pr.pl,RRP().pr.st]"))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(500)
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(500)
    pr('left',await E("()=>[S.mode,S.view,!!RR,ov.className,rraWant()]"))
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
