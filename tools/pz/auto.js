/* in-page auto-player: lets the engine play the human side with the AI so whole matches run unattended.
   usage (inside page.evaluate): window.__auto=pzAuto({me:{...ai personality}, speed:6}); */
function pzAuto(o){o=o||{};const me=Object.assign({sig:.9,psig:.05,pos:.4,safe:.3,sTry:12,look:5},o.me||{});PZ.speed=o.speed||6;const log={shots:0,fouls:0,racks:0,offers:0,ph:{}};
 const iv=setInterval(()=>{try{
  if(!PZ.on||!PZ.st){return}
  if(PZ.modal&&PZ.ph==='offer'){const b=document.querySelector('#pzmod [data-a=yes]');if(b)b.click();log.offers++;return}
  if(PZ.ph==='aim'&&!PZ.modal){const st=PZ.st;
   if(PZ.mode==='place'){pzaPlace(st,me);const c=PZ.B[0];const p=pzpNearestPlace(PZ.B,c.x,c.y,st.kitchen||st.brk);pzPlaceCue(p.x,p.y);return}
   if(PZ.mode==='aim'&&!PZ.shotFired){let d;if(st.brk){d=pzaBreak(st,me,Math.random);PZ.B[0].x=d.x||PZ.B[0].x}else d=pzaDecide(st,me,Math.random,{});
    const n=pzaNoise(d,me,Math.random,1);PZ.aim.ang=PZ.cueAng=n.ang;PZ.aim.pow=n.pow;PZ.aim.a=n.a;PZ.aim.b=n.b;if(pzrOn8(st)&&d.id===8){PZ.call=d.k;PZ.callManual=true}pzFireHuman();log.shots++}}
 }catch(e){log.err=String(e)}},60);log.stop=()=>clearInterval(iv);return log}
