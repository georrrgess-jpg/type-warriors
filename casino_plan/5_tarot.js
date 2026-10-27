casFrame('Fate Weaver');
g.fillStyle=lin(0,100,0,660,[[0,'#2a0a3a'],[1,'#12041a']]);rr(60,100,1480,560,22);g.fill();
/* crystal ball + fortune teller */
glow(800,240,260,'rgba(190,120,255,1)',.35);
mon('moldwick',600,415,.5,false,1);
g.fillStyle=lin(740,250,860,370,[[0,'rgba(220,200,255,.9)'],[1,'rgba(120,60,220,.8)']]);g.beginPath();g.arc(800,330,62,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=4;g.stroke();
g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(780,305,18,10,-.5,0,TAU);g.fill();g.fillStyle='#8a5a2a';rr(752,386,96,22,8);g.fill();g.stroke();
/* table cloth */
g.fillStyle=lin(0,420,0,660,[[0,'#5a1a6a'],[1,'#3a0a4a']]);g.beginPath();g.moveTo(80,420);g.lineTo(1520,420);g.lineTo(1520,656);g.lineTo(80,656);g.fill();
for(let i=0;i<40;i++){g.fillStyle='rgba(255,212,90,.25)';g.beginPath();g.arc(100+i*36,430,4,0,TAU);g.fill()}
/* three tarot cards: Past, Present, Future */
const card=(x,y,title,num,col,face,rot,lbl,eff)=>{g.save();g.translate(x,y);g.rotate(rot);
 if(!face){g.fillStyle=lin(-80,-130,80,130,[[0,'#3a1a6a'],[1,'#1a0a3a']]);rr(-80,-130,160,260,14);g.fill();g.lineWidth=4;g.strokeStyle='#ffd45a';g.stroke();
  g.strokeStyle='rgba(255,212,90,.6)';g.lineWidth=2;g.beginPath();g.arc(0,0,40,0,TAU);g.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(a)*48,Math.sin(a)*48);g.lineTo(Math.cos(a)*70,Math.sin(a)*70);g.stroke()}ttl('?',0,18,50,'#ffd45a','center')}
 else{glow(0,0,170,col,.4);g.fillStyle='#fff4dc';rr(-80,-130,160,260,14);g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();g.strokeStyle='#c99a3a';g.lineWidth=3;rr(-70,-120,140,240,10);g.stroke();
  txt(num,0,-96,16,'#5a2a6a',900,'center');
  g.fillStyle=col;g.beginPath();g.arc(0,-20,44,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
  if(title==='The Sun'){for(let i=0;i<12;i++){const a=i*Math.PI/6;g.strokeStyle='#ff9a1a';g.lineWidth=4;g.beginPath();g.moveTo(Math.cos(a)*50,-20+Math.sin(a)*50);g.lineTo(Math.cos(a)*66,-20+Math.sin(a)*66);g.stroke()}eye(-14,-26,8,.5,O,0);eye(14,-26,8,.5,O,0)}
  if(title==='The Tower'){g.fillStyle='#5a4a6a';g.fillRect(-14,-56,28,70);g.strokeRect(-14,-56,28,70);g.fillStyle='#ffd45a';g.beginPath();g.moveTo(20,-70);g.lineTo(2,-36);g.lineTo(14,-36);g.lineTo(-6,0);g.lineTo(6,-30);g.lineTo(-6,-30);g.closePath();g.fill()}
  ttl(title,0,62,26,'#3a0a4a','center');txt(eff,0,90,13,'#5a2a6a',800,'center')}
 g.restore();txt(lbl,x,y+160,16,'#ffe9a8',900,'center')};
card(470,520,'The Sun','XIX','#ffd45a',true,-.08,'PAST','×2 to the next card');
card(800,510,'The Tower','XVI','#9a7aff',true,0,'PRESENT','breaks one curse');
card(1130,520,'','',null,false,.08,'FUTURE','');
/* combo banner */
g.save();g.fillStyle='rgba(20,6,30,.92)';rr(560,130,480,56,28);g.fill();g.lineWidth=3;g.strokeStyle='#ffd45a';g.stroke();g.restore();
txt('Sun + Tower = "Dawn After Ruin"  ·  combo ×3',800,166,18,'#ffd45a',800,'center');
/* side panels */
panel(80,120,300,280,'#c0a0ff');ttl('Fate so far',230,166,30,'#ffd45a','center');ttl('3.0×',230,236,56,'#7dff9a','center');txt('Turn the Future card,',230,282,14,'#c4badf',700,'center');txt('or take the fate you have',230,302,14,'#c4badf',700,'center');gbtn(100,322,260,60,'TAKE IT','3,000',[[0,'#8affa8'],[1,'#22a85a']]);
panel(1220,120,300,280,'#ffd45a');ttl('The deck',1370,166,30,'#ffd45a','center');txt('22 cards · 6 combos found',1370,196,14,'#c4badf',700,'center');
[['The Moon','halves or triples'],['Death','ends it… or ×5'],['The Star','shields a curse'],['The Fool','wild: copies one']].forEach(([a,b],i)=>{txt(a,1240,232+i*40,15,'#ffe9a8',800);txt(b,1500,232+i*40,13,'#c4badf',700,'right')});
gbtn(650,676,300,70,'TURN THE FUTURE','one card',null);
betBar(768,'Bet','1,000');
