casFrame('Gutter Kings');
/* bowling alley, looking down the lane */
g.fillStyle=lin(0,100,0,660,[[0,'#140a2a'],[1,'#2a1440']]);rr(60,100,1080,560,22);g.fill();
g.save();rr(60,100,1080,560,22);g.clip();
/* neon back wall */
for(let i=0;i<6;i++){g.strokeStyle=['#ff4a9a','#4ad8ff','#ffd45a'][i%3];g.globalAlpha=.6;g.lineWidth=4;g.beginPath();g.moveTo(60,140+i*10);g.lineTo(1140,140+i*10);g.stroke()}g.globalAlpha=1;
ttl('GUTTER KINGS',600,230,52,'#ff7ad8','center');
/* lane in perspective */
const VX=600,VY=250;
g.fillStyle=lin(0,VY,0,660,[[0,'#c89a5a'],[1,'#f0c890']]);g.beginPath();g.moveTo(VX-90,VY+40);g.lineTo(VX+90,VY+40);g.lineTo(VX+380,660);g.lineTo(VX-380,660);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
for(let i=-6;i<=6;i++){g.strokeStyle='rgba(120,70,20,.2)';g.lineWidth=1.5;g.beginPath();g.moveTo(VX+i*14,VY+40);g.lineTo(VX+i*58,660);g.stroke()}
/* gutters */
g.fillStyle='#2a1a3a';[[-1],[1]].forEach(([s])=>{g.beginPath();g.moveTo(VX+s*90,VY+40);g.lineTo(VX+s*110,VY+40);g.lineTo(VX+s*440,660);g.lineTo(VX+s*380,660);g.fill()});
/* arrows */
for(let i=-3;i<=3;i++){g.fillStyle='#8a4a1a';g.beginPath();g.moveTo(VX+i*30,470);g.lineTo(VX+i*30-8,488);g.lineTo(VX+i*30+8,488);g.fill()}
/* pins: monster-themed, one golden */
const pin=(x,y,s,gold,fall)=>{g.save();g.translate(x,y);g.rotate(fall||0);g.scale(s,s);g.fillStyle=gold?lin(-12,-50,12,0,[[0,'#fff1a0'],[1,'#c08a1a']]):'#fbf6ee';g.beginPath();g.moveTo(0,-52);g.bezierCurveTo(10,-52,10,-36,6,-30);g.bezierCurveTo(16,-18,14,-4,8,0);g.lineTo(-8,0);g.bezierCurveTo(-14,-4,-16,-18,-6,-30);g.bezierCurveTo(-10,-36,-10,-52,0,-52);g.fill();g.strokeStyle=O;g.lineWidth=2.5;g.stroke();
 g.fillStyle=gold?'#7a3a0a':'#d02a3a';g.fillRect(-6,-32,12,3);eye(-3,-44,3,.5,O,0);eye(3,-44,3,.5,O,0);if(gold)glow(0,-26,40,'rgba(255,212,90,1)',.6);g.restore()};
const P=[[0,0],[-1,1],[1,1],[-2,2],[0,2],[2,2],[-3,3],[-1,3],[1,3],[3,3]];
P.map((p,k)=>[p,k]).reverse().forEach(([[c,r],k])=>{const x=VX+c*24,y=VY+74-r*9;pin(x,y,1.25,k===4,k===6||k===9?(k===6?-1.2:1.1):0)});
/* the ball rolling, with a curve trail */
g.strokeStyle='rgba(255,122,216,.5)';g.lineWidth=8;g.beginPath();g.moveTo(VX+120,640);g.quadraticCurveTo(VX+150,450,VX+30,360);g.stroke();
glow(VX+70,430,60,'rgba(255,122,216,1)',.6);g.fillStyle=lin(VX+40,400,VX+100,460,[[0,'#ff9ae8'],[1,'#7a1a8a']]);g.beginPath();g.arc(VX+70,430,30,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
[[-8,-10],[4,-14],[-2,-2]].forEach(([a,b])=>{g.fillStyle=O;g.beginPath();g.arc(VX+70+a,430+b,4,0,TAU);g.fill()});
g.restore();g.save();g.lineWidth=4;g.strokeStyle='#c99a3a';rr(60,100,1080,560,22);g.stroke();g.restore();
/* bowler monster */
mon('barnacle',230,650,.42,false,1);
/* aim + spin controls on the lane */
g.save();g.fillStyle='rgba(20,8,30,.85)';rr(860,560,260,84,14);g.fill();g.lineWidth=2;g.strokeStyle='#ff7ad8';g.stroke();g.restore();
txt('AIM',890,588,13,'#ffb0e8',900);g.fillStyle='rgba(255,255,255,.15)';rr(930,578,170,12,6);g.fill();g.fillStyle='#ff7ad8';g.beginPath();g.arc(1040,584,10,0,TAU);g.fill();
txt('SPIN',890,624,13,'#ffb0e8',900);g.fillStyle='rgba(255,255,255,.15)';rr(930,614,170,12,6);g.fill();g.fillStyle='#4ad8ff';g.beginPath();g.arc(985,620,10,0,TAU);g.fill();
/* right panel: frame + payouts */
panel(1160,100,380,560,'#ff7ad8');ttl('3-frame match',1350,150,32,'#ffd45a','center');
/* score frames */
[['X','30'],['9 /','49'],['',' ']].forEach(([a,b],i)=>{const x=1185+i*112;g.save();g.fillStyle='rgba(255,255,255,.08)';rr(x,176,100,90,10);g.fill();g.lineWidth=2;g.strokeStyle=i===2?'#ffd45a':'rgba(255,255,255,.3)';g.stroke();g.restore();ttl(a||'?',x+50,214,28,i<2?'#ffe9a8':'#ffd45a','center');txt(b,x+50,252,18,'#c4badf',800,'center')});
txt('Frame 3 · ball 1',1350,296,15,'#ffd45a',800,'center');
const pay=[['Golden pin down','+1×'],['Strike','×1.6'],['Spare','×1.2'],['Turkey (3 strikes)','×8'],['Split converted','×4']];pay.forEach(([a,b],i)=>{const y=318+i*34;g.save();g.fillStyle='rgba(255,255,255,.05)';rr(1180,y,340,28,8);g.fill();g.restore();txt(a,1194,y+20,15,'#ffe9a8',800);txt(b,1506,y+20,15,'#7dff9a',800,'right')});
txt('Now',1350,516,15,'#c4badf',800,'center');ttl('2.6×',1350,566,46,'#7dff9a','center');
txt('Pins pay by score; the golden pin',1350,604,13,'#c4badf',700,'center');txt('moves every frame',1350,622,13,'#c4badf',700,'center');
gbtn(300,676,360,70,'BOWL','Space: power',[[0,'#ff9ae8'],[1,'#c02a9a']]);gbtn(740,676,360,70,'CASH OUT','2,600',[[0,'#8affa8'],[1,'#22a85a']]);
betBar(768,'Bet','1,000');
