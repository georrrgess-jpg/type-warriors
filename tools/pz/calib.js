/* node tools/pz/calib.js REGULAR TARGET_WIN [HUMAN_SIGMA=1.5] [N=80] [ITER=6] : find the aim sigma (degrees) that makes a "typical player" (an AI with the given sigma)
   win TARGET_WIN of the racks against that regular (the regular's other style knobs stay as they are). Common random numbers keep the search steady.
   node tools/pz/calib.js eval REGULAR HUMAN_SIGMA [N]  : just report the rack win rate of that player against the regular's current personality. */
const Z=require('./load.js');const {PZ_REG,pzpStrike,pzpRun,pzpRack,pzRng,pzrNew,pzrJudge,pzaDecide,pzaPlace,pzaBreak,pzaNoise}=Z;
function rack(A,Bp,breaker,rng){const B=pzpRack(rng);const st=pzrNew(B,breaker,{});st.visits[breaker]=1;const P=[A,Bp];let shots=0;
 const b0=pzaBreak(st,P[breaker],rng),n0=pzaNoise(b0,P[breaker],rng);pzpStrike(B[0],n0.ang,n0.pow,n0.a,n0.b);pzrJudge(st,pzpRun(B,15).ev);
 while(!st.over&&shots<150){const me=P[st.turn];if(st.bih){pzaPlace(st,me)}if(!B[0].on){B[0].on=true;B[0].x=220;B[0].y=220}
  const d=pzaDecide(st,me,rng,{});st.call=d.id===8?d.k:null;const n=pzaNoise(d,me,rng);pzpStrike(B[0],n.ang,n.pow,n.a,n.b);pzrJudge(st,pzpRun(B,12).ev);shots++}
 return st.over?st.over.winner:-1}
const human=s=>({sig:s,psig:.05,pos:.4,safe:.3,sTry:12,look:5,brk:s});
function winrate(reg,hs,N,sigOverride){const ai=Object.assign({},PZ_REG[reg].ai);if(sigOverride!=null){ai.sig=sigOverride}let w=0,n=0;
 for(let i=0;i<N;i++){const rng=pzRng(5000+i*13);const r=rack(human(hs),ai,i%2,rng);if(r>=0){n++;if(r===0)w++}}return w/Math.max(1,n)}
const a=process.argv.slice(2);
if(a[0]==='eval'){const reg=a[1],hs=+a[2]||1.5,N=+a[3]||80;console.log(`${reg}: a ${hs} deg player wins ${(winrate(reg,hs,N)*100).toFixed(0)}% of ${N} racks`)}
else{const reg=a[0],T=+a[1],hs=+a[2]||1.5,N=+a[3]||80,IT=+a[4]||6;let lo=Math.log(.12),hi=Math.log(7);const cur=PZ_REG[reg].ai.sig;
 // is the current sigma already on target?
 let best=cur,bw=winrate(reg,hs,N,cur);console.log(`${reg} start sig ${cur} -> ${(bw*100).toFixed(0)}% (target ${(T*100).toFixed(0)}%)`);
 for(let it=0;it<IT;it++){const mid=Math.exp((lo+hi)/2),w=winrate(reg,hs,N,mid);console.log(`  sig ${mid.toFixed(3)} -> ${(w*100).toFixed(0)}%`);if(Math.abs(w-T)<Math.abs(bw-T)){best=mid;bw=w}if(w<T)lo=Math.log(mid);else hi=Math.log(mid)}
 console.log(`RESULT ${reg} sig ${best.toFixed(3)} (a ${hs} deg player wins ${(bw*100).toFixed(0)}% of racks)`)}
