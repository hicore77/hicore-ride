import json,math,heapq,gzip,base64,sys,collections
net=json.loads(gzip.decompress(base64.b64decode(open('netdump.b64').read())))
d=json.load(open('raw.json'))['elements']
lat0,lon0,KY=50.85,14.74,111320.0; KX=KY*math.cos(math.radians(lat0))
DRV={'motorway','trunk','primary','secondary','tertiary','unclassified','residential','living_street','motorway_link','trunk_link','primary_link','secondary_link','tertiary_link'}
pos={}; adj=collections.defaultdict(list)
for e in d:
  if e['type']!='way' or e['tags'].get('highway') not in DRV or 'geometry' not in e: continue
  t=e['tags']; nm=t.get('name') or t.get('ref') or t['highway']
  ids=e['nodes']; g=e['geometry']
  for i,nid in enumerate(ids): pos[nid]=((g[i]['lon']-lon0)*KX, -(g[i]['lat']-lat0)*KY)
  for a,b in zip(ids,ids[1:]):
    L=math.hypot(pos[a][0]-pos[b][0],pos[a][1]-pos[b][1]); adj[a].append((b,L,nm,e['id'])); adj[b].append((a,L,nm,e['id']))
C=20; grid=collections.defaultdict(list)
for x,z,k in net['S']: grid[(int(x//C),int(z//C))].append((x,z,k))
def near(x,z,R):
  out=[]; r=int(R//C)+1; cx,cz=int(x//C),int(z//C)
  for a in range(-r,r+1):
    for b in range(-r,r+1):
      for p in grid.get((cx+a,cz+b),[]):
        if math.hypot(p[0]-x,p[1]-z)<R: out.append(p)
  return out
ng=collections.defaultdict(list)
for nid,(x,z) in pos.items(): ng[(int(x//C),int(z//C))].append(nid)
def nearest_osm(x,z,R=25):
  best=None;bd=R
  for a in range(-2,3):
    for b in range(-2,3):
      for nid in ng.get((int(x//C)+a,int(z//C)+b),[]):
        dd=math.hypot(pos[nid][0]-x,pos[nid][1]-z)
        if dd<bd: bd=dd;best=nid
  return best,bd
res=[]
for ni,x,z,k,nm in net['dead']:
  s,sd=nearest_osm(x,z)
  if s is None: res.append([ni,nm,'kein OSM-Knoten']); continue
  dist={s:0}; prev={}; pq=[(0,s)]; hit=None
  while pq:
    dd,u=heapq.heappop(pq)
    if dd>dist.get(u,1e18): continue
    if dd>3000: break
    ux,uz=pos[u]
    nn=near(ux,uz,9)
    if dd>30 and nn and any(p[2]!=k for p in nn) and not any(p[2]==k for p in nn): hit=(u,dd,[p[2] for p in nn][0]); break
    for v,L,wn,wid in adj[u]:
      vx,vz=pos[v]
      own=[p for p in near(vx,vz,10) if p[2]==k]
      if own and math.hypot(vx-x,vz-z)>25: continue
      nd=dd+L
      if nd<dist.get(v,1e18): dist[v]=nd; prev[v]=(u,wn,wid); heapq.heappush(pq,(nd,v))
  if not hit: res.append([ni,nm,'echte Sackgasse']); continue
  u=hit[0]; path=[]; names=[]; wids=[]
  while u in prev: path.append([round(pos[u][0],1),round(pos[u][1],1)]); pu,wn,wid=prev[u]; names.append(wn); wids.append(wid); u=pu
  path.append([round(pos[s][0],1),round(pos[s][1],1)]); path.reverse()
  res.append([ni,nm,'LÜCKE',round(hit[1]),hit[2],list(dict.fromkeys(names[::-1])),list(dict.fromkeys(wids[::-1])),path])
json.dump(res,open('gaps.json','w'))
for r in res: print(r[:7] if len(r)>3 else r)
