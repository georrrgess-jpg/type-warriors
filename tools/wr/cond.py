# python3 cond.py : Conductor Bogsworth, large, in each mood (screenshots/wagon-cast/cond_*.png)
import asyncio,os
from playwright.async_api import async_playwright
H=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../type-warriors-source/out.html'))
OUT=os.path.realpath(os.path.join(os.path.dirname(__file__),'../../screenshots/wagon-cast'));os.makedirs(OUT,exist_ok=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':560});er=[];pg.on('pageerror',lambda e:er.append('PE '+str(e)[:300]))
    await pg.goto('file://'+H);await pg.wait_for_timeout(1200)
    await pg.evaluate("""()=>{RS_ASK=false;ov.className='hide';document.querySelectorAll('#wrap>*').forEach(e=>{if(e.id!=='wrap')e.style.display='none'});const c=document.createElement('canvas');c.id='cp';c.width=1600;c.height=560;c.style.cssText='position:fixed;left:0;top:0;z-index:99;background:#241a4e';document.body.appendChild(c);
      const g=c.getContext('2d');g.fillStyle='#241a4e';g.fillRect(0,0,1600,560);const M=[['idle',{mode:'idle'},0],['idle (watch)',{mode:'idle'},8],['lash windup',{mode:'lash',p:.04},0],['lash strike',{mode:'lash',p:.2},0],['toot',{mode:'toot',k:1},0],['cheer',{mode:'cheer',k:1},0],['sad',{mode:'sad',k:1},0],['think',{mode:'think',k:1},0]];
      M.forEach(([n,st,t0],i)=>{g.save();g.translate(100+i*195,440);g.scale(1.9,1.9);g.fillStyle='#0006';g.beginPath();g.ellipse(0,2,34,6,0,0,TAU);g.fill();wrConductorDraw(g,t0+.3,st);g.restore();g.fillStyle='#fff';g.font='15px Poppins';g.textAlign='center';g.fillText(n,100+i*195,520)})}""")
    await pg.screenshot(path=OUT+'/cond_modes.png');print('err',er[:5]);await b.close()
asyncio.run(main())
