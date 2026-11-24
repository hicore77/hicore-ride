# Weitere Tiere + Traktor (gleicher Stil wie props.py): Ente, Huhn, Hahn, Ziege, Pferd, Murmeltier, Traktor
import sys, os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'props.py')).read().split('# ---------------- Gebäude')[0]
exec(src)
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'props/')

def duck():
    reset()
    br=mat('ente_b',srgb('#7a5a3c'),0.8); gr=mat('ente_g',srgb('#1f6b3a'),0.4); wh=mat('ente_w',srgb('#f2efe6'),0.8); bk=mat('schnabel_e',srgb('#e2b23a'),0.5); eye=mat('auge',srgb('#111111'),0.2); gy=mat('ente_gr',srgb('#a9a49a'),0.8)
    uvs('koerper',0.16,(0,0,0.12),gy,scale=(0.75,1.35,0.6))
    uvs('brust',0.1,(0,-0.13,0.15),br,scale=(0.9,0.8,0.8))
    uvs('ruecken',0.12,(0,0.06,0.17),br,scale=(0.6,1.2,0.35))
    uvs('ring',0.055,(0,-0.18,0.24),wh,scale=(1,1,0.35))
    uvs('kopf',0.07,(0,-0.2,0.31),gr,scale=(0.85,1.1,0.95))
    uvs('schnabel',0.04,(0,-0.28,0.29),bk,scale=(0.8,1.4,0.4))
    uvs('schwanz',0.05,(0,0.22,0.17),gy,scale=(0.9,1.1,0.5),rot=(math.radians(-25),0,0))
    for s in (-1,1): sph('auge',0.012,(s*0.045,-0.24,0.33),eye,sub=1)
    export('ente')

def hen(rooster=False):
    reset()
    body=mat('huhn_b',srgb('#b06a2e' if not rooster else '#8a3a1c'),0.9); tail=mat('huhn_t',srgb('#3b2a1c' if not rooster else '#1d3d2a'),0.6); red=mat('kamm',srgb('#d62a1e'),0.6); yl=mat('fuss',srgb('#e8b13c'),0.6); eye=mat('auge',srgb('#111111'),0.2)
    S=1.15 if rooster else 1.0
    uvs('koerper',0.14*S,(0,0,0.2*S),body,scale=(0.75,1.2,0.85))
    uvs('kopf',0.065*S,(0,-0.13*S,0.36*S),body)
    uvs('schwanz',0.09*S,(0,0.15*S,0.3*S),tail,scale=(0.35,0.8,1.3 if rooster else 0.9),rot=(math.radians(-30),0,0))
    cyl('schnabel',0.018,0.05,(0,-0.195*S,0.355*S),yl,rot=(math.pi/2,0,0),verts=5,r2=0.003)
    uvs('kamm',0.03*S,(0,-0.13*S,0.43*S),red,scale=(0.4,1.4 if rooster else 1,1.3 if rooster else 0.8))
    uvs('kehllappen',0.018*S,(0,-0.175*S,0.32*S),red,scale=(0.6,0.8,1.4))
    for s in (-1,1):
        sph('auge',0.01,(s*0.04*S,-0.16*S,0.37*S),eye,sub=1)
        cyl('bein',0.012,0.12*S,(s*0.05,0,0.06*S),yl,verts=5)
        uvs('fluegel',0.08*S,(s*0.09*S,0.01,0.21*S),tail if rooster else body,scale=(0.3,1.1,0.7))
    export('hahn' if rooster else 'huhn')

def goat():
    reset()
    fur=mat('ziege_f',srgb('#e9e2d4'),0.95); dk=mat('ziege_d',srgb('#4b4038'),0.9); horn=mat('horn_z',srgb('#8c7a62'),0.6); eye=mat('auge',srgb('#c9a23a'),0.3)
    uvs('rumpf',0.3,(0,0,0.6),fur,scale=(0.75,1.4,0.78))
    for x in (-0.13,0.13):
        for y in (-0.3,0.3): cyl('bein',0.04,0.42,(x,y,0.21),fur,verts=6,r2=0.032); cyl('huf',0.034,0.05,(x,y,0.025),dk,verts=6)
    cyl('hals',0.09,0.3,(0,-0.42,0.78),fur,rot=(math.radians(-35),0,0),verts=8)
    uvs('kopf',0.11,(0,-0.55,0.92),fur,scale=(0.7,1.3,0.8),rot=(math.radians(20),0,0))
    uvs('maul',0.05,(0,-0.67,0.86),dk,scale=(0.9,1,0.8))
    uvs('bart',0.04,(0,-0.64,0.78),fur,scale=(0.6,0.6,1.8))
    for s in (-1,1):
        cyl('horn',0.025,0.2,(s*0.05,-0.5,1.05),horn,rot=(math.radians(35),s*math.radians(12),0),verts=6,r2=0.006)
        uvs('ohr',0.05,(s*0.11,-0.5,0.95),fur,scale=(1.6,0.4,0.6))
        sph('auge',0.015,(s*0.07,-0.62,0.96),eye,sub=1)
    uvs('schwanz',0.04,(0,0.42,0.75),fur,scale=(0.6,0.6,1.5),rot=(math.radians(-40),0,0))
    export('ziege')

def horse():
    reset()
    coat=mat('pferd_f',srgb('#7a4a26'),0.7); mane=mat('maehne',srgb('#2a1c12'),0.9); wh=mat('blesse',srgb('#efe9df'),0.8); hoof=mat('huf',srgb('#2a2622'),0.7); eye=mat('auge',srgb('#111111'),0.2)
    uvs('rumpf',0.55,(0,0,1.25),coat,scale=(0.62,1.45,0.72),seg=20,rings=12)
    uvs('brust',0.3,(0,-0.62,1.3),coat,scale=(0.8,0.8,1))
    uvs('kruppe',0.32,(0,0.62,1.32),coat,scale=(0.85,0.9,0.9))
    for x in (-0.18,0.18):
        for y in (-0.62,0.66):
            cyl('bein_o',0.085,0.5,(x,y,0.82),coat,verts=8,r2=0.06); cyl('bein_u',0.05,0.55,(x,y,0.33),coat,verts=8); cyl('fessel',0.06,0.08,(x,y,0.09),wh if y>0 else coat,verts=8); cyl('huf',0.065,0.06,(x,y,0.03),hoof,verts=8)
    cyl('hals',0.2,0.8,(0,-0.95,1.75),coat,rot=(math.radians(-40),0,0),verts=12,r2=0.14)
    uvs('kopf',0.16,(0,-1.32,2.0),coat,scale=(0.7,1.9,0.85),rot=(math.radians(40),0,0))
    uvs('blesse',0.06,(0,-1.42,2.0),wh,scale=(0.6,2.2,0.5),rot=(math.radians(40),0,0))
    uvs('maehne',0.1,(0,-0.88,1.95),mane,scale=(0.45,3.4,0.8),rot=(math.radians(-40),0,0))
    for s in (-1,1):
        cyl('ohr',0.035,0.13,(s*0.07,-1.12,2.25),coat,verts=6,r2=0.008)
        sph('auge',0.025,(s*0.1,-1.28,2.08),eye,sub=1)
    cyl('schweif',0.07,0.8,(0,1.05,1.0),mane,rot=(math.radians(18),0,0),verts=8,r2=0.03)
    export('pferd')

def marmot():
    reset()
    fur=mat('murmel_f',srgb('#8a6a48'),0.95); lt=mat('murmel_l',srgb('#c8ad86'),0.95); dk=mat('murmel_d',srgb('#3a2c20'),0.9); eye=mat('auge',srgb('#111111'),0.2)
    # aufrecht stehend (Wache halten)
    uvs('koerper',0.14,(0,0,0.24),fur,scale=(0.95,0.85,1.65))
    uvs('bauch',0.1,(0,-0.06,0.22),lt,scale=(0.95,0.7,1.6))
    uvs('kopf',0.085,(0,-0.02,0.52),fur,scale=(1,1.05,0.9))
    uvs('schnauze',0.045,(0,-0.09,0.5),lt,scale=(1,0.9,0.75))
    sph('nase',0.014,(0,-0.13,0.51),dk,sub=1)
    for s in (-1,1):
        sph('auge',0.012,(s*0.045,-0.08,0.55),eye,sub=1); uvs('ohr',0.022,(s*0.06,0,0.6),dk,scale=(1,0.6,0.8))
        uvs('pfote',0.03,(s*0.06,-0.12,0.33),dk,scale=(0.8,1,1.3)); uvs('fuss',0.045,(s*0.07,-0.04,0.03),dk,scale=(0.9,1.6,0.6))
    uvs('schwanz',0.05,(0,0.14,0.06),dk,scale=(0.8,1.8,0.6))
    export('murmeltier')

def tractor():
    reset()
    grn=mat('trak_g',srgb('#2f7d32'),0.55); yl=mat('trak_y',srgb('#e2c23a'),0.5); blk=mat('reifen',srgb('#1c1c1c'),0.95); gls=mat('glas',srgb('#9fc3d6'),0.15,0.2); met=mat('metall',srgb('#555b60'),0.5,0.6)
    box('motor',(0.9,1.7,0.75),(0,-0.85,1.05),grn,bevel=0.05)
    box('grill',(0.8,0.06,0.6),(0,-1.71,1.05),met)
    box('rumpf',(1.0,1.2,0.5),(0,0.4,0.85),grn,bevel=0.04)
    for z in (1.15,): pass
    # Kabine: Rahmen + Glas
    box('dach',(1.3,1.4,0.08),(0,0.45,2.55),grn,bevel=0.03)
    for x in (-0.6,0.6):
        for y in (-0.2,1.1): box('pfosten',(0.06,0.06,1.4),(x,y,1.85),grn)
    box('glas_v',(1.15,0.02,1.2),(0,-0.2,1.8),gls); box('glas_h',(1.15,0.02,1.2),(0,1.1,1.8),gls)
    for x in (-0.6,0.6): box('glas_s',(0.02,1.25,1.2),(x,0.45,1.8),gls)
    box('sitz',(0.45,0.4,0.15),(0,0.65,1.25),blk)
    cyl('auspuff',0.04,0.9,(0.32,-1.2,1.75),met,verts=8)
    for s in (-1,1):
        cyl('rad_h',0.78,0.48,(s*0.88,0.55,0.78),blk,rot=(0,math.pi/2,0),verts=20); cyl('felge_h',0.42,0.5,(s*0.88,0.55,0.78),yl,rot=(0,math.pi/2,0),verts=14)
        cyl('rad_v',0.46,0.3,(s*0.72,-1.25,0.46),blk,rot=(0,math.pi/2,0),verts=16); cyl('felge_v',0.25,0.32,(s*0.72,-1.25,0.46),yl,rot=(0,math.pi/2,0),verts=12)
        box('kotfluegel',(0.5,1.5,0.06),(s*0.88,0.55,1.6),grn)
        sph('licht',0.07,(s*0.3,-1.73,1.25),yl,sub=1)
    export('traktor')

for fn in (duck, lambda: hen(False), lambda: hen(True), goat, horse, marmot, tractor):
    try: fn()
    except Exception as e: print('FEHLER', e)
