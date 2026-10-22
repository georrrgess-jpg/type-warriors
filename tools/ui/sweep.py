#!/usr/bin/env python3
"""Menu sweep (8.7 tool, plan sections 3 and 5.1). Opens every screen of the menu tree and records, for each:

  open time (ms)            time from calling the opener to two painted frames
  Back handler              S.back's name, and the visible Back/Close button
  Esc once / twice          what each Escape press did: none, changed (content changed in place), closed-sheet,
                            closed-dialog, closed-popover, sheet-back, home, moved
  Tab focus order           the first 4 stops after the screen opens
  overlaps                  tools/wr/overlap.js at each viewport (default 1600x900, 1280x720, 390x844)
  fonts used                headings, button fonts, text fonts by characters, serif fallbacks (Georgia, Times, Cinzel)
  console / page errors     offline font-load errors are ignored
  covered by dock           visible buttons/links/inputs whose rect intersects the dock (.dk) or its sub-tab strip
                            (.dksub) while NOT inside them; `hit` = the dock really is on top there
  primary reachable         is the first .gold/.pri/primary button fully visible without scrolling and not under the dock

    python3 sweep.py                              # everything (about 70 screens, several minutes)
    python3 sweep.py --only 'settings_*,group:dock'   # names, globs (quote them), or group:NAME
    python3 sweep.py --viewports 1600x900         # fewer viewports = faster
    python3 sweep.py --list

Writes out/report.json (merged by screen name when --only is used), screenshots to out/shots/ (JPEG; --png for PNG) and
prints a ranked summary. Paths are relative to this file; works from any cwd. One browser at a time please.
"""
import argparse
import asyncio
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402
from lib import (SCREENS, SCR, OVL_CALL, SIG, BTN, FONTS, FOCUS, COVER, async_playwright, newpage, open_screen,  # noqa: E402
                 select_screens, parse_viewports, shot, load_json, save_json, now)


def sigkey(s):
    return (s.get('mode'), s.get('view'), tuple((s.get('h') or [])[:2]), tuple(s.get('sheets') or []), s.get('pane'), tuple(s.get('dialogs') or []), s.get('home'))


def esc_effect(b, a):
    """What an Escape press did, comparing the signatures before and after."""
    if len(a.get('sheets') or []) < len(b.get('sheets') or []):
        return 'closed-sheet'
    if len(a.get('dialogs') or []) < len(b.get('dialogs') or []):
        return 'closed-dialog'
    if len(a.get('popovers') or []) < len(b.get('popovers') or []):
        return 'closed-popover'
    if b.get('pane') and a.get('pane') and b['pane'] != a['pane']:
        return 'sheet-back'
    if sigkey(b) == sigkey(a):
        return 'changed' if b.get('fp') != a.get('fp') else 'none'
    if a.get('home') and a.get('view') == 'menu' and not b.get('home'):
        return 'home'
    return 'moved'


def layered(sig):
    """A sheet, dialog, modal or popover is open on top of the screen."""
    sig = sig or {}
    return bool(sig.get('sheets') or sig.get('dialogs') or sig.get('popovers'))


def kinds(entries):
    k = {}
    for e in entries or []:
        w = e.split(' ', 1)[0]
        k[w] = k.get(w, 0) + 1
    return k


async def run_screen(b, sc, vps, shots, png):
    name = sc['name']
    pg, er = await newpage(b, vps[0][0], vps[0][1], seed=sc.get('seed', ''))
    t_wall = time.time()
    R = {'name': name, 'group': sc['group'], 'open': sc['js'], 'pre': sc.get('pre', ''), 'date': now()}
    R['timing'] = await open_screen(pg, sc['js'], sc.get('pre', ''))
    await pg.wait_for_timeout(700)
    R['sig'] = await pg.evaluate(SIG)
    R['buttons'] = (await pg.evaluate(BTN, None))
    if isinstance(R['buttons'], list):
        R['n_buttons'] = len(R['buttons'])
        R['buttons'] = R['buttons'][:40]
    R['fonts'] = await pg.evaluate(FONTS)
    R['views'] = {}
    for vw, vh in vps:
        await pg.set_viewport_size({'width': vw, 'height': vh})
        await pg.wait_for_timeout(400)
        key = f'{vw}x{vh}'
        try:
            o = await pg.evaluate(OVL_CALL)
            ovl, dock_ovl, oroot = o['page'], o['dock'], o.get('root')
        except Exception as e:
            ovl, dock_ovl, oroot = ['OVL-ERROR ' + str(e)[:120]], [], None
        cov = await pg.evaluate(COVER)
        R['views'][key] = {'overlap_root': oroot, 'overlaps': ovl[:30], 'overlap_kinds': kinds(ovl), 'n_overlaps': len(ovl), 'dock_overlaps': dock_ovl[:12],
                           'cover': cov, 'n_covered': len([c for c in cov['covered'] if c['hit']]),
                           'n_covered_rect': len(cov['covered'])}
        if shots:
            await shot(pg, os.path.join(lib.SHOTS, f'{name}_{vw}'), png)
    await pg.set_viewport_size({'width': vps[0][0], 'height': vps[0][1]})
    await pg.wait_for_timeout(350)
    R['focus'] = []
    for _ in range(4):
        await pg.keyboard.press('Tab')
        await pg.wait_for_timeout(90)
        R['focus'].append(await pg.evaluate(FOCUS))
    s0 = R['sig']
    await pg.keyboard.press('Escape')
    await pg.wait_for_timeout(450)
    R['esc1'] = await pg.evaluate(SIG)
    await pg.keyboard.press('Escape')
    await pg.wait_for_timeout(450)
    R['esc2'] = await pg.evaluate(SIG)
    R['esc'] = {'once': esc_effect(s0, R['esc1']), 'twice': esc_effect(R['esc1'], R['esc2']), 'home_after_two': bool(R['esc2'].get('home'))}
    R['errors'] = er[:12]
    R['wall_s'] = round(time.time() - t_wall, 1)
    await pg.close()
    return R


# ---------------------------------------------------------------------------------------------------------------------
# ranking
# ---------------------------------------------------------------------------------------------------------------------
VP_WEIGHT = {1600: 3, 1280: 2, 390: 1}


def score(R):
    """Higher = worse. Returns (score, reasons)."""
    pts, why = 0.0, []
    for key, v in (R.get('views') or {}).items():
        w = VP_WEIGHT.get(int(key.split('x')[0]), 1)
        n = v['n_overlaps']
        if n:
            pts += w * min(n, 12)
            why.append(f'{n} overlap(s) @{key}')
        c = v['n_covered']
        if c:
            pts += w * 3 * min(c, 8)
            why.append(f'{c} covered by dock @{key}')
        p = v['cover'].get('primary')
        if p and not p['reachable']:
            pts += w * 4
            why.append(f'primary {p["el"]} not reachable @{key}')
    t = R.get('timing') or {}
    if t.get('err'):
        pts += 30
        why.append('open error: ' + str(t['err'])[:60])
    if R.get('errors'):
        pts += 10 * len(R['errors'])
        why.append(f'{len(R["errors"])} console/page error(s)')
    ms = t.get('open_ms') or 0
    if ms > 600:
        pts += (ms - 600) / 200
        why.append(f'slow open {ms} ms')
    e = R.get('esc') or {}
    if e.get('once') == 'none' and (not (R.get('sig') or {}).get('home') or layered(R.get('sig'))):
        pts += 2
        why.append('Esc does nothing')
    ser = (R.get('fonts') or {}).get('serifSamples') or []
    if ser:
        pts += 1
        why.append('serif fallback text')
    return round(pts, 1), why


def summarize(screens, top):
    rows = []
    for n, R in screens.items():
        s, why = score(R)
        rows.append({'name': n, 'score': s, 'why': why})
    rows.sort(key=lambda r: -r['score'])
    print('\n=== Ranked summary (worst first) ===')
    print(f'{"screen":22s} {"score":>6s} {"open":>6s}  {"ovl 1600/1280/390":18s} {"dock-cov":10s} {"esc 1/2":18s} reasons')
    for r in rows[:top]:
        R = screens[r['name']]
        v = R.get('views') or {}
        ov = '/'.join(str(v[k]['n_overlaps']) if k in v else '-' for k in ('1600x900', '1280x720', '390x844'))
        cv = '/'.join(str(v[k]['n_covered']) if k in v else '-' for k in ('1600x900', '1280x720', '390x844'))
        e = R.get('esc') or {}
        print(f'{r["name"]:22s} {r["score"]:6.1f} {(R.get("timing") or {}).get("open_ms", "-"):>6}  {ov:18s} {cv:10s} {str(e.get("once")) + "/" + str(e.get("twice")):18s} {"; ".join(r["why"])[:110]}')
    clean = [r["name"] for r in rows if r['score'] == 0]
    agg = {
        'screens': len(rows),
        'with overlaps': sum(1 for R in screens.values() if any(v['n_overlaps'] for v in (R.get('views') or {}).values())),
        'covered by dock': sum(1 for R in screens.values() if any(v['n_covered'] for v in (R.get('views') or {}).values())),
        'primary not reachable': sum(1 for R in screens.values() if any((v['cover'].get('primary') or {}).get('reachable') is False for v in (R.get('views') or {}).values())),
        'errors': sum(1 for R in screens.values() if R.get('errors') or (R.get('timing') or {}).get('err')),
        'Esc does nothing': sum(1 for R in screens.values() if (R.get('esc') or {}).get('once') == 'none' and (not (R.get('sig') or {}).get('home') or layered(R.get('sig')))),
        'serif fallback': sum(1 for R in screens.values() if (R.get('fonts') or {}).get('serifSamples')),
        'slowest open (ms)': max(((R.get('timing') or {}).get('open_ms') or 0) for R in screens.values()) if screens else 0,
        'clean screens': len(clean),
    }
    dk = [R['views']['1600x900'].get('dock_overlaps') for R in screens.values() if '1600x900' in (R.get('views') or {}) and R['views']['1600x900'].get('dock_overlaps')]
    if dk:
        agg['dock-own overlaps @1600x900'] = len(dk[0])
    print('\n' + ' | '.join(f'{k}: {v}' for k, v in agg.items()))
    return rows, agg


SELFTEST_JS = """async(mode)=>{
 const sl=ms=>new Promise(r=>setTimeout(r,ms));armory();await sl(500);
 const d=document.querySelector('#ov .dk').getBoundingClientRect(),ov=document.getElementById('ov');
 const mk=(id,css,gold,text)=>{const b=document.createElement('button');b.id=id;b.textContent=text||id;if(gold)b.className='gold';
   b.style.cssText='position:fixed;z-index:5;width:140px;height:40px;'+css;ov.appendChild(b);return b};
 document.querySelectorAll('#ov .gold').forEach(b=>b.classList.remove('gold'));
 if(mode==='covered'){mk('t_cov','left:'+(d.left+20)+'px;top:'+(d.top+10)+'px',false)}
 if(mode==='gold_ok'){mk('t_ok','left:100px;top:120px',true)}
 if(mode==='gold_under'){mk('t_under','left:'+(d.left+20)+'px;top:'+(d.top+10)+'px',true)}
 if(mode==='gold_below'){const b=mk('t_below','left:100px;top:'+(innerHeight+300)+'px',true)}
 await sl(200);return null}"""


async def selftest():
    """Prove the new cover/primary checks on injected controls (no game screens involved)."""
    cases = [('covered', lambda c: any(x['el'].startswith('#t_cov') and x['hit'] for x in c['covered']), 'control on the dock is reported with hit=true'),
             ('gold_ok', lambda c: bool(c['primary']) and c['primary']['el'].startswith('#t_ok') and c['primary']['reachable'], 'visible gold button is reachable'),
             ('gold_under', lambda c: bool(c['primary']) and c['primary']['underDock'] and not c['primary']['reachable'], 'gold button on the dock is not reachable'),
             ('gold_below', lambda c: bool(c['primary']) and not c['primary']['reachable'] and c['primary']['visibleFrac'] < .95, 'gold button below the viewport is not reachable')]
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for mode, test, what in cases:
            pg, er = await newpage(b)
            await pg.evaluate(SELFTEST_JS, mode)
            c = await pg.evaluate(COVER)
            ok = bool(test(c))
            bad += 0 if ok else 1
            print(f'  {mode:11s} {what:55s} {"OK" if ok else "BAD"}')
            await pg.close()
        await b.close()
    print('selftest', 'PASS' if not bad else f'FAIL ({bad})')
    return 1 if bad else 0


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--only', default='', help='comma separated names, globs (settings_*) or group:NAME')
    ap.add_argument('--viewports', default='', help='e.g. 1600x900,390x844 (default 1600x900,1280x720,390x844)')
    ap.add_argument('--list', action='store_true', help='list screens and exit')
    ap.add_argument('--selftest', action='store_true', help='check the covered-by-dock and primary-action probes on injected controls, then exit')
    ap.add_argument('--no-shots', action='store_true', help='skip screenshots')
    ap.add_argument('--png', action='store_true', help='PNG screenshots instead of JPEG')
    ap.add_argument('--top', type=int, default=25, help='rows in the ranked summary')
    ap.add_argument('--out', default=lib.OUT, help='output folder (default tools/ui/out)')
    ap.add_argument('--fresh', action='store_true', help='ignore an existing report.json instead of merging')
    args = ap.parse_args()
    if args.out != lib.OUT:
        lib.OUT = args.out
        lib.SHOTS = os.path.join(args.out, 'shots')
    if args.list:
        for s in SCREENS:
            print(f'{s["name"]:22s} {s["group"]:7s} {(s["pre"] + " >> " if s["pre"] else "") + s["js"]}'[:150])
        print(len(SCREENS), 'screens')
        return 0
    if args.selftest:
        return await selftest()
    if not os.path.exists(lib.HTML):
        sys.exit('game file not found: ' + lib.HTML + '  (run tools/bld.sh first)')
    vps = parse_viewports(args.viewports)
    todo = select_screens(args.only)
    path = os.path.join(lib.OUT, 'report.json')
    old = {} if (args.fresh or not args.only) else (load_json(path, {}) or {})
    screens = dict(old.get('screens', {}))
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for i, sc in enumerate(todo, 1):
            print(f'[{i}/{len(todo)}] {sc["name"]}', file=sys.stderr, flush=True)
            try:
                screens[sc['name']] = await run_screen(b, sc, vps, not args.no_shots, args.png)
            except Exception as e:
                screens[sc['name']] = {'name': sc['name'], 'group': sc['group'], 'open': sc['js'], 'timing': {'err': 'SWEEP FAILED: ' + str(e)[:200]},
                                       'views': {}, 'errors': []}
            save_json(path, {'meta': {'html': lib.HTML, 'date': now(), 'viewports': [f'{w}x{h}' for w, h in vps], 'partial': bool(args.only)}, 'screens': screens})
        await b.close()
    rows, agg = summarize({n: screens[n] for n in screens}, args.top)
    save_json(path, {'meta': {'html': lib.HTML, 'date': now(), 'viewports': [f'{w}x{h}' for w, h in vps], 'partial': bool(args.only), 'aggregate': agg},
                     'ranking': rows, 'screens': screens})
    print('\nreport:', path)
    if not args.no_shots:
        print('shots :', lib.SHOTS)
    return 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
