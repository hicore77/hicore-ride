#!/usr/bin/env python3
"""0.24.4 (Hicore): Schriftzüge von Sprint- und Bergtrikot entfernen (direkt in der fertigen UV-Textur jer/tex_*.jpg).
Sprint: helle Schrift (mint/weiß) innerhalb grüner Flächen -> Inpainting mit Grün. Berg: blaue Schrift -> Weiß.
Aufruf aus quelle/: python3 werkzeuge/trikot_ohne_text.py  (Originale liegen in der Git-Historie)"""
import cv2, numpy as np
def sprint(p):
    im=cv2.imread(p); b,g,r=[im[...,i].astype(int) for i in range(3)]
    G=((g>45)&(g<150)&(r<90)&(g>r+20)&(g>b+5)).astype(np.uint8)
    cl=cv2.morphologyEx(G,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(25,25)))
    light=((g>150)&(g>r+10))|((r>170)&(g>170)&(b>170))
    T=((cl>0)&(G==0)&light).astype(np.uint8)
    T=cv2.dilate(T,np.ones((3,3),np.uint8))&cl
    out=cv2.inpaint(im,T*255,5,cv2.INPAINT_TELEA); cv2.imwrite(p,out,[cv2.IMWRITE_JPEG_QUALITY,90]); return int(T.sum())
def berg(p):
    im=cv2.imread(p); b,g,r=[im[...,i].astype(int) for i in range(3)]
    T=((b>r+35)&(b>g+15)).astype(np.uint8); T=cv2.dilate(T,np.ones((3,3),np.uint8))
    out=cv2.inpaint(im,T*255,5,cv2.INPAINT_TELEA); cv2.imwrite(p,out,[cv2.IMWRITE_JPEG_QUALITY,90]); return int(T.sum())
print('sprint', sprint('jer/tex_sprint.jpg'), 'berg', berg('jer/tex_berg.jpg'))
