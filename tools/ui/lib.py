"""Shared helpers for the 8.7 UI tools (tools/ui/sweep.py, tools/ui/anim_scan.py).

Promoted from tools/audit87/menus/lib.py. Everything is located relative to this file, so the tools work from any
cwd and in any workspace:  <root>/tools/ui/lib.py  ->  <root>/type-warriors-source/out.html  and  <root>/tools/wr/overlap.js

What is in here
  HTML, OVL_JS, OUT, SHOTS   paths
  SCREENS / SCR              the menu tree of plan section 5.1 as {name: {group, js, pre, seed}} (72 screens)
  newpage()                  a fresh page (errors collected, harmless font errors ignored), seeded and on the hub
  open_screen()              runs the untimed `pre` set-up, then the opener, and times the opener
  select_screens()           --only handling: names, shell globs, or group:NAME
  JS snippets                SIG, BTN, FONTS, FOCUS, COVER (covered by the dock + primary action), SETTLE

A screen opener is the body of an async function with `sl(ms)` in scope; it runs after the hub is up (so it does not
call title() itself). Prefer the real click path ($('dcb').click()) when the button wraps the opener, so wrapped handlers
and Back targets are the ones a player gets. Multi-step paths put the earlier steps in `pre`, which is not timed.

The probes treat the topmost layer as "the screen": an open sheet (.dks), a modal container (#wrmod, #fsmod, #rrcalm,
#ptmod, #hlmod, #shmod, #losom, [role=dialog]) or the bell popover (#bellp.open); otherwise the whole of #ov. The
"Running slowly?" offer (#pfask) is switched off by newpage() because headless runs under load trigger it.
"""
import fnmatch
import json
import os
import time

from playwright.async_api import async_playwright  # noqa: F401  (re-exported for the tools)

HERE = os.path.dirname(os.path.abspath(__file__))
TOOLS = os.path.dirname(HERE)
ROOT = os.path.dirname(TOOLS)
HTML = os.environ.get('TW_HTML') or os.path.realpath(os.path.join(ROOT, 'type-warriors-source', 'out.html'))
with open(os.path.join(TOOLS, 'wr', 'overlap.js')) as _f:
    OVL_JS = _f.read()
OUT = os.path.join(HERE, 'out')
SHOTS = os.path.join(OUT, 'shots')
VIEWPORTS = [(1600, 900), (1280, 720), (390, 844)]

# --------------------------------------------------------------------------------------------------------------------
# The menu tree (plan section 5.1). Each: name, group, opener, optional seed (run once before the hub is shown).
# Keep names short and stable: tests and --only use them.
# --------------------------------------------------------------------------------------------------------------------
_ASTRAL = "P.stars[30]=3;P.camp=30;"
# (name, group, timed opener, optional untimed set-up). The page is already on the hub when the opener runs, so openers do
# not call title() themselves (it would be counted in the open time). `pre` is for earlier steps of a multi-step path.
_S = [
    # ---- the hub, its header and its cards -------------------------------------------------------------------------
    ('title',            'hub',   "title()"),
    ('home_profile',     'hub',   "$('np').click()"),
    ('home_trophies',    'hub',   "$('tr').click()"),
    ('home_campaign',    'hub',   "$('cp').click()"),
    ('home_riddle',      'hub',   "$('dcb').click()"),
    ('home_fishing',     'hub',   "$('dkfish').click()"),
    ('home_events',      'hub',   "($('dkev')||$('go')).click()"),
    ('home_caravan',     'hub',   "$('dkwagon').click()"),
    ('home_pet',         'hub',   "$('dkmp').click()"),
    ('home_gear',        'hub',   "$('dkmg').click()"),
    ('home_modes',       'hub',   "$('dkmode').click()"),
    # ---- the dock: Play, Gear, Pets, Progress, Shop, More ----------------------------------------------------------
    ('play_sheet',       'dock',  "modeSheet()"),
    ('events_sheet',     'dock',  "modeSheet('ev')"),
    ('gear_armory',      'dock',  "DKGO.gr()"),
    ('gear_loadouts',    'dock',  "loadouts()"),
    ('gear_skilltree',   'dock',  "upgrades()"),
    ('pets_roster',      'dock',  "DKGO.pt()"),
    ('pets_eggs',        'dock',  "PTX.back=title;petHall('Eggs')"),
    ('pets_trail',       'dock',  "PTX.back=title;petHall('Trail')"),
    ('progress_collection', 'dock', "DKGO.pg()"),
    ('progress_monsters', 'dock', "catalog(title,'Monsters')"),
    ('progress_weapons', 'dock',  "catalog(title,'Weapons')"),
    ('progress_armor',   'dock',  "catalog(title,'Armor')"),
    ('progress_bosses',  'dock',  "catalog(title,'Bosses')"),
    ('progress_pets',    'dock',  "catalog(title,'Pets')"),
    ('progress_mastery', 'dock',  "catalog(title,'Mastery')"),
    ('progress_crates',  'dock',  "catalog(title,'Crates')"),
    ('progress_bounties', 'dock', "bountyBoard()"),
    ('progress_trophies', 'dock', "profile(1)"),
    ('shop_store',       'dock',  "DKGO.sh()"),
    ('shop_crates',      'dock',  "crateHub()"),
    ('more_sheet',       'dock',  "DKGO.mo()"),
    # ---- More: every utility ---------------------------------------------------------------------------------------
    ('more_profile',     'more',  "profile.tab='Overview';profile()"),
    ('more_customize',   'more',  "profile('Customize')"),
    ('more_prestige',    'more',  "prestigeScreen(title)"),
    ('more_settings',    'more',  "settings.tab='Display';settings(title)"),
    ('settings_sound',   'more',  "settings.tab='Sound';settings(title)"),
    ('settings_effects', 'more',  "settings.tab='Effects';settings(title)"),
    ('settings_data',    'more',  "settings.tab='Data';settings(title)"),
    ('settings_codes',   'more',  "const b=[...document.querySelectorAll('#ov button')].find(b=>/code/i.test(b.textContent));if(!b)throw new Error('no codes button');b.click()",
                                  "settings.tab='Data';settings(title);await sl(400)"),
    ('help_basics',      'more',  "help(title,'Basics')"),
    ('help_bosses',      'more',  "help(title,'Bosses')"),
    ('help_progress',    'more',  "help(title,'Progress')"),
    ('help_modes',       'more',  "help(title,'Modes')"),
    ('help_shortcuts',   'more',  "help(title,'Shortcuts')"),
    ('menu_background',  'more',  "hbgPick(title)"),
    ('save_center',      'more',  "saveCenter(title)"),
    # ---- corner: bell and calendar ---------------------------------------------------------------------------------
    ('bell_alerts',      'corner', "$('bell').click()"),
    ('bell_updates',     'corner', "const t=[...document.querySelectorAll('#bellp button')].find(b=>/^Updates/.test(b.textContent.trim()));if(!t)throw new Error('no Updates tab');t.click()",
                                   "$('bell').click();await sl(350)"),
    ('bell_news',        'corner', "const t=[...document.querySelectorAll('#bellp button')].find(b=>/^News/.test(b.textContent.trim()));if(!t)throw new Error('no News tab');t.click()",
                                   "$('bell').click();await sl(350)"),
    ('calendar',         'corner', "$('dkcal').click()"),
    # ---- modes -----------------------------------------------------------------------------------------------------
    ('campaign',         'modes', "campaign(cmCur())"),
    ('astral_map',       'modes', "astralMenu()"),
    ('endless',          'modes', "endlessMenu(title)"),
    ('arena',            'modes', "waMenu(title)"),
    ('monster_mash',     'modes', "gyMenu(title)"),
    ('trick_or_treat',   'modes', "ttMenu()"),
    ('practice',         'modes', "pracMenu(title)"),
    ('riddle',           'modes', "dcMenu(title)"),
    ('riddle_calendar',  'modes', "$('rrcalb').click()",   "dcMenu(title);await sl(700)"),
    ('fishing_hub',      'modes', "fishing()"),
    ('fishing_map',      'modes', "$('fssign').click()",   "fishing();await sl(600)"),
    ('fishing_journal',  'modes', "$('fshj').click()",     "fishing();await sl(600)"),
    ('fishing_workshop', 'modes', "$('fshw').click()",     "fishing();await sl(600)"),
    ('fishing_basket',   'modes', "$('fshc').click()",     "fishing();await sl(600)"),
    ('fishing_bounties', 'modes', "$('fsh6b').click()",    "fishing();await sl(600)"),
    ('caravan_hub',      'modes', "wagonMenu(title)"),
    ('caravan_workshop', 'modes', "wrWorkshop()",          "wagonMenu(title);await sl(600)"),
    ('caravan_log',      'modes', "wrRouteLog()",          "wagonMenu(title);await sl(600)"),
    ('caravan_howto',    'modes', "wrHowTo()",             "wagonMenu(title);await sl(600)"),
    ('casino_lobby',     'modes', "casinoOpen()"),
    ('wildcard',         'modes', "wcHome()"),
]
_SEED = {'astral_map': _ASTRAL, 'more_prestige': "P.stars[30]=3;P.xp=lvx(MAXLV);"}

SCREENS = [dict(name=t[0], group=t[1], js=t[2], pre=(t[3] if len(t) > 3 else ''), seed=_SEED.get(t[0], '')) for t in _S]
SCR = {s['name']: s for s in SCREENS}

# --------------------------------------------------------------------------------------------------------------------
# JS run inside the page
# --------------------------------------------------------------------------------------------------------------------
# Shared prelude for the snippets below: visibility test, and the open modal layers. Game modals are containers
# (#wrmod caravan, #fsmod fishing, #rrcalm riddle calendar, #ptmod pets, #hlmod collection, #shmod shop, #losom loadouts)
# or [role=dialog]; the "Running slowly?" offer (#pfask) is not a screen. Sheets (.dks) are handled separately.
_PRE = r"""const vok=e=>{try{return e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})}catch(_){return !!(e.offsetParent||e.getClientRects().length)}};
const modals=()=>[...document.querySelectorAll('#ov [id$="mod"],#ov #rrcalm,#ov #losom,#ov [role=dialog],body>[role=dialog]')].filter(e=>e.id!=='pfask'&&!e.closest('.dks')&&vok(e)&&e.children.length&&e.getBoundingClientRect().width>60&&e.getBoundingClientRect().height>60);"""


# Signature of "where am I": mode/view, #ov classes, visible headings, open sheets, Back handler, hub flag.
SIG = r"""()=>{const ov=document.getElementById('ov');
/*PRE*/
const sheet=document.querySelector('.dks'),pane=sheet?[...sheet.querySelectorAll('.dkpv')].find(p=>!p.hidden):null;
const scope=pane||sheet;
const h=[...(scope||ov).querySelectorAll('h1,h2,h3')].filter(vok).map(e=>e.textContent.trim().slice(0,40));
const sh=[...document.querySelectorAll('.dks')].map(s=>s.id);
const dlg=[...document.querySelectorAll('.dks .dkp')].map(e=>'sheet').concat(modals().map(e=>e.id||String(e.className).split(' ')[0]));
const pop=[...document.querySelectorAll('#bellp.open')].map(e=>e.id);
const txt=(ov.innerText||'').replace(/\s+/g,' ');let hh=0;for(let i=0;i<txt.length;i++)hh=(hh*31+txt.charCodeAt(i))|0;
const bb=[...(scope||ov).querySelectorAll('button,[role=button]')].filter(e=>vok(e)&&!e.closest('.dkrow')).find(e=>e.matches('[data-back],.dkbk,.fsback,.rrbk,.gdleave,#b,#cb')||/^[‹←<]?\s*(back|close|menu|modes|home|leave|exit)\b/i.test((e.textContent||e.getAttribute('aria-label')||'').trim()));
return {mode:S.mode,view:S.view,cls:ov.className,h:h.slice(0,4),sheets:sh,pane:pane?pane.dataset.v:null,dialogs:dlg,popovers:pop,fp:hh+':'+txt.length,
 back:S.back?(S.back.name||S.back.toString().replace(/\s+/g,' ').slice(0,90)):null,
 backBtn:bb?((bb.id?'#'+bb.id+' ':'')+(bb.textContent||bb.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,24)):null,
 home:typeof HOME!=='undefined'?HOME:null,dock:!!document.querySelector('#ov .dk')}}"""

# Overlap check (tools/wr/overlap.js __ovl): the open sheet's panel, else the whole #ov. Entries that are the dock's own
# (icon vs label inside .dkrow) are split out into `dock` so they do not inflate every screen's list.
OVL_CALL = """()=>{const ov=document.getElementById('ov'),sheet=document.querySelector('.dks .dkp'),row=ov.querySelector('.dkrow');
/*PRE*/
const M=(modals().pop()||document.querySelector('#bellp.open'));let page=__ovl(sheet||M||ov),dock=[];if(!sheet&&!M&&row){dock=__ovl(row);const b=new Set(dock);page=page.filter(x=>!b.has(x))}return {page,dock,root:sheet?'sheet':M?(M.id||M.className):'ov'}}"""

# Visible buttons and links (for listings).
BTN = """(sel)=>{const R=sel?document.querySelector(sel):document.getElementById('ov');if(!R)return 'NOROOT';
const vok=e=>{try{return e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})}catch(_){return !!(e.offsetParent||e.getClientRects().length)}};
return [...R.querySelectorAll('button,[role=button],a[href],[tabindex="0"]')].filter(vok).map(e=>(e.id?'#'+e.id+' ':'')+(e.disabled?'[DIS] ':'')+(e.textContent||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,50)+(e.title?' {'+e.title.slice(0,40)+'}':''))}"""

# Runs the opener, then measures the time to the first paint after it (two rAFs) and the worst frame in the next ~40.
SETTLE = """async(js)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const raf=()=>new Promise(r=>requestAnimationFrame(r));
const t0=performance.now();let err=null;try{await (new Function('sl','return (async()=>{'+js+'})()'))(sl)}catch(e){err=String(e)}const t1=performance.now();
await raf();await raf();const t2=performance.now();let mx=0,p=performance.now();for(let i=0;i<40;i++){await raf();const n=performance.now();mx=Math.max(mx,n-p);p=n}
return {sync:Math.round(t1-t0),open_ms:Math.round(t2-t0),maxFrame:Math.round(mx),err}}"""

# Fonts: headings, button fonts, text fonts weighted by characters, serif fallbacks, loaded font faces.
FONTS = """()=>{const ov=document.getElementById('ov');
const vok=e=>{try{return e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})}catch(_){return !!(e.offsetParent||e.getClientRects().length)}};
const ff=e=>getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g,'').trim();
const roots=[ov,...document.querySelectorAll('.dks')];
const q=s=>roots.flatMap(r=>[...r.querySelectorAll(s)]).filter(e=>vok(e)&&!e.closest('#bellp:not(.open)'));
const big=q('h1,h2,h3,.ttl,[class*=title]').slice(0,6).map(e=>e.tagName+':'+ff(e)+':'+getComputedStyle(e).fontSize+':'+(e.textContent||'').trim().slice(0,24));
const fam={};q('button').forEach(b=>{const f=ff(b);fam[f]=(fam[f]||0)+1});
const tf={},ser=[];q('*').filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).forEach(e=>{const f=ff(e);const n=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ');tf[f]=(tf[f]||0)+n.length;if(/Times|serif$|Georgia|Cinzel/i.test(f)&&ser.length<6)ser.push(f+':'+n.slice(0,30))});
let loaded=[];try{loaded=[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/["']/g,''))}catch(e){}
return {big,buttonFonts:fam,textFonts:tf,serifSamples:ser,loadedFaces:[...new Set(loaded)]}}"""

FOCUS = """()=>{const a=document.activeElement;if(!a||a===document.body)return 'BODY';const c=getComputedStyle(a);const r=a.getBoundingClientRect();
const inOv=document.getElementById('ov').contains(a),inDock=!!a.closest('.dkrow'),inSheet=!!a.closest('.dks');
return (a.id?'#'+a.id:'')+'.'+String(a.className&&a.className.baseVal!==undefined?a.className.baseVal:a.className).split(' ')[0]+'['+(a.textContent||a.value||a.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,22)+'] outline='+c.outlineStyle+'/'+c.outlineWidth+' vis='+(r.width>0&&r.bottom>0&&r.top<innerHeight)+(inDock?' DOCK':'')+(inSheet?' SHEET':'')+(inOv||inSheet?'':' OUTSIDE-OV')}"""

# "Covered by dock" and "primary action reachable without scrolling".
# A control counts as covered when its visible rect (clipped by every scroll/overflow ancestor) intersects the dock
# (.dk) or its sub-tab strip (.dksub) while the control is NOT inside them. `hit` says whether the dock is really the
# topmost thing at the middle of the overlap. Controls under [inert] (the page behind an open sheet) are not counted.
COVER = """()=>{
const ov=document.getElementById('ov');
/*PRE*/
const rc=r=>({l:r.left,t:r.top,r:r.right,b:r.bottom});
const clip=e=>{let r=rc(e.getBoundingClientRect());for(let a=e.parentElement;a&&a!==document.documentElement;a=a.parentElement){
  const cs=getComputedStyle(a);if(/(hidden|auto|scroll|clip)/.test(cs.overflowX+cs.overflowY)){const q=a.getBoundingClientRect();
   r={l:Math.max(r.l,q.left),t:Math.max(r.t,q.top),r:Math.min(r.r,q.right),b:Math.min(r.b,q.bottom)}}}
  r={l:Math.max(r.l,0),t:Math.max(r.t,0),r:Math.min(r.r,innerWidth),b:Math.min(r.b,innerHeight)};return r};
const area=r=>Math.max(0,r.r-r.l)*Math.max(0,r.b-r.t);
const nm=e=>(e.id?'#'+e.id:'')+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||e.tagName).split(' ')[0]+'['+(e.textContent||e.value||e.getAttribute('aria-label')||'').replace(/\\s+/g,' ').trim().slice(0,22)+']';
const docks=[...document.querySelectorAll('.dk,.dksub')].filter(e=>vok(e)&&e.getBoundingClientRect().width>0);
const M=(modals().pop()||document.querySelector('#bellp.open'));const roots=M?[M]:[ov,...document.querySelectorAll('.dks')];
const CTL='button,a[href],input,select,textarea,summary,[role=button],[tabindex="0"]';
const seen=new Set();const ctl=[];roots.forEach(r=>r.querySelectorAll(CTL).forEach(e=>{if(!seen.has(e)){seen.add(e);ctl.push(e)}}));
const live=ctl.filter(e=>vok(e)&&!e.closest('.dkrow')&&!e.closest('[inert]')&&!e.closest('#bellp:not(.open)')&&!(e.tagName==='INPUT'&&e.type==='hidden')&&e.getBoundingClientRect().width>2&&e.getBoundingClientRect().height>2);
const out={dock:docks.length>0,vw:innerWidth,vh:innerHeight,dockRects:docks.map(d=>{const r=d.getBoundingClientRect();return {sel:d.classList.contains('dksub')?'.dksub':'.dk',x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}}),
 controls:live.length,covered:[],primary:null,scroll:{top:ov.scrollTop,height:ov.scrollHeight,client:ov.clientHeight}};
for(const e of live){const c=clip(e);if(area(c)<=4)continue;
  for(const d of docks){const q=d.getBoundingClientRect();const iw=Math.min(c.r,q.right)-Math.max(c.l,q.left),ih=Math.min(c.b,q.bottom)-Math.max(c.t,q.top);
    if(iw>2&&ih>2){const cx=Math.max(c.l,q.left)+iw/2,cy=Math.max(c.t,q.top)+ih/2,top=document.elementFromPoint(cx,cy);
      out.covered.push({el:nm(e),dock:d.classList.contains('dksub')?'.dksub':'.dk',px:Math.round(iw)+'x'+Math.round(ih),frac:Math.round(iw*ih/Math.max(1,area(c))*100)/100,
        hit:!!(top&&top.closest('.dk,.dksub')),disabled:!!e.disabled})}}}
const PRI='button.gold,button.pri,button.prim,button.primary,a.gold,[role=button].gold,[role=button].pri,.dkgo,[data-primary]';
let pe=live.find(e=>e.matches(PRI));let how='gold/pri';if(!pe){pe=live.find(e=>e.matches('[data-first]'));how=pe?'data-first':null}
if(pe){const full=pe.getBoundingClientRect(),c=clip(pe),fa=Math.max(1,full.width*full.height),vis=area(c)/fa;
  let under=false;for(const d of docks){const q=d.getBoundingClientRect();if(Math.min(c.r,q.right)-Math.max(c.l,q.left)>2&&Math.min(c.b,q.bottom)-Math.max(c.t,q.top)>2)under=true}
  const mx=(c.l+c.r)/2,my=(c.t+c.b)/2,top=area(c)>0?document.elementFromPoint(mx,my):null,hit=!!(top&&(pe.contains(top)||top.contains(pe)));
  out.primary={el:nm(pe),how,visibleFrac:Math.round(vis*100)/100,underDock:under,hit,reachable:vis>=.95&&!under&&hit,rect:[Math.round(full.left),Math.round(full.top),Math.round(full.width),Math.round(full.height)]}}
return out}"""
SIG, OVL_CALL, COVER = (x.replace('/*PRE*/', _PRE) for x in (SIG, OVL_CALL, COVER))


# --------------------------------------------------------------------------------------------------------------------
# Python helpers
# --------------------------------------------------------------------------------------------------------------------
def harmless(text):
    """Console messages that are not game errors: offline font loads and network noise."""
    t = text or ''
    return ('ERR_' in t) or ('Failed to load resource' in t) or ('fonts.g' in t) or ('net::' in t)


def parse_viewports(s):
    """'1600x900,390x844' -> [(1600, 900), (390, 844)]; empty -> the three default viewports."""
    if not s:
        return list(VIEWPORTS)
    out = []
    for part in s.split(','):
        part = part.strip().lower()
        if part:
            w, h = part.split('x')
            out.append((int(w), int(h)))
    return out


def select_screens(spec=None):
    """--only value -> list of screen dicts. Items are exact names, shell globs (settings_*) or group:NAME."""
    if not spec:
        return list(SCREENS)
    want, bad = [], []
    for item in [x.strip() for x in spec.split(',') if x.strip()]:
        if item.startswith('group:'):
            m = [s for s in SCREENS if s['group'] == item[6:]]
        else:
            m = [s for s in SCREENS if fnmatch.fnmatchcase(s['name'], item)]
        if not m:
            bad.append(item)
        for s in m:
            if s not in want:
                want.append(s)
    if bad:
        raise SystemExit('unknown screen(s): ' + ', '.join(bad) + '  (try --list)')
    return want


async def newpage(b, vw=1600, vh=900, seed='', ovl=True, errs=None):
    """A fresh page on the hub. Returns (page, errors). Offline font errors are ignored."""
    pg = await b.new_page(viewport={'width': vw, 'height': vh})
    er = errs if errs is not None else []
    pg.on('pageerror', lambda e: er.append('PE ' + str(e)[:300]))
    pg.on('console', lambda m: er.append('CE ' + m.text[:300]) if m.type == 'error' and not harmless(m.text) else None)
    await pg.goto('file://' + HTML, wait_until='load', timeout=120000)
    await pg.wait_for_function("()=>typeof title==='function'&&typeof P==='object'&&!!document.getElementById('dkh')", timeout=60000)
    await pg.wait_for_timeout(600)
    # RS_ASK: no resume prompt; PFW.asked: no "Running slowly?" offer (headless runs under load trigger it and it would sit over every screen)
    await pg.evaluate("()=>{try{RS_ASK=false}catch(e){};try{PFW.asked=true}catch(e){};" + seed + "P.gold=5000;title()}")
    if ovl:
        await pg.evaluate("()=>{" + OVL_JS + "}")
    await pg.wait_for_timeout(300)
    return pg, er


PRE = """async(js)=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));try{await (new Function('sl','return (async()=>{'+js+'})()'))(sl);return null}catch(e){return String(e)}}"""


async def open_screen(pg, js, pre=''):
    """Run the untimed set-up (if any), then the opener, timed. Returns {sync, open_ms, maxFrame, err}."""
    perr = None
    if pre:
        perr = await pg.evaluate(PRE, pre)
        await pg.wait_for_timeout(150)
    t = await pg.evaluate(SETTLE, js)
    if perr and not t.get('err'):
        t['err'] = 'pre: ' + perr
    return t


async def shot(pg, path, png=False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if png:
        await pg.screenshot(path=path + '.png')
    else:
        await pg.screenshot(path=path + '.jpg', type='jpeg', quality=72)


def load_json(path, default=None):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(obj, f, indent=1, default=str)


def now():
    return time.strftime('%Y-%m-%d %H:%M:%S')
