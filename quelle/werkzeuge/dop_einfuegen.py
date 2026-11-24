"""DOP-Bäume (dop_baeume.py → *.bin) in die Weltkacheln quelle/kacheln/ einfügen und die Waldmaske nach zg2/dopwald.json schreiben.
Wiederholbar: alte DOP-Bäume (Typ >= 16) im Ausschnitt werden vorher entfernt. Mehrere .bin nacheinander möglich.
Aufruf (in quelle/): python3 werkzeuge/dop_einfuegen.py baeume.bin [weitere.bin ...]"""
import sys,os,struct,json,hashlib,base64,numpy as np
K='kacheln/'; IDX=json.load(open(K+'index.json')); S=IDX['S']
def rd(fn):
    u=open(fn,'rb').read(); assert u[:4]==b'KCH1'; h=struct.unpack('<8I',u[4:36]); o=36; parts=[]
    for L in (h[0],h[2],h[4],h[6]): parts.append(u[o:o+L]); o+=L
    nt=h[3]; tr=parts[1]; xy=np.frombuffer(tr[:4*nt],'<i2').reshape(-1,2).copy(); ty=np.frombuffer(tr[4*nt:5*nt],'u1').copy()
    return h,parts,xy,ty
def wr(fn,h,parts,xy,ty):
    tr=xy.astype('<i2').tobytes()+ty.astype('u1').tobytes()
    data=b'KCH1'+struct.pack('<8I',len(parts[0]),h[1],len(tr),len(ty),len(parts[2]),h[5],len(parts[3]),h[7])+parts[0]+tr+parts[2]+parts[3]
    open(fn,'wb').write(data); return hashlib.md5(data).hexdigest()[:8]
masks=json.load(open('zg2/dopwald.json')) if os.path.exists('zg2/dopwald.json') else []
for src in sys.argv[1:]:
    u=open(src,'rb').read(); assert u[:4]==b'DOPB'; x0,z0,Wc,Hc=struct.unpack('<4i',u[4:20]); nb=(Wc*Hc+7)//8; bits=u[20:20+nb]; o=20+nb
    n=struct.unpack('<I',u[o:o+4])[0]; o+=4; P=np.frombuffer(u[o:o+4*n],'<i2').reshape(-1,2).astype(np.int32); T=np.frombuffer(u[o+4*n:o+5*n],'u1')
    x1,z1=x0+Wc*10,z0+Hc*10
    masks=[m for m in masks if m[:2]!=[x0,z0]]+[[x0,z0,10,Wc,Hc,base64.b64encode(bits).decode()]]
    I0,I1,J0,J1=x0//S,(x1-1)//S,z0//S,(z1-1)//S; add=nd=0
    for I in range(I0,I1+1):
        for J in range(J0,J1+1):
            fn=K+'k_%d_%d.bin'%(I,J)
            if os.path.exists(fn): h,parts,xy,ty=rd(fn)
            else: h=(0,0,0,0,0,0,0,0); parts=[b'',b'',b'',b'']; xy=np.zeros((0,2),np.int32); ty=np.zeros(0,np.uint8)
            inR=(xy[:,0]>=x0*2)&(xy[:,0]<x1*2)&(xy[:,1]>=z0*2)&(xy[:,1]<z1*2)
            keep=~((ty>=16)&inR); xy,ty=xy[keep],ty[keep]
            sel=(P[:,0]>=max(I*S,x0)*2)&(P[:,0]<min((I+1)*S,x1)*2)&(P[:,1]>=max(J*S,z0)*2)&(P[:,1]<min((J+1)*S,z1)*2)
            Q,QT=P[sel],T[sel]
            osm=xy[ty<6].astype(np.float32)/2   # echte OSM-Bäume haben Vorrang
            if len(osm) and len(Q):
                q=Q.astype(np.float32)/2; ok=np.ones(len(q),bool)
                for a in range(0,len(q),2000):
                    dd=((q[a:a+2000,None,:]-osm[None,:,:])**2).sum(2).min(1); ok[a:a+2000]=dd>3.5**2
                nd+=int((~ok).sum()); Q,QT=Q[ok],QT[ok]
            if not len(Q) and not os.path.exists(fn): continue
            xy=np.concatenate([xy,Q]); ty=np.concatenate([ty,QT]); add+=len(Q)
            IDX['t']['%d,%d'%(I,J)]=wr(fn,h,parts,xy,ty)
    print(src,'eingefügt',add,'wegen OSM-Baum weggelassen',nd)
json.dump(IDX,open(K+'index.json','w'),separators=(',',':'))
json.dump(masks,open('zg2/dopwald.json','w'),separators=(',',':'))
