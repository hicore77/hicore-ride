"""CHM (Meta/WRI Global Canopy Height 1 m, CC BY 4.0, s3://dataforgood-fb-data/forests/v1/alsgedi_global_v6_float/chm/<quadkey>.tif)
auf das Weltraster der Spielwelt schneiden. Ohne GDAL/tifffile (BigTIFF, eine Zeile pro Strip, Deflate, Predictor 2).
Aufruf: python3 chm_ausschnitt.py chm.tif lon0 lat0 lon1 lat1 ziel.npz
Ergebnis: h = Bestandeshöhe in m (uint8) auf 1-m-Raster (x nach Osten, z nach Süden), x0/z0 = linke obere Ecke."""
import sys,math,struct,zlib,numpy as np
src,lo0,la0,lo1,la1,out=sys.argv[1],*map(float,sys.argv[2:6]),sys.argv[6]
KX=111320*math.cos(math.radians(50.85)); R=6378137.0
def xz(lon,lat): return (lon-14.74)*KX, -(lat-50.85)*111320
f=open(src,'rb'); hd=f.read(16); assert hd[:4]==b'II+\x00'
f.seek(struct.unpack('<Q',hd[8:16])[0]); n=struct.unpack('<Q',f.read(8))[0]; T={}
SZ={3:2,4:4,12:8,16:8,2:1,1:1}; FM={3:'H',4:'I',12:'d',16:'Q',2:'B',1:'B'}
for _ in range(n):
    tag,typ,cnt,val=struct.unpack('<HHQ8s',f.read(20)); T[tag]=(typ,cnt,val)
def get(tag):
    typ,cnt,val=T[tag]; L=SZ[typ]*cnt
    if L<=8: raw=val[:L]
    else: pos=f.tell(); f.seek(struct.unpack('<Q',val)[0]); raw=f.read(L); f.seek(pos)
    return struct.unpack('<%d%s'%(cnt,FM[typ]),raw)
W=get(256)[0]; RPS=get(278)[0]; assert RPS==1; OFF=get(273); CNT=get(279); PRED=get(317)[0] if 317 in T else 1
sx,sy=get(33550)[:2]; tp=get(33922); OX,OY=tp[3],tp[4]
x0,z0=[math.floor(v) for v in xz(lo0,la1)]; x1,z1=[math.ceil(v) for v in xz(lo1,la0)]
gx=np.arange(x0,x1)+0.5; gz=np.arange(z0,z1)+0.5; lon=14.74+gx/KX; lat=50.85-gz/111320
col=((np.radians(lon)*R-OX)/sx).astype(np.int64); row=((OY-R*np.log(np.tan(np.pi/4+np.radians(lat)/2)))/sy).astype(np.int64)
r0,r1=row.min(),row.max()+1; c0,c1=col.min(),col.max()+1; A=np.zeros((r1-r0,c1-c0),np.uint8)
for r in range(r0,r1):
    f.seek(OFF[r]); a=np.frombuffer(zlib.decompress(f.read(CNT[r])),np.uint8)
    if PRED==2: a=np.cumsum(a,dtype=np.uint8)
    A[r-r0]=a[c0:c1]
H=A[(row-r0)[:,None],(col-c0)[None,:]]
np.savez_compressed(out,h=H,x0=x0,z0=z0)
print('CHM',H.shape,'x0',x0,'z0',z0,'max',H.max(),'Anteil>3m',round(float((H>3).mean()),3))
