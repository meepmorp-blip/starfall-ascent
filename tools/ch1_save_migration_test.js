// Chapter 1 revision · save migration against real-shaped old saves (tools/fixtures/ch1_old_saves.json), with the revision LIVE.
// For every fixture: put it in storage, load the game (migration runs at start-up), and check:
//  the resume key, the resume step and the party in the revised chapter; nothing else in the save changed; the original kept
//  in ch1b_pre_rev; a snapshot taken first; a second load changes nothing; Continue really resumes there.
// Usage: node ch1_save_migration_test.js
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs'),path=require('path');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','ch1_old_saves.json'),'utf8'));
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);const E=(f,a)=>p.evaluate(f,a);
const strip=s=>{const o=JSON.parse(JSON.stringify(s));delete o.ch1b;delete o.ch1b_pre_rev;delete o.v;return o;};
// nothing the player had is lost (the game itself may add things on load: offers, rewards); this is what migration must guarantee
const lost=(a,f)=>{const L=[];
  for(const id in f.chars){const x=a.chars[id],y=f.chars[id];if(!x||x.lvl!==y.lvl||x.xp!==y.xp||JSON.stringify(x.slots)!==JSON.stringify(y.slots))L.push('character '+id);}
  if(JSON.stringify(a.frags)!==JSON.stringify(f.frags))L.push('fragments');
  if((a.dust|0)<(f.dust|0))L.push('Stardust');if((a.keep|0)<(f.keep|0))L.push('Keepsakes');
  for(const k in (f.claims||{}))if(!(a.claims||{})[k])L.push('claim '+k);
  for(const k in (f.bonds||{}))if(((a.bonds||{})[k]|0)<f.bonds[k])L.push('bond '+k);
  if(JSON.stringify(a.stars)!==JSON.stringify(f.stars))L.push('star ratings');
  for(const k in ((f.mx||{}).q||{}))if(f.mx.q[k].s==='done'&&!(a.mx&&a.mx.q&&a.mx.q[k]&&a.mx.q[k].s==='done'))L.push('quest '+k);
  for(const k in (f.story||{}))if(!(a.story||{})[k])L.push('story flag '+k);
  if((a.ch1Clears|0)<(f.ch1Clears|0))L.push('Chapter 1 clears');return L;};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1}));});
for(const fx of FIX){
  await E(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('starfall-ascent-save'))localStorage.removeItem(k);});
  await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),fx.save);await p.reload();await p.waitForTimeout(400);
  const after=await E(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
  const snap=await E(()=>{const s=localStorage.getItem('starfall-ascent-save-snap-1');return s?JSON.parse(s).save:null;});
  await p.reload();await p.waitForTimeout(400);const after2=await E(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
  const r=[];
  {const L=lost(after,fx.save);if(L.length)r.push('lost: '+L.join(', '));}
  if(fx.none){if(after.ch1b_pre_rev)r.push('touched a save with no usable Chapter 1 data');}
  else if(fx.already){if(!same(after.ch1b,fx.save.ch1b))r.push('re-migrated an already migrated save');}
  else{
    if(after.ch1b.k!==fx.want)r.push('key '+after.ch1b.k+' (want '+fx.want+')');
    if(after.ch1b.rev!==2)r.push('rev '+after.ch1b.rev);
    if(!same(after.ch1b_pre_rev,fx.save.ch1b))r.push('original not kept in ch1b_pre_rev');
    if(!same(after.ch1b.flags,fx.save.ch1b.flags))r.push('choice flags changed');
    if(!(fx.save.ch1b.roster||[]).every(id=>(after.ch1b.met||[]).includes(id)))r.push('someone met before is no longer met');
    if(fx.save.ch1b.done){if(!after.ch1b.done||after.ch1b.k!==fx.save.ch1b.k||after.ch1Clears!==fx.save.ch1Clears)r.push('cleared progress changed');}
    else{ // the resume step and party in the revised chapter
      const want=await E(k=>{const q=__sf.ch1seq();const [tag,off]=k.split('#');const a=tag==='start'?0:q.findIndex(x=>x.sc&&x.sc.split('·')[0].trim()===tag);return {i:a+(+off||0),roster:__sf.ch1RosterAt(a+(+off||0)).roster};},fx.want);
      if(after.ch1b.i!==want.i)r.push('resume index '+after.ch1b.i+' (want '+want.i+')');
      if(!same(after.ch1b.roster,want.roster))r.push('party '+after.ch1b.roster.join(',')+' (want '+want.roster.join(',')+')');
      if(!fx.save.ch1b.done){await E(()=>__sf.ch1(false));await p.waitForTimeout(500);const si=await E(()=>__sf.seq()&&__sf.seq().i);if(si!==want.i)r.push('Continue resumed at '+si+' (want '+want.i+')');}
    }
    if(!snap||!same(snap.ch1b,fx.save.ch1b))r.push('no snapshot of the pre-migration save');
    if(!same(after2,after)&&!(!fx.save.ch1b.done))r.push('a second load changed something');
    if(!fx.save.ch1b.done&&(after2.ch1b.rev!==2||after2.ch1b_pre_rev==null||!same(after2.ch1b_pre_rev,fx.save.ch1b)))r.push('a second load changed the migration');}
  ok(!r.length,fx.name+(r.length?': '+r.join('; '):' → '+(fx.none?'left alone':after.ch1b.k+(after.ch1b.roster?' · '+after.ch1b.roster.join(','):''))));}
// a damaged ch1b must not break the title or the Story menu
await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),FIX.find(f=>/damaged/.test(f.name)).save);await p.reload();await p.waitForTimeout(400);
await E(()=>[...document.querySelectorAll('.tm-item')].find(b=>/Story/.test(b.textContent)).click());await p.waitForTimeout(400);
ok(await E(()=>/Chapter 1/.test(document.getElementById('overlay').textContent)),'a damaged Chapter 1 record still opens the Story menu');
// Ash Lane: open for anyone past the old Scene 10, or after the plan
for(const [k,want] of [['Scene 9#4',false],['Scene 11#1',true]]){const fx=FIX.find(f=>f.save.ch1b&&f.save.ch1b.k===k);
  await E(()=>{for(const k of Object.keys(localStorage))if(k.startsWith('starfall-ascent-save'))localStorage.removeItem(k);});
  await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),fx.save);await p.reload();await p.waitForTimeout(400);
  const st=await E(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])).ashlane);ok((st!=='locked')===want,'Ash Lane after migrating '+k+': '+st);}
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(path.join(__dirname,'out','ch1savemig_log.txt'),log.join('\n'));await b.close();server.close();})();
