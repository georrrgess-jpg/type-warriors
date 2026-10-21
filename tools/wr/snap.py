# python3 snap.py OUT.png "js-body" [wait_ms] [w] [h] : open out.html, run js (async body), screenshot. Console errors are printed too.
import asyncio,sys,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
async def main():
  O,JS=sys.argv[1],sys.argv[2];Wt=int(sys.argv[3]) if len(sys.argv)>3 else 800;vw=int(sys.argv[4]) if len(sys.argv)>4 else 1600;vh=int(sys.argv[5]) if len(sys.argv)>5 else 900
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':vw,'height':vh});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){}}")
    r=await pg.evaluate("async()=>{"+JS+"}");await pg.wait_for_timeout(Wt);await pg.screenshot(path=O);print('ret',r,'err',er[:6]);await b.close()
asyncio.run(main())
