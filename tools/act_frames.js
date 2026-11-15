// Renders every frame of each character's idle action as a contact sheet (out/act_<id>.png). Usage: node act_frames.js id...
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const ids=process.argv.slice(2);
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(url);await p.waitForTimeout(500);
for(const id of ids){const d=await p.evaluate((id)=>{const A=__sf.idleAct[id],W=180,H=200,cols=10,rows=Math.ceil(A.n/cols);const c=document.createElement('canvas');c.width=W*cols;c.height=H*rows;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#1E2030';g.fillRect(0,0,c.width,c.height);
  for(let f=0;f<A.n;f++){g.save();g.translate((f%cols)*W,Math.floor(f/cols)*H);__sf.idle(g,id,85,140,{scale:4.5,t:1.2,seed:0,actF:f});g.fillStyle='#FFE6A3';g.font='12px monospace';g.fillText(String(f+1),6,14);g.restore();}
  return c.toDataURL();},id);
  fs.writeFileSync('out/act_'+id+'.png',Buffer.from(d.split(',')[1],'base64'));}
console.log('ok',errs.join('|')||'no errors');await b.close();server.close();})();
