import asyncio,sys
sys.path.insert(0,'.')
from lib import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg,er=await newpage(b)
    for js,sel in [("pracMenu(title)","#pgo2"),("crateHub()","#cxop"),("bountyBoard()",".rrlock"),("settings(title)","#b"),("profile(1)",".tro"),("help(title)","#b"),("endlessMenu(title)","#bgS")]:
      await pg.evaluate("()=>{title();"+js+"}");await pg.wait_for_timeout(700)
      r=await pg.evaluate("""(sel)=>{const ov=document.getElementById('ov');const mn=ov.querySelector(':scope>.mn');const row=ov.querySelector('.dkrow');const e=document.querySelector(sel);const er=e&&e.getBoundingClientRect(),rr=row&&row.querySelector('.dk').getBoundingClientRect();
      const sub=row&&row.querySelector('.dksub');const sr=sub&&sub.getBoundingClientRect();
      return {scrollH:ov.scrollHeight,clientH:ov.clientHeight,overflowY:getComputedStyle(ov).overflowY,zoom:mn&&mn.style.zoom,elBottom:er&&Math.round(er.bottom),elTop:er&&Math.round(er.top),dockTop:rr&&Math.round(rr.top),subTop:sr&&Math.round(sr.top)}}""",sel)
      print(js,r)
    await b.close()
asyncio.run(main())
