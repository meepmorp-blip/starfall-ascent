// Image generation through Google Gemini. The key is read from the GEMINI_API_KEY environment variable and is never written anywhere.
// Usage: node imagegen.js "<prompt>" <out.png> [reference1.png reference2.png ...]
//   Reference images keep a character or style consistent (for example a sprite exported by sprites.js).
//   Model: GEMINI_IMAGE_MODEL environment variable, default gemini-2.5-flash-image.
// Check the key works without generating anything: node imagegen.js --check
const fs=require('fs'),path=require('path');
const key=process.env.GEMINI_API_KEY,model=process.env.GEMINI_IMAGE_MODEL||'gemini-2.5-flash-image';
const base='https://generativelanguage.googleapis.com/v1beta/';
const STYLE='Original pixel art for a top-down action RPG. Chunky readable pixels, limited palette, dark night-city mood with warm gold light. No text, no watermark, no logos.';
(async()=>{
  if(!key){console.error('GEMINI_API_KEY is not set. See docs/tooling/STARFALL_MCP_AND_CONNECTORS.md');process.exit(2);}
  const a=process.argv.slice(2);
  if(a[0]==='--check'){
    const r=await fetch(base+'models?pageSize=200',{headers:{'x-goog-api-key':key}});const j=await r.json();
    if(!r.ok){console.error('Key check failed:',r.status,j.error&&j.error.message);process.exit(1);}
    const img=(j.models||[]).map(m=>m.name.replace('models/','')).filter(n=>/image|imagen/i.test(n));
    console.log('Key works. Image-capable models on this account:',img.join(', ')||'(none listed)');return;}
  const [prompt,out,...refs]=a;if(!prompt||!out){console.error('Usage: node imagegen.js "<prompt>" <out.png> [refs...]');process.exit(2);}
  const parts=[{text:STYLE+'\n\n'+prompt}];
  for(const f of refs)parts.push({inlineData:{mimeType:'image/png',data:fs.readFileSync(f).toString('base64')}});
  const r=await fetch(base+'models/'+model+':generateContent',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseModalities:['TEXT','IMAGE']}})});
  const j=await r.json();
  if(!r.ok){console.error('Generation failed:',r.status,j.error&&j.error.message);process.exit(1);}
  const p=((j.candidates||[])[0]||{}).content;const im=p&&p.parts.find(x=>x.inlineData);
  if(!im){console.error('No image came back.',JSON.stringify(j).slice(0,300));process.exit(1);}
  fs.mkdirSync(path.dirname(path.resolve(out)),{recursive:true});fs.writeFileSync(out,Buffer.from(im.inlineData.data,'base64'));
  console.log('saved',out,'('+model+')');
})();
