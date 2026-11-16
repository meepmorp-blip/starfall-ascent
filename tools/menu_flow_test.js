// Menu flows with real input: Pause → World map → Close → Resume (and variations), then move/attack/talk/pause/switch must still work. Usage: node menu_flow_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url:u0}=await serve();const url=u0+(process.env.SF_PAGE||'');const b=await chromium.launch();const ctx=await b.newContext(VP);
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
// ── real input only: keyboard on desktop, taps on touch screens
const touch=mode!=='desk';
const ovOpen=()=>E(()=>!document.getElementById('overlay').hidden);
const tapOrClick=async loc=>{if(touch)await loc.tap();else await loc.click();await p.waitForTimeout(250);};
const item=t=>p.locator('#overlay .tm-item',{hasText:t}).first();
const btn=t=>p.locator('#overlay button',{hasText:t}).first();
let cdp=null;
const hold=async(x,y,ms=110)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await p.waitForTimeout(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
const openPause=async()=>{if(touch){const b=await E(()=>{const H=__sf.hud();return {x:H.btn.pause.x,y:H.btn.pause.y};});await p.touchscreen.tap(b.x,b.y);}else await p.keyboard.press('Escape');await p.waitForTimeout(300);
  return await E(()=>!document.getElementById('overlay').hidden&&!!document.querySelector('#overlay .pz'));};
const snap=()=>E(()=>({st:__sf.st(),paused:__sf.paused?__sf.paused():undefined,ov:!document.getElementById('overlay').hidden}));
// can the player actually play? move, attack, talk, reopen pause
async function playable(tag,d){const r={};
  const x0=await E(()=>__sf.p().x);
  if(touch){const vw=p.viewportSize();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:vw.width*0.2,y:vw.height*0.7}]});
    for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:vw.width*0.2+(d<0?-i*6:i*6),y:vw.height*0.7}]});await p.waitForTimeout(50);}
    await p.waitForTimeout(300);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{const k=d<0?'KeyA':'KeyD';await p.keyboard.down(k);await p.waitForTimeout(450);await p.keyboard.up(k);}
  await p.waitForTimeout(100);const x1=await E(()=>__sf.p().x);r.move=Math.abs(x1-x0)>10;
  // talk to the nearest townsperson
  const near=await E(()=>{const m=__sf.m(),pl=__sf.p();let best=null,bd=1e9;for(const n of m.npcs){if(n.hide&&n.hide(m))continue;if(n.spot||!n.lines||/^(sec|look|exit|door|chest|odd)\./.test(n.id))continue;const d=Math.hypot(n.x-pl.x,n.y-pl.y);if(d<bd){bd=d;best=n;}}return best&&{id:best.id,x:best.x,y:best.y};});
  if(near){let ok2=false;for(const [ox,oy] of [[-22,6],[22,6],[0,24],[0,-24]]){await E(([n,ox,oy])=>{const pl=__sf.p();pl.x=n.x+ox;pl.y=n.y+oy;},[near,ox,oy]);await p.waitForTimeout(160);if(await E(()=>__sf.m().near&&__sf.m().near.id)===near.id){ok2=true;break;}}
    if(ok2){if(touch){const b=await E(()=>{const H=__sf.hud();return {x:H.btn.atk.x,y:H.btn.atk.y};});await hold(b.x,b.y);}else{await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');}
      await p.waitForTimeout(350);const st=await E(()=>__sf.st());r.talk=st==='dialog'||await ovOpen();r.who=near.id;
      for(let i=0;i<30&&(await E(()=>__sf.st()))==='dialog';i++){if(touch)await p.mouse.click(10,10);else await p.keyboard.press('Space');await p.waitForTimeout(70);}
      if(await ovOpen()&&!(await E(()=>!!document.querySelector('#overlay .pz')))){const bk=p.locator('#overlay [data-back]').first();if(await bk.count())await tapOrClick(bk);}
      await p.waitForTimeout(200);}else r.talk='no-npc-in-reach';}
  else r.talk='no-npc';
  r.pause=await openPause();if(r.pause){await tapOrClick(item('Resume'));}
  r.after=await snap();
  const good=r.move&&r.talk===true&&r.pause&&r.after.st==='play'&&!r.after.ov;
  ok(good,tag+': player can move, use the talk/attack button on someone, and reopen the pause menu ('+JSON.stringify(r)+')');return good;}
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
cdp=await ctx.newCDPSession(p);
await load(save(1));
for(const d of ['market','plaza','tower','ward','yard','ashlane']){await go(d);
  await playable(d+' · baseline, no menus opened yet',d==='market'?-1:1);
  // 1. Pause → World map → Close → Resume (the reported softlock)
  ok(await openPause(),d+': pause opens');await tapOrClick(item('World map'));ok(await E(()=>!!document.querySelector('#overlay .wm')),d+': world map opens from pause');
  await tapOrClick(btn('Close'));ok(await E(()=>!!document.querySelector('#overlay .pz')),d+': Close returns to the pause menu');
  await tapOrClick(item('Resume'));const s=await snap();ok(s.st==='play'&&!s.ov,d+': Resume returns to play (state '+s.st+')');
  await playable(d+' · pause → map → close → resume',d==='market'?1:-1);}
await go('market');
// 2. Pause → map → Close → reopen pause straight away (twice), then resume
await openPause();await tapOrClick(item('World map'));await tapOrClick(btn('Close'));await tapOrClick(item('Resume'));ok(await openPause(),'after map → close → resume, the pause menu opens again');await tapOrClick(item('Resume'));
// 3. map closed with the keyboard instead of the button (desktop: M and Escape)
if(!touch){await openPause();await tapOrClick(item('World map'));await p.keyboard.press('KeyM');await p.waitForTimeout(300);ok(await E(()=>!!document.querySelector('#overlay .pz')),'map closed with M returns to the pause menu');await tapOrClick(item('Resume'));
  await playable('pause → map → M → resume',1);
  await openPause();await tapOrClick(item('World map'));await p.keyboard.press('Escape');await p.waitForTimeout(300);const s2=await snap();ok(s2.st==='play'&&!s2.ov,'Escape on the pause map resumes play directly, as Escape does everywhere while paused ('+s2.st+')');
  await playable('pause → map → Escape',-1);}
// 4. the whole sequence five times in a row
for(let i=0;i<5;i++){await openPause();await tapOrClick(item('World map'));await tapOrClick(btn('Close'));await tapOrClick(item('Resume'));}
await playable('pause → map → close → resume ×5',-1);
// 5. other menus before returning: map → close → Journal → back → Guide → back → resume
await openPause();await tapOrClick(item('World map'));await tapOrClick(btn('Close'));
await tapOrClick(item('Journal'));await tapOrClick(p.locator('#overlay [data-back]').first());ok(await E(()=>!!document.querySelector('#overlay .pz')),'Journal → back returns to the pause menu');
await tapOrClick(item('Guide'));await tapOrClick(p.locator('#overlay [data-back]').first());ok(await E(()=>!!document.querySelector('#overlay .pz')),'Guide → back returns to the pause menu');
await tapOrClick(item('Resume'));await playable('map, Journal and Guide, then resume',1);
// 6. travel from the pause map: arrive and play
await openPause();await tapOrClick(item('World map'));await E(()=>window.__wmSel('plaza'));await p.waitForTimeout(150);await tapOrClick(btn('Travel'));await p.waitForTimeout(2500);
ok(await E(()=>__sf.mx().at)==='plaza','travelling from the pause map arrives at the Plaza');await playable('pause → map → travel',1);
// 7. the HUD map button (opened from play) → Close
if(touch){const b=await E(()=>{const H=__sf.hud();return {x:H.btn.wmap.x,y:H.btn.wmap.y};});await p.touchscreen.tap(b.x,b.y);}else await p.keyboard.press('KeyM');await p.waitForTimeout(300);
ok(await E(()=>!!document.querySelector('#overlay .wm')),'the map opens straight from play');await tapOrClick(btn('Close'));await playable('map from play → close',-1);
// 8. a fight afterwards: switching and pausing work (party of three)
const sv=JSON.parse(await E(()=>localStorage.getItem('starfall-ascent-save')));for(const id of ['kairos','ines','bram'])sv.chars[id].lvl=3;await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
await openPause();await tapOrClick(item('World map'));await tapOrClick(btn('Close'));await tapOrClick(item('Resume'));
await E(()=>__sf.mission('garrison',['kairos','ines','bram']));await p.waitForTimeout(2000);
const a0=await E(()=>__sf.team().ai);
if(touch){const pt=await E(()=>{const P=__sf.hud().ports[2];return {x:P.x,y:P.y};});await p.touchscreen.tap(pt.x,pt.y);}else await p.keyboard.press('Digit3');await p.waitForTimeout(300);
ok(await E(()=>__sf.team().ai)!==a0,'in a fight afterwards, party switching works');
const hp0=await E(()=>{const e=__sf.en().find(e=>!e.dead);e.__qa=1;return e.hp;});
for(let i=0;i<30;i++){await E(()=>{const e=__sf.en().find(e=>e.__qa&&!e.dead);if(e){const pl=__sf.p();pl.x=e.x-30;pl.y=e.y;}});
  if(touch){const b=await E(()=>{const H=__sf.hud();return {x:H.btn.atk.x,y:H.btn.atk.y};});await p.touchscreen.tap(b.x,b.y);}else{await p.keyboard.down('KeyJ');await p.waitForTimeout(60);await p.keyboard.up('KeyJ');}await p.waitForTimeout(50);}
const hp1=await E(()=>{const e=__sf.en().find(e=>e.__qa);return e&&!e.dead?e.hp:0;});ok(hp1<hp0,'and attacks hit ('+Math.round(hp0)+' → '+Math.round(hp1)+' HP)');
ok(await openPause(),'and the pause menu opens in the fight');await tapOrClick(item('Resume'));ok(await E(()=>__sf.st())==='play','and Resume returns to the fight');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/menuflow_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
