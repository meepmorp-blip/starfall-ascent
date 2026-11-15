// Walks Kairos up, down, left and right in a real fight and in the Market walk scene, and crops a close-up of him for each direction.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const errs=[];
 const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(600);
 const out=[];
 for(const [scene,setup] of [['fight',async()=>{await p.evaluate(()=>{__sf.battle(['kairos','ines','bram'],'rift_water',0,{tier:1});});await p.waitForTimeout(1500);await p.evaluate(()=>{__sf.god&&__sf.god();__sf.en().forEach(e=>e.dead=true);});}],
   ['market',async()=>{await p.evaluate(async()=>{__sf.ch1(true);for(let i=0;i<300&&!(__sf.m()&&__sf.m().id==='market');i++){__sf.cutNext();await new Promise(r=>setTimeout(r,5));}});await p.waitForTimeout(800);}]]){
  await setup();
  for(const [dir,key] of [['down','KeyS'],['up','KeyW'],['left','KeyA'],['right','KeyD']]){
   await p.evaluate(()=>{const q=__sf.p();q.x=400;q.y=220;});
   await p.keyboard.down(key);await p.waitForTimeout(350);await p.keyboard.up(key);await p.waitForTimeout(120);
   const pos=await p.evaluate(()=>{const q=__sf.p(),r=document.getElementById('game').getBoundingClientRect();return {fx:q.fx,fy:q.fy,face:q.face};});
   const f='out/kw_'+scene+'_'+dir+'.png';
   const box=await p.evaluate(()=>{const q=__sf.p(),cv=document.getElementById('game');const W=cv.clientWidth,H=cv.clientHeight;
     // world to screen using the same letterbox maths as the game
     return {W,H};});
   await p.screenshot({path:f});out.push(scene+' '+dir+' fx='+pos.fx.toFixed(2)+' fy='+pos.fy.toFixed(2)+' face='+pos.face);
  }}
 console.log(out.join('\n'));if(errs.length)console.log('ERR',errs[0]);await b.close();server.close();})();
