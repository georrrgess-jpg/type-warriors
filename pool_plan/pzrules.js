/* Crooked Cue: reference 8-ball rules (prototype for 96c_pz_rules.js). Tavern rules, written to be unambiguous:
   - Break: legal if a ball is pocketed or 4+ object balls reach a cushion. Illegal break or scratch = foul.
     8 on the break without a scratch = GOLDEN BREAK (breaker wins the rack). 8 on the break with a scratch = the 8 is spotted,
     opponent has ball in hand behind the head string. The table is always open after the break.
   - Open table: the first ball hit may be any ball except the 8. The first legally pocketed ball (after the break) sets groups.
   - Groups set: the first ball hit must be your group (or the 8 once your group is gone).
   - Foul: scratch, no ball hit, wrong ball first, or no cushion touched after contact while nothing was pocketed.
     Opponent gets ball in hand anywhere (behind the head string only after a break scratch). Balls pocketed on a foul stay down.
   - You keep shooting while you legally pocket one of yours (any ball on an open table).
   - The 8: once your group is gone you call a pocket for the 8. Legal 8 in the called pocket = win the rack.
     8 in another pocket, 8 before your group is cleared, or 8 together with a foul = lose the rack. */
const SOL=b=>b>=1&&b<=7,STR=b=>b>=9&&b<=15,grpOf=b=>SOL(b)?'s':STR(b)?'t':null;
function pzrNew(B,breaker){return {B,turn:breaker,grp:[null,null],open:true,brk:true,bih:false,kitchen:false,over:null,call:null,golden:false,inn:[0,0],fouls:[0,0]}}
function pzrLeft(st,p){const g=st.grp[p];if(!g)return 7;return st.B.filter(b=>b.on&&grpOf(b.id)===g).length}
/* legal first-contact targets for the player to move */
function pzrTargets(st){const p=st.turn,g=st.grp[p],on=st.B.filter(b=>b.on&&b.id);if(st.open||!g){const t=on.filter(b=>b.id!==8).map(b=>b.id);return t.length?t:[8]}
 const mine=on.filter(b=>grpOf(b.id)===g).map(b=>b.id);return mine.length?mine:[8]}
/* (open table with only the 8 left cannot happen in practice; pzrTargets then returns [] and the AI hits the 8, which is legal) */
/* judge a finished shot. ev = physics events; returns {foul,reason,keep,win,lose} and updates st */
function pzrJudge(st,ev){const p=st.turn,o=1-p,B=st.B;let first=null,railAfter=false,cuOb=new Set();
 for(const e of ev){if(e.t==='bb'&&first===null&&(e.a===0||e.b===0))first=e.a===0?e.b:e.a;if(e.t==='cu'){if(first!==null)railAfter=true;if(e.a)cuOb.add(e.a)}}
 const pk=ev.filter(e=>e.t==='pk').map(e=>e.a),scratch=pk.includes(0),objPk=pk.filter(b=>b);const eightIn=objPk.includes(8);
 const r={foul:false,reason:'',keep:false,win:null,pk:objPk,first,scratch};
 const finish=(winner,why)=>{st.over={winner,why};r.win=winner;return r};
 if(st.brk){st.brk=false;
  const legal=objPk.length>0||cuOb.size>=4;
  if(eightIn&&!scratch){st.golden=true;return finish(p,'golden')}
  if(eightIn&&scratch){const e=B.find(b=>b.id===8);e.on=true;e.x=880*.75;e.y=220;}
  if(scratch||!legal){r.foul=true;r.reason=scratch?'scratch on the break':'illegal break';st.bih=true;st.kitchen=true;st.turn=o;st.fouls[p]++;return r}
  r.keep=objPk.length>0;if(!r.keep){st.turn=o;st.inn[o]++}return r}
 /* legality is judged against the table as it was before the shot (balls pocketed by this shot count as still there) */
 const gp=st.grp[p],mineBefore=gp&&!st.open?B.filter(b=>b.id&&grpOf(b.id)===gp&&(b.on||objPk.includes(b.id))).length:7;
 const legalFirst=id=>st.open||!gp?(id!==8||B.filter(b=>b.id&&b.id!==8&&(b.on||objPk.includes(b.id))).length===0):mineBefore>0?grpOf(id)===gp:id===8;
 if(scratch){r.foul=true;r.reason='scratch'}
 else if(first===null){r.foul=true;r.reason='no ball hit'}
 else if(!legalFirst(first)){r.foul=true;r.reason='wrong ball first'}
 else if(!railAfter&&objPk.length===0){r.foul=true;r.reason='no cushion after contact'}
 if(eightIn){const was=!st.open&&gp&&mineBefore===0;
  const pocketOk=st.call==null||ev.find(e=>e.t==='pk'&&e.a===8).p===st.call;
  if(r.foul)return finish(o,'8 with a foul');if(!was||st.open)return finish(o,'8 too early');if(!pocketOk)return finish(o,'8 in the wrong pocket');return finish(p,'8 ball')}
 if(r.foul){st.bih=true;st.kitchen=false;st.turn=o;st.inn[o]++;st.fouls[p]++;return r}
 /* groups */
 if(st.open){const g=objPk.map(grpOf).find(x=>x);if(g){st.grp[p]=g;st.grp[o]=g==='s'?'t':'s';st.open=false}}
 const mineIn=objPk.some(b=>st.grp[p]?grpOf(b)===st.grp[p]:b!==8);
 r.keep=mineIn;if(!r.keep){st.turn=o;st.inn[o]++}st.bih=false;return r}
if(typeof module!=='undefined')module.exports={pzrNew,pzrJudge,pzrTargets,pzrLeft,grpOf};
