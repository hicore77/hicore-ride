// Kontrollbild einer Kreuzung von schräg oben (0.13.0). X,Z Mittelpunkt, OUT Datei
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='nachm'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const X=+(process.env.X||-5378), Z=+(process.env.Z||-2063);
 await p.evaluate(([X,Z])=>{ zgApplyStart({x:X+5,z:Z+90}); $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); },[X,Z]);
 await p.waitForTimeout(2000);
 await p.evaluate(([X,Z])=>{ const y=gdemH(X,Z); window._camFix=[X+5,y+38,Z+62,X,y,Z]; window.__F0=FRC; },[X,Z]);
 await p.waitForFunction(()=>FRC>=window.__F0+14,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:process.env.OUT||'kreuz.jpg',quality:85}); console.log('shot');
 await b.close(); })();
