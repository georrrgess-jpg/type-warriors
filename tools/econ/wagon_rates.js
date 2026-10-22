// Lantern Caravan gold bot (promoted from tools/audit87/econ/wagon_rates.js). Run by sim.py as the body of
//   async (cfg) => { ... }       cfg = {route, wpm, acc, react, reps, seed, overhead}
// Plays `reps` complete runs of one route with the same typing bot as combat_rates.js, stepping wrUpdate(1/60).
// The first-clear-of-the-day bonus is switched off before every run so the figures are the steady rate; the result
// also reports it once (`firstBonusPay`) from an untouched day. `overhead` seconds (result card, hub, start) are
// added to each run for gpm; gpm_raw is gold / run time only.
{let a=(cfg.seed|0)||1;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function run(id,wpm,acc,react,noFirst){
  const w=WRP();if(noFirst){w.day=wrDay();w.dayDone={mill:1,pines:1,gallows:1}}else{w.day=0;w.dayDone={}}
  const g0=P.gold;
  wrStart(id);const R=WRX;let bud=0,wait=0,steps=0;const cps=wpm*5/60;
  while(!R.over&&steps<60*600){
    if(R.st!=='roll'||R.pause){wrUpdate(1/60);steps++;continue}
    bud+=cps/60;if(wait>0)wait-=1/60;
    while(bud>=1&&wait<=0&&!R.over){
      let t=R.tgt;const live=e=>e.st!=='dead'&&e.st!=='fling'&&e.st!=='kb'&&e.x<W-10;
      if(t&&((t.hz&&R.haz!==t)||(!t.hz&&!live(t))))t=null;
      if(!t||t.i===0){let b=null;if(R.haz)b=R.haz;else for(const e of R.mobs)if(live(e)&&(!b||e.x<b.x))b=e;
        if(!b)break; if(t!==b&&b.i===0){ if(!b._seen){b._seen=1;wait=react;break} } t=b}
      if(R.flare>=WRT.FLARE&&R.flareOn<=0){wrFlare()}
      let c=t.w[t.i];
      if(Math.random()>acc){c='q'===c?'z':'q'}
      wrKey(c);bud-=1;
    }
    wrUpdate(1/60);steps++;
  }
  const r=R.result||{};const time=Math.round((r.time||steps/60)*10)/10;
  return {id,wpm,acc,won:r.won,med:r.med,pay:r.pay,coins:r.coins,total:r.total,gold:P.gold-g0,first:r.first,xp:r.xp,time,int:r.int,kills:r.kills}
}
P.wr=P.wr||{};
WRP().intro=1;
const out={route:cfg.route,wpm:cfg.wpm,runs:[]};
// one run from an untouched day to see the first-clear bonus, then the steady runs
try{WRP().med={mill:3,pines:3,gallows:3};const f=run(cfg.route,cfg.wpm,cfg.acc,cfg.react,false);out.firstBonusPay=f.pay;out.firstBonusFirst=f.first}catch(e){out.firstErr=String(e).slice(0,200)}
try{wrLeave()}catch(e){}
for(let k=0;k<cfg.reps;k++){
  try{WRP().med={mill:3,pines:3,gallows:3};const r=run(cfg.route,cfg.wpm,cfg.acc,cfg.react,true);
    r.gpm_raw=r.time>0?Math.round(r.total/(r.time/60)):0;r.gpm=Math.round(r.total/((r.time+cfg.overhead)/60));out.runs.push(r)}
  catch(e){out.runs.push({err:String(e).slice(0,200)})}
  try{wrLeave()}catch(e){}
}
try{title()}catch(e){}
return out;
