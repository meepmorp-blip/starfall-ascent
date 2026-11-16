// Stage 4 · Naomi & Theo (The Things We Couldn't Save). Usage: node bond_lark_test.js [phone|small]
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
const SPOIL=/Mercy|holy water|silver cup|\bcups?\b|fountain|Sunday|Demiurge|Lucas|Horaios|Archive|Registry/i;
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(0));ok(await st('lark_couldnt_save')==='locked_by_story','before the Chapter 1 clear the story is story-locked');
await go('ward');ok(!(await E(()=>__sf.m().npcs.some(n=>n.id==='ward.chart'))),'no folder on the desk before the clear');
// discovery by talking to Naomi twice at the hideout
await load(save(1));await interact('h_noemi');ok(await st('lark_couldnt_save')==='undiscovered','one talk with Naomi is just small talk');
await interact('h_noemi');ok(await st('lark_couldnt_save')==='available','a second talk with Naomi finds her story');
// discovery by the folder at St. Lucia's (fresh save)
await load(save(1));await go('ward');ok(await mark('ward.chart')==='?','a patient folder lies on the nurses’ desk');
let r=await interact('ward.chart');let text=r.lines.slice();ok(r.lines.some(l=>/ODELL/.test(l))&&await st('lark_couldnt_save')==='available','reading it finds Naomi’s story');
ok(await E(()=>!!__sf.qplaces().tower),'the Clock Tower is marked');
await go('tower');ok(await mark('h_noemi')==='!','Naomi has a "!"');r=await interact('h_noemi');text=text.concat(r.lines);
ok(await st('lark_couldnt_save')==='active'&&await step('lark_couldnt_save')==='pages','Naomi offers it and it starts');
ok(await E(()=>!!__sf.qplaces().ward),'St. Lucia’s is marked');
// at the ward: Naomi and Theo come along; the pages
await go('ward');const ppl=await E(()=>__sf.m().npcs.filter(n=>n.ch&&!(n.hide&&n.hide(__sf.m()))).map(n=>n.id));
ok(ppl.includes('q_naomi')&&ppl.includes('q_theo'),'Naomi and Theo are at the ward ('+ppl.join(',')+')');
{const hb=await hudHits(['ward.','q_']);ok(hb.length===0,'pages, the folder, Naomi and Theo are clear of the HUD'+(hb.length?': '+hb.join(','):''));}
const reach=await E(()=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];const pl=__sf.p();const c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  const t=m.npcs.filter(n=>/^ward\.(lt_|chart)|^q_/.test(n.id)).map(n=>[n.id,n.x,n.y]);t.push(['bed',B[0]+(B[2]-B[0])*0.86,B[1]+(B[3]-B[1])*0.5]);return t.filter(t=>!can(t[1],t[2])).map(t=>t[0]);});
ok(reach.length===0,'pages, folder, Naomi, Theo and the old bed are reachable on foot'+(reach.length?': '+reach.join(','):''));
r=await interact('q_naomi');text=text.concat(r.lines);
for(const k of ['lt_p1','lt_p2','lt_p3']){r=await interact('ward.'+k);text=text.concat(r.lines);}
ok(/\(3 \/ 4\)/.test(await E(()=>__sf.goal())),'three of four pages ('+await E(()=>__sf.goal())+')');
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);await go('ward');
ok(await step('lark_couldnt_save')==='pages'&&await E(()=>__sf.mx().items.lt_p3),'a reload keeps the pages');
r=await interact('ward.lt_p4');text=text.concat(r.lines);ok(await step('lark_couldnt_save')==='order','the fourth page completes the set');
// the folder in order
ok(await mark('ward.chart')==='!','the folder has a "!"');await interact('ward.chart');ok(await p.locator('.pzl-o').count()===3,'the folder opens the ordering puzzle');
await pick(0);ok(await E(()=>/Earlier than that/.test(document.body.textContent)),'a wrong page gets Naomi’s correction');
await p.locator('.pzl .btn.ghost').click();await p.waitForTimeout(300);ok(await step('lark_couldnt_save')==='order','leaving keeps the step');
await interact('ward.chart');await pick(1);await pick(0);await pick(0);ok(await E(()=>/Theo: Nobody took it/.test(document.body.textContent)),'week six: nobody took the page, nobody was there');
await pick(1);await p.waitForTimeout(400);ok(await step('lark_couldnt_save')==='read','the folder is in order');
// Theo's box: hot and cold
const sample=async()=>{let mx=0;for(let i=0;i<14;i++){mx=Math.max(mx,await E(()=>__sf.beep()||0));await p.waitForTimeout(110);}return mx;};
await E(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[0]+(B[2]-B[0])*0.15;pl.y=B[1]+(B[3]-B[1])*0.6;});const far=await sample();
ok(await E(()=>!__sf.m().npcs.some(n=>n.id==='ward.bed'&&!n.hide())),'far away, the bed is not marked');
await E(()=>{const B=__sf.bounds(),pl=__sf.p();pl.x=B[0]+(B[2]-B[0])*0.86-30;pl.y=B[1]+(B[3]-B[1])*0.5;});await p.waitForTimeout(1600);const near=await sample();
ok(far>0.9&&near<0.5,'the box beeps faster near the bed ('+far.toFixed(2)+'s far, '+near.toFixed(2)+'s near)');
await p.screenshot({path:`out/lark_${mode}_box.png`});
r=await interact('ward.bed');text=text.concat(r.lines);ok(r.lines.some(l=>/below it/.test(l))&&await step('lark_couldnt_save')==='defend','at the bed the reading drops below zero');
// defend Naomi, then the ending
r=await interact('q_naomi');text=text.concat(r.lines);ok(await winFight(),'defending Naomi is a real fight');
ok(await E(()=>__sf.mx().at)==='ward'&&await step('lark_couldnt_save')==='end','after winning, back in the ward');
const s0=await S();await interact('q_theo');ok(await scene(),'the ending is a scene');let s=await S();
ok(s.mx.q.lark_couldnt_save.s==='done'&&s.bonds.noemi===1&&s.bonds.theo===1&&s.dust===s0.dust+40&&s.keep===s0.keep+1&&s.frags.length>=s0.frags.length+1&&s.mx.mem['rec.lark']&&s.story['lark.casefile'],'complete: Bond +1 for Naomi and Theo, 40 Stardust, Keepsake, Fragment, Naomi’s notebook');
await go('ward');ok(await E(()=>!__sf.m().npcs.some(n=>/^q_|^ward\.(chart|bed|lt_)/.test(n.id)&&!(n.hide&&n.hide(__sf.m())))),'afterwards Naomi, Theo and the folder are gone from the ward');
const d1=s.dust;await E(()=>{__sf.qstart('lark_couldnt_save');__sf.qtick();});await go('tower');r=await interact('h_noemi');ok((await S()).dust===d1&&!/Mr. Odell/.test(r.lines.join(' ')),'not offered or paid again');
// Journal and canon
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
const jt=await E(()=>document.body.textContent);ok(/The Things We Couldn’t Save/.test(jt)&&/Naomi’s notebook/.test(jt),'the story and the notebook are in the Journal');
const src=await E(()=>JSON.stringify(__sf.mxQ.lark_couldnt_save)+__sf.src2());const all=src+' '+text.join(' ');const bad=all.match(SPOIL);
ok(!bad,'the decline is not explained: no water, Mercy, cups, Sundays or Chapter 2 material'+(bad?' ('+all.match(new RegExp('.{50}'+bad[0]+'.{20}'))+')':''));
ok(/Together/.test(src)&&/You wrote down everything else/.test(src),'Naomi and Theo stay a team (Theo supports, never dismisses)');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/lark_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
