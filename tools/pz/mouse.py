"""python3 tools/pz/mouse.py OUT_PREFIX : real pointer input on the break and the first shot (aim, pull back, shoot)."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  pre=sys.argv[1]
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]));pg.on('console',lambda m:er.append('console:'+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text and 'WebSocket' not in m.text else None)
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=100000;P.pz=null;casinoOpen();gameOpen('pz');pzStart({opp:'grizzle',stake:200,seed:11})}")
    await pg.wait_for_timeout(500);await pg.evaluate("()=>document.getElementById('pzintro').click()");await pg.wait_for_timeout(2600)
    st=await pg.evaluate("()=>[PZ.ph,PZ.mode,PZ.B[0].x,PZ.B[0].y]");print('start',st)
    cx,cy=360+st[2],214+st[3]
    # aim toward the rack, slightly up
    await pg.mouse.move(cx+300,cy-40);await pg.wait_for_timeout(500);await pg.screenshot(path=pre+'_aim.png')
    # press near the pointer and pull back to the left (away from the aim direction)
    await pg.mouse.down();await pg.mouse.move(cx+260,cy-34,steps=4);await pg.mouse.move(cx+120,cy-16,steps=8);await pg.wait_for_timeout(350);await pg.screenshot(path=pre+'_pull.png')
    print('pow',await pg.evaluate("()=>PZ.aim.pow"))
    await pg.mouse.up();await pg.wait_for_timeout(450);await pg.screenshot(path=pre+'_hit.png')
    await pg.wait_for_timeout(900);await pg.screenshot(path=pre+'_roll.png')
    for i in range(30):
      s=await pg.evaluate("()=>PZ.ph");
      if s not in('roll','stroke','settle'):break
      await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1500);await pg.screenshot(path=pre+'_after.png')
    print('after',await pg.evaluate("()=>[PZ.ph,PZ.st.turn,PZ.st.open,PZ.B.filter(b=>!b.on).map(b=>b.id),PZ.rep&&PZ.rep.reason]"));print('errors',er);await b.close()
asyncio.run(main())
