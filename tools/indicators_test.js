// Interaction indicators: ! for quests and steps, ? for discoveries, nothing for small talk. Usage: node indicators_test.js [phone|small]
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
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── before the clear: only quests get a mark
{const sv=save(0);sv.mx.q={};await load(sv);}
await go('market');let M=await marks();
ok(M.matteo==='!'&&!M.tessa&&!M.rosa&&!M.fish,'Market Ring: Matteo (a quest) has “!”; ordinary townsfolk have nothing ('+JSON.stringify(M)+')');
await go('chapel');M=await marks();ok(!M.believer,'no bubble on people with only small talk');
// ── after the clear, at the hideout
await load(save(1));await go('tower');M=await marks();
ok(M.h_bram==='?'&&M.h_noemi==='?'&&M.h_cass==='?','Bram, Naomi and Cassie show “?”: talking to them can reveal a story');
ok(!M.h_agnes&&!M.h_theo,'Agnes (her story is found at the workbench) and Theo (no story of his own to find) show nothing');
ok(!M.h_dess,'Dess’s locked story shows nothing');
let r=await interact('h_bram');M=await marks();ok(M.h_bram==='!b','after one talk Bram’s story is found: “?” becomes the rose story “!”');
r=await interact('h_noemi');M=await marks();ok(M.h_noemi==='?','Naomi needs a second conversation; still “?”');
r=await interact('h_noemi');M=await marks();ok(M.h_noemi==='!b','…and then the rose story “!”');
// readables: ? until read
ok(M['look.bedrolls']==='?','an unread readable shows “?”');await interact('look.bedrolls');M=await marks();ok(!M['look.bedrolls'],'and nothing once read');
// a district after the clear: officials and townsfolk without quests show nothing
{const sv=save(1);for(const q of ['streets','glasses','lanterns','roster','rounds','side_sunday_cups','side_beyond_wall'])sv.mx.q[q]={s:'done',n:9};await load(sv);}
await go('market');M=await marks();const shown=Object.entries(M).filter(([k,v])=>v&&!/^(market|look|sec|chest|obj)\./.test(k));
ok(shown.length===0,'Market Ring after its quests are done: no bubbles on people ('+JSON.stringify(shown)+')');
await go('plaza');M=await marks();ok(M.hanne==='!'&&!M.inspector&&!M.fwoman,'Festival Square: only Old Hanne (a story to offer) is marked');
await p.screenshot({path:`out/ind_${mode}_plaza.png`});
// Dess: nothing while locked, “!” once unlocked
{const sv=save(1);for(const id of ['agnes_handmade','bram_bread','lark_couldnt_save','cass_prayer','lucas_mem_bread','lucas_mem_plan','lucas_mem_room']){sv.mx.q[id]={s:'done',n:9};sv.claims['mxq:'+id]=1;}await load(sv);}
await E(()=>__sf.qtick());await go('tower');M=await marks();ok(M.h_dess==='!b','when her story unlocks, Dess shows “!”');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/ind_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
