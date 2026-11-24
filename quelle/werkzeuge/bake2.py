import numpy as np, json, sys
from PIL import Image
exec(open('rglb.py').read())
src=open('bakejersey.py').read(); exec(src[:src.index('# --- per-texel')])
buf=np.load('jer/buf.npy'); cov=np.load('jer/cov.npy')
p=buf[...,0:3]; n=buf[...,3:6]; wa=buf[...,6]; okb=buf[...,7]
Tor=T0
r,g,b=Tor[...,0],Tor[...,1],Tor[...,2]
orange=(r>190)&(g>60)&(g<160)&(b<90)
skin=(r>130)&(g>85)&(b>65)&(r-b>30)&(r>=g)&(g>=b)&~orange
UEND=0.168
def armuv(side):
  S=JP['LeftArm' if side>0 else 'RightArm'][:2]; E=JP['LeftForeArm' if side>0 else 'RightForeArm'][:2]
  d=(E-S)/np.linalg.norm(E-S); up=np.array([-d[1],d[0]]);
  if up[1]<0: up=-up
  q=p[...,:2]-S; return q@d, q@up
uL,vL=armuv(1); uR,vR=armuv(-1)
side=np.where(p[...,0]>=0,1,-1)
u=np.where(side>0,uL,uR); v=np.where(side>0,vL,vR)
y=p[...,1]
jer=cov&(okb>0.5)&(y>=1.0)&~((y>1.42)&skin)&~((wa>0.5)&(u>UEND))&(y<1.6)
# orange Reste (hoher Kragen, unregelmäßiger Saum) mitnehmen
jer|=cov&orange&(y>0.93)&(y<1.68)&~((wa>0.5)&(u>UEND+0.02))
# kleine Löcher schließen
for _ in range(2):
  nb=sum(np.roll(np.roll(jer,dy,0),dx,1).astype(int) for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)))
  jer|=cov&(nb>=3)&(y>0.95)&(y<1.66)&~skin
# gerader Saum statt ausgefranster Originalkante
HEM=0.985
jer&=(y>=HEM)
jer|=cov&(okb>0.5)&(y>=HEM)&(y<1.30)&~skin&~((wa>0.5)&(u>UEND))
jer|=cov&(y>=HEM)&(y<1.2)&(wa<0.5)&(np.abs(p[...,0])<0.26)
below=cov&(y<HEM)&(y>0.86)&(np.abs(p[...,0])<0.26)
band=jer&(y<HEM+0.022)
# Hals: oberhalb Kragen nur wo urspr. kein Hautton
def sm(a,b,x): t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
def mapimg(J, front):
  m=1 if front else -1
  X_t=J['cx']+m*p[...,0]*J['kx']; Y_t=J['collar']+(1.52-y)*J['ky']
  # Ärmel: sichtbar rechts im Bild?
  right=(side>0) if front else (side<0)
  S=np.array(J['S'],float); C=np.array(J['C'],float)
  Sx=np.where(right,S[0],2*J['cx']-S[0]); Cx=np.where(right,C[0],2*J['cx']-C[0])
  Dx=Cx-S[0]*0-Sx; Dy=C[1]-S[1]; L=np.sqrt(Dx**2+Dy**2); Dx/=L; Dy=Dy/L
  ux,uy=Dy,-Dx  # Senkrechte
  flip=uy>0; ux=np.where(flip,-ux,ux); uy=np.where(flip,-uy,uy)
  t=u/UEND*L
  X_a=Sx+Dx*t+ux*v*J['kv']; Y_a=S[1]+Dy*t+uy*v*J['kv']
  w=sm(0.25,0.75,wa)
  X=X_t*(1-w)+X_a*w; Y=Y_t*(1-w)+Y_a*w
  Y=np.clip(Y,J['collar']+3,J['hem']-2); 
  return X,Y
def bake(cfg, out):
  F=prep(*cfg['front_src']); B=prep(*cfg['back_src'])
  sel=np.where(jer)
  Xf,Yf=mapimg(cfg['front'],True); Xb,Yb=mapimg(cfg['back'],False)
  cf=bil(F,Xf[sel],Yf[sel]); cb=bil(B,Xb[sel],Yb[sel])
  nz=n[...,2][sel]; was=wa[sel]
  # klare Seitennaht statt Überblendung von Vorder- und Rückenbild
  wf=np.where(was>0.5, sm(-0.10,0.10,nz), sm(-0.045,0.045,nz))[:,None]
  col=cb*(1-wf)+cf*wf
  seam=(np.abs(nz)<0.022)&(was<0.5)
  col[seam]*=0.84
  # leichte Schattierung aus Originaltextur (Falten) übernehmen
  lum=Tor[sel].mean(1); ref=np.where(orange[sel], 150.0, np.nan)
  out_im=Tor.copy(); out_im[sel]=col
  # Bündchen (Silikonband) leicht dunkler, darunter Hose statt alter Trikotreste
  out_im[band]*=0.82
  lum=Tor[below].mean(1,keepdims=True)
  out_im[below]=np.clip(np.array([38,38,42.])*(0.75+0.5*lum/120.0),20,70)
  # Rand dilatieren in nicht abgedeckte Texel
  m=jer.copy()
  for _ in range(4):
    acc=np.zeros_like(out_im); cnt=np.zeros(m.shape,np.float32)
    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
      sm_=np.roll(np.roll(m,dy,0),dx,1); si=np.roll(np.roll(out_im,dy,0),dx,1); acc+=si*sm_[...,None]; cnt+=sm_
    new=(~m)&(~cov)&(cnt>0); out_im[new]=acc[new]/cnt[new][:,None]; m=m|new
  Image.fromarray(np.clip(out_im,0,255).astype(np.uint8)).save(out, quality=85)
CF=json.load(open('jer/cfg.json'))
for k,cfg in CF.items():
  if len(sys.argv)>1 and k not in sys.argv[1:]: continue
  bake(cfg,'jer/tex_%s.jpg'%k); print('ok',k)
