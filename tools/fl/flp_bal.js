// Companion balance bot (10.4 harvest companions). Run by flp_balance.py as the body of  async (cfg) => { ... }
//   cfg = {pet, seed, wpm, acc, react, cap, scn}
// Plays Endless (or a campaign level, scn) with REAL hearts until the run ends or `cap` game-minutes pass. The bot types the nearest
// word at `wpm` with `acc` accuracy after a `react` pause for each new monster, presses SPACE on a weak boss, and unleashes a READY
// companion power 0.35 s after it is ready (only when it would do something), like an attentive player. Math.random is seeded.
{let a=(cfg.seed|0)||1;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
P.xp=lvx(20);P.pres=0;P.upg={};for(const a of ACH)P.ach[a.id]=1;P.camp=30;for(const id in MON)P.bs[id]=100000;window.__rbr=0;for(let i=1;i<=30;i++)P.stars[i]=3;
P.weapon='rusty';P.armor='rags';P.path='knight';P.own=P.own||{};P.own.rusty=1;P.ownA=P.ownA||{};P.ownA.rags=1;
P.pets={};if(cfg.pet){P.pets[cfg.pet]={b:0,nk:'',pal:0,acc:0,trim:0,cel:0,t:1}}P.pet=cfg.pet||'';P.petSt=2;petNorm();
const g0=P.gold;start(cfg.scn||0);
let bud=0,wait=0,steps=0,rdT=0,hits=0,hp0=S.hp;const cps=cfg.wpm*5/60,seen=new WeakSet(),maxSteps=cfg.cap*3600;
{const d0=dmg;window.__flbDmg=d0;dmg=function(d){const h=S.hp;const r=d0.apply(this,arguments);if(S.hp<h)hits+=h-S.hp;return r}}
while(steps<maxSteps){
 if(S.mode==='over')break;
 if(S.mode==='boon'&&S.swap){const b=$('bsk');if(b)b.click();steps++;continue}
 if(S.mode==='boon'){try{pickBoon(0)}catch(e){const b=ov.querySelector('button');if(b)b.click()}steps++;continue}
 if(S.mode!=='play'){const b=ov.querySelector('.bc,button');if(b)b.click();update(1/60);steps++;continue}
 if(S.cine){key('a');update(1/60);steps++;continue}
 const p=S.pet;if(p&&p.ready&&!p.go&&typeof pmManual==='function'&&pmManual(p)){rdT+=1/60;if(rdT>.35&&pmWhyNot(p)===''){petUnleash('bot');rdT=0}}else rdT=0;
 bud+=cps/60;if(wait>0)wait-=1/60;
 if(S.en.some(e=>e.vul>0))key(' ');
 while(bud>=1&&wait<=0&&S.mode==='play'){
  let t=S.tgt;if(t&&(!S.en.includes(t)||t.vul>0))t=null;
  if(!t||t.i===0){let b=null;for(const e of S.en)if(e.x<W-10&&!(e.vul>0)&&(!b||e.x<b.x))b=e;if(!b)break;if(!seen.has(b)){seen.add(b);wait=cfg.react;break}t=b}
  let c=t.w[t.i];if(Math.random()>cfg.acc&&c!==' ')c=c==='q'?'z':'q';key(c);bud-=1}
 update(1/60);steps++}
dmg=window.__flbDmg;
const p=S.pet,out={pet:cfg.pet||'none',seed:cfg.seed,end:S.mode,wave:S.wave,score:Math.round(S.score),kills:S.kills,gold:P.gold-g0,mins:Math.round(steps/36)/100,hits,uses:p?p.uses:0,heals:p?(p.heals|0):0,shs:p?(p.shs|0):0};
try{S.mode='over';title()}catch(e){}
return out;
