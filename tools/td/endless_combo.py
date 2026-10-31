# python3 tools/td/endless_combo.py [combos.json] [workers] : plays the endless Wonderland with the bot from t_ramparts (build in a
# repeating tower order on the best-covering pads, upgrade the lowest tier, use abilities) for each tower combination until the
# castle falls, and prints the wave reached. Results go to tools/td/endless_results.json.
import asyncio,json,os,sys,time
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));SRC=os.path.join(HERE,'../../type-warriors-source/out.html')
sys.path.insert(0,os.path.join(HERE,'../../type-warriors-source'))
BOT=open(os.path.join(HERE,'../../type-warriors-source/t_ramparts.py')).read().split('BOT=r"""',1)[1].split('"""',1)[0].replace("p.tw.type.slice(0,2)","p.tw.type.slice(0,3)")
SETUP="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.dragon=1;r.new99j=1;r.stars={moss:3,frost:3,ember:3};for(const k in r.tut)r.tut[k]=1;for(const k of['build','wave','coins','upgrade','abil','rune','twist_frost','twist_ember','twist_wonder'])r.tut[k]=1;save()}"
async def run(br,combo,res):
    pg=await br.new_page(viewport={'width':800,'height':450})
    await pg.goto('file://'+os.path.abspath(SRC));await pg.wait_for_timeout(1200)
    await pg.evaluate(SETUP);await pg.evaluate("()=>{"+BOT+"}")
    t0=time.time()
    r=await pg.evaluate("(c)=>{const r=rpBot('wonder',c.opt);try{rpLeave()}catch(e){}return r}",combo)
    r['name']=combo['name'];r['secs']=round(time.time()-t0);res.append(r)
    print(f"{combo['name']:<34} wave {r['wave']:>3}  kills {r['kills']:>5}  towers {r['towers']}  ({r['secs']}s)",flush=True)
    await pg.close()
async def main():
    combos=json.load(open(sys.argv[1])) if len(sys.argv)>1 else [{'name':'default mix','opt':{'up':1}}]
    W=int(sys.argv[2]) if len(sys.argv)>2 else 4;res=[]
    async with async_playwright() as p:
        br=await p.chromium.launch();sem=asyncio.Semaphore(W)
        async def one(c):
            async with sem:
                try:await run(br,c,res)
                except Exception as e:print('ERR',c['name'],str(e)[:200],flush=True)
        await asyncio.gather(*[one(c) for c in combos]);await br.close()
    out=os.path.join(HERE,'endless_results.json');old=json.load(open(out)) if os.path.exists(out) else []
    json.dump(old+res,open(out,'w'),indent=1)
asyncio.run(main())
