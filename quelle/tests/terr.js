const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,500))); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text().slice(0,300)); });
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForTimeout(40000); console.log(errs.join('\n')||'none'); await b.close(); })();
