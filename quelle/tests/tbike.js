// Studio-Bilder vom eigenen Rad + Fahrer im Menü (ohne Welt), 0.16.0. OUT Ordner, BIKES z. B. road,gravel,mtb, VIEWS side,front,top,hands,q34, GRIPS 0,1,2
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const W=+(process.env.W||900), H=+(process.env.H||620);
 const ctx=await b.newContext({viewport:{width:W,height:H}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if (m.type()==='error'||m.type()==='warning') console.log('C',m.text().slice(0,200)); });
 const t0=Date.now(); await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady && GPU_READY,null,{timeout:800000});
 console.log('bereit', (Date.now()-t0)/1000);
 await p.evaluate(()=>{ const cv=renderer.domElement; document.querySelectorAll('body *').forEach(e=>{ if(e!==cv && !e.contains(cv)) e.style.visibility='hidden'; }); cv.style.visibility='visible'; cv.style.zIndex=99999;
   const st=new THREE.Scene(); st.background=new THREE.Color(0xc8d4de); scene.remove(me.g); st.add(me.g); me.g.position.set(0,0,0); me.g.rotation.set(0,0,0);
   const gr=new THREE.Mesh(new THREE.PlaneGeometry(20,20).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({color:0x9a9a90, roughness:1})); gr.receiveShadow=true; st.add(gr);
   st.add(new THREE.HemisphereLight(0xffffff,0x606050,1.6)); const d=new THREE.DirectionalLight(0xffffff,2.2); d.position.set(3,6,4); st.add(d);
   window._ST=st; window._SC=new THREE.PerspectiveCamera(30, innerWidth/innerHeight, 0.05, 50); });
 const bikes=(process.env.BIKES||'road').split(','), views=(process.env.VIEWS||'side,q34,front,top,hands').split(','), grips=(process.env.GRIPS||'1').split(',').map(Number);
 const CAM={ side:[[3.6,0.95,0.1],[0,0.85,0.05]], side2:[[-3.6,0.95,0.1],[0,0.85,0.05]], q34:[[2.6,1.5,2.6],[0,0.8,0.1]], front:[[0,1.15,3.4],[0,0.95,0.2]], top:[[0.01,3.2,0.6],[0,0.8,0.45]],
   hands:[[0.9,1.25,1.25],[0.1,0.9,0.5]], handsF:[[0,1.05,1.45],[0,0.9,0.5]], back:[[1.5,1.4,-2.6],[0,0.8,0]] };
 for (const bk of bikes) for (const gi of grips){
   const ok=await p.evaluate(([bk,gi,STOP,DRINK])=>{ if (window.setRiderBike) setRiderBike(me,bk); window.GRIP_FORCE=gi; window.STOP_FORCE=+(STOP||0); if (DRINK){ GEST.id="drink"; GEST.t=+DRINK; GEST.dur=4.6; S.running=true; } for (let i=0;i<40;i++) animRider(me, 85, 8, 0.05, 200); return !!me.g; },[bk,gi,process.env.STOP,process.env.DRINK]);
   for (const v of views){ await p.evaluate(([c])=>{ _SC.position.set(...c[0]); _SC.lookAt(...c[1]); renderer.setRenderTarget(null); renderer.render(_ST,_SC); },[CAM[v]]);
     await p.waitForTimeout(300); await p.screenshot({path:(process.env.OUT||'.')+`/${bk}_${gi}_${v}.jpg`,quality:88}); console.log('bild',bk,gi,v); }
 }
 await b.close(); })();
