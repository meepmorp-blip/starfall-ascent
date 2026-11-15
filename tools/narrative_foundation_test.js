// Pre-Chapter 2 Narrative · Stage A (foundation) test. Usage: node narrative_foundation_test.js [phone|small]
// Era switch, the Clock Tower hideout, quest states/markers, hub<->fight and hub<->scene glue, Bond rewards.
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
  for(const [ox,oy] of [[dx,dy],[22,6],[-22,6],[0,24],[0,-24],[-16,-16],[16,-16]]){const n=await npc(id);if(!n)return {near:null,lines:[]};await p.evaluate(([n,dx,dy])=>{const pl=__sf.p();pl.x=n.x+dx;pl.y=n.y+dy;},[n,ox,oy]);await p.waitForTimeout(160);
    near=await p.evaluate(()=>__sf.m().near&&__sf.m().near.id);if(near===id)break;}const lines=await press();return {near,lines};}
const ROSTER=['kairos','ines','bram','noemi','theo','cass','dess'];
const save=(k,clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k,roster:ROSTER,flags:{},done:clear?1:0},mx:{v:1,at:'hesper',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1},talk:{},found:{},q:{},items:{},f:{}}});
const load=async sv=>{await p.evaluate(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(900);};
const walk=async(key,edge,target)=>{await p.evaluate(e=>{const B=__sf.bounds(),pl=__sf.p();if(e==='e'){pl.x=B[2]-20;pl.y=B[1]+(B[3]-B[1])*0.55;}else if(e==='w'){pl.x=B[0]+20;pl.y=B[1]+(B[3]-B[1])*0.55;}else if(e==='s'){pl.x=(B[0]+B[2])/2;pl.y=B[3]-20;}},edge);
  await p.keyboard.down(key);for(let i=0;i<40;i++){await p.waitForTimeout(40);if(target&&await p.evaluate(t=>__sf.mx().at===t,target))break;}await p.keyboard.up(key);await p.waitForTimeout(700);};
const partyIn=()=>p.evaluate(()=>__sf.m().npcs.filter(n=>n.ch&&['ines','bram','noemi','theo','cass','dess','lucan'].includes(n.ch)&&!(n.hide&&n.hide(__sf.m()))).map(n=>n.ch));
try{
await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── before the clear: unchanged hub
await load(save('Scene 9#2',0));
ok(await p.evaluate(()=>__sf.era())==='before','before the Chapter 1 clear the era is "before"');
ok(await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])).tower)==='locked','the Clock Tower is locked on the map');
await walk('KeyD','e',null);ok(await p.evaluate(()=>__sf.mx().at)==='hesper','St. Hesper’s east edge leads nowhere yet');
await p.evaluate(()=>__sf.mxGo('yard'));await p.waitForTimeout(800);const yb=await partyIn();
await p.evaluate(()=>__sf.mxGo('market'));await p.waitForTimeout(800);
ok(!(await p.evaluate(()=>__sf.m().npcs.some(n=>/^look\.wanted/.test(n.id)))),'no wanted notices before the clear');
const mt0=(await interact('matteo')).lines.join(' ');ok(mt0.length>0&&!/hood|paper/.test(mt0),'Matteo keeps his Festival lines');
// ── after the clear: the fugitive hub
{const sv=save('Scene 14#9',1);sv.mx.q={streets:{s:'done',n:9},glasses:{s:'done',n:9}};await load(sv);}
ok(await p.evaluate(()=>__sf.era())==='fugitive','after the clear the era is "fugitive"');
ok(await p.evaluate(()=>Object.fromEntries(__sf.wm().map(o=>[o.id,o.st])).tower)==='found','the Clock Tower is reachable');
await walk('KeyD','e','tower');let s=await S();
ok(s.mx.at==='tower'&&s.mx.seen.tower,'walking off St. Hesper’s east edge reaches the Clock Tower');
await p.screenshot({path:`out/nar_${mode}_tower.png`});
const tp=await partyIn();ok(['ines','bram','noemi','theo','cass','dess'].every(c=>tp.includes(c))&&!tp.includes('lucan'),'the six are at the hideout, Lucas is not ('+tp.join(',')+')');
let text=[];for(const id of ['h_agnes','h_bram','h_noemi','h_theo','h_cass','h_dess'])text=text.concat((await interact(id)).lines);
ok(text.length>=6,'each of them talks ('+text.length+' lines)');
ok(!text.some(t=>/Mercy|water|Subject|Marr|Unwritten/i.test(t)),'no Chapter 2 reveals in hideout lines');
// collision / reach on the roof
const reach=await p.evaluate(()=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];
  const pl=__sf.p();const c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  return m.npcs.filter(n=>!(n.hide&&n.hide(m))).filter(n=>!can(n.x,n.y)).map(n=>n.id);});
ok(reach.length===0,'everything on the roof is reachable'+(reach.length?': '+reach.join(','):''));
ok(await p.evaluate(()=>{const m=__sf.m(),W=__sf.bounds()[4],H=400;return m.solids.some(s=>s.r&&Math.hypot(s.x-W*0.1,s.y-H*0.5)<2);}),'the gears are solid');
// workbench opens Builds; board opens the Journal on Stories
await p.evaluate(()=>__sf.mxGo('tower'));await p.waitForTimeout(800);await interact('tower.bench');ok(await p.evaluate(()=>__sf.st()==='title'&&/Builds/i.test(document.body.textContent)),'the workbench opens Builds');
await p.screenshot({path:`out/nar_${mode}_bench.png`});
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);
await interact('tower.board');ok(await p.evaluate(()=>{const t=document.querySelector('.mx-tabs [aria-pressed="true"]');return t&&/Stories/.test(t.textContent);}),'the notice board opens the Journal on Stories');
ok(await p.evaluate(()=>/after Chapter 1|No stories found/.test(document.body.textContent)),'the Stories tab explains when it is empty');
await p.screenshot({path:`out/nar_${mode}_stories.png`});
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(800);
// wanted notices and townsfolk
await p.evaluate(()=>__sf.mxGo('market'));await p.waitForTimeout(800);
ok(await p.evaluate(()=>__sf.m().npcs.some(n=>n.id==='look.wanted.market')),'a wanted notice is up in the Market Ring');
const wn=(await interact('look.wanted.market')).lines.join(' ');ok(/WANTED/.test(wn)&&/Lucas/.test(wn),'the notice names the charges');
const mt1=(await interact('matteo')).lines.join(' ');ok(/hood/.test(mt1),'Matteo has a fugitive-era line');
const ma=await partyIn();
await p.evaluate(()=>__sf.mxGo('yard'));await p.waitForTimeout(800);const ya=await partyIn();
await p.evaluate(()=>__sf.mxGo('ward'));await p.waitForTimeout(800);const wa=await partyIn();
ok(ya.length===0&&wa.length===0,'no party members stand in the Yard or St. Lucia’s ('+ya.join(',')+'/'+wa.join(',')+')');
ok(await p.evaluate(()=>__sf.mxMenu&&(__sf.mxMenu(),/after the Registry/.test(document.body.textContent))),'the Meridian menu says "after the Registry"');
await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(600);
// ── quest states, markers, bond rewards (with a temporary test quest)
const st=await p.evaluate(()=>{const Q=__sf.mxQ;Q.t_a={title:'Test A',desc:'a',kind:'bond',at:'tower',giver:'Bram',steps:[{id:'x',at:'market',t:'Go to market'}]};
  Q.t_b={title:'Test B',desc:'b',kind:'bond',pre:['t_a'],steps:[{id:'x',t:'x'}]};Q.t_c={title:'Test C',desc:'c',kind:'side',story:()=>false,steps:[{id:'x',t:'x'}]};
  const r=[__sf.qstate('t_a'),__sf.qstate('t_b'),__sf.qstate('t_c')];__sf.discover('t_a');r.push(__sf.qstate('t_a'),!!__sf.qplaces().tower);return r;});
ok(st[0]==='undiscovered'&&st[1]==='locked_by_prerequisite'&&st[2]==='locked_by_story','undiscovered / locked_by_prerequisite / locked_by_story ('+st.slice(0,3).join(',')+')');
ok(st[3]==='available'&&st[4],'discovering makes it available and marks its giver’s district');
const wmMark=await p.evaluate(()=>{__sf.mx().q.t_a={s:'on',n:0};return [__sf.qstate('t_a'),!!__sf.qplaces().market,!__sf.qplaces().tower];});
ok(wmMark[0]==='active'&&wmMark[1]&&wmMark[2],'an active quest marks where its current step happens');
const done=await p.evaluate(()=>{__sf.mx().q.t_a={s:'done',n:1};return [__sf.qstate('t_a'),__sf.qstate('t_b')];});
ok(done[0]==='completed'&&done[1]==='undiscovered','completing A unlocks B’s prerequisite');
const bb=await p.evaluate(()=>{const b0=__sf.bond('bram');__sf.grant({bond:['bram']},'t:bond');__sf.grant({bond:['bram']},'t:bond');return [b0,__sf.bond('bram')];});
ok(bb[1]===bb[0]+1,'a Bond reward raises Bond once ('+bb.join('→')+')');
await p.evaluate(()=>{for(const k of ['t_a','t_b','t_c']){delete __sf.mxQ[k];delete __sf.mx().q[k];if(__sf.mx().qseen)delete __sf.mx().qseen[k];}});
// ── glue: hub → fight → hub, hub → scene → hub
await p.evaluate(()=>__sf.mxGo('tower'));await p.waitForTimeout(800);
await p.evaluate(()=>__sf.mxFight('roof'));await p.waitForTimeout(1500);
ok(await p.evaluate(()=>!!(__sf.m()&&__sf.m().M&&__sf.m().M.type==='fight')),'a hub fight starts a fight room');
await p.evaluate(()=>__sf.win());for(let i=0;i<30;i++){await p.waitForTimeout(200);const r=await p.evaluate(()=>window.__mxFightResult);if(r!==undefined)break;
  const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}
ok(await p.evaluate(()=>window.__mxFightResult)===true&&await p.evaluate(()=>__sf.mx().at)==='tower'&&await p.evaluate(()=>__sf.m().M.type==='walk'),'after the fight you are back on the tower');
await p.evaluate(()=>__sf.mxScene());await p.waitForTimeout(600);
ok(await p.evaluate(()=>!!__sf.cut()),'a hub scene plays');
for(let i=0;i<20&&await p.evaluate(()=>!!__sf.cut());i++){await p.evaluate(()=>__sf.cutNext());await p.waitForTimeout(150);}await p.waitForTimeout(900);
ok(await p.evaluate(()=>window.__mxSceneDone===1&&__sf.mx().at==='tower'&&__sf.m().M.type==='walk'),'after the scene you are back on the tower');
// leave south
await walk('KeyS','s','hesper');ok(await p.evaluate(()=>__sf.mx().at)==='hesper','the stairs lead back down to St. Hesper’s');
await p.reload();await p.waitForTimeout(600);s=await S();ok(s.mx.seen.tower&&s.bonds,'the hideout visit survives a reload');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/nar_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
