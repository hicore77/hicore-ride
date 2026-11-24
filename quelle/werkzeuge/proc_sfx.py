#!/usr/bin/env python3
"""Rohsounds aus raw2/ aufbereiten -> sfx/*.mp3
Loops: Lautheit angleichen, Ende per Überblendung nahtlos an den Anfang legen.
Einzelgeräusche: Stille an den Rändern weg, Lautheit angleichen, Maximallänge."""
import subprocess, sys, os, numpy as np
D=os.path.dirname(os.path.abspath(__file__))+'/'
LOOPS={'regen':-21,'nassreifen':-22,'nacht':-26,'bach':-22,'see':-24,'grillen':-26,'bienen':-26,'meer':-20,'wind':-20,'laub':-22,'reifen':-22,'fahrtwind':-22,'freilauf':-22,'traktorloop':-22,'dampferloop':-22,'e_klein':-20,'e_kombi':-20,'e_suv':-20,'e_van':-20,'e_sport':-20,'e_alt':-20,'e_traktor':-20,'zsb_fahrt':-20}
HIRATE={'regen','nassreifen','freilauf','laub','grillen','reifen'}
MAXLEN={'donner1':6,'donner2':6,'specht':6,'ziege':5,'kuh2':4,'lerche':6,'kuhglocken':6}
def run(a): subprocess.run(a,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def dec(f,sr):
    r=subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(sr),'-f','f32le','-'],check=True,capture_output=True)
    return np.frombuffer(r.stdout,dtype=np.float32).copy()
def enc(x,sr,out,br):
    p=subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(sr),'-ac','1','-i','-','-b:a',br,out],input=x.astype(np.float32).tobytes(),check=True)
names=sys.argv[1:] or [f[:-4] for f in sorted(os.listdir(D+'raw2')) if f.endswith('.mp3')]
for n in names:
    src=D+'raw2/'+n+'.mp3'; tmp=D+'raw2/_'+n+'.wav'
    sr=32000 if n in HIRATE else 22050
    if n in LOOPS:
        run(['ffmpeg','-y','-i',src,'-af','loudnorm=I=%d:TP=-2:LRA=11'%LOOPS[n],'-ac','1','-ar',str(sr),tmp])
        x=dec(tmp,sr); F=int(0.6*sr); N=len(x)
        y=x[:N-F].copy(); w=np.linspace(0,1,F,dtype=np.float32)
        y[:F]=x[:F]*np.sqrt(w)+x[N-F:]*np.sqrt(1-w)   # Ende blendet in den Anfang -> nahtlos
        enc(y,sr,D+'sfx/'+n+'.mp3','48k' if n in HIRATE else '40k')
    else:
        af='silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-18:TP=-1.5'
        if n in MAXLEN: af+=',atrim=0:%g,afade=t=out:st=%g:d=0.4'%(MAXLEN[n],MAXLEN[n]-0.4)
        run(['ffmpeg','-y','-i',src,'-af',af,'-ac','1','-ar',str(sr),'-b:a','32k',D+'sfx/'+n+'.mp3'])
    os.path.exists(tmp) and os.remove(tmp)
    out=D+'sfx/'+n+'.mp3'
    d=subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out],capture_output=True,text=True).stdout.strip()
    print('%-11s %5.2fs %6d B'%(n,float(d),os.path.getsize(out)))
