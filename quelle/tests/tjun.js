const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:640,height:360}}); await require("./serve")(ctx); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,300)));
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate(()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); });
 const r=await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; const D=gnData(); gnRB(); const bad=[], stat={pairs:0,nodes:0,rbPairs:0,notOffered:0};
   const ang=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
   D.nodes.forEach((n,ni)=>{ const A=D.adj[ni]; if (!A || A.length<3) return; stat.nodes++; const R=gnRBAt(n.x,n.z,2);
     for (const a of A) for (const e of A){ if (e===a) continue; const Ea=D.edges[a], Ee=D.edges[e]; if (Ea.a===Ea.b||Ee.a===Ee.b) continue;
       stat.pairs++; if (R) stat.rbPairs++; if (!gOfferable(D,e,ni)) stat.notOffered++;
       const path=[{e:a,dir:Ea.b===ni?0:1},{e,dir:Ee.a===ni?0:1}]; let rt; try{ rt=gRoute(path,'t'); }catch(err){ bad.push({ni,a,e,why:'Fehler '+err}); continue; }
       const P=rt.pts, C=rt.cum, end=rt.ents[1].r1, jn=rt.ents[0].r1, cand=[]; for (let i=0;i<P.length;i++){ const s=C[i]; if (s>end-2) break; if (Math.abs(s-jn)<45) cand.push(i); }
       const aEnd=Ea.b===ni?Ea.P[Ea.P.length-1]:Ea.P[0], eSt=Ee.a===ni?Ee.P[0]:Ee.P[Ee.P.length-1], gap=Math.hypot(aEnd.x-eSt.x,aEnd.z-eSt.z);
       let maxD=0, tot=0, dy=0, sw=0; for (let k=3;k<cand.length-3;k++){ const i=cand[k], h0=Math.atan2(P[i].z-P[i-3].z,P[i].x-P[i-3].x), h1=Math.atan2(P[i+3].z-P[i].z,P[i+3].x-P[i].x), d=ang(h0,h1); maxD=Math.max(maxD,Math.abs(d)); }
       for (let k=1;k<cand.length;k++){ const i=cand[k], j=cand[k-1]; dy=Math.max(dy,Math.abs(P[i].y-P[j].y)/Math.max(0.05,Math.hypot(P[i].x-P[j].x,P[i].z-P[j].z))); if (k>1){ const h0=Math.atan2(P[j].z-P[cand[k-2]].z,P[j].x-P[cand[k-2]].x), h1=Math.atan2(P[i].z-P[j].z,P[i].x-P[j].x); tot+=ang(h0,h1); } }
       if (R){ for (let k=1;k<cand.length;k++){ const i=cand[k], j=cand[k-1]; const a0=Math.atan2(-(P[j].z-R.z),P[j].x-R.x), a1=Math.atan2(-(P[i].z-R.z),P[i].x-R.x); if (Math.hypot(P[i].x-R.x,P[i].z-R.z)<R.r+1.5) sw+=ang(a0,a1); } }
       const why=[]; if (gap>1) why.push('Lücke '+gap.toFixed(1)+' m'); if (!R && maxD>2.3) why.push('Knick '+Math.round(maxD*57)+'°'); if (!R && Math.abs(tot)>3.4) why.push('Schleife '+Math.round(tot*57)+'°');
       if (R && sw<-0.2) why.push('Kreisel im Uhrzeigersinn '+Math.round(sw*57)+'°'); if (dy>0.35) why.push('Höhensprung '+Math.round(dy*100)+' %');
       if (why.length) bad.push({ni, x:Math.round(n.x), z:Math.round(n.z), from:gStreet(Ea)||'?', to:gStreet(Ee)||'?', rb:!!R, why:why.join(', ')}); } });
   return {stat, nbad:bad.length, bad}; });
 console.log(JSON.stringify(r.stat)); console.log('fehler', r.nbad); r.bad.slice(0,400).forEach(x=>console.log(JSON.stringify(x)));
 console.log(errs.slice(0,5).join('\n')||'no errors'); await b.close(); })();
