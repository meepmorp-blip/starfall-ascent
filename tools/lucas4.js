// Exports Kairos in all four views (front, back, left, right), idle and walking, for review.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();await p.goto(url);await p.waitForTimeout(500);
const d=await p.evaluate(async()=>{const S=160,views=[['down',1],['up',1],['side',-1],['side',1]];const c=document.createElement('canvas');c.width=S*4;c.height=S*3;const g=c.getContext('2d');g.fillStyle='#1A1622';g.fillRect(0,0,c.width,c.height);
  const put=async(src,x,y)=>{const i=new Image();i.src=src;await i.decode();g.imageSmoothingEnabled=false;g.drawImage(i,x,y,S,S);};
  for(let i=0;i<4;i++){const [dir,face]=views[i];
    await put(__sf.charPng('lucan',{dir,face,t:0},S),i*S,0);
    await put(__sf.charPng('lucan',{dir,face,t:0,unarmed:true},S),i*S,S);
    await put(__sf.charPng('lucan',{dir,face,moving:true,t:0.1},S),i*S,S*2);}
  return c.toDataURL();});
fs.writeFileSync('out/lucas_4dir.png',Buffer.from(d.split(',')[1],'base64'));console.log('ok');await b.close();server.close();})();
