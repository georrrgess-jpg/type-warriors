/* test helpers: force special states on the running match (tests only, not shipped) */
window.SC={
 ready:async()=>{for(let i=0;i<80&&!(PZ.ph==='aim'&&PZ.mode==='aim');i++)await new Promise(r=>setTimeout(r,100))},
 on8:()=>{const B=PZ.B,st=PZ.st;st.brk=false;st.open=false;st.grp=['s','t'];for(const b of B)if(b.id>=1&&b.id<=7){b.on=false}for(const b of B)if(b.id>=9&&b.id<=14)b.on=false;
  B[0].x=300;B[0].y=300;B[0].vx=B[0].vy=0;B[8].x=640;B[8].y=170;B[15].x=500;B[15].y=380;PZ.tray=[];for(const b of B)if(!b.on&&b.id>0)pzTrayAdd(b.id,true);PZ.mode='aim';PZ.ph='aim';PZ.canPick=false;PZ.call=-1;PZ.callManual=false;
  const dx=B[8].x-B[0].x,dy=B[8].y-B[0].y;PZ.aim.ang=PZ.cueAng=Math.atan2(dy,dx);PZ.cueAv=0;pzHudAll()},
 bih:()=>{const st=PZ.st;st.brk=false;st.bih=true;st.kitchen=false;PZ.mode='place';PZ.place={x:520,y:200,ok:true};PZ.B[0].x=120;PZ.B[0].y=300;pzHudAll()},
 slow:()=>{SC.on8();const B=PZ.B;B[0].x=440;B[0].y=300;B[8].x=560;B[8].y=190;/* aim the 8 at the top right pocket: ghost line */
  const e=B[8],px=PZ_AIM[2][0],py=PZ_AIM[2][1],ux=px-e.x,uy=py-e.y,l=Math.hypot(ux,uy),gx=e.x-ux/l*24,gy=e.y-uy/l*24;PZ.aim.ang=PZ.cueAng=Math.atan2(gy-B[0].y,gx-B[0].x);PZ.aim.pow=.42;PZ.call=2;PZ.callManual=true;PZ.cueAv=0},
 taunt:()=>{PZ.nextTaunt=true;PZ.tauntRack=-1;const z=PZS();z.tauntsOn=true;const r=Math.random;Math.random=()=>0;pzSayMaybeTaunt();Math.random=r}
};
