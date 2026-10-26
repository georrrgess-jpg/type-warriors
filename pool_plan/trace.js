const {PZP,pzpStrike,pzpRun,pzpRack}=require('./pzphys.js');const {pzrNew,pzrJudge,pzrTargets}=require('./pzrules.js');const {pzaDecide,pzaPlace,pzaNoise}=require('./pzai.js');
const me={sig:.5,psig:.04,pos:.7,safe:.3,sTry:28,look:7};
const B=pzpRack();const st=pzrNew(B,0);const ap=B.find(b=>b.id&&Math.abs(b.y-220)<1&&b.x<700);pzpStrike(B[0],Math.atan2(ap.y-B[0].y,ap.x-B[0].x),1,0,0);
let r=pzrJudge(st,pzpRun(B,15).ev);console.log('break',JSON.stringify({pk:r.pk,foul:r.foul,keep:r.keep}));
for(let s=0;s<40&&!st.over;s++){if(st.bih)pzaPlace(st,me);const tg=pzrTargets(st);const d=pzaDecide(st,me);st.call=d.id===8?d.k:null;const n=pzaNoise(d,me);pzpStrike(B[0],n.ang,n.pow,n.a,n.b);
 r=pzrJudge(st,pzpRun(B,12).ev);console.log(s,'p'+(r.keep?st.turn:1-st.turn),'grp',st.grp.join('/'),'tg',tg.join(','),'dec',d.safety?'SAFE':d.kick?'KICK':('pot '+d.id+'@'+d.k+' p'+(d.p||0).toFixed(2)),'->',JSON.stringify({pk:r.pk,foul:r.reason,keep:r.keep,first:r.first}),'onTable',B.filter(b=>b.on).length)}
console.log('over',st.over);
