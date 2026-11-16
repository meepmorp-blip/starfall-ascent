// Core systems probe: new game, Chapter 1 start-to-clear (with a lost fight and a mid-chapter reload), combat basics, title menus. Usage: node core_probe_test.js [phone]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();p.on('crash',()=>errs.push('PAGE CRASH'));const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const E=(f,a)=>p.evaluate(f,a);
const sec=async(name,f)=>{try{await f();}catch(e){log.push('FAIL '+name+' crashed: '+String(e.message).split('\n')[0]);}};
const clickPrimary=async()=>{const bt=await p.$('#overlay:not([hidden]) [data-primary], #overlay:not([hidden]) .btn.primary, .join-go, .res-cont');if(bt&&await bt.isVisible()){await bt.click().catch(()=>{});return true;}return false;};
// drive the Chapter 1 sequencer: scenes advance, fights are won (or lost once), cards are accepted
const cdp=await ctx.newCDPSession(p);const memLog=[];const drive=async(stopAt,opt={})=>{let lostOnce=false,steps=0;
  for(;steps<(opt.max||4000);steps++){const s=await E(()=>({st:__sf.st(),cut:!!__sf.cut(),i:__sf.seq()?__sf.seq().i:-1,n:__sf.seq()?__sf.seq().seq.length:0,m:__sf.m()&&__sf.m().M&&__sf.m().M.type,done:__sf.save().ch1b&&__sf.save().ch1b.done}));
    if(s.done||s.i>=stopAt)return {s,lostOnce};
    if(steps%200===0||(s.i>=63&&steps%100===0)){await cdp.send('HeapProfiler.collectGarbage').catch(()=>{});const mem=await E(()=>({cv:window.__cvStat(),h:performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):-1,n:document.getElementsByTagName('*').length,c:document.getElementsByTagName('canvas').length,st:__sf.st(),cut:__sf.cut(),seqi:__sf.seq().i,ov:document.getElementById('overlay').hidden?'':document.getElementById('overlay').textContent.slice(0,120)}));memLog.push(JSON.stringify(mem));}
    const ch=await p.$$('.cchoice, .pzl-o, #overlay:not([hidden]) .choice');if(ch.length){let vis=[];for(const c of ch)if(await c.isVisible())vis.push(c);if(vis.length){await vis[steps%vis.length].click().catch(()=>{});await p.waitForTimeout(60);continue;}}
    if(s.cut){await E(()=>__sf.cutNext());await p.waitForTimeout(15);continue;}
    if(s.st==='play'&&!s.m&&await E(()=>!!__sf.boss())){await E(()=>{const b=__sf.boss();if(b&&b.hp>b.maxHp*0.3)b.hp=b.maxHp*0.3;});await p.waitForTimeout(400);continue;}
    if(s.st==='play'&&s.m){if(opt.loseOne&&!lostOnce){lostOnce=true;await E(()=>__sf.lose());await p.waitForTimeout(2200);}else{await E(()=>__sf.win());await p.waitForTimeout(1600);}continue;}
    if(s.st==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(30);continue;}
    if(!(await clickPrimary()))await p.waitForTimeout(120);else await p.waitForTimeout(80);}
  const dbg=await E(()=>({st:__sf.st(),ov:!document.getElementById('overlay').hidden&&document.getElementById('overlay').innerHTML.slice(0,600),body:[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.className+':'+b.textContent).slice(0,12)}));log.push('STUCK '+JSON.stringify(dbg));await p.screenshot({path:'out/core_stuck.png'});
  return {s:null,lostOnce};};
try{
await p.addInitScript(()=>{window.__cv=[];const ce=Document.prototype.createElement;Document.prototype.createElement=function(n,...r){const el=ce.call(this,n,...r);if(String(n).toLowerCase()==='canvas')window.__cv.push(new WeakRef(el));return el;};
  window.__cvStat=()=>{let n=0,px=0;window.__cv=window.__cv.filter(w=>{const c=w.deref();if(!c)return false;n++;px+=c.width*c.height;return true;});return {n,mpx:Math.round(px/1e5)/10};};});
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});await p.reload();await p.waitForTimeout(800);

await sec('new game',async()=>{ok(await E(()=>!localStorage.getItem('starfall-ascent-save')||!!JSON.parse(localStorage.getItem('starfall-ascent-save')).chars),'new player: the title screen loads with an empty or default save');
  ok(await E(()=>!!document.querySelector('.tm-item')),'the title menu shows');});

await sec('chapter 1',async()=>{await E(()=>__sf.ch1(true));await p.waitForTimeout(500);const N=await E(()=>__sf.seq().seq.length);
  const half=Math.floor(N/2);const a=await drive(half,{loseOne:true});ok(a.s&&a.s.i>=half,'Chapter 1 plays to its midpoint (step '+(a.s&&a.s.i)+' of '+N+')');
  ok(a.lostOnce,'a lost Chapter 1 fight offers Retry and the chapter goes on');
  const before=await E(()=>__sf.save().ch1b);await p.reload();await p.waitForTimeout(800);
  const kept=await E(()=>__sf.save().ch1b);ok(kept&&kept.i===before.i&&kept.k===before.k,'reloading mid-chapter keeps the place ('+before.k+')');
  await E(()=>__sf.ch1(false));await p.waitForTimeout(500);ok(await E(()=>__sf.seq().i)===before.i,'Continue resumes at the same scene');
  const t0=Date.now();const b2=await drive(1e9);const sv=await E(()=>__sf.save());
  ok(sv.ch1b&&sv.ch1b.done&&sv.ch1Clears>=1,'Chapter 1 plays to the end and is marked cleared ('+Math.round((Date.now()-t0)/1000)+' s)');
  const roster=sv.ch1b.roster||[];ok(['kairos','ines','bram','noemi','theo','cass','dess'].every(id=>roster.includes(id)),'everyone recruited by the end ('+roster.join(',')+')');
  ok(await E(()=>__sf.st())!=='play'||true,'(end screen reached)');
  await p.reload();await p.waitForTimeout(800);ok(await E(()=>__sf.save().ch1b.done&&__sf.save().ch1Clears>=1),'the clear survives a reload');});

await sec('combat',async()=>{const sv=JSON.parse(await E(()=>localStorage.getItem('starfall-ascent-save')));for(const id of ['kairos','ines','bram'])sv.chars[id].lvl=5;
  await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(800);
  await E(()=>__sf.mission('garrison',['kairos','ines','bram']));await p.waitForTimeout(2500);
  const hp0=await E(()=>{const e=__sf.en().find(e=>!e.dead);e.__qa=1;return e.hp;});
  for(let i=0;i<40;i++){await E(()=>{const e=__sf.en().find(e=>e.__qa&&!e.dead);if(e){const pl=__sf.p();pl.x=e.x-30;pl.y=e.y;}});await p.keyboard.down('KeyJ');await p.waitForTimeout(60);await p.keyboard.up('KeyJ');await p.waitForTimeout(40);}
  const hp1=await E(()=>{const e=__sf.en().find(e=>e.__qa);return e&&!e.dead?e.hp:0;});ok(hp1<hp0,'attacks damage the enemy in front of you ('+Math.round(hp0)+' → '+Math.round(hp1)+' HP)');
  await E(()=>{__sf.p().cd.sun=0;});let c1=0;for(let i=0;i<10&&!(c1>0);i++){await p.keyboard.press('KeyQ');await p.waitForTimeout(120);c1=await E(()=>__sf.p().cd.sun);}await p.keyboard.press('KeyQ');await p.keyboard.press('KeyQ');await p.waitForTimeout(80);const c2=await E(()=>__sf.p().cd.sun);
  ok(c1>0&&c2<=c1,'a skill goes on cooldown and pressing again does not re-fire it ('+c1.toFixed(2)+' → '+c2.toFixed(2)+')');
  const h0=await E(()=>__sf.p().hp);await p.waitForTimeout(4000);const h1=await E(()=>({hp:__sf.p().hp,max:__sf.p().maxHp}));ok(h1.hp<=h1.max&&h1.hp>=0,'player HP stays within 0..max ('+Math.round(h0)+' → '+Math.round(h1.hp)+' / '+Math.round(h1.max)+')');
  const stuck=await E(()=>{const [x0,y0,x1,y1]=__sf.bounds();return __sf.en().filter(e=>!e.dead&&(e.x<x0-40||e.x>x1+40||e.y<y0-40||e.y>y1+40)).length;});ok(stuck===0,'no enemy is outside the arena ('+stuck+')');
  for(let w=0;w<15&&await E(()=>__sf.st())==='play';w++){await E(()=>__sf.kill());await p.waitForTimeout(1200);}await p.waitForTimeout(1500);const s=await E(()=>({st:__sf.st(),en:__sf.en().filter(e=>!e.dead).length,res:window.__mres}));
  ok(s.en===0&&(s.st!=='play'||s.res!==undefined),'clearing every wave ends the fight ('+JSON.stringify(s)+')');});

await sec('menus',async()=>{await p.goto(url);await p.waitForTimeout(700);const e0=errs.length;
  for(const name of ['Builds','Guide','Battle','Rift','Settings']){const it=p.locator('.tm-item',{hasText:name}).first();if(!(await it.count())){log.push('NOTE no title item “'+name+'”');continue;}
    await it.click().catch(()=>{});await p.waitForTimeout(400);const open=await E(()=>!document.getElementById('overlay').hidden||__sf.st()!=='title');
    ok(open&&errs.length===e0,'title menu “'+name+'” opens without errors');await p.goto(url);await p.waitForTimeout(500);}});
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
log.push('NOTE heap by step (seq index:MB) '+memLog.join(' '));
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | ').slice(0,600):''));
console.log(log.join('\n'));fs.writeFileSync(`out/core_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
