// Tuning helper: node tune.js '{"wn":0.02}' [cards] [racesPerCard]   -> favourite share, longshot share, photo rate, race time, runner win shares by going
const load=require('./load.js'),G=load();
const ov=JSON.parse(process.argv[2]||'{}');Object.assign(G.GTTM,ov);
const CARDS=+process.argv[3]||60,CPR=+process.argv[4]||300;
const rng=G.gttRng(4242);let n=0,fav=0,ls=0,ph=0,ts=0,tmax=0,pm=0;const byG={},byW={},cnt={};
const win={},starts={},wwin={},wst={};
for(let c=0;c<CARDS;c++){const card=G.gttCard((rng()*4e9)|0),pr=G.gttPriceSync(card,1500),K=G.gttKFor(card);
 let fi=0,li=-1,lp=9;for(let i=0;i<6;i++){if(pr.win[i]>pr.win[fi])fi=i;if(pr.mult.win[i]!=null&&pr.win[i]<lp){lp=pr.win[i];li=i}}
 pm+=pr.win[fi];
 for(const id of card.field){const k=id+'|'+card.going;starts[k]=(starts[k]||0)+CPR;const w=id+'|'+card.weather;wst[w]=(wst[w]||0)+CPR}
 for(let r=0;r<CPR;r++){const st=G.gttRun(card,(rng()*4294967296)|0,{fast:true,K});n++;const o=st.order;if(o[0]===fi)fav++;if(o[0]===li)ls++;if(st.photo)ph++;ts+=st.t;if(st.t>tmax)tmax=st.t;const k=card.field[o[0]]+'|'+card.going;win[k]=(win[k]||0)+1;const w=card.field[o[0]]+'|'+card.weather;wwin[w]=(wwin[w]||0)+1}}
console.log(`fav ${(fav/n*100).toFixed(1)}  (mean fav p ${(pm/CARDS*100).toFixed(1)})  longshot ${(ls/n*100).toFixed(2)}  photo ${(ph/n*100).toFixed(1)}  time ${(ts/n).toFixed(2)} max ${tmax.toFixed(1)}`);
if(process.argv[5]){console.log('win% by going (firm/good/muddy) | by weather (clear/wind/drizzle), vs 16.7 average');for(const r of G.GTT_RUN){const row=['firm','good','muddy'].map(g=>{const k=r.id+'|'+g;return starts[k]?(100*(win[k]||0)/starts[k]).toFixed(1):'--'});const w=['clear','wind','drizzle'].map(g=>{const k=r.id+'|'+g;return wst[k]?(100*(wwin[k]||0)/wst[k]).toFixed(1):'--'});console.log(r.id.padEnd(9),row.join('  '),' | ',w.join('  '))}}
