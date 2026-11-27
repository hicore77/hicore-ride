# 0.25.8 Dolomiten: Felswände im 10-m-Höhenmodell versteilen. TINITALY stammt aus Höhenlinien, senkrechte Wände sind darin zu 50–60° geglättet
# (Ra Gusela, Averau, Nuvolau wirken wie Kegel). Hier wird in steilem Fels die Höhe in Stufen umverteilt: schmale, fast senkrechte Wandstücke und
# flachere Bänder/Gipfelplateaus dazwischen, wie die echten Dolomitwände (Stufenhöhe 70–150 m, ortsabhängig, Bänder nicht waagrecht durchlaufend).
# Geschützt bleiben: die Runde (kein Eingriff bis 90 m), Nebenstraßen, Wege, Häuser/Hütten, Bäche.
# Eingabe dolo/dem10_roh.png (wird beim ersten Lauf aus dem10.png kopiert), dolo/net.json, side.bin, bld.b64. Ausgabe dolo/dem10.png.
# Danach: python3 werkzeuge/dolo_detail.py, dann build_gpu.py. Aus im Spiel: nicht schaltbar (Daten), zurück mit: cp dolo/dem10_roh.png dolo/dem10.png
import numpy as np, os, sys, json, base64, struct, shutil
from PIL import Image
from scipy.ndimage import gaussian_filter, maximum_filter, distance_transform_edt
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dolo')
roh=os.path.join(D,'dem10_roh.png')
if not os.path.exists(roh): shutil.copy(os.path.join(D,'dem10.png'),roh)
a=np.asarray(Image.open(roh).convert('RGB')).astype(np.int32); H=((a[...,0]<<8)|a[...,1]).astype(np.float64)/4+900.0
meta=json.load(open(os.path.join(D,'meta.json'))); X0,Z0,C=meta['dem2'][0],meta['dem2'][1],meta['dem2'][2]; nz,nx=H.shape
def raster(lines, step=4.0):
    M=np.zeros(H.shape,bool)
    for P in lines:
        P=np.asarray(P,float)
        if len(P)==1: P=np.vstack([P,P])
        for (x0,z0),(x1,z1) in zip(P[:-1],P[1:]):
            n=max(1,int(np.hypot(x1-x0,z1-z0)/step)); t=np.linspace(0,1,n+1); j=np.round((x0+(x1-x0)*t-X0)/C).astype(int); i=np.round((z0+(z1-z0)*t-Z0)/C).astype(int)
            ok=(i>=0)&(i<nz)&(j>=0)&(j<nx); M[i[ok],j[ok]]=True
    return M
def dist(M): return distance_transform_edt(~M)*C if M.any() else np.full(H.shape,1e6)
def ss(a,b,x): t=np.clip((x-a)/(b-a),0,1); return t*t*(3-2*t)
net=json.load(open(os.path.join(D,'net.json'))); main=[]
for e in net['edges']:
    v=struct.unpack('<%dh'%(len(base64.b64decode(e[5]))//2), base64.b64decode(e[5])); x,z=net['nodes'][e[0]][0]*4,net['nodes'][e[0]][1]*4; P=[]
    x=round(x); z=round(z)
    for k in range(0,len(v),3): x+=v[k]; z+=v[k+1]; P.append((x/4,z/4))
    main.append(P)
buf=open(os.path.join(D,'side.bin'),'rb').read(); ns=struct.unpack_from('<I',buf,0)[0]; o=4; roads=[]; paths=[]
for _ in range(ns):
    c,w,sf,fl,n=struct.unpack_from('<BBBBH',buf,o); o+=6; px=pz=0; P=[]
    for k in range(n): dx,dz=struct.unpack_from('<hh',buf,o); o+=4; px+=dx; pz+=dz; P.append((px/2,pz/2))
    (paths if c>=7 else roads).append(P)
bl=struct.unpack('<%dh'%(len(base64.b64decode(open(os.path.join(D,'bld.b64')).read()))//2), base64.b64decode(open(os.path.join(D,'bld.b64')).read())); o=0; hs=[]
while o<len(bl): n=bl[o]; hs.append([(bl[o+3],bl[o+4])]); o+=5+(n-1)*2
streams=[list(zip(s[1::2],s[2::2])) for s in net['streams']]
dM,dR,dP,dB,dS=dist(raster(main)),dist(raster(roads)),dist(raster(paths)),dist(raster(hs)),dist(raster(streams))
pm=ss(90,230,dM)*ss(35,100,dR)*ss(12,35,dP)*ss(45,110,dB)*ss(20,60,dS)
gz,gx=np.gradient(gaussian_filter(H,1.5),C); sl=np.degrees(np.arctan(np.hypot(gx,gz)))
lc=np.asarray(Image.open(os.path.join(D,'lc.png')).convert('L')); LX,LZ,LC=meta['lc'][0],meta['lc'][1],meta['lc'][2]
jj=np.clip(((X0+np.arange(nx)*C-LX)/LC).astype(int),0,lc.shape[1]-1); ii=np.clip(((Z0+np.arange(nz)*C-LZ)/LC).astype(int),0,lc.shape[0]-1); L=lc[np.ix_(ii,jj)]
veg=gaussian_filter(np.isin(L,(1,4,5)).astype(float),1.5)     # Wald, Siedlung, Acker: nicht versteilen
w=gaussian_filter(ss(40,52,maximum_filter(sl,size=3)),0.8)*pm*(1-ss(0.25,0.6,veg))
rng=np.random.default_rng(7)
def noise(sig): f=gaussian_filter(rng.standard_normal(H.shape),sig); return f/np.abs(f).max()
T=105+45*noise(40)                      # Stufenhöhe 60–150 m
Pn=55*noise(25)+18*noise(7)             # Bänder laufen nicht waagrecht durch
K=3.2                                   # Wandstück nimmt etwa ein Viertel der Stufe ein -> rund 3,6-fach steiler
t=(H+Pn)/T; f=np.floor(t); r=t-f
rr=0.12*r+0.88*np.clip((r-0.5)*K+0.5,0,1)
H2=(f+rr)*T-Pn
Hn=H+w*(H2-H)
Hn=H+(gaussian_filter(Hn-H,0.6))        # Einzelzacken glätten, Kante bleibt
q=np.clip(np.round((Hn-900.0)*4),0,65535).astype(np.uint16); rgb=np.zeros(q.shape+(3,),np.uint8); rgb[...,0]=q>>8; rgb[...,1]=q&255
Image.fromarray(rgb,'RGB').save(os.path.join(D,'dem10.png'),optimize=True)
g2z,g2x=np.gradient(Hn,C); s2=np.degrees(np.arctan(np.hypot(g2x,g2z)))
print('geändert %.1f %% der Fläche, max. Änderung %.0f m, Anteil >60°: vorher %.2f %%, nachher %.2f %%, >70°: %.2f -> %.2f %%'%((w>0.05).mean()*100, np.abs(Hn-H).max(), (sl>60).mean()*100,(s2>60).mean()*100,(sl>70).mean()*100,(s2>70).mean()*100))
# Blockfelder: Felsbrocken am Wandfuß (unterhalb steiler Wände, auf Schutt und Almwiese), nur im Sichtbereich der Runde. Ins Spiel über meta.json 'blk'.
dC=distance_transform_edt(~(s2>54))*C; cand=(s2>3)&(s2<37)&(dC<520)&(dC>15)&(veg<0.3)&(dM>22)&(dM<1900)&(dR>12)&(dP>5)&(dB>30)&(dS>10)
cl=noise(9); cand&=(dM<1000)
wt=(np.where(cand,(0.12+0.88*np.clip(1-dC/520,0,1)**1.6)*(0.1+0.9*np.clip(1-dM/600,0,1)**1.5),0)*(0.012+ss(0.38,0.62,cl)**2)).ravel(); NB=20000; rb=np.random.default_rng(11)   # Blockfelder fleckig dicht, dazwischen einzelne Brocken
if wt.sum()>0:
    for _ in range(8): wt=np.minimum(wt*NB/wt.sum(),0.45)   # höchstens etwa 45 Brocken je Hektar-Zelle, sonst Haufen
    idx=rb.choice(wt.size,size=NB,p=wt/wt.sum()); bi,bj=np.unravel_index(idx,H.shape); bx=X0+(bj+rb.random(NB)-0.5)*C; bz=Z0+(bi+rb.random(NB)-0.5)*C; bs=0.6+5.4*rb.random(NB)**3.0
    arr=np.stack([np.round(bx*2),np.round(bz*2),np.round(bs*100)],1).astype('<i2'); meta['blk']=base64.b64encode(arr.tobytes()).decode(); json.dump(meta,open(os.path.join(D,'meta.json'),'w'),ensure_ascii=False)
    print('Felsbrocken',NB,'Kandidatenfläche %.2f km²'%(cand.sum()*C*C/1e6))
if len(sys.argv)>1:   # Prüfbild: Profil Süd–Nord durch die Ra Gusela (x=-710), 1 Pixel = 1 m
    from PIL import ImageDraw
    j=int((-710-X0)/C); i0=int((-80-300-Z0)/C); i1=int((900-Z0)/C); n=i1-i0; im=Image.new('RGB',(n*10,520),'white'); d=ImageDraw.Draw(im)
    for arr,col in ((H,(60,90,220)),(Hn,(220,60,40))): d.line([(k*10,2680-arr[i0+k,j]) for k in range(n)],fill=col,width=2)
    im.save(sys.argv[1])
