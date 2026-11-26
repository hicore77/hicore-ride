// 0.24.1 HUD oben Mitte: Bergwertung + Kreuzung + Meldung + FPS gleichzeitig, Bilder iPad quer (1180x820) und Handy (390x844). ROOT=../../webgpu-spiel für den alten Stand, OUT=Ordner, TAG=Dateiname-Zusatz
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:1180,height:820}}); await serve(ctx);
 const OUT=process.env.OUT||'.', TAG=process.env.TAG||'neu'; const errs=[];
 const g=await ctx.newPage(); g.on('pageerror',e=>errs.push(e.message));
 await g.goto('http://127.0.0.1:8765/index.html?gl=1'); await g.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await g.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); BIKE='road'; $('bSim').click(); });
 await g.waitForFunction(()=>S.running,null,{timeout:1200000});
 const info=await g.evaluate(()=>{ $('simW').value=0; meP.v=0; TRAFFIC.nextT=1e9; const d0=S.dist; let j=null;
   for (let d=d0+30; d<d0+L-200; d+=3){ S.dist=d; gNetStep(); const P=NET.pend; if (P && P.ah>20 && P.ah<34 && P.opts.length>=2){ j={ah:P.ah, minor:!!P.minor}; break; } }
   const sg=SEG.list.find(x=>x.id!=='runde'); SEG.act=[{sg, d0:S.dist-sg.len+20, t0:S.segT-417.9, ok:false}];
   const f=$('fps'); f.style.display='block'; f.textContent='29 FPS · max 30 · CPU 9.8 ms'; toast('Testmodus ohne Trainer: Bergwertungen und Sprints zählen nicht'); clearTimeout(toastT); return {j, sg:sg.name}; });
 console.log(JSON.stringify(info));
 const box=async()=>g.evaluate(()=>{ const r=id=>{ const e=id[0]=='.'?document.querySelector(id):$(id); if (!e) return null; const cs=getComputedStyle(e); if (cs.display==='none'||(id==='toast'&&!e.classList.contains('show'))) return null; const q=e.getBoundingClientRect(); return [Math.round(q.top),Math.round(q.bottom),Math.round(q.left),Math.round(q.right)]; };
   const o={}; for (const id of ['.hud','fps','segbox','junc','toast']) o[id]=r(id); const k=Object.keys(o).filter(x=>o[x]); const ov=[];
   for (let i=0;i<k.length;i++) for (let m=i+1;m<k.length;m++){ const A=o[k[i]],B=o[k[m]]; if (A[0]<B[1]&&B[0]<A[1]&&A[2]<B[3]&&B[2]<A[3]) ov.push(k[i]+'/'+k[m]); } return {o,ov}; });
 await g.waitForTimeout(400); console.log('ipad', JSON.stringify(await box()));
 await g.screenshot({path:OUT+'/hud_ipad_'+TAG+'.jpg', quality:85, timeout:300000});
 await g.setViewportSize({width:390,height:844}); await g.evaluate(()=>{ toast('Testmodus ohne Trainer: Bergwertungen und Sprints zählen nicht'); clearTimeout(toastT); }); await g.waitForTimeout(400);
 console.log('handy', JSON.stringify(await box()));
 await g.screenshot({path:OUT+'/hud_handy_'+TAG+'.jpg', quality:85, timeout:300000});
 console.log('Fehler:', errs.length?errs:'none'); await b.close(); })();
