tavern({floor:760,lights:true});g.fillStyle='rgba(10,4,20,.72)';g.fillRect(0,40,1600,104);
ttl('The Regulars of the Crooked Cue',800,92,58,'#ffd45a','center');txt('Beat a regular to earn a seat at the next table. The Shade turns up when he smells money.',800,128,18,'#e8dcff',500,'center');
const keys=['gloop','moldwick','grizzle','vesper','barnacle','hootsworth','mortimer','shade'];
keys.forEach((k,i)=>{const c=i%4,r=Math.floor(i/4),x=40+c*388,y=160+r*368,w=364,h=350,M=MONINFO[k];
 g.save();g.fillStyle='rgba(18,10,40,.9)';rr(x,y,w,h,22);g.fill();g.lineWidth=4;g.strokeStyle=M.c;g.stroke();g.restore();
 g.save();rr(x+6,y+6,w-12,h-110,18);g.clip();const q=g.createRadialGradient(x+w/2,y+150,10,x+w/2,y+150,240);q.addColorStop(0,mix('#3a2a6a',M.c,.25));q.addColorStop(1,'#140a2a');g.fillStyle=q;g.fillRect(x,y,w,h);
 g.save();g.translate(x+w/2,y+h-104);g.scale(.62,.62);cue(170,-380,2.0,0,{c:mix('#3a1a1a',M.c,.4),d:M.c,wrap:'#1a1030'});g.restore();g.translate(x+w/2,y+h-104);g.scale(.62,.62);MON[k](0);g.restore();
 g.fillStyle='rgba(10,6,24,.95)';rr(x+6,y+h-104,w-12,98,16);g.fill();
 ttl(M.n,x+18,y+h-66,30,M.c);txt(M.k,x+18,y+h-42,14,'#c4badf',600);
 txt('Stakes '+M.st,x+18,y+h-18,14,'#efe8ff',700);txt(M.pay,x+w-18,y+h-18,16,'#ffd45a',800,'right');
 if(M.lvl){for(let s=0;s<7;s++){g.fillStyle=s<M.lvl?'#ffd45a':'rgba(255,255,255,.15)';g.beginPath();const sx=x+w-24-s*16,sy=y+24;for(let j=0;j<10;j++){const a=j/10*TAU-Math.PI/2,rr2=j%2?3:7;g.lineTo(sx+Math.cos(a)*rr2,sy+Math.sin(a)*rr2)}g.closePath();g.fill()}}
 else{g.fillStyle='#ffe066';rr(x+w-130,y+14,116,26,10);g.fill();txt('RANDOM VISIT',x+w-72,y+32,12,'#2a1a04',800,'center')}
});
