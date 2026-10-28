// {"map":"moss","wave":8,"towers":[[2,"ballista",2],[5,"frost",2],[4,"brazier",2],[7,"bell",2]],"secs":14}
/* blood-red night over the map */
g.save();g.fillStyle='rgba(120,0,20,.38)';g.fillRect(0,0,1600,900);g.fillStyle='rgba(10,0,20,.25)';g.fillRect(0,0,1600,900);g.restore();
/* the moon */const mx=700,my=230;glow(mx,my,260,'rgba(255,60,60,1)',.45);g.fillStyle=lin(mx-90,my-90,mx+90,my+90,[[0,'#ff9a8a'],[1,'#a0101e']]);g.beginPath();g.arc(mx,my,90,0,TAU);g.fill();g.lineWidth=5;g.strokeStyle=O;g.stroke();
[[-30,-20,18],[24,10,12],[-10,40,10],[40,-34,8]].forEach(([a,b,r])=>{g.fillStyle='rgba(120,0,20,.45)';g.beginPath();g.arc(mx+a,my+b,r,0,TAU);g.fill()});
/* red eyes glinting in the trees, monsters with a red aura */
for(let i=0;i<10;i++){const x=80+rnd(i)*900,y=130+rnd(i+20)*560;g.fillStyle='#ff3a3a';g.beginPath();g.arc(x,y,3,0,TAU);g.arc(x+9,y,3,0,TAU);g.fill()}
glow(150,300,160,'rgba(255,40,40,1)',.35);
/* event banner */
g.save();g.fillStyle='rgba(30,4,10,.94)';rr(390,350,620,190,22);g.fill();g.lineWidth=4;g.strokeStyle='#ff5a6a';g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(386,346,628,198,24);g.stroke();g.restore();
ttl('The Blood Moon rises',700,402,42,'#ff8a8a','center');txt('WAVE EVENT  ·  this wave only',700,428,14,'#ffb0b0',900,'center');
[['▲','Monsters move 25% faster and heal 1%/s','#ff8a8a'],['▲','Bosses arrive with a blood shield','#ff8a8a'],['★','Double coins and a guaranteed rune','#7dff9a']].forEach(([a,b,c],i)=>{txt(a,440,466+i*26,15,c,900);txt(b,464,466+i*26,16,'#ffe9e9',700)});
/* upcoming events strip */
panel(1060,150,500,600,'#ff5a6a');ttl('Wave Events',1082,202,36,'#ffd45a');txt('Every few waves the world changes',1084,230,14,'#c4badf',700);
const EV=[['Blood Moon','faster, healing monsters · ×2 coins','#ff5a6a','●'],['Thunderstorm','Storm Bell ×2, flyers grounded, ballista −20% range','#9fe8ff','ϟ'],['Fog of the Hollow','tower range −25%, shrouded monsters; Beacon reveals','#c4badf','≋'],['Golden Hour','every kill drops coins; a golden goblin crosses the map','#ffd45a','☀'],['Earthquake','the road shifts: monsters stumble, pads may crack','#c8a070','⌇']];
EV.forEach(([n,d,c,ic],i)=>{const y=256+i*92;g.save();g.fillStyle=i===0?'rgba(255,90,106,.15)':'rgba(255,255,255,.05)';rr(1080,y,460,80,14);g.fill();g.lineWidth=2;g.strokeStyle=i===0?c:'rgba(255,255,255,.15)';g.stroke();g.fillStyle=c;g.beginPath();g.arc(1120,y+40,24,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.restore();txt(ic,1120,y+48,22,O,900,'center');
 ttl(n,1158,y+36,24,i===0?'#ff8a8a':'#ffe9a8');let line=d;txt(line,1158,y+60,13,'#c4badf',700)});
txt('Endless Wonderland: an event every 5th wave',1310,736,13,'#c4badf',700,'center');
