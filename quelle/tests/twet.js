// 0.17.1 Fahrgefühl auf Wegen: Pfützen ausweichen/spritzen, Matsch, Rutscher, Wackeln. BIKE gravel|mtb, WX regen|sonne, PUD Pfützenstand, OUT Bilder (leer = keine), SEC Fahrsekunden
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const BK=process.env.BIKE||'gravel'; await ctx.addInitScript(bk=>{ try{ localStorage.setItem('hicoreRide.bike',JSON.stringify(bk)); }catch(e){} }, BK);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message)); p.on('console',m=>{ if(m.type()==='warning'||m.type()==='error') console.log('C',m.text().slice(0,200)); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate((wx)=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx=wx; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); }, process.env.WX||'regen');
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r0=await p.evaluate(([pud,pl])=>{ window.PUD_SET=pud; const v=(GN.d.vill||[]).find(q=>q.name===pl); zgApplyStart({x:v.x,z:v.z}); TRAFFIC.nextT=1e9; window.toast=()=>{};
   document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'});
   // langen erdigen Waldweg nahe Startpunkt suchen und darauf fahren
   const R=gnRG(), P=me.g.position; let best=null, bd=1e9;
   R.edges.forEach((E,i)=>{ if (E.kind!=='w' || [7,12].indexOf(E.sf)<0 || !(E.len>220) || (E.w||3)<2.5) return; const xz=E.xz||[]; if (!xz.length) return; const m=(xz.length/4|0)*2; if (!gnForest(xz[m],xz[m+1])) return; const d=Math.hypot(xz[m]-P.x,xz[m+1]-P.z); if (d<bd){ bd=d; best=i; } });
   if (best==null) return {err:'kein Waldweg'}; const rt=gRoute([{e:best,dir:1}],'twet'); setRoute(rt); S.dist=20; S.dir=1; $('simW').value=200;
   const E=R.edges[best]; return {edge:best, sf:E.sf, c:E.c, w:E.w, len:Math.round(E.len), dist:Math.round(bd), W:roadWAt(30)}; }, [+(process.env.PUD||1), process.env.PL||'Jonsdorf']);
 console.log('start', JSON.stringify(r0)); if (r0.err){ await b.close(); return; }
 // Auswertung ohne Bildschleife: Rendern anhalten und wayFeelStep mit festem Takt über 600 m Weg rechnen
 if (!process.env.OUT){ const st=await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; const o={steps:0, lat:0, yaw:0, roll:0, y:0, pOffMax:0, avoid:0, inP:0, inPm:0, slips:0, mudMax:0, roughMax:0, hits:0, PU:WET.p.value, W:roadWAt(S.dist)}; let last=WF.pOffT, sT=-1, wasIn=false;
   const v=6, dt=0.05; for (let i=0;i<2000 && S.dist<L-30;i++){ meP.v=v; S.dist+=v*dt; wayFeelStep(dt); o.steps++;
     o.lat=Math.max(o.lat,Math.abs(WF.lat)); o.yaw=Math.max(o.yaw,Math.abs(WF.yaw)); o.roll=Math.max(o.roll,Math.abs(WF.roll)); o.y=Math.max(o.y,Math.abs(WF.y)); o.pOffMax=Math.max(o.pOffMax,Math.abs(WF.pOff));
     if (WF.pOffT!==last){ o.avoid++; last=WF.pOffT; } if (WF.inP && !wasIn) o.inP++; wasIn=WF.inP; if (WF.slipT>=0 && sT<0) o.slips++; sT=WF.slipT; o.mudMax=Math.max(o.mudMax,WF.mud); o.roughMax=Math.max(o.roughMax,WF.rough);
     const q=wfLanePos(S.dist,0,false); if (wayPudHit(q.x,q.z,WF.unp,WET.p.value,-0.15)<0 && !(o._h)){ o.hits++; o._h=1; } else if (wayPudHit(q.x,q.z,WF.unp,WET.p.value,-0.15)>=0) o._h=0; }
   o.dist=Math.round(S.dist); delete o._h; for (const k of ['lat','yaw','roll','y','pOffMax','mudMax','roughMax']) o[k]=+o[k].toFixed(3); return o; });
 console.log('stats (hits = Pfützen auf der Mittellinie, inP = durchgefahren)', JSON.stringify(st)); await b.close(); return; }
 // erzwungener Rutscher
 const sl=await p.evaluate(async()=>{ WF.slipT=0; WF.slipS=0.08; let mx=0; const t0=performance.now(); while (performance.now()-t0<2500){ await new Promise(r=>setTimeout(r,30)); mx=Math.max(mx,Math.abs(WF.slipA)); } return {max:+mx.toFixed(3), end:WF.slipT}; });
 console.log('slip', JSON.stringify(sl));
 if (process.env.OUT){ const OUT=process.env.OUT;
   const shot=async(nm,fn)=>{ await p.evaluate(fn); await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+5,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:OUT+'/'+nm+'.jpg',quality:85}); console.log('shot',nm); };
   // vor einer Pfütze: Kamera hinter dem Fahrer, Fahrer anhalten (Bild bleibt ruhig)
   await shot('nass_weg', ()=>{ $('simW').value=0; meP.v=0; let k0=null; for (let k=4;k<300 && k0==null;k++){ const q=wfLanePos(S.dist+k,0,false); if (wayPudHit(q.x,q.z,WF.unp,WET.p.value,0)<0) k0=k; } if (k0!=null) S.dist+=k0-7; window._camFix=null; });
   await shot('nass_oben', ()=>{ const q=me.g.position, h=headingAt(S.dist), fx=Math.sin(h), fz=Math.cos(h); window._camFix=[q.x-fx*6, q.y+9, q.z-fz*6, q.x+fx*10, q.y, q.z+fz*10]; });
   await shot('matsch', ()=>{ window._camFix=null; $('simW').value=260; meP.v=7; WF.mAcc=6; });
 }
 console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
