// Close-up face sheet: rows = characters, cols = front, back, left, right (head area enlarged). Usage: node faces.js out/name.png id1 id2 ...
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
const outp=process.argv[2],ids=process.argv.slice(3);
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();await p.goto(url);await p.waitForTimeout(500);
const d=await p.evaluate(async(ids)=>{const S=480,C=200,views=[['down',1],['up',1],['side',-1],['side',1]];const c=document.createElement('canvas');c.width=C*4;c.height=C*ids.length;const g=c.getContext('2d');g.fillStyle='#4A4458';g.fillRect(0,0,c.width,c.height);g.imageSmoothingEnabled=false;
  for(let r=0;r<ids.length;r++)for(let i=0;i<4;i++){const [dir,face]=views[i];const im=new Image();im.src=__sf.charPng(ids[r],{dir,face,t:0,unarmed:true},S);await im.decode();
    g.drawImage(im,S/2-C/2,S*0.2,C,C,i*C,r*C,C,C);}
  return c.toDataURL();},ids);
fs.writeFileSync(outp,Buffer.from(d.split(',')[1],'base64'));console.log('ok');await b.close();server.close();})();
