"""Dithered artwork for the extra use-case pages (coding, RAG, voice, browser, multi-agent, MCP).

Same three-color pixel language as generate-page-art.py.
Run: python3 scripts/generate-usecase-art.py
  -> public/images/pages/<slug>-hero.png (1400x1000) and public/images/landing/uc-<slug>.png (1000x1250)
"""
import importlib.util
import math
import os

import numpy as np

here = os.path.dirname(__file__)


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(here, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


page = load("page_art", "generate-page-art.py")
art = page.art
Canvas, glow, render, RNG, sphere_blob = art.Canvas, art.glow, art.render, art.RNG, art.sphere_blob
line, rect, circle = page.line, page.rect, page.circle
PAGES = os.path.join(here, "..", "public", "images", "pages")
LANDING = os.path.join(here, "..", "public", "images", "landing")


def finish(c, name, out):
    art.OUT = out
    c.base, c.accent = glow(c.base, 1, 0.5, 4), glow(c.accent, 1, 1.2, 9)
    render(c, name, px=3)


def hero(c, slug):
    finish(c, f"{slug}-hero", PAGES)


def band(c, slug):
    finish(c, f"uc-{slug}", LANDING)


# CODING: an editor of code lines with a diff and one failing test
def coding_hero():
    c = Canvas(1400, 1000)
    rect(c, 90, 90, 760, 900, 1.2, "base", fill=0.05)
    for i in range(24):
        y = 140 + i * 32
        ind = 40 * (i % 4 in (1, 2)) + 40 * (i % 7 == 3)
        line(c, (130 + ind, y), (130 + ind + RNG.uniform(80, 420 - ind), y), 0.8, "base")
        if i in (9, 10, 11):
            line(c, (110, y), (110, y + 4), 1.4, "accent")
    for k in range(5):
        y = 150 + k * 150
        hot = k == 3
        layer = "accent" if hot else "base"
        rect(c, 880, y, 1290, y + 90, 1.1, layer, fill=0.3 if hot else 0.1)
        line(c, (905, y + 30), (905 + RNG.uniform(120, 260), y + 30), 0.8, layer)
        line(c, (905, y + 58), (905 + RNG.uniform(60, 200), y + 58), 0.6, layer)
        if k:
            line(c, (1085, y - 60), (1085, y), 0.7)
    sphere_blob(c, 1085, 150 + 3 * 150 + 45, 90, 0.03, "accent", 5000)
    hero(c, "coding")


def coding_band():
    c = Canvas(1000, 1250)
    for i in range(18):
        y = 120 + i * 60
        depth = (i * 37) % 4
        hot = i == 11
        layer = "accent" if hot else "base"
        x = 150 + depth * 70
        line(c, (x - 40, y), (x - 10, y), 0.6, layer)
        rect(c, x, y - 16, x + RNG.uniform(220, 480), y + 16, 1.0, layer, fill=0.4 if hot else 0.1)
        if hot:
            sphere_blob(c, x + 200, y, 110, 0.02, "accent", 6000)
    band(c, "coding")


# RAG: chunks scattered, the query ray picks the top results, one off-topic chunk is chosen
def rag_hero():
    c = Canvas(1400, 1000)
    pts = []
    for i in range(160):
        x, y = RNG.uniform(120, 1280), RNG.uniform(120, 880)
        pts.append((x, y))
        rect(c, x - 9, y - 6, x + 9, y + 6, 0.7, "base", fill=0.2)
    q = (240, 500)
    circle(c, q[0], q[1], 34, 1.6, "base")
    sphere_blob(c, q[0], q[1], 40, 0.05, "base", 2500)
    near = sorted(pts, key=lambda p: (p[0] - 720) ** 2 + (p[1] - 500) ** 2)[:6]
    for k, p in enumerate(near):
        hot = k == 4
        layer = "accent" if hot else "base"
        t = np.linspace(0, 1, 500)
        c.splat(q[0] + (p[0] - q[0]) * t, q[1] + (p[1] - q[1]) * t, 0.9, layer)
        rect(c, p[0] - 16, p[1] - 11, p[0] + 16, p[1] + 11, 1.5, layer, fill=0.5 if hot else 0.15)
        if hot:
            sphere_blob(c, p[0], p[1], 80, 0.03, "accent", 5000)
    hero(c, "rag")


def rag_band():
    c = Canvas(1000, 1250)
    for layer_i in range(6):
        y = 160 + layer_i * 170
        for col in range(5):
            x = 130 + col * 160 + (layer_i % 2) * 40
            hot = (layer_i, col) == (3, 2)
            layer = "accent" if hot else "base"
            rect(c, x, y, x + 120, y + 100, 1.0, layer, fill=0.3 if hot else 0.08)
            for r in range(3):
                line(c, (x + 14, y + 26 + r * 22), (x + 14 + RNG.uniform(40, 90), y + 26 + r * 22), 0.5, layer)
            if hot:
                sphere_blob(c, x + 60, y + 50, 130, 0.02, "accent", 6000)
    band(c, "rag")


# VOICE: waveform with a silent gap where latency hurt
def voice_hero():
    c = Canvas(1400, 1000)
    n = 70
    for i in range(n):
        x = 100 + i * 18
        gap = 40 <= i <= 47
        env = 0.2 + 0.8 * abs(math.sin(i * 0.31)) * (0.5 + 0.5 * math.sin(i * 0.07))
        hgt = 20 if gap else 60 + env * 340 + RNG.uniform(0, 60)
        layer = "accent" if gap else "base"
        line(c, (x, 500 - hgt / 2), (x, 500 + hgt / 2), 1.2, layer, n=int(hgt) + 4)
        if gap:
            line(c, (x - 6, 500 - 160), (x - 6, 500 + 160), 0.18, "accent")
    for k in range(4):
        y = 770 + k * 34
        line(c, (100, y), (100 + RNG.uniform(500, 1100), y), 0.4)
    sphere_blob(c, 100 + 43.5 * 18, 500, 110, 0.04, "accent", 6000)
    hero(c, "voice")


def voice_band():
    c = Canvas(1000, 1250)
    cx, cy = 500, 625
    for i in range(13):
        r = 60 + i * 38
        hot = i == 8
        layer = "accent" if hot else "base"
        t = np.linspace(0.15, 2 * np.pi - 0.15, int(r * 8))
        wob = 1 + 0.05 * np.sin(t * (6 + i % 4))
        c.splat(cx + r * wob * np.cos(t), cy + r * wob * np.sin(t) * 1.15, 0.9, layer)
        if hot:
            sphere_blob(c, cx, cy, r, 0.01, "accent", 6000)
    band(c, "voice")


# BROWSER: a page with targets and a cursor path that loops on a missed click
def browser_hero():
    c = Canvas(1400, 1000)
    rect(c, 140, 110, 1260, 890, 1.2, "base", fill=0.04)
    line(c, (140, 180), (1260, 180), 1.0)
    for k in range(3):
        circle(c, 176 + k * 34, 145, 8, 0.9)
    for i in range(7):
        x, y = 200 + (i % 3) * 360, 260 + (i // 3) * 220
        hot = i == 4
        layer = "accent" if hot else "base"
        rect(c, x, y, x + 280, y + 130, 1.0, layer, fill=0.4 if hot else 0.1)
        line(c, (x + 24, y + 40), (x + 24 + RNG.uniform(100, 200), y + 40), 0.7, layer)
    t = np.linspace(0, 6 * np.pi, 1400)
    r = 90 + 8 * t
    hx, hy = 560 + 180, 480 + 65 - 0
    c.splat(hx + (60 - 4 * t) * np.cos(t) * 0.9, hy + (60 - 4 * t) * np.sin(t) * 0.9, 1.3, "accent")
    sphere_blob(c, hx, hy, 90, 0.03, "accent", 5000)
    hero(c, "browser")


def browser_band():
    c = Canvas(1000, 1250)
    for i in range(5):
        y = 120 + i * 220
        hot = i == 3
        layer = "accent" if hot else "base"
        rect(c, 120, y, 880, y + 170, 1.0, layer, fill=0.25 if hot else 0.06)
        line(c, (120, y + 36), (880, y + 36), 0.7, layer)
        for k in range(2):
            rect(c, 160 + k * 340, y + 66, 460 + k * 340, y + 140, 0.8, layer)
        if hot:
            sphere_blob(c, 500, y + 100, 200, 0.02, "accent", 7000)
    band(c, "browser")


# MULTI-AGENT: nodes with handoff arrows, one dropped handoff
def multi_agent_hero():
    c = Canvas(1400, 1000)
    nodes = [(200, 500), (520, 250), (520, 750), (860, 150), (860, 500), (860, 850), (1200, 330), (1200, 680)]
    edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 4), (2, 5), (3, 6), (4, 6), (4, 7), (5, 7)]
    for a, b in edges:
        hot = (a, b) == (4, 7)
        layer = "accent" if hot else "base"
        (x0, y0), (x1, y1) = nodes[a], nodes[b]
        t = np.linspace(0, 1, 600 if not hot else 280)
        c.splat(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0.9, layer)
    for i, (x, y) in enumerate(nodes):
        hot = i == 7
        layer = "accent" if hot else "base"
        rect(c, x - 56, y - 36, x + 56, y + 36, 1.3, layer, fill=0.4 if hot else 0.12)
        circle(c, x, y, 10, 1.0, layer)
    sphere_blob(c, 1030, 590, 110, 0.03, "accent", 5000)
    hero(c, "multi-agent")


def multi_agent_band():
    c = Canvas(1000, 1250)
    for i in range(4):
        cx = 500 + (-1) ** i * 120
        cy = 220 + i * 280
        hot = i == 2
        layer = "accent" if hot else "base"
        circle(c, cx, cy, 90, 1.2, layer)
        circle(c, cx, cy, 48, 0.9, layer)
        if i < 3:
            nx, ny = 500 + (-1) ** (i + 1) * 120, 220 + (i + 1) * 280
            t = np.linspace(0.2, 0.8, 500)
            c.splat(cx + (nx - cx) * t, cy + 90 + (ny - 90 - cy - 90) * t, 0.9, "accent" if hot else "base")
        if hot:
            sphere_blob(c, cx, cy, 180, 0.015, "accent", 7000)
    band(c, "multi-agent")


# MCP: one client, rows of servers, one timing out
def mcp_hero():
    c = Canvas(1400, 1000)
    rect(c, 90, 380, 330, 620, 1.4, "base", fill=0.25)
    sphere_blob(c, 210, 500, 70, 0.05, "base", 2500)
    for i in range(7):
        y = 100 + i * 120
        hot = i == 4
        layer = "accent" if hot else "base"
        rect(c, 900, y, 1300, y + 80, 1.1, layer, fill=0.4 if hot else 0.1)
        for k in range(3):
            circle(c, 940 + k * 34, y + 40, 8, 0.9, layer)
        t = np.linspace(0, 1, 700 if not hot else 380)
        sx = 330 + (900 - 330) * t
        sy = 500 + (y + 40 - 500) * (3 * t**2 - 2 * t**3)
        c.splat(sx, sy, 0.8, layer)
        if hot:
            sphere_blob(c, 900, y + 40, 100, 0.03, "accent", 5000)
    hero(c, "mcp")


def mcp_band():
    c = Canvas(1000, 1250)
    for i in range(7):
        y = 130 + i * 160
        hot = i == 4
        layer = "accent" if hot else "base"
        rect(c, 120, y, 300, y + 90, 1.0, layer, fill=0.15)
        rect(c, 700, y, 880, y + 90, 1.0, layer, fill=0.4 if hot else 0.1)
        xs = np.linspace(300, 700 if not hot else 520, 500)
        c.splat(xs, np.full_like(xs, y + 45), 0.9, layer)
        if hot:
            sphere_blob(c, 540, y + 45, 150, 0.02, "accent", 6000)
    band(c, "mcp")


if __name__ == "__main__":
    os.makedirs(PAGES, exist_ok=True)
    for fn in (coding_hero, coding_band, rag_hero, rag_band, voice_hero, voice_band, browser_hero, browser_band, multi_agent_hero, multi_agent_band, mcp_hero, mcp_band):
        fn()
