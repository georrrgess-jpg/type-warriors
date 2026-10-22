// Combat gold-per-minute bot (promoted from tools/audit87/econ/combat_rates.js). Run by sim.py as the body of
//   async (cfg) => { ... }       cfg = {scn, wpm, acc, react, seed, cap}
// One scenario per call. The bot types the nearest word at `wpm` with `acc` accuracy after a `react` second pause for
// every new monster. The hero has unlimited HP (so the rate measures how fast things die, not survival) and the game
// is stepped with its own update(1/60); no rendering. Math.random is replaced by a seeded generator so a run repeats
// exactly, which makes before/after comparisons meaningful.
{let a=(cfg.seed|0)||1;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function runCombat(n,wpm,acc,react,maxT,opts){opts=opts||{};
  const g0=P.gold,x0=P.xp;
  start(n,opts.kind);if(opts.hp){S.max=S.hp=99}
  let bud=0,wait=0,steps=0;const cps=wpm*5/60;let seen=new WeakSet();
  while(steps<maxT*3600){
    if(S.mode==='over'){break}
    if(S.mode==='boon'&&S.swap){const b=$('bsk');if(b)b.click();steps++;continue}
    if(S.mode==='boon'){try{pickBoon(0)}catch(e){const b=ov.querySelector('button');if(b)b.click()}steps++;continue}
    if(S.mode!=='play'){const b=ov.querySelector('.bc,button');if(b)b.click();update(1/60);steps++;continue}
    if(opts.hp)S.hp=Math.max(S.hp,50);
    if(S.cine){key('a');update(1/60);steps++;continue}
    bud+=cps/60;if(wait>0)wait-=1/60;
    if(S.en.some(e=>e.vul>0)){key(' ')}
    while(bud>=1&&wait<=0&&S.mode==='play'){
      let t=S.tgt;if(t&&(!S.en.includes(t)||t.vul>0))t=null;
      if(!t||t.i===0){let b=null;for(const e of S.en)if(e.x<W-10&&!(e.vul>0)&&(!b||e.x<b.x))b=e;if(!b)break;
        if(!seen.has(b)){seen.add(b);wait=react;break}t=b}
      let c=t.w[t.i];if(Math.random()>acc&&c!==' ')c=c==='q'?'z':'q';
      key(c);bud-=1}
    update(1/60);steps++;if(steps%3600===0)(opts.cp=opts.cp||[]).push([steps/3600,P.gold-g0,S.wave]);
  }
  const mins=steps/60/60;
  return {n,kind:opts.kind||'',wpm,end:S.mode,wave:S.wave,round:S.round,kills:S.kills,total:P.gold-g0,xp:P.xp-x0,mins:Math.round(mins*100)/100,gpm:mins>0?Math.round((P.gold-g0)/mins):0,stars:P.stars[n],cp:opts.cp}
}
// a mid-game save: level 20, everything seen, campaign cleared with 3 stars (so L1..L30 are replays)
P.xp=lvx(20);for(const a of ACH)P.ach[a.id]=1;P.camp=30;for(const id in MON)P.bs[id]=100000;window.__rbr=0;
for(let i=1;i<=30;i++)P.stars[i]=3;
const SC={
  camp1:{n:1},camp10:{n:10},camp20:{n:20},camp30:{n:30},
  endless:{n:0,maxT:20},graveyard:{n:0,kind:'gy',maxT:12},beginner:{n:0,kind:'bg',maxT:12},
  astral31_p0:{n:31,pres:0},astral31_p10:{n:31,pres:10},camp20_p10:{n:20,pres:10}
};
const s=SC[cfg.scn];if(!s)throw new Error('unknown scenario '+cfg.scn);
P.pres=s.pres||0;
const cap=Math.min(s.maxT||12,cfg.cap||99);
const out=runCombat(s.n,cfg.wpm,cfg.acc,cfg.react,cap,{hp:1,kind:s.kind});
out.scn=cfg.scn;out.pres=P.pres;out.cap=cap;
try{title()}catch(e){}
return out;
