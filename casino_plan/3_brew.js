casFrame("Witch's Brew");
/* witch hut interior */
g.fillStyle=lin(0,100,0,700,[[0,'#1a2a1a'],[1,'#0a140a']]);rr(60,100,1480,560,22);g.fill();
for(let i=0;i<9;i++){g.fillStyle=`rgba(80,60,40,${.25+rnd(i)*.15})`;g.fillRect(60+i*165,100,160,560)}
/* shelves with ingredients */
const ING=[['Newt eye','#7dff9a','+0.4×'],['Ember root','#ff8a3a','+0.8×'],['Moon salt','#c0d0ff','+1.5×'],['Bat wing','#a070ff','+0.6×'],['Dragon scale','#ff4a5a','+3×']];
panel(80,120,330,520,'#7dff9a');ttl('Ingredients',245,168,32,'#ffd45a','center');
ING.forEach(([n,c,m],i)=>{const y=200+i*82;g.save();g.fillStyle='rgba(255,255,255,.06)';rr(100,y,290,68,14);g.fill();g.restore();
 /* jar */
 g.save();g.translate(140,y+34);g.fillStyle='rgba(200,230,255,.25)';rr(-20,-24,40,48,10);g.fill();g.strokeStyle=O;g.lineWidth=2.5;g.stroke();g.fillStyle=c;rr(-15,-6,30,26,8);g.fill();g.fillStyle='#8a5a2a';g.fillRect(-14,-30,28,8);g.restore();
 txt(n,180,y+30,18,'#ffe9a8',800);txt(m+'  ·  risk '+['low','med','med','low','high'][i],180,y+52,14,c,800)});
/* cauldron centre */
const X=800,Y=470;
glow(X,Y-60,300,'rgba(120,255,140,1)',.3);
/* fire */
for(let i=0;i<7;i++){const x=X-120+i*40;g.fillStyle=lin(x,Y+70,x,Y+150,[[0,'#ffe37a'],[1,'#d02a0a']]);g.beginPath();g.moveTo(x,Y+70);g.bezierCurveTo(x+22,Y+100,x+16,Y+150,x,Y+150);g.bezierCurveTo(x-16,Y+150,x-22,Y+100,x,Y+70);g.fill()}
g.fillStyle=lin(X-200,Y-80,X+200,Y+120,[[0,'#3a3a4a'],[1,'#0a0a14']]);g.beginPath();g.ellipse(X,Y+10,210,150,0,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=5;g.stroke();
g.fillStyle='#2a2a3a';g.beginPath();g.ellipse(X,Y-110,220,40,0,0,TAU);g.fill();g.stroke();
g.fillStyle=lin(X-200,Y-140,X+200,Y-80,[[0,'#5affa0'],[1,'#20a060']]);g.beginPath();g.ellipse(X,Y-110,196,30,0,0,TAU);g.fill();
for(let i=0;i<12;i++){const bx=X-160+rnd(i)*320,by=Y-120-rnd(i+4)*50,br=6+rnd(i+8)*16;g.fillStyle='rgba(180,255,200,.8)';g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();g.strokeStyle='rgba(10,60,30,.6)';g.lineWidth=2;g.stroke()}
/* steam swirl */

/* ingredient falling in */
g.save();g.translate(X+40,Y-230);g.rotate(.4);g.fillStyle='#ff4a5a';g.beginPath();g.moveTo(0,-20);g.lineTo(16,0);g.lineTo(0,20);g.lineTo(-16,0);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.restore();
/* witch (Vesper) stirring */
mon('vesper',1060,560,.4,true,1);
g.strokeStyle='#8a5a2a';g.lineWidth=10;g.beginPath();g.moveTo(1010,380);g.lineTo(870,340);g.stroke();
/* volatility gauge arc over the cauldron */
g.lineWidth=18;g.lineCap='butt';[['#7dff9a',0,.45],['#ffd45a',.45,.75],['#ff4a4a',.75,1]].forEach(([c,a,b])=>{g.strokeStyle=c;g.beginPath();g.arc(X,268,118,Math.PI+a*Math.PI,Math.PI+b*Math.PI);g.stroke()});g.lineCap='round';
const nd=.68,na=Math.PI+nd*Math.PI;g.strokeStyle='#fff';g.lineWidth=6;g.beginPath();g.moveTo(X,268);g.lineTo(X+Math.cos(na)*108,268+Math.sin(na)*108);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(X,268,10,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
txt('VOLATILITY',X,300,15,'#ffe9a8',900,'center');
ttl('BUBBLING!',X+190,190,26,'#ffd45a','center');
/* recipe + pot value */
panel(1190,120,330,520,'#ffd45a');ttl('The potion',1355,168,32,'#ffd45a','center');
txt('Value',1355,212,15,'#c4badf',800,'center');ttl('3.2×',1355,272,60,'#7dff9a','center');
txt('In the pot',1355,320,15,'#c4badf',800,'center');[['#7dff9a'],['#ff8a3a'],['#ff8a3a'],['#c0d0ff']].forEach(([c],i)=>{g.fillStyle=c;g.beginPath();g.arc(1280+i*50,350,16,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=2.5;g.stroke()});
g.save();g.fillStyle='rgba(255,212,90,.15)';rr(1210,390,290,86,14);g.fill();g.lineWidth=2;g.strokeStyle='#ffd45a';g.stroke();g.restore();
txt('RECIPE BONUS',1355,416,14,'#ffd45a',900,'center');txt('Phoenix Draught: 2 ember + 1 scale',1355,440,14,'#ffe9a8',700,'center');txt('×2 if you add the scale',1355,462,14,'#7dff9a',800,'center');
gbtn(1215,500,280,64,'BOTTLE IT','3,200 gold',[[0,'#8affa8'],[1,'#22a85a']]);
txt('Too volatile and it blows up',1355,600,14,'#ff8a98',700,'center');
gbtn(430,676,300,70,'ADD','next ingredient',null);gbtn(870,676,300,70,'STIR','calm it (−0.3×)',[[0,'#9fe8ff'],[1,'#2a8ad0']]);
betBar(768,'Bet','1,000');
