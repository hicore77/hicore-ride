// 0.14.0 Kontrollbilder Wege (Feldweg mit Grasnarbe, Waldweg, Schotter, Pfad, Draufsicht). PL Ort, OUT Ordner, SN Schneelage, QS extra
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='warning'||m.type()==='error') console.log('C',m.text().slice(0,200)); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate((sn)=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn=sn; ATMO.snRd='geraeumt'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); }, process.env.SN||'keine');
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 await p.evaluate((pl)=>{ const v=(GN.d.vill||[]).find(q=>q.name===pl); zgApplyStart({x:v.x,z:v.z}); $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); for (const k of ['a','d','m','r']) SNOW[k].value=SNOW.t[k]; }, process.env.PL||'Jonsdorf');
 await p.waitForTimeout(3000); await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+8,null,{timeout:1600000});
 const info=await p.evaluate(()=>{ const W=window.WAYS||[]; let n=0; SIDE_IDX&&SIDE_IDX.forEach(l=>n+=l.length); return {ways:W.length, runs:n, mat:!!WAYS_MAT}; }); console.log('info',JSON.stringify(info));
 const modes=(process.env.MODES||'rut,forest,gravel,path,top').split(',');
 for (const md of modes){
  const r=await p.evaluate((md)=>{ const P=me.g.position; let best=null, bd=1e9;
    SIDE_IDX.forEach(l=>l.forEach(o=>{ if (o.P.length<6) return; const ok= md==='rut'?(o.rut&&o.ly!==7): md==='forest'?o.ly===7: md==='gravel'?(o.ly===4||o.ly===8)&&!o.rut: md==='path'?o.fine: md==='side'?o.ly===undefined||o.ly===0: true; if (!ok) return; const q=o.P[Math.floor(o.P.length/2)], d=Math.hypot(q[0]-P.x,q[1]-P.z); if (d>40 && d<bd){ bd=d; best=o; } }));
    if (!best) return null; const k=Math.floor(best.P.length/2), a=best.P[Math.max(0,k-3)], c=best.P[Math.min(best.P.length-1,k+3)]; let dx=c[0]-a[0], dz=c[1]-a[1]; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l; const q=best.P[k], y=terrainH(q[0],q[1]);
    if (md==='top') window._camFix=[q[0]-dx*60, y+70, q[1]-dz*60, q[0]+dx*40, y, q[1]+dz*40]; else window._camFix=[q[0]-dx*9, y+2.6, q[1]-dz*9, q[0]+dx*10, y+0.3, q[1]+dz*10];
    window.__F0=FRC; return {d:Math.round(bd), ly:best.ly, rut:best.rut, w:best.w, sf:best.sf}; }, md);
  console.log(md, JSON.stringify(r)); if (!r) continue;
  await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:(process.env.OUT||'.')+'/weg_'+md+'.jpg',quality:85}); console.log('shot',md); }
 await b.close(); })();
