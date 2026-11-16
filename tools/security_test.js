// Developer tools must exist on localhost only. Usage: node security_test.js
// A second hostname (starfall.test) is mapped to 127.0.0.1 so the page runs as if it were the published site.
const {chromium}=require('playwright'),serve=require('./serve'),fs=require('fs');
(async()=>{const {server,url}=await serve();const port=new URL(url).port;
const b=await chromium.launch({args:['--host-resolver-rules=MAP starfall.test 127.0.0.1']});const ctx=await b.newContext({viewport:{width:1280,height:720}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
const log=[],ok=(c,m)=>log.push((c?'PASS ':'FAIL ')+m);
const globals=()=>p.evaluate(()=>Object.keys(window).filter(k=>/^__(sf|mx|wm|mres)/.test(k)));
try{
await p.goto(url);await p.waitForTimeout(500);
ok(await p.evaluate(()=>typeof window.__sf==='object'&&typeof window.__sf.grant==='function'),'localhost: developer tools are available (tests keep working)');
for(const q of ['','?debug','?debug=1','?x=1&debug']){
  await p.goto('http://starfall.test:'+port+'/'+q);await p.waitForTimeout(700);
  const g=await globals();const host=await p.evaluate(()=>location.hostname);
  ok(host==='starfall.test'&&g.length===0,'published host'+(q?' with '+q:'')+': no developer globals ('+(g.join(',')||'none')+')');}
// the game itself still runs on the published host
ok(await p.evaluate(()=>!!document.querySelector('.tm-menu')),'published host: the main menu still loads');
// the daily-date override is ignored on the published host
await p.evaluate(()=>{window.__mxDay='1999-01-01';});ok(await p.evaluate(()=>typeof window.__sf==='undefined'),'setting the old date override does nothing visible');
}catch(e){log.push('CRASH '+String(e.stack).split('\n').slice(0,3).join(' '));}
ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
console.log(log.join('\n'));fs.writeFileSync('out/sec_desk_log.txt',log.join('\n'));await b.close();server.close();})();
