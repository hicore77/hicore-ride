"""0.19.0: echte Bäume, Sträucher, Waldmaske und Acker-Zustand für das ganze Zittauer Gebirge (statt nur Jonsdorf).
Läuft in der Higgsfield-Sandbox (numpy, scipy, Pillow; Luftbild-WMS nur dort erreichbar). Kachelweise (2 km, Rand 100 m).
Quellen: Kronenhöhe Meta/WRI Global Canopy Height 1 m (CC BY 4.0, Quadkeys 120212122 + 120212123),
         Luftbild Sachsen DOP20 RGB + CIR (GeoSN, dl-de/by-2-0), direkt mit 1 m vom WMS geholt.
Aufrufe (Arbeitsordner mit 120212122.tif, 120212123.tif):
  python3 dop_gebiet.py chm                 -> chm.npy (Region, 1 m, uint8)
  python3 dop_gebiet.py alle [sekunden]     -> k/I_J.npz für alle noch fehlenden Kacheln (Zeitbudget)
  python3 dop_gebiet.py kachel I J [vorschau.jpg]
  python3 dop_gebiet.py packen              -> dop_gebiet.bin (Bäume) + dop_maske.png (R Wald 0 unbekannt/1 offen/2 Wald, G Acker 0/1 grün/2 Stoppel/3 kahl)
Bäume: Typ 16 + 120*nadel + round((h-3)*4) wie dop_baeume.py; Typ 8 = Strauch aus Luftbild.
Außerhalb Sachsens (Tschechien, Polen) liefert der WMS nichts -> Maske 0, dort bleibt alles wie bisher (ESA/OSM)."""
import sys,os,math,io,time,struct,zlib,urllib.request,numpy as np
from concurrent.futures import ThreadPoolExecutor
RX0,RZ0,RX1,RZ1=-10000,-14000,6000,8000; S=2000; M=100
KX=111320*math.cos(math.radians(50.85)); R=6378137.0
def ll(x,z): return 14.74+x/KX, 50.85-z/111320

def chm():
    W,H=RX1-RX0,RZ1-RZ0; out=np.lib.format.open_memmap('chm.npy','w+',np.uint8,(H,W))
    gx=np.arange(RX0,RX1)+0.5; lon=14.74+gx/KX
    for q in ('120212122','120212123'):
        f=open(q+'.tif','rb'); hd=f.read(16); assert hd[:4]==b'II+\x00'
        f.seek(struct.unpack('<Q',hd[8:16])[0]); n=struct.unpack('<Q',f.read(8))[0]; T={}
        SZ={3:2,4:4,12:8,16:8,2:1,1:1}; FM={3:'H',4:'I',12:'d',16:'Q',2:'B',1:'B'}
        for _ in range(n):
            tag,typ,cnt,val=struct.unpack('<HHQ8s',f.read(20)); T[tag]=(typ,cnt,val)
        def get(tag):
            typ,cnt,val=T[tag]; L=SZ[typ]*cnt
            if L<=8: raw=val[:L]
            else: pos=f.tell(); f.seek(struct.unpack('<Q',val)[0]); raw=f.read(L); f.seek(pos)
            return struct.unpack('<%d%s'%(cnt,FM[typ]),raw)
        TW=get(256)[0]; assert get(278)[0]==1; OFF=get(273); CNT=get(279); PRED=get(317)[0] if 317 in T else 1
        sx,sy=get(33550)[:2]; tp=get(33922); OX,OY=tp[3],tp[4]
        col=((np.radians(lon)*R-OX)/sx).astype(np.int64); ok=(col>=0)&(col<TW)
        if not ok.any(): continue
        c0,c1=col[ok].min(),col[ok].max()+1; cache={}
        for zb in range(0,H,500):
            gz=np.arange(RZ0+zb,RZ0+min(H,zb+500))+0.5; lat=50.85-gz/111320
            row=((OY-R*np.log(np.tan(np.pi/4+np.radians(lat)/2)))/sy).astype(np.int64)
            for r in np.unique(row):
                if r in cache: continue
                f.seek(OFF[r]); a=np.frombuffer(zlib.decompress(f.read(CNT[r])),np.uint8)
                if PRED==2: a=np.cumsum(a,dtype=np.uint8)
                cache[r]=a[c0:c1]
            blk=np.stack([cache[r] for r in row])
            out[zb:zb+len(row),ok]=blk[:,col[ok]-c0]
            cache={r:v for r,v in cache.items() if r>=row.max()-2}
        print(q,'fertig',flush=True)
    out.flush(); print('CHM',out.shape,'Anteil>3m',round(float((out[::7,::7]>3).mean()),3))

U={'rgb':'https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=sn_dop_020&STYLES=&CRS=CRS:84&FORMAT=image/png',
   'cir':'https://geodienste.sachsen.de/wms_geosn_dop-cir/guest?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=sn_dop_020_cir&STYLES=&CRS=CRS:84&FORMAT=image/png'}
def fetch(k,x0,z0,w,h):
    lo0,la1=ll(x0,z0); lo1,la0=ll(x0+w,z0+h)
    url=U[k]+'&BBOX=%.7f,%.7f,%.7f,%.7f&WIDTH=%d&HEIGHT=%d'%(lo0,la0,lo1,la1,w,h)
    for t in range(5):
        try:
            from PIL import Image
            im=Image.open(io.BytesIO(urllib.request.urlopen(url,timeout=90).read()))
            a=np.asarray(im.convert('RGBA')); return a[...,:3].copy(), a[...,3]>0
        except Exception as e: print('nochmal',k,e,flush=True); time.sleep(3+5*t)
    raise RuntimeError('WMS')
def holen(x0,z0,W,H,CH=1100):
    A={k:np.zeros((H,W,3),np.uint8) for k in U}; V=np.ones((H,W),bool); jobs=[]
    for k in U:
        for zz in range(0,H,CH):
            for xx in range(0,W,CH): jobs.append((k,xx,zz,min(CH,W-xx),min(CH,H-zz)))
    with ThreadPoolExecutor(4) as ex:
        res=list(ex.map(lambda j:(j,fetch(j[0],x0+j[1],z0+j[2],j[3],j[4])),jobs))
    for (k,xx,zz,w,h),(a,al) in res:
        A[k][zz:zz+h,xx:xx+w]=a; V[zz:zz+h,xx:xx+w]&=al
    for k in U:
        s=A[k].astype(np.int32).sum(2); V&=(s>0)&(s<765)
    return A['rgb'],A['cir'],V

def kachel(I,J,prev=None):
    from scipy import ndimage as nd
    x0,z0=I*S-M,J*S-M; W=H=S+2*M
    C=np.load('chm.npy',mmap_mode='r'); cx,cz=x0-RX0,z0-RZ0
    h=np.zeros((H,W),np.float32); sx0,sz0=max(0,cx),max(0,cz); sx1,sz1=min(C.shape[1],cx+W),min(C.shape[0],cz+H)
    if sx1>sx0 and sz1>sz0: h[sz0-cz:sz1-cz,sx0-cx:sx1-cx]=C[sz0:sz1,sx0:sx1]
    rgbu,ciru,V=holen(x0,z0,W,H)
    Hc,Wc=S//10,S//10; core=(slice(M,M+S),slice(M,M+S))
    vc=V[core].reshape(Hc,10,Wc,10).mean((1,3))>0.5
    if not V.any():
        np.savez_compressed('k/%d_%d.npz'%(I,J),P=np.zeros((0,2),np.int16),T=np.zeros(0,np.uint8),F=np.zeros((Hc,Wc),np.uint8),A=np.zeros((Hc,Wc),np.uint8)); print(I,J,'leer'); return
    rgb=rgbu.astype(np.float32); cir=ciru.astype(np.float32); nir,red=cir[...,0],cir[...,1]
    ndvi=nd.gaussian_filter((nir-red)/(nir+red+1),1.0)
    bri=nd.gaussian_filter(rgb.mean(2),1.0)
    exg=nd.gaussian_filter((2*rgb[...,1]-rgb[...,0]-rgb[...,2])/(rgb.sum(2)+1),1.0)
    veg=((ndvi>0.10)|((exg>0.04)&(bri<110)))&V
    hs=nd.gaussian_filter(h,1.0); can=(hs>=3.0)&veg; can=nd.binary_opening(can,iterations=1)
    fr=nd.uniform_filter(can.astype(np.float32),61)
    fo=nd.binary_opening(fr>0.62,iterations=4)
    lab,nl=nd.label(fo); sz=nd.sum(fo,lab,range(1,nl+1)); fo=np.isin(lab,1+np.nonzero(np.asarray(sz)>=6000)[0])
    HW=H//10; fcw=fo.reshape(HW,10,HW,10).mean((1,3))>0.5
    fcm=np.repeat(np.repeat(fcw,10,0),10,1); fcm=nd.binary_erosion(fcm,iterations=3)
    cm=nd.gaussian_filter(nir+0.5*rgb[...,1],1.0); hx=nd.maximum_filter(h,5)
    pk=np.zeros_like(can)
    for lo,hi,k in ((0,8,5),(8,15,5),(15,99,7)):
        m=nd.maximum_filter(cm,size=k); pk|=(cm>=m-1e-4)&(hx>=lo)&(hx<hi)
    pk&=can&(hx>=4.0)&~fcm
    zz,xx=np.nonzero(pk); hh=hx[zz,xx]; o=np.argsort(-cm[zz,xx]); zz,xx,hh=zz[o],xx[o],hh[o]
    taken=np.zeros((H,W),bool); keep=[]
    for i,(z,x,hv) in enumerate(zip(zz,xx,hh)):
        r=int(max(2,min(5,round(hv*0.14))))
        if taken[max(0,z-r):z+r+1,max(0,x-r):x+r+1].any(): continue
        taken[z,x]=True; keep.append(i)
    zz,xx,hh=zz[keep],xx[keep],hh[keep]; sh=np.zeros(len(zz),bool)
    # kleine Bäume und Sträucher in Gärten/Feldrainen, die das CHM nicht sieht (raues Grün)
    L=rgb.mean(2); mL=nd.uniform_filter(L,5); sd=np.sqrt(np.maximum(nd.uniform_filter(L*L,5)-mL*mL,0))
    veg2=((ndvi>0.12)|(exg>0.05))&V; vf=nd.uniform_filter(veg2.astype(np.float32),7)
    cand=veg2&(sd>13)&(vf>0.9)&~nd.binary_dilation(can,iterations=2)&~fcm
    cand=nd.binary_opening(cand,iterations=1)
    lab,nl=nd.label(cand); sz=np.asarray(nd.sum(cand,lab,range(1,nl+1))); P2=nd.maximum_position(cm,lab,range(1,nl+1))
    z2=[];x2=[];s2=[]
    for (z,x),sv in zip(P2,sz):
        if sv>=4 and not taken[max(0,z-2):z+3,max(0,x-2):x+3].any(): taken[z,x]=True; z2.append(z); x2.append(x); s2.append(sv)
    z2=np.array(z2,int); x2=np.array(x2,int); s2=np.array(s2)
    hb=hx[z2,x2] if len(z2) else np.zeros(0)
    shr=(s2<8)|((s2<20)&(hb<2))          # kleine Flecken ohne messbare Höhe -> Strauch
    h2=np.clip(np.maximum(hb,5.0+(z2*7+x2*13)%5),5,9).astype(np.float32)
    zz=np.concatenate([zz,z2]); xx=np.concatenate([xx,x2]); hh=np.concatenate([hh,h2]); sh=np.concatenate([sh,shr])
    R5=nd.uniform_filter(rgb,(5,5,1)); bris=R5.mean(2)[zz,xx]; rgr=(R5[...,0]/(R5[...,1]+1))[zz,xx]
    con=~((bris>100)|((bris>88)&(rgr>0.9)))
    ty=16+120*con.astype(int)+np.clip(np.round((np.clip(hh,3,33)-3)*4),0,119).astype(int); ty[sh]=8
    inC=(zz>=M)&(zz<M+S)&(xx>=M)&(xx<M+S)&V[zz,xx]
    X=x0+xx[inC]+0.5; Z=z0+zz[inC]+0.5; ty=ty[inC]
    P=np.stack([np.round(X*2),np.round(Z*2)],1).astype(np.int16)
    F=np.where(vc,np.where(fcw[M//10:M//10+Hc,M//10:M//10+Wc],2,1),0).astype(np.uint8)
    # Acker-Zustand je 10-m-Zelle aus dem Luftbild: grün (Saat/Grünland), Stoppel/gelb, kahl (umgepflügt)
    def c10(a): return a[core].reshape(Hc,10,Wc,10).mean((1,3))
    nv=c10(ndvi); ex=c10((2*rgb[...,1]-rgb[...,0]-rgb[...,2])/(rgb.sum(2)+1)); r_,g_,b_=(c10(rgb[...,i]) for i in range(3)); br=(r_+g_+b_)/3
    yel=(br>120)&(r_>0.85*g_)&(g_>b_+35)          # Raps/Stoppel hell gelb
    A=np.where(yel,2,np.where((nv>0.05)|(ex>0.06),1,3)).astype(np.uint8); A=nd.median_filter(A,3); A[~vc]=0
    np.savez_compressed('k/%d_%d.npz'%(I,J),P=P,T=ty.astype(np.uint8),F=F,A=A)
    print(I,J,'Bäume',int((ty>=16).sum()),'Sträucher',int((ty==8).sum()),'Wald',round(float((F==2).mean()),3),'gültig',round(float(vc.mean()),3),flush=True)
    if prev:
        from PIL import Image, ImageDraw
        vs=500; ox=oz=M+700; im=Image.fromarray(rgbu[oz:oz+vs,ox:ox+vs]).resize((vs*2,vs*2)); dr=ImageDraw.Draw(im)
        for z,x,t in zip(Z-z0,X-x0,ty):
            z=int(z)-oz; x=int(x)-ox
            if 0<=z<vs and 0<=x<vs:
                r=4 if t==8 else 7; c=(255,0,255) if t==8 else (0,0,255) if t>=136 else (255,255,0); dr.ellipse((x*2-r,z*2-r,x*2+r,z*2+r),outline=c,width=2)
        im.save(prev,quality=60)

def tiles():
    return [(I,J) for J in range(RZ0//S,RZ1//S) for I in range(RX0//S,RX1//S)]
if __name__=='__main__':
    cmd=sys.argv[1]; os.makedirs('k',exist_ok=True)
    if cmd=='chm': chm()
    elif cmd=='kachel': kachel(int(sys.argv[2]),int(sys.argv[3]),sys.argv[4] if len(sys.argv)>4 else None)
    elif cmd=='alle':
        t0=time.time(); B=float(sys.argv[2]) if len(sys.argv)>2 else 780
        for I,J in tiles():
            if os.path.exists('k/%d_%d.npz'%(I,J)): continue
            if time.time()-t0>B: break
            t1=time.time(); kachel(I,J); print('  %.0f s'%(time.time()-t1),flush=True)
        print('fehlen',sum(not os.path.exists('k/%d_%d.npz'%t) for t in tiles()))
    elif cmd=='packen':
        from PIL import Image
        nI=(RX1-RX0)//S; nJ=(RZ1-RZ0)//S; Fm=np.zeros((nJ*200,nI*200),np.uint8); Am=np.zeros_like(Fm); Ps=[];Ts=[]
        for I,J in tiles():
            d=np.load('k/%d_%d.npz'%(I,J)); a,b=(J-RZ0//S)*200,(I-RX0//S)*200
            Fm[a:a+200,b:b+200]=d['F']; Am[a:a+200,b:b+200]=d['A']; Ps.append(d['P']); Ts.append(d['T'])
        P=np.concatenate(Ps); T=np.concatenate(Ts)
        raw=b'DOPC'+struct.pack('<4iI',RX0,RZ0,RX1,RZ1,len(T))+P.astype('<i2').tobytes()+T.tobytes()
        open('dop_gebiet.bin','wb').write(zlib.compress(raw,9))
        Image.fromarray(np.stack([Fm*127,Am*85,np.zeros_like(Fm)],2)).save('dop_maske.png',optimize=True)
        print('Bäume',int((T>=16).sum()),'Sträucher',int((T==8).sum()),'bin',os.path.getsize('dop_gebiet.bin'),'png',os.path.getsize('dop_maske.png'))
