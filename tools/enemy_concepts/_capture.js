// Captures the gameplay backdrops for the concept sheets. Needs a temporary copy of the game (_geo.html) that exposes the screen geometry; create it, run this, then delete it. Not used by the game.
const {chromium}=require('playwright'),serve=require('../serve'),fs=require('fs');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url+'_geo.html');await p.waitForTimeout(700);
 for(const [id,name] of [['rift_earth','yard'],['rift_water','ward']]){
  await p.evaluate(id=>{__sf.battle(['kairos','ines','bram'],id,0,{tier:2});},id);await p.waitForTimeout(5200);
  await p.evaluate(()=>{for(const m of __sf.team().members)m.hp=m.maxHp;});
  const g=await p.evaluate(()=>window.__geo());fs.writeFileSync(__dirname+'/bg_'+name+'.json',JSON.stringify(g));
  await p.screenshot({path:__dirname+'/bg_'+name+'.png'});console.log(name,JSON.stringify({scale:g.scale,ox:g.ox,oy:g.oy,n:g.en.length}));}
 await b.close();server.close();})();
