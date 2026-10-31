# python3 tools/td/endless_shot.py [stopWave] : plays the endless Wonderland with the best build found by endless_combo.py
# (Prism, Dragon Roost, Frost Spire, Tidecaller, Alchemist's Still) and screenshots the battle in the middle of a late wave.
import asyncio,os,sys
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));SRC=os.path.abspath(os.path.join(HERE,'../../type-warriors-source/out.html'))
OUT=os.path.abspath(os.path.join(HERE,'../../type-warriors-source/shots/endless_best'))+'/'
STOP=int(sys.argv[1]) if len(sys.argv)>1 else 100
BOT=open(os.path.join(HERE,'../../type-warriors-source/t_ramparts.py')).read().split('BOT=r"""',1)[1].split('"""',1)[0]
BOT=BOT.replace("while(!R.over&&steps<30*60*90){steps++;","while(!R.over&&steps<30*60*90){steps++;if(opt.stopAt&&R.wave>=opt.stopAt&&R.wst==='run'&&R.foes.filter(e=>!e.dead&&e.s>0).length>=opt.foes)return{stopped:1,wave:R.wave,towers:R.pads.filter(p=>p.tw).map(p=>p.tw.type+p.tw.tier).join(' '),hp:R.hp};")
SETUP="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.dragon=1;r.new99j=1;r.stars={moss:3,frost:3,ember:3};for(const k in r.tut)r.tut[k]=1;for(const k of['build','wave','coins','upgrade','abil','rune','twist_frost','twist_ember','twist_wonder'])r.tut[k]=1;save()}"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page(viewport={'width':1600,'height':900});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
        await pg.goto('file://'+SRC);await pg.wait_for_timeout(1500);await pg.evaluate(SETUP);await pg.evaluate("()=>{"+BOT+"}")
        r=await pg.evaluate("(s)=>rpBot('wonder',{up:1,order:['prism','dragon','frost','tide','still'],stopAt:s,foes:25})",STOP);print(r,flush=True)
        await pg.evaluate("()=>{const R=RPX;R.spd=1;R.sel=null;const t=document.getElementById('rptut');if(t)t.hidden=true}")
        for i,ms in enumerate([1600,1400,1400]):
            await pg.wait_for_timeout(ms);await pg.screenshot(path=OUT+f'wave{STOP}_{i+1}.png')
        print(await pg.evaluate("()=>[RPX.wave,RPX.hp,RPX.over]"),er[:3]);await b.close()
asyncio.run(main())
