# 0.17.0: Weltdaten Zittau in 2-km-Kacheln (quelle/kacheln/k_I_J.bin). Das Spiel lädt nur die Kacheln um den Fahrer.
# Inhalt je Kachel: Gebäude (altes bld-Format + neue Overture-Gebäude am Rand), OSM-Bäume/Hecken/Gebüsch/Obst (alt + Rand),
# Felsen (OSM natural=cliff/bare_rock/rock/stone/scree), Zäune/Mauern (OSM barrier).
# Aufruf: python3 kacheln.py OVERTURE_DIR      (Höhen kommen aus zg2/zg_net.json, vorher rand_auffuellen.py)
import sys,os,json,base64,math,struct,random,collections,numpy as np,shapely,pyarrow.parquet as pq
from shapely.geometry import Point
Q=__file__.rsplit('/',2)[0]+'/'; ZG=Q+'zg2/'; OUT=Q+'kacheln/'; OV=sys.argv[1].rstrip('/')+'/'
KX=111320*math.cos(math.radians(50.85)); TS=2000
def xy(lon,lat): return ((lon-14.74)*KX,(50.85-lat)*111320)
def ll(x,z): return 14.74+x/KX, 50.85-z/111320
rnd=random.Random(17)
# Höhen wie im Spiel (gdemH)
dem=json.load(open(ZG+'zg_net.json'))['dem']; raw=np.frombuffer(base64.b64decode(dem['d']),dtype='<i2').astype(np.int64).reshape(dem['nz'],dem['nx']); DH=np.cumsum(raw,axis=1)/10.0
def H(x,z):
    gx=min(max((x-dem['x0'])/dem['cell'],0),dem['nx']-1.001); gz=min(max((z-dem['z0'])/dem['cell'],0),dem['nz']-1.001); i=int(gx); j=int(gz); fx=gx-i; fz=gz-j
    return (DH[j,i]*(1-fx)+DH[j,i+1]*fx)*(1-fz)+(DH[j+1,i]*(1-fx)+DH[j+1,i+1]*fx)*fz
tiles=collections.defaultdict(lambda:{'b':[],'t':[],'r':[],'f':[]})
key=lambda x,z:(math.floor(x/TS),math.floor(z/TS))
# ---------- Landnutzung: Industrie (Hallenoptik) ----------
lu=pq.read_table(OV+'landuse.parquet')
IND=[shapely.from_wkb(g) for g,s,c in zip(lu.column('geometry').to_pylist(),lu.column('subtype').to_pylist(),lu.column('class').to_pylist()) if c in ('industrial','works')]
IND=[g for g in IND if g.geom_type in ('Polygon','MultiPolygon')]; INDU=shapely.union_all(IND); shapely.prepare(INDU)
print('Industrieflächen',len(IND))
# ---------- Gebäude ----------
a=np.frombuffer(base64.b64decode(open(ZG+'bld.b64').read().strip()),dtype='<i2').astype(np.int64); i=0; old=[]
while i<len(a):
    n=int(a[i]); k=int(a[i+1]); h=int(a[i+2]); x=int(a[i+3]); z=int(a[i+4]); P=[(x,z)]; qx=x*4; qz=z*4; i+=5
    for j in range(1,n): qx+=int(a[i]); qz+=int(a[i+1]); i+=2; P.append((qx/4,qz/4))
    old.append([k,h,P])
OB=(14.615,14.8175,50.7945,50.9665)   # Ausschnitt der alten Gebäudedaten
og=collections.defaultdict(list)
for o in old:
    cx=sum(p[0] for p in o[2])/len(o[2]); cz=sum(p[1] for p in o[2])/len(o[2]); og[(int(cx//10),int(cz//10))].append((cx,cz))
def near_old(cx,cz,r=4):
    for dx in (-1,0,1):
        for dz in (-1,0,1):
            for (x,z) in og.get((int(cx//10)+dx,int(cz//10)+dz),[]):
                if math.hypot(x-cx,z-cz)<r: return True
    return False
def area(P): return abs(sum(x1*z2-x2*z1 for (x1,z1),(x2,z2) in zip(P,P[1:]+P[:1])))/2
bt=pq.read_table(OV+'bld.parquet'); nb=0
for g,s,c,hh,nf,ug in zip(bt.column('geometry').to_pylist(),bt.column('subtype').to_pylist(),bt.column('class').to_pylist(),bt.column('height').to_pylist(),bt.column('num_floors').to_pylist(),bt.column('is_underground').to_pylist()):
    if ug: continue
    g=shapely.from_wkb(g)
    if g.geom_type=='MultiPolygon': g=max(g.geoms,key=lambda q:q.area)
    if g.geom_type!='Polygon': continue
    c0=g.centroid
    if OB[0]<c0.x<OB[1] and OB[2]<c0.y<OB[3]: continue
    g=g.simplify(0.000004)
    P=[xy(lo,la) for lo,la in list(g.exterior.coords)[:-1]]
    if len(P)<3 or len(P)>200: continue
    cx=sum(p[0] for p in P)/len(P); cz=sum(p[1] for p in P)/len(P)
    if not (-10400<cx<10600 and -14500<cz<8000) or near_old(cx,cz): continue
    A=area(P)
    if A<6: continue
    k=4 if s=='religious' and c in ('church','chapel','religious',None) and A>80 else 3 if s=='agricultural' or c in ('barn','farm_auxiliary','greenhouse','stable','cowshed') else \
      1 if A<30 or c in ('garage','garages','shed','allotment_house','carport','roof','hut') else \
      2 if c in ('apartments','industrial','warehouse','commercial','retail','office','school','hotel') or s in ('industrial','education') or A>600 else 0
    hd=int(round(hh*10)) if hh else int(nf*30) if nf else 0
    old.append([k,min(hd,800),P]); nb+=1
print('Gebäude alt',len(old)-nb,'neu',nb)
nind=0
for o in old:
    P=o[2]; cx=sum(p[0] for p in P)/len(P); cz=sum(p[1] for p in P)/len(P)
    if o[0] in (0,1,2) and area(P)>60 and shapely.contains_xy(INDU,*ll(cx,cz)): o[0]=5; nind+=1
    X=int(round(P[0][0])); Z=int(round(P[0][1])); arr=[len(P),o[0],o[1],X,Z]; qx=X*4; qz=Z*4
    for (x,z) in P[1:]:
        nx_=int(round(x*4)); nz_=int(round(z*4)); arr+=[nx_-qx,nz_-qz]; qx,qz=nx_,nz_
    tiles[key(cx,cz)]['b'].append(arr)
print('Hallen in Industrieflächen',nind)
# Wahrzeichen-Grundrisse (Spiel braucht sie beim Bau, unabhängig von Kacheln)
src=open(Q+'gpu/src.html').read(); import re
LM=[(float(a_),float(b_)) for a_,b_ in re.findall(r"cx:(-?[\d.]+), cz:(-?[\d.]+)",src[src.find('const LANDMARKS='):src.find('const LANDMARKS=')+2000])]
lmb=[]
for t in tiles.values():
    for arr in t['b']:
        n=arr[0]; X,Z=arr[3],arr[4]; P=[(X,Z)]; qx,qz=X*4,Z*4
        for j in range(1,n): qx+=arr[5+2*(j-1)]; qz+=arr[6+2*(j-1)]; P.append((qx/4,qz/4))
        cx=sum(p[0] for p in P)/n; cz=sum(p[1] for p in P)/n
        if any(math.hypot(cx-a_,cz-b_)<8 for a_,b_ in LM): lmb+=arr
open(ZG+'lmb.b64','w').write(base64.b64encode(np.array(lmb,'<i2').tobytes()).decode()); print('Wahrzeichen-Grundrisse',len(LM))
# ---------- Bäume, Hecken, Gebüsch, Obst ----------
t=open(ZG+'trees.bin','rb').read(); n=struct.unpack('<I',t[4:8])[0]; txy=np.frombuffer(t[8:8+4*n],dtype='<i2').reshape(-1,2); tty=np.frombuffer(t[8+4*n:8+5*n],dtype='u1')
for (x2,z2),ty in zip(txy.tolist(),tty.tolist()): tiles[key(x2/2,z2/2)]['t'].append((x2,z2,ty))
TB=(14.613,14.869,50.7925,50.9685)   # Ausschnitt der alten Baumdaten
def outside(x,z):
    lo,la=ll(x,z); return not (TB[0]<lo<TB[1] and TB[2]<la<TB[3]) and -10400<x<10600 and -14500<z<8000
nt=collections.Counter()
def addt(x,z,ty):
    if outside(x,z): tiles[key(x,z)]['t'].append((int(round(x*2)),int(round(z*2)),ty)); nt[ty]+=1
def line_pts(g,step,jit=0.0):
    L=[]; 
    for ls in (g.geoms if g.geom_type.startswith('Multi') else [g]):
        P=[xy(*c) for c in ls.coords]
        for p,q in zip(P,P[1:]):
            d=math.dist(p,q); m=max(1,int(d/step))
            for s_ in range(m): f=(s_+rnd.random()*jit)/m; L.append((p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f))
    return L
def poly_pts(g,step):
    b=g.bounds; x0,z1=xy(b[0],b[1]); x1,z0=xy(b[2],b[3]); L=[]
    gx=np.arange(x0,x1,step); gz=np.arange(z0,z1,step)
    if len(gx)*len(gz)>400000: return L
    for x in gx:
        for z in gz:
            px=x+rnd.random()*step*0.9; pz=z+rnd.random()*step*0.9
            if shapely.contains_xy(g,*ll(px,pz)): L.append((px,pz))
    return L
land=pq.read_table(OV+'land.parquet'); inf=pq.read_table(OV+'infra.parquet')
LG=[(shapely.from_wkb(g),s,c) for g,s,c in zip(land.column('geometry').to_pylist(),land.column('subtype').to_pylist(),land.column('class').to_pylist())]
for g,s,c in LG:
    if c=='tree' and g.geom_type=='Point': addt(*xy(g.x,g.y),0)
    elif c=='tree_row': [addt(x,z,4) for x,z in line_pts(g if g.geom_type!='Polygon' else g.exterior,8.5,0.3)]
    elif s=='shrub' and g.geom_type in ('Polygon','MultiPolygon'): [addt(x,z,7) for x,z in poly_pts(g,8.5)]
for g,s,c in zip(lu.column('geometry').to_pylist(),lu.column('subtype').to_pylist(),lu.column('class').to_pylist()):
    if c=='orchard':
        g=shapely.from_wkb(g)
        if g.geom_type in ('Polygon','MultiPolygon'): [addt(x,z,5) for x,z in poly_pts(g,6.7)]
IG=[(shapely.from_wkb(g),s,c) for g,s,c in zip(inf.column('geometry').to_pylist(),inf.column('subtype').to_pylist(),inf.column('class').to_pylist())]
for g,s,c in IG:
    if c=='hedge' and g.geom_type=='LineString': [addt(x,z,6) for x,z in line_pts(g,3.2,0.2)]
print('neue Bäume am Rand',dict(nt))
# ---------- Felsen ----------
# Typen: 0 Felswand an natural=cliff (Linie), 1 Einzelfels (natural=rock/stone), 2 Geröll (scree), 3 Felsblock in Felsfläche (bare_rock/rock/cliff-Fläche)
nr=collections.Counter()
def addr(ty,x,z,w,h,ang):
    tiles[key(x,z)]['r'].append((int(round(x*2)),int(round(z*2)),ty,max(1,min(255,int(round(w*10)))),max(1,min(255,int(round(h*4)))),int(round((ang%(2*math.pi))/(2*math.pi)*256))%256)); nr[ty]+=1
for g,s,c in LG:
    if c=='cliff' and g.geom_type=='LineString':
        P=[xy(*q) for q in g.coords]; L=sum(math.dist(p,q) for p,q in zip(P,P[1:]))
        if L<3: continue
        for p,q in zip(P,P[1:]):
            d=math.dist(p,q)
            if d<0.5: continue
            tx,tz=(q[0]-p[0])/d,(q[1]-p[1])/d; nx_,nz_=-tz,tx   # links = oben (OSM), rechts = unten
            m=max(1,int(round(d/3.6)))
            for s_ in range(m):
                f=(s_+0.5)/m; x=p[0]+(q[0]-p[0])*f; z=p[1]+(q[1]-p[1])*f
                rel=H(x+nx_*14,z+nz_*14)-H(x-nx_*14,z-nz_*14)
                h=min(22,max(3.5,rel*0.9+2.5))*(0.85+rnd.random()*0.3)
                addr(0,x-nx_*1.2,z-nz_*1.2,(d/m)*(1.15+rnd.random()*0.35),h,math.atan2(-nz_,-nx_))
    elif (c in ('bare_rock','rock','stone') or c=='cliff') and g.geom_type in ('Polygon','MultiPolygon'):
        b=g.bounds; x0,z1=xy(b[0],b[1]); x1,z0=xy(b[2],b[3]); hs=[H(x,z) for x in np.linspace(x0,x1,5) for z in np.linspace(z0,z1,5)]
        rel=max(hs)-min(hs); big=c=='cliff'
        for x,z in poly_pts(g,4.2 if big else 5.5):
            if not big and rnd.random()<0.35: continue
            h=(min(18,3+rel*0.6) if big else 1.2+rnd.random()*2.6)*(0.7+rnd.random()*0.5)
            addr(3,x,z,(3.5 if big else 2.4)+rnd.random()*2.2,h,rnd.random()*6.283)
        if g.area<2e-9:
            c0=g.centroid; addr(1,*xy(c0.x,c0.y),3,2.5,rnd.random()*6.283)
    elif c in ('rock','stone') and g.geom_type=='Point':
        addr(1,*xy(g.x,g.y),(2.8 if c=='rock' else 1.8)+rnd.random()*1.4,(2.2 if c=='rock' else 1.4)+rnd.random()*1.2,rnd.random()*6.283)
    elif c=='cliff' and g.geom_type=='Point':
        addr(1,*xy(g.x,g.y),5,6,rnd.random()*6.283)
    elif c=='scree' and g.geom_type in ('Polygon','MultiPolygon'):
        for x,z in poly_pts(g,2.6): addr(2,x,z,0.5+rnd.random()*0.9,0.3+rnd.random()*0.5,rnd.random()*6.283)
print('Felsen',dict(nr))
# ---------- Zäune und Mauern ----------
# Typen: 0 Industriezaun 2 m (Maschendraht), 1 Holz-/Gartenzaun 1,1 m, 2 Mauer 1,4 m, 3 Stützmauer 1 m
nf=collections.Counter()
for g,s,c in IG:
    if c not in ('fence','wall','retaining_wall') or g.geom_type not in ('LineString','Polygon'): continue
    ls=g if g.geom_type=='LineString' else g.exterior
    P=[xy(*q) for q in ls.coords]
    for k0 in range(0,len(P)-1,12):
        S=P[k0:k0+13]
        if len(S)<2: continue
        mx=sum(p[0] for p in S)/len(S); mz=sum(p[1] for p in S)/len(S)
        if not (-10400<mx<10600 and -14500<mz<8000): continue
        ty=2 if c=='wall' else 3 if c=='retaining_wall' else (0 if shapely.contains_xy(INDU,*ll(mx,mz)) or shapely.dwithin(INDU,Point(*ll(mx,mz)),0.0002) else 1)
        tiles[key(mx,mz)]['f'].append((ty,[(int(round(x*2)),int(round(z*2))) for x,z in S])); nf[ty]+=1
print('Zaunstücke',dict(nf))
# ---------- schreiben ----------
import shutil,hashlib
shutil.rmtree(OUT,ignore_errors=True); os.makedirs(OUT)
idx={}; tot=0
for (I,J),T in sorted(tiles.items()):
    b=np.array([v for arr in T['b'] for v in arr],'<i2').tobytes()
    tr=b''.join(struct.pack('<hh',x,z) for x,z,_ in T['t'])+bytes(ty for _,_,ty in T['t'])
    rk=b''.join(struct.pack('<hhBBBB',*r) for r in T['r'])
    fb=b''.join(struct.pack('<BB',ty,len(S))+b''.join(struct.pack('<hh',*p) for p in S) for ty,S in T['f'])
    data=b'KCH1'+struct.pack('<IIIIIIII',len(b),len(T['b']),len(tr),len(T['t']),len(rk),len(T['r']),len(fb),len(T['f']))+b+tr+rk+fb
    if len(data)<=36: continue
    open(OUT+'k_%d_%d.bin'%(I,J),'wb').write(data); idx['%d,%d'%(I,J)]=hashlib.md5(data).hexdigest()[:8]; tot+=len(data)
json.dump({'S':TS,'t':idx},open(OUT+'index.json','w'),separators=(',',':'))
print('Kacheln',len(idx),'zusammen',tot,'Bytes')
