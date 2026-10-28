/* TD concept helpers: a pad-mounted tower is drawn at (x,y) = the pad centre, base on the pad */
function padAt(i){return window.__pads[i]}
function rangeRing(x,y,r,col){g.save();g.strokeStyle=col||'rgba(159,232,255,.8)';g.lineWidth=3;g.setLineDash([12,8]);g.beginPath();g.ellipse(x,y,r,r*.75,0,0,TAU);g.stroke();g.setLineDash([]);g.fillStyle=(col||'rgba(159,232,255,1)').replace(/[\d.]+\)$/,'.08)');g.beginPath();g.ellipse(x,y,r,r*.75,0,0,TAU);g.fill();g.restore()}
function stone(x,y,w,h,c1,c2){g.save();g.fillStyle=lin(x,y,x,y+h,[[0,c1||'#d8d0e8'],[1,c2||'#8a80a8']]);rr(x,y,w,h,8);g.fill();g.lineWidth=4;g.strokeStyle=O;g.stroke();g.restore()}
function plinth(x,y,c){/* the shared tower base: a round stone plinth with gold trim */g.save();g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+6,58,20,0,0,TAU);g.fill();
 g.fillStyle=lin(x-54,y-20,x+54,y+12,[[0,'#cfc6e2'],[1,'#7c7298']]);g.beginPath();g.ellipse(x,y-4,54,18,0,0,TAU);g.fill();g.fillRect(x-54,y-18,108,14);g.beginPath();g.ellipse(x,y-18,54,18,0,0,TAU);g.fill();
 g.lineWidth=4;g.strokeStyle=O;g.beginPath();g.ellipse(x,y-4,54,18,0,0,Math.PI);g.stroke();g.beginPath();g.moveTo(x-54,y-18);g.lineTo(x-54,y-4);g.moveTo(x+54,y-18);g.lineTo(x+54,y-4);g.stroke();
 g.fillStyle=c||'#e8e0f4';g.beginPath();g.ellipse(x,y-18,54,18,0,0,TAU);g.fill();g.stroke();g.strokeStyle='#ffd45a';g.lineWidth=3;g.beginPath();g.ellipse(x,y-18,44,13,0,0,TAU);g.stroke();
 for(let i=0;i<6;i++){const a=i/6*TAU;g.fillStyle='#ffd45a';g.beginPath();g.arc(x+Math.cos(a)*44,y-18+Math.sin(a)*13,3,0,TAU);g.fill()}g.restore()}
function infoCard(x,y,w,h,title,col,tag){panel(x,y,w,h,col);ttl(title,x+22,y+52,36,'#ffd45a');if(tag){g.save();g.fillStyle=col;rr(x+w-150,y+20,128,30,15);g.fill();g.restore();txt(tag,x+w-86,y+41,14,O,900,'center')}}
function bullet(x,y,w,head,body,col){txt('◆',x,y,14,col||'#ffd45a',900);txt(head,x+20,y,16,'#ffe9a8',800);if(body){const words=body.split(' ');let line='',yy=y+21;g.save();g.font=font(600,14);for(const wd of words){if(g.measureText(line+wd).width>w-20){txt(line,x+20,yy,14,'#c4badf',600);line='';yy+=19}line+=wd+' '}g.restore();txt(line,x+20,yy,14,'#c4badf',600);return yy+28}return y+26}
function tierRow(x,y,list){list.forEach((t,i)=>{g.save();g.fillStyle=i===4?'rgba(255,212,90,.25)':'rgba(255,255,255,.07)';rr(x+i*76,y,70,26,8);g.fill();g.restore();txt('T'+(i+1),x+i*76+10,y+18,12,'#ffd45a',900);txt(t,x+i*76+62,y+18,11,'#e8e0ff',700,'right')})}
/* a knight hero, feet at (x,y) */
function knight(x,y,s,swing){g.save();g.translate(x,y);g.scale(s,s);g.lineWidth=4;g.strokeStyle=O;
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,4,30,9,0,0,TAU);g.fill();
 /* cape */g.fillStyle=lin(-30,-90,30,0,[[0,'#d02a3a'],[1,'#7a0a1a']]);g.beginPath();g.moveTo(-14,-80);g.quadraticCurveTo(-40,-30,-30,0);g.lineTo(26,0);g.quadraticCurveTo(30,-40,14,-80);g.closePath();g.fill();g.stroke();
 /* legs */g.fillStyle='#8a90a8';rr(-14,-30,11,30,4);g.fill();g.stroke();rr(3,-30,11,30,4);g.fill();g.stroke();
 /* body armour */g.fillStyle=lin(-20,-84,20,-28,[[0,'#e8ecf8'],[1,'#8a90a8']]);rr(-20,-82,40,54,12);g.fill();g.stroke();g.fillStyle='#ffd45a';g.fillRect(-20,-50,40,6);g.strokeRect(-20,-50,40,6);
 /* helmet */g.fillStyle=lin(-18,-122,18,-82,[[0,'#f4f6ff'],[1,'#9aa0b8']]);g.beginPath();g.arc(0,-100,20,0,TAU);g.fill();g.stroke();g.fillStyle=O;g.fillRect(-12,-102,24,5);
 g.fillStyle='#d02a3a';g.beginPath();g.moveTo(0,-120);g.quadraticCurveTo(26,-140,30,-112);g.quadraticCurveTo(14,-122,0,-116);g.fill();g.stroke();
 /* shield */g.fillStyle=lin(-40,-80,-14,-30,[[0,'#3a6ad8'],[1,'#1a3a8a']]);g.beginPath();g.moveTo(-40,-76);g.lineTo(-14,-76);g.lineTo(-14,-46);g.quadraticCurveTo(-27,-30,-40,-46);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd45a';g.beginPath();g.arc(-27,-60,6,0,TAU);g.fill();
 /* sword */g.save();g.translate(18,-64);g.rotate(swing||-.6);g.fillStyle='#e8ecf8';g.beginPath();g.moveTo(-4,0);g.lineTo(-4,-60);g.lineTo(0,-70);g.lineTo(4,-60);g.lineTo(4,0);g.closePath();g.fill();g.stroke();g.fillStyle='#ffd45a';g.fillRect(-12,-2,24,6);g.strokeRect(-12,-2,24,6);g.restore();
 g.restore()}
