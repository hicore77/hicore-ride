// 0.29.0 Blätter-Nahdetail, isoliert: ein Baum einer Art hoch über dem Gelände vor Himmel, Kamera in mehreren Abständen zur Kronenoberfläche.
// Aufruf: OUT=… KS='beech,pine,oak' DS='1,3,8,20' [PRE='window.OLD_LEAFPH=1'] [TAG=alt] [W=zittau|dolo] node tleaf2.js
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:+(process.env.VW||800),height:+(process.env.VH||450)}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message.slice(0,300)));
 await p.addInitScript((g)=>{ try{ localStorage.setItem('hicoreRide.gfx',JSON.stringify(g)); localStorage.setItem('hicoreRide.gfxUser','1'); }catch(e){} }, process.env.GFX||'0.5');
 if (process.env.PRE) await p.addInitScript(process.env.PRE);
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate((w)=>{ selWorld=w; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); }, process.env.W||'zittau');
 await p.waitForFunction(()=>S.running,null,{timeout:1500000});
 await p.evaluate(()=>{ $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body *').forEach(e=>{ if (e.tagName==='CANVAS'||e.querySelector('canvas')) return; const ps=getComputedStyle(e).position; if (ps==='fixed'||ps==='absolute') e.style.visibility='hidden'; }); });
 const KS=(process.env.KS||'beech,pine').split(','), DS=(process.env.DS||'1,3,8,20').split(',').map(Number), TAG=process.env.TAG||'neu';
 for (const K of KS){ const info=await p.evaluate((K)=>{ const kit=treeKit(GT.def||{}); const parts=kit.TYPES[K](); const g=new THREE.Group(); const P=me.g.position, base=new THREE.Vector3(P.x+30, terrainH(P.x,P.z)+260, P.z);
     const bb=new THREE.Box3(); parts.forEach(([geo,mat])=>{ const m=new THREE.Mesh(geo,mat); g.add(m); if (mat.alphaTest>0){ geo.computeBoundingBox(); bb.union(geo.boundingBox); } });
     g.position.copy(base); if (window.__TG) scene.remove(window.__TG); scene.add(g); window.__TG=g; const c=bb.getCenter(new THREE.Vector3()).add(base), sz=bb.getSize(new THREE.Vector3()); window.__TC={c, r:Math.max(sz.x,sz.z)/2}; return {r:+window.__TC.r.toFixed(2), h:+sz.y.toFixed(2)}; }, K);
   console.log(K, JSON.stringify(info));
   for (const D of DS){ await p.evaluate((D)=>{ const s=sun.position.clone().setY(0).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),0.6); const {c,r}=window.__TC; const px=c.x+s.x*r*0.85, pz=c.z+s.z*r*0.85; window._camFix=[px+s.x*D, c.y-0.2, pz+s.z*D, px, c.y, pz]; window.__F0=FRC; }, D);
     await p.waitForFunction(()=>FRC>=window.__F0+5,null,{timeout:1600000}); const f=(process.env.OUT||'.')+'/iso_'+K+'_'+TAG+'_'+D+'m.jpg'; await p.screenshot({timeout:300000,path:f,quality:88}); console.log('shot',f); } }
 await b.close(); })();
