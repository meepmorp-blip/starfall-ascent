// Visual / UX tour: opens every major screen at several sizes, saves a screenshot of each and runs layout checks
// (clipped text, things off screen, tiny text, low contrast, small touch targets, overlapping buttons, overlays with no way out).
// Usage: node ux_tour.js [label] [onlyScreenSubstring] [onlySize]   → tools/out/ux_<label>/<screen>-<size>.png + report.json
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),serve=require('./serve');
const label=process.argv[2]||'latest',only=process.argv[3]||'',onlySize=process.argv[4]||'';
const out=path.join(__dirname,'out','ux_'+label);fs.mkdirSync(out,{recursive:true});
const SIZES={desk:{width:1280,height:720,dpr:1},hd:{width:1920,height:1080,dpr:1},phone:{width:844,height:390,dpr:2,touch:1},small:{width:667,height:375,dpr:2,touch:1},ipad:{width:1180,height:820,dpr:2,touch:1}};
const W=ms=>new Promise(r=>setTimeout(r,ms));
// a rich test save: Chapter 1 cleared, levels, bonds, fragments from the game's own reward code (added in setup)
const SAVE=()=>({v:2,chars:{},frags:[],dust:640,nextId:1,keep:6,claims:{},bonds:{ines:3,bram:2,noemi:4,theo:1,cass:2,dess:1,lucan:3},ch1Clears:1,
  ch1b:{i:50,k:'Scene 14#9',roster:['kairos','ines','bram','noemi','theo','cass','dess'],flags:{},done:1},story:{'oldchapel.found':1,'annex.found':1},
  mx:{v:1,at:'market',seen:{market:1,plaza:1,yard:1,chapel:1,ward:1,hesper:1,ashlane:1,tower:1,office:1,oldchapel:1,annex:1},talk:{},found:{},q:{streets:{s:'done',n:2},glasses:{s:'done',n:2}},items:{},f:{streetsTold:1,glassesBack:1}}});
// in-page helpers
const H=`window.__ux={
  click(t,sel){const L=[...document.querySelectorAll(sel||'#overlay button, #overlay [role=button], .tm-item, .bm-card, .choice')].filter(b=>b.offsetParent);const b=L.find(b=>b.textContent.replace(/\\s+/g,' ').includes(t));if(b){b.click();return true;}return false;},
  async talk(id){const m=__sf.m();const n=m&&m.npcs.find(o=>o.id===id);if(!n)return false;for(const [dx,dy] of [[-22,6],[22,6],[0,24],[0,-24]]){const p=__sf.p();p.x=n.x+dx;p.y=n.y+dy;await new Promise(r=>setTimeout(r,140));if(__sf.m().near&&__sf.m().near.id===id)break;}
    dispatchEvent(new KeyboardEvent('keydown',{code:'KeyF',key:'f'}));await new Promise(r=>setTimeout(r,60));dispatchEvent(new KeyboardEvent('keyup',{code:'KeyF',key:'f'}));await new Promise(r=>setTimeout(r,350));return true;},
  async seqTo(test){const q=__sf.ch1seq();const i=q.findIndex(test);const s=__sf.save();s.ch1b={i,k:null,roster:['kairos','ines','bram','noemi','theo','lucan','cass','dess'],flags:{}};s.ch1Clears=0;__sf.ch1(false);await new Promise(r=>setTimeout(r,900));return i;}
};`;
const SCREENS=[
  // title and main menus
  ['title',async()=>{}],
  ['title-backup-reminder',async()=>{},{first:Date.now()-20*864e5}],
  ['story-menu',async()=>{__ux.click('Story');}],
  ['builds-fragments',async()=>{__ux.click('Builds');}],
  ['builds-skills',async()=>{__ux.click('Builds');await W(300);__ux.click('Skills');}],
  ['builds-level',async()=>{__ux.click('Builds');await W(300);__ux.click('Level & milestones');}],
  ['builds-backup',async()=>{__ux.click('Builds');await W(300);__ux.click('Backup');}],
  ['backup-bad-code',async()=>{__ux.click('Builds');await W(300);__ux.click('Backup');await W(300);const t=document.querySelector('#overlay textarea, #overlay input[type=text]');if(t){t.value='SFA1-not-a-real-code';t.dispatchEvent(new Event('input',{bubbles:true}));}__ux.click('Restore');}],
  ['guide-start',async()=>{__ux.click('Guide');}],
  ['guide-controls',async()=>{__ux.click('Guide');await W(250);__ux.click('Controls','#overlay button');}],
  ['guide-team',async()=>{__ux.click('Guide');await W(250);__ux.click('Team','#overlay button');}],
  ['guide-characters',async()=>{__ux.click('Guide');await W(250);__ux.click('Characters','#overlay button');}],
  ['guide-vices',async()=>{__ux.click('Guide');await W(250);__ux.click('Vices','#overlay button');}],
  ['training',async()=>{__ux.click('Training');}],
  ['party-select',async()=>{__ux.click('Battle');}],
  ['battle-rifts',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');}],
  ['battle-horaios',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');await W(300);__ux.click('Horaios','#overlay button');}],
  ['battle-trials',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');await W(300);__ux.click('Trials','#overlay button');}],
  ['battle-climb',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');await W(300);__ux.click('Climb','#overlay button');}],
  // Meridian
  ['meridian-menu',async()=>{__ux.click('Meridian');}],
  ['worldmap-menu',async()=>{__ux.click('Meridian');await W(300);__ux.click('World map');}],
  ['journal-quests',async()=>{__ux.click('Meridian');await W(300);__ux.click('Journal');}],
  ['journal-stories',async()=>{__ux.click('Meridian');await W(300);__ux.click('Journal');await W(300);__ux.click('Stories','#overlay button');}],
  ['journal-records',async()=>{__ux.click('Meridian');await W(300);__ux.click('Journal');await W(300);__ux.click('Records','#overlay button');}],
  ['journal-map',async()=>{__ux.click('Meridian');await W(300);__ux.click('Journal');await W(300);__ux.click('Map','#overlay button');}],
  ['renown',async()=>{__ux.click('Meridian');await W(300);__ux.click('Renown');},{renown:1}],
  ['hub-market',async()=>{__sf.mxBegin();await W(1500);}],
  ['hub-tower-marks',async()=>{__sf.mxGo('tower');await W(1500);},{hub:1}],
  ['hub-dialogue',async()=>{__sf.mxGo('market');await W(1000);await __ux.talk('rosa');},{hub:1}],
  ['hub-offer',async()=>{__sf.mxGo('tower');await W(1000);await __ux.talk('h_bram');for(let i=0;i<12&&__sf.st()==='dialog';i++){dispatchEvent(new KeyboardEvent('keydown',{code:'Space',key:' '}));await W(90);}},{hub:1}],
  ['hub-puzzle',async()=>{__sf.mxGo('tower');await W(1000);await __ux.talk('tower.bench');},{hub:1,agnes:1}],
  ['hub-pause',async()=>{__sf.mxGo('market');await W(1000);dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));},{hub:1}],
  ['hub-pause-map',async()=>{__sf.mxGo('market');await W(1000);dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));await W(300);__ux.click('World map');},{hub:1}],
  // fights
  ['fight-hud',async()=>{__sf.mission('garrison',['kairos','ines','bram']);await W(2500);}],
  ['fight-pause',async()=>{__sf.mission('garrison',['kairos','ines','bram']);await W(1800);dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'}));}],
  ['rift-hud',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');await W(300);const c=document.querySelector('.bm-card');if(c)c.click();await W(2800);}],
  ['rift-result-win',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');await W(300);const c=document.querySelector('.bm-card');if(c)c.click();await W(2200);for(let i=0;i<30&&__sf.st()==='play';i++){__sf.kill();await W(500);}await W(2600);}],
  ['rift-result-lose',async()=>{__ux.click('Battle');await W(300);__ux.click('Choose a stage');await W(300);const c=document.querySelector('.bm-card');if(c)c.click();await W(2200);__sf.lose();await W(3200);}],
  // Chapter 1 presentation (no story changes: just looking)
  ['ch1-cutscene',async()=>{__sf.ch1(true);await W(1200);for(let i=0;i<4;i++){__sf.cutNext();await W(120);}}],
  ['ch1-choice',async()=>{__sf.ch1(true);await W(800);for(let i=0;i<120&&!document.querySelector('.cchoice');i++){__sf.cutNext();await W(25);}}],
  ['ch1-join',async()=>{await __ux.seqTo(s=>s.join);}],
  ['ch1-pick3',async()=>{await __ux.seqTo(s=>s.mission==='lucia');}],
  ['ch1-bond',async()=>{await __ux.seqTo(s=>s.bond);}],
  ['ch1-mission-failed',async()=>{await __ux.seqTo(s=>s.mission==='garrison');await W(1500);__sf.lose();await W(3000);}],
  ['ch1-end',async()=>{const s=__sf.save();s.ch1b={i:__sf.ch1seq().length,k:null,roster:['kairos','ines','bram','noemi','theo','lucan','cass','dess'],flags:{}};s.ch1Clears=0;__sf.ch1(false);await W(1200);}],
];
// layout checks, run in the page after each screen
const CHECK=()=>{const vw=innerWidth,vh=innerHeight,touch=matchMedia('(pointer:coarse)').matches,ov=document.getElementById('overlay');const R=[];
  const vis=e=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return false;const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&+s.opacity>0.05;};
  const txt=e=>(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50);
  const scrollAnc=e=>{for(let a=e.parentElement;a;a=a.parentElement){const s=getComputedStyle(a);if(/(auto|scroll)/.test(s.overflowY+s.overflowX)&&(a.scrollHeight>a.clientHeight+2||a.scrollWidth>a.clientWidth+2))return a;}return null;};
  const all=[...document.querySelectorAll('#overlay *, .tm *, .title-card *, #toast *, .bk-remind *')].filter(vis);
  // clipped text: content wider than its box while overflow hides it
  for(const e of all){const s=getComputedStyle(e);if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    if((s.overflowX==='hidden'||s.overflowX==='clip'||s.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+2)R.push(['clipped',txt(e)]);
    if((s.overflowY==='hidden'||s.overflowY==='clip')&&e.scrollHeight>e.clientHeight+3&&s.webkitLineClamp==='none')R.push(['clipped-v',txt(e)]);}
  // off screen (and not reachable by scrolling)
  for(const e of all.filter(e=>/^(BUTTON|A|INPUT|TEXTAREA|SELECT|LABEL)$/.test(e.tagName)||e.getAttribute('role')==='button')){const r=e.getBoundingClientRect();
    if((r.right>vw+1||r.left<-1||r.bottom>vh+1||r.top<-1)&&!scrollAnc(e)&&!(document.scrollingElement.scrollHeight>vh+2))R.push(['offscreen',txt(e)+' @'+[r.left,r.top,r.right,r.bottom].map(Math.round)]);}
  // content spilling out of its panel (panel not scrollable): e.g. a title riding over the top border
  for(const pnl of [...document.querySelectorAll('#overlay .ss, #overlay .form, #overlay .pz, #overlay .wm, #overlay .vr, #overlay .bm')].filter(vis)){
    const ps=getComputedStyle(pnl);if(/(auto|scroll|hidden)/.test(ps.overflowY))continue;const pr=pnl.getBoundingClientRect();
    for(const e of pnl.querySelectorAll('h1,h2,h3,p,button,.eyebrow,nav')){if(!vis(e)||scrollAnc(e))continue; // reachable by scrollingconst r=e.getBoundingClientRect();
      if(r.top<pr.top-2||r.bottom>pr.bottom+2){R.push(['spill',(pnl.className.split(' ')[0])+': '+txt(e).slice(0,30)+' ('+Math.round(r.top-pr.top)+'/'+Math.round(pr.bottom-r.bottom)+')']);break;}}}
  // the overlay (or page) wider than the screen: it scrolls sideways and panels look cut at the edge
  if(ov&&!ov.hidden&&ov.scrollWidth>ov.clientWidth+1)R.push(['h-overflow','overlay '+ov.scrollWidth+' > '+ov.clientWidth]);
  if(document.scrollingElement.scrollWidth>vw+1)R.push(['h-overflow','page '+document.scrollingElement.scrollWidth+' > '+vw]);
  // tiny text
  const tiny=new Set();for(const e of all){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<10.5)tiny.add(Math.round(f*10)/10+'px:'+txt(e).slice(0,30));}
  for(const t of tiny)R.push(['tiny',t]);
  // contrast against the first solid background behind the text
  const rgb=c=>{const m=c.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0];};const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);};
  for(const e of all){if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2))continue;const s=getComputedStyle(e),fg=rgb(s.color);if(fg[3]!==undefined&&fg[3]<0.3)continue;
    let bg=null;for(let a=e;a;a=a.parentElement){const t=getComputedStyle(a);if(t.backgroundImage&&t.backgroundImage!=='none'){bg=null;break;}const c=rgb(t.backgroundColor);if(c.length<4||c[3]>0.85){bg=c;break;}}
    if(!bg)continue;const L1=lum(fg),L2=lum(bg),cr=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);const big=parseFloat(s.fontSize)>=18||(parseFloat(s.fontSize)>=14&&+s.fontWeight>=700);
    if(cr<(big?3:4.5)*0.78)R.push(['contrast',cr.toFixed(2)+':'+txt(e).slice(0,30)]);}
  // dark-on-dark: inside the dark-reskinned panels (.form/.vault/.gwrap) --paper is the dark background colour,
  // so text coloured var(--paper) turns invisible unless something light sits behind it
  for(const e of all){if(!e.closest('.form,.vault,.gwrap'))continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1))continue;
    if(getComputedStyle(e).color!=='rgb(21, 17, 27)')continue;let light=false;for(let a=e;a;a=a.parentElement){const t=getComputedStyle(a);const c=rgb(t.backgroundColor);
      if(t.backgroundImage&&t.backgroundImage!=='none'&&!/gradient/.test(t.backgroundImage)){light=true;break;}if(c.length<4||c[3]>0.5){light=lum(c)>0.35;break;}}
    if(!light)R.push(['dark-on-dark',txt(e)]);}
  // touch targets and overlapping buttons
  const B=all.filter(e=>(e.tagName==='BUTTON'||e.getAttribute('role')==='button'||e.tagName==='INPUT'&&e.type!=='hidden')&&!e.closest('button:not(:scope)'));
  if(touch)for(const e of B){const r=e.getBoundingClientRect();if(Math.min(r.width,r.height)<30)R.push(['small-target',Math.round(r.width)+'×'+Math.round(r.height)+':'+txt(e)]);}
  for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){if(B[i].contains(B[j])||B[j].contains(B[i]))continue;const a=B[i].getBoundingClientRect(),b=B[j].getBoundingClientRect();
    const ix=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),iy=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));if(ix*iy>0.2*Math.min(a.width*a.height,b.width*b.height))R.push(['overlap',txt(B[i])+' ⟂ '+txt(B[j])]);}
  // an overlay with no visible way back
  if(ov&&!ov.hidden){const exits=[...ov.querySelectorAll('[data-back], button')].filter(vis).filter(b=>b.hasAttribute('data-back')||/Back|Close|Cancel|Resume|Continue|Done|Skip|Menu|Retry|Quit|Home|OK|Got it|Later/i.test(b.textContent));
    if(!exits.length&&!document.querySelector('.dlg-wrap, .cut-wrap'))R.push(['no-exit','overlay has no Back/Close']);}
  return R;};
(async()=>{const {server,url}=await serve();const browser=await chromium.launch();const report={};
  for(const [sn,s] of Object.entries(SIZES)){if(onlySize&&sn!==onlySize)continue;
    const ctx=await browser.newContext({viewport:{width:s.width,height:s.height},deviceScaleFactor:s.dpr,hasTouch:!!s.touch,isMobile:!!s.touch});
    for(const [name,fn,opt] of SCREENS){if(only&&!name.includes(only))continue;
      const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>errs.push(e.message));
      await page.goto(url);await page.evaluate(([sv,o])=>{localStorage.clear();localStorage.setItem('starfall-ascent-prefs',JSON.stringify(Object.assign({music:0,sfx:0,tutDone:1,guideSeen:1,tipsSeen:['move','attack','swap','sun','moon','ult']},o.first?{firstPlayAt:o.first}:{})));if(o.renown){for(const q of ['agnes_handmade','bram_bread','lark_couldnt_save','cass_prayer'])sv.mx.q[q]={s:'done',n:9};}
        if(o.agnes){sv.mx.q.agnes_handmade={s:'active',n:1,at:1};sv.mx.qseen={agnes_handmade:1};}
        for(const id of ['kairos','ines','bram','noemi','theo','lucan','cass','dess'])sv.chars[id]={xp:30,lvl:{kairos:9,ines:7,bram:6,noemi:8,theo:5,lucan:6,cass:4,dess:3}[id],slots:{sun:null,moon:null,rising:null}};
        localStorage.setItem('starfall-ascent-save',JSON.stringify(sv));},[SAVE(),opt||{}]);
      await page.reload();await page.waitForTimeout(500);await page.addScriptTag({content:H});
      await page.evaluate(()=>{for(let i=0;i<6;i++)__sf.grant({frag:i%2?'star':'trial'},'ux:f'+i);}).catch(()=>{});
      if(opt&&opt.hub){await page.evaluate(()=>__sf.mxBegin());await page.waitForTimeout(900);}
      try{await page.evaluate(`(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));await (${fn.toString()})();})()`);}catch(e){errs.push('step: '+e.message.split('\n')[0]);}
      await page.waitForTimeout(700);
      const f=path.join(out,name+'-'+sn+'.png');await page.screenshot({path:f});
      const R=await page.evaluate(CHECK).catch(e=>[['check-error',e.message]]);
      report[name+'-'+sn]={issues:R,errors:errs};
      console.log((errs.length?'ERR ':R.length?'chk ':'ok  ')+name+'-'+sn+(R.length?'  '+R.length+' findings':'')+(errs.length?'  '+errs[0]:''));await page.close();}
    await ctx.close();}
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,1));await browser.close();server.close();})();
