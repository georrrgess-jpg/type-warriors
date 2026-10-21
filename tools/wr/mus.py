# python3 mus.py : the caravan music starts in the hub (camp) and in a run (road), ducks the game's music, mutes and stops on leave; levels of both tracks
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:200]) if m.type in('error','warning') and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);await pg.mouse.click(5,5);await pg.keyboard.press('Shift');await pg.wait_for_timeout(200)
    E=lambda j:pg.evaluate(j)
    await E("()=>{try{RS_ASK=false}catch(e){};ST.mute=false;P.pet='bramble';WRP().intro=1;title()}");await pg.wait_for_timeout(600)
    await E("()=>wagonMenu(title)");await pg.wait_for_timeout(2500);hub=await E("()=>[wraStats(),wraNow(),ac?ac.state:'none',(mg?mg.gain.value.toFixed(2):'none')]")
    await E("()=>wrHitch()");await pg.wait_for_timeout(2500);run=await E("()=>[wraStats(),wraNow(),(mg?mg.gain.value.toFixed(2):'none')]")
    await E("()=>{WRX.mobs=[];const e=wrSpawn('gob',0);e.x=1100;for(let i=0;i<30;i++)wrUpdate(1/60)}");await pg.wait_for_timeout(1200);dng=await E("()=>wraState()")
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(1500);pz=await E("()=>[wraStats().players,wraNow()&&wraNow().track,wraState()]")
    await E("()=>document.getElementById('mt').click()");await pg.wait_for_timeout(1500);m=await E("()=>[ST.mute,wraStats().players]")
    await E("()=>document.getElementById('mt').click()");await pg.wait_for_timeout(1500);u=await E("()=>[ST.mute,wraStats().players]")
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
    await E("()=>{WRX.x=WRX.rt.len;for(let i=0;i<300;i++)wrUpdate(1/60)}");await pg.wait_for_timeout(2500);res=await E("()=>[S.mode,wraStats(),wraNow()&&wraNow().track]")
    await E("()=>{wrLeave();title()}");await pg.wait_for_timeout(5500);left=await E("()=>[wraStats().players,wraStats().live,(mg?mg.gain.value.toFixed(2):'none'),rraStats().players]")
    lv=await E("""async()=>{const pk=b=>{let m=0,s=0,n=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>m)m=v;s+=v*v;n++}}return[(20*Math.log10(m)).toFixed(1),(10*Math.log10(s/n)).toFixed(1)]};
      const a=await wraRender('road',40,2),c=await wraRender('camp',30,2);let r=null;try{r=pk(await rraRender('main',40,2,.5))}catch(e){}return {road:pk(a),camp:pk(c),riddle:r}}""")
    print('hub',hub);print('run',run);print('danger',dng);print('paused',pz);print('muted',m,'unmuted',u);print('result',res);print('left',left);print('levels dBFS [peak,rms]',lv);print('err',er[:6]);await b.close()
asyncio.run(main())
