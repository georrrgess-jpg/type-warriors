casFrame('Dugout Derby');
const FX=60,FY=100,FW=1030,FH=560;
g.save();rr(FX,FY,FW,FH,22);g.clip();
/* night sky + stadium lights */
g.fillStyle=lin(0,FY,0,FY+220,[[0,'#0e0a2a'],[1,'#2a1a4a']]);g.fillRect(FX,FY,FW,220);
for(let i=0;i<60;i++){g.fillStyle=`rgba(255,255,255,${.3+rnd(i)*.5})`;g.fillRect(FX+rnd(i+1)*FW,FY+rnd(i+2)*120,2,2)}
[[180,FY+40],[920,FY+40]].forEach(([x,y])=>{glow(x,y,160,'rgba(255,250,220,1)',.4);g.fillStyle='#2a2a3a';g.fillRect(x-4,y,8,120);g.fillStyle='#fffbe0';rr(x-40,y-18,80,24,4);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke()});
/* outfield wall + crowd */
g.fillStyle='#1a5a3a';g.fillRect(FX,FY+170,FW,40);for(let i=0;i<100;i++){g.fillStyle=['#ff8a6a','#8affc0','#ffd45a','#9fe8ff','#d0a0ff'][i%5];g.beginPath();g.arc(FX+5+i*10.4,FY+150+rnd(i)*16,4,0,TAU);g.fill()}
txt('405',FX+FW/2,FY+196,20,'#ffe9a8',900,'center');
/* grass */
g.fillStyle=lin(0,FY+210,0,FY+FH,[[0,'#2a8a4a'],[1,'#3aa85a']]);g.fillRect(FX,FY+210,FW,FH-210);
for(let i=0;i<12;i++){g.fillStyle='rgba(255,255,255,.05)';g.beginPath();g.moveTo(FX+i*100,FY+210);g.lineTo(FX+i*100+50,FY+210);g.lineTo(FX-300+i*160+80,FY+FH);g.lineTo(FX-300+i*160,FY+FH);g.fill()}
/* infield diamond (perspective) */
const H=[575,FY+520],B1=[800,FY+410],B2=[575,FY+320],B3=[350,FY+410];
g.fillStyle='#c8864a';g.beginPath();g.moveTo(H[0],H[1]+30);g.lineTo(B1[0]+60,B1[1]);g.lineTo(B2[0],B2[1]-50);g.lineTo(B3[0]-60,B3[1]);g.closePath();g.fill();
g.fillStyle='#2f9a52';g.beginPath();g.moveTo(H[0],H[1]-28);g.lineTo(B1[0]-40,B1[1]);g.lineTo(B2[0],B2[1]+26);g.lineTo(B3[0]+40,B3[1]);g.closePath();g.fill();
g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(H[0],H[1]);g.lineTo(B1[0],B1[1]);g.lineTo(B2[0],B2[1]);g.lineTo(B3[0],B3[1]);g.closePath();g.stroke();
/* mound */
g.fillStyle='#c8864a';g.beginPath();g.ellipse(575,FY+410,40,16,0,0,TAU);g.fill();
/* bases */
const base=(p,on)=>{g.save();g.translate(p[0],p[1]);g.fillStyle=on?'#ffd45a':'#fff';g.beginPath();g.moveTo(0,-9);g.lineTo(14,0);g.lineTo(0,9);g.lineTo(-14,0);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();if(on)glow(0,0,40,'rgba(255,212,90,1)',.6);g.restore()};
base(B1,true);base(B2,false);base(B3,true);
g.fillStyle='#fff';g.beginPath();g.moveTo(H[0]-12,H[1]-6);g.lineTo(H[0]+12,H[1]-6);g.lineTo(H[0]+12,H[1]+4);g.lineTo(H[0],H[1]+12);g.lineTo(H[0]-12,H[1]+4);g.fill();
/* runners on 1st and 3rd */
mon('gloop',B1[0]+18,B1[1]+4,.17,false,1);mon('hootsworth',B3[0]-16,B3[1]+4,.17,true,2);
/* pitcher on mound, batter at home */
mon('barnacle',575,FY+412,.3,false,1);
mon('grizzle',H[0]-70,H[1]+40,.32,false,3);
/* pitch tell bubble */
g.save();g.fillStyle='#fff';rr(620,FY+250,190,54,16);g.fill();g.lineWidth=3;g.strokeStyle=O;g.stroke();g.beginPath();g.moveTo(640,FY+304);g.lineTo(612,FY+330);g.lineTo(662,FY+304);g.fill();g.restore();
txt('Curveball wind-up!',715,FY+284,16,'#3a1a6a',900,'center');
/* ball in flight */
glow(560,FY+470,26,'rgba(255,255,255,1)',.6);g.fillStyle='#fff';g.beginPath();g.arc(560,FY+470,8,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();
g.restore();
g.save();g.lineWidth=4;g.strokeStyle='#c99a3a';rr(FX,FY,FW,FH,22);g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(FX-3,FY-3,FW+6,FH+6,24);g.stroke();g.restore();
/* scoreboard top-left */
g.save();g.fillStyle='#0a1a12';rr(FX+20,FY+20,300,96,12);g.fill();g.lineWidth=3;g.strokeStyle='#ffd45a';g.stroke();g.restore();
txt('RUNS',FX+60,FY+46,13,'#9fe8a8',800,'center');ttl('3',FX+60,FY+92,42,'#ffd45a','center');
txt('OUTS',FX+150,FY+46,13,'#9fe8a8',800,'center');[0,1,2].forEach(i=>{g.fillStyle=i<1?'#ff5a5a':'#2a3a2a';g.beginPath();g.arc(FX+124+i*26,FY+78,9,0,TAU);g.fill();g.strokeStyle='#000';g.lineWidth=2;g.stroke()});
txt('COUNT',FX+258,FY+46,13,'#9fe8a8',800,'center');ttl('1-2',FX+258,FY+90,32,'#fff','center');
/* ---- right panel: payout and swings ---- */
panel(1110,100,430,560,'#7dff9a');
ttl('The inning',1325,150,34,'#ffd45a','center');
/* runs ladder */
const lad=[['0 runs','0×'],['1 run','0.6×'],['2 runs','1.2×'],['3 runs','2.1×'],['4 runs','3.4×'],['5 runs','5.5×'],['grand slam +','×2 bonus']];
lad.forEach(([a,b],i)=>{const y=172+i*36,on=i===3;g.save();g.fillStyle=on?'rgba(125,255,154,.22)':'rgba(255,255,255,.05)';rr(1140,y,370,30,8);g.fill();if(on){g.lineWidth=2;g.strokeStyle='#7dff9a';g.stroke()}g.restore();
 txt(a,1156,y+21,15,on?'#7dff9a':'#c4badf',800);txt(b,1494,y+21,15,on?'#7dff9a':'#ffe9a8',800,'right')});
txt('Bank now',1325,450,16,'#c4badf',700,'center');ttl('2,100',1325,494,44,'#7dff9a','center');
gbtn(1140,520,370,64,'BANK RUNS','walk off with 2,100',[[0,'#8affa8'],[1,'#22a85a']]);
txt('Three outs and the inning is over',1325,612,14,'#c4badf',600,'center');
txt('Runners on 1st and 3rd',1325,636,14,'#ffd45a',700,'center');
/* swing choices */
const sw=[['Contact','single 55% · out 45%',[[0,'#9fe8ff'],[1,'#2a8ad0']]],['Gap','double 35% · out 65%',null],['Power','homer 16% · K 84%',[[0,'#ff8aa0'],[1,'#c02a4a']]]];
sw.forEach(([a,b,c],i)=>gbtn(70+i*343,676,325,70,a,b,c));
betBar(768,'Bet','1,000');
