"""0.27.0: Objekte aus OpenStreetMap für die Welt Zittau (Bänke, Hütten, Wegweiser, Tafeln, Hochsitze, Kreuze, Plätze, Strände, Parkplätze, Camping, Stege …)
Läuft in der Higgsfield-Sandbox (Overpass ist aus der Cloud gesperrt, braucht User-Agent):
   python3 osm_objekte.py holen      -> welt.json (Overpass, Ausschnitt der Welt Zittau)
   python3 osm_objekte.py packen     -> osm_obj.json (Weltkoordinaten x/z wie im Spiel, 0,1 m) und osmobj.png (gzip als Graustufen-PNG zum Übertragen)
In der Cloud: PNG lesen, 4 Byte Länge + gzip -> quelle/zg2/osm_obj.json. build_gpu.py hängt es als window.ZGOBJ an data/zittau.js. Lizenz: ODbL (Quelle im Spiel genannt).
Format: p = {art: [[x,z,(Richtung°),(Name)],...]}, a = [[art,[x,z,...],Name,Belag,Parkart],...], l = [[art,[x,z,...]],...]"""
import json,math,collections,sys,os,gzip,urllib.request,urllib.parse
BB=(50.7958,14.6181,50.9648,14.8146)
Q='''[out:json][timeout:180];
(
 node({b})[amenity~"^(bench|shelter|waste_basket|bbq|drinking_water|toilets|hunting_stand|lounger|bicycle_parking|parking|recycling)$"];
 node({b})[leisure~"^(picnic_table|firepit|playground|bird_hide)$"];
 node({b})[tourism~"^(information|viewpoint|picnic_site|attraction|artwork|camp_site)$"];
 node({b})[historic~"^(wayside_cross|wayside_shrine|memorial|boundary_stone|locomotive|monument)$"];
 node({b})[man_made~"^(tower|cross|flagpole|survey_point|mast)$"];
 node({b})[natural~"^(stone|rock|spring)$"];
 way({b})[amenity~"^(parking|shelter)$"];
 way({b})[leisure~"^(pitch|playground|picnic_table|swimming_pool|track)$"];
 way({b})[natural~"^(beach|sand)$"];
 way({b})[tourism~"^(camp_site|caravan_site|picnic_site)$"];
 way({b})[man_made~"^(pier|tower)$"];
 way({b})[barrier~"^(fence|hedge|wall)$"];
 way({b})[natural~"^(tree_row|scrub)$"];
);
out geom;'''
lat0,lon0=50.85,14.74;K=111320*math.cos(lat0*math.pi/180)
def xy(la,lo): return [round((lo-lon0)*K,1),round(-(la-lat0)*111320,1)]
def kind(t):
  a=t.get('amenity');l=t.get('leisure');tu=t.get('tourism');h=t.get('historic');m=t.get('man_made');n=t.get('natural');b=t.get('barrier')
  if a=='bench': return 'bench'
  if l=='picnic_table': return 'picnic'
  if a=='shelter': return 'shelter'
  if a=='waste_basket': return 'waste'
  if a=='hunting_stand' or l=='bird_hide': return 'hochsitz'
  if a=='toilets': return 'wc'
  if a=='bbq' or l=='firepit': return 'feuer'
  if a=='drinking_water' or n=='spring': return 'quelle'
  if a=='parking': return 'parking'
  if a=='bicycle_parking': return 'radstand'
  if l=='playground': return 'spielplatz'
  if l=='pitch': return 'pitch:'+t.get('sport','')
  if l=='track': return 'track'
  if tu=='information':
    i=t.get('information','')
    return 'wegweiser' if i in('guidepost','route_marker') else ('tafel' if i in('board','map') else 'info')
  if tu=='viewpoint': return 'aussicht'
  if tu in('camp_site','caravan_site'): return 'camp'
  if tu=='picnic_site': return 'rastplatz'
  if tu in('attraction','artwork'): return 'sehensw'
  if h=='wayside_cross' or m=='cross': return 'kreuz'
  if h=='wayside_shrine': return 'bildstock'
  if h in('memorial','monument'): return 'denkmal'
  if h=='boundary_stone': return 'grenzstein'
  if h=='locomotive': return 'lok'
  if m=='tower': return 'turm:'+t.get('tower:type','')
  if m=='pier': return 'steg'
  if n in('stone','rock'): return 'stein'
  if n in('beach','sand'): return 'strand'
  if n=='tree_row': return 'baumreihe'
  if n=='scrub': return 'gebuesch'
  if b in('fence','hedge','wall'): return b
  return None   # Schwimmbecken (meist private Gärten), Masten, Recycling: weggelassen
if sys.argv[1]=='holen':
  q=Q.replace('{b}',','.join(map(str,BB)))
  r=urllib.request.Request('https://overpass-api.de/api/interpreter',data=urllib.parse.urlencode({'data':q}).encode(),headers={'User-Agent':'hicore-ride (game map tool)'})
  open('welt.json','wb').write(urllib.request.urlopen(r,timeout=200).read()); sys.exit()
d=json.load(open('welt.json'));P=collections.defaultdict(list);A=[];Lns=[];c=collections.Counter()
for e in d['elements']:
  t=e.get('tags',{});k=kind(t)
  if not k: continue
  c[k]+=1; nm=t.get('name','')
  if e['type']=='node':
    q=xy(e['lat'],e['lon'])
    try: dr=round(float(t.get('direction')))
    except: dr=None
    P[k].append(q+([dr] if dr is not None else [])+([nm] if nm and k in ('sehensw','rastplatz','aussicht','lok','denkmal','turm:observation','shelter','camp') else []))
  else:
    g=[xy(p['lat'],p['lon']) for p in e.get('geometry',[]) if p]
    if len(g)<2: continue
    fl=[v for p in g for v in p]; closed=g[0]==g[-1]
    if k in('fence','hedge','wall','baumreihe','steg') and not (k=='steg' and closed): Lns.append([k,fl])
    else:
      a=[k,fl,nm,t.get('surface',''),t.get('parking','') if k=='parking' else '']
      while len(a)>2 and a[-1]=='': a.pop()
      A.append(a)
print(c.most_common())
s=json.dumps({'p':P,'a':A,'l':Lns,'src':'OpenStreetMap (ODbL) '+d['osm3s']['timestamp_osm_base'][:10]},separators=(',',':')).encode()
open('osm_obj.json','wb').write(s)
from PIL import Image
z=gzip.compress(s,9); w=1024; h=math.ceil((len(z)+4)/w); b=len(z).to_bytes(4,'big')+z; b+=bytes(w*h-len(b))
Image.frombytes('L',(w,h),b).save('osmobj.png',optimize=True); print(len(s),len(z))
