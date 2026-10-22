const out=[];
function run(id,wpm,acc,react){
  wrStart(id);const R=WRX;let bud=0,wait=0,steps=0;const cps=wpm*5/60;
  // skip any intro: ensure rolling
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
      if(Math.random()>acc){c='q'===c?'z':'q'}  // a miss
      wrKey(c);bud-=1;
    }
    wrUpdate(1/60);steps++;
  }
  const r=R.result||{};return {id,wpm,acc,won:r.won,med:r.med,pay:r.pay,coins:r.coins,total:r.total,first:r.first,xp:r.xp,time:Math.round((r.time||steps/60)*10)/10,int:r.int,kills:r.kills,steps:steps/60};
}
P.wr=P.wr||{};
for(const id of ['mill','pines','gallows'])for(const [wpm,acc] of [[30,.93],[45,.95],[60,.97]])for(let k=0;k<3;k++){try{WRP().med={mill:3,pines:3,gallows:3};out.push(run(id,wpm,acc,.35))}catch(e){out.push({id,err:String(e).slice(0,200)})}try{wrLeave()}catch(e){}}
return out;
