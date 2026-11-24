// 0.16.2: Kreuzung Kälbersträucher (Spitzkunnersdorf -> Mittelherwigsdorf, Links K 8656 Dreihäuser / Rechts Hainewalde). Auf der Runde links bzw. rechts wählen, dann prüfen, ob man wirklich abbiegt.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:640,height:360}}); await require("./serve")(ctx); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000});
 await p.evaluate(()=>{ selWorld='zittau'; WORLD=WORLDS.find(x=>x.id==='zittau'); });
 const r=await p.evaluate(([BK,SPD,NODE,SP])=>{ window.requestAnimationFrame=()=>0; BIKE=BK; const D=gnData(); nearD=new Float32Array((G+1)*(G+1)); nearY=new Float32Array((G+1)*(G+1)); EXT=2*Math.max(...D.reg.map(Math.abs))+1200; CELL=EXT/G; OFF=-EXT/2;
   const R=gnRG(), A=gAdj(R); let main=gRoute(R.loop.map(([e,dir])=>({e,dir})),''); NET={main, cur:main, graph:true, appl:new Set(), rc:{'':main}}; setRoute(main); let main0=main; if (SP){ zgApplyStart({x:SP[0],z:SP[1]}); main=NET.cur; }
   window.toast=()=>{}; window.DBG=[]; const gT0=gTurn; gTurn=function(c,a,e){ const o=gT0(c,a,e); DBG.push({at:a.i, node:a.node, e, first:o.ents.slice(Math.max(0,a.i-1),a.i+4).map(x=>x.e), same:o===c}); return o; }; S.running=true; S.dir=1; S.ut=0; S.speed=SPD;
   // Kreuzung suchen: Knoten der Runde mit Option Richtung Dreihäuser
   let found=null; for (let i=0;i<main.ents.length-1 && !found;i++){ const n=main.ents[i].n1; if ((A[n]||[]).length<3) continue; for (const e of A[n]){ const ds=(R.dest(e,n)||'')+' '+(gStreetVia(R,e,n)||'')+' '+(R.edges[e].nm||''); if ((NODE>=0?n===NODE:/Dreih|8656/.test(ds)) && e!==main.ents[i].e && e!==main.ents[i+1].e){ found={i,n,r1:main.ents[i].r1,e}; break; } } }
   if (!found) return {err:'Kreuzung nicht gefunden'};
   const nd=R.nodes[found.n], out={node:found.n, x:Math.round(nd.x), z:Math.round(nd.z), deg:A[found.n].length, runs:[]};
   for (const side of ['L','R','S']){ NET.cur=main; setRoute(main); S.lap=1; NET.appl.clear(); NET.pend=null; NET.pick=null; S.dist=found.r1-400; let picked=null, log=[], seenPend=[];
     for (let s=0;s<600;s++){ S.dist+=SPD/10; const cb=NET.cur, db=S.dist; gNetStep(); if (NET.cur!==cb) DBG.push({chg:true, from:cb.key, to:NET.cur.key, d0:Math.round(db), d1:Math.round(S.dist), L:Math.round(L)}); const P=NET.pend; if (P && !seenPend.includes(P.tag)){ seenPend.push(P.tag); log.push({tag:P.tag, node:P.node, ah:Math.round(P.ah), minor:P.minor, nat:P.nat, planned:P.planned, opts:P.opts.map(o=>o.label+':'+o.e+':'+(o.dest||o.name))}); }
       if (P && P.node===found.n && !picked){ const o=side==='L'?P.opts.find(o=>o.a< -30):side==='R'?P.opts.find(o=>o.a>30):P.opts.find(o=>o.plan); if (o){ NET.pick=o.e; picked=o; gJunUI(P,P.ah); } }
       if (S.dist>found.r1+60) break; }
     const q=posAt(S.dist), en=NET.cur.ents.find(en=>en.r0<=S.dist && en.r1>S.dist); out.runs.push({dbg:DBG.splice(0), side, picked:picked&&(picked.label+' '+picked.e), nowEdge:en&&en.e, ok:picked?NET.cur.ents.some(x=>x.e===picked.e && x.r0<=S.dist+5):false, pos:[Math.round(q.x),Math.round(q.z)], log}); }
   return out; }, [process.env.BIKE||'road', +(process.env.SPD||9), +(process.env.NODE||-1), process.env.SP?JSON.parse(process.env.SP):null]);
 console.log(JSON.stringify(r,null,1)); console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
