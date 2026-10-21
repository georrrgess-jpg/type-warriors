import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};title();dcMenu(title)}");await pg.wait_for_timeout(500)
    for i,id in enumerate(['gob','drg','skel','oct']):
      await pg.evaluate("(id)=>{rrHostPick=()=>id;rrHostStart('open')}",id);await pg.wait_for_timeout(1200)
      await pg.screenshot(path=f'k{i}.png',clip={'x':20,'y':80,'width':320,'height':620})
    print(await pg.evaluate("()=>[RRH.id,RRH.n,typeof RRK,RRK.length]"),er);await b.close()
asyncio.run(main())
