/* node tools/pz/trickgen.js KIND [tries] : search random layouts for a puzzle that is fair (window >= 3 deg, the lazy shot fails).
   KIND: combo (hit ball A, A pots B) | two (one stroke pots two balls) | bank | kick. Prints candidate layouts as PZ_TRICK balls/cue. */
const Z=require('./load.js'),{shoot,analyse}=require('./trick.js');
const kind=process.argv[2]||'two',tries=+process.argv[3]||400,rnd=Z.pzRng(+process.argv[4]||7);
const R=(a,b)=>a+rnd()*(b-a);const ok=(x,y,L)=>L.every(o=>Math.hypot(o[0]-x,o[1]-y)>34);
let found=0;
for(let k=0;k<tries&&found<4;k++){const pos=[];const put=(lo,hi,lo2,hi2)=>{for(let i=0;i<30;i++){const x=R(lo,hi),y=R(lo2,hi2);if(ok(x,y,pos)){pos.push([x,y]);return pos.length-1}}return -1};
 let t;
 const cue=put(120,420,80,360);const a=put(300,780,60,380),b=put(300,800,60,380);if(cue<0||a<0||b<0)continue;
 const r=v=>Math.round(v/10)*10;const P=pos.map(p=>[r(p[0]),r(p[1])]);
 if(kind==='two')t={n:'two',balls:[[3,...P[a]],[11,...P[b]]],cue:P[cue],goal:{pot:[3,11]}};
 else if(kind==='combo')t={n:'combo',balls:[[2,...P[a]],[7,...P[b]]],cue:P[cue],goal:{pot:[7],first:2}};
 else if(kind==='bank')t={n:'bank',balls:[[5,...P[a]]],cue:P[cue],goal:{pot:[5],bank:[5]}};
 else t={n:'kick',balls:[[6,...P[a]],[9,...P[b]]],cue:P[cue],goal:{pot:[6],kick:1}};
 const f=t.balls[0],lazy=shoot(t,Math.atan2(f[2]-t.cue[1],f[1]-t.cue[0]),.6,0,0);if(lazy.ok)continue;
 const res=analyse(t,[.7,.9],[[0,0]],.008);if(res[0]&&res[0].w>=3){found++;console.log(JSON.stringify({balls:t.balls,cue:t.cue,goal:t.goal}),'window',res[0].w.toFixed(1),'at',res[0].mid.toFixed(0),'pow',res[0].p)}}
console.log('done',found);
