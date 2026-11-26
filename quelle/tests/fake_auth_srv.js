/* Node-Seite zu fake_auth.js: Konten, Tabellen mit RLS (nur eigene Zeilen), Speicher */
module.exports=function(){ const S={users:{}, pw:{}, db:{profiles:[],rides:[],segment_bests:[]}, files:{}, log:[]};
  const own=(t,r,uid)=>t==='profiles'?r.id===uid:r.user_id===uid;
  S.handle=j=>{ const o=JSON.parse(j); S.log.push(o.op+(o.q?':'+o.q.t+':'+o.q.act:'')); const uid=o.uid;
    if (o.op==='otp') return {ok:1};
    if (o.op==='verify'){ if (o.token!=='123456') return {error:'Token has expired or is invalid'}; let u=S.users[o.email]; if (!u) u=S.users[o.email]={id:'u-'+Object.keys(S.users).length+'-'+Math.random().toString(16).slice(2,10), email:o.email, app_metadata:{provider:'email'}}; return {user:u}; }
    if (o.op==='pw'){ const u=S.users[o.email]; if (!u || S.pw[u.id]!==o.password) return {error:'Invalid login credentials'}; return {user:u}; }
    if (o.op==='ses'){ const id=String(o.r||'').replace(/^ref:/,''); const u=Object.values(S.users).find(x=>x.id===id); return u?{user:u}:{error:'Invalid Refresh Token'}; }
    if (!uid) return {error:'not authenticated'};
    if (o.op==='setpw'){ S.pw[uid]=o.password; return {ok:1}; }
    if (o.op==='db'){ const q=o.q, T=S.db[q.t]; if (!T) return {error:'relation does not exist'};
      if (q.act==='select'){ let r=T.filter(x=>own(q.t,x,uid)); q.f.forEach(([k,v])=>{ r=r.filter(x=>x[k]===v); }); if (q.order){ const [k,asc]=q.order; r.sort((a,b)=>(a[k]<b[k]?-1:1)*(asc?1:-1)); } if (q.limit) r=r.slice(0,q.limit); return {data:q.single?(r[0]||null):JSON.parse(JSON.stringify(r))}; }
      if (q.act==='upsert'){ const ks=q.oc.split(','); for (const row of q.rows){ if (!(q.t==='profiles'?row.id===uid:row.user_id===uid)) return {error:'new row violates row-level security policy'};
          const i=T.findIndex(x=>ks.every(k=>x[k]===row[k])); if (i>=0){ if (!q.ign) T[i]=Object.assign({},T[i],row); } else T.push(Object.assign({},row)); } return {data:null}; }
      if (q.act==='delete'){ S.db[q.t]=T.filter(x=>!(own(q.t,x,uid) && q.f.every(([k,v])=>x[k]===v))); return {data:null}; } }
    if (o.op==='up'){ if (o.path.split('/')[0]!==uid) return {error:'new row violates row-level security policy'}; const k=o.b+':'+o.path; if (S.files[k]) return {error:'The resource already exists'}; S.files[k]=o.d; return {ok:1}; }
    if (o.op==='down'){ if (o.path.split('/')[0]!==uid) return {error:'Object not found'}; const d=S.files[o.b+':'+o.path]; return d?{data:d}:{error:'Object not found'}; }
    if (o.op==='list'){ if (o.pre!==uid) return {data:[]}; return {data:Object.keys(S.files).filter(k=>k.startsWith(o.b+':'+o.pre+'/')).map(k=>({name:k.split('/').pop()}))}; }
    if (o.op==='rm'){ o.paths.forEach(p=>{ if (p.split('/')[0]===uid) delete S.files[o.b+':'+p]; }); return {ok:1}; }
    if (o.op==='rpc' && o.n==='delete_my_account'){ for (const e in S.users) if (S.users[e].id===uid) delete S.users[e]; for (const t in S.db) S.db[t]=S.db[t].filter(x=>!own(t,x,uid)); return {ok:1}; }
    return {error:'unknown op'}; };
  return S; };
