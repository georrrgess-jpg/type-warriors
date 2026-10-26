const {PZP,pzpStrike,pzpRun,pzpRack}=require('./pzphys.js');const {pzrNew,pzrJudge}=require('./pzrules.js');const {pzaDecide,pzaPlace,pzaNoise}=require('./pzai.js');
const L={gloop:{sig:2.6,psig:.14,pos:0,safe:0,look:3},moldwick:{sig:1.9,psig:.1,pos:.1,safe:.15,sTry:12,look:4},grizzle:{sig:1.6,psig:.12,pos:.1,safe:0,look:4},
 vesper:{sig:1.25,psig:.08,pos:.25,safe:.4,sTry:24,look:5},barnacle:{sig:1.0,psig:.07,pos:.3,safe:.3,sTry:20,look:5},hoot:{sig:.75,psig:.05,pos:.6,safe:.3,sTry:24,look:6},mortimer:{sig:.32,psig:.03,pos:.8,safe:.3,sTry:28,look:8}};
function rack(A,Bp,breaker){const B=pzpRack();const st=pzrNew(B,breaker);const P=[A,Bp];let shots=0,runs=[0,0],cur=0,maxRun=[0,0],bnr=false;
 /* break */
 B[0].y=220+(Math.random()-.5)*40;const ap=B.find(b=>b.id&&Math.abs(b.y-220)<1&&b.x<700);pzpStrike(B[0],Math.atan2(ap.y-B[0].y,ap.x-B[0].x)+(Math.random()-.5)*.01,1,0,0);
 let r=pzrJudge(st,pzpRun(B,15).ev);let breakerKept=r.keep;
 while(!st.over&&shots<200){const me=P[st.turn];if(st.bih)pzaPlace(st,me);const d=pzaDecide(st,me);st.call=d.k!=null&&d.id===8?d.k:null;const n=pzaNoise(d,me);pzpStrike(B[0],n.ang,n.pow,n.a,n.b);const who=st.turn;
  r=pzrJudge(st,pzpRun(B,12).ev);shots++;if(st.call!=null&&st.over)null;if(r.keep&&!r.foul){cur++;if(cur>maxRun[who])maxRun[who]=cur}else cur=0;if(r.foul&&!B[0].on){B[0].on=true}}
 if(st.over&&st.over.winner===breaker&&breakerKept&&shots===st.inn[0]+st.inn[1]+shots&&0)bnr=true;
 return {w:st.over?st.over.winner:-1,why:st.over?st.over.why:'cap',shots,golden:st.golden}}
const pairs=process.argv.slice(2).map(s=>s.split(':'));const N=+process.env.N||40;
for(const [a,b] of pairs){let wa=0,sh=0,why={},t0=Date.now();for(let i=0;i<N;i++){const res=rack(L[a],L[b],i%2);if(res.w===0)wa++;sh+=res.shots;why[res.why]=(why[res.why]||0)+1}
 console.log(`${a} vs ${b}: ${a} wins ${(wa/N*100).toFixed(0)}% of ${N} racks, avg shots ${(sh/N).toFixed(1)}, ends ${JSON.stringify(why)}, ${((Date.now()-t0)/N/1000).toFixed(1)} s/rack`)}
