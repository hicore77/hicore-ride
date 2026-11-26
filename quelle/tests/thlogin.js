// 0.24.2 Anmeldung übertragen: Spiel zeigt Code, handy/login.html meldet sich (Fake-)Google an und übergibt die Sitzung; danach Übergabe Spiel → Spiel. Supabase durch fake_auth.js ersetzt.
const {chromium}=require('playwright'); const serve=require('./serve'); const fs=require('fs'); const FAKE=fs.readFileSync(__dirname+'/fake_auth.js','utf8'); const SRV=require('./fake_auth_srv')();
(async()=>{ const b=await chromium.launch(); const OUT=process.env.OUT||''; const errs=[], res=[]; const ok=(n,c,x)=>{ res.push((c?'OK   ':'FEHLER ')+n+(x!==undefined?' · '+JSON.stringify(x).slice(0,250):'')); };
 const ctx=await b.newContext({viewport:{width:1000,height:760}}); await serve(ctx); await ctx.addInitScript('window.FAKE_OAUTH="heiko@example.org";'+FAKE); await ctx.exposeFunction('__srv', j=>JSON.stringify(SRV.handle(j)));
 await ctx.route('https://snpmmskruuzqrvvsdztz.supabase.co/auth/v1/settings', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({external:{google:true,email:true}})}));
 const pg=async(u,n)=>{ const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(n+' PE '+e.message)); await p.goto(u); return p; };
 const G=await pg('http://127.0.0.1:8765/index.html?gl=1','G'); await G.waitForFunction(()=>typeof ACC!=='undefined'&&ACC.sb,null,{timeout:300000});
 await G.evaluate(()=>{ ACC.show(); }); await G.click('#accHand'); await G.waitForTimeout(800);
 const code=await G.evaluate(()=>ACC.hc); const qr=await G.evaluate(()=>{ const c=$('accQr'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let k=0; for (let i=0;i<d.length;i+=4) if (d[i]<50) k++; return k; });
 ok('Spiel zeigt Code und QR', /^[A-Z2-9]{6}$/.test(code) && qr>1500, {code, qr, link:await G.evaluate(()=>$('accHandLink').textContent)});
 if (OUT) await G.screenshot({path:OUT+'/hand_spiel.png'});
 const L=await pg('http://127.0.0.1:8765/handy/login.html?c='+code,'L'); await L.setViewportSize({width:390,height:760}); await L.waitForTimeout(300);
 ok('Login-Seite übernimmt Code', await L.evaluate(()=>$('code').value), await L.evaluate(()=>$('code').value));
 if (OUT) await L.screenshot({path:OUT+'/hand_login.png'});
 await L.click('#g'); await G.waitForFunction(()=>!!ACC.user,null,{timeout:15000}).catch(()=>{}); await L.waitForTimeout(800);
 ok('Spiel angemeldet über Handy', await G.evaluate(()=>ACC.user&&ACC.user.email), await G.evaluate(()=>[ACC.user&&ACC.user.email, $('accStat').textContent]));
 ok('Login-Seite zeigt Fertig und vergisst Sitzung', await L.evaluate(()=>/Fertig/.test(document.body.textContent) && !Object.keys(localStorage).some(k=>k.indexOf('hicoreLogin.auth')===0)));
 if (OUT) await L.screenshot({path:OUT+'/hand_fertig.png'});
 await G.waitForFunction(()=>!ACC.syncing && /Abgeglichen/.test($('accStat').textContent),null,{timeout:10000}).catch(()=>{});
 ok('Profil angelegt', SRV.db.profiles.length===1);
 // Spiel → Spiel: G2 (angemeldet) überträgt an G (abgemeldet)
 const G2=await pg('http://127.0.0.1:8765/index.html?gl=1','G2'); await G2.waitForFunction(()=>typeof ACC!=='undefined'&&ACC.user,null,{timeout:300000}).catch(()=>{});
 ok('G2 angemeldet', await G2.evaluate(()=>!!ACC.user));
 await G.evaluate(()=>{ ACC.user=null; ACC.ui(); ACC.mk=ACC.mk; }); await G.evaluate(()=>{ ACC.sb.auth.signOut(); }); await G.waitForTimeout(300);
 await G.evaluate(()=>ACC.handStart()); const c2=await G.evaluate(()=>ACC.hc);
 await G2.evaluate(c=>{ ACC.show(); $('accGiveD').open=true; $('accGive').value=c; },c2); await G2.click('#accGiveGo'); await G2.waitForTimeout(1500);
 ok('Übergabe Spiel → Spiel', await G.evaluate(()=>!!ACC.user) && await G2.evaluate(()=>!ACC.user), {G:await G.evaluate(()=>!!ACC.user), G2:await G2.evaluate(()=>[!!ACC.user,$('accStat').textContent])});
 // falscher Code: keine Antwort → Meldung (Zeitlimit verkürzt nicht, nur prüfen, dass Gerät angemeldet bleibt, wenn Fehler)
 console.log(res.join('\n')); console.log('Seitenfehler:', errs.length?errs.join('\n'):'none'); await b.close(); })().catch(e=>{ console.error(e); process.exit(1); });
