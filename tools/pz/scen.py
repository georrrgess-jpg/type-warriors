"""python3 tools/pz/scen.py OUTDIR : screenshots of special states (ball in hand, call the 8, slow-mo 8, taunt, pause, rules, settings, results...)."""
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
    await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=100000;P.pz=null}");await pg.evaluate(SC)
    async def start(opp,seed=5,stake=500):
      await pg.evaluate("([o,s,k])=>{PZS().live=null;PZ.on=false;casinoOpen();gameOpen('pz');pzStart({opp:o,stake:k,seed:s})}",[opp,seed,stake]);await pg.wait_for_timeout(400);await pg.evaluate("()=>{const i=document.getElementById('pzintro');if(i)i.click()}");await pg.evaluate("()=>SC.ready()")
    await start('vesper')
    await pg.screenshot(path=out+'/01_break.png')
    await pg.evaluate("()=>SC.bih()");await pg.mouse.move(900,420);await pg.wait_for_timeout(300);await pg.screenshot(path=out+'/02_bih.png')
    await pg.evaluate("()=>SC.on8()");await pg.wait_for_timeout(500);await pg.screenshot(path=out+'/03_call8.png')
    await pg.evaluate("()=>SC.slow()");await pg.wait_for_timeout(300);await pg.evaluate("()=>pzFireHuman()")
    for i in range(6):
      await pg.wait_for_timeout(450);ph=await pg.evaluate("()=>[PZ.ph,PZ.ts.toFixed(2),!!(PZ.slow&&PZ.slow.on),PZ.cam.z.toFixed(2)]");print('slow',i,ph)
      if i in(1,2,3):await pg.screenshot(path=out+f'/04_slow{i}.png')
    await pg.wait_for_timeout(2500);await pg.screenshot(path=out+'/05_after8.png')
    print('after',await pg.evaluate("()=>[PZ.ph,PZ.M.score,PZ.st.over]"))
    await pg.wait_for_timeout(2500)
    # new rack then taunt + pause
    await start('hootsworth',seed=9);await pg.evaluate("()=>SC.taunt()");await pg.wait_for_timeout(500);await pg.screenshot(path=out+'/06_taunt.png')
    for ch in "who gives a hoot":
      await pg.keyboard.press(ch if ch!=' ' else 'Space');await pg.wait_for_timeout(40)
    await pg.wait_for_timeout(600);await pg.screenshot(path=out+'/07_rattled.png')
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(400)
    if not await pg.evaluate("()=>!!document.querySelector('#pzmod [data-a=resume]')"):
      await pg.keyboard.press('Escape');await pg.wait_for_timeout(400)
    await pg.screenshot(path=out+'/08_pause.png')
    await pg.click('[data-a=set]');await pg.wait_for_timeout(300);await pg.screenshot(path=out+'/09_settings.png')
    await pg.click('[data-a=back]');await pg.wait_for_timeout(200);await pg.click('[data-a=rules]');await pg.wait_for_timeout(300);await pg.screenshot(path=out+'/10_rules.png')
    await pg.click('[data-a=back]');await pg.wait_for_timeout(200);await pg.click('[data-a=forfeit]');await pg.wait_for_timeout(300);await pg.screenshot(path=out+'/11_forfeit.png')
    await pg.click('[data-a=yes]');await pg.wait_for_timeout(2500);await pg.screenshot(path=out+'/12_results_lose.png')
    print('after forfeit',await pg.evaluate("()=>[PZ.ph,PZS().losses,P.gold]"))
    await pg.click('#pzbb');await pg.wait_for_timeout(800);await pg.screenshot(path=out+'/13_hub_after.png')
    await pg.click('[data-a=cues]');await pg.wait_for_timeout(800);await pg.screenshot(path=out+'/14_cuerack.png')
    await pg.click('#pzbk');await pg.wait_for_timeout(500);await pg.click('[data-a=rules]');await pg.wait_for_timeout(500);await pg.screenshot(path=out+'/15_rules_screen.png')
    print('errors',er);await b.close()
asyncio.run(main())
