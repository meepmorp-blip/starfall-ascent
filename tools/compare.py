"""Before/after comparison of two screenshot sets. Usage: python compare.py <beforeLabel> <afterLabel>
Writes tools/out/compare_<before>_vs_<after>/<screen>.png (before | after | changed pixels in red) and prints % changed."""
import sys, os
from PIL import Image, ImageChops

here = os.path.dirname(os.path.abspath(__file__)); a, b = sys.argv[1], sys.argv[2]
A = os.path.join(here, 'out', a); B = os.path.join(here, 'out', b)
O = os.path.join(here, 'out', 'compare_%s_vs_%s' % (a, b)); os.makedirs(O, exist_ok=True)
for f in sorted(os.listdir(A)):
    if not f.endswith('.png') or not os.path.exists(os.path.join(B, f)):
        continue
    x = Image.open(os.path.join(A, f)).convert('RGB'); y = Image.open(os.path.join(B, f)).convert('RGB')
    if x.size != y.size:
        y = y.resize(x.size)
    d = ImageChops.difference(x, y).convert('L').point(lambda v: 255 if v > 24 else 0)
    pct = 100 * d.histogram()[255] / (x.width * x.height)
    red = Image.new('RGB', x.size, (255, 40, 60)); hl = Image.composite(red, y.point(lambda v: v // 3), d)
    s = Image.new('RGB', (x.width * 3 + 16, x.height), (12, 10, 16))
    s.paste(x, (0, 0)); s.paste(y, (x.width + 8, 0)); s.paste(hl, (x.width * 2 + 16, 0)); s.save(os.path.join(O, f))
    print('%5.1f%% changed  %s' % (pct, f))
print('saved to', O)
