# Zittauer Gebirge komplett: OSM-Wege passend zu den 35 Kartenstraßen auswählen, verbinden, mit Breite/Spuren ausgeben
import json,math,base64,struct,gzip,heapq,sys
d=json.load(open('raw.json'));E=d['elements']
S=json.load(open('sel.json'))
LAT0,LON0=50.85,14.74; KX=111320*math.cos(math.radians(LAT0)); KY=111320
PP=lambda lat,lon:((lon-LON0)*KX,(LAT0-lat)*KY)
HC={'motorway':0,'trunk':0,'primary':0,'secondary':1,'tertiary':2,'unclassified':3,'residential':4,'living_street':4}
# Auswahl-Linien verdichten -> Raster
C=40; grid={}
def dens(p,st):
    o=[]
    for i in range(len(p)-1):
        a,b=p[i],p[i+1]; n=max(1,int(math.hypot(b[0]-a[0],b[1]-a[1])/st))
        for k in range(n): o.append((a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n))
    o.append(p[-1]); return o
for num,pl in S['sel']:
    p=[PP(a,b) for a,b in pl]
    for i in range(len(p)-1):
        a,b=p[i],p[i+1]
        for gx in range(int(min(a[0],b[0])//C)-1,int(max(a[0],b[0])//C)+2):
            for gz in range(int(min(a[1],b[1])//C)-1,int(max(a[1],b[1])//C)+2):
                grid.setdefault((gx,gz),[]).append((a,b,num))
def near(q,R=34):
    best=(1e9,None)
    for a,b,num in grid.get((int(q[0]//C),int(q[1]//C)),[]):
        vx,vz=b[0]-a[0],b[1]-a[1]; L2=vx*vx+vz*vz or 1e-9
        t=max(0,min(1,((q[0]-a[0])*vx+(q[1]-a[1])*vz)/L2)); dd=math.hypot(a[0]+vx*t-q[0],a[1]+vz*t-q[1])
        if dd<best[0]: best=(dd,num)
    return best if best[0]<R else (1e9,None)
W={}; pois=[]
for e in E:
    t=e.get('tags',{})
    if e['type']=='node':
        x,y=PP(e['lat'],e['lon'])
        for k in ('place','natural','tourism','railway'):
            if k in t: pois.append([t[k],t.get('name',''),t.get('ele',''),round(x,1),round(y,1)]); break
        continue
    h=t.get('highway','').replace('_link','')
    if h not in HC or 'nodes' not in e: continue
    if t.get('access') in ('no','private') or t.get('motor_vehicle')=='no' and h!='residential': pass
    g=[PP(p['lat'],p['lon']) for p in e['geometry']]
    W[e['id']]={'id':e['id'],'c':HC[h],'t':t,'n':e['nodes'],'g':g}
print('Wege gesamt',len(W))
keep={}
for wid,w in W.items():
    s=dens(w['g'],10); hits=[near(q) for q in s]; fr=sum(1 for h in hits if h[1] is not None)/len(s)
    L=sum(math.hypot(w['g'][i+1][0]-w['g'][i][0],w['g'][i+1][1]-w['g'][i][1]) for i in range(len(w['g'])-1))
    thr=0.6 if w['c']<=3 else 0.8
    if fr>=thr or (fr>=0.5 and L>300 and w['c']<=3): keep[wid]=(0,len(w['n'])-1)
print('ausgewählt',len(keep))
# Graph über alle Wege (Knoten-IDs), Kanten = Wegabschnitte zwischen aufeinanderfolgenden Knoten
nodepos={}; adj={}
for wid,w in W.items():
    for i,nid in enumerate(w['n']): nodepos[nid]=w['g'][i]
    for i in range(len(w['n'])-1):
        a,b=w['n'][i],w['n'][i+1]; L=math.hypot(w['g'][i+1][0]-w['g'][i][0],w['g'][i+1][1]-w['g'][i][1])*(1.0 if w['c']<=3 else 1.6)
        adj.setdefault(a,[]).append((b,L,wid,i)); adj.setdefault(b,[]).append((a,L,wid,i))
segs=set()
for wid in keep:
    for i in range(len(W[wid]['n'])-1): segs.add((wid,i))
def comps():
    par={}
    def f(x):
        while par.get(x,x)!=x: par[x]=par.get(par[x],par[x]); x=par[x]
        return x
    for wid,i in segs:
        a,b=W[wid]['n'][i],W[wid]['n'][i+1]; ra,rb=f(a),f(b)
        if ra!=rb: par[ra]=rb
    cs={}
    for wid,i in segs:
        for nid in (W[wid]['n'][i],W[wid]['n'][i+1]): cs.setdefault(f(nid),set()).add(nid)
    return sorted(cs.values(),key=lambda s:-len(s))
for it in range(60):
    cs=comps()
    if len(cs)<=1: break
    main=cs[0]; small=cs[-1]
    # Dijkstra von der kleinen Komponente zur Hauptkomponente
    dist={n:0 for n in small}; prev={}; pq=[(0,n) for n in small]; heapq.heapify(pq); hit=None
    while pq:
        dd,u=heapq.heappop(pq)
        if dd>dist.get(u,1e18): continue
        if u in main: hit=u; break
        if dd>2500: break
        for v,L,wid,i in adj.get(u,[]):
            nd=dd+L
            if nd<dist.get(v,1e18): dist[v]=nd; prev[v]=(u,wid,i); heapq.heappush(pq,(nd,v))
    if hit is None:
        # nicht anschließbar: Komponente verwerfen
        segs={s for s in segs if W[s[0]]['n'][s[1]] not in small}; print('verworfen',len(small)); continue
    u=hit; add=0
    while u in prev: pu,wid,i=prev[u]; segs.add((wid,i)); add+=1; u=pu
    print('verbunden',len(small),'Knoten über',round(dist[hit]),'m')
# zusammenhängende Abschnitte je Weg ausgeben
names=[];NI={}
def ni(s):
    if s not in NI: NI[s]=len(names); names.append(s)
    return NI[s]
def enc(pts,sc=4):
    out=[];px=py=0
    for x,y in pts:
        ix,iy=round(x*sc),round(y*sc); out+=[ix-px,iy-py]; px,py=ix,iy
    out=[max(-32768,min(32767,v)) for v in out]
    return base64.b64encode(struct.pack('<%dh'%len(out),*out)).decode()
def fnum(s):
    try: return float(str(s).replace(',','.').split()[0].replace('m',''))
    except: return 0
UNP=('gravel','unpaved','dirt','ground','compacted','fine_gravel','grass','sett','cobblestone','paving_stones')
roads=[]; stat={'width':0,'lanes':0,'n':0}
bywid={}
for wid,i in segs: bywid.setdefault(wid,[]).append(i)
for wid,ix in bywid.items():
    w=W[wid]; t=w['t']; ix.sort(); runs=[]; s0=ix[0]; pv=ix[0]
    for i in ix[1:]:
        if i!=pv+1: runs.append((s0,pv)); s0=i
        pv=i
    runs.append((s0,pv))
    wd=fnum(t.get('width','')) or fnum(t.get('est_width','')); ln=int(fnum(t.get('lanes','')))
    stat['n']+=1; stat['width']+=wd>0; stat['lanes']+=ln>0
    sf=t.get('surface','')
    fl=int(t.get('bridge')=='yes')|2*int(t.get('tunnel')=='yes')|4*int(sf in UNP[:7])|8*int(sf in UNP[7:])
    for a,b in runs:
        g=w['g'][a:b+2]
        roads.append([w['c'],ni(t.get('ref','')+'|'+t.get('name','')),fl,enc(g),round(wd*10),ln])
print('Abschnitte',len(roads),stat)
tot=sum(sum(math.hypot(W[w]['g'][i+1][0]-W[w]['g'][i][0],W[w]['g'][i+1][1]-W[w]['g'][i][1]) for i in ix) for w,ix in bywid.items())
print('km',round(tot/1000,1))
json.dump({'lat0':LAT0,'lon0':LON0,'names':names,'roads':roads,'pois':pois},open('full.json','w'),separators=(',',':'))
