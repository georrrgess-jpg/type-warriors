/* node tools/pz/pzd_bal.js [N=120] [HUMAN_SIGMA=1.5] [ids...] : 10.7 Gilded Hoard balance. A "typical player" (calib.js's human, aim sigma
   1.5 deg) plays N racks against each player (their real PZ_REG personality; 97b1 / 97bb AI styles applied: clutch on the 8, streak, glitch,
   hoard). Prints the rack win rate, the match win rate for the player's race (exact binomial race), win% x multiplier (expected return
   on a paid match at full multiplier) and the same with the stake back counted (return per gold staked). Common random numbers. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=path.join(__dirname,'..','..','type-warriors-source');
const src=['96a_pz_data.js','96b_pz_phys.js','96c_pz_rules.js','96d_pz_ai.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8')).join('\n');
const ctx=vm.createContext({Math,console,Float32Array,Int32Array,Uint8Array,Object,Array,JSON,Set,Map,Date,TAU:Math.PI*2,P:{}});
vm.runInContext(src,ctx,{filename:"pool-modules"});vm.runInContext("PZS=()=>({beat:{},rep:{}});pzOpen=()=>true;",ctx);
/* the data modules only need PZ_REG and a few tables from 96a/96i: give them empty stand-ins */
vm.runInContext(`var PZ_THINK={},PZ_MONH={},PZ_TIPS={},PZ97_HOUSE={},PZ97_PLATE={},PZ_SHORT={},PZ97_BUST={},PZ_CHIPC={};var pzCueSprite=()=>null,pzBeginTurn=()=>0,pzAiBegin=()=>0,pzAiFire=()=>0,pzGuideMode=()=>0,pzHudAll=()=>0,PZ={};`,ctx);
for(const f of['97b1_pzn_data.js','97bb_pzd_data.js']){try{vm.runInContext(fs.readFileSync(path.join(D,f),'utf8'),ctx,{filename:f})}catch(e){console.error(f,e.message)}}
const Z=vm.runInContext('({PZ_REG,pzpStrike,pzpRun,pzpRack,pzRng,pzrNew,pzrJudge,pzaDecide,pzaPlace,pzaBreak,pzaNoise,pzrOn8,pzdAiK:typeof pzdAiK==="function"?pzdAiK:null})',ctx);
const {PZ_REG,pzpStrike,pzpRun,pzpRack,pzRng,pzrNew,pzrJudge,pzaDecide,pzaPlace,pzaBreak,pzaNoise,pzrOn8}=Z;
/* the styles that live in the page's wrappers, applied the same way here */
function styled(me,st,run){const m=Object.assign({},me);if(m.streak&&run>0)m.sig*=Math.max(.6,1-.12*run);if(m.clutch&&!st.brk&&pzrOn8(st))m.sig*=m.clutch;if(Z.pzdAiK)Z.pzdAiK(m,st,run);return m}
function rack(A,Bp,breaker,rng,house){const B=pzpRack(rng);const st=pzrNew(B,breaker,house||{});st.visits[breaker]=1;const P=[A,Bp];let shots=0,run=0,last=-1;
 const b0=pzaBreak(st,P[breaker],rng),n0=pzaNoise(b0,P[breaker],rng);pzpStrike(B[0],n0.ang,n0.pow,n0.a,n0.b);pzrJudge(st,pzpRun(B,15).ev);
 while(!st.over&&shots<150){const who=st.turn;run=(who===1&&last===1)?run+1:0;last=who;const me=who===1?styled(P[1],st,run):P[0];if(st.bih){pzaPlace(st,me)}if(!B[0].on){B[0].on=true;B[0].x=220;B[0].y=220}
  const d=pzaDecide(st,me,rng,{});st.call=d.id===8?d.k:null;const n=pzaNoise(d,me,rng);pzpStrike(B[0],n.ang,n.pow,n.a,n.b);pzrJudge(st,pzpRun(B,12).ev);shots++}
 return st.over?st.over.winner:-1}
const human=s=>({sig:s,psig:.05,pos:.4,safe:.3,sTry:12,look:5,brk:s});
/* race to n, alternating breaks (winner-breaks changes little for a typical player): exact binomial */
function matchP(p,n){let s=0;const C=(a,b)=>{let r=1;for(let i=1;i<=b;i++)r=r*(a-b+i)/i;return r};for(let k=0;k<n;k++)s+=C(n-1+k,k)*Math.pow(p,n)*Math.pow(1-p,k);return s}
const a=process.argv.slice(2),N=+a[0]||120,hs=+a[1]||1.5,ids=a.slice(2).length?a.slice(2):['mortimer','vantara','clasp','zephyra','brass','hornsby','aurelion'].filter(k=>PZ_REG[k]);
for(const id of ids){const R=PZ_REG[id];let w=0,n=0;const t0=Date.now();
 for(let i=0;i<N;i++){const rng=pzRng(5000+i*13);const r=rack(human(hs),R.ai,i%2,rng,R.house&&R.house.winnerBreaks?{}:{});if(r>=0){n++;if(r===0)w++}}
 const p=w/Math.max(1,n),mp=matchP(p,R.race);
 console.log(`${id.padEnd(9)} race ${R.race} x${R.mult}: rack ${(p*100).toFixed(0)}%  match ${(mp*100).toFixed(0)}%  win%*mult ${(mp*R.mult).toFixed(2)}  (${((Date.now()-t0)/1000).toFixed(0)} s)`)}
