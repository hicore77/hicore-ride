/* Test-Ersatz für Supabase Auth/Datenbank/Speicher (Cloud erreicht Supabase nicht). Der "Server" läuft in Node (window.__srv), damit zwei Browser-Kontexte = zwei Geräte dieselben Daten sehen. */
window.HC_SB={ createClient(url,key,opt){ const SK=(opt&&opt.auth&&opt.auth.storageKey)||'sb'; let ses=null; try{ ses=JSON.parse(localStorage.getItem(SK)||'null'); }catch(e){}
  const L=[], emit=ev=>L.forEach(cb=>cb(ev,ses)), setSes=u=>{ ses=u?{user:u,access_token:'fake'}:null; if (ses) localStorage.setItem(SK,JSON.stringify(ses)); else localStorage.removeItem(SK); };
  const srv=o=>window.__srv(JSON.stringify(Object.assign({uid:ses&&ses.user&&ses.user.id},o))).then(r=>JSON.parse(r)), E=r=>r&&r.error?{message:r.error}:null;
  setTimeout(()=>emit('INITIAL_SESSION'),30);
  const qb=t=>{ const q={t,act:'select',f:[]}; const o={ select(c){ if (q.act==='select') q.act='select'; return o; }, eq(k,v){ q.f.push([k,v]); return o; }, order(k,x){ q.order=[k,x&&x.ascending]; return o; }, limit(n){ q.limit=n; return o; },
      maybeSingle(){ q.single=1; return o; }, upsert(rows,x){ q.act='upsert'; q.rows=Array.isArray(rows)?rows:[rows]; q.oc=(x&&x.onConflict)||'id'; q.ign=!!(x&&x.ignoreDuplicates); return o; }, delete(){ q.act='delete'; return o; },
      then(res,rej){ return srv({op:'db',q}).then(r=>({data:r.data, error:E(r)})).then(res,rej); } }; return o; };
  const b2s=async b=>{ const u=new Uint8Array(await b.arrayBuffer()); let s=''; u.forEach(x=>s+=String.fromCharCode(x)); return btoa(s); };
  return { auth:{ onAuthStateChange(cb){ L.push(cb); return {data:{subscription:{unsubscribe(){}}}}; },
      async signInWithOtp({email}){ const r=await srv({op:'otp',email}); return {data:{},error:E(r)}; },
      async verifyOtp({email,token}){ const r=await srv({op:'verify',email,token}); if (r.error) return {data:{},error:E(r)}; setSes(r.user); emit('SIGNED_IN'); return {data:{user:r.user},error:null}; },
      async signInWithPassword({email,password}){ const r=await srv({op:'pw',email,password}); if (r.error) return {data:{},error:E(r)}; setSes(r.user); emit('SIGNED_IN'); return {data:{user:r.user},error:null}; },
      async signInWithOAuth(){ return {data:{},error:{message:'Unsupported provider: provider is not enabled'}}; },
      async signOut(){ setSes(null); emit('SIGNED_OUT'); return {error:null}; },
      async updateUser({password}){ const r=await srv({op:'setpw',password}); return {data:{},error:E(r)}; } },
    from:qb,
    storage:{ from(b){ return { async upload(path,blob){ const r=await srv({op:'up',b,path,d:await b2s(blob)}); return {data:{path},error:E(r)}; },
      async download(path){ const r=await srv({op:'down',b,path}); if (r.error) return {data:null,error:E(r)}; const s=atob(r.data), u=new Uint8Array(s.length); for (let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return {data:new Blob([u]),error:null}; },
      async list(pre){ const r=await srv({op:'list',b,pre}); return {data:r.data,error:E(r)}; },
      async remove(paths){ const r=await srv({op:'rm',b,paths}); return {data:[],error:E(r)}; } }; } },
    async rpc(n){ const r=await srv({op:'rpc',n}); return {data:null,error:E(r)}; } }; } };
