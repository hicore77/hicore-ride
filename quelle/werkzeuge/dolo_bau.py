# Dolomiten-Welt (0.25.0): baut alle Weltdaten aus echten Daten.
# Eingaben (Ordner SRC, Standard /home/user/dolo):
#   osmc.json        OSM-Auszug (Overpass über die Higgsfield-Sandbox, kompakt: ['w',id,tags,[[lat,lon],..]], ['n',id,lat,lon,tags], ['r',..])
#   dem_011.tif, dem_012.tif   Copernicus GLO-30 N46 E011/E012 (copernicus-dem-30m S3)
#   wc_N45E009.tif, wc_N45E012.tif   ESA WorldCover 2021 10 m
#   s0919.tif        Sentinel-2 L2A TCI 32TQS 2025-09-19 (sentinel-cogs S3), wolkenfrei
# Ausgabe: quelle/dolo/ (net.json, side.bin, bld.b64, res.json, lc.png, sat_near.jpg, sat_far.jpg, meta.json)
import json, math, struct, base64, os, sys, heapq
import numpy as np
from collections import defaultdict
from PIL import Image
import tifffile
from scipy import ndimage

SRC = sys.argv[1] if len(sys.argv) > 1 else '/home/user/dolo'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dolo')
os.makedirs(OUT, exist_ok=True)
LAT0, LON0, Y0 = 46.49, 12.06, 1200.0
KX = 111320 * math.cos(math.radians(LAT0)); KY = 111320
def xy(la, lo): return ((lo - LON0) * KX, -(la - LAT0) * KY)
def ll(x, z): return (LAT0 - z / KY, LON0 + x / KX)

# ---------------- Höhenmodell ----------------
print('DEM laden')
DT = {}
for e in (11, 12):
    DT[e] = tifffile.imread(os.path.join(SRC, 'dem_%03d.tif' % e)).astype(np.float32)   # 3600x3600, Ursprung lon e, lat 47
def dem_ll(la, lo):
    la = np.asarray(la, np.float64); lo = np.asarray(lo, np.float64); out = np.zeros(np.broadcast(la, lo).shape, np.float32)
    for e, A in DT.items():
        m = (lo >= e) & (lo < e + 1)
        if not m.any(): continue
        fx = (lo[m] - e) * 3600 - 0.5; fy = (47 - la[m]) * 3600 - 0.5
        out[m] = ndimage.map_coordinates(A, [fy, fx], order=1, mode='nearest')
    return out
GC = 25.0; GX0, GZ0 = -21000.0, -16000.0; GNX, GNZ = 1681, 1201
gx = GX0 + np.arange(GNX) * GC; gz = GZ0 + np.arange(GNZ) * GC
X, Z = np.meshgrid(gx, gz); LA, LO = ll(X, Z)
H = dem_ll(LA, LO)
print('DEM', H.shape, H.min(), H.max())

# ---------------- WorldCover ----------------
print('WorldCover laden')
WC = {9: tifffile.TiffFile(os.path.join(SRC, 'wc_N45E009.tif')), 12: tifffile.TiffFile(os.path.join(SRC, 'wc_N45E012.tif'))}
def wc_crop(la0, la1, lo0, lo1):
    """liefert Klassenraster (lat absteigend) für den Ausschnitt, 1/12000 Grad"""
    r0 = int((48 - la1) * 12000); r1 = int((48 - la0) * 12000) + 1
    parts = []
    for e in (9, 12):
        c0 = int((lo0 - e) * 12000); c1 = int((lo1 - e) * 12000) + 1
        c0 = max(0, c0); c1 = min(36000, c1)
        if c1 <= c0: continue
        a = WC[e].pages[0].asarray()[r0:r1, c0:c1] if False else None
        parts.append((e, c0, c1))
    return r0, r1, parts
WCA = {}
la_min, la_max = LAT0 - 15000 / KY, LAT0 + 17000 / KY
lo_min, lo_max = LON0 - 22000 / KX, LON0 + 23000 / KX
r0 = int((48 - la_max) * 12000); r1 = int((48 - la_min) * 12000) + 1
for e in (9, 12):
    c0 = max(0, int((lo_min - e) * 12000)); c1 = min(36000, int((lo_max - e) * 12000) + 1)
    if c1 > c0:
        A = WC[e].pages[0].asarray(); WCA[e] = (c0, A[r0:r1, c0:c1].copy()); del A
def wc_at(la, lo):
    la = np.asarray(la); lo = np.asarray(lo); out = np.zeros(la.shape, np.uint8)
    for e, (c0, A) in WCA.items():
        m = (lo >= e) & (lo < e + 3)
        r = np.clip(((48 - la[m]) * 12000).astype(int) - r0, 0, A.shape[0] - 1); c = np.clip(((lo[m] - e) * 12000).astype(int) - c0, 0, A.shape[1] - 1)
        out[m] = A[r, c]
    return out
# Kronendach aus dem Oberflächenmodell herausrechnen (Copernicus ist ein DSM): Waldanteil je 25-m-Zelle
tf = np.zeros(H.shape, np.float32)
for oy in (-0.3, 0.0, 0.3):
    for ox in (-0.3, 0.0, 0.3):
        la2, lo2 = ll(X + ox * GC, Z + oy * GC); tf += (wc_at(la2, lo2) == 10)
tf /= 9; tf = ndimage.gaussian_filter(tf, 1.5)
H = H - 11.0 * tf
H = ndimage.gaussian_filter(H, 0.6)
def demxz(x, z):
    sc = np.ndim(x) == 0; x = np.atleast_1d(np.asarray(x, np.float64)); z = np.atleast_1d(np.asarray(z, np.float64))
    fx = (x - GX0) / GC; fz = (z - GZ0) / GC
    r = ndimage.map_coordinates(H, [fz.ravel(), fx.ravel()], order=1, mode='nearest').reshape(x.shape)
    return float(r[0]) if sc else r

# ---------------- OSM ----------------
print('OSM laden')
O = json.load(open(os.path.join(SRC, 'osmc.json')))
W = {o[1]: o for o in O if o[0] == 'w'}
NODES = [o for o in O if o[0] == 'n']
HW = [o for o in W.values() if 'highway' in o[2]]
MAIN_REFS = None
# Hauptstraßen der Runde: Wegpunkte, kürzester Weg über primary/secondary
MOT = {'primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link'}
G = defaultdict(list)
for o in HW:
    if o[2]['highway'] not in MOT: continue
    g = o[3]
    for a, b in zip(g, g[1:]):
        ka, kb = tuple(a), tuple(b); d = math.dist(xy(*a), xy(*b)); G[ka].append((kb, d, o[1])); G[kb].append((ka, d, o[1]))
def near(la, lo):
    p = xy(la, lo); return min(G, key=lambda k: math.dist(xy(*k), p))
def dj(s, t):
    D = {s: 0}; pr = {}; h = [(0, s)]
    while h:
        d, u = heapq.heappop(h)
        if u == t: break
        if d > D[u]: continue
        for v, w, wid in G[u]:
            nd = d + w
            if nd < D.get(v, 1e18): D[v] = nd; pr[v] = (u, wid); heapq.heappush(h, (nd, v))
    p = [t]; ids = []
    while p[-1] != s: u, wid = pr[p[-1]]; ids.append(wid); p.append(u)
    return p[::-1], ids[::-1]
def path(wps):
    ks = [near(la, lo) for la, lo in wps]; P = []; ids = []
    for i in range(len(ks) - 1):
        p, w = dj(ks[i], ks[i + 1]); P += p if not P else p[1:]; ids += w
    return P, ids
# Knoten: Cortina (Ende, Corso Italia), Pocol (Abzweig SP638), Passo Giau, Andraz (SR203/SR48)
def junction(refA, refB):
    A = set(); B = set()
    for o in HW:
        r = o[2].get('ref', '')
        if r == refA: A |= {tuple(p) for p in o[3]}
        if r == refB: B |= {tuple(p) for p in o[3]}
    return sorted(A & B)
J_POCOL = [p for p in junction('SR48', 'SP638')]; print('Pocol', J_POCOL)
J_ANDRAZ = [p for p in junction('SR48', 'SR203')]; print('Andraz', J_ANDRAZ)
J_POCOL = min(J_POCOL, key=lambda p: math.dist(p, (46.5275, 12.1028)))
J_ANDRAZ = min(J_ANDRAZ, key=lambda p: math.dist(p, (46.4836, 11.984)))
CORT = (46.5383, 12.1374); GIAU = (46.4830, 12.0535); SELVA_J = (46.456273, 12.031593); COLLE = (46.4500, 12.0140); FALZ = (46.5192, 12.0094)
E_DEF = [  # (Name, Klasse, Breite, Wegpunkte)
    ('SR48|Cortina – Pocol', 1, 6.6, [CORT, J_POCOL]),
    ('SP638|Passo Giau', 2, 5.8, [J_POCOL, GIAU]),
    ('SP638|Passo Giau – Selva – Caprile', 2, 6.0, [GIAU, SELVA_J, COLLE, J_ANDRAZ]),
    ('SR48|Passo Falzarego', 1, 6.6, [J_ANDRAZ, FALZ, J_POCOL]),
]
MAIN_IDS = set(); EDGES = []
for nm, c, w, wps in E_DEF:
    P, ids = path(wps); MAIN_IDS |= set(ids)
    EDGES.append({'nm': nm, 'c': c, 'w': w, 'P': [xy(*p) for p in P], 'ids': ids})
    print(nm, round(sum(math.dist(a, b) for a, b in zip(EDGES[-1]['P'], EDGES[-1]['P'][1:])) / 1000, 2), 'km')
# Straßenbreite aus OSM, falls angegeben
def resample(P, step):
    out = [P[0]]; acc = 0
    for a, b in zip(P, P[1:]):
        L = math.dist(a, b)
        if L < 1e-6: continue
        t = step - acc
        while t <= L: out.append((a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L)); t += step
        acc = L - (t - step)
    if math.dist(out[-1], P[-1]) > 0.5: out.append(P[-1])
    else: out[-1] = P[-1]
    return out
def smooth1(h, r):
    k = np.exp(-0.5 * (np.arange(-3 * r, 3 * r + 1) / r) ** 2); k /= k.sum()
    return np.convolve(np.pad(h, 3 * r, mode='edge'), k, 'valid')
STEP = 5.0; MAXG = 0.155
# leichtes Glätten der Linie (OSM-Knicke), Haarnadeln bleiben
for e in EDGES:
    P = np.array(resample(e['P'], 2.5))
    for _ in range(2):
        Q = P.copy(); Q[1:-1] = (P[:-2] + 2 * P[1:-1] + P[2:]) / 4; P = Q
    e['P'] = resample([tuple(p) for p in P], STEP)
# Knotenhöhen gemeinsam
nodes = {}
def nk(p): return (round(p[0], 1), round(p[1], 1))
for e in EDGES:
    for p in (e['P'][0], e['P'][-1]):
        k = nk(p)
        if k not in nodes: nodes[k] = {'x': p[0], 'z': p[1], 'y': float(demxz(p[0], p[1]))}
for e in EDGES:
    P = e['P']; h = demxz([p[0] for p in P], [p[1] for p in P]).astype(np.float64)
    h = smooth1(h, 6)
    ya, yb = nodes[nk(P[0])]['y'], nodes[nk(P[-1])]['y']; n = len(h)
    h = h + (ya - h[0]) * (1 - np.arange(n) / (n - 1)) + (yb - h[-1]) * (np.arange(n) / (n - 1))
    for it in range(60):
        g = np.diff(h) / STEP
        if np.abs(g).max() <= MAXG: break
        h2 = smooth1(h, 4); bad = np.zeros(n, bool)
        for q in np.where(np.abs(g) > MAXG)[0]: bad[max(1, q - 5):min(n - 1, q + 7)] = True
        h = np.where(bad, h2, h); h[0], h[-1] = ya, yb
    e['H'] = h
    print(e['nm'], 'max', round(float(np.abs(np.diff(h)).max() / STEP * 100), 1), '%', 'hm', round(float(np.clip(np.diff(h), 0, None).sum())), 'min', round(h.min()), 'max', round(h.max()))
NK = list(nodes); NI = {k: i for i, k in enumerate(NK)}
def encp(P, Hh):
    out = []; px, pz = round(P[0][0] * 4), round(P[0][1] * 4); py = 0
    for (x, z), y in zip(P, Hh):
        ix, iz, iy = round(x * 4), round(z * 4), round((y - Y0) * 10); out += [ix - px, iz - pz, iy - py]; px, pz, py = ix, iz, iy
    return base64.b64encode(struct.pack('<%dh' % len(out), *out)).decode()
xs = [p[0] for e in EDGES for p in e['P']]; zs = [p[1] for e in EDGES for p in e['P']]
REG = [math.floor(min(xs)) - 50, math.floor(min(zs)) - 50, math.ceil(max(xs)) + 50, math.ceil(max(zs)) + 50]
print('REG', REG)
net = {'lat0': LAT0, 'lon0': LON0, 'Y0': Y0, 'reg': REG,
       'nodes': [[round(nodes[k]['x'], 2), round(nodes[k]['z'], 2), round(nodes[k]['y'] - Y0, 2)] for k in NK],
       'edges': [[NI[nk(e['P'][0])], NI[nk(e['P'][-1])], e['c'], e['nm'], round(sum(math.dist(a, b) for a, b in zip(e['P'], e['P'][1:])), 1), encp(e['P'], e['H']), e['w'], round(e['P'][0][0] * 4), round(e['P'][0][1] * 4)] for e in EDGES]}
# Runde = Pocol-Schleife (Giau, Selva, Caprile, Falzarego); Cortina ist Startpunkt (Spiel: zgApplyStart)
net['loop'] = [[1, 0], [2, 0], [3, 0]]
# Orte, Gipfel
pois = []
for o in NODES:
    t = o[4]; x, z = xy(o[2], o[3])
    if t.get('place') in ('town', 'village', 'hamlet') and REG[0] - 2000 < x < REG[2] + 2000 and REG[1] - 2000 < z < REG[3] + 2000:
        nm = t.get('name:it') or t.get('name') or ''
        if ' - ' in nm: nm = nm.split(' - ')[-1]
        pois.append([t['place'], nm, '', round(x, 1), round(z, 1)])
net['pois'] = pois
peaks = []
for o in NODES:
    t = o[4]
    if t.get('natural') == 'peak' and t.get('name'):
        x, z = xy(o[2], o[3]); ele = t.get('ele', '')
        try: ele = float(str(ele).replace(',', '.').split()[0])
        except Exception: ele = float(demxz(x, z))
        peaks.append([t.get('name'), round(x), round(z), round(ele)])
        if -16000 < x < 18000 and -14000 < z < 13000 and (ele >= 2550 or (ele >= 2150 and -7000 < x < 7000 and -7000 < z < 6000)) and not t.get('name', '').startswith('Quota'): pois.append(['peak', t.get('name').split(' - ')[0], str(round(ele)), round(x, 1), round(z, 1)])
# Gelände-Raster: als int16-Deltas in dm (y = Höhe - Y0)
q = np.round((H - Y0) * 10).astype(np.int64); d = np.diff(np.concatenate([np.zeros((GNZ, 1), np.int64), q], axis=1), axis=1)
assert np.abs(d).max() < 32767
net['dem'] = {'x0': GX0, 'z0': GZ0, 'cell': GC, 'nx': GNX, 'nz': GNZ, 'd': base64.b64encode(d.astype('<i2').tobytes()).decode()}
json.dump(net, open(os.path.join(OUT, 'net.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print('net.json', os.path.getsize(os.path.join(OUT, 'net.json')) // 1024, 'KB')

# ---------------- Nebenstraßen (nur sichtbar) ----------------
SIDEC = {'motorway': 0, 'trunk': 0, 'primary': 1, 'secondary': 2, 'tertiary': 3, 'unclassified': 4, 'residential': 4, 'living_street': 5, 'service': 6,
         'primary_link': 2, 'secondary_link': 3, 'tertiary_link': 3, 'track': 7, 'path': 9, 'footway': 9, 'cycleway': 9, 'pedestrian': 5, 'bridleway': 9}
SIDEW = {0: 7.5, 1: 6.6, 2: 6.0, 3: 5.4, 4: 4.6, 5: 4.0, 6: 3.4, 7: 2.8, 9: 1.5}
side = []
for o in HW:
    t = o[2]; c = SIDEC.get(t['highway'])
    if c is None or o[1] in MAIN_IDS or len(o[3]) < 2: continue
    if t.get('tunnel') in ('yes', 'building_passage'): continue
    P = [xy(*p) for p in o[3]]
    if not any(-12000 < x < 12000 and -11000 < z < 11000 for x, z in P): continue
    try: w = float(str(t.get('width', '')).replace(',', '.').split()[0])
    except Exception: w = SIDEW[c]
    w = max(1.2, min(9, w))
    sfc = t.get('surface', '')
    if c == 7 or c == 9: sf = 0 if sfc in ('asphalt', 'paved', 'concrete') else 2
    else: sf = 1 if sfc in ('paving_stones', 'sett', 'cobblestone') else 2 if sfc in ('gravel', 'fine_gravel', 'compacted', 'unpaved', 'ground', 'dirt') else 0
    fl = 8 if t.get('bridge') == 'yes' else 0
    side.append((c, w, sf, fl, P))
buf = bytearray(struct.pack('<I', len(side)))
for c, w, sf, fl, P in side:
    buf += struct.pack('<BBBBH', c, int(round(w * 10)), sf, fl, len(P)); px = pz = 0
    for x, z in P:
        ix, iz = round(x * 2), round(z * 2); buf += struct.pack('<hh', ix - px, iz - pz); px, pz = ix, iz
open(os.path.join(OUT, 'side.bin'), 'wb').write(bytes(buf)); print('side', len(side), len(buf) // 1024, 'KB')

# ---------------- Gebäude ----------------
def area(P): return abs(sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in range(len(P)))) / 2
bl = []; nb = 0
for o in W.values():
    t = o[2]
    if 'building' not in t or len(o[3]) < 4: continue
    P = [xy(*p) for p in o[3]]
    if P[0] == P[-1] or math.dist(P[0], P[-1]) < 0.01: P = P[:-1]
    if len(P) < 3 or len(P) > 200: continue
    cx = sum(p[0] for p in P) / len(P); cz = sum(p[1] for p in P) / len(P)
    if not (-14000 < cx < 14000 and -12000 < cz < 12000): continue
    A = area(P)
    if A < 6: continue
    b = t.get('building'); am = t.get('amenity'); tour = t.get('tourism')
    k = 4 if (b in ('church', 'chapel') or am == 'place_of_worship') and A > 40 else \
        7 if b in ('hut', 'cabin', 'shed', 'barn', 'farm_auxiliary', 'stable', 'cowshed', 'hay') and A < 160 else \
        6 if tour in ('alpine_hut', 'wilderness_hut') or am == 'restaurant' and A < 600 else \
        1 if A < 28 or b in ('garage', 'garages', 'carport', 'roof') else \
        2 if b in ('apartments', 'hotel', 'commercial', 'retail', 'industrial', 'school', 'office', 'public') or A > 450 else 0
    hh = t.get('height'); nf = t.get('building:levels')
    try: hd = int(float(str(hh).split()[0]) * 10) if hh else int(float(nf) * 30) if nf else 0
    except Exception: hd = 0
    hd = min(hd, 800)
    q0 = (round(P[0][0]), round(P[0][1])); arr = [len(P), k, hd, q0[0], q0[1]]; qx, qz = round(q0[0] * 4), round(q0[1] * 4)
    for x, z in P[1:]:
        ix, iz = round(x * 4), round(z * 4); arr += [ix - qx, iz - qz]; qx, qz = ix, iz
    if max(abs(v) for v in arr) > 32000: continue
    bl += arr; nb += 1
open(os.path.join(OUT, 'bld.b64'), 'w').write(base64.b64encode(struct.pack('<%dh' % len(bl), *bl)).decode()); print('Gebäude', nb)

# ---------------- Orte (innerorts), Ortstafeln, Wald, Bergwertungen ----------------
from PIL import ImageDraw
RC = 40; rx0, rz0 = -14000, -12000; rw, rh = 700, 600
img = Image.new('L', (rw, rh), 0); dr = ImageDraw.Draw(img)
for o in W.values():
    t = o[2]
    if t.get('landuse') in ('residential', 'commercial', 'retail') and len(o[3]) > 3:
        dr.polygon([((x - rx0) / RC, (z - rz0) / RC) for x, z in (xy(*p) for p in o[3])], fill=1)
# zusätzlich dichte Gebäude = Ort
cnt = np.zeros((rh, rw), np.int32)
i = 0
while i < len(bl):
    n = bl[i]; x, z = bl[i + 3], bl[i + 4]; gi, gj = int((x - rx0) / RC), int((z - rz0) / RC)
    if 0 <= gi < rw and 0 <= gj < rh: cnt[gj, gi] += 1
    i += 5 + 2 * (n - 1)
dens = ndimage.uniform_filter(cnt.astype(np.float32), 5) * 25
resm = (np.array(img) > 0) | (dens >= 9)
resm = ndimage.binary_opening(resm, iterations=1)
bits = np.packbits(resm.astype(np.uint8).ravel()).tobytes()
# Wald (WorldCover Baumklasse) im 40-m-Raster
gxr = rx0 + (np.arange(rw) + 0.5) * RC; gzr = rz0 + (np.arange(rh) + 0.5) * RC; XR, ZR = np.meshgrid(gxr, gzr); la2, lo2 = ll(XR, ZR)
fo = (wc_at(la2, lo2) == 10)
fbits = np.packbits(fo.astype(np.uint8).ravel()).tobytes()
# Ortstafeln: Orte mit place=village/town nahe der befahrbaren Straße
cl = []
def edge_near(x, z):
    best = (1e9, None, None)
    for ei, e in enumerate(EDGES):
        for j, p in enumerate(e['P']):
            d = math.hypot(p[0] - x, p[1] - z)
            if d < best[0]: best = (d, ei, j)
    return best
for p in pois:
    if p[0] not in ('town', 'village', 'hamlet'): continue
    d, ei, j = edge_near(p[3], p[4])
    if d > (500 if p[0] != 'hamlet' else 160): continue
    if p[0] == 'hamlet' and any(q[0] in ('town', 'village') and math.hypot(q[3] - p[3], q[4] - p[4]) < (1900 if q[0] == 'town' else 1100) for q in pois): continue
    # Ortsgrenze entlang der Straße: erstes Stück außerhalb der Ortsfläche in beide Richtungen
    e = EDGES[ei]; P = e['P']
    def inres(x, z):
        gi, gj = int((x - rx0) / RC), int((z - rz0) / RC); return 0 <= gi < rw and 0 <= gj < rh and resm[max(0, gj - 1):gj + 2, max(0, gi - 1):gi + 2].any()
    if not inres(*P[j]): continue
    for dirn in (1, -1):
        k = j
        while 0 < k < len(P) - 1 and inres(*P[k]) and abs(k - j) < 600: k += dirn
        if 0 < k < len(P) - 1: cl.append([round(P[k][0]), round(P[k][1]), p[1], 'forward' if dirn < 0 else 'backward'])
# Bergwertungen (beide Richtungen)
def climb(nm, ei_list, a, b):
    """Strecke über Kanten (ei, dir) von Punkt a bis b (lat/lon), liefert p=[[x,z,y-Y0],..]"""
    Q = []
    for ei, dr_ in ei_list:
        e = EDGES[ei]; P = list(zip(e['P'], e['H']))
        if dr_: P = P[::-1]
        Q += P if not Q else P[1:]
    pa, pb = xy(*a), xy(*b)
    ia = min(range(len(Q)), key=lambda i: math.dist(Q[i][0], pa)); ib = min(range(len(Q)), key=lambda i: math.dist(Q[i][0], pb))
    S = Q[ia:ib + 1][::2]
    L = sum(math.dist(S[i][0], S[i + 1][0]) for i in range(len(S) - 1)); hm = S[-1][1] - S[0][1]
    print('Bergwertung', nm, round(L), 'm', round(hm), 'hm', round(hm / L * 100, 1), '%')
    return {'name': nm, 'hm': round(hm), 'len': round(L), 'p': [[round(p[0], 1), round(p[1], 1), round(y - Y0, 1)] for p, y in S]}
climbs = [
    climb('Passo Giau (Pocol)', [(1, 0)], J_POCOL, GIAU),
    climb('Passo Giau (Selva)', [(2, 1)], (46.4555, 12.0300), GIAU),
    climb('Passo Falzarego (Andraz)', [(3, 0)], (46.4830, 11.9850), FALZ),
    climb('Passo Falzarego (Pocol)', [(3, 1)], (46.5240, 12.0880), FALZ),
    climb('Pocol (Cortina)', [(0, 0)], (46.5370, 12.1330), J_POCOL),
]
res = {'res': [rx0, rz0, RC, rw, rh, base64.b64encode(bits).decode()], 'forest': [rx0, rz0, RC, rw, rh, base64.b64encode(fbits).decode()], 'cl': cl, 'climbs': climbs}
json.dump(res, open(os.path.join(OUT, 'res.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
print('Ortstafeln', len(cl), [c[2] for c in cl])

# ---------------- Landbedeckung 10 m (Spielklassen) ----------------
# 0 Wiese, 1 Wald, 3 Acker, 4 bebaut, 5 Wasser, 6 Fels, 7 Latschen/Gebüsch, 8 Schnee, 9 Geröll, 10 Almwiese (hoch)
LC0x, LC0z, LCc = -11000, -10000, 10
LCw, LCh = 2200, 2000
lxs = LC0x + (np.arange(LCw) + 0.5) * LCc; lzs = LC0z + (np.arange(LCh) + 0.5) * LCc
LX, LZ = np.meshgrid(lxs, lzs); la3, lo3 = ll(LX, LZ)
wc = wc_at(la3, lo3)
lc = np.zeros(wc.shape, np.uint8)
lc[wc == 10] = 1; lc[wc == 20] = 7; lc[wc == 40] = 3; lc[wc == 50] = 4; lc[wc == 60] = 6; lc[wc == 70] = 8; lc[wc == 80] = 5
hl = demxz(LX, LZ)
lc[(lc == 0) & (hl > 1950)] = 10
# OSM Geröll/Fels/Wasser drüberzeichnen
im = Image.new('L', (LCw, LCh), 0); d2 = ImageDraw.Draw(im)
def poly(o, v):
    pts = [((x - LC0x) / LCc, (z - LC0z) / LCc) for x, z in (xy(*p) for p in o[3])]
    if len(pts) >= 3: d2.polygon(pts, fill=v)
for o in W.values():
    t = o[2]; n = t.get('natural')
    if n == 'scree': poly(o, 9)
    elif n == 'bare_rock': poly(o, 6)
    elif n == 'water' or t.get('landuse') in ('reservoir', 'basin'): poly(o, 5)
for o in O:
    if o[0] == 'r' and o[2].get('natural') == 'water':
        for role, g in o[3]:
            if role == 'outer' and len(g) > 2: d2.polygon([((x - LC0x) / LCc, (z - LC0z) / LCc) for x, z in (xy(*p) for p in g)], fill=5)
ov = np.array(im); lc = np.where(ov > 0, ov, lc)
# Felswände (OSM cliff) als Fels
d3 = ImageDraw.Draw(Image.fromarray(lc))
lcim = Image.fromarray(lc); d3 = ImageDraw.Draw(lcim)
for o in W.values():
    if o[2].get('natural') in ('cliff', 'arete', 'ridge') and len(o[3]) > 1:
        d3.line([((x - LC0x) / LCc, (z - LC0z) / LCc) for x, z in (xy(*p) for p in o[3])], fill=6, width=2)
lc = np.array(lcim)
lcim.save(os.path.join(OUT, 'lc.png'), optimize=True)
print('lc.png', os.path.getsize(os.path.join(OUT, 'lc.png')) // 1024, 'KB', np.bincount(lc.ravel(), minlength=11))

# ---------------- Satellitenbild (Sentinel-2), Schatten herausgerechnet ----------------
print('Satellitenbild')
from pyproj import Transformer
tr = Transformer.from_crs(4326, 32632, always_xy=True)
S2 = tifffile.TiffFile(os.path.join(SRC, 's0919.tif'))
SUN_EL, SUN_AZ = 44.0, 165.0   # 19.09.2025, ca. 10:10 UTC
def sat_grid(x0, z0, cell, w, h, level):
    A = S2.series[0].levels[level].asarray(); s = 10.0 * (2 ** level)
    xs_ = x0 + (np.arange(w) + 0.5) * cell; zs_ = z0 + (np.arange(h) + 0.5) * cell; XX, ZZ = np.meshgrid(xs_, zs_)
    la, lo = ll(XX, ZZ); E, N = tr.transform(lo, la)
    fc = (E - 699960) / s - 0.5; fr = (5200020 - N) / s - 0.5
    out = np.stack([ndimage.map_coordinates(A[:, :, ch].astype(np.float32), [fr, fc], order=1, mode='nearest') for ch in range(3)], -1)
    # Schattierung des echten Geländes zum Aufnahmezeitpunkt
    hz = demxz(XX, ZZ); gzz, gxx = np.gradient(hz, cell)
    nx_, ny_, nz_ = -gxx, np.ones_like(hz), -gzz; nl = np.sqrt(nx_ ** 2 + ny_ ** 2 + nz_ ** 2)
    az = math.radians(SUN_AZ); el = math.radians(SUN_EL)
    sx, sy, sz = math.sin(az) * math.cos(el), math.sin(el), -math.cos(az) * math.cos(el)   # x Ost, z Süd: Sonne im Süden -> +z
    sx, sz = math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el)
    cosi = (nx_ * sx + ny_ * sy + nz_ * sz) / nl
    flat = math.sin(el)
    f = np.clip(cosi, 0.12, 1.0) / flat
    f = ndimage.gaussian_filter(f, 1.0)
    corr = np.clip(f, 0.25, 1.6) ** -0.55
    out = out * corr[..., None]
    # Schlagschatten (Felswände) auffüllen: dunkle Stellen gegenüber der Umgebung, Farbe aus der hellen Nachbarschaft
    lum = out.mean(-1); sig = max(2.0, 60.0 / cell)
    med = ndimage.gaussian_filter(lum, sig)
    sh = (lum < 0.55 * med) & (med > 85)
    sh = ndimage.binary_dilation(sh, iterations=1)
    wgt = (~sh).astype(np.float32); den = ndimage.gaussian_filter(wgt, sig) + 1e-4
    fill = np.stack([ndimage.gaussian_filter(out[..., c] * wgt, sig) / den for c in range(3)], -1)
    soft = ndimage.gaussian_filter(sh.astype(np.float32), 1.0)[..., None]
    out = out * (1 - soft) + fill * soft
    # Blaustich (Schatten, Dunst) heraus, Lichter weich begrenzen (Dolomit ist hellgrau-beige, nicht weiß)
    r_, g_, b_ = out[..., 0], out[..., 1], out[..., 2]
    ex = np.clip(b_ - np.maximum(r_, g_), 0, None); out[..., 2] = b_ - ex * 0.75
    l2 = out.mean(-1, keepdims=True); kn = 170.0
    comp = np.where(l2 > kn, kn + (l2 - kn) * 0.45, l2); out = out * (comp / np.maximum(l2, 1))
    warm = np.clip((out.mean(-1) - 120) / 80, 0, 1)[..., None]; out = out * (1 + warm * np.array([0.03, 0.0, -0.06]))
    out = np.clip(out * 1.06, 0, 255)
    return out.astype(np.uint8), XX, ZZ
near_img, _, _ = sat_grid(LC0x, LC0z, LCc, LCw, LCh, 0)
Image.fromarray(near_img).save(os.path.join(OUT, 'sat_near.jpg'), quality=82)
far_img, _, _ = sat_grid(GX0, GZ0, 25.0, GNX - 1, GNZ - 1, 1)
Image.fromarray(far_img).save(os.path.join(OUT, 'sat_far.jpg'), quality=82)
print('sat', os.path.getsize(os.path.join(OUT, 'sat_near.jpg')) // 1024, os.path.getsize(os.path.join(OUT, 'sat_far.jpg')) // 1024, 'KB')
meta = {'lc': [LC0x, LC0z, LCc, LCw, LCh], 'satN': [LC0x, LC0z, LCc, LCw, LCh], 'satF': [GX0, GZ0, 25.0, GNX - 1, GNZ - 1], 'peaks': peaks}
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), ensure_ascii=False)
print('fertig')
