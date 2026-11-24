// 0.19.1 Treppen im Gelände: je Treppe tiefste Stufe unter Gelände (sink) und größter Überstand (float), alt (OLD_STAIRFIT) gegen neu
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:640,height:400}}); await serve(ctx);
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+(e.stack||e.message).slice(0,400)));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; $('bSim').click(); });
 await p.waitForFunction(()=>S.running,null,{timeout:1200000});
 const r=await p.evaluate(()=>{ const ST=stairsData(), out={};
   for (const old of [1,0]){ window.OLD_STAIRFIT=old?1:0; const o={n:0,sink10:0,sink25:0,sinkMax:0,float50:0,float90:0,floatMax:0,flat:0,hAvg:0,rd:0}; const worst=[];
     ST.forEach(T=>{ T.y0=null; stairInit(T); o.n++; let sk=0, fl=0; for (let k=0;k<T.nv;k++){ const s=T.up>0?T.s0+(k+0.5)*T.t:T.s1-(k+0.5)*T.t, q=stairPt(T,s), t=wayLiftY0(q[0],q[1],terrainH(q[0],q[1])), y=stairStepY(T,k); sk=Math.max(sk,t-y); fl=Math.max(fl,y-t); }
       if (sk>0.10) o.sink10++; if (sk>0.25) o.sink25++; o.sinkMax=Math.max(o.sinkMax,sk); if (fl>0.5) o.float50++; if (fl>0.9) o.float90++; o.floatMax=Math.max(o.floatMax,fl); let hm=9; for (let k=0;k<T.nv;k++) hm=Math.min(hm,stairStepY(T,k)-(k?stairStepY(T,k-1):T.yLo)); o.hAvg+=T.h; if (hm<0.06) o.flat++; if (T.rHi||T.rLo) o.rd++;
       worst.push([+sk.toFixed(2),T.id,+T.h.toFixed(3),T.nv,+fl.toFixed(2)]); });
     o.hAvg=+(o.hAvg/o.n).toFixed(3); o.sinkMax=+o.sinkMax.toFixed(2); o.floatMax=+o.floatMax.toFixed(2); worst.sort((a,b)=>b[0]-a[0]); o.worst=worst.slice(0,6); out[old?'alt':'neu']=o; }
   window.OLD_STAIRFIT=0; ST.forEach(T=>{ T.y0=null; stairInit(T); }); const T=ST.find(t=>t.id===41396618); out.oybin=T?{nv:T.nv,h:+T.h.toFixed(3),R:+T.R.toFixed(2),rLo:T.rLo,rHi:T.rHi,YT:Array.from(T.YT).map(v=>+(v-T.yLo).toFixed(2)),TS:T.TS.filter((v,i)=>i%4===0).map(v=>+(v-T.yLo).toFixed(2))}:null; return out; });
 console.log(JSON.stringify(r)); console.log('Fehler:', errs.length?errs.join('\n'):'none'); await b.close(); })();
