// 0.23.1: schwebende Weg-Enden systematisch suchen. Prüft jedes Wegstück (gtSideIdx) und jedes Brückendeck gegen das
// tatsächlich gezeichnete Gelände (10-m-Raster der Kachel, gleiche Dreiecksteilung wie PlaneGeometry, inkl. ZSB.sag).
// Ausgabe: Statistik + die schlimmsten Stellen (x,z, Abstand über Gelände, Ursache). JSON nach OUT/twend.json, wenn OUT gesetzt.
// Schalter: PRE='window.X=1' (Init-Skript), MIN=0.35 (Meldeschwelle in m)
const {chromium}=require('playwright'); const serve=require('./serve'); const fs=require('fs');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:640,height:400}}); await serve(ctx);
 if (process.env.PRE) await ctx.addInitScript(process.env.PRE);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const R=await p.evaluate((MIN)=>{ const S0=GT.S, C=S0/GT.NS;
   const vy=(x,z)=>{ const h=terrainH(x,z); return ZSB.cuts?ZSB.sag(x,z,h):h; };
   const VC=new Map(); const gv=(gx,gz)=>{ const k=gx+','+gz; let v=VC.get(k); if (v===undefined){ v=vy(gx*C,gz*C); VC.set(k,v); if (VC.size>3e6) VC.clear(); } return v; };
   const meshY=(x,z)=>{ const gx=Math.floor(x/C), gz=Math.floor(z/C), u=x/C-gx, v=z/C-gz; const ha=gv(gx,gz), hb=gv(gx,gz+1), hc=gv(gx+1,gz+1), hd=gv(gx+1,gz);
     return (u+v<=1) ? ha+(hd-ha)*u+(hb-ha)*v : hc+(hb-hc)*(1-u)+(hd-hc)*(1-v); };
   const rd=o=>{ for (const k in o) if (typeof o[k]==='number') o[k]=Math.round(o[k]*100)/100; return o; };
   const out={runs:0, verts:0, hist:[0,0,0,0,0], bad:[], bridges:0, brBad:[]};
   const L=gtSideIdx(); const seen=[];
   L.forEach((list,key)=>list.forEach(r=>{ out.runs++; const P=r.P, w=r.w, off=r.fine?0.07:0.09; let worst=null;
     const yWay=(x,z)=>wayLiftY(x,z,(window.terrMeshY?terrMeshY(x,z):terrainH(x,z))+off); let sink=0;
     for (let k=0;k<P.length;k++){ const a=P[Math.max(0,k-1)], bb=P[Math.min(P.length-1,k+1)]; let tx=bb[0]-a[0], tz=bb[1]-a[1]; const l=Math.hypot(tx,tz)||1; tx/=l; tz/=l; const nx=-tz*w/2, nz=tx*w/2;
       for (const s of [1,-1]){ const x=P[k][0]+nx*s, z=P[k][1]+nz*s, y=yWay(x,z), m=meshY(x,z), d=y-m; out.verts++;
         if (d<-0.05) out.sink=(out.sink||0)+1; const hb=d<0.2?0:d<0.35?1:d<0.7?2:d<1.5?3:4; out.hist[hb]++;
         if (!worst || d>worst.d) worst={d, x, z, k, end:(k===0||k===P.length-1), n:P.length, lift:y-(terrainH(x,z)+off), stair:stairBlend(x,z,terrainH(x,z))-terrainH(x,z), sag:terrainH(x,z)-vy(x,z), chord:terrainH(x,z)-meshY(x,z), fine:!!r.fine, w:+w.toFixed(1), sf:r.sf}; } }
     if (worst && worst.d>MIN) out.bad.push(worst); }));
   out.bad.sort((a,b)=>b.d-a.d);
   /* Brückendecks: Enden gegen Gelände */
   const RG=gnRG(); RG.edges.forEach(E=>{ if (E.kind==='r' || !E.br || E.len<1.5) return; out.bridges++; const P=E.P; [0,P.length-1].forEach(i=>{ const q=P[i], m=meshY(q.x,q.z), d=q.y-0.03-m, nd=i?E.b:E.a, N=RG.nodes[nd];
     if (d>MIN) out.brBad.push({d, x:q.x, z:q.z, len:E.len, road:!!N.road, deg:(N.e||N.edges||[]).length, nm:E.nm||''}); }); });
   out.brBad.sort((a,b)=>b.d-a.d);
   /* Treppen: wie weit stehen Stufen/Enden über dem Gelände */
   out.st=[]; (stairsData()||[]).forEach(T=>{ stairInit(T); let mx=0, mk=-1; for (let k=0;k<T.nv;k++){ const ua=(k+0.5)*T.t, s=T.up>0?T.s0+ua:T.s1-ua, q=stairPt(T,s), e=stairStepY(T,k)-wayLiftY0(q[0],q[1],terrainH(q[0],q[1])); if (e>mx){ mx=e; mk=k; } }
     const pa=stairPt(T,T.s0), pb=stairPt(T,T.s1), ta=terrainH(pa[0],pa[1]), tb=terrainH(pb[0],pb[1]);
     if (mx>0.8) out.st.push(rd({id:T.id, mx, mk, nv:T.nv, n:T.n, L:T.L, up:T.up, fl:T.fl, dl:tb-ta, R:T.R, rHi:!!T.rHi, rLo:!!T.rLo, x:pa[0], z:pa[1], e0:T.y0-ta, e1:T.y1-tb})); });
   out.st.sort((a,b)=>b.mx-a.mx);
   /* Ursachen sauber: Bahneinschnitt (dort liegt das feine Einschnitt-Netz auf terrainH) zählt nicht */
   out.cause={}; out.bad.forEach(q=>{ const c=q.sag>0.05?'einschnitt':q.stair>0.2?'treppe':(q.lift-q.stair)>0.2?'strasse':q.chord>0.2?'raster':'sonst'; q.c=c; const k=c+(q.end?'/ende':'/mitte')+(q.d<0.7?' <0,7':q.d<1.5?' <1,5':' ≥1,5'); out.cause[k]=(out.cause[k]||0)+1; });
      out.bad=out.bad.map(rd); out.brBad=out.brBad.map(rd); return out; }, +(process.env.MIN||0.35));
 console.log('Wegstücke', R.runs, 'Ecken', R.verts, 'Abstand über Gelände <0,2 / <0,35 / <0,7 / <1,5 / ≥1,5 m:', R.hist.join(' / '));
 console.log('Ecken unter dem Gelände (>5 cm):', R.sink||0, '· Wege mit Böschung abgedeckt: alle über 0,1 m (gtSideMesh)'); console.log('Stücke über Schwelle:', R.bad.length, 'davon Ende:', R.bad.filter(q=>q.end).length);
 const why=q=>q.stair>0.2?'Treppe':q.lift>0.2?'Straßenhub':q.sag>0.2?'Bahneinschnitt':q.chord>0.2?'Rasterkante':'?';
 const cnt={}; R.bad.forEach(q=>{ const k=why(q); cnt[k]=(cnt[k]||0)+1; }); console.log('Ursachen:', JSON.stringify(cnt));
 R.bad.slice(0,40).forEach(q=>console.log(why(q).padEnd(14), JSON.stringify(q)));
 console.log('Brücken', R.bridges, 'Deck-Enden über Schwelle', R.brBad.length); R.brBad.slice(0,20).forEach(q=>console.log('  ', JSON.stringify(q)));
 console.log('Ursachen genau:', JSON.stringify(R.cause,null,0));
 console.log('Treppen > 0,8 m über Gelände:', R.st.length); R.st.slice(0,25).forEach(q=>console.log('  ', JSON.stringify(q)));
 const top=c=>R.bad.filter(q=>q.c===c).slice(0,6).forEach(q=>console.log('  '+c, JSON.stringify(q))); ['strasse','raster','sonst'].forEach(top);
 if (process.env.OUT) fs.writeFileSync(process.env.OUT+'/twend.json', JSON.stringify(R));
 console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
