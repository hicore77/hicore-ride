// 0.18.1 Rennrad-Abzweige: Zusammensetzung adjS (neu vs. OLD_ROADADJ) und Treppen mit Anbindung an Straßen. OLD=1 alter Stand
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:800,height:500}}); await serve(ctx);
 if (process.env.OLD) await ctx.addInitScript(()=>{ window.OLD_ROADADJ=1; });
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.ZGNET && typeof gnRG==='function',null,{timeout:600000});
 const r=await p.evaluate(()=>{ selWorld='zittau'; try{ WORLD=WORLDS.find(w=>w.id==='zittau')||WORLD; }catch(e){}
   const R=gnRG(), km={}, inS=new Set(); R.adjS.forEach(l=>l.forEach(k=>inS.add(k)));
   inS.forEach(k=>{ const E=R.edges[k]; const key=E.kind+(E.kind==='r'?'':':'+E.c+':'+(SURF_DE[E.sf]||E.sf)+(E.inf?'?':'')); km[key]=(km[key]||0)+(E.len||0)/1000; });
   Object.keys(km).forEach(k=>km[k]=+km[k].toFixed(1));
   /* Treppen: Weg (adjW) bis zur nächsten Straße */
   const st=[]; R.edges.forEach(E=>{ if (E.c!==15 || E.dup!=null) return; const near=n=>{ const dist=new Map([[n,0]]), Q=[n]; let best=null; while(Q.length){ Q.sort((a,b)=>dist.get(a)-dist.get(b)); const u=Q.shift(), du=dist.get(u); if (du>400) break; if (R.nodes[u].road){ best={d:Math.round(du),u}; break; } for (const k of R.adjW[u]){ const F=R.edges[k]; if (F.k===E.k) continue; const v=F.a===u?F.b:F.a, dv=du+(F.len||0); if (!dist.has(v)||dv<dist.get(v)){ dist.set(v,dv); Q.push(v); } } } return best; };
     const A=near(E.a), B=near(E.b); if (!A && !B) return; const u=(A&&(!B||A.d<=B.d))?A:B, rk=R.adjR[u.u].map(k=>R.edges[k]).find(F=>F.kind==='r'); st.push({nv:E.nv, n:E.st&&E.st.n, len:+(E.len||0).toFixed(1), id:E.wid, both:!!(A&&B), dRoad:u.d, road:rk?gStreet(rk):'', x:Math.round(E.xz[0]), z:Math.round(E.xz[1])}); });
   return {km, stairs:st}; });
 console.log(JSON.stringify(r.km)); require('fs').writeFileSync(process.env.SOUT||'/tmp/stairs.json', JSON.stringify(r.stairs)); console.log('treppen', r.stairs.length);
 console.log('Fehler:', errs.join('\n')||'none'); await b.close(); })();
