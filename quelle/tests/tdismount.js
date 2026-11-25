// 0.19.8: Absteigen über den Sattel als Bildfolge. KS z. B. 0,0.2,0.4 (Übergang k), VIEWS, BIKES. Abgeleitet von tcarry.js. OUT Ordner, BIKES gravel,mtb, VIEWS, US Schrittphasen (z. B. 0,0.5,1), QS z. B. &x=1, OLD=1 setzt OLD_CARRYARM2
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:700,height:620}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.addInitScript(([o,ca])=>{ if (o) window.OLD_CARRYARM2=true; if (ca) window.__CA=JSON.parse(ca); }, [!!process.env.OLD, process.env.CA||'']);
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady && GPU_READY,null,{timeout:800000});
 await p.evaluate(()=>{ const cv=renderer.domElement; document.querySelectorAll('body *').forEach(e=>{ if(e!==cv && !e.contains(cv)) e.style.visibility='hidden'; }); cv.style.visibility='visible'; cv.style.zIndex=99999;
   const st=new THREE.Scene(); st.background=new THREE.Color(0xc8d4de); scene.remove(me.g); st.add(me.g); me.g.position.set(0,0,0); me.g.rotation.set(0,0,0);
   const gr=new THREE.Mesh(new THREE.PlaneGeometry(20,20).rotateX(-Math.PI/2), new THREE.MeshStandardMaterial({color:0x9a9a90, roughness:1})); st.add(gr);
   st.add(new THREE.HemisphereLight(0xffffff,0x606050,1.6)); const d=new THREE.DirectionalLight(0xffffff,2.2); d.position.set(3,6,4); st.add(d);
   window._ST=st; window._SC=new THREE.PerspectiveCamera(30, innerWidth/innerHeight, 0.05, 50); });
 const CAM={ left:[[-3.4,1.2,0.4],[0.1,1.0,0.1]], right:[[3.4,1.2,0.4],[0.1,1.0,0.1]], front:[[0.3,1.3,3.4],[0.15,1.0,0]], fl:[[1.6,1.6,2.4],[0.1,1.1,0.2]], q34:[[-2.2,1.6,2.4],[0.1,1.0,0.1]], back:[[0.2,1.4,-3.2],[0.1,1.1,0]], outer:[[-2.6,1.4,1.2],[0,1.15,0.2]], ic:[[1.3,1.35,1.1],[0.0,1.15,0.35]], oc:[[-1.4,1.35,1.0],[0.0,1.15,0.35]] };
 const bikes=(process.env.BIKES||'gravel').split(','), views=(process.env.VIEWS||'left,front,q34,right').split(',').filter(v=>CAM[v]), us=(process.env.US||'0.5').split(',').map(Number);
 for (const bk of bikes) for (const kk of (process.env.KS||'0.1,0.25,0.4,0.55,0.7,0.85').split(',').map(Number)) for (const u of us){
   await p.evaluate(([bk,u,kk])=>{ if (window.setRiderBike) setRiderBike(me,bk); me.stairK=kk; me.stairM='shoulder'; me.crankAng=kk<0.85?0:Math.PI/2;
     const f=(s,ph)=>{ const w=(u-ph)/2, fr=w-Math.floor(w); return fr<0.5?{x:0.22+s*0.11,y:0,gr:0,z:-0.35+fr*0.0,heel:0}:{x:0.22+s*0.11,y:Math.sin(Math.PI*(fr-0.5)*2)*0.1,gr:0,z:-0.35+(fr-0.5)*2*0.7,heel:0}; };
     window.stairCarry=r=>({k:kk, mode:'shoulder', xr:0.22, hz:0.02, yb:0, feet:{Left:f(1,0),Right:f(-1,1)}, u, up:1, lift:0, bg:r.bikeG});
     for (let i=0;i<30;i++) animRider(me,0,0,0.05,0); },[bk,u,kk]);
   // Messung im Rad-Koordinatensystem: wo kreuzt der rechte Arm die Rahmenebene, Abstand Unterarm zum Steuerrohr
   console.log('mess', bk, kk, JSON.stringify(await p.evaluate(()=>{ const bg=me.bikeG, B=me.glb.B, V=THREE.Vector3; me.g.updateMatrixWorld(true); const L=b=>me.g.worldToLocal(B[b].getWorldPosition(new V())).toArray().map(x=>+x.toFixed(2));
     return {rFoot:L('RightFoot'), rKnee:L('RightLeg'), rHip:L('RightUpLeg'), lFoot:L('LeftFoot'), hipY:me.rig&&bikeRig(me.rig.T||'gravel').hipY, crank:+me.crankAng.toFixed(2)}; })));
   for (const v of views){ await p.evaluate(([c])=>{ _SC.position.set(...c[0]); _SC.lookAt(...c[1]); renderer.setRenderTarget(null); renderer.render(_ST,_SC); },[CAM[v]]);
     await p.waitForTimeout(300); await p.screenshot({path:(process.env.OUT||'.')+`/dis_${process.env.TAG||''}${bk}_${kk}_${v}${process.env.OLD?'_old':''}.jpg`,quality:86}); console.log('bild',bk,u,v); }
 }
 await b.close(); })();
