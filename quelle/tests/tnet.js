// 0.15.0: Routing-Netz mit Wegen: Aufbau, Zeit, Verbundenheit, Stichproben fürs Abbiegen (ohne Weltaufbau, schnell)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:640,height:360}}); await require("./serve")(ctx); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate(()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); });
 const r=await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; const D=gnData(); const t0=performance.now(); const R=gnRG(); const ms=performance.now()-t0;
   const comp=(A)=>{ const seen=new Int32Array(R.nodes.length).fill(-1); let best=0, nc=0; const sizes=[]; for (let s=0;s<R.nodes.length;s++){ if (seen[s]>=0 || !(A[s]&&A[s].length)) continue; let st=[s], c=0; seen[s]=nc; while (st.length){ const u=st.pop(); c++; for (const e of A[u]){ const E=R.edges[e], v=E.a===u?E.b:E.a; if (seen[v]<0){ seen[v]=nc; st.push(v); } } } sizes.push(c); nc++; } sizes.sort((a,b)=>b-a); return {nc, top:sizes.slice(0,5)}; };
   const kinds={}; R.edges.forEach(E=>{ kinds[E.kind]=(kinds[E.kind]||0)+1; });
   const kmW=R.edges.filter(E=>E.kind!=='r').reduce((a,E)=>a+E.len,0)/1000, kmR=R.edges.filter(E=>E.kind==='r').reduce((a,E)=>a+E.len,0)/1000, kmD=D.edges.reduce((a,E)=>a+E.len,0)/1000;
   // Hauptnetz-Komponente: Anteil der Wegekilometer, die mit der Hauptrunde verbunden sind (alle Kanten)
   const s0=D.loop[0]?D.edges[D.loop[0][0]].a:0, seen=new Uint8Array(R.nodes.length); let st=[s0]; seen[s0]=1; while (st.length){ const u=st.pop(); for (const e of R.adjW[u]){ const E=R.edges[e], v=E.a===u?E.b:E.a; if (!seen[v]){ seen[v]=1; st.push(v); } } }
   let kmConn=0; R.edges.forEach(E=>{ if (E.kind!=='r' && seen[E.a]) kmConn+=E.len; });
   let roots=0; R.roots.forEach(l=>roots+=l.length); let br=R.edges.filter(E=>E.br).length;
   const j3=R.adjW.filter(a=>a.length>=3).length;
   return {ms:Math.round(ms), stat:R.stat, kinds, kmR:kmR.toFixed(1), kmD:kmD.toFixed(1), kmW:kmW.toFixed(0), kmConn:(kmConn/1000).toFixed(0), roots, br, j3, compW:comp(R.adjW), loopLen:R.loop.length, dloop:D.loop.length}; });
 console.log(JSON.stringify(r)); console.log(errs.slice(0,5).join('\n')||'no errors'); await b.close(); })();
