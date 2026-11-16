// Stage 3 · Agnes (A Little Something Handmade) and Bram (The Smell of Fresh Bread). Usage: node bond_agnes_bram_test.js [phone|small]
// Plays both stories through real input, interleaved (flexible order), with a reload in the middle.
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
const winFight=async()=>{await p.waitForTimeout(1400);const inFight=await E(()=>__sf.m()&&__sf.m().M.type==='fight');await E(()=>__sf.win());
  for(let i=0;i<40;i++){await p.waitForTimeout(200);if(await E(()=>__sf.m()&&__sf.m().M.type==='walk'))break;const bt=await p.$('.btn.primary,.res-cont');if(bt&&await bt.isVisible())await bt.click().catch(()=>{});}
  await p.waitForTimeout(700);return inFight;};
const scene=async()=>{await p.waitForTimeout(500);const had=await E(()=>!!__sf.cut());for(let i=0;i<40&&await E(()=>!!__sf.cut());i++){await E(()=>__sf.cutNext());await p.waitForTimeout(120);}await p.waitForTimeout(900);return had;};
const hudHits=ids=>E(ids=>{const m=__sf.m(),H=__sf.hud(),out=[],sw=H.sw;const scr=[[sw*0.1,0,sw*0.9,H.safe.t+70],[0,0,H.safe.l+14+Math.min(190,Math.max(130,sw*0.2))+6,H.safe.t+74],[sw-H.safe.r-70,0,sw,70]];
    if(H.touch)for(const k of ['atk','dodge','sun','moon','ult']){const c=H.btn[k];if(c&&c.r)scr.push([c.x-c.r-6,c.y-c.r-6,c.x+c.r+6,c.y+c.r+6]);}
    for(const c of H.ports)if(c&&c.r)scr.push([c.x-c.r-4,c.y-c.r-4,c.x+c.r+40,c.y+c.r+4]);
    for(const n of m.npcs){if(!ids.some(i=>n.id.startsWith(i)))continue;const x=H.ox+n.x*H.scale,y=H.oy+n.y*H.scale,r=12*H.scale;
      for(const [a,b,c,e] of scr)if(x+r>a&&x-r<c&&y+r*0.6>b&&y-r*1.4<e)out.push(n.id);}return [...new Set(out)];},ids);
const SPOIL=/Mercy|Tomas|bmother|holy water|silver cup|Demiurge|Lucas|Horaios|Archive|fountain/i;
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
// ── before the Chapter 1 clear: both locked by story
await load(save(0));
ok(await st('agnes_handmade')==='locked_by_story'&&await st('bram_bread')==='locked_by_story','before the Chapter 1 clear both stories are story-locked');
await go('hesper');ok(!(await E(()=>__sf.m().npcs.some(n=>n.id==='look.bakery.after'))),'the bakery window keeps its Festival text');
// ── after the clear
await load(save(1));const s0=await S();
ok(await st('agnes_handmade')==='undiscovered'&&await st('bram_bread')==='undiscovered','after the clear both are undiscovered (nothing in the Journal yet)');
// Agnes is not offered until the workbench has been used
let r=await interact('h_agnes');ok(!r.lines.some(l=>/maintenance/.test(l))&&await st('agnes_handmade')==='undiscovered','Agnes does not offer her story before the workbench is used');
// Bram: discovered by the bakery window at St. Hesper's
await go('hesper');r=await interact('look.bakery.after');ok(r.lines.some(l=>/Bram would know/.test(l))&&await st('bram_bread')==='available','the bakery window at St. Hesper’s discovers Bram’s story');
ok(await E(()=>!!__sf.qplaces().tower),'and marks the Clock Tower');
await go('tower');ok(await mark('h_bram')==='!','Bram has a "!"');
r=await interact('h_bram');ok(r.lines.some(l=>/cardamom|Sweet/i.test(l))&&await st('bram_bread')==='active','Bram offers his story and it starts');
let text=r.lines.slice();
// Agnes: the workbench discovers her story
await interact('tower.bench');await p.waitForTimeout(300);ok(await E(()=>__sf.st())==='title','the workbench still opens Builds');
await E(()=>__sf.mxBegin());await p.waitForTimeout(900);await go('tower');
ok(await st('agnes_handmade')==='available'&&await mark('h_agnes')==='!','after using the workbench Agnes’s story is found ("!" on Agnes)');
r=await interact('h_agnes');text=text.concat(r.lines);ok(await st('agnes_handmade')==='active'&&await step('agnes_handmade')==='gather','Agnes offers her story and it starts');
// ── gathering for both, interleaved (any order)
ok(await E(()=>{const P=__sf.qplaces();return P.market&&P.ashlane&&P.hesper;}),'the Market Ring, Ash Lane and St. Hesper’s are marked');
await go('ashlane');ok(await mark('laundress')==='!','the laundress has a "!"');
r=await interact('laundress');text=text.concat(r.lines);r=await interact('ashlane.spice');text=text.concat(r.lines);
ok(await E(()=>__sf.mx().items.ag_thread&&__sf.mx().items.br_spice),'waxed thread from the laundress, cardamom from the shop step');
await go('market');r=await interact('rosa');text=text.concat(r.lines);r=await interact('fish');text=text.concat(r.lines);
ok(await E(()=>__sf.mx().items.br_flour&&__sf.mx().items.ag_rings),'flour from Rosa, brass rings from the fish vendor');
ok(/\(2 \/ 3\)/.test(await E(()=>__sf.goal())),'the objective bar counts the gathered items ('+await E(()=>__sf.goal())+')');
// reload mid-story
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
ok(await step('agnes_handmade')==='gather'&&await step('bram_bread')==='gather'&&await E(()=>__sf.mx().items.ag_rings&&__sf.mx().items.br_flour),'a reload keeps both stories on the same step with the same items');
{const hb=await (async()=>{await go('market');return hudHits(['market.leather']);})();ok(hb.length===0,'the leather offcut is clear of the HUD'+(hb.length?': '+hb:''));}
await go('ashlane');{const hb=await hudHits(['ashlane.spice']);ok(hb.length===0,'the cardamom tin is clear of the HUD'+(hb.length?': '+hb:''));}
await go('market');const rc0=await E(()=>__sf.recs());r=await interact('market.leather');text=text.concat(r.lines);ok(await step('agnes_handmade')==='make','the leather offcut completes Agnes’s list');
ok(!(await E(()=>__sf.m().npcs.find(n=>n.id==='market.leather').hide())===false),'the offcut disappears once taken');
ok(await E(()=>__sf.recs())===rc0,'quest objects are not counted as records');
await go('hesper');r=await interact('agathe');text=text.concat(r.lines);ok(await step('bram_bread')==='bake','honey from Sister Agathe completes Bram’s list');
// ── Agnes: assembly at the workbench (a wrong answer keeps you there, "Leave it" keeps the step)
await go('tower');ok(await mark('tower.bench')==='!','the workbench has a "!"');
await interact('tower.bench');ok(await p.locator('.pzl-o').count()===3,'the workbench opens Agnes’s assembly');
await pick(0);ok(await E(()=>/Measure twice/.test(document.body.textContent)),'a wrong step gets Agnes’s correction');
await p.locator('.pzl .btn.ghost').click();await p.waitForTimeout(300);ok(await step('agnes_handmade')==='make','leaving the puzzle keeps the step');
await interact('tower.bench');await pick(1);await pick(0);await pick(1);await p.waitForTimeout(400);
ok(await step('agnes_handmade')==='test','the sling is finished');
// ── Bram: bake in order (a wrong order resets)
const sts=await E(()=>__sf.m().npcs.filter(n=>/^bake\./.test(n.id)).map(n=>n.id));ok(sts.length===4,'four bake stations appear on the roof');
{const hb=await hudHits(['bake.','tower.']);ok(hb.length===0,'bake stations, workbench and board are clear of the HUD and touch controls'+(hb.length?': '+hb.join(','):''));}
await interact('bake.flour');await interact('bake.rest');ok(await E(()=>(__sf.m().lit||[]).length)===0,'out of order resets the bake');
for(const c of ['flour','knead','rest','oven'])await interact('bake.'+c);ok(await step('bram_bread')==='defend','in Gran’s order the bread goes in');
await p.screenshot({path:`out/ab_${mode}_bake.png`});
// ── fights from the hideout, then the endings
r=await interact('h_agnes');text=text.concat(r.lines);ok(await winFight(),'Agnes’s test is a real fight');
ok(await E(()=>__sf.mx().at)==='tower'&&await step('agnes_handmade')==='end','after winning, back on the tower');
r=await interact('h_bram');text=text.concat(r.lines);ok(await winFight(),'Bram’s defence is a real fight');ok(await step('bram_bread')==='end','after winning, back on the tower');
const k0=(await S()).keep,d0=(await S()).dust,f0=(await S()).frags.length;
await interact('h_bram');ok(await scene(),'Bram’s ending is a scene');let s=await S();
ok(s.mx.q.bram_bread.s==='done'&&s.bonds.bram===1&&s.dust===d0+40&&s.mx.mem['rec.bram']&&s.story['bram.recipe'],'Bram’s story completes: Bond +1, 40 Stardust, Gran’s recipe');
await interact('h_agnes');ok(await scene(),'Agnes’s ending is a scene');s=await S();
ok(s.mx.q.agnes_handmade.s==='done'&&s.bonds.ines===1&&s.keep===k0+1&&s.frags.length>=f0+1&&s.mx.mem['rec.agnes']&&s.story['agnes.crafted'],'Agnes’s story completes: Bond +1, Keepsake, Fragment, practice piece');
// ── once only
const d1=s.dust;await E(()=>{__sf.qstart('agnes_handmade');__sf.qstart('bram_bread');__sf.qtick();});
r=await interact('h_agnes');r=await interact('h_bram');s=await S();ok(s.dust===d1&&s.bonds.ines===1&&s.bonds.bram===1&&!/maintenance|cardamom/i.test(r.lines.join(' ')),'finished stories are not offered or paid again');
// ── Journal
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
const jt=await E(()=>document.body.textContent);ok(/A Little Something Handmade/.test(jt)&&/Gran’s recipe/.test(jt)&&/Agnes’s practice piece/.test(jt),'both stories and keepsakes are in the Journal');
await p.screenshot({path:`out/ab_${mode}_journal.png`});
// ── canon: the stories' own text
const src=await E(()=>JSON.stringify([__sf.mxQ.agnes_handmade,__sf.mxQ.bram_bread])+__sf.src());
const bad=(src+text.join(' ')).match(SPOIL);ok(!bad,'no Mercy, Tomas, mother, Lucas or Chapter 2 material in either story'+(bad?' ('+(src+' || '+text.join(' | ')).match(new RegExp('.{60}'+bad[0]+'.{30}'))+')':''));
ok(/grandmother|gran/i.test(src)&&/Eastern Rift/.test(src),'Bram’s grandmother is an addition (his mother is untouched); Agnes keeps the Eastern Rift wording');
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/ab_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
