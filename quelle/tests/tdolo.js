// 0.25.0 Dolomiten-Welt: laden, Fehler, Runde/Netz-Kennzahlen; optional Bilder.
// OUT=ordner  D='[0,12000,...]' (Fahrerkamera an Strecke in m)  V='[[x,z,h,lx,lz,"name"],...]' (freie Kamera)  NF=Bilder warten
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:+(process.env.VH||620)}}); await serve(ctx); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,400))); p.on('console',m=>{ if (m.type()==='error'||m.type()==='warning') errs.push(m.type()+' '+m.text().slice(0,300)); });
 if (process.env.PRE) await p.addInitScript(process.env.PRE);
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 const t0=Date.now();
 await p.evaluate(w=>{ selWorld=w; $('bots').value='0'; BIKE='road'; $('bSim').click(); },process.env.W||'dolo');
 await p.waitForFunction(()=>S.running,null,{timeout:1500000});
 console.log('geladen nach', Math.round((Date.now()-t0)/1000),'s');
 const info=await p.evaluate(()=>{ const D=gnData(); return {world:WORLD.id, L:Math.round(L), dist:Math.round(S.dist), edges:D.edges.length, loop:D.loop, ext:Math.round(EXT), fogFar:scene.fog.far, camFar:camera.far, signs:gnSigns().length, minY:Math.round(minY), maxY:Math.round(maxY), start:posAt(S.dist), sat:!!window.DLSAT, lcd:window.LCD&&[LCD.x0,LCD.w], tiles:GT.tiles.size}; });
 console.log(JSON.stringify(info));
 const out=process.env.OUT; if (out){ require('fs').mkdirSync(out,{recursive:true});
  await p.evaluate(()=>{ TRAFFIC.nextT=1e9; $('simW').value=0; meP.v=0; });
  for (const d of JSON.parse(process.env.D||'[]')){ await p.evaluate(d=>{ S.dist=d; snapCam=true; window.__F0=FRC; },d);
   await p.waitForFunction(nf=>FRC>=window.__F0+nf,+(process.env.NF||40),{timeout:1600000}); await p.screenshot({timeout:180000,path:out+'/d'+d+'.jpg',quality:80}); console.log('bild d', d); }
  const VV=JSON.parse(process.env.V||'[]'); if (process.env.SHR){ const sv=await p.evaluate(ns=>(window.DLSHR||[]).filter(q=>Math.hypot(q[0]-5880,q[1]+5540)<20000).slice(0,+ns).map((q,i)=>[q[0]+Math.sin(q[2])*6+Math.cos(q[2])*2.5,q[1]+Math.cos(q[2])*6-Math.sin(q[2])*2.5,1.7,q[0],q[1],'wegkreuz'+i+'_t'+q[3]]),process.env.SHR); VV.push(...sv); console.log('kreuze', JSON.stringify(sv)); }
  for (const [x,z,h,lx,lz,n] of VV){ await p.evaluate(([x,z,h,lx,lz])=>{ document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); const y=terrainH(x,z); window._camFix=[x,y+h,z,lx,terrainH(lx,lz)+(window.LY||0),lz]; window.__F0=FRC; },[x,z,h,lx,lz]);
   await p.waitForFunction(nf=>FRC>=window.__F0+nf,+(process.env.NF||40),{timeout:1600000}); await p.screenshot({timeout:180000,path:out+'/'+n+'.jpg',quality:80}); console.log('bild', n); } }
 console.log(errs.length?errs.slice(0,30).join('\n'):'Fehler: none'); await b.close(); })();
