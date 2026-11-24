// Liefert quelle/gpu direkt aus dem Dateisystem an Playwright (ohne eigenen HTTP-Server): page.route auf http://127.0.0.1:8765/
const fs=require('fs'), path=require('path');
const ROOT=process.env.ROOT||path.join(__dirname,'..','gpu');
const T={'.html':'text/html','.js':'application/javascript','.jpg':'image/jpeg','.png':'image/png','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.json':'application/json','.webp':'image/webp'};
module.exports=async function(ctx){ await ctx.route('http://127.0.0.1:8765/**', async r=>{ const u=new URL(r.request().url()); let f=path.join(ROOT, decodeURIComponent(u.pathname)); if (f.endsWith('/')) f+='index.html';
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) return r.fulfill({status:404,body:'nf'}); r.fulfill({status:200, contentType:T[path.extname(f)]||'application/octet-stream', body:fs.readFileSync(f)}); }); };
