// 0.18.0 Treppen: Netz-Statistik, Tragen/Fahren über eine echte Treppe. BIKE gravel|mtb|road, PL Ort, NV "min,max" Stufen, UP 1 hoch / -1 runter, OUT Bilder (leer = nur Logik)
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:560}}); await serve(ctx);
 const BK=process.env.BIKE||'gravel'; await ctx.addInitScript(([bk,o,f,w])=>{ window.__OUT=o; window.__FLT=f; window.__WID=+(w||0); try{ localStorage.setItem('hicoreRide.bike',JSON.stringify(bk)); }catch(e){} }, [BK,!!process.env.OUT,!!process.env.FLOAT,process.env.WID]);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,400))); p.on('console',m=>{ if(m.type()==='warning'||m.type()==='error') console.log('C',m.text().slice(0,200)); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r0=await p.evaluate(([pl,nv,up])=>{ const v=(GN.d.vill||[]).find(q=>q.name===pl); if (v) zgApplyStart({x:v.x,z:v.z}); TRAFFIC.nextT=1e9; window.TOASTS=[]; const t0=window.toast; window.toast=m=>window.TOASTS.push(m);
   document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'});
   const R=gnRG(), P=me.g.position, st={stairs:R.stat.stairs, adjS:0, adjW:0}; R.edges.forEach(E=>{ if (E.c!==15) return; if (R.adjS[E.a].includes(E.k)) st.adjS++; if (R.adjW[E.a].includes(E.k)) st.adjW++; });
   let best=null, bd=1e9; const [n0,n1]=nv;
   R.edges.forEach(E=>{ if (E.c!==15 || !E.st || (window.__WID?E.wid!==window.__WID:(E.nv<n0 || E.nv>n1))) return; const dyab=stairY(E.st,E.stS1)-stairY(E.st,E.stS0); const dir=(dyab>0)===(up>0)?0:1, na=dir?E.b:E.a, nb=dir?E.a:E.b;
     const nbr=(n,ex)=>R.adjW[n].map(k=>R.edges[k]).filter(K=>K.k!==ex && K.c!==15 && K.len>25); const A=nbr(na,E.k), B=nbr(nb,E.k); if (!A.length || !B.length) return;
     const xz=E.xz; let d=Math.hypot(xz[0]-P.x,xz[1]-P.z); if (window.__FLT){ if (d>2500) return; const T=E.st; stairInit(T); const q=stairPt(T,T.up>0?T.s1:T.s0); d=-(T.yHi-wayLiftY0(q[0],q[1],terrainH(q[0],q[1]))); if (T.rHi) return; } if (d<bd){ bd=d; best={E,dir,na,nb,A:A[0],B:B[0]}; } });
   if (!best) return {err:'keine Treppe', st}; const {E,dir,na,nb,A,B}=best;
   const path=[{e:A.k,dir:A.b===na?0:1},{e:E.k,dir},{e:B.k,dir:B.a===nb?0:1}]; const rt=gRoute(path,'tstair'); setRoute(rt); rt.ents.forEach((en,i)=>NET.appl.add(i+':'+en.n1+':'+Math.round(en.r1))); S.dist=Math.max(0,rt.ents[1].r0-22); S.dir=1; $('simW').value=window.__OUT?0:200; meP.v=window.__OUT?0:6;
   const sp=stairSpans(); return {st, edge:E.k, id:E.wid, nv:E.nv, T:{s0:+E.st.s0.toFixed(2), s1:+E.st.s1.toFixed(2), p0:stairPt(E.st,0).map(v=>+v.toFixed(1)), pe:stairPt(E.st,E.st.L).map(v=>+v.toFixed(1)), n:E.st.n, nv:E.st.nv, L:+E.st.L.toFixed(1), R:+E.st.R.toFixed(2), h:+E.st.h.toFixed(3), up:E.st.up, fl:E.st.fl, sf:E.st.sf}, dist:Math.round(bd), spans:sp.map(s=>({r0:+s.r0.toFixed(1), r1:+s.r1.toFixed(1), q0:+s.q0.toFixed(1), q1:+s.q1.toFixed(1), up:s.up, nv:s.nv, mode:stairMode(s), tr:+s.tr.toFixed(2)})), name:gWayName(E), x:Math.round(E.xz[0]), z:Math.round(E.xz[1])}; }, [process.env.PL||'Oybin', (process.env.NV||'4,40').split(',').map(Number), +(process.env.UP||1)]);
 console.log('start', JSON.stringify(r0)); if (r0.err){ console.log('Fehler:', errs.join('\n')||'none'); await b.close(); return; }
 // Logik ohne Bildschleife: Teile der Hauptschleife mit festem Takt
 if (!process.env.OUT){ const lg=await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; const sp=stairSpans()[0], dt=0.05, o={t:0, tOn:0, vmax:0, vOn:[], kMax:0, footErr:0, footN:0, footBad:0, liftMax:0, gradeOn:null, modes:{}, bike:[]}; S.power=200; let tStart=null;
   for (let i=0;i<4000 && S.dist<sp.r1+25;i++){ stepPhysics(meP,S.power,S.dist,dt); const vm=curveVmax(); if (meP.v>vm) meP.v=Math.max(vm,meP.v-5*dt); S.grade=gradeAt(S.dist); stairStep(dt); S.dist+=meP.v*dt; o.t+=dt;
     placeRider(me,S.dist,0,false); animRider(me,85,meP.v,dt,S.power); me.g.updateMatrixWorld(true);
     if (S.dist>=sp.q0 && S.dist<=sp.q1){ o.tOn+=dt; o.vOn.push(meP.v); if (o.gradeOn==null) o.gradeOn=S.grade; }
     o.kMax=Math.max(o.kMax,STAIR.k); o.liftMax=Math.max(o.liftMax,STAIR.lift); if (STAIR.mode) o.modes[STAIR.mode]=(o.modes[STAIR.mode]||0)+1;
     if (STAIR.k>0.98 && STAIR.mode!=='ride' && me.glb){ ['LeftToeBase','RightToeBase'].forEach(n=>{ const w=me.glb.B[n].getWorldPosition(new THREE.Vector3()); const l=me.g.worldToLocal(w.clone()); const gx=S.dist+l.z, gy=stairGround(sp,gx); const e=w.y-gy; o.footErr+=Math.abs(e); o.footN++; if (e< -0.04) o.footBad++; }); }
     if (i%20===0) o.bike.push([+S.dist.toFixed(1), +meP.v.toFixed(2), +STAIR.k.toFixed(2), me.bikeG?+me.bikeG.position.y.toFixed(2):0]); }
   o.vOnAvg=o.vOn.length?+(o.vOn.reduce((a,b)=>a+b,0)/o.vOn.length).toFixed(2):0; delete o.vOn; o.footErr=o.footN?+(o.footErr/o.footN).toFixed(3):0; o.t=+o.t.toFixed(1); o.tOn=+o.tOn.toFixed(1); o.toasts=window.TOASTS; o.endV=+meP.v.toFixed(2); return o; });
 console.log('logik', JSON.stringify(lg)); }
 if (process.env.OUT){ const OUT=process.env.OUT;
   const shot=async(nm,dd,side)=>{ await p.evaluate(([dd,side])=>{ const sp=stairSpans()[0]; S.dist=sp.r0+dd; $('simW').value=0; S.power=0; meP.v=0; stairStep(0.05); STAIR.lift=STAIR.mode==='lift'?0.14:0; placeRider(me,S.dist,0,false); for (let i=0;i<30;i++) animRider(me,0,0,0.05,0);
       const q=me.g.position, h=headingAt(S.dist), fx=Math.sin(h), fz=Math.cos(h), rx=Math.cos(h), rz=-Math.sin(h); window._camFix=side===0?[q.x-fx*0.5, q.y+14, q.z-fz*0.5, q.x+fx*0.5, q.y, q.z+fz*0.5]:[q.x+rx*side*3.6-fx*1.2, q.y+1.6, q.z+rz*side*3.6-fz*1.2, q.x+fx*0.3, q.y+0.9, q.z+fz*0.3]; const T=sp.T, a=stairPt(T,sp.sA), e=posAt(sp.r0); console.warn('chk', JSON.stringify({route:Math.round(L), d:+S.dist.toFixed(1), r0:+sp.r0.toFixed(1), me:[+q.x.toFixed(1),+q.z.toFixed(1),+q.y.toFixed(2)], startStair:[+a[0].toFixed(1),+a[1].toFixed(1)], startRoute:[+e.x.toFixed(1),+e.z.toFixed(1),+e.y.toFixed(2)], lane:TRAFFIC.rLane})); }, [dd,side]);
     await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+3,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:OUT+'/'+nm+'.jpg',quality:85}); console.log('shot',nm); };
   const sp=await p.evaluate(()=>{ const s=stairSpans()[0]; return {L:s.r1-s.r0}; });
   const pts=(process.env.PTS||'-1.6,mid,end').split(',');
   for (const q of pts){ const dd=q==='mid'?sp.L*0.5:q==='end'?sp.L+1.0:+q; for (const sd of (process.env.SIDE||'1').split(',')) await shot('treppe_'+q.replace('.','_')+(sd==='1'?'':'_s'+sd), dd, +sd); }
 }
 console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
