// Headless screenshots of the real game. Usage: node shots.js [label]
// Writes PNGs to tools/out/<label>/<screen>-<device>.png for desktop, laptop and iPhone landscape.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),serve=require('./serve');
const label=process.argv[2]||'latest',out=path.join(__dirname,'out',label);fs.mkdirSync(out,{recursive:true});
const DEV={desktop:{width:1440,height:810,dpr:1},laptop:{width:1280,height:720,dpr:1},iphone:{width:844,height:390,dpr:2,touch:true}};
// each screen: a name and a function run inside the page (test hooks live on window.__sf, enabled on localhost)
const SCREENS=[
  ['title',async()=>{}],
  ['party',async()=>{[...document.querySelectorAll('.tm-item')].find(b=>/Battle/.test(b.textContent)).click();}],
  ['battle-menu',async()=>{[...document.querySelectorAll('.tm-item')].find(b=>/Battle/.test(b.textContent)).click();await new Promise(r=>setTimeout(r,300));document.querySelector('[data-primary]:not([disabled])').click();}],
  ['builds',async()=>{[...document.querySelectorAll('.tm-item')].find(b=>/Builds/.test(b.textContent)).click();}],
  ['training',async()=>{[...document.querySelectorAll('.tm-item')].find(b=>/Training/.test(b.textContent)).click();}],
  ['fight-rift',async()=>{__sf.battle(['kairos','ines','bram'],'rift_fire',0,{tier:1});await new Promise(r=>setTimeout(r,2500));}],
  ['fight-boss',async()=>{__sf.battle(['kairos','lucan','noemi'],'boss',0,{diff:0});await new Promise(r=>setTimeout(r,3500));}],
  ['pause',async()=>{__sf.battle(['kairos','ines','bram'],'rift_water',0,{tier:1});await new Promise(r=>setTimeout(r,1500));dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));}],
  ['story-cutscene',async()=>{__sf.ch1(true);await new Promise(r=>setTimeout(r,1500));for(let i=0;i<9;i++){__sf.cutNext();await new Promise(r=>setTimeout(r,120));}}],
  ['story-market',async()=>{__sf.ch1(true);await new Promise(r=>setTimeout(r,500));for(let i=0;i<200&&!(__sf.m()&&__sf.m().id==='market');i++){__sf.cutNext();await new Promise(r=>setTimeout(r,10));}await new Promise(r=>setTimeout(r,2500));}],
];
(async()=>{
  const {server,url}=await serve();const browser=await chromium.launch();const only=process.argv[3];
  for(const [dn,d] of Object.entries(DEV)){
    const ctx=await browser.newContext({viewport:{width:d.width,height:d.height},deviceScaleFactor:d.dpr,hasTouch:!!d.touch,isMobile:!!d.touch});
    await ctx.addInitScript(()=>{try{localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:true,guideSeen:true}));}catch(e){}});
    for(const [name,fn] of SCREENS){if(only&&name!==only)continue;
      const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
      await page.goto(url,{waitUntil:'load'});await page.waitForTimeout(700);
      try{await page.evaluate(fn);}catch(e){errs.push('step: '+e.message);}
      await page.waitForTimeout(900);
      const f=path.join(out,name+'-'+dn+'.png');await page.screenshot({path:f});
      console.log((errs.length?'ERR ':'ok  ')+name+'-'+dn+(errs.length?'  '+errs[0]:''));await page.close();}
    await ctx.close();}
  await browser.close();server.close();
})();
