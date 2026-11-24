const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:960,height:540}}); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if (/warn|error|db|bü/i.test(m.type()+m.text())) console.log('C',m.text().slice(0,200)); });
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 const X=+(process.env.X||446), Z=+(process.env.Z||-6985);
 await p.evaluate(()=>{ selWorld='zittau'; buildWorld(WORLDS.find(w=>w.id==='zittau')); builtWorld='zittau'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:120000}).catch(()=>{});
 console.log('start', await p.evaluate(([x,z])=>{ try{ return zgApplyStart({x,z}); }catch(e){ return 'err '+e; } },[X,Z]));
 const st=await p.evaluate(()=>({lines:ZSB.lines.length, s:ZSB.lines.filter(l=>l.g==='s').length, vis:(ZSB.dbVis||[]).length, types:(ZSB.dbVis||[]).map(v=>v.t).join(''), lcs:ZSB.lcs.length, brs:ZSB.lines.reduce((a,l)=>a+((l.brs||[]).length),0), brRoad:ZSB.lines.reduce((a,l)=>a+((l.brs||[]).filter(b=>b.road).length),0)}));
 console.log(JSON.stringify(st));
 const info=await p.evaluate(([x,z])=>{ let best=null; ZSB.lcs.forEach(c=>{ if (!c.V) return; const d=Math.hypot(c.x-x,c.z-z); if (!best||d<best.d) best={d,c}; }); if (!best) return null; const c=best.c, l=ZSB.lines[c.li], f=ZSB.at(l,c.s), r=zgRoadAt(c.x,c.z);
   window._LC=c; return {d:best.d, x:c.x, z:c.z, t:c.V.t, booms:c.V.booms.length, ty:f.y, ry:r&&r.y, rw:r&&r.w, rtx:r&&r.tx, rtz:r&&r.tz, ftx:f.tx, ftz:f.tz}; },[X,Z]);
 console.log(JSON.stringify(info)); if (!info) { await b.close(); return; }
 // camera: along road, 22 m before crossing, slightly to the right
 const shots=[['a',0],['b',9],['c',8],['d',6]];
 await p.evaluate(()=>{ TRAFFIC.nextT=1e9; TRAFFIC.act.slice().forEach(c=>TRAFFIC.kill(c)); document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); });
 const cam=await p.evaluate(()=>{ const c=window._LC, r=zgRoadAt(c.x,c.z); const D=24, cx=c.x-r.tx*D+r.tz*2.5, cz=c.z-r.tz*D-r.tx*2.5; const y=terrainH(cx,cz); window._camFix=[cx,y+2.2,cz,c.x,r.y+2.0,c.z]; return [cx,cz]; });
 await p.evaluate(()=>{ window.__F0=FRN; }); await p.waitForFunction(()=>FRN>=window.__F0+14,null,{timeout:800000}); await p.screenshot({path:'rail_a.jpg',quality:75});
 await p.evaluate(()=>{ const c=window._LC; ZSB.dbCd=0; ZSB.dbSpawn(me.g.position,{li:c.li,s:c.s,eta:9}); window._T0=performance.now(); });
 for (const [n,sec] of shots.slice(1)){ const t1=Date.now(); await p.evaluate(()=>{ window.__F0=FRN; }); await p.waitForFunction(()=>FRN>=window.__F0+8,null,{timeout:800000});
   const s2=await p.evaluate(()=>{ const T=ZSB.dbT, c=window._LC; return {train:!!T, dTr:T?Math.round((c.s-T.s)*T.dir):null, on:c.V.on, k:+c.V.k.toFixed(1), boom:c.V.booms[0]?+c.V.booms[0].arm.rotation.z.toFixed(2):null, hold:ZSB.holdS}; }); console.log(n,JSON.stringify(s2));
   await p.screenshot({path:'rail_'+n+'.jpg',quality:75}); }
 await b.close(); })();
