// 0.28.0 Messung für Atlas/Bündeln: Zeichenaufrufe je Gruppe, Texturspeicher, CPU-Zeit von renderer.render (echter WebGPU-Pfad, SwiftShader).
// Aufruf: W=zittau|dolo SP='{"x":2462,"z":-4692}' GFX=0.5 NF=30 WAIT=60 [PRE='window.OLD_X=1'] node tatlas.js
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch(process.env.WGPU?{channel:'chromium', args:['--enable-unsafe-webgpu','--use-webgpu-adapter=swiftshader','--enable-features=Vulkan']}:{args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||1180),height:+(process.env.VH||820)}}); await serve(ctx);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,300))); p.on('console',m=>{ if (m.type()==='error'||m.type()==='warning') errs.push('C '+m.text().slice(0,200)); });
 const gfx=process.env.GFX||'0.5';
 await p.addInitScript((g)=>{ try{ localStorage.setItem('hicoreRide.gfx',JSON.stringify(g)); localStorage.setItem('hicoreRide.gfxUser','1'); }catch(e){} }, gfx);
 if (process.env.PRE) await p.addInitScript(process.env.PRE);
 await p.goto('http://127.0.0.1:8765/index.html?fps=60'+(process.env.WGPU?'':'&gl=1')+(process.env.QS||''));
 await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 const W=process.env.W||'zittau', SP=process.env.SP?JSON.parse(process.env.SP):null;
 await p.evaluate(([w,sp])=>{ selWorld=w; $('bots').value='0'; BIKE='road'; if (sp){ sp.n='Test'; if (w==='dolo') DL_PICK=sp; else START_PICK=sp; } ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); $('bSim').click(); }, [W,SP]);
 await p.waitForFunction(()=>S.running,null,{timeout:1500000});
 await p.evaluate(()=>{ $('simW').value='0'; TRAFFIC.nextT=1e9; });
 if (process.env.CAMJS) process.env.CAM=JSON.stringify(await p.evaluate(process.env.CAMJS));
 if (process.env.CAM){ const [x,z,h,lx,lz]=JSON.parse(process.env.CAM); await p.evaluate(([x,z,h,lx,lz])=>{ window._camFix=[x,terrainH(x,z)+h,z,lx,terrainH(lx,lz),lz]; },[x,z,h,lx,lz]);
  try{ await p.evaluate(([x,z])=>kcWait([{x,z}],700,300000),[x,z]); }catch(e){ console.log('kcWait', String(e).slice(0,100)); }
  try{ await p.waitForFunction(([x,z])=>{ if (!window.ZO||!ZO.on) return true; let zo=true; ZO.cells.forEach(c=>{ if (Math.hypot((c.i+0.5)*ZO.CS-x,(c.j+0.5)*ZO.CS-z)<450 && (!c.g||c.rebuild)) zo=false; }); return zo; },[x,z],{timeout:400000,polling:2000}); }catch(e){ console.log('ZO-Warten abgelaufen'); } }
 await p.waitForTimeout(+(process.env.WAIT||60)*1000);
 const r=await p.evaluate(async([NF,DEEP])=>{ const R=renderer; let rt=0, rn=0, dep=0; const wrap=(o,k)=>{ const f=o[k].bind(o); o[k]=function(){ const a=performance.now(); dep++; const x=f.apply(null,arguments); dep--; if (!dep){ rt+=performance.now()-a; rn++; } return x; }; }; wrap(POST,'render'); wrap(R,'render');
   const lab=o=>{ const ch=[]; let q=o; while (q && q!==scene){ ch.push(q.name||''); q=q.parent; } const top=ch.filter(Boolean).slice(-2).join('/');
     const m=o.material||{}; const mp=(m.map&&m.map.image&&(m.map.image.src||m.map.image.width))?String(m.map.image.src||('img'+m.map.image.width)).split('/').pop().slice(0,16):'';
     if (m.userData&&m.userData._tag) return 'T:'+m.userData._tag+(o.isInstancedMesh?' I':''); if (DEEP && (top||o.type).startsWith(DEEP)){ const pc=[]; let t=o.parent; for (let k=0;k<3&&t&&t!==scene;k++){ pc.push(t.name||t.type[0]); t=t.parent; } return 'D:'+(top||o.type)+' '+(o.geometry&&o.geometry.type||'').replace('Geometry','')+' <'+pc.join('<')+(o.isInstancedMesh?' I':'')+' '+(m.type||'').replace('Material','').slice(4)+(mp?' ['+mp+']':''); }
     return (top||o.type)+(o.isInstancedMesh?' I':o.isSkinnedMesh?' Sk':o.isBatchedMesh?' B':'')+(o.name&&!top.includes(o.name)?' '+o.name.slice(0,16):'')+(mp?' ['+mp+']':''); };
   try{ if (window.GT&&GT.grp&&!GT.grp.name) GT.grp.name='GT'; if (GT.hm) for (const k in GT.hm) GT.hm[k].userData._tag='haus_'+k; }catch(e){}
   const DC={}; const RD=R._renderObjectDirect.bind(R); let rec=0; R._renderObjectDirect=function(e,t,n,i){ if (rec){ const k=(i!==camera?'S:':'')+lab(e); DC[k]=(DC[k]||0)+1; } return RD.apply(null,arguments); };
   const f0=FRC, t0=performance.now(); const info=[];
   await new Promise(res=>{ const chk=()=>{ rec=1; const i=R.info.render; info.push([i.drawCalls||i.calls||0, i.triangles||0]); if (FRC-f0>=NF) res(); else requestAnimationFrame(chk); }; chk(); });
   const n=FRC-f0; const dc=info.slice(2).map(x=>x[0]).sort((a,b)=>a-b), tr=info.slice(2).map(x=>x[1]).sort((a,b)=>a-b);
   const tex=new Map(); scene.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for (const m of ms) for (const k in m){ const t=m[k]; if (t&&t.isTexture&&t.image&&!tex.has(t.uuid)){ const im=t.image, w=im.width||(im.data&&im.width)||0, h=im.height||0; tex.set(t.uuid,{w,h,n:String(im.src||k).split('/').pop().slice(0,30)}); } } });
   let tb=0; tex.forEach(t=>{ tb+=t.w*t.h*4*1.33; });
   let vis=0, inst=0, sk=0; scene.traverseVisible(o=>{ if (o.isMesh){ vis++; if (o.isInstancedMesh) inst++; if (o.isSkinnedMesh) sk++; } });
   const dcBy=Object.entries(DC).map(([k,v])=>[k,+(v/n).toFixed(1)]).sort((a,b)=>b[1]-a[1]);
   const grp={}; for (const [k,v] of dcBy){ const g=(k.startsWith('S:')?'S:':'')+k.replace(/^S:/,'').split(/[ \/]/)[0]; grp[g]=+((grp[g]||0)+v).toFixed(1); }
   return {frames:n, msRenderCPU:+(rt/rn).toFixed(2), drawCallsMed:dc[dc.length>>1], trisMed:tr[tr.length>>1], visMeshes:vis, instMeshes:inst, skinned:sk, textures:tex.size, texMB:+(tb/1048576).toFixed(1), gpuMemTex:R.info.memory&&R.info.memory.textures, pos:[Math.round(me.g.position.x),Math.round(me.g.position.z)], groups:Object.entries(grp).sort((a,b)=>b[1]-a[1]), dcBy:dcBy.slice(0,70),
     texBig:[...tex.values()].sort((a,b)=>b.w*b.h-a.w*a.h).slice(0,25).map(t=>t.n+' '+t.w+'x'+t.h) };
 }, [+(process.env.NF||30), process.env.DEEP||'']);
 console.log(JSON.stringify(r,null,0).replace(/\],\[/g,'],\n['));
 if (process.env.EXTRA) console.log(JSON.stringify(await p.evaluate(process.env.EXTRA)));
 { const u={}; errs.forEach(e=>u[e]=(u[e]||0)+1); console.log(Object.entries(u).slice(0,20).map(([k,v])=>v+'x '+k).join('\n')||'keine Seitenfehler'); } await b.close(); })();
