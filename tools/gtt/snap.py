# python3 tools/gtt/snap.py OUT.png "js-body" [w] [h] : open out.html, add the stub data if the real modules are missing, run js (async body), screenshot
import asyncio,sys,os
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.realpath(__file__))
H=os.path.realpath(os.path.join(HERE,'../../type-warriors-source/out.html'))
STUB=open(os.path.join(HERE,'stub_data.js')).read()
async def main():
  O,JS=sys.argv[1],sys.argv[2];vw=int(sys.argv[3]) if len(sys.argv)>3 else 1600;vh=int(sys.argv[4]) if len(sys.argv)>4 else 900
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':vw,'height':vh});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]));pg.on('console',lambda m:print('console',m.text) if m.type=='error' else None)
    await pg.goto('file://'+H);await pg.wait_for_timeout(1200)
    await pg.evaluate("()=>{try{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}}catch(e){}}")
    
    if await pg.evaluate("typeof gttRun==='undefined'"):await pg.add_script_tag(content=STUB)
    
    r=await pg.evaluate("async()=>{"+JS+"}");await pg.screenshot(path=O);print('ret',r,'err',er);await b.close()
asyncio.run(main())
