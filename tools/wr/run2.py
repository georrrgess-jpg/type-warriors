# python3 run2.py : the other routes, the boss, a breakdown, the pause menu and a per-frame draw cost
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-route'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate
    step=lambda n:E("n=>{for(let i=0;i<n;i++)wrUpdate(1/60)}",n)
    await E("()=>{RS_ASK=false;P.gold=1000;P.pet='cinder';wrStart('pines')}");await step(420);await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'/r2_pines.png')
    print('pines mobs',await E("()=>WRX.mobs.map(e=>[e.id,e.w,Math.round(e.x),e.st])"))
    await E("()=>{wrLeave();wrStart('gallows');WRX.x=WRX.rt.len*.82;WRX.spawnT=0}");await step(360);await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'/r3_gallows_boss.png')
    print('boss',await E("()=>[WRX.leg,!!WRX.boss,WRX.mobs.map(e=>[e.id,e.w,Math.round(e.x),e.st,e.phs])]"))
    r=await E("()=>WRX.boss&&WRX.boss.w")
    if r:
      for ch in r:await pg.keyboard.press(ch);await pg.wait_for_timeout(25)
      await pg.wait_for_timeout(150);await pg.screenshot(path=OUT+'/r4_boss_hit.png');print('boss hit',await E("()=>[WRX.boss&&WRX.boss.phs,WRX.boss&&WRX.boss.st]"))
    await E("()=>{WRX.int=1;WRX.mobs=[];const e=wrSpawn('skel',0);e.x=e.sx;e.st='attack';e.at=0}");await step(40);await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'/r5_breakdown.png');print('break',await E("()=>[WRX.st,WRX.int]"))
    await step(200);await pg.wait_for_timeout(1200);print('break result',await E("()=>[S.mode,WRX&&WRX.result&&[WRX.result.won,WRX.result.med,WRX.result.total,WRX.result.xp,Math.round(WRX.result.prog*100)]]"))
    await E("()=>{wrLeave();wrStart('mill')}");await step(300);await pg.keyboard.press('Escape');await pg.wait_for_timeout(400);await pg.screenshot(path=OUT+'/r6_pause.png');print('pause',await E("()=>[WRX.pause,!!document.querySelector('.wrpause')]"))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(200);print('resumed',await E("()=>[WRX.pause,ov.className]"))
    # per-frame draw cost on the main canvas, idle and with 4 monsters
    cost=await E("""async()=>{const M=async(n)=>{let s=0,mx=0;for(let i=0;i<n;i++){const t0=performance.now();draw();const d=performance.now()-t0;s+=d;mx=Math.max(mx,d)}return [Math.round(s/n*100)/100,Math.round(mx*100)/100]};
      const a=await M(120);WRX.mobs=[];for(const id of['gob','skel','bat','gob'])wrSpawn(id,0);WRX.mobs.forEach((e,i)=>{e.x=1000+i*150});WRX.hazT=0;wrUpdate(1/60);const b2=await M(120);return [a,b2]}""")
    print('draw ms [mean,max] idle / busy',cost)
    print('err',er[:8]);await b.close()
asyncio.run(main())
