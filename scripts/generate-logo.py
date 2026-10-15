"""Generate the Tracify Dissolve logo files into public/logos/dissolve/ and the
site icons (favicon, app icons). Run from the repo root: python3 scripts/generate-logo.py
The name is the Geist Pixel wordmark from public/logos/cascade-t-a/cascade-logo-main.svg."""
import os
import re
src=open('public/logos/cascade-t-a/cascade-logo-main.svg').read()
WORD=re.search(r'id="tracify"[^>]*?d="([^"]+)"',src).group(1)
Y="#f4d44d"; K="#090909"; C="#eceae3"
U=138/19; TOP=42; BASE=180; TX0=240; TX1=838; DESC=208
B=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
ROWS=[(0,50),(14,26),(28,18)]  # half-size pixels: bars 10 tall, gaps 4, right aligned, 50 wide
def icon_cells(dither=True):
    out=[]
    for y0,w in ROWS:
        x0=50-w
        for y in range(y0,y0+10):
            for x in range(x0,50):
                f=(x-x0+0.5)/w
                if not dither or B[y%4][x%4]/16 < f*1.9-0.15: out.append((x,y))
    return out
def rects(cells,ox,oy,u,col):
    return ''.join(f'<rect x="{ox+x*u:.3f}" y="{oy+y*u:.3f}" width="{u+0.05:.3f}" height="{u+0.05:.3f}" fill="{col}"/>' for x,y in cells)
def wsvg(vb,body,w=None,h=None):
    sz=f' width="{w}" height="{h}"' if w else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{sz} shape-rendering="crispEdges">{body}</svg>'
pad=40
def lockup(text):
    gap=3*U; ix=TX0-gap-25*U
    body=rects(icon_cells(),ix,TOP,U/2,Y)+f'<path fill="{text}" d="{WORD}"/>'
    x0=ix-pad; y0=TOP-pad; return wsvg(f'{x0:.1f} {y0} {TX1+pad-x0:.1f} {DESC+pad-y0}',body)
def wordmark(text):
    return wsvg(f'{TX0-pad} {TOP-pad} {TX1-TX0+2*pad} {DESC-TOP+2*pad}',f'<path fill="{text}" d="{WORD}"/>')
def icon(bg=None,dither=True,col=Y,size=None):
    # 50x38 art centred in a 66x66 square
    body=(f'<rect width="66" height="66" fill="{bg}"/>' if bg else '')+rects(icon_cells(dither),8,14,1,col)
    return wsvg('0 0 66 66',body,size,size)
files={
 'tracify-logo-on-dark.svg':lockup(C),'tracify-logo-on-light.svg':lockup(K),
 'tracify-name-on-dark.svg':wordmark(C),'tracify-name-on-light.svg':wordmark(K),
 'tracify-icon.svg':icon(),'tracify-icon-black.svg':icon(col=K),
 'tracify-app-icon.svg':icon(K),'tracify-app-icon-yellow.svg':icon(Y,col=K),
 'tracify-icon-small.svg':icon(K,dither=False),
}
os.makedirs('public/logos/dissolve',exist_ok=True)
for n,s in files.items(): open('public/logos/dissolve/'+n,'w').write(s)

# Raster icons: solid bars wherever a browser may shrink them to tab size
# (favicon, icon.png); the dissolve only on the home-screen app icon.
from PIL import Image
def raster(size, dither, bg, fg):
    im=Image.new('RGB',(66,66),bg); px=im.load()
    for x,y in icon_cells(dither): px[x+8,y+14]=fg
    return im.resize((size,size),Image.NEAREST)
def solid_small(n):
    # hand-snapped to whole pixels so 16px and 32px stay sharp
    im=Image.new('RGBA',(n,n),(9,9,9,255)); px=im.load()
    u=n/16
    y=1
    for i,(gap,h,w) in enumerate([(0,4,14),(1,4,7),(1,4,5)]):
        y+=gap
        for yy in range(round(y*u),round((y+h)*u)):
            for xx in range(round((15-w)*u),round(15*u)): px[xx,yy]=(244,212,77,255)
        y+=h
    return im
yellow=(244,212,77); black=(9,9,9)
raster(512,False,black,yellow).save('src/app/(frontend)/icon.png')
raster(180,True,black,yellow).save('src/app/(frontend)/apple-icon.png')
ico=[solid_small(n) for n in (16,32,48)]
for p in ('src/app/favicon.ico','src/app/(frontend)/favicon.ico'):
    ico[2].save(p,sizes=[(16,16),(32,32),(48,48)],append_images=ico[:2])
