/* node tools/pz/ladder.js a:b c:d ...  (N=40 racks each, env N) : AI-vs-AI racks using the real personalities in PZ_REG.
   Prints the win rate of the first named regular, the average shots per rack and how the racks ended. */
const Z=require('./load.js');const {PZ_REG,pzpStrike,pzpRun,pzpRack,pzRng,pzrNew,pzrJudge,pzaDecide,pzaPlace,pzaBreak,pzaNoise}=Z;
function rack(A,Bp,breaker,rng){const B=pzpRack(rng);const st=pzrNew(B,breaker,{});st.visits[breaker]=1;const P=[A,Bp];let shots=0;
 const b0=pzaBreak(st,P[breaker],rng),n0=pzaNoise(b0,P[breaker],rng);pzpStrike(B[0],n0.ang,n0.pow,n0.a,n0.b);pzrJudge(st,pzpRun(B,15).ev);
 while(!st.over&&shots<150){const me=P[st.turn];if(st.bih){pzaPlace(st,me)}if(!B[0].on){B[0].on=true;B[0].x=220;B[0].y=220}
  const d=pzaDecide(st,me,rng,{});st.call=d.id===8?d.k:null;const n=pzaNoise(d,me,rng);pzpStrike(B[0],n.ang,n.pow,n.a,n.b);pzrJudge(st,pzpRun(B,12).ev);shots++}
 return {w:st.over?st.over.winner:-1,why:st.over?st.over.why:'cap',shots}}
const N=+process.env.N||40;
for(const pr of process.argv.slice(2)){const [a,b]=pr.split(':');let wa=0,sh=0,cap=0,t0=Date.now();const why={};
 for(let i=0;i<N;i++){const rng=pzRng(1000+i*7);const r=rack(PZ_REG[a].ai,PZ_REG[b].ai,i%2,rng);if(r.w===0)wa++;if(r.w<0)cap++;sh+=r.shots;why[r.why]=(why[r.why]||0)+1}
 console.log(`${a} vs ${b}: ${a} wins ${(wa/N*100).toFixed(0)}% of ${N} racks, avg shots ${(sh/N).toFixed(1)}, capped ${cap}, ends ${JSON.stringify(why)}, ${((Date.now()-t0)/N/1000).toFixed(1)} s/rack`)}
