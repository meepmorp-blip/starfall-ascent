// Balance pass checks: Ward rework, daily modifier, readability (merge, cap, objective clearance), Earth shields, Agnes, Riptide, Tier III.
const {chromium,devices}=require('playwright'),serve=require('./serve');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const open=async(vp,day)=>{const ctx=await b.newContext(vp);const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(d=>{localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false}));
    if(d!=null){const R=Date.now.bind(Date);const base=Math.floor(R()/86400000);const off=((d-base%4)+4)%4;Date.now=()=>R()+off*86400000;}},day);
  await p.goto(url);await p.waitForTimeout(700);return p;};
 const desk={viewport:{width:1280,height:720}};
 const p=await open(desk,2); // day index 2 = the "regen" modifier
 const wait=ms=>p.waitForTimeout(ms);
 // ── Ward
 await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:3});});await wait(600);
 const w=await p.evaluate(async()=>{const r={};const q=__sf.p(),o=__sf.room().obj;q.iframe=99;q.x=60;q.y=60;
   const sleep=ms=>new Promise(res=>setTimeout(res,ms));const freeze=()=>{for(const e of __sf.en())if(!e.mine){e.dead=true;}};
   __sf.room().spawnCd=999;__sf.room().budget=999;freeze();
   // a Vice standing on the patients that is NOT chasing them: no damage
   const a=__sf.mk('hothead',o.x,o.y,{instant:true,elite:null});a.mine=1;a.rt=false;a.spd=0;a.spawnT=0;o.hp=80;o.calm=0;
   await sleep(1500);r.nonChaser=o.hp;a.dead=true;
   // a chaser: no damage before the wind-up ends, then a hit
   o.hp=80;const c=__sf.mk('hothead',o.x+o.r,o.y,{instant:true,elite:null});c.mine=1;c.rt=true;c.spd=0;c.spawnT=0;c.hp=c.maxHp=1e5;
   await sleep(350);r.during=o.hp;await sleep(900);r.after=o.hp;
   // interrupt: hitting it during the wind-up resets it
   c.wardCd=0;c.wardW=0;o.hp=80;await sleep(300);__sf.hit(c,1,{src:q});await sleep(500);r.interrupted=o.hp;
   c.dead=true;await sleep(1700);const h1=o.hp;await sleep(1000);r.regen=+(o.hp-h1).toFixed(2);
   // Gossip children never chase; at most 3 chasers
   const g=__sf.mk('gossip',200,200,{gen:1,instant:true});g.mine=1;__sf.tgt(g);r.child=g.rt;g.dead=true;
   const xs=[];for(let i=0;i<8;i++){const e=__sf.mk('hothead',100+i*20,300,{instant:true,elite:null});e.mine=1;e.spawnT=0;__sf.tgt(e);xs.push(e);}r.chasers=xs.filter(e=>e.rt).length;for(const e of xs)e.dead=true;
   r.modText=__sf.modText();r.regenOn=__sf.modOn('regen');return r;});
 ok(w.nonChaser>=80,'a Vice on the patients that is not chasing them deals no damage');
 ok(w.during===80&&w.after<80,'chaser hits only after its 0.6 s wind-up ('+w.during+' → '+w.after+')');
 ok(w.interrupted===80,'hitting a chaser during its wind-up interrupts it');
 ok(w.regen>1.2&&w.regen<1.8,'patients recover about 1.5%/s when nobody is attacking ('+w.regen+')');
 ok(w.child===false,'Gossip children never chase the patients');
 ok(w.chasers<=3,'at most 3 chasers ('+w.chasers+')');
 ok(!w.regenOn&&/off in this rift/.test(w.modText),'daily "Vices heal" is off in the Ward and says so: '+w.modText);
 // ignoring the patients still fails
 for(const tier of [1,3]){await p.evaluate(t=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:t});},tier);await wait(300);
  const f=await p.evaluate(async()=>{const t0=performance.now();while(performance.now()-t0<60000){const q=__sf.p(),rm=__sf.room();if(!rm||!rm.obj)return -1;q.x=60;q.y=60;q.iframe=9;for(const m of __sf.team().members)m.hp=m.maxHp;if(rm.obj.hp<=0)return (performance.now()-t0)/1000;await new Promise(r=>setTimeout(r,100));}return 99;});
  ok(f>0&&f<60,'Tier '+tier+': ignoring the chasers still loses ('+f.toFixed(1)+' s)');}
 // regen modifier still on in a normal rift
 await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_fire',8,{tier:1});});await wait(300);
 ok(await p.evaluate(()=>__sf.modOn('regen')),'daily "Vices heal" still applies in other rifts');
 // ── Readability
 const t=await p.evaluate(async()=>{const q=__sf.p();for(const e of __sf.en())e.dead=true;__sf.room().spawnCd=999;
   const e=__sf.mk('deadline',q.x+120,q.y,{instant:true,elite:null});e.spawnT=0;e.hp=e.maxHp=1e5;e.spd=0;
   __sf.texts().length=0;for(let i=0;i<5;i++)__sf.hit(e,7,{src:q});const nums=__sf.texts().filter(x=>x.tg===e);
   for(let i=0;i<20;i++)__sf.texts();const many=[];for(let i=0;i<20;i++){const z=__sf.mk('hothead',100+i*25,150,{instant:true,elite:null});z.spawnT=0;z.hp=z.maxHp=1e5;many.push(z);}
   for(const z of many)__sf.hit(z,5,{src:q});const cap=__sf.texts().filter(x=>!x.bubble).length;return {merged:nums.length,val:nums[0]&&nums[0].txt,cap};});
 ok(t.merged===1,'5 quick hits on one Vice show one merged number ('+t.val+')');
 ok(t.cap<=6,'at most 6 floating texts at once ('+t.cap+')');
 await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:1});});await wait(300);
 const cl=await p.evaluate(()=>{const o=__sf.room().obj;__sf.texts().length=0;const e=__sf.mk('hothead',o.x+10,o.y-20,{instant:true,elite:null});e.spawnT=0;e.hp=e.maxHp=1e5;__sf.hit(e,9,{src:__sf.p()});
   const t=__sf.texts()[0];return t?Math.abs(t.x-o.x)>=o.r+30:null;});
 ok(cl===true,'damage text over the patients is moved clear of them');
 // ── Earth: skills hit shields twice as hard
 await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_earth',8,{tier:2});});await wait(300);
 const sh=await p.evaluate(()=>{const q=__sf.p();for(const e of __sf.en())e.dead=true;const e=__sf.mk('hothead',q.x+300,q.y,{elite:'shielded'});e.spawnT=0;e.hp=e.maxHp=1e5;e.sh=e.shMax=100;
   __sf.hit(e,10,{src:q,basic:true});const b=100-e.sh;e.sh=100;__sf.hit(e,10,{src:q,skill:'sun'});const s=100-e.sh;return {b,s};});
 ok(sh.s>=sh.b*1.9,'Sun/Moon skills strip shields twice as fast (basic '+sh.b.toFixed(1)+', skill '+sh.s.toFixed(1)+')');
 // ── Agnes passes through 2; Riptide cooldown 6
 await p.evaluate(()=>{__sf.battle(['ines','kairos','bram'],'rift_earth',8,{tier:1});});await wait(300);
 const ag=await p.evaluate(async()=>{const q=__sf.p();for(const e of __sf.en())e.dead=true;__sf.room().spawnCd=999;q.x=200;q.y=220;q.fx=1;q.fy=0;
   const es=[0,1,2].map(i=>{const e=__sf.mk('hothead',300+i*40,220,{instant:true,elite:null});e.spawnT=0;e.hp=e.maxHp=1e5;e.spd=0;e.kx=0;return e;});
   q.atkCd=0;__sf.tap();await new Promise(r=>setTimeout(r,500));return es.map(e=>e.hp<1e5);});
 ok(ag[0]&&ag[1]&&!ag[2],'Agnes tap passes through exactly 2 Vices ('+ag.join(',')+')');
 const rip=await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_earth',8,{tier:1});return __sf.p().ch.kit.sun.cd;});
 ok(rip===6,'Riptide cooldown 6 s (was 5)');
 ok(await p.evaluate(()=>__sf.p().ch.kit.sun.desc.includes('2.5s')),'Riptide window text 2.5 s');
 // ── Phone: status list and shake still fine
 const ph=await open({...devices['iPhone 13 landscape']},2);
 await ph.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:3});});await ph.waitForTimeout(3000);
 await ph.screenshot({path:'out/bp_phone_ward.png'});
 await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_water',8,{tier:3});});await wait(3000);await p.screenshot({path:'out/bp_desk_ward.png'});
 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
