const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:640,height:360}}); p.on('pageerror',e=>console.log('PE',e.message));
 await p.addInitScript('window.NO_FV=1;');
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; buildWorld(WORLDS.find(w=>w.id==='zittau')); builtWorld='zittau'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:120000}).catch(()=>{});
 const r=await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; TRAFFIC.nextT=1e9; TRAFFIC.polCd=1e9;
   const s=S.dir||1; let starts=[]; for (let d=0; d<L && starts.length<4; d+=50){ let ok=true; for (let k=-100;k<=500;k+=25){ const q=posAt(d+s*k); if (TRAFFIC.town(q.x,q.z) || roadWAt(d+s*k)<4.6){ ok=false; break; } const h0=headingAt(d+s*k), h1=headingAt(d+s*(k+25)); if (Math.abs(Math.atan2(Math.sin(h1-h0),Math.cos(h1-h0)))>0.12){ ok=false; break; } } if (ok){ starts.push(d); d+=1500; } }
   const res=['starts '+starts.length];
   for (const d0 of starts) for (const [D,late,rvk] of [[90,0,7],[160,0,7],[260,0,7],[420,0,7],[700,0,7],[200,1,7],[350,1,9],[500,1,5]]){
     TRAFFIC.act.slice().forEach(c=>TRAFFIC.kill(c)); S.dist=d0; TRAFFIC.waveBy=0;
     TRAFFIC.spawn(0.6); const A=TRAFFIC.act[TRAFFIC.act.length-1]; if (!A) { res.push('noA'); continue; } A.d=S.dist-s*40; A.v=20; A.cd=s; A.lat=A.latT=-roadWAt(A.d)/4; A.mode='drive'; A.wait=0;
     let B=null; const mkB=()=>{ TRAFFIC.spawn(0.1); B=TRAFFIC.act[TRAFFIC.act.length-1]; if (B===A) B=null; if (B){ B.d=S.dist+s*D; B.cd=-s; B.v=22; B.lat=B.latT=-roadWAt(B.d)/4; B.mode='drive'; } };
     if (!late) mkB();
     let minAB=1e9, minAR=1e9, passed=0, aborted=0, Bstop=0, t=0;
     for (t=0;t<70;t+=0.05){ meP.v=rvk; S.dist+=s*rvk*0.05; TRAFFIC.step(0.05,true); if (late && !B && A.mode==='pass' && A.lat>0.5) mkB();
       if (A.abort>0) aborted=1; if (B && B.v<0.5) Bstop=1;
       if (!TRAFFIC.act.includes(A)) break; const ap=A.o.position; if (B && TRAFFIC.act.includes(B)){ const bp=B.o.position; minAB=Math.min(minAB, Math.hypot(ap.x-bp.x, ap.z-bp.z)); }
       const rp=me.g.position; minAR=Math.min(minAR, Math.hypot(ap.x-rp.x, ap.z-rp.z)); if (TRAFFIC.rel(A.d)*s> 30) { passed=1; } }
     res.push({d0,D,late,rv:rvk,B:!!B,minAB:+minAB.toFixed(1),minAR:+minAR.toFixed(1),passed,aborted,Bstop}); }
   return res; });
 let bad=0; r.forEach(x=>{ console.log(JSON.stringify(x)); if (x.minAB<3.2) bad++; }); console.log('kollisionen',bad); await b.close(); })();
