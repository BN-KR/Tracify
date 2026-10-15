"""Dithered artwork for the product and use-case pages.

Reuses the canvas, glow and dither helpers from generate-landing-art.py so every
image keeps the same three-color pixel language: #090909, #eceae3, #f4d44d.
Run: python3 scripts/generate-page-art.py  -> public/images/pages/*.png
"""
import importlib.util
import math
import os

import numpy as np

here = os.path.dirname(__file__)
spec = importlib.util.spec_from_file_location("landing_art", os.path.join(here, "generate-landing-art.py"))
art = importlib.util.module_from_spec(spec)
spec.loader.exec_module(art)
art.OUT = os.path.join(here, "..", "public", "images", "pages")
Canvas, glow, render, RNG, sphere_blob = art.Canvas, art.glow, art.render, art.RNG, art.sphere_blob


def line(c, p0, p1, gain=1.0, layer="base", n=None):
    n = n or int(max(abs(p1[0] - p0[0]), abs(p1[1] - p0[1])) * 2) + 2
    t = np.linspace(0, 1, n)
    c.splat(p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, gain, layer)


def rect(c, x0, y0, x1, y1, gain=1.0, layer="base", fill=0.0):
    for a, b in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        line(c, a, b, gain, layer)
    if fill:
        xs, ys = np.meshgrid(np.arange(x0, x1, 2), np.arange(y0, y1, 2))
        c.splat(xs.ravel(), ys.ravel(), fill, layer)


def circle(c, cx, cy, r, gain=1.0, layer="base"):
    t = np.linspace(0, 2 * np.pi, int(r * 9) + 40)
    c.splat(cx + r * np.cos(t), cy + r * np.sin(t), gain, layer)


def finish(c, name, soft=0.5, asoft=1.2):
    c.base, c.accent = glow(c.base, 1, soft, 4), glow(c.accent, 1, asoft, 9)
    render(c, name, px=3)


# TRACE: a waterfall of staggered spans receding in isometric depth
def trace_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    rows = 16
    for i in range(rows):
        y = 150 + i * 46
        x0 = 120 + (i * 61) % 380 + i * 14
        ln = 160 + (i * 97) % 420
        hot = i == 9
        layer = "accent" if hot else "base"
        rect(c, x0, y, x0 + ln, y + 22, 1.1, layer, fill=0.45 if hot else 0.18)
        if i:
            line(c, (x0 - 30, y - 24), (x0, y + 11), 0.5)
        circle(c, x0 - 34, y + 11, 5, 0.9, layer)
    for gx in range(0, w, 70):
        line(c, (gx, 100), (gx, h - 60), 0.12, n=400)
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 1.2, 9)
    render(c, "trace-hero", px=3)


# COST: a terraced mountain of stacked spend with a yellow spike
def cost_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    cols = 44
    for i in range(cols):
        x = 90 + i * 28
        base = 880
        hgt = 90 + 360 * (0.5 + 0.5 * math.sin(i * 0.23 + 1)) ** 1.6 + RNG.uniform(0, 40)
        hot = i in (31, 32)
        if hot:
            hgt = 760
        layers = int(hgt // 26)
        for k in range(layers):
            y = base - k * 26
            layer = "accent" if hot or (k == layers - 1 and i % 9 == 0) else "base"
            rect(c, x, y - 22, x + 22, y, 0.9, layer, fill=0.25)
    line(c, (60, 884), (w - 60, 884), 1.0, n=2400)
    sphere_blob(c, 31 * 28 + 100, 150, 160, 0.015, "accent", 9000)
    finish(c, "cost-hero", 0.5, 1.4)


# TOOLS: a hub fanning out to tools, one spoke blocked
def tools_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    cx, cy = w / 2, h / 2
    circle(c, cx, cy, 90, 1.4)
    circle(c, cx, cy, 60, 0.8)
    sphere_blob(c, cx, cy, 55, 0.07, "base", 3000)
    n = 9
    for i in range(n):
        a = i / n * 2 * math.pi + 0.2
        r = 330 + (i % 3) * 70
        tx, ty = cx + r * math.cos(a), cy + r * math.sin(a) * 0.72
        hot = i == 4
        layer = "accent" if hot else "base"
        line(c, (cx + 90 * math.cos(a), cy + 70 * math.sin(a)), (tx, ty), 0.9, layer)
        rect(c, tx - 34, ty - 24, tx + 34, ty + 24, 1.2, layer, fill=0.2)
        for p in np.linspace(0.18, 0.85, 6 if not hot else 3):
            px, py = cx + (tx - cx) * p, cy + (ty - cy) * p
            rect(c, px - 4, py - 4, px + 4, py + 4, 1.4, layer, fill=0.8)
        if hot:
            for k in range(60):
                ax, ay = tx + RNG.normal(0, 70), ty + RNG.normal(0, 55)
                c.splat([ax], [ay], 0.9, "accent")
    for r in (180, 420, 520):
        circle(c, cx, cy, r, 0.12)
    finish(c, "tools-hero", 0.5, 1.3)


# MODELS: stacked waveforms, one model highlighted
def models_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    x = np.linspace(80, w - 80, 3600)
    for i in range(9):
        base = 150 + i * 90
        f1, f2 = RNG.uniform(0.012, 0.03), RNG.uniform(0.04, 0.09)
        amp = 28 + 12 * math.sin(i)
        y = base + amp * np.sin(x * f1 + i) + amp * 0.4 * np.sin(x * f2 + i * 2)
        hot = i == 5
        c.splat(x, y, 1.1, "accent" if hot else "base")
        tick = np.arange(0, len(x), 90)
        for t in tick:
            line(c, (x[t], base + 46), (x[t], base + 46 + (14 if t % 270 else 26)), 0.5)
        if hot:
            c.splat(x, y + 3, 1.0, "accent")
    # first-token marker
    line(c, (420, 100), (420, h - 80), 0.9, "accent", n=900)
    sphere_blob(c, 420, 560, 120, 0.02, "accent", 5000)
    finish(c, "models-hero", 0.5, 1.2)


# FAILURES: ripples spreading from one crack
def failures_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    cx, cy = 520, 520
    for r in range(40, 760, 46):
        t = np.linspace(0, 2 * np.pi, int(r * 7))
        wob = 1 + 0.02 * np.sin(t * 9 + r * 0.05)
        keep = (np.sin(t * 3 + r) > -0.5)
        c.splat((cx + r * wob * np.cos(t))[keep], (cy + r * wob * 0.8 * np.sin(t))[keep], 0.9 if r > 130 else 0.5, "base")
    for _ in range(26):
        a = RNG.uniform(0, 2 * math.pi)
        p = np.array([cx, cy], float)
        for _s in range(14):
            a += RNG.normal(0, 0.35)
            q = p + np.array([math.cos(a), math.sin(a) * 0.9]) * RNG.uniform(14, 50)
            line(c, p, q, 1.5, "accent")
            p = q
    sphere_blob(c, cx, cy, 70, 0.1, "accent", 5000)
    # retry spirals on the right
    t = np.linspace(0, 12 * math.pi, 5000)
    r = 14 + t * 6
    c.splat(1080 + r * np.cos(t) * 0.8, 520 + r * np.sin(t) * 0.8, 0.8)
    finish(c, "failures-hero", 0.5, 1.2)


# USE CASES -----------------------------------------------------------------

def research_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    tip = (1180, 500)
    n = 14
    for i in range(n):
        y = 90 + i * 64
        hot = i == 8
        layer = "accent" if hot else "base"
        rect(c, 90, y, 250, y + 40, 1.0, layer, fill=0.25 if not hot else 0.0)
        for k in range(3):
            line(c, (110, y + 12 + k * 9), (110 + RNG.uniform(60, 120), y + 12 + k * 9), 0.5, layer)
        if hot:
            for s in range(0, 160, 10):
                line(c, (250 + s, y + 20), (260 + s, y + 20), 0.8, "accent")
            continue
        mx = 620 + 140 * math.sin(i)
        t = np.linspace(0, 1, 500)
        xs = 250 + (mx - 250) * t
        ys = (y + 20) + (500 - (y + 20)) * (3 * t**2 - 2 * t**3) * 0.8
        c.splat(xs, ys, 0.6, layer)
        t2 = np.linspace(0, 1, 500)
        xs2 = mx + (tip[0] - mx) * t2
        ys2 = ys[-1] + (tip[1] - ys[-1]) * t2
        c.splat(xs2, ys2, 0.8, layer)
    rect(c, tip[0], tip[1] - 60, tip[0] + 170, tip[1] + 60, 1.4, "base", fill=0.35)
    sphere_blob(c, tip[0] + 85, tip[1], 50, 0.06, "base", 2000)
    finish(c, "research-hero")


def support_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    msgs = 8
    for i in range(msgs):
        left = i % 2 == 0
        x0 = 140 if left else 760
        wd = 300 + (i * 53) % 240
        y = 90 + i * 108
        hot = i == 5
        layer = "accent" if hot else "base"
        rect(c, x0, y, x0 + wd, y + 78, 1.2, layer, fill=0.3 if hot else 0.12)
        for k in range(3):
            line(c, (x0 + 18, y + 20 + k * 18), (x0 + wd * (0.9 - k * 0.2), y + 20 + k * 18), 0.55, layer)
        if i:
            px = 140 + 150 if left else 760 + 150
            line(c, (px, y), (px, y - 30), 0.5)
    # handoff arrow across
    line(c, (460, 560), (940, 560), 1.2, "accent")
    for k in range(5):
        line(c, (940 - k * 3, 560 - 18 + k * 3), (940, 560), 1.0, "accent")
    sphere_blob(c, 1100, 540, 160, 0.015, "accent", 6000)
    finish(c, "support-hero")


def automation_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    nodes = 12
    pts = []
    for i in range(nodes):
        a = i / nodes * 2 * math.pi - math.pi / 2
        pts.append((700 + 380 * math.cos(a), 500 + 330 * math.sin(a)))
    for i, (x, y) in enumerate(pts):
        nx, ny = pts[(i + 1) % nodes]
        hot = i == 6
        layer = "accent" if hot else "base"
        if i != 6:
            line(c, (x, y), (nx, ny), 0.8, layer)
        rect(c, x - 30, y - 22, x + 30, y + 22, 1.3, layer, fill=0.3)
    # retry detour duplicating one step
    x, y = pts[6]
    nx, ny = pts[7]
    for off in (-1, 1):
        mid = ((x + nx) / 2 + off * 70, (y + ny) / 2 + off * 20)
        t = np.linspace(0, 1, 400)
        c.splat((1 - t) ** 2 * x + 2 * (1 - t) * t * mid[0] + t**2 * nx, (1 - t) ** 2 * y + 2 * (1 - t) * t * mid[1] + t**2 * ny, 1.0, "accent")
    for r in (120, 200):
        circle(c, 700, 500, r, 0.18)
    sphere_blob(c, 700, 500, 90, 0.03, "base", 3000)
    finish(c, "automation-hero")


def tool_loop_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    t = np.linspace(0, 9 * math.pi, 9000)
    for k in range(3):
        r = 40 + t * 22 + k * 6
        z = t * 38
        hot = k == 1
        c.splat(700 + r * np.cos(t + k * 0.1), 880 - z * 0.65 + r * 0.32 * np.sin(t + k * 0.1), 0.75 if not hot else 1.0, "accent" if hot else "base")
    for i in range(10):
        y = 880 - i * 80
        circle(c, 700, y + 4, 12, 0.4)
    for i in range(14):
        a = i / 14 * 2 * math.pi
        x, y = 1160 + 120 * math.cos(a), 280 + 120 * math.sin(a)
        rect(c, x - 14, y - 14, x + 14, y + 14, 0.9, "accent" if i == 0 else "base", fill=0.4)
    finish(c, "tool-loop-hero", 0.5, 1.2)


# EVALUATION: a grid of test cases, a few failing, with a pass threshold
def evaluation_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    cols, rows = 14, 9
    for r in range(rows):
        for k in range(cols):
            x, y = 110 + k * 82, 150 + r * 86
            fail = (r, k) in {(2, 3), (4, 9), (6, 5), (6, 6), (1, 11), (7, 2)}
            layer = "accent" if fail else "base"
            rect(c, x, y, x + 58, y + 58, 1.1, layer, fill=0.55 if fail else 0.1)
            if not fail:
                line(c, (x + 14, y + 30), (x + 25, y + 42), 1.2)
                line(c, (x + 25, y + 42), (x + 45, y + 16), 1.2)
            else:
                line(c, (x + 16, y + 16), (x + 42, y + 42), 1.4, "accent")
                line(c, (x + 42, y + 16), (x + 16, y + 42), 1.4, "accent")
    line(c, (80, 835), (w - 60, 835), 0.9, "accent", n=2400)
    finish(c, "evaluation-hero", 0.5, 1.2)


# RUNTIME CONTROL: run costs climbing into a ceiling, one clamped
def control_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    ceiling = 320
    for i in range(22):
        t = np.linspace(0, 1, 600)
        x = 90 + t * (w - 200)
        slope = RNG.uniform(380, 900)
        y = 900 - slope * t ** 1.4 * (0.9 + 0.2 * RNG.random())
        hot = i == 11
        clamp = np.maximum(y, ceiling)
        c.splat(x, clamp if not hot else np.maximum(y, ceiling + 6), 0.7 if not hot else 1.3, "accent" if hot else "base")
        if hot:
            over = y < ceiling
            c.splat(x[over], y[over], 0.25, "accent")
    for k in range(0, w - 160, 18):
        line(c, (90 + k, ceiling), (100 + k, ceiling), 1.2, "accent")
    for k in range(5):
        rect(c, 900 + k * 70, 120 + k * 12, 950 + k * 70, 170 + k * 12, 0.9, "accent" if k == 2 else "base", fill=0.2)
    finish(c, "control-hero", 0.5, 1.2)


# REPORTS: a stack of printed pages with charts and rules
def reports_hero():
    w, h = 1400, 1000
    c = Canvas(w, h)
    for n in range(3):
        ox, oy = 360 + n * 70, 90 + n * 50
        hot = n == 2
        rect(c, ox, oy, ox + 520, oy + 740, 1.2, "base", fill=0.06)
        if not hot:
            continue
        for k in range(4):
            bh = 60 + k * 45 + (k % 2) * 30
            rect(c, ox + 50 + k * 90, oy + 330 - bh, ox + 110 + k * 90, oy + 330, 1.0, "accent" if k == 2 else "base", fill=0.5 if k == 2 else 0.15)
        for k in range(9):
            line(c, (ox + 50, oy + 400 + k * 30), (ox + 50 + RNG.uniform(240, 420), oy + 400 + k * 30), 0.7)
        for k in range(3):
            line(c, (ox + 50, oy + 60 + k * 26), (ox + 50 + 260 - k * 70, oy + 60 + k * 26), 1.2, "accent" if k == 0 else "base")
    finish(c, "reports-hero")


if __name__ == "__main__":
    os.makedirs(art.OUT, exist_ok=True)
    for fn in (trace_hero, cost_hero, tools_hero, models_hero, failures_hero, research_hero, support_hero, automation_hero, tool_loop_hero, evaluation_hero, control_hero, reports_hero):
        fn()
