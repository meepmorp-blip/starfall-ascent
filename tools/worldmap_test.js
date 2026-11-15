// World map and fast travel test. Usage: node worldmap_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const st=()=>p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));
const setSave=sv=>p.evaluate(sv=>{localStorage.setItem('starfall-ascent-save',JSON.stringify(sv));},sv);
const base=(extra)=>Object.assign({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},mx:{v:1,at:'market',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1},talk:{},found:{},q:{},items:{},f:{}}},extra||{});
try{
await p.addInitScript(()=>{window.__mxDay='2026-11-20';});
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── unlock states by story progress
await setSave(base({ch1b:{i:5,k:'Scene 2#1',roster:['kairos'],flags:{}}}));await p.reload();await p.waitForTimeout(600);
let s0=await st();ok(s0.market==='open'&&s0.ward==='open','visited districts are discovered');
ok(s0.office==='locked'&&s0.ashlane==='locked'&&s0.tower==='locked'&&s0.canals==='locked','early in Chapter 1: Concord Office, Ash Lane, Clock Tower and Canals are story-locked ('+[s0.office,s0.ashlane,s0.tower,s0.canals]+')');
await setSave(base({ch1b:{i:60,k:'Scene 10#2',roster:['kairos'],flags:{}}}));await p.reload();await p.waitForTimeout(600);
let s1=await st();ok(s1.office!=='locked'&&s1.ashlane!=='locked'&&s1.tower==='locked'&&s1.canals==='locked','at Scene 10: Office and Ash Lane unlock; Tower and Canals stay locked');
await setSave(base({ch1Clears:1,ch1b:{done:true,i:0,k:null}}));await p.reload();await p.waitForTimeout(600);
let s2=await st();ok(s2.tower!=='locked'&&s2.canals==='locked','after Chapter 1: the Clock Tower unlocks; the Canals stay locked (Chapter 2)');
// ── the map from the Meridian menu
await setSave(base({mx:{v:1,at:'market',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1},talk:{},found:{},q:{},items:{},f:{}}}));await p.reload();await p.waitForTimeout(600);
await p.locator('.tm-item',{hasText:'Meridian'}).click();await p.waitForTimeout(300);
await p.locator('.tm-item',{hasText:'World map'}).click();await p.waitForTimeout(400);
ok(await p.locator('.wm canvas').count()===1,'the world map opens from the Meridian menu');await p.screenshot({path:`out/wm_${mode}_menu.png`});
await p.evaluate(()=>window.__wmSel('chapel'));await p.waitForTimeout(150);
await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
let sv=await S();ok(await p.evaluate(()=>__sf.st())==='play'&&sv.mx.at==='chapel','travel from the menu starts in The Cloister');
// ── in the field: open with M (desktop) or the HUD button (touch), travel to Festival Square
const chest=await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.tier);return n?{x:n.x,y:n.y,key:n.key}:null;});
await p.evaluate(c=>{const pl=__sf.p();pl.x=c.x-22;pl.y=c.y+6;},chest);await p.waitForTimeout(150);await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(400);
const d1=(await S()).dust;ok(d1>0,'opened a Cloister chest before travelling');
if(mode==='desk'){await p.keyboard.press('KeyM');}else{const bt=await p.evaluate(()=>{const b=__sf.hud().btn.wmap;return {x:b.x,y:b.y};});await p.mouse.click(bt.x,bt.y);}
await p.waitForTimeout(400);ok(await p.locator('.wm canvas').count()===1&&await p.evaluate(()=>__sf.st())==='panel','the map opens in the field and pauses play');
await p.screenshot({path:`out/wm_${mode}_field.png`});
// a locked place cannot be travelled to
await p.evaluate(()=>window.__wmSel('canals'));await p.waitForTimeout(120);ok(await p.locator('.wm-side .btn[disabled]',{hasText:'Travel'}).count()===1,'a story-locked place has Travel disabled');
await p.evaluate(()=>window.__wmSel('hesper'));await p.waitForTimeout(120);ok(await p.locator('.wm-side .btn[disabled]',{hasText:'Travel'}).count()===1,'a place not built or discovered has Travel disabled');
// tap a place on the map canvas itself
const hit=await p.evaluate(()=>{const c=document.querySelector('.wm canvas').getBoundingClientRect();return {x:c.left+c.width*0.65,y:c.top+c.height*0.5};});
await p.mouse.click(hit.x,hit.y);await p.waitForTimeout(150);ok(/Festival Square/.test(await p.locator('.wm-side h3').innerText()),'tapping Festival Square on the map selects it');
await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
const r=await p.evaluate(()=>{const m=__sf.m(),pl=__sf.p(),B=__sf.bounds();let inside=false;for(const s of m.solids){if(s.w){if(pl.x>s.x&&pl.x<s.x+s.w&&pl.y>s.y&&pl.y<s.y+s.h)inside=true;}else if(Math.hypot(pl.x-s.x,pl.y-s.y)<s.r)inside=true;}
  return {at:__sf.mx().at,st:__sf.st(),inside,inB:pl.x>B[0]&&pl.x<B[2]&&pl.y>B[1]&&pl.y<B[3],team:__sf.p().id};});
ok(r.at==='plaza'&&r.st==='play'&&!r.inside&&r.inB,'fast travel lands in Festival Square at a valid point');ok(r.team==='kairos','the party is kept');
sv=await S();ok(sv.dust===d1&&Object.keys(sv.claims).some(k=>k.startsWith('chest:2026-11-20:chapel')),'chests and rewards are untouched by travel');
// arrival after the "here" place: the map marks it
if(mode==='desk')await p.keyboard.press('KeyM');else{const bt=await p.evaluate(()=>{const b=__sf.hud().btn.wmap;return {x:b.x,y:b.y};});await p.mouse.click(bt.x,bt.y);}
await p.waitForTimeout(300);{const tx=await p.locator('.wm-side').innerText().catch(()=>'(no map)');ok(/You are here/i.test(tx),'the map shows where Kairos is'+(/You are here/i.test(tx)?'':' · got: '+tx.replace(/s+/g,' ').slice(0,120)));}
await p.locator('.wm-side .btn',{hasText:'Close'}).click();await p.waitForTimeout(300);ok(await p.evaluate(()=>__sf.st())==='play','closing the map returns to play');
// pause menu entry
await p.keyboard.press('Escape');await p.waitForTimeout(250);ok(await p.locator('.tm-item',{hasText:'World map'}).count()===1,'the pause menu has World map');
await p.locator('.tm-item',{hasText:'World map'}).click();await p.waitForTimeout(300);await p.evaluate(()=>window.__wmSel('yard'));
await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);ok(await p.evaluate(()=>__sf.mx().at)==='yard'&&await p.evaluate(()=>__sf.st())==='play','travel from the pause menu works');
// walking exits still work
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyD');await p.waitForTimeout(700);await p.keyboard.up('KeyD');await p.waitForTimeout(900);
ok(await p.evaluate(()=>__sf.mx().at)==='market','walking off the Yard’s east edge still reaches the Market Ring');
await p.reload();await p.waitForTimeout(600);sv=await S();ok(sv.mx.at==='market','the last place survives a reload');
// map button does not sit on any other HUD control
const hb=await p.evaluate(()=>{const H=__sf.hud(),b=H.btn.wmap,q=H.btn.pause;return Math.hypot(b.x-q.x,b.y-q.y)-(b.r+q.r);});ok(hb>4,'map button clear of the pause button ('+Math.round(hb)+'px gap)');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/wm_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
