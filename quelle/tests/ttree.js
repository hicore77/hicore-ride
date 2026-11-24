// Kontrollbild Laubbaum im Gegenlicht bei Schnee (0.13.0). QS z. B. '&oldleaf=1', OUT Ordner, PL Ort
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'+(process.env.QS||'')); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='viel'; ATMO.snRd='geraeumt'; ATMO.tod='nachm'; ATMO.apply(); $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r=await p.evaluate((pl)=>{ const v=(GN.d.vill||[]).find(q=>q.name===pl); zgApplyStart({x:v.x,z:v.z}); $('simW').value=0; TRAFFIC.nextT=1e9; document.querySelectorAll('body>div').forEach(e=>{if(!e.querySelector('canvas'))e.style.visibility='hidden'}); for (const k of ['a','d','m','r']) SNOW[k].value=SNOW.t[k]; return 'ok'; }, process.env.PL||'Waltersdorf');
 await p.waitForTimeout(3000); await p.evaluate(()=>{ window.__F0=FRC; }); await p.waitForFunction(()=>FRC>=window.__F0+8,null,{timeout:1600000});
 const t=await p.evaluate(()=>{ const P=me.g.position; let best=null, bd=1e9;
   const tryT=(x,z,y,k)=>{ if (/bush|spruce|pine|fir/.test(k)) return; const d=Math.hypot(x-P.x,z-P.z); if (d>12 && d<bd){ bd=d; best={x,z,y,k}; } };
   try{ TREE_LOD.types.forEach(ty=>{ const ps=ty.pos; for (let i=0;i<ps.length;i+=2){ const e=ty.st.mats[i/2].elements; tryT(ps[i],ps[i+1],e[13],ty.st.k); } }); }catch(e){}
   if (!best) return null; const s=sun.position.clone().normalize(); const cx=best.x-s.x*22, cz=best.z-s.z*22; window._camFix=[cx, best.y+4, cz, best.x, best.y+5, best.z]; window.__F0=FRC; return best; });
 console.log('baum', JSON.stringify(t));
 await p.waitForFunction(()=>FRC>=window.__F0+8,null,{timeout:1600000}); await p.screenshot({timeout:300000,path:(process.env.OUT||'.')+'/baum.jpg',quality:85}); console.log('shot');
 if (process.env.PICK){ const pk=await p.evaluate((pts)=>{ const rc=new THREE.Raycaster(), out=[]; camera.updateMatrixWorld(); pts.forEach(([x,y])=>{ rc.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,-(y/innerHeight*2-1)),camera); const h=rc.intersectObjects(scene.children,true).filter(i=>i.object.visible)[0]; if (!h){ out.push([x,y,'-']); return; } const o=h.object, m=Array.isArray(o.material)?o.material[0]:o.material; let path=[]; let q=o; while(q&&q!==scene){ path.push(q.name||q.type); q=q.parent; }
   out.push([x,y,Math.round(h.distance), o.type, m.type, m.side, JSON.stringify(Object.keys(m.userData||{})), JSON.stringify((m.userData||{}).fx||{}).slice(0,120), snowKind(m), path.slice(0,4).join('<'), o.instanceColor?'iC':'', m.map&&m.map.image?m.map.image.width:0]); }); return out; }, JSON.parse(process.env.PICK)); console.log(JSON.stringify(pk,null,0).replace(/\],\[/g,'],\n[')); }
 await b.close(); })();
