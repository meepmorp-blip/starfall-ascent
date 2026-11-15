// Visual QA for the idle animations: Party Setup and Builds, desktop and phone-landscape, all eight characters.
const {chromium}=require('playwright'),serve=require('./serve');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const out=[];
for(const [name,vp,touch] of [['desk',{width:1280,height:720},false],['phone',{width:844,height:390},true]]){
  const ctx=await b.newContext({viewport:vp,hasTouch:touch,isMobile:touch,deviceScaleFactor:touch?2:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(url);await p.waitForTimeout(600);
  await p.evaluate(()=>__sf.party());await p.waitForTimeout(700);await p.screenshot({path:`out/idle_${name}_party1.png`});
  await p.waitForTimeout(2300);await p.screenshot({path:`out/idle_${name}_party2.png`});
  // interactions still work while animating: swap a roster character into slot 1
  await p.locator('.ps-chip').nth(4).click();await p.waitForTimeout(300);await p.screenshot({path:`out/idle_${name}_party3.png`});
  await p.evaluate(()=>__sf.builds());await p.waitForTimeout(500);
  const n=await p.locator('.bv-tabs .tab').count();
  for(let i=0;i<n;i++){await p.locator('.bv-tabs .tab').nth(i).click();if(i===1){await p.waitForTimeout(90);await p.screenshot({path:`out/idle_${name}_enter.png`});}
    await p.waitForTimeout(450);await p.screenshot({path:`out/idle_${name}_b${i}.png`});}
  const cost=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=360;c.height=420;const g=c.getContext('2d');const t0=performance.now();
    for(let i=0;i<400;i++)for(const id of ['kairos','bram','cass','dess'])__sf.idle(g,id,180,330,{scale:9,t:i*0.05,seed:0});return (performance.now()-t0)/1600;});
  out.push(name+' tabs='+n+' ms/draw='+cost.toFixed(3)+' errors='+(errs.join('|')||'none'));await ctx.close();}
console.log(out.join('\n'));await b.close();server.close();})();
