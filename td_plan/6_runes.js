// {"map":"moss","wave":6,"towers":[[2,"ballista",3],[5,"frost",2],[4,"brazier",2]],"secs":12}
/* selected ballista with a socket panel above it */
const p=padAt(2);g.save();g.strokeStyle='#ffd45a';g.lineWidth=4;g.beginPath();g.ellipse(p.x,p.y+22,62,22,0,0,TAU);g.stroke();g.restore();
/* flaming bolt flying from it */
g.save();g.strokeStyle='rgba(255,140,40,.8)';g.lineWidth=6;g.beginPath();g.moveTo(p.x+30,p.y-60);g.lineTo(p.x+140,p.y-150);g.stroke();g.restore();glow(p.x+140,p.y-150,50,'rgba(255,140,40,1)',.9);
for(let i=0;i<6;i++){g.fillStyle=`rgba(255,${200-i*20},60,${.7-i*.1})`;g.beginPath();g.arc(p.x+130-i*14,p.y-140+i*11,9-i,0,TAU);g.fill()}
const rune=(x,y,r,col,glyph,on)=>{g.save();if(on)glow(x,y,r*2,col,.7);g.fillStyle=on?lin(x-r,y-r,x+r,y+r,[[0,'#fff'],[.4,col],[1,'#1a0a2a']]):'rgba(255,255,255,.06)';g.beginPath();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.fill();g.lineWidth=3;g.strokeStyle=on?O:'rgba(255,255,255,.4)';g.stroke();if(glyph){g.fillStyle=on?O:'rgba(255,255,255,.5)';g.font='bold '+Math.round(r*.9)+'px serif';g.textAlign='center';g.fillText(glyph,x,y+r*.32)}g.restore()};
/* socket panel */
const X=p.x+40,Y=p.y-330;panel(X,Y,420,250,'#ffb04a');ttl('Rune Ballista · T3',X+20,Y+44,26,'#ffd45a');txt('RUNE SOCKETS',X+20,Y+74,13,'#ffb070',900);
rune(X+70,Y+124,36,'#ff8a3a','ᚲ',true);rune(X+160,Y+124,36,'#9fe8ff','ᛁ',false);txt('T3: socket 1 · T5: socket 2',X+20,Y+184,12,'#c4badf',700);
g.save();g.fillStyle='rgba(255,140,40,.15)';rr(X+220,Y+92,184,70,12);g.fill();g.lineWidth=2;g.strokeStyle='#ffb04a';g.stroke();g.restore();txt('Ember rune',X+232,Y+116,15,'#ffd45a',900);txt('bolts set targets on fire',X+232,Y+136,12,'#ffe9a8',700);txt('(burn 30/s for 3 s)',X+232,Y+152,12,'#ffe9a8',700);
txt('Rune bag',X+20,Y+212,13,'#ffb070',900);[['#9fe8ff','ᛁ'],['#7dff9a','ᚱ'],['#c8b0ff','ᛟ'],['#ffd45a','ᛋ']].forEach(([c,gl],i)=>rune(X+120+i*56,Y+218,20,c,gl,true));
g.save();g.strokeStyle='rgba(255,212,90,.8)';g.lineWidth=3;g.setLineDash([6,6]);g.beginPath();g.moveTo(X+176,Y+218);g.quadraticCurveTo(X+200,Y+170,X+160,Y+150);g.stroke();g.restore();txt('drag',X+196,Y+196,11,'#ffd45a',900);
infoCard(1060,150,500,600,'Rune Forge','#ffb04a','NEW FEATURE');
g.save();g.beginPath();rr(1080,220,460,150,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();g.clip();[['#ff8a3a','ᚲ','Ember'],['#9fe8ff','ᛁ','Frost'],['#7dff9a','ᚱ','Venom'],['#c8b0ff','ᛟ','Echo'],['#ffd45a','ᛋ','Storm']].forEach(([c,gl,n],i)=>{rune(1130+i*90,285,32,c,gl,true);txt(n,1130+i*90,345,13,'#ffe9a8',900,'center')});g.restore();
let yy=400;
yy=bullet(1084,yy,470,'Runes drop from bosses and elite waves','Keep them between runs in your Rune Bag; fuse 3 of a kind into a stronger one.','#ffb04a');
yy=bullet(1084,yy,470,'Every rune changes every tower differently','Ember on Ballista: burning bolts. Frost on Tidecaller: freezing waves. Storm on Mortar: chain lightning shells. Echo on Bell: every 3rd strike repeats.','#ffb04a');
yy=bullet(1084,yy,470,'Two sockets per tower','T3 opens the first socket, T5 the second. Two matching runes awaken a hidden "resonance" effect.','#ffb04a');
yy=bullet(1084,yy,470,'Free to swap between waves','Mid-wave swaps cost supply.','#ffb04a');
txt('35 rune and tower combinations to discover',1310,736,13,'#c4badf',700,'center');
