/* Test-Ersatz für Supabase Realtime (Cloud erreicht Supabase nicht): Broadcast und Presence über BroadcastChannel zwischen Seiten desselben Browser-Kontexts */
window.supabase={ createClient(){ return { channel(name,cfg){ const bc=new BroadcastChannel('fake:'+name), key=(cfg&&cfg.config&&cfg.config.presence&&cfg.config.presence.key)||Math.random().toString(36).slice(2), L=[], P={}; let me=null;
  const fire=(type,ev,arg)=>L.filter(l=>l.type===type&&l.ev===ev).forEach(l=>l.cb(arg));
  bc.onmessage=({data})=>{ if (data.t==='b') fire('broadcast',data.event,{payload:data.payload});
    else if (data.t==='p'){ const neu=!P[data.key]; P[data.key]=[data.v]; fire('presence','sync'); if (neu && me) bc.postMessage({t:'p',key,v:me}); }
    else if (data.t==='l'){ delete P[data.key]; fire('presence','sync'); fire('presence','leave',{key:data.key}); } };
  const ch={ on(type,f,cb){ L.push({type,ev:f.event,cb}); return ch; }, subscribe(cb){ setTimeout(()=>cb('SUBSCRIBED'),50); return ch; },
    track(v){ me=v; P[key]=[v]; bc.postMessage({t:'p',key,v}); fire('presence','sync'); return Promise.resolve(); },
    presenceState(){ return P; }, send(m){ bc.postMessage({t:'b',event:m.event,payload:m.payload}); return Promise.resolve('ok'); },
    _close(){ bc.postMessage({t:'l',key}); bc.close(); } };
  return ch; }, removeChannel(ch){ try{ ch._close(); }catch(e){} } }; } };
