// 0.15.0: Abbiegen von der Straße in einen Weg im laufenden Spiel (gNetStep), dann Bilder: Fahrer auf dem Weg, Wegbrücke, Wurzelstelle. PL Ort, OUT Ordner, BIKE Rad
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='error') console.log('C',m.text().slice(0,200)); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate((bk)=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); BIKE=bk; $('bSim').click(); }, process.env.BIKE||'mtb');
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r=await p.evaluate((pl)=>{ const v=(GN.d.vill||[]).find(q=>q.name===pl); zgApplyStart({x:v.x,z:v.z}); $('simW').value=0; TRAFFIC.nextT=1e9;
   const R=gnRG(), C=NET.cur; let tgt=null; const log=[]; NET.appl.clear(); NET.pend=null; const d0=S.dist;
   for (let d=d0+50; d<d0+L-200 && !tgt; d+=3){ S.dist=d; gNetStep(); const P=NET.pend; if (P && P.ah>45 && P.ah<70){ const o=P.opts.find(o=>R.edges[o.e].kind==='w' && R.edges[o.e].len>40); if (o) tgt={n:P.node, e:o.e, rd:P.rd}; } }
   if (!tgt) return {err:'kein Abzweig'}; window.__T=tgt; window.__C=C;
   log.push('Hinweis: '+NET.pend.opts.map(o=>o.label+' '+o.name).join(' | ')); NET.pick=tgt.e; gJunUI(NET.pend,NET.pend.ah);
   window.__F0=FRC; return {tgt:{n:tgt.n,e:tgt.e}, log}; }, process.env.PL||'Jonsdorf');
 console.log(JSON.stringify(r)); const OUT=process.env.OUT||'.';
 if (r.tgt){ await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:OUT+'/weg_hinweis.jpg',quality:85}); console.log('shot hinweis');
  const r2=await p.evaluate(()=>{ const tgt=window.__T, C=window.__C; for (let d=S.dist; d<tgt.rd+5; d+=3){ S.dist=d; gNetStep(); if (NET.cur!==C) break; }
    const on=NET.cur.ents.some(en=>en.e===tgt.e); S.dist+=35; const E=gEdgeAt(S.dist); window.__F0=FRC; return {turned:NET.cur!==C, onWay:on, edge:gWayName(E), crr:gEdgeCrr(E), L:Math.round(L)}; });
  console.log(JSON.stringify(r2)); r.onWay=r2.onWay; }
 if (r.onWay){ await p.evaluate(()=>{ document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+8,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:OUT+'/weg_fahren.jpg',quality:85}); console.log('shot fahren'); }
 for (const md of ['bruecke','wurzeln']){
  const q=await p.evaluate((md)=>{ const R=gnRG(), P0=me.g.position; let best=null, bd=1e9;
    if (md==='bruecke') R.edges.forEach(E=>{ if (E.kind!=='w' || !E.br || E.len<10) return; const d=Math.hypot(E.xz[0]-P0.x,E.xz[1]-P0.z); if (d<bd){ bd=d; best=E; } });
    else R.roots.forEach(l=>l.forEach(rr=>{ const d=Math.hypot(rr[0]-P0.x,rr[1]-P0.z); if (d<bd && d<1500 && gnForest(rr[0],rr[1])){ bd=d; best=rr; } }));
    if (!best) return null; let x,z,dx,dz,y; if (md==='bruecke'){ const P=best.P, k=Math.floor(P.length/2), a=P[0], c=P[P.length-1]; x=(a.x+c.x)/2; z=(a.z+c.z)/2; y=(a.y+c.y)/2; dx=c.x-a.x; dz=c.z-a.z; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l;
      window._camFix=[x-dz*14-dx*6, y+4, z+dx*14-dz*6, x, y, z]; } else { [x,z,dx,dz]=best; y=terrainH(x,z); window._camFix=[x-dx*5, y+1.8, z-dz*5, x+dx*2, y, z+dz*2]; }
    /* Fahrer und Kacheln dorthin */ me.g.position.set(x,y,z); window.__F0=FRC; return {md, d:Math.round(bd), x:Math.round(x), z:Math.round(z), name:best.kind?gWayName(best):'wurzel'}; }, md);
  console.log(JSON.stringify(q)); if (!q) continue; await p.waitForTimeout(2000); await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+10,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:OUT+'/weg_'+md+'.jpg',quality:85}); console.log('shot',md); }
 await b.close(); })();
