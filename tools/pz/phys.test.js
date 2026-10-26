/* node tools/pz/phys.test.js : physics, rack and rules checks for The Crooked Cue (96b/96c). Exit 1 on a failure. */
const Z=require('./load.js');const {PZ_PHY,pzpStrike,pzpRun,pzpRack,pzRng,pzrNew,pzrJudge,pzpCanPlace}=Z;const R=PZ_PHY.R;
let n=0,bad=0;const chk=(name,ok,info)=>{n++;if(!ok){bad++;console.log('FAIL',name,info===undefined?'':JSON.stringify(info))}else console.log('PASS',name)};
const mk=(id,x,y)=>({id,x,y,vx:0,vy:0,ux:0,uy:0,es:0,on:true});
const cut=(cb,ob,px,py,pow,b,a)=>{const dx=px-ob.x,dy=py-ob.y,l=Math.hypot(dx,dy),gx=ob.x-dx/l*2*R,gy=ob.y-dy/l*2*R;pzpStrike(cb,Math.atan2(gy-cb.y,gx-cb.x),pow,a||0,b||0)};
let B=[mk(0,300,300),mk(3,600,150)];cut(B[0],B[1],889,-9,.35);let r=pzpRun(B);
chk('a cut shot pots the 3 in the top-right corner and the cue ball stays on the table',!B[1].on&&B[1].pk===2&&B[0].on,[B[1].on,B[1].pk]);
chk('every event carries a time and a position',r.ev.length>0&&r.ev.every(e=>typeof e.tm==='number'&&typeof e.x==='number'),r.ev[0]);
const res={};for(const [nm,b] of[['draw',-1],['stun',0],['follow',1]]){B=[mk(0,440,400),mk(1,440,140)];pzpStrike(B[0],-Math.PI/2,.3,0,b);pzpRun(B);res[nm]=B[0].on?B[0].y:null}
chk('draw pulls the cue ball back, stun stops it, follow carries it on (and pots the 1)',res.draw>300&&res.stun<120&&(res.follow===null||res.follow<res.stun),res);
B=[mk(0,440,300),mk(5,440,120)];pzpStrike(B[0],-Math.PI/2,.3,0,0);pzpRun(B);chk('a straight shot drops in the side pocket',!B[1].on&&B[1].pk===1,B[1].pk);
B=[mk(0,200,R+.5)];pzpStrike(B[0],0,.45,0,0);pzpRun(B);chk('a ball rolled along the rail drops in the corner',!B[0].on&&B[0].pk===2,B[0].pk);
B=[mk(0,100,220)];pzpStrike(B[0],0,.25,0,0);r=pzpRun(B,20);chk('a soft shot settles (lag) in under 6 s and stays on the table',r.t<6&&B[0].on&&B[0].x>200,[r.t,B[0].x]);
/* a rack: 15 balls, apex on the foot spot, the 8 in the middle, a solid and a stripe in the back corners */
const rk=pzpRack(pzRng(5));chk('the rack has 16 balls, ids 0-15 once each',rk.length===16&&new Set(rk.map(b=>b.id)).size===16);
const mid=rk.find(b=>b.id===8);chk('the 8 sits in the middle of the third row',Math.abs(mid.y-220)<1&&mid.x>PZ_PHY.W*.75+R);
let ok=true;for(let i=0;i<16;i++)for(let j=i+1;j<16;j++)if(Math.hypot(rk[i].x-rk[j].x,rk[i].y-rk[j].y)<2*R-.01)ok=false;chk('no two racked balls overlap',ok);
const back=rk.filter(b=>b.id&&Math.abs(b.x-(PZ_PHY.W*.75+4*R*Math.sqrt(3)*1.02))<1).sort((a,b)=>a.y-b.y),corners=[back[0],back[back.length-1]];chk('the back corners hold one solid and one stripe',back.length===5&&Z.pzGrp(corners[0].id)!==Z.pzGrp(corners[1].id),corners.map(b=>b.id));
/* the break */
let pots=0,sc=0,eight=0,maxT=0,N=40;const rn=pzRng(9);
for(let i=0;i<N;i++){B=pzpRack(rn);const cb=B[0];cb.y=220+(rn()-.5)*60;const ap=B.find(b=>b.id&&Math.abs(b.y-220)<1&&b.x<700);pzpStrike(cb,Math.atan2(ap.y-cb.y,ap.x-cb.x),1,0,0);r=pzpRun(B,15);maxT=Math.max(maxT,r.t);pots+=B.filter(b=>!b.on&&b.id).length;if(!B[0].on)sc++;if(!B[8===0?0:B.findIndex(b=>b.id===8)].on)eight++}
chk('40 breaks: about one ball down on average, no stuck simulations',pots/N>.4&&pots/N<3&&maxT<9,{avg:pots/N,maxT});
chk('every ball ends on the table or in a pocket (nothing escapes)',(()=>{B=pzpRack(rn);pzpStrike(B[0],0,1,0,0);pzpRun(B,15);return B.every(b=>!b.on||(b.x>0&&b.x<PZ_PHY.W&&b.y>0&&b.y<PZ_PHY.H))})());
/* ball in hand */
B=pzpRack(rn);chk('ball in hand: on the foot spot is illegal, in the kitchen is legal, past the head string is illegal in the kitchen',!pzpCanPlace(B,660,220,false)&&pzpCanPlace(B,150,150,true)&&!pzpCanPlace(B,300,150,true));
/* rules */
const fresh=(grp,open)=>{const b=[mk(0,200,220),mk(1,500,220),mk(9,600,300),mk(2,300,100),mk(10,700,400),mk(8,440,60)];const st=pzrNew(b,0);st.brk=false;st.open=open;if(grp)st.grp=grp;return st};
const E=(...e)=>e;
let st=fresh(['s','t'],false);let rep=pzrJudge(st,[{t:'bb',a:0,b:9,s:500},{t:'cu',a:0,s:300}]);chk('rules: hitting the opponent\'s ball first is a foul with ball in hand',rep.foul&&rep.reason==='Wrong ball first'&&st.bih&&st.turn===1,rep);
st=fresh(['s','t'],false);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:500},{t:'cu',a:1,s:300},{t:'pk',a:1,p:2}]);chk('rules: pocketing your own ball keeps your turn',!rep.foul&&rep.keep&&st.turn===0,rep);
st=fresh(['s','t'],false);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:500},{t:'cu',a:1,s:300}]);chk('rules: a legal miss passes the turn without ball in hand',!rep.foul&&!rep.keep&&st.turn===1&&!st.bih,rep);
st=fresh(['s','t'],false);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:500},{t:'pk',a:0,p:2}]);chk('rules: a scratch is a foul',rep.foul&&rep.scratch,rep);
st=fresh(['s','t'],false);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:500}]);chk('rules: no cushion after contact (and nothing pocketed) is a foul',rep.foul&&rep.reason==='No cushion after contact',rep);
st=fresh(null,true);rep=pzrJudge(st,[{t:'bb',a:0,b:9,s:500},{t:'cu',a:9,s:100},{t:'pk',a:9,p:3}]);chk('rules: the first legal pot on an open table sets the groups',st.grp[0]==='t'&&st.grp[1]==='s'&&!st.open&&rep.keep,[st.grp,rep]);
st=fresh(['s','t'],false);st.B.find(b=>b.id===1).on=false;st.B.find(b=>b.id===2).on=false;rep=pzrJudge(st,[{t:'bb',a:0,b:8,s:500},{t:'pk',a:8,p:2}]);st.call=null;chk('rules: the 8 with your group gone wins the rack',st.over&&st.over.winner===0&&st.over.why==='8 ball',st.over);
st=fresh(['s','t'],false);st.call=3;st.B.find(b=>b.id===1).on=false;st.B.find(b=>b.id===2).on=false;pzrJudge(st,[{t:'bb',a:0,b:8,s:500},{t:'pk',a:8,p:2}]);chk('rules: the 8 in the wrong pocket loses the rack',st.over&&st.over.winner===1&&st.over.why==='8 in the wrong pocket',st.over);
st=fresh(['s','t'],false);pzrJudge(st,[{t:'bb',a:0,b:1,s:500},{t:'bb',a:1,b:8,s:300},{t:'pk',a:8,p:2}]);chk('rules: the 8 too early loses the rack',st.over&&st.over.winner===1&&st.over.why==='8 too early',st.over);
st=pzrNew([mk(0,200,220),mk(8,500,220),mk(1,300,100),mk(9,700,300)],0);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:900},{t:'pk',a:8,p:2}]);chk('rules: the 8 on the break (no scratch) is a golden break',st.over&&st.over.winner===0&&st.golden,st.over);
st=pzrNew([mk(0,200,220),mk(8,500,220),mk(1,300,100),mk(9,700,300)],0);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:900},{t:'pk',a:8,p:2},{t:'pk',a:0,p:3}]);chk('rules: the 8 on the break with a scratch is spotted, ball in hand in the kitchen',!st.over&&st.B.find(b=>b.id===8).on&&st.bih&&st.kitchen&&st.turn===1,[st.over,st.bih]);
st=pzrNew([mk(0,200,220),mk(1,500,220),mk(9,700,300)],0);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:900}]);chk('rules: a break with no pot and fewer than 4 cushions is an illegal break (foul)',rep.foul&&rep.reason==='Illegal break',rep);
st=fresh(['s','t'],false);st.house={bank8:1};st.B.find(b=>b.id===1).on=false;st.B.find(b=>b.id===2).on=false;st.call=null;rep=pzrJudge(st,[{t:'bb',a:0,b:8,s:500},{t:'pk',a:8,p:2}]);chk('rules: bank the 8 - an unbanked 8 is spotted and is a foul, not a win',!st.over&&rep.foul&&rep.spot8&&st.B.find(b=>b.id===8).on&&st.turn===1,[st.over,rep]);
st=fresh(['s','t'],false);st.house={bank8:1};st.B.find(b=>b.id===1).on=false;st.B.find(b=>b.id===2).on=false;rep=pzrJudge(st,[{t:'bb',a:0,b:8,s:500},{t:'cu',a:8,s:300},{t:'pk',a:8,p:2}]);chk('rules: bank the 8 - a banked 8 wins',st.over&&st.over.winner===0,st.over);
st=fresh(['s','t'],false);rep=pzrJudge(st,[{t:'bb',a:0,b:1,s:500},{t:'cu',a:1,s:300},{t:'pk',a:1,p:2}]);chk('rules: a banked pot is counted',rep.banks===1,rep);
console.log(`${n-bad} / ${n} passed`);process.exit(bad?1:0);
