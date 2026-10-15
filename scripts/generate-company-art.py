"""Dithered artwork for the company pages (contact, security, status, ...).

Same recipe and palette as scripts/generate-landing-art.py (it reuses that
file's canvas, dither and perspective helpers).
Run: python3 scripts/generate-company-art.py  -> public/images/company/*.png
"""
import importlib.util
import math
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("landing_art", os.path.join(HERE, "generate-landing-art.py"))
la = importlib.util.module_from_spec(spec)
spec.loader.exec_module(la)
la.OUT = os.path.join(HERE, "..", "public", "images", "company")
Canvas, glow, render, project, floor_grid, sphere_blob, bezier = (
    la.Canvas, la.glow, la.render, la.project, la.floor_grid, la.sphere_blob, la.bezier,
)
RNG = np.random.default_rng(11)


def line(c, p0, p1, gain=0.7, layer="base", n=None):
    n = n or int(max(abs(p1[0] - p0[0]), abs(p1[1] - p0[1])) * 1.5) + 2
    t = np.linspace(0, 1, n)
    c.splat(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, gain, layer)


def rect(c, x0, y0, x1, y1, gain=0.7, layer="base"):
    for a, b in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        line(c, a, b, gain, layer)


def fill(c, x0, y0, x1, y1, gain, layer="base"):
    yy, xx = np.mgrid[int(y0):int(y1), int(x0):int(x1)]
    getattr(c, layer)[yy, xx] += gain


def contact():
    """Messages arcing in from every side to one envelope."""
    w, h = 1800, 900
    c = Canvas(w, h)
    floor_grid(c, w, h, gain=0.12, horizon=0.62, cam_h=3.4)
    tx, ty = w * 0.68, h * 0.5
    for i in range(46):
        a = RNG.uniform(math.pi * 0.05, math.pi * 0.95) * (1 if i % 2 else -1) + (0 if i % 2 else math.pi)
        r = RNG.uniform(900, 1200)
        sx, sy = tx + r * math.cos(a), ty + r * 0.7 * math.sin(a)
        cx, cy = (sx + tx) / 2 + RNG.uniform(-220, 220), (sy + ty) / 2 + RNG.uniform(-220, 220)
        t = np.linspace(0, 1, 1500)
        bx = (1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t ** 2 * tx
        by = (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t ** 2 * ty
        c.splat(bx, by, 0.5 * (0.2 + t))
        k = int(RNG.uniform(0.35, 0.95) * 1500)
        sphere_blob(c, bx[k], by[k], 7, 0.35, "accent" if i % 5 == 0 else "base", 120)
    ew, eh = 300, 190
    fill(c, tx - ew / 2, ty - eh / 2, tx + ew / 2, ty + eh / 2, 1.0, "accent")
    rect(c, tx - ew / 2 - 14, ty - eh / 2 - 14, tx + ew / 2 + 14, ty + eh / 2 + 14, 0.9)
    # flap cut out of the yellow so the envelope reads
    for k in range(5):
        line(c, (tx - ew / 2, ty - eh / 2 + k * 2), (tx, ty + 6 + k * 2), -1.0, "accent")
        line(c, (tx + ew / 2, ty - eh / 2 + k * 2), (tx, ty + 6 + k * 2), -1.0, "accent")
    c.accent = np.clip(c.accent, 0, None)
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 0.8, 6)
    render(c, "contact-signal", px=3)


def security():
    """Nested hexagonal boundaries around a locked core."""
    w, h = 1800, 900
    c = Canvas(w, h)
    cx, cy = w * 0.68, h * 0.5
    for k in range(1, 10):
        r = 70 * k
        pts = [(cx + r * math.cos(math.pi / 3 * i + math.pi / 6), cy + r * 0.86 * math.sin(math.pi / 3 * i + math.pi / 6)) for i in range(7)]
        for a, b in zip(pts, pts[1:]):
            line(c, a, b, 0.55 if k != 3 else 0.9, "base" if k != 3 else "accent")
        for p in pts[:-1]:
            sphere_blob(c, p[0], p[1], 6, 0.3, "base", 60)
    yy, xx = np.mgrid[0:h, 0:w]
    lattice = ((xx % 36 < 2) & (yy % 36 < 2)) * np.clip(1 - np.hypot(xx - cx, yy - cy) / 800, 0, 1) * 0.5
    c.base += lattice
    # solid core with a keyhole carved out
    d = np.hypot(xx - cx, (yy - cy) / 0.86)
    c.accent += (d < 62) * 1.4
    c.accent *= ~((np.hypot(xx - cx, yy - (cy - 10)) < 15) | ((abs(xx - cx) < 7) & (yy > cy - 8) & (yy < cy + 30)))
    c.base, c.accent = glow(c.base, 1, 0.4, 4), glow(c.accent, 1, 0.9, 7)
    render(c, "security-boundaries", px=3)


def status():
    """Stacked heartbeat lines, one of them spiking in yellow."""
    w, h = 1800, 900
    c = Canvas(w, h)
    rows = 24
    x = np.arange(0, w, 0.5)
    for i in range(rows):
        y0 = 150 + i * 28
        depth = i / rows
        phase = RNG.uniform(0, 400)
        beat = 300 + i * 4
        y = y0 + 3 * np.sin(x / 40 + i)
        pos = (x + phase) % beat
        spike = np.where((pos > 0) & (pos < 36), -np.sin(pos / 36 * math.pi) * (20 + 55 * depth) * np.where(pos < 12, 1, -0.6), 0)
        y = y + spike
        hidden_above = i > 0
        c.splat(x, y, 0.35 + 0.55 * depth, "accent" if i == 17 else "base")
        if hidden_above:
            pass
    # solid fill under the front line to mask lines behind it like ridges
    c.base, c.accent = glow(c.base, 1, 0.4, 3), glow(c.accent, 1, 1.1, 6)
    render(c, "status-pulse", px=3)


def integrations():
    """A hub with adapters orbiting on three rings."""
    w, h = 1800, 900
    c = Canvas(w, h)
    cx, cy = w * 0.68, h * 0.5
    ry = 0.5
    sphere_blob(c, cx, cy, 70, 1.3, "accent", 9000)
    for ring, (r, n) in enumerate(((190, 6), (330, 10), (470, 14))):
        t = np.linspace(0, 2 * math.pi, 3500)
        c.splat(cx + r * np.cos(t), cy + r * ry * np.sin(t), 0.22)
        for i in range(n):
            a = 2 * math.pi * i / n + ring * 0.4
            nx, ny = cx + r * math.cos(a), cy + r * ry * math.sin(a)
            line(c, (cx, cy), (nx, ny), 0.14, "base")
            hit = (i + ring) % 4 == 0
            s = 20
            fill(c, nx - s, ny - s * 0.7, nx + s, ny + s * 0.7, 0.9, "accent" if hit else "base")
            rect(c, nx - s - 8, ny - s * 0.7 - 8, nx + s + 8, ny + s * 0.7 + 8, 0.4)
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 0.9, 7)
    render(c, "integrations-hub", px=3)


def roadmap():
    """Blocks climbing toward a rising sun."""
    w, h = 1800, 900
    c = Canvas(w, h)
    hz, cam = 0.34, 5.5
    P = lambda x, y, z: project(x, y, z, w, h, cam_h=cam, horizon=hz)
    floor_grid(c, w, h, gain=0.16, horizon=hz, cam_h=cam)
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy, r = w * 0.68, h * hz, 300
    d = np.hypot(xx - cx, yy - cy)
    c.accent += np.clip(1 - d / r, 0, 1) * (yy < cy) * ((np.sin((yy - cy) * 0.14) > -0.3) | (yy < cy - 120)) * 2.5
    steps = 6
    for i in range(steps):
        z0, z1 = 6 + i * 6, 11 + i * 6
        top = 0.8 + i * 0.9
        x0, x1 = -3.0 + i * 0.1 + 4.2, 3.0 - i * 0.1 + 4.2
        corners = lambda yv: [(x0, yv, z0), (x1, yv, z0), (x1, yv, z1), (x0, yv, z1)]
        for yv in (0, top):
            pts = corners(yv)
            for a, b in zip(pts, pts[1:] + pts[:1]):
                t = np.linspace(0, 1, 900)
                sx, sy = P(a[0] + (b[0] - a[0]) * t, yv + 0 * t, a[2] + (b[2] - a[2]) * t)
                c.splat(sx, sy, 0.9, "accent" if i == steps - 1 else "base")
        for (px_, _, pz) in corners(0):
            t = np.linspace(0, top, 400)
            sx, sy = P(px_ + 0 * t, t, pz + 0 * t)
            c.splat(sx, sy, 0.8, "accent" if i == steps - 1 else "base")
        # shade the front face
        fx = np.linspace(x0, x1, 260)
        for yv in np.linspace(0.02, top, int(top * 18)):
            sx, sy = P(fx, yv + 0 * fx, z0 + 0 * fx)
            c.splat(sx, sy, 0.1 + 0.05 * i)
    c.base, c.accent = glow(c.base, 1, 0.4, 4), glow(c.accent, 1, 0.8, 6)
    render(c, "roadmap-steps", px=3)


def changelog():
    """Release layers stacked like sediment, newest on top in yellow."""
    w, h = 1800, 900
    c = Canvas(w, h)
    n = 15
    for i in range(n):
        y = 120 + i * 48
        x0 = 760 + (i % 3) * 14
        x1 = w - 160 - (i % 4) * 22
        shift = 26
        top = i == 0
        gain = 1.0 if top else 0.18 + 0.5 * (1 - i / n)
        layer = "accent" if top or i == 5 else "base"
        fill(c, x0, y, x1, y + 34, gain * (1 if layer == "accent" else 0.45), layer)
        line(c, (x0, y), (x1, y), 0.9, layer)
        line(c, (x1, y), (x1 + shift, y - 18), 0.7, layer)
        line(c, (x1 + shift, y - 18), (x1 + shift, y + 16), 0.6, layer)
        for tick in range(int(RNG.integers(3, 8))):
            tx = RNG.uniform(x0 + 30, x1 - 30)
            line(c, (tx, y + 6), (tx, y + 28), -0.3 if layer == "base" else -0.8, "base" if layer == "base" else "accent")
    c.base = np.clip(c.base, 0, None)
    c.accent = np.clip(c.accent, 0, None)
    c.base, c.accent = glow(c.base, 1, 0.3, 3), glow(c.accent, 1, 0.8, 5)
    render(c, "changelog-strata", px=3)


def glossary():
    """A page of definitions: lines of text blocks, a few lit in yellow."""
    w, h = 1800, 900
    c = Canvas(w, h)
    rows = 30
    for i in range(rows):
        y = 70 + i * 26
        x = 120 + (i % 5) * 6
        while x < w - 140:
            seg = RNG.choice([40, 70, 110, 160, 230])
            gap = RNG.choice([14, 22])
            hot = RNG.random() < 0.05
            fill(c, x, y, min(x + seg, w - 140), y + 8, 0.85 if hot else RNG.uniform(0.15, 0.5), "accent" if hot else "base")
            x += seg + gap
            if RNG.random() < 0.06:
                x += RNG.choice([200, 360])
    yy, xx = np.mgrid[0:h, 0:w]
    c.base *= np.clip(1 - np.hypot(xx - w / 2, yy - h / 2) / 1100, 0.15, 1)
    c.base, c.accent = glow(c.base, 1, 0.2, 2), glow(c.accent, 1, 0.6, 4)
    render(c, "glossary-text", px=3)


def region():
    """Two dotted globes joined by one bright arc."""
    w, h = 1800, 900
    c = Canvas(w, h)
    centers = ((w * 0.52, h * 0.52, 260), (w * 0.84, h * 0.5, 200))
    for gx, gy, r in centers:
        n = 14000
        phi = np.arccos(RNG.uniform(-1, 1, n))
        th = RNG.uniform(0, 2 * math.pi, n)
        x, y, z = r * np.sin(phi) * np.cos(th), r * np.cos(phi), r * np.sin(phi) * np.sin(th)
        shade = np.clip((z / r + 1) / 2, 0, 1) ** 1.4
        c.splat(gx + x, gy + y, 0.4 * shade)
        for tilt in (0.25, -0.5):
            t = np.linspace(0, 2 * math.pi, 2500)
            ox, oy = (r + 60) * np.cos(t), (r + 60) * 0.28 * np.sin(t)
            c.splat(gx + ox * math.cos(tilt) - oy * math.sin(tilt), gy + ox * math.sin(tilt) + oy * math.cos(tilt), 0.3)
    (ax, ay, ar), (bx, by, br) = centers
    t = np.linspace(0, 1, 2600)
    px_, py_ = ax + ar * 0.6, ay - ar * 0.55
    qx, qy = bx - br * 0.6, by - br * 0.5
    mx, my = (px_ + qx) / 2, min(py_, qy) - 260
    arcx = (1 - t) ** 2 * px_ + 2 * (1 - t) * t * mx + t ** 2 * qx
    arcy = (1 - t) ** 2 * py_ + 2 * (1 - t) * t * my + t ** 2 * qy
    c.splat(arcx, arcy, 0.9, "accent")
    for k in (0, 2599):
        sphere_blob(c, arcx[k], arcy[k], 16, 0.5, "accent", 900)
    sphere_blob(c, arcx[1700], arcy[1700], 9, 0.5, "accent", 400)
    c.base, c.accent = glow(c.base, 1, 0.5, 5), glow(c.accent, 1, 1.0, 7)
    render(c, "region-link", px=3)


def demo():
    """A play button built from nested run lines."""
    w, h = 1800, 900
    c = Canvas(w, h)
    floor_grid(c, w, h, gain=0.12, horizon=0.7, cam_h=3.0)
    cx, cy = w * 0.68, h * 0.5
    for k in range(10, 0, -1):
        s = 34 * k
        pts = [(cx - s * 0.55, cy - s), (cx - s * 0.55, cy + s), (cx + s * 0.95, cy)]
        for a, b in zip(pts, pts[1:] + pts[:1]):
            line(c, a, b, 0.7 if k > 1 else 0.9, "base" if k != 4 else "accent")
    yy, xx = np.mgrid[0:h, 0:w]
    s = 34
    inside = (xx > cx - s * 0.55) & (yy > cy - (cx + s * 0.95 - xx) * (s / (s * 1.5)) * 1.0) & (yy < cy + (cx + s * 0.95 - xx) * (s / (s * 1.5)) * 1.0) & (xx < cx + s * 0.95)
    c.accent += inside * 1.6
    c.base, c.accent = glow(c.base, 1, 0.4, 4), glow(c.accent, 1, 0.9, 7)
    render(c, "demo-play", px=3)


if __name__ == "__main__":
    os.makedirs(la.OUT, exist_ok=True)
    for fn in (contact, security, status, integrations, roadmap, changelog, glossary, region, demo):
        fn()
