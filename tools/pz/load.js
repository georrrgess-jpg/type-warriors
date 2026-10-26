/* Loads the pure pool modules (96a data, 96b physics, 96c rules, 96d AI) into a Node vm context and returns their functions.
   usage: const Z=require('./load.js'); Z.pzpRun(...) */
const fs=require('fs'),path=require('path'),vm=require('vm');
const D=path.join(__dirname,'..','..','type-warriors-source');
const src=['96a_pz_data.js','96b_pz_phys.js','96c_pz_rules.js','96d_pz_ai.js'].map(f=>fs.readFileSync(path.join(D,f),'utf8')).join('\n');
const names=['PZ_PHY','PZ_TBL','PZ_REG','PZ_ORDER','pzpStrike','pzpStep','pzpRun','pzpRack','pzpCanPlace','pzpNearestPlace','pzRng','pzrNew','pzrJudge','pzrTargets','pzrLeft','pzrOn8','pzrPass','pzMatchNew','pzMatchRack','pzGrp','pzaThink','pzaDecide','pzaPlace','pzaBreak','pzaNoise','pzaCands','pzaKicks','pzClone'];
const ctx=vm.createContext({Math,console,Float32Array,Int32Array,Uint8Array,Object,Array,JSON,Set,Map,Date,TAU:Math.PI*2,P:{}});
vm.runInContext(src,ctx,{filename:'pool-modules'});
module.exports=vm.runInContext('({'+names.join(',')+'})',ctx);
