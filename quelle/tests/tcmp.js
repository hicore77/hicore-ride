// usage: F=file Q=query OUT=name POST='js after build' node tcmp.js
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-webgpu']});
 const p=await b.newPage({viewport:{width:800,height:450}}); const errs=[];
 p.on('pageerror',e=>errs.push('PE '+e.message)); p.on('console',m=>{ if(/error|warn/.test(m.type()) && !/GPU stall|ReadPixels/.test(m.text())) errs.push(m.text().slice(0,300)); });
 await p.goto('file://'+process.cwd()+'/'+(process.env.F||'gpu/index.html')+(process.env.Q||''));
 await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:120000});
 const W=process.env.W||'insel';
 await p.evaluate(W=>{ let a=12345; Math.random=()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; selWorld=W; buildWorld(WORLDS.find(w=>w.id===W)); if(window.gpuFixInst) gpuFixInst(scene); builtWorld=W; $('bSim').click(); },W);
 if (process.env.POST) await p.evaluate(e=>eval(e), process.env.POST);
 await p.waitForFunction(()=>FRN>=(+window.__N||4),null,{timeout:300000}).catch(()=>errs.push('timeout frames'));
 await p.screenshot({path:(process.env.OUT||'c')+'.jpg',quality:85,timeout:240000});
 console.log([...new Set(errs)].slice(0,20).join('\n')||'no errors'); await b.close(); })();
