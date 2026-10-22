from h import *
AUTO=open(os.path.join(SP,'auto.js')).read()
async def main():
  async with async_playwright() as p:
    g=await openp(p,rm=True);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=50000;P.pet='bramble';P.petSt=2;P.pets={bramble:{b:0}};petNorm();WRP().intro=1;fsP().tut=1;save();title()}");await pg.wait_for_timeout(800)
    await E("()=>{"+AUTO+"}")
    acts=[('campaign',"()=>{start(3)}","()=>__auto(600)"),('fish',"()=>{fishing();}","()=>{fsPond();fsCast()}"),('riddle',"()=>rrMenu(title)",None),
          ('wagon',"()=>{wagonMenu(title)}","()=>{$('wrgo').click()}"),('arena',"()=>waStart(1)",None),('casino',"()=>{casinoOpen();gameOpen('sl')}","()=>$('sp').click()"),
          ('wc',"()=>{casinoOpen();gameOpen('wc');wcStartSolo('c50',true)}",None),('gy',"()=>gyMenu(title)",None),('gyrun',"()=>start(0,'gy')","()=>__auto(300)"),('treat',"()=>{try{ttMenu()}catch(e){console.error(e)}}",None)]
    for vw,vh in [(1600,900),(800,500),(390,844)]:
        await pg.set_viewport_size({'width':vw,'height':vh});await pg.wait_for_timeout(300)
        for name,a,b in acts:
            await E(a);await pg.wait_for_timeout(700)
            if b: await E(b);await pg.wait_for_timeout(1500)
            # resize mid-screen
            await pg.set_viewport_size({'width':vw-100,'height':vh-60});await pg.wait_for_timeout(300);await pg.set_viewport_size({'width':vw,'height':vh});await pg.wait_for_timeout(400)
            ov=await E("()=>{const r=ov.getBoundingClientRect(),w=wrap.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),Math.round(w.width),Math.round(w.height),document.documentElement.scrollWidth>innerWidth+1]}")
            await pg.screenshot(path=SP+f'/shots/rm_{name}_{vw}.png')
            pr(vw,name,ov,'errs',g.er[:3]);g.er.clear()
            await E("()=>{try{if(typeof wcLeaveHome==='function'&&$('wct')){WX.tok++;wcClear();WX.G=null}}catch(e){};try{fsStop()}catch(e){};RR=null;CAS.on=false;S.mode='title';title()}");await pg.wait_for_timeout(400)
    await g.b.close()
asyncio.run(main())
