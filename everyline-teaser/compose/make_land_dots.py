"""Dotted land layers for the motion graphics, from clips/mg/land_src.png (written by `capture3.js mgdata`).
usage: python3 make_land_dots.py <clips/mg>"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
d = sys.argv[1]
a = np.asarray(Image.open(f'{d}/land_src.png').convert('RGB')).astype(int)
land = a.min(2) > 200          # white land in the classic skin by day; sea is blue, the north is dark
m = Image.fromarray((land * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
land = np.asarray(m) > 127
H, W = land.shape
for name, col in [('land_dots_dark.png', (255, 196, 120, 70)), ('land_dots_light.png', (150, 160, 175, 90))]:
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    s, r = 12, 1.7
    for j, y in enumerate(range(0, H, int(s * 0.866))):
        x = (s / 2) if j % 2 else 0
        while x < W:
            if land[int(y), int(x)]:
                dr.ellipse([x - r, y - r, x + r, y + r], fill=col)
            x += s
    im.save(f'{d}/{name}')
print('ok', W, H)
