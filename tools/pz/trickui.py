"""python3 tools/pz/trickui.py OUTDIR : trick shot list, a puzzle, a miss, a solve (1st puzzle is a straight shot), the done panel."""
import asyncio,sys,os
from playwright.async_api import async_playwright
D=os.path.dirname(__file__)
H='file://'+os.path.abspath(os.path.join(D,'..','..','type-warriors-source','out.html'))
SC=open(os.path.join(D,'scen.js')).read()
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]));pg.on('console',lambda m:er.append('console:'+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text and 'WebSocket' not in m.text else None)
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;PZ_TUT_OFF=true;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=1000;P.pz=null;const Z=PZS();Z.trick={0:3,1:2,3:1}}");await pg.evaluate(SC)
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz');pzTrick()}");await pg.wait_for_timeout(700);await pg.screenshot(path=out+'/01_list.png')
    await pg.click('.pzti[data-i="0"]');await pg.wait_for_timeout(2200);await pg.screenshot(path=out+'/02_puzzle1.png')
    print('ph',await pg.evaluate("()=>[PZ.ph,PZ.M.trick.n,PZ.B.filter(b=>b.on).length]"))
    # miss: aim away
    await pg.evaluate("()=>{PZ.aim.ang+=0.6;PZ.aim.pow=.5}");await pg.wait_for_timeout(700);await pg.evaluate("()=>pzFireHuman()");await pg.wait_for_timeout(4500);await pg.screenshot(path=out+'/03_miss.png')
    print('after miss',await pg.evaluate("()=>[PZ.ph,PZ.M.trick.tries]"))
    await pg.wait_for_timeout(2500)
    print('reset',await pg.evaluate("()=>[PZ.ph,PZ.M.trick.tries]"))
    # solve: straight at the ball
    await pg.evaluate("()=>{PZ.aim.ang=pzDefaultAim();PZ.aim.pow=.6;pzFireHuman()}");await pg.wait_for_timeout(3600);await pg.screenshot(path=out+'/04_solved.png')
    await pg.wait_for_timeout(1800);await pg.screenshot(path=out+'/05_done.png')
    print('end',await pg.evaluate("()=>[PZ.ph,PZ.M.trick.tries,PZ.M.trick.stars,PZS().trick,P.gold]"))
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
    print('errors',er);await b.close()
asyncio.run(main())
