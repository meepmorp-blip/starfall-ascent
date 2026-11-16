// Stage 7a · six world side quests (The Morning After, Names on Paper, Sunday Cups, The Festival We Forgot, The Missing Page, Beyond the Wall). Usage: node side_quests_test.js [phone|small]
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
const save=(clear)=>({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},bonds:{},ch1Clears:clear?1:0,ch1b:{i:50,k:clear?'Scene 14#9':'Scene 9#2',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:clear?1:0},
  mx:{v:1,at:'tower',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
const load=async sv=>{await E(sv=>localStorage.setItem('starfall-ascent-save',JSON.stringify(sv)),sv);await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);};
const reachable=ids=>E(ids=>{const m=__sf.m(),B=__sf.bounds(),r=12,step=6;const free=(x,y)=>{if(x<B[0]+r||x>B[2]-r||y<B[1]+r||y>B[3]-r)return false;
    for(const s of m.solids){if(s.w){const nx=Math.max(s.x,Math.min(x,s.x+s.w)),ny=Math.max(s.y,Math.min(y,s.y+s.h));if(Math.hypot(x-nx,y-ny)<r)return false;}else if(Math.hypot(x-s.x,y-s.y)<s.r+r*0.8)return false;}return true;};
  const cols=Math.ceil((B[2]-B[0])/step),rows=Math.ceil((B[3]-B[1])/step),seen=new Uint8Array(cols*rows),q=[];const pl=__sf.p();let c0=Math.round((pl.x-B[0])/step),r0=Math.round((pl.y-B[1])/step);
  if(!free(B[0]+c0*step,B[1]+r0*step)){outer:for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(free(B[0]+c*step,B[1]+rr*step)&&Math.hypot(c-c0,rr-r0)<6){c0=c;r0=rr;break outer;}}
  q.push([c0,r0]);seen[r0*cols+c0]=1;
  while(q.length){const [c,rr]=q.pop();for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){const nc=c+dc,nr=rr+dr;if(nc<0||nr<0||nc>=cols||nr>=rows||seen[nr*cols+nc])continue;if(!free(B[0]+nc*step,B[1]+nr*step))continue;seen[nr*cols+nc]=1;q.push([nc,nr]);}}
  const can=(x,y)=>{for(let rr=0;rr<rows;rr++)for(let c=0;c<cols;c++)if(seen[rr*cols+c]&&Math.hypot(B[0]+c*step-x,B[1]+rr*step-y)<44)return true;return false;};
  return m.npcs.filter(n=>ids.includes(n.id)).filter(n=>!can(n.x,n.y)).map(n=>n.id);},ids);
const SQIDS=['side_morning_after','side_names_paper','side_sunday_cups','side_festival_forgot','side_missing_page','side_beyond_wall'];
const NEW={plaza:['hanne','plaza.watch','plaza.sketch','plaza.mp'],office:['pim','ambrose','office.ledger'],ashlane:['ivo'],market:['market.tile'],yard:['yard.whistle'],chapel:['chapel.mp'],hesper:['hesper.mp','look.festbox']};
const SPOIL=/Mercy|holy water|the water|silver cup|\bdrink|Demiurge|Lucas|Horaios|Archive|Unbound|Hollow Choir|photograph/i;
let text=[];const talk=async id=>{const r=await interact(id);text=text.concat(r.lines);return r;};
try{
await p.goto(url);await E(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0.01,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));});
await load(save(0));ok(await E(ids=>ids.every(id=>__sf.qstate(id)==='locked_by_story'),SQIDS),'before the Chapter 1 clear all six are story-locked');
await go('plaza');ok(!(await E(()=>__sf.m().npcs.some(n=>n.id==='hanne'))),'the new townsfolk only arrive after Chapter 1');
await load(save(1));ok(await E(ids=>ids.every(id=>__sf.qstate(id)==='undiscovered'),SQIDS),'after the clear all six are undiscovered (not in the Journal)');
// ── placement: every new person and object is reachable and clear of the HUD
const place=[];for(const d in NEW){await go(d);await E(ids=>{for(const n of __sf.m().npcs)if(ids.includes(n.id)&&n.hide)n._h=n.hide,n.hide=()=>false;},NEW[d]);
  const miss=await E(ids=>ids.filter(i=>!__sf.m().npcs.some(n=>n.id===i)),NEW[d]);const hb=await hudHits(NEW[d]);const rc=await reachable(NEW[d]);place.push(...miss.map(x=>'missing '+x),...hb.map(x=>'hud '+x),...rc.map(x=>'unreachable '+x));}
ok(place.length===0,'all new townsfolk and quest objects are placed, reachable and clear of the HUD'+(place.length?': '+place.join(', '):''));
// ── discovery: givers show "!" and offer when spoken to (no menu)
await go('plaza');ok(await mark('hanne')==='!','Old Hanne has a "!"');await talk('hanne');ok(await st('side_morning_after')==='active','talking to Hanne starts The Morning After');
await go('office');ok(await mark('pim')==='!'&&await mark('ambrose')==='!','Pim and Mr. Ambrose have a "!"');await talk('pim');await talk('ambrose');
ok(await st('side_names_paper')==='active'&&await st('side_missing_page')==='active','both start');
await go('market');await talk('rosa');ok(await st('side_sunday_cups')==='active','Rosa starts Sunday Cups');
await go('ashlane');await talk('ivo');ok(await st('side_beyond_wall')==='active','Ivo starts Beyond the Wall');
// Sister Agathe only offers after the box is found
await go('hesper');let r=await talk('agathe');ok(await st('side_festival_forgot')==='undiscovered','Sister Agathe does not offer before the box is found');
r=await talk('look.festbox');ok(await st('side_festival_forgot')==='available','the box of old decorations finds the story');await talk('agathe');ok(await st('side_festival_forgot')==='active','then Sister Agathe offers it');
ok(await E(()=>{const P=__sf.qplaces();return P.plaza&&P.market&&P.yard&&P.office&&P.chapel&&P.ashlane&&P.tower&&P.ward;}),'markers point to every district with something to do');
// ── interleaved: walk the city once, doing pieces of all six
await go('hesper');await talk('hesper.mp');ok(await step('side_missing_page')==='s1','the box behind the step is not there yet (the trail starts at the Cloister)');
await go('chapel');await talk('chapel.mp');ok(await step('side_missing_page')==='s2','under the sundial: the trail goes on to St. Hesper’s');
await talk('sister');await talk('believer');ok(await E(()=>__sf.mx().f.np_bapt&&__sf.mx().f.sc_believer),'the Sister gives the baptism copy; the woman in the line “lets things go”');
await go('hesper');await talk('hesper.mp');ok(await step('side_missing_page')==='s3','the tin box: forwarded to the plaque');
await go('market');await talk('market.tile');await talk('matteo');await talk('fish');ok(await E(()=>__sf.mx().items.ma_tile&&__sf.mx().f.sc_matteo&&__sf.mx().f.sc_fish&&__sf.mx().f.bw_coin===undefined),'the tile; Matteo and the fish vendor answer Rosa’s question first');
r=await talk('fish');ok(await E(()=>__sf.mx().f.bw_coin===1),'a second word with the fish vendor about Ivo’s coin');
await go('yard');await talk('yard.whistle');
await go('plaza');await talk('plaza.watch');await talk('plaza.mp');await talk('lseller');await talk('fwoman');await talk('plaza.sketch');
ok(await step('side_morning_after')==='tell'&&await step('side_missing_page')==='back','Hanne’s three things found; the page trail ends at the plaque');
await p.reload();await p.waitForTimeout(600);await E(()=>__sf.mxBegin());await p.waitForTimeout(900);
ok(await E(()=>__sf.mx().items.ff_sketch&&__sf.mx().f.ff_fwoman&&__sf.mx().f.mp_s3),'a reload keeps everything found so far');
// Hanne's puzzle
await go('plaza');await talk('hanne');ok(await p.locator('.pzl-o').count()===3,'Hanne asks you to put the night in order');
await pick(0);ok(await E(()=>/Look at the watch/.test(document.body.textContent)),'the wrong order gets her hint');await pick(1);await pick(0);await pick(1);await p.waitForTimeout(400);
ok(await st('side_morning_after')==='completed','The Morning After is complete');
await go('ward');await talk('nurse');
await go('ashlane');await talk('laundress');
await go('tower');await talk('h_agnes');await talk('h_theo');ok(await E(()=>__sf.mx().f.bw_map&&__sf.mx().f.bw_stone),'Agnes reads the map; Theo the stone');
await go('office');await talk('office.ledger');await talk('pim');await pick(1);await pick(0);await pick(0);await p.waitForTimeout(400);ok(await st('side_names_paper')==='completed','Names on Paper: someone rewrote Ada Venn’s Moon');
await talk('ambrose');ok(await st('side_missing_page')==='completed','The Missing Page: only the heading survives');
await go('market');await talk('rosa');await pick(1);await p.waitForTimeout(400);ok(await st('side_sunday_cups')==='completed','Sunday Cups: the fish vendor, who works Sundays, remembered everything');
await go('hesper');await talk('agathe');ok(await st('side_festival_forgot')==='completed','The Festival We Forgot: the Festival of Names');
await go('ashlane');await talk('ivo');ok(await st('side_beyond_wall')==='completed','Beyond the Wall: liar or traveller');
let s=await S();
ok(SQIDS.every(id=>s.claims['mxq:'+id])&&['rec.ma','rec.np','rec.sc','rec.ff','rec.mp','rec.bw'].every(k=>s.mx.mem[k])&&['side.morning','side.names','side.cups','side.festival','side.page','side.wall'].every(k=>s.story[k]),'all six pay once and add their Journal keepsakes and story flags');
const d1=s.dust;await E(ids=>{for(const id of ids)__sf.qstart(id);__sf.qtick();},SQIDS);await go('plaza');r=await talk('hanne');
ok((await S()).dust===d1&&!/Find them for me/.test(r.lines.join(' '))&&r.lines.some(l=>/candle/.test(l)),'finished quests are not offered or paid again; Hanne has a new line');
// ── Journal, canon
await E(()=>__sf.mxMenu());await p.waitForTimeout(300);await E(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Journal/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
await E(()=>{const b=[...document.querySelectorAll('.mx-tabs button')].find(b=>/Stories/.test(b.textContent));if(b)b.click();});await p.waitForTimeout(300);
const jt=await E(()=>document.body.textContent);ok(['The Morning After','Names on Paper','Sunday Cups','The Festival We Forgot','The Missing Page','Beyond the Wall'].every(t=>jt.includes(t))&&/World story/i.test(jt),'all six are in the Journal as world stories');
await p.screenshot({path:`out/sq_${mode}_journal.png`});
const src=await E(()=>__sf.sq());const all=src+' '+text.join(' ');const bad=all.match(SPOIL)||all.match(/\bKeepers\b/);
ok(!bad,'no Mercy, water, drinking, Chapter 2 material, faction names or photographs'+(bad?' ('+all.match(new RegExp('.{50}'+bad[0]+'.{20}'))+')':''));
ok(/liar or a traveller/.test(src)&&/Doesn’t make it a lie/.test(src),'the traveller stays unreliable');
ok(/sketch/.test(src)&&!/photo/i.test(src),'old pictures are sketches');
// ── priorities: a quest in progress comes before offering a new one
{const sv=save(1);sv.mx.q.bram_bread={s:'active',n:0,at:1};sv.mx.qseen={bram_bread:1};await load(sv);await go('market');const r1=await talk('rosa');
 ok(await E(()=>!!__sf.mx().items.br_flour)&&await st('side_sunday_cups')==='undiscovered'&&r1.lines.some(l=>/flour/i.test(l)),'Rosa hands over Bram’s flour before offering Sunday Cups');
 const r2=await talk('rosa');ok(await st('side_sunday_cups')==='active','and offers Sunday Cups on the next word');
 await go('ward');const r3=await talk('nurse');ok(await E(()=>!!__sf.mx().q.rounds),'with no side quest on, the nurse still offers Rounds as before');}
}catch(e){log.push('CRASH '+String(e.stack).split(String.fromCharCode(10)).slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync(`out/sq_${mode}_log.txt`,log.join('\n'));await b.close();server.close();})();
