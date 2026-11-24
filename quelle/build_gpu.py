import re, base64, os, json
D=os.path.dirname(os.path.abspath(__file__))+'/'
t=open(D+'gpu/src.html').read()
three=open(D+'gpu/three187gpu.js').read()
gltf=''
props={}
pd=D+'props/'
if os.path.isdir(pd):
    for f in sorted(os.listdir(pd)):
        if f.endswith('.glb'): props[f[:-4]]=base64.b64encode(open(pd+f,'rb').read()).decode()
# 0.11.0: 3D-Modelle als eigene Dateien neben index.html (gpu/props/*.glb), werden beim Start parallel geladen und vom Browser zwischengespeichert
import shutil
os.makedirs(D+'gpu/props',exist_ok=True)
for n in props: shutil.copyfile(pd+n+'.glb', D+'gpu/props/'+n+'.glb')
import hashlib as _h
ph={n:_h.md5(open(pd+n+'.glb','rb').read()).hexdigest()[:8] for n in props}
pj='window.PROP_GLB={};window.PROP_LIST='+json.dumps(sorted(props))+';window.PROP_HASH='+json.dumps(ph)+';'
rj=''
import hashlib as _hl
os.makedirs(D+'gpu/data/img',exist_ok=True)
# 0.13.0: Fahrer und Rahmen als Binärdateien statt Base64 (media.js von 6,4 auf ca. 1 MB). EMBED_GLB=1 baut den alten Weg.
def glbf(src,name):
    b=open(src,'rb').read(); open(D+'gpu/data/'+name,'wb').write(b); return 'data/'+name+'?h='+_hl.md5(b).hexdigest()[:8]
if os.environ.get('EMBED_GLB')=='1':
    if os.path.exists(D+'rider.glb'): rj='window.RIDER_GLB_B64="'+base64.b64encode(open(D+'rider.glb','rb').read()).decode()+'";'
    if os.path.exists(D+'bframe/frame.glb'): rj+='window.BIKE_FRAME_B64="'+base64.b64encode(open(D+'bframe/frame.glb','rb').read()).decode()+'";'
else:
    if os.path.exists(D+'rider.glb'): rj='window.RIDER_GLB_FILE='+json.dumps(glbf(D+'rider.glb','rider.glb'))+';'
    if os.path.exists(D+'bframe/frame.glb'): rj+='window.BIKE_FRAME_FILE='+json.dumps(glbf(D+'bframe/frame.glb','frame.glb'))+';'
for _f in os.listdir(D+'gpu/data/img'): os.remove(D+'gpu/data/img/'+_f)
def imgf(src,name):
    b=open(src,'rb').read(); open(D+'gpu/data/img/'+name,'wb').write(b); return 'data/img/'+name+'?h='+_hl.md5(b).hexdigest()[:8]
tj={}
td=D+'texjpg/'
if os.path.isdir(td):
    for f in sorted(os.listdir(td)):
        if f.endswith('.jpg'): tj[f[:-4]]=imgf(td+f,'tex_'+f)
jj={}
for k in ('eyb','petz','navy','sand','patch','sprint','berg','lausche'):
    if os.path.exists(D+'jer/tex_%s.jpg'%k): jj[k]={'tex':imgf(D+'jer/tex_%s.jpg'%k,'jer_tex_%s.jpg'%k),'thumb':imgf(D+'jer/thumb_%s.jpg'%k,'jer_thumb_%s.jpg'%k)}
rj=rj+'window.RIDER_SKIN='+json.dumps({'base':base64.b64encode(open(D+'rtex/base2.jpg','rb').read()).decode(),'normal':base64.b64encode(open(D+'rtex/normal2.jpg','rb').read()).decode()})+';'
rj=rj+'window.JERSEY_JPG='+json.dumps(jj)+';'
rj=rj+'window.TEX_JPG='+json.dumps(tj)+';'
tp={}
if os.path.isdir(D+'texjpg_ph/'):
    for f in sorted(os.listdir(D+'texjpg_ph/')):
        if f.endswith('.jpg'): tp[f[:-4]]=imgf(D+'texjpg_ph/'+f,'ph_'+f)
rj=rj+'window.TEX_JPG_PH='+json.dumps(tp)+';'
# 0.14.0: Wege-Texturatlas (Poly Haven CC0, 3x3 Kacheln je 512 px mit Rand)
if os.path.exists(D+'texways/ways_atlas.jpg'): rj=rj+'window.WAYS_TEX='+json.dumps(imgf(D+'texways/ways_atlas.jpg','ways_atlas.jpg'))+';'
sx={}
if os.path.isdir(D+'sfx/'):
    for f in sorted(os.listdir(D+'sfx/')):
        if f.endswith('.mp3'): sx[f[:-4]]=imgf(D+'sfx/'+f,'sfx_'+f)
rj=rj+'window.SFX_B64='+json.dumps(sx)+';'
fj={}
if os.path.isdir(D+'facjpg/'):
    for f in sorted(os.listdir(D+'facjpg/')):
        if f.endswith('.jpg'): fj[f[:-4]]=base64.b64encode(open(D+'facjpg/'+f,'rb').read()).decode()
rj=rj+'window.FACADE_JPG='+json.dumps(fj)+';'
# 0.17.0: Gebäude, OSM-Bäume, Felsen und Zäune als 2-km-Kacheln (quelle/kacheln, erzeugt von werkzeuge/kacheln.py), nur Index und Wahrzeichen-Grundrisse in zittau.js
KCJS=''
if os.path.exists(D+'kacheln/index.json'):
    shutil.rmtree(D+'gpu/data/kacheln',ignore_errors=True); shutil.copytree(D+'kacheln',D+'gpu/data/kacheln')
    KCJS='window.ZGKC='+open(D+'kacheln/index.json').read().strip()+';window.ZGLMB="'+open(D+'zg2/lmb.b64').read().strip()+'";window.ZGLCO=[-10400,-14500];'
else:
    KCJS='window.ZGTREES="'+base64.b64encode(open(D+'zg2/trees.bin','rb').read()).decode()+'";window.ZGBLD="'+open(D+'zg2/bld.b64').read().strip()+'";'
sj='window.ZGWAYS="'+(base64.b64encode(open(D+'zg2/ways.bin','rb').read()).decode() if os.path.exists(D+'zg2/ways.bin') else '')+'";'+'window.ZGSIDE="'+(base64.b64encode(open(D+('zg2/side2.bin' if os.path.exists(D+'zg2/side2.bin') else 'zg2/side.bin'),'rb').read()).decode() if os.path.exists(D+'zg2/side.bin') else '')+'";'+'window.ZGPARK="'+(base64.b64encode(open(D+'zg2/park.png','rb').read()).decode() if os.path.exists(D+'zg2/park.png') else '')+'";'+'window.ZGOW="'+(base64.b64encode(open(D+'zg2/ow.bin','rb').read()).decode() if os.path.exists(D+'zg2/ow.bin') else '')+'";'+'window.SPK=null;'+KCJS+'window.ZGLC="'+base64.b64encode(open(D+'zg2/lc10.png','rb').read()).decode()+'";window.ZGNET='+open(D+'zg2/zg_net.json').read()+';window.ZGRES='+open(D+'zg2/zgres.json').read()+';window.ZGZT='+open(D+'zt/zt2.json').read()+';'+'window.ZSBD='+open(D+'zsb/zsb.json').read()+';'+'window.ZGDB='+(open(D+'zg2/zgdb.json').read() if os.path.exists(D+'zg2/zgdb.json') else 'null')+';'
# 0.11.0: Weltdaten und Medien als eigene Dateien (vom Browser einzeln zwischengespeichert, index.html bleibt klein)
import hashlib
os.makedirs(D+'gpu/data',exist_ok=True)
def wfile(name, js):
    open(D+'gpu/data/'+name,'w').write(js); return name+'?h='+hashlib.md5(js.encode()).hexdigest()[:8]
zs=wfile('zittau.js', sj)
t=t.replace('<script>/*SPK*/</script>','<script src="data/'+zs+'"></script>',1)
supa=open(D+'sbtest/package/dist/umd/supabase.js').read().replace('</script','<\\/script')
full=t.replace('<script>/*SUPA*/</script>','<script>'+supa+'</script>',1).replace('<script>/*THREE*/</script>','<script>'+three+'</script>',1).replace('<script>/*GLTF*/</script>','<script>'+gltf+'</script>',1).replace('<script>/*PROPS*/</script>','<script>'+pj+'</script>',1).replace('<script>/*RIDER*/</script>','<script src="data/'+wfile('media.js',rj)+'"></script>',1)
open(D+'gpu/index.html','w').write(full)
print('size', os.path.getsize(D+'gpu/index.html'))
