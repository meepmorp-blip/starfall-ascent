// World map, menu map, exits and fast travel agree, at every story stage. Usage: node map_consistency_test.js [phone|small]
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const mode=process.argv[2]||'desk';
const VP={desk:{viewport:{width:1280,height:720}},phone:{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},small:{viewport:{width:667,height:375},hasTouch:true,isMobile:true,deviceScaleFactor:2}}[mode];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const ctx=await b.newContext(VP);const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);const E=(f,a)=>p.evaluate(f,a);
const ALL=['market','plaza','yard','chapel','ward','hesper','office','ashlane','tower','oldchapel','annex'];
const save=(k,clear,story)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},ch1Clears:clear?1:0,ch1b:{i:50,k,roster:['kairos'],flags:{},done:clear?1:0},story:story||{},
  mx:{v:1,at:'market',seen:Object.fromEntries(ALL.map(d=>[d,1])),talk:{},found:{},q:{},items:{},f:{}}});
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
const ids=await E(()=>__sf.wm().map(o=>o.id));
ok(ALL.every(d=>ids.includes(d)),'every explorable district has a world-map place ('+ALL.filter(d=>!ids.includes(d)).join(',')+')');
for(const [label,sv] of [['Scene 2',save('Scene 2#1',0)],['Scene 7',save('Scene 7#1',0)],['Scene 10',save('Scene 10#3',0)],['after Chapter 1',save('Scene 14#9',1)],['after Chapter 1 + St. Maren’s + annex',save('Scene 14#9',1,{'oldchapel.found':1,'annex.found':1})]]){
  await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);
  const r=await E(ALL=>{const st=Object.fromEntries(__sf.wm().map(o=>[o.id,o.st]));const open=d=>st[d]&&st[d]!=='locked'&&st[d]!=='soon';
    // reachable on foot from the Market Ring through exits whose far side is open
    const ex=window.__sf_exits;const raw=__sf.mxBegin&&null;const seen={market:1},q=['market'];const E2={};
    for(const d of ALL)E2[d]=[];
    return {st,open:ALL.filter(open)};},ALL);
  // the exits (as the game filters them) from each open district
  const reach=await E(()=>{const res={};for(const d of Object.keys(window.__sf_exits)){res[d]=1;}return res;});
  await E(()=>__sf.mxMenu());await p.waitForTimeout(250);
  const grid=await E(()=>[...document.querySelectorAll('.mx-map [data-d]')].map(e=>e.dataset.d));
  const extra=grid.filter(d=>!r.open.includes(d)),missing=r.open.filter(d=>!grid.includes(d));
  ok(extra.length===0&&missing.length===0,label+': the menu map shows exactly the open places ('+grid.length+')'+(extra.length?' extra '+extra:'')+(missing.length?' missing '+missing:''));
  // walk graph: every open district can be reached on foot from the Market Ring, and no exit leads to a locked place
  await E(()=>__sf.mxBegin());await p.waitForTimeout(500);
  const graph=await E(ALL=>{const g={};for(const d of ALL){__sf.mxGo(d);}return null;},ALL);
  const walk=await E(([ALL,open])=>{const out={};for(const d of open){out[d]=(window.__sf_exitsOpen?window.__sf_exitsOpen(d):[]);}return out;},[ALL,r.open]);
  const g={};for(const d of r.open){await E(d=>__sf.mxGo(d),d);await p.waitForTimeout(350);g[d]=await E(()=>__sf.m().exitsTo||null);}
  const ex2={};for(const d of r.open){ex2[d]=await E(d=>(window.__sf_exits[d]||[]),d);}
  // use the game's own filter through the hook
  const filt=await E(open=>Object.fromEntries(open.map(d=>[d,__sf.exitsOf(d)])),r.open);
  const bad=[];for(const d in filt)for(const t of filt[d])if(!r.open.includes(t))bad.push(d+'→'+t);
  ok(bad.length===0,label+': no exit leads to a locked place'+(bad.length?' '+bad:''));
  const seen={market:1},q=['market'];while(q.length){const d=q.shift();for(const t of filt[d]||[])if(!seen[t]){seen[t]=1;q.push(t);}}
  const unreached=r.open.filter(d=>!seen[d]);ok(unreached.length===0,label+': every open place can be walked to from the Market Ring'+(unreached.length?' (not: '+unreached+')':''));}
// fast travel to the newest places
await E(()=>__sf.mxBegin());await p.waitForTimeout(500);
for(const d of ['market','annex','oldchapel','tower']){if(mode==='desk')await p.keyboard.press('KeyM');else{await p.keyboard.press('Escape');await p.waitForTimeout(250);await p.locator('.tm-item',{hasText:'World map'}).click();}
  await p.waitForTimeout(400);await E(d=>window.__wmSel(d),d);await p.screenshot({path:`out/map_${mode}_world.png`});await p.locator('.wm-side .btn',{hasText:'Travel'}).click({timeout:5000});await p.waitForTimeout(1300);ok(await E(()=>__sf.mx().at)===d,'fast travel to '+d+' works');}
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await p.screenshot({path:`out/map_${mode}_menu.png`});
ok(await E(()=>{const m=document.querySelector('.mx-map');return m&&m.scrollWidth<=m.clientWidth+1&&m.getBoundingClientRect().bottom<=innerHeight+400;}),'the menu map fits the screen width');
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/map_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
