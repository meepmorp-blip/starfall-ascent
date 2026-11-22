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
 // the Guide still lists exactly the canon seven
 await p.goto(url);await p.waitForTimeout(600);
 await p.evaluate(()=>{const b=[...document.querySelectorAll('button,.menu-item,[role=button]')].find(e=>/GUIDE/i.test(e.innerText||''));b&&b.click();});await p.waitForTimeout(400);
 await p.evaluate(()=>{const t=[...document.querySelectorAll('.gtab')].find(e=>/vices/i.test(e.innerText));t&&t.click();});await p.waitForTimeout(300);
 const gt=await p.evaluate(()=>document.getElementById('overlay').innerText);
 ok(['Hothead','Gossip','Waxer','Spotlight','Deadline','Devourer','Collector'].every(n=>gt.includes(n))&&!/Crumbkin|Paperling|Candlewisp|Last Stand|Humming Core/.test(gt),'Guide → Vices still shows exactly the seven (new ones come in S9, once met)');

 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
