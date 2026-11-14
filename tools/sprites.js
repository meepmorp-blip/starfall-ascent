// Exports sprite sheets straight from the game's own drawing code (so they always match what players see).
// Usage: node sprites.js [frameSize]   -> tools/out/sprites/<id>_walk.png (8 frames), <id>_idle.png (4 frames), vices.png
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),serve=require('./serve');
const size=+process.argv[2]||96,out=path.join(__dirname,'out','sprites');fs.mkdirSync(out,{recursive:true});
(async()=>{
  const {server,url}=await serve();const b=await chromium.launch();const p=await b.newPage();await p.goto(url);await p.waitForTimeout(600);
  const ids=await p.evaluate(()=>__sf.ids());
  const sheet=async(name,frames)=>{
    const data=await p.evaluate(async({frames,size})=>{const c=document.createElement('canvas');c.width=size*frames.length;c.height=size;const g=c.getContext('2d');
      for(let i=0;i<frames.length;i++){const im=new Image();im.src=frames[i];await im.decode();g.drawImage(im,i*size,0,size,size);}return c.toDataURL();},{frames,size});
    fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(data.split(',')[1],'base64'));console.log('ok ',name,frames.length+' frames');};
  for(const id of ids.chars){
    await sheet(id+'_walk',await p.evaluate(({id,size})=>Array.from({length:8},(_,i)=>__sf.charPng(id,{moving:true,t:i/8*0.8},size)),{id,size}));
    await sheet(id+'_idle',await p.evaluate(({id,size})=>Array.from({length:4},(_,i)=>__sf.charPng(id,{t:i/4*1.6},size)),{id,size}));}
  await sheet('vices',(await p.evaluate(ks=>ks.map(k=>__sf.vicePng(k)),ids.vices)).filter(Boolean));
  await b.close();server.close();
})();
