"""python3 tools/pz/hub.py OUTDIR : the 9.5 hub: settled, mid-entrance, keyboard pick and stake, Shade, resume banner, new player."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
INIT="()=>{RS_ASK=false;PZ_TUT_OFF=true;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true;P.gold=48250;P.pz=null;const Z=PZS();Z.beat={gloop:4,moldwick:2,grizzle:1};Z.wins=9;Z.losses=4;Z.streak=3;Z.trick={0:3,1:2,3:1};Z.cues.slime=1;Z.cues.mycelium=1;Z.tut.hub=1;save();PZ.sel=null;0;}"
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]));pg.on('console',lambda m:er.append('console:'+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await pg.goto(H);await pg.wait_for_timeout(1500);E=pg.evaluate
    await E(INIT);await E("()=>{pzHub();0;}");await pg.wait_for_timeout(260);await pg.screenshot(path=f'{out}/01_entrance.png')
    await pg.wait_for_timeout(1600);await pg.screenshot(path=f'{out}/02_hub.png')
    await pg.keyboard.press('ArrowUp');await pg.wait_for_timeout(120);await pg.screenshot(path=f'{out}/03_swap.png');await pg.wait_for_timeout(500)
    await pg.keyboard.press('ArrowRight');await pg.wait_for_timeout(500);await pg.screenshot(path=f'{out}/04_stake.png')
    print('sel',await E("()=>[PZ.sel,PZ.stk&&PZ.stk[PZ.sel]]"))
    await pg.mouse.move(170,330);await pg.wait_for_timeout(400);await pg.screenshot(path=f'{out}/05_hover.png')
    await E("()=>{PZ.shadeHere=true;PZ.shadeChecked=pzDay();PZ.sel='shade';pzHub();0;}");await pg.wait_for_timeout(1800);await pg.screenshot(path=f'{out}/06_shade.png')
    await E("()=>{PZ.shadeHere=false;const Z=PZS();Z.live={v:PZ_LIVE_V,opp:'grizzle',stake:500,mult:1.5,race:2,practice:false,extended:false,score:[1,0],rack:2,breaker:0,bnr:0,golden:0,pots:3,banks:0,racks:[],bonus:0,seed:5,st:null,B:Array.from({length:16},(_,i)=>[i,0,0,1]),pend:null,rattled:0,pre:1};save();PZ.sel=null;pzHub();0;}");await pg.wait_for_timeout(1800);await pg.screenshot(path=f'{out}/07_resume.png')
    await E("()=>{P.pz=null;P.gold=400;const Z=PZS();Z.tut.hub=1;save();PZ.sel=null;pzHub();0;}");await pg.wait_for_timeout(1800);await pg.screenshot(path=f'{out}/08_newplayer.png')
    await E("()=>{P.pz=null;P.gold=48250;const Z=PZS();Z.beat={gloop:4,moldwick:2,grizzle:1,vesper:3};Z.wins=12;Z.losses=5;Z.best=4;Z.net=3450;Z.pots=88;Z.banks=7;Z.bnr=1;Z.rackWins=15;Z.tut.hub=1;Z.vs={gloop:[4,1],moldwick:[2,2],grizzle:[1,1],vesper:[3,1]};save();pzRegs();0;}");await pg.wait_for_timeout(1300);await pg.screenshot(path=f'{out}/09_regulars.png')
    await pg.click('.pzrg[data-k="grizzle"]');await pg.wait_for_timeout(1400);print('regs->hub sel',await E("()=>[PZ.sel,!!document.getElementById('pzh')]"))
    print('errors',[x for x in er if 'WebSocket' not in x])
    await b.close()
asyncio.run(main())
