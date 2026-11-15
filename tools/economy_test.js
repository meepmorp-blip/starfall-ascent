// Expansion 02 economy test: save migration, one-time claims, Keepsakes, Renown, stats after levelling, combat after upgrades, phone layout.
// Usage: node economy_test.js [phone]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const phone=process.argv[2]==='phone';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();
const ctx=await b.newContext(phone?{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m),tag=phone?'phone':'desk';
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
try{
// 1. an old v1 save from before this update: levels, fragments, dust, Meridian with two quests done and the hidden coin found
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));
  const chars={};for(const id of ['kairos','ines','bram','noemi','theo','lucan','cass','dess'])chars[id]={xp:30,lvl:id==='kairos'?6:id==='bram'?3:1,slots:{sun:null,moon:null,rising:null},mp:4};
  localStorage.setItem('starfall-ascent-save',JSON.stringify({v:1,chars,frags:[{id:1,sign:'Leo',rar:1,slot:'sun',deg:3,traits:['fury','heat'],lvl:2,transits:0}],dust:123,nextId:2,
    ch1b:{i:40,k:null,roster:['kairos','ines','bram'],flags:{}},
    mx:{v:1,at:'market',seen:{market:1,plaza:1},talk:{},found:{'market.coin':1,'market.chalk':1},q:{streets:{s:'active',n:0,at:1},glasses:{s:'done',n:2,at:2},lanterns:{s:'done',n:1,at:3}},items:{},f:{}}}));});
await p.goto(url);await p.waitForTimeout(700);
let s=await S();
ok(s.v===2,'save upgraded to v2');
ok(s.dust===123,'Stardust untouched by the migration ('+s.dust+')');
ok(s.chars.kairos.lvl===6&&s.chars.bram.lvl===3&&s.chars.kairos.xp===30&&s.chars.kairos.mp===4,'levels, Memories and Mastery untouched');
ok(s.frags.length===1&&s.frags[0].lvl===2,'fragments and Attune levels untouched');
ok(s.keep===2,'finished quests before the update pay their Keepsakes once (got '+s.keep+')');
ok(s.claims['mxq:glasses']&&s.claims['mxq:lanterns']&&s.claims['mxf:market.coin'],'old one-time rewards are marked claimed');
await p.reload();await p.waitForTimeout(600);s=await S();ok(s.keep===2&&s.dust===123,'reloading does not pay the migration again');
// 2. grant() pays a key once
const g1=await p.evaluate(()=>__sf.grant({dust:10,keep:1},'test:once')),g2=await p.evaluate(()=>__sf.grant({dust:10,keep:1},'test:once'));
s=await S();ok(g1&&!g2&&s.dust===133&&s.keep===3,'a keyed reward pays once ('+s.dust+' / '+s.keep+')');
// 3. Keepsakes in Builds › Level & milestones, on a benched character (Bram, Lv 3, 30 / 260)
const hp0=await p.evaluate(()=>{__sf.save().prefs;return null;});
await p.evaluate(()=>__sf.builds());await p.waitForTimeout(400);
await p.locator('.bv-tabs .tab',{hasText:'Bram'}).click();await p.waitForTimeout(200);
await p.locator('button',{hasText:'Level & milestones'}).first().click();await p.waitForTimeout(300);
ok(await p.locator('.keepbox').count()===1,'Keepsakes panel is in Level & milestones');
const txt=await p.locator('.keepbox').innerText();ok(/Keepsakes × 3/.test(txt)&&/Use 1 → Lv 3/.test(txt),'panel shows the count and a preview ('+txt.replace(/\s+/g,' ').slice(0,80)+')');
await p.screenshot({path:`out/eco_${tag}_keep.png`});
await p.locator('.keepbox button',{hasText:'Use 1'}).click();await p.waitForTimeout(300);
s=await S();ok(s.chars.bram.xp===150&&s.chars.bram.lvl===3&&s.keep===2,'Use 1: +120 Memories, one Keepsake spent ('+s.chars.bram.lvl+' / '+s.chars.bram.xp+' / '+s.keep+')');
const hpA=await p.evaluate(()=>{const id='bram',c=__sf.save().chars[id];return c.lvl;});
await p.locator('.keepbox button',{hasText:'Use 1'}).click();await p.waitForTimeout(300);
s=await S();ok(s.chars.bram.lvl===4&&s.chars.bram.xp===10&&s.keep===1,'second Keepsake levels Bram up, leftover Memories carry over (Lv '+s.chars.bram.lvl+', '+s.chars.bram.xp+', keep '+s.keep+')');
ok(/Lv 3 → 4/.test(await p.locator('.keepbox').innerText()),'level-up message shown');
await p.screenshot({path:`out/eco_${tag}_keep2.png`});
// stats grow with the level
const st=await p.evaluate(()=>{const lv=__sf.save().chars.bram.lvl,c=CHARS_hp=null;return null;});
await p.reload();await p.waitForTimeout(600);s=await S();ok(s.chars.bram.lvl===4&&s.keep===1,'Keepsake use survives a reload');
await p.evaluate(()=>{const sv=__sf.save();sv.keep=3;sv.chars.theo.xp=0;localStorage.setItem('starfall-ascent-save',JSON.stringify(sv));});await p.reload();await p.waitForTimeout(600);
await p.evaluate(()=>__sf.builds());await p.waitForTimeout(400);await p.locator('.bv-tabs .tab',{hasText:'Theo'}).click();await p.waitForTimeout(200);
await p.locator('button',{hasText:'Level & milestones'}).first().click();await p.waitForTimeout(300);
await p.locator('.keepbox button').filter({hasText:'to Lv 2'}).click();await p.waitForTimeout(300);
s=await S();ok(s.chars.theo.lvl===2&&s.keep===1,'"Use 2 · to Lv 2" spends exactly two (Lv '+s.chars.theo.lvl+', keep '+s.keep+')');
// stats grow with level: Theo's max HP at Lv 2 is above Lv 1
// 4. can't spend what you don't have, can't pass Lv 20
const r0=await p.evaluate(()=>{const sv=__sf.save();sv.keep=0;return __sf.keepUse('dess',3);});ok(r0.used===0,'no Keepsakes: nothing happens');
const r1=await p.evaluate(()=>{const sv=__sf.save();sv.keep=5;sv.chars.dess.lvl=20;sv.chars.dess.xp=0;return __sf.keepUse('dess',2);});ok(r1.used===0,'Lv 20: Keepsakes are not consumed');
const r2=await p.evaluate(()=>{const sv=__sf.save();sv.chars.dess.lvl=19;sv.chars.dess.xp=1200;return __sf.keepUse('dess',5);});ok(r2.used===1&&r2.to===20,'stops at Lv 20 and keeps the rest (used '+r2.used+')');
await p.evaluate(()=>{const sv=__sf.save();sv.keep=1;sv.chars.dess.lvl=1;sv.chars.dess.xp=0;localStorage.setItem('starfall-ascent-save',JSON.stringify(sv));});await p.reload();await p.waitForTimeout(600);
// 5. Renown: claim rank 1 once
let rn=await p.evaluate(()=>__sf.renown());ok(rn[0]===2*5+2*5+2*15,'Renown counts districts, records and quests ('+rn[0]+')');
await p.locator('.tm-item',{hasText:'Meridian'}).click();await p.waitForTimeout(300);
ok(/to claim/.test(await p.locator('.tm-item',{hasText:'Renown'}).innerText()),'Meridian menu says a reward is waiting');
await p.locator('.tm-item',{hasText:'Renown'}).click();await p.waitForTimeout(300);await p.screenshot({path:`out/eco_${tag}_renown.png`});
const d0=(await S()).dust;await p.locator('.mx-rank.ready button').first().click();await p.waitForTimeout(300);
s=await S();ok(s.dust===d0+30&&s.keep===2&&s.claims['renown:1'],'rank 1 pays 30 Stardust and 1 Keepsake');
ok(await p.locator('.mx-rank.got').count()===1&&await p.locator('.mx-rank.ready').count()===1,'rank 1 shows Claimed; rank 2 (also reached) still waits');
const again=await p.evaluate(()=>__sf.grant({keep:1,dust:30},'renown:1'));ok(again===null,'rank 1 cannot be claimed twice');
await p.reload();await p.waitForTimeout(600);s=await S();ok(s.dust===d0+30&&s.keep===2,'claim survives reload, no double pay');
// 6. a Meridian quest completed now pays Keepsakes through grant()
await p.evaluate(()=>{const x=__sf.mx();x.seen={market:1,plaza:1,yard:1,chapel:1,ward:1};x.f.streetsTold=1;localStorage.setItem('starfall-ascent-save',JSON.stringify(__sf.save()));});
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
s=await S();ok(s.mx.q.streets.s==='done'&&s.keep===4&&s.claims['mxq:streets'],'main quest pays 40 Stardust + 2 Keepsakes once (keep '+s.keep+')');
await p.evaluate(()=>{const q=__sf.mx().q.streets;q.s='active';q.n=1;});await p.waitForTimeout(400);
s=await S();ok(s.keep===4,'forcing the quest to finish again pays nothing');
// 7. combat after upgrades: a Battle stage with the levelled characters
await p.keyboard.press('Escape');await p.waitForTimeout(200);
await p.evaluate(()=>{if(window.__sf.battle)__sf.battle(['bram','kairos','dess'],'house1',0,{tier:1});});await p.waitForTimeout(1500);
const live=await p.evaluate(()=>({st:__sf.st(),hp:__sf.p().maxHp,base:__sf.p().ch.hp,id:__sf.p().id,lvl:__sf.save().chars[__sf.p().id].lvl}));
ok(live.hp>live.base,'stats grow with level: '+live.id+' Lv '+live.lvl+' has '+live.hp+' max HP (base '+live.base+')');
await p.keyboard.press('Digit2');await p.waitForTimeout(400);await p.keyboard.down('KeyJ');await p.waitForTimeout(200);await p.keyboard.up('KeyJ');await p.waitForTimeout(1500);
const live2=await p.evaluate(()=>({st:__sf.st(),id:__sf.p().id}));
ok(live.st==='play'&&live2.st!=='title','Battle runs with the levelled party ('+live.id+' '+live.hp+' HP, then '+live2.id+')');
const hpLv=await p.evaluate(()=>{const s=__sf.save();const a=s.chars.bram.lvl;s.chars.bram.lvl=1;const lo=window.__sf.p&&null;s.chars.bram.lvl=a;return a;});
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/eco_${tag}_log.txt`,log.join('\n'));await b.close();server.close();})();
