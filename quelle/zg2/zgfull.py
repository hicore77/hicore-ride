# Zittauer Gebirge: Straßennetz (Graph) aus OSM + SRTM fürs Spiel bauen.
# Erweiterbar: Region (REG) vergrößern oder Klassen ändern, neu laufen lassen.
import json, math, base64, struct, sys
import numpy as np

D = json.load(open('full.json'))
LAT0, LON0 = D['lat0'], D['lon0']
KX = 111320 * math.cos(math.radians(LAT0)); KY = 111320
REG = None
MAXCLS = 9
WDEF = {0: 7.0, 1: 6.5, 2: 5.8, 3: 4.8, 4: 5.0}
STEP = 5.0

FIX = {i: (a, b) for i, a, b in json.load(open('fix.json'))}
def dec(s, sc=4, ri=None):
    a = list(struct.unpack('<%dh' % (len(base64.b64decode(s)) // 2), base64.b64decode(s))); o = []; x = y = 0
    if ri in FIX: a[0], a[1] = FIX[ri]
    for i in range(0, len(a), 2):
        x += a[i]; y += a[i + 1]; o.append((x / sc, y / sc))
    return o

def elen0(p): return sum(math.hypot(p[j + 1][0] - p[j][0], p[j + 1][1] - p[j][1]) for j in range(len(p) - 1))
# ---------- Höhenmodell (SRTM 1", geglättet) ----------
_d0 = [dec(r[3], ri=i) for i, r in enumerate(D['roads'])]; _xs = [q[0] for p in _d0 for q in p]; _zs = [q[1] for p in _d0 for q in p]
REG = (math.floor(min(_xs)) - 50, math.floor(min(_zs)) - 50, math.ceil(max(_xs)) + 50, math.ceil(max(_zs)) + 50)
print('REG', REG)
S = np.fromfile('../zg/N50E014.hgt', dtype='>i2').reshape(3601, 3601).astype(np.float64)
S[S < -100] = np.nan
if np.isnan(S).any(): S = np.where(np.isnan(S), np.nanmean(S), S)
def gauss2(a, sig):
    r = int(sig * 3); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sig) ** 2); k /= k.sum()
    a = np.apply_along_axis(lambda v: np.convolve(np.pad(v, r, mode='edge'), k, 'valid'), 0, a)
    return np.apply_along_axis(lambda v: np.convolve(np.pad(v, r, mode='edge'), k, 'valid'), 1, a)
# Ausschnitt um die Region
lat_a = LAT0 - (REG[3] + 1500) / KY; lat_b = LAT0 - (REG[1] - 1500) / KY
lon_a = LON0 + (REG[0] - 1500) / KX; lon_b = LON0 + (REG[2] + 1500) / KX
r0, r1 = int((51 - lat_b) * 3600), int((51 - lat_a) * 3600) + 2
c0, c1 = int((lon_a - 14) * 3600), int((lon_b - 14) * 3600) + 2
SUB = gauss2(S[r0:r1, c0:c1], 1.6)
def dem(x, z):
    lat = LAT0 - z / KY; lon = LON0 + x / KX
    fy = (51 - lat) * 3600 - r0; fx = (lon - 14) * 3600 - c0
    iy, ix = int(fy), int(fx); ty, tx = fy - iy, fx - ix
    a = SUB[iy, ix] * (1 - tx) + SUB[iy, ix + 1] * tx; b = SUB[iy + 1, ix] * (1 - tx) + SUB[iy + 1, ix + 1] * tx
    return a * (1 - ty) + b * ty

# ---------- Wege laden, Region ----------
inreg = lambda p, m=0: REG[0] - m < p[0] < REG[2] + m and REG[1] - m < p[1] < REG[3] + m
ways = []
for ri, (cls, ni, fl, s, wdm, ln) in enumerate(D['roads']):
    p = dec(s, ri=ri)
    wd = wdm / 10 if wdm else (ln * 3.0 if ln >= 2 else WDEF.get(cls, 5.0))
    if ln == 1 and not wdm: wd = 3.5
    wd = max(3.0, min(12.0, wd))
    ways.append({'c': cls, 'n': ni, 'br': fl & 3, 'p': p, 'w': wd, 'fl': fl})
# Zusatzwege (Stichstraßen Hochwald, Lausche ab Waltersdorf), Anfang liegt auf einer Netzstraße
for nm, flat in json.load(open('ext.json')):
    p = [(flat[i], flat[i + 1]) for i in range(0, len(flat), 2)]
    D['names'].append({'Hochwald': '|Hochwaldweg', 'Lausche': '|An der Lausche'}[nm])
    ways.append({'c': 4, 'n': len(D['names']) - 1, 'br': 0, 'p': p, 'w': 4.0, 'fl': 0})
print('Wege', len(ways), 'km', round(sum(elen0(w['p']) for w in ways)/1000,1))

def ewidth(e):
    tl = sum(l for w, l in e['wl']) or 1
    return round(sum(w * l for w, l in e['wl']) / tl, 1)
key = lambda p: (round(p[0] * 4), round(p[1] * 4))
# Einmündungen, die durch Vereinfachung nicht mehr auf einem Stützpunkt liegen: Endpunkt auf Segment eines anderen Wegs -> Stützpunkt einfügen
def insert_snaps():
    ends = [(wi, w['p'][0]) for wi, w in enumerate(ways)] + [(wi, w['p'][-1]) for wi, w in enumerate(ways)]
    C = 40; grid = {}
    for wi, w in enumerate(ways):
        for j in range(len(w['p']) - 1):
            a, b = w['p'][j], w['p'][j + 1]
            for gx in range(int(min(a[0], b[0]) // C), int(max(a[0], b[0]) // C) + 1):
                for gz in range(int(min(a[1], b[1]) // C), int(max(a[1], b[1]) // C) + 1):
                    grid.setdefault((gx, gz), []).append((wi, j))
    ins = {}
    for wi, e in ends:
        best = None
        for (wj, j) in grid.get((int(e[0] // C), int(e[1] // C)), []):
            if wj == wi: continue
            a, b = ways[wj]['p'][j], ways[wj]['p'][j + 1]; vx, vz = b[0] - a[0], b[1] - a[1]; L2 = vx * vx + vz * vz or 1e-9
            t = max(0, min(1, ((e[0] - a[0]) * vx + (e[1] - a[1]) * vz) / L2)); d = math.hypot(a[0] + vx * t - e[0], a[1] + vz * t - e[1])
            if d < 2.0 and (best is None or d < best[0]): best = (d, wj, j, t)
        if best:
            d, wj, j, t = best
            if 0.001 < t < 0.999: ins.setdefault(wj, []).append((j, t, e))
            # Endpunkt genau auf den Punkt ziehen
    for wj, L in ins.items():
        p = ways[wj]['p']; L.sort(key=lambda u: (u[0], u[1]))
        out = []; k = 0
        for j in range(len(p)):
            out.append(p[j])
            while k < len(L) and L[k][0] == j: out.append(L[k][2]); k += 1
        ways[wj]['p'] = out
insert_snaps()

# ---------- Graph ----------
cnt = {}
for w in ways:
    for i, q in enumerate(w['p']):
        k = key(q); cnt[k] = cnt.get(k, 0) + (1 if 0 < i < len(w['p']) - 1 else 1)
ends = set()
for w in ways: ends.add(key(w['p'][0])); ends.add(key(w['p'][-1]))
nodekeys = {k for k, c in cnt.items() if c >= 2} | ends
# Kanten = Stücke zwischen Knoten
E = []
for w in ways:
    cur = [w['p'][0]]
    for q in w['p'][1:]:
        cur.append(q)
        if key(q) in nodekeys:
            E.append({'a': key(cur[0]), 'b': key(q), 'p': cur, 'c': w['c'], 'n': w['n'], 'br': w['br'], 'wl': [(w['w'], elen0(cur))]}); cur = [q]
# Knoten mit genau 2 Kanten zusammenlegen (gleiche Straße weiter)
from collections import defaultdict
def adj_build():
    A = defaultdict(list)
    for i, e in enumerate(E):
        if e is None: continue
        A[e['a']].append(i); A[e['b']].append(i)
    return A
A = adj_build()
changed = True
while changed:
    changed = False
    for k, L in list(A.items()):
        L = [i for i in L if E[i] is not None]
        if len(L) != 2 or L[0] == L[1]: continue
        e1, e2 = E[L[0]], E[L[1]]
        if e1['br'] != e2['br'] and (e1['br'] or e2['br']): pass
        p1 = e1['p'] if e1['b'] == k else e1['p'][::-1]; a1 = e1['a'] if e1['b'] == k else e1['b']
        p2 = e2['p'] if e2['a'] == k else e2['p'][::-1]; b2 = e2['b'] if e2['a'] == k else e2['a']
        if a1 == k or b2 == k: continue
        # Brücken-Markierung je Punkt mitführen
        f1 = e1.get('f') or [e1['br']] * (len(e1['p']) - 1); f1 = f1 if e1['b'] == k else f1[::-1]
        f2 = e2.get('f') or [e2['br']] * (len(e2['p']) - 1); f2 = f2 if e2['a'] == k else f2[::-1]
        ne = {'a': a1, 'b': b2, 'p': p1 + p2[1:], 'c': min(e1['c'], e2['c']), 'n': e1['n'] if elen0(p1) >= elen0(p2) else e2['n'], 'br': 0, 'f': f1 + f2, 'wl': e1['wl'] + e2['wl']}
        E[L[0]] = ne; E[L[1]] = None
        A = adj_build(); changed = True; break
E = [e for e in E if e is not None and len(e['p']) >= 2]
for e in E:
    if 'f' not in e: e['f'] = [e['br']] * (len(e['p']) - 1)
# Region beschneiden: Kanten, die überwiegend außerhalb liegen, weg; größte zusammenhängende Komponente
E = [e for e in E if sum(inreg(q) for q in e['p']) >= 0.6 * len(e['p'])]
A = adj_build(); seen = {}; comp = 0
for k in A:
    if k in seen: continue
    st = [k]; seen[k] = comp
    while st:
        u = st.pop()
        for i in A[u]:
            for v in (E[i]['a'], E[i]['b']):
                if v not in seen: seen[v] = comp; st.append(v)
    comp += 1
sz = defaultdict(float)
for e in E: sz[seen[e['a']]] += sum(math.hypot(e['p'][j + 1][0] - e['p'][j][0], e['p'][j + 1][1] - e['p'][j][1]) for j in range(len(e['p']) - 1))
big = max(sz, key=sz.get)
print('Komponenten', sorted([round(v/1000,1) for v in sz.values()])[-8:]); E = [e for e in E if seen[e['a']] == big]
# kurze Sackgassen-Stummel (< 40 m) entfernen
for it in range(3):
    A = adj_build(); deg = {k: len(v) for k, v in A.items()}
    E = [e for e in E if not ((deg[e['a']] == 1 or deg[e['b']] == 1) and sum(math.hypot(e['p'][j + 1][0] - e['p'][j][0], e['p'][j + 1][1] - e['p'][j][1]) for j in range(len(e['p']) - 1)) < 40)]
# sehr kurze Verbindungsstücke (< 30 m) zusammenziehen: nahe Kreuzungen werden eine Kreuzung
def elen(e): return sum(math.hypot(e['p'][j + 1][0] - e['p'][j][0], e['p'][j + 1][1] - e['p'][j][1]) for j in range(len(e['p']) - 1))
for it in range(50):
    sh = [e for e in E if e['a'] != e['b'] and elen(e) < 30]
    if not sh: break
    e0 = sh[0]; a, b = e0['a'], e0['b']; E.remove(e0)
    ax, az = a[0] / 4, a[1] / 4; bx, bz = b[0] / 4, b[1] / 4; m = ((ax + bx) / 2, (az + bz) / 2); mk = key(m)
    for e in E:
        for end in ('a', 'b'):
            if e[end] in (a, b):
                e[end] = mk
                if end == 'a': e['p'][0] = m
                else: e['p'][-1] = m
E = [e for e in E if not (e['a'] == e['b'] and elen(e) < 60)]
print('Kanten', len(E))

# ---------- Neu abtasten + Höhen ----------
def resample(p, f):
    seg = [0.0]
    for j in range(len(p) - 1): seg.append(seg[-1] + math.hypot(p[j + 1][0] - p[j][0], p[j + 1][1] - p[j][1]))
    L = seg[-1]; n = max(2, int(round(L / STEP)) + 1); out = []; fl = []; j = 0
    for i in range(n):
        s = L * i / (n - 1)
        while j < len(p) - 2 and seg[j + 1] < s: j += 1
        t = (s - seg[j]) / max(1e-9, seg[j + 1] - seg[j]); out.append((p[j][0] + (p[j + 1][0] - p[j][0]) * t, p[j][1] + (p[j + 1][1] - p[j][1]) * t)); fl.append(f[min(j, len(f) - 1)])
    return out, fl, L
nodes = {}
for e in E:
    e['P'], e['F'], e['L'] = resample(e['p'], e['f'])
for k in {e['a'] for e in E} | {e['b'] for e in E}:
    x, z = k[0] / 4, k[1] / 4; nodes[k] = {'x': x, 'z': z, 'y': dem(x, z)}
# Knotenhöhe: Mittel der geglätteten Gelände-Höhe in 25 m Umkreis (eine Höhe für alle Straßen dieser Kreuzung)
for k, n in nodes.items():
    hs = [dem(n['x'] + 25 * math.cos(a), n['z'] + 25 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 9)[:-1]] + [n['y']] * 4
    n['y'] = float(np.mean(hs))
def smooth1(v, sig):
    r = max(1, int(sig * 3)); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sig) ** 2); k /= k.sum()
    return np.convolve(np.pad(v, r, mode='edge'), k, 'valid')
MAXG = 0.30
for e in E:
    P = e['P']; h = np.array([dem(x, z) for x, z in P])
    # Brücken/Tunnel: Höhe linear zwischen Anfang und Ende des Bauwerks
    F = e['F']; i = 0
    while i < len(F):
        if F[i]:
            j = i
            while j < len(F) and F[j]: j += 1
            a, b = max(0, i - 1), min(len(h) - 1, j + 1)
            h[a:b + 1] = np.linspace(h[a], h[b], b - a + 1); i = j
        else: i += 1
    h = smooth1(h, 35 / STEP)          # echte Steigungen, nur Messrauschen weg
    ya, yb = nodes[e['a']]['y'], nodes[e['b']]['y']
    n = len(h); s = np.arange(n) * e['L'] / max(1, n - 1)
    ra = min(e['L'] * 0.5, 160.0); rb = ra
    wa = np.clip(1 - s / ra, 0, 1); wa = wa * wa * (3 - 2 * wa)
    wb = np.clip(1 - (e['L'] - s) / rb, 0, 1); wb = wb * wb * (3 - 2 * wb)
    h = h + (ya - h[0]) * wa + (yb - h[-1]) * wb
    h[0], h[-1] = ya, yb
    # Steigung begrenzen (glätten, wo es zu steil wird)
    for it in range(40):
        g = np.diff(h) / STEP
        if np.abs(g).max() <= MAXG: break
        h2 = smooth1(h, 3); bad = np.zeros(n, bool); idx = np.where(np.abs(g) > MAXG)[0]
        for q in idx: bad[max(1, q - 4):min(n - 1, q + 6)] = True
        h = np.where(bad, h2, h); h[0], h[-1] = ya, yb
    e['H'] = h
# Statistik
gm = max(float(np.abs(np.diff(e['H']) / STEP).max()) for e in E)
tot = sum(e['L'] for e in E)
print('Knoten', len(nodes), 'Kanten', len(E), 'km', round(tot / 1000, 1), 'max Steigung', round(gm * 100, 1), '%')
# ---------- Export ----------
nk = list(nodes); NI = {k: i for i, k in enumerate(nk)}
Y0 = 300.0
def encp(P, H):
    out = []; px, pz = round(P[0][0] * 4), round(P[0][1] * 4); py = 0
    for (x, z), y in zip(P, H):
        ix, iz, iy = round(x * 4), round(z * 4), round((y - Y0) * 10); out += [ix - px, iz - pz, iy - py]; px, pz, py = ix, iz, iy
    return base64.b64encode(struct.pack('<%dh' % len(out), *out)).decode()
A = adj_build()
names = D['names']
out = {'lat0': LAT0, 'lon0': LON0, 'Y0': Y0, 'reg': REG,
       'nodes': [[round(nodes[k]['x'], 2), round(nodes[k]['z'], 2), round(nodes[k]['y'] - Y0, 2)] for k in nk],
       'edges': [[NI[e['a']], NI[e['b']], e['c'], names[e['n']], round(e['L'], 1), encp(e['P'], e['H']), ewidth(e), round(e['P'][0][0] * 4), round(e['P'][0][1] * 4)] for e in E],
       'pois': [p for p in D['pois'] if inreg((p[3], p[4]), 400)]}
# Gelände-Raster 25 m (geglättet), als int16-Deltas in dm
G = 25.0; gx0, gz0 = REG[0] - 600, REG[1] - 600; nx = int((REG[2] + 600 - gx0) / G) + 1; nz = int((REG[3] + 600 - gz0) / G) + 1
Hg = np.array([[dem(gx0 + i * G, gz0 + j * G) for i in range(nx)] for j in range(nz)]) - Y0
q = np.round(Hg * 10).astype(np.int64); d = np.diff(np.concatenate([np.zeros((nz, 1), np.int64), q], axis=1), axis=1)
out['dem'] = {'x0': gx0, 'z0': gz0, 'cell': G, 'nx': nx, 'nz': nz, 'd': base64.b64encode(d.astype('<i2').tobytes()).decode()}
json.dump(out, open('zg_net.json', 'w'), separators=(',', ':'), ensure_ascii=False)
import os; print('zg_net.json', os.path.getsize('zg_net.json') // 1024, 'KB')
# ---------- Standardrunde (Hauptrunde) über Wegpunkte ----------
import heapq
WP = [(-2414, -433), (-2320, 822), (54, 1667), (1380, -1670), (511, -2136), (-1192, -1379)]   # Jonsdorf, Abzw. Hain, Abzw. Oybin/Lückendorf, Olbersdorf Süd, S134, Abzw. K8640
ED = out['edges']; NN = out['nodes']
adj = defaultdict(list)
for i, e in enumerate(ED): adj[e[0]].append((i, e[1])); adj[e[1]].append((i, e[0]))
def nearest_node(x, z, need=3):
    c = [(math.hypot(n[0] - x, n[1] - z), i) for i, n in enumerate(NN) if len(adj[i]) >= need]
    return min(c)[1]
def dijk(s, t, banned):
    dist = {s: 0}; prev = {}; pq = [(0, s)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == t: break
        if d > dist[u]: continue
        for ei, v in adj[u]:
            if ei in banned: continue
            nd = d + ED[ei][4]
            if nd < dist.get(v, 1e18): dist[v] = nd; prev[v] = (u, ei); heapq.heappush(pq, (nd, v))
    path = []; u = t
    while u != s: pu, ei = prev[u]; path.append((ei, 0 if ED[ei][0] == pu else 1)); u = pu
    return path[::-1]
wn = [nearest_node(x, z) for x, z in WP]
loop = []; used = set()
for i in range(len(wn)):
    p = dijk(wn[i], wn[(i + 1) % len(wn)], used); loop += p; used |= {ei for ei, _ in p}
out['loop'] = loop
print('Runde', round(sum(ED[ei][4] for ei, _ in loop) / 1000, 1), 'km, Kanten', len(loop))
json.dump(out, open('zg_net.json', 'w'), separators=(',', ':'), ensure_ascii=False)
