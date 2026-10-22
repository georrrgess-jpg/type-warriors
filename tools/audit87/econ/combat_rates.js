function runCombat(n,wpm,acc,react,maxT,opts){opts=opts||{};
  const g0=P.gold,x0=P.xp;let lgSum=0;
  start(n,opts.kind);if(opts.hp){S.max=S.hp=99}if(opts.spd>1){setSpeed(opts.spd)}
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
    if(opts.spd>1){update(1/120*opts.spd);update(1/120*opts.spd)}else update(1/60);steps++;if(steps%3600===0)(opts.cp=opts.cp||[]).push([steps/3600,P.gold-g0,S.wave]);
  }
  const mins=steps/60/60;return {n,kind:opts.kind||'',wpm,mode:S.mode,wave:S.wave,round:S.round,kills:S.kills,runGold:S.gold,total:P.gold-g0,xp:P.xp-x0,mins:Math.round(mins*100)/100,gpm:Math.round((P.gold-g0)/mins),stars:P.stars[n],cp:opts.cp}
}

const out=[];P.xp=lvx(20);for(const a of ACH)P.ach[a.id]=1;P.camp=30;for(const id in MON)P.bs[id]=100000;window.__rbr=0;
for(let i=1;i<=30;i++)P.stars[i]=3;
const R=(n,w,o)=>{try{const r=runCombat(n,w,.95,.35,o.maxT||12,o);r.tag=o.tag||'';out.push(r)}catch(e){out.push({n,err:String(e).slice(0,300)})}try{title()}catch(e){}};
R(0,45,{hp:1,maxT:20,tag:'endless20'});
R(0,45,{hp:1,maxT:12,kind:'gy',tag:'gy12'});
R(0,45,{hp:1,maxT:12,kind:'bg',tag:'bg12'});
P.pres=10;R(31,45,{hp:1,tag:'astral31 replay pres10'});R(20,45,{hp:1,tag:'camp20 replay pres10'});P.pres=0;
R(31,45,{hp:1,tag:'astral31 replay pres0'});
return out;