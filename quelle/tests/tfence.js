// 0.24.4: Zäune (Deko + OSM) gegen Straßen, Wege/Treppen und Gleise prüfen. Init-Skript setzt window.FENCE_LOG, jedes gesetzte Zaunstück wird protokolliert.
// Gezählt wird, wie viele Stücke eine Fahrbahn (Mitte bis Rand + 0,2 m), einen Weg (+0,2 m) oder ein Gleisbett (+0,3 m) berühren. PRE='window.OLD_FENCECHK=1' = alter Stand.
// Zusätzlich: wie viele Grasbüschel (fein) auf Pflasterstreifen liegen (gnPave ohne Rand). Ergebnis in Konsole.
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:640,height:400}}); await serve(ctx);
 await ctx.addInitScript('window.FENCE_LOG=[];'+(process.env.PRE||''));
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 await p.waitForTimeout(20000);
 const R=await p.evaluate(()=>{ const out={n:0, by:{}, bad:{}, ex:[]}; const old=window.OLD_FENCECHK; window.OLD_FENCECHK=0;
   const hit=(ax,az,bx,bz)=>{ const l=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(l/0.25)); for (let q=0;q<=n;q++){ const x=ax+(bx-ax)*q/n, z=az+(bz-az)*q/n, g=gnNear(x,z,30); if (g.k>=0 && g.d<g.w/2+0.2) return 'strasse'; if (waysNear(x,z,0.2)) return 'weg'; if (railNear(x,z,0.3)) return 'gleis'; } return null; };
   for (const [t,ax,az,bx,bz] of window.FENCE_LOG){ out.n++; out.by[t]=(out.by[t]||0)+1; const h=hit(ax,az,bx,bz); if (h){ const k=t+'/'+h; out.bad[k]=(out.bad[k]||0)+1; if (out.ex.length<25) out.ex.push([k,Math.round(ax),Math.round(az)]); } }
   let gp=0, gn=0; GF.cells.forEach(c=>{ for (let i=0;i<c.n;i++){ gn++; const x=c.P[i*2], z=c.P[i*2+1]; window.OLD_GRASSPAVE=0; if (gnPave(x,z,0)) gp++; } }); out.grass={all:gn, aufPflaster:gp};
   /* Ortskern Zittau: Feingras-Zellen direkt erzeugen, alt gegen neu */ const town=o=>{ window.OLD_GRASSPAVE=o; GF.cells.clear(); let a=0, pv=0; for (let i=Math.floor(4300/GF.cs); i<Math.floor(4700/GF.cs); i++) for (let j=Math.floor(-5300/GF.cs); j<Math.floor(-4900/GF.cs); j++){ const c=gfCell(i,j); for (let k=0;k<c.n;k++){ a++; window.OLD_GRASSPAVE=0; if (gnPave(c.P[k*2],c.P[k*2+1],0)) pv++; window.OLD_GRASSPAVE=o; } } GF.cells.clear(); return {a,pv}; }; if (GF.per) out.town={alt:town(1), neu:town(0)}; window.OLD_GRASSPAVE=0;
   window.OLD_FENCECHK=old; return out; });
 console.log('Zaunstücke', R.n, JSON.stringify(R.by)); console.log('Kreuzungen:', JSON.stringify(R.bad)); R.ex.forEach(e=>console.log('  ',JSON.stringify(e)));
 console.log('Gras:', JSON.stringify(R.grass), 'Ortskern:', JSON.stringify(R.town));
 console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
