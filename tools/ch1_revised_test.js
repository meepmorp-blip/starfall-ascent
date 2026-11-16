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
if(!only||only==='5'){
// ═══ Stage 5b · R13 the Clock Tower → R14 Naomi's warning
await at('Scene 11#0',['kairos','ines','bram','theo','dess'],{c_lucas_door:1,c_cores_free:1,c_joke:1},['kairos','ines','bram','noemi','theo','lucan','dess']);
let s=await advance({choose:[/breakfast/]});ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Clock Tower','R13: the tower walk (evening, no Lucas yet)');
ok(!(await E(()=>__sf.m().npcs.map(n=>n.id))).includes('lucan'),'Lucas is not at the tower yet');
await shot('r13_tower');
let r=await talk('tallies');ok(r.lines&&/one mark/.test(r.lines.join(' ')),'the chalk tallies are the clue');
const b0=await E(()=>({n:__sf.bond('noemi'),t:__sf.bond('theo')}));r=await talk('ticker');await p.waitForTimeout(300);const b1=await E(()=>({n:__sf.bond('noemi'),t:__sf.bond('theo')}));
ok(b1.n===b0.n+1&&b1.t===b0.t+1,'Naomi’s Bond moment happens by ticker, for both Naomi and Theo ('+JSON.stringify(b0)+' → '+JSON.stringify(b1)+')');
r=await talk('dess');ok(r.lines&&/lanterns/.test(r.lines.join(' ')),'Dess remembers the cores you freed (c_cores_free)');
r=await talk('gears');ok(r.pzl,'the clock room opens the gear puzzle');
const no=await pzlPick(0);ok(/grind back/.test(no),'turning the wrong gear first: the train grinds back');
for(const a of [2,1,1,0])await pzlPick(a);await drainDialog();ok(!!(await F()).clock_hatch,'turning them in tally order lifts the hatch (clock_hatch)');
await p.waitForTimeout(1700);
s=await advance({choose:[/really up here/]});ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='Two in the Morning','Cassie in the bell loft, then Lucas arrives: the night walk');
const c5=await S();ok(c5.ch1b.roster.includes('lucan')&&!c5.ch1b.roster.includes('cass'),'Lucas rejoins the party; Cassie does not join yet ('+c5.ch1b.roster.join(',')+')');
ok(c5.ch1b.flags.c_cass_ask,'the Cassie choice is saved (c_cass_ask)');
const f0=(await S()).frags.length;r=await talk('page');await p.waitForTimeout(300);ok((await F()).cass_page&&(await S()).frags.length>f0,'the hymnal page she dropped: cass_page and a Star Fragment');
await completeWalk();
s=await advance({choose:[/For Tessa/],until:/^Scene 12/});const c6=await S();
ok(c6.ch1b.flags.c_fest_tessa&&/^Scene 12/.test(c6.ch1b.k),'Naomi’s warning and the debate end in the Festival choice (c_fest_tessa), then the Festival');
ok(JSON.stringify(c6.ch1b.roster.slice().sort())===JSON.stringify(['bram','dess','ines','kairos','lucan','theo']),'party entering the Festival: Kairos, Agnes, Bram, Theo, Lucas, Dess ('+c6.ch1b.roster.join(',')+')');
}
if(!only||only==='6'){
// ═══ Stage 6 · R15 the Festival
await at('Scene 12#0',['kairos','ines','bram','theo','lucan','dess'],{c_cass_ask:1,cass_page:1,c_fest_tessa:1},['kairos','ines','bram','noemi','theo','lucan','dess']);
let s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='Festival of the Mercy','R15: the Festival walk');
const ids=await E(()=>__sf.m().npcs.map(n=>n.id));ok(!ids.includes('noemi')&&ids.includes('lucan')&&ids.includes('dess'),'Naomi isn’t at the Festival; Lucas and Dess are');
await p.waitForTimeout(800);await shot('r15_fest');
let r=await talk('cistern');ok(r.lines&&/Find Cassie first/.test(r.lines.join(' ')),'the cistern stair waits until you have found Cassie');
const d0=(await S()).dust;for(const id of ['carter','fclerk','oldman'])await talk(id);await p.waitForTimeout(300);
ok((await F()).mercy_clues===3&&(await S()).dust===d0+40,'three clues about the water → mercy_clues 3 and 40 Stardust');
const st=await E(()=>{const n=__sf.m().npcs.find(o=>o.id==='stew1');return {x:n.x,y:n.y};});await E(n=>{const pl=__sf.p();pl.x=n.x+10;pl.y=n.y+8;},st);await p.waitForTimeout(400);
const after=await E(()=>{const n=__sf.m().npcs.find(o=>o.id==='stew1');const pl=__sf.p();return Math.hypot(pl.x-n.x,pl.y-n.y);});ok(after>40,'a steward turns you back (“move along”) without failing anything ('+Math.round(after)+'px away now)');
r=await talk('cass');await completeWalk();
s=await advance({choose:[/Write something/]});ok(s&&s.pick,'Cassie covers for them; then the cistern pick');
const pool=await E(()=>[...document.querySelectorAll('#overlay .pick3 .slot .nm')].map(e=>e.textContent).join(','));
ok(!/Cassie|Naomi/.test(pool)&&/Dess/.test(pool)&&/Lucas/.test(pool),'cistern pick: the six present, no Cassie yet, no Naomi ('+pool+')');
await pickGo();ok(await E(()=>__sf.m()&&__sf.m().M.name)==='The Cistern Stair','the cistern fight (waxers first)');await p.waitForTimeout(1000);await shot('r15_cistern');await winFight();
s=await advance({choose:[/Write something/]});ok(s&&s.m==='frozen'&&await E(()=>__sf.m().M.name)==='The Lantern Rig','the Unburdening, Tessa’s mother, Cassie’s badge, the eclipse: then the held minute under the lantern rig');
ok(!!(await F()).c_unburden_write,'the Unburdening choice is saved (c_unburden_write)');
await p.waitForTimeout(800);await shot('r15_rescue');await winFight();
s=await advance();ok(s&&s.pick,'Cassie joins; the crowd defense pick');
const pool2=await E(()=>[...document.querySelectorAll('#overlay .pick3 .slot .nm')].map(e=>e.textContent).join(','));ok(/Cassie/.test(pool2)&&!/Naomi/.test(pool2)&&(pool2.split(',').length===7),'Festival pick: all seven, Cassie included, no Naomi ('+pool2+')');
await pickGo();await winFight();
s=await advance({until:/^Scene 13/});const c7=await S();ok(/^Scene 13/.test(c7.ch1b.k)&&c7.ch1b.roster.includes('cass'),'the dusk bridge leads into the Registry with Cassie in the party');
}
if(!only||only==='7'){
// ═══ Stage 7 · R16 the Registry → Intake Window 1 → dawn
const R7=['kairos','ines','bram','theo','lucan','dess','cass'];
await at('Scene 13#0',R7,{mercy_clues:3,c_lucas_door:1,c_breakfast:1,c_job:1},R7.concat(['noemi']));
let s=await advance();ok(s&&s.m==='walk'&&await E(()=>__sf.m().M.name)==='The Registry of Births','R16: the Registry hall walk');
await shot('r16_hall');
let r=await talk('theo');ok(r.lines&&/Same timetable/.test(r.lines.join(' ')),'with all three Festival clues, Theo connects the cup carts to the Registry');
const k0=(await S()).keep;for(const id of ['houses','warm','twin','stamp'])await talk(id);await p.waitForTimeout(300);
ok((await F()).registry_reads===4&&(await S()).keep===k0+1,'four Registry reads → registry_reads 4 and a Keepsake');
r=await talk('stamp');ok(r.lines&&/FORWARD: ARCHIVE/.test(r.lines.join(' ')),'the Mercury “FORWARD: ARCHIVE” stamp is there to find');
await completeWalk();
s=await advance();ok(s&&s.pzl,'the House gates puzzle (kept)');for(const a of [0,1,2])await pzlPick(a);
for(let i=0;i<60;i++){if(await p.$('#overlay .pick3')||await E(()=>__sf.st())==='play')break;const bt=await p.$('#overlay:not([hidden]) [data-primary]');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});await E(()=>__sf.cutNext&&__sf.cut()&&__sf.cutNext());await p.waitForTimeout(120);}
for(let i=0;i<4&&await p.$('#overlay .pick3');i++){await p.locator('#overlay [data-primary]').click();await p.waitForTimeout(800);}
await p.waitForTimeout(1500);ok(await E(()=>__sf.m()&&__sf.m().M.type)==='split','the Stacks: two teams');
let runner=false;for(let i=0;i<30&&!runner;i++){await p.waitForTimeout(500);runner=await E(()=>__sf.en().some(e=>e.runner&&!e.dead));}
ok(runner,'the Record Keepers: a glowing Collector runs for the far wall with a record');await shot('r16_stacks');
await winFight();
s=await advance();for(let i=0;i<5&&await p.$('#overlay .pick3');i++){await p.locator('#overlay [data-primary]').click();await p.waitForTimeout(1500);}
let lines=[];for(let i=0;i<900;i++){const st=await E(()=>({cut:!!__sf.cut(),st:__sf.st(),done:__sf.save().ch1b&&__sf.save().ch1b.done,boss:!!__sf.boss()}));
  if(st.done)break;{const ch=await p.$$('.cchoice');let did=false;for(const c of ch)if(await c.isVisible()){await c.click();did=true;break;}if(did){await p.waitForTimeout(80);continue;}}
  if(st.cut){lines.push(await E(()=>(document.querySelector('.cut-dlg .say, .cut-dlg')||{}).textContent||''));await E(()=>__sf.cutNext());await p.waitForTimeout(15);continue;}
  if(st.st==='play'&&st.boss){await E(()=>{const b=__sf.boss();if(b&&b.hp>b.maxHp*0.3)b.hp=b.maxHp*0.3;});await p.waitForTimeout(300);continue;}
  const ch=await p.$$('.cchoice');let did=false;for(const c of ch)if(await c.isVisible()){await c.click();did=true;break;}if(did)continue;
  const bt=await p.$('#overlay:not([hidden]) [data-primary]');if(bt&&await bt.isVisible()){await bt.click().catch(()=>{});await p.waitForTimeout(100);continue;}
  await p.waitForTimeout(100);}
const all=lines.join(' ');
ok(/I came back/.test(all),'before the Gate, Lucas: “I came back” (c_lucas_door)');
ok(/Where’s Lucas/.test(all)&&/Seven of us/.test(all),'Naomi arrives at dawn: seven on the roof, one empty space');
const fin=await S();if(!(fin.ch1b.done&&fin.ch1Clears>=1)){log.push('NOTE end state '+JSON.stringify(await E(()=>({st:__sf.st(),k:__sf.save().ch1b.k,seq:__sf.seq()&&__sf.seq().i,n:__sf.ch1seq().length,ov:document.getElementById('overlay').hidden?'':document.getElementById('overlay').textContent.slice(0,160)}))));await shot('r16_end');}
ok(fin.ch1b.done&&fin.ch1Clears>=1,'Chapter 1 ends and is marked cleared');
}
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/ch1r_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
