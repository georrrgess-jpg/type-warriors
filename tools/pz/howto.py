"""python3 tools/pz/howto.py OUTDIR : the How to Play screen, every tab, and the pause-menu version."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]))
    await pg.goto(H);await pg.wait_for_timeout(1500);E=pg.evaluate
    await E("()=>{RS_ASK=false;PZ_TUT_OFF=true;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=3000;P.pz=null;const Z=PZS();Z.tut={hub:1,m1:1,trick:1,rack:1,ai1:1};save();PZ.howTab='basics';pzRules();0;}");await pg.wait_for_timeout(900)
    for i,k in enumerate(['basics','shoot','fouls','extras','keys']):
      await pg.click(f'.pzhtabs button[data-h="{k}"]');await pg.wait_for_timeout(650);await pg.screenshot(path=f'{out}/{i+1}_{k}.png')
    await E("()=>{pzStart({opp:'gloop',practice:true,seed:2});0;}");await pg.wait_for_timeout(400);await E("()=>{const i=document.getElementById('pzintro');if(i)i.click();0;}");await pg.wait_for_timeout(2600)
    await E("()=>{pzPauseMenu();0;}");await pg.wait_for_timeout(400);await pg.click('#pzmod [data-a=rules]');await pg.wait_for_timeout(700);await pg.screenshot(path=f'{out}/6_modal.png')
    await pg.click('#pzmod [data-a=back]');await pg.wait_for_timeout(400);print('back to pause',await E("()=>!!document.querySelector('#pzmod [data-a=resume]')"))
    print('errors',er)
    await b.close()
asyncio.run(main())
