casFrame('Starfall');
/* night sky observatory */
g.save();rr(60,100,1060,560,22);g.clip();
g.fillStyle=lin(0,100,0,660,[[0,'#060a2a'],[1,'#1a1050']]);g.fillRect(60,100,1060,560);
for(let i=0;i<260;i++){g.fillStyle=`rgba(255,255,255,${.2+rnd(i)*.6})`;g.fillRect(60+rnd(i+1)*1060,100+rnd(i+2)*560,1.6,1.6)}
glow(400,300,400,'rgba(120,80,255,1)',.18);glow(900,500,300,'rgba(255,90,180,1)',.12);
/* 40-star grid placed like a sky: stars are the keno numbers */
const S=[];for(let r=0;r<5;r++)for(let c=0;c<8;c++){S.push([140+c*125+(r%2)*40+(rnd(r*8+c)-.5)*40,160+r*100+(rnd(r*8+c+90)-.5)*30])}
const picked=[2,5,9,12,14,20,27,33],hit=[5,9,14,20,27];
/* constellation: "The Dragon" pattern lines (complete when all of 5,9,14,20,27 are hit) */
g.strokeStyle='rgba(255,212,90,.85)';g.lineWidth=3;g.setLineDash([]);g.beginPath();[5,9,14,20,27].forEach((k,i)=>{const [x,y]=S[k];i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();
glow(S[14][0],S[14][1],180,'rgba(255,212,90,1)',.25);
S.forEach(([x,y],k)=>{const p=picked.includes(k),h=hit.includes(k);
 if(h)glow(x,y,46,'rgba(255,212,90,1)',.8);
 g.save();g.translate(x,y);const r=p?20:14;g.fillStyle=h?'#ffe37a':p?'#9fe8ff':'rgba(200,210,255,.35)';g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;g.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}g.closePath();g.fill();if(p){g.strokeStyle=O;g.lineWidth=2.5;g.stroke()}g.restore();
 if(p&&!h){g.strokeStyle='rgba(159,232,255,.6)';g.lineWidth=2;g.beginPath();g.arc(x,y,28,0,TAU);g.stroke()}});
/* falling meteor (the draw) */
g.save();const mx=880,my=230;g.strokeStyle=lin(mx-220,my-150,mx,my,[[0,'rgba(255,200,120,0)'],[1,'rgba(255,240,200,1)']]);g.lineWidth=10;g.beginPath();g.moveTo(mx-220,my-150);g.lineTo(mx,my);g.stroke();glow(mx,my,50,'rgba(255,230,160,1)',1);g.restore();
ttl('THE DRAGON!',S[14][0],S[14][1]-60,36,'#ffd45a','center');
g.restore();
g.save();g.lineWidth=4;g.strokeStyle='#c99a3a';rr(60,100,1060,560,22);g.stroke();g.restore();
/* telescope owl */
mon('hootsworth',1060,650,.36,true,1);
/* right panel */
panel(1140,100,400,560,'#9fe8ff');ttl('Your sky',1340,150,34,'#ffd45a','center');
txt('8 stars picked · 10 meteors fall',1340,180,15,'#c4badf',700,'center');
txt('Hits',1240,226,15,'#c4badf',800,'center');ttl('5',1240,282,58,'#ffe37a','center');
txt('Meteors left',1440,226,15,'#c4badf',800,'center');ttl('3',1440,282,58,'#9fe8ff','center');
g.save();g.fillStyle='rgba(255,212,90,.15)';rr(1165,310,350,120,14);g.fill();g.lineWidth=2;g.strokeStyle='#ffd45a';g.stroke();g.restore();
txt('CONSTELLATION COMPLETE',1340,340,15,'#ffd45a',900,'center');ttl('The Dragon ×10',1340,384,34,'#ffe9a8','center');txt('5 stars in its shape, all hit',1340,412,14,'#c4badf',700,'center');
const tb=[['4 hits','2×'],['5 hits','5×'],['6 hits','20×'],['8 hits','500×']];tb.forEach(([a,b],i)=>{const y=446+i*30;txt(a,1190,y+20,15,i===1?'#7dff9a':'#c4badf',800);txt(b,1490,y+20,15,i===1?'#7dff9a':'#ffe9a8',800,'right')});
txt('Hidden constellations pay a bonus',1340,600,14,'#c4badf',700,'center');txt('when every star in them is hit',1340,620,14,'#c4badf',700,'center');
gbtn(130,676,300,70,'QUICK PICK','8 lucky stars',[[0,'#9fe8ff'],[1,'#2a8ad0']]);gbtn(470,676,300,70,'STARFALL','drop meteors',null);gbtn(810,676,300,70,'CLEAR','pick again',[[0,'#c0a0ff'],[1,'#6a3ad0']]);
betBar(768,'Bet','500');
