// Expansion 04 test: daily chests, activities, obstacles, interactables, moving NPCs, murmurs. Usage: node exploration_test.js [phone]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const phone=process.argv[2]==='phone';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();
const ctx=await b.newContext(phone?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,4).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m),tag=phone?'phone':'desk';
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const setDay=d=>p.addInitScript(d=>{window.__mxDay=d;},d);
const go=d=>p.evaluate(d=>__sf.mxGo(d),d).then(()=>p.waitForTimeout(500));
const npc=id=>p.evaluate(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n?{x:n.x,y:n.y}:null;},id);
async function interact(id){const n=await npc(id);if(!n)return false;
  await p.evaluate(n=>{const pl=__sf.p();pl.x=n.x-22;pl.y=n.y+6;},n);await p.waitForTimeout(120);
  await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);
  for(let i=0;i<20;i++){if(await p.evaluate(()=>__sf.st())==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}
  await p.waitForTimeout(150);return true;}
try{
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));
  localStorage.setItem('starfall-ascent-save',JSON.stringify({v:2,chars:{},frags:[],dust:50,nextId:1,keep:0,claims:{},ch1b:{i:40,k:null,roster:['kairos','ines','bram','noemi','theo'],flags:{}},
    mx:{v:1,at:'market',seen:{market:1},talk:{},found:{},q:{},items:{},f:{}}}));});
await setDay('2026-11-15');await p.goto(url);await p.waitForTimeout(700);
let s=await S();ok(s.dust===50&&s.mx.at==='market'&&!s.mx.day,'older save loads; no daily state until Meridian is opened');
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(1000);
// ── 1. chest positions: same after reload, different the next day
const D=['market','plaza','yard','chapel','ward'];
const pos=()=>p.evaluate(D=>D.map(d=>__sf.mxChests(d).map(c=>c.spot+':'+c.tier).join(',')).join('|'),D);
const day1=await pos();await p.reload();await p.waitForTimeout(700);const day1b=await pos();
ok(day1===day1b,'chest positions are the same after a reload ('+day1+')');
const counts=day1.split('|').map(x=>x.split(',').length);ok(counts.every(n=>n>=2&&n<=3),'2 or 3 chests per district ('+counts.join(',')+')');
{const all=await p.evaluate(()=>Object.keys(window.__sf_exits).map(d=>__sf.mxChests(d).filter(c=>c.tier==='precious').length).reduce((a,b)=>a+b,0));ok(all===1,'exactly one precious chest in the city today, in a reachable district ('+all+')');}
// ── 2. every chest spot is valid in every district
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);
let bad=[];
for(const d of D){await go(d);
  const r=await p.evaluate(d=>{const m=__sf.m(),B=__sf.bounds(),out=[],X=(fx)=>B[0]+(B[2]-B[0])*fx,Y=(fy)=>B[1]+(B[3]-B[1])*fy;
    const exits=window.__sf_exits[d];
    const people=m.npcs.filter(n=>!n.spot&&!n.draw);
    for(const [fx,fy] of window.__sf_spots[d]){const x=X(fx),y=Y(fy);
      if(x<B[0]+12||x>B[2]-12||y<B[1]+12||y>B[3]-10)out.push(d+' '+fx+','+fy+' bounds');
      for(const s of m.solids){if(s.w){if(x>s.x-12&&x<s.x+s.w+12&&y>s.y-12&&y<s.y+s.h+12)out.push(d+' '+fx+','+fy+' in box');}else if(Math.hypot(x-s.x,y-s.y)<s.r+14)out.push(d+' '+fx+','+fy+' in solid');}
      for(const n of people){const pts=n.pts||[{x:n.x,y:n.y}];for(const q of pts)if(Math.hypot(x-q.x,y-q.y)<34)out.push(d+' '+fx+','+fy+' near '+n.id);}
      for(const e of exits){const ex=e==='w'?B[0]:e==='e'?B[2]:X(0.5),ey=e==='n'?B[1]:e==='s'?B[3]:B[1]+(B[3]-B[1])*0.55;if(Math.hypot(x-ex,y-ey)<75)out.push(d+' '+fx+','+fy+' near exit '+e);}}
    return out;},d);bad=bad.concat(r);}
ok(bad.length===0,'all 35 chest spots clear of bounds, solids, NPCs and exits'+(bad.length?': '+bad.join('; '):''));
// ── 3. opening a chest pays once and stays open
await go('market');
const ch=await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.id==='chest.0');return {id:n.id,key:n.key,tier:n.tier};});
const d0=(await S()).dust;await interact('chest.0');s=await S();const d1=s.dust;
ok(d1>d0&&s.claims[ch.key],'opening a chest pays ('+ch.tier+': +'+(d1-d0)+' Stardust)');await p.screenshot({path:`out/ex_${tag}_chest.png`});
await interact('chest.0');s=await S();ok(s.dust===d1,'opening the same chest again pays nothing');
await p.reload();await p.waitForTimeout(700);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);
ok(await p.evaluate(()=>__sf.m().npcs.find(o=>o.id==='chest.0').opened()),'the chest is still open after a reload');
// next day: new pick, closed again, old chest claims pruned
await setDay('2026-11-16');await p.reload();await p.waitForTimeout(700);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);
const day2=await pos();ok(day2!==day1,'the next day picks different chests ('+day2+')');
s=await S();ok(s.mx.day.key==='2026-11-16'&&!Object.keys(s.claims).some(k=>k.startsWith('chest:2026-11-15')),'new day: daily state reset, yesterday’s chest claims removed');
const ds=[];for(let i=0;i<14;i++)ds.push(await p.evaluate(k=>{window.__mxDay=k;return __sf.mxChests('market').map(c=>c.spot).join('');},'2026-12-'+(10+i)));
ok(new Set(ds).size>=8,'over two weeks the market arrangement varies ('+new Set(ds).size+' different of 14)');
await p.evaluate(()=>{window.__mxDay='2026-11-16';});
// ── 4. Drill course
await go('yard');await interact('drill.board');ok(await p.evaluate(()=>!!__sf.m().act),'reading the drill board starts the course');
await p.screenshot({path:`out/ex_${tag}_drill.png`});
const k0=(await S()).keep;
for(let i=0;i<6;i++){await p.evaluate(()=>{const a=__sf.m().act,q=a.pts[a.i],pl=__sf.p();pl.x=q.x;pl.y=q.y;});await p.waitForTimeout(160);}
s=await S();ok(s.claims['act:drill']&&s.claims['act:drill:2026-11-16']&&s.keep===k0+1&&s.mx.act.drillBest>0,'drill complete: first clear + daily reward, best time '+(s.mx.act&&s.mx.act.drillBest)+'s');
const dd=s.dust;await interact('drill.board');for(let i=0;i<6;i++){await p.evaluate(()=>{const a=__sf.m().act;if(!a)return;const q=a.pts[a.i],pl=__sf.p();pl.x=q.x;pl.y=q.y;});await p.waitForTimeout(160);}
s=await S();ok(s.dust===dd,'running it again the same day pays nothing');
await interact('drill.board');await p.evaluate(()=>{__sf.m().act.t=0.05;});await p.waitForTimeout(300);ok(await p.evaluate(()=>!__sf.m().act),'running out of time ends the course');
// obstacle collision: push into the crate stack
const box=await p.evaluate(()=>{const s=__sf.m().solids.find(o=>o.w);return s;});
await p.evaluate(b=>{const pl=__sf.p();pl.x=b.x-30;pl.y=b.y+b.h/2;},box);await p.keyboard.down('KeyD');await p.waitForTimeout(900);await p.keyboard.up('KeyD');
const pin=await p.evaluate(b=>{const pl=__sf.p();return pl.x>b.x&&pl.x<b.x+b.w&&pl.y>b.y&&pl.y<b.y+b.h;},box);ok(!pin,'crates block the player');
// interactable: the helmet
await interact('look.helmet');s=await S();ok(s.mx.looked&&s.mx.looked['look.helmet'],'reading the dented helmet is remembered');
// ── 5. Hour Candles
await go('chapel');
for(const c of ['S','N'])await interact('candle.'+c);ok(await p.evaluate(()=>(__sf.m().lit||[]).length===0),'wrong candle order snuffs them');
for(const c of ['S','W','N','E'])await interact('candle.'+c);s=await S();ok(s.mx.f.sundial,'rising, high, setting, moon solves the puzzle');
await p.screenshot({path:`out/ex_${tag}_candles.png`});
const f0=s.frags.length,du=s.dust;await interact('chest.sundial');s=await S();ok(s.frags.length===f0+1&&s.dust===du+30,'hidden chest pays 30 Stardust + a Star Fragment');
await interact('chest.sundial');s=await S();ok(s.frags.length===f0+1,'hidden chest pays once');
// ── 6. Festival programme pages
await go('plaza');const np=await p.evaluate(()=>__sf.m().pages.length);ok(np===6,'six pages lie around the Square today');
await p.screenshot({path:`out/ex_${tag}_pages.png`});
for(let i=0;i<6;i++){await p.evaluate(()=>{const g=__sf.m().pages[0];if(!g)return;const pl=__sf.p();pl.x=g.x;pl.y=g.y;});await p.waitForTimeout(140);}
s=await S();ok(Object.keys(s.mx.day.pages).length===6,'walking over the pages collects all six');
const kp=s.keep;await interact('pages.stand');s=await S();ok(s.keep===kp+1&&s.claims['act:pages:2026-11-16'],'returning them pays a Keepsake (first time) and 15 Stardust');
const kd=s.dust;await interact('pages.stand');s=await S();ok(s.dust===kd,'the stand pays once a day');
await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(700);await go('plaza');
ok(await p.evaluate(()=>__sf.m().pages.length===0),'collected pages stay collected after a reload');
// ── 7. NPC movement, stopping, talking while moving, murmurs
await go('market');await p.evaluate(()=>{const pl=__sf.p();pl.x=60;pl.y=60;});
const tr=[];for(let i=0;i<14;i++){tr.push(await p.evaluate(()=>{const m=__sf.m(),n=m.npcs.find(o=>o.id==='rosa');let inside=false;for(const s of m.solids){if(s.w){if(n.x>s.x&&n.x<s.x+s.w&&n.y>s.y&&n.y<s.y+s.h)inside=true;}else if(Math.hypot(n.x-s.x,n.y-s.y)<s.r)inside=true;}return {x:n.x,y:n.y,inside};}));await p.waitForTimeout(400);}
const moved=Math.max(...tr.map(t=>Math.hypot(t.x-tr[0].x,t.y-tr[0].y)));ok(moved>20,'Rosa walks her route (moved '+Math.round(moved)+')');ok(tr.every(t=>!t.inside),'never inside a solid');
const tes=[];for(let i=0;i<10;i++){tes.push(await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.id==='tessa');return {x:n.x,y:n.y};}));await p.waitForTimeout(300);}
ok(Math.max(...tes.map(t=>Math.hypot(t.x-tes[0].x,t.y-tes[0].y)))>8,'Tessa plays around her spot');
await p.evaluate(()=>{const m=__sf.m(),n=m.npcs.find(o=>o.id==='rosa');const q=n.pts[1],r=n.pts[0];n.x=(q.x+r.x)/2;n.y=(q.y+r.y)/2;n.ri=0;n.wait=0;});
const r0=await npc('rosa');await p.evaluate(n=>{const pl=__sf.p();pl.x=n.x-30;pl.y=n.y;},r0);await p.waitForTimeout(600);const r1=await npc('rosa');
ok(Math.hypot(r1.x-r0.x,r1.y-r0.y)<3,'Rosa stops when Kairos comes close');
const m0=await p.evaluate(()=>window.__mxMurmurs|0);
await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(300);
ok(await p.evaluate(()=>__sf.st())==='dialog'&&await p.evaluate(()=>__sf.m().near&&__sf.m().near.id)==='rosa','talking to Rosa works mid-route');
const m1=await p.evaluate(()=>window.__mxMurmurs|0);ok(m1===m0+1,'small talk plays one murmur');
for(let i=0;i<10;i++){if(await p.evaluate(()=>__sf.st())==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(80);}}
// a quest step must not murmur: Matteo starts the main quest
const m2=await p.evaluate(()=>window.__mxMurmurs|0);await interact('matteo');const m3=await p.evaluate(()=>window.__mxMurmurs|0);
s=await S();ok(s.mx.q.streets&&m3===m2,'quest dialogue (Matteo starting a quest) has no murmur');
// story dialogue: Chapter 1 Tuesday Errands, Matteo
await p.keyboard.press('Escape');await p.waitForTimeout(200);
await p.evaluate(()=>__sf.mission('market',['kairos']));await p.waitForTimeout(900);const m4=await p.evaluate(()=>window.__mxMurmurs|0);
await interact('matteo');const m5=await p.evaluate(()=>window.__mxMurmurs|0);ok(m5===m4,'Chapter 1 story dialogue has no murmur');
const npcs=await p.evaluate(()=>__sf.m().npcs.length);ok(npcs>=5,'Chapter 1 market scene still has its people ('+npcs+')');
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);await p.screenshot({path:`out/ex_${tag}_market.png`});
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/ex_${tag}_log.txt`,log.join('\n'));await b.close();server.close();})();
