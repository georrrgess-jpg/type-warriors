/* shared casino frame for the sports concepts (concept only, not part of the build) */
function casFrame(title){
 /* dark tavern-red backdrop like the casino */
 g.fillStyle=lin(0,0,0,900,[[0,'#2a0a14'],[1,'#12040a']]);g.fillRect(0,0,1600,900);
 glow(800,120,700,'rgba(255,140,60,1)',.12);
 for(let i=0;i<14;i++){g.fillStyle=`rgba(255,200,120,${.03+rnd(i)*.03})`;g.fillRect(i*120,0,60,900)}
 /* title plaque */
 g.save();g.fillStyle=lin(0,14,0,78,[[0,'#7a1020'],[1,'#4a0814']]);rr(600,14,400,64,14);g.fill();g.lineWidth=4;g.strokeStyle='#ffd45a';g.stroke();g.lineWidth=2;g.strokeStyle=O;rr(596,10,408,72,16);g.stroke();g.restore();
 ttl(title,800,62,44,'#ffd45a','center');
 g.fillStyle='#ffd45a';[620,980].forEach(x=>{g.save();g.translate(x,46);g.rotate(Math.PI/4);g.fillRect(-6,-6,12,12);g.restore()});
 /* lobby + balance */
 g.save();g.fillStyle='#8a1020';rr(60,20,124,48,12);g.fill();g.lineWidth=3;g.strokeStyle='#ffb0a0';g.stroke();g.restore();txt('‹ Lobby',122,52,20,'#fff',700,'center');
 g.save();g.fillStyle='rgba(30,8,14,.9)';rr(1330,18,210,52,26);g.fill();g.lineWidth=3;g.strokeStyle='#ffd45a';g.stroke();g.restore();
 coin(1358,44,18);ttl('48,950',1500,58,30,'#ffe9a8','right')}
function coin(x,y,r){g.save();g.fillStyle=lin(x-r,y-r,x+r,y+r,[[0,'#fff1a0'],[.5,'#ffc93a'],[1,'#c07a10']]);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.lineWidth=2;g.strokeStyle=O;g.stroke();g.restore()}
function betBar(y,label,bet){g.save();g.fillStyle='rgba(60,10,24,.92)';rr(110,y,1380,86,18);g.fill();g.lineWidth=3;g.strokeStyle='#c99a3a';g.stroke();g.restore();
 ttl(label||'Bet',300,y+54,30,'#ffe9a8','right');ttl(bet||'1,000',318,y+54,30,'#ffd45a');txt('max 5,000',440,y+52,18,'#e8b878',700);
 const ch=[['10','#3a3a9a'],['50','#2a6a3a'],['100','#9a2a2a'],['500','#6a2a9a'],['1K','#2a2a2a'],['5K','#b06a1a']];
 ch.forEach(([t,c],i)=>{const x=580+i*72,yy=y+43;g.save();g.fillStyle=c;g.beginPath();g.arc(x,yy,28,0,TAU);g.fill();g.setLineDash([6,5]);g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(x,yy,24,0,TAU);g.stroke();g.setLineDash([]);g.lineWidth=2;g.strokeStyle=O;g.beginPath();g.arc(x,yy,28,0,TAU);g.stroke();g.restore();ttl(t,x,yy+8,20,'#fff','center')})}
function gbtn(x,y,w,h,label,sub,col,dark){g.save();g.fillStyle=lin(x,y,x,y+h,col||[[0,'#ffe37a'],[1,'#e8a018']]);rr(x,y,w,h,14);g.fill();g.lineWidth=3;g.strokeStyle=O;g.stroke();g.fillStyle='rgba(255,255,255,.25)';rr(x+6,y+5,w-12,h*.35,10);g.fill();g.restore();
 if(sub){ttl(label,x+w/2,y+h/2+4,Math.min(30,h*.42),dark?'#3a1a04':'#fff','center');txt(sub,x+w/2,y+h-9,15,dark?'#5a2a04':'#fff',800,'center')}else ttl(label,x+w/2,y+h/2+11,30,dark?'#3a1a04':'#fff','center')}
function pill(x,y,w,t,col){g.save();g.fillStyle='rgba(40,8,16,.9)';rr(x-w/2,y-20,w,40,20);g.fill();g.lineWidth=2;g.strokeStyle=col||'#c99a3a';g.stroke();g.restore();txt(t,x,y+7,19,'#ffe9a8',700,'center')}
function mon(id,x,y,s,flip,t){g.save();g.translate(x,y);g.scale(flip?-s:s,s);MON[id](t||0);g.restore()}
