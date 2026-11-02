/* __rpuOvl(root): text / button boxes that overlap, clipped text and boxes off the 1600x900 stage (#wrap), for the tower-defense UI (10.1). */
window.__rpuOvl=(root)=>{if(!root)return[];const skip='canvas,.rptip,.rpcdf,.rpcdn,.rpfx,.rpmotes,.rpvst,.rpsparks,.rpuconf,[aria-hidden="true"]';
 const vis=e=>{for(let x=e;x&&x!==document.body;x=x.parentElement){const c=getComputedStyle(x);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return false;if(x.hidden)return false}const r=e.getBoundingClientRect();return r.width>1&&r.height>1};
 const own=e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
 const sk=e=>{const c=e.closest(skip);return !!c&&c!==root&&root.contains(c)};const els=[...root.querySelectorAll('*')].filter(e=>!sk(e)&&(own(e)||/^(BUTTON|KBD)$/i.test(e.tagName))&&vis(e));
 const res=[];const anc=(a,b)=>a.contains(b)||b.contains(a);
 const box=e=>{if(own(e)&&!/^(BUTTON)$/.test(e.tagName)){const rg=document.createRange();rg.selectNodeContents(e);const r=rg.getBoundingClientRect();return r.width?r:e.getBoundingClientRect()}return e.getBoundingClientRect()};
 const B=els.map(box);const nm=e=>(e.id?'#'+e.id:'')+'.'+(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||e.tagName).toString().split(' ')[0]+'['+(e.textContent||'').trim().slice(0,22)+']';
 /* a scroll container clips its children on purpose: boxes are only compared inside the same visible area */
 const clipBox=e=>{let r={left:-1e9,top:-1e9,right:1e9,bottom:1e9};for(let x=e.parentElement;x&&x!==document.body;x=x.parentElement){const c=getComputedStyle(x);if(/(auto|scroll|hidden)/.test(c.overflow+c.overflowX+c.overflowY)){const q=x.getBoundingClientRect();r={left:Math.max(r.left,q.left),top:Math.max(r.top,q.top),right:Math.min(r.right,q.right),bottom:Math.min(r.bottom,q.bottom)}}}return r};
 const C=els.map(clipBox);const cut=(a,c)=>({left:Math.max(a.left,c.left),top:Math.max(a.top,c.top),right:Math.min(a.right,c.right),bottom:Math.min(a.bottom,c.bottom)});
 const K=B.map((b,i)=>cut(b,C[i]));
 /* round buttons (the build ring) are circles: a pair only counts when the circle really meets the other box */
 const circ=i=>els[i].matches('.rprb')?{x:(B[i].left+B[i].right)/2,y:(B[i].top+B[i].bottom)/2,r:B[i].width/2}:null;
 const cr=(c,r)=>{const x=Math.max(r.left,Math.min(c.x,r.right)),y=Math.max(r.top,Math.min(c.y,r.bottom));return Math.hypot(c.x-x,c.y-y)<c.r-2};
 const rnd=(i,j)=>{const a=circ(i),b=circ(j);if(!a&&!b)return false;if(a&&b)return Math.hypot(a.x-b.x,a.y-b.y)>=a.r+b.r-2;return !(a?cr(a,K[j]):cr(b,K[i]))};
 for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){if(anc(els[i],els[j]))continue;const a=K[i],b=K[j];const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>2&&h>2&&!rnd(i,j))res.push('OVERLAP '+nm(els[i])+' x '+nm(els[j])+' '+Math.round(w)+'x'+Math.round(h))}
 for(const e of els){const c=getComputedStyle(e);if(e.tagName==='KBD')continue;if((e.scrollWidth>e.clientWidth+1&&(c.overflow==='hidden'||c.overflowX==='hidden'||c.textOverflow==='ellipsis')&&e.clientWidth>0)||(e.scrollHeight>e.clientHeight+2&&(c.overflow==='hidden'||c.overflowY==='hidden')&&e.clientHeight>0))res.push('CLIPPED '+nm(e))}
 const W=document.getElementById('wrap').getBoundingClientRect(),s=W.width/1600;
 for(let i=0;i<els.length;i++){const r=K[i];if(r.right-r.left<2||r.bottom-r.top<2)continue;if(r.right>W.right+2*s||r.left<W.left-2*s||r.top<W.top-2*s||r.bottom>W.bottom+2*s)res.push('OFFSTAGE '+nm(els[i]))}
 return [...new Set(res)]};
