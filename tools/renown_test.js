// Renown ranks: the top rank needs the post-Chapter 1 content; old claims stay. Usage: node renown_test.js
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);const E=(f,a)=>p.evaluate(f,a);
try{
await p.goto(url);
const fill=(phase)=>E(phase=>{const s=__sf.save(),x=__sf.mx();const pre=['market','plaza','yard','chapel','ward','hesper','office','ashlane'],post=['tower','oldchapel','annex'];
  for(const d of pre)x.seen[d]=1;for(const f of __sf.mxFinds)if(!f.quest&&!f.act&&!post.includes(f.at))x.found[f.id]=1;
  for(const id in __sf.mxQ){const Q=__sf.mxQ[id];if(['main','optional'].includes(Q.kind))x.q[id]={s:'done',n:9};}
  for(const k of ['act:drill','act:sundial','act:pages','act:hideseek','act:folders','act:oddities','sec:market.alcove','sec:ward.hatch'])s.claims[k]=1;
  if(phase==='all'){for(const d of post)x.seen[d]=1;for(const f of __sf.mxFinds)if(!f.quest&&!f.act)x.found[f.id]=1;for(const id in __sf.mxQ)if(__sf.mxQ[id].kind!=='hangout')x.q[id]={s:'done',n:9};}
  if(phase==='half'){for(const d of post)x.seen[d]=1;for(const id of ['agnes_handmade','bram_bread','side_morning_after','side_names_paper','side_sunday_cups','lucas_mem_bread'])x.q[id]={s:'done',n:9};}
  return __sf.renown();},phase);
await E(()=>{localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1}));localStorage.removeItem('starfall-ascent-save');});await p.reload();await p.waitForTimeout(500);
let [n,rk]=await fill('pre');ok(rk===5&&n<340,'everything before the Chapter 1 clear: rank 5 of 8, not the top ('+n+' Renown)');
[n,rk]=await fill('half');ok(rk>=6&&rk<8,'part of the post-Chapter 1 stories: rank '+rk+' ('+n+')');
[n,rk]=await fill('all');ok(rk===8&&n>=570,'everything before Chapter 2: rank 8, the top ('+n+')');
// claims: old ranks stay claimed, new ranks pay once
await E(()=>{const s=__sf.save();for(let i=1;i<=5;i++)s.claims['renown:'+i]=1;});
ok(await E(()=>__sf.renown()[2])===3,'a player who claimed ranks 1–5 has exactly the 3 new rewards to claim');
const d0=await E(()=>__sf.save().dust);await E(()=>__sf.grant({keep:3,dust:120},'renown:6'));await E(()=>__sf.grant({keep:3,dust:120},'renown:6'));
ok(await E(()=>__sf.save().dust)===d0+120,'a rank reward pays once');
await E(()=>{__sf.mxMenu();});await p.waitForTimeout(300);await p.locator('.tm-item',{hasText:'Renown'}).click();await p.waitForTimeout(300);
ok(await E(()=>/Rank 8 · max/.test(document.body.textContent)),'the Renown screen shows rank 8 of 8');await p.screenshot({path:'out/renown_desk.png'});
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync('out/renown_desk_log.txt',log.join('\n'));await b.close();server.close();})();
