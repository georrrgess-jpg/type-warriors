casFrame('Goblin Cascade');
/* arcade cabinet */
g.save();g.fillStyle=lin(0,100,0,700,[[0,'#4a1a6a'],[1,'#2a0a3a']]);rr(330,96,940,610,30);g.fill();g.lineWidth=5;g.strokeStyle='#ffd45a';g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(326,92,948,618,32);g.stroke();g.restore();
/* marquee bulbs */
for(let i=0;i<30;i++){const x=350+i*31;g.fillStyle=i%2?'#ffe37a':'#ff7a9a';g.beginPath();g.arc(x,110,6,0,TAU);g.fill();glow(x,110,14,i%2?'rgba(255,227,122,1)':'rgba(255,122,154,1)',.5)}
/* glass window */
g.save();rr(370,130,860,520,20);g.clip();
g.fillStyle=lin(0,130,0,650,[[0,'#1a0a2a'],[1,'#3a1a4a']]);g.fillRect(370,130,860,520);
/* goblin coin-spitter at top */
mon('grizzle',800,298,.24,false,1);
/* back shelf (pusher, moving) */
g.fillStyle=lin(0,300,0,360,[[0,'#c0b0d0'],[1,'#7a6a90']]);g.fillRect(420,300,760,70);g.strokeStyle=O;g.lineWidth=3;g.strokeRect(420,300,760,70);
txt('◄  PUSHER  ►',800,342,18,'#3a2a5a',900,'center');
/* main play field, perspective */
g.fillStyle=lin(0,370,0,620,[[0,'#6a5a80'],[1,'#a898c0']]);g.beginPath();g.moveTo(420,370);g.lineTo(1180,370);g.lineTo(1230,620);g.lineTo(370,620);g.closePath();g.fill();
/* coins piled */
const coinE=(x,y,s,c)=>{g.save();g.fillStyle=c||'#c08a1a';g.beginPath();g.ellipse(x,y+3*s,16*s,7*s,0,0,TAU);g.fill();g.fillStyle=lin(x-16*s,y,x+16*s,y,[[0,'#fff1a0'],[.5,'#ffc93a'],[1,'#c07a10']]);g.beginPath();g.ellipse(x,y,16*s,7*s,0,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=1.5;g.stroke();g.restore()};
for(let i=0;i<220;i++){const u=rnd(i),v=rnd(i+300);const y=380+v*230,s=.8+v*.6,x=430+u*(740+v*80)-v*40;coinE(x,y,s)}
/* treasures in the pile */
const gem=(x,y,c,r)=>{glow(x,y,r*2.2,c,.6);g.fillStyle=c;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.8,y);g.lineTo(x,y+r);g.lineTo(x-r*.8,y);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=2.5;g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.3,y-r*.2);g.lineTo(x-r*.2,y-r*.1);g.fill()};
gem(560,520,'#ff4a7a',18);gem(980,560,'#4ad8ff',20);gem(760,470,'#7dff9a',16);
/* golden goblin idol teetering at the edge */
g.save();g.translate(1050,606);g.rotate(-.25);g.scale(1.4,1.4);glow(0,-30,70,'rgba(255,212,90,1)',.6);g.fillStyle=lin(-24,-70,24,0,[[0,'#fff1a0'],[1,'#c08a1a']]);g.beginPath();g.ellipse(0,-36,24,34,0,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
eye(-8,-44,6,.5,O,0);eye(8,-44,6,.5,O,0);g.restore();
ttl('ALMOST!',1060,500,26,'#ffd45a','center');
/* falling coins over the edge */
for(let i=0;i<10;i++)coinE(470+i*80+rnd(i)*30,632+rnd(i+4)*14,1.1);
/* drop chute markers */
[520,680,860,960,1080].forEach((x,i)=>{g.fillStyle=i===2?'rgba(255,212,90,.9)':'rgba(255,255,255,.25)';g.beginPath();g.moveTo(x-14,140);g.lineTo(x+14,140);g.lineTo(x,162);g.fill()});
/* falling coin in the selected chute */
coinE(860,215,1.2);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=2;[0].forEach(()=>{g.beginPath();g.moveTo(850,190);g.lineTo(850,170);g.stroke()});
g.restore();
/* tray at the bottom */
g.save();g.fillStyle='#1a0a2a';rr(470,664,660,34,12);g.fill();g.lineWidth=3;g.strokeStyle='#ffd45a';g.stroke();g.restore();txt('WON THIS SESSION  +1,240',800,688,18,'#7dff9a',900,'center');
/* side panels */
panel(70,120,240,520,'#ffd45a');ttl('Prizes',190,168,32,'#ffd45a','center');
[['Ruby','25×','#ff4a7a'],['Sapphire','50×','#4ad8ff'],['Emerald','10×','#7dff9a'],['Gold idol','JACKPOT','#ffd45a']].forEach(([a,b,c],i)=>{const y=210+i*92;gem(110,y+20,c,16);txt(a,140,y+16,17,'#ffe9a8',800);txt(b,140,y+40,18,c,900)});
txt('Coins that fall off the',190,590,14,'#c4badf',700,'center');txt('front edge are yours',190,610,14,'#c4badf',700,'center');
panel(1290,120,240,520,'#7dff9a');ttl('Coin',1410,168,32,'#ffd45a','center');ttl('50',1410,236,56,'#fff','center');txt('gold each drop',1410,262,14,'#c4badf',700,'center');
txt('Pusher heat',1410,320,15,'#c4badf',800,'center');g.fillStyle='rgba(255,255,255,.1)';rr(1320,334,180,18,9);g.fill();g.fillStyle=lin(1320,0,1500,0,[[0,'#ffd45a'],[1,'#ff5a3a']]);rr(1320,334,130,18,9);g.fill();
txt('every 25 drops: a Shake!',1410,376,14,'#ffb070',800,'center');
gbtn(1310,420,200,70,'DROP','Space',null);gbtn(1310,510,200,70,'AUTO ×10','hold',[[0,'#c0a0ff'],[1,'#6a3ad0']]);
txt('← → pick the chute',1410,612,14,'#c4badf',700,'center');
betBar(768,'Coin','50');
