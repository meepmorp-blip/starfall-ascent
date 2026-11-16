// Runs the Playwright tests in parallel, each on its own port. Prints one line per run and a summary.
//   node run_tests.js                 full suite (every test, every screen size)
//   node run_tests.js quick           the quest tests + polish, every screen size (about a third of the full suite)
//   node run_tests.js bond_cass polish   only these tests (names without _test.js), every screen size they support
// Options: --jobs N (parallel runs, default 6) · --modes desk,phone (limit screen sizes)
const {spawn}=require('child_process'),fs=require('fs'),path=require('path');
const ALL=['desk','phone','small'],DP=['desk','phone'];
// [name, file, screen sizes]
const SUITE=[
  ['security','security_test.js',['desk']],['save_protection','save_protection_test.js',['desk','phone']],['fugitive','fugitive_test.js',['desk','phone']],['map_consistency','map_consistency_test.js',['desk','phone','small']],['indicators','indicators_test.js',['desk','phone','small']],['post_story','post_story_test.js',['desk','phone','small']],['bond','bond_test.js',['desk','phone']],['renown','renown_test.js',['desk']],['story_battles','story_battles_test.js',['desk','phone']],['qa_probe','qa_probe_test.js',['desk','phone','small']],['core_probe','core_probe_test.js',['desk','phone']],['practice_modes','practice_modes_test.js',['desk','phone','small']],  ['bond_dess','bond_dess_test.js',ALL],['chapel_quests','chapel_quests_test.js',ALL],['side_quests','side_quests_test.js',ALL],['bond_lucas','bond_lucas_test.js',ALL],['bond_cass','bond_cass_test.js',ALL],['bond_lark','bond_lark_test.js',ALL],
  ['bond_agnes_bram','bond_agnes_bram_test.js',ALL],['quest_system','quest_system_test.js',ALL],['narrative_foundation','narrative_foundation_test.js',ALL],
  ['ashlane','ashlane_test.js',ALL],['office','office_test.js',ALL],['hesper','hesper_test.js',ALL],['worldmap','worldmap_test.js',ALL],['polish','exploration_polish_test.js',ALL],
  ['exploration','exploration_test.js',DP],['meridian','meridian_playtest.js',DP],['economy','economy_test.js',DP]];
const QUICK=['security','save_protection','fugitive','map_consistency','indicators','post_story','bond','renown','story_battles','qa_probe','practice_modes','bond_dess','chapel_quests','side_quests','bond_lucas','bond_cass','bond_lark','bond_agnes_bram','quest_system','narrative_foundation','polish'];
const args=process.argv.slice(2);let jobs=6,modes=null;const names=[];
for(let i=0;i<args.length;i++){if(args[i]==='--jobs')jobs=+args[++i];else if(args[i]==='--modes')modes=args[++i].split(',');else names.push(args[i]);}
const pick=names.length===0?SUITE.map(s=>s[0]):names[0]==='quick'?QUICK.concat(names.slice(1)):names;
const unknown=pick.filter(n=>!SUITE.some(s=>s[0]===n));if(unknown.length){console.error('Unknown test(s): '+unknown.join(', ')+'\nKnown: '+SUITE.map(s=>s[0]).join(', '));process.exit(2);}
const runs=[];for(const [n,f,ms] of SUITE)if(pick.includes(n))for(const m of ms)if(!modes||modes.includes(m))runs.push({n,f,m});
const t0=Date.now(),res=[];let next=0,slot=0;
const runOne=(cmd,argv,port)=>new Promise(ok=>{const p=spawn(process.execPath,[cmd,...argv],{cwd:__dirname,env:Object.assign({},process.env,{SF_PORT:String(port)})});let out='';
  p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);p.on('close',code=>ok({out,code}));});
(async()=>{
  // chest spots first (it checks every district at five screen sizes)
  if(names.length===0||names[0]==='quick'){const r=await runOne('chest_spots.js',['check'],5300);const good=/ALL SPOTS OK/.test(r.out);res.push({label:'chest_spots check',pass:good?1:0,fail:good?0:1,bad:good?[]:r.out.trim().split('\n').slice(0,6)});
    console.log((good?'ok   ':'FAIL ')+'chest_spots check');}
  const worker=async port=>{while(next<runs.length){const r=runs[next++],t=Date.now();const o=await runOne(r.f,[r.m],port);
      const pass=(o.out.match(/^PASS /gm)||[]).length,bad=o.out.split('\n').filter(l=>/^(FAIL|CRASH) /.test(l)||/EADDRINUSE|Error:/.test(l)).slice(0,5);
      const fail=bad.length||(pass===0?1:0);res.push({label:r.n+' '+r.m,pass,fail,bad});
      console.log((fail?'FAIL ':'ok   ')+(r.n+' '+r.m).padEnd(30)+String(pass).padStart(3)+' passed  '+Math.round((Date.now()-t)/1000)+'s');for(const b of bad)console.log('       '+b.slice(0,220));}};
  await Promise.all(Array.from({length:Math.max(1,Math.min(jobs,runs.length))},(_,i)=>worker(5310+i)));
  const failed=res.filter(r=>r.fail),total=res.reduce((a,r)=>a+r.pass,0),secs=Math.round((Date.now()-t0)/1000);
  const summary=(failed.length?'FAILED: '+failed.map(r=>r.label).join(', '):'ALL PASSED')+' · '+res.length+' runs · '+total+' checks · '+Math.floor(secs/60)+'m '+(secs%60)+'s · '+jobs+' at a time';
  console.log('\n'+summary);fs.writeFileSync(path.join(__dirname,'out','run_tests_summary.txt'),res.map(r=>(r.fail?'FAIL ':'ok   ')+r.label+' '+r.pass+(r.bad.length?'\n  '+r.bad.join('\n  '):'')).join('\n')+'\n\n'+summary+'\n');
  console.log('DONE');process.exit(failed.length?1:0);})();
