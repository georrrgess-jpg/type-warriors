import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};title();dcMenu(title)}")
    shots=[]
    for i,(js,w) in enumerate([("0",500),("rrHostMode('think',2.6)",900),("rrHostMode('cheer',1.6,1)",700),("rrHostMode('sad',1.2,1)",900),("rrHostMode('ability',1.2)",550)]):
      await pg.evaluate("()=>{"+js+"}");await pg.wait_for_timeout(w);await pg.screenshot(path=f'h{i}.png',clip={'x':20,'y':80,'width':320,'height':620});shots.append(f'h{i}.png')
    print(await pg.evaluate("()=>[RRH.id,document.getElementById('rrbub').textContent]"),er)
    await b.close()
asyncio.run(main())
