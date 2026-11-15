// All eight idle actions side by side, as frames for a GIF (out/actgif/fNNN.png). Each character loops its own action.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const ids=['kairos','ines','bram','noemi','theo','lucan','cass','dess'];
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();await p.goto(url);await p.waitForTimeout(500);
fs.mkdirSync('out/actgif',{recursive:true});
const fr=await p.evaluate((ids)=>{const W=150,H=170,out=[];const c=document.createElement('canvas');c.width=W*4;c.height=H*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  for(let k=0;k<72;k++){g.fillStyle='#1E2030';g.fillRect(0,0,c.width,c.height);
    ids.forEach((id,i)=>{const n=__sf.idleAct[id].n,f=k<n?k:-1;g.save();g.translate((i%4)*W,Math.floor(i/4)*H);
      __sf.idle(g,id,72,118,{scale:3.8,t:1.2+k/12,seed:0,actF:f<0?999:f});g.restore();});
    out.push(c.toDataURL());}
  return out;},ids);
fr.forEach((d,i)=>fs.writeFileSync('out/actgif/f'+String(i).padStart(3,'0')+'.png',Buffer.from(d.split(',')[1],'base64')));
console.log('ok',fr.length);await b.close();server.close();})();
