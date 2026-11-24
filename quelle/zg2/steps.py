# 0.18.0 Treppen: OSM highway=steps -> steps.bin (Format wie ways.bin 'WAY1', Klasse 15)
# Byte 6 = step_count (0 = unbekannt, max 255). Flags: 1 incline bekannt, 2 incline=up in Punktrichtung, 4 Handlauf, 8 Brücke, 32 Untergrund geschätzt, 64 privat, 128 Schieberampe
# Abfrage: [out:json];way["highway"="steps"](50.795,14.615,50.967,14.865);out geom tags;  -> s.json
import json,math,struct,collections,sys
D=json.load(open(sys.argv[1] if len(sys.argv)>1 else 's.json'))
lat0,lon0=50.85,14.74; KX=111320*math.cos(math.radians(lat0)); KY=111320
def xy(p): return ((p['lon']-lon0)*KX, (lat0-p['lat'])*KY)
SF={'asphalt':0,'sett':1,'cobblestone':1,'unhewn_cobblestone':1,'paving_stones':2,'concrete':3,'concrete:plates':3,'compacted':4,'fine_gravel':5,'gravel':6,'ground':7,'dirt':7,'earth':7,'grass':8,'sand':9,'rock':10,'stone':10,'wood':11,'unpaved':12,'paved':13,'metal':3}
out=[];skip=collections.Counter()
for e in D['elements']:
  if e['type']!='way': continue
  t=e['tags']
  if t.get('area')=='yes' or t.get('indoor')=='yes' or t.get('level','0') not in ('0',''): skip['innen']+=1; continue
  P=[xy(p) for p in e['geometry']]
  L=sum(math.dist(P[i],P[i+1]) for i in range(len(P)-1))
  if L<0.8: skip['kurz']+=1; continue
  s=t.get('surface','').split(';')[0]; inf=0
  if s in SF: sf=SF[s]
  else: inf=32; sf=3 if t.get('handrail')=='yes' or t.get('lit')=='yes' else 10
  inc=t.get('incline',''); fl=inf
  if inc in ('up','down'): fl|=1|(2 if inc=='up' else 0)
  if t.get('handrail')=='yes' or t.get('handrail:left')=='yes' or t.get('handrail:right')=='yes': fl|=4
  if t.get('bridge') and t.get('bridge')!='no': fl|=8
  if t.get('access') in ('private','no'): fl|=64
  if t.get('ramp:bicycle')=='yes' or t.get('ramp:stroller')=='yes': fl|=128
  try: n=min(255,max(0,int(t.get('step_count','0'))))
  except: n=0
  w=1.5
  try:
    if 'width' in t: w=max(0.8,min(6,float(t['width'].split()[0].replace(',','.').rstrip('m'))))
  except: pass
  a=[];px=pz=0
  for x,z in P:
    X,Z=round(x*2),round(z*2); a+=[X-px,Z-pz]; px,pz=X,Z
  out.append(struct.pack('<BBBBBBHI',15,round(w*10),sf,0,fl,n,len(P),e['id'])+struct.pack('<%dh'%len(a),*a))
b=b'WAY1'+struct.pack('<I',len(out))+b''.join(out)
open('steps.bin','wb').write(b)
print(len(out),len(b),dict(skip))
