// Meridian exploration playtest: plays the hub like a player (menu, walking, exits, talking, quests, records, saving),
// then checks Chapter 1's Tuesday Errands still finishes. Usage: node meridian_playtest.js [phone]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const phone=process.argv[2]==='phone';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();
const ctx=await b.newContext(phone?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
const log=[],ok=(c,m)=>{log.push((c?'PASS ':'FAIL ')+m);};
const tag=phone?'phone':'desk',shot=async n=>p.screenshot({path:`out/mx_${tag}_${n}.png`});
try{
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1}));});
await p.goto(url);await p.waitForTimeout(700);
// a save from someone who has played into Chapter 1 and met Agnes, Bram and Naomi
await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('starfall-ascent-save')||'null')||{chars:{},frags:[],dust:0,nextId:1};s.dust=7;s.ch1b={i:40,k:null,roster:['kairos','ines','bram','noemi'],flags:{}};localStorage.setItem('starfall-ascent-save',JSON.stringify(s));});
await p.goto(url);await p.waitForTimeout(700);
const dust0=await p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')).dust);
ok(dust0===7,'existing save loads unchanged (dust '+dust0+')');
// home → Meridian
const hasItem=await p.locator('.tm-item',{hasText:'Meridian'}).count();ok(hasItem===1,'home menu has a Meridian entry');
await p.locator('.tm-item',{hasText:'Meridian'}).click();await p.waitForTimeout(400);await shot('menu');
ok(await p.locator('.mx-map').count()===1,'Meridian menu shows the map');
await p.locator('.tm-item',{hasText:'Walk the city'}).click();await p.waitForTimeout(1200);
const st=()=>p.evaluate(()=>{const m=__sf.room&&__sf.room();return null;});
const where=()=>p.evaluate(()=>{const r=window.__sf_room;return null;});
const info=()=>p.evaluate(()=>{const x=__sf.mx(),pl=__sf.p();return {at:x.at,seen:Object.keys(x.seen),q:JSON.parse(JSON.stringify(x.q)),found:Object.keys(x.found),items:Object.keys(x.items),x:pl.x,y:pl.y};});
let I=await info();ok(I.at==='market','starts in the Market Ring');await shot('market');
// helpers: walk to a point with real key presses, talk with F, click through dialogue
const keyFor=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'KeyD':'KeyA'):(dy>0?'KeyS':'KeyW');
async function walkTo(tx,ty,maxMs=8000){const t0=Date.now();let last=null,side=0;
  while(Date.now()-t0<maxMs){const q=await p.evaluate(()=>{const pl=__sf.p();return {x:pl.x,y:pl.y,st:__sf.st()};});
    if(q.st!=='play')return;const dx=tx-q.x,dy=ty-q.y;if(Math.hypot(dx,dy)<14)return;
    // stuck on a fountain or sundial: step sideways for a moment, like a player steering round it
    if(last&&Math.hypot(q.x-last.x,q.y-last.y)<2){side=(side+1)%2;const k=Math.abs(dx)>Math.abs(dy)?(side?'KeyW':'KeyS'):(side?'KeyA':'KeyD');await p.keyboard.down(k);await p.waitForTimeout(320);await p.keyboard.up(k);}
    last=q;const k=keyFor(dx,dy);await p.keyboard.down(k);await p.waitForTimeout(Math.min(220,Math.max(40,Math.max(Math.abs(dx),Math.abs(dy))*2)));await p.keyboard.up(k);}}
async function npcPos(id){return p.evaluate(id=>{const m=__sf.m();const n=m.npcs.find(o=>o.id===id);return n?{x:n.x,y:n.y,mk:n.mk}:null;},id);}
async function talk(id){const n=await npcPos(id);if(!n)return false;
  await walkTo(n.x+(n.x>400?-26:26),n.y+4);await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);
  for(let i=0;i<20;i++){const s=await p.evaluate(()=>__sf.st());if(s==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(90);}else break;}
  await p.waitForTimeout(200);return true;}
async function exitTo(side){const B=await p.evaluate(()=>__sf.bounds()),cx=(B[0]+B[2])/2,cy=B[1]+(B[3]-B[1])*0.55;const pos={w:[B[0]+40,cy],e:[B[2]-40,cy],n:[cx,B[1]+40],s:[cx,B[3]-40]}[side];await walkTo(pos[0],pos[1],9000);
  const at0=await p.evaluate(()=>__sf.mx().at),k={w:'KeyA',e:'KeyD',n:'KeyW',s:'KeyS'}[side];await p.keyboard.down(k);
  for(let i=0;i<30;i++){await p.waitForTimeout(50);if(await p.evaluate(a=>__sf.mx().at!==a,at0))break;}await p.keyboard.up(k);await p.waitForTimeout(800);}
// Matteo starts the main quest
const mk0=await npcPos('matteo');ok(mk0&&mk0.mk==='!','Matteo shows a ! bubble before the first talk');
await talk('matteo');I=await info();ok(I.q.streets&&I.q.streets.s==='active','talking to Matteo starts "Know the Streets"');
await talk('matteo');I=await info();ok(I.q.glasses&&I.q.glasses.s==='active','second talk starts "Matteo’s Glasses"');
const mk1=await npcPos('tessa');ok(mk1&&mk1.mk==='…','an unmet townsperson shows …');
// records in the Market Ring
await talk('market.chalk');I=await info();ok(I.found.includes('market.chalk')&&I.q.records,'reading the chalkboard records it and starts "Meridian Records"');
await shot('talked');
// travel: east to Festival Square
await exitTo('e');I=await info();ok(I.at==='plaza','walking off the east edge reaches Festival Square');await shot('plaza');
const arr=await p.evaluate(()=>__sf.p().x-__sf.bounds()[0]);ok(arr<120,'arrive on the west side of the Square (x '+Math.round(arr)+')');
const g=await npcPos('plaza.glasses');ok(!!g,'the glasses appear while the quest is active');
await talk('plaza.glasses');I=await info();ok(I.items.includes('glasses'),'picked up the glasses');
await talk('lseller');I=await info();ok(I.q.lanterns&&I.q.lanterns.s==='active','lantern seller starts "Lanterns for Vespers"');
await talk('plaza.plaque');await talk('plaza.poster');await talk('plaza.scar');
// fountain collision: walk straight at it and sample positions; the player must never be inside the basin
const B=await p.evaluate(()=>__sf.bounds()),fx=(B[0]+B[2])/2,fyc=B[1]+(B[3]-B[1])*0.555;await walkTo(fx,fyc-100);let inside=0;await p.keyboard.down('KeyS');
for(let i=0;i<20;i++){await p.waitForTimeout(60);const q=await p.evaluate(()=>__sf.p());if(Math.hypot(q.x-fx,q.y-fyc)<30)inside++;}
await p.keyboard.up('KeyS');ok(inside===0,'the fountain basin blocks walking ('+inside+' samples inside)');
// back west, north to the Cloister
await exitTo('w');I=await info();ok(I.at==='market','back to the Market Ring');
await talk('matteo');I=await info();ok(I.q.glasses.s==='done','returning the glasses completes the quest');
await exitTo('n');I=await info();ok(I.at==='chapel','north to the Cloister');await shot('chapel');
await talk('sister');I=await info();ok(I.q.lanterns.s==='done','giving the lantern completes "Lanterns for Vespers"');
await talk('chapel.hymn');await talk('chapel.cups');
await exitTo('s');await exitTo('w');I=await info();ok(I.at==='yard','west to the Garrison Yard');await shot('yard');
const agnes=await npcPos('agnes');ok(!!agnes,'Agnes is in the Yard (met in Chapter 1)');
await talk('sold');I=await info();ok(I.q.roster&&I.q.roster.s==='active','soldier starts "The Duty Roster"');
await talk('yard.tally');
await exitTo('e');await talk('market.board');I=await info();ok(I.q.roster.n===1,'pinning the roster advances the quest');
await exitTo('s');I=await info();ok(I.at==='ward','south to St. Lucia’s');await shot('ward');
const theo=await npcPos('theo');ok(!theo,'Theo is not here yet (not met in Chapter 1)');
await talk('nurse');I=await info();ok(I.q.rounds&&I.q.rounds.s==='active','nurse starts "Rounds"');
await talk('ward.ledger');
{const B=await p.evaluate(()=>__sf.bounds());await walkTo(B[0]+(B[2]-B[0])*0.1+24,B[1]+(B[3]-B[1])*0.86);}await talk('ward.drawing');
// save persists across a reload mid-way
await p.reload();await p.waitForTimeout(800);I=await p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')).mx);
ok(I&&I.at==='ward'&&I.q.rounds&&I.q.lanterns.s==='done','progress survives a reload (at '+(I&&I.at)+')');
await p.locator('.tm-item',{hasText:'Meridian'}).click();await p.waitForTimeout(300);
ok(await p.locator('.tm-item',{hasText:'Continue'}).count()===1,'menu offers Continue');
await p.locator('.tm-item',{hasText:'Continue'}).click();await p.waitForTimeout(1200);I=await info();ok(I.at==='ward','Continue resumes in St. Lucia’s');
await exitTo('n');for(const id of ['matteo','rosa','fish'])await talk(id);I=await info();ok(I.q.rounds.n===1,'asked three birthdays');
await exitTo('w');await talk('sold');await exitTo('e');await exitTo('s');await talk('nurse');
I=await info();ok(I.q.rounds.s==='done'&&I.q.roster.s==='done','"Rounds" and "The Duty Roster" complete');
ok(I.q.streets.n===1,'all five districts visited: main quest moves to "tell Matteo"');
await exitTo('n');await talk('matteo');I=await info();ok(I.q.streets.s==='done','main quest complete');
// hidden finds
{const B=await p.evaluate(()=>__sf.bounds());await walkTo(B[0]+(B[2]-B[0])*0.08+20,B[1]+(B[3]-B[1])*0.16+20);}await p.waitForTimeout(200);await talk('market.coin');await talk('market.plaque');
I=await info();const recs=await p.evaluate(()=>__sf.mxFinds.filter(f=>!f.act&&!f.quest&&__sf.mx().found[f.id]).length);ok(recs>=8&&I.q.records.s==='done','8 records found completes "Meridian Records" ('+recs+')');
const sv=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('starfall-ascent-save'));return {dust:s.dust,frags:s.frags.length};});
ok(sv.dust>7&&sv.frags>=1,'rewards saved (dust '+sv.dust+', fragments '+sv.frags+')');
// pause menu: Journal and Leave
await p.keyboard.press('Escape');await p.waitForTimeout(300);ok(await p.locator('.tm-item',{hasText:'Journal'}).count()===1,'pause menu has Journal');
await p.locator('.tm-item',{hasText:'Journal'}).click();await p.waitForTimeout(300);await shot('journal');
ok(await p.locator('.mx-q').count()>=5,'Journal lists the quests');
await p.locator('.mx-tabs .btn',{hasText:'Records'}).click();await p.waitForTimeout(200);await shot('records');
await p.locator('.btn',{hasText:'Back'}).last().click();await p.waitForTimeout(300);
await p.locator('.tm-item',{hasText:'Leave the city'}).click();await p.waitForTimeout(400);ok(await p.locator('.mx-map').count()===1,'Leave the city returns to the Meridian menu');
await shot('menu2');
// Chapter 1 regression: Tuesday Errands still ends when its errands are done
await p.evaluate(()=>__sf.mission('market',['kairos']));await p.waitForTimeout(1000);
const ch=await p.evaluate(()=>{const m=__sf.m();return m?{id:m.id,n:m.npcs.length}:null;});
ok(ch&&ch.id==='market'&&ch.n>=5,'Chapter 1 Tuesday Errands loads ('+(ch&&ch.id)+')');
if(ch){for(const id of ['matteo','vendor','baker','rosa','tessa']){
    await p.evaluate(id=>{const m=__sf.m(),n=m.npcs.find(o=>o.id===id),pl=__sf.p();pl.x=n.x+(n.x>300?-24:24);pl.y=n.y+4;},id);await p.waitForTimeout(100);
    await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(300);
    for(let i=0;i<30;i++){const s=await p.evaluate(()=>__sf.st());if(s==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(80);}
      else if(s==='panel'){await p.locator('.pzl-o').nth(1).click();await p.waitForTimeout(200);}else break;}
    await p.waitForTimeout(250);}
  const s2=await p.evaluate(()=>__sf.st());ok(s2!=='play','Tuesday Errands finishes after the last errand ('+s2+')');}
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/mx_${tag}_log.txt`,log.join('\n'));await b.close();server.close();})();
