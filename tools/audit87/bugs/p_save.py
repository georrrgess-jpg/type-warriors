from h import *
AUTO=open(os.path.join(SP,'auto.js')).read()
DIFF="""(a)=>{const b=JSON.parse(JSON.stringify(P));const out=[];const walk=(x,y,p)=>{if(out.length>40)return;if(typeof x!==typeof y||Array.isArray(x)!==Array.isArray(y)){out.push(p+': '+JSON.stringify(x).slice(0,60)+' -> '+JSON.stringify(y).slice(0,60));return}
 if(x&&typeof x==='object'){const ks=new Set([...Object.keys(x),...Object.keys(y)]);for(const k of ks)walk(x[k],y[k],p+'.'+k)}else if(x!==y)out.push(p+': '+JSON.stringify(x)+' -> '+JSON.stringify(y))};walk(a,b,'P');return out}"""
NULLS="""()=>{const f=fresh(),out=[];const walk=(x,y,p)=>{if(out.length>40)return;if(x&&typeof x==='object'&&y&&typeof y==='object'){for(const k of Object.keys(x))walk(x[k],y[k],p+'.'+k)}else if(typeof x==='number'&&(y===null||typeof y!=='number'||!isFinite(y)))out.push(p+'='+JSON.stringify(y))};walk(f,P,'P');
 const nan=[];const w2=(y,p)=>{if(nan.length>40)return;if(y&&typeof y==='object')for(const k of Object.keys(y))w2(y[k],p+'.'+k);else if(typeof y==='number'&&!isFinite(y))nan.push(p)};w2(P,'P');return [out,nan]}"""
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    await E("()=>{RS_ASK=false;P.gold=5000;P.petSt=2;P.pets={bramble:{b:0}};P.pet='bramble';petNorm();save();title()}")
    await E("()=>{"+AUTO+"}")
    await E("()=>start(1)");r=await E("()=>__auto(4000,{stopOver:1})");await pg.wait_for_timeout(2500)
    await E("()=>{title();wrStart('mill');WRX.spawnT=999;WRX.hazT=999;WRX.x=WRX.rt.len-5;for(let i=0;i<900&&!WRX.over;i++)wrUpdate(1/60)}");await pg.wait_for_timeout(1500)
    await E("()=>{title();waStart(0);waFinish(true)}");await pg.wait_for_timeout(1500)
    await E("()=>{title();fishing();fsPond();if(FS.tut)fsTutClose();}");await pg.wait_for_timeout(500)
    await E("()=>{const c=fsRoll();c.info=fsRecord(c,3,10);fsKeep(c);fsStop();title()}");await pg.wait_for_timeout(400)
    await E("()=>{title();save()}");await pg.wait_for_timeout(800)
    pr('nulls before reload',await E(NULLS))
    snap=await E("()=>JSON.parse(JSON.stringify(P))")
    await pg.reload();await pg.wait_for_timeout(1800)
    pr('diff after reload',await E(DIFF,snap))
    pr('nulls after reload',await E(NULLS))
    # second reload stability
    snap2=await E("()=>JSON.parse(JSON.stringify(P))");await pg.reload();await pg.wait_for_timeout(1800)
    pr('diff 2nd reload',await E(DIFF,snap2))
    pr(g.er[:10]);await g.b.close()
asyncio.run(main())
