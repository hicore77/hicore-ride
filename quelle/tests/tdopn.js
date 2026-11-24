// Zählt, wie viele DOP-Bäume die Filter (Straße, Fels, Weg, Haus) im Jonsdorf-Ausschnitt verwerfen (ohne Bilder).
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:400,height:300}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; $('bSim').click(); }); await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r=await p.evaluate(async()=>{ const v=(GN.d.vill||[]).find(q=>q.name==='Jonsdorf'); GT.dopN=null; await kcWait([{x:v.x,z:v.z}],2600,30000); const S=GT.S, i0=Math.floor(v.x/S), j0=Math.floor(v.z/S); for (let a=-1;a<=1;a++) for (let c=-1;c<=1;c++){ const t=GT.tiles.get((i0+a)+','+(j0+c)); if (t){ if (t.fo) gtFoDrop(t); t.noFo=false; } } GT.dopN=null;
   for (let a=-1;a<=1;a++) for (let c=-1;c<=1;c++){ const t=GT.tiles.get((i0+a)+','+(j0+c)); if (t) t.fo=gtForest(t.i,t.j); } return GT.dopN; });
 console.log(JSON.stringify(r)); await b.close(); })();
