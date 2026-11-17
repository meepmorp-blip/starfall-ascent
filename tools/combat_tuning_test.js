// Combat tuning checks: St. Lucia's Ward patients (Tiers I-III), Kairos's Riptide targeting, Entrance feedback for all 8.
// SF_PAGE=file.html runs the ward part against another copy of the game (for old/new comparison).
const {chromium,devices}=require('playwright'),serve=require('./serve');
const PAGE=process.env.SF_PAGE||'',ONLY=process.env.SF_ONLY||'';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const open=async(vp)=>{const ctx=await b.newContext(vp);const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
  await p.goto(url+PAGE);await p.waitForTimeout(700);return p;};
 const desk={viewport:{width:1280,height:720}};
 // ── 1. Ward: player parked in a corner (invulnerable, not fighting); patients take whatever reaches them.
 if(!ONLY||ONLY==='ward'){const p=await open(desk);
  for(const tier of [1,2,3]){const runs=[];
   for(let r=0;r<3;r++){
    await p.evaluate(t=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:t});},tier);await p.waitForTimeout(400);
    const res=await p.evaluate(async()=>{const t0=performance.now();let maxCh=0,hp=100;
     while(performance.now()-t0<40000){const q=__sf.p(),rm=__sf.room();if(!rm||!rm.obj)break;q.x=90;q.y=150;q.iframe=9;for(const m of __sf.team().members)m.hp=m.maxHp;
      let c=0;for(const e of __sf.en())if(e.rt&&!e.dead)c++;maxCh=Math.max(maxCh,c);hp=rm.obj.hp;if(hp<=0)break;
      await new Promise(r=>setTimeout(r,100));}
     return {sec:(performance.now()-t0)/1000,hp,maxCh};});
    runs.push(res);}
   const avg=runs.reduce((a,r)=>a+r.sec,0)/runs.length;
   console.log('WARD tier '+tier+': unattended patients fall in '+runs.map(r=>r.hp<=0?r.sec.toFixed(1)+'s':'>40s ('+Math.round(r.hp)+'%)').join(', ')+' · max chasers '+Math.max(...runs.map(r=>r.maxCh)));
   if(!PAGE)ok(runs.every(r=>r.maxCh<=3),'tier '+tier+': at most 3 Vices chase the patients');
  }
  if(!PAGE){const fr=await p.evaluate(()=>{const d=__sf.room();return d&&d.def.drop;});ok(fr==='Water Fragments','Water Fragments drop kept');}
  await p.context().close();}
 if(PAGE){console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();return;}
 // ── 2. Riptide (Kairos's Sun skill)
 if(!ONLY||ONLY==='sun'){const p=await open(desk);
  await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:1});});await p.waitForTimeout(6000);
  const r=await p.evaluate(async()=>{const q=__sf.p();q.iframe=99;const es=__sf.en().filter(e=>!e.dead);
   for(const e of __sf.en())e.dead=true;
   // three live targets; Kairos faces AWAY from the nearest one
   const mk=(i,dx,dy)=>{const e=es[i];e.dead=false;e.spawnT=0;e.hp=e.maxHp=99999;e.x=q.x+dx;e.y=q.y+dy;e.spd=0;return e;};
   q.x=640;q.y=200;q.fx=1;q.fy=0;const A=mk(0,-120,0),B=mk(1,180,0),C=mk(2,0,215);
   const d=[];__sf.sun();d.push({tgt:q.ripTgt===A,win:q.ripWin});
   await new Promise(r=>setTimeout(r,450));
   // nearest dies: next dash must take the next nearest from where Kairos now stands
   A.dead=true;const near=[B,C].sort((m,n)=>Math.hypot(m.x-q.x,m.y-q.y)-Math.hypot(n.x-q.x,n.y-q.y))[0];
   const px=q.x,py=q.y;__sf.sun();const ax=Math.atan2(near.y-py,near.x-px),af=Math.atan2(q.fy,q.fx);d.push({tgt:Math.abs(Math.atan2(Math.sin(ax-af),Math.cos(ax-af)))<0.15,win:q.ripWin,near:near===B?"B":"C"});
   // repeated first dashes from the same spot always pick the same (nearest) enemy
   const picks=new Set();for(let i=0;i<6;i++){q.ripWin=0;q.ripTgt=null;q.x=640;q.y=200;q.fx=Math.cos(i);q.fy=Math.sin(i);B.x=820;B.y=200;C.x=640;C.y=415;__sf.sun();picks.add(q.ripTgt===B?'B':q.ripTgt===C?'C':'?');q.dash=null;}
   return {d,picks:[...picks]};});
  ok(r.d[0].tgt,'1st dash goes to the nearest enemy even when facing away');
  ok(Math.abs(r.d[0].win-2.5)<0.05,'2nd-dash window 2.5s (was 3s): '+r.d[0].win);
  console.log(JSON.stringify(r.d[1]));ok(r.d[1].tgt,'target died → 2nd dash takes the next nearest');
  ok(r.picks.length===1&&r.picks[0]==='B','same spot, any facing → same nearest target ('+r.picks.join(',')+')');
  await p.context().close();}
 // ── 3. Entrances, desktop and phone
 if(!ONLY||ONLY==='ent'){
  for(const [lab,vp] of [['desktop',desk],['phone',{...devices['iPhone 13']}]]){const p=await open(vp);const rows=[];
   for(const id of ['kairos','ines','bram','noemi','theo','lucan','cass','dess']){const other=id==='theo'?'bram':'theo';
    await p.evaluate(([id,o])=>{__sf.battle([o,id],'rift_water',8,{tier:1});},[id,other]);await p.waitForTimeout(1200);
    const f=await p.evaluate(()=>{const z=__sf.fx();for(const m of __sf.team().members)m.entCd=0;__sf.swap(1);return __sf.fx();});
    rows.push(id+' '+f.shakeM.toFixed(1)+'/'+f.shakeT.toFixed(2)+'s stop '+f.slowReal.toFixed(2));
    ok(f.shakeM>=1.5&&f.shakeM<=5.6&&f.shakeT<=0.18&&f.slowReal<=0.1,lab+' '+id+' entrance feedback in range');}
   console.log(lab+': '+rows.join(' · '));await p.context().close();}}
 // ── 4. Regression: every rift at every tier runs and can be won; Kairos's Riptide used live in each
 if(!ONLY||ONLY==='rifts'){const p=await open(desk);
  for(const id of ['rift_fire','rift_water','rift_air','rift_earth','rift_xp','rift_dust','rift_mastery'])for(const tier of [1,2,3]){
   await p.evaluate(([id,t])=>{__sf.battle(['kairos','ines','bram'],id,8,{tier:t});},[id,tier]);await p.waitForTimeout(2500);
   const r=await p.evaluate(async()=>{for(let i=0;i<3;i++){__sf.p().cd.sun=0;__sf.sun();await new Promise(r=>setTimeout(r,300));}
     const live=!!__sf.room();__sf.win();await new Promise(r=>setTimeout(r,1500));return {live};});
   ok(r.live,id+' T'+tier+' runs (Riptide used live)');}
  await p.context().close();}
 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
