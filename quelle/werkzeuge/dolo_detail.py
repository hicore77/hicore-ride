# 0.25.8 Dolomiten: Detailkarte aus dem 10-m-Höhenmodell (dolo/dem10.png) für den Gelände-Shader.
# Ausgabe dolo/det10.jpg (gleiches Raster wie dem10): Rot/Grün = Geländenormale (x, z), Blau = Himmelssicht (Schatten in Rinnen und unter Wänden) mal Wölbung
# (Grate heller, Rinnen dunkler). Damit bekommt auch das grobe Fernnetz (29 m) Licht und Schatten in 10-m-Auflösung, ohne ein Dreieck mehr.
# Aufruf: python3 werkzeuge/dolo_detail.py   (nach dolo_bau.py, vor build_gpu.py)
import numpy as np, os, sys
from PIL import Image
from scipy.ndimage import gaussian_filter
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dolo')
a=np.asarray(Image.open(os.path.join(D,'dem10.png')).convert('RGB')).astype(np.int32)
H=((a[...,0]<<8)|a[...,1]).astype(np.float32)/4+900.0; C=10.0; nz,nx=H.shape
gz,gx=np.gradient(H,C); l=np.sqrt(gx*gx+gz*gz+1); NX=-gx/l; NZ=-gz/l
P=np.pad(H,60,mode='edge'); sky=np.zeros_like(H); ND=16
for k in range(ND):
    an=k*2*np.pi/ND; tmax=np.zeros_like(H)
    for s in (1,2,3,4,6,8,11,15,20,27,36,48):
        dx=int(round(np.cos(an)*s)); dz=int(round(np.sin(an)*s)); dist=np.hypot(dx,dz)*C
        Hs=P[60+dz:60+dz+nz,60+dx:60+dx+nx]; tmax=np.maximum(tmax,(Hs-H)/dist)
    sky+=1-np.sin(np.arctan(tmax))
sky/=ND
cav=np.clip((H-gaussian_filter(H,2.2))/9.0,-1,1)+0.5*np.clip((H-gaussian_filter(H,6.0))/30.0,-1,1)
B=np.clip(sky*(1+0.42*cav),0,1)
out=np.stack([np.clip(127.5+127.5*NX,0,255),np.clip(127.5+127.5*NZ,0,255),B*255],-1).astype(np.uint8)
Image.fromarray(out,'RGB').save(os.path.join(D,'det10.jpg'),quality=90,subsampling=0,optimize=True)
print('det10.jpg',os.path.getsize(os.path.join(D,'det10.jpg'))//1024,'KB', 'sky',float(sky.min()),float(sky.mean()),'B',float(B.mean()))
if len(sys.argv)>1: Image.fromarray(out[...,2]).save(sys.argv[1])
