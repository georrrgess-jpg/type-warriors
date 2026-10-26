"""python3 tools/pz/auto.py OPP [seed] [speed] [shots_dir] : plays a whole match with the AI on both sides at accelerated time and reports.
Catches page errors, stuck states and bad payouts. Screenshots (every ~3 s of play) go to shots_dir when given."""
import asyncio,sys,os,time
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
AUTO=open(os.path.join(os.path.dirname(__file__),'auto.js')).read()
async def main():
  opp=sys.argv[1] if len(sys.argv)>1 else 'gloop';seed=int(sys.argv[2]) if len(sys.argv)>2 else 1;speed=int(sys.argv[3]) if len(sys.argv)>3 else 6;sd=sys.argv[4] if len(sys.argv)>4 else None
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]));pg.on('console',lambda m:er.append('console:'+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text and 'WebSocket' not in m.text else None)
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;PZ_TUT_OFF=true;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=100000;P.pz=null}")
    await pg.evaluate(AUTO)
    await pg.evaluate("([o,s,sp])=>{casinoOpen();gameOpen('pz');pzStart({opp:o,stake:200,seed:s});window.__a=pzAuto({speed:sp});setTimeout(()=>{const i=document.getElementById('pzintro');if(i)i.click()},400)}",[opp,seed,speed])
    t0=time.time();n=0;last=None;stuck=0
    while time.time()-t0<float(os.environ.get('LIMIT','240')):
      await pg.wait_for_timeout(1000)
      st=await pg.evaluate("()=>({ph:PZ.ph,sc:PZ.M?PZ.M.score.slice():null,rack:PZ.M&&PZ.M.rack,res:!!document.querySelector('.pzresc'),shots:__a.shots,err:__a.err||null,gold:P.gold,turn:PZ.st&&PZ.st.turn,mode:PZ.mode,bih:PZ.st&&PZ.st.bih,ball:PZ.B&&PZ.B.filter(b=>b.on).length})")
      key=(st['ph'],st['rack'],st['shots'],st['turn']);stuck=stuck+1 if key==last else 0;last=key
      if sd and n%3==0:await pg.screenshot(path=os.path.join(sd,f'a{n:03d}.png'))
      n+=1
      if st['res']:break
      if st['err']:print('AUTO ERR',st['err']);break
      if stuck>25:print('STUCK',st);break
    st=await pg.evaluate("()=>({ph:PZ.ph,sc:PZ.M?PZ.M.score.slice():null,res:PZ.result||null,gold:P.gold,shots:__a.shots,pz:{wins:PZS().wins,losses:PZS().losses,racks:PZS().racks,pots:PZS().pots,dayN:PZS().dayN,live:!!PZS().live}})")
    print('time',round(time.time()-t0),'s',st);print('errors',er);await b.close()
asyncio.run(main())
