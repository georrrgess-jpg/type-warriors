/* TEST ONLY, never shipped (not in build.sh): minimal stand-ins for the other 10.4 parts, so Harvest Moon Rush (99r*, agent E)
   can be tested on its own. Each is defined only when the real part is missing. Calls are recorded in window.__fls. */
window.__fls={give:[],chest:[],open:0,hub:0};
if(typeof fleGive!=='function')window.fleGive=function(n,src){__fls.give.push([n,src]);P.fl=P.fl&&typeof P.fl==='object'?P.fl:{};P.fl.ac=(P.fl.ac||0)+n;return true};
if(typeof fleAcorns!=='function')window.fleAcorns=()=>(P.fl&&P.fl.ac)||0;
if(typeof flcAdd!=='function')window.flcAdd=function(n,src){__fls.chest.push([n,src]);P.fcr=(P.fcr||0)+n;return true};
if(typeof flcOpenUI!=='function')window.flcOpenUI=function(){__fls.open++;show('<h2>Harvest Chest (stub)</h2><div class="row"><button class="sm" id="b">Back</button></div>','m');$('b').onclick=title};
if(typeof fleHub!=='function')window.fleHub=function(){__fls.hub++;show('<h2>Harvest Festival (stub)</h2><div class="row"><button class="sm" id="b">Back</button></div>','m');$('b').onclick=title};
