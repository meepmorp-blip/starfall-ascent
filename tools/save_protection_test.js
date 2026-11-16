// Save protection: rolling backups, recovery, persistent-storage request, backup file, safe restore + undo, reminder, old saves.
// Runs in a throwaway browser profile on localhost: it never touches a real player's save. Usage: node save_protection_test.js [phone]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs'),path=require('path');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m),errs=[];
const KEY='starfall-ascent-save',PREFS={music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']};
const newPage=async(init)=>{const ctx=await b.newContext(Object.assign({acceptDownloads:true},VP));const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));p.on('dialog',d=>d.accept());if(init)await p.addInitScript(init);return p;};
const OLD={v:2,chars:{kairos:{xp:30,lvl:6,slots:{sun:null,moon:null,rising:null}}},frags:[{id:1,src:'boss'}],dust:321,nextId:9,keep:2,claims:{'mxq:streets':1},ch1Clears:1,ch1b:{done:1},mx:{v:1,at:'market',seen:{market:1},talk:{},found:{},q:{streets:{s:'done',n:2}},items:{},f:{}}};
const PRE_V2={chars:{kairos:{xp:10,lvl:3,slots:{sun:null,moon:null,rising:null}}},frags:[],dust:50,nextId:2};
try{
let p=await newPage();await p.goto(url);
const seed=async(sv,extra)=>{await p.evaluate(([sv,pr,extra,KEY])=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify(pr));if(sv)localStorage.setItem(KEY,JSON.stringify(sv));if(extra)for(const k in extra)localStorage.setItem(k,extra[k]);},[sv,PREFS,extra||null,KEY]);await p.reload();await p.waitForTimeout(700);};
const ls=k=>p.evaluate(k=>localStorage.getItem(k),k);
// ── old saves still load
await seed(OLD);let s=await p.evaluate(()=>__sf.save());
ok(s.dust===321&&s.chars.kairos.lvl===6&&s.keep===2&&s.claims['mxq:streets']&&s.ch1Clears===1,'an existing v2 save loads unchanged');
await seed(PRE_V2);s=await p.evaluate(()=>__sf.save());
ok(s.v===2&&s.dust===50&&s.chars.kairos.lvl===3&&s.keep===0&&typeof s.claims==='object'&&s.chars.bram,'a pre-v2 save (no version, no claims) loads and gets safe defaults');
// ── rolling backups
await seed(OLD);ok((await p.evaluate(()=>__sf.snaps().length))===1,'starting the game makes the first automatic backup');
const mainBefore=await ls(KEY);
for(const d of [1001,1002,1003,1004]){await p.evaluate(d=>{__sf.save().dust=d;__sf.snap(true);},d);}
let snaps=await p.evaluate(()=>__sf.snaps().map(x=>x.save.dust));ok(snaps.length===3&&snaps.join()==='1004,1003,1002','only the three newest backups are kept, newest first ('+snaps.join()+')');
ok(await ls(KEY)===mainBefore,'making backups never writes the main save');
await p.evaluate(()=>{__sf.save().dust=2000;});ok(await p.evaluate(()=>__sf.snap(false))===false,'outside milestones, backups are spaced out (at most one every 10 minutes)');
const before=await p.evaluate(()=>__sf.snaps().map(x=>x.at).join());
await p.evaluate(()=>{const s=__sf.save();s._c=s.chars;s.chars=null;});ok(await p.evaluate(()=>__sf.snap(true))===false&&await p.evaluate(()=>__sf.snaps().map(x=>x.at).join())===before,'an invalid save is never backed up');
await p.evaluate(()=>{const s=__sf.save();s.chars=s._c;delete s._c;});
// ── recovery
await p.evaluate(K=>localStorage.setItem(K,'{"chars":'),KEY);await p.reload();await p.waitForTimeout(700);
s=await p.evaluate(()=>__sf.save());const warn=await p.evaluate(()=>document.body.textContent);
ok(s.dust===1004&&/automatic backup/.test(warn),'an unreadable save is replaced by the newest automatic backup, with a notice');
ok(await p.evaluate(K=>{try{return !!JSON.parse(localStorage.getItem(K)).chars;}catch(_){return false;}},KEY),'the recovered save is written back as a valid save');
ok(await p.evaluate(K=>Object.keys(localStorage).some(k=>k.startsWith(K+'-broken-')),KEY),'the unreadable save is kept as a broken copy');
for(let i=0;i<3;i++){await p.evaluate(K=>localStorage.setItem(K,'garbage'),KEY);await p.reload();await p.waitForTimeout(400);}
ok(await p.evaluate(K=>Object.keys(localStorage).filter(k=>k.startsWith(K+'-broken-')).length,KEY)<=2,'only the two newest broken copies are kept');
await p.evaluate(K=>localStorage.removeItem(K),KEY);await p.reload();await p.waitForTimeout(700);
ok(await p.evaluate(()=>__sf.save().dust)===0&&/No save was found on this device, but automatic backups were/.test(await p.evaluate(()=>document.body.textContent)),'a missing save is not silently replaced: the player is told backups exist');
// ── backup file
await seed(OLD);await p.evaluate(()=>__sf.builds());await p.waitForTimeout(300);await p.locator('button',{hasText:'Backup'}).first().click();await p.waitForTimeout(300);
ok(await p.locator('text=Download backup file').count()===1&&await p.locator('text=Automatic backups on this device').count()===1,'the Backup screen offers a backup file and lists automatic backups');
await p.screenshot({path:`out/save_${mode}_backup.png`});
const [dl]=await Promise.all([p.waitForEvent('download'),p.locator('button',{hasText:'Download backup file'}).click()]);
const fpath=path.join(__dirname,'out','_backup_'+mode+'.json');await dl.saveAs(fpath);const bk=JSON.parse(fs.readFileSync(fpath,'utf8'));
ok(/^starfall-backup-\d{4}-\d\d-\d\d\.json$/.test(dl.suggestedFilename()),'the file has a clear name ('+dl.suggestedFilename()+')');
ok(bk.k==='sfa'&&bk.format==='starfall-ascent-backup'&&bk.v===1&&bk.saveV===2&&bk.save.dust===321&&bk.save.chars.kairos.lvl===6&&Object.keys(bk).sort().join()==='at,format,k,save,saveV,v','the file holds the save plus version info, nothing else');
ok(await p.evaluate(()=>!!JSON.parse(localStorage.getItem('starfall-ascent-prefs')).lastBackupAt),'downloading records the backup time');
// ── invalid backups are rejected
const errsOf=await p.evaluate(()=>['nonsense','{"k":"sfa","save":{}}','{"k":"sfa","saveV":3,"save":{"chars":{}}}','SFA1-!!!!','{"foo":1}'].map(t=>__sf.parseBackup(t).error||'accepted'));
ok(errsOf.every(e=>e!=='accepted')&&/newer version/.test(errsOf[2]),'invalid, damaged and newer-version backups are rejected ('+errsOf.map(e=>e.slice(0,24)).join(' | ')+')');
// ── restore from a file, then undo
const alt=Object.assign({},bk,{save:Object.assign({},bk.save,{dust:777})});const apath=path.join(__dirname,'out','_alt_'+mode+'.json');fs.writeFileSync(apath,JSON.stringify(alt));
await p.locator('input[type=file]').setInputFiles(apath);await p.waitForTimeout(600);
ok(await p.evaluate(()=>__sf.save().dust)===777&&!!(await ls(KEY+'-prev')),'restoring a file replaces progress and keeps the old save');
ok(await p.locator('button',{hasText:'Undo restore'}).count()===1,'an “Undo restore” button appears');
await p.locator('button',{hasText:'Undo restore'}).click();await p.waitForTimeout(400);
ok(await p.evaluate(()=>__sf.save().dust)===321&&!(await ls(KEY+'-prev')),'undo brings the earlier progress back');
const badPath=path.join(__dirname,'out','_bad_'+mode+'.json');fs.writeFileSync(badPath,'{"k":"sfa","save":{"chars":[]}}');
await p.locator('input[type=file]').setInputFiles(badPath);await p.waitForTimeout(500);
ok(await p.evaluate(()=>__sf.save().dust)===321&&/damaged/.test(await p.evaluate(()=>document.body.textContent)),'a damaged file is refused and nothing changes');
// the old code path still works (round trip)
await p.evaluate(()=>{const c=[...document.querySelectorAll('textarea')][0].value;window.__code=c;});
ok(await p.evaluate(()=>__sf.parseBackup(window.__code).save.dust)===321,'backup codes still round-trip');
// ── reminder: title screen only, dismissable
await seed(OLD);await p.evaluate(()=>{const pr=JSON.parse(localStorage.getItem('starfall-ascent-prefs'));pr.lastBackupAt=Date.now()-8*864e5;localStorage.setItem('starfall-ascent-prefs',JSON.stringify(pr));});
await p.reload();await p.waitForTimeout(700);ok(await p.locator('.bk-remind').count()===1,'after 7 days without a backup, a reminder shows on the title screen');
await p.screenshot({path:`out/save_${mode}_remind.png`});
await p.locator('.bk-remind button',{hasText:'Later'}).click();ok(await p.locator('.bk-remind').count()===0,'“Later” dismisses it');
await p.reload();await p.waitForTimeout(700);ok(await p.locator('.bk-remind').count()===0,'and it stays snoozed after a reload');
await seed(OLD);ok(await p.locator('.bk-remind').count()===0,'a player who just started is not reminded');
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(600);ok(await p.locator('.bk-remind').count()===0,'never shown in play');
await p.close();
// ── persistent storage request: granted, denied, unsupported, failing
for(const [label,init,want] of [
  ['unsupported',()=>{Object.defineProperty(navigator,'storage',{value:undefined,configurable:true});},'unsupported'],
  ['denied',()=>{Object.defineProperty(navigator,'storage',{value:{persisted:()=>Promise.resolve(false),persist:()=>Promise.resolve(false)},configurable:true});},'denied'],
  ['granted',()=>{Object.defineProperty(navigator,'storage',{value:{persisted:()=>Promise.resolve(false),persist:()=>Promise.resolve(true)},configurable:true});},'granted'],
  ['throws',()=>{Object.defineProperty(navigator,'storage',{value:{persisted:()=>Promise.reject(new Error('no')),persist:()=>Promise.reject(new Error('no'))},configurable:true});},'denied']]){
  p=await newPage(init);await p.goto(url);await p.waitForTimeout(700);const st=await p.evaluate(()=>__sf.storage());
  ok(st===want&&await p.evaluate(()=>!!document.querySelector('.tm-menu')),'persistent storage '+label+': handled quietly ('+st+')');await p.close();}
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/save_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
