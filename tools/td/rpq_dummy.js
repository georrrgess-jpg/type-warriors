/* rpq_dummy.js (10.2, t_ui102 / rpu_audit with RPQ_DUMMY=1): registers two temporary towers in the page so the tower-defense UI can be
   checked with 14 towers before the real thirteenth and fourteenth towers exist. They copy the Rune Ballista's and the Frost Spire's
   numbers and art under new ids and keys (M, L) and draw through the original tower's art. Test only; never shipped. */
(()=>{if(window.__rpqDummy)return;window.__rpqDummy=1;
 const A={rpqdm:'ballista',rpqdl:'frost'};
 const mk=(id,key,name,col,role)=>{const b=A[id];RP_TW[id]=JSON.parse(JSON.stringify(RP_TW[b]));RP_TW[id].desc='Test tower ('+name+'): '+RP_TW[b].desc;
  RPTW[id]=Object.assign({},RPTW[b],{n:name,col,role});if(!RP_TWORDER.includes(id)){RP_TWORDER.push(id);RP_KEYS.push(key)}};
 /* only as many dummies as it takes to reach 14 towers, on keys nobody uses (the real towers replace them as they arrive) */
 for(const d of [['rpqdm','M','Moonblade Sentinel','#b8c8ff','Test blade'],['rpqdl','L','Phantom Lantern','#9affd8','Test lantern']]){if(RP_TWORDER.length>=14)break;if(RP_KEYS.includes(d[1]))d[1]=['Z','X2','C','V','B','N'].find(k=>!RP_KEYS.includes(k)&&k.length===1)||'Z';mk(...d)}
 const al=n=>{if(typeof window[n]!=='function')return;const f0=window[n];window[n]=function(){const a=[...arguments];for(let i=0;i<2;i++)if(typeof a[i]==='string'&&A[a[i]])a[i]=A[a[i]];return f0.apply(this,a)}};
 for(const n of ['rpTowerDraw','rpTowerIcon','rpTowerTop','rpTowerBuild','rpTowerWarm','rpyCtx'])try{al(n)}catch(e){}
 /* the real towers bring their own key handlers; the dummies get a plain one */
 window.addEventListener('keydown',e=>{const R=RPX;if(!R||!S.rp||S.mode!=='ramparts'||R.pause||R.over||(R.ty&&R.ty.on)||e.ctrlKey||e.metaKey||e.altKey)return;
  const k=(e.key||'').toUpperCase();const i=RP_KEYS.indexOf(k),id=i>=0&&/^rpqd/.test(RP_TWORDER[i]||'')?RP_TWORDER[i]:null;if(id){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)rpPlace(id)}},true);
 try{if(typeof rpIconURL==='object')for(const k in rpIconURL)if(/rpqd/.test(k))delete rpIconURL[k]}catch(e){}})();
