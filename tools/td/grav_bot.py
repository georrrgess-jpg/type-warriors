# python3 tools/td/grav_bot.py combos.json [workers] [out.json] : the endless_combo bot (from t_ramparts) on any map.
# combos: [{"name":..., "map":"moss"|"ember"|"wonder"|..., "opt":{"order":[...],"up":1,"maxW":N}}]. Prints wave/won/hp per combo.
import asyncio,json,os,sys,time
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));SRC=os.environ.get('TW_GAME') or os.path.join(HERE,'../../type-warriors-source/out.html')
BOT=open(os.path.join(HERE,'../../type-warriors-source/t_ramparts.py')).read().split('BOT=r"""',1)[1].split('"""',1)[0].replace("p.tw.type.slice(0,2)","p.tw.type.slice(0,3)")
BOT=BOT.replace("abil:R.abil}","abil:R.abil,gvN:R.gvN||0,gvFin:R.gvFin||0,gvNova:R.gvNovaN||0,gvDmg:Math.round(R.pads.filter(p=>p.tw&&p.tw.type==='grav').reduce((a,p)=>a+p.tw.dmg,0)),allDmg:Math.round(R.pads.filter(p=>p.tw).reduce((a,p)=>a+p.tw.dmg,0))}")
SETUP="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.dragon=1;r.new99j=1;r.stars={moss:3,frost:3,ember:3,coral:3,wreck:3,abyss:3,meadow:3,foundry:3};for(const k in r.tut)r.tut[k]=1;for(const k of['build','wave','coins','upgrade','abil','rune','twist_frost','twist_ember','twist_wonder'])r.tut[k]=1;save()}"
async def run(br,combo,res):
    pg=await br.new_page(viewport={'width':800,'height':450});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:200]))
    await pg.goto('file://'+os.path.abspath(SRC));await pg.wait_for_timeout(1200)
    await pg.evaluate(SETUP);await pg.evaluate("()=>{"+BOT+"}")
    t0=time.time()
    r=await pg.evaluate("(c)=>{const r=rpBot(c.map||'wonder',c.opt);try{rpLeave()}catch(e){}return r}",combo)
    r['name']=combo['name'];r['map']=combo.get('map','wonder');r['secs']=round(time.time()-t0);r['errors']=er[:3];res.append(r)
    sh=f" gv:{r['gvN']} wells {r['gvDmg']}/{r['allDmg']} dmg fin {r['gvFin']} nova {r['gvNova']}"
    print(f"{r['map']:<7}{combo['name']:<30} wave {r['wave']:>3} won {int(r['won'])} hp {r['hp']:>2} stars {r['stars']} leaked {r['leaked']:>3}{sh}  [{r['towers']}] ({r['secs']}s){' ERR '+str(er[:1]) if er else ''}",flush=True)
    await pg.close()
async def main():
    combos=json.load(open(sys.argv[1]));W=int(sys.argv[2]) if len(sys.argv)>2 else 3;out=sys.argv[3] if len(sys.argv)>3 else os.path.join(HERE,'grav_results.json');res=[]
    async with async_playwright() as p:
        br=await p.chromium.launch();sem=asyncio.Semaphore(W)
        async def one(c):
            async with sem:
                try:await run(br,c,res)
                except Exception as e:print('ERR',c['name'],str(e)[:200],flush=True)
        await asyncio.gather(*[one(c) for c in combos]);await br.close()
    old=json.load(open(out)) if os.path.exists(out) else []
    json.dump(old+res,open(out,'w'),indent=1)
asyncio.run(main())
