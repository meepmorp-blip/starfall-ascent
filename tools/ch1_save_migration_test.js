// Chapter 1 revision · save migration against real-shaped old saves (tools/fixtures/ch1_old_saves.json).
// For every fixture: load it, force the migration, and check that only Chapter 1's resume data changed, nothing was lost,
// the original is kept, a snapshot was taken first, and a second run changes nothing. Also: with the switch off, nothing moves.
// Usage: node ch1_save_migration_test.js
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs'),path=require('path');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','ch1_old_saves.json'),'utf8'));
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);const E=(f,a)=>p.evaluate(f,a);
const strip=s=>{const o=JSON.parse(JSON.stringify(s));delete o.ch1b;delete o.ch1b_pre_rev;delete o.v;return o;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1}));});
for(const fx of FIX){
  await E(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('starfall-ascent-save'))localStorage.removeItem(k);});
  await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),fx.save);await p.reload();await p.waitForTimeout(400);
  // switch OFF (the shipped state until Stage 7): loading must not move anything
  const off=await E(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
  const offOk=fx.none?true:same(off.ch1b&&off.ch1b.k,fx.save.ch1b.k)&&!off.ch1b_pre_rev;
  const before=await E(()=>JSON.parse(JSON.stringify(__sf.save())));
  const ran=await E(()=>__sf.ch1MigrateSave(true));
  const after=await E(()=>JSON.parse(JSON.stringify(__sf.save())));
  const stored=await E(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
  const snap=await E(()=>{const s=localStorage.getItem('starfall-ascent-save-snap-1');return s?JSON.parse(s).save:null;});
  const ran2=await E(()=>__sf.ch1MigrateSave(true));const after2=await E(()=>JSON.parse(JSON.stringify(__sf.save())));
  const r=[];
  if(!offOk)r.push('moved while the switch is off');
  if(!same(strip(after),strip(before)))r.push('other save data changed');
  if(fx.none){if(ran)r.push('ran on a save with no usable Chapter 1 data');}
  else if(fx.already){if(ran||!same(after.ch1b,before.ch1b))r.push('re-migrated an already migrated save');}
  else{
    if(!ran)r.push('did not run');
    if(after.ch1b.k!==fx.want)r.push('key '+after.ch1b.k+' (want '+fx.want+')');
    if(after.ch1b.rev!==2)r.push('rev '+after.ch1b.rev);
    if(!same(after.ch1b_pre_rev,fx.save.ch1b))r.push('original not kept in ch1b_pre_rev');
    if(!same(after.ch1b.flags,fx.save.ch1b.flags))r.push('choice flags changed');
    if(!(fx.save.ch1b.roster||[]).every(id=>(after.ch1b.met||[]).includes(id)))r.push('someone met before is no longer met');
    if(fx.save.ch1b.done&&(!after.ch1b.done||after.ch1b.k!==fx.save.ch1b.k||after.ch1Clears!==fx.save.ch1Clears))r.push('cleared progress changed');
    if(!stored||stored.ch1b.rev!==2)r.push('not persisted');
    if(!snap||!same(snap.ch1b,fx.save.ch1b))r.push('no snapshot of the pre-migration save');
    if(ran2||!same(after2,after))r.push('second run changed something');}
  ok(!r.length,fx.name+(r.length?': '+r.join('; '):' → '+(fx.none?'left alone':after.ch1b.k)));}
// a damaged ch1b must not break the title or the Story menu
await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),FIX.find(f=>/damaged/.test(f.name)).save);await p.reload();await p.waitForTimeout(400);
await E(()=>[...document.querySelectorAll('.tm-item')].find(b=>/Story/.test(b.textContent)).click());await p.waitForTimeout(400);
ok(await E(()=>/Chapter 1/.test(document.getElementById('overlay').textContent)),'a damaged Chapter 1 record still opens the Story menu');
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(path.join(__dirname,'out','ch1savemig_log.txt'),log.join('\n'));await b.close();server.close();})();
