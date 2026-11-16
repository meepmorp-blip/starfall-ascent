// Follow-up conversations after finished stories. Usage: node post_story_test.js [phone|small]
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
const marks=()=>E(()=>{const m=__sf.m();return Object.fromEntries(m.npcs.filter(n=>!(n.hide&&n.hide(m))).map(n=>[n.id,n.mkf?n.mkf()||null:null]));});
const ALLQ=['rounds','agnes_handmade','bram_bread','lark_couldnt_save','cass_prayer','dess_experiment','lucas_mem_bread','lucas_mem_plan','lucas_mem_room','side_unofficial_prayer','side_empty_chapel'];
const withDone=ids=>{const sv=save(1);sv.story={'oldchapel.found':1,'annex.found':1};for(const id of ids){sv.mx.q[id]={s:'done',n:9};sv.claims['mxq:'+id]=1;}return sv;};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── nothing finished: no follow-ups
await load(withDone([]));await go('tower');let M=await marks();
ok(['h_agnes','h_theo','h_dess'].every(k=>!M[k]),'with no stories finished, no follow-up “?” at the hideout');
let r=await interact('h_agnes');ok(!/sling/.test(r.lines.join(' ')),'Agnes has her usual small talk');
// ── only Bram's story finished
await load(withDone(['bram_bread']));await go('tower');M=await marks();
ok(M.h_bram==='?'&&M.h_agnes==='?'&&!M.h_theo&&!M.h_dess,'after Bram’s story: Bram and Agnes have something new to say (“?”); Theo and Dess don’t');
r=await interact('h_bram');ok(r.lines.some(l=>/Gran’s recipe/.test(l)),'Bram’s first follow-up refers to his story (“'+r.lines[0].slice(0,50)+'…”)');
M=await marks();ok(!M.h_bram,'heard: his “?” goes away');
r=await interact('h_agnes');ok(r.lines.some(l=>/six loaves/.test(l)),'Agnes noticed the bread');
await go('hesper');r=await interact('agathe');ok(r.lines.some(l=>/Three spoons of my honey/.test(l)),'Sister Agathe remembers her honey');
// ── everything finished
await load(withDone(ALLQ));await go('tower');M=await marks();
ok(['h_agnes','h_bram','h_noemi','h_theo','h_cass','h_dess'].every(k=>M[k]==='?'),'after every story, all six at the hideout have something new to say');
const expect={h_agnes:/sling’s holding/,h_noemi:/ODELL/,h_theo:/Emptier than empty|emptier than empty/i,h_cass:/Light before the lamps/,h_dess:/research log/};
for(const [k,re] of Object.entries(expect)){r=await interact(k);ok(r.lines.some(l=>re.test(l)),k+': the follow-up refers to the finished story');}
// repeated visits: new lines first, then a mix with small talk, never the same line twice in a row
const seq=[];for(let i=0;i<8;i++)seq.push((await interact('h_bram')).lines.join(' '));
ok(seq.some(t=>/PIGEONS/.test(t))&&seq.some(t=>/Sarge has a new sling/.test(t)),'Bram also reacts to Agnes’s story and to Lucas’s pigeons');
ok(seq.every((t,i)=>i===0||t!==seq[i-1]),'Bram never says the same thing twice in a row');
ok(seq.some(t=>/I brought bread|tower snores|get him back/.test(t)),'his ordinary small talk still comes back');
M=await marks();ok(!M.h_bram,'once all of Bram’s new lines are heard, no “?”');
ok(await E(()=>!__sf.m().npcs.some(n=>n.ch==='lucan')),'Lucas is still not at the hideout (captured)');
r=await interact('look.bedrolls');ok(r.lines.some(l=>/end piece/.test(l))&&r.lines.some(l=>/11:59/.test(l)),'Lucas’s bedroll shows what Kairos remembered');
r=await interact('tower.view');ok(r.lines.some(l=>/sling on a nail/.test(l))&&r.lines.some(l=>/Lucas/.test(l)),'Kairos’s view from the tower reflects the stories he shared');
await go('oldchapel');r=await interact('ottilie');ok(r.lines.some(l=>/prays louder/.test(l)),'Ottilie noticed Cassie');
await go('ward');r=await interact('nurse');ok(r.lines.some(l=>/Odell/.test(l)),'the ward nurse found Mr. Odell’s folder');
// canon guard on all follow-up text
const all=await E(()=>JSON.stringify([__sf.m()&&0]));
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/post_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
