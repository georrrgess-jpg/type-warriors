#!/usr/bin/env python3
"""Contact sheet of art() thumbnails for the harvest gear at the sizes the menus use. python3 thumbs.py OUT.png"""
import asyncio,sys,os,base64
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
HTML=os.environ.get('TW_HTML') or os.path.join(HERE,'..','..','type-warriors-source','out.html')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900})
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:300]))
        await pg.goto('file://'+os.path.abspath(HTML));await pg.wait_for_function("()=>typeof title==='function'&&typeof P==='object'");await pg.wait_for_timeout(500)
        url=await pg.evaluate("""()=>{const ids=FL.gear.a.map(i=>['a',i]).concat(FL.gear.w.map(i=>['w',i])),S0=[[236,150],[150,186],[200,250],[68,84]];
 const cw=S0.reduce((a,s)=>a+s[0]+10,10),ch=260,c=document.createElement('canvas');c.width=cw*2;c.height=ch*6;const g=c.getContext('2d');g.fillStyle='#1a1430';g.fillRect(0,0,c.width,c.height);
 ids.forEach(([k,id],n)=>{let x=10+(n%2)*cw,y=10+Math.floor(n/2)*ch;for(const [w,h] of S0){const t=document.createElement('canvas');t.width=w;t.height=h;art(t,k,id,1.2);g.fillStyle='#2a2448';g.fillRect(x,y,w,h);g.drawImage(t,x,y);x+=w+10}});
 return c.toDataURL()}""")
        open(sys.argv[1],'wb').write(base64.b64decode(url.split(',')[1]));print('errs',errs);await b.close()
asyncio.run(main())
