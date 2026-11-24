import json,math,struct,collections
D=json.load(open('p.json'))
lat0,lon0=50.85,14.74; KX=111320*math.cos(math.radians(lat0)); KY=111320
def xy(p): return ((p['lon']-lon0)*KX, (lat0-p['lat'])*KY)
def dp(P,eps):
  if len(P)<3: return P
  a,b=P[0],P[-1]; dx,dz=b[0]-a[0],b[1]-a[1]; L=math.hypot(dx,dz) or 1e-9; im,md=0,-1
  for i in range(1,len(P)-1):
    d=abs((P[i][0]-a[0])*dz-(P[i][1]-a[1])*dx)/L
    if d>md: md,im=d,i
  if md>eps: return dp(P[:im+1],eps)[:-1]+dp(P[im:],eps)
  return [a,b]
CL={'track':10,'path':11,'footway':12,'cycleway':13,'bridleway':14}
SF={'asphalt':0,'sett':1,'cobblestone':1,'unhewn_cobblestone':1,'paving_stones':2,'paving_stones:lanes':2,'concrete':3,'concrete:plates':3,'concrete:lanes':3,
 'compacted':4,'fine_gravel':5,'gravel':6,'pebblestone':6,'ground':7,'dirt':7,'earth':7,'mud':7,'grass':8,'grass_paver':8,'sand':9,'rock':10,'stone':10,'wood':11,'unpaved':12,'paved':13}
SM={'excellent':1,'good':2,'intermediate':3,'bad':4,'very_bad':5,'horrible':6,'very_horrible':7,'impassable':8}
TT={'grade1':1,'grade2':2,'grade3':3,'grade4':4,'grade5':5}
out=[];st=collections.Counter();skip=collections.Counter()
for e in D['elements']:
  if e['type']!='way': continue
  t=e['tags']; h=t['highway']; c=CL[h]
  if t.get('footway') in ('sidewalk','crossing') or t.get('cycleway') in ('sidewalk','crossing') or t.get('path') in ('sidewalk','crossing'): skip['sidewalk']+=1; continue
  if t.get('area')=='yes' or t.get('indoor')=='yes' or t.get('level','0') not in ('0',''): skip['area/indoor']+=1; continue
  P=[xy(p) for p in e['geometry']]
  L=sum(math.dist(P[i],P[i+1]) for i in range(len(P)-1))
  acc=t.get('access') in ('private','no')
  if c==10 and acc and L<80: skip['hof']+=1; continue
  if L<4: skip['kurz']+=1; continue
  tt=TT.get(t.get('tracktype'),0); sm=SM.get(t.get('smoothness'),0)
  s=t.get('surface','').split(';')[0]; inf=0
  if s in SF: sf=SF[s]
  else:
    inf=32
    if c==10: sf={1:13,2:6,3:12,4:7,5:8}.get(tt,12)
    elif c in (12,13): sf=13
    else: sf=7
  w={10:3.0 if tt in (0,1,2) else 2.6,11:1.3,12:2.0,13:2.4,14:2.0}[c]
  try:
    if 'width' in t: w=max(0.8,min(6,float(t['width'].split()[0].replace(',','.').rstrip('m'))))
  except: pass
  fl=(8 if t.get('bridge') and t.get('bridge')!='no' else 0)|(16 if t.get('tunnel') and t.get('tunnel')!='no' else 0)|inf|(64 if acc else 0)
  Q=dp(P,0.5); a=[];px=pz=0
  for x,z in Q:
    X,Z=round(x*2),round(z*2); a+=[X-px,Z-pz]; px,pz=X,Z
  out.append(struct.pack('<BBBBBBHI',c,round(w*10),sf,tt|(sm<<4),fl,0,len(Q),e['id'])+struct.pack('<%dh'%len(a),*a))
  st[(c,sf)]+=L/1000
b=b'WAY1'+struct.pack('<I',len(out))+b''.join(out)
open('ways.bin','wb').write(b)
print(len(out),len(b),dict(skip)); print({k:round(v) for k,v in sorted(st.items())})
