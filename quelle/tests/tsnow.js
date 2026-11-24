// Schnee-Renderbilder: Env CFG='[["name","wx","snow","snowRd","tod"],...]', PL='["Jonsdorf",...]' (Orte), MODE=rider|high|both
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:+(process.env.VW||960),height:+(process.env.VH||540)}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='error'||/GPU-Material/.test(m.text())) console.log('CE',m.text().slice(0,300)); });
 await p.addInitScript('window.FV_MS=1500;');
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 if (process.env.PRE) await p.evaluate((c)=>{ ATMO.wx=c[1]; ATMO.sn=c[2]; ATMO.snRd=c[3]; ATMO.apply(); for (const k of ['a','d','m','r']) SNOW[k].value=SNOW.t[k]; }, JSON.parse(process.env.CFG)[0]);
 await p.evaluate(()=>{ selWorld='zittau'; buildWorld(WORLDS.find(w=>w.id==='zittau')); builtWorld='zittau'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:120000}).catch(()=>{});
 const CFG=JSON.parse(process.env.CFG), PL=JSON.parse(process.env.PL||'["Jonsdorf"]'), MODE=process.env.MODE||'both', OUT=process.env.OUT||'.';
 for (const pl of PL){
  const ok=await p.evaluate((pl)=>{ const v=(GN.d.vill||[]).find(q=>q.name===pl); if (!v) return (GN.d.vill||[]).map(q=>q.name).join(','); zgApplyStart({x:v.x,z:v.z}); TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); return 'ok'; },pl);
  if (ok!=='ok'){ console.log('Orte:',ok); continue; }
  for (const [n,wx,sn,rd,tod] of CFG){
   await p.evaluate(([wx,sn,rd,tod])=>{ ATMO.wx=wx; ATMO.sn=sn; ATMO.snRd=rd; ATMO.tod=tod||'nachm'; ATMO.apply(); for (const k of ['a','d','m','r']) SNOW[k].value=SNOW.t[k]; WET.w.value=WET.tw; },[wx,sn,rd,tod]);
   for (const md of (MODE==='both'?['rider','high']:[MODE])){
    await p.evaluate((md)=>{ if (md==='high'){ const o=me.g.position, h=me.g.rotation.y, fx=Math.sin(h), fz=Math.cos(h); window._camFix=[o.x-fx*35+fz*12,o.y+22,o.z-fz*35-fx*12,o.x+fx*40,o.y,o.z+fz*40]; } else window._camFix=null; window.__F0=FRC; },md);
    await p.waitForFunction(()=>FRC>=window.__F0+(+(window.NF||25)),null,{timeout:1600000});
    await p.screenshot({timeout:180000,path:OUT+'/sn_'+pl+'_'+n+'_'+md+'.jpg',quality:82}); console.log('shot',pl,n,md); } } }
 await b.close(); })();
