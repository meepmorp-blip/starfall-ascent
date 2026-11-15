// St. Hesper's (World Expansion 01 · Stage 2) test. Usage: node hesper_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const go=d=>p.evaluate(d=>__sf.mxGo(d),d).then(()=>p.waitForTimeout(700));
const npc=id=>p.evaluate(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n?{x:n.x,y:n.y}:null;},id);
const press=async()=>{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);const lines=[];
  for(let i=0;i<20;i++){if(await p.evaluate(()=>__sf.st())==='dialog'){lines.push(await p.evaluate(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}await p.waitForTimeout(150);return lines;};
async function interact(id,dx=-22,dy=6){const n=await npc(id);if(!n)return {near:null,lines:[]};await p.evaluate(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,dx,dy]);await p.waitForTimeout(160);
  const near=await p.evaluate(()=>__sf.m().near&&__sf.m().near.id);const lines=await press();return {near,lines};}
const murm=()=>p.evaluate(()=>window.__mxMurmurs|0);
const SPOIL=/fire|cat\b|Lucas|end piece|stopped minute|9:04|life B|divine|cloak/i;
try{
await p.addInitScript(()=>{window.__mxDay='2026-11-22';});
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));
  // a save from before St. Hesper's existed: Know the Streets already done, five districts seen
  localStorage.setItem('starfall-ascent-save',JSON.stringify({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{'mxq:streets':1},ch1b:{i:40,k:'Scene 6#2',roster:['kairos','ines','bram','noemi'],flags:{}},
    mx:{v:1,at:'plaza',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1},talk:{},found:{},q:{streets:{s:'done',n:2,at:1,end:2}},items:{},f:{streetsTold:1}}}));});
await p.goto(url);await p.waitForTimeout(600);
let wm=await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));ok(wm.hesper==='found','on the map, St. Hesper’s is reachable but not discovered');
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
// walk east out of Festival Square
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyD');for(let i=0;i<40;i++){await p.waitForTimeout(40);if(await p.evaluate(()=>__sf.mx().at==='hesper'))break;}await p.keyboard.up('KeyD');await p.waitForTimeout(700);
let s=await S();ok(s.mx.at==='hesper'&&s.mx.seen.hesper,'walking off Festival Square’s east edge reaches St. Hesper’s and discovers it');
ok(s.mx.q.streets.s==='done'&&s.claims['mxq:streets'],'Know the Streets stays done for an old save');
const ax=await p.evaluate(()=>__sf.p().x-__sf.bounds()[0]);ok(ax<120,'arrive on the west side ('+Math.round(ax)+')');
wm=await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));ok(wm.hesper==='here','the map now shows St. Hesper’s as here');
await p.screenshot({path:`out/hes_${mode}_arrive.png`});
// collision with painted props
const hits=await p.evaluate(()=>{const m=__sf.m(),pl=__sf.p(),out=[];const tries=[['bench',W=>[W*0.3+12,__sf.bounds()[1]+0]],];
  const H=400,W=__sf.bounds()[4];const probe=(x,y)=>{pl.x=x;pl.y=y;for(let i=0;i<4;i++){for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(pl.x,s.x+s.w)),ny=Math.max(s.y,Math.min(pl.y,s.y+s.h)),dx=pl.x-nx,dy=pl.y-ny,d=Math.hypot(dx,dy);if(d<pl.r){if(d>0.01){pl.x=nx+dx/d*pl.r;pl.y=ny+dy/d*pl.r;}else pl.y=s.y-pl.r;}}else{const dx=pl.x-s.x,dy=pl.y-s.y,d=Math.hypot(dx,dy)||0.01,mn=s.r+pl.r*0.8;if(d<mn){pl.x=s.x+dx/d*mn;pl.y=s.y+dy/d*mn;}}}}return [pl.x,pl.y];};
  for(const [n,x,y] of [['left bench',W*0.3+12,H*0.6+3],['right bench',W*0.62+12,H*0.6+3],['back step',W*0.7+16,H*0.74+4],['fence',W*0.4,60]]){const [px,py]=probe(x,y);out.push([n,Math.round(Math.hypot(px-x,py-y))]);}return out;});
ok(hits.every(h=>h[1]>5),'benches, the back step and the fence are solid ('+hits.map(h=>h[0]+' '+h[1]).join(', ')+')');
// walking into the bench for real
await p.evaluate(()=>{const W=__sf.bounds()[4],pl=__sf.p();pl.x=W*0.3+12;pl.y=400*0.6+30;});await p.keyboard.down('KeyW');await p.waitForTimeout(700);await p.keyboard.up('KeyW');
const by=await p.evaluate(()=>__sf.p().y);ok(by>400*0.6+5,'walking up into the bench stops below it (y '+Math.round(by)+')');
// people: no Lucas, gentle lines only
const ids=await p.evaluate(()=>__sf.m().npcs.filter(n=>!n.spot&&!n.draw).map(n=>n.id+(n.ch?':'+n.ch:'')));ok(ids.includes('agathe')&&ids.includes('pip')&&ids.includes('wren')&&ids.includes('baker2'),'Sister Agathe, Pip, Wren and the baker are here ('+ids.join(',')+')');
ok(!ids.some(i=>/lucan/.test(i)),'Lucas never appears at the orphanage');
let allText=[];const m0=await murm();
for(const id of ['agathe','baker2','wren']){const r=await interact(id);allText=allText.concat(r.lines);}
ok(await murm()>=m0+3,'small talk murmurs (Sister, baker, Wren)');
for(const id of ['hesper.clock','hesper.sun','hesper.chores','look.swing','look.bakery','look.hopscotch']){const r=await interact(id);allText=allText.concat(r.lines);}
ok(allText.length>=8&&!allText.some(t=>SPOIL.test(t)),'no fire, cat, Lucas or clock-meaning lines ('+allText.length+' lines checked)');
ok(allText.some(t=>/11:59/.test(t))&&!allText.some(t=>/why|meaning|stopped when|the night/i.test(t)),'the gate clock is described, not explained');
// moving people stay out of solids
const tr=[];for(let i=0;i<12;i++){tr.push(await p.evaluate(()=>{const m=__sf.m();return m.npcs.filter(n=>n.pts&&n.pts.length>1).every(n=>m.solids.every(s=>s.w?!(n.x>s.x&&n.x<s.x+s.w&&n.y>s.y&&n.y<s.y+s.h):Math.hypot(n.x-s.x,n.y-s.y)>=s.r-1));}));await p.waitForTimeout(350);}
ok(tr.every(Boolean),'Sister Agathe and Pip never walk through solids');
// Hide-and-Seek
const k0=(await S()).keep;const r1=await interact('pip');ok(await p.evaluate(()=>__sf.hide().st)==='hiding','talking to Pip starts Hide-and-Seek');
ok(await p.evaluate(()=>__sf.m().npcs.find(n=>n.id==='wren').hide()),'Wren disappears to hide');
const spot=await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.id==='hide.spot');return {x:n.x,y:n.y,i:__sf.hide().spot};});
ok(await p.evaluate(sp=>{const B=__sf.bounds();return sp.x>B[0]&&sp.x<B[2]&&sp.y>B[1]&&sp.y<B[3]&&__sf.m().solids.every(s=>s.w?!(sp.x>s.x&&sp.x<s.x+s.w&&sp.y>s.y&&sp.y<s.y+s.h):Math.hypot(sp.x-s.x,sp.y-s.y)>=s.r);},spot),'the hiding spot is reachable (spot '+spot.i+')');
await p.screenshot({path:`out/hes_${mode}_hiding.png`});
const f1=await interact('hide.spot',-20,8);let sv=await S();ok(f1.near==='hide.spot'&&sv.keep===k0+1&&sv.claims['act:hideseek']&&sv.claims['act:hideseek:2026-11-22'],'finding Wren pays a Keepsake (first time) and today’s 10 Stardust');
ok(await p.evaluate(()=>__sf.hide().st)==='idle'&&!(await p.evaluate(()=>__sf.m().npcs.find(n=>n.id==='wren').hide())),'Wren comes out of hiding');
const d2=sv.dust;await interact('pip');const sp2=await p.evaluate(()=>__sf.hide().spot);ok(sp2!==spot.i,'a new round picks a different spot ('+spot.i+' → '+sp2+')');
await interact('hide.spot',-20,8);ok((await S()).dust===d2,'a second find the same day pays nothing');
// records and the hidden marbles
sv=await S();ok(['hesper.clock','hesper.sun','hesper.chores'].every(k=>sv.mx.found[k]),'three St. Hesper’s records are kept in the Journal');
const dm=sv.dust;await interact('hesper.marbles',-14,6);sv=await S();ok(sv.dust===dm+10&&sv.claims['mxf:hesper.marbles'],'the hidden marbles pay 10 Stardust once');
// daily chests
const ch=await p.evaluate(()=>__sf.mxChests('hesper').length);ok(ch>=2&&ch<=3,'2 or 3 daily chests ('+ch+')');
const c0=await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.tier);return n.id;});const dc=(await S()).dust;await interact(c0);ok((await S()).dust>dc,'a St. Hesper’s chest opens and pays');
// fast travel out and back, state kept
await p.keyboard.press(mode==='desk'?'KeyM':'Escape');await p.waitForTimeout(300);
if(mode!=='desk')await p.locator('.tm-item',{hasText:'World map'}).click();await p.waitForTimeout(300);
await p.evaluate(()=>window.__wmSel('ward'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
ok(await p.evaluate(()=>__sf.mx().at)==='ward','fast travel from St. Hesper’s to St. Lucia’s');
await p.keyboard.press(mode==='desk'?'KeyM':'Escape');await p.waitForTimeout(300);if(mode!=='desk')await p.locator('.tm-item',{hasText:'World map'}).click();await p.waitForTimeout(300);
await p.evaluate(()=>window.__wmSel('hesper'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
ok(await p.evaluate(()=>__sf.mx().at)==='hesper','and back by fast travel');ok(await p.evaluate(id=>__sf.m().npcs.find(o=>o.id===id).opened(),c0),'the opened chest is still open');
// walking back west
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[0]+20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyA');await p.waitForTimeout(700);await p.keyboard.up('KeyA');await p.waitForTimeout(1000);
ok(await p.evaluate(()=>__sf.mx().at)==='plaza','walking off the west edge returns to Festival Square');
await p.reload();await p.waitForTimeout(600);sv=await S();ok(sv.mx.seen.hesper&&sv.claims['act:hideseek'],'discovery and Hide-and-Seek survive a reload');
const rn=await p.evaluate(()=>__sf.renown()[0]);ok(rn>0,'Renown includes the new district and Hide-and-Seek ('+rn+')');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/hes_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
