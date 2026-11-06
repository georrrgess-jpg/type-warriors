/* TEST-ONLY stub for the 10.4 festival tests (never shipped): minimal stand-ins for the other parts' interfaces, defined only
   when the real ones are missing. Chest (A): flcAdd, flcOpenUI. Companions (C): PDEF/PRIG/PCOL entries for flsquir/flfox/flturkey
   borrowed from existing pets, flpGive, flpEggAdd, flpEgg. Harvest Moon Rush (E): flrMenu, flrOn. */
(()=>{const W=window;W.__flStub={chest:0,open:0,give:[],egg:0,hatch:0,rush:0};
 if(typeof flcAdd!=='function')W.flcAdd=function(n,src){P[FL.chest.cnt]=(P[FL.chest.cnt]|0)+n;W.__flStub.chest+=n;save();return n};
 if(typeof flcOpenUI!=='function')W.flcOpenUI=function(){W.__flStub.open++};
 if(typeof PDEF!=='undefined'){const base=PIDS.filter(i=>PDEF[i]);const pick=[base[0],base[1]||base[0],base[2]||base[0]];
  [[FL.pets.r,pick[0]],[FL.pets.l,pick[1]],[FL.pets.m,pick[2]]].forEach(([id,b])=>{if(!PDEF[id]){PDEF[id]=Object.assign({},PDEF[b]);if(typeof PRIG!=='undefined'&&PRIG[b])PRIG[id]=PRIG[b];if(typeof PCOL!=='undefined'&&PCOL[b])PCOL[id]=PCOL[b]}})}
 if(typeof flpGive!=='function')W.flpGive=function(id){P.pets[id]=P.pets[id]||{b:0};W.__flStub.give.push(id);save();return true};
 if(typeof flpEggAdd!=='function')W.flpEggAdd=function(n){P.flEggStub=(P.flEggStub|0)+n;W.__flStub.egg+=n;save()};
 if(typeof flpEgg!=='function')W.flpEgg=function(){if((P.flEggStub|0)<1)return false;P.flEggStub--;P.pets[FL.pets.m]=P.pets[FL.pets.m]||{b:0};W.__flStub.hatch++;save();return true};
 if(typeof flrMenu!=='function')W.flrMenu=function(){W.__flStub.rush++};
 if(typeof flrOn!=='function')W.flrOn=function(){return flOn()};})();
