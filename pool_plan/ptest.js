const {PZP,pzpStrike,pzpRun,pzpRack}=require('./pzphys.js');
const mk=(id,x,y)=>({id,x,y,vx:0,vy:0,ux:0,uy:0,es:0,on:true});
const R=PZP.R;
/* 1. straight-in: object ball at (660,220) toward the right-side... use the top-right corner: aim through ghost ball */
function cut(cb,ob,px,py,pow,b,a){const dx=px-ob.x,dy=py-ob.y,l=Math.hypot(dx,dy),gx=ob.x-dx/l*2*R,gy=ob.y-dy/l*2*R;pzpStrike(cb,Math.atan2(gy-cb.y,gx-cb.x),pow,a||0,b||0)}
let B=[mk(0,300,300),mk(3,600,150)];cut(B[0],B[1],880+9,-9,.35);let r=pzpRun(B);
console.log('1 cut to corner: 3 pocketed',!B[1].on,'pocket',B[1].pk,'cue on',B[0].on,'time',r.t.toFixed(2));
/* 2. straight draw: cue 300 behind, full hit, low spin -> cue comes back */
for(const [nm,b] of [['draw',-1],['stun',0],['follow',1]]){B=[mk(0,440,400),mk(1,440,140)];pzpStrike(B[0],-Math.PI/2,.3,0,b);r=pzpRun(B);console.log('2 '+nm+': object in',!B[1].on,'cue y after',B[0].on?B[0].y.toFixed(0):'POCKETED','(contact at y~164)')}
/* 3. side pocket straight */
B=[mk(0,440,300),mk(5,440,120)];pzpStrike(B[0],-Math.PI/2,.3,0,0);r=pzpRun(B);console.log('3 side pocket: 5 in',!B[1].on,'pocket',B[1].pk);
/* 4. rail roll: ball along the rail into the corner */
B=[mk(0,200,R+.5)];pzpStrike(B[0],0,.45,0,0);r=pzpRun(B);console.log('4 rail roll into corner: in',!B[0].on,B[0].pk);
/* 5. lag: speed to travel ~2 lengths */
B=[mk(0,100,220)];pzpStrike(B[0],0,.25,0,0);r=pzpRun(B,20);console.log('5 lag pow .25: final x',B[0].x.toFixed(0),'y',B[0].y.toFixed(0),'t',r.t.toFixed(1));
/* 6. breaks */
let pots=0,bt=0,sc=0,eight=0,N=40,maxT=0,spread=0;let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
for(let i=0;i<N;i++){B=pzpRack(rnd);const cb=B[0];cb.y=220+(rnd()-.5)*60;const ap=B.find(b=>b.id&&Math.abs(b.y-220)<1&&b.x<700);pzpStrike(cb,Math.atan2(ap.y-cb.y,ap.x-cb.x),1,0,0);
 const t0=Date.now();r=pzpRun(B,15);bt+=Date.now()-t0;maxT=Math.max(maxT,r.t);pots+=B.filter(b=>!b.on&&b.id).length;if(!B[0].on)sc++;if(!B.find(b=>b.id===8).on)eight++;
 const on=B.filter(b=>b.on);const mx=on.reduce((a,b)=>a+b.x,0)/on.length,my=on.reduce((a,b)=>a+b.y,0)/on.length;spread+=Math.sqrt(on.reduce((a,b)=>a+(b.x-mx)**2+(b.y-my)**2,0)/on.length)}
console.log('6 breaks: avg pocketed',(pots/N).toFixed(2),'scratch',sc,'8 on break',eight,'avg sim ms',(bt/N).toFixed(1),'max settle s',maxT.toFixed(1),'avg spread px',(spread/N).toFixed(0));
/* 7. AI cost: 200 random mid-power shots on a broken rack */
seed=7;B=pzpRack(rnd);pzpStrike(B[0],0,1,0,0);pzpRun(B,15);const snap=JSON.stringify(B);let t0=Date.now(),tt=0;
for(let i=0;i<200;i++){const C=JSON.parse(snap);if(!C[0].on){C[0].on=true;C[0].x=220;C[0].y=220}pzpStrike(C[0],rnd()*6.28,.2+rnd()*.5,rnd()*2-1,rnd()*2-1);tt+=pzpRun(C,10).t}
console.log('7 AI sims: ms per shot',((Date.now()-t0)/200).toFixed(2),'avg game time',(tt/200).toFixed(1),'s');
