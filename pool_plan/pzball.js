/* Crooked Cue: reference rolling-ball renderer (prototype for 96e_pz_ballart.js).
   Each ball is drawn per pixel into a small canvas: the visible hemisphere's normal is rotated into the ball's own frame
   (orientation matrix M, 3x3 row-major), which picks the stripe, the white number discs on both poles and the number
   glyph; a fixed lamp light (diffuse + sharp specular + rim) is applied in screen space, so the highlight stays put while
   the stripe and numbers roll underneath it. Only balls that moved are re-rendered. */
const PZB={D:0,img:null,cv:null,glyph:{},shade:null};
const PZCOL={1:[242,194,27],2:[30,79,216],3:[224,38,46],4:[106,42,168],5:[242,122,27],6:[23,138,62],7:[138,26,26],8:[20,18,26]};
function pzbGlyph(n){if(PZB.glyph[n])return PZB.glyph[n];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
 x.font=`800 ${n>9?34:42}px Poppins,sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillStyle='#000';x.fillText(String(n),32,35);
 const d=x.getImageData(0,0,64,64).data,m=new Uint8Array(4096);for(let i=0;i<4096;i++)m[i]=d[i*4+3];return PZB.glyph[n]=m}
/* per-pixel lighting for diameter D, computed once */
function pzbInit(D){PZB.D=D;PZB.cv=document.createElement('canvas');PZB.cv.width=PZB.cv.height=D;PZB.img=PZB.cv.getContext('2d').createImageData(D,D);
 const N=D*D,S=PZB.shade={nx:new Float32Array(N),ny:new Float32Array(N),nz:new Float32Array(N),dif:new Float32Array(N),spe:new Float32Array(N),al:new Float32Array(N)};
 const L=[-.42,-.58,.7],ll=Math.hypot(...L);L[0]/=ll;L[1]/=ll;L[2]/=ll;const H=[L[0],L[1],L[2]+1],hl=Math.hypot(...H);H[0]/=hl;H[1]/=hl;H[2]/=hl;const r=D/2;
 for(let y=0;y<D;y++)for(let x=0;x<D;x++){const i=y*D+x,px=(x+.5-r)/r,py=(y+.5-r)/r,q=px*px+py*py;const d=Math.sqrt(q);S.al[i]=Math.max(0,Math.min(1,(1-d)*r+.5));
  const qq=Math.min(q,1),nz=Math.sqrt(1-qq);S.nx[i]=px;S.ny[i]=py;S.nz[i]=nz;const nd=px*L[0]+py*L[1]+nz*L[2];S.dif[i]=.32+.78*Math.max(0,nd)*(.72+.28*nz);
  const hs=Math.max(0,px*H[0]+py*H[1]+nz*H[2]);S.spe[i]=Math.pow(hs,60)*1.1+Math.pow(hs,8)*.08}}
/* draw ball n with orientation M into g at (cx,cy) */
function pzbDraw(g,n,M,cx,cy){const D=PZB.D,S=PZB.shade,dt=PZB.img.data,stripe=n>8,col=n===0?[246,241,230]:PZCOL[stripe?n-8:n],W=[246,241,230],gl=n>0?pzbGlyph(n):null;
 for(let i=0,N=D*D;i<N;i++){const a=S.al[i];if(a<=0){dt[i*4+3]=0;continue}
  const wx=S.nx[i],wy=S.ny[i],wz=S.nz[i];
  /* local = M^T * w */
  const lx=M[0]*wx+M[3]*wy+M[6]*wz,ly=M[1]*wx+M[4]*wy+M[7]*wz,lz=M[2]*wx+M[5]*wy+M[8]*wz;
  let c=stripe?(Math.abs(ly)<.56?col:W):col;
  const az=Math.abs(lz);
  if(n>0&&az>.86){const u=lx/.5,v=ly/.5;/* disc radius .5 on each pole */if(u*u+v*v<1){c=W;const s=lz>0?1:-1,gx=((u*s*.5+.5)*64)|0,gy=((v*.5+.5)*64)|0;const m=gl[gy*64+gx];if(m>40)c=[20,16,24]}}
  if(n===0&&az>.9&&Math.hypot(lx,ly)<.18)c=[200,40,40];
  const f=S.dif[i],sp=S.spe[i]*255;
  dt[i*4]=Math.min(255,c[0]*f+sp);dt[i*4+1]=Math.min(255,c[1]*f+sp);dt[i*4+2]=Math.min(255,c[2]*f+sp);dt[i*4+3]=a*255}
 PZB.cv.getContext('2d').putImageData(PZB.img,0,0);g.drawImage(PZB.cv,cx-D/2,cy-D/2)}
/* orientation helpers */
const pzbI=()=>[1,0,0,0,1,0,0,0,1];
function pzbRot(M,ax,ay,az,ang){/* M' = R(axis,ang) * M */const c=Math.cos(ang),s=Math.sin(ang),t=1-c;
 const R=[t*ax*ax+c,t*ax*ay-s*az,t*ax*az+s*ay,t*ax*ay+s*az,t*ay*ay+c,t*ay*az-s*ax,t*ax*az-s*ay,t*ay*az+s*ax,t*az*az+c],o=new Array(9);
 for(let r=0;r<3;r++)for(let k=0;k<3;k++)o[r*3+k]=R[r*3]*M[k]+R[r*3+1]*M[3+k]+R[r*3+2]*M[6+k];return o}
/* rolling: a ball moving with velocity (vx,vy) px/s turns about axis (-vy,vx,0)/|v| (screen y down, z toward the viewer) by |v|dt/r */
function pzbRoll(M,vx,vy,dt,r){const v=Math.hypot(vx,vy);if(v<1e-6)return M;return pzbRot(M,-vy/v,vx/v,0,v*dt/r)}

/* ---- optimised path (what the game should use) ----
   pzbInit2(D): precomputes the list of covered pixels with their normal, diffuse and specular terms in typed arrays and
   one atlas canvas holding 16 slots of D x D; pzbPaint(slot,n,M) writes one ball into its slot's ImageData with no
   allocation, then putImageData for that slot only. Drawing a ball = drawImage(atlas, slot rect). */
const PZ2={};
function pzbInit2(D){pzbInit(D);const S=PZB.shade,idx=[];for(let i=0;i<D*D;i++)if(S.al[i]>0)idx.push(i);const n=idx.length;
 const f=k=>{const a=new Float32Array(n);for(let j=0;j<n;j++)a[j]=S[k][idx[j]];return a};
 Object.assign(PZ2,{D,n,idx:Int32Array.from(idx),nx:f('nx'),ny:f('ny'),nz:f('nz'),dif:f('dif'),spe:f('spe'),al:f('al')});
 PZ2.atlas=document.createElement('canvas');PZ2.atlas.width=D*16;PZ2.atlas.height=D;PZ2.ax=PZ2.atlas.getContext('2d');
 PZ2.img=PZ2.ax.createImageData(D,D);PZ2.gm={};for(let k=1;k<16;k++)PZ2.gm[k]=pzbGlyph(k)}
function pzbPaint(slot,n,M){const P=PZ2,d=P.img.data,stripe=n>8,C=n===0?[246,241,230]:PZCOL[stripe?n-8:n],cr=C[0],cg=C[1],cb=C[2],gl=n>0?P.gm[n]:null,
 m0=M[0],m1=M[1],m2=M[2],m3=M[3],m4=M[4],m5=M[5],m6=M[6],m7=M[7],m8=M[8];
 for(let j=0;j<P.n;j++){const wx=P.nx[j],wy=P.ny[j],wz=P.nz[j];
  const lx=m0*wx+m3*wy+m6*wz,ly=m1*wx+m4*wy+m7*wz,lz=m2*wx+m5*wy+m8*wz;
  let r=cr,g2=cg,b=cb;if(stripe&&(ly>.56||ly<-.56)){r=246;g2=241;b=230}
  const az=lz<0?-lz:lz;
  if(n>0&&az>.86){const u=lx*2,v=ly*2;if(u*u+v*v<1){const s=lz>0?1:-1,gx=((u*s*.5+.5)*64)|0,gy=((v*.5+.5)*64)|0;if(gl[gy*64+gx]>40){r=20;g2=16;b=24}else{r=246;g2=241;b=230}}}
  else if(n===0&&az>.9&&lx*lx+ly*ly<.0324){r=200;g2=40;b=40}
  const f=P.dif[j],sp=P.spe[j]*255,o=P.idx[j]*4;d[o]=r*f+sp;d[o+1]=g2*f+sp;d[o+2]=b*f+sp;d[o+3]=P.al[j]*255}
 P.ax.putImageData(P.img,slot*P.D,0)}
function pzbBlit(g,slot,cx,cy,s){const D=PZ2.D,w=s||D;g.drawImage(PZ2.atlas,slot*D,0,D,D,cx-w/2,cy-w/2,w,w)}
