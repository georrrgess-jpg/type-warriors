tavern({floor:640});
/* regulars standing at the bar (right, below the panel) */
g.save();g.translate(1090,790);g.scale(.62,.62);MON.grizzle(0);g.restore();
g.save();g.translate(1265,770);g.scale(.62,.62);MON.gloop(0);g.restore();
g.save();g.translate(1450,790);g.scale(.6,.6);MON.barnacle(0);g.restore();
/* bar counter in front of them */
g.save();g.fillStyle=lin(0,720,0,900,[[0,'#7a3e18'],[1,'#3a1a0a']]);rr(980,760,640,200,14);g.fill();g.strokeStyle=O;g.lineWidth=4;g.stroke();g.fillStyle='#a85a24';rr(970,742,660,26,8);g.fill();g.stroke();
for(let i=0;i<5;i++){g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=3;g.beginPath();g.moveTo(1020+i*120,780);g.lineTo(1020+i*120,900);g.stroke()}g.restore();
for(const [mx,my] of[[1150,742],[1310,742],[1500,742]]){g.fillStyle='#f4e0a0';rr(mx,my-34,26,34,5);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();g.fillStyle='#fff';g.beginPath();g.ellipse(mx+13,my-34,15,6,0,0,TAU);g.fill();g.stroke();g.strokeStyle=O;g.lineWidth=3;g.beginPath();g.arc(mx+28,my-18,8,-1.2,1.2);g.stroke()}
/* Moldwick at a little round table (bottom left) */
g.save();g.translate(150,830);g.scale(.42,.42);MON.moldwick(0);g.restore();
g.fillStyle='#6a3414';g.beginPath();g.ellipse(250,812,70,18,0,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.fillStyle='#4a2410';g.fillRect(244,812,12,80);
g.fillStyle='#ff9ab0';g.beginPath();g.arc(250,796,10,0,TAU);g.fill();g.stroke();
/* chalkboard: the ladder */
g.save();g.fillStyle='#6a3a1a';rr(330,160,620,560,16);g.fill();g.strokeStyle=O;g.lineWidth=5;g.stroke();g.fillStyle='#1e2a24';rr(350,180,580,520,10);g.fill();g.restore();
g.save();g.font=font(400,48,'p');g.fillStyle='#f0f0e0';g.textAlign='center';g.fillText('Tonight\'s Tables',640,240);g.restore();
const rows=[['gloop','Gloop','beaten ×4','#8affb4',1],['moldwick','Granny Moldwick','beaten ×2','#ff9ab0',1],['grizzle','Grizzle','beaten ×1','#c8d870',1],['vesper','Vesper Nightwing','NEXT UP','#c8a0ff',2],['barnacle','Cap\'n Barnacle','locked','#888',0],['hootsworth','Professor Hootsworth','locked','#888',0],['mortimer','Mortimer Bonechalk','locked','#888',0]];
rows.forEach(([k,n,s,c,st],i)=>{const y=270+i*60;if(st===2){g.fillStyle='rgba(200,160,255,.18)';rr(366,y-10,548,54,10);g.fill();g.strokeStyle='#c8a0ff';g.lineWidth=2;g.stroke()}
 g.save();g.beginPath();g.arc(400,y+17,22,0,TAU);g.fillStyle=st?'#2a1a4a':'#2a2a2a';g.fill();g.clip();g.translate(400,y+48);g.scale(.18,.18);if(st)MON[k](0);else{g.fillStyle='#555';g.beginPath();g.arc(0,-150,120,0,TAU);g.fill()}g.restore();
 g.save();g.font=font(400,28,'p');g.fillStyle=st?c:'#7a7a70';g.fillText(st?n:'? ? ?',436,y+27);g.font=font(700,15);g.textAlign='right';g.fillStyle=st===1?'#c8e8c0':st===2?'#ffd45a':'#7a7a70';g.fillText(st===1?'✓ '+s:s,900,y+25);g.restore();
 });
/* selected opponent panel */
panel(990,130,580,330,'#c8a0ff');
g.save();rr(1006,146,200,298,16);g.clip();g.fillStyle='#2a1a4a';g.fillRect(1006,146,200,298);glow(1106,300,180,'rgba(200,160,255,1)',.3);g.translate(1106,444);g.scale(.62,.62);MON.vesper(0);g.restore();
ttl('Vesper Nightwing',1226,190,38,'#c8a0ff');txt('Queen of Safeties  ·  ★★★★',1228,216,14,'#c4badf',700);
txt('"Oh, did I leave you nothing? How dreadful."',1228,248,14,'#efe8ff',500);
txt('Plays safe when the shot is hard; hides the cue ball.',1228,280,13,'#c4badf',500);txt('House rule: lights low (darker table edges).',1228,302,13,'#c4badf',500);
txt('STAKE',1228,340,12,'#c4badf',800);
[300,500,1000,2000].forEach((v,i)=>{const on=i===2;g.fillStyle=on?'#ffd45a':'#2a2070';rr(1228+i*82,350,74,40,12);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();txt(v.toLocaleString(),1265+i*82,376,15,on?'#2a1a04':'#efe8ff',800,'center')});
txt('Win pays 2,000  ·  race to 2',1228,418,14,'#ffd45a',700);
g.fillStyle='#ffd45a';rr(1228,426,320,0,1);
g.save();g.fillStyle=lin(0,470,0,530,[[0,'#ffe27a'],[1,'#e8a020']]);rr(990,480,580,70,20);g.fill();g.strokeStyle=O;g.lineWidth=4;g.stroke();g.restore();ttl('Rack \'em up!',1280,530,40,'#2a1a04','center');
/* side buttons */
const sb=(t,s,x,y,c)=>{panel(x,y,250,80,c);txt(t,x+20,y+36,20,'#efe8ff',800);txt(s,x+20,y+62,13,'#c4badf',600)};
sb('Practice Table','free play, any regular',40,160,'#8affb4');sb('Trick Shots','10 puzzle shots, ★★★',40,260,'#9fe8ff');sb('Cue Rack','cues, felts, ball sets',40,360,'#ffd45a');sb('House Rules','how 8-ball works',40,460,'#c4badf');
ttl('The Crooked Cue',800,96,64,'#ffd45a','center');txt('a pool hall in the casino\'s back room',800,128,16,'#e8dcff',600,'center');
g.fillStyle='rgba(22,14,56,.9)';rr(20,20,140,52,16);g.fill();g.strokeStyle='#c99a3a';g.lineWidth=3;g.stroke();txt('‹  Casino',90,53,17,'#efe8ff',700,'center');
panel(1330,20,250,60,'#ffd45a');txt('🪙  48,250',1455,58,22,'#ffd45a',800,'center');
