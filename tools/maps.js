// Exports every district map (painted background + baked mood, no characters) so environment art can be reviewed side by side.
// Usage: node maps.js [label] [theme]   -> tools/out/<label>/map-<theme>.png  and  tools/out/<label>/maps-sheet.png
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),serve=require('./serve');
const label=process.argv[2]||'maps',only=process.argv[3],out=path.join(__dirname,'out',label);fs.mkdirSync(out,{recursive:true});
(async()=>{
  const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(url);await p.waitForTimeout(600);
  const themes=(await p.evaluate(()=>__sf.themes())).filter(t=>!only||t===only);
  for(const t of themes){const d=await p.evaluate(t=>__sf.themeShot(t,2),t);fs.writeFileSync(path.join(out,'map-'+t+'.png'),Buffer.from(d.split(',')[1],'base64'));console.log('ok  map-'+t);}
  if(!only){const d=await p.evaluate(async ts=>{const im=[];for(const t of ts){const i=new Image();i.src=__sf.themeShot(t,1);await i.decode();im.push(i);}
      const cols=3,w=im[0].width,h=im[0].height,rows=Math.ceil(im.length/cols),c=document.createElement('canvas');c.width=cols*w;c.height=rows*(h+18);const g=c.getContext('2d');g.fillStyle='#0D0B14';g.fillRect(0,0,c.width,c.height);
      im.forEach((i,k)=>{const x=(k%cols)*w,y=Math.floor(k/cols)*(h+18);g.drawImage(i,x,y+18);g.fillStyle='#FFE6A3';g.font='bold 13px sans-serif';g.fillText(ts[k],x+6,y+13);});return c.toDataURL('image/jpeg',0.85);},themes);
    fs.writeFileSync(path.join(out,'maps-sheet.jpg'),Buffer.from(d.split(',')[1],'base64'));console.log('ok  maps-sheet');}
  if(errs.length)console.log('ERR',errs[0]);
  await b.close();server.close();
})();
