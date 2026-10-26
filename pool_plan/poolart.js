/* Crooked Cue concept-art helpers (reference only; draws on a 1600x900 canvas `g`). */
const O='#12081f',TAU=Math.PI*2;
const glow=(x,y,r,c,a)=>{g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a==null?1:a;const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()};
const font=(w,s,f)=>`${w} ${s}px ${f==='p'?"'Pirata One',Georgia,serif":"Poppins,sans-serif"}`;
const txt=(t,x,y,s,col,w,al,f)=>{g.save();g.font=font(w||600,s||18,f);g.textAlign=al||'left';g.fillStyle=col||'#efe8ff';g.fillText(t,x,y);g.restore()};
const ttl=(t,x,y,s,col,al)=>{g.save();g.font=font(400,s||60,'p');g.textAlign=al||'left';g.lineJoin='round';g.lineWidth=Math.max(5,s/8);g.strokeStyle=O;g.strokeText(t,x,y);g.fillStyle=col||'#ffd45a';g.fillText(t,x,y);g.restore()};
const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect(x,y,w,h,r)};
const panel=(x,y,w,h,col,a)=>{g.save();g.fillStyle=`rgba(22,14,56,${a==null?.92:a})`;rr(x,y,w,h,20);g.fill();g.lineWidth=3;g.strokeStyle=col||'#c99a3a';g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(x-3,y-3,w+6,h+6,22);g.stroke();g.restore()};
const mix=(a,b,t)=>{const p=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));const A=p(a),B=p(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const lin=(x0,y0,x1,y1,st)=>{const q=g.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,c])=>q.addColorStop(o,c));return q};
const rnd=(i)=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};

/* ---------- tavern background ---------- */
function tavern(o){o=o||{};
 /* back wall planks */
 g.fillStyle='#2a1610';g.fillRect(0,0,1600,900);
 for(let i=0;i<40;i++){const x=i*42;g.fillStyle=mix('#3a2014','#4a2a18',rnd(i));g.fillRect(x,0,40,900);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+40,0,2,900);
  for(let k=0;k<5;k++){g.strokeStyle='rgba(20,8,4,.25)';g.lineWidth=1.5;g.beginPath();const yy=rnd(i*9+k)*900;g.moveTo(x+6,yy);g.quadraticCurveTo(x+20,yy+30,x+34,yy+10);g.stroke()}}
 /* shelf + bottles */
 if(o.shelf!==false){g.fillStyle='#5a3418';g.fillRect(0,118,1600,16);g.fillStyle='#2a140a';g.fillRect(0,134,1600,6);
  const bc=['#3aa85a','#c83a3a','#7ad8ff','#d8a03a','#9a5ad8','#ff9a3a','#5ad8b8'];
  for(let i=0;i<46;i++){const x=20+i*35+rnd(i)*8,h=40+rnd(i+3)*34,w=16+rnd(i+7)*8,c=bc[i%7];g.fillStyle=c;g.globalAlpha=.85;rr(x,118-h,w,h,5);g.fill();rr(x+w*.3,118-h-14,w*.4,16,3);g.fill();g.globalAlpha=1;g.strokeStyle=O;g.lineWidth=2;rr(x,118-h,w,h,5);g.stroke();
   g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+3,118-h+6,3,h-12);if(i%3===0)glow(x+w/2,118-h/2,26,c.replace('#','#')+'',.18)}}
 /* floor */
 const fy=o.floor||600;g.fillStyle='#3a2416';g.fillRect(0,fy,1600,900-fy);
 for(let r=0;r<8;r++){const y=fy+r*44;g.fillStyle=r%2?'#40281a':'#36200f';g.fillRect(0,y,1600,42);for(let k=0;k<9;k++){const x=((k*211+r*97)%1700)-60;g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,y,2,42)}}
 g.fillStyle=lin(0,fy-30,0,fy+30,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.5)']]);g.fillRect(0,fy-30,1600,60);
 /* string lights */
 if(o.lights!==false){g.strokeStyle='#1a0e08';g.lineWidth=2;g.beginPath();g.moveTo(0,30);for(let x=0;x<=1600;x+=200)g.quadraticCurveTo(x+100,70,x+200,30);g.stroke();
  for(let i=0;i<32;i++){const x=i*50+25,y=30+Math.sin((x%200)/200*Math.PI)*28;const c=['#ffd45a','#ff9ad0','#9fe8ff','#8affb4'][i%4];glow(x,y+6,26,c,.55);g.fillStyle=c;g.beginPath();g.arc(x,y+6,5,0,TAU);g.fill()}}
 /* vignette */
 const v=g.createRadialGradient(800,470,260,800,470,980);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(6,2,12,.82)');g.fillStyle=v;g.fillRect(0,0,1600,900);
}

/* ---------- table ---------- */
const TB={x:360,y:214,w:880,h:440,rail:44,R:12};
function pockets(){const {x,y,w,h}=TB;return[[x,y,1],[x+w/2,y-4,0],[x+w,y,1],[x,y+h,1],[x+w/2,y+h+4,0],[x+w,y+h,1]]}
function table(felt){felt=felt||{a:'#1f7a52',b:'#12573a',c:'#0b3a26'};const {x,y,w,h,rail}=TB;
 /* floor shadow + legs */
 g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(x+w/2,y+h+rail+70,w*.62,60,0,0,TAU);g.fill();
 for(const lx of[x-rail+30,x+w+rail-70]){g.fillStyle=lin(lx,0,lx+40,0,[[0,'#3a1e0e'],[.5,'#6a3a1a'],[1,'#2a1408']]);rr(lx,y+h+rail+10,40,96,8);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke()}
 /* apron (front face) */
 g.fillStyle=lin(0,y+h+rail,0,y+h+rail+46,[[0,'#6a3416'],[1,'#3a1a0a']]);rr(x-rail-6,y+h+rail-6,w+rail*2+12,52,10);g.fill();g.strokeStyle=O;g.lineWidth=4;g.stroke();
 g.strokeStyle='#d8a03a';g.lineWidth=2;g.beginPath();g.moveTo(x-rail+20,y+h+rail+20);g.lineTo(x+w+rail-20,y+h+rail+20);g.stroke();
 /* rails (wood) */
 g.fillStyle=lin(0,y-rail,0,y+h+rail,[[0,'#8a4a20'],[.5,'#6a3414'],[1,'#7a3e18']]);rr(x-rail,y-rail,w+rail*2,h+rail*2,26);g.fill();g.strokeStyle=O;g.lineWidth=5;g.stroke();
 for(let i=0;i<60;i++){const yy=y-rail+4+rnd(i)*(h+rail*2-8);g.strokeStyle='rgba(40,16,4,.25)';g.lineWidth=1.2;g.beginPath();g.moveTo(x-rail+8,yy);g.bezierCurveTo(x+w*.3,yy+6*Math.sin(i),x+w*.7,yy-6,x+w+rail-8,yy+3);g.stroke()}
 g.strokeStyle='rgba(255,220,170,.25)';g.lineWidth=2;rr(x-rail+5,y-rail+5,w+rail*2-10,h+rail*2-10,22);g.stroke();
 /* diamonds */
 for(let i=1;i<8;i++){if(i===4)continue;const dx=x+w*i/8;for(const dy of[y-rail/2-2,y+h+rail/2+2]){g.fillStyle='#f4ead2';g.beginPath();g.moveTo(dx,dy-6);g.lineTo(dx+4,dy);g.lineTo(dx,dy+6);g.lineTo(dx-4,dy);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=1.2;g.stroke()}}
 for(let i=1;i<4;i++){const dy=y+h*i/4;for(const dx of[x-rail/2-2,x+w+rail/2+2]){g.fillStyle='#f4ead2';g.beginPath();g.moveTo(dx-6,dy);g.lineTo(dx,dy+4);g.lineTo(dx+6,dy);g.lineTo(dx,dy-4);g.closePath();g.fill();g.strokeStyle=O;g.lineWidth=1.2;g.stroke()}}
 /* cushions */
 g.fillStyle=felt.c;rr(x-14,y-14,w+28,h+28,10);g.fill();
 /* felt */
 g.fillStyle=lin(x,y,x,y+h,[[0,felt.a],[1,felt.b]]);g.fillRect(x,y,w,h);
 for(let i=0;i<1400;i++){g.fillStyle=`rgba(${i%2?255:0},${i%2?255:0},${i%2?255:0},.035)`;g.fillRect(x+rnd(i)*w,y+rnd(i+5000)*h,2,2)}
 const lp=g.createRadialGradient(x+w/2,y+h/2,40,x+w/2,y+h/2,w*.62);lp.addColorStop(0,'rgba(255,240,190,.20)');lp.addColorStop(.6,'rgba(255,230,170,.05)');lp.addColorStop(1,'rgba(0,0,0,.38)');g.fillStyle=lp;g.fillRect(x,y,w,h);
 /* cushion bevel */
 g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=8;g.strokeRect(x+4,y+4,w-8,h-8);g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=2;g.strokeRect(x-12,y-12,w+24,h+24);
 /* head string + spots */
 g.strokeStyle='rgba(255,255,255,.13)';g.lineWidth=2;g.setLineDash([6,8]);g.beginPath();g.moveTo(x+w/4,y+8);g.lineTo(x+w/4,y+h-8);g.stroke();g.setLineDash([]);
 for(const sx of[x+w/4,x+w*3/4]){g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(sx,y+h/2,3,0,TAU);g.fill()}
 /* pockets */
 for(const [px,py,c] of pockets()){g.fillStyle='#b88a3a';g.beginPath();g.arc(px,py,c?34:30,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=3;g.stroke();
  g.fillStyle='#e8c070';g.beginPath();g.arc(px-3,py-3,c?28:24,Math.PI,Math.PI*1.5);g.lineTo(px,py);g.fill();
  const q=g.createRadialGradient(px,py,2,px,py,c?24:21);q.addColorStop(0,'#000');q.addColorStop(.7,'#0a0408');q.addColorStop(1,'#2a1a14');g.fillStyle=q;g.beginPath();g.arc(px,py,c?23:20,0,TAU);g.fill();
  g.strokeStyle='rgba(255,220,150,.35)';g.lineWidth=1.5;g.beginPath();g.arc(px,py,c?17:14,0,TAU);g.stroke()}
}

/* ---------- balls ---------- */
const BC={1:'#f2c21b',2:'#1e4fd8',3:'#e0262e',4:'#6a2aa8',5:'#f27a1b',6:'#178a3e',7:'#8a1a1a',8:'#14121a'};
function shadow(x,y,R){g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(x+R*.35,y+R*.55,R*1.05,R*.8,0,0,TAU);g.fill()}
function ball(x,y,n,R,rot,tilt){R=R||TB.R;shadow(x,y,R);g.save();g.translate(x,y);g.beginPath();g.arc(0,0,R,0,TAU);g.clip();
 const stripe=n>8,col=n===0?'#f6f1e6':BC[stripe?n-8:n];
 g.fillStyle=stripe?'#f6f1e6':col;g.fillRect(-R,-R,R*2,R*2);
 if(stripe){g.save();g.rotate(rot||0);g.fillStyle=col;g.fillRect(-R*1.2,-R*.52,R*2.4,R*1.04);g.restore()}
 if(n>0){const ox=Math.cos(rot||0)*(tilt||0)*R,oy=Math.sin(rot||0)*(tilt||0)*R;g.fillStyle='#fbf7ee';g.beginPath();g.ellipse(ox,oy,R*.5*(1-.3*Math.abs(tilt||0)),R*.5,rot||0,0,TAU);g.fill();
  g.font=`800 ${R*.62}px Poppins,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle='#14121a';g.fillText(n,ox,oy+.5)}
 if(n===0){g.fillStyle='rgba(200,40,40,.7)';g.beginPath();g.arc(R*.35,-R*.1,R*.14,0,TAU);g.fill()}
 const sh=g.createRadialGradient(-R*.35,-R*.45,R*.1,0,0,R*1.05);sh.addColorStop(0,'rgba(255,255,255,.0)');sh.addColorStop(.55,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=sh;g.fillRect(-R,-R,R*2,R*2);
 g.restore();g.lineWidth=1.6;g.strokeStyle='rgba(10,4,16,.85)';g.beginPath();g.arc(x,y,R,0,TAU);g.stroke();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(x-R*.38,y-R*.42,R*.26,R*.17,-.6,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(x+R*.3,y+R*.45,R*.12,0,TAU);g.fill()}

/* ---------- cue ---------- */
function cue(x,y,ang,back,skin){skin=skin||{};g.save();g.translate(x,y);g.rotate(ang);g.translate(-(TB.R+6+(back||0)),0);
 const L=520;g.fillStyle='rgba(0,0,0,.35)';rr(-L+10,6,L,12,6);g.fill();
 g.fillStyle='#3a7ad8';rr(-7,-3.5,8,7,2);g.fill();
 g.fillStyle='#f4f0e6';g.fillRect(-26,-4,20,8);
 g.fillStyle=lin(0,-6,0,6,[[0,skin.a||'#e8c890'],[.5,skin.b||'#c89a5a'],[1,skin.a||'#a8763a']]);g.beginPath();g.moveTo(-26,-4);g.lineTo(-L*.62,-6.5);g.lineTo(-L*.62,6.5);g.lineTo(-26,4);g.closePath();g.fill();
 g.fillStyle=skin.wrap||'#2a1a3a';g.fillRect(-L*.62-110,-7,110,14);for(let i=0;i<22;i++){g.fillStyle='rgba(255,255,255,.08)';g.fillRect(-L*.62-110+i*5,-7,2,14)}
 g.fillStyle=lin(0,-8,0,8,[[0,skin.c||'#5a1a1a'],[.5,skin.d||'#8a2a2a'],[1,skin.c||'#3a0a0a']]);g.beginPath();g.moveTo(-L*.62-110,-7.5);g.lineTo(-L,-9);g.lineTo(-L,9);g.lineTo(-L*.62-110,7.5);g.closePath();g.fill();
 for(let k=0;k<4;k++){g.fillStyle='#ffd45a';g.beginPath();const px=-L*.62-130-k*44;g.moveTo(px,0);g.lineTo(px-12,-6);g.lineTo(px-24,0);g.lineTo(px-12,6);g.closePath();g.fill()}
 g.strokeStyle=O;g.lineWidth=2;g.beginPath();g.moveTo(0,-3.5);g.lineTo(-26,-4);g.lineTo(-L*.62,-6.5);g.lineTo(-L*.62-110,-7.5);g.lineTo(-L,-9);g.lineTo(-L,9);g.lineTo(-L*.62-110,7.5);g.lineTo(-L*.62,6.5);g.lineTo(-26,4);g.lineTo(0,3.5);g.closePath();g.stroke();
 g.fillStyle='#1a0e08';rr(-L-6,-10,10,20,4);g.fill();g.restore()}

/* ---------- monsters (half-body, origin = bottom centre, ~h tall at s=1 is 300) ---------- */
function eye(x,y,r,pupil,col,look){g.fillStyle='#fff';g.strokeStyle=O;g.lineWidth=3;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.stroke();g.fillStyle=col||O;g.beginPath();g.arc(x+(look||0)*r*.35,y+r*.1,r*(pupil||.48),0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+(look||0)*r*.35-r*.18,y-r*.12,r*.16,0,TAU);g.fill()}
function blob(fill,pts,lw){g.fillStyle=fill;g.strokeStyle=O;g.lineWidth=lw||4;g.beginPath();pts();g.fill();g.stroke()}
const MON={
 gloop(t){/* slime */glow(0,-120,170,'rgba(120,255,140,1)',.25);
  blob(lin(0,-260,0,0,[[0,'#9affa0'],[1,'#2aa84a']]),()=>{g.moveTo(-130,0);g.bezierCurveTo(-150,-120,-90,-250,0,-252);g.bezierCurveTo(90,-250,150,-120,130,0);g.quadraticCurveTo(0,14,-130,0)});
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-60,-190,22,40,-.5,0,TAU);g.fill();
  for(const [bx,by,br] of[[40,-60,14],[-30,-40,9],[70,-140,8]]){g.strokeStyle='rgba(20,90,30,.5)';g.lineWidth=2;g.beginPath();g.arc(bx,by,br,0,TAU);g.stroke()}
  eye(-36,-160,26,.5,O,.3);eye(34,-166,30,.5,O,.3);
  g.fillStyle='#1a5a2a';g.beginPath();g.ellipse(0,-108,30,18,0,0,Math.PI);g.fill();g.fillStyle='#ff7a9a';g.beginPath();g.ellipse(0,-98,14,7,0,0,Math.PI);g.fill();
  blob('#e0262e',()=>{g.moveTo(-26,-70);g.lineTo(0,-60);g.lineTo(-26,-50);g.closePath();g.moveTo(26,-70);g.lineTo(0,-60);g.lineTo(26,-50);g.closePath()},3);g.fillStyle='#ffd45a';g.beginPath();g.arc(0,-60,6,0,TAU);g.fill()},
 moldwick(t){/* mushroom granny */
  blob('#6a4a8a',()=>{g.moveTo(-110,0);g.quadraticCurveTo(-100,-120,-50,-150);g.lineTo(50,-150);g.quadraticCurveTo(100,-120,110,0);g.closePath()});
  for(let i=0;i<7;i++){g.fillStyle='rgba(255,220,240,.25)';g.beginPath();g.arc(-80+i*27,-40-(i%2)*30,8,0,TAU);g.fill()}
  blob('#f2dcc0',()=>{g.ellipse(0,-180,52,58,0,0,TAU)});
  blob(lin(0,-330,0,-200,[[0,'#ff5a5a'],[1,'#b8222a']]),()=>{g.moveTo(-120,-200);g.bezierCurveTo(-120,-300,-50,-336,0,-336);g.bezierCurveTo(50,-336,120,-300,120,-200);g.quadraticCurveTo(0,-176,-120,-200)});
  for(const [sx,sy,sr] of[[-60,-280,14],[10,-306,12],[60,-262,16],[-20,-250,9],[90,-226,8]]){g.fillStyle='#fff4e0';g.beginPath();g.ellipse(sx,sy,sr,sr*.8,0,0,TAU);g.fill()}
  g.strokeStyle=O;g.lineWidth=3;for(const ex of[-20,20]){g.fillStyle='rgba(200,230,255,.5)';g.beginPath();g.arc(ex,-180,15,0,TAU);g.fill();g.stroke();g.fillStyle=O;g.beginPath();g.arc(ex,-178,4,0,TAU);g.fill()}g.beginPath();g.moveTo(-5,-180);g.lineTo(5,-180);g.stroke();
  g.strokeStyle='#8a4a3a';g.lineWidth=3;g.beginPath();g.arc(0,-150,12,.2,Math.PI-.2);g.stroke();
  g.fillStyle='#ff9ab0';g.globalAlpha=.6;g.beginPath();g.arc(-34,-160,8,0,TAU);g.arc(34,-160,8,0,TAU);g.fill();g.globalAlpha=1},
 grizzle(t){/* cyclops brute */
  blob('#7a8a3a',()=>{g.moveTo(-150,0);g.quadraticCurveTo(-170,-130,-110,-170);g.lineTo(110,-170);g.quadraticCurveTo(170,-130,150,0);g.closePath()});
  blob('#e8e0d0',()=>{g.moveTo(-90,0);g.lineTo(-80,-150);g.lineTo(80,-150);g.lineTo(90,0);g.closePath()},3);g.fillStyle='#c83a2a';g.fillRect(-84,-120,168,10);
  blob('#8a9a46',()=>{g.ellipse(0,-230,90,84,0,0,TAU)});
  blob('#e8dcc0',()=>{g.moveTo(-14,-310);g.lineTo(0,-360);g.lineTo(14,-310);g.closePath()},3);
  eye(0,-244,38,.42,'#c8222a',-.2);g.strokeStyle=O;g.lineWidth=6;g.beginPath();g.moveTo(-44,-290);g.lineTo(40,-282);g.stroke();
  g.fillStyle='#3a2a14';g.beginPath();g.ellipse(0,-182,46,16,0,0,Math.PI);g.fill();
  blob('#f4ead2',()=>{g.moveTo(-34,-184);g.lineTo(-26,-214);g.lineTo(-16,-184);g.closePath();g.moveTo(34,-184);g.lineTo(26,-214);g.lineTo(16,-184);g.closePath()},3)},
 vesper(t){/* vampire bat */
  blob('#2a1440',()=>{g.moveTo(-170,0);g.quadraticCurveTo(-200,-80,-150,-160);g.quadraticCurveTo(-120,-120,-90,-150);g.lineTo(90,-150);g.quadraticCurveTo(120,-120,150,-160);g.quadraticCurveTo(200,-80,170,0);g.closePath()});
  blob('#c8222a',()=>{g.moveTo(-90,-150);g.lineTo(-60,-60);g.lineTo(0,-120);g.lineTo(60,-60);g.lineTo(90,-150);g.closePath()},3);
  blob('#5a3a7a',()=>{g.ellipse(0,-220,78,74,0,0,TAU)});
  for(const s of[-1,1]){blob('#5a3a7a',()=>{g.moveTo(s*40,-280);g.lineTo(s*96,-372);g.lineTo(s*82,-250);g.closePath()});g.fillStyle='#ff9ad0';g.beginPath();g.moveTo(s*52,-284);g.lineTo(s*88,-350);g.lineTo(s*78,-268);g.closePath();g.fill()}
  for(const s of[-1,1]){g.fillStyle='#ffdede';g.strokeStyle=O;g.lineWidth=3;g.beginPath();g.ellipse(s*30,-232,20,14,s*.2,0,TAU);g.fill();g.stroke();glow(s*30,-232,24,'rgba(255,40,60,1)',.6);g.fillStyle='#e0102a';g.beginPath();g.ellipse(s*30,-231,6,9,0,0,TAU);g.fill()}
  g.strokeStyle=O;g.lineWidth=3;g.beginPath();g.arc(0,-196,22,.25,Math.PI-.25);g.stroke();g.fillStyle='#fff';for(const s of[-1,1]){g.beginPath();g.moveTo(s*12,-178);g.lineTo(s*7,-166);g.lineTo(s*2,-178);g.fill()}
  g.fillStyle='#3a1a5a';g.beginPath();g.moveTo(-40,-286);g.lineTo(0,-262);g.lineTo(40,-286);g.quadraticCurveTo(0,-300,-40,-286);g.fill()},
 barnacle(t){/* crab pirate */
  blob(lin(0,-260,0,0,[[0,'#ff6a4a'],[1,'#b8301a']]),()=>{g.ellipse(0,-110,150,110,0,0,TAU)});
  for(let i=0;i<6;i++){g.fillStyle='#e8d8b8';g.strokeStyle=O;g.lineWidth=2;g.beginPath();g.arc(-110+i*42,-40-(i%3)*14,9,0,TAU);g.fill();g.stroke()}
  for(const s of[-1,1]){g.strokeStyle=O;g.lineWidth=12;g.beginPath();g.moveTo(s*40,-190);g.lineTo(s*54,-262);g.stroke();g.strokeStyle='#e85a3a';g.lineWidth=7;g.stroke();eye(s*56,-276,22,.5,O,-.3*s)}
  blob('#1a1a2a',()=>{g.moveTo(-120,-300);g.quadraticCurveTo(0,-380,120,-300);g.quadraticCurveTo(0,-326,-120,-300)});g.fillStyle='#fff';g.font='800 26px Poppins';g.textAlign='center';g.fillText('☠',0,-318);
  g.strokeStyle=O;g.lineWidth=4;g.beginPath();g.arc(0,-130,40,.2,Math.PI-.2);g.stroke();
  blob('#e85a3a',()=>{g.moveTo(130,-140);g.quadraticCurveTo(210,-200,190,-260);g.lineTo(160,-230);g.lineTo(170,-280);g.quadraticCurveTo(250,-230,200,-130);g.closePath()});
  g.fillStyle='#ffd45a';g.beginPath();g.arc(-150,-60,10,0,TAU);g.fill();g.strokeStyle=O;g.lineWidth=2;g.stroke()},
 hootsworth(t){/* owl professor */
  blob(lin(0,-300,0,0,[[0,'#a8784a'],[1,'#6a4224']]),()=>{g.moveTo(-130,0);g.bezierCurveTo(-150,-160,-110,-300,0,-300);g.bezierCurveTo(110,-300,150,-160,130,0);g.closePath()});
  blob('#e8d0a8',()=>{g.ellipse(0,-80,80,90,0,0,TAU)},3);for(let i=0;i<12;i++){g.strokeStyle='rgba(120,80,40,.6)';g.lineWidth=2;g.beginPath();g.arc(-50+(i%4)*33,-120+Math.floor(i/4)*36,10,0,Math.PI);g.stroke()}
  for(const s of[-1,1]){blob('#f4e6c8',()=>{g.arc(s*44,-210,40,0,TAU)},3);eye(s*44,-210,26,.55,'#e8a020',0);g.strokeStyle='#c8a030';g.lineWidth=5;g.beginPath();g.arc(s*44,-210,32,0,TAU);g.stroke()}
  g.strokeStyle='#c8a030';g.lineWidth=4;g.beginPath();g.moveTo(-12,-214);g.lineTo(12,-214);g.stroke();
  blob('#ffb84a',()=>{g.moveTo(-12,-180);g.lineTo(0,-150);g.lineTo(12,-180);g.closePath()},3);
  for(const s of[-1,1])blob('#6a4224',()=>{g.moveTo(s*60,-270);g.lineTo(s*84,-322);g.lineTo(s*100,-262);g.closePath()});
  blob('#2a2a6a',()=>{g.moveTo(-26,-150);g.lineTo(0,-138);g.lineTo(-26,-126);g.closePath();g.moveTo(26,-150);g.lineTo(0,-138);g.lineTo(26,-126);g.closePath()},3)},
 mortimer(t){/* lich champion */
  glow(0,-200,220,'rgba(90,220,255,1)',.35);
  blob(lin(0,-200,0,0,[[0,'#2a1a5a'],[1,'#120a2a']]),()=>{g.moveTo(-160,0);g.quadraticCurveTo(-160,-140,-80,-180);g.lineTo(80,-180);g.quadraticCurveTo(160,-140,160,0);g.closePath()});
  g.strokeStyle='#ffd45a';g.lineWidth=5;g.beginPath();g.moveTo(-80,-178);g.lineTo(-40,0);g.moveTo(80,-178);g.lineTo(40,0);g.stroke();
  blob('#e8e4d8',()=>{g.moveTo(-62,-200);g.bezierCurveTo(-80,-320,80,-320,62,-200);g.quadraticCurveTo(40,-170,0,-168);g.quadraticCurveTo(-40,-170,-62,-200)});
  for(const s of[-1,1]){g.fillStyle=O;g.beginPath();g.ellipse(s*26,-246,20,22,0,0,TAU);g.fill();glow(s*26,-246,36,'rgba(90,240,255,1)',.9);g.fillStyle='#bff8ff';g.beginPath();g.arc(s*26,-244,6,0,TAU);g.fill()}
  g.fillStyle=O;g.beginPath();g.moveTo(0,-222);g.lineTo(-8,-206);g.lineTo(8,-206);g.closePath();g.fill();for(let i=-3;i<=3;i++){g.fillRect(i*9-1.5,-196,3,18)}
  blob('#ffd45a',()=>{g.moveTo(-60,-300);g.lineTo(-50,-350);g.lineTo(-28,-316);g.lineTo(0,-362);g.lineTo(28,-316);g.lineTo(50,-350);g.lineTo(60,-300);g.closePath()},3);
  for(const [cx,cc] of[[-28,'#7ad8ff'],[0,'#ff6a8a'],[28,'#8affb4']]){g.fillStyle=cc;g.beginPath();g.arc(cx,-312,6,0,TAU);g.fill()}},
 shade(t){/* the hustler */
  g.save();g.globalAlpha=.95;
  blob('#100818',()=>{g.moveTo(-140,0);g.bezierCurveTo(-160,-120,-110,-240,0,-250);g.bezierCurveTo(110,-240,160,-120,140,0);g.closePath()},3);
  for(let i=0;i<14;i++){g.fillStyle='rgba(60,30,90,.5)';g.beginPath();g.arc(-150+i*22,-10-rnd(i)*40,14+rnd(i+2)*14,0,TAU);g.fill()}
  blob('#2a2030',()=>{g.moveTo(-110,-230);g.quadraticCurveTo(0,-260,110,-230);g.lineTo(80,-250);g.quadraticCurveTo(70,-330,0,-326);g.quadraticCurveTo(-70,-330,-80,-250);g.closePath()});g.fillStyle='#8a2a4a';g.fillRect(-76,-266,152,14);
  for(const s of[-1,1]){glow(s*30,-200,30,'rgba(255,220,80,1)',.8);g.fillStyle='#ffe066';g.beginPath();g.ellipse(s*30,-200,14,6,s*-.25,0,TAU);g.fill()}
  g.fillStyle='#fff8e8';g.beginPath();g.moveTo(-50,-160);g.quadraticCurveTo(0,-120,50,-160);g.quadraticCurveTo(0,-140,-50,-160);g.fill();
  g.restore()}
};
const MONINFO={
 gloop:{n:'Gloop',k:'The Spilled Drink',c:'#8affb4',lvl:1,st:'50 - 200',pay:'×1.6',q:'"I hit it HARD. That\'s the strategy."'},
 moldwick:{n:'Granny Moldwick',k:'Slow and Steady',c:'#ff9ab0',lvl:2,st:'100 - 500',pay:'×1.75',q:'"Patience, dearie. The pockets aren\'t going anywhere."'},
 grizzle:{n:'Grizzle',k:'The Breaker',c:'#c8d870',lvl:3,st:'200 - 1,000',pay:'×1.9',q:'"ONE EYE. ONE SHOT. ONE BIG BREAK."'},
 vesper:{n:'Vesper Nightwing',k:'Queen of Safeties',c:'#c8a0ff',lvl:4,st:'300 - 2,000',pay:'×2.0',q:'"Oh, did I leave you nothing? How dreadful."'},
 barnacle:{n:'Cap\'n Barnacle',k:'Banks and Kicks',c:'#ff8a6a',lvl:5,st:'500 - 3,000',pay:'×2.2',q:'"Off the rail, into the hold! Har!"'},
 hootsworth:{n:'Professor Hootsworth',k:'Position Master',c:'#ffd45a',lvl:6,st:'1,000 - 4,000',pay:'×2.5',q:'"Elementary geometry, my young friend."'},
 mortimer:{n:'Mortimer Bonechalk',k:'Champion of the Crooked Cue',c:'#7ad8ff',lvl:7,st:'2,000 - 5,000',pay:'×3.0',q:'"I have played this game for four hundred years."'},
 shade:{n:'Slick Shade',k:'The Hustler (random visitor)',c:'#ffe066',lvl:0,st:'any',pay:'double or nothing',q:'"Friendly game? Small stakes... for now."'}
};
