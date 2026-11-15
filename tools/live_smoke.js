// Smoke test of the deployed GitHub Pages build (fresh browser profile; never touches a real player's save).
// Opens Meridian, visits all five districts, opens one chest, checks for page errors. Usage: node live_smoke.js [phone]
const {chromium}=require('playwright'),fs=require('fs');
const URL='https://meepmorp-blip.github.io/starfall-ascent/?debug';
const phone=process.argv[2]==='phone',tag=phone?'phone':'desk';
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext(phone?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
try{
await p.goto(URL,{waitUntil:'load'});await p.evaluate(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']})));
await p.goto(URL,{waitUntil:'load'});await p.waitForTimeout(1200);
ok(await p.locator('.tm-item',{hasText:'Meridian'}).count()===1,'live: home menu loads with Meridian');
await p.locator('.tm-item',{hasText:'Meridian'}).click();await p.waitForTimeout(500);
await p.locator('.tm-item',{hasText:'Walk the city'}).click();await p.waitForTimeout(1500);
for(const d of ['market','plaza','yard','chapel','ward']){await p.evaluate(d=>__sf.mxGo(d),d);await p.waitForTimeout(1300);
  const r=await p.evaluate(()=>({at:__sf.mx().at,st:__sf.st(),objs:(__sf.m().objs||[]).length,chests:__sf.m().npcs.filter(n=>n.tier).length}));
  ok(r.at===d&&r.st==='play'&&r.chests>=2,'live: '+d+' loads ('+r.chests+' chests, '+r.objs+' objects)');await p.screenshot({path:`out/live_${tag}_${d}.png`});}
await p.evaluate(()=>__sf.mxGo('market'));await p.waitForTimeout(1000);
const c=await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.tier);return {x:n.x,y:n.y};});
await p.evaluate(c=>{const pl=__sf.p();pl.x=c.x-22;pl.y=c.y+6;},c);await p.waitForTimeout(200);const d0=await p.evaluate(()=>__sf.save().dust);
await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(600);
ok(await p.evaluate(()=>__sf.save().dust)>d0,'live: opening a chest pays');
}catch(e){log.push('CRASH '+String(e).slice(0,200));}
ok(errs.length===0,'live: no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/live_${tag}_log.txt`,log.join('\n'));await b.close();})();
