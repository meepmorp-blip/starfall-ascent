// Renders tools/enemy_concepts/sheets.html → docs/art/ch1_enemies/<id>.png (concept references only)
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname,out=path.join(__dirname,'..','..','docs','art','ch1_enemies');
(async()=>{const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.statusCode=404;return r.end();}r.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.json')?'application/json':'image/png');fs.createReadStream(f).pipe(r);}).listen(5481);
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:5481/sheets.html');await p.waitForTimeout(400);
 const keys=process.argv[2]?process.argv[2].split(','):await p.evaluate(()=>window.KEYS);
 for(const k of keys){await p.evaluate(k=>window.render(k),k);await p.waitForTimeout(150);await (await p.$('#cv')).screenshot({path:path.join(out,k+'.png')});console.log('ok',k);}
 if(errs.length)console.log('ERR',errs);await b.close();srv.close();})();
