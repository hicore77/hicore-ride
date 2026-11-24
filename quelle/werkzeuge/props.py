# Baut Deko-Objekte für Hicore Ride in Blender (bpy) und exportiert je eine GLB-Datei.
import bpy, bmesh, math, random, os, sys
from mathutils import Vector, Euler

OUT = sys.argv[-1] if sys.argv[-1].endswith('/') else os.path.join(os.path.dirname(__file__), 'props/')
os.makedirs(OUT, exist_ok=True)
random.seed(7)
_mats = {}

def reset():
    _mats.clear()
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, rgb, rough=0.7, metal=0.0, emit=None):
    if name in _mats: return _mats[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = 1.0
    _mats[name] = m; return m

def srgb(h):  # Hex -> lineare Farbe
    h = h.lstrip('#'); c = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    return tuple((x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4) for x in c)

def assign(o, m):
    o.data.materials.clear(); o.data.materials.append(m); return o

def box(name, size, loc, m, rot=(0,0,0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        md = o.modifiers.new('bv', 'BEVEL'); md.width = bevel; md.segments = 2
    return assign(o, m)

def cyl(name, r, h, loc, m, rot=(0,0,0), verts=12, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; o.name = name; return assign(o, m)

def sph(name, r, loc, m, scale=(1,1,1), sub=2, rot=(0,0,0)):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=r, subdivisions=sub, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = scale; bpy.ops.object.transform_apply(scale=True)
    return assign(o, m)

def uvs(name, r, loc, m, scale=(1,1,1), seg=16, rings=10, rot=(0,0,0)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=seg, ring_count=rings, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = scale; bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth(); return assign(o, m)

def prism_roof(name, w, d, h, z, m, overhang=0.35):
    # Satteldach: First entlang X
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    W, D = w/2+overhang, d/2+overhang
    v = [bm.verts.new(p) for p in [(-W,-D,z),(W,-D,z),(W,D,z),(-W,D,z),(-W,0,z+h),(W,0,z+h)]]
    for f in [(0,1,5,4),(2,3,4,5),(0,4,3),(1,2,5),(0,3,2,1)]: bm.faces.new([v[i] for i in f])
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    sol = o.modifiers.new('s', 'SOLIDIFY'); sol.thickness = 0.12
    return assign(o, m)

def displace(o, strength=0.3, scale=0.8, seed=0):
    tex = bpy.data.textures.new('n%d' % seed, 'CLOUDS'); tex.noise_scale = scale
    md = o.modifiers.new('d', 'DISPLACE'); md.texture = tex; md.strength = strength; md.texture_coords = 'OBJECT'
    return o

def flat(o):
    for p in o.data.polygons: p.use_smooth = False

def export(name):
    for o in bpy.context.scene.objects: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=OUT + name + '.glb', export_format='GLB', export_apply=True, export_yup=True, use_selection=False)
    print('exported', name, os.path.getsize(OUT + name + '.glb'))

# ---------------- Gebäude ----------------
def house_cottage():
    reset()
    wall = mat('putz', srgb('#efe7d6'), 0.9); roof = mat('ziegel', srgb('#a8402e'), 0.8); wood = mat('holz', srgb('#6b4a2b'), 0.8)
    glass = mat('glas', srgb('#2b3d4f'), 0.1, 0.3); frame = mat('rahmen', srgb('#ffffff'), 0.6); stone = mat('sockel', srgb('#8c8579'), 0.95)
    box('sockel', (8.2, 6.2, 0.5), (0,0,0.25), stone, bevel=0.03)
    box('wand', (8, 6, 3.2), (0,0,2.1), wall, bevel=0.04)
    # Giebel
    me = bpy.data.meshes.new('giebel'); bm = bmesh.new()
    for sx in (-4, 4):
        a = bm.verts.new((sx,-3,3.7)); b = bm.verts.new((sx,3,3.7)); c = bm.verts.new((sx,0,6.0)); bm.faces.new((a,b,c))
    bm.to_mesh(me); bm.free(); g = bpy.data.objects.new('giebel', me); bpy.context.collection.objects.link(g); assign(g, wall)
    g.modifiers.new('s','SOLIDIFY').thickness = 0.1
    prism_roof('dach', 8, 6, 2.4, 3.65, roof, 0.45)
    box('kamin', (0.6,0.6,1.8), (2.2,1.0,5.6), stone, bevel=0.03)
    box('tuer', (1.0,0.12,2.1), (0,-3.02,1.55), wood, bevel=0.02)
    box('vordach', (1.8,1.0,0.1), (0,-3.4,2.85), roof)
    for x in (-2.6, 2.6):
        box('fenster', (1.1,0.1,1.2), (x,-3.03,2.2), glass); box('rahmen', (1.3,0.08,1.4), (x,-3.0,2.2), frame)
        box('laden_l', (0.35,0.08,1.4), (x-0.85,-3.05,2.2), mat('laden', srgb('#2f6b45'), 0.7)); box('laden_r', (0.35,0.08,1.4), (x+0.85,-3.05,2.2), _mats['laden'])
    for y in (-1.5, 1.5):
        for sx in (-4.03, 4.03):
            box('fs', (0.1,1.1,1.2), (sx,y,2.2), glass)
    # Blumenkasten
    for x in (-2.6, 2.6):
        box('kasten', (1.2,0.3,0.25), (x,-3.2,1.45), wood)
        for i in range(4): sph('blume', 0.12, (x-0.45+i*0.3,-3.2,1.65), mat('blume', srgb('#e2475a'), 0.6), sub=1)
    export('haus_cottage')

def house_beach():
    reset()
    plank = mat('planke', srgb('#5aa9d6'), 0.8); trim = mat('weiss', srgb('#f6f4ef'), 0.6); roof = mat('dach_b', srgb('#e8d9b5'), 0.9)
    wood = mat('holz', srgb('#7a5a3a'), 0.85); glass = mat('glas', srgb('#2b3d4f'), 0.1, 0.3)
    for x in (-2.2, 2.2):
        for y in (-1.8, 1.8): cyl('pfahl', 0.15, 1.2, (x,y,0.6), wood, verts=8)
    box('boden', (5.2,4.4,0.2), (0,0,1.25), wood)
    # Bretterwand
    for i in range(9):
        z = 1.5 + i*0.28
        box('brett', (4.6,3.8,0.26), (0,0,z), plank if i%2==0 else mat('planke2', srgb('#4f9cc8'), 0.8))
    prism_roof('dach', 4.6, 3.8, 1.4, 4.0, roof, 0.4)
    box('tuer', (1.0,0.1,2.0), (0.8,-1.93,2.45), trim)
    box('fenster', (0.9,0.1,0.8), (-1.2,-1.93,2.9), glass); box('rahmen', (1.1,0.08,1.0), (-1.2,-1.91,2.9), trim)
    box('treppe1', (1.2,0.5,0.2), (0.8,-2.5,0.95), wood); box('treppe2', (1.2,0.5,0.2), (0.8,-2.9,0.55), wood); box('treppe3', (1.2,0.5,0.2), (0.8,-3.3,0.15), wood)
    # Surfbrett an der Wand
    sph('surf', 1.0, (-2.45,0,2.5), mat('surf', srgb('#ff7a1a'), 0.4), scale=(0.08,0.28,1.0), sub=2)
    export('haus_strand')

def house_chalet():
    reset()
    wood = mat('balken', srgb('#7b5130'), 0.85); dark = mat('dunkel', srgb('#4a2f1c'), 0.85); stone = mat('stein', srgb('#9a958b'), 0.95)
    roof = mat('schindel', srgb('#3d3a38'), 0.8); glass = mat('glas', srgb('#2b3d4f'), 0.1, 0.3); flower = mat('geranie', srgb('#d8283a'), 0.6)
    box('erdg', (9,7,2.6), (0,0,1.3), stone, bevel=0.05)
    box('og', (9,7,2.6), (0,0,3.9), wood, bevel=0.03)
    for i in range(8): box('fuge', (9.04,7.04,0.04), (0,0,2.75+i*0.33), dark)
    me = bpy.data.meshes.new('giebel'); bm = bmesh.new()
    for sx in (-4.5, 4.5):
        a = bm.verts.new((sx,-3.5,5.2)); b = bm.verts.new((sx,3.5,5.2)); c = bm.verts.new((sx,0,7.0)); bm.faces.new((a,b,c))
    bm.to_mesh(me); bm.free(); g = bpy.data.objects.new('giebel', me); bpy.context.collection.objects.link(g); assign(g, wood); g.modifiers.new('s','SOLIDIFY').thickness=0.1
    prism_roof('dach', 9, 7, 1.9, 5.15, roof, 1.1)
    # Balkon mit Geländer und Blumen
    box('balkon', (9.6,1.4,0.15), (0,-4.2,3.0), dark)
    for i in range(25): box('stab', (0.08,0.08,0.9), (-4.7+i*0.39,-4.85,3.5), wood)
    box('handlauf', (9.6,0.12,0.1), (0,-4.85,3.98), dark)
    for i in range(12): sph('blume', 0.18, (-4.4+i*0.8,-4.9,4.15), flower, sub=1)
    for x in (-3, 0, 3):
        box('fenster', (1.2,0.1,1.2), (x,-3.53,4.0), glass); box('laden', (0.4,0.08,1.3), (x-0.85,-3.55,4.0), mat('laden', srgb('#2f5a3a'), 0.7)); box('laden2', (0.4,0.08,1.3), (x+0.85,-3.55,4.0), _mats['laden'])
    box('tuer', (1.2,0.12,2.2), (0,-3.53,1.1), dark)
    # Holzstapel
    for i in range(3):
        for j in range(6): cyl('scheit', 0.12, 1.2, (3.5-j*0.26, -4.0, 0.15+i*0.24), mat('scheit', srgb('#a57a4a'), 0.9), rot=(math.pi/2,0,0), verts=8)
    export('haus_chalet')

# ---------------- Straßenmöbel ----------------
def bench():
    reset()
    wood = mat('holz_b', srgb('#9a6a3e'), 0.75); metal = mat('guss', srgb('#2a2d31'), 0.4, 0.8)
    for i in range(4): box('sitz', (1.8,0.11,0.04), (0, -0.18+i*0.12, 0.46), wood, bevel=0.01)
    for i in range(3): box('lehne', (1.8,0.04,0.1), (0, 0.27, 0.62+i*0.13), wood, rot=(math.radians(-12),0,0), bevel=0.01)
    for x in (-0.75, 0.75):
        box('bein_v', (0.06,0.06,0.46), (x,-0.2,0.23), metal); box('bein_h', (0.06,0.06,0.95), (x,0.27,0.48), metal, rot=(math.radians(-12),0,0))
        box('arm', (0.06,0.5,0.05), (x,0.02,0.68), metal)
    export('bank')

def fence():
    reset()
    wood = mat('zaun', srgb('#8a6440'), 0.9)
    for x in (-1.5, 1.5):
        cyl('pfosten', 0.07, 1.2, (x,0,0.6), wood, verts=7); cyl('kappe', 0.075, 0.12, (x,0,1.25), wood, verts=7, r2=0.01)
    for z in (0.45, 0.95): box('latte', (3.1,0.05,0.14), (0,0,z), wood, rot=(0, math.radians(random.uniform(-2,2)), 0))
    export('zaun')

def sign_climb():
    reset()
    metal = mat('pfosten', srgb('#9aa0a6'), 0.35, 0.8); red = mat('rot', srgb('#c8202a'), 0.5); white = mat('weiss', srgb('#f4f4f4'), 0.5); black = mat('schwarz', srgb('#111111'), 0.6)
    cyl('pfahl', 0.04, 2.4, (0,0,1.2), metal, verts=10)
    # Dreieck (Steigung)
    for r, m, off in ((0.55, red, 0.0), (0.42, white, -0.015)):
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=0.03, vertices=3, location=(0, off-0.05, 2.2), rotation=(math.pi/2, 0, math.pi/2))
        o = bpy.context.object; assign(o, m); o.rotation_euler = (math.pi/2, math.radians(90), 0)
    # Steigungskeil
    me = bpy.data.meshes.new('keil'); bm = bmesh.new()
    a = bm.verts.new((-0.22,-0.085,2.05)); b = bm.verts.new((0.22,-0.085,2.05)); c = bm.verts.new((0.22,-0.085,2.27)); bm.faces.new((a,b,c)); bm.to_mesh(me); bm.free()
    k = bpy.data.objects.new('keil', me); bpy.context.collection.objects.link(k); assign(k, black)
    export('schild_steigung')

def sign_wood():
    reset()
    wood = mat('holz_s', srgb('#8b5e34'), 0.85); light = mat('hell', srgb('#e9d6b0'), 0.8)
    cyl('pfahl', 0.07, 2.2, (0,0,1.1), wood, verts=8)
    for i, (z, ang) in enumerate(((1.9, 8), (1.55, -10))):
        o = box('brett', (1.1,0.06,0.26), (0.35 if i == 0 else -0.35, -0.05, z), light, rot=(0,0,math.radians(ang)), bevel=0.01)
        sph('spitze', 0.13, (0.92 if i == 0 else -0.92, -0.05, z), light, scale=(1,0.25,1), sub=1)
    export('schild_holz')

def hay_bale():
    reset()
    hay = mat('heu', srgb('#d6b65f'), 0.95)
    o = cyl('ballen', 0.75, 1.2, (0,0,0.75), hay, rot=(0, math.pi/2, 0), verts=20)
    md = o.modifiers.new('b','BEVEL'); md.width = 0.12; md.segments = 3
    displace(o, 0.04, 0.15, 3)
    export('heuballen')

def mailbox():
    reset()
    post = mat('holz_m', srgb('#6b4a2b'), 0.85); red = mat('rot', srgb('#c8202a'), 0.45, 0.2)
    box('pfosten', (0.1,0.1,1.1), (0,0,0.55), post)
    o = cyl('kasten', 0.16, 0.5, (0,0,1.2), red, rot=(math.pi/2,0,0), verts=16); box('boden', (0.32,0.5,0.16), (0,0,1.12), red)
    box('flagge', (0.02,0.12,0.18), (0.17,0.1,1.32), mat('gelb', srgb('#f2c63a'), 0.5))
    export('briefkasten')

# ---------------- Natur ----------------
def rocks():
    for n in range(3):
        reset()
        stone = mat('fels', srgb(['#8e8a82', '#7f7a70', '#9a958a'][n]), 0.95)
        o = sph('fels', 1.0, (0,0,0.4), stone, scale=(1.3, 1.0, 0.75), sub=3)
        displace(o, 0.45, 0.9, n)
        o.modifiers.new('dec', 'DECIMATE').ratio = 0.35
        moss = mat('moos', srgb('#5a7a3a'), 0.95)
        export('fels_%d' % (n+1))

def oak():
    reset()
    bark = mat('rinde', srgb('#5b4129'), 0.95); leaf = mat('laub', srgb('#4f8a37'), 0.85); leaf2 = mat('laub2', srgb('#3f7a2f'), 0.85)
    cyl('stamm', 0.35, 3.0, (0,0,1.5), bark, verts=9, r2=0.25)
    for ang in (30, 150, 270):
        a = math.radians(ang); cyl('ast', 0.12, 1.6, (math.cos(a)*0.5, math.sin(a)*0.5, 3.3), bark, rot=(math.cos(a+math.pi/2)*0.7, math.sin(a+math.pi/2)*0.7, 0), verts=6, r2=0.06)
    for i in range(7):
        a = random.uniform(0, 6.28); r = random.uniform(0.4, 1.4)
        o = sph('krone', random.uniform(1.2, 1.7), (math.cos(a)*r, math.sin(a)*r, 4.3+random.uniform(-0.4, 1.0)), leaf if i % 2 else leaf2, sub=2)
        displace(o, 0.35, 0.6, 10+i); flat(o)
    export('baum_eiche')

def birch():
    reset()
    bark = mat('birke', srgb('#e8e4dc'), 0.8); dark = mat('birke_d', srgb('#2a2622'), 0.9); leaf = mat('laub_b', srgb('#8fbf4a'), 0.85)
    cyl('stamm', 0.14, 6.0, (0,0,3.0), bark, verts=8, r2=0.08)
    for i in range(10): box('fleck', (0.1, 0.02, 0.05), (math.cos(i)*0.13, math.sin(i)*0.13, 0.6+i*0.5), dark, rot=(0,0,i))
    for i in range(6):
        o = sph('krone', random.uniform(0.8, 1.1), (random.uniform(-0.6,0.6), random.uniform(-0.6,0.6), 4.2+i*0.45), leaf, scale=(1,1,1.3), sub=2)
        displace(o, 0.25, 0.5, 20+i); flat(o)
    export('baum_birke')

def pine():
    reset()
    bark = mat('rinde_k', srgb('#4e3523'), 0.95); needle = mat('nadel', srgb('#2c5a32'), 0.85)
    cyl('stamm', 0.22, 2.0, (0,0,1.0), bark, verts=8, r2=0.18)
    for i in range(5):
        r = 2.0 - i*0.35; z = 2.0 + i*1.15
        o = cyl('ebene', r, 1.8, (0,0,z), needle, verts=9, r2=0.05)
        displace(o, 0.18, 0.4, 30+i); flat(o)
    export('baum_kiefer')

def bush_flowers():
    reset()
    leaf = mat('busch', srgb('#3f7d34'), 0.85)
    for i in range(4):
        o = sph('busch', random.uniform(0.5,0.8), (random.uniform(-0.6,0.6), random.uniform(-0.4,0.4), 0.45), leaf, sub=2); displace(o, 0.15, 0.4, 40+i); flat(o)
    cols = ['#f2c63a', '#e2475a', '#ffffff', '#9b59d0']
    for i in range(14):
        sph('bluete', 0.09, (random.uniform(-0.9,0.9), random.uniform(-0.6,0.6), random.uniform(0.6,1.1)), mat('b%d' % (i % 4), srgb(cols[i % 4]), 0.6), sub=1)
    export('busch_blumen')

# ---------------- Tiere (stilisiert) ----------------
def rabbit():
    reset()
    fur = mat('fell', srgb('#9a7b5c'), 0.95); light = mat('bauch', srgb('#e8dccb'), 0.95); pink = mat('ohr_innen', srgb('#e2a39a'), 0.8); eye = mat('auge', srgb('#111111'), 0.1)
    uvs('koerper', 0.18, (0,0,0.17), fur, scale=(0.85,1.25,0.9))
    uvs('bauch', 0.13, (0,-0.06,0.13), light, scale=(0.8,1.1,0.8))
    uvs('kopf', 0.11, (0,-0.2,0.31), fur, scale=(0.9,1.1,0.95))
    uvs('schnauze', 0.05, (0,-0.3,0.29), light, scale=(1,0.8,0.8))
    sph('nase', 0.015, (0,-0.345,0.3), pink, sub=1)
    for s in (-1, 1):
        uvs('ohr', 0.05, (s*0.04,-0.17,0.48), fur, scale=(0.55,0.3,2.2), rot=(math.radians(-15), s*math.radians(10), 0))
        uvs('ohr_i', 0.04, (s*0.04,-0.185,0.48), pink, scale=(0.45,0.15,1.9), rot=(math.radians(-15), s*math.radians(10), 0))
        sph('auge', 0.018, (s*0.07,-0.27,0.34), eye, sub=2)
        uvs('hinterlauf', 0.08, (s*0.11,0.08,0.08), fur, scale=(0.6,1.5,0.8))
        uvs('vorderpfote', 0.035, (s*0.06,-0.16,0.03), light, scale=(0.8,1.4,0.7))
    uvs('schwanz', 0.06, (0,0.24,0.2), light)
    export('hase')

def cow():
    reset()
    white = mat('kuh_w', srgb('#f2efe8'), 0.9); black = mat('kuh_s', srgb('#1d1b19'), 0.9); pink = mat('maul', srgb('#e6a9a0'), 0.8); horn = mat('horn', srgb('#e8dcc0'), 0.6); hoof = mat('huf', srgb('#2a2622'), 0.7)
    o = uvs('rumpf', 0.6, (0,0,1.05), white, scale=(0.75,1.45,0.75), seg=20, rings=12)
    for (x,y,z,s) in ((0.38,0.3,1.2,0.35),(-0.4,-0.4,1.05,0.3),(0.2,-0.6,1.3,0.25),(-0.3,0.6,1.25,0.3)):
        uvs('fleck', s, (x,y,z), black, scale=(0.5,1.0,0.8))
    for x in (-0.28, 0.28):
        for y in (-0.6, 0.6):
            cyl('bein', 0.09, 0.75, (x,y,0.38), white, verts=8, r2=0.07); cyl('huf', 0.075, 0.1, (x,y,0.05), hoof, verts=8)
    uvs('kopf', 0.25, (0,-1.05,1.3), white, scale=(0.75,1.1,0.85))
    uvs('maul', 0.16, (0,-1.32,1.18), pink, scale=(1,0.8,0.8))
    uvs('fleck_k', 0.12, (0.1,-1.0,1.45), black, scale=(1,1,0.6))
    for s in (-1, 1):
        cyl('horn', 0.035, 0.22, (s*0.16,-0.98,1.55), horn, rot=(0, s*math.radians(60), 0), verts=6, r2=0.01)
        uvs('ohr', 0.07, (s*0.24,-0.98,1.4), white, scale=(1.4,0.4,0.7))
        sph('auge', 0.03, (s*0.15,-1.22,1.38), black, sub=1)
    cyl('schwanz', 0.025, 0.7, (0,0.88,0.95), white, rot=(math.radians(15),0,0), verts=6); uvs('quaste', 0.06, (0,0.95,0.6), black)
    uvs('euter', 0.13, (0,0.35,0.52), pink, scale=(1,1.2,0.7))
    export('kuh')

def sheep():
    reset()
    wool = mat('wolle', srgb('#f1ece2'), 1.0); face = mat('gesicht', srgb('#26221f'), 0.9); eye = mat('auge', srgb('#e8d070'), 0.3)
    for i in range(14):
        a = random.uniform(0, 6.28); sph('wolle', random.uniform(0.22,0.3), (math.cos(a)*0.22, random.uniform(-0.4,0.4), 0.75+math.sin(a)*0.15), wool, sub=2)
    uvs('kern', 0.35, (0,0,0.75), wool, scale=(0.9,1.4,0.85))
    for x in (-0.16, 0.16):
        for y in (-0.32, 0.32): cyl('bein', 0.045, 0.55, (x,y,0.28), face, verts=6)
    uvs('kopf', 0.15, (0,-0.6,0.95), face, scale=(0.75,1.2,0.85))
    sph('stirnwolle', 0.12, (0,-0.53,1.08), wool, sub=2)
    for s in (-1, 1):
        uvs('ohr', 0.05, (s*0.15,-0.55,0.98), face, scale=(1.8,0.4,0.6)); sph('auge', 0.02, (s*0.08,-0.7,1.0), eye, sub=1)
    export('schaf')

def seagull():
    reset()
    white = mat('moewe_w', srgb('#f4f4f2'), 0.7); grey = mat('moewe_g', srgb('#9aa3ab'), 0.7); beak = mat('schnabel', srgb('#f2b632'), 0.5); eye = mat('auge', srgb('#111111'), 0.2)
    uvs('koerper', 0.12, (0,0,0.2), white, scale=(0.8,1.6,0.8))
    uvs('kopf', 0.07, (0,-0.18,0.3), white)
    cyl('schnabel', 0.018, 0.08, (0,-0.27,0.29), beak, rot=(math.pi/2,0,0), verts=6, r2=0.004)
    for s in (-1, 1):
        uvs('fluegel', 0.1, (s*0.09,0.03,0.24), grey, scale=(0.3,1.6,0.5)); sph('auge', 0.012, (s*0.04,-0.22,0.32), eye, sub=1)
        cyl('bein', 0.008, 0.12, (s*0.03,0,0.06), beak, verts=5)
    uvs('schwanz', 0.06, (0,0.2,0.22), grey, scale=(0.8,1.2,0.3))
    export('moewe')

for fn in (house_cottage, house_beach, house_chalet, bench, fence, sign_climb, sign_wood, hay_bale, mailbox, rocks, oak, birch, pine, bush_flowers, rabbit, cow, sheep, seagull):
    try: fn()
    except Exception as e: print('FEHLER', fn.__name__, e)
