// Idle pose sheet at Builds-screen scale. Rows: characters. Cols: resting, gesture A, gesture B, blink. Usage: node idle_sheet.js out/name.png id...
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const outp=process.argv[2],ids=process.argv.slice(3);
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(url);await p.waitForTimeout(500);
const d=await p.evaluate((ids)=>{const W=360,H=420;const c=document.createElement('canvas');c.width=W*4;c.height=H*ids.length;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#2A2438';g.fillRect(0,0,c.width,c.height);
  ids.forEach((id,r)=>{const cf=__sf.idleCfg[id];const mid=n=>n*cf.every+0.5*cf.len-cf.every*0.55;
    const rest=mid(2)+cf.len+0.4,ts=[rest,mid(2),mid(3),Math.ceil((mid(3)+cf.len+1)/cf.blink)*cf.blink+0.05];
    ts.forEach((t,i)=>{g.save();g.translate(i*W,r*H);__sf.idle(g,id,180,330,{scale:9,t,seed:0});g.restore();});});
  return c.toDataURL();},ids);
fs.writeFileSync(outp,Buffer.from(d.split(',')[1],'base64'));console.log('ok',errs.join('|'));await b.close();server.close();})();
