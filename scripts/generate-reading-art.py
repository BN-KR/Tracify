"""Dithered artwork for the reading pages (blog, docs, legal).

Reuses the Canvas/render helpers from generate-landing-art.py so the pieces
share the landing page's pixel language. Only the three brand colors.
Run: python3 scripts/generate-reading-art.py -> public/images/reading/*.png
"""
import importlib.util
import math
import os

import numpy as np

here = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("landing_art", os.path.join(here, "generate-landing-art.py"))
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)
art.OUT = os.path.join(here, "..", "public", "images", "reading")
Canvas, glow, render, RNG = art.Canvas, art.glow, art.render, art.RNG


def blog():
    """Paragraphs of text lines drifting into a bright cursor line."""
    w, h = 1600, 900
    c = Canvas(w, h)
    y = 40
    row = 0
    while y < h:
        x = 60 + 40 * math.sin(row * 0.3)
        end = w - 60 - RNG.uniform(0, 500)
        while x < end:
            seg = RNG.uniform(14, 110)
            xx = np.linspace(x, min(x + seg, end), int(seg * 2))
            fade = 0.25 + 0.7 * (y / h)
            c.splat(xx, np.full_like(xx, y), RNG.uniform(0.2, 0.7) * fade)
            x += seg + RNG.uniform(8, 20)
        if row % 9 == 4:
            xx = np.linspace(60, 60 + RNG.uniform(500, 900), 1600)
            c.splat(xx, np.full_like(xx, y), 1.4, "accent")
            c.splat(xx, np.full_like(xx, y + 3), 1.0, "accent")
        row += 1
        y += 22 if row % 9 else 46
    c.base, c.accent = glow(c.base, 1, 0.3, 3), glow(c.accent, 1, 0.9, 6)
    render(c, "blog", px=3)


def docs():
    """Nested bracket frames, like folded sections of a manual."""
    w, h = 1600, 900
    c = Canvas(w, h)
    cx, cy = w * 0.62, h * 0.5
    for i in range(14):
        hw, hh = 90 + i * 52, 60 + i * 30
        layer = "accent" if i == 5 else "base"
        t = np.linspace(0, 1, 900)
        L = 40 + i * 6
        for sx in (-1, 1):
            for sy in (-1, 1):
                x0, y0 = cx + sx * hw, cy + sy * hh
                c.splat(x0 - sx * t * L * 3, np.full_like(t, y0), 1.0, layer)
                c.splat(np.full_like(t, x0), y0 - sy * t * L * 1.8, 1.0, layer)
    gx, gy = np.meshgrid(np.linspace(0, w, 160), np.linspace(0, h, 90))
    c.base[...] += 0
    c.splat(gx.ravel(), gy.ravel(), 0.08)
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 1.1, 8)
    render(c, "docs", px=3)


def legal():
    """Concentric rings of data narrowing to one protected core."""
    w, h = 1600, 900
    c = Canvas(w, h)
    cx, cy = w * 0.7, h * 0.52
    for i in range(1, 30):
        r = i * 34
        n = int(r * 10)
        a = np.linspace(0, 2 * math.pi, n)
        gap = (a % (2 * math.pi / (3 + i % 5))) > 0.25
        layer = "accent" if i == 6 else "base"
        c.splat((cx + r * np.cos(a) * 1.25)[gap], (cy + r * np.sin(a) * 0.8)[gap], 0.9, layer)
    art.sphere_blob(c, cx, cy, 70, 0.02, "accent", 9000)
    c.base, c.accent = glow(c.base, 1, 0.45, 4), glow(c.accent, 1, 1.2, 9)
    render(c, "legal", px=3)


if __name__ == "__main__":
    os.makedirs(art.OUT, exist_ok=True)
    for fn in (blog, docs, legal):
        fn()
