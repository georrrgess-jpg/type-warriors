"""python3 tools/pz/zoom.py OUT.png "x,y,w,h" [scale=2] [js]: start a gloop match (seed 11), optional JS, screenshot a clipped region at device scale."""
import asyncio,sys,os
from playwright.async_api import async_playwright
D=os.path.dirname(__file__)
H='file://'+os.path.abspath(os.path.join(D,'..','..','type-warriors-source','out.html'))
SC=open(os.path.join(D,'scen.js')).read()
async def main():
  out=sys.argv[1];clip=[int(v) for v in sys.argv[2].split(',')];sc=float(sys.argv[3]) if len(sys.argv)>3 else 2;js=sys.argv[4] if len(sys.argv)>4 else ''
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1600,'height':900},device_scale_factor=sc);pg=await ctx.new_page();er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]))
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=100000;P.pz=null}");await pg.evaluate(SC)
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz');pzStart({opp:'gloop',stake:100,seed:11})}");await pg.wait_for_timeout(400);await pg.evaluate("()=>{const i=document.getElementById('pzintro');if(i)i.click()}");await pg.evaluate("()=>SC.ready()");await pg.wait_for_timeout(1800)
    if js:
      r=await pg.evaluate("async()=>{"+js+"}")
      if r is not None:print("result",r)
    await pg.wait_for_timeout(500)
    await pg.screenshot(path=out,clip={'x':clip[0],'y':clip[1],'width':clip[2],'height':clip[3]});print('errors',er);await b.close()
asyncio.run(main())
