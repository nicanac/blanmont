#!/usr/bin/env python3
"""Shrinks docs/manuel/screens after a capture run so the PDF stays under 25 MB.

Desktop shots: at most 1300 px wide (~185 dpi at the printed 178 mm). Shots shown in a
phone frame (<figure class="phone">, printed 62 mm wide): at most 560 px. JPEG quality 72.
Needs Pillow. Run from the repo root: python3 docs/manuel/scripts/optimize-screens.py
"""
import glob
import os
import re

from PIL import Image

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
phones = set()
for part in glob.glob(os.path.join(root, 'src', 'parts', '*.html')):
    html = open(part, encoding='utf-8').read()
    for fig in re.findall(r'<figure class="[^"]*phone[^"]*".*?</figure>', html, re.S):
        phones |= set(re.findall(r'screens/([^"]+\.jpg)', fig))

done = 0
for path in glob.glob(os.path.join(root, 'screens', '*.jpg')):
    image = Image.open(path)
    image.load()
    limit = 560 if os.path.basename(path) in phones else 1300
    if image.width <= limit:
        continue  # already optimized: re-encoding would only lose quality
    image = image.resize((limit, round(image.height * limit / image.width)), Image.LANCZOS)
    image.convert('RGB').save(path, 'JPEG', quality=72, optimize=True, progressive=True)
    done += 1
print('optimized', done, 'screenshots')
