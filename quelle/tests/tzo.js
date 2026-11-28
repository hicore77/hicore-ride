// 0.27.0 OSM-Objekte Zittau (zoInit/zoStep): freie Kameras V='[[x,z,h,lx,lz,"name"],...]', wartet auf Kacheln, Gelände und Objektzellen um die Kamera.
// MENU='START_PICK={x:..,z:..};1' (Startpunkt), EV (JS nach dem Laden), EVN (JS nach jedem Bild), NF Bilder warten, OUT Ordner
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||800),height:+(process.env.VH||450)}}); await serve(ctx); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,400))); p.on('console',m=>{ if (m.type()==='error'||(m.type()==='warning'&&/zgobj|zs|Prop/.test(m.text()))) errs.push(m.type()+' '+m.text().slice(0,300)); });
 if (process.env.PRE) await p.addInitScript(process.env.PRE);
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 if (process.env.MENU) console.log('MENU', JSON.stringify(await p.evaluate(process.env.MENU)));
 const t0=Date.now(); await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; BIKE='road'; $('bSim').click(); }); await p.waitForFunction(()=>S.running,null,{timeout:1500000});
 console.log('geladen nach', Math.round((Date.now()-t0)/1000),'s');
 if (process.env.EV){ try{ console.log('EV', JSON.stringify(await p.evaluate(process.env.EV))); }catch(e){ console.log('EV Fehler', String(e).slice(0,300)); } }
 const out=process.env.OUT; require('fs').mkdirSync(out,{recursive:true}); await p.evaluate(()=>{ TRAFFIC.nextT=1e9; $('simW').value=0; meP.v=0; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); });
 for (const [x,z,h,lx,lz,n] of JSON.parse(process.env.V||'[]')){ const t1=Date.now();
  await p.evaluate(([x,z,h,lx,lz])=>{ const y=terrainH(x,z); window._camFix=[x,y+h,z,lx,terrainH(lx,lz)+(window.LY||0),lz]; window.__F0=FRC; },[x,z,h,lx,lz]);
  await p.waitForFunction(()=>FRC>=window.__F0+5,null,{timeout:600000});
  try{ await p.evaluate(([x,z])=>kcWait([{x,z}],700,240000),[x,z]); }catch(e){ console.log('kcWait', String(e).slice(0,100)); }
  try{ await p.waitForFunction(([x,z])=>{ let ok=GT.tiles.size>0; GT.tiles.forEach(t=>{ const dd=Math.hypot((t.i+0.5)*GT.S-x,(t.j+0.5)*GT.S-z); if (dd<600 && (t.hs===undefined||(window.WFO&&dd<300&&!(t.fo||t.noFo)))) ok=false; }); if (!ok) return false;
     let zo=true; ZO.cells.forEach(c=>{ if (Math.hypot((c.i+0.5)*ZO.CS-x,(c.j+0.5)*ZO.CS-z)<450 && (!c.g||c.rebuild)) zo=false; }); return zo; },[x,z],{timeout:400000,polling:2000}); }catch(e){ console.log('Warten abgelaufen', n); }
  await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(nf=>FRC>=window.__F0+nf,+(process.env.NF||12),{timeout:900000});
  await p.screenshot({timeout:180000,path:out+'/'+n+'.jpg',quality:82}); console.log('bild', n, Math.round((Date.now()-t1)/1000)+'s');
  if (process.env.EVN){ try{ console.log('EVN', n, JSON.stringify(await p.evaluate(process.env.EVN))); }catch(e){ console.log('EVN Fehler', String(e).slice(0,300)); } } }
 console.log(errs.length?errs.slice(0,30).join('\n'):'Fehler: none'); await b.close(); })();
