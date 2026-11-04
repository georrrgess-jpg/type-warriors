# python3 tools/td/rpu_audit.py [OUTDIR] [WxH ...] : tower-defense UI audit (10.1, tdui). Screenshots every TD screen (hub on all three
# worlds locked / open, every map's battle HUD, the build ring on pads near each edge, the info panel for every tower and tier, pause,
# settings, results, Tower Skins, How to Play) and runs the overlap / clipping / off-stage check (rpu_ovl.js) on each.
import asyncio,os,sys,json
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'..','..','type-warriors-source');H='file://'+os.path.abspath(os.path.join(SRC,'out.html'))
OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(SRC,'shots','w101_tdui','audit')
VPS=[tuple(map(int,a.split('x'))) for a in sys.argv[2:]] or [(1600,900)]
OVL=open(os.path.join(HERE,'rpu_ovl.js')).read()
# RPQ_DUMMY=1: two temporary towers (rpq_dummy.js) so every screen is checked with 14 towers (10.2)
DUMMY=open(os.path.join(HERE,'rpq_dummy.js')).read() if os.environ.get('RPQ_DUMMY') else ''
SETUP="()=>{RS_ASK=false;WCRELAYS=[];ST.perfAsked=1;try{PFW.asked=true}catch(e){}const r=RPP();r.new99j=1;r.dragon=1;r.stars=%s;for(const k in r.tut)r.tut[k]=1;save()}"
ALL="{moss:3,frost:3,ember:3,coral:3,wreck:2,abyss:3,meadow:1,foundry:3,storm:2,wonder:0}"
SOME="{moss:3,frost:2,ember:1}"
MAPS=['moss','frost','ember','wonder','coral','wreck','abyss','meadow','foundry','storm']
async def main():
    os.makedirs(OUT,exist_ok=True);tot={}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vw,vh in VPS:
            pg=await b.new_page(viewport={'width':vw,'height':vh});er=[];pg.on('pageerror',lambda e:er.append(str(e)[:300]));E=pg.evaluate
            await pg.goto(H);await pg.wait_for_timeout(1500);await E(SETUP%ALL);await E(OVL)
            if DUMMY:await E('()=>{'+DUMMY+'}')
            tag=f'{vw}x{vh}'
            async def snap(name,root="document.getElementById('ov')",wait=500):
                await pg.wait_for_timeout(wait);await pg.screenshot(path=os.path.join(OUT,f'{tag}_{name}.png'))
                r=await E(f"()=>__rpuOvl({root})");tot[f'{tag}_{name}']=r
                if r:print(tag,name,len(r),r[:8],flush=True)
            # hub, all three worlds open, then a fresh save (worlds 2 and 3 locked)
            for w,m in [(1,'moss'),(1,'wonder'),(2,'coral'),(2,'abyss'),(3,'meadow'),(3,'storm')]:
                await E(f"()=>{{RPSEL='{m}';RPW_FORCE={w};rampartsMenu(title)}}");await snap(f'hub{w}_{m}','ov',900)
            await E(SETUP%SOME)
            for w in (2,3):
                await E(f"()=>{{RPW_FORCE={w};rampartsMenu(title)}}");await snap(f'hub{w}_locked',"ov.querySelector('.rpwlk')",900)
            await E("()=>{rpHowTo()}");await snap('hub3_locked_howto',"document.getElementById('rpmod')")
            r=await E("()=>{const m=document.getElementById('rpmod');const q=m.querySelector('.rpmc2').getBoundingClientRect();const e=document.elementFromPoint(q.left+q.width/2,q.top+40);m.hidden=true;return !!(e&&m.contains(e))}")
            if not r:print(tag,'HOWTO UNDER LOCKED CARD');tot[tag+'_howto_z']=['modal under the locked card']
            await E(SETUP%"{}")
            await E("()=>{RPSEL='moss';RPW_FORCE=1;rampartsMenu(title)}");await snap('hub1_fresh','ov',900)
            await E(SETUP%ALL)
            await E("()=>{rampartsMenu(title);rpHowTo()}");await snap('howto',"document.getElementById('rpmod')")
            await E("()=>{const m=document.getElementById('rpmod');const s=m&&m.querySelector('.rpmc2');if(s)s.scrollTop=1e5}");await snap('howto_end',"document.getElementById('rpmod')")
            await E("()=>{rpSkins()}");await snap('skins')
            for t in ['ballista','dragon','hive','grav','star']:
                await E(f"()=>{{const c=[...document.querySelectorAll('#ov [data-tw=\"{t}\"],#ov .rpycard[data-t=\"{t}\"]')][0];if(c)c.click()}}");await snap(f'skins_{t}',wait=400)
            # battles
            for m in MAPS:
                await E(f"()=>{{rpStart('{m}');const R=RPX;R.tut=null;R.supply=99999}}");await pg.wait_for_timeout(700)
                await snap(f'bat_{m}_build',"document.getElementById('rphud')")
                await E("()=>{const R=RPX;rpWaveStart();for(let i=0;i<150;i++)rpStep(R,1/30)}");await snap(f'bat_{m}_run',"document.getElementById('rphud')")
                # ring on the pads nearest each edge
                pads=await E("()=>{const P=RPX.pads;const pick=f=>P.reduce((a,b)=>f(b)<f(a)?b:a);return [...new Set([pick(p=>p.x),pick(p=>-p.x),pick(p=>p.y),pick(p=>-p.y)].map(p=>p.i))]}")
                await pg.mouse.move(2,450)
                for k,i in enumerate(pads):
                    await E(f"()=>{{const R=RPX;R.sel=null;const p=R.pads[{i}];if(p.tw){{rpSell(p.tw)}}R.selPad=p}}");await pg.wait_for_timeout(350)
                    r=await E("()=>{const s=document.getElementById('stage')||document.getElementById('wrap');const W=document.getElementById('wrap').getBoundingClientRect();return [...document.querySelectorAll('#rpring .rprb')].map(b=>{const q=b.getBoundingClientRect();return [q.left<W.left-1||q.right>W.right+1||q.top<W.top-1||q.bottom>W.bottom+1]}).filter(x=>x[0]).length}")
                    await snap(f'bat_{m}_ring{k}',"document.getElementById('rpring')",900)
                    if r:print(tag,m,'ring',k,'OFFSTAGE buttons',r)
                await E("()=>{RPX.selPad=null}")
                if m in ('moss','coral','meadow'):
                    await E("()=>{const R=RPX;R.supply=1e5;for(const p of R.pads.slice(0,6)){if(!p.tw){rpBuild(p,'brazier');p.tw.build=1}}for(let i=0;i<14;i++){const e=rpSpawn(R.map.endless?'scamp':Object.keys(RP_FOE).find(k=>!RP_FOE[k].boss&&!RP_FOE[k].air)||'scamp');if(e)rpKillFoe(e,null)}}");await snap(f'bat_{m}_combo',"document.getElementById('rphud')",300)
                    await E("()=>{const R=RPX;R.foes=[];R.q=[];R.wst='run';rpWaveDone()}");await snap(f'bat_{m}_fanfare',"document.getElementById('rphud')",600)
                    await E("()=>{document.querySelector('.rpsort')&&document.querySelector('.rpsort').click()}");await snap(f'bat_{m}_sort',"document.getElementById('rphud')",300)
                    await E("()=>{document.querySelector('.rpsort')&&document.querySelector('.rpsort').click();const b=document.querySelector('.rpcard[data-tw=\"grav\"]');b&&b.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}))}");await pg.hover('.rpcard[data-tw="grav"]');await snap(f'bat_{m}_cardtip',"document.querySelector('.rpcard[data-tw=\"grav\"] .rptip')",300)
                    await pg.hover('.rpab[data-ab="slow"]');await snap(f'bat_{m}_abtip',"document.querySelector('.rpab[data-ab=\"slow\"] .rptip')",300);await pg.mouse.move(800,450)
                if m=='storm':
                    await E("()=>{const R=RPX;R.wave=R.map.waves-1;R.wst='build';R.foes=[];R.q=[];rpWaveStart();for(let i=0;i<120;i++)rpStep(R,1/30)}");await snap(f'bat_{m}_boss',"document.getElementById('rphud')")
                await E("()=>rpLeave()")
            # Rune Typing on (words over the abilities), on a World 3 map with the full bar
            await E("()=>{rptySet(1);rpStart('foundry');RPX.tut=null;RPX.supply=99999}");await snap('bat_foundry_runetyping',"document.getElementById('rphud')",700)
            await E("()=>{rpLeave();rptySet(0)}")
            # info panel for every tower at every tier (World 3 map: tier V)
            for m,top in [('moss',3),('meadow',5)]:
                await E(f"()=>{{rpStart('{m}');const R=RPX;R.tut=null;R.supply=1e7}}");await pg.wait_for_timeout(500)
                tws=await E("()=>RP_TWORDER.slice()")
                pads=await E("()=>{const P=RPX.pads;const pick=f=>P.reduce((a,b)=>f(b)<f(a)?b:a);return [pick(p=>p.x).i,pick(p=>-p.x).i,pick(p=>p.y).i,pick(p=>-p.y).i]}")
                for j,t in enumerate(tws):
                    pi=pads[j%4]
                    await E(f"()=>{{const R=RPX;const p=R.pads[{pi}];if(p.tw)rpSell(p.tw);R.supply=1e7;rpBuild(p,'{t}');p.tw.build=1;R.sel=p.tw}}")
                    for tier in range(1,top+1):
                        if tier>1:await E("()=>{const R=RPX;R.supply=1e7;R.sel.upK=1;rpUpgrade(R.sel);R.sel.up=0;R.sel.upK=1;R.sel=R.sel}")
                        if tier in (1,top) or t in ('hive','grav'):
                            await snap(f'info_{m}_{t}_{tier}',"document.getElementById('rpinfo')",250)
                await E("()=>rpLeave()")
            # pause and settings
            await E("()=>{rpStart('coral');RPX.tut=null;rpPause(true)}");await snap('pause','ov')
            await E("()=>{rpPause(false);rpLeave();rampartsMenu(title);rpSettings()}");await snap('settings',"document.getElementById('rpmod')")
            await E("()=>{const m=document.getElementById('rpmod');if(m)m.hidden=true}")
            # results: win (new world), lose, endless
            await E(SETUP%"{moss:3,frost:3}")
            await E("()=>{rpStart('ember');const R=RPX;R.tut=null;R.wave=R.map.waves;R.wst='run';R.foes=[];R.q=[];R.hp=17;rpVictory()}");await snap('victory_card','ov',2900)
            await E("()=>rpFinish(true)");await snap('res_win_newworld','ov',2600)
            await E(SETUP%ALL)
            await E("()=>{rpStart('coral');const R=RPX;R.tut=null;R.wave=4;R.wst='run';R.hp=0;rpDefeat()}");await snap('res_lose','ov',2600)
            await E("()=>{rpStart('wonder');const R=RPX;R.tut=null;R.wave=23;R.wst='run';R.hp=0;rpDefeat()}");await snap('res_endless','ov',2600)
            await E("()=>{rpStart('storm');const R=RPX;R.tut=null;R.supply=1e5;for(const p of R.pads.slice(0,3)){rpBuild(p,'grav');p.tw.build=1}R.wave=R.map.waves;R.wst='run';R.foes=[];R.q=[];R.hp=20;rpVictory();rpFinish(true)}");await snap('res_win_storm','ov',2600)
            print(tag,'page errors',er[:3])
            await pg.close()
        await b.close()
    json.dump(tot,open(os.path.join(OUT,'ovl.json'),'w'),indent=1)
    print('TOTAL issues',sum(len(v) for v in tot.values()))
asyncio.run(main())
