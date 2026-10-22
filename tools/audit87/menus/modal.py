import asyncio,sys
sys.path.insert(0,'.')
from lib import *
CASES=[
 ('shop_odds',"shop();await sl(400);const b=[...document.querySelectorAll('#ov button')].find(b=>/contents|odds/i.test(b.textContent));b&&b.click()","#shmod.on"),
 ('wagon_workshop',"wagonMenu(title);await sl(400);wrWorkshop()",".wrws"),
 ('fish_basket',"fishing();await sl(400);document.getElementById('fshc').click()","[class*=fsmod],[class*=fsm].on,.fsmodal"),
 ('pet_eggs',"PTX.back=title;petHall('Eggs');await sl(400);const b=[...document.querySelectorAll('#ov button')].find(b=>/buy|hatch/i.test(b.textContent)&&!b.disabled);b&&b.click()","#ptmod.on"),
 ('collection_mod',"catalog(title,'Weapons');await sl(500);const c=document.querySelector('#ov .hlc,#ov [data-w],#ov .wcard,#ov .hlg button');c&&c.click()","#hlmod.on"),
 ('modesheet',"modeSheet()",".dks"),
]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name,js,sel in CASES:
      pg,er=await newpage(b)
      try:
        await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));"+js+"}");await pg.wait_for_timeout(700)
        found=await pg.evaluate(f"()=>{{const m=document.querySelector({sel!r});return m?(m.id||m.className).toString().slice(0,40):null}}")
        out=[];
        for i in range(18):
          await pg.keyboard.press('Tab');await pg.wait_for_timeout(50)
          out.append(await pg.evaluate(f"()=>{{const a=document.activeElement;const m=document.querySelector({sel!r});const inM=m&&m.contains(a);const inDock=!!a.closest('.dkrow');return (inM?'M':inDock?'DOCK':'OUT')}}"))
        await pg.screenshot(path=f'{D}/shots/modal_{name}.png')
        await pg.keyboard.press('Escape');await pg.wait_for_timeout(500)
        still=await pg.evaluate(f"()=>!!document.querySelector({sel!r})")
        print(name,'modal=',found,'tab seq',''.join(x[0] for x in out),'| after Esc modal still present:',still,er[:2])
      except Exception as e:print(name,'ERR',str(e)[:200])
      await pg.close()
    await b.close()
asyncio.run(main())
