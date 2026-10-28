# Renders the tower-defense concept PNGs on top of a live game: python3 run.py 1_mortar 2_aerie ...
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file:///home/user/type-warriors/type-warriors-source/out.html'
D=os.path.dirname(os.path.abspath(__file__))
LIB=open('/home/user/type-warriors/pool_plan/poolart.js').read()+'\n'+open(D+'/tdart.js').read()
SETUP=open(D+'/setup.js').read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();er=[]
    for n in sys.argv[1:]:
      pg=await b.new_page(viewport={'width':1600,'height':900});pg.on('pageerror',lambda e:er.append(str(e)[:300]))
      await pg.goto(H);await pg.wait_for_timeout(1500)
      sc=open(D+'/'+n+'.js').read();first=sc.split('\n',1)[0]
      await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const T=RPP().tut;for(const k of['build','wave','coins','upgrade','abil','twist_frost','twist_ember','twist_wonder'])T[k]=1;RPP().dragon=1;RPP().stars.ember=1}")
      await pg.evaluate("(cfg)=>{"+SETUP+"\n;return tdSetup(cfg)}",first[2:].strip())
      await pg.wait_for_timeout(2500)
      await pg.evaluate("()=>{[...document.querySelectorAll('div')].filter(d=>/build towers on the glowing pads|NEW MONSTER/i.test(d.textContent)&&d.textContent.length<140).forEach(d=>d.style.visibility='hidden')}")
      js="()=>{const cv=document.createElement('canvas');cv.dataset.cc=1;cv.width=1600;cv.height=900;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;pointer-events:none';document.body.appendChild(cv);const g=cv.getContext('2d');g.lineJoin='round';g.lineCap='round';const R=RPX;"+LIB.replace('const O=','var O=')+"\n"+sc+"}"
      try:await pg.evaluate(js)
      except Exception as e:print('EXC',n,str(e)[:400])
      await pg.wait_for_timeout(200);await pg.screenshot(path=D+'/'+n+'.png');print(n);await pg.close()
    print('errors',er);await b.close()
asyncio.run(main())
