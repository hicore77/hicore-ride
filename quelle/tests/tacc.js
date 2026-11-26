// 0.24.0 Konten: Anmelden per Code, Profil/Einstellungen/Bestzeiten/Fahrten über zwei "Geräte" (zwei Browser-Kontexte), Supabase durch fake_auth.js ersetzt. OUT=Ordner für Bilder
const {chromium}=require('playwright'); const serve=require('./serve'); const fs=require('fs'); const FAKE=fs.readFileSync(__dirname+'/fake_auth.js','utf8'); const SRV=require('./fake_auth_srv')();
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const OUT=process.env.OUT||''; const errs=[], res=[];
 const ok=(n,c,x)=>{ res.push((c?'OK   ':'FEHLER ')+n+(x!==undefined?' · '+JSON.stringify(x).slice(0,300):'')); };
 const dev=async(name)=>{ const ctx=await b.newContext({viewport:{width:1000,height:700}, acceptDownloads:true}); await serve(ctx); await ctx.addInitScript(FAKE); await ctx.exposeFunction('__srv', j=>JSON.stringify(SRV.handle(j)));
   const p=await ctx.newPage(); p.on('pageerror',e=>errs.push(name+' PE '+e.message)); p.on('console',m=>{ if (m.type()==='error' && !/WebGL|GPU|404|Failed to load/.test(m.text())) errs.push(name+' CE '+m.text().slice(0,200)); });
   await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>typeof ACC!=='undefined' && ACC.sb,null,{timeout:600000}); await p.waitForTimeout(500); return p; };
 const t0=Date.now(); const A=await dev('A'); ok('Seite A geladen, Konto-Modul aktiv ('+Math.round((Date.now()-t0)/1000)+' s)', true);
 ok('Knopf zeigt Anmelden', await A.evaluate(()=>$('accBtn').textContent), await A.evaluate(()=>$('accBtn').textContent));
 // lokale Einstellungen vor dem Anmelden
 await A.evaluate(()=>{ $('mass').value=75; $('mass').dispatchEvent(new Event('change')); $('tod').value='abend'; $('tod').dispatchEvent(new Event('change')); store.set('mpName','Hicore'); store.set('seg_zittau',{testberg:{t:301.5,at:Date.now()}}); });
 await A.click('#accBtn'); if (OUT) await A.screenshot({path:OUT+'/konto_login.png'});
 await A.fill('#accMail','heiko@example.org'); await A.evaluate(()=>{ document.querySelector('#accSend').closest('details').open=true; }); await A.click('#accSend'); await A.waitForTimeout(300);
 ok('Codefeld erscheint', await A.evaluate(()=>$('accCodeBox').style.display==='block'));
 await A.fill('#accCode','111111'); await A.click('#accVerify'); await A.waitForTimeout(300);
 ok('Falscher Code wird gemeldet', /falsch/.test(await A.evaluate(()=>$('accStat').textContent)), await A.evaluate(()=>$('accStat').textContent));
 await A.fill('#accCode','123456'); await A.click('#accVerify');
 await A.waitForFunction(()=>ACC.user && !ACC.syncing && /Abgeglichen/.test($('accStat').textContent),null,{timeout:20000}).catch(()=>{});
 ok('Angemeldet, Knopf mit Name', await A.evaluate(()=>$('accBtn').textContent==='👤 Hicore' && $('accIn').style.display==='block'), await A.evaluate(()=>$('accBtn').textContent));
 const P=SRV.db.profiles[0]||{}; ok('Profil hochgeladen (Gewicht 75, abend, Name)', P.mass===75 && P.settings && P.settings.tod==='abend' && P.name==='Hicore', {mass:P.mass, tod:P.settings&&P.settings.tod, name:P.name});
 ok('Bestzeit hochgeladen', SRV.db.segment_bests.length===1 && SRV.db.segment_bests[0].t===301.5, SRV.db.segment_bests);
 ok('Gemini-Schlüssel nicht im Profil', !JSON.stringify(SRV.db.profiles).includes('aiKey'));
 // Fahrt speichern (ohne Spielstart: Track nachgebaut)
 await A.evaluate(()=>{ S.sim=false; track=[]; const t=Date.now()-200000; for (let i=0;i<150;i++) track.push({t:t+i*1000, lat:50.85+i*1e-5, lon:14.7, alt:400+i*0.1, hr:130+i%10, cad:88, dist:i*8, v:8, pw:200+(i%20)}); S.time=150; S.energy=150*205; S.dist=1200; S.odo=1200; S.climb=15; ACC.saveRide(); });
 await A.waitForFunction(()=>/gespeichert/.test($('sumAcc').textContent),null,{timeout:20000}).catch(()=>{});
 ok('Fahrt im Konto gespeichert', SRV.db.rides.length===1 && Object.keys(SRV.files).length===1, {rides:SRV.db.rides.map(r=>({km:r.km,avg_w:r.avg_w,avg_hr:r.avg_hr,dur:r.dur_s})), msg:await A.evaluate(()=>$('sumAcc').textContent)});
 await A.evaluate(()=>ACC.loadRides()); await A.waitForTimeout(400);
 ok('Fahrt in der Liste', await A.evaluate(()=>document.querySelectorAll('#accRides .accR button[data-a=fit]').length===1));
 if (OUT) await A.screenshot({path:OUT+'/konto_profil.png'});
 const [dl]=await Promise.all([A.waitForEvent('download',{timeout:10000}).catch(()=>null), A.click('#accRides button[data-a=fit]')]);
 let fitOk=false; if (dl){ const pth=await dl.path(); const bb=fs.readFileSync(pth); fitOk=bb.length>1000 && bb.slice(8,12).toString()==='.FIT'; } ok('FIT aus dem Konto heruntergeladen', fitOk, dl&&dl.suggestedFilename());
 // Sim-Fahrt nicht speichern
 await A.evaluate(()=>{ S.sim=true; ACC.saveRide(); }); ok('Testfahrt ohne Trainer nicht gespeichert', SRV.db.rides.length===1, await A.evaluate(()=>$('sumAcc').textContent));
 // Gerät B: frisch, anmelden → Einstellungen kommen an
 const B=await dev('B'); ok('B vorher Gewicht Standard', await B.evaluate(()=>$('mass').value), await B.evaluate(()=>$('mass').value));
 await B.evaluate(()=>{ ACC.show(); $('accMail').value='heiko@example.org'; document.querySelector('#accSend').closest('details').open=true; }); await B.click('#accSend'); await B.fill('#accCode','123456'); await B.click('#accVerify');
 await B.waitForFunction(()=>ACC.user && !ACC.syncing && /Abgeglichen/.test($('accStat').textContent),null,{timeout:20000}).catch(()=>{});
 const bs=await B.evaluate(()=>({mass:$('mass').value, tod:$('tod').value, todA:ATMO.tod, name:store.get('mpName',''), best:(store.get('seg_zittau',{}).testberg||{}).t, btn:$('accBtn').textContent, rides:document.querySelectorAll('#accRides .accR button[data-a=fit]').length}));
 ok('B übernimmt Gewicht, Tageszeit, Name, Bestzeit, Fahrt', bs.mass==='75' && bs.tod==='abend' && bs.todA==='abend' && bs.name==='Hicore' && bs.best===301.5 && bs.rides===1, bs);
 // B ändert Gewicht und verbessert Bestzeit → A gleicht ab
 await B.evaluate(()=>{ $('accMass').value=80; $('accMass').dispatchEvent(new Event('change')); }); await B.waitForTimeout(4500);
 ok('Änderung von B hochgeladen', SRV.db.profiles[0].mass===80, SRV.db.profiles[0].mass);
 SRV.db.segment_bests[0].t=290.2;
 await A.evaluate(()=>{ $('mass').value; }); await A.click('#accSync'); await A.waitForFunction(()=>!ACC.syncing && /Abgeglichen/.test($('accStat').textContent),null,{timeout:20000}).catch(()=>{});
 const as=await A.evaluate(()=>({mass:$('mass').value, best:store.get('seg_zittau',{}).testberg.t})); ok('A übernimmt neueres Gewicht und bessere Bestzeit', as.mass==='80' && as.best===290.2, as);
 // Passwort festlegen, in B abmelden, mit Passwort wieder an
 await A.evaluate(()=>{ $('accNewPw').value='geheim123'; }); await A.evaluate(()=>ACC.setPw()); ok('Passwort gespeichert', /Passwort gespeichert/.test(await A.evaluate(()=>$('accStat').textContent))); await A.waitForTimeout(300);
 await B.evaluate(()=>ACC.logout()); await B.waitForTimeout(300); ok('B abgemeldet', await B.evaluate(()=>$('accBtn').textContent==='👤 Anmelden' && !ACC.user));
 await B.evaluate(()=>{ $('accMail').value='heiko@example.org'; $('accPw').value='geheim123'; ACC.pwLogin(); }); await B.waitForFunction(()=>!!ACC.user,null,{timeout:10000}).catch(()=>{});
 ok('B mit Passwort angemeldet', await B.evaluate(()=>!!ACC.user));
 // Neuladen: Sitzung bleibt
 await B.reload(); await B.waitForFunction(()=>typeof ACC!=='undefined' && ACC.user,null,{timeout:600000}).catch(()=>{}); ok('Nach Neuladen weiter angemeldet', await B.evaluate(()=>typeof ACC!=='undefined' && !!ACC.user));
 // Google ohne Einrichtung → verständliche Meldung
 await B.evaluate(()=>ACC.logout()); await B.evaluate(()=>ACC.google()); await B.waitForTimeout(300); ok('Google ohne Einrichtung: Meldung', /noch nicht eingerichtet/.test(await B.evaluate(()=>$('accStat').textContent)), await B.evaluate(()=>$('accStat').textContent));
 ok('Absturz-Erkennung zurückgesetzt vor Google', await B.evaluate(()=>localStorage.getItem('hicoreRide.bootN')==='0'));
 // Registrieren mit Passwort (Gerät C), dann gleiche Adresse nochmal
 const C=await dev('C'); await C.evaluate(()=>{ ACC.show(); $('accMail').value='freund@example.org'; $('accPw').value='rad12345'; }); await C.click('#accReg'); await C.waitForFunction(()=>!!ACC.user,null,{timeout:10000}).catch(()=>{});
 ok('Registrieren mit Passwort meldet sofort an', await C.evaluate(()=>ACC.user&&ACC.user.email), await C.evaluate(()=>$('accStat').textContent));
 await C.evaluate(()=>ACC.logout()); await C.evaluate(()=>{ $('accMail').value='freund@example.org'; $('accPw').value='rad12345'; }); await C.click('#accReg'); await C.waitForTimeout(400);
 ok('Doppelte Registrierung: Hinweis', /schon ein Konto/.test(await C.evaluate(()=>$('accStat').textContent)), await C.evaluate(()=>$('accStat').textContent));
 await C.click('#accPwGo'); await C.waitForFunction(()=>!!ACC.user,null,{timeout:10000}).catch(()=>{}); ok('Anmelden mit Passwort (Knopf)', await C.evaluate(()=>!!ACC.user));
 if (OUT){ await C.evaluate(()=>ACC.logout()); await C.waitForTimeout(200); await C.evaluate(()=>ACC.show()); await C.screenshot({path:OUT+'/konto_pw.png'}); }
 // Konto löschen in A
 await A.evaluate(()=>ACC.delAcc()); await A.evaluate(()=>ACC.delAcc()); await A.waitForTimeout(600);
 ok('Konto gelöscht (Daten und Dateien weg)', !SRV.users['heiko@example.org'] && !SRV.db.rides.length && SRV.db.profiles.length===1 && !Object.keys(SRV.files).length && !(await A.evaluate(()=>!!ACC.user)), {u:Object.keys(SRV.users).length, f:Object.keys(SRV.files).length});
 console.log(res.join('\n')); console.log('Seitenfehler:', errs.length?errs.join('\n'):'none'); await b.close(); })().catch(e=>{ console.error(e); process.exit(1); });
