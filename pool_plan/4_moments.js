g.fillStyle='#0c0618';g.fillRect(0,0,1600,900);
const PW=780,PH=430,pane=(i,title,sub,fn)=>{const x=13+(i%2)*(PW+14),y=24+Math.floor(i/2)*(PH+16);g.save();rr(x,y,PW,PH,22);g.clip();fn(x,y);g.restore();g.save();rr(x,y,PW,PH,22);g.clip();g.fillStyle='rgba(8,4,20,.88)';g.fillRect(x,y+PH-44,PW,44);g.restore();
 g.lineWidth=4;g.strokeStyle='#c99a3a';rr(x,y,PW,PH,22);g.stroke();g.fillStyle='rgba(10,6,24,.86)';rr(x+14,y+14,Math.max(250,title.length*17+30),58,14);g.fill();ttl(title,x+28,y+52,30,'#ffd45a');txt(sub,x+28,y+PH-18,14,'#efe8ff',600)};
/* A: the break */
pane(0,'1  The break','Impact flash, ball streaks, felt dust, a short camera shake; the click of the rack scattering',(x,y)=>{g.translate(x,y);g.scale(.84,.84);g.translate(-300,-150);tavern({floor:540,shelf:false,lights:false});table();
 const pos=[[0,860,436],[1,930,320],[9,1010,250],[2,1070,520],[10,980,560],[3,1150,380],[11,1100,290],[4,1180,610],[12,890,600],[5,1040,420],[13,1190,470],[6,960,450],[14,1210,240],[7,1120,560],[15,1000,350],[8,1060,330]];
 for(const [n,bx,by] of pos){if(!n)continue;const dx=bx-1020,dy=by-434,d=Math.hypot(dx,dy)||1;g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=TB.R*1.6;g.lineCap='round';g.beginPath();g.moveTo(bx-dx/d*60,by-dy/d*60);g.lineTo(bx,by);g.stroke()}
 glow(1010,434,180,'rgba(255,240,200,1)',.8);for(let i=0;i<14;i++){const a=i/14*TAU;g.strokeStyle='rgba(255,236,180,.9)';g.lineWidth=4;g.beginPath();g.moveTo(1010+Math.cos(a)*40,434+Math.sin(a)*40);g.lineTo(1010+Math.cos(a)*(80+(i%3)*24),434+Math.sin(a)*(80+(i%3)*24));g.stroke()}
 for(let i=0;i<30;i++){g.fillStyle=`rgba(200,230,210,${.3-i*.008})`;g.beginPath();g.arc(1010+Math.cos(i*2.4)*(20+i*4),434+Math.sin(i*2.4)*(14+i*3),3+i%4,0,TAU);g.fill()}
 pos.forEach(([n,bx,by])=>ball(bx,by,n,TB.R,n*.7,.3));
 g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=TB.R*1.8;g.beginPath();g.moveTo(740,436);g.lineTo(850,436);g.stroke();ball(860,436,0,TB.R);
 g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(340,200+s*10);g.lineTo(380,200+s*10);g.stroke()}});
/* B: slow-motion 8 */
pane(1,'2  The last 8, in slow motion','Time ×0.35 and a 1.6× zoom on the pocket while the 8 drops; letterbox bars; crowd hush, then a cheer',(x,y)=>{g.translate(x,y);g.save();g.translate(390,230);g.scale(2.2,2.2);g.translate(-1190,-250);tavern({floor:540,shelf:false,lights:false});table();
 g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=TB.R*1.6;g.beginPath();g.moveTo(1120,320);g.lineTo(1196,250);g.stroke();ball(1200,248,8,TB.R,.6,.2);g.strokeStyle='rgba(255,255,255,.5)';g.setLineDash([4,6]);g.lineWidth=1.5;g.beginPath();g.moveTo(1200,248);g.lineTo(1236,216);g.stroke();g.setLineDash([]);glow(1240,214,60,'rgba(255,212,90,1)',.7);g.restore();
 g.fillStyle='rgba(0,0,0,.85)';g.fillRect(0,0,PW,52);g.fillRect(0,PH-60,PW,60);const v=g.createRadialGradient(390,230,120,390,230,520);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');g.fillStyle=v;g.fillRect(0,0,PW,PH);
 txt('×0.35',PW-80,36,20,'#9fe8ff',800,'center');g.save();g.translate(640,330);g.beginPath();g.arc(0,0,58,0,TAU);g.fillStyle='#2a1a4a';g.fill();g.clip();g.translate(0,70);g.scale(.42,.42);MON.vesper(0);g.restore();g.strokeStyle='#c8a0ff';g.lineWidth=3;g.beginPath();g.arc(640,330,58,0,TAU);g.stroke();
 g.fillStyle='#9fe8ff';g.beginPath();g.ellipse(680,290,6,10,.3,0,TAU);g.fill();txt('gulp',690,284,14,'#c8a0ff',700)});
/* C: taunt */
pane(2,'3  Taunt (typing)','After a monster misses: type the taunt in 3 s to rattle it (its next shot wobbles); once per rack',(x,y)=>{g.translate(x,y);g.save();g.scale(.84,.84);g.translate(-300,-150);tavern({floor:540,shelf:false,lights:false});table();
 [[0,620,420],[9,700,330],[12,1000,500],[3,830,260],[8,1100,400]].forEach(([n,bx,by])=>ball(bx,by,n,TB.R));g.restore();
 g.save();g.translate(640,410);g.scale(.62,.62);MON.vesper(0);g.restore();g.fillStyle='#9fe8ff';g.beginPath();g.ellipse(690,215,7,12,0,0,TAU);g.fill();
 g.save();g.fillStyle='rgba(16,10,40,.94)';rr(120,150,440,150,20);g.fill();g.strokeStyle='#ff9ad0';g.lineWidth=3;g.stroke();g.restore();
 txt('TAUNT!  she missed - type it before the bar empties',140,182,13,'#ff9ad0',800);
 g.save();g.font=font(700,30);const done='nice try, ',rest='fang face';g.fillStyle='#ffd45a';g.fillText(done,140,232);const w0=g.measureText(done).width;g.fillStyle='#efe8ff';g.fillText(rest,140+w0,232);g.fillStyle='#ff6a8a';g.fillRect(140+w0,206,3,32);g.restore();
 g.fillStyle='#2a2060';rr(140,256,400,14,7);g.fill();g.fillStyle='#ff9ad0';rr(140,256,240,14,7);g.fill();
 g.save();g.fillStyle='#fff8ee';g.strokeStyle=O;g.lineWidth=3;rr(560,96,190,56,14);g.fill();g.stroke();g.restore();txt('Hmph!',580,132,20,'#2a1a3a',800)});
/* D: victory */
pane(3,'4  Victory','Coin fountain into the HUD, the monster sulks, unlocks pop in; Enter = rematch, Esc = back to the bar',(x,y)=>{g.translate(x,y);g.save();g.scale(.5,.5);tavern({floor:600});g.restore();g.fillStyle='rgba(8,4,20,.55)';g.fillRect(0,0,PW,PH);
 g.save();g.translate(150,410);g.scale(.62,.62);g.rotate(-.06);MON.vesper(0);g.restore();
 g.save();g.fillStyle='#fff8ee';g.strokeStyle=O;g.lineWidth=3;rr(40,96,230,58,14);g.fill();g.stroke();g.restore();txt('...beginner\'s luck.',58,132,16,'#2a1a3a',700);
 panel(300,90,440,300,'#ffd45a');ttl('You win!',520,150,52,'#ffd45a','center');txt('Race to 2  ·  2 - 1  ·  Vesper Nightwing',520,180,15,'#c4badf',700,'center');
 txt('Stake 1,000  →  pays 2,000',520,222,18,'#efe8ff',700,'center');txt('Break & run bonus  +250',520,250,16,'#8affb4',700,'center');
 g.fillStyle='rgba(200,160,255,.15)';rr(330,272,380,56,14);g.fill();g.strokeStyle='#c8a0ff';g.lineWidth=2;g.stroke();txt('NEW: Nightwing Cue (beat Vesper 3 times: 1/3)',520,306,14,'#c8a0ff',800,'center');
 g.fillStyle='#ffd45a';rr(340,340,170,38,12);g.fill();txt('Rematch',425,365,16,'#2a1a04',800,'center');g.fillStyle='#2a2070';rr(530,340,170,38,12);g.fill();txt('Back to the bar',615,365,16,'#efe8ff',800,'center');
 for(let i=0;i<26;i++){const a=-Math.PI/2+(rnd(i)-.5)*2.2,d=60+rnd(i+9)*180;const cx=520+Math.cos(a)*d,cy=150+Math.sin(a)*d*.6;g.fillStyle='#ffd45a';g.strokeStyle=O;g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,9,9*Math.abs(Math.cos(i)),0,0,TAU);g.fill();g.stroke()}});
