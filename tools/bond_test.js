// Bond: clear feedback, max level, captured characters, Guide and Journal. Usage: node bond_test.js [phone|small]
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
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(1));
let L=await E(()=>__sf.grant({bond:['bram']},'t:b1'));
ok(await E(()=>__sf.bond('bram'))===1&&L.some(l=>/Bond with (Big Boy )?Bram ♥♡♡♡♡ \(stronger in story battles\)/.test(l)),'a Bond reward says how close and what it does ('+L.join(' | ')+')');
await E(()=>{__sf.save().bonds.bram=5;});L=await E(()=>__sf.grant({bond:['bram']},'t:b2'));
ok(await E(()=>__sf.bond('bram'))===5&&L.some(l=>/already full ♥♥♥♥♥/.test(l))&&!L.some(l=>/\+1/.test(l)),'at five hearts it says “already full” instead of a false +1');
// Lucas, captured: the Bond waits
const lb=await E(()=>__sf.bond('lucan'));L=await E(()=>__sf.grant({bond:['lucan']},'t:b3'));
ok(await E(()=>__sf.bond('lucan'))===lb&&(await E(()=>__sf.bondPend())).lucan===1&&L.some(l=>/kept until he is back/.test(l)),'Lucas is captured: his Bond is kept, not added ('+L.join(' | ')+')');
// a memory finished while he is captured
await E(()=>{const x=__sf.mx();x.q.lucas_mem_bread={s:'active',n:0,at:1};x.qseen.lucas_mem_bread=1;x.f.lm_bread=1;__sf.qtick();});
ok(await E(()=>__sf.bond('lucan'))===lb&&(await E(()=>__sf.bondPend())).lucan===2,'finishing a Lucas memory while he is captured also waits');
await E(()=>__sf.setStory('ch2.lucasRescued'));await E(()=>__sf.qtick());
ok(await E(()=>__sf.bond('lucan'))===lb+2&&!(await E(()=>__sf.bondPend())).lucan,'when he is back (the Chapter 2 rescue flag), the waiting Bond is added');
// before the Chapter 1 clear he is available
await load(save(0));const b0=await E(()=>__sf.bond('lucan'));await E(()=>__sf.grant({bond:['lucan']},'t:b4'));ok(await E(()=>__sf.bond('lucan'))===b0+1,'during Chapter 1 (Lucas present) Bond is added at once');
// explained in the Guide and the Journal
await E(()=>__sf.builds&&0);await p.evaluate(()=>{});
await load(save(1));await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
ok(/Bond ♥: Agnes/.test(await E(()=>document.body.textContent))&&/\+4% HP and attack in story battles/.test(await E(()=>document.body.textContent)),'the Journal’s Stories tab shows everyone’s hearts and what they do');
await p.screenshot({path:`out/bond_${mode}_journal.png`});
await p.goto(url);await p.waitForTimeout(500);await p.locator('.tm-item',{hasText:'Guide'}).click();await p.waitForTimeout(300);await p.locator('button',{hasText:'Team'}).first().click();await p.waitForTimeout(300);
ok(/Bond ♥/.test(await E(()=>document.body.textContent))&&/not in Rifts or Trials/.test(await E(()=>document.body.textContent)),'the Guide explains Bond (Team page)');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/bond_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
