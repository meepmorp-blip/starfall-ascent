// Walks Naomi (as lead) up, down, left and right in two real fights and screenshots each direction.
const {chromium}=require('playwright'),serve=require('./serve');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const errs=[];
 const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true,tips:false})));
 await p.goto(url);await p.waitForTimeout(600);const out=[];
 for(const stage of ['rift_dust','rift_fire']){
  await p.evaluate(s=>{__sf.battle(['noemi','kairos','bram'],s,0,{tier:1});},stage);await p.waitForTimeout(1500);
  for(const [dir,key] of [['down','KeyS'],['up','KeyW'],['left','KeyA'],['right','KeyD']]){
   await p.evaluate(()=>{__sf.god&&__sf.god();__sf.en().forEach(e=>e.dead=true);const q=__sf.p();q.x=400;q.y=220;});
   await p.keyboard.down(key);await p.waitForTimeout(350);await p.keyboard.up(key);await p.waitForTimeout(120);
   const q=await p.evaluate(()=>{const q=__sf.p();return {id:q.id,fx:q.fx,fy:q.fy,face:q.face};});
   await p.screenshot({path:'out/nw_'+stage+'_'+dir+'.png'});out.push(stage+' '+dir+' '+q.id+' fx='+q.fx.toFixed(2)+' fy='+q.fy.toFixed(2)+' face='+q.face);}}
 console.log(out.join('\n'));if(errs.length)console.log('ERR',errs[0]);await b.close();server.close();})();
