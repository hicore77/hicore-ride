// 0.19.2: Studio-Bilder der Trage-Pose (Schultern) ohne Welt. OUT Ordner, BIKES gravel,mtb, VIEWS, US Schrittphasen (z. B. 0,0.5,1), QS z. B. &x=1, OLD=1 setzt OLD_CARRYARM2
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
 const bikes=(process.env.BIKES||'gravel').split(','), views=(process.env.VIEWS||'left,front,q34,right').split(','), us=(process.env.US||'0.5').split(',').map(Number);
 for (const bk of bikes) for (const u of us){
   await p.evaluate(([bk,u])=>{ if (window.setRiderBike) setRiderBike(me,bk); me.stairK=1; me.stairM='shoulder';
     const f=(s,ph)=>{ const w=(u-ph)/2, fr=w-Math.floor(w); return fr<0.5?{x:0.22+s*0.11,y:0,gr:0,z:-0.35+fr*0.0,heel:0}:{x:0.22+s*0.11,y:Math.sin(Math.PI*(fr-0.5)*2)*0.1,gr:0,z:-0.35+(fr-0.5)*2*0.7,heel:0}; };
     window.stairCarry=r=>({k:1, mode:'shoulder', xr:0.22, hz:0.02, yb:0, feet:{Left:f(1,0),Right:f(-1,1)}, u, up:1, lift:0, bg:r.bikeG});
     for (let i=0;i<30;i++) animRider(me,0,0,0.05,0); },[bk,u]);
   // Messung im Rad-Koordinatensystem: wo kreuzt der rechte Arm die Rahmenebene, Abstand Unterarm zum Steuerrohr
   console.log('mess', bk, u, JSON.stringify(await p.evaluate(()=>{ const bg=me.bikeG, B=me.glb.B, V=THREE.Vector3; me.g.updateMatrixWorld(true); const L=b=>bg.worldToLocal(B[b].getWorldPosition(new V()));
     const s=L('RightArm'), e=L('RightForeArm'), w=L('RightHand'), G=BIKE_GEO[me.rig&&me.rig.T||'gravel']||BIKE_GEO.gravel, ht0=G.HT, ht1=G.HB;
     const segD=(a,b,c,d)=>{ let m=1e9; for (let i=0;i<=20;i++){ const p=a.clone().lerp(b,i/20); for (let j=0;j<=20;j++) m=Math.min(m,p.distanceTo(c.clone().lerp(d,j/20))); } return m; };
     const cross=(a,b)=>{ if ((a.x>0)===(b.x>0)) return null; const t=a.x/(a.x-b.x), q=a.clone().lerp(b,t); const k=(q.y-ht1.y)/(ht0.y-ht1.y), hz=ht1.z+(ht0.z-ht1.z)*k; return {y:+q.y.toFixed(3), z:+q.z.toFixed(3), htZ:+hz.toFixed(3), hinterHT:q.z<hz, abstand:+(q.z-hz).toFixed(3)}; };
     const f=v=>v.toArray().map(x=>+x.toFixed(3));
     return {sh:f(s), el:f(e), wr:f(w), crossUpper:cross(s,e), crossFore:cross(e,w), dForeHT:+segD(e,w,ht0,ht1).toFixed(3), dUpperHT:+segD(s,e,ht0,ht1).toFixed(3), wrSide:w.x>0?'innen':'aussen'}; })));
   for (const v of views){ await p.evaluate(([c])=>{ _SC.position.set(...c[0]); _SC.lookAt(...c[1]); renderer.setRenderTarget(null); renderer.render(_ST,_SC); },[CAM[v]]);
     await p.waitForTimeout(300); await p.screenshot({path:(process.env.OUT||'.')+`/carry_${process.env.TAG||''}${bk}_${u}_${v}${process.env.OLD?'_old':''}.jpg`,quality:86}); console.log('bild',bk,u,v); }
 }
 await b.close(); })();
