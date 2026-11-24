// 0.16.1: Einmündungen von Wegen an der Hauptrunde (Standardstart): Bilder schräg von der Straße und von oben. OUT Ordner, D0/D1 Bereich in m, NMAX Anzahl
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); BIKE='gravel'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const J=await p.evaluate(([d0,d1,nm])=>{ $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'});
   const R=gnRG(), out=[]; NET.appl.clear(); NET.pend=null; let last='';
   for (let d=d0; d<d1 && out.length<nm; d+=3){ S.dist=d; gNetStep(); const P=NET.pend; if (P && P.tag!==last){ last=P.tag; const o=P.opts.find(o=>R.edges[o.e].kind==='w'); if (o){ const n=R.nodes[P.node]; out.push({x:n.x,z:n.z,rd:P.rd,a:Math.round(o.a),name:o.name}); } } }
   NET.pend=null; return {L:Math.round(L), out}; }, [+(process.env.D0||0), +(process.env.D1||4000), +(process.env.NMAX||3)]);
 console.log(JSON.stringify(J)); const OUT=process.env.OUT||'.';
 for (let k=0;k<J.out.length;k++){ const j=J.out[k];
   for (const md of ['low','top']){ await p.evaluate(([j,md])=>{ const back=posAt(j.rd-18), fw=posAt(j.rd), y=fw.y; S.dist=j.rd-25; const dx=fw.x-back.x, dz=fw.z-back.z, l=Math.hypot(dx,dz)||1;
       window._camFix = md==='top' ? [fw.x-dx/l*8, y+38, fw.z-dz/l*8, fw.x, y, fw.z] : [back.x, y+3.2, back.z, fw.x+dx/l*6, y, fw.z+dz/l*6]; window.__F0=FRC; }, [j,md]);
     await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:OUT+'/m'+k+'_'+md+'.jpg',quality:85}); console.log('shot',k,md); } }
 await b.close(); })();
