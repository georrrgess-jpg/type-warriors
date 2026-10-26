"""python3 tools/pz/mons.py OUT.png [expression=neutral] [scale=1.2] : all eight monsters on one sheet (each drawn the way the match draws them)."""
import asyncio,sys,os
from playwright.async_api import async_playwright
H='file://'+os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','type-warriors-source','out.html'))
async def main():
  out=sys.argv[1];ex=sys.argv[2] if len(sys.argv)>2 else 'neutral';sc=float(sys.argv[3]) if len(sys.argv)>3 else 1.2
  async with async_playwright() as p:
    b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[]
    pg.on('pageerror',lambda e:er.append(str(e)[:300]))
    await pg.goto(H);await pg.wait_for_timeout(1500)
    await pg.evaluate("([ex,sc])=>{document.body.innerHTML='<canvas id=mc width=1600 height=900 style=\"position:fixed;left:0;top:0;background:#2a1a4a\"></canvas>';const g=document.getElementById('mc').getContext('2d');g.lineJoin='round';g.lineCap='round';const ids=['gloop','moldwick','grizzle','vesper','barnacle','hootsworth','mortimer','shade'];ids.forEach((id,i)=>{g.save();g.translate(200+(i%4)*400,i<4?430:880);g.scale(sc,sc);pzMon[id](g,2,Object.assign(pzCastEx(),PZ_EXP[ex]||{}),{breath:0,tilt:0,bob:0,hop:0});g.restore();g.fillStyle='#fff';g.font='20px Poppins';g.fillText(id,60+(i%4)*400,(i<4?30:480))})}",[ex,sc])
    await pg.wait_for_timeout(300);await pg.screenshot(path=out);print('errors',er);await b.close()
asyncio.run(main())
