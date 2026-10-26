/* node tools/pz/trickq.js 'JSON array of {balls,cue,goal}' : quick check of candidate layouts (windows at power .5/.7/.9, no spin; lazy shot) */
const Z=require('./load.js'),{shoot,analyse}=require('./trick.js');
const L=JSON.parse(process.argv[2]);
L.forEach((t,i)=>{const f=t.balls[0],lazy=shoot(t,Math.atan2(f[2]-t.cue[1],f[1]-t.cue[0]),.6,0,0);const res=analyse(t,[.5,.7,.9],[[0,0]],.006);
 console.log(`#${i} lazy=${lazy.ok?'WINS':'fails ('+lazy.why+')'} windows:`,res.slice(0,3).map(r=>`${r.w.toFixed(1)}deg@${r.mid.toFixed(0)} pow${r.p}`).join(' | ')||'none')});
