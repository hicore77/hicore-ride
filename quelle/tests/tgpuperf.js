// 0.20.0 CPU-Messung im echten WebGPU-Pfad (SwiftShader über Dawn, Chromium mit channel 'chromium').
// Misst je Bild: JS-Zeit von renderer.render (= CPU-Aufwand three.js + WebGPU-Befehle), übrige JS-Zeit, Zeichenaufrufe (inkl. Schatten), Objekte.
// Aufruf: GFX=0.5 PL=Jonsdorf NF=40 node tgpuperf.js   (QS='&...' Zusatzparameter, WAIT=s Wartezeit nach Start, PRE='js' vor Start)
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({channel:'chromium', args:['--enable-unsafe-webgpu','--use-webgpu-adapter=swiftshader','--enable-features=Vulkan']});
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||1180),height:+(process.env.VH||820)}}); await serve(ctx);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,300))); p.on('console',m=>{ if (m.type()==='error'||m.type()==='warning') errs.push('C '+m.text().slice(0,200)); });
 const gfx=process.env.GFX||'0.5';
 await p.addInitScript((g)=>{ try{ localStorage.setItem('hicoreRide.gfx',JSON.stringify(g)); localStorage.setItem('hicoreRide.gfxUser','1'); }catch(e){} }, gfx);
 await p.goto('http://127.0.0.1:8765/index.html?fps=60'+(process.env.QS||''));
 await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 const gm=await p.evaluate(()=>({gpu:!!window.GPU_MODE, be:renderer.backend&&renderer.backend.isWebGPUBackend, gfx:$('gfx').value}));
 console.log('Modus', JSON.stringify(gm));
 if (process.env.PRE) await p.evaluate(process.env.PRE);
 await p.evaluate((pl)=>{ selWorld='zittau'; $('bots').value='0'; try{ if (pl) { const s=$('start'); if (s) for (const o of s.options) if (o.text.includes(pl)) s.value=o.value; } }catch(e){} ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); }, process.env.PL||'');
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 await p.evaluate(()=>{ $('simW').value='0'; });
 await p.waitForTimeout(+(process.env.WAIT||60)*1000);
 const r=await p.evaluate(async(NF)=>{ const R=renderer; let rt=0, rn=0; const PO=POST.render.bind(POST); POST.render=function(){ const a=performance.now(); const x=PO(); rt+=performance.now()-a; rn++; return x; };
   const lab=o=>{ let q=o; while (q && q.parent && q.parent!==scene && q.parent!==worldGroup) q=q.parent; const top=q===me.g?'FAHRER':q===GT.grp?'GT':(window.TREE_LOD&&q===TREE_LOD.grp)?'treeLOD':(q.name||q.type);
     let sub=''; if (top==='GT'){ let t=o; while (t.parent && t.parent!==GT.grp) t=t.parent; sub=t===o?'direkt':'gruppe'; }
     const m=o.material||{}; if (top==='Group'||top==='Mesh'){ let t=o, ch=[]; while (t && t!==q){ ch.push(t.name||(t.isInstancedMesh?'I':t.type[0])); t=t.parent; } sub=ch.slice(-2).join('<')+'/'+(m.type||'').slice(4,9)+((m.map&&m.map.image&&m.map.image.src)?String(m.map.image.src).split('/').pop().slice(0,14):''); }
     return top+(sub?':'+sub:'')+(o.isInstancedMesh?' I':'')+(m.userData&&m.userData.mini?' mini':'')+(o.name?' '+o.name.slice(0,20):''); };
   const DC={}; const RD=R._renderObjectDirect.bind(R); let rec=0; R._renderObjectDirect=function(e,t,n,i){ if (rec){ const k=(i!==camera?'S:':'')+lab(e); DC[k]=(DC[k]||0)+1; } return RD.apply(null,arguments); };
   const fo=window.frame; let ft=0; const f0=FRC, t0=performance.now();
   const info=[]; await new Promise(res=>{ const chk=()=>{ rec=1; const i=R.info.render; info.push([i.drawCalls||i.calls||0, i.triangles||0]); if (FRC-f0>=NF) res(); else requestAnimationFrame(chk); }; chk(); });
   const n=FRC-f0; const dc=info.slice(2).map(x=>x[0]), tr=info.slice(2).map(x=>x[1]);
   let vis=0, inst=0, instN=0, cast=0, castInst=0; const by={};
   scene.traverseVisible(o=>{ if (o.isMesh){ vis++; if (o.isInstancedMesh){ inst++; instN+=o.count; } if (o.castShadow){ cast++; if (o.isInstancedMesh) castInst+=o.count; } } });
   return {frames:n, msWall:(performance.now()-t0)/n, msRenderCPU:rt/rn, renders:rn/n, drawCallsMed:dc.sort((a,b)=>a-b)[dc.length>>1], trisMed:tr.sort((a,b)=>a-b)[tr.length>>1], visMeshes:vis, instMeshes:inst, instances:instN, castMeshes:cast, castInstances:castInst, shadow:renderer.shadowMap.enabled, pr:renderer.getPixelRatio(), pos:[Math.round(me.g.position.x),Math.round(me.g.position.z)], dcBy:Object.entries(DC).map(([k,v])=>[k,Math.round(v/n)]).sort((a,b)=>b[1]-a[1]).slice(0,60) };
 }, +(process.env.NF||40));
 console.log(JSON.stringify(r));
 if (process.env.EXTRA) console.log(JSON.stringify(await p.evaluate(process.env.EXTRA)));
 { const u={}; errs.forEach(e=>u[e]=(u[e]||0)+1); console.log(Object.entries(u).map(([k,v])=>v+'x '+k).join('\n')||'keine Seitenfehler'); } await b.close(); })();
