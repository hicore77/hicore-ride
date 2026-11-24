// 0.17.3: nichts vom Nahgras/Acker auf Feldwegen. Feldweg durch Acker nahe PL suchen, GF-Zellen prüfen, optional Bild (OUT). OLD=1 = Wegprüfung aus
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 await ctx.addInitScript(o=>{ try{ localStorage.setItem('hicoreRide.bike',JSON.stringify('gravel')); }catch(e){} if (o[0]) window.NO_GFWAY=1; window.__PL2=o[1]; }, [!!process.env.OLD, process.env.PL2||'']);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r0=await p.evaluate((pl)=>{ const V=GN.d.vill||[], v=V.find(q=>q.name===pl), v2=V.find(q=>q.name===(window.__PL2||pl)); zgApplyStart({x:v.x,z:v.z}); const P={x:(v.x+v2.x)/2, z:(v.z+v2.z)/2}; TRAFFIC.nextT=1e9; window.toast=()=>{};
   document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'});
   const R=gnRG(); let best=null, bd=1e9;
   R.edges.forEach((E,i)=>{ if (E.kind!=='w' || !(E.len>250)) return; const xz=E.xz||[]; if (!xz.length) return; const m=(xz.length/4|0)*2; let ac=0; for (const [a,c] of [[25,0],[-25,0],[0,25],[0,-25]]) if (gnLC(xz[m]+a,xz[m+1]+c)===3) ac++; if (ac<3) return; const d=Math.hypot(xz[m]-P.x,xz[m+1]-P.z); if (d<bd){ bd=d; best=i; } });
   if (best==null) return {err:'kein Feldweg'}; const rt=gRoute([{e:best,dir:1}],'tgf'); setRoute(rt); S.dist=120; S.dir=1; $('simW').value=0; meP.v=0;
   const E=R.edges[best]; return {edge:best, sf:E.sf, c:E.c, w:E.w, len:Math.round(E.len), dist:Math.round(bd)}; }, process.env.PL||'Spitzkunnersdorf');
 console.log('start', JSON.stringify(r0)); if (r0.err){ await b.close(); return; }
 await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+8,null,{timeout:1600000});
 const st=await p.evaluate(()=>{ const o={inst:0, onWay:0, crop:0, cells:GF.cells.size}; const P0=me.g.position;
   for (const c of GF.cells.values()) for (let k=0;k<c.n;k++){ const x=c.P[k*2], z=c.P[k*2+1]; if (Math.hypot(x-P0.x,z-P0.z)>40) continue; o.inst++; if (waysNear(x,z,0)) o.onWay++; if (c.M[k*16+5]>1.0) o.crop++; } return o; });
 console.log('GF (onWay muss 0 sein, crop = hohe Halme über 1,0)', JSON.stringify(st));
 if (process.env.OUT){ await p.screenshot({timeout:300000,path:process.env.OUT+'/feldweg.jpg',quality:85}); console.log('shot'); }
 console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
