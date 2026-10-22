from h import *
async def main():
  async with async_playwright() as p:
    g=await openp(p);E=g.E;pg=g.pg
    r=await E("""()=>{RS_ASK=false;delete P.fish;save();title();fsP().tut=1;fishing();fsPond();const F=fsP();const cap=fsCreelCap();
      const com=FIDS.find(i=>FISH[i].r==='c');F.cr=[];for(let i=0;i<cap;i++)F.cr.push({id:com,cm:10,g:0,ft:0,kp:1,t:1});
      let c;for(let i=0;i<50000;i++){c=fsRoll();if(c.rk==='r')break}FS.pend=c;FS.st='reveal';const why=fsKeepWhy(c),dk=fsDefKeep(c);fsLeave();return [cap,why,dk,F.cr.length,S.view]}""")
    pr('creel cap, keepWhy, defKeep, creel after leave, view:',r)
    pr(g.er[:5]);await g.b.close()
asyncio.run(main())
