/* Fahrer + Rennrad aus Hicore Ride (src.html Zeilen 2337-2841), für die WebGPU-Testwelt */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)); const LITE=false, IS_MOBILE=false;
function mkIM(g,m,n){ const im=new THREE.InstancedMesh(g,m,n); im.frustumCulled=false; return im; }
function pbrMarkLin(root){ root.traverse(o=>{ if (o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ m.userData.lin=true; }); }); }
// Detaillierter Fahrer + Rennrad. Koordinaten: +z = vorn, y = oben, Einheit Meter.
const UPV = new THREE.Vector3(0,1,0);
const _geoCache = {};
function cylG(rt, rb, seg){ const k='c'+rt+'_'+rb+'_'+seg; return _geoCache[k] || (_geoCache[k]=new THREE.CylinderGeometry(rt, rb, 1, seg||10)); }
function sphG(r, w, h){ const k='s'+r+'_'+(w||12)+'_'+(h||10); return _geoCache[k] || (_geoCache[k]=new THREE.SphereGeometry(r, w||12, h||10)); }
// Gliedmaße als Drehkörper: Profil [[t(0..1 von unten), radius], …], Länge 1, zentriert
function latheG(key, prof, seg){ if (_geoCache[key]) return _geoCache[key];
  const pts=prof.map(([t,r])=>new THREE.Vector2(Math.max(r,0.0005), t-0.5)); const g=new THREE.LatheGeometry(pts, seg||16); g.computeVertexNormals(); return (_geoCache[key]=g); }
function stretch(mesh, a, b){ const d=new THREE.Vector3().subVectors(b,a); const len=d.length()||1e-4; mesh.position.copy(a).addScaledVector(d,0.5); mesh.scale.y=len; mesh.quaternion.setFromUnitVectors(UPV, d.divideScalar(len)); }
function tube(parent, mat, r, a, b, rb){ const m=new THREE.Mesh(cylG(r, rb===undefined?r:rb, 10), mat); stretch(m, a, b); parent.add(m); return m; }
const V = (x,y,z)=>new THREE.Vector3(x,y,z);
// 2-Gelenk-IK in der y-z-Ebene: Gelenk knickt Richtung bend (+1 = nach vorn)
function ik2(A, T, la, lb, bend, out){
  const dz=T.z-A.z, dy=T.y-A.y; let d=Math.hypot(dz,dy); d=clamp(d, Math.abs(la-lb)+1e-3, la+lb-1e-3);
  const th=Math.atan2(dy,dz), al=Math.acos(clamp((la*la+d*d-lb*lb)/(2*la*d),-1,1));
  const ang=th+bend*al; return out.set(A.x+(T.x-A.x)*la/(la+lb), A.y+Math.sin(ang)*la, A.z+Math.cos(ang)*la);
}
const hex = c => '#'+new THREE.Color(c).getHexString();
function jerseyTexture(main, accent, num){
  const c=document.createElement('canvas'); c.width=256; c.height=256; const g=c.getContext('2d');
  g.fillStyle=hex(main); g.fillRect(0,0,256,256);
  // Seitenpaneele (dunkler) und Brust-/Rückenstreifen
  const gr=g.createLinearGradient(0,0,256,0); gr.addColorStop(0,'rgba(0,0,0,.25)'); gr.addColorStop(0.2,'rgba(0,0,0,0)'); gr.addColorStop(0.3,'rgba(0,0,0,0)'); gr.addColorStop(0.5,'rgba(0,0,0,.25)'); gr.addColorStop(0.7,'rgba(0,0,0,0)'); gr.addColorStop(0.8,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,.25)');
  g.fillStyle=gr; g.fillRect(0,0,256,256);
  g.fillStyle=hex(accent); g.fillRect(0,150,256,26); g.fillRect(0,0,256,14);
  g.fillStyle='rgba(255,255,255,.9)'; g.fillRect(0,178,256,4);
  // Reißverschluss vorn (u≈0.25), Startnummer hinten (u≈0.75)
  g.fillStyle='rgba(0,0,0,.45)'; g.fillRect(62,0,3,256);
  if (num){ g.fillStyle='#fff'; g.fillRect(166,190,52,40); g.fillStyle='#111'; g.font='bold 30px system-ui'; g.textAlign='center'; g.fillText(num,192,222); }
  g.fillStyle='rgba(255,255,255,.95)'; g.font='bold 22px system-ui'; g.textAlign='center'; g.fillText('HICORE',192,120); g.fillText('HICORE',64,120);
  const t=new THREE.CanvasTexture(c); t.anisotropy=4; return t;
}
function helmetTexture(main, accent){
  const c=document.createElement('canvas'); c.width=256; c.height=128; const g=c.getContext('2d');
  g.fillStyle=hex(main); g.fillRect(0,0,256,128);
  g.fillStyle=hex(accent); g.fillRect(0,96,256,32);
  g.fillStyle='rgba(10,10,10,.85)';
  for (let i=0;i<10;i++){ const x=i*25.6+6; g.beginPath(); g.ellipse(x+6,48,4,26,0,0,Math.PI*2); g.fill(); }
  const t=new THREE.CanvasTexture(c); return t;
}
// Umgebungs-Spiegelung nur für Fahrradteile: Himmel oben, Boden unten, heller Sonnenfleck (macht Metall/Lack plastisch)
let _bikeEnv=null;
function bikeEnv(){ if (_bikeEnv) return _bikeEnv; try{
  const es=new THREE.Scene(), g=new THREE.SphereGeometry(10,32,16), c=[], p=g.attributes.position;
  for (let i=0;i<p.count;i++){ const y=p.getY(i)/10, x=p.getX(i)/10, z=p.getZ(i)/10; let col;
    if (y>0) col=new THREE.Color(0xd8ecff).lerp(new THREE.Color(0x6aa6e8), y); else col=new THREE.Color(0x9a9c94).lerp(new THREE.Color(0x4f6b3a), Math.min(1,-y*2));
    const sun=Math.max(0, x*0.5+y*0.7+z*0.5); col.lerp(new THREE.Color(0xffffff), Math.pow(sun,8)); c.push(col.r,col.g,col.b); }
  g.setAttribute('color',new THREE.Float32BufferAttribute(c,3)); es.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true, side:THREE.BackSide})));
  const pm=new THREE.PMREMGenerator(renderer); _bikeEnv=pm.fromScene(es,0.02).texture; pm.dispose(); }catch(e){ _bikeEnv=null; } return _bikeEnv; }
// Glatter Carbon-Aero-Rahmen + Gabel aus Blender (window.BIKE_FRAME_B64); bis er geladen ist, bleibt der Rohr-Rahmen sichtbar
const BIKEF={geos:null, wait:[], loading:false};
function bikeFrameAttach(bike, fc, mat){
  const put=()=>{ if (!BIKEF.geos || !bike.parent && !bike.userData.keep) {}
    BIKEF.geos.forEach(g=>{ const m=new THREE.Mesh(g,mat); m.castShadow=true; m.receiveShadow=true; bike.add(m); }); fc.visible=false; bike.userData.glbFrame=true; };
  if (BIKEF.geos) return put();
  if (!window.BIKE_FRAME_B64 || !THREE.GLTFLoader) return;
  BIKEF.wait.push(put);
  if (BIKEF.loading) return; BIKEF.loading=true;
  const u8=Uint8Array.from(atob(window.BIKE_FRAME_B64),c=>c.charCodeAt(0));
  new THREE.GLTFLoader().parse(u8.buffer,'',gl=>{ const gs=[]; gl.scene.updateMatrixWorld(true); gl.scene.traverse(o=>{ if (o.isMesh){ const g=o.geometry.clone(); g.applyMatrix4(o.matrixWorld); if(!g.attributes.normal) g.computeVertexNormals(); gs.push(g); } });
    BIKEF.geos=gs; BIKEF.wait.splice(0).forEach(f=>f()); }, e=>console.warn('Rahmen', e));
}
function makeRider(o){
  const opt = Object.assign({jersey:0xff7a1a, accent:0x111111, frame:0x1d1f24, frameAccent:0xff7a1a, helmet:0xffffff, skin:0xd9a07a, hair:0x3b2a1e, num:''}, o||{});
  const std = (c, r, m)=>new THREE.MeshStandardMaterial({color:c, roughness:r===undefined?0.6:r, metalness:m||0});
  const M = {
    frame: new THREE.MeshPhysicalMaterial({color:opt.frame, roughness:0.32, metalness:0.35, clearcoat:1, clearcoatRoughness:0.06}), accent: std(opt.frameAccent,0.3,0.4), alu: std(0xc4c8cf,0.25,0.9), black: std(0x161616,0.6), carbon: std(0x202124,0.35,0.3),
    tire: std(0x1a1a1a,0.95), tireSide: std(0x8a6a45,0.9), rim: std(0x1d1f22,0.3,0.5), skin: std(opt.skin,0.65), shorts: std(0x111216,0.5),
    jersey: new THREE.MeshStandardMaterial({map:jerseyTexture(opt.jersey,opt.accent,opt.num), roughness:0.5}),
    sleeve: std(opt.jersey,0.5), cuff: std(opt.accent,0.5), helmet: new THREE.MeshStandardMaterial({map:helmetTexture(opt.helmet,opt.accent), roughness:0.3, metalness:0.1}),
    glass: std(0x101010,0.05,0.9), lens: new THREE.MeshStandardMaterial({color:0xff9a3c, roughness:0.05, metalness:1}), shoe: std(0xf4f4f4,0.35), sole: std(0x1a1a1a,0.5),
    sock: std(0xffffff,0.8), glove: std(0x1b1b1b,0.7), hair: std(opt.hair,0.8), saddle: std(0x141414,0.45)
  };
  const g=new THREE.Group(), bike=new THREE.Group(); g.add(bike);
  // ---------- Rad
  const RA=V(0,0.335,-0.505), FA=V(0,0.335,0.555), BB=V(0,0.27,-0.08), ST=V(0,0.80,-0.24), HT=V(0,0.83,0.36), HB=V(0,0.69,0.40), DT0=HB.clone().lerp(HT,0.22);   // Renngeometrie: Lenkwinkel ~74°, Vorbiegung 45 mm
  // Rahmen: ovale, konische Rohre mit Klarlack, verrundete Knotenpunkte
  const fc=new THREE.Group(); bike.add(fc);   // Rahmen aus Rohren (Ersatz, falls das Blender-Modell fehlt)
  const ft=(r,a,b,rb,sx,sz,mat)=>{ const m=new THREE.Mesh(cylG(r,rb===undefined?r:rb,24),mat||M.frame); stretch(m,a,b); m.scale.x=sx||1; m.scale.z=sz||1; fc.add(m); return m; };
  const TTs=ST.clone().lerp(HT,0.04), TTe=HT.clone().lerp(ST,0.03);
  ft(0.021,TTs,TTe,0.024,1.25,0.78);                        // Oberrohr: breit und flach
  ft(0.029,DT0,BB,0.033,1.22,0.92);    // Unterrohr: kräftig, unten breiter
  ft(0.021,BB,ST,0.025,1.05,1.0);                           // Sitzrohr
  ft(0.036,HB.clone().add(V(0,-0.03,0.012)),HT.clone().add(V(0,0.02,-0.008)),0.029,1,1); // Steuerrohr konisch
  [[HB.clone().add(V(0,-0.03,0.012)),0.037],[HT.clone().add(V(0,0.02,-0.008)),0.03]].forEach(([p,r])=>{ const cup=new THREE.Mesh(new THREE.CylinderGeometry(r+0.002,r+0.002,0.008,24),M.black); cup.position.copy(p); cup.quaternion.setFromUnitVectors(UPV,new THREE.Vector3().subVectors(HT,HB).normalize()); bike.add(cup); });
  [[ST,0.027,1.15],[HT,0.03,1.1],[HB,0.034,1.15],[BB,0.036,1.2]].forEach(([p,r,sx])=>{ const j=new THREE.Mesh(sphG(r,20,14),M.frame); j.position.copy(p); j.scale.set(sx,1,1); fc.add(j); });
  [-0.055,0.055].forEach(x=>{ const cs0=V(x*0.55,BB.y+0.005,BB.z-0.03), cs1=V(x,RA.y+0.01,RA.z+0.02), cm=cs0.clone().lerp(cs1,0.5).add(V(x*0.15,0.012,0));
    ft(0.0125,cs0,cm,0.0115,0.85,1.15); ft(0.0115,cm,cs1,0.0095,0.85,1.1);                 // Kettenstreben, leicht gebogen
    const ss0=V(x*0.4,ST.y-0.06,ST.z-0.02), ss1=V(x,RA.y+0.02,RA.z+0.01); ft(0.011,ss0,ss1,0.0085,0.9,1.1);   // Sitzstreben
    const fk0=V(x*0.62,HB.y-0.03,HB.z+0.012), fk1=V(x,FA.y+0.012,FA.z-0.004), fkm=fk0.clone().lerp(fk1,0.6).add(V(0,0,0.012)), fkq=fk0.clone().lerp(fk1,0.85).add(V(0,0,0.016));
    ft(0.021,fk0,fkm,0.0175,0.72,1.55); ft(0.0175,fkm,fkq,0.014,0.72,1.5); ft(0.014,fkq,fk1,0.011,0.72,1.35);   // Carbon-Gabel: aero-oval, konisch, leicht nach vorn gebogen
    const dp=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.036,0.03),M.frame); dp.position.set(x,RA.y+0.006,RA.z+0.004); fc.add(dp); });
  { const cr=new THREE.Mesh(sphG(0.05,20,12),M.frame); cr.scale.set(1.0,0.42,0.62); cr.position.set(0,HB.y-0.03,HB.z+0.012); fc.add(cr); }  // Gabelkrone, verrundet
  tube(fc,M.accent,0.023,V(0,0.807,0.24),V(0,0.815,0.30),0.023);      // Dekor Oberrohr
  const bbShell=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.08,14),M.frame); bbShell.rotation.z=Math.PI/2; bbShell.position.copy(BB); fc.add(bbShell);
  bikeFrameAttach(bike, fc, M.frame);
  // Sattelstütze + Sattel (geformt)
  const SP=V(0,0.93,-0.285); const post=tube(bike,M.carbon,0.015,ST,SP);
  const sGeo=new THREE.SphereGeometry(0.1,18,10); sGeo.scale(0.7,0.2,1.4); const saddle=new THREE.Mesh(sGeo,M.saddle); saddle.position.set(0,0.945,-0.27); bike.add(saddle);
  const nose=new THREE.Mesh(sphG(0.035,10,8),M.saddle); nose.scale.set(1,0.6,2.2); nose.position.set(0,0.94,-0.14); bike.add(nose);
  // Vorbau, Lenker, Schalt-/Bremsgriffe, Lenkerband
  tube(bike,M.black,0.017,HT,V(0,0.865,0.37)); tube(bike,M.black,0.016,V(0,0.865,0.37),V(0,0.86,0.52));
  tube(bike,M.black,0.013,V(-0.21,0.86,0.52),V(0.21,0.86,0.52));
  [-0.21,0.21].forEach(x=>{
    tube(bike,M.black,0.013,V(x,0.86,0.52),V(x,0.865,0.6)); tube(bike,M.black,0.013,V(x,0.865,0.6),V(x,0.82,0.645)); tube(bike,M.black,0.013,V(x,0.82,0.645),V(x,0.75,0.625)); tube(bike,M.black,0.013,V(x,0.75,0.625),V(x,0.735,0.53));
    // Bremsschalthebel (Hoods): langer Griffkörper auf der Lenkerkurve, Horn vorn, Hebel folgt dem Unterlenker
    const hb0=V(x,0.872,0.592), hb1=V(x,0.902,0.668); const body=tube(bike,M.black,0.0185,hb0,hb1,0.0155); body.scale.x=0.82;
    const horn=new THREE.Mesh(sphG(0.017,12,10),M.black); horn.scale.set(0.8,1.25,1.0); horn.position.set(x,0.912,0.672); bike.add(horn);
    const clamp=new THREE.Mesh(sphG(0.02,12,10),M.black); clamp.scale.set(0.85,1.1,1.2); clamp.position.set(x,0.866,0.598); bike.add(clamp);
    tube(bike,M.alu,0.0065,V(x,0.888,0.683),V(x,0.83,0.69),0.006); tube(bike,M.alu,0.006,V(x,0.83,0.69),V(x,0.77,0.672),0.0045); tube(bike,M.alu,0.0045,V(x,0.77,0.672),V(x,0.735,0.645),0.0035);
  });
  // Scheibenbremsen (links): Rotor 160 mm mit Aussparungen, Flat-Mount-Sattel
  const rotorG=_geoCache.rotor||(_geoCache.rotor=(()=>{ const sh=new THREE.Shape(); sh.absarc(0,0,0.08,0,Math.PI*2,false); const h=new THREE.Path(); h.absarc(0,0,0.062,0,Math.PI*2,true); sh.holes.push(h);
      for (let k=0;k<18;k++){ const a=k/18*Math.PI*2, hh=new THREE.Path(); hh.absarc(Math.cos(a)*0.071,Math.sin(a)*0.071,0.0035,0,Math.PI*2,true); sh.holes.push(hh); }
      const g=new THREE.ExtrudeGeometry(sh,{depth:0.0018,bevelEnabled:false,curveSegments:24}); g.translate(0,0,-0.0009); g.rotateY(Math.PI/2); return g; })());
  const spiderG=_geoCache.rspider||(_geoCache.rspider=(()=>{ const sh=new THREE.Shape(); for (let k=0;k<6;k++){ const a=k/6*Math.PI*2; sh.moveTo(0,0); sh.lineTo(Math.cos(a-0.12)*0.064,Math.sin(a-0.12)*0.064); sh.lineTo(Math.cos(a+0.12)*0.064,Math.sin(a+0.12)*0.064); sh.lineTo(0,0); }
      const g=new THREE.ExtrudeGeometry(sh,{depth:0.003,bevelEnabled:false}); g.translate(0,0,-0.0015); g.rotateY(Math.PI/2); return g; })());
  const discM=std(0xb9bdc4,0.22,0.95), calM=std(0x1c1d20,0.4,0.5);
  [[RA,-1],[FA,1]].forEach(([P,f])=>{ const rr=new THREE.Mesh(rotorG,discM); rr.position.set(-0.041,P.y,P.z); bike.add(rr); const sp=new THREE.Mesh(spiderG,calM); sp.position.set(-0.041,P.y,P.z); bike.add(sp);
    const ang=f>0?-0.55:0.75, cz=P.z+Math.cos(ang)*0.074*(f>0?-1:-1), cy=P.y+Math.sin(ang)*0.074*(f>0?1:1);
    const cal=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.026,0.05),calM); cal.position.set(-0.03,f>0?P.y+0.048:P.y+0.05,f>0?P.z-0.055:P.z+0.055); cal.rotation.x=f>0?0.75:-0.75; bike.add(cal);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.018,0.034),M.alu); cap.position.copy(cal.position).add(V(-0.016,0,0)); cap.rotation.x=cal.rotation.x; bike.add(cap); });
  // Laufräder
  function wheel(pos){
    const w=new THREE.Group(); w.position.copy(pos);
    const tire=new THREE.Mesh(new THREE.TorusGeometry(0.323,0.0135,10,48),M.tire); tire.rotation.y=Math.PI/2; w.add(tire);
    const rimO=new THREE.Mesh(new THREE.CylinderGeometry(0.31,0.31,0.024,48,1,true),M.rim); rimO.rotation.z=Math.PI/2; w.add(rimO);
    const rimI=new THREE.Mesh(new THREE.CylinderGeometry(0.265,0.265,0.018,48,1,true),M.rim); rimI.rotation.z=Math.PI/2; w.add(rimI);
    [-1,1].forEach(sd=>{ const side=new THREE.Mesh(new THREE.RingGeometry(0.265,0.31,48),M.rim); side.rotation.y=sd*Math.PI/2; side.position.x=sd*0.012; w.add(side);
      const logo=new THREE.Mesh(new THREE.RingGeometry(0.28,0.295,24,1,0,1.2),M.accent); logo.rotation.y=sd*Math.PI/2; logo.position.x=sd*0.0125; w.add(logo); });
    const sp=[]; for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, hx=(i%2?0.022:-0.022); sp.push(hx,0,0, 0,Math.sin(a)*0.265,Math.cos(a)*0.265); }
    const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
    w.add(new THREE.LineSegments(sg,new THREE.LineBasicMaterial({color:0xa8acb4})));
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.1,12),M.alu); hub.rotation.z=Math.PI/2; w.add(hub);
    bike.add(w); return w;
  }
  const wR=wheel(RA), wF=wheel(FA);
  // Antrieb: Kurbel, Kettenblätter, Kassette, Schaltwerk, Kette
  // Antrieb (detailliert): Kettenblätter mit Zähnen, Spider, geformte Kurbelarme, 11-fach-Kassette, Schaltwerk, animierte Kette
  const plateG=(key, mk, depth, bevel)=>{ if (_geoCache[key]) return _geoCache[key]; const g=new THREE.ExtrudeGeometry(mk(),{depth, bevelEnabled:!!bevel, bevelThickness:bevel||0, bevelSize:bevel||0, bevelSegments:2, curveSegments:14}); g.translate(0,0,-depth/2); g.rotateY(-Math.PI/2); g.computeVertexNormals(); return (_geoCache[key]=g); };
  const toothShape=(rOut, T, rIn, dt)=>()=>{ const s=new THREE.Shape(), st=Math.PI*2/T, rr=rOut-(dt||0.0045);
    for (let i=0;i<T;i++){ const a=i*st; [[0,rr],[0.28,rOut],[0.5,rOut],[0.78,rr]].forEach(([f,r],j)=>{ const x=Math.cos(a+f*st)*r, y=Math.sin(a+f*st)*r; (i===0&&j===0)?s.moveTo(x,y):s.lineTo(x,y); }); }
    s.closePath(); const h=new THREE.Path(); h.absarc(0,0,rIn,0,Math.PI*2,true); s.holes.push(h); return s; };
  const crank=new THREE.Group(); crank.position.copy(BB); bike.add(crank);
  const RING_X=0.072, RING_R=0.101, COG_R=0.0345;
  const big=new THREE.Mesh(plateG('ring50',toothShape(0.1045,50,0.083),0.0035),M.alu); big.position.x=RING_X; crank.add(big);
  const small=new THREE.Mesh(plateG('ring34',toothShape(0.0715,34,0.056),0.0035),M.carbon); small.position.x=RING_X-0.008; crank.add(small);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.026,0.026,0.012,20),M.black); hub.rotation.z=Math.PI/2; hub.position.x=RING_X+0.004; crank.add(hub);
  for (let k=0;k<4;k++){ const piv=new THREE.Group(); piv.rotation.x=k*Math.PI/2+Math.PI/4; piv.position.x=RING_X+0.005; crank.add(piv);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(0.007,0.064,0.016),M.black); arm.position.y=0.052; piv.add(arm);
    const bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.0045,0.0045,0.016,10),M.alu); bolt.rotation.z=Math.PI/2; bolt.position.set(-0.004,0.0855,0); piv.add(bolt); }
  const armShape=()=>{ const s=new THREE.Shape(); s.moveTo(-0.021,0); s.absarc(0,0,0.021,Math.PI,0,true); s.bezierCurveTo(0.02,-0.06,0.012,-0.12,0.0125,-0.172); s.absarc(0,-0.172,0.0125,0,Math.PI,true); s.bezierCurveTo(-0.012,-0.12,-0.02,-0.06,-0.021,0); return s; };
  const armG=plateG('crankArm',armShape,0.011,0.0035);
  const armR=new THREE.Mesh(armG,M.black); armR.position.x=0.093; crank.add(armR);                        // rechts zeigt bei 0 nach unten
  const armL=new THREE.Mesh(armG,M.black); armL.position.x=-0.093; armL.rotation.x=Math.PI; crank.add(armL); // links nach oben
  [0.093,-0.093].forEach(x=>{ const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.004,16),M.alu); cap.rotation.z=Math.PI/2; cap.position.x=x+Math.sign(x)*0.009; crank.add(cap); });
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.18,14),M.alu); axle.rotation.z=Math.PI/2; crank.add(axle);
  // Kassette 11-fach (30–11), Freilaufkörper
  const cogT=[30,27,24,21,19,17,15,14,13,12,11], COG_X0=0.043, COG_DX=0.0039;
  cogT.forEach((T,i)=>{ const r=0.00202*T+0.0028; const c=new THREE.Mesh(plateG('cog'+T,toothShape(r,T,Math.max(0.015,r-0.012),0.0035),0.0018),i%2?M.alu:std(0x9da2aa,0.3,0.9)); c.position.set(COG_X0+i*COG_DX,RA.y,RA.z); bike.add(c); });
  { const fw=new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.017,0.046,16),M.black); fw.rotation.z=Math.PI/2; fw.position.set(COG_X0+0.02,RA.y,RA.z); bike.add(fw);
    const lock=new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.016,0.004,12),M.alu); lock.rotation.z=Math.PI/2; lock.position.set(COG_X0+10*COG_DX+0.003,RA.y,RA.z); bike.add(lock); }
  const COG_X=COG_X0+5*COG_DX;                                   // Kette liegt auf dem 17er
  // Schaltwerk: Ausfallende, B-Knuckle, Parallelogramm, P-Knuckle, Käfig mit Zahn-Schaltröllchen
  const UP_C=V(0,RA.y-0.062,RA.z+0.004), LO_C=V(0,RA.y-0.135,RA.z+0.03), PR=0.0118;
  { const dark=std(0x2a2c30,0.35,0.6);
    const drop=new THREE.Mesh(new THREE.BoxGeometry(0.008,0.04,0.035),M.frame); drop.position.set(0.058,RA.y-0.012,RA.z-0.005); bike.add(drop);
    const bk=new THREE.Mesh(new THREE.CylinderGeometry(0.011,0.011,0.024,16),dark); bk.rotation.z=Math.PI/2; bk.position.set(0.074,RA.y-0.022,RA.z-0.026); bike.add(bk);
    const pk=new THREE.Mesh(new THREE.CylinderGeometry(0.0105,0.0105,0.022,16),dark); pk.rotation.z=Math.PI/2; pk.position.set(0.085,RA.y-0.048,RA.z-0.04); bike.add(pk);
    const linkG=new THREE.BoxGeometry(0.009,1,0.007);
    [[0.004,0.004],[-0.004,-0.004]].forEach(([dy,dz])=>{ const l=new THREE.Mesh(linkG,dark); stretch(l,V(0.074,RA.y-0.022+dy,RA.z-0.026+dz+0.006),V(0.085,RA.y-0.048+dy,RA.z-0.04+dz+0.006)); bike.add(l); });
    const outer=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.03,0.012),M.alu); outer.position.set(0.087,RA.y-0.035,RA.z-0.036); outer.rotation.x=0.5; bike.add(outer);
    const logo=new THREE.Mesh(new THREE.BoxGeometry(0.002,0.012,0.008),M.accent); logo.position.set(0.0945,RA.y-0.035,RA.z-0.036); logo.rotation.x=0.5; bike.add(logo);
    tube(bike,dark,0.006,V(0.085,RA.y-0.048,RA.z-0.04),V(COG_X+0.004,UP_C.y+0.01,UP_C.z-0.004));
    const cs=()=>{ const s=new THREE.Shape(), a=[UP_C.z,UP_C.y], b=[LO_C.z,LO_C.y], r1=0.0135, r2=0.0155, ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
      s.absarc(a[0]-UP_C.z,a[1]-UP_C.y,r1,ang+Math.PI/2,ang+Math.PI*1.5,false); s.absarc(b[0]-UP_C.z,b[1]-UP_C.y,r2,ang-Math.PI/2,ang+Math.PI/2,false); s.closePath(); return s; };
    const cg=plateG('cage',cs,0.0016,0.0006);
    [-0.0065,0.0065].forEach(dx=>{ const c=new THREE.Mesh(cg,dx>0?std(0xb0b4bb,0.25,0.9):dark); c.position.set(COG_X+dx,UP_C.y,UP_C.z); bike.add(c); });
    const pg=plateG('pulley',toothShape(PR+0.0018,11,0.004,0.0022),0.004);
    [UP_C,LO_C].forEach(P=>{ const p=new THREE.Mesh(pg,M.black); p.position.set(COG_X,P.y,P.z); bike.add(p);
      const b=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.016,10),M.alu); b.rotation.z=Math.PI/2; b.position.set(COG_X,P.y,P.z); bike.add(b); }); }
  // Kette: Pfad (z,y) aus Bögen + Tangenten, Glieder als Instanzen, läuft mit der Kurbel mit
  const chainPath=(()=>{ const pts=[], arc=(cz,cy,r,a0,a1)=>{ const n=Math.max(4,Math.ceil(Math.abs(a1-a0)*r/0.003)); for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; pts.push([cz+Math.cos(a)*r, cy+Math.sin(a)*r]); } }, D=Math.PI/180;
    arc(RA.z,RA.y,COG_R,90*D,265*D); arc(UP_C.z,UP_C.y,PR,15*D,-95*D); arc(LO_C.z,LO_C.y,PR,175*D,280*D); arc(BB.z,BB.y,RING_R,272*D,450*D); pts.push(pts[0].slice());
    const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
    const total=cum[cum.length-1]; let N=Math.round(total/0.0127); if (N%2) N++;
    return {pts,cum,total,N,pitch:total/N}; })();
  const CHN=chainPath.N, outerM=std(0xc9cdd4,0.22,0.95), innerM=std(0x55585e,0.35,0.8);
  const plG=new THREE.BoxGeometry(0.0012,0.0085,0.0127*1.25), rolG=new THREE.CylinderGeometry(0.0034,0.0034,0.0085,8); rolG.rotateZ(Math.PI/2);
  const chainIM=[mkIM(plG,outerM,CHN),mkIM(plG,innerM,CHN),mkIM(rolG,innerM,CHN)]; chainIM.forEach(im=>{ im.count=CHN; bike.add(im); });
  const chainAt=(s,out)=>{ const P=chainPath, c=P.cum; s=((s%P.total)+P.total)%P.total; let lo=0, hi=c.length-1; while(hi-lo>1){ const m=(lo+hi)>>1; if (c[m]<=s) lo=m; else hi=m; }
    const f=(s-c[lo])/((c[hi]-c[lo])||1), a=P.pts[lo], b=P.pts[hi]; out.z=a[0]+(b[0]-a[0])*f; out.y=a[1]+(b[1]-a[1])*f;
    out.x=COG_X+(RING_X-COG_X)*clamp((out.z-RA.z-0.03)/(BB.z-RA.z-0.1),0,1); return out; };
  const _c0=V(0,0,0), _c1=V(0,0,0), _cm=new THREE.Matrix4(), _cq=new THREE.Quaternion(), _cs=V(1,1,1), _ce=new THREE.Euler();
  const updateChain=(ang)=>{ const P=chainPath, off=-ang*RING_R;
    for (let i=0;i<CHN;i++){ chainAt(i*P.pitch+off,_c0); chainAt((i+1)*P.pitch+off,_c1); const dz=_c1.z-_c0.z, dy=_c1.y-_c0.y; _ce.set(-Math.atan2(dy,dz),0,0); _cq.setFromEuler(_ce);
      const mz=(_c0.z+_c1.z)/2, my=(_c0.y+_c1.y)/2, mx=(_c0.x+_c1.x)/2, w=i%2?0.0034:0.0047;
      _cm.compose(_c0.set(mx-w,my,mz),_cq,_cs); chainIM[i%2].setMatrixAt(i,_cm);
      _cm.compose(_c1.set(mx+w,my,mz),_cq,_cs); chainIM[i%2].setMatrixAt(CHN-1-i,_cm);
      chainAt(i*P.pitch+off,_c0); _cm.compose(_c0,_cq,_cs); chainIM[2].setMatrixAt(i,_cm); }
    chainIM.forEach(im=>im.instanceMatrix.needsUpdate=true); };
  updateChain(0);
  // Pedale: Achse, Körper (Rennradpedal), Cleat
  const pedalBody=_geoCache.pedalBody2||(_geoCache.pedalBody2=(()=>{ const g=new THREE.ExtrudeGeometry((()=>{ const s=new THREE.Shape(); s.moveTo(-0.022,0.048); s.lineTo(0.022,0.048); s.quadraticCurveTo(0.04,0.02,0.036,-0.03); s.quadraticCurveTo(0,-0.045,-0.036,-0.03); s.quadraticCurveTo(-0.04,0.02,-0.022,0.048); return s; })(),{depth:0.011,bevelEnabled:true,bevelThickness:0.003,bevelSize:0.003,bevelSegments:2,curveSegments:10}); g.translate(0,0,-0.0055); g.rotateX(Math.PI/2); g.computeVertexNormals(); return g; })());
  const pedals=[-1,1].map(sd=>{ const p=new THREE.Group(); bike.add(p);
    const b=new THREE.Mesh(pedalBody,M.black); p.add(b);
    const ax=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.04,10),M.alu); ax.rotation.z=Math.PI/2; ax.position.x=-sd*0.022; p.add(ax);
    const plate=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.002,0.05),M.alu); plate.position.y=0.0075; p.add(plate);
    return p; });
  // Flaschenhalter + Flasche (eine Flasche, sauber auf dem Unterrohr)
  { const dd=new THREE.Vector3().subVectors(BB,DT0).normalize(), nn=V(0,-dd.z,dd.y), C=DT0.clone().addScaledVector(dd,0.36).addScaledVector(nn,0.068);
    const bot=C.clone().addScaledVector(dd,0.11), top=C.clone().addScaledVector(dd,-0.11);
    const bMat=new THREE.MeshStandardMaterial({color:0xf2f4f6, roughness:0.35, metalness:0, transparent:true, opacity:0.93});
    const bottleM=new THREE.Mesh(latheG('bottle2',[[0,0.0005],[0.02,0.03],[0.06,0.035],[0.3,0.035],[0.36,0.031],[0.44,0.031],[0.5,0.035],[0.86,0.035],[0.9,0.03],[0.93,0.022],[1,0.0005]],20),bMat); stretch(bottleM,bot,top); bike.add(bottleM);
    const label=new THREE.Mesh(cylG(0.0362,0.0362,20),M.accent); stretch(label,bot.clone().lerp(top,0.52),bot.clone().lerp(top,0.8)); bike.add(label);
    const capB=new THREE.Mesh(cylG(0.02,0.022,14),M.black); stretch(capB,top.clone().addScaledVector(dd,0.012),top.clone().addScaledVector(dd,-0.018)); bike.add(capB);
    const nozzle=new THREE.Mesh(cylG(0.008,0.011,10),M.black); stretch(nozzle,top.clone().addScaledVector(dd,-0.016),top.clone().addScaledVector(dd,-0.034)); bike.add(nozzle);
    // Halter: zwei Drahtbügel + Klammer
    [-1,1].forEach(sx=>{ const p0=bot.clone().addScaledVector(nn,-0.03).add(V(sx*0.022,0,0)), p1=bot.clone().lerp(top,0.75).addScaledVector(nn,-0.005).add(V(sx*0.03,0,0)); tube(bike,M.black,0.0035,p0,p1); });
    const clip=new THREE.Mesh(new THREE.TorusGeometry(0.037,0.0035,6,20,Math.PI*1.2),M.black); clip.position.copy(bot.clone().lerp(top,0.72)); clip.quaternion.setFromUnitVectors(V(0,0,1),dd.clone().negate()); clip.rotateZ(-Math.PI*0.1-Math.PI/2); bike.add(clip);
  }
  // Schriftzug auf dem Unterrohr (beide Seiten)
  { const cv=document.createElement('canvas'); cv.width=512; cv.height=64; const cx=cv.getContext('2d');
    cx.font='bold italic 50px system-ui,Arial,sans-serif'; cx.textBaseline='middle'; cx.fillStyle='#'+new THREE.Color(opt.frameAccent).getHexString(); cx.fillText('HICORE',12,34);
    cx.fillStyle='#ffffff'; cx.fillRect(250,26,250,4); cx.fillRect(270,36,230,3);
    const tex=new THREE.CanvasTexture(cv); tex.anisotropy=4; const dm=new THREE.MeshStandardMaterial({map:tex, transparent:true, roughness:0.3, metalness:0.2, depthWrite:false});
    const dd=new THREE.Vector3().subVectors(BB,DT0).normalize(), up=V(0,-dd.z,dd.y);
    [-1,1].forEach(sx=>{ const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.0375),dm); const xa=sx>0?dd.clone():dd.clone().negate(), za=V(sx,0,0);
      pl.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xa, up, za)); pl.position.copy(DT0.clone().addScaledVector(dd,0.2)).add(V(sx*0.0335,0,0)); bike.add(pl); }); }
  // Züge laufen innen (integriertes Cockpit): nur kurze Ausgänge am Steuerrohr und Schaltwerk
  [-1,1].forEach(sx=>tube(bike,M.black,0.0028,V(sx*0.012,0.845,0.385),V(sx*0.014,0.85,0.40)));
  // Steuersatz-Spacer, Vorbaukappe
  [0.795,0.81].forEach(y=>{ const sp=new THREE.Mesh(cylG(0.02,0.02,14),M.black); stretch(sp,V(0,y,0.383),V(0,y+0.012,0.386)); bike.add(sp); });
  // Umwerfer vorn
  { const fd=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.03,0.07),M.alu); fd.position.set(0.075,BB.y+0.13,BB.z-0.045); fd.rotation.x=-0.3; bike.add(fd); }
  // Sattelstreben
  [-0.02,0.02].forEach(x=>tube(bike,M.black,0.003,V(x,0.927,-0.33),V(x,0.929,-0.2)));   // Sattelgestell kurz unter der Schale
  { const cl=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.016,0.03),M.black); cl.position.set(0,0.925,-0.275); bike.add(cl); }
  // Ventile und Schnellspanner
  [RA,FA].forEach(P=>{ const qr=new THREE.Mesh(cylG(0.006,0.006,8),M.alu); stretch(qr,V(-0.07,P.y,P.z),V(0.07,P.y,P.z)); bike.add(qr);
    const lev=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.012,0.05),M.alu); lev.position.set(-0.072,P.y,P.z-0.02); bike.add(lev); });

  // ---------- Fahrer
  const body=new THREE.Group(); g.add(body);
  const HIPC=V(0,1.0,-0.22);
  // Becken/Gesäß in Hose
  const pelvis=new THREE.Mesh(sphG(0.13,18,12),M.shorts); pelvis.scale.set(1.18,0.85,1.15); pelvis.position.copy(HIPC); body.add(pelvis);
  // Rumpf als Drehkörper: Taille schmal, Brust breit, Schultern rund
  const torsoG=latheG('torso',[[0,0.0005],[0.03,0.12],[0.15,0.138],[0.35,0.135],[0.6,0.16],[0.8,0.172],[0.92,0.16],[0.98,0.1],[1,0.0005]],24);
  const torso=new THREE.Mesh(torsoG,M.jersey); stretch(torso,V(0,1.02,-0.19),V(0,1.32,0.27)); torso.scale.x=1.32; torso.scale.z=0.82; body.add(torso);
  // Schulterblätter und Schultern
  [-1,1].forEach(s=>{ const sh=new THREE.Mesh(sphG(0.068,14,10),M.sleeve); sh.scale.set(1,0.9,1.05); sh.position.set(s*0.195,1.3,0.22); body.add(sh);
    const blade=new THREE.Mesh(sphG(0.08,12,8),M.sleeve); blade.scale.set(1.2,0.5,1.2); blade.position.set(s*0.09,1.31,0.12); body.add(blade); });
  // Hals + Kopf
  tube(body,M.skin,0.048,V(0,1.33,0.3),V(0,1.43,0.4),0.045);
  const head=new THREE.Group(); head.position.set(0,1.47,0.44); head.rotation.x=0.18; body.add(head);
  const skull=new THREE.Mesh(sphG(0.1,20,16),M.skin); skull.scale.set(0.88,1.0,1.05); head.add(skull);
  const jaw=new THREE.Mesh(sphG(0.07,14,10),M.skin); jaw.scale.set(1.05,0.8,1.1); jaw.position.set(0,-0.055,0.035); head.add(jaw);
  const noseM=new THREE.Mesh(new THREE.ConeGeometry(0.016,0.04,6),M.skin); noseM.rotation.x=Math.PI/2+0.5; noseM.position.set(0,-0.015,0.105); head.add(noseM);
  [-1,1].forEach(s=>{ const ear=new THREE.Mesh(sphG(0.022,8,6),M.skin); ear.scale.set(0.5,1,0.8); ear.position.set(s*0.088,-0.005,-0.005); head.add(ear); });
  const hair=new THREE.Mesh(new THREE.SphereGeometry(0.104,16,10,0,Math.PI*2,Math.PI*0.45,Math.PI*0.25),M.hair); hair.scale.set(0.9,1,1.06); hair.position.set(0,0,-0.008); hair.rotation.x=-0.6; head.add(hair);
  // Helm: aerodynamisch, mit Lüftungsschlitzen (Textur) und Kinnriemen
  const helG=new THREE.SphereGeometry(0.128,28,16,0,Math.PI*2,0,Math.PI*0.56); helG.scale(0.94,0.85,1.28);
  const hel=new THREE.Mesh(helG,M.helmet); hel.position.set(0,0.025,-0.015); hel.rotation.x=-0.12; head.add(hel);
  const visorRim=new THREE.Mesh(new THREE.TorusGeometry(0.115,0.008,6,30,Math.PI),M.cuff); visorRim.scale.set(1,1,1.2); visorRim.rotation.set(Math.PI/2,0,0); visorRim.position.set(0,0.02,-0.01); head.add(visorRim);
  [-1,1].forEach(s=>tube(head,M.black,0.004,V(s*0.085,0.0,0.0),V(s*0.05,-0.09,0.03)));
  // Sonnenbrille (gewölbt) mit verspiegelten Gläsern
  const frameG=new THREE.Mesh(new THREE.CylinderGeometry(0.098,0.098,0.045,20,1,true,-1.15,2.3),M.glass); frameG.position.set(0,0.012,0.0); frameG.scale.set(0.98,1,1.12); head.add(frameG);
  const lensG=new THREE.Mesh(new THREE.CylinderGeometry(0.0995,0.0995,0.034,20,1,true,-0.95,1.9),M.lens); lensG.position.set(0,0.012,0.0); lensG.scale.set(0.98,1,1.12); head.add(lensG);
  // Gliedmaßen (Drehkörper mit Muskelprofil, pro Bild per IK ausgerichtet)
  const add=(geo,mat)=>{ const m=new THREE.Mesh(geo,mat); body.add(m); return m; };
  const thighG=latheG('thigh',[[0,0.05],[0.15,0.06],[0.55,0.072],[0.85,0.078],[1,0.07]],16);
  const kneeSkinG=latheG('kneeS',[[0,0.047],[0.5,0.052],[1,0.055]],14);
  const calfG=latheG('calf',[[0,0.034],[0.25,0.042],[0.6,0.058],[0.85,0.052],[1,0.048]],16);
  const forearmG=latheG('fore',[[0,0.0005],[0.02,0.031],[0.4,0.04],[0.8,0.046],[0.98,0.042],[1,0.0005]],12);
  const upperG=latheG('upper',[[0,0.0005],[0.03,0.047],[0.5,0.054],[0.97,0.062],[1,0.0005]],14);
  const legs=[-1,1].map(s=>{
    const L={ s, thigh:add(thighG,M.shorts), grip:add(new THREE.TorusGeometry(0.056,0.009,6,16),M.cuff), kneeSkin:add(kneeSkinG,M.skin), knee:add(sphG(0.05,12,10),M.skin),
      calf:add(calfG,M.skin), sock:add(latheG('sock',[[0,0.034],[1,0.036]],12),M.sock), shoe:new THREE.Group() };
    const upper=new THREE.Mesh(new THREE.BoxGeometry(0.085,0.06,0.2),M.shoe); upper.position.set(0,0.0,0.01); L.shoe.add(upper);
    const toe=new THREE.Mesh(sphG(0.043,12,8),M.shoe); toe.scale.set(1,0.7,1.2); toe.position.set(0,-0.005,0.11); L.shoe.add(toe);
    const heel=new THREE.Mesh(sphG(0.042,10,8),M.shoe); heel.scale.set(1,1,0.8); heel.position.set(0,0.0,-0.09); L.shoe.add(heel);
    const sole=new THREE.Mesh(new THREE.BoxGeometry(0.088,0.014,0.25),M.sole); sole.position.set(0,-0.035,0.015); L.shoe.add(sole);
    const strap=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.012,0.03),M.cuff); strap.position.set(0,0.03,0.03); L.shoe.add(strap);
    body.add(L.shoe); return L; });
  const arms=[-1,1].map(s=>({ s, upper:add(upperG,M.sleeve), cuff:add(new THREE.TorusGeometry(0.05,0.008,6,14),M.cuff), elbow:add(sphG(0.037,10,8),M.skin),
    fore:add(forearmG,M.skin), hand:(()=>{ const h=new THREE.Group(); const palm=new THREE.Mesh(sphG(0.035,10,8),M.glove); palm.scale.set(0.8,1,1.25); h.add(palm);
      const fing=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.03,0.05),M.glove); fing.position.set(0,-0.02,0.035); h.add(fing); body.add(h); return h; })() }));
  g.traverse(x=>{ if(x.isMesh){ x.castShadow=true; } });
  const r={g, wF, wR, crank, pedals, chainUpd:updateChain, legs, arms, body, head, BB, crankAng:Math.random()*6, seat:{saddle, nose, post, ST, SP}};
  { const env=bikeEnv(); if (env) bike.traverse(o=>{ if (o.material && o.material.isMeshStandardMaterial && !o.material.envMap){ o.material.envMap=env; o.material.envMapIntensity=o.material.metalness>0.5?1.0:0.6; o.material.needsUpdate=true; } }); }
  { const c=document.createElement('canvas'); c.width=c.height=64; const gx=c.getContext('2d'), gr=gx.createRadialGradient(32,32,2,32,32,31); gr.addColorStop(0,'rgba(0,0,0,.55)'); gr.addColorStop(1,'rgba(0,0,0,0)'); gx.fillStyle=gr; gx.fillRect(0,0,64,64);
    const blob=new THREE.Mesh(new THREE.PlaneGeometry(0.75,2.0).rotateX(-Math.PI/2), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c), transparent:true, depthWrite:false}));   /* weicher Schatten unter dem Rad, wenn Schatten aus sind */
    blob.position.set(0.12,0.02,0.05); blob.renderOrder=1; blob.visible=!renderer.shadowMap.enabled; g.add(blob); (window.RIDER_BLOBS=window.RIDER_BLOBS||[]).push(blob); }
  poseRider(r, 0);
  return r;
}
const _p=new THREE.Vector3(), _k=new THREE.Vector3(), _h=new THREE.Vector3(), _t=new THREE.Vector3(), _e=new THREE.Vector3(), _m=new THREE.Vector3(), _sh=new THREE.Vector3();
function poseRider(r, effort){
  const CL=0.172;
  if (r.glb){   // echte Figur: nur Pedale setzen, Skelett per IK
    [-1,1].forEach(s=>{ const a=r.crankAng+(s>0?0:Math.PI); r.pedals[s>0?1:0].position.set(s*0.125, r.BB.y-Math.cos(a)*CL, r.BB.z-Math.sin(a)*CL); });
    poseGLB(r.glb, r.g, r.crankAng, effort, {low:r.low, stand:r.stand||0, lean:r.lean||0}); return;
  }
  // Vorwärts treten: oben nach vorn, unten nach hinten.
  // Winkel 0 = rechtes Pedal unten. Pedal-Position: y = -cos(a), z = -sin(a)
  const sway=Math.sin(r.crankAng)*0.012*(0.4+effort);
  r.body.rotation.z=sway; r.body.position.y=Math.abs(Math.sin(r.crankAng))*0.004;
  r.head.rotation.z=-sway*0.8;
  r.legs.forEach(L=>{
    const a=r.crankAng+(L.s>0?0:Math.PI);
    _p.set(L.s*0.125, r.BB.y-Math.cos(a)*CL, r.BB.z-Math.sin(a)*CL);
    r.pedals[L.s>0?1:0].position.copy(_p);
    // Fußwinkel: Ferse unten leicht abgesenkt, oben Zehen etwas tiefer (Ankling)
    const footPitch = -0.12 + Math.sin(a+0.6)*0.18;
    _t.set(_p.x, _p.y+0.07+Math.sin(footPitch)*0.02, _p.z-0.045+(-0.02));   // Knöchel über/hinter Pedalachse
    _h.set(L.s*0.1, 1.0+r.body.position.y, -0.22);
    ik2(_h, _t, 0.45, 0.43, 1, _k);
    _m.lerpVectors(_h,_k,0.82); stretch(L.thigh,_h,_m);
    L.grip.position.copy(_m); L.grip.quaternion.copy(L.thigh.quaternion); L.grip.rotateX(Math.PI/2);
    stretch(L.kneeSkin,_m,_k); L.knee.position.copy(_k);
    _e.lerpVectors(_k,_t,0.8); stretch(L.calf,_k,_e); stretch(L.sock,_e,_t);
    L.shoe.position.set(_p.x, _p.y+0.045, _p.z+0.03); L.shoe.rotation.set(footPitch,0,0);
  });
  r.arms.forEach(A=>{
    _sh.set(A.s*0.19, 1.3+r.body.position.y, 0.23); _t.set(A.s*0.21, 0.895, 0.6);
    ik2(_sh,_t,0.3,0.29,-1,_e); _e.x=A.s*0.235;
    _m.lerpVectors(_sh,_e,0.55); stretch(A.upper,_sh,_m);
    A.cuff.position.copy(_m); A.cuff.quaternion.copy(A.upper.quaternion); A.cuff.rotateX(Math.PI/2);
    stretch(A.fore,_e,_t); A.elbow.position.copy(_e); A.elbow.scale.setScalar(1);
    // Hautstück Oberarm unter dem Ärmel
    if (!A.skinUp){ A.skinUp=new THREE.Mesh(latheG('upS',[[0,0.042],[1,0.046]],12), A.fore.material); A.skinUp.castShadow=true; r.body.add(A.skinUp); }
    stretch(A.skinUp,_m,_e);
    A.hand.position.copy(_t); A.hand.quaternion.copy(A.fore.quaternion);
  });
}
function animRider(r, cad, spd, dt, watt){
  const dCr = cad/60*Math.PI*2*dt; r.crankAng += dCr;
  if (watt!=null){   // Haltung folgt der Leistung (weich), Wiegetritt ab ca. 550 W
    r.avgW = r.avgW==null?watt:r.avgW+(watt-r.avgW)*Math.min(1,dt/20);   // ca. 20-s-Mittel
    // Sprint = deutlicher Antritt über dem Schnitt (ab ca. 450 W) oder sehr hohe Leistung
    const surge=Math.max(clamp((watt-Math.max(450,r.avgW*1.3))/120,0,1), clamp((watt-650)/150,0,1));
    const tl=postureFromPower(watt), ts=surge*(cad>40?1:0);
    r.low = r.low==null?tl:r.low+(tl-r.low)*Math.min(1,dt*1.2);
    r.stand = r.stand==null?ts:r.stand+(ts-r.stand)*Math.min(1,dt*(ts>r.stand?3:1.5));
    const amp = 0.004 + 0.025*clamp((watt-350)/250,0,1) + 0.11*r.stand;   // Rad schaukelt mehr bei Druck
    r.lean = cad>5 ? Math.sin(r.crankAng)*amp : r.lean*(1-Math.min(1,dt*3));
  }
  r.crank.rotation.x = r.crankAng;
  if (r.chainUpd) r.chainUpd(r.crankAng);
  const wr = spd/0.335*dt; r.wF.rotation.x += wr; r.wR.rotation.x += wr;
  poseRider(r, clamp(cad/100,0,1));
}
// ================= Realistische Fahrerfigur (GLB mit Skelett, Higgsfield/Meshy) =================
const RIDER_GLB_URL = 'https://d2ol7oe51mr4n9.cloudfront.net/user_34bhqR89E9DYm0YhU1U4tS2vv5r/8a6d04c0-2183-4d12-8601-60d0b0c50e10.glb';
const RIG = { BB: new THREE.Vector3(0,0.27,-0.08), CL: 0.172, HIP: new THREE.Vector3(0,1.125,-0.22), HAND: new THREE.Vector3(0.2,0.93,0.5), SH: new THREE.Vector3(0,1.29,0.42), SEAT_UP: 0.04 };
function ik3(A, T, la, lb, poleDir, out){
  const d=new THREE.Vector3().subVectors(T,A); let dist=d.length(); dist=Math.min(Math.max(dist,Math.abs(la-lb)+1e-4), la+lb-1e-4); d.normalize();
  const a=(la*la+dist*dist-lb*lb)/(2*dist), h=Math.sqrt(Math.max(0,la*la-a*a));
  const pv=poleDir.clone().addScaledVector(d,-poleDir.dot(d)).normalize();
  return out.copy(A).addScaledVector(d,a).addScaledVector(pv,h);
}
function makeGLBRider(gltf){
  const root=gltf.scene;
  const B={}; root.traverse(o=>{ if(o.isBone) B[o.name]=o; if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; o.frustumCulled=false;
    const m=o.material; if (m){ m.emissive && m.emissive.setRGB(0,0,0); m.emissiveMap=null; m.side=THREE.FrontSide; m.needsUpdate=true; } } });
  const need=['Hips','Spine02','Spine01','Spine','neck','Head','head_end','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand','LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase'];
  if (!need.every(n=>B[n])) { console.warn('Skelett unvollständig'); return null; }
  // Gesäß/Hüfte: Gewicht vom Oberschenkel auf das Becken verlagern, damit der Po beim Treten nicht hoch-runter wackelt
  if (!window.NO_GLUTE) root.traverse(o=>{ if(!o.isSkinnedMesh || o.userData.gluteFix) return; o.userData.gluteFix=true;
    const bn=o.skeleton.bones.map(b=>b.name), H=bn.indexOf('Hips'), UL=[bn.indexOf('LeftUpLeg'),bn.indexOf('RightUpLeg')];
    if (H<0||UL[0]<0||UL[1]<0) return;
    const pos=o.geometry.attributes.position, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight;
    const ss=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
    const I=[0,0,0,0], Wt=[0,0,0,0];
    for (let v=0; v<pos.count; v++){
      const y=pos.getY(v), z=pos.getZ(v);
      const f=ss(0.80,0.97,y)*(0.35+0.65*ss(-0.02,-0.10,z)); if (f<=0) continue;
      I[0]=si.getX(v); I[1]=si.getY(v); I[2]=si.getZ(v); I[3]=si.getW(v); Wt[0]=sw.getX(v); Wt[1]=sw.getY(v); Wt[2]=sw.getZ(v); Wt[3]=sw.getW(v);
      let moved=0; for (let k=0;k<4;k++) if (I[k]===UL[0]||I[k]===UL[1]){ const t=Wt[k]*0.8*f; Wt[k]-=t; moved+=t; }
      if (moved<=0) continue;
      let h=I.findIndex((x,k)=>x===H&&Wt[k]>0); if (h<0) h=I.findIndex((x,k)=>Wt[k]===0);
      if (h<0){ let m=0; for(let k=1;k<4;k++) if(Wt[k]<Wt[m]) m=k; moved+=Wt[m]; h=m; Wt[h]=0; }
      I[h]=H; Wt[h]+=moved;
      si.setXYZW(v,I[0],I[1],I[2],I[3]); sw.setXYZW(v,Wt[0],Wt[1],Wt[2],Wt[3]);
    }
    si.needsUpdate=true; sw.needsUpdate=true; });
  // Taille/Bauch etwas kräftiger (Ruheposition verformen, Skinning folgt)
  if (!window.NO_WAIST) root.traverse(o=>{ if(!o.isSkinnedMesh || o.userData.waistFix) return; o.userData.waistFix=true;
    const bn=o.skeleton.bones.map(b=>b.name), TB=['Hips','Spine02','Spine01','Spine'].map(n=>bn.indexOf(n));
    const pos=o.geometry.attributes.position, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight;
    const ss=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
    const ZC=-0.03;
    for (let v=0; v<pos.count; v++){
      const x=pos.getX(v), y=pos.getY(v), z=pos.getZ(v); if (Math.abs(x)>0.24) continue;
      const bump=ss(0.93,1.06,y)*(1-ss(1.22,1.40,y)); if (bump<=0) continue;
      const ids=[si.getX(v),si.getY(v),si.getZ(v),si.getW(v)], ws=[sw.getX(v),sw.getY(v),sw.getZ(v),sw.getW(v)];
      let t=0; for(let k=0;k<4;k++) if (TB.includes(ids[k])) t+=ws[k]; if (t<=0.05) continue;
      const f=bump*Math.min(1,t*1.25);
      const fz=z>ZC ? 1+0.5*f*ss(-0.03,0.05,z) : 1+0.06*f;
      pos.setXYZ(v, x*(1+0.22*f), y, ZC+(z-ZC)*fz);
    }
    pos.needsUpdate=true; o.geometry.computeBoundingSphere(); });
  // Haut: eigene Farbtextur mit Hautstruktur + Normal-Map, etwas matter
  root.traverse(o=>{ if(!o.isMesh || !o.material || !o.material.map || o.userData.skinTex) return; o.userData.skinTex=true; const m=o.material, S=window.RIDER_SKIN;
    m.roughness=Math.max(m.roughness||1,1)*1.25;
    if (!S) return; const old=m.map, oldN=m.normalMap;
    const mk=(b64,ref,onl)=>{ const img=new Image(); img.onload=()=>{ const t=new THREE.Texture(img); t.flipY=false; t.colorSpace=ref.colorSpace; t.wrapS=ref.wrapS; t.wrapT=ref.wrapT; t.needsUpdate=true; onl(t); }; img.src='data:image/jpeg;base64,'+b64; };
    mk(S.base, old, t=>{ const cur=m.map===old; m.userData.map0=t; if(cur){ m.map=t; m.needsUpdate=true; } });
    if (oldN) mk(S.normal, oldN, t=>{ m.normalMap=t; m.needsUpdate=true; }); });
  const holder=new THREE.Group(); holder.add(root);
  root.updateMatrixWorld(true);
  const rest={}; Object.values(B).forEach(b=>{ rest[b.name]={q:b.quaternion.clone(), p:b.position.clone()}; });
  const wp=n=>B[n].getWorldPosition(new THREE.Vector3());
  const len=(a,b)=>wp(a).distanceTo(wp(b));
  const L={ thigh:len('LeftUpLeg','LeftLeg'), shin:len('LeftLeg','LeftFoot'), upper:len('LeftArm','LeftForeArm'), fore:len('LeftForeArm','LeftHand'),
    hipW: wp('LeftUpLeg').x - wp('RightUpLeg').x, hipDrop: wp('Hips').y - wp('LeftUpLeg').y, shW: wp('LeftArm').x - wp('RightArm').x,
    foot: len('LeftFoot','LeftToeBase'), footDrop: wp('LeftFoot').y-wp('LeftToeBase').y,
    spine: len('Hips','Spine02')+len('Spine02','Spine01')+len('Spine01','Spine')+len('Spine','neck') };
  // auf Beinlänge des Rads skalieren (Hüfte->Pedal ca. 0,9 m)
  const sc=0.86/(L.thigh+L.shin); holder.scale.setScalar(sc); holder.updateMatrixWorld(true);
  for (const k in L) L[k]*=sc;
  return { holder, root, B, rest, L, sc };
}
const _a=new THREE.Vector3(), _b=new THREE.Vector3(), _c=new THREE.Vector3(), _q1=new THREE.Quaternion(), _q2=new THREE.Quaternion(), _q3=new THREE.Quaternion();
function aimBone(bone, child, targetWorld){
  bone.updateMatrixWorld(true);
  const bp=bone.getWorldPosition(_a), cp=child.getWorldPosition(_b);
  const cur=_c.subVectors(cp,bp).normalize(); const want=new THREE.Vector3().subVectors(targetWorld,bp).normalize();
  if (cur.lengthSq()<1e-8 || want.lengthSq()<1e-8) return;
  _q1.setFromUnitVectors(cur,want);
  bone.getWorldQuaternion(_q2); bone.parent.getWorldQuaternion(_q3);
  bone.quaternion.copy(_q3.invert().multiply(_q1.multiply(_q2)));
  bone.updateMatrixWorld(true);
}
// Haltung je nach Leistung: low 0 = aufrecht (<=130 W) ... 1 = tief geduckt (500 W), stand 0..1 = Wiegetritt
function postureFromPower(w){ const pts=[[0,0],[130,0],[200,0.33],[300,0.66],[500,1]]; if(w>=500) return 1;
  for(let i=1;i<pts.length;i++) if(w<=pts[i][0]){ const [a,va]=pts[i-1],[b,vb]=pts[i]; return va+(vb-va)*(w-a)/(b-a); } return 1; }
const _lerp=(a,b,t)=>a+(b-a)*t;
// Pose pro Bild. G = Rider-Gruppe (lokale Koordinaten: +z vorn), crank = Kurbelwinkel
function poseGLB(R, G, crank, effort, opt){
  const {B, rest, L}=R; opt=opt||{};
  const low=opt.low==null?0.33:opt.low, st=opt.stand||0, lean=opt.lean||0;
  G.updateMatrixWorld(true);
  Object.keys(rest).forEach(n=>{ B[n].quaternion.copy(rest[n].q); B[n].position.copy(rest[n].p); });
  B.Head.position.multiplyScalar(0.6);                             // Hals kürzer
  const W=v=>G.localToWorld(v.clone());
  const bob=Math.abs(Math.sin(crank))*(0.002+0.03*st), sway=Math.sin(crank)*0.0025*(0.5+effort)*(1-st);   // ruhiger Oberkörper im Sattel
  // Gegenlage zum schaukelnden Rad: Körper bleibt eher senkrecht, Rad kippt unter ihm
  const hx=lean*1.0*(0.95-0.1*st), sx=sway+lean*1.35*0.95;
  const hipL=new THREE.Vector3(hx, RIG.HIP.y+bob+0.03*st, _lerp(-0.23,-0.19,low)+0.2*st);
  const sh=new THREE.Vector3(sx, _lerp(1.37,1.12,low)+bob*0.6+0.07*st, _lerp(0.36,0.50,low)+0.05*st);
  R._hand=new THREE.Vector3(RIG.HAND.x-0.01*low, _lerp(_lerp(0.955,0.85,low*low),0.925,st), _lerp(_lerp(0.525,0.47,low),0.52,st));
  // Becken auf den Sattel
  B.Hips.parent.updateMatrixWorld(true);
  B.Hips.position.copy(B.Hips.parent.worldToLocal(W(hipL)));
  B.Hips.updateMatrixWorld(true);
  // Rücken als Bogen (Katzenbuckel), stärker gewölbt je tiefer
  const ctrl=new THREE.Vector3((hx+sx)/2, (hipL.y+sh.y)/2+0.10+0.02*low, (hipL.z+sh.z)/2-0.07);
  const bez=t=>new THREE.Vector3().copy(hipL).multiplyScalar((1-t)*(1-t)).addScaledVector(ctrl,2*(1-t)*t).addScaledVector(sh,t*t);
  const chain=['Hips','Spine02','Spine01','Spine','neck'];
  let acc=0; const seg=[]; for (let i=0;i<chain.length-1;i++){ const l=B[chain[i]].getWorldPosition(new THREE.Vector3()).distanceTo(B[chain[i+1]].getWorldPosition(new THREE.Vector3())); seg.push(l); }
  const tot=seg.reduce((a,b)=>a+b,0);
  for (let i=0;i<chain.length-1;i++){ acc+=seg[i]; aimBone(B[chain[i]], B[chain[i+1]], W(bez(acc/tot))); }
  // Hals: weich aus dem Rücken heraus, Kopf hebt den Blick nach vorn (kein Knick)
  const dirW=v=>G.localToWorld(v.clone()).sub(G.localToWorld(new THREE.Vector3())).normalize();
  const tdir=new THREE.Vector3().subVectors(sh,ctrl).normalize();
  const nd=tdir.clone().lerp(new THREE.Vector3(0,_lerp(0.62,0.55,low),0.79).normalize(),0.6).normalize();
  const neckP=B.neck.getWorldPosition(new THREE.Vector3());
  aimBone(B.neck, B.Head, neckP.clone().add(dirW(nd)));
  const headP=B.Head.getWorldPosition(new THREE.Vector3());
  aimBone(B.Head, B.head_end, headP.clone().add(dirW(new THREE.Vector3(-lean*0.6,_lerp(0.86,0.8,low),_lerp(0.5,0.6,low)))));
  // Beine
  [['Left',1],['Right',-1]].forEach(([s,side])=>{
    const a=crank+(side>0?0:Math.PI);                              // wie Kurbel/Pedale des Rads
    const pedal=new THREE.Vector3(side*0.125, RIG.BB.y-Math.cos(a)*RIG.CL, RIG.BB.z-Math.sin(a)*RIG.CL);
    // Fußballen (ToeBase-Gelenk) liegt über der Pedalachse; Fuß unten leicht gestreckt (Ankling)
    const a0=Math.asin(clamp(L.footDrop/L.foot,-0.9,0.9));        // Neigung des Fußknochens im Stand
    const pitch=0.06+0.13*Math.cos(a-0.5);                          // + = Zehen tiefer
    const ball=pedal.clone().add(new THREE.Vector3(0,0.018,0));
    const ang=a0+pitch, dir=new THREE.Vector3(0,-Math.sin(ang),Math.cos(ang));
    const ankle=ball.clone().addScaledVector(dir,-L.foot);
    const toe=ball.clone().addScaledVector(dir,0.05);
    const hipW=B[s+'UpLeg'].getWorldPosition(new THREE.Vector3());
    const hipLoc=G.worldToLocal(hipW.clone());
    const knee=ik3(hipLoc, ankle, L.thigh, L.shin, new THREE.Vector3(side*0.12,0.1,1), new THREE.Vector3());
    aimBone(B[s+'UpLeg'], B[s+'Leg'], W(knee));
    aimBone(B[s+'Leg'], B[s+'Foot'], W(ankle)); if (window.DBG_LEG) window.DBG_LEG[s]=hipLoc.distanceTo(ankle)/(L.thigh+L.shin);
    aimBone(B[s+'Foot'], B[s+'ToeBase'], W(ball));
    const tk=B[s+'ToeBase'].children.filter(c=>c.isBone); if (tk.length) aimBone(B[s+'ToeBase'], tk[0], W(toe.clone().add(new THREE.Vector3(0,-0.01,0.03))));
  });
  // Arme zu den Griffen
  [['Left',1],['Right',-1]].forEach(([s,side])=>{
    // Schultern locker nach vorn-unten (nicht hochgezogen)
    if (B[s+'Shoulder']){ const aL=G.worldToLocal(B[s+'Arm'].getWorldPosition(new THREE.Vector3())); aL.add(new THREE.Vector3(-side*0.012,-0.06,0.035)); aimBone(B[s+'Shoulder'], B[s+'Arm'], W(aL)); }
    const shW=B[s+'Arm'].getWorldPosition(new THREE.Vector3()); const shL=G.worldToLocal(shW.clone());
    const hand=new THREE.Vector3(side*R._hand.x, R._hand.y, R._hand.z);
    const elbow=ik3(shL, hand, L.upper, L.fore, new THREE.Vector3(side*(0.45+0.25*low),-0.55,-0.55), new THREE.Vector3());
    aimBone(B[s+'Arm'], B[s+'ForeArm'], W(elbow));
    aimBone(B[s+'ForeArm'], B[s+'Hand'], W(hand));
    const fing=hand.clone().add(new THREE.Vector3(-side*0.005,-0.045*(1-low),0.08));   // Finger umgreifen den Griffkörper
    const kids=B[s+'Hand'].children.filter(c=>c.isBone); if (kids.length) aimBone(B[s+'Hand'], kids[0], W(fing));
  });
}

function b64ToBuf(b64){ const s=atob(b64), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u.buffer; }
window.RIDERKIT={makeRider,makeGLBRider,poseRider,animRider,poseGLB,RIG,stretch,b64ToBuf,pbrMarkLin};
