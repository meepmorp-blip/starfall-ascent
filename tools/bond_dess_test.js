// Stage 8 · Dess (The Girl in the Experiment) and the Institute annex. Usage: node bond_dess_test.js [phone|small]
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
const reachable=ids=>E(ids=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];const pl=__sf.p();let c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);
  if(!free(B[0]+c0*step,B[1]+r0*step)){outer:for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(free(B[0]+c*step,B[1]+rr*step)&&Math.hypot(c-c0,rr-r0)<6){c0=c;r0=rr;break outer;}}
  q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  return m.npcs.filter(n=>ids.includes(n.id)).filter(n=>!can(n.x,n.y)).map(n=>n.id);},ids);
const walk=async(key,edge,target)=>{await E(e=>{const B=__sf.bounds(),pl=__sf.p();if(e==='n'){pl.x=(B[0]+B[2])/2;pl.y=B[1]+20;}else if(e==='s'){pl.x=(B[0]+B[2])/2;pl.y=B[3]-20;}},edge);
  await p.keyboard.down(key);for(let i=0;i<40;i++){await p.waitForTimeout(40);if(target&&await E(t=>__sf.mx().at===t,target))break;}await p.keyboard.up(key);await p.waitForTimeout(800);};
const PRE=['agnes_handmade','bram_bread','lark_couldnt_save','cass_prayer','lucas_mem_bread','lucas_mem_plan','lucas_mem_room'];
// how to finish each prerequisite from its last step (index of the last step, and the flag that completes it)
const LAST={agnes_handmade:[3,'ag_end'],bram_bread:[3,'br_end'],lark_couldnt_save:[4,'lt_end'],cass_prayer:[4,'cp_end'],lucas_mem_bread:[0,'lm_bread'],lucas_mem_plan:[0,'lm_plan'],lucas_mem_room:[0,'lm_room']};
const withPre=(lastId,partial)=>{const sv=save(1);sv.story={'oldchapel.found':1};for(const id of PRE){if(id===lastId){sv.mx.q[id]={s:'active',n:LAST[id][0],at:1};if(!partial)sv.mx.f[LAST[id][1]]=1;}else{sv.mx.q[id]={s:'done',n:9};sv.claims['mxq:'+id]=1;}}sv.mx.at='tower';return sv;};
const SPOIL=/Mercy|holy water|silver cup|Demiurge|\bLucas\b|Horaios|Archive|Unbound|Hollow Choir|\bKeepers\b|you were the subject|it was you|that was me|it is me|it’s me\b/i;
let text=[];const talk=async id=>{const r=await interact(id);text=text.concat(r.lines);return r;};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(0));ok(await st('dess_experiment')==='locked_by_story','before the Chapter 1 clear Dess’s story is story-locked');
await load(save(1));ok(await st('dess_experiment')==='locked_by_prerequisite','after the clear it is locked behind the other stories');
ok(await mark('h_dess')!=='!'&&await E(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])).annex)==='locked','no "!" on Dess, and the annex is unknown');
await walk('KeyW','n',null);ok(await E(()=>__sf.mx().at)==='tower','the tower’s north edge leads nowhere yet');
// six of seven, plus the seventh only started: still locked
await load(withPre('lucas_mem_room',true));ok(await st('dess_experiment')==='locked_by_prerequisite','six stories done and the seventh only started: still locked');
// the seventh finishing unlocks it, whichever one is last
for(const last of ['lucas_mem_room','agnes_handmade','lark_couldnt_save']){await load(withPre(last,false));await E(()=>__sf.qtick());
  const s0=await S();ok(s0.mx.q[last].s==='done'&&await st('dess_experiment')==='available'&&s0.mx.qseen.dess_experiment,'finishing '+last+' last unlocks and reveals Dess’s story');}
ok(await E(()=>!!__sf.qplaces().tower),'the Clock Tower is marked');
await go('tower');ok(await mark('h_dess')==='!b','Dess has the rose story "!"');
await p.screenshot({path:`out/dess_${mode}_unlock.png`});
let r=await talk('h_dess');ok(r.lines.some(l=>/ANNEX/.test(l))&&await st('dess_experiment')==='active','Dess’s core glows gold; she asks you to come');
let s=await S();ok(s.story['annex.found']&&await E(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])).annex)==='found','the annex is on the map now');
await walk('KeyW','n','annex');s=await S();ok(s.mx.at==='annex'&&s.mx.seen.annex&&await step('dess_experiment')==='records','across the rooftops to the annex');
// the annex itself
const geo=await E(()=>{const m=__sf.m(),inside=(x,y)=>m.solids.some(s=>s.w?x>s.x&&x<s.x+s.w&&y>s.y&&y<s.y+s.h:Math.hypot(x-s.x,y-s.y)<s.r);return __sf.annexGeo().filter(o=>o.k!=='wall').map(o=>[o.k,inside(o.x+o.w/2,o.y+o.h/2)]);});
ok(geo.every(g=>g[1]),'tanks, racks, consoles and the chair are solid ('+geo.length+')');
const ids=['annex.de_r1','annex.de_r2','annex.de_r3','annex.de_r4','annex.chair','annex.core.violet','annex.core.cracked','annex.core.gold','q_dess','look.annexstar','annex.sign'];
await E(ids=>{for(const n of __sf.m().npcs)if(ids.includes(n.id))n.hide=()=>false;},ids);
{const miss=await E(ids=>ids.filter(i=>!__sf.m().npcs.some(n=>n.id===i)),ids),hb=await hudHits(ids),rc=await reachable(ids);const bad=[...miss.map(x=>'missing '+x),...hb.map(x=>'hud '+x),...rc.map(x=>'unreachable '+x)];
 ok(bad.length===0,'every file, core, the chair and Dess are placed, reachable and clear of the HUD'+(bad.length?': '+bad.join(', '):''));}
await go('tower');await go('annex');
r=await talk('look.annexstar');ok(r.lines.some(l=>/child’s height/.test(l)),'a star drawn on the glass, from the inside');
for(const k of ['de_r1','de_r2'])await talk('annex.'+k);
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
ok(await E(()=>__sf.mx().at)==='annex'&&await step('dess_experiment')==='records'&&await E(()=>__sf.mx().items.de_r2),'a reload keeps you in the annex with the files found so far');
for(const k of ['de_r3','de_r4'])await talk('annex.'+k);ok(await step('dess_experiment')==='rebuild','all four files');
// rebuild the room
ok(await mark('annex.chair')==='!','the chair has a "!" in the same visit');await talk('annex.chair');ok(await p.locator('.pzl-o').count()===3,'rebuilding the room is a puzzle');
await pick(0);ok(await E(()=>/The chair has to be in the middle/.test(document.body.textContent)),'a wrong answer gets Dess’s correction');
await p.locator('.pzl .btn.ghost').click();await p.waitForTimeout(300);ok(await step('dess_experiment')==='rebuild','leaving keeps the step');
await talk('annex.chair');await pick(1);await pick(1);await pick(1);await p.waitForTimeout(400);ok(await step('dess_experiment')==='cores','the room is rebuilt');
// wake the cores, low to high
await talk('annex.core.gold');ok(await E(()=>(__sf.m().lit||[]).length)===0,'the gold core first: nothing (low to high)');
for(const c of ['violet','cracked','gold'])await talk('annex.core.'+c);ok(await step('dess_experiment')==='fight','violet, cracked, gold: the cores sing');
await p.screenshot({path:`out/dess_${mode}_cores.png`});
// the fight, then the memory
r=await talk('q_dess');ok(await winFight(),'something comes out of the gold core: a real fight');
ok(await E(()=>__sf.mx().at)==='annex'&&await step('dess_experiment')==='memory','back in the annex afterwards');
const s0=await S();await talk('q_dess');ok(await scene(),'the memory is a scene');s=await S();
ok(s.mx.q.dess_experiment.s==='done'&&s.bonds.dess===1&&s.keep===s0.keep+2&&(s.frags.length>s0.frags.length||s.dust>=s0.dust+140)&&s.dust>=s0.dust+60&&s.mx.mem['rec.de']&&s.story['dess.annex'],'complete: Bond +1 for Dess, Stardust, two Keepsakes, a Star-born Fragment, the research log');
await go('tower');await go('annex');ok(await E(()=>!__sf.m().npcs.some(n=>(n.id==='q_dess'||/^annex\.(core|chair)/.test(n.id))&&!(n.hide&&n.hide(__sf.m())))),'afterwards the cores and Dess have left the annex');
const d1=(await S()).dust;await E(()=>{__sf.qstart('dess_experiment');__sf.qtick();});await go('tower');r=await talk('h_dess');ok((await S()).dust===d1&&!/ANNEX/.test(r.lines.join(' ')),'not offered or paid again');
// Journal and canon
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
ok(/The Girl in the Experiment/.test(await E(()=>document.body.textContent))&&/Research log · Subject/.test(await E(()=>document.body.textContent)),'the story and the research log are in the Journal');
const src=await E(()=>__sf.src5());const all=src+' '+text.join(' ');const bad=all.match(SPOIL);
ok(!bad,'nothing confirms the Subject is Dess; no Mercy or Chapter 2 material'+(bad?' ('+all.match(new RegExp('.{50}'+bad[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'.{20}'))+')':''));
ok(/It isn’t mine/.test(src)&&/When Dess looks up, it is gone/.test(src)&&/name removed/.test(all),'the Subject stays unnamed and the girl of light stays unexplained');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/dess_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
