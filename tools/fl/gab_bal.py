#!/usr/bin/env python3
"""Bountiful Harvest vs Soul Harvest: a typing bot plays Endless with real HP and the same gear stats, only the ability differs.

    python3 gab_bal.py                 # 3 seeds x 2 speeds x 5 setups, 10 game-minutes cap (a few minutes, run it in the background)
    python3 gab_bal.py --quick         # 1 seed, 45 WPM, 4 minutes
    python3 gab_bal.py --seeds 5 --cap 12 --wpm 45,70
    python3 gab_bal.py --wpm 35 --out a.json &  python3 gab_bal.py --wpm 50 --out b.json   # two at once, then
    python3 gab_bal.py --table a.json b.json

Setups: none (no ability), soul1 / soul2 (Soul Harvest, one piece / the set), bounty1 / bounty2 (Bountiful Harvest).
Every setup wears Feastlord's Aegis and the Horn of Plenty for the stats; the ability counters (S.hvN, S.fbN) are then set by hand,
so the comparison measures the ability alone. The bot (as tools/econ/combat_rates.js) types the nearest word at the given speed
with an error rate and a 0.35 s reaction to each new monster; Math.random is seeded so a run repeats exactly.
Reported per setup (mean over seeds): game minutes survived, wave reached, score per minute, hits taken per minute,
activations per minute and monsters cleared per activation. Output: a table on stdout and out/gab_bal.json."""
import argparse, asyncio, json, os, statistics
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.environ.get('TW_HTML') or os.path.join(HERE, '..', '..', 'type-warriors-source', 'out.html')
JS = r"""
async(cfg)=>{
{let a=(cfg.seed|0)||1;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
try{RS_ASK=false}catch(e){}
P.xp=lvx(20);for(const a of ACH)P.ach[a.id]=1;for(const id in MON)P.bs[id]=100000;P.pres=0;P.upg={};
P.ownA.flfeast=1;P.own.fl_horn=1;P.armor='flfeast';setWeapon('fl_horn');
start(0);
const ab=cfg.ab;S.hvN=0;S.pkc=false;S.fbN=0;if(ab==='soul1')S.hvN=1;if(ab==='soul2')S.hvN=2;if(ab==='bounty1')S.fbN=1;if(ab==='bounty2')S.fbN=2;
let acts=0,cleared=0,kAct=0,hits=0;const k0=S.kills;

const cps=cfg.wpm*5/60;let bud=0,wait=0,steps=0,seen=new WeakSet();const maxT=cfg.cap*3600;
let dmgEv=0;{const d0=dmg;dmg=function(d){const before=S.hp+S.shield;const r=d0.apply(this,arguments);if(S.hp+S.shield<before)dmgEv++;return r}}
while(steps<maxT){
 if(S.mode==='over')break;
 if(S.mode==='boon'&&S.swap){const b=$('bsk');if(b)b.click();steps++;continue}
 if(S.mode==='boon'){try{pickBoon(0)}catch(e){const b=ov.querySelector('button');if(b)b.click()}steps++;continue}
 if(S.mode!=='play'){const b=ov.querySelector('.bc,button');if(b)b.click();update(1/60);steps++;continue}
 if(S.cine){key('a');update(1/60);steps++;continue}
 const enBefore=S.en.length,tollBefore=!!S.toll,fbBefore=!!S.fbB;
 bud+=cps/60;if(wait>0)wait-=1/60;
 if(S.en.some(e=>e.vul>0))key(' ');
 while(bud>=1&&wait<=0&&S.mode==='play'){let t=S.tgt;if(t&&(!S.en.includes(t)||t.vul>0))t=null;
  if(!t||t.i===0){let b=null;for(const e of S.en)if(e.x<W-10&&!(e.vul>0)&&(!b||e.x<b.x))b=e;if(!b)break;if(!seen.has(b)){seen.add(b);wait=cfg.react;break}t=b}
  let c=t.w[t.i];if(Math.random()>cfg.acc&&c!==' ')c=c==='q'?'z':'q';key(c);bud-=1}
 update(1/60);steps++;
 if(!tollBefore&&S.toll){acts++}
 if(!fbBefore&&S.fbB){acts++}
}
const mins=steps/3600;
return {ab,seed:cfg.seed,wpm:cfg.wpm,mins:+mins.toFixed(2),end:S.mode,wave:S.wave,score:S.score,spm:Math.round(S.score/Math.max(.01,mins)),hits:dmgEv,hpm:+(dmgEv/Math.max(.01,mins)).toFixed(2),
 acts,apm:+(acts/Math.max(.01,mins)).toFixed(2),kills:S.kills-k0,fbK:S.fbK||0,cpa:acts?+(((S.fbK||0)||0)/acts).toFixed(2):0}
}
"""
SETUPS = ['none', 'soul1', 'bounty1', 'soul2', 'bounty2']


def mean(xs):
    xs = [x for x in xs if x is not None]
    return round(statistics.mean(xs), 2) if xs else None


async def run_one(b, cfg):
    pg = await b.new_page(viewport={'width': 1600, 'height': 900})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    await pg.goto('file://' + os.path.abspath(HTML), wait_until='load', timeout=120000)
    await pg.wait_for_function("()=>typeof title==='function'&&typeof P==='object'", timeout=60000)
    await pg.wait_for_timeout(300)
    r = await pg.evaluate(JS, cfg)
    r['errs'] = errs[:3]
    await pg.close()
    return r


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--quick', action='store_true')
    ap.add_argument('--seeds', type=int, default=3)
    ap.add_argument('--cap', type=float, default=10)
    ap.add_argument('--wpm', default='45,70')
    ap.add_argument('--acc', type=float, default=.94)
    ap.add_argument('--out', default='gab_bal.json')
    ap.add_argument('--table', nargs='*')
    a = ap.parse_args()
    if a.table:
        res = [r for f in a.table for r in json.load(open(f if os.path.isabs(f) else os.path.join(HERE, 'out', f)))]
        table(res, sorted({r['wpm'] for r in res}))
        return
    seeds = 1 if a.quick else a.seeds
    cap = 4 if a.quick else a.cap
    wpms = [45] if a.quick else [int(x) for x in a.wpm.split(',')]
    res = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for wpm in wpms:
            for ab in SETUPS:
                for s in range(1, seeds + 1):
                    r = await run_one(b, {'ab': ab, 'seed': s * 7 + 1, 'wpm': wpm, 'acc': a.acc, 'react': .35, 'cap': cap})
                    res.append(r)
                    print(json.dumps(r), flush=True)
        await b.close()
    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    json.dump(res, open(os.path.join(HERE, 'out', a.out), 'w'), indent=1)
    table(res, wpms)


def table(res, wpms):
    print('\n| WPM | setup | minutes survived | wave | score/min | hits/min | activations/min | cleared/activation |')
    print('|---|---|---|---|---|---|---|---|')
    for wpm in wpms:
        for ab in SETUPS:
            R = [r for r in res if r['wpm'] == wpm and r['ab'] == ab]
            print(f"| {wpm} | {ab} | {mean([r['mins'] for r in R])} | {mean([r['wave'] for r in R])} | {mean([r['spm'] for r in R])} | {mean([r['hpm'] for r in R])} | {mean([r['apm'] for r in R])} | {mean([r['cpa'] for r in R]) if ab.startswith('bounty') else '-'} |")

asyncio.run(main())
