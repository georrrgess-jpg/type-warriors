/* first line of each concept script: // {"map":"moss","wave":6,"towers":[[padIndex,"type",tier]],"secs":8,"free":[padIndex,...]} */
function tdSetup(s){const c=JSON.parse(s);try{rpLeave()}catch(e){}rpStart(c.map||'moss');const R=RPX;R.tut=null;R.hold=false;R.supply=99999;
 const pads=[...R.pads].sort((a,b)=>a.x-b.x);
 for(const [i,t,tier] of (c.towers||[])){const p=pads[i];rpBuild(p,t);const tw=p.tw;tw.build=1;let n=0;while(tw.tier<tier&&n++<6)rpUpgrade(tw);tw.upK=1}
 R.wave=(c.wave||5)-1;R.wst='build';R.cd=0;rpWaveStart();for(let i=0;i<(c.secs||8)*30;i++){R.hp=20;rpStep(R,1/30)}R.banner=null;
 window.__pads=pads.map(p=>({x:p.x,y:p.y,tw:!!p.tw}));return window.__pads}
