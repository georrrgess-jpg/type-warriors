// {"map":"moss","wave":6,"towers":[[2,"ballista",2],[5,"frost",2]],"secs":10}
/* gryphon: eagle head + wings, lion body; drawn at origin facing right, s scale */
function gryphon(x,y,s,wing,flip){g.save();g.translate(x,y);g.scale(flip?-s:s,s);
 /* back wing */g.fillStyle=lin(-10,-90,40,-20,[[0,'#e8d8b8'],[1,'#a8865a']]);g.beginPath();g.moveTo(0,-30);g.quadraticCurveTo(-30,-90-wing*30,-90,-110-wing*40);g.quadraticCurveTo(-70,-60,-40,-40);g.quadraticCurveTo(-60,-40,-70,-20);g.closePath();g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();
 /* lion body */g.fillStyle=lin(-40,-40,40,10,[[0,'#f0c060'],[1,'#b8803a']]);g.beginPath();g.ellipse(-10,-20,46,26,0,0,TAU);g.fill();g.stroke();
 g.fillStyle='#b8803a';[[-40,0],[-14,4],[14,4]].forEach(([lx,ly])=>{rr(lx,ly-10,12,22,5);g.fill();g.stroke()});
 g.strokeStyle=O;g.lineWidth=4;g.beginPath();g.moveTo(-54,-24);g.quadraticCurveTo(-80,-20,-78,-50);g.stroke();g.fillStyle='#8a5a2a';g.beginPath();g.arc(-78,-52,7,0,TAU);g.fill();g.stroke();
 /* eagle chest + head */g.fillStyle='#fbf3e0';g.beginPath();g.ellipse(26,-34,24,26,0,0,TAU);g.fill();g.stroke();
 g.beginPath();g.ellipse(40,-64,22,20,0,0,TAU);g.fill();g.stroke();
 g.fillStyle='#ffc23a';g.beginPath();g.moveTo(58,-70);g.quadraticCurveTo(80,-64,66,-50);g.lineTo(56,-58);g.closePath();g.fill();g.stroke();
 eye(44,-68,7,.55,O,.6);
 /* front wing */g.fillStyle=lin(0,-100,40,-20,[[0,'#fff6e0'],[1,'#c8a070']]);g.beginPath();g.moveTo(6,-40);g.quadraticCurveTo(-10,-110-wing*40,-60,-130-wing*50);g.quadraticCurveTo(-40,-90,-30,-60);g.closePath();g.fill();g.stroke();
 for(let i=0;i<4;i++){g.strokeStyle='rgba(120,80,40,.5)';g.lineWidth=2;g.beginPath();g.moveTo(-6-i*8,-48-i*6);g.lineTo(-30-i*10,-100-i*8-wing*30);g.stroke()}
 g.restore()}
function aerie(x,y,tier,s,bird){g.save();g.translate(x,y);g.scale(s,s);plinth(0,0,'#d8cfe6');
 /* timber tower */g.fillStyle=lin(-30,-150,30,-20,[[0,'#b07a40'],[1,'#6a4220']]);g.beginPath();g.moveTo(-30,-20);g.lineTo(-22,-150);g.lineTo(22,-150);g.lineTo(30,-20);g.closePath();g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();
 g.strokeStyle='#4a2a10';g.lineWidth=3;[-60,-100].forEach(yy=>{g.beginPath();g.moveTo(-26,yy);g.lineTo(26,yy-20);g.moveTo(26,yy);g.lineTo(-26,yy-20);g.stroke()});
 /* banner */g.fillStyle=tier>=3?'#3a6ad8':'#c03a3a';g.beginPath();g.moveTo(-22,-140);g.lineTo(-50,-140);g.lineTo(-50,-104);g.lineTo(-36,-112);g.lineTo(-22,-104);g.closePath();g.fill();g.stroke();
 /* nest platform */g.fillStyle=lin(-56,-170,56,-140,[[0,'#c8a060'],[1,'#7a5228']]);g.beginPath();g.ellipse(0,-152,58,18,0,0,TAU);g.fill();g.stroke();
 for(let i=0;i<14;i++){const a=i/14*TAU;g.strokeStyle='#5a3a18';g.lineWidth=3;g.beginPath();g.moveTo(Math.cos(a)*50,-152+Math.sin(a)*14);g.lineTo(Math.cos(a+.3)*60,-156+Math.sin(a+.3)*16);g.stroke()}
 if(tier>=5){g.fillStyle='#ffd45a';g.beginPath();g.moveTo(-20,-170);g.lineTo(-12,-186);g.lineTo(0,-172);g.lineTo(12,-186);g.lineTo(20,-170);g.closePath();g.fill();g.stroke()}
 if(bird)gryphon(0,-158,.55,0,false);
 if(tier>=3){/* a second, smaller gryphon chick */g.save();g.translate(-40,-160);g.scale(.5,.5);g.fillStyle='#fbf3e0';g.beginPath();g.arc(0,-10,16,0,TAU);g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();eye(4,-14,5,.55,O,.6);g.fillStyle='#ffc23a';g.beginPath();g.moveTo(14,-14);g.lineTo(26,-10);g.lineTo(14,-6);g.fill();g.stroke();g.restore()}
 g.restore()}
const p=padAt(6);rangeRing(p.x,p.y+20,300,'rgba(255,212,90,.8)');
aerie(p.x,p.y+22,4,1,false);
/* the gryphon in a dive, clutching a bat-flyer, dragging it to the road */
const gx=290,gy=330;
g.save();g.strokeStyle='rgba(255,240,200,.6)';g.lineWidth=5;g.setLineDash([2,12]);g.beginPath();g.moveTo(p.x,p.y-150);g.quadraticCurveTo(520,220,gx+20,gy-60);g.stroke();g.restore();
gryphon(gx,gy,.7,1,true);
/* captive flyer (a bat silhouette) */
g.save();g.translate(gx-10,gy+16);g.fillStyle='#5a2a7a';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-30,-20,-50,6);g.quadraticCurveTo(-30,0,-20,14);g.quadraticCurveTo(-8,8,0,18);g.quadraticCurveTo(8,8,20,14);g.quadraticCurveTo(30,0,50,6);g.quadraticCurveTo(30,-20,0,0);g.fill();g.lineWidth=3;g.strokeStyle=O;g.stroke();eye(-6,6,4,.6,'#c02a3a',0);eye(6,6,4,.6,'#c02a3a',0);g.restore();
/* slam point on the road */
glow(300,420,90,'rgba(255,230,160,1)',.6);g.save();g.strokeStyle='rgba(255,240,200,.85)';g.lineWidth=5;g.beginPath();g.ellipse(300,430,70,24,0,0,TAU);g.stroke();g.restore();
ttl('GROUNDED!',380,400,30,'#ffd45a','center');txt('flyers become ground monsters for 4 s',380,422,13,'#ffe9a8',800,'center');
infoCard(1060,150,500,600,'Gryphon Aerie','#ffd45a','ANTI-AIR · 300');
g.save();g.beginPath();rr(1080,220,460,190,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();g.clip();glow(1310,330,160,'rgba(255,220,140,1)',.22);
[[1,1150,.62],[3,1300,.75],[5,1450,.82]].forEach(([t,x,s])=>aerie(x,388,t,s,true));g.restore();
txt('T1',1150,416,13,'#ffd45a',900,'center');txt('T3 two gryphons',1300,416,13,'#ffd45a',900,'center');txt('T5 Sky King',1450,416,13,'#ffd45a',900,'center');
let yy=440;
yy=bullet(1084,yy,470,'Snatch and slam','The gryphon dives on a flyer, carries it and slams it onto the road: heavy damage, and the flyer is grounded for 4 s.','#ffd45a');
yy=bullet(1084,yy,470,'Grounded flyers','While grounded they can be hit by every tower (Tidecaller waves, Mortar shells, Frost).','#ffd45a');
yy=bullet(1084,yy,470,'T3  Second gryphon','Two hunters, two targets.','#ffd45a');
yy=bullet(1084,yy,470,'T5  Sky King','The slam shakes the road: splash damage and a short stun around the impact.','#ffd45a');
txt('Only targets flyers; idle when the sky is clear.',1310,736,13,'#c4badf',700,'center');
