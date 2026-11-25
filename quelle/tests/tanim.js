// 0.22.0 Kontrollbilder: Auto seitlich (Räder, Blinker), Reh/Hirsch/Kuh mit Skelett. OUT=Ordner
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:560}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(m.type()==='error'||m.type()==='warning'||/tier|räder|lampen/.test(m.text())) console.log('CE',m.text().slice(0,300)); });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000}); console.log('läuft');
 const OUT=process.env.OUT||'.';
 await p.evaluate(()=>{ document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); $('simW').value=0; ATMO.tod='mittag'; try{ATMO.apply();}catch(e){} TRAFFIC.nextT=1e9; });
 const frames=async n=>{ await p.evaluate(()=>window.__F0=FRC); await p.waitForFunction(n=>FRC>=window.__F0+n,n,{timeout:1600000}); };
 const cam=async(E,T)=>p.evaluate(([E,T])=>{ window._camFix=[E[0],E[1],E[2],T[0],T[1],T[2]]; },[E,T]);
 /* Auto */
 await p.evaluate(()=>{ $('simW').value=0; S.speed=0; });
 for (const ti of (process.env.TI||'1,4').split(',').map(Number)){
  await p.evaluate(ti=>{ TRAFFIC.act.slice().forEach(c=>TRAFFIC.kill(c)); TRAFFIC.spawn(0.6, ti); const c=TRAFFIC.act[0]; c.d=S.dist+8*(S.dir||1); c.v=0; c.mode='stop'; c.stopT=1e9; window.__car=c; },ti);
  await frames(3); await p.evaluate(()=>{ window.__ts=TRAFFIC.step; TRAFFIC.step=()=>{}; });
  const pos=await p.evaluate(()=>{ const c=window.__car, g=c.o; g.updateMatrixWorld(true); const P=g.getWorldPosition(new THREE.Vector3()); const f=new THREE.Vector3(0,0,1).applyQuaternion(g.quaternion); const sd=new THREE.Vector3(f.z,0,-f.x); return {P:[P.x,P.y,P.z], f:[f.x,f.z], s:[sd.x,sd.z], wh:c.wh.length, bl:!!c.bl, m:TRAFFIC.types[c.ti].m}; });
  console.log('auto', JSON.stringify(pos));
  const P=pos.P, s=pos.s, f=pos.f;
  await cam([P[0]+s[0]*5.5+f[0]*1.5, P[1]+1.0, P[2]+s[1]*5.5+f[1]*1.5],[P[0],P[1]+0.6,P[2]]); await frames(4); await p.screenshot({path:OUT+'/car'+ti+'_seite.jpg',quality:85});
  await p.evaluate(()=>{ const c=window.__car; c.bl&&c.bl.L.forEach(q=>q.visible=true); c.wh.forEach(w=>{ if (w.steer) w.pv.rotation.y=w.ry0+0.35; }); });
  await cam([P[0]+s[0]*3.5+f[0]*5.5, P[1]+1.3, P[2]+s[1]*3.5+f[1]*5.5],[P[0],P[1]+0.5,P[2]]); await frames(4); await p.screenshot({path:OUT+'/car'+ti+'_vorn_blink.jpg',quality:85});
  await cam([P[0]+s[0]*3.5-f[0]*6, P[1]+1.3, P[2]+s[1]*3.5-f[1]*6],[P[0],P[1]+0.5,P[2]]); await frames(4); await p.screenshot({path:OUT+'/car'+ti+'_hinten_blink.jpg',quality:85});
 }
 await p.evaluate(()=>{ TRAFFIC.step=window.__ts||TRAFFIC.step; TRAFFIC.act.slice().forEach(c=>TRAFFIC.kill(c)); });
 /* Tiere: neben der Strecke spawnen und Bilder in Bewegung */
 for (const kind of (process.env.KINDS||'reh,hirsch').split(',')){
  const r=await p.evaluate(kind=>{ const P=me.g.position, hd=me.g.rotation.y, x=P.x+Math.sin(hd)*100+Math.cos(hd)*6, z=P.z+Math.cos(hd)*100-Math.sin(hd)*6; EGG.list.forEach(e=>e.o.parent&&e.o.parent.remove(e.o)); EGG.list=[]; EGG.cd.deer=1e9;
     const e=eggSpawn(kind,x,z,hd+Math.PI/2,{deer:1,fx:x+Math.cos(hd)*60,fz:z-Math.sin(hd)*60}); window.__e=e; return {x,z,y:e.o.position.y,an:!!e.o.userData.an, gait:e.o.userData.an&&e.o.userData.an.gait}; },kind);
  console.log('tier',kind,JSON.stringify(r));
  await cam([r.x+0.1, r.y+1.6, r.z+ (kind==='hirsch'?7:5)],[r.x,r.y+0.7,r.z]);
  // ruhig: grasen/schauen
  await frames(6); await p.screenshot({path:OUT+'/'+kind+'_ruhig.jpg',quality:85});
  // Schritt
  await p.evaluate(()=>{ const e=window.__e; e.mode='walk'; e.st=100; e.wy=e.o.rotation.y; }); for (let k=0;k<3;k++){ await frames(3); await p.screenshot({path:OUT+'/'+kind+'_schritt'+k+'.jpg',quality:85}); }
  // Flucht: Kamera folgt
  await p.evaluate(()=>{ const e=window.__e; e.flee=1; e.ft=0; });
  for (let k=0;k<4;k++){ await frames(2); const q=await p.evaluate(()=>{ const o=window.__e.o; return [o.position.x,o.position.y,o.position.z, window.__e.v, o.userData.an.gait]; }); console.log('flucht',k,JSON.stringify(q)); await cam([q[0]+0.1,q[1]+1.6,q[2]+6],[q[0],q[1]+0.7,q[2]]); await frames(1); await p.screenshot({path:OUT+'/'+kind+'_flucht'+k+'.jpg',quality:85}); }
 }
 const st=await p.evaluate(()=>({crit:critters.filter(c=>c.o.userData.an).length, all:critters.length, kinds:[...new Set(critters.map(c=>c.kind))].join(',')})); console.log('critters',JSON.stringify(st));
 await b.close(); })();
