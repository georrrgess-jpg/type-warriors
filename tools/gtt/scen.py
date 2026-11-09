# python3 tools/gtt/scen.py OUTDIR name:json ... : draw several race scenarios (one page load), screenshot each
import asyncio,sys,os,json
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.realpath(__file__))
H=os.path.realpath(os.path.join(HERE,'../../type-warriors-source/out.html'))
STUB=open(os.path.join(HERE,'stub_data.js')).read()
JS="""
window.__scen=(o)=>{let cv=document.getElementById('__cv');if(!cv){cv=document.createElement('canvas');cv.id='__cv';cv.width=1600;cv.height=900;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999';document.body.appendChild(cv)}
 const g=cv.getContext('2d');gttBake();const card=Object.assign(gttCard(o.card||7),{going:o.going||'good',weather:o.weather||'clear'});const st=gttSimNew(card,o.rs||11);let cam=null;
 if(o.kind){const st2=gttRun(card,o.rs||11);if(o.kind==='photo'){st2.photo={a:st2.order[0],b:st2.order[1],gap:o.gap==null?.15:o.gap};g.fillStyle='#2a1850';g.fillRect(0,0,1600,900);gttPhoto(g,o.t==null?3:o.t,st2)}
  else if(o.kind==='podium'){g.fillStyle='#3a2a68';g.fillRect(0,0,1600,900);gttDrawPodium(g,st2,o.t==null?3:o.t)}
  else if(o.kind==='tile'){const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:1600px;height:900px;z-index:100000;background:#222;display:flex;gap:20px;padding:20px;flex-wrap:wrap';d.id='__tile';d.innerHTML='<div style="width:640px;height:352px;overflow:hidden;border-radius:14px;border:3px solid #12081f">'+gttTile()+'</div><div style="width:320px;height:176px;overflow:hidden;border-radius:10px">'+TA.gtt+'</div>';document.body.appendChild(d);return 'tile'}
  return o.kind}
 const ev=o.ev||[];const N=o.steps||150;GTTART.lt=-1;
 for(let n=0;n<N;n++){gttStep(st);for(const e of ev){if(e[2]===n)st.run[e[0]].ev={k:e[1],t0:st.t,t1:st.t+(e[3]||1.2)},st.ev.push({t:st.t,lane:e[0],k:e[1]})}
  if(o.boost&&n===o.boost[0]){st.run.forEach((r,i)=>{r.x=o.boost[1]+(i*-3.1)+(i===2?4:0)})}
  cam=gttCam(st,cam,o.fx);if(o.every||n>N-40)gttDrawRace(g,st,cam,{t:n/30,mine:o.mine||[1,3],low:!!o.low,going:card.going,weather:card.weather})}
  return {x:st.run.map(r=>Math.round(r.x*10)/10),cam};}
"""
async def main():
  out=sys.argv[1];os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1200)
    await pg.evaluate("()=>{try{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}}catch(e){}}")
    
    if await pg.evaluate("typeof gttRun==='undefined'"):await pg.add_script_tag(content=STUB)
    await pg.evaluate(JS+";0")
    for a in sys.argv[2:]:
      name,js=a.split(':',1);r=await pg.evaluate("(o)=>__scen(o)",json.loads(js));await pg.screenshot(path=os.path.join(out,name+'.png'));print(name,r)
    print('err',er);await b.close()
asyncio.run(main())
