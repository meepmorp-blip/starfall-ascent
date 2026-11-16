// Chapter 1 revision · infrastructure and save migration. Usage: node ch1_migration_test.js
// Stage 1: the key map, rebuilding the party from the sequence, the met list, and the hub's met check.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);const E=(f,a)=>p.evaluate(f,a);
const setSave=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(500);};
const base=()=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{}});
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1}));});await p.reload();await p.waitForTimeout(500);
// 1. the key map: every old key lands on a revised scene start (or stays, for unchanged scenes)
const MAP={'start#0':'start#0','Scene 3#4':'Scene 3#4','Scene 5#1':'Scene 5#1','Scene 6#5':'Scene 6#0','Scene 7#1':'Scene 7#0','Scene 8#0':'Scene 8#0',
  'Scene 9#2':'Scene 9#0','Scene 9#5':'Scene 9#0','Scene 9#6':'Scene 9.6#0','Scene 9#13':'Scene 9.6#0','Scene 10#3':'Scene 11#0','Scene 11#1':'Scene 11#0',
  'Scene 12#4':'Scene 12#0','Scene 13#2':'Scene 13#2','Scene 14#1':'Scene 14#1','Cold open#0':'Cold open#0'};
const bad=[];for(const [k,want] of Object.entries(MAP)){const got=await E(k=>__sf.ch1MigKey(k),k);if(got!==want)bad.push(k+'→'+got+' (want '+want+')');}
ok(!bad.length,'old scene keys map to the right resume points ('+Object.keys(MAP).length+' keys'+(bad.length?': '+bad.join('; '):'')+')');
ok(await E(()=>__sf.ch1MigKey('garbage'))===null,'an unreadable key is left alone');
// 2. the party is rebuilt by replaying joins/leaves in the sequence
const q=await E(()=>__sf.ch1seq().map(s=>s.join||s.leave||s.rejoin?{join:s.join,leave:s.leave,rejoin:s.rejoin}:{}));
const idxAfter=id=>q.findIndex(s=>s.join===id)+1;
const r1=await E(i=>__sf.ch1RosterAt(i),idxAfter('theo'));ok(['kairos','ines','bram','noemi','theo'].every(x=>r1.roster.includes(x)),'party rebuilt from the sequence after Theo joins ('+r1.roster.join(',')+')');
const r0=await E(()=>__sf.ch1RosterAt(0));ok(r0.roster.join()==='kairos','at the start only Kairos');
// 3. playing writes met and the chapter version; met only grows
const sv=base();sv.ch1b={i:0,k:'Scene 6#3',roster:['kairos','ines','bram'],flags:{},rev:2};await setSave(sv);
await E(()=>__sf.ch1(false));await p.waitForTimeout(600);
for(let i=0;i<400;i++){const s=await E(()=>({cut:!!__sf.cut(),st:__sf.st(),k:__sf.save().ch1b&&__sf.save().ch1b.k}));if(/^Scene 6#[5-9]/.test(s.k||''))break;if(i>60)break;
  const ch=await p.$$('.cchoice, .pzl-o');let did=false;for(const c of ch)if(await c.isVisible()){await c.click().catch(()=>{});did=true;break;}if(did){await p.waitForTimeout(60);continue;}
  if(s.cut){await E(()=>__sf.cutNext());await p.waitForTimeout(15);continue;}
  if(s.st==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(30);continue;}
  const bt=await p.$('#overlay:not([hidden]) [data-primary]');if(bt&&await bt.isVisible()){await bt.click().catch(()=>{});await p.waitForTimeout(80);continue;}
  if(s.st==='play'){await E(()=>__sf.win());await p.waitForTimeout(1500);continue;}await p.waitForTimeout(100);}
const c1=await E(()=>__sf.save().ch1b);
ok(Array.isArray(c1.met)&&['noemi','theo'].every(x=>c1.met.includes(x))&&c1.rev>=1,'the saved chapter keeps a met list and its version ('+JSON.stringify({met:c1.met,rev:c1.rev,k:c1.k})+')');
await p.reload();await p.waitForTimeout(500);ok(JSON.stringify(await E(()=>__sf.save().ch1b.met))===JSON.stringify(c1.met),'met survives a reload');
// 4. the hub's met check reads met, so someone who left the party is still met
const sv2=base();sv2.ch1b={i:30,k:'Scene 9#1',roster:['kairos','ines','bram','theo'],met:['kairos','ines','bram','noemi','theo'],flags:{}};await setSave(sv2);
ok(await E(()=>__sf.mxMet('noemi'))===true,'Naomi left the party but is still “met” in Meridian');
ok(await E(()=>__sf.mxMet('dess'))===false,'Dess, not met yet, is not');
// 5. old saves without met still work (roster fallback)
const sv3=base();sv3.ch1b={i:30,k:'Scene 9#1',roster:['kairos','ines','bram','noemi','theo'],flags:{}};await setSave(sv3);
ok(await E(()=>__sf.mxMet('noemi'))===true,'an old save without a met list falls back to the roster');
ok(await E(()=>__sf.save().ch1b.rev)===2&&await E(()=>__sf.save().ch1b.k)==='Scene 9#0','with the revision live, an old mid-chapter save (Scene 9#1) is migrated on load to the start of Lucas’s thread');
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync('out/ch1mig_log.txt',log.join('\n'));await b.close();server.close();})();
