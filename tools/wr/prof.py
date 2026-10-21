# python3 prof.py : per-part draw cost of the caravan versus the campaign fight (same headless renderer)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300);E=pg.evaluate
    r=await E("""async()=>{RS_ASK=false;P.pet='bramble';const M=(f,n)=>{let s=0;for(let i=0;i<n;i++){const t0=performance.now();f();s+=performance.now()-t0}return Math.round(s/n*100)/100};
      start(1);for(let i=0;i<120;i++)update(1/60);const fight=M(draw,80);
      wrStart('mill');for(let i=0;i<300;i++)wrUpdate(1/60);WRX.mobs=[];for(const id of['gob','skel','bat','gob'])wrSpawn(id,0);WRX.mobs.forEach((e,i)=>{e.x=1000+i*150});draw();
      const R=WRX,c=ctx,parts={};const T=(k,f)=>{parts[k]=M(f,60)};
      T('all',draw);T('scene',()=>wrSceneDraw(c,R));T('gate',()=>wrGateDraw(c,R));T('pet',()=>wrPetDraw(c,R));T('wagon',()=>wrWagonDraw(c,R));T('hero',()=>wrHeroDraw(c,R));T('mobs',()=>{for(const e of R.mobs)wrMobDraw(c,e)});T('tags',()=>{for(const e of R.mobs)wrTag(c,e,false)});T('fore',()=>wrForeDraw(c,R));T('hud',()=>wrHUD(c,R));
      T('sky',()=>c.drawImage(R.bake.sky,0,0));T('vig',()=>{c.globalAlpha=.9;c.drawImage(R.bake.vig,0,0);c.globalAlpha=1});T('far',()=>wrDrift(c,R.bake.far,250,.18,R.x));T('wall',()=>wrDrift(c,R.bake.wall,GY-150,1,R.x));T('deck',()=>wrDrift(c,R.bake.deck,GY,1,R.x));T('lantern',()=>wrLantern(c,700,500,.95,WR_COS.lan.brass,S.t,0,0));T('driver',()=>{c.save();c.scale(.62,.62);rrkDraw(c,RRK[0],S.t,{mode:'idle',k:1});c.restore()});
      return {fight,parts,RS}}""")
    print(r);print('err',er[:4]);await b.close()
asyncio.run(main())
