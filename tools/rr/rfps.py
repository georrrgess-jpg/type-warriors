import asyncio,sys,os
from playwright.async_api import async_playwright
M="()=>new Promise(res=>{const t=[];let l=performance.now();const f=n=>{t.push(n-l);l=n;if(t.length<180)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);res([Math.round(t.reduce((a,b)=>a+b)/t.length*10)/10,Math.round(t[Math.floor(t.length*.95)]*10)/10,Math.round(t[t.length-1])])}};requestAnimationFrame(f)})"
async def run(H):
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--disable-gpu-vsync','--disable-frame-rate-limit']);pg=await b.new_page(viewport={'width':1600,'height':900})
    await pg.goto('file://'+os.path.realpath(H));await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};delete P.rr;save();title()}");await pg.wait_for_timeout(400)
    await pg.evaluate("()=>dcMenu(title)");await pg.wait_for_timeout(1500)
    a=await pg.evaluate(M)
    await pg.evaluate("()=>{RR.heat=1;const w=$('rrarchw');w.style.setProperty('--heat',1);w.classList.add('hot','blaze');$('rr').style.setProperty('--rheat',1)}");await pg.wait_for_timeout(1500)
    c=await pg.evaluate(M)
    await pg.evaluate("()=>title()");await pg.wait_for_timeout(1000)
    d=await pg.evaluate(M)
    await b.close();return a,c,d
async def main():
  for k in range(2):
    for H in sys.argv[1:]:print(H.split('/')[-2] if 'source' in H else 'old','idle/hot/title',await run(H))
asyncio.run(main())
