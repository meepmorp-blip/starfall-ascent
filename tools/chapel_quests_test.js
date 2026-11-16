// Stage 7b · The Empty Chapel and The Unofficial Prayer (St. Maren's). Usage: node chapel_quests_test.js [phone|small]
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
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
const reachable=ids=>E(ids=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];const pl=__sf.p();let c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);
  if(!free(B[0]+c0*step,B[1]+r0*step)){outer:for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(free(B[0]+c*step,B[1]+rr*step)&&Math.hypot(c-c0,rr-r0)<6){c0=c;r0=rr;break outer;}}
  q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  return m.npcs.filter(n=>ids.includes(n.id)).filter(n=>!can(n.x,n.y)).map(n=>n.id);},ids);
const SPOIL=/Mercy|holy water|the water|silver cup|\bdrink|Sunday|Demiurge|Lucas|Horaios|Archive|Unbound|Hollow Choir/i;
let text=[];const talk=async id=>{const r=await interact(id);text=text.concat(r.lines);return r;};
const sceneChoose=async want=>{let chose=false;for(let i=0;i<80;i++){const has=await E(()=>!!__sf.cut());if(!has)break;
    const btn=await E(w=>{const b=[...document.querySelectorAll('button.cchoice')].find(b=>b.offsetParent&&b.textContent.includes(w));if(b){b.click();return true;}return false;},want);
    if(btn){chose=true;await p.waitForTimeout(300);continue;}await E(()=>__sf.cutNext());await p.waitForTimeout(110);}
  for(let i=0;i<30;i++){if(await E(()=>__sf.m()&&__sf.m().M&&__sf.m().M.hub&&__sf.st()==='play'))break;await p.waitForTimeout(200);}await p.waitForTimeout(600);return chose;};
const withChapel=(sv,extra)=>{sv.story=Object.assign({'oldchapel.found':1},extra||{});sv.mx.seen.oldchapel=1;return sv;};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(0));ok(await st('side_empty_chapel')==='locked_by_story'&&await st('side_unofficial_prayer')==='locked_by_story','before the Chapter 1 clear both are story-locked');
await load(save(1));ok(await st('side_empty_chapel')==='locked_by_story','after the clear, The Empty Chapel waits until St. Maren’s is known');
await load(withChapel(save(1)));ok(await st('side_empty_chapel')==='undiscovered'&&await st('side_unofficial_prayer')==='locked_by_prerequisite','once St. Maren’s is known: Empty Chapel can be found; the Prayer needs it first');
await go('ashlane');ok(await mark('lamplighter')!=='!','the lamplighter has nothing to say about chalk yet');
// placement (forced visible)
const place=[];for(const [d,ids] of [['oldchapel',['oldchapel.ec_1','oldchapel.ec_2','oldchapel.ec_3','oldchapel.ec_4','oldchapel.sign','grey1','grey2','grey3']],['ashlane',['ashlane.sign']],['ward',['ward.sign']]]){await go(d);
  await E(ids=>{for(const n of __sf.m().npcs)if(ids.includes(n.id))n.hide=()=>false;},ids);const miss=await E(ids=>ids.filter(i=>!__sf.m().npcs.some(n=>n.id===i)),ids);
  place.push(...miss.map(x=>'missing '+x),...(await hudHits(ids)).map(x=>'hud '+x),...(await reachable(ids)).map(x=>'unreachable '+x));}
ok(place.length===0,'every writing, sign and visitor is placed, reachable and clear of the HUD'+(place.length?': '+place.join(', '):''));
// ── The Empty Chapel
await go('oldchapel');ok(await mark('ottilie')==='!','Ottilie has a "!"');await talk('ottilie');ok(await st('side_empty_chapel')==='active','Ottilie asks for help');
for(const k of ['ec_1','ec_2'])await talk('oldchapel.'+k);
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
ok(await E(()=>__sf.mx().at)==='oldchapel'&&await step('side_empty_chapel')==='gather'&&await E(()=>__sf.mx().items.ec_2),'a reload keeps the writings found so far');
for(const k of ['ec_3','ec_4'])await talk('oldchapel.'+k);ok(await step('side_empty_chapel')==='shelve'&&await mark('fen')==='!','all four found; Fen has a "!"');
await talk('fen');ok(await p.locator('.pzl-o').count()===3,'Fen’s shelving puzzle opens');await pick(1);ok(await E(()=>/goes with the singing/.test(document.body.textContent)),'a wrong shelf gets Fen’s hint');
await p.locator('.pzl .btn.ghost').click();await p.waitForTimeout(300);ok(await step('side_empty_chapel')==='shelve','leaving keeps the step');
await talk('fen');await pick(0);await pick(1);await pick(0);await pick(1);await p.waitForTimeout(400);ok(await step('side_empty_chapel')==='lamp','shelved');
ok(await E(()=>{const n=__sf.m().npcs.find(o=>o.id==='oldchapel.lamp');return n&&!n.hide()&&n.mkf()==='!';}),'the reading lamp appears with a "!"');
await talk('oldchapel.lamp');ok(await step('side_empty_chapel')==='end','the lamp is lit');await p.screenshot({path:`out/cq_${mode}_lamp.png`});
await talk('ottilie');let s=await S();ok(s.mx.q.side_empty_chapel.s==='done'&&s.mx.mem['rec.ec']&&s.story['side.chapel'],'The Empty Chapel completes');
await go('ashlane');await go('oldchapel');ok(await E(()=>{const n=__sf.m().npcs.find(o=>o.id==='oldchapel.lamp');return n&&!n.hide()&&n.mkf()===null;}),'the lamp stays lit afterwards');
// ── The Unofficial Prayer
ok(await st('side_unofficial_prayer')==='undiscovered','The Unofficial Prayer is now unlocked');
await go('ashlane');ok(await mark('lamplighter')==='!','the lamplighter has a "!"');await talk('lamplighter');ok(await st('side_unofficial_prayer')==='active','he tells you about the chalk');
await go('ward');await talk('ward.sign');ok(await step('side_unofficial_prayer')==='s1','the signs must be followed in order');
await go('ashlane');await talk('ashlane.sign');await go('ward');await talk('ward.sign');await go('oldchapel');
ok(await E(()=>!__sf.m().npcs.some(n=>/^grey/.test(n.id)&&!n.hide())),'nobody in grey before the last sign');
await talk('oldchapel.sign');ok(await step('side_unofficial_prayer')==='witness','the last sign: tonight');
ok(await E(()=>__sf.m().npcs.filter(n=>/^grey/.test(n.id)&&!n.hide()).length)===3,'three visitors in grey appear in the same visit');
await p.screenshot({path:`out/cq_${mode}_grey.png`});
await talk('grey1');ok(await sceneChoose('She should know'),'the scene ends in a choice');
s=await S();ok(s.mx.q.side_unofficial_prayer.s==='done'&&s.story['prayer.told']&&!s.story['prayer.kept']&&s.mx.mem['rec.up'],'telling Ottilie is remembered; the story completes');
await go('oldchapel');ok(await E(()=>!__sf.m().npcs.some(n=>/^grey/.test(n.id)&&!n.hide())),'the visitors are gone afterwards');
let r=await talk('ottilie');if(!r.lines.some(l=>/Grey coats/.test(l)))r=await talk('ottilie');ok(r.lines.some(l=>/Grey coats/.test(l)),'Ottilie reacts to what you told her');
const d1=(await S()).dust;await E(()=>{__sf.qstart('side_empty_chapel');__sf.qstart('side_unofficial_prayer');__sf.qtick();});ok((await S()).dust===d1,'neither pays twice');
// the other choice
{const sv=withChapel(save(1));sv.mx.q.side_empty_chapel={s:'done',n:4};sv.mx.q.side_unofficial_prayer={s:'active',n:3,at:1};sv.mx.f.ec_lamp=1;sv.mx.at='oldchapel';await load(sv);
 await talk('grey1');await sceneChoose('I won’t tell');s=await S();ok(s.story['prayer.kept']&&!s.story['prayer.told']&&s.mx.q.side_unofficial_prayer.s==='done','keeping their secret is remembered too');
 r=await talk('ottilie');r=r.lines.concat((await talk('ottilie')).lines);ok(!r.some(l=>/Grey coats/.test(l)),'and Ottilie never finds out');}
// Journal and canon
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
ok(/The Unofficial Prayer/.test(await E(()=>document.body.textContent)),'the stories are in the Journal');
const src=await E(()=>__sf.sq2()+JSON.stringify(JSON.parse(__sf.sq())[0].filter(e=>['side_empty_chapel','side_unofficial_prayer'].includes(e.q))));const all=src+' '+text.join(' ');const bad=all.match(SPOIL)||all.match(/\bKeepers\b/);
ok(!bad,'no Mercy, water, Sundays, Chapter 2 material or faction names'+(bad?' ('+all.match(new RegExp('.{50}'+bad[0]+'.{20}'))+')':''));
ok(/Old Heresy/.test(src)&&/come back with stories, and nothing else/.test(src),'older beliefs stay rumour');
ok(/not wicked|aren’t wicked|doesn’t think they are wicked/.test(src),'the visitors are not painted as villains');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/cq_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
