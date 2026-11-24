// Leistungsmessung (0.13.0): Ladebytes, Ladephasen, Draw Calls, Dreiecke, Objektzahlen, JS-Zeit pro Bild.
// Aufruf: node tperf.js   (Env: QS='&...' Zusatzparameter, NF=Bilder zum Messen, VW/VH Fenstergröße)
// Achtung: In der Cloud läuft Software-Rendering (SwiftShader). Draw Calls/Dreiecke/Objekte/Bytes sind echt, Zeiten nur relativ vergleichbar.
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||960),height:+(process.env.VH||540)}}); await serve(ctx);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,300)));
 const net={}, t0=Date.now(), seq=[];
 p.on('requestfinished', async r=>{ try{ const u=new URL(r.url()); const s=(await r.sizes()).responseBodySize; const k=u.pathname.split('/').slice(1,-1).join('/')||'/'; net[k]=net[k]||{n:0,b:0}; net[k].n++; net[k].b+=s; seq.push([Date.now()-t0, u.pathname, s]); }catch(e){} });
 await p.addInitScript(()=>{ window.__stg=[]; const o=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if (/stage$/.test(k)) window.__stg.push([Math.round(performance.now()),v]); return o.apply(this,arguments); }; });
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||''));
 await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 const tMenu=await p.evaluate(()=>performance.now()); await p.evaluate(()=>window.PROPS_READY); const tProps=await p.evaluate(()=>performance.now());
 const mb=x=>(x/1048576).toFixed(2)+' MB';
 console.log('== Netz bis Menü+Modelle =='); let tot=0; for (const k in net){ tot+=net[k].b; console.log(k.padEnd(14), String(net[k].n).padStart(3), mb(net[k].b)); } console.log('gesamt', mb(tot));
 console.log('Menü bereit (glbRiderReady) nach', Math.round(tMenu),'ms; alle Modelle nach', Math.round(tProps),'ms');
 await p.evaluate((nb)=>{ selWorld='zittau'; $('bots').value=nb; $('bSim').click(); }, process.env.BOTS||'0');
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const L=await p.evaluate(()=>window.LOADT); console.log('LOADT (ms): Weltaufbau', Math.round(L.b), 'Shader', Math.round(L.c||0), 'Autos', Math.round(L.a||0), 'Vorbereitung', Math.round(L.v||0), '(Stellvertreter '+L.vn+')', 'erstes Bild', Math.round(L.w||0));
 // messen
 await p.evaluate(()=>{ TRAFFIC.nextT=TRAFFIC.nextT; window.__rt=0; window.__rn=0; const R=renderer, o=R.render.bind(R); R.render=function(){ const a=performance.now(); const r=o.apply(null,arguments); window.__rt+=performance.now()-a; window.__rn++; return r; }; window.__F0=FRC; window.__T0=performance.now(); });
 await p.evaluate(()=>{ window.__js={}; window.__jm={}; const W=(o,k,lab)=>{ const f=o[k]; if (typeof f!=='function') return; o[k]=function(){ const a=performance.now(); try{ return f.apply(this,arguments); } finally{ const d=performance.now()-a; __js[lab]=(__js[lab]||0)+d; __jm[lab]=Math.max(__jm[lab]||0,d); } }; };
   W(TRAFFIC,'step','verkehr'); W(ZSB,'step','bahn'); W(ATMO,'update','wetter'); W(LEAVES,'update','blaetter'); W(window,'gtStream','kacheln'); W(window,'updateTreeLOD','baumLOD'); W(window,'fvStep','fernsicht'); W(POST,'render','zeichnen'); W(window,'frame','frameGesamt'); W(window,'netStep','netz'); W(window,'poseRider','pose'); W(window,'drawProfile','profil');
   try{ TRAFFIC.nextT=0; }catch(e){} });
 const NF=+(process.env.NF||30);
 await p.waitForFunction((n)=>FRC>=window.__F0+n,NF,{timeout:1600000});
 const r=await p.evaluate(()=>{ const n=FRC-window.__F0, dt=(performance.now()-window.__T0)/n; const inf=renderer.info; const ri=inf.render||{};
   const cnt={}; let meshes=0, vis=0, inst=0, instN=0, tris=0; const mats=new Set();
   const walk=(o,top)=>{ if (!o.visible) return; if (o.isMesh||o.isInstancedMesh||o.isBatchedMesh){ vis++; if (o.isInstancedMesh){ inst++; instN+=o.count; } const m=Array.isArray(o.material)?o.material:[o.material]; m.forEach(x=>mats.add(x)); cnt[top]=(cnt[top]||0)+1; } o.children.forEach(c=>walk(c,top)); };
   scene.children.forEach(c=>{ const nm=c===worldGroup?null:(c.name||c.type); if (c===worldGroup) c.children.forEach(w=>{ if (w.visible) walk(w,'W:'+(w.name||w.type)); }); else walk(c,nm); });
   scene.traverse(o=>{ if (o.isMesh) meshes++; });
   const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse)); const inF={}; const sph=new THREE.Sphere();
   const walk2=(o,top)=>{ if (!o.visible) return; if ((o.isMesh||o.isInstancedMesh||o.isLine||o.isPoints)&&(o.count===undefined||o.count>0)){ let ok=!o.frustumCulled; if (!ok){ if (o.isInstancedMesh){ if (!o.boundingSphere) o.computeBoundingSphere(); sph.copy(o.boundingSphere).applyMatrix4(o.matrixWorld); } else { if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); sph.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); } ok=fr.intersectsSphere(sph); } if (ok){ const m=Array.isArray(o.material)?o.material.length:1; const kk=top+(o.isInstancedMesh?' (inst)':''); inF[kk]=(inF[kk]||0)+m; } } o.children.forEach(c=>walk2(c,top)); };
   const nm=w=>w===me.g?'FAHRER':(bots||[]).some(b=>b.g===w)?'BOT':w.name||(w===GT.grp?'GT.grp':w===(window.TREE_LOD&&TREE_LOD.grp)?'treeLOD':w.type);
   scene.children.forEach(c=>{ if (c===worldGroup) c.children.forEach(w=>walk2(w,'W:'+nm(w))); else walk2(c,nm(c)); });
   const tex=[]; const seen=new Set(); scene.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; ms.forEach(m=>{ for (const k in m){ const t=m[k]; if (t&&t.isTexture&&!seen.has(t)){ seen.add(t); const im=t.image||{}; const w=im.width||0,h=im.height||0; tex.push([(t.name||k)+' '+(im.src?String(im.src).slice(-40):im.tagName||im.constructor&&im.constructor.name), w, h, Math.round(w*h*4*1.33/1048576*10)/10]); } } }); });
   tex.sort((a,b)=>b[3]-a[3]); const texSum=tex.reduce((s,t)=>s+t[3],0);
   const js={}; for (const k in __js) js[k]=[Math.round(__js[k]/n*10)/10, Math.round(__jm[k])]; const tops=scene.children.map((c,i)=>{ let k=0; c.traverse(o=>{ if(o.isMesh&&o.visible) k++; }); return [i,nm(c),c.children.length,k,c.children.slice(0,4).map(x=>x.name||x.type).join('/')]; }).filter(t=>t[3]>20);
   return {tops, bots:bots.length, jsMsPerFrame:js, inFrustum:Object.entries(inF).sort((a,b)=>b[1]-a[1]).slice(0,30), texMBsum:Math.round(texSum), texCount:tex.length, texTop:tex.slice(0,25), frames:n, msPerFrame:dt, msRender:window.__rt/window.__rn, renders:window.__rn/n, drawCalls:ri.drawCalls, calls:ri.calls, frameCalls:ri.frameCalls, triangles:ri.triangles, meshesTotal:meshes, visibleMeshes:vis, instanced:inst, instances:instN, materials:mats.size, byTop:Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,25), mem:inf.memory, gfx:$('gfx').value, pr:renderer.getPixelRatio(), cars:(TRAFFIC.act||[]).length }; });
 console.log('== Fahrt Zittau ==\n'+JSON.stringify(r,null,1));
 const stg=await p.evaluate(()=>window.__stg); console.log('Stufen:', stg.map(s=>s[0]+' '+s[1]).join(' | '));
 if (process.env.SEQ) console.log(seq.map(s=>s.join(' ')).join('\n'));
 console.log(errs.join('\n')||'keine Seitenfehler'); await b.close(); })();
