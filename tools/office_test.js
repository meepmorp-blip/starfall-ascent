// Concord Office (World Expansion 01 · Stage 3) test. Usage: node office_test.js [phone|small]
// Includes a reachability flood fill: every chest, folder, record, readable and person must be reachable on foot.
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
async function interact(id,dx=-22,dy=6){let near=null;
  // approach from whichever side is clear, the way a player would
  for(const [ox,oy] of [[dx,dy],[22,6],[-22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){const n=await npc(id);if(!n)return {near:null,lines:[]};await p.evaluate(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,ox,oy]);await p.waitForTimeout(160);
    near=await p.evaluate(()=>__sf.m().near&&__sf.m().near.id);if(near===id)break;}const lines=await press();return {near,lines};}
const murm=()=>p.evaluate(()=>window.__mxMurmurs|0);
const SPOIL=/Archive|Window 3|Unwritten|no record|Lucas|Moon Gate|Ledger|confession|cellar/i;
const save=(k)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},ch1b:{i:30,k,roster:['kairos','theo'],flags:{}},mx:{v:1,at:'chapel',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1},talk:{},found:{},q:{},items:{},f:{}}});
try{
await p.addInitScript(()=>{window.__mxDay='2026-11-23';});
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── locked before Scene 7: no east exit in the Cloister, locked on the map
await p.evaluate(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),save('Scene 6#1'));await p.reload();await p.waitForTimeout(600);
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
let wm=await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));ok(wm.office==='locked','before Scene 7 the Concord Office is story-locked');
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyD');await p.waitForTimeout(800);await p.keyboard.up('KeyD');await p.waitForTimeout(600);
ok(await p.evaluate(()=>__sf.mx().at)==='chapel','and the Cloister’s east edge leads nowhere yet');
// ── open after Scene 7
await p.evaluate(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),save('Scene 7#2'));await p.reload();await p.waitForTimeout(600);
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);
wm=await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])));ok(wm.office==='found','after Scene 7 it is reachable on foot, not yet discovered');
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;});await p.keyboard.down('KeyD');for(let i=0;i<40;i++){await p.waitForTimeout(40);if(await p.evaluate(()=>__sf.mx().at==='office'))break;}await p.keyboard.up('KeyD');await p.waitForTimeout(700);
let s=await S();ok(s.mx.at==='office'&&s.mx.seen.office,'walking off the Cloister’s east edge reaches the Concord Office and discovers it');
const ay=await p.evaluate(()=>__sf.bounds()[3]-__sf.p().y);ok(ay<120,'arrive at the south door ('+Math.round(ay)+' from the edge)');
await p.screenshot({path:`out/off_${mode}_arrive.png`});
// ── collision and reachability
const reach=await p.evaluate(()=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];
  const pl=__sf.p();const c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  const targets=m.npcs.filter(n=>!(n.hide&&n.hide(m))).map(n=>[n.id,n.x,n.y]);for(const [fx,fy] of window.__sf_folders)targets.push(['folder',B[0]+(B[2]-B[0])*fx,B[1]+(B[3]-B[1])*fy]);
  for(const [fx,fy] of window.__sf_spots.office)targets.push(['chestspot',B[0]+(B[2]-B[0])*fx,B[1]+(B[3]-B[1])*fy]);
  return targets.filter(t=>!can(t[1],t[2])).map(t=>t[0]);});
ok(reach.length===0,'every person, record, readable, chest spot and folder spot is reachable on foot'+(reach.length?': '+reach.join(','):''));
const solidHits=await p.evaluate(()=>{const m=__sf.m(),W=__sf.bounds()[4];const inside=(x,y)=>m.solids.some(s=>s.w?x>s.x&&x<s.x+s.w&&y>s.y&&y<s.y+s.h:Math.hypot(x-s.x,y-s.y)<s.r);
  return [['west cabinets',W*0.16+8,200],['east desks',W-40,210],['queue rope',W*0.5,400*0.3],['counter',W/2,54]].map(([n,x,y])=>[n,inside(x,y)]);});
ok(solidHits.every(h=>h[1]),'cabinets, desks, the queue rope and the counter are solid');
// ── people and text
const ids=await p.evaluate(()=>__sf.m().npcs.filter(n=>!n.spot&&!n.draw).map(n=>n.id+(n.ch?':'+n.ch:'')));ok(['counter','filer','waiter','tobin'].every(i=>ids.includes(i))&&!ids.some(i=>/couple|qmom|widow|rclerk|window|theo/.test(i)),'four new townsfolk; Scene 7’s cast stays in the story ('+ids.join(',')+')');
let text=[];const m0=await murm();for(const id of ['counter','waiter'])text=text.concat((await interact(id)).lines);
const filer=await interact('filer');text=text.concat(filer.lines);ok(await murm()>=m0+3,'small talk murmurs');
for(const id of ['office.motto','office.notice','office.queue','look.ticket','look.ladder'])text=text.concat((await interact(id)).lines);
ok(text.length>=10&&!text.some(t=>SPOIL.test(t)),'no Archive, Window 3, Kairos’s record, Lucas or draft-only lore ('+text.length+' lines)');
ok(text.some(t=>/YOUR CHART IS YOUR CALLING/.test(t))&&text.some(t=>/Re-charting/.test(t)),'public doctrine only: the motto and the Re-charting notice');
// ── Misfiled Folders
const k0=(await S()).keep,mT=await murm();await interact('tobin');ok(await p.evaluate(()=>__sf.fold().st)==='carry'&&await murm()===mT,'Tobin starts Misfiled Folders (no murmur on an activity line)');
await p.screenshot({path:`out/off_${mode}_folders.png`});
for(let k=0;k<4;k++){await p.evaluate(k=>{const f=__sf.fold(),si=f.spots[k],B=__sf.bounds(),pl=__sf.p();pl.x=B[0]+(B[2]-B[0])*window.__sf_folders[si][0];pl.y=B[1]+(B[3]-B[1])*window.__sf_folders[si][1];},k);await p.waitForTimeout(150);}
ok(await p.evaluate(()=>Object.keys(__sf.fold().got).length)===4,'walking over the four folders picks them up');
const n=await npc('tobin');await p.evaluate(n=>{const pl=__sf.p();pl.x=n.x-22;pl.y=n.y+6;},n);await p.waitForTimeout(150);await press();
ok(await p.locator('.pzl').count()===1,'returning them opens the filing puzzle');
// a wrong answer first, then the right order
const order=await p.evaluate(()=>{const H=['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];return __sf.fold().houses.slice().sort((a,b)=>a-b).map(h=>H[h]+' House');});
const opts=await p.locator('.pzl-o h3').allInnerTexts();const wrong=opts.find(o=>o!==order[0]);await p.locator('.pzl-o',{hasText:wrong}).click();await p.waitForTimeout(200);
ok(/later/.test(await p.locator('.pzl-msg').innerText()),'a wrong drawer is explained');
for(let r=0;r<3;r++){await p.locator('.pzl-o',{hasText:order[r]}).first().click();await p.waitForTimeout(250);}
await p.waitForTimeout(300);s=await S();ok(s.keep===k0+1&&s.claims['act:folders']&&s.claims['act:folders:2026-11-23'],'filing in House order pays a Keepsake (first time) and today’s 12 Stardust');
const d1=s.dust;await interact('tobin');ok(await p.evaluate(()=>__sf.fold().st)==='idle'&&(await S()).dust===d1,'once filed, Tobin has nothing more today');
// ── hidden stamp, chests, travel
const ds=(await S()).dust;await interact('office.stamp',-14,6);s=await S();ok(s.dust===ds+10&&s.claims['mxf:office.stamp'],'the hidden stamp pays 10 Stardust once');
const ch=await p.evaluate(()=>__sf.mxChests('office').length);ok(ch>=2&&ch<=3,'2 or 3 daily chests ('+ch+')');
const cid=await p.evaluate(()=>__sf.m().npcs.find(o=>o.tier).id);const dc=(await S()).dust;await interact(cid);ok((await S()).dust>dc,'an office chest opens and pays');
if(mode==='desk')await p.keyboard.press('KeyM');else{await p.keyboard.press('Escape');await p.waitForTimeout(250);await p.locator('.tm-item',{hasText:'World map'}).click();}
await p.waitForTimeout(300);await p.evaluate(()=>window.__wmSel('market'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
if(mode==='desk')await p.keyboard.press('KeyM');else{await p.keyboard.press('Escape');await p.waitForTimeout(250);await p.locator('.tm-item',{hasText:'World map'}).click();}
await p.waitForTimeout(300);await p.evaluate(()=>window.__wmSel('office'));await p.locator('.wm-side .btn',{hasText:'Travel'}).click();await p.waitForTimeout(1300);
ok(await p.evaluate(()=>__sf.mx().at)==='office','fast travel to the Concord Office after discovering it');
await p.evaluate(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=(B[0]+B[2])/2;pl.y=B[3]-20;});await p.keyboard.down('KeyS');for(let i=0;i<40;i++){await p.waitForTimeout(40);if(await p.evaluate(()=>__sf.mx().at==='chapel'))break;}await p.keyboard.up('KeyS');await p.waitForTimeout(700);
ok(await p.evaluate(()=>__sf.mx().at)==='chapel','walking out the south door returns to the Cloister');
await p.reload();await p.waitForTimeout(600);s=await S();ok(s.mx.seen.office&&s.claims['act:folders'],'discovery and the folders survive a reload');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/off_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
