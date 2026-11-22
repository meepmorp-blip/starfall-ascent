// Chapter 1 enemy design: implementation checks, one section per stage (docs/CH1_ENEMY_IMPLEMENTATION_PLAN.md).
// Run: node ch1_enemies_test.js [desk|phone]
const {chromium}=require('playwright'),serve=require('./serve');
const MODE=process.argv[2]||'desk';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const vp=MODE==='phone'?{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:3}:{viewport:{width:1280,height:720}};
 const p=await b.newPage(vp);p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(700);

 // ══ S1 · groundwork (nothing new spawns) ══
 // existing enemies unchanged: base stats from makeEnemy as of the release (HP scales by the same factor for all)
 const BASE={hothead:{hp:34,r:13,spd:66,dmg:8},gossip:{hp:18,r:10,spd:108,dmg:5},waxer:{hp:28,r:11,spd:88,dmg:4},deadline:{hp:60,r:15,spd:46,dmg:10},
   spotlight:{hp:26,r:11,spd:72,dmg:12},devourer:{hp:42,r:13,spd:56,dmg:6},collector:{hp:30,r:11,spd:125,dmg:5}};
 await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_fire',0,{tier:1});});await p.waitForTimeout(400);
 const st=await p.evaluate(B=>{const out={};for(const t in B){const e=__sf.mk(t,100,100,{instant:true,elite:null});out[t]={hp:e.hp,r:e.r,spd:e.spd,dmg:e.dmg};e.dead=true;}
   const ch=__sf.mk('champion',100,100,{});out.champion={hp:ch.hp,r:ch.r,spd:ch.spd,dmg:ch.dmg};ch.dead=true;return out;},BASE);
 const k=st.hothead.hp/34;let same=true;const diff=[];
 for(const t in BASE){const e=st[t],B=BASE[t];if(Math.abs(e.hp-B.hp*k)>0.01||e.r!==B.r||e.spd!==B.spd||e.dmg!==B.dmg){same=false;diff.push(t+JSON.stringify(e));}}
 ok(same,'the seven existing Vices keep their stats'+(diff.length?' · '+diff.join(' '):''));
 ok(st.champion.hp===1000&&st.champion.r===22&&st.champion.dmg===13,'the Champion is unchanged');
 const V=await p.evaluate(()=>{const v=__sf.vices();return {n:Object.keys(v.info).length,canon:v.canon,nv:v.nv,hasAll:v.nv.every(k=>v.info[k]&&v.info[k].length===3),excl:v.excl};});
 ok(V.n===12&&V.canon.length===7&&V.nv.length===5&&V.hasAll,'codex: 7 canon + 5 new entries, each with name, memory and how it fights');
 const cols=await p.evaluate(()=>{const ks=[...__sf.vices().canon,...__sf.vices().nv];return ks.map(t=>__sf.col(t));});
 ok(new Set(cols).size===12,'every Vice has its own colour ('+cols.join(' ')+')');
 // elite exclusions
 const ex=await p.evaluate(()=>{const r={};for(const [t,el] of [['laststand','shielded'],['crumbkin','volatile'],['hummingcore','hasted'],['paperling','shielded']]){const e=__sf.mk(t,100,100,{elite:el});r[t]=e.elite||null;e.dead=true;}return r;});
 ok(ex.laststand===null&&ex.crumbkin===null&&ex.hummingcore===null&&ex.paperling==='shielded','elite exclusions apply only where specified ('+JSON.stringify(ex)+')');
 // decoys give no Memories
 const dm=await p.evaluate(()=>{const m0=__sf.runMem()||0;const e=__sf.mk('hothead',200,200,{instant:true,elite:null});e.spawnT=0;e.decoy=1;__sf.hit(e,9999,{src:__sf.p()});const m1=__sf.runMem()||0;
   const f=__sf.mk('hothead',220,200,{instant:true,elite:null});f.spawnT=0;__sf.hit(f,9999,{src:__sf.p()});return {d:m1-m0,n:(__sf.runMem()||0)-m1};});
 ok(dm.d===0&&dm.n===4.5,'a decoy gives no Memories; a normal Vice still gives 4.5 ('+JSON.stringify(dm)+')');
 // 'met' record for the Guide (new Vices only)
 const met=await p.evaluate(()=>{const e=__sf.mk('paperling',100,100,{elite:null});e.dead=true;const c=__sf.save().claims;return {p:!!c['vice:paperling'],h:!!c['vice:hothead']};});
 ok(met.p&&!met.h,'meeting a new Vice is remembered for the Guide (and only new ones)');
 // minimum line width: at least 2 screen px
 const ml=await p.evaluate(()=>__sf.minLine());const sc=MODE==='phone'?0.975:1.8;
 ok(Math.abs(ml*sc-Math.max(sc,2))<0.15,'telegraph and link lines are at least 2 screen px ('+(ml*sc).toFixed(2)+' px)');
 // the Guide lists the canon seven, and no new Vice before it has been met
 await p.evaluate(()=>{const c=__sf.save().claims;for(const k of ['crumbkin','paperling','candlewisp','laststand','hummingcore'])delete c['vice:'+k];__sf.persist();});
 await p.goto(url);await p.waitForTimeout(600);
 await p.evaluate(()=>{const b=[...document.querySelectorAll('button,.menu-item,[role=button]')].find(e=>/GUIDE/i.test(e.innerText||''));b&&b.click();});await p.waitForTimeout(400);
 await p.evaluate(()=>{const t=[...document.querySelectorAll('.gtab')].find(e=>/vices/i.test(e.innerText));t&&t.click();});await p.waitForTimeout(300);
 const gt=await p.evaluate(()=>document.getElementById('overlay').innerText);
 ok(['Hothead','Gossip','Waxer','Spotlight','Deadline','Devourer','Collector'].every(n=>gt.includes(n))&&!/Crumbkin|Paperling|Candlewisp|Last Stand|Humming Core/.test(gt),'Guide → Vices still shows exactly the seven (new ones come in S9, once met)');

 // ── a clean test arena: Rift, no spawns, invulnerable party ──
 const arena=async()=>{await p.goto(url);await p.waitForTimeout(500);await p.evaluate(()=>{__sf.battle(['bram'],'rift_earth',8,{tier:1});});await p.waitForTimeout(1200);
   await p.evaluate(()=>{const r=__sf.room();r.spawnCd=999;r.budget=999;for(const e of __sf.en())e.dead=true;const q=__sf.p();q.x=355;q.y=300;window.__keep=setInterval(()=>{const q=__sf.p();if(q){q.hp=q.maxHp;}},100);});};
 const E=(f,a)=>p.evaluate(f,a);const wait=ms=>p.waitForTimeout(ms);
 const put=(t,x,y,o)=>E(([t,x,y,o])=>{const e=__sf.mk(t,x,y,Object.assign({instant:true,elite:null},o||{}));e.x=x;e.y=y;e.spawnT=0;return true;},[t,x,y,o]);

 // ══ S2 · Crumbkin ══
 await arena();
 const grp=await E(()=>{const n0=__sf.en().length;__sf.spawnEdge('crumbkin');return __sf.en().filter(e=>e.type==='crumbkin'&&!e.dead).length;});
 ok(grp>=3&&grp<=4,'Crumbkins spawn as a group of 3–4 ('+grp+')');
 const cap=await E(()=>{for(let i=0;i<5;i++)__sf.spawnEdge('crumbkin');return __sf.en().filter(e=>e.type==='crumbkin'&&!e.dead).length;});
 ok(cap<=8,'at most 8 Crumbkins alive ('+cap+')');
 const tossOK=await E(async()=>{for(const e of __sf.en())if(e.type==='crumbkin'){e.spawnT=0;e.tossCd=0;}await new Promise(r=>setTimeout(r,300));const q=__sf.p(),cr=__sf.room().crumbs||[];return {n:cr.length,near:cr.filter(c=>Math.hypot(c.x-q.x,c.y-q.y)<30).length};});
 ok(tossOK.n>=3&&tossOK.near===0,'crumb tosses land as hazards, never right on the player ('+JSON.stringify(tossOK)+')');
 // huddle: three held together merge after 4 s + 1 s warning into a Warm Loaf with their summed HP
 await arena();
 for(const [x,y] of [[150,120],[160,124],[154,132]])await put('crumbkin',x,y);
 const hp0=await E(()=>{let s=0;for(const e of __sf.en())if(e.type==='crumbkin'&&!e.dead){e.spd=0;e.tossCd=99;s+=e.hp;}return s;});
 await wait(5600);
 const loaf=await E(()=>{const l=__sf.en().filter(e=>!e.dead&&e.type==='crumbkin');return {n:l.length,loaf:!!(l[0]&&l[0].loaf),hp:l[0]&&l[0].hp};});
 ok(loaf.n===1&&loaf.loaf&&Math.abs(loaf.hp-hp0)<0.5,'three left together become one Warm Loaf with their HP ('+JSON.stringify(loaf)+' vs '+hp0.toFixed(1)+')');
 await arena();
 for(const [x,y] of [[150,120],[160,124],[154,132]])await put('crumbkin',x,y);
 await E(()=>{for(const e of __sf.en())if(e.type==='crumbkin'&&!e.dead){e.spd=0;e.tossCd=99;}});await wait(4300);
 await E(()=>{const m=__sf.en().find(e=>e.type==='crumbkin'&&!e.dead&&e.warnBy);if(m)m.stunT=1;});await wait(1500);
 ok(await E(()=>__sf.en().filter(e=>!e.dead&&e.type==='crumbkin').length===3),'stunning one during the 1 s warning stops the merge');
 const bk=await E(()=>{const e=__sf.mk('crumbkin',300,300,{instant:true,elite:null});e.spawnT=0;e.hp=e.maxHp=1000;__sf.hit(e,10,{src:__sf.p()});const a=1000-e.hp;e.hp=1000;e.burnT=5;__sf.hit(e,10,{src:__sf.p()});return [a,1000-e.hp];});
 ok(Math.abs(bk[1]/bk[0]-1.25)<0.02,'burning Crumbkins take +25% ('+bk.map(v=>v.toFixed(1)).join(' → ')+')');

 // ══ S3 · Paperling ══
 await arena();await put('paperling',355,140);
 const aim=await E(async()=>{const e=__sf.en().find(o=>o.type==='paperling');e.foldCd=99;e.dartCd=0;await new Promise(r=>setTimeout(r,80));const ax=e.aimX,ay=e.aimY;
   const q=__sf.p();q.x+=120;await new Promise(r=>setTimeout(r,600));const b=__sf.bul().filter(b=>b.dart);if(!b.length)return null;
   const exp=Math.atan2(ay-e.y,ax-e.x),got=Math.atan2(b[0].vy+b[1].vy,b[0].vx+b[1].vx);return {n:b.length,err:Math.abs(exp-got)};});
 ok(aim&&aim.n===2&&aim.err<0.15,'darts fly at where you stood when the wings folded back ('+JSON.stringify(aim)+')');
 const dec=await E(async()=>{const e=__sf.en().find(o=>o.type==='paperling'&&!o.decoy);e.dartCd=99;for(let i=0;i<4;i++){e.foldCd=0;await new Promise(r=>setTimeout(r,650));}
   const d=__sf.en().filter(o=>o.decoy&&!o.dead);const k0=__sf.save()&&0;return {n:d.length,hp:d[0]&&d[0].hp};});
 ok(dec.n<=2&&dec.n>=1&&dec.hp===1,'at most 2 decoys, each with 1 HP ('+JSON.stringify(dec)+')');
 const dk=await E(()=>{const r=__sf.room();const d=__sf.en().find(o=>o.decoy&&!o.dead);const m0=__sf.runMem()||0;__sf.hit(d,5,{src:__sf.p()});return {dead:d.dead,mem:(__sf.runMem()||0)-m0};});
 ok(dk.dead&&dk.mem===0,'popping a decoy gives nothing');
 const rf=await E(async()=>{const e=__sf.en().find(o=>o.type==='paperling'&&!o.decoy&&!o.dead);__sf.hit(e,999,{src:__sf.p()});const a={dead:e.dead,untarget:e.untarget};
   await new Promise(r=>setTimeout(r,1700));const b={dead:e.dead,hp:e.hp/e.maxHp};__sf.hit(e,999,{src:__sf.p()});return {a,b,final:e.dead};});
 ok(!rf.a.dead&&rf.a.untarget&&!rf.b.dead&&Math.abs(rf.b.hp-0.4)<0.01&&rf.final,'re-folds once at 40%, then dies for good ('+JSON.stringify(rf)+')');
 const wet=await E(()=>{const e=__sf.mk('paperling',200,200,{instant:true,elite:null});e.spawnT=0;e.wetT=3;__sf.hit(e,999,{src:__sf.p()});return e.dead;});
 ok(wet,'a Wet Paperling can’t re-fold');

 // ══ S4 · Candlewisp ══
 await arena();await put('hothead',300,180);await put('candlewisp',340,150);
 await E(()=>{const h=__sf.en().find(o=>o.type==='hothead');h.hp=h.maxHp*0.5;h.spd=0;h.cd=99;});
 const lk=await E(async()=>{const w=__sf.en().find(o=>o.type==='candlewisp');await new Promise(r=>setTimeout(r,300));const early=!!w.link;await new Promise(r=>setTimeout(r,700));return {early,linked:!!w.link};});
 ok(!lk.early&&lk.linked,'the shelter link forms after the 0.6 s warning');
 const sh=await E(()=>{const h=__sf.en().find(o=>o.type==='hothead');const hp=h.hp;__sf.hit(h,20,{src:__sf.p()});return hp-h.hp;});
 ok(Math.abs(sh-13)<0.6,'a sheltered Vice takes 35% less ('+sh.toFixed(1)+' of 20)');
 const gut=await E(async()=>{const w=__sf.en().find(o=>o.type==='candlewisp');w.hp=w.maxHp=1000;__sf.hit(w,1,{src:__sf.p()});await new Promise(r=>setTimeout(r,250));const off=!w.link;await new Promise(r=>setTimeout(r,1300));const still=!w.link;return {off,still};});
 ok(gut.off&&gut.still,'hitting the lantern breaks the link for 2 s');
 const champ=await E(async()=>{for(const e of __sf.en())e.dead=true;const c=__sf.mk('champion',300,180,{});c.spawnT=0;c.spd=0;c.hp=500;const w=__sf.mk('candlewisp',340,150,{instant:true,elite:null});w.spawnT=0;await new Promise(r=>setTimeout(r,1300));return !!w.link;});
 ok(!champ,'it never shelters the Champion (or a boss)');

 // ══ S5 · The Last Stand ══
 await arena();
 const ls=await E(async()=>{const q=__sf.p();q.x=355;q.y=320;const e=__sf.mk('laststand',355,200,{instant:true,elite:null});e.spawnT=0;e.spd=0;e.rushCd=99;e.hp=e.maxHp=5000;
   await new Promise(r=>setTimeout(r,2200));const front=e.hp;__sf.hit(e,100,{src:q,from:{x:355,y:320}});const fd=front-e.hp;
   const b0=e.hp;__sf.hit(e,100,{src:q,from:{x:355,y:80}});const bd=b0-e.hp;return {fd,bd,fa:e.fa};});
 ok(Math.abs(ls.fd-30)<1&&Math.abs(ls.bd-100)<1,'shield: −70% from the front, full damage from behind ('+ls.fd.toFixed(0)+' / '+ls.bd.toFixed(0)+')');
 const turn=await E(async()=>{const e=__sf.en().find(o=>o.type==='laststand');const q=__sf.p();q.x=520;q.y=200;const a0=e.fa;await new Promise(r=>setTimeout(r,500));return Math.abs(e.fa-a0);});
 ok(turn>0.5&&turn<1.0,'turns about 90° a second ('+(turn*180/Math.PI).toFixed(0)+'° in 0.5 s)');
 const rush=await E(async()=>{const e=__sf.en().find(o=>o.type==='laststand');const q=__sf.p();q.x=355;q.y=320;e.fa=Math.PI/2;e.st='guard';e.rushCd=0;await new Promise(r=>setTimeout(r,150));const w=e.st;
   await new Promise(r=>setTimeout(r,1100));const o=e.st;await new Promise(r=>setTimeout(r,1300));return {w,o,after:e.st};});
 ok(rush.w==='rushWarn'&&rush.o==='open'&&rush.after==='guard','rush: 0.8 s warning, then the shield is down about 1.2 s ('+JSON.stringify(rush)+')');
 const cov=await E(async()=>{for(const e of __sf.en())e.dead=true;const L=__sf.mk('laststand',355,200,{instant:true,elite:null});L.spawnT=0;L.spd=0;L.rushCd=99;L.fa=Math.PI/2;
   const h=__sf.mk('hothead',355,160,{instant:true,elite:null});h.spawnT=0;h.spd=0;h.cd=99;const hp=h.hp;
   __sf.mkShot(355,300,-Math.PI/2,{dmg:10,spd:600,src:__sf.p(),life:1,pierce:true});await new Promise(r=>setTimeout(r,500));return {hp0:hp,hp:h.hp};});
 ok(cov.hp===cov.hp0,'a shot from the front is stopped before the Vice sheltering behind it');

 // ══ S6 · The Humming Core ══
 await arena();
 const hc=await E(async()=>{const q=__sf.p();q.x=355;q.y=200;const e=__sf.mk('hummingcore',355,210,{instant:true,elite:null});e.spawnT=0;e.hp=e.maxHp=5000;
   const h=__sf.mk('hothead',420,210,{instant:true,elite:null});h.spawnT=0;h.spd=0;
   await new Promise(r=>setTimeout(r,300));const calm=h.calmT>0&&e.beat<=3;
   const t0=performance.now();let waves=[];await new Promise(r=>{const iv=setInterval(()=>{const w=__sf.room().waves||[];for(const x of w)if(!waves.includes(x)){waves.push(x);x.at=performance.now();}if(waves.length>=2||performance.now()-t0>9000){clearInterval(iv);r();}},30);});
   return {calm,n:waves.length,gap:waves.length>=2?(waves[1].at-waves[0].at)/1000:null,max:waves[0]&&waves[0].max};});
 ok(hc.calm,'beats 1–3 calm nearby Vices');
 ok(hc.n>=2&&hc.max===140,'beat 4 swells out to 140 px');
 ok(hc.gap>2.0&&hc.gap<3.3,'a bar is four short beats (two swells '+(hc.gap&&hc.gap.toFixed(2))+' s apart; faster just after a swell)');
 const dl=await E(async()=>{for(const e of __sf.en())e.dead=true;const e=__sf.mk('hummingcore',355,210,{instant:true,elite:null});e.spawnT=0;e.hp=e.maxHp=5000;
   await new Promise(r=>{const iv=setInterval(()=>{if(e.beat===3){clearInterval(iv);r();}},20);});__sf.hit(e,1,{src:__sf.p()});const t0=performance.now();
   await new Promise(r=>{const iv=setInterval(()=>{if(e.beat===4||performance.now()-t0>3000){clearInterval(iv);r();}},20);});return (performance.now()-t0)/1000;});
 ok(dl>0.9,'hitting it on beat 3 holds the swell back a beat ('+dl.toFixed(2)+' s)');

 // ══ S8 · debut placements (Rifts and Runs only) ══
 const draw=(id,tier,n)=>E(async([id,tier,n])=>{__sf.battle(['bram'],id,8,{tier});await new Promise(r=>setTimeout(r,300));const c={};for(let i=0;i<n;i++){const t=__sf.poolType();c[t]=(c[t]||0)+1;}return c;},[id,tier,n]);
 await p.goto(url);await p.waitForTimeout(500);
 const ward3=await draw('rift_water',3,400),fire2=await draw('rift_fire',2,400),fire1=await draw('rift_fire',1,400),xp1=await draw('rift_xp',1,400),earth3=await draw('rift_earth',3,600),air2=await draw('rift_air',2,400);
 ok(!ward3.candlewisp&&!ward3.crumbkin&&!ward3.paperling&&!ward3.laststand,'St. Lucia’s Ward stays as it is (Candlewisp kept out after the balance gate)');
 ok(fire2.candlewisp>0&&!fire1.candlewisp,'Candlewisp appears in Ash Lane Blaze from Tier II only');
 ok(xp1.crumbkin>0,'Crumbkins appear in Market Ring Waves');
 ok(earth3.laststand>0&&earth3.paperling>0,'Garrison Yard Tier III can bring The Last Stand and Paperlings');
 ok((air2.hummingcore||0)<=1,'at most one Humming Core per fight ('+(air2.hummingcore||0)+')');
 const story=await E(async()=>{__sf.mission('cistern',['kairos','ines','bram']);await new Promise(r=>setTimeout(r,800));const r=__sf.room();return {pool:r.def.pool,kind:r.def.kind};});
 ok(story.kind==='mission'&&!story.pool.some(t=>['crumbkin','paperling','candlewisp','laststand','hummingcore'].includes(t)),'story fights are untouched (Cistern Stair pool '+story.pool+')');
 // ══ S9 · Guide: "Others you've met" ══
 const guide=async(keep)=>{if(!keep){await p.goto(url);await p.waitForTimeout(500);}else{await p.evaluate(()=>{const b=document.querySelector('#overlay [data-back]');b&&b.click();});await p.waitForTimeout(300);}
   await p.evaluate(()=>{const b=[...document.querySelectorAll('button,.menu-item,[role=button]')].find(e=>/GUIDE/i.test(e.innerText||''));b&&b.click();});await p.waitForTimeout(300);
   await p.evaluate(()=>{const t=[...document.querySelectorAll('.gtab')].find(e=>/vices/i.test(e.innerText));t&&t.click();});await p.waitForTimeout(300);return p.evaluate(()=>document.getElementById('overlay').innerText);};
 await E(()=>{const c=__sf.save().claims;for(const k of ['crumbkin','paperling','candlewisp','laststand','hummingcore'])delete c['vice:'+k];__sf.persist();});
 let g=await guide();ok(/others you.ve met/i.test(g)&&!/Crumbkin|Paperling|Candlewisp|Last Stand|Humming Core/.test(g),'before meeting them, the Guide lists none of the new Vices');
 await E(()=>{const c=__sf.save().claims;c['vice:crumbkin']=1;c['vice:laststand']=1;});
 g=await guide(true);ok(/Crumbkin/.test(g)&&/The Last Stand/.test(g)&&!/Paperling/.test(g)&&/Flour first/.test(g),'after meeting them, each appears with how it fights and its memory line');
 ok(['Hothead','Gossip','Waxer','Spotlight','Deadline','Devourer','Collector'].every(n=>g.includes(n))&&/The Seven Vices/i.test(g),'the canon seven are still listed first');

 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
