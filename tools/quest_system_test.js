// Quest System Foundation (Pre-Chapter 2 · Implementation Phase 2) test. Usage: node quest_system_test.js [phone|small]
// Uses temporary test quests (ids tq_*) injected into MX_QUESTS; no story content. Covers QUEST_TEST_PLAN.md § 2.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const E=(f,a)=>p.evaluate(f,a);
const npc=id=>E(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n?{x:n.x,y:n.y}:null;},id);
const press=async()=>{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);const lines=[];
  for(let i=0;i<20;i++){if(await E(()=>__sf.st())==='dialog'){lines.push(await E(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}await p.waitForTimeout(150);return lines;};
async function interact(id){let near=null;for(const [ox,oy] of [[-22,6],[22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){const n=await npc(id);if(!n)return {near:null,lines:[]};
    await E(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,ox,oy]);await p.waitForTimeout(160);near=await E(()=>__sf.m().near&&__sf.m().near.id);if(near===id)break;}
  return {near,lines:await press()};}
// test quests (functions cannot be stored, so they are re-registered after every reload, like real definitions are on every page load)
const inject=()=>E(()=>{const Q=__sf.mxQ,O=__sf.MXO(),x=()=>__sf.mx();if(Q.tq_a)return;
  Q.tq_a={title:'TQ A',desc:'a',kind:'bond',char:'bram',when:['fugitive'],at:'market',npc:'market.matteo',giver:'Old Matteo',
    offer:[['mxmat','A test story. Will you help?'],['kairos','Yes.']],
    steps:[{id:'two',t:'Do both things',objs:[O.flag('tq1','Thing one'),O.flag('tq2','Thing two',{at:'plaza'})]},O.visit('ward','Go to St. Lucia’s')],
    reward:{dust:10,keep:1,bond:['bram'],xp:{bram:200},frag:'boss',rec:{id:'tq_rec',title:'Test keepsake'}},sets:['tq.a'],onDone:()=>{window.__tqEvent=(window.__tqEvent|0)+1;}};
  Q.tq_b={title:'TQ B',desc:'b',kind:'bond',char:'ines',when:['fugitive'],found:()=>!!(x().looked||{})['look.wanted.market'],steps:[O.flag('tqb','Do B')],reward:{dust:7,bond:['ines']}};
  Q.tq_v={title:'TQ V',desc:'v',kind:'side',when:['fugitive'],found:()=>x().at==='yard',steps:[O.flag('tqv','x')],reward:{dust:1}};
  Q.tq_dess={title:'TQ Dess',desc:'d',kind:'bond',char:'dess',when:['fugitive'],pre:['tq_a','tq_b','tq_mem'],autoFind:1,steps:[O.flag('tqd','x')],reward:{dust:3}};
  Q.tq_mem={title:'TQ Memory',desc:'m',kind:'memory',char:'lucan',when:['fugitive'],steps:[O.flag('tqm','x')],reward:{dust:2}};
  Q.tq_hang={title:'TQ Hangout',desc:'h',kind:'hangout',char:'lucan',steps:[O.flag('tqh','x')],reward:{dust:2}};
  Q.tq_hang2={title:'TQ Hangout 2',desc:'h2',kind:'hangout',char:'lucan',when:['fugitive'],steps:[O.flag('tqh2','x')]};
  Q.tq_day={title:'TQ Daily',desc:'r',kind:'side',when:['fugitive'],repeat:'daily',steps:[O.flag('tqday','x')],first:{keep:1},reward:{dust:5}};
  Q.tq_once={title:'TQ Once',desc:'o',kind:'side',when:['fugitive'],steps:[O.flag('tqonce','x')],reward:{dust:4}};
  Q.tq_fight={title:'TQ Fight',desc:'f',kind:'side',when:['fugitive'],steps:[O.won('mxf_roof_tq','Win the fight')],reward:{dust:1}};});
const OLD={v:2,chars:{kairos:{xp:30,lvl:6,slots:{sun:null,moon:null,rising:null},mp:4},bram:{xp:10,lvl:3,slots:{sun:null,moon:null,rising:null}}},frags:[{id:1,src:'boss'}],dust:321,nextId:9,keep:2,
  claims:{'mxq:streets':1,'mxq:glasses':1,'renown:1':1,'chest:2026-11-24:market:0':1,'act:drill':1},bonds:{bram:2},ch1Clears:1,ch1b:{i:50,k:'Scene 14#9',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{x:1},done:1},
  mx:{v:1,at:'market',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1},talk:{'market.matteo':3},found:{'market.plaque':1},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1},day:{k:'2026-11-24'}}};
const load=async sv=>{await E(sv=>sv?localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)):localStorage.removeItem('starfall-ascent-save'),sv);await p.reload();await p.waitForTimeout(600);await inject();await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
try{
await p.addInitScript(()=>{window.__mxDay='2026-11-24';});
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── 11. save compatibility: fresh save
await load(null);let s=await S();
ok(s&&s.mx&&s.mx.qseen&&typeof s.mx.qseen==='object'&&s.mx.mem&&typeof s.mx.mem==='object','fresh save: quest fields are created with empty defaults');
ok(await E(()=>__sf.lucas())==='free'&&await E(()=>__sf.qstate('tq_a'))==='locked_by_story','fresh save: Lucas is free and post-Chapter 1 stories are story-locked');
// ── existing save without any of the new fields
await load(OLD);s=await S();
const keep=['dust','keep','nextId','ch1Clears'].every(k=>s[k]===OLD[k])&&JSON.stringify(s.chars.kairos)===JSON.stringify(OLD.chars.kairos)&&s.chars.bram.lvl===3&&s.bonds.bram===2;
ok(keep,'existing save: Stardust, Keepsakes, levels, Mastery and Bond are unchanged'+(keep?'':' '+JSON.stringify({nc:Object.keys(s.claims).filter(k=>!OLD.claims[k]),d:s.dust,k:s.keep,n:s.nextId,c:s.ch1Clears,ka:s.chars.kairos,b:s.chars.bram.lvl,bo:s.bonds})));
ok(Object.keys(OLD.claims).every(k=>s.claims[k])&&JSON.stringify(s.ch1b)===JSON.stringify(OLD.ch1b),'existing save: claims (quests, Renown, opened chests, activities) and Chapter 1 progress are unchanged');
ok(JSON.stringify(s.mx.seen)===JSON.stringify(OLD.mx.seen)&&s.mx.q.streets.s==='done'&&s.mx.found['market.plaque']&&s.mx.talk['market.matteo']===3,'existing save: Meridian discoveries, quests, records and talks are unchanged');
ok(s.mx.qseen&&s.mx.mem&&!s.story,'existing save: new fields are added empty (story flags only on first use)');
// a corrupted new field is repaired, not trusted
await load(Object.assign({},OLD,{story:[1,2],mx:Object.assign({},OLD.mx,{qseen:[1],mem:'x'})}));
ok(await E(()=>{const x=__sf.mx();return !Array.isArray(x.qseen)&&typeof x.mem==='object'&&!Array.isArray(__sf.story());}),'malformed new fields are reset to empty, the rest of the save is kept');
await load(OLD);
// ── 1. registration and 3. availability
ok(await E(()=>['tq_a','tq_b','tq_dess','tq_mem','tq_hang'].every(id=>__sf.qstate(id)!==null)),'test quests register in MX_QUESTS');
ok(await E(()=>__sf.qstate('tq_a'))==='undiscovered','an unlocked, unseen story is undiscovered');
ok(await E(()=>__sf.qstate('tq_dess'))==='locked_by_prerequisite','the Dess-style story is locked by prerequisite');
// ── 2. discovery through the world: NPC, readable, location
ok(await E(()=>__sf.offerAt('market.matteo'))==='tq_a'&&await E(()=>__sf.m().npcs.find(n=>n.id==='matteo').mkf())==='!','the giver shows "!" over their head');
ok(await E(()=>!!__sf.qplaces().market===false),'an undiscovered story does not mark the map yet');
const o=await interact('matteo');ok(o.lines.some(l=>/test story/.test(l)),'talking to the giver gives the offer');
ok(await E(()=>__sf.qstate('tq_a'))==='active','and starts the story (discovered + active)');
await E(()=>__sf.mxGo('market'));await p.waitForTimeout(800);
const lk=await interact('look.wanted.market');ok(lk.near==='look.wanted.market'&&await E(()=>__sf.qstate('tq_b'))==='available','reading a notice discovers a story that is found by a readable');
await E(()=>__sf.mxGo('yard'));await p.waitForTimeout(800);ok(await E(()=>__sf.qstate('tq_v'))==='available','entering a district discovers a story found by location');
ok(await E(()=>!!__sf.qplaces().yard===false),'an available story without a start district adds no marker');
// ── 5. multiple objectives (any order) and 6. progression
let g=await E(()=>__sf.goal());ok(/TQ A: Do both things \(0 \/ 2\)/.test(g),'the objective bar shows the multi-objective step ('+g+')');
ok(await E(()=>!!__sf.qplaces().plaza),'an unfinished objective marks its district');
await E(()=>{__sf.mx().f.tq2=1;__sf.qtick();});ok(await E(()=>__sf.mx().q.tq_a.n)===0&&/\(1 \/ 2\)/.test(await E(()=>__sf.goal())),'one of two objectives done: still on the step (1 / 2)');
await E(()=>{__sf.mx().f.tq1=1;__sf.qtick();});ok(await E(()=>__sf.mx().q.tq_a.n)===1,'both done, in the other order: the step advances');
ok(await E(()=>!!__sf.qplaces().ward),'the next step marks St. Lucia’s');
// ── 7. completion, 8. rewards, 12. Recollection (Bond + Memories), collectibles, story flags, events
const before=await S();const xp0=before.chars.bram.lvl*1000+before.chars.bram.xp;
await E(()=>__sf.mxGo('ward'));await p.waitForTimeout(900);s=await S();
ok(s.mx.q.tq_a.s==='done'&&await E(()=>__sf.qstate('tq_a'))==='completed','arriving completes the story');
ok(s.dust===before.dust+10&&s.keep===before.keep+1&&s.frags.length===before.frags.length+1,'Stardust, a Keepsake and a Fragment are paid');
ok(s.bonds.bram===before.bonds.bram+1&&s.chars.bram.lvl*1000+s.chars.bram.xp>xp0,'Bond +1 and Memories (Recollection XP) go to Bram ('+before.chars.bram.lvl+'→'+s.chars.bram.lvl+')');
ok(s.mx.mem.tq_rec&&s.story['tq.a']&&await E(()=>window.__tqEvent)===1,'the Journal collectible, the story flag and the character event are recorded');
// ── 9. no duplicate rewards
const d1=s.dust;await E(()=>{__sf.qstart('tq_a');__sf.qtick();__sf.grant(__sf.mxQ.tq_a.reward,'mxq:tq_a');});await E(()=>__sf.mxGo('ward'));await p.waitForTimeout(800);
s=await S();ok(s.dust===d1&&s.mx.q.tq_a.s==='done'&&s.bonds.bram===before.bonds.bram+1,'a completed one-time story cannot be restarted or paid twice');
// repeatable only when configured
await E(()=>{__sf.qstart('tq_day');__sf.mx().f.tqday=1;__sf.qtick();});s=await S();const dd=s.dust,kk=s.keep;
ok(s.claims['mxq:tq_day']&&s.claims['mxq:tq_day:2026-11-24'],'a daily story pays its first-clear and today’s reward');
await E(()=>{__sf.qstart('tq_day');__sf.qtick();});ok(await E(()=>__sf.qstate('tq_day'))==='completed'&&(await S()).dust===dd,'it cannot be repeated the same day');
await E(()=>{window.__mxDay='2026-11-25';});ok(await E(()=>__sf.qstate('tq_day'))==='available','the next day it is available again');
await E(()=>{__sf.qstart('tq_day');__sf.qtick();});s=await S();ok(s.dust===dd+5&&s.keep===kk&&s.mx.q.tq_day.runs===2,'the repeat pays the daily reward only, not the first-clear one again');
await E(()=>{window.__mxDay='2026-11-24';});
await E(()=>{__sf.qstart('tq_once');__sf.mx().f.tqonce=1;__sf.qtick();window.__mxDay='2026-11-26';});ok(await E(()=>__sf.qstate('tq_once'))==='completed','a one-time story stays completed on later days');await E(()=>{window.__mxDay='2026-11-24';});
// ── 13. Dess-style prerequisites, flexible order
ok(await E(()=>__sf.qstate('tq_dess'))==='locked_by_prerequisite','with one of three done it stays locked');
await E(()=>{__sf.qstart('tq_mem');});ok(await E(()=>__sf.qstate('tq_dess'))==='locked_by_prerequisite','starting (not finishing) a prerequisite does not unlock it');
await E(()=>{__sf.mx().f.tqm=1;__sf.qtick();});ok(await E(()=>__sf.qstate('tq_dess'))==='locked_by_prerequisite','two of three: still locked');
await E(()=>{__sf.qstart('tq_b');__sf.mx().f.tqb=1;__sf.qtick();});
ok(await E(()=>__sf.qstate('tq_dess'))==='available'&&(await S()).mx.qseen.tq_dess,'the last prerequisite (in any order) unlocks and discovers it automatically');
// ── 14. Lucas story states
ok(await E(()=>__sf.lucas())==='captured','after Chapter 1 Lucas is captured');
ok(await E(()=>__sf.qstate('tq_mem'))==='completed','memories of Lucas are playable while he is captured');
ok(await E(()=>[__sf.qstate('tq_hang'),__sf.qstate('tq_hang2')].every(s=>s==='locked_by_story')),'present-day Lucas hangouts are story-locked, even one that forgets to say so');
await E(()=>{__sf.qstart('tq_hang');__sf.qstart('tq_hang2');});ok(await E(()=>!__sf.mx().q.tq_hang&&!__sf.mx().q.tq_hang2),'they cannot be started while he is captured');
await E(()=>__sf.mxGo('tower'));await p.waitForTimeout(800);ok(await E(()=>!__sf.m().npcs.some(n=>n.ch==='lucan')),'no present-day Lucas at the hideout');
await E(()=>__sf.setStory('ch2.lucasRescued'));ok(await E(()=>__sf.lucas())==='rescued'&&await E(()=>__sf.qstate('tq_hang'))==='undiscovered','after the Chapter 2 rescue flag, hangouts unlock');
await E(()=>{delete __sf.story()['ch2.lucasRescued'];});
// ── battles as objectives
const fw=await E(()=>{__sf.qstart('tq_fight');return __sf.mxQ.tq_fight.steps[0].ok();});
await E(()=>{window.__mxFightResult=undefined;__sf.mxFight('roof_tq');});await p.waitForTimeout(1500);
const mid=await E(()=>__sf.m().M.id||null);await E(()=>__sf.win());for(let i=0;i<30;i++){await p.waitForTimeout(200);if(await E(()=>window.__mxFightResult)!==undefined)break;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}
ok(!fw&&await E(()=>__sf.qstate('tq_fight'))==='completed','winning a hub fight completes a "win the fight" objective');
// ── 10. persistence across reload
await p.reload();await p.waitForTimeout(600);await inject();await E(()=>__sf.mxBegin());await p.waitForTimeout(800);
const ps=await E(()=>['tq_a','tq_b','tq_v','tq_dess','tq_mem','tq_day'].map(id=>id+':'+__sf.qstate(id)).join(','));
ok(/tq_a:completed/.test(ps)&&/tq_b:completed/.test(ps)&&/tq_v:available/.test(ps)&&/tq_dess:available/.test(ps)&&/tq_mem:completed/.test(ps),'states survive a reload ('+ps+')');
s=await S();const dz=s.dust;await E(()=>__sf.qtick());ok((await S()).dust===dz,'nothing is paid again after the reload');
// ── Journal (Stories tab) on this screen size
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
const jt=await E(()=>document.body.textContent);
ok(/TQ A/.test(jt)&&/Kept in the Journal: Test keepsake/.test(jt)&&/TQ Dess/.test(jt)&&!/TQ Hangout/.test(jt),'the Stories tab lists found stories and collectibles, never locked hangouts');
ok(await E(()=>{const r=document.querySelector('.mx-list');return r&&r.scrollWidth<=r.clientWidth+1;}),'the Stories list fits the screen width');
await p.screenshot({path:`out/qsys_${mode}_stories.png`});
ok(!/TQ A/.test(await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Quests/.test(b.textContent));b.click();return new Promise(r=>setTimeout(()=>r(document.querySelector('.mx-list').textContent),250));})),'stories are not duplicated in the Quests tab');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/qsys_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
