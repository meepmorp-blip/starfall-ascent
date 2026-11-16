// QA probe: tries to break things (repeat rewards, lost/reloaded story fights, reload mid-dialogue, damaged saves/backups, full storage, swap spam, growth, touch). Usage: node qa_probe_test.js [phone]
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
const winNow=async()=>{await E(()=>__sf.win());for(let i=0;i<40;i++){await p.waitForTimeout(200);if(await E(()=>__sf.m()&&__sf.m().M.type==='walk'))break;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}await p.waitForTimeout(500);};
const toHub=async()=>{for(let i=0;i<50;i++){await p.waitForTimeout(200);if(await E(()=>__sf.m()&&__sf.m().M.type==='walk'))return true;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}return false;};
const agnesAt2=()=>{const sv=save(1);sv.mx.q.agnes_handmade={s:'active',n:2,at:1};sv.mx.qseen={agnes_handmade:1};sv.mx.f.bench_used=1;for(const id of ['kairos','ines'])sv.chars[id]={xp:0,lvl:3,slots:{sun:null,moon:null,rising:null}};return sv;};
const sec=async(name,f)=>{try{await f();}catch(e){log.push('FAIL '+name+' crashed: '+String(e.message).split('\n')[0]);}};
const money=()=>E(()=>JSON.stringify([__sf.save().dust,__sf.save().keep,__sf.save().frags.length]));
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');
const metrics=async()=>{await cdp.send('HeapProfiler.collectGarbage').catch(()=>{});const m=(await cdp.send('Performance.getMetrics')).metrics;const g=k=>(m.find(x=>x.name===k)||{}).value;return {L:g('JSEventListeners'),N:g('Nodes'),H:Math.round(g('JSHeapUsedSize')/1e6)};};

await sec('rewards',async()=>{await load(save(1));
  const d0=await E(()=>__sf.save().dust);await E(()=>__sf.grant({dust:50},'qa:once'));await E(()=>__sf.grant({dust:50},'qa:once'));
  const d1=await E(()=>__sf.save().dust);ok(d1===d0+50,'the same reward key pays once ('+d0+' → '+d1+')');
  await E(()=>{const x=__sf.mx();x.q.lucas_mem_bread={s:'active',n:0,at:1};x.qseen.lucas_mem_bread=1;x.f.lm_bread=1;});
  const before=await money();await E(()=>{for(let i=0;i<60;i++)__sf.qtick();});const a1=await money();await E(()=>{for(let i=0;i<60;i++)__sf.qtick();});const a2=await money();
  ok(a1!==before&&a1===a2,'a finished quest pays once, however often it is ticked ('+before+' → '+a1+' → '+a2+')');
  await E(()=>{const x=__sf.mx();for(const q of Object.keys(__sf.mxQ).slice(0,40))x.q[q]={s:'done',n:9};});const [rn,rk,cl]=await E(()=>__sf.renown());
  if(cl>0){await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await p.locator('button',{hasText:'Renown'}).first().click().catch(()=>{});await p.waitForTimeout(300);
    const dd=await E(()=>__sf.save().dust);await p.locator('.mx-rank.ready button').first().dblclick({force:true}).catch(()=>{});await p.waitForTimeout(300);
    const got=await E(()=>__sf.save().dust)-dd,n=await E(()=>Object.keys(__sf.save().claims).filter(k=>k.startsWith('renown:')).length);
    ok(n===1&&got<=200,'double-clicking a Renown claim pays one rank (+'+got+' dust, '+n+' claimed)');}
  else ok(true,'(no Renown rank ready to claim: '+rn+')');});

await sec('lost story fight',async()=>{await load(agnesAt2());await go('tower');await interact('h_agnes');await p.waitForTimeout(2500);
  const inF=await E(()=>__sf.m()&&__sf.m().M.type);ok(inF==='fight','Agnes’s story fight starts ('+inF+')');
  await E(()=>__sf.lose());const back=await toHub();
  const q=await E(()=>__sf.mx().q.agnes_handmade),won=await E(()=>!!__sf.mx().f['won:mxf_roof_agnes']),at=await E(()=>__sf.mx().at);
  ok(back&&q.n===2&&!won&&at==='tower','losing a story fight: back in the same district, step kept, nothing won (n='+q.n+', at '+at+', hub '+back+')');
  await interact('h_agnes');await p.waitForTimeout(2500);ok(await E(()=>__sf.m()&&__sf.m().M.type)==='fight','after a loss the fight can be retried');
  await p.reload();await p.waitForTimeout(800);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
  const q2=await E(()=>__sf.mx().q.agnes_handmade);ok(q2.n===2&&await E(()=>__sf.m().M.type)==='walk','reloading mid-fight: back in Meridian, step kept (n='+q2.n+')');
  await go('tower');await interact('h_agnes');await p.waitForTimeout(2500);ok(await E(()=>__sf.m()&&__sf.m().M.type)==='fight','…and the fight can be started again');await winNow();
  const q3=await E(()=>__sf.mx().q.agnes_handmade);ok(q3.n>2||q3.s==='done','winning after a loss and a reload advances the story ('+JSON.stringify(q3)+')');});

await sec('reload mid-dialogue',async()=>{await load(save(1));await go('tower');
  const n=await npc('h_bram');await E(n=>{const pl=__sf.p();pl.x=n.x-22;pl.y=n.y+6;},n);await p.waitForTimeout(200);
  await p.keyboard.down('KeyF');await p.waitForTimeout(60);await p.keyboard.up('KeyF');await p.waitForTimeout(300);
  const mid=await E(()=>__sf.st());await p.keyboard.press('Space');await p.waitForTimeout(80);await p.reload();await p.waitForTimeout(700);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
  const q=await E(()=>__sf.mx().q.bram_bread);await go('tower');await interact('h_bram');const q2=await E(()=>__sf.mx().q.bram_bread);
  ok(mid==='dialog'&&q2&&q2.s==='active','reloading in the middle of an offer: the offer comes back and can be accepted (mid '+mid+', before '+JSON.stringify(q)+', after '+JSON.stringify(q2)+')');});

await sec('talk spam',async()=>{await load(save(1));await go('tower');const s0=await E(()=>JSON.stringify([__sf.save().dust,__sf.save().keep,Object.keys(__sf.save().claims).length]));
  for(let i=0;i<12;i++)await interact('h_agnes');
  const s1=await E(()=>JSON.stringify([__sf.save().dust,__sf.save().keep,Object.keys(__sf.save().claims).length]));
  ok(s0===s1,'talking to the same person 12 times gives nothing extra ('+s0+' / '+s1+')');ok(await E(()=>__sf.st())==='play','…and never leaves a dialogue stuck open');});

await sec('locked places',async()=>{await load(save(1));const ex={};
  for(const d of ['market','plaza','yard','chapel','ward','hesper','ashlane','tower','office'])ex[d]=await E(d=>{try{return __sf.exitsOf(d);}catch(e){return ['ERR '+e.message];}},d);
  const leaks=Object.entries(ex).filter(([d,e])=>e.some(x=>/annex|oldchapel|ERR/.test(x)));
  ok(leaks.length===0,'before they are found, no street exit leads into the Annex or the Old Chapel ('+(leaks.map(l=>l[0]+':'+l[1].join('/')).join(',')||'none')+')');});

await sec('swap spam',async()=>{const sv=save(1);for(const id of ['kairos','ines','bram'])sv.chars[id]={xp:0,lvl:3,slots:{sun:null,moon:null,rising:null}};await load(sv);
  await E(()=>__sf.mission('garrison',['kairos','ines','bram']));await p.waitForTimeout(1500);const t=await E(()=>__sf.room()&&__sf.room().def&&__sf.room().def.kind);
  await p.keyboard.down('KeyD');for(let i=0;i<45;i++){await p.keyboard.press('Digit'+(1+i%3));await p.keyboard.press('Space');await p.waitForTimeout(25);}await p.keyboard.up('KeyD');
  await E(()=>{const T=__sf.team();const j=(T.ai+1)%3;T.members[j].hp=0;T.members[j].down=true;window.__qaDown=j;});await p.keyboard.press('Digit'+(1+await E(()=>window.__qaDown)));await p.waitForTimeout(300);
  const r=await E(()=>{const T=__sf.team();return {ai:T.ai,down:T.members[T.ai].down,ok:__sf.p()===T.members[T.ai]};});
  ok(r.ok&&!r.down,'rapid switching mid-fight: the active hero is always valid, a downed ally can’t be picked (room '+t+', '+JSON.stringify(r)+')');
  await E(()=>__sf.kill());await p.waitForTimeout(400);await E(()=>__sf.win());await p.waitForTimeout(2000);});

await sec('damaged saves',async()=>{const bad={'kairos is a string':s=>{s.chars.kairos='x';},'mx is a string':s=>{s.mx='broken';},'bonds null':s=>{s.bonds=null;},'claims array':s=>{s.claims=[];},
    'frags string':s=>{s.frags='x';},'dust text':s=>{s.dust='999';},'story number':s=>{s.story=5;},'mx.q null':s=>{s.mx.q=null;},'unknown district':s=>{s.mx.at='nowhere';},'slots missing':s=>{s.chars.kairos={xp:0,lvl:5};},'level 9999':s=>{s.chars.kairos={xp:-50,lvl:9999,slots:{sun:null,moon:null,rising:null}};}};
  for(const [k,f] of Object.entries(bad)){const sv=save(1);f(sv);const e0=errs.length;
    await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(700);
    let hub=false;try{await E(()=>__sf.mxBegin());await p.waitForTimeout(900);hub=await E(()=>!!(__sf.m()&&__sf.m().M.type==='walk'));}catch(e){}
    const ne=errs.length-e0;ok(ne===0&&hub,'damaged save ('+k+'): loads and reaches Meridian without errors'+(ne?' — '+errs.slice(e0).join(' | ').slice(0,200):hub?'':' — did not reach Meridian'));errs.length=e0;}});

await sec('backups',async()=>{await load(save(1));const cases={'garbage':'hello','truncated code':'SFA1-abc','empty json':'{}','array':'[]','future version':JSON.stringify({k:'sfa',format:'starfall-ascent-backup',v:9,saveV:9,at:1,save:{chars:{}}}),
    'proto pollution':'{"k":"sfa","format":"starfall-ascent-backup","v":1,"saveV":2,"at":1,"save":{"chars":{},"__proto__":{"polluted":1}}}','huge':'{"x":"'+'a'.repeat(3e6)+'"}'};
  for(const [k,t] of Object.entries(cases)){const r=await E(t=>__sf.parseBackup(t),t);const pol=await E(()=>({}).polluted===1);
    const rej=!!(r&&r.error)||!(r&&r.save&&r.save.chars);ok(k==='proto pollution'?!pol:rej,'backup input “'+k+'” is '+(k==='proto pollution'?'harmless':'rejected')+' ('+String(JSON.stringify(r)).slice(0,90)+')');}});

await sec('storage full',async()=>{await load(save(1));const e0=errs.length;
  await E(()=>{window.__realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError');};});
  await E(()=>__sf.grant({dust:5},'qa:full'));await go('market');await go('tower');
  const st=await E(()=>__sf.st());await E(()=>{Storage.prototype.setItem=window.__realSet;});
  ok(errs.length===e0&&st==='play','storage full: playing continues with no crash ('+st+')');});

await sec('growth',async()=>{await load(save(1));const m0=await metrics();
  for(let i=0;i<25;i++){await E(d=>__sf.mxGo(d),['market','plaza','tower','ward','yard'][i%5]);await p.waitForTimeout(150);}
  for(let i=0;i<6;i++){await E(()=>__sf.mxMenu());await p.waitForTimeout(120);await p.keyboard.press('Escape');await p.waitForTimeout(120);}
  await E(()=>__sf.mxBegin());await p.waitForTimeout(800);const m1=await metrics();
  ok(m1.L-m0.L<40&&m1.N-m0.N<300,'25 district changes + 6 menus: listeners '+m0.L+' → '+m1.L+', DOM nodes '+m0.N+' → '+m1.N+', heap '+m0.H+' → '+m1.H+' MB');
  const fps=await E(()=>new Promise(r=>{let n=0,t0=performance.now(),worst=0,last=t0;const f=t=>{n++;worst=Math.max(worst,t-last);last=t;if(t-t0<3000)requestAnimationFrame(f);else r({fps:Math.round(n/((t-t0)/1000)),worst:Math.round(worst)});};requestAnimationFrame(f);}));
  ok(fps.fps>=40,'hub frame rate '+fps.fps+' fps, worst frame '+fps.worst+' ms ('+mode+', headless, no throttle)');
  const sv=save(1);for(const id of ['kairos','ines','bram'])sv.chars[id]={xp:0,lvl:3,slots:{sun:null,moon:null,rising:null}};await load(sv);
  await E(()=>__sf.mission('garrison',['kairos','ines','bram']));await p.waitForTimeout(2500);
  const f2=await E(()=>new Promise(r=>{let n=0,t0=performance.now(),worst=0,last=t0;const f=t=>{n++;worst=Math.max(worst,t-last);last=t;if(t-t0<3000)requestAnimationFrame(f);else r({fps:Math.round(n/((t-t0)/1000)),worst:Math.round(worst),en:__sf.en().length});};requestAnimationFrame(f);}));
  ok(f2.fps>=30,'fight frame rate '+f2.fps+' fps, worst frame '+f2.worst+' ms, '+f2.en+' enemies (headless; real iPhone still to check)');await E(()=>__sf.win());await p.waitForTimeout(1500);});

if(mode!=='desk')await sec('touch',async()=>{await load(save(1));await go('market');const x0=await E(()=>[__sf.p().x,__sf.p().y]);
  const vw=p.viewportSize();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:vw.width*0.2,y:vw.height*0.7}]});
  for(let i=1;i<=10;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:vw.width*0.2+i*6,y:vw.height*0.7}]});await p.waitForTimeout(60);}
  await p.waitForTimeout(500);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const x1=await E(()=>[__sf.p().x,__sf.p().y]);
  ok(x1[0]-x0[0]>15,'touch joystick drag moves the player right ('+Math.round(x0[0])+' → '+Math.round(x1[0])+')');
  await p.setViewportSize({width:vw.height,height:vw.width});await p.waitForTimeout(500);const rot=await E(()=>{const r=document.getElementById('rotate');return r?getComputedStyle(r).display:'none';});
  ok(rot!=='none','portrait on a phone: the “rotate your phone” notice shows ('+rot+')');await p.setViewportSize(vw);await p.waitForTimeout(400);
  for(const w of [600,900,700,vw.width]){await p.setViewportSize({width:w,height:vw.height});await p.waitForTimeout(150);}});
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | ').slice(0,600):''));
console.log(log.join('\n'));fs.writeFileSync(`out/qa_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
