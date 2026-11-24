"""Einzelbäume aus Kronenhöhe (Meta-CHM 1 m) + Luftbild DOP20 (RGB, CIR) erkennen.
Läuft in der Higgsfield-Sandbox (numpy, scipy). Eingabe: chm.npz (chm_ausschnitt.py), dop.npz (dop_holen.py).
Aufruf: python3 dop_baeume.py chm.npz dop.npz ziel.bin [vorschau.jpg ndvi_schwelle hell_schwelle 'z,x,groesse' sigma abstand]
ziel.bin: 'DOPB' x0 z0 W H (int32) | Waldmaske 10 m (Bits, Zeilen von Norden) | n (uint32) | n×(x*2 int16, z*2 int16, Typ uint8)
Typ = 16 + 120*nadel + round((h-3)*4) (h = Baumhöhe 3..33 m)."""
import sys,struct,numpy as np
from scipy import ndimage as nd
c=np.load(sys.argv[1]); d=np.load(sys.argv[2]); out=sys.argv[3]
x0,z0=int(c['x0']),int(c['z0']); assert x0==int(d['x0']) and z0==int(d['z0'])
h=c['h'].astype(np.float32); rgb=d['rgb'].astype(np.float32); cir=d['cir'].astype(np.float32); H,W=h.shape
nir,red=cir[...,0],cir[...,1]
ndvi=nd.gaussian_filter((nir-red)/(nir+red+1),1.0)
bri=nd.gaussian_filter(rgb.mean(2),1.0)
exg=nd.gaussian_filter((2*rgb[...,1]-rgb[...,0]-rgb[...,2])/(rgb.sum(2)+1),1.0)
NDVI_T=float(sys.argv[5]) if len(sys.argv)>5 else 0.10
SIG=float(sys.argv[8]) if len(sys.argv)>8 else 1.0; SPC=float(sys.argv[9]) if len(sys.argv)>9 else 0.14
WINS=((0,8,5),(8,15,5),(15,99,7))
veg=(ndvi>NDVI_T)|((exg>0.04)&(bri<110))          # Schatten im Kronendach bleibt Vegetation
hs=nd.gaussian_filter(h,1.0)
can=(hs>=3.0)&veg
can=nd.binary_opening(can,iterations=1)
# Wald = dichtes zusammenhängendes Kronendach (Anteil im 30-m-Umkreis), auf 10-m-Zellen
fr=nd.uniform_filter(can.astype(np.float32),61)
fo=nd.binary_opening(fr>0.62,iterations=4)
lab,nl=nd.label(fo); sz=nd.sum(fo,lab,range(1,nl+1)); fo=np.isin(lab,1+np.nonzero(sz>=6000)[0])
Hc,Wc=H//10,W//10
fc=fo[:Hc*10,:Wc*10].reshape(Hc,10,Wc,10).mean((1,3))>0.5
# Baumspitzen: sonnige Kronen sind im Infrarot hell -> lokale Maxima des geglätteten NIR-Bilds im Kronendach,
# Fenster nach Höhe (CHM ist zu weich für Einzelkronen); Höhe aus dem CHM (Maximum 5x5)
fcm=np.repeat(np.repeat(fc,10,0),10,1); fcm=np.pad(fcm,((0,H-fcm.shape[0]),(0,W-fcm.shape[1])))
fcm=nd.binary_erosion(fcm,iterations=3)          # am Waldrand noch Einzelbäume erlauben, innen nicht
cm=nd.gaussian_filter(nir+0.5*rgb[...,1],SIG)
hx=nd.maximum_filter(h,5)
pk=np.zeros_like(can)
for lo,hi,k in WINS:
    m=nd.maximum_filter(cm,size=k); pk|=(cm>=m-1e-4)&(hx>=lo)&(hx<hi)
pk&=can&(hx>=4.0)&~fcm
zz,xx=np.nonzero(pk); hh=hx[zz,xx]
o=np.argsort(-cm[zz,xx]); zz,xx,hh=zz[o],xx[o],hh[o]
# Mindestabstand nach Kronengröße
taken=np.zeros((H,W),bool); keep=[]
for i,(z,x,hv) in enumerate(zip(zz,xx,hh)):
    r=int(max(2,min(5,round(hv*SPC))))
    if taken[max(0,z-r):z+r+1,max(0,x-r):x+r+1].any(): continue
    taken[z,x]=True; keep.append(i)
zz,xx,hh=zz[keep],xx[keep],hh[keep]
# Ergänzung: kleine Bäume/Sträucher in Gärten, die das CHM nicht sieht. Raues Grün (Krone + Schatten) mitten in Vegetation,
# nicht im Kronendach, je zusammenhängendem Fleck ein Baum an der hellsten Stelle, Höhe 5–9 m (CHM falls höher)
L=rgb.mean(2); mL=nd.uniform_filter(L,5); sd=np.sqrt(np.maximum(nd.uniform_filter(L*L,5)-mL*mL,0))
veg2=(ndvi>0.12)|(exg>0.05); vf=nd.uniform_filter(veg2.astype(np.float32),7)
cand=veg2&(sd>13)&(vf>0.9)&~nd.binary_dilation(can,iterations=2)&~fcm
cand=nd.binary_opening(cand,iterations=1)
lab,nl=nd.label(cand); sz=nd.sum(cand,lab,range(1,nl+1)); P2=nd.maximum_position(cm,lab,range(1,nl+1))
z2=[];x2=[]
for (z,x),sv in zip(P2,sz):
    if sv>=8 and not taken[max(0,z-3):z+4,max(0,x-3):x+4].any(): taken[z,x]=True; z2.append(z); x2.append(x)
z2=np.array(z2,int); x2=np.array(x2,int); h2=np.clip(np.maximum(hx[z2,x2],5.0+(z2*7+x2*13)%5),5,9).astype(np.float32)
print('Ergänzung kleine Bäume',len(z2))
zz=np.concatenate([zz,z2]); xx=np.concatenate([xx,x2]); hh=np.concatenate([hh,h2])
# Nadel/Laub: Frühjahrsbild, Laubbäume hell gelbgrün, Nadelbäume dunkel blaugrün (5x5 um die Spitze)
R5=nd.uniform_filter(rgb,(5,5,1)); bris=R5.mean(2)[zz,xx]; rgr=(R5[...,0]/(R5[...,1]+1))[zz,xx]; nirs=nir[zz,xx]
BT=float(sys.argv[6]) if len(sys.argv)>6 else 100
con=~((bris>BT)|((bris>BT-12)&(rgr>0.9)))
ty=16+120*con.astype(int)+np.clip(np.round((np.clip(hh,3,33)-3)*4),0,119).astype(int)
X=x0+xx+0.5; Z=z0+zz+0.5
bits=np.packbits(fc.astype(np.uint8).ravel())
with open(out,'wb') as f:
    f.write(b'DOPB'+struct.pack('<iiii',x0,z0,Wc,Hc)+bits.tobytes()+struct.pack('<I',len(X)))
    f.write(np.stack([np.round(X*2),np.round(Z*2)],1).astype('<i2').tobytes()+ty.astype(np.uint8).tobytes())
print('Baeume',len(X),'davon Nadel',int(con.sum()),'Hoehe Median',float(np.median(hh)),'Wald-Anteil',round(float(fc.mean()),3))
print('NDVI Perzentile',np.percentile(ndvi,[5,25,50,75,95]).round(3),'NIR an Spitzen',np.percentile(nirs,[10,50,90]).round(0),'Hell',np.percentile(bris,[10,50,90]).round(0))
if len(sys.argv)>4:
    from PIL import Image, ImageDraw
    vz0,vx0,vs=[int(v) for v in (sys.argv[7].split(',') if len(sys.argv)>7 else (1500,2000,400))]
    im=Image.fromarray(rgb[vz0:vz0+vs,vx0:vx0+vs].astype(np.uint8)).resize((vs*2,vs*2)); dr=ImageDraw.Draw(im)
    for z,x,hv,cn in zip(zz,xx,hh,con):
        if vz0<=z<vz0+vs and vx0<=x<vx0+vs:
            r=max(2,hv*0.25)*2; px,py=(x-vx0)*2+1,(z-vz0)*2+1; dr.ellipse((px-r,py-r,px+r,py+r),outline=(0,0,255) if cn else (255,255,0),width=2)
    fv=fcm[vz0:vz0+vs,vx0:vx0+vs]; arr=np.asarray(im).copy(); m=np.repeat(np.repeat(fv,2,0),2,1); arr[m,0]=(arr[m,0]*0.5+128).astype(np.uint8)
    Image.fromarray(arr).save(sys.argv[4],quality=70)
