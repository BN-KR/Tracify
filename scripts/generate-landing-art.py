"""Generate the dithered artwork used on the marketing landing page.

Every image is procedural (no stock or AI imagery) and uses only the three
brand colors: near-black #090909, cream #eceae3 and yellow #f4d44d.
Run: python3 scripts/generate-landing-art.py  -> public/images/landing/*.png
"""
import math
import os

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images", "landing")
BLACK, CREAM, YELLOW = (9, 9, 9), (236, 234, 227), (244, 212, 77)
RNG = np.random.default_rng(7)

BAYER8 = np.array([
    [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21],
]) / 64.0


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.base = np.zeros((h, w))
        self.accent = np.zeros((h, w))

    def splat(self, xs, ys, vals, layer="base"):
        xs = np.asarray(xs).round().astype(int)
        ys = np.asarray(ys).round().astype(int)
        vals = np.broadcast_to(np.asarray(vals, dtype=float), xs.shape)
        ok = (xs >= 0) & (xs < self.w) & (ys >= 0) & (ys < self.h)
        np.add.at(getattr(self, layer), (ys[ok], xs[ok]), vals[ok])


def blur(a, r):
    if r <= 0:
        return a
    for axis in (0, 1):
        c = np.cumsum(np.pad(a, [(r + 1, r) if i == axis else (0, 0) for i in range(2)], mode="edge"), axis=axis)
        if axis == 0:
            a = (c[2 * r + 1:] - c[:-2 * r - 1]) / (2 * r + 1)
        else:
            a = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
    return a


def glow(a, sharp=1.0, soft=0.6, r=6):
    return np.clip(blur(a, 1) * sharp + blur(blur(a, r), r) * soft, 0, None)


def render(c, name, px=3, base_gain=1.0, accent_gain=1.0):
    def dither(layer, gain):
        small = layer[::px, ::px] * gain
        small = small / (np.percentile(small, 99.6) + 1e-9)
        small = np.clip(small, 0, 1) ** 0.8
        hh, ww = small.shape
        th = np.tile(BAYER8, (hh // 8 + 1, ww // 8 + 1))[:hh, :ww]
        return small > th
    b = dither(c.base, base_gain)
    a = dither(c.accent, accent_gain) if c.accent.any() else np.zeros_like(b)
    img = np.zeros(b.shape + (3,), dtype=np.uint8)
    img[:] = BLACK
    img[b] = CREAM
    img[a] = YELLOW
    im = Image.fromarray(img).resize((b.shape[1] * px, b.shape[0] * px), Image.NEAREST)
    im = im.quantize(colors=3, method=Image.Quantize.FASTOCTREE)
    path = os.path.join(OUT, f"{name}.png")
    im.save(path, optimize=True)
    print(name, im.size, os.path.getsize(path) // 1024, "KB")


def project(x, y, z, w, h, cam_h=3.2, fov=1.1, horizon=0.36):
    """Perspective onto screen; z is depth (>0), y up."""
    f = w / (2 * math.tan(fov / 2))
    sx = w / 2 + x * f / z
    sy = h * horizon + (cam_h - y) * f / z
    return sx, sy


def floor_grid(c, w, h, step=1.0, depth=60, density=900, gain=0.12, horizon=0.36, cam_h=3.2):
    for gx in np.arange(-30, 30.01, step):
        z = np.linspace(1.2, depth, density)
        sx, sy = project(np.full_like(z, gx), 0 * z, z, w, h, cam_h=cam_h, horizon=horizon)
        c.splat(sx, sy, gain / (z ** 0.6))
    for gz in np.arange(1.5, depth, step):
        x = np.linspace(-30, 30, density * 2)
        sx, sy = project(x, 0 * x, np.full_like(x, gz), w, h, cam_h=cam_h, horizon=horizon)
        c.splat(sx, sy, gain / (gz ** 0.6))


def bezier(p0, p1, n=400):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1 = np.array(p0, float), np.array(p1, float)
    m0 = p0 + np.array([0, 0, (p1[2] - p0[2]) * 0.5])
    m1 = p1 - np.array([0, 0, (p1[2] - p0[2]) * 0.5])
    return ((1 - t) ** 3) * p0 + 3 * ((1 - t) ** 2) * t * m0 + 3 * (1 - t) * t * t * m1 + t ** 3 * p1


def sphere_blob(c, cx, cy, r, gain, layer="base", n=2500):
    ang = RNG.uniform(0, 2 * np.pi, n)
    rad = r * np.sqrt(RNG.uniform(0, 1, n))
    c.splat(cx + rad * np.cos(ang), cy + rad * np.sin(ang), gain, layer)


# 1. HERO: a run's flow graph floating over an endless floor grid
def hero():
    w, h = 1800, 1100
    c = Canvas(w, h)
    cam, hz = 7.5, 0.12
    P = lambda x, y, z: project(x, y, z, w, h, cam_h=cam, horizon=hz)
    floor_grid(c, w, h, gain=0.22, horizon=hz, cam_h=cam)
    Y = 0.4
    nodes = {
        "agent": (0, Y, 10), "chat": (0, Y, 13), "docs": (-4, Y, 13.5),
        "order": (4, Y, 13.5), "retry": (0, Y, 20), "refund": (0, Y, 24),
        "a1": (-8, Y, 20), "a2": (8, Y, 22), "a3": (-6, Y, 27), "a4": (6, Y, 29),
    }
    edges = [("agent", "chat"), ("chat", "docs"), ("chat", "order"), ("docs", "retry"),
             ("order", "retry"), ("retry", "refund"), ("docs", "a1"), ("order", "a2"),
             ("a1", "a3"), ("a2", "a4")]
    for a, b in edges:
        pts = bezier(nodes[a], nodes[b], 1400)
        sx, sy = P(pts[:, 0], pts[:, 1], pts[:, 2])
        c.splat(sx, sy, 0.7)
        for t in RNG.uniform(0.2, 0.8, 2):
            p = pts[int(t * len(pts))]
            qx, qy = P(*p)
            sphere_blob(c, qx, qy, 70 / p[2], 0.08, "accent", 500)
    for k, (x, y, z) in nodes.items():
        layer = "accent" if k == "refund" else "base"
        # card: rectangle lying on the floor plane
        hw, hd = 1.5, 0.7
        t = np.linspace(-1, 1, 800)
        for xs, zs in ((t * hw, np.full_like(t, -hd)), (t * hw, np.full_like(t, hd)),
                       (np.full_like(t, -hw), t * hd), (np.full_like(t, hw), t * hd)):
            sx, sy = P(x + xs, y + 0 * xs, z + zs)
            c.splat(sx, sy, 1.4, layer)
        gx, gz = np.meshgrid(np.linspace(-hw, hw, 60), np.linspace(-hd, hd, 30))
        sx, sy = P(x + gx.ravel(), y + 0 * gx.ravel(), z + gz.ravel())
        c.splat(sx, sy, 0.06 if layer == "base" else 0.2, layer)
        # pillar of light above each node
        hy = np.linspace(0, 2.5 if k == "refund" else 1.0, 500)
        sx, sy = P(np.full_like(hy, x), y + hy, np.full_like(hy, z))
        c.splat(sx, sy, np.linspace(0.6, 0, 500), layer)
        if k == "refund":
            qx, qy = P(x, y, z)
            sphere_blob(c, qx, qy, 220, 0.02, "accent", 12000)
    c.base, c.accent = glow(c.base, 1, 0.8, 5), glow(c.accent, 1, 1.4, 10)
    render(c, "hero-graph", px=3)


# 2. CAPTURE: hundreds of noisy streams converge into one clean line
def capture():
    w, h = 1400, 1000
    c = Canvas(w, h)
    x = np.linspace(0, w, 2400)
    for i in range(70):
        y0 = RNG.uniform(-100, h + 100)
        phase, amp = RNG.uniform(0, 6.3), RNG.uniform(10, 60)
        k = np.clip(x / (w * 0.72), 0, 1)
        y = y0 * (1 - k ** 1.6) + h / 2 * k ** 1.6 + amp * np.sin(x / 70 + phase) * (1 - k)
        c.splat(x, y, 0.35, "accent" if i == 11 else "base")
    xx = np.linspace(w * 0.72, w, 600)
    c.splat(xx, np.full_like(xx, h / 2), 6, "accent")
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 1.2, 8)
    render(c, "capture-streams", px=3)


# 3. COST: an isometric city of bars, one tower burning budget
def cost():
    w, h = 1400, 1000
    c = Canvas(w, h)
    iso = lambda gx, gy, z: (w / 2 + (gx - gy) * 46, h * 0.62 + (gx + gy) * 24 - z)
    for gx in range(-6, 7):
        for gy in range(-6, 7):
            hgt = 30 + 120 * abs(math.sin(gx * 0.7) * math.cos(gy * 0.5)) + RNG.uniform(0, 40)
            hot = (gx, gy) == (2, -1)
            if hot:
                hgt = 520
            layer = "accent" if hot else "base"
            for ex, ey in ((0, 0), (1, 0), (0, 1), (1, 1)):
                bx, by = iso(gx + ex * 0.7, gy + ey * 0.7, 0)
                zz = np.linspace(0, hgt, int(hgt * 2))
                c.splat(np.full_like(zz, bx), by - zz, 0.6, layer)
            for z in (0, hgt):
                t = np.linspace(0, 0.7, 120)
                for a, b in ((t, 0 * t), (t, 0 * t + 0.7), (0 * t, t), (0 * t + 0.7, t)):
                    sx, sy = iso(gx + a, gy + b, z)
                    c.splat(sx, sy, 1.0 if z else 0.3, layer)
            if hot:
                sx, sy = iso(gx + 0.35, gy + 0.35, hgt)
                sphere_blob(c, sx, sy, 160, 0.02, "accent", 9000)
    c.base, c.accent = glow(c.base, 1, 0.4, 4), glow(c.accent, 1, 1.2, 9)
    render(c, "cost-city", px=3)


# 4. FAILURE: a chain of steps where one shatters
def failure():
    w, h = 1400, 1000
    c = Canvas(w, h)
    xs = np.linspace(140, w - 140, 7)
    for i, x in enumerate(xs):
        y = h / 2 + math.sin(i * 0.9) * 60
        if i == 4:
            frag = RNG.normal(0, 1, (5000, 2)) * [120, 90]
            frag[:, 0] += np.abs(frag[:, 0]) * 0.8
            c.splat(x + frag[:, 0], y + frag[:, 1], 0.5, "accent")
            sphere_blob(c, x, y, 70, 0.08, "accent", 3000)
            continue
        t = np.linspace(0, 2 * np.pi, 1400)
        c.splat(x + 48 * np.cos(t), y + 48 * np.sin(t), 1.2)
        sphere_blob(c, x, y, 30, 0.05, "base", 1500)
        if i < len(xs) - 1 and i != 3:
            nx, ny = xs[i + 1], h / 2 + math.sin((i + 1) * 0.9) * 60
            tt = np.linspace(0, 1, 800)
            c.splat(x + (nx - x) * tt, y + (ny - y) * tt, 0.8)
    floor_grid(c, w, h, gain=0.05, horizon=0.5)
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 1.3, 9)
    render(c, "failure-shatter", px=3)


# 5. GLOBE: point sphere with orbiting runs, for "works with your stack"
def globe():
    w = h = 1200
    c = Canvas(w, h)
    n = 26000
    phi = np.arccos(RNG.uniform(-1, 1, n))
    th = RNG.uniform(0, 2 * np.pi, n)
    r = 380
    x, y, z = r * np.sin(phi) * np.cos(th), r * np.cos(phi), r * np.sin(phi) * np.sin(th)
    shade = np.clip((z / r + 1) / 2, 0, 1) ** 1.5
    c.splat(w / 2 + x, h / 2 + y, 0.4 * shade)
    for i, (tilt, rr) in enumerate(((0.4, 470), (-0.7, 520), (1.2, 560))):
        t = np.linspace(0, 2 * np.pi, 4000)
        ox, oy = rr * np.cos(t), rr * 0.32 * np.sin(t)
        rx = ox * math.cos(tilt) - oy * math.sin(tilt)
        ry = ox * math.sin(tilt) + oy * math.cos(tilt)
        c.splat(w / 2 + rx, h / 2 + ry, 0.5, "accent" if i == 0 else "base")
        k = 900 + i * 1100
        sphere_blob(c, w / 2 + rx[k], h / 2 + ry[k], 14, 0.15, "accent", 600)
    c.base, c.accent = glow(c.base, 1, 0.6, 5), glow(c.accent, 1, 1.0, 8)
    render(c, "globe-orbits", px=3)


# 6. HORIZON: a sun rising over the grid, for the final call to action
def horizon():
    w, h = 1800, 900
    c = Canvas(w, h)
    floor_grid(c, w, h, gain=0.2, horizon=0.55)
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy, r = w / 2, h * 0.55, 330
    d = np.hypot(xx - cx, yy - cy)
    sun = np.clip(1 - d / r, 0, 1) * (yy < cy)
    bands = (np.sin((yy - cy) * 0.12 * (1 + (cy - yy) / 200)) > -0.2) | (yy < cy - 160)
    c.accent += sun * bands * 3
    c.accent += np.clip(1 - d / (r * 2.2), 0, 1) ** 3 * 0.6 * (yy < cy)
    c.base, c.accent = glow(c.base, 1, 0.5, 4), c.accent
    render(c, "horizon-sun", px=3)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in (hero, capture, cost, failure, globe, horizon):
        fn()
