// Forgotten Memory (Lucas, R9) with The Memory That Carried Him as a non-combat presence (Option A).
// The fight itself must be identical: kill goal, pool, the three lines in order, slow time + attack per beat, the finish.
const {chromium}=require('playwright'),serve=require('./serve');
const MODE=process.argv[2]||'desk';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const vp=MODE==='phone'?{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}};
 const p=await b.newPage(vp);p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(700);
 const LINES=['Bread, still warm. Someone laughing with his mouth full.','Someone counting to sixty under a blanket. Out loud. For him.','Smoke. A hand that won’t let go.'];
 await p.evaluate(()=>{__sf.mission('lucas_alone',['lucan']);});await p.waitForTimeout(1500);
 const def=await p.evaluate(()=>{const r=__sf.room();return {kind:r.def.kind,mission:r.def.mission};});
 ok(def.mission==='lucas_alone','Forgotten Memory starts');
 const M=await p.evaluate(()=>{const r=__sf.room();return {pool:r.def.pool,brief:r.def.ruleText};});
 ok(JSON.stringify(M.pool)===JSON.stringify(['collector','gossip','gossip']),'enemy pool unchanged ('+M.pool+')');
 // play it out: kill one at a time, watch the beats
 const log=await p.evaluate(async()=>{const out={beats:[],buffs:[],drops:[],targets:[],stamp:null,kills:0};
   window.__ban=[];const q=__sf.p();q.iframe=999;
   for(let i=0;i<80;i++){const r=__sf.room();if(!r||!r.m)break;const m=r.m;
     q.hp=q.maxHp;q.iframe=999;
     for(const e of __sf.en())if(!e.dead&&e.spawnT<=0){__sf.hit(e,99999,{src:q});out.kills++;break;}
     await new Promise(res=>setTimeout(res,120));
     if((m.memPh|0)>out.beats.length){out.beats.push(r.bannerSub);out.buffs.push(+__sf.team().atkBuffV.toFixed(2));out.drops=(m.mdrops||[]).map(d=>d.k);}
     out.targets.push(__sf.en().some(e=>e.type==='memory'||e.memoryPresence));
     if(m.cupRoll)out.cup=true;if(__sf.st()!=='play'){out.stamp=__sf.st();break;}}
   return out;});
 ok(log.beats.length===3&&log.beats.every((t,i)=>t===LINES[i]),'the three memory lines play in order, unchanged');
 ok(JSON.stringify(log.buffs)===JSON.stringify([0.1,0.2,0.3]),'each memory still gives +10% attack, stacking ('+log.buffs+')');
 ok(JSON.stringify(log.drops)===JSON.stringify(['bread','blanket','cup']),'the Memory drops the bread, the blanket corner, then the cup ('+log.drops+')');
 ok(!log.targets.some(Boolean),'the Memory is never an enemy or a target');
 ok(log.cup,'at the end the cup rolls toward Lucas');
 ok(log.kills>=12&&log.stamp&&log.stamp!=='play','the fight still ends on its kill goal ('+log.kills+' kills, state '+log.stamp+')');
 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
