// 0.17.0: Wanderer auf Wegen. Startet die Fahrt, setzt den Fahrer an einen Ort mit Wegen (PL), lässt Wanderer erscheinen und fährt ein Stück; Bild vom nächsten Wanderer.
// Braucht quelle/gpu/figuren (Verknüpfung auf webgpu-spiel/figuren).
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if((m.type()==='warning'||m.type()==='error')&&!/GL Driver/.test(m.text())) console.log('C',m.text().slice(0,200)); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 await p.evaluate(()=>{ $('simW').value=150; HIKE.t=0; window.__F0=FRC; });
 for (let k=0;k<6;k++){ await p.waitForFunction(()=>FRC>=window.__F0+10,null,{timeout:1600000}); const r=await p.evaluate(()=>{ window.__F0=FRC; HIKE.t=Math.min(HIKE.t,0.5); const P=me.g.position; return HIKE.list.map(h=>({d:Math.round(h.W.G.position.distanceTo(P)), e:h.E.k, s:Math.round(h.s), off:+h.off.toFixed(2), y:+(h.W.G.position.y-terrainH(h.W.G.position.x,h.W.G.position.z)).toFixed(2)})); }); console.log('Wanderer',JSON.stringify(r)); }
 const ok=await p.evaluate(()=>{ const h=HIKE.list.sort((a,b)=>a.W.G.position.distanceTo(me.g.position)-b.W.G.position.distanceTo(me.g.position))[0]; if (!h) return false; const g=h.W.G.position, fw=h.W.G.rotation.y; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); window._camFix=[g.x+Math.sin(fw)*6+2, g.y+2.2, g.z+Math.cos(fw)*6+2, g.x, g.y+1, g.z]; window.__F0=FRC; return true; });
 if (ok){ await p.waitForFunction(()=>FRC>=window.__F0+4,null,{timeout:1600000}); await p.screenshot({path:(process.env.OUT||'.')+'/wanderer.jpg',quality:80}); }
 await b.close(); })();
