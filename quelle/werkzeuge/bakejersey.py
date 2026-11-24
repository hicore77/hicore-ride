import sys, numpy as np
exec(open('rglb.py').read())
from PIL import Image
T0=np.asarray(Image.open('rtex/base2.jpg').convert('RGB')).astype(np.float32)
TS=T0.shape[0]
def inpaint(img, mask, it=80):
  im=img.copy(); m=mask.copy()
  for _ in range(it):
    if m.all(): break
    acc=np.zeros_like(im); cnt=np.zeros(m.shape,np.float32)
    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,-1),(1,-1),(-1,1)):
      sm=np.roll(np.roll(m,dy,0),dx,1); si=np.roll(np.roll(im,dy,0),dx,1)
      acc+=si*sm[...,None]; cnt+=sm
    new=(~m)&(cnt>0); im[new]=acc[new]/cnt[new][:,None]; m=m|new
  return im
def prep(path, crop=None, bg='white'):
  a=Image.open(path).convert('RGB')
  if crop: a=a.crop(crop)
  a=np.asarray(a).astype(np.float32)
  if bg=='white':
    cand=a.min(2)>=236; bgm=np.zeros_like(cand); bgm[0,:]=cand[0,:]; bgm[-1,:]=cand[-1,:]; bgm[:,0]=cand[:,0]; bgm[:,-1]=cand[:,-1]
    while True:  # nur der zusammenhängende Hintergrund von außen, nicht weiße Schrift
      g=(bgm|np.roll(bgm,1,0)|np.roll(bgm,-1,0)|np.roll(bgm,1,1)|np.roll(bgm,-1,1))&cand
      if (g==bgm).all(): break
      bgm=g
    for _ in range(6):  # helle Kantenpixel am Hintergrund nicht übernehmen
      bgm=bgm|np.roll(bgm,1,0)|np.roll(bgm,-1,0)|np.roll(bgm,1,1)|np.roll(bgm,-1,1)
    mask=~bgm
  else: mask=np.abs(a-np.array(bg,np.float32)).max(2)>6
  return inpaint(a,mask,150)
def bil(img,X,Y):
  h,w,_=img.shape; X=np.clip(X,0,w-1.001); Y=np.clip(Y,0,h-1.001)
  x0=X.astype(int); y0=Y.astype(int); fx=(X-x0)[:,None]; fy=(Y-y0)[:,None]
  return (img[y0,x0]*(1-fx)*(1-fy)+img[y0,x0+1]*fx*(1-fy)+img[y0+1,x0]*(1-fx)*fy+img[y0+1,x0+1]*fx*fy)
# --- per-texel rasterization
Wt=TS; uvp=UV*Wt-0.5
names_a=np.array(names)
armset=['LeftArm','LeftForeArm','RightArm','RightForeArm']
wa=np.zeros(len(P),np.float32)
for k,n in enumerate(names):
  if n in armset: wa+=(W*(J==k)).sum(1)
dom=names_a[J[np.arange(len(J)),W.argmax(1)]]
okb=np.isin(dom,['Hips','Spine02','Spine01','Spine','neck','LeftShoulder','RightShoulder','LeftArm','RightArm','LeftForeArm','RightForeArm']).astype(np.float32)
attr=np.concatenate([P,N,wa[:,None],okb[:,None]],1)  # 8
buf=np.zeros((TS,TS,8),np.float32); cov=np.zeros((TS,TS),bool)
tri=I.reshape(-1,3)
for a,b,c in tri:
  A,Bv,C=uvp[a],uvp[b],uvp[c]
  x0=int(np.floor(min(A[0],Bv[0],C[0])))-1; x1=int(np.ceil(max(A[0],Bv[0],C[0])))+1
  y0=int(np.floor(min(A[1],Bv[1],C[1])))-1; y1=int(np.ceil(max(A[1],Bv[1],C[1])))+1
  x0=max(x0,0);y0=max(y0,0);x1=min(x1,TS-1);y1=min(y1,TS-1)
  if x1<x0 or y1<y0: continue
  xs,ys=np.meshgrid(np.arange(x0,x1+1),np.arange(y0,y1+1))
  den=(Bv[1]-C[1])*(A[0]-C[0])+(C[0]-Bv[0])*(A[1]-C[1])
  if abs(den)<1e-12: continue
  l0=((Bv[1]-C[1])*(xs-C[0])+(C[0]-Bv[0])*(ys-C[1]))/den
  l1=((C[1]-A[1])*(xs-C[0])+(A[0]-C[0])*(ys-C[1]))/den
  l2=1-l0-l1
  e=-0.6/ max(1.0, np.sqrt(abs(den)))  # ~half texel tolerance
  ins=(l0>=e)&(l1>=e)&(l2>=e)
  if not ins.any(): continue
  yy=ys[ins]; xx=xs[ins]
  v=l0[ins,None]*attr[a]+l1[ins,None]*attr[b]+l2[ins,None]*attr[c]
  buf[yy,xx]=v; cov[yy,xx]=True
np.save('jer/buf.npy',buf); np.save('jer/cov.npy',cov)
print('raster done', cov.sum())
