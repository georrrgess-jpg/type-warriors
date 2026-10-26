"""python3 tools/pz/ui.py OUTDIR : screenshots of the non-match screens (hub, shade, intro, results win/lose, cue rack tabs, rules)."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]));pg.on('console',lambda m:er.append('console:'+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text and 'WebSocket' not in m.text else None)
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=48250;P.pz=null;const Z=PZS();Z.beat={gloop:4,moldwick:2,grizzle:1};Z.cues.slime=1;Z.cues.maple=1;save()}")
    async def snap(n,wait=500):
      await pg.wait_for_timeout(wait);await pg.screenshot(path=out+'/'+n+'.png')
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz')}");await snap('01_hub_vesper')
    for k in ['gloop','moldwick','grizzle']:
      await pg.click(f'.pzrow[data-k={k}]');await snap('02_hub_'+k,350)
    await pg.evaluate("()=>{const Z=PZS();Z.beat.vesper=1;Z.beat.barnacle=1;Z.beat.hootsworth=1;Z.beat.mortimer=1;PZ.sel='mortimer';PZ.shadeHere=true;PZ.shadeChecked=pzDay();pzHub()}");await snap('03_hub_all_shade')
    await pg.click('.pzrow[data-k=shade]');await snap('04_hub_shade_sel',350)
    await pg.click('.pzrow[data-k=barnacle]');await snap('05_hub_barnacle',350)
    await pg.click('.pzrow[data-k=hootsworth]');await snap('05b_hub_hoot',350)
    await pg.click('.pzrow[data-k=moldwick]');await snap('05c_hub_mold',350)
    await pg.evaluate("()=>{PZ.shadeHere=false;pzHub()}")
    await pg.evaluate("()=>{const mk=(win,opp)=>({win,opp,stake:500,score:win?[2,1]:[1,2],race:2,practice:false,pay:win?1000:0,bonus:win?100:0,bnr:win?1:0,golden:0,pots:win?19:11,banks:win?2:0,time:431,unlocks:win?[{t:'cue',n:'Slime Stick'}]:[],mult:2,forfeit:false,beatN:1});PZ.reg=PZ_REG.vesper;pzResults(mk(true,'vesper'))}");await snap('06_results_win',1800)
    await pg.evaluate("()=>{pzResults({win:false,opp:'barnacle',stake:500,score:[0,2],race:2,practice:false,pay:0,bonus:0,bnr:0,golden:0,pots:6,banks:0,time:300,unlocks:[],mult:2,forfeit:false,beatN:0})}");await snap('07_results_lose',900)
    await pg.evaluate("()=>pzHub()");await pg.wait_for_timeout(300);await pg.click('[data-a=cues]');await snap('08_rack_cues')
    await pg.click('.pzki[data-i=slime]');await snap('09_rack_slime',300)
    await pg.click('.pzktabs button[data-t=felts]');await snap('10_rack_felts',300)
    await pg.click('.pzktabs button[data-t=balls]');await snap('11_rack_balls',300)
    print('errors',er);await b.close()
asyncio.run(main())
