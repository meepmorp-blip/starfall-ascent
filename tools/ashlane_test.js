// Ash Lane (World Expansion 01 · Stage 4) test. Usage: node ashlane_test.js [phone|small]
// Includes a reachability flood fill and a check that the collision for the dressing's edge clutter matches what was painted.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const npc=id=>p.evaluate(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n?{x:n.x,y:n.y}:null;},id);
const press=async()=>{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);const lines=[];
  for(let i=0;i<20;i++){if(await p.evaluate(()=>__sf.st())==='dialog'){lines.push(await p.evaluate(()=>(document.querySelector('.say')||{}).textContent||''));await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}await p.waitForTimeout(150);return lines;};
async function interact(id,dx=-22,dy=6){let near=null;
  // approach from whichever side is clear, the way a player would
  for(const [ox,oy] of [[dx,dy],[22,6],[-22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){const n=await npc(id);if(!n)return {near:null,lines:[]};await p.evaluate(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,ox,oy]);await p.waitForTimeout(160);
    near=await p.evaluate(()=>__sf.m().near&&__sf.m().near.id);if(near===id)break;}const lines=await press();return {near,lines};}
const murm=()=>p.evaluate(()=>window.__mxMurmurs|0);
const SPOIL=/fire|burn|smoke|ash(?! Lane)|lodging|Inquisitor|Cassie|Vane|rooftop|Lucas|Unwritten|Correction/i;
const save=(k)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},ch1b:{i:50,k,roster:['kairos','ines','bram','noemi','theo'],flags:{}},mx:{v:1,at:'ward',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1},talk:{},found:{},q:{},items:{},f:{}}});
const walkEast=async target=>{await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyD');
  for(let i=0;i<40;i++){await p.waitForTimeout(40);if(target&&await p.evaluate(t=>__sf.mx().at===t,target))break;}await p.keyboard.up('KeyD');await p.waitForTimeout(700);};
try{
await p.addInitScript(()=>{window.__mxDay='2026-11-24';});
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── locked before Scene 10: no east exit at St. Lucia's, locked on the map
await p.evaluate(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),save('Scene 9#2'));await p.reload();await p.waitForTimeout(600);
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
let wm=await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));ok(wm.ashlane==='locked','before Scene 10 Ash Lane is story-locked');
await walkEast(null);ok(await p.evaluate(()=>__sf.mx().at)==='ward','and St. Lucia’s east edge leads nowhere yet');
// ── open after Scene 10
await p.evaluate(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),save('Scene 10#3'));await p.reload();await p.waitForTimeout(600);
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
wm=await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));ok(wm.ashlane==='found','after Scene 10 it is reachable on foot, not yet discovered');
await walkEast('ashlane');
let s=await S();ok(s.mx.at==='ashlane'&&s.mx.seen.ashlane,'walking off St. Lucia’s east edge reaches Ash Lane and discovers it');
const ax=await p.evaluate(()=>__sf.p().x-__sf.bounds()[0]);ok(ax<120,'arrive on the west side ('+Math.round(ax)+')');
await p.waitForTimeout(400);await p.screenshot({path:`out/ash_${mode}_arrive.png`});
// ── the edge clutter collision matches the painted clutter
const cl=await p.evaluate(()=>{const c=window.__sf_clutter(),f=a=>a.map(([k,x,y])=>k+':'+Math.round(x)+','+Math.round(y)).join('|');return {drawn:f(c.drawn),derived:f(c.derived),n:c.drawn.length};});
ok(cl.n===6&&cl.drawn===cl.derived,'collision for the six crates and barrels by the walls matches the painting ('+cl.n+' drawn)');
// ── collision and reachability
const solidHits=await p.evaluate(()=>{const m=__sf.m(),W=__sf.bounds()[4],H=400;const inside=(x,y)=>m.solids.some(s=>s.w?x>s.x&&x<s.x+s.w&&y>s.y&&y<s.y+s.h:Math.hypot(x-s.x,y-s.y)<s.r);
  const c0=window.__sf_clutter().derived[0];
  return [['crates',W*0.3+14,H*0.32+9],['barrel',W*0.7,H*0.7],['bench',W*0.55+25,H*0.38+4],['cart',W*0.15+14,H*0.5+2],['houses',W*0.5,30],['clutter',c0[1]+(c0[0]==='crate'?7:0),c0[2]+(c0[0]==='crate'?6:0)]].map(([n,x,y])=>[n,inside(x,y)]);});
ok(solidHits.every(h=>h[1]),'crates, barrel, bench, cart, houses and wall clutter are solid'+(solidHits.every(h=>h[1])?'':' '+JSON.stringify(solidHits)));
const reach=await p.evaluate(()=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];
  const pl=__sf.p();const c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  const targets=m.npcs.filter(n=>!n.id.startsWith('odd.')&&!(n.hide&&n.hide(m))).map(n=>[n.id,n.x,n.y]);
  for(const [x,y] of window.__sf_odd())targets.push(['odd',x,y]);
  for(const [fx,fy] of window.__sf_spots.ashlane)targets.push(['chestspot',B[0]+(B[2]-B[0])*fx,B[1]+(B[3]-B[1])*fy]);
  return targets.filter(t=>!can(t[1],t[2])).map(t=>t[0]);});
ok(reach.length===0,'every person, record, readable, chest spot and odd-thing spot is reachable on foot'+(reach.length?': '+reach.join(','):''));
// ── people and text: nobody mentions the fire or the rooftops
const ids=await p.evaluate(()=>__sf.m().npcs.filter(n=>!n.spot&&!n.draw).map(n=>n.id+(n.ch?':'+n.ch:'')));
ok(['laundress','lamplighter','shopkeep','hoopkid'].every(i=>ids.includes(i))&&!ids.some(i=>/lucan|cass/.test(i)),'four townsfolk on the Lane ('+ids.join(',')+')');
let text=[];const m0=await murm();for(const id of ['laundress','lamplighter','hoopkid'])text=text.concat((await interact(id)).lines);
ok(await murm()>=m0+3,'small talk murmurs');
for(const id of ['ashlane.posters','ashlane.awnings','ashlane.lamp7','look.cart','look.washing'])text=text.concat((await interact(id)).lines);
ok(text.length>=8&&!text.some(t=>SPOIL.test(t)),'no fire, lodging house, Inquisitor, rooftops or Lucas ('+text.length+' lines)'+(text.filter(t=>SPOIL.test(t)).slice(0,2).join(' / ')));
// ── Odd Things on the Lane
const k0=(await S()).keep,mT=await murm();const intro=await interact('shopkeep');
ok(await p.evaluate(()=>__sf.odd().st)==='hunt'&&await murm()===mT,'the shopkeeper starts Odd Things (no murmur on an activity line)');
const odd=await p.evaluate(()=>__sf.odd().ids.slice());ok(odd.length===3&&intro.lines.filter(l=>/^·/.test(l)).length===3,'three clues are given ('+odd.join(',')+')');
ok(!(intro.lines.some(t=>SPOIL.test(t))),'the clues mention nothing from the story');
await p.screenshot({path:`out/ash_${mode}_odd.png`});
// a thing not on today's list cannot be found
const other=await p.evaluate(ids=>window.__sf_odd&&['teacup','boot','kite','ribbon','arrow','thimble'].find(i=>!ids.includes(i)),odd);
ok(await p.evaluate(o=>{const n=__sf.m().npcs.find(q=>q.id==='odd.'+o);return n&&n.hide();},other),'things not on today’s list stay hidden');
for(const id of odd){const r=await interact('odd.'+id);ok(r.near==='odd.'+id,'found '+id);}
ok(await p.evaluate(()=>Object.keys(__sf.odd().got).length)===3,'all three found');
await interact('shopkeep');s=await S();ok(s.keep===k0+1&&s.claims['act:oddities']&&s.claims['act:oddities:2026-11-24'],'returning pays a Keepsake (first time) and today’s 12 Stardust');
const d1=s.dust;await interact('shopkeep');ok(await p.evaluate(()=>__sf.odd().st)==='idle'&&(await S()).dust===d1,'nothing more from the shopkeeper today');
// ── hidden chalk, chests, travel
const dch=(await S()).dust;await interact('ashlane.chalk',-14,6);s=await S();ok(s.dust===dch+10&&s.claims['mxf:ashlane.chalk'],'the hidden chalk marks pay 10 Stardust once');
await interact('ashlane.chalk',-14,6);ok((await S()).dust===dch+10,'and only once');
const ch=await p.evaluate(()=>__sf.mxChests('ashlane').length);ok(ch>=2&&ch<=3,'2 or 3 daily chests ('+ch+')');
const cid=await p.evaluate(()=>__sf.m().npcs.find(o=>o.tier).id);const dc=(await S()).dust;await interact(cid);ok((await S()).dust>dc,'an Ash Lane chest opens and pays');
if(mode==='desk')await p.keyboard.press('KeyM');else{await p.keyboard.press('Escape');await p.waitForTimeout(250);await p.locator('.tm-item',{hasText:'World map'}).click();}
await p.waitForTimeout(300);await p.evaluate(()=>window.__wmSel('market'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
ok(await p.evaluate(()=>__sf.mx().at)==='market','fast travel from Ash Lane to the Market Ring');
if(mode==='desk')await p.keyboard.press('KeyM');else{await p.keyboard.press('Escape');await p.waitForTimeout(250);await p.locator('.tm-item',{hasText:'World map'}).click();}
await p.waitForTimeout(300);await p.evaluate(()=>window.__wmSel('ashlane'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
ok(await p.evaluate(()=>__sf.mx().at)==='ashlane','and back by fast travel');ok(await p.evaluate(id=>__sf.m().npcs.find(o=>o.id===id).opened(),cid),'the opened chest is still open');
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[0]+20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyA');for(let i=0;i<40;i++){await p.waitForTimeout(40);if(await p.evaluate(()=>__sf.mx().at==='ward'))break;}await p.keyboard.up('KeyA');await p.waitForTimeout(700);
ok(await p.evaluate(()=>__sf.mx().at)==='ward','walking off the west edge returns to St. Lucia’s');
await p.reload();await p.waitForTimeout(600);s=await S();ok(s.mx.seen.ashlane&&s.claims['act:oddities'],'discovery and Odd Things survive a reload');
const rn=await p.evaluate(()=>__sf.renown()[0]);ok(rn>0,'Renown includes Ash Lane ('+rn+')');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/ash_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
