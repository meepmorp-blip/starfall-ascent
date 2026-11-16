// UX walkthroughs with real clicks/taps: Builds (characters × tabs, equip, Backup), Guide, Journal, Renown claim, Rift in/out, a story offer, and menu round-trips. Usage: node ux_walk_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const E=(f,a)=>p.evaluate(f,a);
const npc=id=>E(id=>{const n=__sf.m().npcs.find(o=>o.id===id&&!(o.hide&&o.hide(__sf.m())));return n?{x:n.x,y:n.y}:null;},id);
const press=async()=>{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);const lines=[];
  for(let i=0;i<30;i++){if(await E(()=>__sf.st())==='dialog'){lines.push(await E(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}await p.waitForTimeout(200);return lines;};
async function interact(id){let near=null;for(const [ox,oy] of [[-22,6],[22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){const n=await npc(id);if(!n)return {near:null,lines:[]};
    await E(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,ox,oy]);await p.waitForTimeout(160);near=await E(()=>__sf.m().near&&__sf.m().near.id);if(near===id)break;}
  return {near,lines:await press()};}
const go=async d=>{await E(d=>__sf.mxGo(d),d);await p.waitForTimeout(850);};
const st=id=>E(id=>__sf.qstate(id),id);const step=id=>E(id=>{const q=__sf.mx().q[id];return q&&q.s!=='done'?__sf.mxQ[id].steps[q.n].id:null;},id);
const mark=id=>E(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n&&n.mkf?n.mkf():null;},id);
const pick=async i=>{await p.locator('.pzl-o').nth(i).click();await p.waitForTimeout(220);};
const winFight=async()=>{await p.waitForTimeout(1400);const inFight=await E(()=>__sf.m()&&['fight','defense'].includes(__sf.m().M.type));await E(()=>__sf.win());
  for(let i=0;i<40;i++){await p.waitForTimeout(200);if(await E(()=>__sf.m()&&__sf.m().M.type==='walk'))break;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}
  await p.waitForTimeout(700);return inFight;};
const scene=async()=>{await p.waitForTimeout(500);const had=await E(()=>!!__sf.cut());for(let i=0;i<40&&await E(()=>!!__sf.cut());i++){await E(()=>__sf.cutNext());await p.waitForTimeout(120);}await p.waitForTimeout(900);return had;};
const hudHits=ids=>E(ids=>{const m=__sf.m(),H=__sf.hud(),out=[],sw=H.sw;const scr=[[sw*0.1,0,sw*0.9,H.safe.t+70],[0,0,H.safe.l+14+Math.min(190,Math.max(130,sw*0.2))+6,H.safe.t+74],[sw-H.safe.r-70,0,sw,70]];
    if(H.touch)for(const k of ['atk','dodge','sun','moon','ult']){const c=H.btn[k];if(c&&c.r)scr.push([c.x-c.r-6,c.y-c.r-6,c.x+c.r+6,c.y+c.r+6]);}
    for(const c of H.ports)if(c&&c.r)scr.push([c.x-c.r-4,c.y-c.r-4,c.x+c.r+40,c.y+c.r+4]);
    for(const n of m.npcs){if(!ids.some(i=>n.id.startsWith(i)))continue;const x=H.ox+n.x*H.scale,y=H.oy+n.y*H.scale,r=12*H.scale;
      for(const [a,b,c,e] of scr)if(x+r>a&&x-r<c&&y+r*0.6>b&&y-r*1.4<e)out.push(n.id);}return [...new Set(out)];},ids);
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
const touch=mode!=='desk';
const tap=async loc=>{if(touch)await loc.tap();else await loc.click();await p.waitForTimeout(260);};
const btn=(t,sel)=>p.locator((sel||'#overlay button, .tm-item').split(',').map(x=>x.trim()+':visible').join(', '),{hasText:t}).first();
const screen=()=>E(()=>{const o=document.getElementById('overlay');if(o.hidden)return 'play:'+__sf.st();const h=o.querySelector('h2,.ss-title,.pz-title,.form-head');return (o.firstElementChild&&o.firstElementChild.className.split(' ')[0])+':'+(h?h.textContent.replace(/\s+/g,' ').trim().slice(0,30):'');});
const backBtn=async()=>{const b=p.locator('#overlay [data-back]').first();if(await b.count()&&await b.isVisible()){await tap(b);return true;}return false;};
const titleShown=()=>E(()=>!!document.querySelector('.tm-menu .tm-item')&&/Story/.test(document.body.textContent));
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack','swap','sun','moon','ult']}));});
const sv=save(1);for(const id of ['kairos','ines','bram','noemi','theo','lucan','cass','dess'])sv.chars[id]={xp:0,lvl:6,slots:{sun:null,moon:null,rising:null}};
for(const q of ['agnes_handmade','bram_bread','lark_couldnt_save'])sv.mx.q[q]={s:'done',n:9};
await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);
await E(()=>{for(let i=0;i<5;i++)__sf.grant({frag:'star'},'w:f'+i);});
// 1. Builds: every character × every tab, then back to the title
await tap(btn('Builds'));let sw=0,errs0=errs.length;
for(const ch of ['Agnes','Naomi','Dess','Kairos']){await tap(p.locator('#overlay .bv-tabs button, #overlay .tab',{hasText:ch}).first());
  for(const t of ['Skills','Level & milestones','Fragments']){await tap(btn(t,'#overlay .seg button'));sw++;}}
ok(errs.length===errs0&&/Builds|Kairos/i.test(await E(()=>document.getElementById('overlay').textContent)),'Builds: '+sw+' tab switches across four characters, no errors');
// equip a fragment, then unequip it
const eq=await E(()=>{const t=document.querySelector('#overlay .ftile');if(!t)return 'none';t.click();return 'clicked';});await p.waitForTimeout(250);
const eqb=p.locator('#overlay button:visible',{hasText:/^Equip to/}).first();if(await eqb.count()){await tap(eqb);}
ok(await E(()=>Object.values(__sf.save().chars.kairos.slots).some(Boolean))||eq==='none','Builds: a fragment can be picked and equipped ('+eq+')');
const xv=await E(()=>{const x=document.querySelector('#overlay .bv-x');if(!x)return 'no sheet';const r=x.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return x===hit||x.contains(hit)?'visible':'hidden ('+Math.round(r.top)+')';});
ok(xv==='visible'||xv==='no sheet','the fragment sheet’s × close button is on screen and tappable ('+xv+')');
if(xv!=='no sheet'){await tap(p.locator('#overlay .bv-x').first());ok(await E(()=>!document.querySelector('#overlay .bv-detail .detail')),'× closes the fragment sheet');}
await tap(btn('Backup'));ok(/Back up your progress/.test(await E(()=>document.getElementById('overlay').textContent)),'Builds → Backup opens');
ok(await E(()=>{const l=document.querySelector('.file-pick');return !!l&&getComputedStyle(l.querySelector('input')).opacity==='0';}),'the backup screen shows a game-styled “Choose a backup file” button (native picker hidden inside it)');
await backBtn();ok(/Builds|Fragments/i.test(await E(()=>document.getElementById('overlay').textContent)),'Backup → Back returns to Builds');
await backBtn();ok(await titleShown(),'Builds → Back returns to the title');
// 2. Guide: all tabs, then back
await tap(btn('Guide'));let gt=0;for(const t of ['Controls','Combat','Team','Characters','Vices','Runs','Builds','Start here']){if(await tap(btn(t,'#overlay .gtab, #overlay nav button, #overlay button')).then(()=>1))gt++;}
ok(errs.length===errs0,'Guide: '+gt+' tabs opened, no errors');await backBtn();ok(await titleShown(),'Guide → Back returns to the title');
// 3. Meridian menu → Journal tabs ×2 → Back → Renown claim → Back
await tap(btn('Meridian'));await tap(btn('Journal'));for(let r=0;r<2;r++)for(const t of ['Stories','Records','Map','Quests'])await tap(btn(t,'#overlay .mx-tabs button, #overlay button'));
ok(errs.length===errs0,'Journal: tabs switched back and forth, no errors');await backBtn();ok(/World map/.test(await E(()=>document.getElementById('overlay').textContent)),'Journal → Back returns to the Meridian menu');
await tap(btn('Renown'));const d0=await E(()=>__sf.save().dust);const claim=p.locator('#overlay .mx-rank.ready button').first();
if(await claim.count()){await tap(claim);const d1=await E(()=>__sf.save().dust);const fb=await E(()=>document.getElementById('overlay').textContent);
  ok(d1>d0&&/Claimed/.test(fb),'Renown: claiming pays and the row shows “Claimed” ('+d0+' → '+d1+')');}else ok(false,'Renown: no claimable rank to test');
ok(await E(()=>{const l=document.querySelector('#overlay .mx-list');return !!l&&getComputedStyle(l).maskImage!=='none'||getComputedStyle(l).webkitMaskImage!=='none';}),'Renown list fades at the bottom when more ranks are below');
await backBtn();await backBtn();ok(await titleShown(),'Renown → Back → Back returns to the title');
// 4. Battle: party → stages → rift → win → result → Stages → rift → pause → Quit/Home
await tap(btn('Battle'));await tap(btn('Choose a stage'));const nRift=await E(()=>document.querySelectorAll('#overlay .bm-card').length);
const clamp=await E(()=>{const r=document.querySelector('#overlay .bm-rule');return r?{lines:Math.round(r.getBoundingClientRect().height/parseFloat(getComputedStyle(r).lineHeight)),full:r.scrollHeight<=r.clientHeight+2}:null;});
ok(clamp&&(clamp.full||clamp.lines>=2),'Rift cards show the rule in full or at least two lines ('+JSON.stringify(clamp)+')');
await tap(p.locator('#overlay .bm-card').first());await p.waitForTimeout(2200);ok(await E(()=>__sf.st())==='play','a Rift starts');
for(let i=0;i<30&&await E(()=>__sf.st())==='play';i++){await E(()=>__sf.kill());await p.waitForTimeout(500);}await p.waitForTimeout(2600);ok(/Stages|STAGES/i.test(await E(()=>document.getElementById('overlay').textContent)),'winning shows the result screen with Stages');
await tap(btn('Stages'));ok(await E(()=>document.querySelectorAll('#overlay .bm-card').length)===nRift,'Stages returns to the stage list');
await tap(p.locator('#overlay .bm-card').first());await p.waitForTimeout(2000);
if(touch){const b=await E(()=>{const H=__sf.hud();return {x:H.btn.pause.x,y:H.btn.pause.y};});await p.touchscreen.tap(b.x,b.y);}else await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok(await E(()=>!!document.querySelector('#overlay .pz')),'pause opens in a Rift');await tap(p.locator('#overlay .tm-item',{hasText:/Quit|Home|Main menu/}).first());await p.waitForTimeout(500);
ok(await titleShown()&&await E(()=>__sf.st())!=='play','quitting a Rift returns to the title');
// 5. Story quest: accept an offer, then the step updates (Bram, The Smell of Fresh Bread)
await load((()=>{const s=save(1);return s;})());await go('tower');
const before=await E(()=>__sf.qstate('bram_bread'));for(let k=0;k<2;k++){await interact('h_bram');for(let i=0;i<20&&(await E(()=>__sf.st()))==='dialog';i++){await p.keyboard.press('Space');await p.waitForTimeout(70);}await p.waitForTimeout(300);}
await p.waitForTimeout(300);const after=await E(()=>__sf.qstate('bram_bread'));ok(after==='active'||after==='done','talking to Bram reveals his story, talking again starts it ('+before+' → '+after+')');
ok(await E(()=>__sf.st())==='play'&&await E(()=>document.getElementById('overlay').hidden),'after the offer, play resumes with nothing left on screen');
// 6. repeated menu round-trips from the title: no listeners or nodes pile up
const cdp=await ctx.newCDPSession(p);await p.goto(url);await p.waitForTimeout(500);await cdp.send('Performance.enable');
const met=async()=>{await cdp.send('HeapProfiler.collectGarbage').catch(()=>{});const m=(await cdp.send('Performance.getMetrics')).metrics;const g=k=>(m.find(x=>x.name===k)||{}).value;return [g('JSEventListeners'),g('Nodes')];};
const m0=await met();for(let i=0;i<6;i++){for(const t of ['Builds','Guide','Meridian','Battle']){await tap(btn(t));await backBtn();}}const m1=await met();
ok(m1[0]-m0[0]<30&&m1[1]-m0[1]<400,'24 menu round-trips: listeners '+m0[0]+' → '+m1[0]+', DOM nodes '+m0[1]+' → '+m1[1]);
ok(await titleShown(),'…and the title menu is still there and working');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/uxwalk_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
