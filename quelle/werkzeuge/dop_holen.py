"""Luftbild Sachsen DOP20 (GeoSN, DL-DE/BY-2.0, WMS geodienste.sachsen.de) für einen Weltausschnitt holen.
Nur über die Higgsfield-Sandbox erreichbar (Cloud blockiert). Holt RGB und CIR (NIR,R,G) mit 0,5 m und
mittelt auf 1 m, deckungsgleich mit chm_ausschnitt.py (gleiche x0/z0, gleiche Größe).
Aufruf: python3 dop_holen.py x0 z0 breite hoehe ziel.npz   (Welt-Meter, z nach Süden)"""
import sys,math,io,time,urllib.request,numpy as np
from PIL import Image
x0,z0,W,H=map(int,sys.argv[1:5]); out=sys.argv[5]
KX=111320*math.cos(math.radians(50.85)); RES=0.5; CH=1000
def ll(x,z): return 14.74+x/KX, 50.85-z/111320
U={'rgb':'https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=sn_dop_020&STYLES=&CRS=CRS:84&FORMAT=image/png',
   'cir':'https://geodienste.sachsen.de/wms_geosn_dop-cir/guest?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=sn_dop_020_cir&STYLES=&CRS=CRS:84&FORMAT=image/png'}
A={k:np.zeros((H,W,3),np.uint8) for k in U}
for k,u in U.items():
    for zz in range(0,H,CH):
        for xx in range(0,W,CH):
            w=min(CH,W-xx); h=min(CH,H-zz); lo0,la1=ll(x0+xx,z0+zz); lo1,la0=ll(x0+xx+w,z0+zz+h)
            url=u+'&BBOX=%.7f,%.7f,%.7f,%.7f&WIDTH=%d&HEIGHT=%d'%(lo0,la0,lo1,la1,int(w/RES),int(h/RES))
            for t in range(4):
                try: im=np.asarray(Image.open(io.BytesIO(urllib.request.urlopen(url,timeout=90).read())).convert('RGB'),np.float32); break
                except Exception as e: print('nochmal',e,flush=True); time.sleep(3)
            A[k][zz:zz+h,xx:xx+w]=im.reshape(h,2,w,2,3).mean((1,3)).round().astype(np.uint8)
            print(k,xx,zz,flush=True)
np.savez_compressed(out,rgb=A['rgb'],cir=A['cir'],x0=x0,z0=z0)
print('fertig',out)
