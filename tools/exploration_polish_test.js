// Expansion 05 test: readable labels, interactables clear of the HUD, chest tiers and discovery, pushable crate and the market
// corner secret, breakables (once and daily), levers and the ward secret, candle feedback, NPC polish, murmur rules.
// Usage: node exploration_polish_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e.stack||e).split(String.fromCharCode(10)).slice(0,3).join(' ')));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('starfall-ascent-save')));
const go=d=>p.evaluate(d=>__sf.mxGo(d),d).then(()=>p.waitForTimeout(600));
const npc=id=>p.evaluate(id=>{const n=__sf.m().npcs.find(o=>o.id===id);return n?{x:n.x,y:n.y}:null;},id);
const press=async()=>{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(250);for(let i=0;i<20;i++){if(await p.evaluate(()=>__sf.st())==='dialog'){await p.keyboard.press('Space');await p.waitForTimeout(80);}else break;}await p.waitForTimeout(150);};
async function interact(id,dx=-22,dy=6){const n=await npc(id);if(!n)return null;await p.evaluate(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,dx,dy]);await p.waitForTimeout(150);
  const near=await p.evaluate(()=>__sf.m().near&&__sf.m().near.id);await press();return near;}
const murm=()=>p.evaluate(()=>window.__mxMurmurs|0);
try{
await p.addInitScript(()=>{window.__mxDay=window.__mxDay||'2026-11-20';});
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));
  localStorage.setItem('starfall-ascent-save',JSON.stringify({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},ch1Clears:1,mx:{v:1,at:'market',seen:{market:1},talk:{},found:{},q:{streets:{s:'active',n:0,at:1}},items:{},f:{}}}));});
await p.goto(url);await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
// ── readability: labels are drawn crisp at a fixed on-screen size
const H=await p.evaluate(()=>__sf.hud());ok(H.wl>=11,'world labels draw at '+H.wl+' CSS px or more, at any scale (scale '+H.scale.toFixed(2)+')');
// ── every interactable added in 04/05 stays clear of the HUD and touch controls
const hudBad=[];
for(const d of ['market','plaza','yard','chapel','ward','hesper','office','ashlane','tower']){await go(d);
  hudBad.push(...await p.evaluate(d=>{const m=__sf.m(),H=__sf.hud(),out=[],sw=H.sw;const scr=[[sw*0.1,0,sw*0.9,H.safe.t+70],[0,0,H.safe.l+14+Math.min(190,Math.max(130,sw*0.2))+6,H.safe.t+74]];
    if(H.touch)for(const k of ['atk','dodge','sun','moon','ult']){const c=H.btn[k];if(c&&c.r)scr.push([c.x-c.r-6,c.y-c.r-6,c.x+c.r+6,c.y+c.r+6]);}
    for(const c of H.ports)if(c&&c.r)scr.push([c.x-c.r-4,c.y-c.r-4,c.x+c.r+40,c.y+c.r+4]);
    for(const n of m.npcs){if(!(n.spot||n.draw))continue;if(n.hide&&n.hide(m)&&!/sundial|hatch/.test(n.id))continue;const x=H.ox+n.x*H.scale,y=H.oy+n.y*H.scale,r=12*H.scale;
      for(const [a,b,c,e] of scr)if(x+r>a&&x-r<c&&y+r*0.6>b&&y-r*1.4<e)out.push(d+':'+n.id);}return [...new Set(out)];},d));}
ok(hudBad.length===0,'chests and interactables are never under the HUD or touch controls'+(hudBad.length?': '+hudBad.join(', '):''));
// ── chest tiers and discovery
await go('market');
const tiers=await p.evaluate(()=>['common','fine','precious'].map(t=>CHEST_LOOK_T=null));
const look=await p.evaluate(()=>{const L=window.__chestLook;return L;});
const ch=await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.tier&&!o.opened());return n?{id:n.id,x:n.x,y:n.y,tier:n.tier}:null;});
await p.evaluate(()=>{const pl=__sf.p();pl.x=__sf.bounds()[0]+300;pl.y=__sf.bounds()[1]+30;});await p.waitForTimeout(200);
const c0=await p.evaluate(()=>window.__mxChime|0);await p.evaluate(c=>{const pl=__sf.p();pl.x=c.x-60;pl.y=c.y;},ch);await p.waitForTimeout(250);
const c1=await p.evaluate(()=>window.__mxChime|0);ok(c1===c0+1,'coming near a closed chest plays one discovery chime');
await p.evaluate(c=>{const pl=__sf.p();pl.x=c.x-50;pl.y=c.y+2;},ch);await p.waitForTimeout(250);ok(await p.evaluate(()=>window.__mxChime|0)===c1,'only once per chest per visit');
const m0=await murm();const d0=(await S()).dust;await interact(ch.id);const s1=await S();ok(s1.dust>d0,'opening pays ('+ch.tier+', +'+(s1.dust-d0)+')');ok(await murm()===m0,'no murmur when opening a chest');
await p.screenshot({path:`out/pol_${mode}_chest.png`});
// ── the market corner: push the crate west twice, then search the tin
const crate=await p.evaluate(()=>{const o=__sf.m().objs.find(o=>o.kind==='push');return {x:o.x,y:o.y,w:o.w,h:o.h};});
async function pushWest(){const o=await p.evaluate(()=>{const o=__sf.m().objs.find(o=>o.kind==='push');return {x:o.x,y:o.y,w:o.w,h:o.h};});
  await p.evaluate(o=>{const pl=__sf.p();pl.x=o.x+o.w+pl.r+1;pl.y=o.y+o.h/2;},o);await p.keyboard.down('KeyA');await p.waitForTimeout(420);await p.keyboard.up('KeyA');await p.waitForTimeout(250);}
await pushWest();let cx=await p.evaluate(()=>__sf.m().objs.find(o=>o.kind==='push').x);ok(Math.abs(cx-(crate.x-24))<0.5,'walking into the crate pushes it one step ('+Math.round(crate.x)+' → '+Math.round(cx)+')');
await pushWest();await pushWest();await pushWest();cx=await p.evaluate(()=>__sf.m().objs.find(o=>o.kind==='push').x);
const B=await p.evaluate(()=>__sf.bounds());ok(cx>=B[0]&&cx<crate.x-47,'the crate stops at the edge of the map ('+Math.round(cx)+', edge '+B[0]+')');
const ov=await p.evaluate(()=>{const m=__sf.m(),o=m.objs.find(o=>o.kind==='push');return m.objs.filter(w=>w.kind==='wall').some(w=>o.x<w.x+w.w&&o.x+o.w>w.x&&o.y<w.y+w.h&&o.y+o.h>w.y);});ok(!ov,'the crate never overlaps the crate wall');
const g0=(await S()).dust;const nr=await interact('sec.alcove',8,10);ok(nr==='sec.alcove','the tin behind the crates can be reached ('+nr+')');
let s2=await S();ok(s2.dust===g0+25&&s2.claims['sec:market.alcove'],'the tin pays 25 Stardust');await interact('sec.alcove',8,10);ok((await S()).dust===g0+25,'and only once');
await p.screenshot({path:`out/pol_${mode}_alcove.png`});
await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);await go('market');
const cx2=await p.evaluate(()=>__sf.m().objs.find(o=>o.kind==='push').x);ok(Math.abs(cx2-cx)<0.5,'the crate stays where it was pushed after a reload');
// ── breakables
await go('yard');const y0=(await S()).dust;await interact('obj.yard.oldbarrel');s2=await S();ok(s2.dust===y0+10&&s2.claims['brk:yard.oldbarrel'],'breaking the old barrel pays 10 Stardust once');
ok(await p.evaluate(()=>{const o=__sf.m().objs.find(o=>o.id==='yard.oldbarrel');return o.broken&&!__sf.m().solids.includes(o.sol);}),'the broken barrel loses its collision');
await interact('obj.yard.supply');s2=await S();ok(s2.dust===y0+14&&s2.claims['brk:yard.supply:2026-11-20'],'the daily supply crate pays 4 Stardust');
await p.screenshot({path:`out/pol_${mode}_yard.png`});
await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);await go('yard');
ok(await p.evaluate(()=>__sf.m().objs.every(o=>o.kind!=='break'||o.broken)),'both stay broken after a reload the same day');
await p.evaluate(()=>{window.__mxDay='2026-11-21';});await go('market');await go('yard');
const st21=await p.evaluate(()=>__sf.m().objs.filter(o=>o.kind==='break').map(o=>o.id+':'+(o.broken?1:0)).join(','));ok(st21==='yard.oldbarrel:1,yard.supply:0','next day: the supply crate is back, the old barrel is not ('+st21+')');
const y1=(await S()).dust;await interact('obj.yard.supply');ok((await S()).dust===y1+4,'the new supply crate pays again on the new day');
await p.evaluate(()=>{window.__mxDay='2026-11-20';});
// ── levers
await go('plaza');await interact('obj.plaza.lanterns');ok(await p.evaluate(()=>__sf.m().objs[0].on),'the lantern switch lights the Square');
await p.screenshot({path:`out/pol_${mode}_lanterns.png`});await interact('obj.plaza.lanterns');ok(await p.evaluate(()=>!__sf.m().objs[0].on),'and switches them off again');
await interact('obj.plaza.lanterns');
await go('ward');const cart0=await p.evaluate(()=>__sf.m().cart.x);ok(await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.id==='sec.hatch');return n.hide();}),'the hatch is hidden while the cart stands on it');
await interact('obj.ward.brake');await p.waitForTimeout(1100);const cart1=await p.evaluate(()=>__sf.m().cart.x);ok(cart1-cart0>50,'pulling the brake rolls the cart aside ('+Math.round(cart1-cart0)+')');
const h0=(await S()).dust;const nh=await interact('sec.hatch',0,16);s2=await S();ok(s2.dust===h0+15&&s2.claims['sec:ward.hatch'],'the loose tile pays 15 Stardust ('+nh+')');
await p.screenshot({path:`out/pol_${mode}_ward.png`});
await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);await go('ward');
ok(await p.evaluate(c=>__sf.m().cart.x-c>50,cart0),'the cart stays moved after a reload');await go('plaza');ok(await p.evaluate(()=>__sf.m().objs[0].on),'the lanterns stay lit after a reload');
// ── candles: wrong hour flashes, solving flares and reveals
await go('chapel');await interact('candle.S');await interact('candle.N');ok(await p.evaluate(()=>{const c=__sf.m().npcs.find(o=>o.id==='candle.N');return c.wrongT>0&&(__sf.m().lit||[]).length===0;}),'a wrong candle flashes and resets');
for(const c of ['S','W','N','E'])await interact('candle.'+c);ok(await p.evaluate(()=>__sf.m().solvedT>0&&__sf.mx().f.sundial),'solving flares the candles');
await p.waitForTimeout(400);await p.screenshot({path:`out/pol_${mode}_candles.png`});
// ── NPCs: own speeds, start on their route, murmurs follow the sound slider
await go('market');const sp=await p.evaluate(()=>__sf.m().npcs.filter(n=>n.pts&&n.pts.length>1).map(n=>n.spdK.toFixed(4)));ok(new Set(sp).size>1,'townsfolk walk at their own speeds ('+sp.join(', ')+')');
ok(await p.evaluate(()=>{const n=__sf.m().npcs.find(o=>o.id==='rosa');return Math.hypot(n.x-n.pts[0].x,n.y-n.pts[0].y)<80;}),'routed townsfolk start on their route');
await p.evaluate(()=>{const m=__sf.m(),n=m.npcs.find(o=>o.id==='tessa');n.x=n.pts[0].x;n.y=n.pts[0].y;n.wait=5;});
const t0=await murm();await interact('tessa');ok(await murm()===t0+1,'small talk murmurs');
await p.evaluate(()=>{localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);
await p.evaluate(()=>{const m=__sf.m(),n=m.npcs.find(o=>o.id==='tessa');n.x=n.pts[0].x;n.y=n.pts[0].y;n.wait=5;});
const t1=await murm();await interact('tessa');ok(await murm()===t1,'with Sound effects at 0, no murmur');
for(const d of ['market','plaza','yard','chapel','ward','hesper','office','ashlane']){await go(d);await p.screenshot({path:`out/pol_${mode}_${d}.png`});}
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/pol_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
