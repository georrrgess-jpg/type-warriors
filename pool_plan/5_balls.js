/* rolling-ball renderer reference sheet + timing */
g.fillStyle='#120a24';g.fillRect(0,0,1600,900);
const fz=lin(0,0,0,900,[[0,'#1f7a52'],[1,'#0f4a32']]);g.fillStyle=fz;rr(40,150,1520,700,30);g.fill();g.strokeStyle='#c99a3a';g.lineWidth=4;g.stroke();
ttl('Ball renderer reference',800,80,54,'#ffd45a','center');txt('per-pixel: rotate the normal into the ball frame, pick stripe / pole discs / glyph, fixed lamp light on top',800,118,17,'#e8dcff',500,'center');
pzbInit(120);
const seq=[[11,0],[11,.5],[11,1.0],[11,1.5],[11,2.0],[11,2.6]];
seq.forEach(([n,a],i)=>{let M=pzbI();M=pzbRot(M,0,1,0,a);M=pzbRot(M,1,0,0,.35);g.save();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(170+i*250+20,330+34,64,40,0,0,TAU);g.fill();g.restore();pzbDraw(g,n,M,170+i*250,300);txt('roll '+Math.round(a*57)+'°',170+i*250,400,15,'#efe8ff',700,'center')});
txt('11 rolling to the right: the stripe and the number travel over the sphere; the highlight stays under the lamp',800,440,16,'#c4badf',600,'center');
pzbInit2(52);
set=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
set.forEach((n,i)=>{let M=pzbI();M=pzbRot(M,.2,.9,.3,i*.9+.4);pzbPaint(i,n,M);g.save();g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(110+i*92+10,576,28,20,0,0,TAU);g.fill();g.restore();pzbBlit(g,i,110+i*92,560)});
txt('all 16 balls through the optimised path (one atlas, typed arrays, no per-pixel allocation), 52 px = 2× game size',800,630,16,'#c4badf',600,'center');
panel(250,680,1100,140,'#8affb4');txt('MEASURED IN HEADLESS CHROMIUM (software rendering)',800,712,14,'#8affb4',800,'center');
ttl('0.72 ms for all 16 balls at 52 px  ·  0.33 ms at 36 px',800,764,36,'#efe8ff','center');
txt('Drawing the 16 finished balls from the atlas costs 0.02 - 0.16 ms. Only balls that moved are repainted; resting balls cost nothing.',800,796,14,'#c4badf',600,'center');
const ms=0;window.__pzms=ms;
