import asyncio,os,json,sys
from playwright.async_api import async_playwright
SP=os.path.dirname(os.path.abspath(__file__))
GAME='file://'+os.path.realpath(os.path.join(SP,'../../../type-warriors-source/out.html'))
class G:
    pass
async def openp(p,vw=1600,vh=900,rm=False,touch=False,ctx=None,mobile=False):
    g=G()
    if ctx is None:
        g.b=await p.chromium.launch()
        kw=dict(viewport={'width':vw,'height':vh},reduced_motion='reduce' if rm else 'no-preference')
        if touch: kw.update(has_touch=True,is_mobile=mobile)
        g.ctx=await g.b.new_context(**kw)
    else:
        g.ctx=ctx;g.b=None
    g.pg=await g.ctx.new_page();g.er=[]
    g.pg.on('pageerror',lambda e:g.er.append('PE '+str(e)[:400]))
    g.pg.on('console',lambda m:g.er.append('CE '+m.text[:300]) if m.type=='error' and 'ERR_' not in m.text else None)
    await g.pg.goto(GAME);await g.pg.wait_for_timeout(1300)
    g.E=g.pg.evaluate
    return g
def pr(*a):
    print(*a,flush=True)
