// 0.29.0 Blätter-Nahdetail: Bilder eines Baums aus mehreren Abständen (nah bis Bild-Baum), Deckung/Farbe der Blattkarten.
// Aufruf: OUT=… K=beech|pine|oak DS='3,8,20,50' [PRE='window.OLD_LEAFPH=1'] [TAG=alt] node tleaf.js
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:+(process.env.VW||640),height:+(process.env.VH||360)}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message.slice(0,300)));
 await p.addInitScript((g)=>{ try{ localStorage.setItem('hicoreRide.gfx',JSON.stringify(g)); localStorage.setItem('hicoreRide.gfxUser','1'); }catch(e){} }, process.env.GFX||'0.5');
 if (process.env.PRE) await p.addInitScript(process.env.PRE);
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate((w)=>{ selWorld=w; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='nachm'; ATMO.apply(); $('bSim').click(); }, process.env.W||'zittau');
 await p.waitForFunction(()=>S.running,null,{timeout:1500000});
 await p.evaluate(()=>{ $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body *').forEach(e=>{ if (e.tagName==='CANVAS'||e.querySelector('canvas')) return; const ps=getComputedStyle(e).position; if (ps==='fixed'||ps==='absolute') e.style.visibility='hidden'; }); });
 const info=await p.evaluate(()=>{ const out={log:(typeof LEAF_PH!=="undefined")&&LEAF_PH.log, tex:{}}; const cov=t=>{ const c=t.image; const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for (let i=3;i<d.length;i+=4) if (d[i]>115) n++; return +(n/(d.length/4)).toFixed(3); };
   try{ for (const k in LEAF_TC){ const t=LEAF_TC[k]; out.tex[k]=[t.image.width, t.image.height, t.image.getContext?cov(t):'-']; } out.procBeech=cov(leafClusterTexture0('beech',0.245,0.464,512)); }catch(e){ out.err=String(e); } return out; });
 console.log(JSON.stringify(info));
 const K=process.env.K||'beech'; await p.evaluate(k=>{ window.__K=k; }, process.env.K||'beech'); const K_=0, DS=(process.env.DS||'3,8,20,50').split(',').map(Number), TAG=process.env.TAG||'neu';
 await p.waitForTimeout(3000); await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000});
 const find=`((K)=>{ const P=me.g.position; let best=null, bd=1e9; const tryT=(x,z,e)=>{ const d=Math.hypot(x-P.x,z-P.z); if (d>8 && d<bd && d<250){ bd=d; best={x,z,y:e[13],s:e[5]}; } };
   try{ if (window.TREE_LOD) TREE_LOD.types.forEach(ty=>{ if (ty.st.k!==K) return; for (let i=0;i<ty.pos.length;i+=2) tryT(ty.pos[i],ty.pos[i+1],ty.st.mats[i/2].elements); }); }catch(e){}
   try{ GT.tiles.forEach(t=>{ const o=t.fo||t; (o.types||[]).forEach(ty=>{ if (ty.k!==K) return; ty.L.forEach(([m])=>tryT(m.elements[12],m.elements[14],m.elements)); }); }); }catch(e){}
   return best; })`;
 try{ await p.waitForFunction(f=>eval(f)(window.__K), find, {timeout:900000, polling:5000}); }catch(e){ console.log('kein Baum gefunden'); }
  const t=await p.evaluate(f=>eval(f)(window.__K), find); console.log('baum', JSON.stringify(t)); if (!t){ await b.close(); return; }
 for (const D of DS){ await p.evaluate(([t,D,K])=>{ const s=sun.position.clone().setY(0).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),0.5); const CR=(K==='pine'?2.2:3.6), hy=t.y+(K==='pine'?9.6:6.2);   /* Ziel: Punkt auf der Kronenoberfläche (Sonnenseite), Abstand D davon */
   const px=t.x+s.x*CR, pz=t.z+s.z*CR; window._camFix=[px+s.x*D, hy-0.3-D*0.05, pz+s.z*D, px, hy, pz]; window.__F0=FRC; },[t,D,K]);
   await p.waitForFunction(()=>FRC>=window.__F0+6,null,{timeout:1600000}); const f=(process.env.OUT||'.')+'/'+K+'_'+TAG+'_'+D+'m.jpg'; await p.screenshot({timeout:300000,path:f,quality:85}); console.log('shot',f); }
 await b.close(); })();
