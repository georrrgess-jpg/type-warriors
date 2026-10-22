#!/usr/bin/env python3
"""rAF frame-time and boot-time measurement for Type Warriors (8.7 tool, plan section 3).

For each screen the page is opened fresh, the screen is opened, 600 ms are allowed to settle, and the gaps between
180 consecutive requestAnimationFrame callbacks are recorded (mean, p95, max, in ms). Each screen is measured
--runs times (default 3) and the MEDIAN of every metric is reported. The cold page's DOMContentLoaded, load and
first-hub-paint times are measured the same way.

    python3 frames.py                       # default mode, 3 runs per screen
    python3 frames.py --throttle            # CPU throttle x4 + device scale factor 1.5
    python3 frames.py --both --label base   # both modes into one JSON
    python3 frames.py --only home,fight --runs 1 --frames 60    # quick smoke run
    (a run is cut short after --max-ms, default 25 s, so --throttle stays bounded; the table says when that happened)

Output: a markdown table on stdout and out/<label>.json next to this script (folder created at run time).
Works from any cwd. It locates the game at ../../type-warriors-source/out.html (override with --html or TW_HTML).
The browser runs with vsync and the frame limiter off (like tools/rr/rfps.py) so a frame's duration is the work
done for it, not the 16.7 ms refresh tick. Run on an idle machine for numbers worth keeping.
"""
import argparse, asyncio, json, os, statistics, sys, time
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_HTML = os.path.realpath(os.path.join(HERE, '..', '..', 'type-warriors-source', 'out.html'))

# name -> (JS body run inside the game after a clean title(); what it is)
# The body is an async function body with `sl(ms)` available. Everything is called through the game's own entry points.
SCREENS = {
    'home':       ("title()", 'home hub'),
    'play_sheet': ("title(); modeSheet()", 'dock: Play (mode sheet)'),
    'gear':       ("title(); DKGO.gr()", 'dock: Gear (armory)'),
    'pets':       ("title(); DKGO.pt()", 'dock: Pets (petHall)'),
    'progress':   ("title(); DKGO.pg()", 'dock: Progress (catalog)'),
    'shop':       ("title(); DKGO.sh()", 'dock: Shop'),
    'more_sheet': ("title(); DKGO.mo()", 'dock: More (sheet)'),
    'fishing':    ("title(); fishing()", 'Fishing hub'),
    'riddle':     ("title(); dcMenu(title)", 'Runestone Riddle menu'),
    'caravan':    ("title(); wagonMenu(title)", 'Lantern Caravan hub'),
    'fight':      ("title(); start(1); S.max = S.hp = 99", 'campaign fight (level 1)'),
    'daily':      ("title(); dailyMenu(title)", 'Daily calendar'),
    'astral':     ("P.stars[30] = 3; P.camp = 30; title(); astralMenu()", 'Astral map'),
    'casino':     ("title(); casinoOpen()", 'Casino lobby'),
}

# Resets the page the way the other QA scripts do, then runs a screen opener.
PREP = "()=>{try{RS_ASK=false}catch(e){}; try{PFW.asked=true}catch(e){}; P.gold=5000; title()}"

FRAMES_JS = """([n,maxMs])=>new Promise(res=>{const t=[];let l=performance.now();const t0=l;
 const fin=()=>{const s=[...t].sort((a,b)=>a-b),r=x=>Math.round(x*10)/10;
  res({mean:r(t.reduce((a,b)=>a+b,0)/t.length),p95:r(s[Math.min(s.length-1,Math.floor(s.length*.95))]),max:r(s[s.length-1]),n:t.length})};
 const f=ts=>{t.push(ts-l);l=ts;if(t.length>=n||(maxMs&&ts-t0>maxMs&&t.length>=30))fin();else requestAnimationFrame(f)};
 requestAnimationFrame(ts=>{l=ts;requestAnimationFrame(f)})})"""

# Installed before any page script: records when the first hub (#dkh) is in the DOM and when it first painted.
BOOT_INIT = """(()=>{window.__boot={};const mark=k=>{if(window.__boot[k]==null)window.__boot[k]=Math.round(performance.now())};
 const chk=()=>{if(document.getElementById('dkh')){mark('hubDom');requestAnimationFrame(()=>requestAnimationFrame(()=>mark('hubPaint')));return true}return false};
 const mo=new MutationObserver(()=>{if(chk())mo.disconnect()});
 const arm=()=>{if(!chk())mo.observe(document.documentElement,{childList:true,subtree:true})};
 if(document.documentElement)arm();else document.addEventListener('readystatechange',arm,{once:true})})()"""

NAV_JS = """()=>{const n=performance.getEntriesByType('navigation')[0];if(!n)return null;
 return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),respEnd:Math.round(n.responseEnd)}}"""


def med(xs):
    xs = [x for x in xs if x is not None]
    return round(statistics.median(xs), 1) if xs else None


def harmless(text):
    """Offline font loads and similar network noise are not game errors."""
    t = text or ''
    return ('ERR_' in t) or ('Failed to load resource' in t) or ('fonts.g' in t) or ('net::' in t)


async def new_context(browser, throttle):
    kw = dict(viewport={'width': 1600, 'height': 900})
    if throttle:
        kw['device_scale_factor'] = 1.5
    return await browser.new_context(**kw)


_CDP = []   # keep the CDP sessions referenced for the life of the run so the emulation stays attached


async def set_throttle(ctx, pg, throttle):
    if not throttle:
        return None
    cdp = await ctx.new_cdp_session(pg)
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    _CDP.append(cdp)
    return cdp


# A fixed amount of arithmetic, timed in the page: a yardstick for machine load and for the throttle (about 4x slower).
CALIB_JS = "()=>{const t=performance.now();let x=0;for(let i=0;i<4e6;i++)x+=Math.sqrt(i);return Math.round((performance.now()-t)*10)/10}"


async def wait_ready(pg, timeout=60000):
    """Boot is finished once the first hub is in the DOM (title() ran in the game's own startup)."""
    await pg.wait_for_function("()=>typeof title==='function'&&!!document.getElementById('dkh')&&typeof P==='object'", timeout=timeout)


async def measure_boot(browser, throttle, errs):
    """Cold page: a fresh context, throttle applied BEFORE navigation so load is measured under the same conditions."""
    ctx = await new_context(browser, throttle)
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: errs.append('PE ' + str(e)[:200]))
    await pg.add_init_script(BOOT_INIT)
    await set_throttle(ctx, pg, throttle)
    t0 = time.time()
    await pg.goto('file://' + HTML, wait_until='load', timeout=120000)
    try:
        await wait_ready(pg)
    except Exception:
        pass
    await pg.wait_for_timeout(300)
    nav = await pg.evaluate(NAV_JS) or {}
    boot = await pg.evaluate("()=>window.__boot||{}") or {}
    calib = await pg.evaluate(CALIB_JS)
    await ctx.close()
    return {'dcl': nav.get('dcl'), 'load': nav.get('load'), 'hubDom': boot.get('hubDom'), 'hubPaint': boot.get('hubPaint'),
            'calib_ms': calib, 'wall_ms': round((time.time() - t0) * 1000)}


async def measure_screen(browser, name, throttle, frames, settle, errs, shared=None, max_ms=0):
    js = SCREENS[name][0]
    if shared is None:
        ctx = await new_context(browser, throttle)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(name + ' PE ' + str(e)[:200]))
        pg.on('console', lambda m: errs.append(name + ' CE ' + m.text[:200]) if m.type == 'error' and not harmless(m.text) else None)
        await pg.goto('file://' + HTML, wait_until='load', timeout=120000)
        await wait_ready(pg)
        await pg.wait_for_timeout(900 if not throttle else 1800)   # let the boot idle before throttling and measuring
        await set_throttle(ctx, pg, throttle)
    else:
        ctx, pg = shared
    await pg.evaluate(PREP)
    await pg.wait_for_timeout(250)
    err = await pg.evaluate("async(js)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));try{await (new Function('sl','return (async()=>{'+js+'})()'))(sl);return null}catch(e){return String(e)}}", js)
    if err:
        errs.append(name + ' OPEN ' + err[:200])
    await pg.wait_for_timeout(settle)
    res = await pg.evaluate(FRAMES_JS, [frames, max_ms])
    sig = await pg.evaluate("()=>({mode:S.mode,view:S.view,hub:!!document.getElementById('dkh')})")
    res['sig'] = sig
    res['open_error'] = err
    if shared is None:
        await ctx.close()
    return res


def md_table(rows, header):
    out = ['| ' + ' | '.join(header) + ' |', '|' + '|'.join(['---'] + ['---:'] * (len(header) - 1)) + '|']
    for r in rows:
        out.append('| ' + ' | '.join(str(c) for c in r) + ' |')
    return '\n'.join(out)


async def run_mode(browser, throttle, args, names):
    errs = []
    mode = 'throttle' if throttle else 'default'
    print(f'[{mode}] cold page x{args.runs} ...', file=sys.stderr, flush=True)
    boots = [await measure_boot(browser, throttle, errs) for _ in range(args.runs)]
    boot = {k: med([b[k] for b in boots]) for k in ('dcl', 'load', 'hubDom', 'hubPaint', 'calib_ms')}
    boot['runs'] = boots
    screens = {}
    shared = None
    if args.reuse:
        ctx = await new_context(browser, throttle)
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('PE ' + str(e)[:200]))
        await pg.goto('file://' + HTML, wait_until='load', timeout=120000)
        await wait_ready(pg)
        await pg.wait_for_timeout(900)
        await set_throttle(ctx, pg, throttle)
        shared = (ctx, pg)
    for nm in names:
        runs = []
        for k in range(args.runs):
            print(f'[{mode}] {nm} run {k + 1}/{args.runs}', file=sys.stderr, flush=True)
            try:
                runs.append(await measure_screen(browser, nm, throttle, args.frames, args.settle, errs, shared, args.max_ms))
            except Exception as e:
                errs.append(f'{nm} run {k + 1} FAILED {str(e)[:160]}')
        screens[nm] = {'what': SCREENS[nm][1], 'mean': med([r['mean'] for r in runs]), 'p95': med([r['p95'] for r in runs]),
                       'max': med([r['max'] for r in runs]), 'frames': med([r['n'] for r in runs]), 'runs': runs}
    if shared:
        await shared[0].close()
    return {'mode': mode, 'boot': boot, 'screens': screens, 'errors': errs[:40]}


async def main():
    global HTML
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--label', default='run', help='output file label (default run)')
    ap.add_argument('--throttle', action='store_true', help='CPU throttle x4 and device scale factor 1.5')
    ap.add_argument('--both', action='store_true', help='measure default and throttle modes, one JSON')
    ap.add_argument('--runs', type=int, default=3, help='runs per screen; the median is reported (default 3)')
    ap.add_argument('--frames', type=int, default=180, help='frames per run (default 180)')
    ap.add_argument('--settle', type=int, default=600, help='ms to wait after opening a screen (default 600)')
    ap.add_argument('--max-ms', type=int, default=25000, help='stop a run early after this many ms (at least 30 frames); keeps --throttle runs short (default 25000, 0 = never)')
    ap.add_argument('--only', default='', help='comma separated screen names; --list shows them')
    ap.add_argument('--list', action='store_true', help='list screen names and exit')
    ap.add_argument('--reuse', action='store_true', help='faster: one page for all screens (state carries over; not for baselines)')
    ap.add_argument('--html', default=os.environ.get('TW_HTML', DEFAULT_HTML), help='game file (default ../../type-warriors-source/out.html)')
    ap.add_argument('--out', default=os.path.join(HERE, 'out'), help='output folder (default tools/perf87/out)')
    args = ap.parse_args()
    HTML = os.path.realpath(args.html)
    if args.list:
        for k, (_, w) in SCREENS.items():
            print(f'{k:12s} {w}')
        return
    if not os.path.exists(HTML):
        sys.exit('game file not found: ' + HTML + '  (run tools/bld.sh first)')
    names = [n for n in args.only.split(',') if n] or list(SCREENS)
    bad = [n for n in names if n not in SCREENS]
    if bad:
        sys.exit('unknown screen(s): ' + ','.join(bad) + '  (see --list)')
    load0 = os.getloadavg()
    modes = [False, True] if args.both else [bool(args.throttle)]
    result = {'label': args.label, 'date': time.strftime('%Y-%m-%d %H:%M:%S'), 'html': HTML, 'runs': args.runs, 'frames': args.frames,
              'settle_ms': args.settle, 'cpus': os.cpu_count(), 'loadavg_start': [round(x, 2) for x in load0], 'modes': {}}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--disable-gpu-vsync', '--disable-frame-rate-limit'])
        for th in modes:
            r = await run_mode(b, th, args, names)
            result['modes'][r['mode']] = r
        await b.close()
    result['loadavg_end'] = [round(x, 2) for x in os.getloadavg()]
    os.makedirs(args.out, exist_ok=True)
    path = os.path.join(args.out, args.label + '.json')
    with open(path, 'w') as f:
        json.dump(result, f, indent=1)
    # ---- markdown ----
    print(f'\n### Frame times, label `{args.label}` ({result["date"]}, median of {args.runs}, {args.frames} frames after {args.settle} ms)')
    print(f'load average at start {result["loadavg_start"]}, at end {result["loadavg_end"]}; {result["cpus"]} CPUs\n')
    ms = list(result['modes'])
    hdr = ['Screen']
    for m in ms:
        hdr += [f'{m} mean', f'{m} p95', f'{m} max']
    rows = []
    for nm in names:
        row = [nm]
        for m in ms:
            s = result['modes'][m]['screens'].get(nm, {})
            row += [s.get('mean', '-'), s.get('p95', '-'), s.get('max', '-')]
        rows.append(row)
    print(md_table(rows, hdr))
    short = [f'{m}/{nm}: {result["modes"][m]["screens"][nm]["frames"]}' for m in ms for nm in names
             if result['modes'][m]['screens'].get(nm, {}).get('frames') not in (None, args.frames)]
    if short:
        print(f'\nruns stopped at --max-ms {args.max_ms} before {args.frames} frames (median frames measured): ' + ', '.join(short))
    print('\n### Cold page (ms from navigation start; the yardstick is a fixed 4M-sqrt loop timed in the page, a load and throttle check)\n')
    print(md_table([[m, result['modes'][m]['boot']['dcl'], result['modes'][m]['boot']['load'], result['modes'][m]['boot']['hubDom'],
                     result['modes'][m]['boot']['hubPaint'], result['modes'][m]['boot']['calib_ms']] for m in ms],
                   ['mode', 'DOMContentLoaded', 'load', 'hub in DOM', 'hub first paint', 'CPU yardstick ms']))
    for m in ms:
        e = result['modes'][m]['errors']
        if e:
            print(f'\n{m}: {len(e)} non-font error(s), first: {e[:3]}')
    print('\nJSON:', path)


if __name__ == '__main__':
    HTML = DEFAULT_HTML
    asyncio.run(main())
