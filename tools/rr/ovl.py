import asyncio,os,json
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html');JS=open('overlap.js').read()
VP=[(1920,1080),(1600,900),(1366,768),(1280,720),(1024,768),(820,1180),(390,844)]
STATES={
 'daily-mid':"dcMenu(title);await sl(500);for(const w of ['crane','pilot']){for(const c of w)rrType(c);rrEnter();await sl(1800)}rrType('a');rrType('b');",
 'daily-res':"dcMenu(title);await sl(400);rrUse('r');await sl(400);for(const c of 'crane')rrType(c);rrEnter();await sl(1800);for(const c of rrWord(rrKey()))rrType(c);rrEnter();await sl(5200);",
 'daily-done':"dcMenu(title);await sl(400);for(const c of rrWord(rrKey()))rrType(c);rrEnter();await sl(4000);rrResClose();await sl(300);",
 'practice':"dcMenu(title);await sl(400);document.querySelector('.rrtabs [data-m=p]').click();await sl(400);rrUse('s');await sl(500);for(const c of 'crane')rrType(c);rrEnter();await sl(1800);",
 'practice-res':"dcMenu(title);await sl(400);document.querySelector('.rrtabs [data-m=p]').click();await sl(400);const W=rrCur().w;for(const w of ['crane','pilot','mound','fudge','sweet','vivid'].filter(x=>x!==W).slice(0,6)){for(const c of w)rrType(c);rrEnter();await sl(1750)}await sl(1500);",
 'home':"title();await sl(500);",
}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();tot=0
    for vw,vh in VP:
      for k,js in STATES.items():
        pg=await b.new_page(viewport={'width':vw,'height':vh});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
        await pg.goto('file://'+H);await pg.wait_for_timeout(1100)
        await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=4200;title()}");await pg.wait_for_timeout(300)
        await pg.evaluate("()=>{"+JS+"}")
        await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));"+js+"}")
        await pg.wait_for_timeout(300)
        if k=='home':r=await pg.evaluate("()=>{const c=document.getElementById('dcb');return c?__ovl(c):['NO CARD']}")
        else:
          r=await pg.evaluate("()=>{const m=document.getElementById('rrres');return __ovl(m&&!m.hidden?m:null)}")
        await pg.screenshot(path=f'ov_{vw}x{vh}_{k}.png')
        if r or er:print(f'{vw}x{vh} {k}:',r[:12],er[:2])
        tot+=len(r);await pg.close()
    print('TOTAL',tot);await b.close()
asyncio.run(main())
