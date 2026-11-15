// Resting idle sheet (no action) at Builds scale. Usage: node idle_sheet.js out/name.png id...
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const outp=process.argv[2],ids=process.argv.slice(3);
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(url);await p.waitForTimeout(500);
const d=await p.evaluate((ids)=>{const W=360,H=420;const c=document.createElement('canvas');c.width=W*4;c.height=H*ids.length;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#2A2438';g.fillRect(0,0,c.width,c.height);
  ids.forEach((id,r)=>{const cf=__sf.idleCfg[id];const ts=[1.2,cf.per*0.5,cf.per,cf.blink+0.05];
    ts.forEach((t,i)=>{g.save();g.translate(i*W,r*H);__sf.idle(g,id,180,330,{scale:9,t,seed:0,actF:999});g.restore();});});
  return c.toDataURL();},ids);
fs.writeFileSync(outp,Buffer.from(d.split(',')[1],'base64'));console.log('ok',errs.join('|'));await b.close();server.close();})();
