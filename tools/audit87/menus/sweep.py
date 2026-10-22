# python3 sweep.py name1,name2 ... ; screens defined in SCR. Fresh page per screen, one browser.
import asyncio,sys,json
sys.path.insert(0,'.')
from lib import *
SCR={
 'title':"title()",
 'modesheet':"title();modeSheet()",
 'eventsheet':"title();modeSheet('ev')",
 'moresheet':"title();moreSheet()",
 'campaign':"campaign(cmCur())",
 'endless':"endlessMenu(title)",
 'arena':"waMenu(title)",
 'graveyard':"gyMenu(title)",
 'trickortreat':"ttMenu()",
 'practice':"pracMenu(title)",
 'riddle':"dcMenu(title)",
 'fishing':"fishing()",
 'caravan':"wagonMenu(title)",
 'casino':"casinoOpen()",
 'wildcard':"wcHome()",
 'armory':"armory()",
 'skilltree':"upgrades()",
 'loadouts':"loadouts()",
 'pethall':"PTX.back=title;petHall()",
 'collection':"catalog(title)",
 'bounties':"bountyBoard()",
 'trophies':"profile(1)",
 'shop':"shop()",
 'crates':"crateHub()",
 'profile':"profile.tab='Overview';profile()",
 'settings':"settings(title)",
 'help':"help(title)",
 'menubg':"hbgPick(title)",
 'savecenter':"saveCenter(title)",
 'calendar':"dailyMenu(title)",
 'bell':"title();await sl(200);document.getElementById('bell').click()",
 'pet_eggs':"PTX.back=title;petHall('Eggs')",
 'pet_trail':"PTX.back=title;petHall('Trail')",
 'bestiary':"catalog(title,'Monsters')",
 'settings_data':"settings.tab='Data';settings(title)",
 'codes':"settings.tab='Data';settings(title);await sl(300);const b=[...document.querySelectorAll('#ov button')].find(b=>/code/i.test(b.textContent));b&&b.click()",
 'fishmap':"fishing();await sl(300);fsMap(fishing)",
 'loadouts2':"loadouts()",
}
SETTLE="""async(js)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const raf=()=>new Promise(r=>requestAnimationFrame(r));
const t0=performance.now();let err=null;try{await (new Function('sl','return (async()=>{'+js+'})()'))(sl)}catch(e){err=String(e)}const t1=performance.now();
await raf();await raf();const t2=performance.now();let mx=0,p=performance.now();for(let i=0;i<40;i++){await raf();const n=performance.now();mx=Math.max(mx,n-p);p=n}
return {sync:Math.round(t1-t0),paint:Math.round(t2-t0),maxFrame1s:Math.round(mx),err}}"""
FONTS="""()=>{const ov=document.getElementById('ov');const vis=e=>e.offsetParent||e.getClientRects().length;
const ff=e=>getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g,'');
const big=[...ov.querySelectorAll('h1,h2,h3,.ttl,[class*=title]')].filter(vis).slice(0,6).map(e=>e.tagName+':'+ff(e)+':'+getComputedStyle(e).fontSize+':'+(e.textContent||'').trim().slice(0,24));
const bt=[...ov.querySelectorAll('button')].filter(vis);const fam={};bt.forEach(b=>{const f=ff(b);fam[f]=(fam[f]||0)+1});
const gold=bt.filter(b=>{const c=getComputedStyle(b);const s=(c.backgroundImage+c.backgroundColor);return /rgb\\(2[2-5]\\d, 1[6-9]\\d|rgb\\(2[2-5]\\d, 2[01]\\d, [0-9]{1,2}\\)|#ffc|#ffd/.test(s)}).map(b=>(b.id||'')+':'+b.textContent.trim().slice(0,20));
const tabs=[...ov.querySelectorAll('[role=tab],[class*=tab] button,button[class*=tab],[data-tab],[data-t]')].filter(vis).map(e=>(e.id?'#'+e.id:'')+'.'+String(e.className).split(' ')[0]+'['+e.textContent.trim().slice(0,20)+']');
const tf={};const ser=[];[...ov.querySelectorAll('*')].filter(e=>vis(e)&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&!e.closest('#bellp')).forEach(e=>{const f=ff(e);const n=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ');tf[f]=(tf[f]||0)+n.length;if(/Times|serif$|Georgia|Cinzel/i.test(f)&&ser.length<6)ser.push(f+':'+n.slice(0,30))});
return {big,textFonts:tf,serifSamples:ser,gold,tabs:[...new Set(tabs)].slice(0,16)}}"""
FOCUS="""()=>{const a=document.activeElement;if(!a||a===document.body)return 'BODY';const c=getComputedStyle(a);const r=a.getBoundingClientRect();
const inOv=document.getElementById('ov').contains(a);return (a.id?'#'+a.id:'')+'.'+String(a.className).split(' ')[0]+'['+(a.textContent||a.value||'').trim().slice(0,22)+'] outline='+c.outlineStyle+'/'+c.outlineWidth+' shadow='+(c.boxShadow!=='none')+' vis='+(r.width>0&&r.bottom>0&&r.top<innerHeight)+' inOv='+inOv+' inert='+!!a.closest('[inert]')}"""
async def run(b,name,js,deep=None):
  pg,er=await newpage(b)
  R={'name':name,'open':js}
  R['timing']=await pg.evaluate(SETTLE,js)
  await pg.wait_for_timeout(900)
  R['sig']=await pg.evaluate(SIG);R['btn']=await pg.evaluate(BTN,None);R['fonts']=await pg.evaluate(FONTS)
  await pg.screenshot(path=f'{D}/shots/{name}_1600.png')
  R['ovl']={}
  for vw,vh in [(1600,900),(1280,720),(390,844)]:
    await pg.set_viewport_size({'width':vw,'height':vh});await pg.wait_for_timeout(500)
    R['ovl'][f'{vw}x{vh}']=await pg.evaluate("()=>{const r=document.querySelector('.dks .dkp')||document.getElementById('ov');return __ovl(r)}")
    if vw==390:await pg.screenshot(path=f'{D}/shots/{name}_390.png')
  await pg.set_viewport_size({'width':1600,'height':900});await pg.wait_for_timeout(400)
  R['focus']=[]
  for i in range(4):
    await pg.keyboard.press('Tab');await pg.wait_for_timeout(120);R['focus'].append(await pg.evaluate(FOCUS))
  await pg.screenshot(path=f'{D}/shots/{name}_tab.png')
  await pg.keyboard.press('Escape');await pg.wait_for_timeout(600)
  R['esc1']=await pg.evaluate(SIG)
  await pg.keyboard.press('Escape');await pg.wait_for_timeout(600)
  R['esc2']=await pg.evaluate(SIG)
  R['err']=er
  await pg.close();return R
async def main():
  names=sys.argv[1].split(',') if len(sys.argv)>1 and sys.argv[1]!='all' else list(SCR)
  out={}
  try:out=json.load(open(D+'/res.json'))
  except:pass
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for n in names:
      try:
        R=await run(b,n,SCR[n]);out[n]=R
        print('==',n,json.dumps({k:R[k] for k in ['timing','sig','esc1','esc2','err']})[:900])
        for k,v in R['ovl'].items():
          if v:print('  ovl',k,len(v),v[:6])
      except Exception as e:print('FAIL',n,e)
      json.dump(out,open(D+'/res.json','w'),indent=1)
    await b.close()
asyncio.run(main())
