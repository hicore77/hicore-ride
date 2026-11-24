const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:960,height:540}}); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.stack.slice(0,300))); p.on('console',m=>{ if((m.type()==='warning'||m.type()==='error') && !/GPU stall|GL Driver|willReadFrequently|AttributeNode/.test(m.text())) errs.push(m.text().slice(0,220)); });
 let mode=0, urls=[];
 await p.route(/open-meteo/, r=>{ urls.push(r.request().url()); const now=Date.now(), t=[], pr=[]; for (let i=-13;i<=1;i++){ t.push(new Date(Math.floor(now/9e5)*9e5+i*9e5).toISOString().slice(0,16)); pr.push(mode===0?(i>-8&&i<-3?1.2:0):0); }
   const cur=mode===0?{temperature_2m:4.3,weather_code:3,cloud_cover:90,precipitation:0,wind_speed_10m:18,visibility:20000}:mode===1?{temperature_2m:6,weather_code:81,cloud_cover:55,precipitation:2,wind_speed_10m:25,visibility:9000}:{temperature_2m:2,weather_code:95,cloud_cover:100,precipitation:5,wind_speed_10m:40,visibility:5000};
   r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({current:cur,minutely_15:{time:t,precipitation:pr}})}); });
 await p.addInitScript(()=>{ try{ localStorage.setItem('hicoreRide.gfx',JSON.stringify(1)); localStorage.setItem('hicoreRide.gfxUser','1'); }catch(e){} });
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:300000}); await p.evaluate(()=>window.LC_READY);
 await p.evaluate(()=>{ applyGfx(1); selWorld='zittau'; buildWorld(WORLDS.find(x=>x.id==='zittau')); builtWorld='zittau'; });
 await p.waitForTimeout(3000);
 const st=async tag=>{ const r=await p.evaluate(()=>({info:RWX.info,cat:RWX.cat,shower:RWX.shower,wet:+WET.w.value.toFixed(2),tw:WET.tw,rain:ATMO.rainAmt,sun:RWX.sunEl&&+RWX.sunEl.toFixed(1),night:ATMO.night(),dir:SUN_DIR.toArray().map(v=>+v.toFixed(2)),pos:RWX.pos().map(v=>+v.toFixed(4)),place:RWX.place,ui:$('realWx').textContent})); console.log(tag, JSON.stringify(r)); };
 await p.evaluate(()=>{ $('wx').value='echt'; $('wx').onchange(); $('tod').value='echt'; $('tod').onchange(); }); await p.waitForTimeout(1500); await st('jetzt-nacht');
 // Mittag simulieren: Sonnenstand für 12 Uhr
 await p.evaluate(()=>{ const D=Date; window.__d=new D(); RWX._sun=RWX.sun; RWX.sun=(a,b,d)=>RWX._sun(a,b,new D(D.UTC(2026,10,23,11,0))); RWX.tick(true); }); await p.waitForTimeout(1500); await st('mittag-nass');
 mode=1; await p.evaluate(()=>{ me.g.position.x+=3000; RWX.tick(true); }); await p.waitForTimeout(2500); await st('schauer');
 await p.evaluate(()=>{ for (let i=0;i<60;i++) ATMO.update(1); }); await st('schauer+60s');
 mode=2; await p.evaluate(()=>{ RWX.tick(true); }); await p.waitForTimeout(1500); await st('gewitter');
 await p.evaluate(()=>{ ATMO.wx='sonne'; ATMO.apply(); for (let i=0;i<300;i++) ATMO.update(1); }); await st('5min-trocknen');
 await p.evaluate(()=>{ for (let i=0;i<500;i++) ATMO.update(1); }); await st('13min-trocknen');
 console.log('URL', urls[0]); console.log(errs.slice(0,8).join('\n')||'no errors'); await b.close(); })();
