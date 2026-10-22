import asyncio,sys,json
sys.path.insert(0,'.')
from lib import *
T=sys.argv[1].split(',') if len(sys.argv)>1 else None
async def where(pg):return await pg.evaluate(SIG)
def s(x):return f"{x['mode']}/{x['view']} {x['h'][:2]} cls={x['cls']} sheets={x['sheets']}"
async def ev(pg,js,w=500):
  r=await pg.evaluate("async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));"+js+"}");await pg.wait_for_timeout(w);return r
async def esc(pg,w=600):
  await pg.keyboard.press('Escape');await pg.wait_for_timeout(w);return s(await where(pg))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    async def test(name,fn):
      if T and name not in T:return
      pg,er=await newpage(b)
      try:
        out=await fn(pg);print('##',name,'::',out)
      except Exception as e:print('##',name,'FAILED',str(e)[:300])
      if er:print('   errors:',er[:4])
      await pg.close()
    async def profile_esc(pg):
      await ev(pg,"profile.tab='Overview';profile()")
      await pg.fill('#nm','Zed');await pg.focus('#nm')
      a=await esc(pg);n1=await pg.evaluate("()=>P.name")
      await ev(pg,"profile()");await pg.fill('#nm','Yan');await pg.keyboard.press('Enter');await pg.wait_for_timeout(200);n2=await pg.evaluate("()=>P.name")
      await ev(pg,"profile()");await pg.fill('#nm','Kim');await pg.click('#dk_gr');await pg.wait_for_timeout(400);n3=await pg.evaluate("()=>P.name")
      return f'after Esc -> {a}; P.name={n1} (typed Zed) | Enter -> {n2} (typed Yan) | dock click -> {n3} (typed Kim)'
    await test('profile_esc',profile_esc)
    async def settings_scroll(pg):
      await ev(pg,"settings(title)")
      tabs=await pg.evaluate("()=>[...document.querySelectorAll('[data-st]')].map(b=>b.textContent)")
      res=[]
      for t in tabs:
        await pg.click(f'[data-st="{t}"]');await pg.wait_for_timeout(300)
        info=await pg.evaluate("()=>{const ov=document.getElementById('ov');return [ov.scrollHeight,ov.clientHeight]}")
        res.append((t,info))
      # scroll to bottom of the longest tab and click the last seg button
      best=max(res,key=lambda r:r[1][0]-r[1][1])
      await pg.click(f'[data-st="{best[0]}"]');await pg.wait_for_timeout(300)
      await pg.evaluate("()=>{ov.scrollTop=ov.scrollHeight}");await pg.wait_for_timeout(200)
      st0=await pg.evaluate("()=>ov.scrollTop")
      lab=await pg.evaluate("()=>{const bs=[...ov.querySelectorAll('.opts .opt')].filter(o=>o.offsetParent);const o=bs[bs.length-1];const b=o&&[...o.querySelectorAll('[data-k]')].find(x=>!x.classList.contains('on'));if(!b)return null;b.click();return (o.querySelector('label')||{}).textContent+' -> '+b.textContent}")
      await pg.wait_for_timeout(400)
      st1=await pg.evaluate("()=>ov.scrollTop");tab=await pg.evaluate("()=>settings.tab")
      return f'tabs(scrollH,clientH)={res}; clicked {lab} at scrollTop {st0} -> after {st1}; tab now {tab}'
    await test('settings_scroll',settings_scroll)
    async def shop_buy(pg):
      await ev(pg,"shop()")
      before=await pg.evaluate("()=>({c:dkCrates(),g:P.gold,bdg:(document.querySelector('#dk_sh .bdg')||{}).textContent||'',sub:(document.querySelector('[data-dks=cr] .bdg')||{}).textContent||''})")
      ok=await pg.evaluate("()=>{const b=document.getElementById('shbuy');if(!b)return 'nobuy';b.click();return b.textContent.trim().slice(0,40)}")
      await pg.wait_for_timeout(2500)
      # may open confirm
      st=await pg.evaluate("()=>({mod:!!document.querySelector('.shmod.on'),modtxt:(document.querySelector('.shmod.on')||{}).textContent||''})")
      after=await pg.evaluate("()=>({c:dkCrates(),g:P.gold,shown:(document.getElementById('shgv')||{}).textContent,bdg:(document.querySelector('#dk_sh .bdg')||{}).textContent||'',sub:(document.querySelector('[data-dks=cr] .bdg')||{}).textContent||'',own:[...document.querySelectorAll('[data-own]')].map(e=>e.textContent).join('|')})")
      await pg.screenshot(path=D+'/shots/f_shop_after_buy.png')
      return f'before={before} click={ok} modal={st["mod"]} {st["modtxt"][:80]!r} after={after}'
    await test('shop_buy',shop_buy)
    async def persist(pg):
      await ev(pg,"P.gold=4321;P.name='Persist';save();ST.shake=false;ST.flash=false;saveST();settings.tab='Display'")
      await pg.reload();await pg.wait_for_timeout(1800)
      r=await pg.evaluate("()=>({gold:P.gold,name:P.name,shake:ST.shake,flash:ST.flash,mode:S.mode,ov:document.getElementById('ov').className,h:[...document.querySelectorAll('#ov h1,#ov h2,#ov h3')].map(e=>e.textContent.trim().slice(0,30)).slice(0,3)})")
      await pg.screenshot(path=D+'/shots/f_after_reload.png')
      return r
    await test('persist',persist)
    async def nested(pg):
      out=[]
      for opener,item in [("armory()","#mst"),("shop()","#mhp"),("petHall()","#msv"),("bountyBoard()","#mbg")]:
        await ev(pg,opener,600);await pg.click('#dk_mo');await pg.wait_for_timeout(500);await pg.click(item);await pg.wait_for_timeout(700)
        a=s(await where(pg));b2=await esc(pg)
        out.append(f'{opener} > More > {item}: at [{a}] Esc-> [{b2}]')
      await ev(pg,"armory()",500);await pg.click('#dkcal');await pg.wait_for_timeout(700);a=s(await where(pg));b2=await esc(pg);out.append(f'armory > calendar: [{a}] Esc-> [{b2}]')
      await ev(pg,"shop()",500);await pg.click('#np') if await pg.query_selector('#np') else None
      return '\n   '.join(out)
    await test('nested',nested)
    async def nested2(pg):
      out=[]
      await ev(pg,"catalog(title,'Pets')",700);a=s(await where(pg));b1=await esc(pg);b2=await esc(pg);out.append(f"catalog Pets tab: [{a}] Esc-> [{b1}] Esc-> [{b2}]")
      await ev(pg,"fishing()",700);
      ids=await pg.evaluate("()=>['fshj','fshw','fshc','fsh6b'].filter(i=>document.getElementById(i))");
      for i in ids:
        await ev(pg,"fishing()",600);await pg.click('#'+i);await pg.wait_for_timeout(700);a=s(await where(pg));b1=await esc(pg);b2=await esc(pg);out.append(f"fishing>{i}: [{a}] Esc-> [{b1}] Esc-> [{b2}]")
      await ev(pg,"wagonMenu(title)",800);btn=await pg.evaluate("()=>[...document.querySelectorAll('#ov button')].filter(b=>b.offsetParent).map(b=>b.id+':'+b.textContent.trim().slice(0,20))");out.append('wagon buttons '+str(btn))
      for fn in ['wrWorkshop()','wrRouteLog()','wrHowTo()']:
        await ev(pg,"wagonMenu(title)",500);await ev(pg,fn,700);a=s(await where(pg));b1=await esc(pg);b2=await esc(pg);out.append(f"wagon>{fn}: [{a}] Esc-> [{b1}] Esc-> [{b2}]")
      await ev(pg,"dcMenu(title)",700);
      pr=await pg.evaluate("()=>{const b=[...document.querySelectorAll('#ov button')].find(b=>b.textContent.trim()==='Practice');if(b){b.click();return 1}return 0}");await pg.wait_for_timeout(600)
      a=s(await where(pg));b1=await esc(pg);b2=await esc(pg);out.append(f"riddle>Practice({pr}): [{a}] Esc-> [{b1}] Esc-> [{b2}]")
      await ev(pg,"casinoOpen()",1200);g=await pg.evaluate("()=>{const c=[...document.querySelectorAll('#ov [data-g]')].map(e=>e.dataset.g);return c.slice(0,20)}");out.append('casino games '+str(g))
      for gid in g[:20]:
        await ev(pg,"casinoOpen()",900)
        await ev(pg,f"(typeof gameOpen==='function')&&gameOpen('{gid}')",900);a=s(await where(pg));b1=await esc(pg,900);b2=await esc(pg,900);out.append(f"casino>{gid}: [{a}] Esc-> [{b1}] Esc-> [{b2}]")
      return '\n   '.join(out)
    await test('nested2',nested2)
    await b.close()
asyncio.run(main())
