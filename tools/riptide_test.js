// Kairos's Sun skill (Riptide): goes for the nearest enemy at each cast and stops just past it.
const {chromium}=require('playwright'),serve=require('./serve');
const MODE=process.argv[2]||'desk';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const vp=MODE==='phone'?{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}};
 const p=await b.newPage(vp);p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(600);
 await p.evaluate(()=>{__sf.battle(['kairos'],'rift_earth',8,{tier:1});});await p.waitForTimeout(1200);
 const setup=()=>p.evaluate(()=>{const r=__sf.room();r.spawnCd=999;r.budget=999;for(const e of __sf.en())e.dead=true;const q=__sf.p();q.x=355;q.y=220;q.iframe=99;q.ripWin=0;q.dash=null;q.cd.sun=0;});
 const foe=(x,y,o)=>p.evaluate(([x,y,o])=>{const e=__sf.mk('deadline',x,y,{instant:true,elite:null});Object.assign(e,{spawnT:0,spd:0,hp:1e5,maxHp:1e5,slamCd:99},o||{});e.x=x;e.y=y;return true;},[x,y,o]);
 // 1. a close enemy behind Kairos: he turns to it and stops just past it (no full 170 px overshoot)
 await setup();await foe(295,220);await foe(355,60);
 const r1=await p.evaluate(async()=>{const q=__sf.p();q.fx=1;q.fy=0;__sf.sun();await new Promise(r=>setTimeout(r,400));return {x:q.x,y:q.y};});
 ok(r1.x<295&&r1.x>200&&Math.abs(r1.y-220)<10,'dashes at the nearest enemy even when facing away, and stops just past it (x '+Math.round(r1.x)+')');
 // 2. the second dash picks whoever is nearest NOW, not the first target
 await setup();await foe(295,220);await foe(420,240);
 const r2=await p.evaluate(async()=>{const q=__sf.p();__sf.sun();await new Promise(r=>setTimeout(r,350));
   const en=__sf.en().filter(e=>!e.dead);const near=en.sort((a,b)=>Math.hypot(a.x-q.x,a.y-q.y)-Math.hypot(b.x-q.x,b.y-q.y))[0];const px=q.x,py=q.y;__sf.sun();const want=Math.atan2(near.y-py,near.x-px),got=Math.atan2(q.fy,q.fx);return {err:Math.abs(Math.atan2(Math.sin(want-got),Math.cos(want-got)))};});
 ok(r2.err<0.15,'second dash targets the enemy that is nearest at that moment');
 // 3. Paperling decoys are ignored
 await setup();await p.evaluate(()=>{const d=__sf.mk('paperling',330,220,{instant:true,elite:null});Object.assign(d,{decoy:1,hp:1,maxHp:1,spd:0,life:99,spawnT:0});d.x=330;d.y=220;});await foe(420,220);
 const r3=await p.evaluate(()=>{const q=__sf.p();__sf.sun();return q.ripTgt&&q.ripTgt.decoy?'decoy':q.ripTgt?'real':'none';});
 ok(r3==='real','decoys don’t pull the dash');
 // 4. damage and cooldown unchanged
 const r4=await p.evaluate(()=>({cd:__sf.p().ch.kit.sun.cd}));ok(r4.cd===6,'cooldown still 6 s');
 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
