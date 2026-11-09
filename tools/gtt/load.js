// Loads the Turkey Trot logic modules into one vm context (they are plain top-level declarations, no DOM).
const fs=require('fs'),path=require('path');
module.exports=function(){
  const d=path.join(__dirname,'..','..','type-warriors-source');
  const src=['99u_gtt_data.js','99u2_gtt_sim.js'].map(f=>fs.readFileSync(path.join(d,f),'utf8')).join('\n');
  const names='GTT,GTT_RUN,GTT_IDX,GTT_SAY,GTTM,gttNorm,gttCard,gttRng,gttSimNew,gttStep,gttRun,gttFork,gttForkInto,gttAdv,gttReseed,gttKFor,gttPriceSync,gttPrice,gttLiveP,gttLiveAll,gttOffer,gttOffers,gttSettle,gttMultFor,gttMix,gttHash,gttNeed,gttHit,gttCoOpen,gttStepMult,gttBetOk,gttSayFmt,GTT_GOING,GTT_WEATHER'.split(',');
  return new Function('performance',src+'\n;return {'+names.join(',')+'};')({now:()=>Date.now()})};
