"""python3 tools/pz/snap.py OUT.png "js body (async ok)" [wait_ms] [w] [h]  : open out.html, run JS in the page, screenshot, print page errors."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  out,js=sys.argv[1],sys.argv[2];wait=int(sys.argv[3]) if len(sys.argv)>3 else 400;w=int(sys.argv[4]) if len(sys.argv)>4 else 1600;h=int(sys.argv[5]) if len(sys.argv)>5 else 900
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':w,'height':h});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]));pg.on('console',lambda m:er.append('console:'+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text and 'WebSocket' not in m.text else None)
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;PZ_TUT_OFF=true;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=60000}")
    r=await pg.evaluate("async()=>{"+js+"}")
    if r is not None:print('result',r)
    await pg.wait_for_timeout(wait);await pg.screenshot(path=out);print('errors',er);await b.close()
asyncio.run(main())
