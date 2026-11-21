// Stage 5 · Cassie (A Prayer of Her Own) and St. Maren's, the old chapel district. Usage: node bond_cass_test.js [phone|small]
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
const SPOIL=/Mercy|holy water|silver cup|Demiurge|Lucas|Horaios|Archive|Unbound|Hollow Choir/i;
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
const walk=async(key,edge,target)=>{await E(e=>{const B=__sf.bounds(),pl=__sf.p();if(e==='e'){pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;}else if(e==='w'){pl.x=B[0]+20;pl.y=B[1]+(B[3]-B[1])*0.55;}},edge);
  await p.keyboard.down(key);for(let i=0;i<40;i++){await p.waitForTimeout(40);if(target&&await E(t=>__sf.mx().at===t,target))break;}await p.keyboard.up(key);await p.waitForTimeout(800);};
const wmst=id=>E(id=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st]))[id],id);
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(0));ok(await st('cass_prayer')==='locked_by_story'&&await wmst('oldchapel')==='locked','before the Chapter 1 clear: story-locked, St. Maren’s locked on the map');
// after the clear St. Maren's stays hidden until someone tells you about it
await load(save(1));ok(await wmst('oldchapel')==='locked','after the clear St. Maren’s is still unknown');
await go('ashlane');await walk('KeyD','e',null);ok(await E(()=>__sf.mx().at)==='ashlane','Ash Lane’s east end leads nowhere yet');
// discovery by talking to Cassie twice
await go('tower');await interact('h_cass');ok(await st('cass_prayer')==='undiscovered','one talk with Cassie is small talk');await interact('h_cass');ok(await st('cass_prayer')==='available','a second talk finds her story');
// discovery by the prayer book at the Cloister (fresh save)
await load(save(1));await go('chapel');ok(await mark('look.prayerbook')==='?*','a prayer book lies by the Cloister wall');
let r=await interact('look.prayerbook');let text=r.lines.slice();ok(r.lines.some(l=>/ST\. MAREN/.test(l))&&await st('cass_prayer')==='available','reading it finds Cassie’s story');
await go('tower');ok(await mark('h_cass')==='!','Cassie has a "!"');r=await interact('h_cass');text=text.concat(r.lines);
ok(await st('cass_prayer')==='active'&&(await S()).story['oldchapel.found'],'Cassie offers it; St. Maren’s is now known');
ok(await wmst('oldchapel')==='found'&&await E(()=>!!__sf.qplaces().ashlane),'the map shows St. Maren’s, and Ash Lane is marked');
await go('ashlane');await walk('KeyD','e','oldchapel');let s=await S();ok(s.mx.at==='oldchapel'&&s.mx.seen.oldchapel,'walking off Ash Lane’s east end reaches St. Maren’s');
ok(await step('cass_prayer')==='books','arriving moves the story on');
const ax=await E(()=>__sf.p().x-__sf.bounds()[0]);ok(ax<120,'arrive by the west door ('+Math.round(ax)+')');
await p.screenshot({path:`out/cass_${mode}_arrive.png`});
// the district: people, collision, reach, HUD
const ppl=await E(()=>__sf.m().npcs.filter(n=>!n.spot&&!n.draw&&!(n.hide&&n.hide(__sf.m()))).map(n=>n.id));ok(['ottilie','fen','q_cass'].every(i=>ppl.includes(i)),'Ottilie, Fen and Cassie are in the chapel ('+ppl.join(',')+')');
const sol=await E(()=>{const m=__sf.m(),inside=(x,y)=>m.solids.some(s=>s.w?x>s.x&&x<s.x+s.w&&y>s.y&&y<s.y+s.h:Math.hypot(x-s.x,y-s.y)<s.r);return __sf.oldGeo().filter(o=>o.k!=='wall').map(o=>[o.k,inside(o.x+o.w/2,o.y+o.h/2)]);});
ok(sol.every(x=>x[1]),'every pew, the broken pew, the altar and both shelves are solid ('+sol.length+')');
{const hb=await hudHits(['oldchapel.','q_cass','ottilie','fen','look.roofhole']);ok(hb.length===0,'everything in the chapel is clear of the HUD'+(hb.length?': '+hb.join(','):''));}
const reach=await E(()=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];const pl=__sf.p();const c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  const t=m.npcs.map(n=>[n.id,n.x,n.y]);t.push(['altar',B[0]+(B[2]-B[0])*0.5,B[1]+(B[3]-B[1])*0.26]);return t.filter(t=>!can(t[1],t[2])).map(t=>t[0]);});
ok(reach.length===0,'every person, writing, record and the altar are reachable on foot'+(reach.length?': '+reach.join(','):''));
// the keepers' writings
r=await interact('ottilie');text=text.concat(r.lines);ok(await E(()=>__sf.mx().f.cp_ottilie),'Ottilie asks for the three wet books');
r=await interact('oldchapel.w1');text=text.concat(r.lines);r=await interact('oldchapel.w2');text=text.concat(r.lines);
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
ok(await E(()=>__sf.mx().at)==='oldchapel'&&await step('cass_prayer')==='books'&&await E(()=>__sf.mx().items.cp_w2),'a reload keeps you in the chapel with the books found so far');
r=await interact('oldchapel.w3');text=text.concat(r.lines);ok(await step('cass_prayer')==='altar','the third writing completes the set');
// the altar
ok(await mark('oldchapel.altar')==='!','the altar has a "!"');await interact('oldchapel.altar');ok(await p.locator('.pzl-o').count()===3,'the altar opens the symbol puzzle');
await pick(0);ok(await E(()=>/What gave light before anyone made a lamp/.test(document.body.textContent)),'a wrong symbol gets Cassie’s hint');
await p.locator('.pzl .btn.ghost').click();await p.waitForTimeout(300);ok(await step('cass_prayer')==='altar','leaving keeps the step');
await interact('oldchapel.altar');await pick(1);await pick(0);await pick(1);await p.waitForTimeout(400);ok(await step('cass_prayer')==='defend','star, open door, open hand');
// defend, ending
r=await interact('q_cass');text=text.concat(r.lines);ok(await winFight(),'defending the chapel is a real fight (in the chapel’s own art)');
ok(await E(()=>__sf.mx().at)==='oldchapel'&&await step('cass_prayer')==='end','back in the chapel afterwards');
const s0=await S();await interact('q_cass');ok(await scene(),'the ending is a scene');s=await S();
ok(s.mx.q.cass_prayer.s==='done'&&s.bonds.cass===1&&s.dust===s0.dust+40&&s.keep===s0.keep+1&&s.frags.length>=s0.frags.length+1&&s.mx.mem['rec.cass']&&s.story['cass.prayer'],'complete: Bond +1 for Cassie, 40 Stardust, Keepsake, Fragment, her prayer book');
await go('oldchapel');ok(await E(()=>!__sf.m().npcs.some(n=>(n.id==='q_cass'||n.id==='oldchapel.altar')&&!(n.hide&&n.hide(__sf.m())))),'afterwards Cassie and the altar puzzle are gone; the keepers stay');
const d1=s.dust;await E(()=>{__sf.qstart('cass_prayer');__sf.qtick();});await go('tower');r=await interact('h_cass');ok((await S()).dust===d1&&!/St\. Maren/.test(r.lines.join(' ')),'not offered or paid again');
// travel and Renown
if(mode==='desk')await p.keyboard.press('KeyM');else{await p.keyboard.press('Escape');await p.waitForTimeout(250);await p.locator('.tm-item',{hasText:'World map'}).click();}
await p.waitForTimeout(300);await E(()=>window.__wmSel('oldchapel'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
ok(await E(()=>__sf.mx().at)==='oldchapel','fast travel to St. Maren’s works');
await walk('KeyA','w','ashlane');ok(await E(()=>__sf.mx().at)==='ashlane','the west door leads back to Ash Lane');
// Journal and canon
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);ok(/St\. Maren’s/.test(await E(()=>document.body.textContent)),'St. Maren’s is on the Meridian map');
await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
const jt=await E(()=>document.body.textContent);ok(/A Prayer of Her Own/.test(jt)&&/Cassie’s prayer book/.test(jt),'the story and the prayer book are in the Journal');
const src=await E(()=>JSON.stringify(__sf.mxQ.cass_prayer)+__sf.src3());const all=src+' '+text.join(' ');const bad=all.match(SPOIL)||all.match(/\bKeepers\b/);
ok(!bad,'no Mercy, Chapter 2 material, or faction names stated as fact'+(bad?' ('+all.match(new RegExp('.{50}'+bad[0]+'.{20}'))+')':''));
ok(/God is still here/.test(src)&&/allowed to ask questions/.test(src),'Cassie keeps her faith and her right to question');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/cass_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
