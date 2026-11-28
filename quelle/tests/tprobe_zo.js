// 0.28.0 Hilfsprüfung: Materialien/UV/Ecken der ZO-Modelle
const {chromium}=require('playwright'); const serve=require('./serve');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:640,height:360}}); await serve(ctx); const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:8765/index.html?gl=1'); await p.waitForFunction(()=>window.glbRiderReady,null,{timeout:800000});
 await p.evaluate(()=>{ selWorld='zittau'; $('bots').value='0'; $('bSim').click(); }); await p.waitForFunction(()=>S.running,null,{timeout:1500000});
 await p.waitForFunction(()=>PROP_LIB.zs_paar,null,{timeout:300000});
 console.log(JSON.stringify(await p.evaluate(()=>{ const out={}; for (const n of ['bank','schild_holz','fels_1','zsb_lok',...ZO_MODELS]){ const L=PROP_LIB[n]; if (!L){ out[n]='fehlt'; continue; }
   out[n]=L.map(({geo,mat})=>{ const u=geo.attributes.uv; let a=1e9,b=-1e9,c=1e9,d=-1e9; if (u) for (let i=0;i<u.count;i++){ a=Math.min(a,u.getX(i)); b=Math.max(b,u.getX(i)); c=Math.min(c,u.getY(i)); d=Math.max(d,u.getY(i)); }
     const maps=Object.keys(mat).filter(k=>mat[k]&&mat[k].isTexture).map(k=>k+':'+(mat[k].image?(mat[k].image.width+'x'+mat[k].image.height+' '+mat[k].image.constructor.name):'-')+' fy'+mat[k].flipY+' cs'+mat[k].colorSpace);
     return {t:mat.type, col:mat.color&&mat.color.getHexString(), r:mat.roughness, m:mat.metalness, side:mat.side, tr:mat.transparent, at:mat.alphaTest, vc:mat.vertexColors, v:geo.attributes.position.count, idx:geo.index?geo.index.count:0, attrs:Object.keys(geo.attributes).join(','), uv:[a,b,c,d].map(x=>+x.toFixed(3)), maps, ud:JSON.stringify(mat.userData).slice(0,80)}; }); } return out; }),null,1));
 await b.close(); })();
