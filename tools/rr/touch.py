import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html');JS=open('overlap.js').read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for vw,vh in [(390,844),(820,1180),(1180,820),(844,390)]:
      ctx=await b.new_context(viewport={'width':vw,'height':vh},has_touch=True,is_mobile=True,device_scale_factor=2);pg=await ctx.new_page();er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
      await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
      await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=4200;title()}");await pg.wait_for_timeout(400)
      await pg.evaluate("()=>{"+JS+"}")
      await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));dcMenu(title);await sl(500);for(const c of 'crane')rrType(c);rrEnter();await sl(1900);rrType('a')}")
      await pg.wait_for_timeout(300)
      r=await pg.evaluate("()=>[__ovl(),ovTM,ov.clientWidth,ov.clientHeight,document.getElementById('rr').className,getComputedStyle(document.getElementById('rr')).getPropertyValue('--t')]")
      await pg.screenshot(path=f'tt_{vw}x{vh}.png');print(vw,vh,r,er[:2]);await ctx.close()
    await b.close()
asyncio.run(main())
