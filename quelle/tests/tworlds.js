// 0.24.5 Abbiegewahl in den Rundkurs-Welten (Sonneninsel, Elbsandstein …): ganze Runde mit netStep abfahren, einmal frisch und einmal mit
// Kreuzungsfeld im Zittau-Zustand (wie nach einer Fahrt im Zittauer Gebirge). Dazu Weltauswahl: welche Karten sichtbar. W=insel,elbe  PRE='…'
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 for (const w of (process.env.W||'insel,elbe').split(',')){
  const ctx=await b.newContext({viewport:{width:1180,height:820}}); await serve(ctx); const errs=[];
  const g=await ctx.newPage(); g.on('pageerror',e=>errs.push(e.message.slice(0,300))); if (process.env.PRE) await g.addInitScript(process.env.PRE);
  await g.goto('http://127.0.0.1:8765/index.html?gl=1'); await g.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
  const cards=await g.evaluate(()=>[...document.querySelectorAll('#worlds .wcard b')].map(e=>e.textContent));
  await g.evaluate(w=>{ selWorld=w; $('bots').value='0'; BIKE='road'; $('bSim').click(); },w);
  await g.waitForFunction(()=>S.running,null,{timeout:1200000});
  const r=await g.evaluate(()=>{ const out={}; TRAFFIC.nextT=1e9; $('simW').value=0; meP.v=0;
    for (const mode of ['frisch','nachZittau']){ let shown=0, err=null, txt='';
      if (mode==='nachZittau'){ let el=$('junc'); if (!el){ el=document.createElement('div'); el.id='junc'; document.body.appendChild(el); }
        el.dataset.g=''; el.innerHTML='<div class="jt"></div><div class="jb"><button data-v="7">x</button></div><div class="j2"><div class="jt"></div><div class="jb"></div></div>'; }
      NET.appl.clear(); NET.pend=null; const d0=S.dist;
      try{ for (let d=d0; d<d0+L-5; d+=4){ S.dist=d%L; netStep(); if (NET.pend){ shown++; const t=document.querySelector('#junc [data-v=turn]'); if (t) txt=t.textContent; } } }catch(e){ err=e.message; }
      out[mode]={shown, err, txt, kreuzungen:NET.junc.length}; }
    return out; });
  console.log(w, 'Karten:', JSON.stringify(cards), JSON.stringify(r), 'Seitenfehler:', errs.length?errs:'none');
  await ctx.close(); }
 await b.close(); })();
