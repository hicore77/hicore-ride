// Echtes Wetter mit Schnee (Open-Meteo gemockt): Kategorie, Schneelage, Anzeige
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const ctx=await b.newContext(); await serve(ctx); const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PE',e.message));
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForTimeout(30000);
 const cases=[{weather_code:73,cloud_cover:95,temperature_2m:-3,snow_depth:0.14,snowfall:0.6,wind_speed_10m:12},{weather_code:77,cloud_cover:90,temperature_2m:0,snow_depth:0.01,snowfall:0.1,wind_speed_10m:5},{weather_code:3,cloud_cover:80,temperature_2m:5,snow_depth:0.04,snowfall:0,wind_speed_10m:5},{weather_code:0,cloud_cover:5,temperature_2m:-6,snow_depth:0.25,snowfall:0,wind_speed_10m:3},{weather_code:61,cloud_cover:100,temperature_2m:8,snow_depth:0,snowfall:0,precipitation:1,wind_speed_10m:3}];
 for (const c of cases) console.log(await p.evaluate(c=>{ ATMO.wx='echt'; RWX.calcW(c); ATMO.apply(); snowUI(); return JSON.stringify({cat:RWX.cat, snow:RWX.W.snow||0, gr:RWX.W.graupel||0, rain:RWX.W.rain||0, SN:RWX.SN, t:SNOW.t, flk:ATMO.flk&&ATMO.flk.visible, dis:$('snow').disabled, info:RWX.info}); },c));
 await b.close(); })();
