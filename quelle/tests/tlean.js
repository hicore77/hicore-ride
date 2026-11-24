// 0.16.1: Kurvenneigung/Lenkeinschlag numerisch: fährt mit 10 m/s über die Hauptrunde, meldet max. Neigung/Lenkwinkel und Werte in der engsten Kurve
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:640,height:360}}); await require('./serve')(ctx);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 const r=await p.evaluate(async()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); const D=gnData(); const R=gnRG(); const main=gRoute(R.loop.map(([e,dir])=>({e,dir})),''); NET={main,cur:main,graph:true,appl:new Set(),rc:{'':main}}; setRoute(main);
   const fake={g:new THREE.Group(), wF:new THREE.Group()}; let mx=0, ms=0, at=null; const t0=performance.now(); let d=500; const out=[];
   for (let i=0;i<400;i++){ await new Promise(r=>setTimeout(r,20)); const now=performance.now(); d+=10*0.02; d=500+(now-t0)/1000*10; curveLean(fake,d,false); if (Math.abs(fake.cl)>Math.abs(mx)){ mx=fake.cl; ms=fake.cst; at=Math.round(d); } if (i%40===0) out.push([Math.round(d), +(fake.cl*57.3).toFixed(1), +(fake.cst*57.3).toFixed(1), +(fake._clv||0).toFixed(1)]); }
   return {maxLeanDeg:+(mx*57.3).toFixed(1), steerDeg:+(ms*57.3).toFixed(1), at, out}; });
 console.log(JSON.stringify(r)); console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
