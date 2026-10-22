# python3 ev.py file.js  -> evaluates async body in game, prints JSON result
import asyncio,sys,json
from playwright.async_api import async_playwright
H='/home/user/type-warriors/type-warriors-source/out.html'
async def main():
  JS=open(sys.argv[1]).read()
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){}}")
    r=await pg.evaluate("async()=>{"+JS+"}")
    print(json.dumps(r,indent=1,default=str)[:200000]);
    if er: print('ERR',er)
    await b.close()
asyncio.run(main())
