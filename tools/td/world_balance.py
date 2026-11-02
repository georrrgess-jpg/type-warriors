# python3 tools/td/world_balance.py [maps...] : plays every campaign map of the new worlds with the t_ramparts bot (upgrades up to the
# map's own tier cap) and a few builds, printing won / health / stars / wave. Used to tune 98a's difficulty numbers.
import asyncio,os,sys,json,time
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));SRC=os.path.abspath(os.path.join(HERE,'../../type-warriors-source/out.html'))
BOT=open(os.path.join(HERE,'../../type-warriors-source/t_ramparts.py')).read().split('BOT=r"""',1)[1].split('"""',1)[0]
BOT=BOT.replace("const top=RP_MAXT(R.map)","const top=R.map.maxT||RP_MAXT(R.map)").replace("p.tw.type.slice(0,2)","p.tw.type.slice(0,3)")
SETUP="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.dragon=1;r.new99j=1;r.stars={moss:3,frost:3,ember:3,coral:3,wreck:3,abyss:3,meadow:3,foundry:3};for(const k in r.tut)r.tut[k]=1;save()}"
BUILDS={'strong':{'up':1,'order':['prism','dragon','frost','tide','still']},'mixed':{'up':1,'order':['ballista','brazier','frost','bell','prism']},'lazy':{'up':0,'noAbil':1,'order':['ballista']}}
async def run(br,m,bn,res):
    pg=await br.new_page(viewport={'width':800,'height':450});await pg.goto('file://'+SRC);await pg.wait_for_timeout(1200)
    await pg.evaluate(SETUP);await pg.evaluate("()=>{"+BOT+"}")
    t0=time.time();r=await pg.evaluate("([m,o])=>{const r=rpBot(m,o);try{rpLeave()}catch(e){}return r}",[m,BUILDS[bn]])
    r['build']=bn;r['secs']=round(time.time()-t0);res.append(r)
    print(f"{m:<8} {bn:<7} won {str(r['won']):<5} hp {r['hp']:>2} stars {r['stars']} wave {r['wave']:>2} leaked {r['leaked']:>3} towers {r['towers']} ({r['secs']}s)",flush=True);await pg.close()
async def main():
    maps=sys.argv[1:] or ['coral','wreck','abyss','meadow','foundry','storm'];res=[]
    async with async_playwright() as p:
        br=await p.chromium.launch();sem=asyncio.Semaphore(int(os.environ.get("BALN","3")))
        async def one(m,bn):
            async with sem:
                try:await run(br,m,bn,res)
                except Exception as e:print('ERR',m,bn,str(e)[:200],flush=True)
        await asyncio.gather(*[one(m,bn) for m in maps for bn in BUILDS]);await br.close()
asyncio.run(main())
