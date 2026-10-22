import asyncio,sys,json
sys.path.insert(0,'.')
from lib import *
KB="""()=>{const v=e=>{if(!e)return false;const c=getComputedStyle(e);const r=e.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity>0&&r.width>0&&r.height>0&&r.top<innerHeight};
return {mode:S.mode,view:S.view,kbWant:kbWant(),kb:v(document.getElementById('kb')),wrkb:v(document.getElementById('wrkb')),rrkeys:[...document.querySelectorAll('.rrk')].filter(v).length,inputmode:inp.getAttribute('inputmode')}}"""
CASES=[
 ('campaign',"start(cmCur())",2500),
 ('endless',"start(0)",2500),
 ('practice',"pracMenu(title);await sl(300);document.getElementById('pgo2').click()",2500),
 ('graveyard',"start(0,'gy')",2500),
 ('trickortreat',"ttNewRun(0)",3000),
 ('fishing_pond',"fishing();await sl(400);fsPond()",1500),
 ('riddle',"dcMenu(title)",1200),
 ('caravan',"P.wr=undefined;try{WRP().intro=1}catch(e){};wrStart('mill');await sl(1500)",1500),
 ('arena',"waMenu(title);await sl(300);document.getElementById('waGo')&&document.getElementById('waGo').click()",2500),
]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for vw,vh,mob in [(390,844,True)]:
      for name,js,w in CASES:
        ctx=await b.new_context(viewport={'width':vw,'height':vh},is_mobile=mob,has_touch=True)
        pg=await ctx.new_page();er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
        await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
        await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=5000;ST.touch='on';saveST();applyLayout();title()}");await pg.wait_for_timeout(300)
        try:
          await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));"+js+"}");await pg.wait_for_timeout(w)
          r=await pg.evaluate(KB)
        except Exception as e:r='ERR '+str(e)[:200]
        await pg.screenshot(path=f'{D}/shots/touch_{name}.png')
        print(name,r,er[:2]);await ctx.close()
    await b.close()
if __name__=="__main__":asyncio.run(main())
