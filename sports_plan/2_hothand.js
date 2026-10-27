casFrame('Hot Hand');
const CX=60,CY=100,CW=1030,CH=560;
g.save();rr(CX,CY,CW,CH,22);g.clip();
/* arena backdrop: dark crowd, spotlights */
g.fillStyle=lin(0,CY,0,CY+260,[[0,'#140a2a'],[1,'#2a1440']]);g.fillRect(CX,CY,CW,260);
for(let i=0;i<120;i++){const x=CX+rnd(i)*CW,y=CY+60+rnd(i+50)*170;g.fillStyle=`rgba(${['255,138,106','138,255,192','255,212,90','159,232,255','208,160,255'][i%5]},${.35+rnd(i+3)*.4})`;g.beginPath();g.arc(x,y,4+rnd(i+7)*3,0,TAU);g.fill()}
glow(300,CY,320,'rgba(255,230,160,1)',.25);glow(800,CY,320,'rgba(255,230,160,1)',.25);
/* jumbotron */
g.save();g.fillStyle='#0a0614';rr(780,CY+18,240,70,10);g.fill();g.lineWidth=3;g.strokeStyle='#ff8a3a';g.stroke();g.restore();
ttl('ON FIRE',900,CY+66,36,'#ff8a3a','center');
/* court floor in perspective */
g.fillStyle=lin(0,CY+260,0,CY+CH,[[0,'#c8823a'],[1,'#e8a858']]);g.beginPath();g.moveTo(CX,CY+300);g.lineTo(CX+CW,CY+300);g.lineTo(CX+CW,CY+CH);g.lineTo(CX,CY+CH);g.fill();
for(let i=0;i<26;i++){g.strokeStyle='rgba(120,60,20,.18)';g.lineWidth=2;g.beginPath();g.moveTo(CX+i*42,CY+300);g.lineTo(CX-200+i*58,CY+CH);g.stroke()}
/* shot zones as arcs from the hoop (hoop at top centre-right) */
const HX=575,HY=CY+300;
const zone=(r0,r1,col,a)=>{g.save();g.fillStyle=col;g.globalAlpha=a;g.beginPath();g.ellipse(HX,HY,r1,r1*.42,0,0,Math.PI);g.ellipse(HX,HY,r0,r0*.42,0,Math.PI,0,true);g.fill();g.restore()};
zone(0,120,'#7dff9a',.35);zone(120,250,'#ffe37a',.3);zone(250,380,'#ff9a5a',.3);zone(380,620,'#ff5a7a',.22);
g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=3;[120,250,380].forEach(r=>{g.beginPath();g.ellipse(HX,HY,r,r*.42,0,0,Math.PI);g.stroke()});
const zl=[['LAYUP','85% · ×1.13',HX,HY+28,'#1a5a2a'],['MID','62% · ×1.55',HX+180,HY+62,'#5a4a04'],['THREE','40% · ×2.40',HX+300,HY+128,'#5a2a04'],['HEAVE','8% · ×12',HX+400,HY+226,'#5a0414']];
zl.forEach(([a,b,x,y,c])=>{g.save();g.fillStyle='rgba(255,255,255,.88)';rr(x-62,y-20,124,44,10);g.fill();g.lineWidth=2;g.strokeStyle=O;g.stroke();g.restore();txt(a,x,y-1,15,c,900,'center');txt(b,x,y+17,13,c,800,'center')});
/* backboard + hoop */
g.save();g.fillStyle='rgba(255,255,255,.85)';rr(HX-70,CY+150,140,92,6);g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();g.strokeStyle='#e04a2a';g.lineWidth=4;g.strokeRect(HX-26,CY+196,52,36);g.restore();
g.fillStyle='#3a3a4a';g.fillRect(HX-6,CY+242,12,58);
g.strokeStyle='#ff6a1a';g.lineWidth=6;g.beginPath();g.ellipse(HX,CY+246,34,9,0,0,TAU);g.stroke();
for(let k=0;k<7;k++){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.beginPath();g.moveTo(HX-32+k*10.6,CY+250);g.lineTo(HX-20+k*6.6,CY+290);g.stroke()}
g.restore();
g.save();g.lineWidth=4;g.strokeStyle='#c99a3a';rr(CX,CY,CW,CH,22);g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(CX-3,CY-3,CW+6,CH+6,24);g.stroke();g.restore();
/* shooter (Grizzle) at the three line, defender (Mortimer) */
mon('mortimer',CX+110,CY+540,.36,false,1);
mon('grizzle',330,CY+548,.46,false,2);
/* ball arc with fire trail */
const P0=[360,CY+400],P1=[HX,CY+240],C=[440,CY+40];
for(let k=0;k<24;k++){const u=k/24;const x=(1-u)*(1-u)*P0[0]+2*(1-u)*u*C[0]+u*u*P1[0],y=(1-u)*(1-u)*P0[1]+2*(1-u)*u*C[1]+u*u*P1[1];
 g.fillStyle=`rgba(255,${120+k*5},40,${.08+u*.5})`;g.beginPath();g.arc(x,y,6+u*12,0,TAU);g.fill()}
const u=.82,bx=(1-u)*(1-u)*P0[0]+2*(1-u)*u*C[0]+u*u*P1[0],by=(1-u)*(1-u)*P0[1]+2*(1-u)*u*C[1]+u*u*P1[1];
glow(bx,by,70,'rgba(255,140,40,1)',.8);
g.fillStyle=lin(bx-16,by-16,bx+16,by+16,[[0,'#ffb060'],[1,'#c0501a']]);g.beginPath();g.arc(bx,by,17,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
g.strokeStyle='rgba(18,8,31,.6)';g.lineWidth=2;g.beginPath();g.moveTo(bx-17,by);g.lineTo(bx+17,by);g.moveTo(bx,by-17);g.quadraticCurveTo(bx+9,by,bx,by+17);g.stroke();
/* shot clock */
g.save();g.fillStyle='#0a0614';rr(CX+24,CY+20,110,62,10);g.fill();g.lineWidth=3;g.strokeStyle='#ff4a4a';g.stroke();g.restore();ttl('0:06',CX+79,CY+64,34,'#ff6a6a','center');txt('SHOT CLOCK',CX+79,CY+98,11,'#ffb0b0',800,'center');
/* ---- right panel: the streak ---- */
panel(1110,100,430,560,'#ff8a3a');
ttl('Streak',1325,150,36,'#ffd45a','center');
/* heat meter: 3 flames */
for(let i=0;i<3;i++){const x=1225+i*100,y=210;glow(x,y,46,'rgba(255,120,30,1)',.55);
 g.fillStyle=lin(x,y-34,x,y+20,[[0,'#ffe37a'],[.5,'#ff8a1a'],[1,'#d02a0a']]);g.beginPath();g.moveTo(x,y-36);g.bezierCurveTo(x+26,y-10,x+22,y+20,x,y+22);g.bezierCurveTo(x-22,y+20,x-26,y-10,x,y-36);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke()}
txt('HEAT 3 / 3 · next shot +25%',1325,258,15,'#ffb070',800,'center');
txt('Multiplier',1325,300,16,'#c4badf',700,'center');ttl('4.32×',1325,360,64,'#ffd45a','center');
/* made shots log */
const log=[['Layup','×1.13'],['Three','×2.40'],['Mid','×1.55'],['🔥 Heat check','next']];
log.forEach(([a,b],i)=>{const y=392+i*34;g.save();g.fillStyle=i===3?'rgba(255,120,30,.25)':'rgba(255,255,255,.06)';rr(1140,y,370,28,8);g.fill();g.restore();txt((i<3?'✓ ':'')+a,1154,y+20,15,i===3?'#ffb070':'#7dff9a',800);txt(b,1496,y+20,15,'#ffe9a8',800,'right')});
gbtn(1140,544,370,70,'CASH OUT','4,320',[[0,'#8affa8'],[1,'#22a85a']]);
txt('One miss ends the run',1325,640,14,'#c4badf',600,'center');
const sb=[['Layup','×1.13',[[0,'#8affa8'],[1,'#22a85a']]],['Mid','×1.55',null],['Three','×2.40',[[0,'#ffb070'],[1,'#e0601a']]],['Heave','×12',[[0,'#ff8aa0'],[1,'#c02a4a']]]];
sb.forEach(([a,b,c],i)=>gbtn(70+i*258,676,240,70,a,b,c));
betBar(768,'Bet','1,000');
