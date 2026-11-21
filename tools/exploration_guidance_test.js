// Exploration guidance: story-trigger marks, workbench label, hidden-exit hints, Journal rumours, Dess's hint, Guide page.
// Uses a throwaway test save (Chapter 1 complete). Unlock rules themselves are unchanged.
const {chromium}=require('playwright'),serve=require('./serve');
const MODE=process.argv[2]||'desk';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();let pass=0,fail=0;const errs=[];
 const ok=(c,m)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m);};
 const vp=MODE==='phone'?{viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:3}:{viewport:{width:1280,height:720}};
 const p=await b.newPage(vp);p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(700);
 await p.evaluate(()=>{__sf.save().ch1Clears=1;});
 const go=async d=>{await p.evaluate(d=>{__sf.mx().at=d;__sf.mxBegin();},d);await p.waitForTimeout(900);};
 const npc=id=>p.evaluate(id=>{const n=__sf.room().m.npcs.find(n=>n.id===id);return n?{mk:n.mkf?n.mkf():null,hidden:n.hide?n.hide():false,pt:typeof n.ptitle==='function'?n.ptitle():(n.ptitle||null)}:null;},id);
 // 1. story-trigger marks
 await go('chapel');let n=await npc('look.prayerbook');ok(n&&n.mk==='?*','Cloister prayer book shows the story mark ('+(n&&n.mk)+')');
 n=await npc('chapel.alcove');ok(!n||n.mk!=='?*','ordinary spots keep the plain ? ('+(n&&n.mk)+')');
 await go('hesper');n=await npc('look.festbox');ok(n&&n.mk==='?*','decoration box shows the story mark');
 n=await npc('look.bakery.after');ok(n&&n.mk==='?*','bakery window shows the story mark');
 n=await npc('mem.bread');ok(n&&n.mk==='?*','first Lucas memory spot shows the story mark ('+(n&&n.mk)+')');
 await go('tower');n=await npc('tower.bench');ok(n&&n.mk==='?*'&&/Agnes left something/.test(n.pt),'workbench: story mark + "Agnes left something here" ('+(n&&n.pt)+')');
 // once a story is discovered the mark goes back to normal
 await p.evaluate(()=>{const x=__sf.mx();x.looked=x.looked||{};x.looked['look.prayerbook']=1;});await go('chapel');n=await npc('look.prayerbook');ok(n&&n.mk===null,'after reading, the prayer book mark clears');
 // 2. hidden-exit hints
 await go('ashlane');n=await npc('look.oldgate');ok(!!n,'Ash Lane: overgrown gate where St. Maren’s will be');
 const ex1=await p.evaluate(()=>__sf.room().m.M&&__sf.room().m.exits?__sf.room().m.exits.map(e=>e.to||e[1]).join(','):'');
 await p.evaluate(()=>{const f=__sf.save().storyFlags||(__sf.save().storyFlags={});});
 await p.evaluate(()=>{__sf.flag&&__sf.flag('oldchapel.found');});
 await go('tower');n=await npc('look.hatch');ok(!!n,'Clock Tower: padlocked hatch where the Annex will be');
 // 3. Journal rumours via the tower notice board
 await p.evaluate(()=>{__sf.room().m.npcs.find(n=>n.id==='tower.board').talk();});await p.waitForTimeout(500);
 const jt=await p.evaluate(()=>document.getElementById('overlay').innerText);
 ok(/Rumours/.test(jt),'Journal Stories tab shows Rumours');
 ok(/\(\d \/ 7\)/.test(jt)||/Dess says/.test(jt)||/·/.test(jt),'rumour lines present');
 ok(!/Ottilie|Institute Annex|St\. Maren/.test(jt),'rumours do not name hidden places or givers');
 await p.evaluate(()=>{document.querySelector('#overlay [data-back]')&&document.querySelector('#overlay [data-back]').click();});await p.waitForTimeout(300);
 // 4. Dess's hint after 4 of the 7
 const ds=await p.evaluate(()=>{const x=__sf.mx();for(const id of ['agnes_handmade','bram_bread','lark_couldnt_save','cass_prayer'])x.q[id]={s:'done',n:0};return true;});
 await go('tower');
 const dl=await p.evaluate(()=>{const n=__sf.room().m.npcs.find(n=>n.id==='h_dess');if(!n)return 'no npc';const L=n.lines?n.lines():null;return JSON.stringify(L||'').slice(0,200);});
 ok(/something to show you/.test(dl),'Dess hints after 4 of 7 stories: '+dl.slice(0,90));
 // 5. Guide page
 await p.evaluate(()=>{__sf.save();});await p.goto(url);await p.waitForTimeout(700);
 await p.evaluate(()=>{const b=[...document.querySelectorAll('button,.menu-item,[role=button]')].find(e=>/GUIDE/i.test(e.innerText||''));b&&b.click();});await p.waitForTimeout(500);
 await p.evaluate(()=>{const t=[...document.querySelectorAll('.gtab')].find(e=>/exploring/i.test(e.innerText));t&&t.click();});await p.waitForTimeout(400);
 const gt=await p.evaluate(()=>document.getElementById('overlay').innerText);
 ok(/exploring meridian/i.test(gt)&&/could start a story/i.test(gt),'Guide has an "Exploring" page');
 await p.screenshot({path:'out/eg_guide_'+MODE+'.png'});
 ok(errs.length===0,'no page errors'+(errs[0]?': '+errs[0]:''));
 console.log('DONE '+pass+'/'+(pass+fail));await b.close();server.close();})();
