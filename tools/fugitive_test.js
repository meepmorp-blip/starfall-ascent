// Fugitive era in the hub and post-Chapter 1 dialogue. Usage: node fugitive_test.js [phone|small]
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
const winFight=async()=>{await p.waitForTimeout(1400);const inFight=await E(()=>__sf.m()&&['fight','defense'].includes(__sf.m().M.type));await E(()=>__sf.win());
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
const STALE=['Still running Matteo’s errands','not this close to the Festival','Mama says I can carry one at the Festival','writing his Festival sermon','Two hundred lanterns before the Festival','remember EVERYTHING about the Festival this year','Every year I come early','wants to try the cup this year','Dr. Lark has us asking','They keep telling me it’s Tuesday','none in the streets.','Rooftop rotation in twenty'];
const people=()=>E(()=>__sf.m().npcs.filter(n=>!n.spot&&!n.draw&&!(n.hide&&n.hide(__sf.m()))).map(n=>n.id));
const banner=()=>E(()=>{const r=__sf.room();return r?(r.bannerSub||''):'';});
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── before the Chapter 1 clear: the city as it was
{const sv=save(0);sv.mx.q={};await load(sv);}
for(const d of ['plaza','market','office']){await go(d);}
await go('market');let ids=await people();ok(!ids.includes('patrol'),'before the clear: no patrol in the Ring ('+ids.join(',')+')');
await go('plaza');ok(!(await people()).includes('inspector'),'before the clear: no inspector in the Square');
await go('market');let r=await interact('matteo');ok(r.lines.some(l=>/walked it slow/.test(l)),'before the clear: Matteo offers the Festival-week walk as written');
await go('hesper');r=await interact('agathe');r=await interact('agathe');ok(r.lines.some(l=>/Matteo’s errands/.test(l)),'before the clear: Sister Agathe still asks about errands');
// ── after the clear: the fugitive city
{const sv=save(1);sv.mx.q={};await load(sv);}
await go('plaza');ok(/Patrols about/.test(await banner()),'arriving in a watched district says so ('+await banner()+')');
ids=await people();ok(ids.includes('inspector'),'an Office inspector stands by the fountain');
r=await interact('inspector');ok(r.lines.some(l=>/Hood down/.test(l))&&r.lines.some(l=>/Move along/.test(l)),'the inspector stops Kairos, then lets him go');
const r2=await interact('inspector');ok(r2.lines.join()!==r.lines.join(),'and says something different the next time');
await go('market');ok((await people()).includes('patrol'),'a Garrison patrol on the Ring');
await go('office');ok((await people()).includes('doorguard'),'a guard at the Office door');
await go('tower');ok(!/Patrols/.test(await banner()),'the hideout is not watched');
await go('ashlane');r=await interact('laundress');ok(r.lines.some(l=>/nephew|washing|cobbles/.test(l)),'the laundress covers for him on Ash Lane');
// quest offers read right after the Festival, and still start the same quests
await go('market');r=await interact('matteo');ok(r.lines.some(l=>/still standing/.test(l))&&['active','completed'].includes(await st('streets')),'Matteo’s walk is offered for after the Festival, and still starts “Know the Streets”');
await go('plaza');r=await interact('lseller');ok(r.lines.some(l=>/Festival or no Festival/.test(l))&&await st('lanterns')==='active','the lantern seller’s errand reads right after the Festival');
await go('yard');r=await interact('sold');ok(r.lines.some(l=>/Don’t answer, just walk/.test(l))&&await st('roster')==='active','the Garrison soldier gives his errand quietly');
await go('ward');r=await interact('nurse');ok(r.lines.some(l=>/before she… left/.test(l))&&await st('rounds')==='active','the nurse knows Dr. Lark has gone');
// no stale lines anywhere, and no repeats in a row
{const sv=save(1);for(const q of ['streets','glasses','lanterns','roster','rounds'])sv.mx.q[q]={s:'done',n:9};await load(sv);}
const FUG=await E(()=>__sf.fug());
const stale=[],repeats=[];let n=0;
for(const d of ['market','plaza','yard','chapel','ward','hesper','ashlane','office']){await go(d);
  for(const id of await people()){let prev=null;for(let i=0;i<3;i++){const rr=await interact(id);n++;const t=rr.lines.join(' ');
      for(const sx of STALE)if(t.includes(sx))stale.push(d+'.'+id+': '+sx);
      if(prev!==null&&t&&t===prev&&FUG.includes(d+'.'+id))repeats.push(d+'.'+id);prev=t;}}}
ok(stale.length===0,'no Festival-week or “ordinary errand runner” lines after the clear ('+n+' conversations)'+(stale.length?': '+[...new Set(stale)].slice(0,5).join(' | '):''));
ok(repeats.length===0,'after-Chapter-1 small talk never repeats the same line twice in a row'+(repeats.length?': '+[...new Set(repeats)].join(','):''));
await go('hesper');const ag=[];for(let i=0;i<4;i++)ag.push((await interact('agathe')).lines.join(' '));
ok(ag.some(t=>/posters or no posters/.test(t))&&ag.some(t=>/Crane boy/.test(t))&&new Set(ag).size>=3,'Sister Agathe acknowledges the posters, the Registry and Lucas');
await p.screenshot({path:`out/fug_${mode}_hesper.png`});
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/fug_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
