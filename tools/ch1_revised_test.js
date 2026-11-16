// Chapter 1 revision · scene tests, played with the real sequencer (cutscenes, choices, walks, puzzles, fights).
// Usage: node ch1_revised_test.js [desk|phone|small] [stage]   (stage: 2..7, default all available)
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk',only=process.argv[3]||'';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split('\n').slice(0,2).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);const E=(f,a)=>p.evaluate(f,a);
const shot=async n=>{try{await p.screenshot({path:`out/ch1r_${mode}_${n}.png`});}catch(_){}};
const S=()=>E(()=>__sf.save());const F=()=>E(()=>__sf.seq()?__sf.seq().flags:{});
const key=()=>E(()=>__sf.save().ch1b&&__sf.save().ch1b.k);
// start the chapter at a scene key with a roster/met
const at=async(k,roster,flags={},met)=>{await E(([k,r,f,m])=>{const s=__sf.save();s.ch1Clears=0;s.ch1b={i:0,k,roster:r,met:m||r,flags:f};localStorage.setItem('starfall-ascent-save',JSON.stringify(s));},[k,roster,flags,met]);
  await p.reload();await p.waitForTimeout(500);await E(()=>__sf.ch1(false));await p.waitForTimeout(700);};
// step through cutscenes; choices by text (regex) from the plan, else the first; stops at play/puzzle/pick or when the key matches stop
async function advance(o={}){const plan=o.choose||[];for(let i=0;i<(o.max||600);i++){
  const s=await E(()=>({cut:!!__sf.cut(),st:__sf.st(),k:__sf.save().ch1b&&__sf.save().ch1b.k,m:__sf.m()&&__sf.m().M&&__sf.m().M.type,pzl:!!document.querySelector('#overlay .pzl'),ov:!document.getElementById('overlay').hidden}));
  if(o.until&&o.until.test(s.k||''))return s;
  const ch=await p.$$('.cchoice');const vis=[];for(const c of ch)if(await c.isVisible())vis.push(c);
  if(vis.length){let pick=vis[0];for(const re of plan){for(const c of vis){if(re.test(await c.textContent())){pick=c;break;}}}await pick.click();await p.waitForTimeout(80);continue;}
  if(s.cut){await E(()=>__sf.cutNext());await p.waitForTimeout(12);continue;}
  if(s.st==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(25);continue;}
  if(s.pzl||(s.st==='play'&&s.m))return s;
  const pick3=await p.$('#overlay .pick3');if(pick3)return Object.assign(s,{pick:true});
  const bt=await p.$('#overlay:not([hidden]) [data-primary]');if(bt&&await bt.isVisible()){await bt.click().catch(()=>{});await p.waitForTimeout(90);continue;}
  await p.waitForTimeout(80);}return null;}
// walk helpers
const npcAt=id=>E(id=>{const m=__sf.m();const n=m&&m.npcs.find(o=>o.id===id&&!(o.hide&&o.hide(m)));return n?{x:n.x,y:n.y}:null;},id);
async function talk(id){const n=await npcAt(id);if(!n)return {err:'no '+id};let near=false;
  for(const [dx,dy] of [[-22,6],[22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){await E(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,dx,dy]);await p.waitForTimeout(140);if(await E(id=>__sf.m().near&&__sf.m().near.id===id,id)){near=true;break;}}
  if(!near)return {err:'not near '+id};await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);
  const lines=[];for(let i=0;i<40&&await E(()=>__sf.st())==='dialog';i++){lines.push(await E(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(60);}
  return {lines,pzl:await E(()=>!!document.querySelector('#overlay .pzl'))};}
const pzlPick=async i=>{await p.locator('.pzl-o').nth(i).click();await p.waitForTimeout(250);return E(()=>{const m=document.querySelector('.pzl-msg');return m?m.textContent:'';});};
const drainDialog=async()=>{for(let i=0;i<40&&await E(()=>__sf.st())==='dialog';i++){await p.keyboard.press('Space');await p.waitForTimeout(60);}};
const winFight=async()=>{for(let i=0;i<30&&await E(()=>__sf.st())==='play';i++){await E(()=>__sf.win());await p.waitForTimeout(400);}await p.waitForTimeout(1500);};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack','swap','sun','moon','ult']}));});await p.reload();await p.waitForTimeout(500);

if(!only||only==='2'){
// ═══ Stage 2 · R6 St. Lucia's
await at('Scene 6#0',['kairos','ines','bram'],{c_earnest:true});
let s=await advance();ok(s&&s.pzl,'R6 opens with the exam and Theo’s reader puzzle');
for(const a of [2,1,1]){await pzlPick(a);}await p.waitForTimeout(300);
s=await advance();ok(s&&s.pick,'the ward rift asks for a team of three (pick of five)');
const pool=await E(()=>[...document.querySelectorAll('#overlay .pick3 .slot .nm')].map(e=>e.textContent));ok(pool.length===5&&pool.some(t=>/Naomi/.test(t)),'the pick offers the five present, Naomi included ('+pool.length+')');
await p.locator('#overlay [data-primary]').click();await p.waitForTimeout(1800);await winFight();
s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='Rounds with Naomi','after the rift: Rounds with Naomi (walk)');
await shot('r6_ward');
let r=await talk('noemi');ok(r.lines&&/Fix my clock first/.test(r.lines.join(' ')),'Naomi waits until the ward clock is set (“'+(r.lines||[]).join(' ').slice(0,50)+'”)');
r=await talk('p4');ok(r.lines&&/one minute ahead/.test(r.lines.join(' ')),'bed four’s drawer watch is the clue (one minute ahead)');
r=await talk('chart');ok(r.lines&&/6:41/.test(r.lines.join(' ')),'the nurses’ chart is a second clue (bell 6:42, clock 6:41)');
const d0=(await S()).dust;r=await talk('shelf');await p.waitForTimeout(300);const d1=(await S()).dust;ok(d1===d0+30,'the medicine shelf pays 30 Stardust ('+d0+' → '+d1+')');
r=await talk('shelf');const d2=(await S()).dust;ok(d2===d1,'…once only');
for(const id of ['p1','p2','p7'])await talk(id);ok((await F()).noemi_clues===3,'three patients visited → noemi_clues = 3 ('+(await F()).noemi_clues+')');
r=await talk('wclock');ok(r.pzl,'the ward clock opens its puzzle');
const no=await pzlPick(0);ok(/That’s not when it happened/.test(no),'a wrong setting: the bell chimes wrong, Naomi frowns');
await pzlPick(1);await drainDialog();ok((await F()).ward_clock===true,'turning it forward one minute solves it');
r=await talk('noemi');await p.waitForTimeout(1600);
s=await advance({until:/^Scene 7#0/});
const c=await S();ok(!c.ch1b.roster.includes('noemi')&&c.ch1b.met.includes('noemi')&&c.ch1b.roster.includes('theo'),'Naomi stays at St. Lucia’s: off the roster, still met; Theo comes ('+c.ch1b.roster.join(',')+')');
ok(await E(()=>__sf.mxMet('noemi')),'…and Meridian still counts her as met');
// ═══ Stage 2 · R7 the Concord Office
s=await advance({choose:[/your book is wrong/,/shared a room/]});ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Queue','R7: the Office hall is a walk ('+(s&&s.m)+')');
await shot('r7_office');
for(const id of ['clocks','houses','notice']){r=await talk(id);ok(r.lines&&r.lines.length>=2,'the hall’s '+id+' can be read');}
r=await talk('theo');ok(r.lines&&/don’t sign anything/i.test(r.lines.join(' ')),'Theo heads off to file the clock report (“don’t sign anything”)');
r=await talk('window');await p.waitForTimeout(1500);
s=await advance({choose:[/your book is wrong/,/shared a room/],until:/^Scene 8#0/});
const f7=await S();ok(f7.ch1b.flags.c_office_angry&&f7.ch1b.flags.c_truth,'the outburst and Lucas choices set c_office_angry and c_truth');
ok(/^Scene 8/.test(f7.ch1b.k),'R7 ends at the Institute (now at '+f7.ch1b.k+')');
ok(!f7.ch1b.roster.includes('lucan'),'Lucas does not join at the Office: he only promises to look into it');
}
// generic: finish a walk by talking to every required thing in unlock order
async function completeWalk(extra=[]){for(const id of extra)await talk(id);
  for(let k=0;k<20;k++){const nxt=await E(()=>{const m=__sf.m();if(!m||!m.npcs)return null;const done=id=>{const o=m.npcs.find(x=>x.id===id);return !o||o.done;};
      const n=m.npcs.find(x=>x.need&&!x.done&&!(x.hide&&x.hide(m))&&(!x.after||done(x.after)));return n?n.id:null;});
    if(!nxt)break;const r=await talk(nxt);if(r.pzl){for(let a=0;a<4&&await E(()=>!!document.querySelector('#overlay .pzl'));a++){await p.locator('.pzl-o').nth(a).click();await p.waitForTimeout(200);}await drainDialog();}
    if(await E(()=>__sf.st())!=='play')break;}
  await p.waitForTimeout(1700);}
const pickGo=async(want)=>{const names=await E(()=>[...document.querySelectorAll('#overlay .pick3 .slot .nm')].map(e=>e.textContent));
  if(want)for(const w of want){const has=await E(w=>[...document.querySelectorAll('#overlay .pick3 .slot')].find(s=>s.textContent.includes(w)&&s.getAttribute('aria-pressed')!=='true'),w);}
  await p.locator('#overlay [data-primary]').click();await p.waitForTimeout(1800);return names;};

if(!only||only==='3'){
// ═══ Stage 3 · R8 the Institute
await at('Scene 8#0',['kairos','ines','bram','theo'],{c_truth:true},['kairos','ines','bram','noemi','theo']);
let s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='A Consultation','R8 opens on a walk: the consultation room');
await shot('r8_lab');
let r=await talk('proto');ok(r.lines&&/DECOMMISSIONED/.test(r.lines.join(' ')),'Theo’s old Seam reader is on Marr’s shelf');
r=await talk('log');ok(r.lines&&/G-7/.test(r.lines.join(' ')),'the G-7 observation log can be read');
const d0=(await S()).dust;await talk('roster');await talk('letter');await p.waitForTimeout(300);ok((await S()).dust===d0+40,'the roster and the patrons letter pay 20 + 20 Stardust once');
await completeWalk();
s=await advance({choose:[/go first/]});ok(s&&s.pzl,'after the needle and the little-star core: the Core Resonance puzzle');
const no=await pzlPick(0);ok(/Cold glass/.test(no),'a wrong core: “cold glass”, Marr writes');
await pzlPick(1);await p.waitForTimeout(300);
s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='Someone Else’s Kitchen','the right core opens G-7’s memory as a walk');
await shot('r8_g7');
await completeWalk();ok((await F()).g7_seen===3,'all three memories touched → g7_seen = 3');
s=await advance();ok(s&&s.m==='defense'&&await E(()=>__sf.m().M.name)==='Containment Failure','Containment Failure is a defense fight');
ok(await E(()=>__sf.m().obj&&__sf.m().obj.label)==='The containment unit','…protecting the containment unit');
await p.waitForTimeout(1500);await shot('r8_containment');
await E(()=>__sf.lose());await p.waitForTimeout(3000);ok(await E(()=>/Not like this/.test(document.body.textContent)),'losing it offers Retry (story failure screen)');
await p.locator('#overlay [data-primary]').click();await p.waitForTimeout(1800);ok(await E(()=>__sf.m()&&__sf.m().M.name)==='Containment Failure','Retry restarts the same fight');
await winFight();
s=await advance({until:/^Scene 9#0/});const f8=await S();
ok(/^Scene 9/.test(f8.ch1b.k)&&f8.ch1b.flags.c_marr_joke,'R8 ends at Lucas’s thread with c_marr_joke kept ('+f8.ch1b.k+')');
}

if(!only||only==='4'){
// ═══ Stage 4 + 5a · R9 Lucas → R10 plan → R11 breakout → R12 Crane house
await at('Scene 9#0',['kairos','ines','bram','theo'],{c_truth:true,c_office_angry:true,c_marr_silent:true,g7_seen:3},['kairos','ines','bram','noemi','theo']);
let s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='After Hours','R9 opens on Lucas’s archive walk (as Lucas)');
ok(await E(()=>__sf.p().id)==='lucan','…playing Lucas');
let r=await talk('kline');ok(r.lines&&!/11:59/.test(r.lines.join(' '))&&/ledgers first/.test(r.lines.join(' ')),'the archive’s clues unlock in order (Kairos’s line waits for the shelf)');
await completeWalk();ok((await F()).lucas_page,'he finds his own intake page');
s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Long Way Home','then the long way (kept)');await completeWalk();
s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Other Boy','Sister Agathe, then the orphanage walk');
await shot('r9_orphanage');
const k0=(await S()).keep;await completeWalk(['bunk','board','saucer']);ok((await F()).lucas_frag===3&&(await S()).keep===k0+1,'all three childhood objects → lucas_frag 3 and a Keepsake');
s=await advance();ok(s&&s.m==='fight'&&await E(()=>__sf.m().M.name)==='Forgotten Memory','Forgotten Memory: a solo fight');
ok(JSON.stringify(await E(()=>__sf.team().members.map(m=>m.id)))==='["lucan"]','…Lucas alone');
let maxBuff=0;for(let i=0;i<40&&await E(()=>__sf.st())==='play';i++){await E(()=>__sf.kill());await p.waitForTimeout(350);maxBuff=Math.max(maxBuff,await E(()=>__sf.team()?__sf.team().atkBuffV||0:0));}
ok(maxBuff>=0.29,'each returning memory makes him stronger (attack buff reached +'+Math.round(maxBuff*100)+'%)');
await p.waitForTimeout(1500);
s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Morning After','the fire, then the playable morning after');
ok(await E(()=>__sf.m().M.kid)===1,'…as nine-year-old Lucas');
await shot('r9_morning');await completeWalk();
s=await advance({choose:[/Knock on the glass/],until:/^Scene 9\.5/});
ok(!!(await S()).ch1b.flags.c_lucas_door,'the door choice: he knocks (c_lucas_door)');
s=await advance();ok(s&&s.pzl,'R10: the ticker puzzle');
const no=await pzlPick(3);ok(/Lunatic/.test(no),'a wrong decode: Theo laughs at “lunatic”');
await pzlPick(1);await pzlPick(1);await p.waitForTimeout(300);
ok(await E(()=>__sf.story()['ch1.ashlane'])!=null||await E(()=>!!(__sf.save().story||{})['ch1.ashlane']),'decoding opens Ash Lane on the world map');
s=await advance();ok(s&&s.m==='defense'&&await E(()=>__sf.m().M.name)==='Lights Out','R11 opens with Lights Out');
ok(JSON.stringify((await E(()=>__sf.team().members.map(m=>m.id))).sort())==='["bram","ines","theo"]','…fixed party Agnes, Bram, Theo');
await p.waitForTimeout(1200);await shot('r11_lightsout');await winFight();
s=await advance();ok(s&&s.pick,'Lucas arrives by the courier lift, then the assault pick');
const pool=await E(()=>[...document.querySelectorAll('#overlay .pick3 .slot .nm')].map(e=>e.textContent).join(','));
ok(/Lucas/.test(pool)&&!/Kairos|Naomi|Dess/.test(pool),'assault pick: Agnes, Bram, Theo, Lucas only ('+pool+')');
await pickGo();await winFight();
s=await advance();ok(s&&s.m==='stealth','the held-minute sneak (kept)');await winFight();
s=await advance({choose:[/Open the cabinet/]});ok(s&&s.pzl,'Dess’s cores puzzle');for(const a of [1,0,1])await pzlPick(a);
s=await advance({choose:[/Open the cabinet/]});ok(s&&s.pick,'the cores choice, then the escape pick');
ok(!!(await F()).c_cores_free,'cores released (c_cores_free)');
const pool2=await E(()=>[...document.querySelectorAll('#overlay .pick3 .slot .nm')].map(e=>e.textContent).join(','));ok(!/Dess/.test(pool2)&&/Kairos/.test(pool2)&&/Lucas/.test(pool2)&&!/Naomi/.test(pool2),'escape pick: two fighters from Kairos, Lucas, Agnes, Bram, Theo; Dess is the one protected ('+pool2+')');
ok(await E(()=>/Pick 2/.test(document.querySelector('#overlay .form-head').textContent)),'…pick two');
await pickGo();ok(await E(()=>__sf.m()&&__sf.m().obj&&__sf.m().obj.label)==='Dess at the seal door'&&!(await E(()=>__sf.team().members.map(m=>m.id))).includes('dess'),'the escape protects Dess at the seal doors (she isn’t also fighting)');
await p.waitForTimeout(13500);ok(/Seal door 1 open/.test(await E(()=>__sf.room().bannerText||'')+'')||await E(()=>(__sf.m().door|0)>=1),'the first seal door opens while you hold');
await shot('r11_escape');await winFight();
s=await advance({choose:[/Why me/],until:/^Scene 9\.8/});const f9=await S();
ok(!f9.ch1b.roster.includes('lucan')&&f9.ch1b.roster.includes('dess')&&f9.ch1b.met.includes('lucan'),'after the breakout Lucas leaves; Dess stays ('+f9.ch1b.roster.join(',')+')');
s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Crane House','R12: the Crane house walk');await completeWalk();
s=await advance({choose:[/Why me/],until:/^Scene 1[01]/});ok(!!(await S()).ch1b.flags.c_crane_why,'the Crane choice is saved (c_crane_why)');
}
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/ch1r_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
