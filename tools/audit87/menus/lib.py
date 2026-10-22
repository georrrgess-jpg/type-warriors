import asyncio,os,json,time
from playwright.async_api import async_playwright
H='/home/user/type-warriors/type-warriors-source/out.html'
OVL=open('/home/user/type-warriors/tools/wr/overlap.js').read()
D=os.path.dirname(os.path.abspath(__file__))
async def newpage(b,vw=1600,vh=900):
  pg=await b.new_page(viewport={'width':vw,'height':vh});er=[]
  pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
  pg.on('console',lambda m:er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
  await pg.goto('file://'+H);await pg.wait_for_timeout(1300)
  await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};P.gold=5000;title()}")
  await pg.evaluate("()=>{"+OVL+"}")
  await pg.wait_for_timeout(300)
  return pg,er
SIG="""()=>{const ov=document.getElementById('ov');const h=[...ov.querySelectorAll('h1,h2,h3')].filter(e=>e.offsetParent).map(e=>e.textContent.trim().slice(0,40));
const sh=[...document.querySelectorAll('.dks')].map(s=>s.id);
return {mode:S.mode,view:S.view,cls:ov.className,h:h.slice(0,4),sheets:sh,back:S.back?(S.back.name||S.back.toString().slice(0,90)):null,home:typeof HOME!=='undefined'?HOME:null}}"""
BTN="""(sel)=>{const R=sel?document.querySelector(sel):document.getElementById('ov');if(!R)return 'NOROOT';return [...R.querySelectorAll('button,[role=button],a[href],[tabindex="0"]')].filter(e=>e.offsetParent||e.getClientRects().length).map(e=>(e.id?'#'+e.id+' ':'')+(e.disabled?'[DIS] ':'')+(e.textContent||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,50)+(e.title?' {'+e.title.slice(0,40)+'}':''))}"""
