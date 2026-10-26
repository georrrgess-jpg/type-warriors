/* Crooked Cue: reference physics (prototype for 96b_pz_phys.js). Pure functions, no DOM; the same code runs the live table
   and the AI's look-ahead. Units: table pixels (playfield W x H = 880 x 440, origin at the top-left cushion nose), seconds.
   Each ball: {id,x,y,vx,vy,ux,uy,es,on}. (vx,vy) = centre velocity; (ux,uy) = "roll velocity" = surface speed from spin
   (ux,uy == vx,vy means pure rolling; 0 = stun/sliding; opposite = draw); es = side spin (english) in px/s at the equator. */
const PZP={W:880,H:440,R:12,G:3390/* 9.81 m/s^2 in px (346 px/m) */,MUS:.2,MUR:.035,MUSP:.9/* side-spin decay, as a fraction of g */,
 EB:.95/* ball-ball restitution */,EC:.78/* cushion restitution */,CF:.97/* cushion tangential keep */,ENG:.35/* english -> rebound */,
 CM:31/* corner mouth: cushion stops this far from the corner along each rail */,SM:27/* side mouth half-width */,
 STOP:3,MAXV:3200};
/* the cushion nose as segments (ball centres stay R away from them) + pocket capture circles */
function pzpTable(){const {W,H,CM,SM}=PZP,S=[],P=[];const seg=(a,b,c,d)=>S.push([a,b,c,d]);
 /* rails */
 seg(CM,0,W/2-SM,0);seg(W/2+SM,0,W-CM,0);seg(CM,H,W/2-SM,H);seg(W/2+SM,H,W-CM,H);seg(0,CM,0,H-CM);seg(W,CM,W,H-CM);
 /* corner jaws (45 deg, angled back into the pocket) */
 const J=17;seg(CM,0,CM-J,-J);seg(0,CM,-J,CM-J);seg(W-CM,0,W-CM+J,-J);seg(W,CM,W+J,CM-J);
 seg(CM,H,CM-J,H+J);seg(0,H-CM,-J,H-CM+J);seg(W-CM,H,W-CM+J,H+J);seg(W,H-CM,W+J,H-CM+J);
 /* side jaws (slightly narrowing) */
 const K=16;seg(W/2-SM,0,W/2-SM+5,-K);seg(W/2+SM,0,W/2+SM-5,-K);seg(W/2-SM,H,W/2-SM+5,H+K);seg(W/2+SM,H,W/2+SM-5,H+K);
 /* pockets: [x,y,capture radius] - a ball whose centre gets inside drops */
 P.push([-9,-9,19],[W/2,-17,17],[W+9,-9,19],[-9,H+9,19],[W/2,H+17,17],[W+9,H+9,19]);
 return {S,P}}
const PZT=pzpTable();
/* cue strike: ang (rad), pow 0..1, spin a (side, -1..1), b (top/back, -1..1) */
function pzpStrike(c,ang,pow,a,b){const v=60+pow*(PZP.MAXV-60);c.vx=Math.cos(ang)*v;c.vy=Math.sin(ang)*v;
 const k=1.25*b;/* tip offset b*R/2 -> surface speed 5/2*v*(h/R) */c.ux=c.vx*k;c.uy=c.vy*k;c.es=v*.6*a}
/* advance the whole table by dt; ev collects events {t:'bb'|'cu'|'pk',a,b,s} for rules, sound and the AI */
function pzpStep(B,dt,ev){let mv=0;for(const b of B)if(b.on){const s=Math.hypot(b.vx,b.vy);if(s>mv)mv=s}
 const n=Math.max(1,Math.ceil(mv*dt/4)),h=dt/n,{R,G,MUS,MUR,MUSP}=PZP;
 for(let k=0;k<n;k++){
  for(const b of B){if(!b.on||(b.vx===0&&b.vy===0&&b.ux===0&&b.uy===0))continue;
   /* friction: slide until the surface speed matches the centre speed, then roll */
   const dx=b.ux-b.vx,dy=b.uy-b.vy,dl=Math.hypot(dx,dy);
   if(dl>.5){const a=MUS*G*h,ex=dx/dl,ey=dy/dl;if(a*3.5>=dl){/* reaches rolling inside this step: 5v+2u over 7 */const rx=(5*b.vx+2*b.ux)/7,ry=(5*b.vy+2*b.uy)/7;b.vx=b.ux=rx;b.vy=b.uy=ry}
    else{b.vx+=ex*a;b.vy+=ey*a;b.ux-=ex*a*2.5;b.uy-=ey*a*2.5}}
   else{const s=Math.hypot(b.vx,b.vy);if(s>0){const ns=Math.max(0,s-MUR*G*h);b.vx*=ns/s;b.vy*=ns/s}b.ux=b.vx;b.uy=b.vy}
   if(b.es){const d=MUSP*G*h*.15;b.es=Math.abs(b.es)<=d?0:b.es-Math.sign(b.es)*d}
   b.x+=b.vx*h;b.y+=b.vy*h}
  /* ball-ball */
  for(let i=0;i<B.length;i++){const p=B[i];if(!p.on)continue;for(let j=i+1;j<B.length;j++){const q=B[j];if(!q.on)continue;if(p.vx===0&&p.vy===0&&q.vx===0&&q.vy===0)continue;
   const dx=q.x-p.x,dy=q.y-p.y,d2=dx*dx+dy*dy;if(d2>=4*R*R||d2===0)continue;const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ov=2*R-d;
   p.x-=nx*ov/2;p.y-=ny*ov/2;q.x+=nx*ov/2;q.y+=ny*ov/2;
   const vr=(p.vx-q.vx)*nx+(p.vy-q.vy)*ny;if(vr<=0)continue;const J=(1+PZP.EB)/2*vr;
   p.vx-=J*nx;p.vy-=J*ny;q.vx+=J*nx;q.vy+=J*ny;if(ev)ev.push({t:'bb',a:p.id,b:q.id,s:vr})}}
  /* cushions and jaws */
  for(const b of B){if(!b.on||(b.vx===0&&b.vy===0))continue;/* cushions are only near the edges */if(b.x>40&&b.x<PZP.W-40&&b.y>40&&b.y<PZP.H-40)continue;for(const s of PZT.S){const ax=s[0],ay=s[1],sx=s[2]-ax,sy=s[3]-ay,L2=sx*sx+sy*sy;
    let t=((b.x-ax)*sx+(b.y-ay)*sy)/L2;t=t<0?0:t>1?1:t;const cx=ax+sx*t,cy=ay+sy*t,dx=b.x-cx,dy=b.y-cy,d2=dx*dx+dy*dy;if(d2>=R*R)continue;
    const d=Math.sqrt(d2)||1e-6,nx=dx/d,ny=dy/d;b.x+=nx*(R-d);b.y+=ny*(R-d);const vn=b.vx*nx+b.vy*ny;if(vn>=0)continue;
    const tx=-ny,ty=nx,vt=b.vx*tx+b.vy*ty,nvn=-vn*PZP.EC,nvt=vt*PZP.CF+b.es*PZP.ENG*Math.min(1,-vn/600);
    b.vx=nx*nvn+tx*nvt;b.vy=ny*nvn+ty*nvt;b.es*=.55;const un=b.ux*nx+b.uy*ny,ut=b.ux*tx+b.uy*ty;b.ux=nx*(-un*.4)+tx*ut;b.uy=ny*(-un*.4)+ty*ut;
    if(ev)ev.push({t:'cu',a:b.id,s:-vn})}}
  /* pockets */
  for(const b of B){if(!b.on||(b.vx===0&&b.vy===0))continue;for(let pi=0;pi<6;pi++){const p=PZT.P[pi];if((b.x-p[0])**2+(b.y-p[1])**2<p[2]*p[2]){b.on=false;b.pk=pi;b.vx=b.vy=b.ux=b.uy=0;if(ev)ev.push({t:'pk',a:b.id,p:pi});break}}
   /* safety: a ball that escapes the table (should not happen) is treated as pocketed in the nearest pocket */
   if(b.on&&(b.x<-40||b.x>PZP.W+40||b.y<-40||b.y>PZP.H+40)){b.on=false;b.pk=-1;if(ev)ev.push({t:'pk',a:b.id,p:-1})}}}
 /* settle */
 let moving=false;for(const b of B){if(!b.on)continue;if(Math.hypot(b.vx,b.vy)<PZP.STOP&&Math.hypot(b.ux,b.uy)<PZP.STOP){b.vx=b.vy=b.ux=b.uy=0;b.es=0}else moving=true}
 return moving}
/* run a whole shot headless (AI and tests): returns {ev,t} with the balls mutated in place */
function pzpRun(B,maxT){const ev=[];let t=0;const dt=1/120;while(t<(maxT||12)){t+=dt;if(!pzpStep(B,dt,ev))break}return {ev,t}}
/* rack: apex on the foot spot, 8 in the middle, a solid and a stripe in the back corners */
function pzpRack(rnd){const {W,H,R}=PZP,fx=W*.75,fy=H/2,B=[{id:0,x:W*.25,y:H/2}];rnd=rnd||Math.random;
 const sol=[1,2,3,4,5,6,7],str=[9,10,11,12,13,14,15],sh=a=>{for(let i=a.length-1;i>0;i--){const j=(rnd()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a};sh(sol);sh(str);
 const slots=[];for(let r=0;r<5;r++)for(let k=0;k<=r;k++)slots.push([r,k]);const ids=new Array(15).fill(0);
 const center=4/*row 2 middle*/,cA=10,cB=14;ids[center]=8;const s0=sol.pop(),t0=str.pop();if(rnd()<.5){ids[cA]=s0;ids[cB]=t0}else{ids[cA]=t0;ids[cB]=s0}
 const rest=sh(sol.concat(str));for(let i=0;i<15;i++)if(!ids[i])ids[i]=rest.pop();
 slots.forEach(([r,k],i)=>{const gap=.02;/* tiny gaps so the rack is not over-constrained */B.push({id:ids[i],x:fx+r*R*Math.sqrt(3)*(1+gap),y:fy+(k-r/2)*2*R*(1+gap)})});
 for(const b of B)Object.assign(b,{vx:0,vy:0,ux:0,uy:0,es:0,on:true});return B}
if(typeof module!=='undefined')module.exports={PZP,PZT,pzpStrike,pzpStep,pzpRun,pzpRack};
