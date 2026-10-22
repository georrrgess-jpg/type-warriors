#!/usr/bin/env python3
"""Motion scan (8.7 tool, plan sections 3 and 6): injects tools/ui/anim_guard.js on every swept screen and counts

    infinite        running infinite animations that animate anything but transform / opacity / offset-*
    nonCompositor   running finite animations that do the same
    transitions     running transitions on box-shadow, filter, width, height, left, top

The M6 target is 0 on every screen (the Celestial and Graveyard chest openings are excluded by the guard).
Screens come from lib.SCREENS, opened exactly as sweep.py opens them.

    python3 anim_scan.py                         # all screens, settle 1200 ms each
    python3 anim_scan.py --only group:dock,title # same --only syntax as sweep.py (quote globs)
    python3 anim_scan.py --hover                 # also hover/focus the first few controls to catch hover transitions
    python3 anim_scan.py --selftest              # prove the guard on synthetic animations (no game screens)

Writes out/anim.json (merged by screen name when --only is used) and prints a table plus the worst offenders folded by
animation name. Relative paths only; works from any cwd.
"""
import argparse
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402
from lib import SCREENS, async_playwright, newpage, open_screen, select_screens, load_json, save_json, now  # noqa: E402

with open(os.path.join(lib.HERE, 'anim_guard.js')) as _f:
    GUARD_JS = _f.read()
SAMPLE_CAP = 25   # entries kept per list per screen in the JSON (groups are always complete)

HOVER_JS = """()=>{const vok=e=>{try{return e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})}catch(_){return !!(e.offsetParent||e.getClientRects().length)}};
const c=[...document.querySelectorAll('#ov button,#ov [role=button],#ov a[href]')].filter(e=>vok(e)&&!e.closest('[inert]')&&!e.disabled);
const pick=[];const step=Math.max(1,Math.floor(c.length/6));for(let i=0;i<c.length&&pick.length<6;i+=step)pick.push(c[i]);
return pick.map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)]})}"""


def trim(res):
    r = {k: res[k] for k in ('counts', 'groups', 'info') if k in res}
    r['infinite'] = res.get('infinite', [])[:SAMPLE_CAP]
    r['nonCompositor'] = res.get('nonCompositor', [])[:SAMPLE_CAP]
    r['transitions'] = res.get('transitions', [])[:SAMPLE_CAP]
    r['info'] = {'compositorInfinite': len(res.get('info', {}).get('compositorInfinite', []))}
    return r


async def scan_screen(b, sc, settle, hover):
    pg, er = await newpage(b, seed=sc.get('seed', ''), ovl=False)
    try:
        t = await open_screen(pg, sc['js'], sc.get('pre', ''))
        await pg.wait_for_timeout(settle)
        await pg.evaluate(GUARD_JS)
        res = await pg.evaluate('()=>window.__animGuard()')
        if hover:
            for x, y in await pg.evaluate(HOVER_JS):
                await pg.mouse.move(x, y)
                await pg.wait_for_timeout(70)
                h = await pg.evaluate('()=>window.__animGuard()')
                for k in ('transitions', 'infinite', 'nonCompositor'):
                    seen = {(e['el'], e['pseudo'], e['name']) for e in res[k]}
                    for e in h[k]:
                        if (e['el'], e['pseudo'], e['name']) not in seen:
                            res[k].append(e)
                            seen.add((e['el'], e['pseudo'], e['name']))
            await pg.mouse.move(2, 2)
            c = res['counts']
            c['infinite'], c['nonCompositor'], c['transitions'] = len(res['infinite']), len(res['nonCompositor']), len(res['transitions'])
            c['bad'] = c['infinite'] + c['nonCompositor'] + c['transitions']
        out = trim(res)
        out.update(name=sc['name'], group=sc['group'], open_err=t.get('err'), errors=er[:6], date=now())
        return out
    finally:
        await pg.close()


SELFTEST_CSS = """
@keyframes st_shadow{from{box-shadow:0 0 0 #fff}to{box-shadow:0 0 20px #fff}}
@keyframes st_width{from{width:10px}to{width:40px}}
@keyframes st_move{from{transform:translateX(0)}to{transform:translateX(20px)}}
@keyframes st_fade{from{opacity:.2}to{opacity:1}}
@keyframes st_bgpos{from{background-position:0 0}to{background-position:40px 0}}
.st{position:fixed;left:10px;width:30px;height:30px;background:#444}
"""
SELFTEST_JS = """async()=>{
 const st=document.createElement('style');st.textContent=%s;document.head.appendChild(st);
 const mk=(id,css,parent)=>{const d=document.createElement('div');d.id=id;d.className='st';d.style.cssText=css;(parent||document.body).appendChild(d);return d};
 mk('st1','top:10px;animation:st_shadow 1s infinite alternate');            // infinite, box-shadow  -> infinite
 mk('st2','top:50px;animation:st_width 3s 1');                               // finite, width         -> nonCompositor
 mk('st3','top:90px;animation:st_move 1s infinite alternate');               // infinite transform    -> info only
 mk('st4','top:130px;animation:st_fade 1s infinite alternate');              // infinite opacity      -> info only
 mk('st5','top:170px;animation:st_bgpos 1s infinite linear');                // infinite bg-position  -> infinite
 const t=mk('st6','top:210px;box-shadow:0 0 0 #000;transition:box-shadow 2s');
 const box=mk('st7','top:250px;transition:filter 2s');
 const root=document.createElement('div');root.className='cxres';document.body.appendChild(root);
 mk('st8','top:290px;animation:st_shadow 1s infinite alternate',root);       // inside a protected root -> excluded
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 t.style.boxShadow='0 0 30px #fff';box.style.filter='blur(2px)';             // start two transitions
 const w=document.createElement('div');w.className='st';w.style.cssText='top:330px;transition:left 2s';document.body.appendChild(w);
 await new Promise(r=>requestAnimationFrame(r));w.style.left='200px';
 await new Promise(r=>setTimeout(r,150));
 return window.__animGuard();}""" % ("`" + SELFTEST_CSS + "`")


async def selftest():
    ok = True
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 800, 'height': 600})
        await pg.set_content('<!doctype html><body></body>')
        await pg.evaluate(GUARD_JS)
        r = await pg.evaluate(SELFTEST_JS)
        await b.close()
    c = r['counts']
    want = {'infinite': 2, 'nonCompositor': 1, 'transitions': 3, 'compositorInfinite': 2}
    for k, v in want.items():
        good = c.get(k) == v
        ok &= good
        print(f'  {k:20s} got {c.get(k)} want {v}  {"OK" if good else "BAD"}')
    names = sorted(e['el'] for e in r['infinite'])
    print('  infinite elements:', names, 'OK' if names == ['div#st1.st', 'div#st5.st'] else 'BAD')
    ok &= names == ['div#st1.st', 'div#st5.st']
    print('  protected (.cxres) skipped:', c.get('skippedProtected'), 'OK' if c.get('skippedProtected') == 1 else 'BAD')
    ok &= c.get('skippedProtected') == 1
    print('selftest', 'PASS' if ok else 'FAIL')
    return 0 if ok else 1


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', default='', help='names, globs or group:NAME (as sweep.py)')
    ap.add_argument('--settle', type=int, default=1200, help='ms to wait after opening before scanning (default 1200)')
    ap.add_argument('--hover', action='store_true', help='also hover the first few controls and merge what runs then')
    ap.add_argument('--selftest', action='store_true', help='check anim_guard.js on synthetic animations and exit')
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--out', default=lib.OUT, help='output folder (default tools/ui/out)')
    args = ap.parse_args()
    if args.list:
        for s in SCREENS:
            print(s['name'])
        return 0
    if args.selftest:
        return await selftest()
    if not os.path.exists(lib.HTML):
        sys.exit('game file not found: ' + lib.HTML + '  (run tools/bld.sh first)')
    todo = select_screens(args.only)
    path = os.path.join(args.out, 'anim.json')
    old = {} if not args.only else (load_json(path, {}) or {})
    screens = dict(old.get('screens', {}))
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for i, sc in enumerate(todo, 1):
            print(f'[{i}/{len(todo)}] {sc["name"]}', file=sys.stderr, flush=True)
            try:
                screens[sc['name']] = await scan_screen(b, sc, args.settle, args.hover)
            except Exception as e:
                screens[sc['name']] = {'name': sc['name'], 'group': sc['group'], 'counts': {'bad': -1}, 'error': str(e)[:200]}
        await b.close()
    tot = {'infinite': 0, 'nonCompositor': 0, 'transitions': 0, 'compositorInfinite': 0}
    folded = {}
    print(f'\n{"screen":22s} {"infinite":>9s} {"nonComp":>8s} {"transit":>8s} {"infOK":>6s} {"run":>4s}  worst')
    for n, R in screens.items():
        c = R.get('counts') or {}
        if c.get('bad', 0) < 0:
            print(f'{n:22s} SCAN FAILED {R.get("error")}')
            continue
        for k in tot:
            tot[k] += c.get(k, 0)
        for g in R.get('groups', []):
            f = folded.setdefault((g['kind'], g['name'], ','.join(g['props'])), {'count': 0, 'screens': set(), 'sample': g['sample']})
            f['count'] += g['count']
            f['screens'].add(n)
        w = (R.get('groups') or [{}])[0]
        print(f'{n:22s} {c.get("infinite", 0):9d} {c.get("nonCompositor", 0):8d} {c.get("transitions", 0):8d} {c.get("compositorInfinite", 0):6d} {c.get("running", 0):4d}  '
              f'{(w.get("name", "") + " " + ",".join(w.get("props", [])))[:60]}')
    print(f'\nTOTAL infinite {tot["infinite"]} | nonCompositor {tot["nonCompositor"]} | transitions {tot["transitions"]} | (allowed infinite transform/opacity: {tot["compositorInfinite"]})')
    top = sorted(folded.items(), key=lambda kv: -len(kv[1]['screens']))[:15]
    if top:
        print('\nOffenders by name (kind | name | properties | screens | elements | sample):')
        for (kind, name, props), f in top:
            print(f'  {kind:13s} {name[:34]:34s} {props[:40]:40s} {len(f["screens"]):3d} {f["count"]:5d}  {f["sample"][:40]}')
    save_json(path, {'meta': {'html': lib.HTML, 'date': now(), 'settle_ms': args.settle, 'hover': args.hover, 'partial': bool(args.only), 'totals': tot},
                     'screens': screens})
    print('\nreport:', path)
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
