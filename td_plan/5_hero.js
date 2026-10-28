// {"map":"moss","wave":6,"towers":[[2,"ballista",2],[5,"frost",2],[4,"brazier",2]],"secs":12}
/* the hero on the road, mid-swing, a slash arc and damage numbers */
const hx=350,hy=600;
g.save();g.strokeStyle='rgba(255,212,90,.9)';g.lineWidth=3;g.setLineDash([10,8]);g.beginPath();g.ellipse(hx,hy,70,26,0,0,TAU);g.stroke();g.restore();
/* move order trail */
g.save();g.strokeStyle='rgba(159,232,255,.8)';g.lineWidth=4;g.setLineDash([2,10]);g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo(440,700,580,710);g.stroke();g.restore();
g.save();g.strokeStyle='#9fe8ff';g.lineWidth=4;g.beginPath();g.ellipse(580,712,24,9,0,0,TAU);g.stroke();g.beginPath();g.moveTo(580,712);g.lineTo(580,680);g.stroke();g.restore();txt('right-click: move',580,746,13,'#e0f8ff',800,'center');
glow(hx+40,hy-70,90,'rgba(255,230,160,1)',.4);
g.save();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=8;g.beginPath();g.arc(hx+10,hy-60,70,-1.4,.4);g.stroke();g.strokeStyle='rgba(255,212,90,.7)';g.lineWidth=4;g.beginPath();g.arc(hx+10,hy-60,80,-1.3,.3);g.stroke();g.restore();
knight(hx,hy,.9,.6);
ttl('-142',hx+90,hy-120,30,'#fff','center');ttl('-142',hx+60,hy-40,22,'#ffe9a8','center');
/* hero bar above */g.save();g.fillStyle='rgba(20,8,30,.9)';rr(hx-46,hy-142,92,12,6);g.fill();g.fillStyle='#7dff9a';rr(hx-44,hy-140,64,8,4);g.fill();g.restore();txt('Sir Bramble · Lv 4',hx,hy-150,13,'#ffe9a8',900,'center');
/* rallying banner skill planted nearby (aura on towers) */
g.save();g.translate(110,560);g.strokeStyle=O;g.lineWidth=4;g.fillStyle='#8a5a2a';g.fillRect(-3,-90,6,90);g.strokeRect(-3,-90,6,90);g.fillStyle='#d02a3a';g.beginPath();g.moveTo(3,-88);g.lineTo(46,-80);g.lineTo(3,-60);g.closePath();g.fill();g.stroke();glow(20,-60,80,'rgba(255,90,90,1)',.35);g.restore();
txt('Rally Banner: +20% damage nearby',140,580,12,'#ffd0d0',800,'center');
/* hero HUD panel over the ability row */
panel(20,640,300,124,'#ffd45a');
g.save();g.fillStyle='#2a1a4a';rr(34,654,96,96,14);g.fill();g.lineWidth=3;g.strokeStyle='#ffd45a';g.stroke();g.beginPath();rr(34,654,96,96,14);g.clip();knight(82,790,1.1,-.4);g.restore();
ttl('Sir Bramble',142,682,24,'#ffd45a');txt('Level 4  ·  XP 62%',142,702,13,'#c4badf',800);
g.fillStyle='rgba(255,255,255,.12)';rr(142,710,160,8,4);g.fill();g.fillStyle='#ffd45a';rr(142,710,100,8,4);g.fill();
[['⚔','Slam','12s','#ffb04a'],['⚑','Banner','20s','#ff6a7a'],['✦','Valor','ult','#c8b0ff']].forEach(([ic,n,cd,c],i)=>{const x=142+i*56;g.save();g.fillStyle='rgba(255,255,255,.08)';rr(x,722,50,34,8);g.fill();g.lineWidth=2;g.strokeStyle=c;g.stroke();g.restore();txt(ic,x+12,745,15,c,900);txt(String(i+1+3),x+40,736,10,'#ffe9a8',900);txt(cd,x+36,752,9,'#c4badf',800,'center')});
infoCard(1060,150,500,600,'Hero Commander','#ffd45a','NEW FEATURE');
g.save();g.beginPath();rr(1080,220,460,180,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();g.clip();glow(1310,320,160,'rgba(255,212,90,1)',.22);knight(1200,390,.9,-.5);knight(1310,390,.9,.3);knight(1420,390,.9,-.9);g.restore();
let yy=430;
yy=bullet(1084,yy,470,'A hero on the battlefield','Pick a hero before the run. Right-click the road to move them; they fight anything in reach and block one monster.','#ffd45a');
yy=bullet(1084,yy,470,'Levels during the run','Kills give XP. Each level adds health and damage; level 5 unlocks the ultimate.','#ffd45a');
yy=bullet(1084,yy,470,'Three skills (keys 4, 5, 6)','Shield Slam stuns a group. Rally Banner: nearby towers +20% damage. Valor (ultimate): the hero cannot fall for 6 s and hits twice as hard.','#ffd45a');
yy=bullet(1084,yy,470,'Falls, then returns','If beaten the hero respawns at the castle after 12 s.','#ffd45a');
txt('Heroes: Sir Bramble (tank), Nyx (archer), Ember Witch (mage)',1310,736,13,'#c4badf',700,'center');
