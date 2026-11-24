const {chromium}=require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const p=await b.newPage({viewport:{width:600,height:400}});
 p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate((rbp)=>{ selWorld='zittau'; buildWorld(WORLDS.find(w=>w.id==='zittau')); builtWorld='zittau'; window.requestAnimationFrame=()=>0; window.RB_PRE=rbp; },+(process.env.RBP||16));
 const r=await p.evaluate(()=>{ const D=gnData(), M=NET.main, s0=M.ents[0].n0, bad=[], st={pairs:0,ok:0,dead:0,noPath:0,notOff:0};
   for (let n=0;n<D.nodes.length;n++){ const A=D.adj[n]; if (!A||A.length<3) continue;
     for (const a of A){ const Ea=D.edges[a]; if (Ea.a===Ea.b) continue; const far=Ea.a===n?Ea.b:Ea.a;
       const pre=gPath(s0,new Set([far]),new Set([a])); if (!pre){ st.noPath++; continue; }
       const path=[...pre.path,{e:a,dir:Ea.b===n?0:1}]; let cur; try{ cur=gRoute(path,'x'); }catch(e){ continue; } const i=cur.ents.length-1, at={i,node:n,rd:cur.ents[i].r1};
       for (const e of A){ if (e===a) continue; const Ee=D.edges[e]; if (Ee.a===Ee.b) continue; st.pairs++; const off=gOfferable(D,e,n); if (!off) st.notOff++;
         let R; try{ R=gTurn(cur,at,e); }catch(err){ bad.push({n,a,e,why:'Fehler '+err}); continue; }
         const E=R.ents, why=[]; const RBn=gnRBAt(D.nodes[n].x,D.nodes[n].z,2), sd=at.rd-(RBn?RBn.r+Math.hypot(D.nodes[n].x-RBn.x,D.nodes[n].z-RBn.z)+(+(window.RB_PRE||16)):10), pA=withCourse(cur,()=>posAt(sd)), pB=withCourse(R,()=>posAt(gSnapDist(pA,sd))), jmp=Math.hypot(pA.x-pB.x,pA.z-pB.z); st.maxJ=Math.max(st.maxJ||0,jmp); if (jmp>0.5) why.push('Sprung '+jmp.toFixed(2)+' m'); if (!E[i+1] || E[i+1].e!==e) why.push('nimmt gewählte Straße nicht');
         for (let k=i+1;k<E.length-1;k++){ if (E[k].n1!==E[k+1].n0) { why.push('Lücke nach '+gStreet(D.edges[E[k].e])); break; } }
         for (let k=i;k<E.length-1;k++){ if (E[k].e===E[k+1].e){ const dn=D.adj[E[k].n1].length===1; if (dn){ st.dead++; } else { why.push('Kehrtwende auf '+(gStreet(D.edges[E[k].e])||'?')+' bei Knoten '+E[k].n1); } break; } }
         if (why.length) bad.push({n, x:Math.round(D.nodes[n].x), z:Math.round(D.nodes[n].z), from:gStreet(Ea)||'?', to:gStreet(Ee)||'?', off, why:why.join(', ')}); else st.ok++; } } }
   return {st, bad}; });
 console.log(JSON.stringify(r.st)); console.log('fehler',r.bad.length); r.bad.forEach(x=>console.log(JSON.stringify(x))); await b.close(); })();
