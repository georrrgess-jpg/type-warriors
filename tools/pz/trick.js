/* node tools/pz/trick.js [n] : brute-force every trick shot (or puzzle n, 1-based) over angle, power and spin and report whether it is solvable,
   the widest contiguous winning angle window (degrees) and its settings, and whether just aiming straight at the first ball (the lazy shot) already wins.
   Rule of thumb for a fair puzzle: widest window >= 0.45 degrees (aim can be set to a fraction of a degree by pointing far from the cue ball) and lazy fails (except the first, plain puzzle). */
const Z=require('./load.js');
const mk=t=>{const B=[{id:0,x:t.cue[0],y:t.cue[1],on:true,vx:0,vy:0,ux:0,uy:0,es:0}];for(const [id,x,y] of t.balls)B.push({id,x,y,on:true,vx:0,vy:0,ux:0,uy:0,es:0});return B};
const shoot=(t,ang,pow,a,b)=>{const B=mk(t);Z.pzpStrike(B[0],ang,pow,a,b);const r=Z.pzpRun(B,16);return Z.pzTrickCheck(t.goal,r.ev,B)};
const STEP=.004,D=180/Math.PI;
function analyse(t,pows,spins,step){step=step||STEP;const out=[];for(const p of pows)for(const [a,b] of spins){let cur=null;for(let ang=-Math.PI;ang<Math.PI;ang+=step){if(shoot(t,ang,p,a,b).ok){if(cur&&ang-cur.hi<=step*1.5)cur.hi=ang;else{cur={lo:ang,hi:ang};out.push(Object.assign(cur,{p,a,b}))}}}}
 for(const c of out)c.w=(c.hi-c.lo+step)*D,c.mid=(c.lo+c.hi)/2*D;return out.sort((x,y)=>y.w-x.w)}
module.exports={mk,shoot,analyse};
if(require.main===module){
const only=process.argv[2]?+process.argv[2]:0,pows=[.3,.5,.7,.9],spins=[[0,0],[0,.6],[0,-.6],[.6,0],[-.6,0]];let bad=0;
Z.PZ_TRICK.forEach((t,i)=>{if(only&&only!==i+1)return;
 const f=t.balls[0],lazy=shoot(t,Math.atan2(f[2]-t.cue[1],f[1]-t.cue[0]),.6,0,0),res=analyse(t,pows,spins),best=res[0];
 const ok=best&&best.w>=.45&&(i===0||!lazy.ok);if(!ok)bad++;
 console.log(`#${i+1} ${t.n}: ${best?'solvable':'NO SOLUTION'}  widest window ${best?best.w.toFixed(1):0} deg  lazy=${lazy.ok?'WINS':'fails'}  ${ok?'OK':'<<< FIX'}`);
 for(const r of res.slice(0,3))console.log(`   pow ${r.p} spin(${r.a},${r.b}) window ${r.w.toFixed(1)} deg at ${r.mid.toFixed(1)} deg`)});
console.log(bad?`${bad} puzzles need work`:'all puzzles fair');process.exit(bad?1:0)}
