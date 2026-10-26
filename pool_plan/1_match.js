tavern({floor:540});
/* warm lamp cone over the table */
glow(800,430,620,'rgba(255,210,140,1)',.18);
table();
/* the lamp itself (top, cropped by HUD) */
g.save();g.fillStyle='#1a3a2a';g.beginPath();g.moveTo(640,150);g.lineTo(960,150);g.lineTo(920,124);g.lineTo(680,124);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.fillStyle='rgba(255,230,160,.9)';g.fillRect(660,150,280,5);g.restore();
/* balls: mid-game */
const R=TB.R,B=[[0,520,470],[3,770,388],[1,960,300],[5,1040,520],[7,700,560],[11,880,470],[9,1100,330],[12,620,300],[14,1160,600],[8,980,420],[15,450,600],[2,1190,260]];
/* aim: cue ball -> ghost of the 3 toward the top-right corner */
const cb=B[0],ob=B[1],P=[TB.x+TB.w,TB.y];const dx=P[0]-ob[1],dy=P[1]-ob[2],dl=Math.hypot(dx,dy),ux=dx/dl,uy=dy/dl;const gx=ob[1]-ux*2*R,gy=ob[2]-uy*2*R;const ang=Math.atan2(gy-cb[2],gx-cb[1]);
g.save();g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=2.5;g.setLineDash([10,8]);g.beginPath();g.moveTo(cb[1],cb[2]);g.lineTo(gx,gy);g.stroke();g.setLineDash([]);
g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;g.beginPath();g.arc(gx,gy,R,0,TAU);g.stroke();
g.strokeStyle='rgba(255,212,90,.9)';g.lineWidth=3;g.beginPath();g.moveTo(ob[1],ob[2]);g.lineTo(ob[1]+ux*170,ob[2]+uy*170);g.stroke();
const tx=-uy,ty=ux;g.strokeStyle='rgba(159,232,255,.8)';g.beginPath();g.moveTo(gx,gy);g.lineTo(gx+tx*90,gy+ty*90);g.stroke();g.restore();
glow(P[0],P[1],70,'rgba(255,212,90,1)',.6);
B.forEach(([n,x,y])=>ball(x,y,n,R,(n*1.3)%3,((n*37)%10-5)/14));
cue(cb[1],cb[2],ang,34,{c:'#4a1a6a',d:'#8a4ad8',wrap:'#1a1030'});
/* chalk puff */
for(let i=0;i<9;i++){g.fillStyle=`rgba(140,200,255,${.35-i*.03})`;g.beginPath();g.arc(cb[1]-Math.cos(ang)*(32+i*5)+Math.sin(i)*6,cb[2]-Math.sin(ang)*(32+i*5)+Math.cos(i*2)*6,4+i*.6,0,TAU);g.fill()}
/* HUD top */
const card=(x,name,sub,col,group,potted,turn,right)=>{panel(x,14,440,104,turn?'#ffd45a':'#5a4a8a');if(turn)glow(x+220,66,240,'rgba(255,212,90,1)',.12);
 ttl(name,right?x+420:x+108,56,32,col,right?'right':'left');txt(sub,right?x+420:x+108,80,13,'#c4badf',600,right?'right':'left');
 for(let i=0;i<7;i++){const bx=right?x+404-i*30:x+122+i*30;const n=group[i];if(potted.includes(n)){g.globalAlpha=.25}ball(bx,100,n,10);g.globalAlpha=1}
 g.fillStyle=turn?'#ffd45a':'#3a3070';rr(right?x+112:x+346,26,80,26,12);g.fill();txt(turn?'YOUR SHOT':'WAITING',right?x+152:x+386,44,11,turn?'#2a1a04':'#c4badf',800,'center')};
card(20,'You','Solids  ·  racks 1',  '#ffd45a',[1,2,3,4,5,6,7],[4,6],true,false);
card(1140,'Vesper','Stripes  ·  racks 1','#c8a0ff',[9,10,11,12,13,14,15],[10,13],false,true);
g.save();g.fillStyle='#2a1a4a';g.beginPath();g.arc(84,64,40,0,TAU);g.fill();g.strokeStyle='#ffd45a';g.lineWidth=3;g.stroke();g.restore();txt('⚔',84,78,36,'#ffd45a',800,'center');
g.save();g.beginPath();g.arc(1204,64,40,0,TAU);g.fillStyle='#2a1a4a';g.fill();g.clip();g.translate(1204,124);g.scale(.32,.32);MON.vesper(0);g.restore();g.strokeStyle='#c8a0ff';g.lineWidth=3;g.beginPath();g.arc(1204,64,40,0,TAU);g.stroke();
panel(640,14,320,104,'#c99a3a');txt('RACE TO 2  ·  RACK 3',800,40,13,'#c4badf',700,'center');ttl('1  -  1',800,84,40,'#efe8ff','center');txt('Pot 4,000  (stake 2,000 ×2.0)',800,106,13,'#ffd45a',700,'center');
/* the player's hero on the left, the monster on the right */
try{g.save();g.translate(176,770);g.scale(2.1,2.1);drawHero(g,{arm:P.armor,wp:P.weapon,col:P.col,t:0,lg:0,walk:0,pose:'idle'});g.restore()}catch(e){g.restore()}
g.save();g.translate(1450,800);g.scale(.86,.86);cue(170,-430,2.0,0,{c:'#3a1a5a',d:'#c8a0ff',wrap:'#1a1030'});MON.vesper(0);g.restore();
/* speech bubble */
g.save();g.fillStyle='#fff8ee';g.strokeStyle=O;g.lineWidth=3;rr(1290,400,290,84,18);g.fill();g.stroke();g.beginPath();g.moveTo(1420,484);g.lineTo(1440,512);g.lineTo(1454,484);g.closePath();g.fill();g.stroke();g.fillStyle='#fff8ee';g.fillRect(1418,478,40,8);g.restore();
txt('Careful, darling...',1308,434,17,'#2a1a3a',700);txt('that corner bites.',1308,462,17,'#2a1a3a',700);
/* bottom HUD */
panel(300,742,1000,140,'#c99a3a');
/* spin widget */
g.save();const sx=390,sy=812;g.fillStyle='#f6f1e6';g.beginPath();g.arc(sx,sy,46,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1.5;g.beginPath();g.moveTo(sx-46,sy);g.lineTo(sx+46,sy);g.moveTo(sx,sy-46);g.lineTo(sx,sy+46);g.stroke();g.beginPath();g.arc(sx,sy,30,0,TAU);g.stroke();
g.fillStyle='#e0262e';g.beginPath();g.arc(sx-6,sy+20,9,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();g.restore();txt('SPIN',sx,876,12,'#c4badf',800,'center');txt('draw',sx+62,sy+26,13,'#ff9a9a',700);
/* power */
txt('POWER',520,786,13,'#c4badf',800);const pw=.66;g.fillStyle='#140c36';rr(520,798,520,30,14);g.fill();g.fillStyle=lin(520,0,1040,0,[[0,'#8affb4'],[.55,'#ffd45a'],[1,'#ff4a4a']]);rr(520,798,520*pw,30,14);g.fill();g.strokeStyle=O;g.lineWidth=3;rr(520,798,520,30,14);g.stroke();
for(let i=1;i<10;i++){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(520+i*52,802,2,22)}txt('66%',520+520*pw-8,820,14,'#2a1a04',800,'right');
txt('Drag back from the cue ball and release  ·  Arrow keys fine-tune  ·  Space shoots',780,856,13,'#c4badf',600,'center');
/* shot clock + guide */
g.save();g.strokeStyle='#3a3070';g.lineWidth=8;g.beginPath();g.arc(1120,812,36,0,TAU);g.stroke();g.strokeStyle='#8affb4';g.beginPath();g.arc(1120,812,36,-Math.PI/2,-Math.PI/2+TAU*.7);g.stroke();g.restore();ttl('21',1120,826,34,'#efe8ff','center');txt('SHOT CLOCK',1120,872,10,'#c4badf',800,'center');
g.fillStyle='#2a2070';rr(1180,786,104,52,14);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke();txt('Guide',1232,808,13,'#efe8ff',700,'center');txt('FULL',1232,828,13,'#8affb4',800,'center');
/* menu */
g.fillStyle='rgba(22,14,56,.9)';rr(20,820,120,56,16);g.fill();g.strokeStyle='#c99a3a';g.lineWidth=3;g.stroke();txt('II  Menu',80,855,16,'#efe8ff',700,'center');
