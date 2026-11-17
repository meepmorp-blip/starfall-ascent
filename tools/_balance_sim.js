// Throwaway audit harness: plays fights with a scripted "decent player" bot at fixed timestep on _sim.html.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const MODE=process.env.MODE||'rifts';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url+(process.env.SIMPAGE||'_sim.html'));await p.waitForTimeout(800);
 await p.evaluate(()=>{
  window.__bot={on:false,swapT:0,dmgIn:0,log:{}};
  const RANGED={ines:380,lucan:360,theo:300,noemi:260,dess:200,cass:150};
  window.__simStep=(dt)=>{const B=__bot;if(!B.on)return;const g=__sim.g();if(g.state!=='play'||!g.player)return;const p=g.player,kit=g.KITS[p.id];
   const live=g.enemies.filter(e=>!e.dead&&e.spawnT<=0);if(g.boss&&!g.boss.dead)live.push(g.boss);
   const o=g.room&&g.room.obj;let t=null,bd=1e9;
   for(const e of live){let d=Math.hypot(e.x-p.x,e.y-p.y);if(o&&B.protect){const dO=Math.hypot(e.x-o.x,e.y-o.y);d=Math.min(d,dO*0.6)+ (e.rt?-80:0);}if(d<bd){bd=d;t=e;}}
   // dodge telegraphs
   let mx=0,my=0;for(const z of g.tels){const d=Math.hypot(p.x-z.x,p.y-z.y);if(d<z.r+p.r+6){mx+=(p.x-z.x)/(d||1);my+=(p.y-z.y)/(d||1);}}
   if(t){const want=RANGED[p.id]||46;const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy)||1;
     if(d>want){mx+=dx/d;my+=dy/d;}else if(d<want*0.5&&want>100){mx-=dx/d;my-=dy/d;}
     p.fx=dx/d;p.fy=dy/d;
     if(p.atkCd<=0&&!p.dash&&d<want+40){B.tapN=(B.tapN||0)+1;if(B.tapN%6===5&&kit.hold)kit.hold(p);else kit.tap(p);}
     if(d<260){if(p.cd.sun<=0)__sim.cast('sun');if(p.cd.moon<=0)__sim.cast('moon');}
     if(g.team.pn>=100)__sim.ult();}
   const m=Math.hypot(mx,my);if(m>0.01){p.x=Math.max(g.AX0+14,Math.min(g.AX1-14,p.x+mx/m*p.speed*dt));p.y=Math.max(g.AY0+14,Math.min(g.AY1-14,p.y+my/m*p.speed*dt));}
   B.swapT+=dt;if(B.swapT>B.swapEvery&&g.team.swapCd<=0){B.swapT=0;const n=g.team.members.length;for(let k=1;k<n;k++){const i=(g.team.ai+k)%n;if(!g.team.members[i].down){__sim.swap(i);break;}}}
  };});
 const run=async(party,id,tier,lvl,opt={})=>p.evaluate(async([party,id,tier,lvl,opt])=>{
   const g0=__sim.g();for(const c of party)g0.save.chars[c].lvl=lvl;
   __sf.battle(party,id,0,{tier});const B=__bot;B.on=true;B.protect=opt.protect!==false;B.swapEvery=opt.swap||7;B.swapT=0;B.tapN=0;
   let t=0,minObj=100,hpLost=0,prev=null,maxAlive=0,rtHits=0;const dt=1/60;
   while(t<240){__sim.tick(30,dt);t+=0.5;const g=__sim.g();
     if(g.state!=='play'){break;}
     const tot=g.team.members.reduce((a,m)=>a+m.hp,0);if(prev!==null&&tot<prev)hpLost+=prev-tot;prev=tot;
     if(g.room.obj)minObj=Math.min(minObj,g.room.obj.hp/g.room.obj.max*100);
     maxAlive=Math.max(maxAlive,g.enemies.filter(e=>!e.dead).length);
     if(opt.trace&&t%2===0)(window.__tr=window.__tr||[]).push([t,g.player.id,g.player.x|0,g.player.y|0,g.player.hp|0,g.player.atkCd.toFixed(2),'iframe',g.player.iframe.toFixed(1),'dodge',g.player.dodgeT.toFixed(1),!!g.player.dash,g.run.kills,g.enemies.filter(e=>!e.dead).map(e=>e.type[0]+(e.x|0)+','+(e.y|0)).join(' ')].join(' '));}
   B.on=false;const g=__sim.g();const st=g.state;const lab=g.T;
   const maxHp=g.team.members.reduce((a,m)=>a+m.maxHp,0);
   const res={t:+t.toFixed(1),end:g.bigStamp?g.bigStamp.text:st,won:(g.run&&g.run.kills)||0,downs:g.team.members.filter(m=>m.down).length,hpLost:Math.round(hpLost/maxHp*100),minObj:Math.round(minObj),maxAlive,
     atk:g.team.members.map(m=>m.id+':'+Math.round(m.atk)+'/'+Math.round(m.maxHp)).join(' ')};
   // read stamp text to know win/loss
   return res;},[party,id,tier,lvl,opt]);
 const stamp=async()=>p.evaluate(()=>{try{return document.title}catch(e){return ''}});
 const out=[];const P={bal:['kairos','ines','bram'],sup:['noemi','theo','dess'],dps:['lucan','cass','ines'],tank:['bram','noemi','cass']};
 const LV=[0,1,6,12];
 if(MODE==='rifts'){
  for(const id of (process.env.RIFTS||'rift_fire,rift_water,rift_air,rift_earth,rift_xp,rift_dust,rift_mastery').split(','))for(const tier of (process.env.TIERS||'1,2,3').split(',').map(Number))for(const pk of Object.keys(P))for(let s=0;s<(+process.env.N||2);s++){
   const r=await run(P[pk],id,tier,LV[tier]);
   const res=await p.evaluate(()=>{const g=__sim.g();return g.room&&g.room.done!==undefined?g.room.done:null;});
   out.push([id,'T'+tier,pk,JSON.stringify(r)].join(' '));console.log(out[out.length-1]);
   await p.evaluate(()=>{__sim.tick(200,1/60);});}
 }
 if(MODE==='trace'){await run(['noemi','theo','dess'],'rift_water',2,6,{trace:1});console.log((await p.evaluate(()=>window.__tr)).join(String.fromCharCode(10)));}
 if(MODE==='cause'){ // who is touching the patients: chasers (rt) or Vices passing through after the player?
  for(const tier of [1,2,3])for(const [pk,prot] of [['bal',true],['bal',false],['dps',true],['dps',false]]){
   await p.evaluate(()=>{window.__c={rt:0,other:0,types:{}};const old=window.__simStep;window.__simStepO=window.__simStepO||old;
     window.__simStep=dt=>{window.__simStepO(dt);const g=__sim.g();const o=g.room&&g.room.obj;if(!o||g.state!=='play')return;
       for(const e of g.enemies)if(!e.dead&&e.spawnT<=0&&Math.hypot(e.x-o.x,e.y-o.y)<o.r+e.r){if(e.rt)__c.rt+=dt;else __c.other+=dt;__c.types[e.type+(e.gen?'(child)':'')]=(__c.types[e.type+(e.gen?'(child)':'')]||0)+dt;}};});
   const r=await run(P[pk],'rift_water',tier,LV[tier],{protect:prot});
   const c=await p.evaluate(()=>window.__c);
   console.log('CAUSE T'+tier,pk,prot?'guard-centre':'fight-freely',r.end,r.t+'s','minObj',r.minObj,'contact-s rt',c.rt.toFixed(1),'non-rt',c.other.toFixed(1),JSON.stringify(Object.fromEntries(Object.entries(c.types).map(([k,v])=>[k,+v.toFixed(1)]))));}
 }
 if(MODE==='dps'){ // solo, Lv6, 20s on stationary dummies: 1 dummy (single target) and 5 clustered (AoE)
  for(const c of ['kairos','ines','bram','noemi','theo','lucan','cass','dess'])for(const n of [1,5]){
   const r=await p.evaluate(([c,n])=>{const g0=__sim.g();g0.save.chars[c].lvl=6;__sf.battle([c],'rift_xp',0,{tier:1});__sim.tick(10,1/60);
     let g=__sim.g();for(const e of g.enemies)e.dead=true;g.room.waveLeft=0;g.room.wave=1;
     const ds=[];for(let i=0;i<n;i++){g.enemies.push({type:'hothead',x:g.player.x+150+(i%3)*22,y:g.player.y+(i-2)*20,kx:0,ky:0,spawnT:0,slowT:0,stunT:0,burnT:0,burnAcc:0,markT:0,anaT:0,ind:0,indT:0,secs:0,noHeal:0,reflCd:0,flash:0,seed:1,dead:false,cd:99,gen:0,split:false,rage:false,st:'walk',partner:null,face:1,r:13,hp:1e6,maxHp:1e6,spd:0,dmg:0,cdmg:0});ds.push(g.enemies[g.enemies.length-1]);}
     __bot.on=true;__bot.protect=false;__bot.swapEvery=999;for(let i=0;i<40;i++){__sim.tick(30,1/60);g=__sim.g();g.player.hp=g.player.maxHp;for(const d of ds){d.dead=false;d.spd=0;d.x=Math.max(d.x,0);}}
     __bot.on=false;const dmg=ds.reduce((a,d)=>a+(1e6-d.hp),0);return {dps:+(dmg/20).toFixed(1),per:+(dmg/20/ds.length).toFixed(1),atk:g.player.atk};},[c,n]);
   console.log('DPS',c,n===1?'single':'5-pack',JSON.stringify(r));}
 }
 if(MODE==='shots'){await p.setViewportSize({width:1280,height:720});
  for(const [id,tier,pk] of [['rift_water',3,'bal'],['rift_fire',3,'bal'],['rift_air',3,'dps']]){
   await p.evaluate(([id,tier,party])=>{const g0=__sim.g();for(const c of party)g0.save.chars[c].lvl=12;__sf.battle(party,id,0,{tier});__bot.on=true;__bot.protect=true;__bot.swapEvery=7;},[id,tier,P[pk]]);
   for(const s of [6,12]){await p.evaluate(n=>{__sim.tick(n,1/60);},s===6?360:360);await p.waitForTimeout(80);await p.screenshot({path:'out/audit_'+id+'_t'+tier+'_'+s+'s.png'});}
   await p.evaluate(()=>{__bot.on=false;});}
 }
 if(MODE==='dps2'){ // dummies pinned in place every tick (no knockback drift); arena-centre placement
  for(const c of (process.env.CHARS||'kairos,ines,bram,noemi,theo,lucan,cass,dess').split(','))for(const n of [1,5]){
   const r=await p.evaluate(([c,n])=>{const g0=__sim.g();g0.save.chars[c].lvl=6;__sf.battle([c],'rift_xp',0,{tier:1});__sim.tick(10,1/60);
     let g=__sim.g();for(const e of g.enemies)e.dead=true;g.room.waveLeft=0;g.room.wave=1;const cx=(g.AX0+g.AX1)/2,cy=(g.AY0+g.AY1)/2;
     const ds=[];for(let i=0;i<n;i++){const e={type:'hothead',x:cx+90+(i%2)*26,y:cy+(i-(n-1)/2)*24,kx:0,ky:0,spawnT:0,slowT:0,stunT:0,burnT:0,burnAcc:0,markT:0,anaT:0,ind:0,indT:0,secs:0,noHeal:0,reflCd:0,flash:0,seed:1,dead:false,cd:99,gen:0,split:false,rage:false,st:'walk',partner:null,face:1,r:13,hp:1e6,maxHp:1e6,spd:0,dmg:0,cdmg:0};e.hx=e.x;e.hy=e.y;g.enemies.push(e);ds.push(e);}
     g.player.x=cx-140;g.player.y=cy;
     __bot.on=true;__bot.protect=false;__bot.swapEvery=999;window.__pin=ds;
     for(let i=0;i<3600;i++){__sim.tick(1,1/60);g=__sim.g();g.player.hp=g.player.maxHp;for(const d of ds){d.dead=false;d.x=d.hx;d.y=d.hy;d.kx=0;d.ky=0;}}
     __bot.on=false;const dmg=ds.reduce((a,d)=>a+(1e6-d.hp),0);return {dps:+(dmg/60).toFixed(1),per:+(dmg/60/ds.length).toFixed(1)};},[c,n]);
   console.log('DPS2',c,n===1?'single':'5-pack',JSON.stringify(r));}
 }
 if(MODE==='ttk'){ // per character: time to kill each enemy type at Lv1/6/12, solo, tier 1 room scale
  for(const c of ['kairos','ines','bram','noemi','theo','lucan','cass','dess'])for(const lvl of [1,6,12]){
   const r=await p.evaluate(([c,lvl])=>{const g0=__sim.g();g0.save.chars[c].lvl=lvl;__sf.battle([c],'rift_earth',0,{tier:1});const g=__sim.g();const pl=g.player;return {atk:+pl.atk.toFixed(1),hp:Math.round(pl.maxHp),def:pl.def};},[c,lvl]);
   console.log('STAT',c,'L'+lvl,JSON.stringify(r));}
 }
 if(errs.length)console.log('ERR',errs.slice(0,3).join(' | '));
 console.log('DONE');await b.close();server.close();})();
