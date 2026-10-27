casFrame('Bog Derby');
/* ---- the track: side view, 6 lanes in perspective, left->right ---- */
const TX=60,TY=100,TW=1030,TH=520;
g.save();rr(TX,TY,TW,TH,22);g.clip();
/* sky + far stands */
g.fillStyle=lin(0,TY,0,TY+150,[[0,'#3a2a6a'],[1,'#7a4a8a']]);g.fillRect(TX,TY,TW,150);
glow(900,TY+40,200,'rgba(255,190,120,1)',.35);
for(let i=0;i<40;i++){const x=TX+i*27,h=40+rnd(i)*30;g.fillStyle=mix('#2a1440','#4a2460',rnd(i+9));g.fillRect(x,TY+150-h,26,h)}
/* crowd heads */
for(let i=0;i<90;i++){const x=TX+5+i*11.5,y=TY+112+rnd(i*3)*24;g.fillStyle=['#ff8a6a','#8affc0','#ffd45a','#9fe8ff','#d0a0ff'][i%5];g.beginPath();g.arc(x,y,5,0,TAU);g.fill()}
/* banner flags */
for(let i=0;i<9;i++){const x=TX+40+i*115;g.fillStyle=i%2?'#ffd45a':'#e04a4a';g.beginPath();g.moveTo(x,TY+64);g.lineTo(x+30,TY+64);g.lineTo(x+15,TY+84);g.fill()}
/* rail */
g.fillStyle='#f4e8d0';g.fillRect(TX,TY+150,TW,8);
/* lanes: mud track */
const lanes=6,L0=TY+160,LH=(TH-170)/lanes;
for(let i=0;i<lanes;i++){const y=L0+i*LH;g.fillStyle=i%2?'#6a4a2a':'#7a5632';g.fillRect(TX,y,TW,LH);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(TX,y,TW,2);
 txt(String(i+1),TX+14,y+LH/2+7,18,'rgba(255,240,210,.5)',800)}
/* puddles */
[[420,2],[700,4],[300,5],[860,1]].forEach(([x,l])=>{const y=L0+l*LH+LH/2;g.fillStyle='#4a3a2a';g.beginPath();g.ellipse(x,y+8,60,12,0,0,TAU);g.fill();g.fillStyle='rgba(140,200,255,.35)';g.beginPath();g.ellipse(x,y+6,48,8,0,0,TAU);g.fill()});
/* finish line */
for(let k=0;k<22;k++){g.fillStyle=k%2?'#fff':'#14121a';g.fillRect(TX+TW-90,L0+k*16,10,16);g.fillStyle=k%2?'#14121a':'#fff';g.fillRect(TX+TW-80,L0+k*16,10,16)}
g.restore();
g.save();g.lineWidth=4;g.strokeStyle='#c99a3a';rr(TX,TY,TW,TH,22);g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(TX-3,TY-3,TW+6,TH+6,24);g.stroke();g.restore();
/* racers */
const R=[['gloop',560,'#7affc0'],['grizzle',780,'#ffb04a'],['moldwick',640,'#c0a0ff'],['vesper',720,'#ff7aa0'],['barnacle',470,'#7ac8ff'],['hootsworth',600,'#ffe37a']];
R.forEach(([id,x,c],i)=>{const y=L0+(i+1)*LH-4;
 /* dust + speed lines */
 for(let k=0;k<6;k++){g.fillStyle=`rgba(200,160,110,${.35-k*.05})`;g.beginPath();g.arc(x-60-k*22,y-6-rnd(i*9+k)*10,8+k*2,0,TAU);g.fill()}
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3;for(let k=0;k<3;k++){g.beginPath();g.moveTo(x-70,y-30-k*14);g.lineTo(x-120-k*20,y-30-k*14);g.stroke()}
 mon(id,x,y,.27,false,i*.7);
 g.save();g.fillStyle=c;rr(x-26,y-92,52,20,10);g.fill();g.lineWidth=2;g.strokeStyle=O;g.stroke();g.restore();txt(String(i+1),x,y-77,14,O,900,'center')});
/* your racer highlight: Grizzle (lane 2) */
const gy=L0+2*LH-4;g.save();g.strokeStyle='#ffd45a';g.lineWidth=4;g.setLineDash([10,6]);g.beginPath();g.ellipse(780,gy-30,78,46,0,0,TAU);g.stroke();g.restore();
pill(780,gy-124,120,'YOU',null);
/* stumble pop on Barnacle */
ttl('SPLASH!',470,L0+5*LH-50,26,'#9fe8ff','center');
/* race progress strip */
g.save();g.fillStyle='rgba(20,8,14,.85)';rr(TX+20,TY+16,TW-40,34,17);g.fill();g.restore();
g.fillStyle='#ffd45a';g.fillRect(TX+40,TY+31,(TW-80)*.62,4);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(TX+40+(TW-80)*.62,TY+31,(TW-80)*.38,4);
txt('1,200 m · lap 2 of 2 · heavy mud',TX+TW-40,TY+38,14,'#e8d8b8',700,'right');txt('62%',TX+40+(TW-80)*.62,TY+28,13,'#ffd45a',800,'center');
/* ---- right: your ticket, live price ---- */
panel(1110,100,430,520,'#ffd45a');
ttl('Your ticket',1325,148,34,'#ffd45a','center');
mon('grizzle',1172,272,.24,false,1);
ttl('#2 Grizzle',1225,210,30,'#ffe9a8');txt('Strong finish · hates mud',1225,236,15,'#c4badf',600);
txt('Stake',1135,290,16,'#c4badf',700);ttl('1,000',1135,322,30,'#fff');
txt('Price now',1330,290,16,'#c4badf',700);ttl('1,840',1330,326,40,'#7dff9a');txt('▲ +84%',1460,322,18,'#7dff9a',800);
/* sparkline */
g.save();g.fillStyle='rgba(0,0,0,.25)';rr(1135,345,380,110,12);g.fill();g.beginPath();g.rect(1135,345,380,110);g.clip();
const pts=[[0,.5],[.1,.55],[.18,.45],[.26,.42],[.34,.6],[.4,.66],[.48,.5],[.56,.58],[.64,.74],[.72,.7],[.8,.82],[.88,.78],[1,.86]];
g.beginPath();pts.forEach(([u,v],k)=>{const x=1145+u*360,y=445-v*90;k?g.lineTo(x,y):g.moveTo(x,y)});g.lineTo(1505,445);g.lineTo(1145,445);g.closePath();g.fillStyle='rgba(125,255,154,.18)';g.fill();
g.beginPath();pts.forEach(([u,v],k)=>{const x=1145+u*360,y=445-v*90;k?g.lineTo(x,y):g.moveTo(x,y)});g.strokeStyle='#7dff9a';g.lineWidth=3;g.stroke();
g.strokeStyle='rgba(255,255,255,.3)';g.setLineDash([5,5]);g.lineWidth=1.5;g.beginPath();g.moveTo(1145,400);g.lineTo(1505,400);g.stroke();g.setLineDash([]);g.restore();
txt('your stake',1150,396,11,'rgba(255,255,255,.5)',700);
glow(1505,368,30,'rgba(125,255,154,1)',.7);
gbtn(1135,474,180,64,'SELL','1,840',[[0,'#8affa8'],[1,'#22a85a']]);
gbtn(1330,474,185,64,'BUY','+500');
txt('Sell now to lock in, or buy more while he surges',1325,566,14,'#c4badf',600,'center');
txt('Price = chance to win, minus a 4% house cut',1325,590,13,'rgba(196,186,223,.7)',600,'center');
/* ---- odds ticker under the track ---- */
g.save();g.fillStyle='rgba(20,6,10,.92)';rr(60,634,1480,44,12);g.fill();g.lineWidth=2;g.strokeStyle='#c99a3a';g.stroke();g.restore();
const tk=[['1 Gloop','4.2×','#ff8a98','▼'],['2 Grizzle','2.1×','#7dff9a','▲'],['3 Moldwick','6.8×','#ff8a98','▼'],['4 Vesper','3.0×','#7dff9a','▲'],['5 Barnacle','18×','#ff8a98','▼'],['6 Hootsworth','7.5×','#ffe9a8','–']];
tk.forEach(([n,o,c,a],i)=>{const x=90+i*245;txt(n,x,663,17,'#ffe9a8',700);txt(o+' '+a,x+150,663,17,c,800)});
pill(800,708,560,'Grizzle is closing! Sell for 1,840 or ride it to the line.');
betBar(760,'Bet','1,000');
