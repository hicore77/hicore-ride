# 0.25.6: TINITALY 1.1 (INGV, 10 m, CC BY 4.0) für die Dolomiten zuschneiden. Läuft in der Higgsfield-Sandbox (tinitaly.pi.ingv.it ist aus der Cloud gesperrt).
# Vorher: Kacheln w51570, w51575, w51070, w51075 von https://tinitaly.pi.ingv.it/data_1.1/<k>_s10/<k>_s10.zip holen und nach <k>/ entpacken.
# Ausgabe: inner.z (±7,6 km, 10 m, 1521²) und outer.z (25 m, 1681×1201), je zlib über 2D-Differenzen in Viertelmetern (int16), dazu PNG-Stücke à 470.000 Bytes
# für den Transfer (image_paths). In der Cloud zu /home/user/dolo/tin_inner.npy und tin_outer.npy (float32, Meter) zusammensetzen; dolo_bau.py liest sie.
# Zitat: Tarquini S., Isola I., Favalli M., Battistini A., Dotta G. (2023). TINITALY, a digital elevation model of Italy with a 10 meters cell size (Version 1.1). INGV. https://doi.org/10.13127/tinitaly/1.1
import numpy as np, math, zlib, hashlib
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
LAT0,LON0=46.49,12.06; KX=111320*math.cos(math.radians(LAT0)); KY=111320
def utm(lat,lon):   # WGS84 / UTM Zone 32N
    a=6378137.0; f=1/298.257223563; k0=0.9996; e2=f*(2-f); ep2=e2/(1-e2); lon0=math.radians(9)
    la=np.radians(lat); lo=np.radians(lon); N=a/np.sqrt(1-e2*np.sin(la)**2); T=np.tan(la)**2; C=ep2*np.cos(la)**2; A=np.cos(la)*(lo-lon0)
    M=a*((1-e2/4-3*e2**2/64-5*e2**3/256)*la-(3*e2/8+3*e2**2/32+45*e2**3/1024)*np.sin(2*la)+(15*e2**2/256+45*e2**3/1024)*np.sin(4*la)-(35*e2**3/3072)*np.sin(6*la))
    E=k0*N*(A+(1-T+C)*A**3/6+(5-18*T+T**2+72*C-58*ep2)*A**5/120)+500000
    Nn=k0*(M+N*np.tan(la)*(A**2/2+(5-T+9*C+4*C**2)*A**4/24+(61-58*T+T**2+600*C-330*ep2)*A**6/720))
    return E,Nn
E0,N1=699950.0,5200050.0   # Mosaik-Ursprung (oben links), 10 m
M=np.full((10010,10010),np.nan,np.float32)
for t,(c,r) in {'w51570':(0,0),'w51575':(5000,0),'w51070':(0,5000),'w51075':(5000,5000)}.items():
    A=np.array(Image.open('%s/%s_s10/%s_s10.tif'%(t,t,t)),np.float32); A[A<-1000]=np.nan
    S=M[r:r+5010,c:c+5010]; m=np.isnan(S); S[m]=A[m]
def samp(X,Z):
    lat=LAT0-Z/KY; lon=LON0+X/KX; E,N=utm(lat,lon); fx=(E-E0)/10-0.5; fy=(N1-N)/10-0.5
    ix=np.clip(np.floor(fx).astype(int),0,10008); iy=np.clip(np.floor(fy).astype(int),0,10008); ax=(fx-ix).astype(np.float32); ay=(fy-iy).astype(np.float32)
    return (M[iy,ix]*(1-ax)+M[iy,ix+1]*ax)*(1-ay)+(M[iy+1,ix]*(1-ax)+M[iy+1,ix+1]*ax)*ay
def pack(name,x0,z0,cell,nx,nz):
    X,Z=np.meshgrid(x0+np.arange(nx)*cell,z0+np.arange(nz)*cell); H=samp(X,Z)
    q=np.round(np.nan_to_num(H,nan=0)*4).astype(np.int32); d=np.diff(np.concatenate([np.zeros((nz,1),np.int32),q],axis=1),axis=1); d2=np.diff(np.concatenate([np.zeros((1,nx),np.int32),d],axis=0),axis=0)
    raw=d2.astype('<i2').tobytes(); z=zlib.compress(raw,9); open(name+'.z','wb').write(z); print(name,len(raw),len(z),hashlib.md5(z).hexdigest())
    for n,i in enumerate(range(0,len(z),470000)):
        ch=z[i:i+470000]; w=1000; h=(len(ch)+w-1)//w; Image.frombytes('L',(w,h),ch+bytes(w*h-len(ch))).save('%s_%02d.png'%(name,n),compress_level=1)
pack('inner',-7600.0,-7600.0,10.0,1521,1521)
pack('outer',-21000.0,-16000.0,25.0,1681,1201)
# Zusammensetzen in der Cloud: Stücke aneinanderhängen (je 470.000 Bytes, letztes kürzer), zlib.decompress, int16 -> np.cumsum(np.cumsum(d2,axis=0),axis=1)/4
