// {"map":"moss","wave":6,"towers":[[2,"ballista",2],[5,"frost",2]],"secs":10}
/* ---- the Thunder Mortar: a squat bronze siege mortar on the shared plinth ---- */
function mortar(x,y,tier,s,fire){g.save();g.translate(x,y);g.scale(s,s);plinth(0,0,'#d8cfe6');
 /* timber cradle */
 g.fillStyle=lin(-40,-70,40,-20,[[0,'#a8743a'],[1,'#6a4220']]);rr(-44,-58,88,40,8);g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();
 g.fillStyle='#ffd45a';[-30,30].forEach(px=>{g.beginPath();g.arc(px,-38,6,0,TAU);g.fill();g.stroke()});
 /* barrel, tilted up-right */
 g.save();g.translate(0,-56);g.rotate(-.55);g.scale(.66,.66);
 g.fillStyle=lin(-30,-34,30,34,[[0,'#ffd08a'],[.5,'#c88a3a'],[1,'#7a4a1a']]);g.beginPath();g.moveTo(-34,-30);g.lineTo(52,-40);g.quadraticCurveTo(62,0,52,40);g.lineTo(-34,30);g.quadraticCurveTo(-46,0,-34,-30);g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();
 /* bands */
 g.strokeStyle='#5a3a12';g.lineWidth=5;[-8,22].forEach(bx=>{g.beginPath();g.moveTo(bx,-34+bx*.08);g.quadraticCurveTo(bx+8,0,bx,34-bx*.08);g.stroke()});
 /* muzzle */
 g.fillStyle='#2a1a0a';g.beginPath();g.ellipse(54,0,12,38,0,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=4;g.stroke();
 g.strokeStyle='#ffd45a';g.lineWidth=3;g.beginPath();g.ellipse(54,0,15,41,0,0,TAU);g.stroke();
 if(tier>=3){/* rune on the barrel */g.fillStyle='#9fe8ff';g.font='bold 22px serif';g.fillText('ᚦ',0,8);glow(8,0,26,'rgba(159,232,255,1)',.5)}
 if(fire){glow(70,0,70,'rgba(255,190,90,1)',.9);for(let i=0;i<8;i++){g.fillStyle=`rgba(200,190,180,${.6-i*.06})`;g.beginPath();g.arc(70+i*9,-6+Math.sin(i)*10,10+i*3,0,TAU);g.fill()}}
 g.restore();
 /* shell crate */
 g.fillStyle=lin(30,-30,70,0,[[0,'#8a5a2a'],[1,'#5a3a1a']]);rr(28,-34,40,28,5);g.fill();g.lineWidth=3;g.strokeStyle=O;g.stroke();
 for(let i=0;i<3;i++){g.fillStyle=tier>=4?'#9fe8ff':'#3a3a4a';g.beginPath();g.arc(36+i*12,-36,6,0,TAU);g.fill();g.stroke()}
 if(tier>=5){/* storm rod */g.strokeStyle='#ffd45a';g.lineWidth=4;g.beginPath();g.moveTo(-44,-30);g.lineTo(-44,-120);g.stroke();glow(-44,-124,30,'rgba(159,232,255,1)',.8);g.fillStyle='#e8f8ff';g.beginPath();g.arc(-44,-124,8,0,TAU);g.fill();g.stroke()}
 g.restore()}
/* in the world: on pad 4 (empty), shell arcing to the road at the bend, crater + shock ring */
const p=padAt(4),tx=330,ty=530;
rangeRing(p.x,p.y+20,330,'rgba(255,190,90,.85)');
g.save();g.strokeStyle='rgba(255,90,90,.6)';g.lineWidth=2;g.setLineDash([6,6]);g.beginPath();g.ellipse(p.x,p.y+20,90,68,0,0,TAU);g.stroke();g.restore();txt('dead zone',p.x,p.y+100,12,'#ffb0b0',800,'center');
mortar(p.x,p.y+22,3,1,true);
/* shell trail */
g.save();g.strokeStyle='rgba(255,220,150,.55)';g.lineWidth=4;g.setLineDash([3,10]);g.beginPath();g.moveTo(p.x+30,p.y-40);g.quadraticCurveTo((p.x+tx)/2,p.y-260,tx,ty-20);g.stroke();g.restore();
/* impact */
glow(tx,ty,120,'rgba(255,170,60,1)',.85);g.save();g.strokeStyle='rgba(255,230,180,.9)';g.lineWidth=6;g.beginPath();g.ellipse(tx,ty,90,40,0,0,TAU);g.stroke();g.restore();
g.fillStyle='rgba(40,25,15,.75)';g.beginPath();g.ellipse(tx,ty+6,52,18,0,0,TAU);g.fill();
for(let i=0;i<14;i++){const a=i/14*TAU;g.fillStyle=['#ffd45a','#ff8a3a','#fff'][i%3];g.beginPath();g.arc(tx+Math.cos(a)*(40+rnd(i)*40),ty-20+Math.sin(a)*(20+rnd(i+3)*30)-20,4+rnd(i+5)*5,0,TAU);g.fill()}
ttl('BOOM!',tx,ty-70,34,'#ffd45a','center');txt('crater: slows 40% for 3 s',tx,ty+48,13,'#ffe9a8',800,'center');
/* ---- info card ---- */
infoCard(1060,150,500,600,'Thunder Mortar','#ffb04a','ARTILLERY · 350');
g.save();g.beginPath();rr(1080,220,460,190,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();g.clip();glow(1310,330,160,'rgba(255,190,90,1)',.25);
[[1,1150,.62],[3,1300,.8],[5,1450,.95]].forEach(([t,x,s])=>mortar(x,386,t,s,t===5));g.restore();
txt('T1',1150,416,13,'#ffd45a',900,'center');txt('T3 rune shells',1300,416,13,'#ffd45a',900,'center');txt('T5 storm rod',1450,416,13,'#ffd45a',900,'center');
let yy=440;
yy=bullet(1084,yy,470,'Long-range shells','Lobs a shell at the biggest crowd in a huge range. Big splash, slow fire (3.2 s). Cannot hit anything inside its dead zone.','#ffb04a');
yy=bullet(1084,yy,470,'T3  Scorched craters','Every impact leaves a crater that slows ground monsters by 40% for 3 s.','#ffb04a');
yy=bullet(1084,yy,470,'T4  Cluster shells','Each shell splits into three bomblets on landing.','#ffb04a');
yy=bullet(1084,yy,470,'T5  Thunder Barrage','Every 6th volley calls down five lightning-charged shells along the road.','#ffb04a');
txt('Cannot hit flyers. Pairs well with the Frost Spire.',1310,736,13,'#c4badf',700,'center');
