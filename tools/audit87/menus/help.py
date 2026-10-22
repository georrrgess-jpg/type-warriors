import asyncio,sys
sys.path.insert(0,'.')
from lib import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg,er=await newpage(b)
    print(await pg.evaluate("()=>Object.fromEntries(Object.entries(HELP).map(([k,v])=>[k,v.map(r=>r[0])]))"))
    print(await pg.evaluate("()=>HELP.Shortcuts.map(r=>r[0]+': '+r[1].slice(0,90))"))
    print(await pg.evaluate("()=>HELP.Modes.filter(r=>/Casino|Campaign|Rift/.test(r[0])).map(r=>r[0]+': '+r[1].slice(0,120))"))
    await b.close()
asyncio.run(main())
