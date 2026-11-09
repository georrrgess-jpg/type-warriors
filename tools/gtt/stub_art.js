/* THROWAWAY stub of the Turkey Trot art contract (agent C's test scaffold, never shipped). */
(function(W){
if(typeof W.gttDrawRace==='function')return;
const col=id=>{const r=GTT_RUN.find(x=>x.id===id);return r?r.col[0]:'#c87a2a'};
W.gttBake=()=>{};
W.gttPortrait=(cv,id,t)=>{const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);c.fillStyle=col(id);c.beginPath();c.arc(60,56+Math.sin(t*6)*2,28,0,7);c.fill();c.strokeStyle='#12081f';c.lineWidth=4;c.stroke()};
W.gttDrawTurkey=(c,id,x,y,s)=>{c.fillStyle=col(id);c.beginPath();c.arc(x,y,20*s,0,7);c.fill()};
W.gttCam=(st,prev)=>{const lead=Math.max(...st.run.map(q=>q.x));return{x:Math.max(0,lead-200),zoom:1}};
W.gttDrawRace=(c,st,cam,o)=>{c.fillStyle='#2a1a5a';c.fillRect(0,0,1600,900);c.fillStyle='#6a4a2a';c.fillRect(0,420,1600,480);c.font='28px sans-serif';
 st.run.forEach((q,i)=>{const x=200+(q.x-cam.x)*1.4,y=460+i*60;c.fillStyle=col(q.id);c.beginPath();c.arc(x,y,24,0,7);c.fill();c.fillStyle='#fff';c.fillText(String(i+1),x-8,y+9)})};
W.gttDrawPodium=(c,st,t)=>{c.fillStyle='#2a1a5a';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.fillStyle='#ffd45a';c.font='60px sans-serif';c.fillText('PODIUM '+(st.order||[]).join(','),100,300)};
W.gttPhoto=(c,t,st)=>{c.fillStyle='#8a6a3a';c.fillRect(0,0,1600,900);c.fillStyle='#fff';c.font='80px sans-serif';c.fillText('PHOTO '+t.toFixed(1),500,450)};
W.gttTile=()=>{TA.gtt='<svg viewBox="0 0 320 176"><rect width="320" height="176" fill="#2a1a5a"/><circle cx="160" cy="88" r="40" fill="#c87a2a"/></svg>'};
})(window);
