import asyncio,sys
sys.path.insert(0,'.')
from lib import *
def s(x):return f"{x['mode']}/{x['view']} {x['h'][:2]} sheets={x['sheets']}"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg,er=await newpage(b)
    # bell
    await pg.click('#bell');await pg.wait_for_timeout(300)
    o1=await pg.evaluate("()=>document.getElementById('bellp').classList.contains('open')")
    fa=await pg.evaluate("()=>document.activeElement.id||document.activeElement.className")
    await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
    o2=await pg.evaluate("()=>document.getElementById('bellp').classList.contains('open')")
    print('bell open',o1,'focus after open',fa,'after Esc still open',o2)
    await pg.evaluate("()=>title()");await pg.wait_for_timeout(300)
    # dock arrows
    await pg.focus('#dk_pl');await pg.keyboard.press('ArrowRight');await pg.wait_for_timeout(200)
    print('dock ArrowRight focus ->',await pg.evaluate("()=>document.activeElement.id"))
    # number keys on hub
    for k in ['1','2','3','6']:
      await pg.evaluate("()=>{title();document.activeElement.blur()}");await pg.wait_for_timeout(300)
      await pg.keyboard.press(k);await pg.wait_for_timeout(500);print('hub key',k,'->',s(await pg.evaluate(SIG)))
    # hotkeys
    for k in 'cerpgmakl bsxothdfw,':
      if k==' ':continue
      await pg.evaluate("()=>{title();document.activeElement.blur()}");await pg.wait_for_timeout(300)
      await pg.keyboard.press(k);await pg.wait_for_timeout(700);print('hub key',repr(k),'->',s(await pg.evaluate(SIG)))
    # hotkeys on a non-hub dock screen
    await pg.evaluate("()=>{armory();document.activeElement.blur()}");await pg.wait_for_timeout(300);await pg.keyboard.press('s');await pg.wait_for_timeout(500);print('armory key s ->',s(await pg.evaluate(SIG)))
    # focus after dock navigation
    await pg.evaluate("()=>title()");await pg.wait_for_timeout(300);await pg.focus('#dk_gr');await pg.keyboard.press('Enter');await pg.wait_for_timeout(500)
    print('after Enter on Gear: screen',s(await pg.evaluate(SIG)),'focus',await pg.evaluate("()=>document.activeElement.id||document.activeElement.tagName"))
    # warm vs cold open times
    for js in ["modeSheet()","wagonMenu(title)","dcMenu(title)","casinoOpen()","fishing()","campaign(cmCur())"]:
      ts=[]
      for i in range(3):
        await pg.evaluate("()=>{title()}");await pg.wait_for_timeout(400)
        t=await pg.evaluate("()=>{const t0=performance.now();"+js+";return Math.round(performance.now()-t0)}");ts.append(t);await pg.wait_for_timeout(600)
        await pg.evaluate("()=>{try{if(typeof casinoBack==='function'&&CAS.on)casinoBack()}catch(e){};try{dkClose(true)}catch(e){}}");await pg.wait_for_timeout(300)
      print('open ms',js,ts)
    # constant DOM mutations on idle hub
    await pg.evaluate("()=>title()");await pg.wait_for_timeout(1500)
    m=await pg.evaluate("""async()=>{const c={};const mo=new MutationObserver(L=>{L.forEach(r=>{const t=r.target.nodeType===3?r.target.parentNode:r.target;const k=(t.id||t.className||t.tagName)+':'+r.type+(r.attributeName?'/'+r.attributeName:'');c[k]=(c[k]||0)+1})});mo.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});await new Promise(r=>setTimeout(r,2000));mo.disconnect();return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,8)}""")
    print('mutations in 2s on idle hub',m)
    print('ERR',er);await b.close()
asyncio.run(main())
