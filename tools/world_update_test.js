// World & Exploration Update: one test per phase (run with an argument: desk | phone).
// Uses throwaway test saves only.
const {chromium}=require('playwright'),serve=require('./serve');
const MODE=process.argv[2]||'desk';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const vp=MODE==='phone'?{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:3}:{viewport:{width:1280,height:720}};
 const p=await b.newPage(vp);p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(700);
 const go=async d=>{await p.evaluate(d=>{__sf.mx().at=d;__sf.mxBegin();},d);await p.waitForTimeout(800);};
 const mark=id=>p.evaluate(id=>{const n=__sf.room().m.npcs.find(n=>n.id===id);return n&&n.mkf?n.mkf():null;},id);
 const fresh=async(clear)=>{await p.evaluate(c=>{localStorage.removeItem('starfall-ascent-save');},0);await p.goto(url);await p.waitForTimeout(600);if(clear)await p.evaluate(()=>{__sf.save().ch1Clears=1;});};

 // ══ Phase 1 · guidance ══
 await fresh(true);
 await go('plaza');ok(await mark('hanne')==='!','new side quest offer: gold ! (Old Hanne)');
 await p.evaluate(()=>{__sf.mx().qseen.cass_prayer=1;});await go('tower');ok(await mark('h_cass')==='!b','character story waiting: rose ! (Cassie)');
 // an active step with an NPC shows the green !
 await p.evaluate(()=>{__sf.qstart('side_sunday_cups');});await go('market');ok(await mark('matteo')==='!a','quest in progress: green ! on Matteo (Sunday Cups step)');
 const pi=await p.evaluate(()=>__sf.place('hesper'));ok(pi.trig>=1&&pi.recT>0,'map knows St. Hesper’s has story triggers and records ('+pi.trig+', '+pi.recF+'/'+pi.recT+')');
 ok(await p.evaluate(()=>__sf.place('tower').avail.includes('cass_prayer')),'map lists Cassie’s story as waiting at the Clock Tower');
 ok(await p.evaluate(()=>!__sf.wmOpen('canals')),'Canals stay locked (need.ch handled, Chapter 2 not open)');
 ok(await p.evaluate(()=>{__sf.flags()['ch2.open']=1;const o=__sf.wmOpen('canals');delete __sf.flags()['ch2.open'];return o;}),'Canals would open only from the Chapter 2 story flag');
 ok(await p.evaluate(()=>!__sf.wmOpen('oldchapel')&&!__sf.wmOpen('annex')),'hidden areas stay hidden');
 // journal
 await go('tower');await p.evaluate(()=>{__sf.room().m.npcs.find(n=>n.id==='tower.board').talk();});await p.waitForTimeout(400);
 let jt=await p.evaluate(()=>document.getElementById('overlay').innerText);
 ok(/Where: /i.test(jt),'Journal stories show where they are');
 await p.evaluate(()=>{const x=__sf.mx();for(const id of ['agnes_handmade','bram_bread'])x.q[id]={s:'done',n:0};x.qseen.dess_experiment=1;});
 await p.evaluate(()=>{document.querySelector('#overlay [data-back]')&&document.querySelector('#overlay [data-back]').click();});await go('tower');
 await p.evaluate(()=>{__sf.room().m.npcs.find(n=>n.id==='tower.board').talk();});await p.waitForTimeout(400);
 jt=await p.evaluate(()=>document.getElementById('overlay').innerText);
 ok(/A story for Dess/i.test(jt)&&/2 \/ 7/.test(jt)&&!/Girl in the Experiment/.test(jt),'locked story shows its requirement, not its title');
 const qt=await p.evaluate(()=>{const b=[...document.querySelectorAll('#overlay button')].find(e=>/^quests$/i.test(e.innerText.trim()));b&&b.click();return new Promise(r=>setTimeout(()=>r(document.getElementById('overlay').innerText),300));});
 ok(/Main story/i.test(qt)&&/Chapter 1/i.test(qt),'Quests tab opens with the main story');

 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
