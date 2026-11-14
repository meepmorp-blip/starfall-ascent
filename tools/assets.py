"""Asset helpers for Starfall (Pillow + imageio). Run: python assets.py <command> ...
  slice  <sheet.png> <frameW> [frameH] [outDir]        cut a sprite sheet into frames
  sheet  <outSheet.png> <frame1.png> <frame2.png> ...  join frames into one row
  gif    <sheet.png> <frameW> <out.gif> [fps] [scale]  animated preview of a sheet
  scale  <in.png> <out.png> <factor>                   nearest-neighbour resize (keeps pixels crisp)
  trim   <in.png> <out.png>                            crop transparent borders
  pal    <in.png> <out.png> <colors>                   reduce to N colours (smaller files, tighter pixel look)
  key    <in.png> <out.png> <#rrggbb> [tol]            make a flat background colour transparent
  b64    <in.png>                                      print a data: URI to embed in index.html
"""
import sys, os, base64
from PIL import Image


def frames(sheet, fw, fh=None):
    im = Image.open(sheet).convert('RGBA')
    fh = fh or im.height
    return [im.crop((x, y, x + fw, y + fh)) for y in range(0, im.height - fh + 1, fh) for x in range(0, im.width - fw + 1, fw)]


def main(a):
    if len(a) < 2:
        print(__doc__); return
    c = a[1]
    if c == 'slice':
        fw = int(a[3]); fh = int(a[4]) if len(a) > 4 and a[4].isdigit() else None
        out = a[5] if len(a) > 5 else os.path.splitext(a[2])[0] + '_frames'
        os.makedirs(out, exist_ok=True)
        fr = frames(a[2], fw, fh)
        for i, f in enumerate(fr):
            f.save(os.path.join(out, '%02d.png' % i))
        print('sliced', len(fr), 'frames to', out)
    elif c == 'sheet':
        fs = [Image.open(p).convert('RGBA') for p in a[3:]]
        w = max(f.width for f in fs); h = max(f.height for f in fs)
        s = Image.new('RGBA', (w * len(fs), h), (0, 0, 0, 0))
        for i, f in enumerate(fs):
            s.paste(f, (i * w, 0))
        s.save(a[2]); print('sheet', a[2], len(fs), 'frames')
    elif c == 'gif':
        import imageio.v3 as iio, numpy as np
        fps = int(a[5]) if len(a) > 5 else 8; k = int(a[6]) if len(a) > 6 else 3
        fr = []
        for f in frames(a[2], int(a[3])):
            bg = Image.new('RGBA', f.size, (26, 22, 34, 255)); bg.alpha_composite(f)
            fr.append(np.array(bg.resize((f.width * k, f.height * k), Image.NEAREST).convert('RGB')))
        iio.imwrite(a[4], fr, duration=1000 // fps, loop=0); print('gif', a[4], len(fr), 'frames')
    elif c == 'scale':
        im = Image.open(a[2]); k = float(a[4])
        im.resize((round(im.width * k), round(im.height * k)), Image.NEAREST).save(a[3]); print('scaled', a[3])
    elif c == 'trim':
        im = Image.open(a[2]).convert('RGBA'); bb = im.getbbox(); im.crop(bb).save(a[3]); print('trimmed to', bb)
    elif c == 'pal':
        im = Image.open(a[2]).convert('RGBA'); al = im.getchannel('A')
        q = im.convert('RGB').quantize(int(a[4]), method=Image.Quantize.MEDIANCUT).convert('RGBA'); q.putalpha(al)
        q.save(a[3], optimize=True); print('palette', a[4], ':', os.path.getsize(a[2]), '->', os.path.getsize(a[3]), 'bytes')
    elif c == 'key':
        im = Image.open(a[2]).convert('RGBA'); h = a[4].lstrip('#')
        kr, kg, kb = [int(h[i:i + 2], 16) for i in (0, 2, 4)]; tol = int(a[5]) if len(a) > 5 else 12
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, _ = px[x, y]
                if abs(r - kr) <= tol and abs(g - kg) <= tol and abs(b - kb) <= tol:
                    px[x, y] = (r, g, b, 0)
        im.save(a[3]); print('keyed', a[3])
    elif c == 'b64':
        print('data:image/png;base64,' + base64.b64encode(open(a[2], 'rb').read()).decode())
    else:
        print(__doc__)


main(sys.argv)
