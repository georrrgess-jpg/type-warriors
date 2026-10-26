"""python3 tools/pz/seq.py OUTDIR [opp] [speed] [frames] [interval_ms] [x,y,w,h] : fire the break in slow motion and capture frames (clip = table area by default)."""
import asyncio,sys,os
from playwright.async_api import async_playwright
D=os.path.dirname(__file__)
H='file://'+os.path.abspath(os.path.join(D,'..','..','type-warriors-source','out.html'))
SC=open(os.path.join(D,'scen.js')).read()
async def main():
  out=sys.argv[1];opp=sys.argv[2] if len(sys.argv)>2 else 'gloop';spd=float(sys.argv[3]) if len(sys.argv)>3 else .12;n=int(sys.argv[4]) if len(sys.argv)>4 else 16;iv=int(sys.argv[5]) if len(sys.argv)>5 else 60
  clip=[int(v) for v in sys.argv[6].split(',')] if len(sys.argv)>6 else [330,170,960,540]
  os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]))
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=100000;P.pz=null}");await pg.evaluate(SC)
    await pg.evaluate("([o])=>{casinoOpen();gameOpen('pz');pzStart({opp:o,stake:100,seed:11})}",[opp]);await pg.wait_for_timeout(400);await pg.evaluate("()=>{const i=document.getElementById('pzintro');if(i)i.click()}");await pg.evaluate("()=>SC.ready()")
    await pg.wait_for_timeout(1800)
    await pg.evaluate("([s])=>{PZ.aim.pow=.95;PZ.speed=s;pzFireHuman()}",[spd])
    for i in range(n):
      await pg.screenshot(path=f'{out}/f{i:02d}.png',clip={'x':clip[0],'y':clip[1],'width':clip[2],'height':clip[3]});await pg.wait_for_timeout(iv)
    print('errors',er);await b.close()
asyncio.run(main())
