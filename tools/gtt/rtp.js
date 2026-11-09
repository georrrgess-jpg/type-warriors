// Headless check of the Great Turkey Trot model: return per bet type, per runner, cash out vs hold, cap, determinism, distribution.
//   node tools/gtt/rtp.js [--quick] [--races N] [--cpr N]      (default 200000 races; --quick 20000)
const path=require('path'),cp=require('child_process');
const load=require('./load.js'),G=load();
const A=process.argv.slice(2),QUICK=A.includes('--quick'),arg=(k,d)=>{const i=A.indexOf(k);return i>=0?+A[i+1]:d};
const RACES=arg('--races',QUICK?20000:200000),CPR=arg('--cpr',A.includes('--quick')?250:400),CARDS=Math.max(8,Math.round(RACES/CPR)),NCO=arg('--co',QUICK?250:400);
if(A.includes('--hash')){ // child mode for the cross-process determinism check
  let h=0;for(let i=0;i<150;i++){const c=G.gttCard(i*13+5),st=G.gttRun(c,i*977+3);for(const t of st.times)h=(Math.imul(h,31)+Math.round(t*1e6))|0;h=(Math.imul(h,31)+st.ev.length)|0;h=(Math.imul(h,31)+st.order.join('').length*7+st.order.reduce((a,b,j)=>a+b*(j+1),0))|0}
  console.log('HASH '+h);process.exit(0)}
let fails=0;const bad=(m)=>{fails++;console.log('  FAIL '+m)};
const T0=Date.now();
const rng=G.gttRng(20251105);
const types=['win','top2','top3','exact'],acc={};for(const k of types)acc[k]={st:0,pay:0,cards:[]};
const perRun={};for(const r of G.GTT_RUN)perRun[r.id]={n:0,sum:0,sq:0,wins:0,races:0};
let nRaces=0,favW=0,lsW=0,photo=0,tsum=0,tmin=99,tmax=0,photoGaps=0,favP=0;const winners={};
let capMax=0,evCount={};
for(let c=0;c<CARDS;c++){
  const card=G.gttCard((rng()*4e9)|0),pr=G.gttPriceSync(card),K=G.gttKFor(card);
  const N=6;let fi=0,li=-1,lp=9;for(let i=0;i<N;i++){if(pr.win[i]>pr.win[fi])fi=i;if(pr.mult.win[i]!=null&&pr.win[i]<lp){lp=pr.win[i];li=i}}
  const cs={};for(const k of types)cs[k]={st:0,pay:0};
  const offered={win:0,top2:0,top3:0,exact:0};
  for(let i=0;i<N;i++){for(const k of ['win','top2','top3'])if(pr.mult[k][i]!=null)offered[k]++;for(let j=0;j<N;j++)if(i!==j&&pr.mult.exact[i][j]!=null)offered.exact++}
  for(const k of types)cs[k].st=offered[k]*CPR;
  for(const id of card.field)perRun[id].races++;
  for(let r=0;r<CPR;r++){
    const st=G.gttRun(card,(rng()*4294967296)|0,{fast:true,K}),o=st.order;nRaces++;
    if(o[0]===fi)favW++;if(o[0]===li)lsW++;if(st.photo){photo++}tsum+=st.t;if(st.t<tmin)tmin=st.t;if(st.t>tmax)tmax=st.t;
    winners[card.field[o[0]]]=(winners[card.field[o[0]]]||0)+1;
    const w=pr.mult.win[o[0]]||0;cs.win.pay+=w;
    cs.top2.pay+=(pr.mult.top2[o[0]]||0)+(pr.mult.top2[o[1]]||0);
    cs.top3.pay+=(pr.mult.top3[o[0]]||0)+(pr.mult.top3[o[1]]||0)+(pr.mult.top3[o[2]]||0);
    cs.exact.pay+=pr.mult.exact[o[0]][o[1]]||0;
    // per runner win return (unit bets on every offered runner)
    for(let i=0;i<N;i++){const m=pr.mult.win[i];if(m==null)continue;const x=i===o[0]?m:0;const q=perRun[card.field[i]];q.n++;q.sum+=x;q.sq+=x*x;if(i===o[0])q.wins++}
  }
  for(const k of types){acc[k].st+=cs[k].st;acc[k].pay+=cs[k].pay;acc[k].cards.push(cs[k].st?cs[k].pay/cs[k].st:0)}
}
const simT=(Date.now()-T0)/1000;
console.log(`Races ${nRaces} on ${CARDS} cards (${simT.toFixed(0)} s)`);
console.log('\nReturn per bet type (flat unit bets on every offered selection; published multipliers)');
const bounds={win:[.90,.965],top2:[.90,.965],top3:[.90,.965],exact:[.90,.965]};
for(const k of types){const a=acc[k],ret=a.pay/a.st;const mu=a.cards.reduce((s,v)=>s+v,0)/a.cards.length;const sd=Math.sqrt(a.cards.reduce((s,v)=>s+(v-mu)*(v-mu),0)/Math.max(1,a.cards.length-1));const se=sd/Math.sqrt(a.cards.length);
  const ok=ret>=bounds[k][0]&&ret<=bounds[k][1];console.log(`  ${k.padEnd(6)} ${ret.toFixed(4)}  (+-${se.toFixed(4)})  ${ok?'ok':'OUT OF BOUNDS'}`);if(!ok)bad(`${k} return ${ret.toFixed(4)}`)}
console.log('\nWin return per runner (+-SE; bounds 0.88-0.97, widened by 2 SE)');
const rows=[];for(const r of G.GTT_RUN){const q=perRun[r.id];const m=q.sum/q.n,se=Math.sqrt(Math.max(0,q.sq/q.n-m*m)/q.n);
  const share=(winners[r.id]||0)/q.races*100/1;rows.push(`  ${r.n.padEnd(22)} ${m.toFixed(3)} +-${se.toFixed(3)}  wins ${(((winners[r.id]||0)/(q.races*CPR))*100).toFixed(1)}% of its starts`);
  if(m+2*se<.88||m-2*se>.97)bad(`runner ${r.id} win return ${m.toFixed(3)}`);else if(m<.88||m>.97)console.log('  (note) '+r.id+' outside 0.88-0.97 but within 2 SE')}
console.log(rows.join('\n'));
console.log('\nDistribution');
const dist={fav:favW/nRaces,ls:lsW/nRaces,photo:photo/nRaces,t:tsum/nRaces};
console.log(`  favourite wins ${(dist.fav*100).toFixed(1)}%  (target 30-35)`);
console.log(`  longest shot wins ${(dist.ls*100).toFixed(2)}%  (target >= 1.5)`);
console.log(`  photo finish rate ${(dist.photo*100).toFixed(1)}%  (about 1 in 8 = 12.5)  = 1 in ${(1/dist.photo).toFixed(1)}`);
console.log(`  race time (all six home) mean ${dist.t.toFixed(2)} s, min ${tmin.toFixed(2)}, max ${tmax.toFixed(2)}  (target 20-25)`);
if(dist.fav<.28||dist.fav>.37)bad('favourite share '+dist.fav);
if(dist.ls<.015)bad('longshot share '+dist.ls);
if(dist.photo<.09||dist.photo>.17)bad('photo rate '+dist.photo);
if(dist.t<20||dist.t>25)bad('race time '+dist.t);
// ---- cash out half way vs hold ----
{console.log('\nCash out at half way vs hold (win bets, stake 100, offers from gttOffer; hold value = 1500-run estimate)');
 const r2=G.gttRng(777);let n=0,off=0,pay=0,hv=0,dsum=0,dsq=0,ratio=0,rn=0;const T1=Date.now();
 for(let i=0;i<NCO;i++){
  const card=G.gttCard((r2()*4e9)|0),pr=G.gttPriceSync(card,1500);const offer=[];for(let k=0;k<6;k++)if(pr.mult.win[k]!=null)offer.push(k);if(!offer.length)continue;
  const a=offer[(r2()*offer.length)|0],bet={k:'win',a,stake:100,mult:pr.mult.win[a]};
  const st=G.gttSimNew(card,(r2()*4294967296)|0);let lead=0;
  while(!st.done){G.gttStep(st);lead=0;for(const r of st.run)if(r.x>lead)lead=r.x;if(lead>=500)break}
  const o=G.gttOffer(st,bet),p2=G.gttLiveP(st,bet,1500),hold=p2*bet.stake*bet.mult;
  G.gttAdv(st,4000,6);const real=G.gttSettle([bet],st).total;
  n++;off+=o;pay+=real;hv+=hold;dsum+=o-hold;dsq+=(o-hold)*(o-hold);if(hold>0){ratio+=o/hold;rn++}}
 const mu=dsum/n,se=Math.sqrt(Math.max(0,dsq/n-mu*mu)/n);
 console.log(`  bets ${n}: cash-out return ${(off/n/100).toFixed(3)}, hold (realised) ${(pay/n/100).toFixed(3)}, hold (expected) ${(hv/n/100).toFixed(3)}, mean offer/fair ${(ratio/rn).toFixed(3)}, offer-fair ${mu.toFixed(2)} +-${se.toFixed(2)} coins (${((Date.now()-T1)/1000).toFixed(0)} s)`);
 if(!(mu+3*se<0))bad('cash out not below hold');if(ratio/rn>.95)bad('offer/fair too high')}
// ---- cap and settle ----
{let mx=0,sumOk=true;const r3=G.gttRng(99);
 for(let i=0;i<4000;i++){const card=G.gttCard((r3()*4e9)|0),st=G.gttRun(card,(r3()*4294967296)|0,{fast:true});
  const bets=[];for(let b=0;b<3;b++){const k=['win','top2','top3','exact'][(r3()*4)|0],a=(r3()*6)|0;let bb=(a+1+((r3()*5)|0))%6;bets.push({k,a,b:k==='exact'?bb:undefined,stake:5000,mult:k==='exact'?150:k==='win'?40:12})}
  // force wins half the time
  if(i%2){const o=st.order;bets[0]={k:'win',a:o[0],stake:5000,mult:40};bets[1]={k:'exact',a:o[0],b:o[1],stake:5000,mult:150};bets[2]={k:'top3',a:o[2],stake:5000,mult:12}}
  const s=G.gttSettle(bets,st);mx=Math.max(mx,s.total);if(s.lines.reduce((t,l)=>t+l.pay,0)!==s.total)sumOk=false}
 console.log(`\nSettle: largest total ${mx} (cap ${G.GTT.cap}) ${mx<=G.GTT.cap&&sumOk?'ok':'FAIL'}`);if(mx>G.GTT.cap||!sumOk)bad('settle cap')}
// ---- determinism ----
{let ok=true;const r4=G.gttRng(5);
 for(let i=0;i<200;i++){const card=G.gttCard((r4()*4e9)|0),sd=(r4()*4294967296)|0;
  const a=G.gttRun(card,sd),b=G.gttRun(card,sd),f=G.gttRun(card,sd,{fast:true});
  if(JSON.stringify([a.order,a.times,a.ev,a.photo,a.t])!==JSON.stringify([b.order,b.times,b.ev,b.photo,b.t]))ok=false;
  if(JSON.stringify(a.order)!==JSON.stringify(f.order)||JSON.stringify(a.times)!==JSON.stringify(f.times))ok=false;
  // stepping one step at a time equals running
  if(i<20){const s=G.gttSimNew(card,sd);while(!s.done)G.gttStep(s);if(JSON.stringify(s.times)!==JSON.stringify(a.times)||JSON.stringify(s.ev)!==JSON.stringify(a.ev))ok=false}}
 const h1=cp.execFileSync(process.execPath,[__filename,'--hash']).toString().trim(),h2=cp.execFileSync(process.execPath,[__filename,'--hash']).toString().trim();
 const own=cp.spawnSync(process.execPath,[__filename,'--hash']).stdout.toString().trim();
 console.log(`\nDeterminism: same seeds same race (log, fast mode, stepping) ${ok?'ok':'FAIL'}; fresh processes ${h1===h2?'ok ('+h1+')':'FAIL'}`);if(!ok)bad('determinism');if(h1!==h2)bad('determinism across processes')}
// ---- event counts ----
{const r5=G.gttRng(11);const c={stumble:0,burst:0,pie:0,kick:0,gust:0};const N=3000;for(let i=0;i<N;i++){const st=G.gttRun(G.gttCard((r5()*4e9)|0),(r5()*4294967296)|0);for(const e of st.ev)c[e.k]++}
 console.log('\nEvents per race: '+Object.keys(c).map(k=>k+' '+(c[k]/N).toFixed(2)).join(', '))}
console.log(`\n${fails?'FAILED ('+fails+')':'ALL OK'} in ${((Date.now()-T0)/1000).toFixed(0)} s`);process.exit(fails?1:0);
