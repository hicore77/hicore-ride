// 0.16.0: Radmodelle in der Welt (Verfolgerkamera), Wechsel während der Fahrt. BIKES z. B. gravel,mtb, PL Ort, OUT Ordner
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='error') console.log('C',m.text().slice(0,200)); });
 const bikes=(process.env.BIKES||'gravel,mtb').split(','), OUT=process.env.OUT||'.';
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate((bk)=>{ selWorld='zittau'; $('bots').value='1'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='nachm'; ATMO.apply(); $('bike').value=bk; $('bike').onchange(); $('bSim').click(); }, bikes[0]);
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 await p.evaluate((pl)=>{ const v=(GN.d.vill||[]).find(q=>q.name===pl); zgApplyStart({x:v.x,z:v.z}); $('simW').value=180; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); }, process.env.PL||'Jonsdorf');
 for (let i=0;i<bikes.length;i++){ const bk=bikes[i];
   if (i) await p.evaluate((bk)=>{ $('bike').value=bk; $('bike').onchange(); }, bk);
   await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+10,null,{timeout:1600000});
   console.log(bk, await p.evaluate(()=>JSON.stringify({type:me.type, spd:+S.speed.toFixed(1), calls:renderer.info&&renderer.info.render?renderer.info.render.calls:null})));
   await p.screenshot({timeout:300000,path:OUT+`/welt_${bk}.jpg`,quality:85}); console.log('shot',bk); }
 await b.close(); })();
