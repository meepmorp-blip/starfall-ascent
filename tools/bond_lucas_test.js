// Stage 6 · Lucas · The Things We Remember, Part A (three memories while he is captured). Usage: node bond_lucas_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const E=(f,a)=>p.evaluate(f,a);
const npc=id=>E(id=>{const n=__sf.m().npcs.find(o=>o.id===id&&!(o.hide&&o.hide(__sf.m())));return n?{x:n.x,y:n.y}:null;},id);
const press=async()=>{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);const lines=[];
  for(let i=0;i<30;i++){if(await E(()=>__sf.st())==='dialog'){lines.push(await E(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}await p.waitForTimeout(200);return lines;};
async function interact(id){let near=null;for(const [ox,oy] of [[-22,6],[22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){const n=await npc(id);if(!n)return {near:null,lines:[]};
    await E(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,ox,oy]);await p.waitForTimeout(160);near=await E(()=>__sf.m().near&&__sf.m().near.id);if(near===id)break;}
  return {near,lines:await press()};}
const go=async d=>{await E(d=>__sf.mxGo(d),d);await p.waitForTimeout(850);};
const st=id=>E(id=>__sf.qstate(id),id);const step=id=>E(id=>{const q=__sf.mx().q[id];return q&&q.s!=='done'?__sf.mxQ[id].steps[q.n].id:null;},id);
const mark=id=>E(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n&&n.mkf?n.mkf():null;},id);
const pick=async i=>{await p.locator('.pzl-o').nth(i).click();await p.waitForTimeout(220);};
const winFight=async()=>{await p.waitForTimeout(1400);const inFight=await E(()=>__sf.m()&&__sf.m().M.type==='fight');await E(()=>__sf.win());
  for(let i=0;i<40;i++){await p.waitForTimeout(200);if(await E(()=>__sf.m()&&__sf.m().M.type==='walk'))break;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}
  await p.waitForTimeout(700);return inFight;};
const scene=async()=>{await p.waitForTimeout(500);const had=await E(()=>!!__sf.cut());for(let i=0;i<40&&await E(()=>!!__sf.cut());i++){await E(()=>__sf.cutNext());await p.waitForTimeout(120);}await p.waitForTimeout(900);return had;};
const hudHits=ids=>E(ids=>{const m=__sf.m(),H=__sf.hud(),out=[],sw=H.sw;const scr=[[sw*0.1,0,sw*0.9,H.safe.t+70],[0,0,H.safe.l+14+Math.min(190,Math.max(130,sw*0.2))+6,H.safe.t+74],[sw-H.safe.r-70,0,sw,70]];
    if(H.touch)for(const k of ['atk','dodge','sun','moon','ult']){const c=H.btn[k];if(c&&c.r)scr.push([c.x-c.r-6,c.y-c.r-6,c.x+c.r+6,c.y+c.r+6]);}
    for(const c of H.ports)if(c&&c.r)scr.push([c.x-c.r-4,c.y-c.r-4,c.x+c.r+40,c.y+c.r+4]);
    for(const n of m.npcs){if(!ids.some(i=>n.id.startsWith(i)))continue;const x=H.ox+n.x*H.scale,y=H.oy+n.y*H.scale,r=12*H.scale;
      for(const [a,b,c,e] of scr)if(x+r>a&&x-r<c&&y+r*0.6>b&&y-r*1.4<e)out.push(n.id);}return [...new Set(out)];},ids);
const SPOIL=/Mercy|holy water|silver cup|\bcups?\b|fountain|Sunday|Demiurge|Lucas|Horaios|Archive|Registry/i;
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
const inWalk=k=>E(k=>!!(__sf.m()&&__sf.m().M&&__sf.m().M.id===k||(__sf.m()&&__sf.room()&&__sf.room().def&&__sf.room().def.mission===k)),k);
const cutThrough=async()=>{for(let i=0;i<60&&await E(()=>!!__sf.cut());i++){await E(()=>__sf.cutNext());await p.waitForTimeout(110);}await p.waitForTimeout(700);};
const waitWalk=async k=>{for(let i=0;i<40;i++){if(await E(k=>__sf.room()&&__sf.room().def&&__sf.room().def.mission===k&&__sf.st()==='play',k))return true;await p.waitForTimeout(150);}return false;};
const afterWalk=async()=>{for(let i=0;i<50;i++){await p.waitForTimeout(200);if(await E(()=>!!__sf.cut()))break;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}
  await cutThrough();for(let i=0;i<30;i++){if(await E(()=>__sf.m()&&__sf.m().M&&__sf.m().M.hub&&__sf.st()==='play'))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);};
const SCENE9=['we say the cat did it','There isn’t a cat.','Then she can’t prove it wasn’t the cat.','That’s the worst plan I’ve ever heard.','You say that about all my plans.','Because I remember all of them.'];
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(0));ok(await E(()=>__sf.lucas())==='free'&&await st('lucas_mem_bread')==='locked_by_story','before the Chapter 1 clear Lucas is free and his memories are locked');
await go('hesper');ok(!(await E(()=>__sf.m().npcs.some(n=>/^mem\./.test(n.id)))),'no memory objects at St. Hesper’s before the clear');
await load(save(1));ok(await E(()=>__sf.lucas())==='captured','after the clear Lucas is captured');
await go('tower');ok(await E(()=>!__sf.m().npcs.some(n=>n.ch==='lucan')),'no present-day Lucas at the hideout');
await go('hesper');
const vis=await E(()=>__sf.m().npcs.filter(n=>/^mem\./.test(n.id)&&!n.hide()).map(n=>n.id));ok(vis.length===1&&vis[0]==='mem.bread','only the first memory can be found ('+vis.join(',')+')');
ok(await mark('mem.bread')==='?','the loose board by the bakery has a "?"');
{const hb=await hudHits(['mem.']);ok(hb.length===0,'memory objects are clear of the HUD'+(hb.length?': '+hb.join(','):''));}
let text=[];
// ── memory 1: The Bread Incident
let r=await interact('mem.bread');text=text.concat(r.lines);ok(await st('lucas_mem_bread')==='active','touching the board starts the memory');
await p.waitForTimeout(400);ok(await E(()=>!!__sf.cut()),'it opens with a scene');await cutThrough();
ok(await waitWalk('mem_bread'),'then you walk the memory');
ok(await E(()=>!!__sf.m().M.kid&&__sf.m().npcs.find(n=>n.id==='kl').kid===1),'as children: Kairos and Lucas are drawn small');
await p.screenshot({path:`out/lucas_${mode}_bread.png`});
r=await interact('fence');ok(r.lines.some(l=>/Wait for me/.test(l)),'Lucas leads: the fence waits for him');
for(const id of ['kl','fence']){r=await interact(id);text=text.concat(r.lines);}
r=await interact('rack');text=text.concat(r.lines);await p.waitForTimeout(300);ok(await p.locator('.pzl-o').count()===3,'the cooling rack is a counting puzzle');
await pick(0);ok(await E(()=>/Count with him/.test(document.body.textContent)),'a wrong loaf gets a hint');await pick(2);await p.waitForTimeout(300);
for(let i=0;i<20&&await E(()=>__sf.st())==='dialog';i++){text.push(await E(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(80);}
r=await interact('shed');text=text.concat(r.lines);ok(r.lines.some(l=>/Pigeons/.test(l)),'caught behind the coal shed: “Pigeons.”');
await afterWalk();let s=await S();
ok(s.mx.q.lucas_mem_bread.s==='done'&&s.mx.at==='hesper','the memory ends back at St. Hesper’s and completes');
ok(s.bonds.lucan===1&&s.mx.mem['rec.lm1']&&s.story['lucas.mem1'],'Bond +1 for Lucas (kept for his return), the end piece in the Journal');
// ── memory 2: The Worst Plan (unlocked by the first)
ok(await E(()=>__sf.m().npcs.some(n=>n.id==='mem.plan'&&!n.hide())),'the tower door is now a memory');
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);ok(await st('lucas_mem_bread')==='completed'&&await st('lucas_mem_plan')==='available'||await st('lucas_mem_plan')==='undiscovered','progress survives a reload');
r=await interact('mem.plan');await p.waitForTimeout(400);await cutThrough();ok(await waitWalk('mem_plan'),'the second memory plays');
r=await interact('kl');text=text.concat(r.lines);ok(r.lines.some(l=>/five to nine/.test(l)),'Lucas’s plan, and Kairos who remembers the rounds');
r=await interact('stairs');ok(r.lines.some(l=>/Not yet/.test(l)),'the stairs first: Sister Agathe is on them');
r=await interact('rounds');text=text.concat(r.lines);r=await interact('laundry');text=text.concat(r.lines);r=await interact('stairs');text=text.concat(r.lines);ok(r.lines.some(l=>/scary when you count/.test(l)),'laundry, then the stairs, right behind her');
await p.screenshot({path:`out/lucas_${mode}_plan.png`});
r=await interact('door');text=text.concat(r.lines);ok(r.lines.some(l=>/pantry/.test(l)),'the key is the pantry key');
await afterWalk();s=await S();ok(s.mx.q.lucas_mem_plan.s==='done'&&s.keep>=1&&s.mx.mem['rec.lm2'],'the second memory completes: a Keepsake and the key that didn’t fit');
// ── memory 3: Old Roommates (the dormitory)
r=await interact('mem.room');await p.waitForTimeout(400);await cutThrough();ok(await waitWalk('mem_room'),'the third memory plays in the dormitory');
ok(await E(()=>__sf.room().def.theme==='dorm'&&__sf.m().solids.length>=9),'the old room has its own art and solid beds');
{const hb=await hudHits(['names','tin','clock','crust','list','kl']);ok(hb.length===0,'everything in the room is clear of the HUD'+(hb.length?': '+hb.join(','):''));}
await p.screenshot({path:`out/lucas_${mode}_room.png`});
r=await interact('kl');ok(r.lines.some(l=>/Look at all my stuff/.test(l)),'Lucas waits until you have looked around');
for(const id of ['names','tin','clock','crust','list','kl']){r=await interact(id);text=text.concat(r.lines);}
await afterWalk();s=await S();
ok(s.mx.q.lucas_mem_room.s==='done'&&s.bonds.lucan===2&&s.mx.mem['rec.lm3']&&s.story['lucas.mem3'],'all three memories complete; Lucas’s Bond is 2');
ok(await E(()=>__sf.m().npcs.filter(n=>/^mem\./.test(n.id)).every(n=>n.mkf()===null)),'the memory objects have nothing left to show');
const d1=s.dust;r=await interact('mem.bread');ok((await S()).dust===d1&&r.lines.some(l=>/remember all of it/.test(l))&&!(await E(()=>!!__sf.cut())),'a finished memory is not replayed or paid again');
// ── Journal, canon
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
const jt=await E(()=>document.body.textContent);ok(/The Bread Incident/.test(jt)&&/Old Roommates/.test(jt)&&/MEMORY/i.test(jt)&&/Two names on a bedpost/.test(jt),'all three memories are in the Journal');
const src=await E(()=>__sf.src4());const all=src+' '+text.join(' ');
ok(SCENE9.every(l=>!all.includes(l)),'no line from Scene 9 is reused');
const bad=all.match(/\bfire\b|burn|Chancellor|Horaios|Archive|Mercy|silver cup|Adoption Day/i);ok(!bad,'no fire, Chancellor, Mercy or capture in the memories'+(bad?' ('+bad[0]+')':''));
ok(await E(()=>{const all=['mem_bread','mem_plan','mem_room'].flatMap(k=>__sf.mxQ&&[]);return true;})&&/"ch":"lucan","kid":1/.test(src)&&!/"ch":"lucan"(?!,"kid":1)/.test(src),'Lucas appears only as a child');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/lucas_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
