import asyncio,sys
sys.path.insert(0,'.')
from lib import *
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch();pg,er=await newpage(b)
    await pg.click('#bell');await pg.wait_for_timeout(300)
    print('tabs',await pg.evaluate("()=>[...document.querySelectorAll('#bellp button')].map(b=>(b.id||b.className)+':'+b.textContent.trim().slice(0,40))"))
    await pg.evaluate("()=>{const t=[...document.querySelectorAll('#bellp button')].find(b=>/^Updates/.test(b.textContent.trim()));t&&t.click()}");await pg.wait_for_timeout(400)
    await pg.screenshot(path=D+'/shots/bell_updates.png')
    print('updates items',await pg.evaluate("()=>[...document.querySelectorAll('#bellp *')].filter(e=>e.children.length===0&&e.textContent.trim()).slice(0,14).map(e=>e.textContent.trim().slice(0,50))"))
    print('badge before',await pg.evaluate("()=>(document.querySelector('#bell .bdg')||{}).textContent"),'unread',await pg.evaluate("()=>updUnread()"))
    await pg.evaluate("()=>{const c=document.getElementById('blclr');c&&c.click()}");await pg.wait_for_timeout(500)
    print('badge after clear',await pg.evaluate("()=>(document.querySelector('#bell .bdg')||{}).textContent"),'unread',await pg.evaluate("()=>updUnread()"),'alerts',await pg.evaluate("()=>dkAlerts().length"),'more badge',await pg.evaluate("()=>(document.querySelector('#dk_mo .bdg')||{}).textContent"))
    await pg.evaluate("()=>title()");await pg.wait_for_timeout(400)
    print('after re-render badge',await pg.evaluate("()=>(document.querySelector('#bell .bdg')||{}).textContent"))
    print(er);await b.close()
asyncio.run(main())
