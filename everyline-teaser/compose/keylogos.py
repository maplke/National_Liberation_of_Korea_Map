import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
# --- Maplegrid: cream on dark green -> transparent
im=np.asarray(Image.open(f'{src}/2eb88e8a-image.png').convert('RGB')).astype(float)
bg=np.array([38,67,51.])
mask=(np.abs(im-bg).sum(2)<6)
ys,xs=np.where(mask)
def panel(x0,x1,y0,y1,name):
    p=im[y0:y1,x0:x1]
    d=p-bg; fg=np.array([251,247,236.])-bg
    a=np.clip((d*fg).sum(2)/(fg*fg).sum(),0,1)
    col=np.where(a[...,None]>0.02, bg+d/np.maximum(a[...,None],1e-3), 0)
    rgba=np.dstack([np.clip(col,0,255),a*255]).astype(np.uint8)
    img=Image.fromarray(rgba,'RGBA'); img=img.crop(img.getbbox()); img.save(f'{out}/{name}.png'); print(name,img.size)
# find dark panels: columns where mask present in top half / bottom half
top=mask[:400]; bot=mask[400:]
def bounds(m,yoff,xmin):
    ys,xs=np.where(m[:,xmin:]); return xs.min()+xmin+4, xs.max()+xmin-4, ys.min()+yoff+4, ys.max()+yoff-4
x0,x1,y0,y1=bounds(top,0,1000); panel(x0,x1,y0,y1,'maplegrid_h')
x0,x1,y0,y1=bounds(bot,400,400); panel(x0,x1,y0,y1,'maplegrid_v')
# --- ER logos: white exterior -> transparent (flood from border), soft edge band
def keywhite(fn,name):
    """White -> transparent for the exterior AND for enclosed counters (holes ringed only by the
    light-grey halo, e.g. the bowl of R or the inside of e/a/ㅇ). Pill interiors (ringed by black)
    and the thin white gaps between a coloured stroke and its halo stay opaque white."""
    img=Image.open(f'{src}/{fn}').convert('RGB'); a=np.asarray(img).astype(float)
    near=(a.min(2)>238)
    H,W=near.shape
    work=Image.fromarray((near*255).astype(np.uint8)).copy()
    clear=np.zeros(near.shape,bool)
    ys,xs=np.where(near)
    wk=np.asarray(work).copy()
    for y,x in zip(ys[::7],xs[::7]):
        if wk[y,x]!=255: continue
        ImageDraw.floodfill(work,(int(x),int(y)),100)
        wk=np.asarray(work).copy(); reg=(wk==100)
        if not reg.any():
            continue
        bb=np.where(reg)
        ext = bb[0].min()==0 or bb[1].min()==0 or bb[0].max()==H-1 or bb[1].max()==W-1
        if ext: clear|=reg
        else:
            ring=(np.asarray(Image.fromarray((reg*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)))>0)&~reg
            c=a[ring]; sat=c.max(1)-c.min(1); lum=c.mean(1)
            grey=((sat<22)&(lum>150)).mean(); dark=(lum<90).mean(); colr=(sat>=40).mean()
            if grey>0.6 and dark<0.3 and colr<0.05: clear|=reg
        wk[reg]=50; work=Image.fromarray(wk).copy()
    band=np.asarray(Image.fromarray(clear.astype(np.uint8)*255).filter(ImageFilter.MaxFilter(5)))>0
    alpha=np.ones(clear.shape)
    ca=np.clip((255-a).max(2)/255,0,1)
    edge=band&~clear
    alpha[edge]=np.clip(ca[edge]/0.12,0,1)
    alpha[clear]=0
    rgba=np.dstack([a,alpha*255]).astype(np.uint8)
    o=Image.fromarray(rgba,'RGBA'); o=o.crop(o.getbbox()); o.save(f'{out}/{name}.png'); print(name,o.size,'cleared px',int(clear.sum()))
keywhite('281194bb-image.png','er_banner')
keywhite('de874b47-image.png','er_icon')
# --- Maplegrid dark-on-cream (top-left panel) for light backgrounds
im=np.asarray(Image.open(f'{src}/2eb88e8a-image.png').convert('RGB')).astype(float)
bg=np.array([251,247,236.]); fg=np.array([38,67,51.])
crm=(np.abs(im-bg).sum(2)<6)
ys,xs=np.where(crm[:400,:1000]); x0,x1,y0,y1=xs.min()+4,xs.max()-4,ys.min()+4,ys.max()-4
p=im[y0:y1,x0:x1]; d=p-bg; v=fg-bg
a=np.clip((d*v).sum(2)/(v*v).sum(),0,1)
col=np.where(a[...,None]>0.02, bg+d/np.maximum(a[...,None],1e-3), 0)
img=Image.fromarray(np.dstack([np.clip(col,0,255),a*255]).astype(np.uint8),'RGBA'); img=img.crop(img.getbbox()); img.save(f'{out}/maplegrid_dark.png'); print('maplegrid_dark',img.size)
