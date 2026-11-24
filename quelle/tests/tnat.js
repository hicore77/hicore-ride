// 0.16.1: natürliche Weiterfahrt. Von NS zufälligen Kreuzungen an der Runde abbiegen, dann KM km ohne Eingriff fahren (gNetStep wie im Spiel).
// Zählt Hinweise (normal/dezent), automatische Weiterfahrten, Zeit je Umschalten, Straßenwechsel; prüft Sprünge und Kehrtwenden. BIKE=road|gravel|mtb
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:640,height:360}}); await require("./serve")(ctx); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate(()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); });
 const r=await p.evaluate(([NS,BK,KM,NN])=>{ window.requestAnimationFrame=()=>0; BIKE=BK; if (NN) window.NO_NATURAL=1; const D=gnData(); nearD=new Float32Array((G+1)*(G+1)); nearY=new Float32Array((G+1)*(G+1)); EXT=2*Math.max(...D.reg.map(Math.abs))+1200; CELL=EXT/G; OFF=-EXT/2;
   const R=gnRG(), A=gAdj(R); const main=gRoute(R.loop.map(([e,dir])=>({e,dir})),''); NET={main, cur:main, graph:true, appl:new Set(), rc:{'':main}}; setRoute(main);
   window.toast=()=>{}; S.running=true; S.dir=1; S.ut=0; S.speed=9;
   let sd=777; const rnd=()=>((sd=(sd*16807)%2147483647)/2147483647);
   const st={runs:0, hints:0, minor:0, auto:0, turnMs:0, turnMax:0, sw:0, jump:0, uturn:0, km:0}, samples=[];
   for (let run=0; run<NS; run++){
     NET.cur=main; setRoute(main); NET.appl.clear(); NET.pend=null; S.dist=rnd()*(L-KM*1000-2000);
     // erste Kreuzung mit Abzweig: abbiegen (nicht die Runde)
     let turned=false, seen=new Set(), names=[], lastE=-1, lastTag='';
     for (let s=0; s<KM*1000/3; s++){ const old=posAt(S.dist); S.dist+=3; const before=NET.cur, t0=performance.now();
       const pendBefore=NET.pend; gNetStep(); const dt=performance.now()-t0;
       if (NET.cur!==before){ if (turned){ st.auto++; st.turnMs+=dt; st.turnMax=Math.max(st.turnMax,dt); } const q=posAt(S.dist), j=Math.hypot(q.x-old.x,q.z-old.z); if (j>5) st.jump++; }
       const P=NET.pend; if (P && P.tag!==lastTag){ lastTag=P.tag; const el=document.getElementById('junc');
         if (!turned){ const alt=P.opts.find(o=>o.e!==P.planned && !o.plan && Math.abs(o.a)>40 && R.edges[o.e].kind==='r'); if (alt){ NET.pick=alt.e; turned=true; S.dist0=S.dist; } } }
       if (P && turned){ const el=document.getElementById('junc'); if (el && el.style.display==='block' && !seen.has(P.tag)){ seen.add(P.tag); if (P.minor) st.minor++; else st.hints++; } }
       if (turned){ const en=NET.cur.ents.find(en=>en.r0<=S.dist && en.r1>S.dist); if (en && en.e!==lastE){ lastE=en.e; const E=R.edges[en.e], nm=E.kind==='r'?(gStreet(E)||'?'):gWayName(E).split(' ·')[0]; if (names[names.length-1]!==nm){ names.push(nm); st.sw++; } } }
       if (turned && S.dist-S.dist0>KM*1000) break; if (S.dist>=L-5) break; }
     const E=NET.cur.ents; for (let k=0;k<E.length-1;k++) if (E[k].e===E[k+1].e && (A[E[k].n1]||[]).length>1){ st.uturn++; break; }
     if (turned){ st.runs++; st.km+=KM; if (samples.length<6) samples.push(names.slice(0,14).join(' > ')); } }
   st.turnMs=+(st.turnMs/Math.max(1,st.auto)).toFixed(1); st.turnMax=+st.turnMax.toFixed(1); return {st, samples}; }, [+(process.env.NS||20), process.env.BIKE||'road', +(process.env.KM||4), +(process.env.NONAT||0)]);
 console.log(JSON.stringify(r,null,1)); console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
