# python3 tools/poll/results.py : the Tower Vote results, read live from the public Nostr relays the game uses (percentages only).
# Needs network access to relay.damus.io, nos.lol, relay.primal.net and nostr.mom. Loads type-warriors.html headless and calls tpFetch().
import asyncio,os,sys,json
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__))
H='file://'+os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,'..','..','type-warriors.html'))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page();await pg.goto(H);await pg.wait_for_timeout(1500)
        r=await pg.evaluate("""async()=>{const r=await tpFetch();const now=Date.now();return {ok:r.ok,pct:r.pct||null,open:now<TPOLL.end,left:tpLeft(),names:Object.fromEntries(TPOLL.opts.map(o=>[o.id,o.n])),relays:rkLbRelays().length}}""")
        await b.close()
    if not r['ok']:print('Could not reach any of the',r['relays'],'relays (check network access).');return
    print('Tower Vote ('+('open: '+r['left'] if r['open'] else 'closed')+')')
    for k,v in sorted(r['pct'].items(),key=lambda x:-x[1]):print(f"  {r['names'][k]}: {v}%")
asyncio.run(main())
