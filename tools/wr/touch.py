# python3 touch.py : the hub and the run on 4 touch sizes; checks the on-screen keyboard types (run from tools/wr)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath('../../type-warriors-source/out.html');JS=open('overlap.js').read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for vw,vh in [(390,844),(820,1180),(1180,820),(844,390)]:
      ctx=await b.new_context(viewport={'width':vw,'height':vh},has_touch=True,is_mobile=True,device_scale_factor=2);pg=await ctx.new_page();er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
      await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
      await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=4200;P.pet='bramble';delete P.wr;WRP().intro=1;title()}");await pg.wait_for_timeout(400)
      await pg.evaluate("()=>{"+JS+"}")
      await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));wagonMenu(title);await sl(500)}")
      r=await pg.evaluate("()=>[__ovl(document.getElementById('wrhub')),ovTM,ov.clientWidth,ov.clientHeight,TM(),document.getElementById('wrhub').style.zoom]")
      await pg.screenshot(path=f'tt_{vw}x{vh}_hub.png');print(vw,vh,'hub',r,er[:2])
      await pg.evaluate("async()=>{wrHitch();await new Promise(r=>setTimeout(r,400));for(let i=0;i<200;i++)wrUpdate(1/60);WRX.mobs=[];const e=wrSpawn('gob',0);e.x=1100;e.w='road';e.i=0}")
      await pg.wait_for_timeout(300)
      r=await pg.evaluate("()=>{const kb=document.getElementById('wrkb');if(!kb)return ['NO KB'];const b=kb.querySelector('[data-c=r]');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));return [S.mode,ov.className,WRX.chars,WRX.ok,WRX.tgt&&WRX.tgt.w,kb.getBoundingClientRect().width|0,kb.getBoundingClientRect().bottom|0,innerHeight]}")
      await pg.screenshot(path=f'tt_{vw}x{vh}_run.png');print(vw,vh,'run',r,er[:2]);await ctx.close()
    await b.close()
asyncio.run(main())
