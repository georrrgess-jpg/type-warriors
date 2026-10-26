/* Crooked Cue: reference opponent AI (prototype for 96d_pz_ai.js).
   1. Candidates: every legal target x every pocket. Ghost-ball aim; lines must be clear; cut < 80 deg; steep side-pocket entries dropped.
   2. Analytic pot chance: the cue aim tolerance is tolA = (pocket slack / object-to-pocket distance) * 2R cos(cut) / cue-to-ghost distance;
      with a Gaussian aim error sigma, P = erf(tolA / (sigma * sqrt 2)).
   3. The best few candidates are simulated noise-free with 3 spins x 2 powers: drop scratches and misses, then add position value
      (the best analytic chance of the next shot from where the cue ball stops), weighted by the monster's `pos`.
   4. If the best chance is below the monster's `safe` threshold, look for a safety: a legal soft shot that leaves the opponent the
      lowest best chance.
   5. The chosen shot is executed with the monster's noise on angle, power and spin. */
const {PZP,PZT,pzpStrike,pzpRun}=typeof require!=='undefined'?require('./pzphys.js'):window;
const {pzrTargets,grpOf}=typeof require!=='undefined'?require('./pzrules.js'):window;
const PZAIM=[[-2,-2],[440,-7],[882,-2],[-2,442],[440,447],[882,442]];/* where to send the object ball (inside each pocket mouth) */
const PZSLACK=[9,7,9,9,7,9];/* half-width the object ball centre can miss by and still drop */
function erf(x){const t=1/(1+.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-x*x);return x>=0?y:-y}
function clear(B,ax,ay,bx,by,skip){const R=PZP.R,dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;for(const b of B){if(!b.on||skip.includes(b.id))continue;let t=((b.x-ax)*dx+(b.y-ay)*dy)/L2;if(t<0||t>1)continue;const cx=ax+dx*t,cy=ay+dy*t;if((b.x-cx)**2+(b.y-cy)**2<4*R*R*.98)return false}return true}
function pzaCands(B,cue,targets,sigma){const R=PZP.R,out=[];for(const id of targets){const t=B.find(b=>b.id===id&&b.on);if(!t)continue;
 for(let k=0;k<6;k++){const [ax,ay]=PZAIM[k],dx=ax-t.x,dy=ay-t.y,dl=Math.hypot(dx,dy),ux=dx/dl,uy=dy/dl;
  if((k===1||k===4)&&Math.abs(uy)<.5)continue;/* side pockets need a fairly square entry */
  const gx=t.x-ux*2*R,gy=t.y-uy*2*R,cx=gx-cue.x,cy=gy-cue.y,cl=Math.hypot(cx,cy);if(cl<1)continue;const cos=(cx*ux+cy*uy)/cl;if(cos<.17)continue;/* cut over ~80 deg */
  if(!clear(B,cue.x,cue.y,gx,gy,[0,id])||!clear(B,t.x,t.y,ax,ay,[0,id]))continue;
  const tol=(PZSLACK[k]/dl)*2*R*cos/cl,p=erf(tol/(sigma*Math.SQRT2));
  out.push({id,k,ang:Math.atan2(cy,cx),p,cut:Math.acos(Math.min(1,cos)),d1:cl,d2:dl})}}return out.sort((a,b)=>b.p-a.p)}
const clone=B=>B.map(b=>Object.assign({},b));
/* power needed: enough to send the object ball to the pocket and leave the cue ball moving a little */
function pzaPow(c,m){return Math.min(.95,.12+(c.d1+c.d2*1.6/Math.max(.25,Math.cos(c.cut)))/2600*m)}
function pzaDecide(st,me){const B=st.B,cue=B[0],sig=me.sig*Math.PI/180,tg=pzrTargets(st),grp=st.grp[st.turn];
 const cs=pzaCands(B,cue,tg,sig);let best=null;
 for(const c of cs.slice(0,me.look||5))for(const b of [-.7,0,.7])for(const m of [1,1.5]){const C=clone(B);const pw=pzaPow(c,m);pzpStrike(C[0],c.ang,pw,0,b);const r=pzpRun(C,10);
  const pk=r.ev.filter(e=>e.t==='pk').map(e=>e.a);if(pk.includes(0)||!pk.includes(c.id))continue;if(c.id!==8&&pk.includes(8))continue;
  let pos=0;if(me.pos){const nst={B:C,turn:st.turn,grp:st.grp,open:st.open};const nt=pzrTargets(Object.assign({},st,{B:C}));const nc=pzaCands(C,C[0],nt.length?nt:[8],sig);pos=nc.length?nc[0].p:0}
  const sc=c.p+me.pos*pos;if(!best||sc>best.sc)best={sc,ang:c.ang,pow:pw,b,a:0,id:c.id,k:c.k,p:c.p}}
 if(best&&best.p>=me.safe)return best;
 /* safety */
 if(me.safe>0){let sb=null;for(let i=0;i<me.sTry||0;i++){const ang=Math.random()*Math.PI*2,pw=.12+Math.random()*.2,C=clone(B);pzpStrike(C[0],ang,pw,0,-.3);const r=pzpRun(C,8);
   let first=null,rail=false;for(const e of r.ev){if(e.t==='bb'&&first===null&&(e.a===0||e.b===0))first=e.a===0?e.b:e.a;if(e.t==='cu'&&first!==null)rail=true}
   const pk=r.ev.filter(e=>e.t==='pk').map(e=>e.a);if(first===null||!tg.includes(first)||!rail||pk.includes(0)||pk.includes(8))continue;
   const ot=[];const og=st.grp[1-st.turn];for(const b of C)if(b.on&&b.id&&(st.open?b.id!==8:grpOf(b.id)===og))ot.push(b.id);const oc=pzaCands(C,C[0],ot.length?ot:[8],1.2*Math.PI/180);const op=oc.length?oc[0].p:0;
   if(!sb||op<sb.op)sb={op,ang,pow:pw,b:-.3,a:0,safety:true}}
  if(sb&&(!best||sb.op<.5))return sb}
 if(best)return best;
 /* nothing: hit the nearest legal ball firmly */
 let nb=null;for(const id of tg){const t=B.find(b=>b.id===id&&b.on);if(!t)continue;const d=Math.hypot(t.x-cue.x,t.y-cue.y);if(!nb||d<nb.d)nb={d,ang:Math.atan2(t.y-cue.y,t.x-cue.x)}}
 return {ang:nb?nb.ang:0,pow:.45,b:0,a:0,kick:true}}
/* ball in hand: try a grid of spots and keep the one with the best next shot */
function pzaPlace(st,me){const B=st.B,cue=B[0],sig=me.sig*Math.PI/180,tg=pzrTargets(st);let best=null;
 for(let x=40;x<=(st.kitchen?220:840);x+=40)for(let y=40;y<=400;y+=40){if(B.some(b=>b.on&&b.id&&Math.hypot(b.x-x,b.y-y)<2*PZP.R+2))continue;cue.x=x;cue.y=y;
  const cs=pzaCands(B,cue,tg,sig);const p=cs.length?cs[0].p:0;if(!best||p>best.p)best={x,y,p}}
 cue.on=true;cue.x=best?best.x:220;cue.y=best?best.y:220;cue.vx=cue.vy=cue.ux=cue.uy=cue.es=0}
function pzaNoise(s,me){const g=()=>{let u=0;for(let i=0;i<6;i++)u+=Math.random();return (u-3)/Math.sqrt(.5)};/* ~N(0,1) */
 return {ang:s.ang+g()*me.sig*Math.PI/180,pow:Math.max(.05,Math.min(1,s.pow*(1+g()*me.psig))),b:Math.max(-1,Math.min(1,(s.b||0)+g()*.15)),a:Math.max(-1,Math.min(1,(s.a||0)+g()*.15))}}
if(typeof module!=='undefined')module.exports={pzaDecide,pzaPlace,pzaNoise,pzaCands};
