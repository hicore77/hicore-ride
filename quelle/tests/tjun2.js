// 0.16.3: zwei Kreuzungen kurz hintereinander. Während die erste angezeigt wird, an der zweiten (klein darunter) abbiegen wählen; prüfen, dass die zweite sichtbar war und das Abbiegen dort greift.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:900,height:500}}); await require("./serve")(ctx); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate(()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); });
 const r=await p.evaluate(([NS,BK,T1])=>{ window.requestAnimationFrame=()=>0; BIKE=BK; const D=gnData(); nearD=new Float32Array((G+1)*(G+1)); nearY=new Float32Array((G+1)*(G+1)); EXT=2*Math.max(...D.reg.map(Math.abs))+1200; CELL=EXT/G; OFF=-EXT/2;
   const R=gnRG(), A=gAdj(R); const main=gRoute(R.loop.map(([e,dir])=>({e,dir})),''); NET={main, cur:main, graph:true, appl:new Set(), rc:{'':main}}; setRoute(main);
   window.toast=()=>{}; S.running=true; S.dir=1; S.ut=0; S.speed=9; const st={tried:0, shown:0, ok:0, fail:[]};
   for (let d0=500; d0<L-3000 && st.tried<NS; d0+=1500){ NET.cur=main; setRoute(main); NET.appl.clear(); NET.pend=null; NET.pick=null; NET.pre=null; S.dist=d0; let target=null, first=null, seen2=false, t1=null;
     for (let s=0;s<3000;s++){ S.dist+=0.9; gNetStep(); const P=NET.pend, P2=NET.pend2v;
       if (T1 && !t1 && P){ const a1=P.opts.find(o=>o.e!==P.planned && Math.abs(o.a)>30); if (a1){ t1=P.tag; NET.pend2v=null; NET.pick=a1.e; } continue; }
       if (!target && P && P2 && (T1?P.tag===t1:NET.pick===P.planned)){ const alt=P2.opts.find(o=>o.e!==P2.planned && o.e!==P2.nat && Math.abs(o.a)>30); if (alt){ target={tag:P2.tag, node:P2.node, e:alt.e, rd:P2.rd}; first=P.tag; (NET.pre||(NET.pre=new Map())).set(P2.tag,alt.e); gJunUI(P,P.ah); const el=document.querySelector('#junc .j2'); seen2=!!el && el.style.display==='block' && !!el.querySelector('button.on[data-v="'+alt.e+'"]'); st.tried++; if (seen2) st.shown++; } }
       if (target && S.dist>target.rd+40) break; if (!target && S.dist>d0+1500) break; }
     if (target){ const ok=NET.cur.ents.some(x=>x.e===target.e && x.r0<=S.dist+5); if (ok) st.ok++; else st.fail.push(target); } }
   return st; }, [+(process.env.NS||12), process.env.BIKE||'road', +(process.env.TURN1||0)]);
 console.log(JSON.stringify(r)); console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
