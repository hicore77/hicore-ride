// 0.19.2: Was steht an einer Stelle? Listet alle Meshes/Instanzen im Umkreis R um X,Z (Standard: Treppe Oybin Kammstraße)
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:640,height:400}}); await serve(ctx);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,300)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const X=+(process.env.X||-2509.75), Z=+(process.env.Z||-478.25), R=+(process.env.R||12);
 await p.evaluate(([X,Z])=>{ zgApplyStart({x:X,z:Z}); TRAFFIC.nextT=1e9; $('simW').value=0; meP.v=0; S.power=0; },[X,Z]);
 // Kacheln laden und Nahbereich bauen lassen
 for (let k=0;k<900;k++){ const ok=await p.evaluate(([X,Z])=>{ try{ const gi=Math.floor(X/GT.S), gj=Math.floor(Z/GT.S); const r=kcReady(gi,gj); return r && FRC>(window.__F1=(window.__F1||FRC))+40 ? true : [r,FRC, Math.round(me.g.position.x), Math.round(me.g.position.z)]; }catch(e){ return 'E '+e.message; } },[X,Z]); if (ok===true) break; if (k%30===0) console.log('warte',JSON.stringify(ok)); await new Promise(r=>setTimeout(r,1000)); }
 const res=await p.evaluate(([X,Z,R])=>{ const out=[], v=new THREE.Vector3(), m=new THREE.Matrix4(); scene.updateMatrixWorld(true);
   scene.traverse(o=>{ if (!o.isMesh) return; const nm=(o.name||'')+'|'+(o.geometry&&o.geometry.type)+'|'+(o.material&&o.material.color?o.material.color.getHexString():'')+(o.userData.fence?'|FENCE':'');
     if (o.isInstancedMesh){ let n=0, ex=null; for (let i=0;i<o.count;i++){ o.getMatrixAt(i,m); v.setFromMatrixPosition(m).applyMatrix4(o.matrixWorld); if (Math.hypot(v.x-X,v.z-Z)<R){ n++; ex=ex||[+v.x.toFixed(1),+v.y.toFixed(1),+v.z.toFixed(1)]; } } if (n) out.push(['I',nm,n,ex]); return; }
     const pa=o.geometry&&o.geometry.attributes.position; if (!pa) return; let n=0, ex=null; for (let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld); if (Math.hypot(v.x-X,v.z-Z)<R){ n++; ex=ex||[+v.x.toFixed(1),+v.y.toFixed(1),+v.z.toFixed(1)]; } } if (n && n<pa.count) out.push(['M',nm,n,ex,pa.count]); else if (n) out.push(['Mall',nm,n,ex]); });
   return out; },[X,Z,R]);
 console.log('zaunfelder', JSON.stringify(await p.evaluate(()=>window.__PW||null))); if (!process.env.NOLIST) res.forEach(r=>console.log(JSON.stringify(r)));
 // CAMS: "x,y,z,lx,ly,lz;..." (y relativ zum Gelände), Bilder nach OUT
 if (process.env.OUT){ const cams=(process.env.CAMS||'').split(';').filter(Boolean).map(c=>c.split(',').map(Number)); let n=0;
   for (const c of cams){ await p.evaluate(c=>{ document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); window._camFix=[c[0],terrainH(c[0],c[2])+c[1],c[2],c[3],terrainH(c[3],c[5])+c[4],c[5]]; window.__F0=FRC; },c);
     await p.waitForFunction(()=>FRC>=window.__F0+3,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:process.env.OUT+'/probe_'+(n++)+'.jpg',quality:85}); console.log('shot',n); } }
 console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
