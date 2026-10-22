#!/usr/bin/env python3
"""Coins-per-minute simulator for Type Warriors (8.7 tool, plan sections 3 and 7).

Promoted from tools/audit87/econ/{ev.py, combat_rates.js, wagon_rates.js, higher_lower_rtp.py}. A typing bot plays the
game's own update loop (no rendering) at 30, 45 and 70 WPM, always with a 0.35 s reaction to each new monster and 95%
accuracy, and the table shows the gold it earns per minute:

    Campaign replays  L1, L10, L20, L30   (level-20 hero, all stages cleared, so every level is a replay)
    Endless (20 min of play), Graveyard and Beginner (12 min each); the campaign and Astral runs end when the level does
    Astral level 31 at prestige 0 and 10, and campaign L20 at prestige 10 (prestige scaling)
    Lantern Caravan, three routes         (gold per run time, and per run time plus 10 s of menus)
    Casino: return to player of Higher or Lower from the game's own constants (python model)

    python3 sim.py --label base              # everything: slow, run it in the background (see timings below)
    python3 sim.py --quick                   # short runs, one caravan rep, fewer casino rounds: a smoke test
    python3 sim.py --only camp1,endless --wpm 45
    python3 sim.py --list

The hero has unlimited HP so the figure measures how fast things die, not survival. Math.random is seeded, so a run
repeats exactly; --seeds N averages N seeds. Output: a markdown table on stdout and out/<label>.json next to this
file (folder created at run time). Script-relative paths: works from any cwd and in any workspace.
"""
import argparse
import asyncio
import json
import math
import os
import random
import statistics
import sys
import time

from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
HTML = os.environ.get('TW_HTML') or os.path.join(ROOT, 'type-warriors-source', 'out.html')
COMBAT_JS = os.path.join(HERE, 'combat_rates.js')
WAGON_JS = os.path.join(HERE, 'wagon_rates.js')

# scenario -> (label shown in the table, group, default cap in game minutes, quick cap)
COMBAT = {
    'camp1':       ('Campaign L1 replay', 'campaign', 12, 4),
    'camp10':      ('Campaign L10 replay', 'campaign', 12, 4),
    'camp20':      ('Campaign L20 replay', 'campaign', 12, 4),
    'camp30':      ('Campaign L30 replay', 'campaign', 12, 4),
    'endless':     ('Endless', 'endless', 20, 3),
    'graveyard':   ('Graveyard (Monster Mash)', 'graveyard', 12, 3),
    'beginner':    ('Beginner', 'beginner', 12, 3),
    'astral31_p0': ('Astral L31, prestige 0', 'astral', 12, 4),
    'astral31_p10': ('Astral L31, prestige 10', 'astral', 12, 4),
    'camp20_p10':  ('Campaign L20, prestige 10', 'astral', 12, 4),
}
ROUTES = {'mill': 'Caravan: Millbrook Bridge', 'pines': 'Caravan: Hollow Pines', 'gallows': 'Caravan: Gallows Pass'}
GROUPS = ['campaign', 'endless', 'graveyard', 'beginner', 'astral', 'caravan', 'casino']


def med(xs):
    xs = [x for x in xs if x is not None]
    return round(statistics.median(xs), 1) if xs else None


def mean(xs):
    xs = [x for x in xs if x is not None]
    return round(sum(xs) / len(xs), 1) if xs else None


def harmless(t):
    t = t or ''
    return 'ERR_' in t or 'Failed to load resource' in t or 'net::' in t


async def fresh_page(b, errs):
    pg = await b.new_page(viewport={'width': 1600, 'height': 900})
    pg.on('pageerror', lambda e: errs.append('PE ' + str(e)[:200]))
    pg.on('console', lambda m: errs.append('CE ' + m.text[:200]) if m.type == 'error' and not harmless(m.text) else None)
    await pg.goto('file://' + HTML, wait_until='load', timeout=120000)
    await pg.wait_for_function("()=>typeof title==='function'&&typeof P==='object'", timeout=60000)
    await pg.wait_for_timeout(500)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){}}")
    return pg


async def run_js(pg, body, cfg):
    return await pg.evaluate("async(cfg)=>{" + body + "}", cfg)


# ---------------------------------------------------------------------------------------------------------------------
# casino: Higher or Lower return to player (model copied from 65_casino.js; constants are read from the game)
# ---------------------------------------------------------------------------------------------------------------------
HL_DEFAULT = dict(HLMAX=20000, HLE=1.075, HLGUESS=3, HLFACE=0.75, HLTIE=(1 / 13) * 0.65)


async def hl_constants(b, errs):
    try:
        pg = await fresh_page(b, errs)
        c = await pg.evaluate("()=>({HLMAX,HLE,HLGUESS,HLFACE,HLTIE})")
        await pg.close()
        c['source'] = 'game'
        return c
    except Exception as e:
        c = dict(HL_DEFAULT)
        c['source'] = 'fallback copy (' + str(e)[:60] + ')'
        return c


def hl_play(C, bet, strat, rng):
    HLMAX, HLE, HLGUESS, HLFACE, HLTIE = C['HLMAX'], C['HLE'], C['HLGUESS'], C['HLFACE'], C['HLTIE']
    pH = lambda r: (1 - HLTIE) * (14 - r) / 12
    pL = lambda r: (1 - HLTIE) * (r - 2) / 12
    fcut = lambda r, m: max(1.02, m * HLFACE) if r >= 11 else m
    mH = lambda r: fcut(r, HLE / pH(r)) if pH(r) > 0 else 0
    mL = lambda r: fcut(r, HLE / pL(r)) if pL(r) > 0 else 0

    def rnx(r):
        if rng.random() < HLTIE:
            return r
        k = 2 + int(rng.random() * 12)
        if k >= r:
            k += 1
        return k
    cur = 2 + int(rng.random() * 13)
    cmul, gn = 1, 0
    while True:
        eh, el = pH(cur) * mH(cur), pL(cur) * mL(cur)
        up = eh >= el
        if gn > 0 and not strat(cur, eh if up else el):
            return min(HLMAX, math.floor(bet * cmul))
        mult = mH(cur) if up else mL(cur)
        nx = rnx(cur)
        win = nx > cur if up else nx < cur
        if not win:
            return 0
        gn += 1
        cmul = math.floor(cmul * mult * 100) / 100
        cur = nx
        if bet * cmul >= HLMAX or gn >= HLGUESS:
            return min(HLMAX, math.floor(bet * cmul))


def hl_table(C, n, seed):
    strategies = [('cash out after 1 guess', lambda c, e: False), ('continue while EV > 1', lambda c, e: e > 1), ('always 3 guesses', lambda c, e: True)]
    rng = random.Random(seed)
    rows = []
    for name, st in strategies:
        for bet in (500, 2000, 5000):
            tot = sum(hl_play(C, bet, st, rng) for _ in range(n))
            rows.append({'strategy': name, 'bet': bet, 'rounds': n, 'rtp': round(tot / n / bet, 4), 'profit_per_round': round(tot / n - bet, 1)})
    return rows


# ---------------------------------------------------------------------------------------------------------------------
async def main():
    global HTML
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--label', default='run', help='output file label (default run)')
    ap.add_argument('--wpm', default='30,45,70', help='typing speeds (default 30,45,70)')
    ap.add_argument('--acc', type=float, default=0.95, help='bot accuracy (default .95)')
    ap.add_argument('--react', type=float, default=0.35, help='bot reaction to a new monster in seconds (default .35)')
    ap.add_argument('--quick', action='store_true', help='short runs for a smoke test (not for before/after numbers)')
    ap.add_argument('--only', default='', help='groups (campaign,endless,graveyard,beginner,astral,caravan,casino) or scenario names (camp1,mill,...)')
    ap.add_argument('--seeds', type=int, default=1, help='average this many random seeds per cell (default 1)')
    ap.add_argument('--seed', type=int, default=7, help='first seed (default 7)')
    ap.add_argument('--reps', type=int, default=0, help='caravan runs per cell (default 3, quick 1)')
    ap.add_argument('--overhead', type=float, default=10, help='seconds of menus per caravan run counted in gpm (default 10)')
    ap.add_argument('--casino-rounds', type=int, default=0, help='Higher or Lower rounds per row (default 60000, quick 6000)')
    ap.add_argument('--html', default=HTML, help='game file (default ../../type-warriors-source/out.html)')
    ap.add_argument('--out', default=os.path.join(HERE, 'out'), help='output folder (default tools/econ/out)')
    ap.add_argument('--list', action='store_true')
    args = ap.parse_args()
    HTML = os.path.realpath(args.html)
    if args.list:
        for k, v in COMBAT.items():
            print(f'{k:14s} {v[1]:9s} {v[0]}')
        for k, v in ROUTES.items():
            print(f'{k:14s} caravan   {v}')
        print('casino         casino    Higher or Lower RTP (python model)')
        return
    if not os.path.exists(HTML):
        sys.exit('game file not found: ' + HTML + '  (run tools/bld.sh first)')
    wpms = [int(x) for x in args.wpm.split(',') if x]
    want = [x for x in args.only.split(',') if x]
    known = set(COMBAT) | set(ROUTES) | set(GROUPS)
    bad = [x for x in want if x not in known]
    if bad:
        sys.exit('unknown --only item(s): ' + ','.join(bad) + '  (see --list)')

    def on(name, group):
        return (not want) or name in want or group in want
    scen = [k for k, v in COMBAT.items() if on(k, v[1])]
    routes = [k for k in ROUTES if on(k, 'caravan')]
    do_casino = on('casino', 'casino')
    reps = args.reps or (1 if args.quick else 3)
    crounds = args.casino_rounds or (6000 if args.quick else 60000)
    with open(COMBAT_JS) as f1, open(WAGON_JS) as f2:
        combat_js, wagon_js = f1.read(), f2.read()
    errs, rows, t_start = [], [], time.time()
    out = {'label': args.label, 'date': time.strftime('%Y-%m-%d %H:%M:%S'), 'html': HTML, 'quick': args.quick,
           'bot': {'acc': args.acc, 'react': args.react, 'seeds': args.seeds, 'seed0': args.seed, 'hero': 'level 20, unlimited HP',
                   'caravan_overhead_s': args.overhead, 'caravan_reps': reps},
           'wpm': wpms, 'rows': rows, 'casino': None, 'errors': errs}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for sc in scen:
            label, grp, cap, qcap = COMBAT[sc]
            for w in wpms:
                cells = []
                for k in range(args.seeds):
                    print(f'{sc} @{w} WPM seed {args.seed + k} ...', file=sys.stderr, flush=True)
                    t0 = time.time()
                    try:
                        pg = await fresh_page(b, errs)
                        r = await run_js(pg, combat_js, {'scn': sc, 'wpm': w, 'acc': args.acc, 'react': args.react, 'seed': args.seed + k, 'cap': qcap if args.quick else cap})
                        await pg.close()
                        r['wall_s'] = round(time.time() - t0, 1)
                        cells.append(r)
                    except Exception as e:
                        errs.append(f'{sc}@{w}: {str(e)[:160]}')
                ok = [c for c in cells if c.get('gpm') is not None]
                rows.append({'scenario': sc, 'label': label, 'group': grp, 'kind': 'combat', 'wpm': w,
                             'gpm': mean([c['gpm'] for c in ok]), 'mins': mean([c['mins'] for c in ok]), 'gold': mean([c['total'] for c in ok]),
                             'end': ok[0]['end'] if ok else None, 'wave': ok[0].get('wave') if ok else None, 'cells': cells})
        for rt in routes:
            for w in wpms:
                cells = []
                for k in range(args.seeds):
                    print(f'caravan {rt} @{w} WPM seed {args.seed + k} ...', file=sys.stderr, flush=True)
                    try:
                        pg = await fresh_page(b, errs)
                        r = await run_js(pg, wagon_js, {'route': rt, 'wpm': w, 'acc': args.acc, 'react': args.react, 'reps': reps, 'seed': args.seed + k, 'overhead': args.overhead})
                        await pg.close()
                        cells.append(r)
                    except Exception as e:
                        errs.append(f'caravan {rt}@{w}: {str(e)[:160]}')
                runs = [x for c in cells for x in c.get('runs', []) if 'gpm' in x]
                rows.append({'scenario': rt, 'label': ROUTES[rt], 'group': 'caravan', 'kind': 'caravan', 'wpm': w,
                             'gpm': mean([x['gpm'] for x in runs]), 'gpm_raw': mean([x['gpm_raw'] for x in runs]), 'mins': None,
                             'gold': mean([x['total'] for x in runs]), 'secs': mean([x['time'] for x in runs]),
                             'won': sum(1 for x in runs if x.get('won')), 'runs_n': len(runs),
                             'first_bonus_pay': mean([c.get('firstBonusPay') for c in cells]), 'cells': cells})
        if do_casino:
            print('casino: Higher or Lower ...', file=sys.stderr, flush=True)
            C = await hl_constants(b, errs)
            out['casino'] = {'game': 'Higher or Lower', 'constants': C, 'rows': hl_table(C, crounds, args.seed)}
        await b.close()
    out['wall_s'] = round(time.time() - t_start, 1)
    os.makedirs(args.out, exist_ok=True)
    path = os.path.join(args.out, args.label + '.json')
    with open(path, 'w') as f:
        json.dump(out, f, indent=1, default=str)

    # ---- markdown ----
    print(f'\n### Coins per minute, label `{args.label}` ({out["date"]}){" QUICK RUN, short caps: not comparable" if args.quick else ""}')
    print(f'bot: reaction {args.react}s, accuracy {int(args.acc * 100)}%, level-20 hero with unlimited HP, seed {args.seed}'
          f'{" x" + str(args.seeds) if args.seeds > 1 else ""}; caravan counts {int(args.overhead)} s of menus per run\n')
    print('| Mode | ' + ' | '.join(f'{w} WPM' for w in wpms) + ' | notes |')
    print('|---|' + '---:|' * len(wpms) + '---|')
    order = list(COMBAT) + list(ROUTES)
    for sc in order:
        rs = [r for r in rows if r['scenario'] == sc]
        if not rs:
            continue
        byw = {r['wpm']: r for r in rs}
        cells = [('-' if byw.get(w) is None or byw[w]['gpm'] is None else f'{byw[w]["gpm"]:.0f}') for w in wpms]
        if rs[0]['kind'] == 'combat':
            r45 = byw.get(45) or rs[0]
            note = f'{r45["mins"]} min of play at {r45["wpm"]} WPM, ends `{r45["end"]}`'
        else:
            r45 = byw.get(45) or rs[0]
            note = f'run {r45["secs"]} s at {r45["wpm"]} WPM, {r45["gold"]:.0f} gold a run, raw {r45["gpm_raw"]:.0f}/min, won {r45["won"]}/{r45["runs_n"]}' if r45.get('secs') else ''
        print(f'| {rs[0]["label"]} | ' + ' | '.join(cells) + f' | {note} |')
    if out['casino']:
        c = out['casino']
        print(f'\n### Casino: Higher or Lower return to player (constants from {c["constants"]["source"]}: edge {c["constants"]["HLE"]}, '
              f'max payout {c["constants"]["HLMAX"]}, {c["constants"]["HLGUESS"]} guesses; {crounds} rounds per row)\n')
        print('| Strategy | Bet | RTP | Profit per round |')
        print('|---|---:|---:|---:|')
        for r in c['rows']:
            print(f'| {r["strategy"]} | {r["bet"]} | {r["rtp"]:.4f} | {r["profit_per_round"]:+.0f} |')
    if errs:
        print(f'\n{len(errs)} error(s): {errs[:4]}')
    print(f'\nwall time {out["wall_s"]} s\nJSON: {path}')


if __name__ == '__main__':
    asyncio.run(main())
