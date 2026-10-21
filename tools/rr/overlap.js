window.__ovl=(root)=>{const R=root||document.getElementById('rr');const skip='.rrsky,.rrcarve,.rrglyph,.rrfx,.rrtoast,canvas,.rrfly,.rrsr,.rrmotes,.rrtorch,.rrfloat,.rrring2,.rrcrest,.rrfili,.rrtstar';
 const vis=e=>{const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false;const r=e.getBoundingClientRect();return r.width>1&&r.height>1};
 const own=e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
 const els=[...R.querySelectorAll('*')].filter(e=>!e.closest(skip)&&vis(e)&&(own(e)||/^(BUTTON|svg)$/i.test(e.tagName)||e.matches('.rrt,.rrcd,.rrlp,.rrstats>div,.rrpb,.rrk')));
 const res=[];const anc=(a,b)=>a.contains(b)||b.contains(a);
 const box=e=>{if(own(e)&&!/^(BUTTON)$/.test(e.tagName)){const rg=document.createRange();rg.selectNodeContents(e);const r=rg.getBoundingClientRect();return r.width?r:e.getBoundingClientRect()}return e.getBoundingClientRect()};
 const B=els.map(box);const nm=e=>(e.id?'#'+e.id:'')+'.'+(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className||e.tagName).toString().split(' ')[0]+'['+(e.textContent||'').trim().slice(0,18)+']';
 for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){if(anc(els[i],els[j]))continue;const a=B[i],b=B[j];const w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>1.5&&h>1.5)res.push('OVERLAP '+nm(els[i])+' x '+nm(els[j])+' '+Math.round(w)+'x'+Math.round(h))}
 for(const e of els){const c=getComputedStyle(e);if((e.scrollWidth>e.clientWidth+1&&(c.overflow==='hidden'||c.textOverflow==='ellipsis'))||(e.scrollHeight>e.clientHeight+2&&c.overflow==='hidden'&&e.clientHeight>0))res.push('CLIPPED '+nm(e))}
 for(const e of els){const r=e.getBoundingClientRect();const O=document.getElementById('ov').getBoundingClientRect();if(r.right>O.right+1||r.left<O.left-1)res.push('OFFSCREEN-X '+nm(e))}
 {const O=document.getElementById('ov');if(O.scrollWidth>O.clientWidth+1)res.push('HSCROLL '+O.scrollWidth+'>'+O.clientWidth)}
 return [...new Set(res)]};
