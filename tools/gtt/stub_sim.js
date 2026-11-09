/* THROWAWAY stub of the Turkey Trot data + sim contract (agent C's test scaffold, never shipped). Defines window globals only if the real modules are absent. */
(function(W){
if(typeof W.gttSimNew==='function')return;
W.GTT={rtp:.95,coRtp:.93,cap:20000,maxBet:5000,maxTotal:5000,minBet:10,maxBets:3,len:1000,hz:30,runners:6,acorn:{win:5,perDay:10}};
const ROW=[['gravy','Gravy Train','front','#c87a2a','#ffd45a','Fast away, can tire','goblin'],['comet','Cranberry Comet','close','#b8284a','#ff8aa0','Saves a big late kick','imp'],['gobbles','Sir Gobblesworth','stalk','#5a4a8a','#c8b8ff','Steady, rarely makes mistakes','bat'],
['spice','Pumpkin Spice','front','#e0801a','#ffc04a','Easily distracted by pies','moss'],['willie','Wishbone Willie','close','#7a5a3a','#e8d0a0','Loves a muddy track','slime'],['butter','Butterball Bolt','stalk','#d8b84a','#fff0a0','Strong but heavy on a firm track','skel'],
['maple','Maple Mayhem','front','#c8401a','#ff9a5a','Wild: big bursts, big stumbles','imp'],['drum','Drumstick Dash','stalk','#8a6a2a','#f0d080','Quick in the gate','goblin'],['annie','Acorn Annie','close','#6a8a3a','#c8f090','Small and nimble, hates gusts','moss'],
['stuff','Stuffing Stampede','front','#a8682a','#ffd890','Keeps going when others fade','bat'],['hank','Hayride Hank','stalk','#7a7a8a','#d8d8f0','Old pro, loves a firm track','skel'],['duchess','Duchess Thunderplume','close','#4a3a9a','#ffd45a','Grand, slow to start, huge finish','slime']];
W.GTT_RUN=ROW.map((r,i)=>({id:r[0],n:r[1],style:r[2],spd:1+(i%5)*.01,sta:.5,kick:.5,gate:.5,focus:.5,mud:0,wild:.5,col:[r[3],r[4]],silk:[r[4],r[3]],jockey:{n:'Pip',kind:r[6]},tip:r[5]}));
W.gttRng=seed=>{let a=seed>>>0;const f=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};return f};
W.gttNorm=function(){let g=P.gtt;if(!g||typeof g!=='object'||Array.isArray(g))g=P.gtt={};const D={v:1,races:0,bets:0,wins:0,best:0,long:0,fav:{},rec:{},seen:0,pend:null,acorn:{day:'',n:0}};for(const k in D)if(g[k]==null)g[k]=D[k];
 if(!g.acorn||typeof g.acorn!=='object')g.acorn={day:'',n:0};return g};
W.gttCard=seed=>{const r=gttRng(seed),ids=GTT_RUN.map(x=>x.id);for(let i=ids.length-1;i>0;i--){const j=(r()*(i+1))|0;[ids[i],ids[j]]=[ids[j],ids[i]]}
 return{seed:seed>>>0,no:1+((seed>>>0)%90),field:ids.slice(0,6),going:['firm','good','muddy'][(r()*3)|0],weather:['clear','wind','drizzle'][(r()*3)|0]}};
W.gttSimNew=(card,rs)=>{const r=gttRng(rs>>>0);const st={card,rs,t:0,n:0,len:1000,done:false,order:[],times:[],photo:false,ev:[],_r:r,run:card.field.map((id,lane)=>({lane,id,x:0,v:0,fin:null,ev:null,pos:lane+1,b:.95+r()*.1,w:0}))};return st};
W.gttStep=st=>{if(st.done)return st;const r=st._r;st.n++;st.t=st.n/30;
 for(const q of st.run){if(q.fin!==null)continue;q.w=q.w*.96+(r()-.5)*.16;const ramp=Math.min(1,st.t/2);q.v=(38*q.b*(1+q.w))*ramp+(q.ev&&q.ev.k==='burst'?10:0)*1;q.x+=q.v/30;
  if(q.ev&&st.t>q.ev.t1)q.ev=null;
  if(!q.ev&&r()<.0035){const k=['stumble','burst','pie'][(r()*3)|0];q.ev={k,t0:st.t,t1:st.t+.8};st.ev.push({t:st.t,lane:q.lane,k});if(k!=='burst')q.x-=1.2}
  if(q.x>=st.len){q.x=st.len;q.fin=st.t}}
 const o=[...st.run].sort((a,b)=>(b.fin!==null?1e3-b.fin:b.x)-(a.fin!==null?1e3-a.fin:a.x));o.forEach((q,i)=>q.pos=i+1);
 if(st.run.every(q=>q.fin!==null)){st.done=true;const f=[...st.run].sort((a,b)=>a.fin-b.fin);st.order=f.map(q=>q.lane);st.times=st.run.map(q=>q.fin);const gap=f[1].fin-f[0].fin;st.photo=gap<.12?{a:f[0].lane,b:f[1].lane,gap}:false}
 return st};
W.gttRun=(card,rs)=>{const st=gttSimNew(card,rs);let g=0;while(!st.done&&g++<9000)gttStep(st);return st};
const stepM=p=>p<.03?.05:p<.1?.1:0;
function mult(p,cap){if(p<.006)return null;let m=GTT.rtp/p;m=m<3?Math.floor(m/.05)*.05:m<10?Math.floor(m/.1)*.1:m<25?Math.floor(m/.5)*.5:Math.floor(m);return Math.min(cap,Math.max(1.1,+m.toFixed(2)))}
W.gttPriceSync=(card,n)=>{n=n||4000;const win=Array(6).fill(0),t2=Array(6).fill(0),t3=Array(6).fill(0),ex=[...Array(6)].map(()=>Array(6).fill(0));
 for(let i=0;i<n;i++){const s=gttRun(card,(card.seed*7919+i*104729+13)>>>0),o=s.order;win[o[0]]++;t2[o[0]]++;t2[o[1]]++;t3[o[0]]++;t3[o[1]]++;t3[o[2]]++;ex[o[0]][o[1]]++}
 const P0=a=>a.map(v=>v/n);const R={win:P0(win),top2:P0(t2),top3:P0(t3),exact:ex.map(r=>P0(r))};
 R.mult={win:R.win.map(p=>mult(p,40)),top2:R.top2.map(p=>mult(p,40)),top3:R.top3.map(p=>mult(p,40)),exact:R.exact.map((r,i)=>r.map((p,j)=>i===j?null:mult(p,150)))};return R};
W.gttPrice=(card,n,cb)=>{let R=null;setTimeout(()=>{R=gttPriceSync(card,Math.min(n||4000,800));cb(R)},30)};
const win=(b,o)=>b.k==='win'?o[0]===b.a:b.k==='top2'?o.slice(0,2).includes(b.a):b.k==='top3'?o.slice(0,3).includes(b.a):o[0]===b.a&&o[1]===b.b;
W.gttLiveP=(st,bet,n)=>{n=n||300;let w=0;for(let i=0;i<n;i++){const c={...st,run:st.run.map(q=>({...q})),ev:[],_r:gttRng((st.n*131+i*977+(Math.random()*1e9|0))>>>0)};let g=0;while(!c.done&&g++<4000)gttStep(c);if(win(bet,c.order))w++}return w/n};
W.gttOffer=(st,bet)=>{const lead=Math.max(...st.run.map(q=>q.x));if(lead>=st.len*.9)return 0;const v=Math.floor(GTT.coRtp*gttLiveP(st,bet,60)*bet.stake*bet.mult);return v>=1?v:0};
W.gttSettle=(bets,st)=>{const lines=bets.map(b=>{const w=win(b,st.order);return{bet:b,won:w,pay:w?Math.floor(b.stake*b.mult):0}});return{lines,total:Math.min(GTT.cap,lines.reduce((a,l)=>a+l.pay,0))}};
})(window);
