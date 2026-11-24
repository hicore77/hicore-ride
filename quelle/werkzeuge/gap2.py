import json,math,heapq,struct,zlib,collections,sys
from PIL import Image
raw=Image.open(sys.argv[1]).tobytes(); assert raw[:4]==b'OSMG'; n=struct.unpack('<I',raw[4:8])[0]; b=zlib.decompress(raw[8:8+n])
N,W,NM=struct.unpack('<III',b[:12]); o=12; pos=[]
for i in range(N): x,z=struct.unpack('<hh',b[o:o+4]); pos.append((x/2,z/2)); o+=4
ways=[]
for i in range(W): wid,ni,L=struct.unpack('<QHH',b[o:o+12]); o+=12; refs=struct.unpack('<%dI'%L,b[o:o+4*L]); o+=4*L; ways.append((wid,ni,refs))
nl=struct.unpack('<I',b[o:o+4])[0]; names=json.loads(b[o+4:o+4+nl])
json.dump({'pos':pos,'ways':[[w,n,list(r)] for w,n,r in ways],'names':names},open('osmg.json','w'))
net=json.load(open('netdump.json'))
DRIVE=lambda nm: nm.split('|')[2] not in ('track','service')
adj=collections.defaultdict(list)
for wid,ni,refs in ways:
  nm=names[ni]
  for a,c in zip(refs,refs[1:]):
    L=math.hypot(pos[a][0]-pos[c][0],pos[a][1]-pos[c][1]); adj[a].append((c,L,ni,wid)); adj[c].append((a,L,ni,wid))
C=20; grid=collections.defaultdict(list)
for x,z,k in net['S']: grid[(int(x//C),int(z//C))].append((x,z,k))
def near(x,z,R):
  out=[]; r=int(R//C)+1; cx,cz=int(x//C),int(z//C)
  for a in range(-r,r+1):
    for c in range(-r,r+1):
      for p in grid.get((cx+a,cz+c),[]):
        if math.hypot(p[0]-x,p[1]-z)<R: out.append(p)
  return out
ng=collections.defaultdict(list)
for i,(x,z) in enumerate(pos): ng[(int(x//C),int(z//C))].append(i)
def nearest(x,z,R=30):
  best=None;bd=R
  for a in range(-2,3):
    for c in range(-2,3):
      for i in ng.get((int(x//C)+a,int(z//C)+c),[]):
        d=math.hypot(pos[i][0]-x,pos[i][1]-z)
        if d<bd: bd=d;best=i
  return best
res=[]
for ni,x,z,k,nm in net['dead']:
  s=nearest(x,z)
  if s is None: res.append({'n':ni,'nm':nm,'st':'kein OSM'}); continue
  dist={s:0}; prev={}; pq=[(0,s)]; hit=None
  while pq:
    dd,u=heapq.heappop(pq)
    if dd>dist.get(u,1e18): continue
    if dd>2500: break
    nn=near(pos[u][0],pos[u][1],8)
    if dd>25 and nn and not any(p[2]==k for p in nn): hit=(u,dd,nn[0][2]); break
    for v,L,wn,wid in adj[u]:
      own=[p for p in near(pos[v][0],pos[v][1],9) if p[2]==k]
      if own and math.hypot(pos[v][0]-x,pos[v][1]-z)>20: continue
      nd=dd+L
      if nd<dist.get(v,1e18): dist[v]=nd; prev[v]=(u,wn,wid); heapq.heappush(pq,(nd,v))
  if not hit: res.append({'n':ni,'nm':nm,'st':'Sackgasse'}); continue
  u=hit[0]; path=[]; nms=[]; wids=[]
  while u in prev: path.append(pos[u]); pu,wn,wid=prev[u]; nms.append(names[wn]); wids.append(wid); u=pu
  path.append(pos[s]); path.reverse(); nms=list(dict.fromkeys(nms[::-1])); wids=list(dict.fromkeys(wids[::-1]))
  res.append({'n':ni,'nm':nm,'st':'LÜCKE','len':round(hit[1]),'to':hit[2],'via':nms,'wids':wids,'path':[[round(a,1),round(c,1)] for a,c in path]})
json.dump(res,open('gaps.json','w'))
for r in res: print(r['n'],r['nm'],r['st'],r.get('len',''),r.get('to',''),r.get('via',''))
