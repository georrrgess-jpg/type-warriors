"""python3 tools/pz/flow.py : functional flows - reload mid-match and resume, forfeit from the resume prompt, shot-clock foul, leaving the mode mid-match."""
import asyncio,sys,os,json
from playwright.async_api import async_playwright
D=os.path.dirname(__file__)
H='file://'+os.path.abspath(os.path.join(D,'..','..','type-warriors-source','out.html'))
SC=open(os.path.join(D,'scen.js')).read()
PRE="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;PFW.asked=true}"
fails=[]
def chk(name,ok,info=''):
  print(('PASS ' if ok else 'FAIL ')+name,info if not ok else '')
  if not ok:fails.append(name)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1600,'height':900});pg=await ctx.new_page();er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:400]))
    await pg.goto(H);await pg.wait_for_timeout(1500);await pg.evaluate(PRE);await pg.evaluate("()=>{P.gold=5000;P.pz=null;save()}");await pg.evaluate(SC)
    # --- A: play one shot, reload, resume
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz');pzStart({opp:'gloop',stake:200,seed:5})}");await pg.wait_for_timeout(400);await pg.evaluate("()=>{document.getElementById('pzintro').click()}");await pg.evaluate("()=>SC.ready()")
    chk('stake taken',await pg.evaluate("()=>P.gold")==4800)
    await pg.evaluate("()=>{PZ.aim.pow=.8;pzFireHuman()}")
    for i in range(80):
      await pg.wait_for_timeout(250)
      if await pg.evaluate("()=>PZ.ph==='aim'||PZ.ph==='ai'||PZ.ph==='over'"):break
    await pg.evaluate("()=>{PZ.speed=6}")
    for i in range(120):
      await pg.wait_for_timeout(250)
      if await pg.evaluate("()=>PZ.ph==='aim'&&PZ.mode==='aim'"):break
    snap=await pg.evaluate("()=>({ph:PZ.ph,sc:PZ.M.score,B:PZ.B.map(b=>[b.id,Math.round(b.x),Math.round(b.y),b.on?1:0]),turn:PZ.st.turn,live:!!PZS().live})")
    chk('live snapshot saved',snap['live'] and snap['ph']=='aim',snap['ph'])
    await pg.reload();await pg.wait_for_timeout(1500);await pg.evaluate(PRE);await pg.evaluate(SC)
    chk('gold after reload (stake still held)',await pg.evaluate("()=>P.gold")==4800,await pg.evaluate("()=>P.gold"))
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz')}");await pg.wait_for_timeout(800)
    chk('resume prompt shown',await pg.evaluate("()=>!!document.getElementById('pzresume')"))
    await pg.click('#pzrs1');await pg.wait_for_timeout(1200)
    r=await pg.evaluate("()=>({ph:PZ.ph,sc:PZ.M.score,B:PZ.B.map(b=>[b.id,Math.round(b.x),Math.round(b.y),b.on?1:0]),turn:PZ.st.turn,stake:PZ.M.stake})")
    same=json.dumps(snap['B'])==json.dumps(r['B'])
    chk('resume restores the table',same,(snap['B'][:3],r['B'][:3]))
    chk('resume restores score and stake',r['sc']==snap['sc'] and r['stake']==200,r)
    # --- B: shot clock foul
    await pg.evaluate("()=>SC.ready()")
    await pg.evaluate("()=>{PZ.clock=.05}");await pg.wait_for_timeout(600)
    r=await pg.evaluate("()=>({ph:PZ.ph,bih:PZ.st.bih,turn:PZ.st.turn,f:PZ.st.fouls})")
    chk('time foul passes the turn with ball in hand',r['bih'] and r['turn']==1,r)
    # --- C: leave mid-match via forfeit: loses stake, results
    await pg.wait_for_timeout(500)
    await pg.evaluate("()=>pzForfeit()");await pg.wait_for_timeout(900)
    r=await pg.evaluate("()=>({gold:P.gold,live:PZS().live,ph:PZ.ph,losses:PZS().losses})")
    chk('forfeit: stake lost, no live match',r['gold']==4800 and not r['live'] and r['losses']>=1,r)
    # --- D: reload mid-match then forfeit from the prompt
    await pg.evaluate("()=>{pzStart({opp:'gloop',stake:100,seed:8})}");await pg.wait_for_timeout(400);await pg.evaluate("()=>{const i=document.getElementById('pzintro');if(i)i.click()}");await pg.evaluate("()=>SC.ready()");await pg.wait_for_timeout(300)
    g1=await pg.evaluate("()=>P.gold");await pg.reload();await pg.wait_for_timeout(1500);await pg.evaluate(PRE);await pg.evaluate(SC)
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz')}");await pg.wait_for_timeout(800)
    await pg.click('#pzrs2');await pg.wait_for_timeout(200);await pg.click('#pzrs2');await pg.wait_for_timeout(400)
    r=await pg.evaluate("()=>({gold:P.gold,live:PZS().live})")
    chk('forfeit from the resume prompt keeps the loss',r['gold']==g1 and not r['live'],(g1,r))
    # --- F: Slick Shade's offer after you win the first rack
    await pg.evaluate("()=>{P.gold=9000;save();casinoOpen();gameOpen('pz')}");await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{pzStart({opp:'shade',stake:1000,seed:4})}");await pg.wait_for_timeout(400);await pg.evaluate("()=>{const i=document.getElementById('pzintro');if(i)i.click()}");await pg.evaluate("()=>SC.ready()")
    await pg.evaluate("()=>{PZ.st.over={winner:0,why:'8 ball'};PZ.ph='rackend';pzRackEnd(false)}")
    for i in range(60):
      await pg.wait_for_timeout(250)
      if await pg.evaluate("()=>!!document.querySelector('#pzmod [data-a=yes]')"):break
    chk('Shade offers to let it ride after the first rack',await pg.evaluate("()=>!!document.querySelector('#pzmod [data-a=yes]')&&PZ.ph==='offer'"))
    await pg.click('#pzmod [data-a=yes]');await pg.wait_for_timeout(600)
    r=await pg.evaluate("()=>({race:PZ.M.race,mult:PZ.M.mult,ext:PZ.M.extended,ph:PZ.ph,score:PZ.M.score.slice()})")
    chk('let it ride: race to 3 at x3.2 and a fresh rack',r['race']==3 and r['mult']==3.2 and r['ext'] and r['score']==[1,0],r)
    await pg.evaluate("()=>pzForfeit()");await pg.wait_for_timeout(400)
    # --- G: reload during the VS intro: the stake must not vanish
    await pg.evaluate("()=>{P.gold=9000;P.pz=null;save();casinoOpen();gameOpen('pz')}");await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{pzStart({opp:'gloop',stake:200,seed:3})}");await pg.wait_for_timeout(300)
    chk('the match exists in the save the moment the stake is taken',await pg.evaluate("()=>!!(PZS().live&&PZS().live.pre&&PZS().live.stake===200)&&P.gold===8800"))
    await pg.reload();await pg.wait_for_timeout(1500);await pg.evaluate(PRE);await pg.evaluate(SC)
    await pg.evaluate("()=>{casinoOpen();gameOpen('pz')}");await pg.wait_for_timeout(700)
    chk('reload in the intro: a resume prompt, stake still held',await pg.evaluate("()=>!!document.getElementById('pzresume')&&P.gold===8800"))
    await pg.click('#pzrackem');await pg.wait_for_timeout(300)
    chk('"Rack em up" with a match waiting resumes it (no second stake)',await pg.evaluate("()=>P.gold===8800&&PZ.on&&PZ.M&&PZ.M.stake===200"))
    await pg.evaluate("()=>SC.skip&&SC.skip()");await pg.evaluate("()=>{const i=document.getElementById('pzintro');if(i)i.click()}")
    for i in range(60):
      await pg.wait_for_timeout(250)
      if await pg.evaluate("()=>PZ.ph==='aim'"):break
    chk('the resumed match reaches the break',await pg.evaluate("()=>PZ.ph==='aim'&&PZ.st&&PZ.st.brk"))
    await pg.evaluate("()=>pzForfeit()");await pg.wait_for_timeout(400)
    # --- E: leaving the mode via the back key mid-match asks first (pause menu) and the stake is not lost until forfeit
    print('errors',er)
    chk('no page errors',not er,er)
    await b.close()
  print('FAILED' if fails else 'ALL OK',fails);sys.exit(1 if fails else 0)
asyncio.run(main())
