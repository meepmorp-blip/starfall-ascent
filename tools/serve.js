// Tiny static server for the game folder. Usage: node serve.js [port]
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),port=+process.argv[2]||5190;
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.css':'text/css','.md':'text/plain; charset=utf-8'};
module.exports=()=>new Promise(res=>{const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);if(!f.startsWith(root)||!fs.existsSync(f)){r.statusCode=404;r.end('404');return;}
  r.setHeader('Content-Type',T[path.extname(f)]||'application/octet-stream');r.setHeader('Cache-Control','no-store');fs.createReadStream(f).pipe(r);}).listen(port,'127.0.0.1',()=>res({server:s,url:'http://localhost:'+port+'/'}));});
if(require.main===module)module.exports().then(o=>console.log('Serving',root,'at',o.url));
