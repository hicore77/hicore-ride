#!/usr/bin/env python3
"""Eigene Trikot-Designs (ohne Markenlogos) auf der Silhouette der E.Y.B.-Vorlage zeichnen,
damit die Kalibrierung aus jer/cfg.json (eyb) direkt passt. Ausgabe jer/<id>_f.png, jer/<id>_b.png, thumb."""
import numpy as np, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D='jer/'
FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FSI='/usr/share/fonts/truetype/dejavu/DejaVuSerif-BoldItalic.ttf'
def font(p,s):
    try: return ImageFont.truetype(p,s)
    except Exception: return ImageFont.truetype(FB,s)
def sil(path):
    a=np.asarray(Image.open(path).convert('RGB')); cand=a.min(2)>=236
    bg=np.zeros_like(cand); bg[0,:]=cand[0,:]; bg[-1,:]=cand[-1,:]; bg[:,0]=cand[:,0]; bg[:,-1]=cand[:,-1]
    while True:
        g=(bg|np.roll(bg,1,0)|np.roll(bg,-1,0)|np.roll(bg,1,1)|np.roll(bg,-1,1))&cand
        if (g==bg).all(): break
        bg=g
    return ~bg
MF=sil(D+'eyb_f.jpg'); MB=sil(D+'eyb_b.jpg')
TORSO=(372,828)   # Rumpf in x, Ärmel außerhalb (bis y~650)
def sleeve_mask(m, side):   # side -1 = Bild links, +1 = Bild rechts
    h,w=m.shape; X=np.arange(w)[None,:].repeat(h,0); Y=np.arange(h)[:,None].repeat(w,1)
    return m&((X<TORSO[0]) if side<0 else (X>TORSO[1]))&(Y<680)
def compose(design, m, back):
    im=Image.new('RGB',(1200,1200),(255,255,255)); dr=ImageDraw.Draw(im)
    design(im,dr,m,back)
    a=np.asarray(im).astype(np.float32)
    # Stoff: feine Rippen + leichte Schattierung zu den Rändern
    Y=np.arange(1200)[:,None]; X=np.arange(1200)[None,:]
    rib=1+0.025*np.sin(Y*0.9)
    shade=1-0.10*np.clip((np.abs(X-600)-200)/250,0,1)
    a=a*(rib*shade)[...,None]
    a[~m]=(255,0,255)
    return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
def bands(dr, ys, cols, x0=TORSO[0]-5, x1=TORSO[1]+5):
    for (y0,y1),c in zip(ys,cols): dr.rectangle([x0,y0,x1,y1],fill=c)
def text_c(dr, xy, s, f, fill):
    b=dr.textbbox((0,0),s,font=f); dr.text((xy[0]-(b[2]-b[0])/2-b[0], xy[1]-(b[3]-b[1])/2-b[1]), s, font=f, fill=fill)
def zip_line(dr, col):
    dr.line([600,175,600,1030],fill=col,width=5)

def d_navy(im,dr,m,back):
    dr.rectangle([0,0,1200,1200],fill=(28,34,52))
    if not back:
        bands(dr,[(470,525),(575,622)],[(232,232,228),(255,64,110)]); zip_line(dr,(20,24,38))
        dr.rectangle([0,540,TORSO[0]-2,590],fill=(232,232,228))     # Armband (Bild links = rechter Arm)
        text_c(dr,(705,350),'Hicore.',font(FSI,46),(235,235,230))
        dr.rectangle([560,168,640,190],fill=(255,64,110))
    else:
        bands(dr,[(420,475),(525,572)],[(232,232,228),(255,64,110)])
        dr.rectangle([TORSO[1]+2,540,1200,590],fill=(232,232,228))
        text_c(dr,(600,840),'Hicore.',font(FSI,110),(235,235,230))
def d_berg(im,dr,m,back):
    dr.rectangle([0,0,1200,1200],fill=(250,250,248))
    R=27
    for j,y in enumerate(range(190,1060,78)):
        off=0 if j%2==0 else 39
        for x in range(150+off,1100,78): dr.ellipse([x-R,y-R,x+R,y+R],fill=(222,28,30))
    if not back: zip_line(dr,(225,225,222)); dr.rectangle([610,305,800,355],fill=(250,250,248)); text_c(dr,(705,330),'HICORE RIDE',font(FB,26),(30,90,200))
    else: dr.rectangle([440,560,760,640],fill=(250,250,248)); text_c(dr,(600,600),'HICORE RIDE',font(FB,58),(30,90,200))
def d_sprint(im,dr,m,back):
    dr.rectangle([0,0,1200,1200],fill=(20,88,58))
    mint=(158,228,190)
    dr.rectangle([440,150,760,215],fill=mint)                    # Kragen
    dr.rectangle([0,600,TORSO[0]-1,700],fill=mint); dr.rectangle([TORSO[1]+1,600,1200,700],fill=mint)   # Ärmelbündchen
    if not back: zip_line(dr,(14,66,44)); text_c(dr,(470,330),'HICORE',font(FB,40),(255,255,255)); text_c(dr,(730,330),'SPRINT',font(FB,40),mint)
    else: text_c(dr,(600,520),'SPRINT',font(FB,120),mint); text_c(dr,(600,860),'HICORE RIDE',font(FB,44),(255,255,255))
def d_sand(im,dr,m,back):
    dr.rectangle([0,0,1200,1200],fill=(226,214,190))
    dr.arc([370,560,830,700],0,180,fill=(206,194,170),width=6)   # Naht unter der Brust
    for x in list(range(240,372,16))+list(range(832,975,16)): dr.line([x,200,x,680],fill=(214,202,178),width=3)   # gerippte Ärmel
    if not back:
        zip_line(dr,(205,195,175)); text_c(dr,(600,450),'HCR',font(FB,150),(250,247,240))
        dr.polygon([(470,300),(500,270),(530,300),(500,330)],outline=(250,247,240),width=4); text_c(dr,(740,290),'HICORE RIDE',font(FB,24),(250,247,240))
    else: text_c(dr,(600,400),'HCR',font(FB,170),(250,247,240))
def d_patch(im,dr,m,back):
    red=(255,72,30); wh=(248,248,244); grn=(14,74,66); yel=(236,232,30)
    dr.rectangle([0,0,1200,1200],fill=wh)
    if not back:
        dr.rectangle([0,0,600,430],fill=red); dr.rectangle([0,430,600,540],fill=wh); dr.rectangle([0,540,600,800],fill=grn)
        dr.rectangle([600,0,1200,300],fill=wh); dr.rectangle([600,300,1200,800],fill=yel); dr.rectangle([0,0,TORSO[0]-1,700],fill=grn); dr.rectangle([TORSO[1]+1,0,1200,700],fill=yel)
        dr.rectangle([430,150,600,220],fill=red); dr.rectangle([600,150,770,220],fill=grn)
        for y in range(850,1060,80):
            for x in range(400,820,80): dr.ellipse([x-26,y-26,x+26,y+26],fill=(230,30,20))
        zip_line(dr,(200,200,200)); text_c(dr,(730,250),'HICORE RIDE',font(FB,26),(20,20,20))
    else:
        dr.rectangle([0,0,600,1200],fill=yel); dr.rectangle([470,150,600,330],fill=red); dr.rectangle([600,150,1200,560],fill=wh)
        for y in range(240,520,78):
            for x in range(650,1000,78): dr.ellipse([x-27,y-27,x+27,y+27],fill=(230,30,20))
        dr.rectangle([600,560,1200,1000],fill=grn); dr.rectangle([TORSO[1]+1,0,1200,700],fill=grn); dr.rectangle([0,0,TORSO[0]-1,700],fill=yel)
        for y in range(820,1060,80):
            for x in range(400,560,80): dr.ellipse([x-26,y-26,x+26,y+26],fill=(230,30,20))
        text_c(dr,(705,880),'HICORE',font(FB,40),yel)
DES={'navy':d_navy,'berg':d_berg,'sprint':d_sprint,'sand':d_sand,'patch':d_patch}
cfg=json.load(open(D+'cfg.json'))
for k,fn in DES.items():
    f=compose(fn,MF,False); b=compose(fn,MB,True); f.save(D+k+'_f.png'); b.save(D+k+'_b.png')
    t=f.crop((150,120,1050,1080)).resize((96,102)); th=Image.new('RGB',(102,102),(22,27,34)); th.paste(t,(3,0)); th.save(D+'thumb_%s.jpg'%k,quality=85)
    c=json.loads(json.dumps(cfg['eyb'])); c['front_src']=[D+k+'_f.png',None,[255,0,255]]; c['back_src']=[D+k+'_b.png',None,[255,0,255]]; cfg[k]=c
json.dump(cfg,open(D+'cfg.json','w'),indent=1)
m=Image.new('RGB',(1500,600),(255,255,255))
for i,k in enumerate(DES):
    m.paste(Image.open(D+k+'_f.png').resize((300,300)),(i*300,0)); m.paste(Image.open(D+k+'_b.png').resize((300,300)),(i*300,300))
m.save('jer_designs.jpg',quality=85); print('ok')
