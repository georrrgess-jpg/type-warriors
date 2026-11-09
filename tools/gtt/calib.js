// Calibrates each runner's spd so the overall win share per start is about equal (then going/weather make the differences).
//   node calib.js '{"gof":0.016}' [rounds] [races]    prints the spd table to paste into 99u_gtt_data.js
const load=require('./load.js'),G=load();Object.assign(G.GTTM,JSON.parse(process.argv[2]||'{}'));
const ROUNDS=+process.argv[3]||5,RACES=+process.argv[4]||30000;const rng=G.gttRng(31337);
const GAIN=+process.argv[5]||0.06;const spd=G.GTT_RUN.map(r=>r.spd);
for(let round=0;round<ROUNDS;round++){
 G.GTT_RUN.forEach((r,i)=>{r.spd=spd[i]});const win={},st={};G.GTT_RUN.forEach(r=>{win[r.id]=0;st[r.id]=0});
 const per=40,cards=RACES/per;
 for(let c=0;c<cards;c++){const card=G.gttCard((rng()*4e9)|0),K=G.gttKFor(card);card.field.forEach(id=>st[id]+=per);
  for(let k=0;k<per;k++){const s=G.gttRun(card,(rng()*4294967296)|0,{fast:true,K});win[card.field[s.order[0]]]++}}
 const sh=G.GTT_RUN.map(r=>win[r.id]/st[r.id]);const mean=sh.reduce((a,b)=>a+b,0)/12;
 console.log('round',round,sh.map(v=>(v*100).toFixed(1)).join(' '));
 if(round<ROUNDS-1)for(let i=0;i<12;i++)spd[i]+=GAIN*(1/6-sh[i]);
}
console.log(G.GTT_RUN.map((r,i)=>r.id+':'+spd[i].toFixed(4)).join(' '));
