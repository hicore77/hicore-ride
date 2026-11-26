/* Test-Ersatz für Supabase Auth/Datenbank/Speicher (Cloud erreicht Supabase nicht). Der "Server" läuft in Node (window.__srv), damit zwei Browser-Kontexte = zwei Geräte dieselben Daten sehen. */
window.HC_SB={ createClient(url,key,opt){ const SK=(opt&&opt.auth&&opt.auth.storageKey)||'sb'; let ses=null; try{ ses=JSON.parse(localStorage.getItem(SK)||'null'); }catch(e){}
  const L=[], emit=ev=>L.forEach(cb=>cb(ev,ses)), setSes=u=>{ ses=u?{user:u,access_token:'tok:'+u.id,refresh_token:'ref:'+u.id}:null; if (ses) localStorage.setItem(SK,JSON.stringify(ses)); else localStorage.removeItem(SK); };
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
      async signInWithOAuth(){ if (!window.FAKE_OAUTH) return {data:{},error:{message:'Unsupported provider: provider is not enabled'}}; const r=await srv({op:'verify',email:window.FAKE_OAUTH,token:'123456'}); setSes(Object.assign({},r.user,{app_metadata:{provider:'google'}})); emit('SIGNED_IN'); return {data:{},error:null}; },
      async signUp({email,password}){ const r=await srv({op:'signup',email,password}); if (r.error) return {data:{},error:E(r)}; if (r.exists) return {data:{user:{id:'x',identities:[]},session:null},error:null}; setSes(r.user); emit('SIGNED_IN'); return {data:{user:r.user,session:ses},error:null}; },
      async getSession(){ return {data:{session:ses},error:null}; },
      async setSession({refresh_token}){ const r=await srv({op:'ses',r:refresh_token}); if (r.error) return {data:{},error:E(r)}; setSes(r.user); emit('SIGNED_IN'); return {data:{session:ses},error:null}; },
      stopAutoRefresh(){}, startAutoRefresh(){},
      async signOut(){ setSes(null); emit('SIGNED_OUT'); return {error:null}; },
      async updateUser({password}){ const r=await srv({op:'setpw',password}); return {data:{},error:E(r)}; } },
    from:qb,
    channel(name){ const bc=new BroadcastChannel('fakeauth:'+name), L=[]; bc.onmessage=({data})=>L.filter(l=>l.ev===data.event).forEach(l=>l.cb({payload:data.payload}));
      const ch={ on(t,f,cb){ L.push({ev:f.event,cb}); return ch; }, subscribe(cb){ setTimeout(()=>cb&&cb('SUBSCRIBED'),30); return ch; }, send(m){ bc.postMessage({event:m.event,payload:m.payload}); return Promise.resolve('ok'); }, _close(){ bc.close(); } }; return ch; },
    removeChannel(ch){ try{ ch._close(); }catch(e){} },
    storage:{ from(b){ return { async upload(path,blob){ const r=await srv({op:'up',b,path,d:await b2s(blob)}); return {data:{path},error:E(r)}; },
      async download(path){ const r=await srv({op:'down',b,path}); if (r.error) return {data:null,error:E(r)}; const s=atob(r.data), u=new Uint8Array(s.length); for (let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return {data:new Blob([u]),error:null}; },
      async list(pre){ const r=await srv({op:'list',b,pre}); return {data:r.data,error:E(r)}; },
      async remove(paths){ const r=await srv({op:'rm',b,paths}); return {data:[],error:E(r)}; } }; } },
    async rpc(n){ const r=await srv({op:'rpc',n}); return {data:null,error:E(r)}; } }; } };
