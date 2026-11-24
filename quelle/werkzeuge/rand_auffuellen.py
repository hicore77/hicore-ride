# 0.17.0: Höhen (DEM), Landbedeckung (lc10.png) und OSM-Raster (Wald, Ortsflächen) bis an den Rand des Wegenetzes erweitern.
# Quellen: Copernicus GLO-30 (DEM, frei), ESA WorldCover 2021 (CC BY 4.0), Overture base (OSM, ODbL). Alte Werte bleiben, nur außen wird ergänzt.
# Aufruf: python3 rand_auffuellen.py COP.tif WC.tif OVERTURE_DIR   (OVERTURE_DIR mit land.parquet, landuse.parquet aus overture_holen.py)
import sys,json,base64,math,numpy as np,tifffile,io,shapely,pyarrow.parquet as pq
from PIL import Image
Q=__file__.rsplit('/',2)[0]+'/'; ZG=Q+'zg2/'
COP,WC,OV=sys.argv[1],sys.argv[2],sys.argv[3].rstrip('/')+'/'
KX=111320*math.cos(math.radians(50.85))
def ll(x,z): return 14.74+x/KX, 50.85-z/111320
X0,X1,Z0,Z1=-10400,10600,-14500,8000          # neues Gebiet (Wegenetz x -9452..9752, z -13685..7120 plus Rand)
# ---------- DEM ----------
s=open(ZG+'zg_net.json').read(); i=s.find('"dem":'); j=s.find('}',i)+1; dem=json.loads(s[i+6:j])
raw=np.frombuffer(base64.b64decode(dem['d']),dtype='<i2').astype(np.int64).reshape(dem['nz'],dem['nx']); H0=np.cumsum(raw,axis=1)/10.0
if dem['nx']>700: sys.exit('DEM ist schon erweitert')
c=dem['cell']; ox=int(round((dem['x0']-X0)/c)); oz=int(round((dem['z0']-Z0)/c))
nx0,nz0=dem['x0']-ox*c, dem['z0']-oz*c; NX=int(math.ceil((X1-nx0)/c))+1; NZ=int(math.ceil((Z1-nz0)/c))+1
C=tifffile.imread(COP)
def cop(x,z):
    lon,lat=ll(x,z); px=(lon-14.0)/(1/2400)-0.5; py=(51.0-lat)/(1/3600)-0.5
    i=np.floor(px).astype(int); j=np.floor(py).astype(int); fx=px-i; fy=py-j
    return (C[j,i]*(1-fx)+C[j,i+1]*fx)*(1-fy)+(C[j+1,i]*(1-fx)+C[j+1,i+1]*fx)*fy-300
xs=nx0+np.arange(NX)*c; zs=nz0+np.arange(NZ)*c; XX,ZZ=np.meshgrid(xs,zs)
HC=cop(XX,ZZ)
inside=np.zeros((NZ,NX),bool); inside[oz:oz+dem['nz'],ox:ox+dem['nx']]=True
# Versatz alt-neu am Rand des alten Gebiets, entlang des Randes geglättet und nach außen auf 600 m ausgeblendet
diff=np.zeros((NZ,NX)); diff[inside]=(H0-HC[oz:oz+dem['nz'],ox:ox+dem['nx']]).ravel()
ci=np.clip(np.arange(NX),ox,ox+dem['nx']-1); cj=np.clip(np.arange(NZ),oz,oz+dem['nz']-1)
D=diff[np.ix_(cj,ci)]
def sm(a,ax,w=9):
    k=np.ones(w)/w; return np.apply_along_axis(lambda v:np.convolve(np.pad(v,w//2,mode='edge'),k,'valid'),ax,a)
D=sm(sm(D,0),1)
dx=np.maximum(0,np.maximum(ox-np.arange(NX),np.arange(NX)-(ox+dem['nx']-1)))*c; dz=np.maximum(0,np.maximum(oz-np.arange(NZ),np.arange(NZ)-(oz+dem['nz']-1)))*c
dist=np.hypot(*np.meshgrid(dx,dz)); fade=np.clip(1-dist/600,0,1); fade=fade*fade*(3-2*fade)
H=HC+D*fade; H[inside]=H0.ravel()
q=np.round(H*10).astype(np.int64); dd=np.diff(np.concatenate([np.zeros((NZ,1),np.int64),q],axis=1),axis=1)
assert dd.max()<32767 and dd.min()>-32768
nd={'x0':int(nx0),'z0':int(nz0),'cell':c,'nx':NX,'nz':NZ,'d':base64.b64encode(dd.astype('<i2').tobytes()).decode()}
open(ZG+'zg_net.json','w').write(s[:i]+'"dem":'+json.dumps(nd,separators=(',',':'))+s[j:])
print('DEM',nd['x0'],nd['z0'],NX,NZ,'Naht max',float(np.abs(D*fade)[~inside].max()))
# ---------- Landbedeckung 10 m ----------
W=tifffile.imread(WC)
im=np.array(Image.open(ZG+'lc10.png').convert('RGB')); oh,ow=im.shape[:2]
LX0,LZ0=-10400,-14500; LW=(10600-LX0)//10; LH=(8000-LZ0)//10; ax=(-9000-LX0)//10; az=(-13400-LZ0)//10
xs=LX0+(np.arange(LW)+0.5)*10; zs=LZ0+(np.arange(LH)+0.5)*10; XX,ZZ=np.meshgrid(xs,zs); lon,lat=ll(XX,ZZ)
E=W[((51-lat)*12000).astype(int),((lon-12)*12000).astype(int)]; del W
PAL={0:(0,0,0),1:(20,110,30),2:(120,200,90),3:(230,210,120),4:(200,60,60),5:(40,90,220)}
K=np.zeros(E.shape,np.uint8); K[E==10]=1; K[(E==20)|(E==30)|(E==60)|(E==90)|(E==100)]=2; K[E==40]=3; K[E==50]=4; K[E==80]=5
out=np.zeros((LH,LW,3),np.uint8)
for k,col in PAL.items(): out[K==k]=col
old=im; keep=old.sum(2)>0; sub=out[az:az+oh,ax:ax+ow]; sub[keep]=old[keep]
Image.fromarray(out).save(ZG+'lc10.png',optimize=True); print('LC',LW,LH)
# ---------- OSM-Raster 40 m (Wald, Ortsflächen) ----------
land=pq.read_table(OV+'land.parquet'); lu=pq.read_table(OV+'landuse.parquet')
def polys(t,pred):
    G=[]
    for g,s_,c_ in zip(t.column('geometry').to_pylist(),t.column('subtype').to_pylist(),t.column('class').to_pylist()):
        if pred(s_,c_):
            g=shapely.from_wkb(g)
            if g.geom_type in ('Polygon','MultiPolygon'): G.append(g)
    return shapely.union_all(G) if G else None
FO=polys(land,lambda s_,c_:s_=='forest'); RS=polys(lu,lambda s_,c_:s_=='residential' and c_=='residential')
zr=json.load(open(ZG+'zgres.json'))
for key,geo in (('forest',FO),('res',RS)):
    x0,z0,cc,w,h,b=zr[key]; bits=np.unpackbits(np.frombuffer(base64.b64decode(b),np.uint8))[:w*h].reshape(h,w)
    if w>460: sys.exit('Raster schon erweitert')
    nx0=x0-cc*math.ceil((x0-X0)/cc); nz0=z0-cc*math.ceil((z0-Z0)/cc); NW=int(math.ceil((X1-nx0)/cc)); NH=int(math.ceil((Z1-nz0)/cc)); bx=int((x0-nx0)/cc); bz=int((z0-nz0)/cc)
    xs=nx0+(np.arange(NW)+0.5)*cc; zs=nz0+(np.arange(NH)+0.5)*cc; XX,ZZ=np.meshgrid(xs,zs); lon,lat=ll(XX,ZZ)
    N=shapely.contains_xy(geo,lon,lat).astype(np.uint8)
    o=N[bz:bz+h,bx:bx+w]; print(key,'Übereinstimmung alt/neu',round(float((o==bits).mean()),3),'alt',int(bits.sum()),'neu',int(o.sum()))
    N[bz:bz+h,bx:bx+w]=bits
    zr[key]=[int(nx0),int(nz0),cc,NW,NH,base64.b64encode(np.packbits(N.ravel())).decode()]
open(ZG+'zgres.json','w').write(json.dumps(zr,separators=(',',':'),ensure_ascii=False)); print('zgres ok')
