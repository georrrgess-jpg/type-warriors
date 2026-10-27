casFrame("Liar's Bones");
/* tavern table seen from above-front */
g.fillStyle=lin(0,100,0,700,[[0,'#3a1a10'],[1,'#1a0a06']]);rr(60,100,1480,560,22);g.fill();
glow(800,260,520,'rgba(255,190,110,1)',.28);
g.save();g.fillStyle=lin(0,330,0,660,[[0,'#7a4a24'],[1,'#4a2a12']]);g.beginPath();g.ellipse(800,560,700,230,0,Math.PI,0);g.lineTo(1500,660);g.lineTo(100,660);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=4;g.stroke();
for(let i=0;i<8;i++){g.strokeStyle='rgba(30,10,0,.25)';g.lineWidth=2;g.beginPath();g.ellipse(800,600,620-i*70,180-i*20,0,Math.PI*1.05,Math.PI*1.95);g.stroke()}g.restore();
/* three opponents behind the table */
const opp=[['grizzle',330,'5 dice','#ffb04a'],['vesper',800,'4 dice','#ff7aa0'],['mortimer',1270,'3 dice','#c0a0ff']];
opp.forEach(([id,x,d,c],i)=>{mon(id,x,440,.55,i===2,i);
 /* upside-down cups */
 g.save();g.translate(x,500);g.scale(1.3,1.3);g.fillStyle=lin(-40,-46,40,0,[[0,'#8a5a2a'],[1,'#4a2a10']]);g.beginPath();g.moveTo(-42,0);g.lineTo(-30,-48);g.lineTo(30,-48);g.lineTo(42,0);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.fillStyle='#c99a3a';g.fillRect(-36,-14,72,6);g.restore();g.save();g.fillStyle='rgba(20,8,30,.9)';rr(x-60,512,120,30,15);g.fill();g.lineWidth=2;g.strokeStyle=c;g.stroke();g.restore();txt(d,x,533,15,c,800,'center');});
/* speech bubble: Vesper's bid */
g.save();g.fillStyle='#fff';rr(850,190,250,70,18);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.beginPath();g.moveTo(870,260);g.lineTo(850,290);g.lineTo(900,260);g.fill();g.restore();
txt('"Seven sixes."',975,232,24,'#3a0a2a',900,'center');txt('Vesper raises the bid',975,252,13,'#7a4a6a',700,'center');
/* tell: sweat drop + eye glance */
g.fillStyle='#9fe8ff';g.beginPath();g.moveTo(860,300);g.quadraticCurveTo(872,322,860,330);g.quadraticCurveTo(848,322,860,300);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();
txt('TELL: she glanced at her cup',800,170,16,'#ffd45a',800,'center');
/* your dice (lifted cup) in front */
const die=(x,y,n,s,held)=>{g.save();g.translate(x,y);g.fillStyle=held?'#fff6d8':'#f4ecd8';rr(-s/2,-s/2,s,s,s*.18);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
 const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[n];
 g.fillStyle=n===1?'#c0202a':'#12081f';P.forEach(([a,b])=>{g.beginPath();g.arc(a*s*.26,b*s*.26,s*.09,0,TAU);g.fill()});g.restore()};
[[620,6],[700,6],[780,2],[860,6],[940,1]].forEach(([x,n],i)=>{glow(x,600,40,'rgba(255,212,90,1)',n===6||n===1?.35:0);die(x,600,n,62,true)});
txt('Your cup · ones are wild',780,560,15,'#ffe9a8',800,'center');
/* total dice + odds helper */
panel(80,120,300,150,'#ffd45a');ttl('15 dice',230,170,34,'#ffd45a','center');txt('on the table',230,194,14,'#c4badf',700,'center');
txt('Odds of 7+ sixes: 41%',230,230,16,'#7dff9a',800,'center');txt('(counting your 4)',230,252,13,'#c4badf',700,'center');
panel(1220,120,300,150,'#ff8a98');ttl('Pot 4,000',1370,170,34,'#ffd45a','center');txt('last cup standing takes it',1370,196,14,'#c4badf',700,'center');txt('You: 5 dice',1370,236,18,'#fff',800,'center');
/* actions */
gbtn(220,680,340,70,'RAISE','eight sixes',null);
gbtn(630,680,340,70,'LIAR!','call the bluff',[[0,'#ff8aa0'],[1,'#c02a4a']]);
gbtn(1040,680,340,70,'SPOT ON','exact: win big',[[0,'#9fe8ff'],[1,'#2a8ad0']]);
betBar(768,'Buy-in','1,000');
