#!/usr/bin/env python3
"""Companion balance for the 10.4 harvest companions: plays Endless with real hearts, one run per (pet, seed), and prints
the mean wave reached, score, hits taken and powers used per companion. Usage (from type-warriors-source):
  python3 ../tools/fl/flp_balance.py [--seeds 6] [--pets yeti,sol,flturkey,...] [--wpm 45] [--acc .94] [--cap 15] [--json out.json]"""
import asyncio,json,os,sys,argparse,statistics as st
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__));BOT=open(os.path.join(HERE,'flp_bal.js')).read()
ap=argparse.ArgumentParser();ap.add_argument('--seeds',type=int,default=6);ap.add_argument('--pets',default='none,yeti,sol,flturkey,ember,noct,flfox,cinder,flsquir')
ap.add_argument('--wpm',type=float,default=45);ap.add_argument('--acc',type=float,default=.94);ap.add_argument('--react',type=float,default=.35);ap.add_argument('--cap',type=float,default=15)
ap.add_argument('--json',default='');ap.add_argument('--scn',type=int,default=0);ap.add_argument('--src',default='out.html');A=ap.parse_args()
async def run():
    rows=[]
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for pet in A.pets.split(','):
            for s in range(1,A.seeds+1):
                pg=await b.new_page();await pg.goto('file://'+os.path.abspath(A.src));await pg.wait_for_timeout(500)
                await pg.evaluate("()=>{RS_ASK=false;ST.perfAsked=1;ST.cine=false}")
                cfg={'pet':'' if pet=='none' else pet,'seed':s*7919,'wpm':A.wpm,'acc':A.acc,'react':A.react,'cap':A.cap,'scn':A.scn}
                r=await pg.evaluate('async (cfg)=>{'+BOT+'}',cfg);rows.append(r);await pg.close()
                print(json.dumps(r),flush=True)
        await b.close()
    print('\npet        waves   score    hits  uses heals mins')
    agg={}
    for pet in A.pets.split(','):
        R=[r for r in rows if r['pet']==pet];m=lambda k:st.mean(x[k] for x in R)
        agg[pet]={k:round(m(k),2) for k in ['wave','score','hits','uses','heals','shs','mins','kills','gold'] if k in R[0]}
        print(f"{pet:10s} {m('wave'):6.1f} {m('score'):8.0f} {m('hits'):6.1f} {m('uses'):5.1f} {m('heals'):5.1f} {m('mins'):5.1f}")
    if A.json:json.dump({'rows':rows,'agg':agg,'cfg':vars(A)},open(A.json,'w'),indent=1)
asyncio.run(run())
