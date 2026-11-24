import json,base64,struct,math,collections
D=json.load(open('zg_net.json'))
def b64i16(s):
  b=base64.b64decode(s); return struct.unpack('<%dh'%(len(b)//2),b)
E=[]
for k,e in enumerate(D['edges']):
  a,b,c,nm,ln,s,w,x0,z0=e
  v=b64i16(s); x,z,y=x0,z0,0; P=[]
  for i in range(0,len(v),3):
    x+=v[i];z+=v[i+1];y+=v[i+2];P.append((x/4,z/4,y/10))
  E.append(dict(k=k,a=a,b=b,nm=nm,P=P))
adj=collections.defaultdict(list)
for e in E: adj[e['a']].append(e['k']); adj[e['b']].append(e['k'])
vill=[(p[1],p[3],p[4]) for p in D['pois'] if p[0] in('village','town','hamlet')]
def near(x,z):
  return min(vill,key=lambda v:(v[1]-x)**2+(v[2]-z)**2)[0]
# Ketten: Kanten mit gleichem Namen verbinden
used=set();chains=[]
for e in E:
  if e['k'] in used: continue
  ch=[(e['k'],0)];used.add(e['k'])
  for side in (1,0):
    while True:
      k,d=ch[-1] if side else ch[0]
      ee=E[k]; node=(ee['b'] if d==0 else ee['a']) if side else (ee['a'] if d==0 else ee['b'])
      cand=[j for j in adj[node] if j not in used and E[j]['nm']==ee['nm'] and ee['nm']!='|']
      if len(cand)!=1: break
      j=cand[0];used.add(j); dj=0 if E[j]['a']==node else 1
      if side: ch.append((j,dj))
      else: ch.insert(0,(j,1-dj) if False else (j, 0 if E[j]['b']==node else 1))
  chains.append(ch)
def prof(ch):
  pts=[]
  for k,d in ch:
    P=E[k]['P'][::-1] if d else E[k]['P']
    pts+=P if not pts else P[1:]
  s=[0]
  for i in range(1,len(pts)): s.append(s[-1]+math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]))
  return pts,s
res=[]
for ch in chains:
  pts,s=prof(ch)
  for rev in (0,1):
    p=pts[::-1] if rev else pts; ss=[s[-1]-v for v in s[::-1]] if rev else s
    i=0;n=len(p)
    while i<n-1:
      # Start: lokales Minimum
      j=i;best=i;mx=p[i][2]
      k=i
      while k<n-1:
        k+=1
        if p[k][2]>mx: mx=p[k][2];best=k
        if mx-p[k][2]>12: break
      hm=p[best][2]-p[i][2]; L=ss[best]-ss[i]
      if hm>=50 and L>0 and hm/L>=0.035:
        mg=max(((p[q+20][2]-p[q][2])/(ss[q+20]-ss[q]+1e-6) for q in range(i,max(i+1,best-20))),default=0)
        res.append((hm,L,hm/L*100,mg*100,E[ch[0][0]]['nm'],near(p[i][0],p[i][1]),near(p[best][0],p[best][1]),p[i][2]+300,p[best][2]+300,(round(p[i][0]),round(p[i][1])),(round(p[best][0]),round(p[best][1])),[[round(q[0],1),round(q[1],1),round(q[2],1)] for q in p[i:best+1:2]]))
        i=best
      else: i+=1
res.sort(key=lambda r:-r[0]*r[2])
for r in res[:12]: print('%4.0f Hm %5.0f m %4.1f%% max%4.1f%%  %-30s %s -> %s  (%.0f->%.0f) %s %s'%r[:11])
pick=[(0,'Eichgraben – Lückendorf'),(1,'Oybin – Lückendorf (Kammstraße)'),(4,'Olbersdorf – Jonsdorf'),(2,'Großschönau – Bertsdorf'),(7,'Hölle – Hain'),(6,'Jonsdorf – Hain'),(9,'Großschönau – Spitzkunnersdorf'),(8,'Hörnitz – Hainewalde')]
out=[{'name':n,'hm':round(res[k][0]),'len':round(res[k][1]),'p':res[k][11]} for k,n in pick]
for o in out: print(o['name'],o['hm'],o['len'],len(o['p']),o['p'][0][:2])
json.dump(out,open('climbs.json','w'),separators=(',',':'),ensure_ascii=False)
