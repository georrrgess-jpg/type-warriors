// {"map":"moss","wave":6,"towers":[[2,"ballista",2],[5,"frost",2]],"secs":10}
function skel(x,y,s,shield,sword){g.save();g.translate(x,y);g.scale(s,s);
 g.fillStyle='#f4ecd8';g.strokeStyle=O;g.lineWidth=4;
 g.beginPath();g.arc(0,-62,16,0,TAU);g.fill();g.stroke();g.fillStyle=O;g.beginPath();g.arc(-6,-64,4,0,TAU);g.arc(6,-64,4,0,TAU);g.fill();g.fillStyle='#7dff9a';g.beginPath();g.arc(-6,-64,2,0,TAU);g.arc(6,-64,2,0,TAU);g.fill();
 g.strokeStyle='#f4ecd8';g.lineWidth=7;g.beginPath();g.moveTo(0,-46);g.lineTo(0,-14);g.moveTo(0,-14);g.lineTo(-10,8);g.moveTo(0,-14);g.lineTo(10,8);g.stroke();g.lineWidth=5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-10,-40+i*8);g.lineTo(10,-40+i*8);g.stroke()}
 if(sword){g.strokeStyle='#c8d0e0';g.lineWidth=5;g.beginPath();g.moveTo(10,-36);g.lineTo(34,-60);g.stroke();g.strokeStyle=O;g.lineWidth=2;g.stroke()}
 if(shield){g.fillStyle=lin(-30,-50,-6,-10,[[0,'#6a8a9a'],[1,'#3a4a5a']]);rr(-32,-52,24,40,8);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.fillStyle='#7dff9a';g.fillRect(-23,-38,6,12)}
 g.restore()}
function crypt(x,y,tier,s){g.save();g.translate(x,y);g.scale(s,s);plinth(0,0,'#cfd8cf');
 /* mausoleum */stone(-46,-110,92,92,'#c8c4d4','#6a6480');
 g.fillStyle=lin(-56,-140,56,-104,[[0,'#d8d4e4'],[1,'#8a849c']]);g.beginPath();g.moveTo(-58,-106);g.lineTo(0,-150);g.lineTo(58,-106);g.closePath();g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();
 /* gate with green glow */g.fillStyle='#0a1a10';g.beginPath();g.moveTo(-22,-18);g.lineTo(-22,-66);g.arc(0,-66,22,Math.PI,0);g.lineTo(22,-18);g.closePath();g.fill();g.stroke();glow(0,-50,50,'rgba(125,255,154,1)',.55);
 g.strokeStyle='#5a5a6a';g.lineWidth=3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*8,-20);g.lineTo(i*8,-80+Math.abs(i)*6);g.stroke()}
 /* skull keystone + lantern */g.fillStyle='#f4ecd8';g.beginPath();g.arc(0,-122,10,0,TAU);g.fill();g.lineWidth=3;g.strokeStyle=O;g.stroke();
 g.fillStyle='#2a3a2a';rr(44,-96,18,26,4);g.fill();g.stroke();glow(53,-83,26,'rgba(125,255,154,1)',.8);g.fillStyle='#bfffcc';g.fillRect(48,-90,10,14);
 if(tier>=3){/* bone pillars */g.fillStyle='#f4ecd8';[-52,44].forEach(px=>{rr(px,-106,8,88,4);g.fill();g.stroke()})}
 if(tier>=5){/* giant skull crown */g.fillStyle='#f4ecd8';g.beginPath();g.arc(0,-162,18,0,TAU);g.fill();g.stroke();g.fillStyle=O;g.beginPath();g.arc(-7,-164,5,0,TAU);g.arc(7,-164,5,0,TAU);g.fill();glow(0,-164,40,'rgba(125,255,154,1)',.6)}
 g.restore()}
const p=padAt(3);rangeRing(p.x,p.y+20,180,'rgba(125,255,154,.8)');crypt(p.x,p.y+22,4,.85);
/* summoned squad on the road below the cave, blocking ooze */
const sx=360,sy=690;
[[0,0,true,true],[-34,18,false,true],[30,22,true,false]].forEach(([dx,dy,sh,sw])=>{glow(sx+dx,sy+dy-30,40,'rgba(125,255,154,1)',.35);skel(sx+dx,sy+dy,.62,sh,sw)});
g.save();g.strokeStyle='rgba(125,255,154,.7)';g.lineWidth=4;g.setLineDash([3,8]);g.beginPath();g.moveTo(p.x-40,p.y-40);g.quadraticCurveTo(sx-20,sy-100,sx,sy-60);g.stroke();g.restore();
ttl('HOLD THE LINE!',sx+10,sy-80,26,'#7dff9a','center');txt('blocked monsters stop and fight',sx+10,sy+46,13,'#e0ffe8',800,'center');
infoCard(1060,150,500,600,'Gravewarden Crypt','#7dff9a','SUMMONER · 280');
g.save();g.beginPath();rr(1080,220,460,190,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();g.clip();glow(1310,330,160,'rgba(125,255,154,1)',.2);
[[1,1150,.62],[3,1300,.72],[5,1450,.8]].forEach(([t,x,s])=>crypt(x,388,t,s));g.restore();
txt('T1',1150,416,13,'#ffd45a',900,'center');txt('T3 shield guard',1300,416,13,'#ffd45a',900,'center');txt('T5 Bone Colossus',1450,416,13,'#ffd45a',900,'center');
let yy=440;
yy=bullet(1084,yy,470,'Raise the dead','Summons up to 3 skeleton soldiers onto the road. Each one blocks a ground monster and fights it until one falls.','#7dff9a');
yy=bullet(1084,yy,470,'Click the road to set the rally point','Soldiers march there and hold it. Fallen soldiers rise again after 8 s.','#7dff9a');
yy=bullet(1084,yy,470,'T3  Shield guard','A shield-bearer with triple health joins the squad.','#7dff9a');
yy=bullet(1084,yy,470,'T5  Bone Colossus','Every 30 s a giant skeleton tramples down the road toward the cave, hitting everything in its way.','#7dff9a');
txt('Bosses walk through soldiers (they only slow them).',1310,736,13,'#c4badf',700,'center');
