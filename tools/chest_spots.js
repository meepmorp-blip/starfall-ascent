// Finds chest spots that stay clear of solids, people, routes, objects, exits AND the on-screen HUD and touch controls
// at several screen sizes. Prints seven well-spread spots per district. Usage: node chest_spots.js [check]
// With "check", it validates the spots currently in the game instead (used by the test suite).
const {chromium}=require('playwright'),serve=require('./serve');
const VIEWS=[[844,390,1],[667,375,1],[932,430,1],[1024,768,1],[1280,720,0]];
const check=process.argv[2]==='check';
(async()=>{const {server,url}=await serve();const b=await chromium.launch();const res={},bad=[];
for(const [w,h,touch] of VIEWS){
  const ctx=await b.newContext(touch?{viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:2}:{viewport:{width:w,height:h}});const p=await ctx.newPage();
  await p.goto(url);await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack']}));
    localStorage.setItem('starfall-ascent-save',JSON.stringify({v:2,chars:{},frags:[],dust:0,nextId:1,keep:0,claims:{},ch1Clears:1,mx:{v:1,at:'market',seen:{market:1},talk:{},found:{},q:{streets:{s:'active',n:0,at:1}},items:{},f:{}}}));});
  await p.goto(url);await p.waitForTimeout(500);await p.evaluate(()=>__sf.mxBegin());await p.waitForTimeout(700);
  for(const d of ['market','plaza','yard','chapel','ward']){
    await p.evaluate(d=>__sf.mxGo(d),d);await p.waitForTimeout(900);
    const r=await p.evaluate(([d,check])=>{const m=__sf.m(),B=__sf.bounds(),H=__sf.hud(),X=f=>B[0]+(B[2]-B[0])*f,Y=f=>B[1]+(B[3]-B[1])*f;
      const exits={market:['w','e','n','s'],plaza:['w'],yard:['e'],chapel:['s'],ward:['n']}[d];
      const avoid=[];for(const n of m.npcs){if(n.tier)continue;for(const q of (n.pts||[{x:n.x,y:n.y}]))avoid.push([q.x,q.y,n.spot?30:34]);}
      for(const o of m.objs||[])avoid.push([o.x+(o.w||0)/2,o.y+(o.h||0)/2,(o.w?Math.max(o.w,o.h)/2:o.r||8)+26]);
      // the market corner (crate wall) is off limits for daily chests
      const inCorner=(x,y)=>d==='market'&&x<B[0]+110&&y>B[3]-110;
      // screen rectangles that cover the world: objective bar (worst case: 80% wide), title, HP panel, pause, touch buttons, portraits
      const scr=[];const sw=H.sw,sh=H.sh;scr.push([sw*0.1,0,sw*0.9,H.safe.t+74]);scr.push([0,0,H.safe.l+14+Math.min(190,Math.max(130,sw*0.2))+10,H.safe.t+80]);scr.push([sw-H.safe.r-70,0,sw,70]);
      if(H.touch){for(const k of ['atk','dodge','sun','moon','ult']){const c=H.btn[k];if(c&&c.r)scr.push([c.x-c.r-14,c.y-c.r-14,c.x+c.r+14,c.y+c.r+14]);}}
      for(const c of H.ports)if(c&&c.r)scr.push([c.x-c.r-8,c.y-c.r-8,c.x+c.r+60,c.y+c.r+8]);
      const ok=(x,y)=>{const why=[];
        if(x<B[0]+14||x>B[2]-14||y<B[1]+16||y>B[3]-10)why.push('bounds');
        for(const s of m.solids){if(s.w){if(x>s.x-14&&x<s.x+s.w+14&&y>s.y-14&&y<s.y+s.h+14)why.push('box');}else if(Math.hypot(x-s.x,y-s.y)<s.r+16)why.push('solid');}
        for(const [ax,ay,r] of avoid)if(Math.hypot(x-ax,y-ay)<r)why.push('near');
        for(const e of exits){const ex=e==='w'?B[0]:e==='e'?B[2]:X(0.5),ey=e==='n'?B[1]:e==='s'?B[3]:Y(0.55);if(Math.hypot(x-ex,y-ey)<80)why.push('exit '+e);}
        if(inCorner(x,y))why.push('corner');
        const sx0=H.ox+(x-14)*H.scale,sx1=H.ox+(x+14)*H.scale,sy0=H.oy+(y-18)*H.scale,sy1=H.oy+(y+10)*H.scale;
        for(const [a,b2,c2,e2] of scr)if(sx1>a&&sx0<c2&&sy1>b2&&sy0<e2)why.push('hud');
        return why;};
      if(check)return window.__sf_spots[d].map(([fx,fy])=>{const w=ok(X(fx),Y(fy));return w.length?d+' '+fx+','+fy+': '+[...new Set(w)].join('/'):null;}).filter(Boolean);
      const out=[];for(let fx=0.03;fx<0.98;fx+=0.03)for(let fy=0.1;fy<0.96;fy+=0.03)if(!ok(X(fx),Y(fy)).length)out.push((+fx.toFixed(2))+','+(+fy.toFixed(2)));return out;},[d,check]);
    if(check)bad.push(...r.map(x=>x+' @'+w+'x'+h));else{const k=d;res[k]=res[k]?res[k].filter(x=>r.includes(x)):r;}}
  await ctx.close();}
if(check){console.log(bad.length?'BAD\n'+bad.join('\n'):'ALL SPOTS OK');}
else for(const d in res){const pts=res[d].map(s=>s.split(',').map(Number));
  // greedy farthest-point picks, starting from the point nearest a corner
  const pick=[];if(pts.length){pts.sort((a,b)=>Math.min(a[0],1-a[0])+Math.min(a[1],1-a[1])-(Math.min(b[0],1-b[0])+Math.min(b[1],1-b[1])));pick.push(pts[0]);
    while(pick.length<7&&pick.length<pts.length){let best=null,bd=-1;for(const q of pts){const dm=Math.min(...pick.map(r=>Math.hypot((q[0]-r[0])*1.9,q[1]-r[1])));if(dm>bd){bd=dm;best=q;}}pick.push(best);}}
  console.log(d+' ('+pts.length+' valid): '+JSON.stringify(pick));}
await b.close();server.close();})();
