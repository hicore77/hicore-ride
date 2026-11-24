// 0.17.0: Kacheln + Rand + Felsen/Zäune. Startet die Fahrt, springt an Orte (PTS=[[x,z,blickx,blickz],...]), wartet und macht Bilder; gibt Kachel- und Speicherzahlen aus.
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='warning'||m.type()==='error') console.log('C',m.text().slice(0,200)); });
 const req=[]; p.on('request',r=>{ if (/kacheln/.test(r.url())) req.push(r.url().split('/').pop()); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 const t0=Date.now(); await p.waitForFunction(()=>S.running,null,{timeout:1200000}); console.log('Start s',Math.round((Date.now()-t0)/1000),'Kacheln beim Start',req.length);
 const st=await p.evaluate(()=>{ let b=0,t=0,r=0,f=0; GT.bi&&GT.bi.forEach(l=>b+=l.length); GT.ot&&GT.ot.forEach(l=>t+=l.length/3); GT.rk&&GT.rk.forEach(l=>r+=l.length); GT.fn&&GT.fn.forEach(l=>f+=l.length); let h=0; GT.tiles.forEach(x=>{ if (x.hs) h++; }); return {kc:KC.st.size, bld:b, trees:t, rocks:r, fences:f, tiles:GT.tiles.size, houseTiles:h, gdem:[GN.dem.nx,GN.dem.nz], lcd:[LCD.x0,LCD.z0,LCD.w,LCD.h], EXT}; }); console.log('Stand',JSON.stringify(st));
 const PTS=JSON.parse(process.env.PTS||'[[-2300,500,-2250,560]]');
 for (let k=0;k<PTS.length;k++){ const [x,z,lx,lz,hh]=PTS[k];
  await p.evaluate(([x,z,lx,lz,hh])=>{ $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); const y=terrainH(x,z); window._camFix=[x,y+(hh||3),z,lx,terrainH(lx,lz)+1,lz]; me.g.position.set(x,y,z); camera.position.set(x,y+(hh||3),z); window.__F0=FRC; window.__T0=performance.now(); }, [x,z,lx,lz,hh]);
  // Kacheln um den Blickpunkt laden und Häuser/Wald bauen lassen
  await p.evaluate(([x,z])=>kcWait([{x,z}],2600,30000).then(()=>{ gtStream({x,z},999); try{ gpuFixInst(scene); }catch(e){} }), [x,z]);
  await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000});
  const info=await p.evaluate(([x,z])=>{ const k=Math.floor(x/GT.S)+','+Math.floor(z/GT.S), t=GT.tiles.get(k); let rk=0, fn=0; if (t&&t.fo) t.fo.grp.children.forEach(c=>{ if (c.userData.rock) rk+=c.count; if (c.userData.fence) fn++; }); return {tile:k, rocks:rk, fenceMeshes:fn, kc:KC.st.size, h:Math.round(terrainH(x,z))}; },[x,z]); console.log('Bild',k,JSON.stringify(info));
  await p.screenshot({timeout:300000,path:(process.env.OUT||'.')+'/kc_'+k+'.jpg',quality:80}); }
 await b.close(); })();
