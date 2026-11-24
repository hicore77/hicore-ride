import numpy as np
from PIL import Image
buf=np.load('jer/buf.npy'); cov=np.load('jer/cov.npy')
T=np.asarray(Image.open('rtex/img2.jpeg').convert('RGB')).astype(np.float32)
NM=np.asarray(Image.open('rtex/img1.jpeg').convert('RGB')).astype(np.float32)
r,g,b=T[...,0],T[...,1],T[...,2]; orange=(r>190)&(g>60)&(g<160)&(b<90)
y=buf[...,1]
skin=cov&(r>120)&(g>75)&(b>55)&(r-b>25)&(r>=g)&(g>=b)&~orange&(y<1.47)
# weicher Übergang am Rand der Hautbereiche
sk=skin.astype(np.float32)
for _ in range(2): sk=(sk+np.roll(sk,1,0)+np.roll(sk,-1,0)+np.roll(sk,1,1)+np.roll(sk,-1,1))/5
sk=sk*skin
idx=np.where(skin); P=buf[...,:3][idx]
def hsh(ix,iy,iz,seed):
  h=(ix*374761393+iy*668265263+iz*2147483647+seed*144665)&0xffffffff
  h=((h^(h>>13))*1274126177)&0xffffffff; return ((h^(h>>16))&0xffff)/65535.0
def vnoise(p,scale,seed):
  q=p/scale; i=np.floor(q).astype(np.int64); f=q-i; u=f*f*(3-2*f)
  out=0
  for dx in (0,1):
    for dy in (0,1):
      for dz in (0,1):
        w=(u[:,0] if dx else 1-u[:,0])*(u[:,1] if dy else 1-u[:,1])*(u[:,2] if dz else 1-u[:,2])
        out=out+w*hsh(i[:,0]+dx,i[:,1]+dy,i[:,2]+dz,seed)
  return out*2-1
blot=vnoise(P,0.035,1)*0.6+vnoise(P,0.015,2)*0.4      # Flecken/Rötungen
fine=vnoise(P,0.006,3)*0.6+vnoise(P,0.003,4)*0.4      # feine Struktur
pore=np.clip(-vnoise(P,0.0025,5)-0.55,0,1)*2.2         # einzelne Poren/Härchenpunkte
frk=np.clip(vnoise(P,0.004,6)-0.78,0,1)*2.5            # vereinzelte Sommersprossen
legs=np.clip((1.0-P[:,1])/0.2,0,1)                     # Beine etwas mehr Haar-Punkte
c=T[idx]
lum=1+0.07*fine-0.045*pore*(0.5+0.5*legs)
c=c*lum[:,None]
c[:,0]+= 9*blot; c[:,1]-= 3*blot; c[:,2]-= 2*blot      # rosig/bräunlich wechselnd
c=c*(1-0.18*frk[:,None])+np.array([150,95,70])*0.18*frk[:,None]
w=sk[idx][:,None]
out=T.copy(); out[idx]=T[idx]*(1-w)+c*w
Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save('rtex/base2.jpg',quality=90)
# Normal-Map: Höhenfeld aus Struktur, Gradient im Bildraum
H=np.zeros(T.shape[:2],np.float32); H[idx]=(0.6*fine-0.35*pore)*sk[idx]
gx=(np.roll(H,-1,1)-np.roll(H,1,1))*0.5; gy=(np.roll(H,-1,0)-np.roll(H,1,0))*0.5
n=NM/127.5-1; s=1.1
n[...,0]-=gx*s; n[...,1]+=gy*s
n/=np.linalg.norm(n,axis=2,keepdims=True)+1e-6
NM2=NM.copy(); NM2[skin]=((n[skin]+1)*127.5)
Image.fromarray(np.clip(NM2,0,255).astype(np.uint8)).save('rtex/normal2.jpg',quality=90)
print('skin texels',len(P))
