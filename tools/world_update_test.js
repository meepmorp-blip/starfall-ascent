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

 await p.evaluate(()=>{const o=document.querySelector('#overlay [data-back]');o&&o.click();});
 // ══ Phase 2 · the Ash Lane shop ══
 await fresh(true);await p.evaluate(()=>{const s=__sf.save();s.dust=500;s.keep=0;});
 await go('ashlane');const cnt=await p.evaluate(()=>!!__sf.room().m.npcs.find(n=>n.id==='ashlane.counter'));ok(cnt,'Ash Lane has a shop counter beside the shopkeeper');
 await p.evaluate(()=>{__sf.room().m.npcs.find(n=>n.id==='ashlane.counter').talk();});await p.waitForTimeout(300);
 const click=sel=>p.evaluate(sel=>{const b=document.querySelector(sel);if(!b||b.disabled)return false;b.click();return true;},sel);
 ok(await click('[data-shop="keep"]'),'Buy asks first');ok((await p.evaluate(()=>__sf.save().dust))===500,'nothing is spent before Confirm');
 ok(await click('[data-buy="keep"]'),'Confirm buys');
 let sv=await p.evaluate(()=>({d:__sf.save().dust,k:__sf.save().keep,n:(__sf.save().shop.n||{}).keep}));ok(sv.d===440&&sv.k===1&&sv.n===1,'Keepsake bought: ✦ 500 → 440, Keepsakes 1');
 for(let i=0;i<2;i++){await click('[data-shop="keep"]');await click('[data-buy="keep"]');}
 ok(!(await click('[data-shop="keep"]')),'weekly stock: the 4th Keepsake can’t be bought');
 await click('[data-shop="welcome"]');await click('[data-buy="welcome"]');
 sv=await p.evaluate(()=>({k:__sf.save().keep,o:__sf.save().shop.once.welcome}));ok(sv.k===6&&sv.o===1,'the one-time welcome gives 3 Keepsakes ('+sv.k+')');
 ok(!(await p.evaluate(()=>!!document.querySelector('[data-shop="welcome"]'))),'the welcome can’t be bought again');
 const fr0=await p.evaluate(()=>__sf.save().frags.length);await click('[data-shop="frag"]');await click('[data-buy="frag"]');
 ok((await p.evaluate(()=>__sf.save().frags.length))===fr0+1,'a sealed Fragment adds one Fragment');
 const mp0=await p.evaluate(()=>__sf.save().chars.bram.mp|0);await click('[data-shop="mp"]');await click('[data-buy="mp"]');
 ok((await p.evaluate(()=>__sf.save().chars.bram.mp|0))===mp0+1,'practice notes: +1 Mastery for everyone');
 await p.evaluate(()=>{__sf.save().dust=10;});await p.evaluate(()=>{document.querySelector('#overlay [data-back]').click();});await p.evaluate(()=>{__sf.room().m.npcs.find(n=>n.id==='ashlane.counter').talk();});await p.waitForTimeout(200);
 const poor=await p.evaluate(()=>({dis:document.querySelector('[data-shop="mp"]').disabled,txt:/You need ✦/.test(document.getElementById('overlay').innerText)}));
 ok(poor.dis&&poor.txt,'not enough Stardust: Buy disabled and says how much is missing');
 await p.evaluate(()=>{document.querySelector('#overlay [data-back]').click();__sf.save();});await p.evaluate(()=>{__sf.persist&&__sf.persist();});
 await p.goto(url);await p.waitForTimeout(700);
 sv=await p.evaluate(()=>({o:__sf.save().shop&&__sf.save().shop.once.welcome,n:__sf.save().shop&&__sf.save().shop.n.keep,k:__sf.save().keep}));
 ok(sv.o===1&&sv.n===3&&sv.k===6,'purchases persist after a reload ('+JSON.stringify(sv)+')');
 // ══ Phase 3 · Rifts and Trials from the city ══
 await fresh(true);
 const ov=()=>p.evaluate(()=>{const o=document.getElementById('overlay');return o&&!o.hidden?o.innerText:'';});
 for(const [d,id,tabRe,cardRe,dist] of [['plaza','plaza.scar',/Today’s rift condition/i,/St\. Lucia’s Ward/,'Festival Square'],['yard','yard.trials',/Best|No best time/i,/Mercury|Errand/i,'Garrison Yard']]){
  await go(d);await p.evaluate(id=>{__sf.room().m.npcs.find(n=>n.id===id).talk();},id);await p.waitForTimeout(400);
  ok(/Choose a stage/i.test(await ov()),d+': the '+(d==='plaza'?'rift scar':'trial roster')+' opens party select');
  await p.evaluate(()=>document.querySelector('#overlay [data-primary]').click());await p.waitForTimeout(400);
  let t=await ov();ok(tabRe.test(t)&&new RegExp('Back to '+dist,'i').test(t),d+': the Battle menu opens on the right tab, with “Back to '+dist+'”');
  await p.evaluate(re=>{const c=[...document.querySelectorAll('#overlay .bm-card')].find(e=>new RegExp(re,'i').test(e.innerText));c&&c.click();},cardRe.source);await p.waitForTimeout(800);
  const k=await p.evaluate(()=>{const r=__sf.room();return r&&r.def?r.def.kind:null;});ok(k==='rift'||k==='trial',d+': the normal battle starts ('+k+')');
  await p.evaluate(()=>{__sf.clearRoom();__sf.win();});await p.waitForTimeout(3200);t=await ov();
  ok(new RegExp('Back to '+dist,'i').test(t),d+': results offer “Back to '+dist+'”');
  await p.evaluate(()=>document.querySelector('#overlay [data-back]').click());await p.waitForTimeout(900);
  const at=await p.evaluate(()=>{const r=__sf.room();return r&&r.m&&r.m.M?r.m.M.dist:null;});ok(at===d,d+': back in '+dist+' after the battle ('+at+')');}
 // the main-menu route is unchanged
 await p.evaluate(()=>{__sf.goHome&&__sf.goHome();});
 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
