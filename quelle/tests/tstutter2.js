// 0.21.0: Nachlade-Ruckler ohne Bildaufbau messen: Kamera fährt die Strecke in 8-m-Schritten ab (ca. 30 km/h bei 60 FPS = 0,14 m/Bild, hier je Schritt ein "Bild"),
// je Schritt laufen die normalen Streaming-/LOD-Funktionen wie in der Hauptschleife. Gemessen: Dauer je Funktion, Schritte über 8/16 ms, was dabei lief.
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:480,height:320}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 if (process.env.PRE) await p.addInitScript(process.env.PRE);
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r=await p.evaluate(async([L,ST])=>{ POST.render=()=>{}; const R={f:{}, steps:[]}; let cur=null;
   ['gtForestLOD','gtForestRange','gtHouseStep','gtStep','gtFinish','gtMask','gtForestGen','fvFill','fvCellGen','kcTick','updateTreeLOD','gtwSet','gtwDrop','gtFoDrop','gtImpNew','impFin'].forEach(n=>{ const o=window[n]; if (typeof o!=='function') return; window[n]=function(){ const t=performance.now(); const r=o.apply(this,arguments); const d=performance.now()-t; const e=R.f[n]||(R.f[n]={n:0,sum:0,max:0,big:0}); e.n++; e.sum+=d; if (d>e.max) e.max=d; if (d>8) e.big++; if (cur && d>2) cur.push(n+':'+d.toFixed(1)); return r; }; });
   const d0=S.dist||0, out=[]; for (let s=0; s<L; s+=ST){ const q=posAt(d0+s); camera.position.set(q.x,q.y+2,q.z); cur=[]; const t=performance.now();
     updateTreeLOD(camera.position); kcTick(camera.position); gtStream(camera.position); if (FV.on) fvStep(camera.position);
     const d=performance.now()-t; R.steps.push(d); if (d>12) out.push(Math.round(s)+'m '+d.toFixed(1)+'ms '+cur.join(' ')); await new Promise(r=>setTimeout(r,4)); }
   const st=R.steps.slice().sort((a,b)=>a-b), q=k=>+st[Math.floor(st.length*k)].toFixed(1); const f={}; for (const n in R.f){ const e=R.f[n]; f[n]={n:e.n, avg:+(e.sum/e.n).toFixed(2), max:+e.max.toFixed(1), ueber8:e.big}; }
   return {schritte:st.length, p50:q(0.5), p90:q(0.9), p99:q(0.99), max:+st[st.length-1].toFixed(1), ueber12:out.length, spitzen:out.slice(0,40), f}; }, [+(process.env.LEN||4000), +(process.env.STEP||8)]);
 console.log(JSON.stringify(r,null,1)); await b.close(); })();
