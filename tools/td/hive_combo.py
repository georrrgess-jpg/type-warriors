# python3 tools/td/hive_combo.py combos.json [workers] [out.json] : like endless_combo.py, but every combo names its map
# ({'name','map','opt'}); the bot from t_ramparts builds in a repeating tower order on the best-covering pads, upgrades the lowest tier
# and uses abilities until the map is won or lost (or opt.maxW waves). Prints the wave reached, stars and the towers.
# TW_HTML=/path/to/a/copy/of/out.html plays a frozen copy (so the build can change while a long batch runs).
import asyncio,json,os,sys,time
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));SRC=os.environ.get('TW_HTML') or os.path.join(HERE,'../../type-warriors-source/out.html')
BOT=open(os.path.join(HERE,'../../type-warriors-source/t_ramparts.py')).read().split('BOT=r"""',1)[1].split('"""',1)[0].replace("p.tw.type.slice(0,2)","p.tw.type.slice(0,3)")
SETUP="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.dragon=1;r.new99j=1;r.stars={moss:3,frost:3,ember:3};for(const k in r.tut)r.tut[k]=1;for(const k of['build','wave','coins','upgrade','abil','rune','twist_frost','twist_ember','twist_wonder'])r.tut[k]=1;save()}"
async def run(br,combo,res):
    pg=await br.new_page(viewport={'width':800,'height':450})
    await pg.goto('file://'+os.path.abspath(SRC),timeout=240000);await pg.wait_for_timeout(1200)
    await pg.evaluate(SETUP);await pg.evaluate("()=>{"+BOT+"}")
    t0=time.time()
    r=await pg.evaluate("(c)=>{const r=rpBot(c.map||'wonder',c.opt);r.hv=[RPX&&RPX.hvStings,RPX&&RPX.hvBurstN];try{rpLeave()}catch(e){}return r}",combo)
    r['name']=combo['name'];r['secs']=round(time.time()-t0);res.append(r)
    print(f"{combo['name']:<34} {r['id']:<7} wave {r['wave']:>3} won {int(r['won'])} stars {r['stars']} hp {r['hp']:>2} kills {r['kills']:>5}  {r['towers'][:80]}  ({r['secs']}s)",flush=True)
    await pg.close()
async def main():
    combos=json.load(open(sys.argv[1]));W=int(sys.argv[2]) if len(sys.argv)>2 else 4;out=sys.argv[3] if len(sys.argv)>3 else os.path.join(HERE,'hive_results.json');res=[]
    async with async_playwright() as p:
        br=await p.chromium.launch();sem=asyncio.Semaphore(W)
        async def one(c):
            async with sem:
                try:await asyncio.wait_for(run(br,c,res),3600)
                except Exception as e:print('ERR',c['name'],repr(e)[:200],flush=True)
        await asyncio.gather(*[one(c) for c in combos]);await br.close()
    old=json.load(open(out)) if os.path.exists(out) else []
    json.dump(old+res,open(out,'w'),indent=1)
asyncio.run(main())
