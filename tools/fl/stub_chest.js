/* TEST ONLY (never shipped): minimal stand-ins for the other 10.4 parts so the Harvest Chest (99o*) can be tested alone.
   Gear (agent B): AR / WP entries for FL.gear cloned from existing gear of the same rarity, with fl:1; flgGive.
   Companions (agent C): PDEF / PRIG for FL.pets.r / FL.pets.l cloned from Mosskip / Antlerlight; flpGive.
   Festival (agent D): fleGive / fleAcorns in P.fl.ac. Ability text GAB.bounty. Load with page.evaluate(open(...).read()). */
(()=>{if(window.__flStub)return 1;window.__flStub=1;window.__flLog=[];
 const pick=(T,r,ok)=>Object.keys(T).find(id=>T[id].r===r&&!T[id].pr&&!T[id].hw&&!T[id].fl&&!T[id].cel&&ok(id));
 const SA=['smock','scout','brigandine','crusader','sun','phoenix'],SW=['dagger','mace','lance','moon','king','sun'];
 FL.gear.a.forEach((id,i)=>{if(AR[id])return;const r=FL.rar[i],src=AR[SA[i]]?SA[i]:pick(AR,r,()=>true)||'rags';AR[id]=Object.assign({},AR[src],{n:FL.gearN[id],r,fl:1,col:RC[r]});delete AR[id].w;if(typeof AK!=='undefined'&&AK[src])AK[id]=AK[src]});
 FL.gear.w.forEach((id,i)=>{if(WP[id])return;const r=FL.rar[i],src=WP[SW[i]]?SW[i]:pick(WP,r,x=>WP[x].p==='knight')||'rusty';WP[id]=Object.assign({},WP[src],{n:FL.gearN[id],r,fl:1,col:RC[r],p:'knight'});delete WP[id].w;
  try{if(typeof WART!=='undefined'&&WART[src])WART[id]=WART[src]}catch(e){}});
 window.__flgSrc={};
 window.flgGive=function(k,id){const o=k==='a'?P.ownA:P.own,nw=!o[id];o[id]=1;window.__flLog.push(['flg',k,id,nw]);return nw};
 if(typeof PDEF!=='undefined'){const cl=(id,src,n,r)=>{if(PDEF[id])return;PDEF[id]=Object.assign({},PDEF[src],{n,r});if(typeof PRIG!=='undefined'&&PRIG[src])PRIG[id]=PRIG[src];if(typeof PCOL!=='undefined'&&PCOL[src])PCOL[id]=PCOL[src]};
  cl(FL.pets.r,'mosskip','Acorn Scamp','r');cl(FL.pets.l,'antler','Emberleaf','l')}
 window.flpGive=function(id){petNorm();const nw=!P.pets[id];if(nw)P.pets[id]={b:0,nk:'',pal:0,acc:0,trim:0};save();window.__flLog.push(['flp',id,nw]);try{ccToast((PDEF[id]||{n:id}).n+' joins you! (stub reveal)')}catch(e){}return nw};
 window.fleGive=function(n,src){P.fl=P.fl&&typeof P.fl==='object'?P.fl:{};P.fl.ac=(P.fl.ac|0)+n;save();window.__flLog.push(['fle',n,src]);return P.fl.ac};
 window.fleAcorns=()=>((P.fl&&P.fl.ac)|0);
 try{if(typeof GAB!=='undefined'&&!GAB[FL.ab.k])GAB[FL.ab.k]={n:FL.ab.n,d:'Stub: correct words fill a harvest meter; when it is full a cornucopia bursts over the field.',set:'Set bonus: stub text.'}}catch(e){}
 return 1})()
