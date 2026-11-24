// 0.15.0: Wege-Kreuzungen: Stichprobe von Knoten im Wegenetz (auch Anbindungen an Straßen). Je Knoten: ankommen, in jede andere Kante abbiegen.
// Prüft: gewählte Kante wird genommen, keine Lücke, keine Kehrtwende mitten im Netz, kein Sprung beim Umschalten, keine Höhensprünge/Knicks an der Kreuzung.
// NS=Anzahl Knoten (Standard 300), BIKE=gravel|mtb|road
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:640,height:360}}); await require("./serve")(ctx); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate(()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); });
 const r=await p.evaluate(([NS,BK])=>{ window.requestAnimationFrame=()=>0; BIKE=BK; const D=gnData(); nearD=new Float32Array((G+1)*(G+1)); nearY=new Float32Array((G+1)*(G+1)); EXT=2*Math.max(...D.reg.map(Math.abs))+1200; CELL=EXT/G; OFF=-EXT/2;
   const R=gnRG(), A=gAdj(R); const main=gRoute(R.loop.map(([e,dir])=>({e,dir})),''); NET={main, cur:main, graph:true, appl:new Set(), rc:{'':main}}; const s0=main.ents[0].n0;
   const ang=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
   let sd=12345; const rnd=()=>((sd=(sd*16807)%2147483647)/2147483647);
   const cand=[]; for (let n=0;n<R.nodes.length;n++){ const a=A[n]; if (a && a.length>=3 && a.some(e=>R.edges[e].kind!=='r')) cand.push(n); }
   const pick=[]; while (pick.length<NS && cand.length){ const i=Math.floor(rnd()*cand.length); pick.push(cand.splice(i,1)[0]); }
   const st={nodes:pick.length, pairs:0, ok:0, dead:0, noPath:0, notOff:0, maxJ:0, maxDy:0, ms:0}, bad=[]; const t0=performance.now();
   for (const n of pick){ const AA=A[n]; const a=AA[Math.floor(rnd()*AA.length)], Ea=R.edges[a]; if (Ea.a===Ea.b) continue; const far=Ea.a===n?Ea.b:Ea.a; if (!R.canGo(a,far)) continue;
     const pre=gPath(s0,new Set([far]),new Set([a])); if (!pre){ st.noPath++; continue; }
     const path=[...pre.path,{e:a,dir:Ea.b===n?0:1}]; let cur; try{ cur=gRoute(path,'x'); }catch(e){ bad.push({n,why:'gRoute '+e}); continue; } const i=cur.ents.length-1, at={i,node:n,rd:cur.ents[i].r1};
     for (const e of AA){ if (e===a) continue; const Ee=R.edges[e]; if (Ee.a===Ee.b || !R.canGo(e,n)) continue; st.pairs++; if (!gOfferable(R,e,n)) st.notOff++;
       let RT; try{ RT=gTurn(cur,at,e); }catch(err){ bad.push({n,a,e,why:'Fehler '+err}); continue; }
       const E=RT.ents, why=[]; const sd2=at.rd-10, pA=withCourse(cur,()=>posAt(sd2)), pB=withCourse(RT,()=>posAt(gSnapDist(pA,sd2))), jmp=Math.hypot(pA.x-pB.x,pA.z-pB.z); st.maxJ=Math.max(st.maxJ,jmp); if (jmp>0.5) why.push('Sprung '+jmp.toFixed(2)+' m');
       if (!E[i+1] || E[i+1].e!==e) why.push('nimmt gewählte Kante nicht');
       for (let k=i+1;k<E.length-1;k++){ if (E[k].n1!==E[k+1].n0){ why.push('Lücke nach '+gWayName(R.edges[E[k].e])); break; } }
       for (let k=i;k<E.length-1;k++){ if (E[k].e===E[k+1].e){ if ((A[E[k].n1]||[]).length===1) st.dead++; else why.push('Kehrtwende bei Knoten '+E[k].n1); break; } }
       // Höhe/Knick an der Kreuzung (+-30 m)
       const P=RT.pts, C=RT.cum, jn=E[i].r1; let dy=0, kn=0; const ids=[]; for (let q=0;q<P.length;q++) if (Math.abs(C[q]-jn)<30) ids.push(q);
       for (let k=1;k<ids.length;k++){ const q=ids[k], o=ids[k-1], l=Math.hypot(P[q].x-P[o].x,P[q].z-P[o].z); if (l>2) dy=Math.max(dy,Math.abs(P[q].y-P[o].y)/l); }
       st.maxDy=Math.max(st.maxDy,dy); if (dy>0.35) why.push('Höhensprung '+Math.round(dy*100)+' %');
       if (why.length) bad.push({n, x:Math.round(R.nodes[n].x), z:Math.round(R.nodes[n].z), from:gWayName(Ea), to:gWayName(Ee), why:why.join(', ')}); else st.ok++; } }
   st.ms=Math.round(performance.now()-t0); st.maxJ=+st.maxJ.toFixed(2); st.maxDy=+st.maxDy.toFixed(2); return {st, nbad:bad.length, bad:bad.slice(0,60)}; },[+(process.env.NS||300), process.env.BIKE||'mtb']);
 console.log(JSON.stringify(r.st)); console.log('fehler', r.nbad); r.bad.forEach(x=>console.log(JSON.stringify(x))); console.log(errs.slice(0,5).join('\n')||'no errors'); await b.close(); })();
