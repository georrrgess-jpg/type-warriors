// {"map":"moss","wave":6,"towers":[[2,"ballista",3],[3,"brazier",3],[5,"frost",2],[6,"bell",2]],"secs":10}
function beacon(x,y,tier,s,t){g.save();g.translate(x,y);g.scale(s,s);plinth(0,0,'#d8cfe6');
 /* obelisk */g.fillStyle=lin(-24,-170,24,-20,[[0,'#5a4a9a'],[1,'#2a1a5a']]);g.beginPath();g.moveTo(-26,-20);g.lineTo(-18,-140);g.lineTo(0,-168);g.lineTo(18,-140);g.lineTo(26,-20);g.closePath();g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();
 g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.moveTo(-18,-140);g.lineTo(0,-168);g.lineTo(-4,-20);g.lineTo(-24,-24);g.closePath();g.fill();
 /* runes */g.fillStyle='#9fe8ff';g.font='bold 18px serif';g.textAlign='center';['ᚨ','ᛉ','ᛟ'].forEach((r,i)=>g.fillText(r,0,-110+i*30));glow(0,-80,40,'rgba(159,232,255,1)',.4);
 /* floating crystal */const fy=-200+Math.sin(t||0)*4;glow(0,fy,60,'rgba(170,140,255,1)',.8);g.fillStyle=lin(-16,fy-26,16,fy+26,[[0,'#f0e8ff'],[1,'#8a6aff']]);g.beginPath();g.moveTo(0,fy-28);g.lineTo(16,fy);g.lineTo(0,fy+28);g.lineTo(-16,fy);g.closePath();g.fill();g.stroke();
 /* rune rings */g.strokeStyle='rgba(200,180,255,.9)';g.lineWidth=3;for(let i=0;i<Math.min(3,1+Math.floor(tier/2));i++){g.beginPath();g.ellipse(0,fy,30+i*12,9+i*4,0,0,TAU);g.stroke()}
 g.restore()}
const p=padAt(4);beacon(p.x,p.y+22,4,1,0);
/* aura radius */g.save();g.fillStyle='rgba(170,140,255,.10)';g.beginPath();g.ellipse(p.x,p.y+20,250,190,0,0,TAU);g.fill();g.strokeStyle='rgba(200,180,255,.85)';g.lineWidth=4;g.setLineDash([4,10]);g.stroke();g.restore();
/* link beams to buffed towers + buff badges */
const bt=window.__pads.map((q,i)=>[q,i]).filter(([q,i])=>q.tw&&Math.hypot(q.x-p.x,(q.y-p.y)/.75)<260);
bt.forEach(([q])=>{g.save();g.strokeStyle='rgba(190,160,255,.75)';g.lineWidth=5;g.beginPath();g.moveTo(p.x,p.y-178);g.quadraticCurveTo((p.x+q.x)/2,Math.min(p.y,q.y)-160,q.x,q.y-90);g.stroke();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.stroke();g.restore();
 glow(q.x,q.y-90,40,'rgba(190,160,255,1)',.7);g.save();g.fillStyle='rgba(30,14,70,.92)';rr(q.x-44,q.y-138,88,26,13);g.fill();g.strokeStyle='#c8b0ff';g.lineWidth=2;g.stroke();g.restore();txt('+15% speed',q.x,q.y-120,12,'#e8dcff',900,'center')});
ttl('EMPOWERED',bt.length?bt[0][0].x:600,(bt.length?bt[0][0].y:300)-150,24,'#c8b0ff','center');
infoCard(1060,150,500,600,'Arcane Beacon','#c8b0ff','SUPPORT · 250');
g.save();g.beginPath();rr(1080,220,460,190,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();g.clip();glow(1310,330,160,'rgba(170,140,255,1)',.25);
[[1,1150,.56],[3,1300,.66],[5,1450,.74]].forEach(([t,x,s],i)=>beacon(x,388,t,s,i));g.restore();
txt('T1',1150,416,13,'#ffd45a',900,'center');txt('T3',1300,416,13,'#ffd45a',900,'center');txt('T5 Ley Nexus',1450,416,13,'#ffd45a',900,'center');
let yy=440;
yy=bullet(1084,yy,470,'Empower aura','Does not attack. Towers inside its aura fire 15% faster (25% at T5) and reach 10% further.','#c8b0ff');
yy=bullet(1084,yy,470,'T3  Mana well','Overcharge, Slow Field and Repair recharge 20% faster while a Beacon stands.','#c8b0ff');
yy=bullet(1084,yy,470,'T4  Seer\'s eye','Reveals shrouded monsters in the aura so every tower can target them.','#c8b0ff');
yy=bullet(1084,yy,470,'T5  Ley Nexus','Every 20 s it pours its power into the busiest tower in range: double damage for 5 s.','#c8b0ff');
txt('Auras of two Beacons do not stack.',1310,736,13,'#c4badf',700,'center');
