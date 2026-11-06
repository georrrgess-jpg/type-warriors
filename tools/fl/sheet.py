#!/usr/bin/env python3
"""Gear sheet: renders heroes wearing armors (with weapons) and weapon close-ups to a PNG.
python3 sheet.py OUT.png "a1,a2,..." "w1,w2,..." [t] [scale]"""
import asyncio,sys,os
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
HTML=os.environ.get('TW_HTML') or os.path.join(HERE,'..','..','type-warriors-source','out.html')
async def main():
    out=sys.argv[1];arms=sys.argv[2].split(',');wps=sys.argv[3].split(',');t=float(sys.argv[4]) if len(sys.argv)>4 else 1.3
    sc=float(sys.argv[5]) if len(sys.argv)>5 else 1.6
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('file://'+os.path.abspath(HTML));await pg.wait_for_function("()=>typeof title==='function'&&typeof P==='object'");await pg.wait_for_timeout(600)
        url=await pg.evaluate("""([arms,wps,t,sc])=>{const n=Math.max(arms.length,wps.length),cw=Math.round(150*sc),ch=Math.round(250*sc),c=document.createElement('canvas');c.width=cw*n;c.height=ch+Math.round(150*sc);const g=c.getContext('2d');
 g.fillStyle='#1a1430';g.fillRect(0,0,c.width,c.height);
 for(let i=0;i<n;i++){const a=arms[i]||arms[arms.length-1],w=wps[i]||'';g.save();g.translate(cw*i+cw*.45,ch-14);g.scale(sc*1.25,sc*1.25);try{drawHero(g,{arm:a,wp:w||null,col:0,t:t+i*.37})}catch(e){g.restore();g.fillStyle='red';g.fillText(String(e),cw*i+4,20);continue}g.restore();
  g.fillStyle='#fff';g.font='13px sans-serif';g.fillText(a+' / '+w,cw*i+6,16);
  if(w){g.save();g.translate(cw*i+cw*.12,ch+Math.round(80*sc));g.rotate(-.35);g.scale(sc*1.25,sc*1.25);try{drawW(g,w,70,t+i)}catch(e){}g.restore()}}
 return c.toDataURL('image/png')}""",[arms,wps,t,sc])
        import base64;open(out,'wb').write(base64.b64decode(url.split(',')[1]))
        print('errs',errs);await b.close()
asyncio.run(main())
