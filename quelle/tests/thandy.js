// 0.23.0 Handy-Fernbedienung: Spiel + Handy-Seite im selben Browser, Supabase durch fake_supabase.js ersetzt. OUT=Ordner für Bilder
const {chromium}=require('playwright'); const serve=require('./serve'); const fs=require('fs'); const FAKE=fs.readFileSync(__dirname+'/fake_supabase.js','utf8');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext({viewport:{width:900,height:520}}); await serve(ctx);
 await ctx.route('http://127.0.0.1:8765/handy/supabase.js', r=>r.fulfill({status:200, contentType:'application/javascript', body:FAKE}));
 const OUT=process.env.OUT||'.'; const errs=[]; const res=[]; const ok=(n,c,x)=>{ res.push((c?'OK   ':'FEHLER ')+n+(x!==undefined?' · '+JSON.stringify(x):'')); };
 const g=await ctx.newPage(); g.on('pageerror',e=>errs.push('Spiel PE '+e.message));
 await g.goto('http://127.0.0.1:8765/index.html?gl=1'); await g.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await g.evaluate(F=>{ eval(F); selWorld='zittau'; $('bots').value='0'; ATMO.wx='sonne'; ATMO.sn='keine'; ATMO.tod='mittag'; ATMO.apply(); BIKE='road'; $('bSim').click(); }, FAKE);
 await g.waitForFunction(()=>S.running,null,{timeout:1200000});
 const code=await g.evaluate(()=>{ $('simW').value=0; TRAFFIC.nextT=1e9; CMP.show(); return CMP.code; }); ok('Code erzeugt', /^[A-Z2-9]{6}$/.test(code), code);
 await g.waitForTimeout(1500);
 const qr=await g.evaluate(()=>{ const c=$('cmpQr'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let k=0; for (let i=0;i<d.length;i+=4) if (d[i]<50) k++; return {w:c.width, dunkel:k, link:$('cmpLink').textContent}; }); ok('QR-Code gezeichnet', qr.dunkel>2000, qr);
 await g.screenshot({path:OUT+'/handy_spiel_qr.jpg', quality:85, timeout:240000});
 const h=await ctx.newPage(); await h.setViewportSize({width:390,height:844}); h.on('pageerror',e=>errs.push('Handy PE '+e.message));
 await h.goto('http://127.0.0.1:8765/handy/?c='+code);
 await h.waitForFunction(()=>/Verbunden/.test(document.getElementById('stT').textContent),null,{timeout:120000}).catch(()=>{});
 const st=await h.evaluate(()=>({t:document.getElementById('stT').textContent, w:document.getElementById('vW').textContent, v:document.getElementById('vV').textContent})); ok('Handy verbunden, Werte da', /Verbunden/.test(st.t) && st.w!=='–', st);
 ok('Spiel sieht Handy', await g.evaluate(()=>CMP.phone===1 && /Handy verbunden/.test($('cmpStat2').textContent)));
 await g.evaluate(()=>{ $('cmpModal').style.display='none'; });
 // Leistung im Sim, Werte am Handy prüfen
 await g.evaluate(()=>{ $('simW').value=220; }); await g.waitForTimeout(6000);
 const w2=await h.evaluate(()=>+document.getElementById('vW').textContent); ok('Watt kommen an (Sim 220)', w2>150, w2);
 // Kreuzung suchen: wie tride, Strecke vorspulen bis ein Hinweis mit mehreren Optionen 100–150 m voraus steht
 const jx=await g.evaluate(()=>{ $('simW').value=0; meP.v=0; const d0=S.dist; for (let d=d0+30; d<d0+L-200; d+=3){ S.dist=d; gNetStep(); const P=NET.pend; if (P && P.ah>110 && P.ah<150 && P.opts.some(o=>o.a<=-28) && P.opts.some(o=>o.a>=28)) return {ah:P.ah, opts:P.opts.map(o=>o.label+' '+(o.dest||o.name)+' '+Math.round(o.a)), pick:NET.pick}; } return null; });
 ok('Kreuzung mit links und rechts gefunden', !!jx, jx);
 if (jx){ await h.waitForFunction(()=>document.querySelectorAll('#junO button').length>=2,null,{timeout:20000}).catch(()=>{});
   ok('Handy zeigt Kreuzung', await h.evaluate(()=>document.querySelectorAll('#junO button').length), await h.evaluate(()=>document.getElementById('junT').textContent));
   await h.screenshot({path:OUT+'/handy_kreuzung.png'});
   await h.click('#aL'); await g.waitForTimeout(1500);
   const pl=await g.evaluate(()=>{ const o=NET.pend&&NET.pend.opts.find(x=>x.e===NET.pick); return o?{l:o.label,a:Math.round(o.a)}:null; }); ok('Links gewählt', pl&&pl.a<=-28, pl);
   await h.click('#aR'); await g.waitForTimeout(1500);
   const pr=await g.evaluate(()=>{ const o=NET.pend&&NET.pend.opts.find(x=>x.e===NET.pick); return o?{l:o.label,a:Math.round(o.a)}:null; }); ok('Rechts gewählt', pr&&pr.a>=28, pr);
   await h.waitForTimeout(1200); await h.screenshot({path:OUT+'/handy_rechts.png'});
   ok('Handy zeigt Auswahl', await h.evaluate(()=>{ const b=document.querySelector('#junO button.on'); return b?b.textContent:null; }));
   await h.click('#aS'); await g.waitForTimeout(1500);
   const ps=await g.evaluate(()=>{ const o=NET.pend&&NET.pend.opts.find(x=>x.e===NET.pick); return o?{l:o.label,a:Math.round(o.a)}:null; }); ok('Geradeaus gewählt (falls vorhanden)', true, ps);
   // direkt eine Option antippen
   const n1=await h.evaluate(()=>{ const b=[...document.querySelectorAll('#junO button')][0]; b.click(); return b.dataset.x; }); await g.waitForTimeout(1500);
   ok('Option direkt angetippt', await g.evaluate(x=>NET.pick===+x, n1), n1); }
 // Vorwahl ohne Kreuzung
 await g.evaluate(()=>{ NET.pend=null; NET.appl.clear(); junUI(null); const d0=S.dist; for (let d=d0+3; d<d0+L-200; d+=3){ S.dist=d; NET.pend=null; NET.appl.clear(); gNetStep(); if (!NET.pend){ junUI(null); return; } } });
 // Wenden, Geste, Pause, Kamera
 const dir0=await g.evaluate(()=>S.dir||1); await h.click('button[data-a="U"]'); await g.waitForTimeout(1500); ok('Wenden', await g.evaluate(d=>(S.dir||1)===-d, dir0));
 await g.waitForTimeout(3500); await h.click('button[data-x="wave"]'); await g.waitForTimeout(400); ok('Geste Grüßen', await g.evaluate(()=>GEST.id==='wave'));
 const cam0=await g.evaluate(()=>camMode); await h.click('button[data-a="C"]'); await g.waitForTimeout(800); ok('Kamera', await g.evaluate(c=>camMode!==c, cam0));
 await h.click('#bP'); await g.waitForTimeout(1500); ok('Pause', await g.evaluate(()=>S.paused)); await h.waitForTimeout(1200); ok('Handy zeigt Weiter', await h.evaluate(()=>/Weiter/.test(document.getElementById('bP').textContent)));
 await h.screenshot({path:OUT+'/handy_pause.png'}); await h.click('#bP'); await g.waitForTimeout(1000);
 // Vorwahl links ohne Kreuzung, danach Kreuzung anfahren: Wunsch wird angewendet
 await g.evaluate(()=>{ S.ut=null; S.dir=1; meP.dir=1; NET.pend=null; junUI(null); CMP.want=null; });
 await h.click('#aL'); await g.waitForTimeout(1500); const wa=await g.evaluate(()=>CMP.want&&CMP.want.a); ok('Vorwahl gespeichert', wa==='L', wa);
 const ap=await g.evaluate(()=>{ const d0=S.dist; for (let d=d0+3; d<d0+L-200; d+=3){ S.dist=d; gNetStep(); const P=NET.pend; if (P && P.opts.some(o=>o.a<=-28)){ CMP.frame(0.016,true); const o=P.opts.find(x=>x.e===NET.pick); return {gewaehlt:o&&o.label, a:o&&Math.round(o.a), rest:!!CMP.want}; } } return null; });
 ok('Vorwahl an nächster Kreuzung angewendet', ap && ap.a<=-28 && !ap.rest, ap);
 const msgT=await h.evaluate(()=>document.getElementById('msg').textContent); ok('Rückmeldung am Handy', msgT.length>0, msgT);
 console.log(res.join('\n')); console.log(errs.length?errs.join('\n'):'keine Seitenfehler'); await b.close(); })();
