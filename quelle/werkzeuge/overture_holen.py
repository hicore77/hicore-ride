import sys,re,subprocess,json,fsspec,pyarrow.parquet as pq,pyarrow as pa,concurrent.futures as cf
B='https://overturemaps-us-west-2.s3.amazonaws.com/'
X0,X1,Y0,Y1=14.592,14.891,50.778,50.980
def keys(prefix):
    out=[];tok=None
    while True:
        u=B+'?list-type=2&prefix='+prefix+('&continuation-token='+tok if tok else '')
        s=subprocess.run(['curl','-s',u],capture_output=True,text=True).stdout
        out+=re.findall('<Key>([^<]*)',s); m=re.search('<NextContinuationToken>([^<]*)',s)
        if not m: return out
        tok=m.group(1)
fs=fsspec.filesystem('http')
def stat_idx(md,name):
    for j in range(md.num_columns):
        if md.schema.column(j).path==name: return j
def scan(key,cols):
    f=fs.open(B+key,block_size=1<<20); pf=pq.ParquetFile(f); md=pf.metadata
    ix={n:stat_idx(md,'bbox.'+n) for n in ('xmin','xmax','ymin','ymax')}
    rgs=[]
    for i in range(md.num_row_groups):
        rg=md.row_group(i); s={n:rg.column(j).statistics for n,j in ix.items()}
        if s['xmin'].min>X1 or s['xmax'].max<X0 or s['ymin'].min>Y1 or s['ymax'].max<Y0: continue
        rgs.append(i)
    if not rgs: return None
    t=pf.read_row_groups(rgs,columns=cols)
    bb=t.column('bbox').to_pylist(); keep=[i for i,b in enumerate(bb) if b['xmin']<X1 and b['xmax']>X0 and b['ymin']<Y1 and b['ymax']>Y0]
    return t.take(keep)
if __name__=='__main__':
    prefix,out=sys.argv[1],sys.argv[2]; cols=sys.argv[3].split(',')
    ks=[k for k in keys(prefix) if k.endswith('.parquet')]; print(len(ks),'files',flush=True)
    res=[]
    with cf.ThreadPoolExecutor(8) as ex:
        for k,t in zip(ks,ex.map(lambda k:scan(k,cols),ks)):
            if t is not None and t.num_rows: print(k[-60:],t.num_rows,flush=True); res.append(t)
    T=pa.concat_tables(res); pq.write_table(T,out); print('rows',T.num_rows)
