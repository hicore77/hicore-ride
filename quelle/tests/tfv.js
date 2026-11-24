const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:960,height:540}}); await p.addInitScript('window.FV_MS=1500;window.LY='+(process.env.LY||20)+';'+(process.env.NOFV?'window.NO_FV=1;':'')); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; buildWorld(WORLDS.find(w=>w.id==='zittau')); builtWorld='zittau'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:120000}).catch(()=>{});
 const V=JSON.parse(process.env.V); // [x,z,h,lx,lz,name]
 for (const [x,z,h,lx,lz,n] of V){ await p.evaluate(([x,z])=>zgApplyStart({x,z}),[x,z]);
  await p.evaluate(([x,z,h,lx,lz])=>{ TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); const y=terrainH(x,z); window._camFix=[x,y+h,z,lx,terrainH(lx,lz)+(window.LY||0),lz]; window.__F0=FRC; window.__t=performance.now(); },[x,z,h,lx,lz]);
  await p.waitForFunction((nf)=>FRC>=window.__F0+nf,+(process.env.NF||60),{timeout:1600000}); console.log(n, await p.evaluate(()=>{ const i=renderer.info; return JSON.stringify({ms:Math.round(performance.now()-window.__t), tri:i.render&&i.render.triangles, calls:i.render&&i.render.calls, fv:FV.n, cells:FV.cells&&FV.cells.size, far:camera.far, fog:scene.fog.far, EXT}); }));
  await p.screenshot({timeout:180000,path:(process.env.PFX||'fv_')+n+'.jpg',quality:80}); }
 await b.close(); })();
