const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:960,height:540}}); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>{ if(/verkehr/.test(m.text())) console.log('C',m.text()); });
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; buildWorld(WORLDS.find(w=>w.id==='zittau')); builtWorld='zittau'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:120000}).catch(()=>{});
 const r=await p.evaluate(()=>{ window.requestAnimationFrame=()=>0; const out=[]; TRAFFIC.MAXA=4; TRAFFIC.nextT=1e9;
   const run=(fk,ti,T,rv,dd,stop)=>{ TRAFFIC.act.slice().forEach(c=>TRAFFIC.kill(c)); TRAFFIC.spawn(fk,ti); const c=TRAFFIC.act[0]; if(!c) return 'nospawn'; if (dd){ c.d=S.dist+(S.dir||1)*dd; } if (stop){ c.mode='stop'; c.v=0; c.stopT=999; c.lat=c.latT=-(roadWAt(c.d)/2+0.4); } let minC=99, maxRl=-9, passed=0, log=[]; meP.v=rv;
     for (let t=0;t<T;t+=0.05){ S.dist+=(S.dir||1)*rv*0.05; TRAFFIC.step(0.05,true); if (!TRAFFIC.act.length) break; const r=TRAFFIC.rel(c.d), Tt=TRAFFIC.types[c.ti];
       // lateral positions in route frame
       const s=S.dir||1, carLatRoute=(c.cd===s?c.lat:-c.lat), rid=TRAFFIC.rLane; if (Math.abs(r)<Tt.len/2+1){ minC=Math.min(minC, Math.abs(carLatRoute-rid)-Tt.w/2-0.3); }
       maxRl=Math.max(maxRl,rid); if (r<-Tt.len) passed=1; if (Math.round(t*20)%40===0 && Math.abs(r)<70) log.push([+t.toFixed(0),Math.round(r),+c.lat.toFixed(1),+rid.toFixed(2),+(c.v*3.6).toFixed(0),c.mode]); }
     return {fk,ti,minClear:+minC.toFixed(2),maxRiderLane:+maxRl.toFixed(2),passed,W:+roadWAt(S.dist).toFixed(1),log:log.slice(0,24)}; };
    out.push(run(0.6,3,70,4)); out.push(run(0.6,1,90,2.7)); TRAFFIC.waveBy=0; return out; });
 console.log(JSON.stringify(r,null,0)); await b.close(); })();
