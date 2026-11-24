// 0.17.2: echte Bäume aus Luftbild (DOP) bei Jonsdorf. PTS=[[x,z,blickx,blickz,augenhoehe],...], NODOPT=1 = alter Stand zum Vergleich, OUT Ordner.
// Gibt je Bild die Zahl der Bauminstanzen der Waldkachel (Wald + Einzelbäume) und die DOP-Bäume der Kachel aus.
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='error') console.log('C',m.text().slice(0,200)); });
 if (process.env.NODOPT) await p.addInitScript(()=>{ window.NO_DOPT=1; });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const PTS=process.env.PTS?JSON.parse(process.env.PTS):await p.evaluate(()=>{ const v=(GN.d.vill||[]).find(q=>q.name==='Jonsdorf'); let best=null, bd=1e9; GN.d.edges.forEach(E=>{ for (let i=0;i+4<E.P.length;i++){ const q=E.P[i], d=Math.hypot(q.x-v.x,q.z-v.z); if (d<bd){ bd=d; best=[q,E.P[i+4]]; } } });
   const [a,c]=best, L=Math.hypot(c.x-a.x,c.z-a.z)||1, ux=(c.x-a.x)/L, uz=(c.z-a.z)/L; return [[a.x,a.z,a.x+ux*60,a.z+uz*60,2.5],[a.x-ux*60,a.z-uz*60,a.x+ux*40,a.z+uz*40,2.5],[v.x-60,v.z+260,v.x,v.z-80,110]]; });
 console.log('PTS',JSON.stringify(PTS.map(q=>q.map(Math.round))));
 for (let k=0;k<PTS.length;k++){ const [x,z,lx,lz,hh]=PTS[k];
  await p.evaluate(([x,z,lx,lz,hh])=>{ $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); const y=terrainH(x,z); window._camFix=[x,y+(hh||3),z,lx,terrainH(lx,lz)+1,lz]; me.g.position.set(x,y,z); camera.position.set(x,y+(hh||3),z); }, [x,z,lx,lz,hh]);
  await p.evaluate(([x,z])=>kcWait([{x,z}],2600,30000).then(()=>{ gtStream({x,z},999); try{ gpuFixInst(scene); }catch(e){} }), [x,z]);
  await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000});
  const info=await p.evaluate(([x,z])=>{ const S=GT.S, i=Math.floor(x/S), j=Math.floor(z/S); let inst=0, tiles=0, dop=0; for (let a=-1;a<=1;a++) for (let c=-1;c<=1;c++){ const t=GT.tiles.get((i+a)+','+(j+c)); if (t&&t.fo){ tiles++; t.fo.types.forEach(ty=>inst+=ty.L.length); } const L=GT.ot&&GT.ot.get((i+a)+','+(j+c)); if (L) for (let q=2;q<L.length;q+=3) if (L[q]>=16) dop++; }
    return {tile:i+','+j, tiles3x3:tiles, baumInstanzen3x3:inst, dopBaeume3x3:dop, wald:gnForest(x,z), dopw:gnDopW(x,z), kh:GT.kh}; },[x,z]); console.log('Bild',k,JSON.stringify(info));
  await p.screenshot({timeout:300000,path:(process.env.OUT||'.')+'/dop_'+(process.env.NODOPT?'alt_':'')+k+'.jpg',quality:80}); }
 await b.close(); })();
