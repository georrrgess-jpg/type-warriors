import asyncio,sys,os
from playwright.async_api import async_playwright
H='file:///home/user/type-warriors/type-warriors-source/out.html'
D=os.path.dirname(os.path.abspath(__file__))
LIB=open('/home/user/type-warriors/pool_plan/poolart.js').read()+'\n'+open('/home/user/type-warriors/sports_plan/frame.js').read()
async def main():
  names=sys.argv[1:]
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto(H);await pg.wait_for_timeout(1800)
    for n in names:
      sc=open(D+'/'+n+'.js').read()
      await pg.evaluate("()=>{document.querySelectorAll('canvas[data-cc]').forEach(c=>c.remove())}")
      js="()=>{const cv=document.createElement('canvas');cv.dataset.cc=1;cv.width=1600;cv.height=900;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999';document.body.appendChild(cv);const g=cv.getContext('2d');g.lineJoin='round';g.lineCap='round';"+LIB.replace('const O=','var O=')+"\n"+sc+"}"
      try:await pg.evaluate(js)
      except Exception as e:print('EXC',n,str(e)[:400])
      await pg.wait_for_timeout(150);await pg.screenshot(path=D+'/'+n+'.png');print(n,await pg.evaluate('()=>window.__pzms||null'))
    print('errors',er);await b.close()
asyncio.run(main())
