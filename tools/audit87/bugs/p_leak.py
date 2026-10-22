from h import *
INIT="""(()=>{const R=window.requestAnimationFrame.bind(window);window.__raf=0;window.__rafSrc={};window.requestAnimationFrame=function(cb){window.__raf++;try{const s=(new Error().stack||'').split('\\n')[2]||'';const m=s.match(/(\\w+)\\s*\\(/);const k=m?m[1]:s.trim().slice(0,40);window.__rafSrc[k]=(window.__rafSrc[k]||0)+1}catch(e){}return R(cb)};
const SI=window.setInterval,CI=window.clearInterval;window.__iv=new Map();window.setInterval=function(f,t,...a){const id=SI(f,t,...a);let s='';try{s=(new Error().stack||'').split('\\n')[2].trim().slice(0,80)}catch(e){}window.__iv.set(id,s+' @'+t);return id};window.clearInterval=function(id){window.__iv.delete(id);return CI(id)}})()"""
MEAS="""async()=>{window.__raf=0;window.__rafSrc={};await new Promise(r=>setTimeout(r,2000));return [Math.round(window.__raf/2),JSON.stringify(window.__rafSrc),window.__iv.size,LIVE.length,document.getAnimations().filter(a=>a.playState==='running').length,S.mode,S.view,ov.className]}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':1600,'height':900})
    await ctx.add_init_script(INIT)
    g=await openp(p,ctx=ctx);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=50000;P.pet='bramble';WRP().intro=1;fsP().tut=1;save();title()}");await pg.wait_for_timeout(1500)
    pr('title0',await E(MEAS))
    steps=[('fishing',"()=>{fishing()}","()=>{fsPond()}","()=>{fsLeave()}","()=>{S.back()}"),
           ('riddle',"()=>{rrMenu(title)}",None,None,"()=>{rrBack()}"),
           ('wagon',"()=>{wagonMenu(title)}","()=>{$('wrgo').click()}","()=>{wrQuit()}","()=>{S.back()}"),
           ('arena',"()=>{waStart(0)}",None,None,"()=>{waQuit()}"),
           ('casino',"()=>{casinoOpen()}","()=>{gameOpen('ns')}","()=>{lobby()}","()=>{casinoBack()}"),
           ('wildcard',"()=>{casinoOpen();gameOpen('wc')}",None,None,"()=>{wcLeaveHome();casinoBack()}"),
           ('campaign',"()=>{start(1)}",None,None,"()=>{over(1);title()}"),
           ('pets',"()=>{petHall('Pets')}",None,None,"()=>{title()}")]
    for rep in range(2):
      for name,*acts in steps:
        for a in acts:
            if a: await E(a);await pg.wait_for_timeout(900)
        await E("()=>{if(S.mode!=='title'||!HOME)title()}");await pg.wait_for_timeout(600)
        pr(rep,name,'->',await E(MEAS))
    pr('intervals',await E("()=>[...window.__iv.values()]"))
    pr(g.er[:10]);await b.close()
asyncio.run(main())
