"""Dithered artwork for the second batch of use-case pages
(chatbot, sales, sql, documents, cost, release, copilot).

Same three-color pixel language as generate-usecase-art.py.
Run: python3 scripts/generate-usecase-art-2.py
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


first = load("usecase_art", "generate-usecase-art.py")
art = first.art
Canvas, sphere_blob, RNG = first.Canvas, first.sphere_blob, first.RNG
line, rect, circle = first.line, first.rect, first.circle
hero, band = first.hero, first.band


# CHATBOT: a stack of speech bubbles; one bubble loses the thread
def chatbot_hero():
    c = Canvas(1400, 1000)
    for i in range(7):
        right = i % 2 == 1
        hot = i == 4
        layer = "accent" if hot else "base"
        w = RNG.uniform(340, 560)
        x0 = 1280 - w if right else 120
        y0 = 90 + i * 128
        rect(c, x0, y0, x0 + w, y0 + 92, 1.2, layer, fill=0.4 if hot else 0.1)
        for r in range(2):
            line(c, (x0 + 24, y0 + 30 + r * 26), (x0 + 24 + RNG.uniform(120, w - 80), y0 + 30 + r * 26), 0.7, layer)
        tx = x0 + w - 40 if right else x0 + 40
        line(c, (tx, y0 + 92), (tx + (16 if right else -16), y0 + 116), 1.0, layer)
        if i:
            line(c, (700, y0 - 36), (700, y0), 0.3, n=60)
    sphere_blob(c, 640, 90 + 4 * 128 + 46, 120, 0.03, "accent", 6000)
    hero(c, "chatbot")


def chatbot_band():
    c = Canvas(1000, 1250)
    for col in range(3):
        for i in range(8):
            x, y = 130 + col * 290, 130 + i * 135
            hot = (col, i) == (1, 5)
            layer = "accent" if hot else "base"
            circle(c, x + 40, y + 40, 38 if hot else 30, 1.2, layer)
            rect(c, x + 90, y + 14, x + 90 + RNG.uniform(70, 150), y + 66, 0.8, layer, fill=0.3 if hot else 0.08)
            if hot:
                sphere_blob(c, x + 80, y + 40, 150, 0.02, "accent", 6000)
    band(c, "chatbot")


# SALES: a funnel of leads; one message goes to the wrong person
def sales_hero():
    c = Canvas(1400, 1000)
    for row in range(14):
        y = 120 + row * 60
        half = 520 - row * 30
        n = max(4, 22 - row)
        for k in range(n):
            x = 700 - half + (2 * half) * k / (n - 1)
            hot = (row, k) == (9, 3)
            layer = "accent" if hot else "base"
            circle(c, x, y, 10 if hot else 7, 1.0, layer)
            if hot:
                sphere_blob(c, x, y, 90, 0.04, "accent", 5000)
    line(c, (180, 100), (700, 940), 0.6, n=1200)
    line(c, (1220, 100), (700, 940), 0.6, n=1200)
    rect(c, 600, 900, 800, 960, 1.4, "base", fill=0.3)
    hero(c, "sales")


def sales_band():
    c = Canvas(1000, 1250)
    for i in range(9):
        y = 110 + i * 125
        w = 780 - i * 70
        hot = i == 6
        layer = "accent" if hot else "base"
        rect(c, 500 - w / 2, y, 500 + w / 2, y + 82, 1.1, layer, fill=0.4 if hot else 0.1)
        line(c, (500 - w / 2 + 20, y + 41), (500 - w / 2 + 20 + w * 0.5, y + 41), 0.6, layer)
        if hot:
            sphere_blob(c, 500, y + 41, 170, 0.02, "accent", 6500)
    band(c, "sales")


# SQL: a grid of tables joined by lines; one join fans out
def sql_hero():
    c = Canvas(1400, 1000)
    boxes = [(140, 140), (140, 560), (600, 330), (1000, 140), (1000, 560)]
    for i, (x, y) in enumerate(boxes):
        hot = i == 2
        layer = "accent" if hot else "base"
        rect(c, x, y, x + 260, y + 280, 1.2, layer, fill=0.35 if hot else 0.08)
        line(c, (x, y + 50), (x + 260, y + 50), 0.9, layer)
        for r in range(5):
            line(c, (x + 20, y + 90 + r * 36), (x + 20 + RNG.uniform(90, 210), y + 90 + r * 36), 0.5, layer)
    for a, b, hot in ((0, 2, False), (1, 2, False), (2, 3, True), (2, 4, True)):
        (x0, y0), (x1, y1) = boxes[a], boxes[b]
        layer = "accent" if hot else "base"
        for k in range(1 if not hot else 5):
            off = (k - 2) * 12
            line(c, (x0 + 260, y0 + 140), (x1, y1 + 140 + off), 0.9, layer)
    sphere_blob(c, 800, 460, 120, 0.03, "accent", 6000)
    hero(c, "sql")


def sql_band():
    c = Canvas(1000, 1250)
    for r in range(11):
        for col in range(5):
            x, y = 110 + col * 165, 110 + r * 100
            hot = r == 6 and col in (1, 2, 3)
            layer = "accent" if hot else "base"
            rect(c, x, y, x + 140, y + 70, 0.9, layer, fill=0.4 if hot else 0.07)
            if hot:
                sphere_blob(c, x + 70, y + 35, 90, 0.02, "accent", 3500)
    band(c, "sql")


# DOCUMENTS: a page with scan lines and extracted field boxes; one field is wrong
def documents_hero():
    c = Canvas(1400, 1000)
    for sheet in range(3):
        o = (2 - sheet) * 26
        rect(c, 300 + o, 80 + o, 800 + o, 930 + o, 1.0, "base", fill=0.03)
    for i in range(22):
        y = 160 + i * 34
        line(c, (340, y), (340 + RNG.uniform(220, 420), y), 0.5)
    fields = [(900, 160), (900, 330), (900, 500), (900, 670)]
    for i, (x, y) in enumerate(fields):
        hot = i == 2
        layer = "accent" if hot else "base"
        rect(c, x, y, x + 380, y + 110, 1.2, layer, fill=0.4 if hot else 0.1)
        line(c, (x + 24, y + 40), (x + 24 + RNG.uniform(120, 230), y + 40), 0.8, layer)
        line(c, (540, y + 55), (x, y + 55), 0.6, layer)
    for sy in range(180, 860, 14):
        line(c, (330, sy), (780, sy), 0.12, n=200)
    sphere_blob(c, 1090, 555, 120, 0.03, "accent", 6000)
    hero(c, "documents")


def documents_band():
    c = Canvas(1000, 1250)
    for i in range(6):
        o = i * 18
        hot = i == 4
        layer = "accent" if hot else "base"
        rect(c, 160 + o, 120 + i * 40, 600 + o, 900 + i * 40, 1.0, layer, fill=0.25 if hot else 0.04)
        if hot:
            for r in range(8):
                line(c, (200 + o, 200 + i * 40 + r * 60), (560 + o, 200 + i * 40 + r * 60), 0.6, "accent")
            sphere_blob(c, 380 + o, 520 + i * 40, 240, 0.015, "accent", 8000)
    band(c, "documents")


# COST: terraced spend that spirals into a runaway loop
def cost_hero():
    c = Canvas(1400, 1000)
    for i in range(36):
        x = 90 + i * 34
        hgt = 90 + 120 * (0.5 + 0.5 * math.sin(i * 0.4))
        for k in range(int(hgt // 22)):
            rect(c, x, 880 - k * 22 - 18, x + 26, 880 - k * 22, 0.8, "base", fill=0.2)
    line(c, (60, 884), (1340, 884), 1.0, n=2400)
    t = np.linspace(0, 7 * np.pi, 2600)
    r = 20 + t * 24
    c.splat(900 + r * np.cos(t) * 0.9, 440 + r * np.sin(t) * 0.7, 1.1, "accent")
    sphere_blob(c, 900, 440, 140, 0.04, "accent", 7000)
    hero(c, "cost-control")


def cost_band():
    c = Canvas(1000, 1250)
    for i in range(14):
        y = 1130 - i * 74
        w = 120 + i * 48 + (60 if i > 9 else 0)
        hot = i >= 10
        layer = "accent" if hot else "base"
        rect(c, 120, y - 56, 120 + w, y, 1.0, layer, fill=0.4 if hot else 0.08)
        if hot and i == 12:
            sphere_blob(c, 120 + w / 2, y - 28, 170, 0.02, "accent", 6500)
    band(c, "cost-control")


# RELEASE: two timelines, old and new, diverging at the change
def release_hero():
    c = Canvas(1400, 1000)
    for lane, y in enumerate((340, 660)):
        for i in range(30):
            x = 100 + i * 40
            hot = lane == 1 and i >= 17
            layer = "accent" if hot else "base"
            h = 30 + 70 * abs(math.sin(i * 0.5 + lane))
            if hot:
                h += (i - 16) * 8
            rect(c, x, y - h / 2, x + 24, y + h / 2, 0.9, layer, fill=0.35 if hot else 0.12)
        line(c, (80, y + 130), (1320, y + 130), 0.5, n=1600)
    line(c, (780, 120), (780, 880), 0.8, n=700)
    circle(c, 780, 500, 22, 1.4, "accent")
    sphere_blob(c, 780, 500, 110, 0.04, "accent", 6000)
    hero(c, "release")


def release_band():
    c = Canvas(1000, 1250)
    for col, x in enumerate((300, 700)):
        for i in range(12):
            y = 100 + i * 92
            hot = col == 1 and i >= 6
            layer = "accent" if hot else "base"
            w = 70 + 60 * abs(math.sin(i * 0.8 + col)) + (i - 5) * 14 * hot
            rect(c, x - w / 2, y, x + w / 2, y + 60, 1.0, layer, fill=0.4 if hot else 0.08)
    sphere_blob(c, 700, 740, 220, 0.015, "accent", 7000)
    line(c, (500, 90), (500, 1160), 0.5, n=1200)
    band(c, "release")


# COPILOT: one assistant hub with gates to company tools; one gate denies
def copilot_hero():
    c = Canvas(1400, 1000)
    cx, cy = 400, 500
    circle(c, cx, cy, 120, 1.4)
    circle(c, cx, cy, 78, 0.9)
    sphere_blob(c, cx, cy, 70, 0.06, "base", 3000)
    for i in range(6):
        y = 130 + i * 148
        hot = i == 3
        layer = "accent" if hot else "base"
        rect(c, 980, y, 1300, y + 100, 1.2, layer, fill=0.35 if hot else 0.1)
        t = np.linspace(0, 1, 800)
        c.splat(cx + 120 + (980 - cx - 120) * t, cy + (y + 50 - cy) * (3 * t**2 - 2 * t**3), 0.8, layer)
        gx = 700
        gy = cy + (y + 50 - cy) * (3 * 0.5**2 - 2 * 0.5**3)
        rect(c, gx - 14, gy - 22, gx + 14, gy + 22, 1.4, layer, fill=0.8 if hot else 0.15)
        if hot:
            sphere_blob(c, gx, gy, 90, 0.04, "accent", 5000)
    hero(c, "copilot")


def copilot_band():
    c = Canvas(1000, 1250)
    for ring in range(5):
        r = 90 + ring * 90
        n = 6 + ring * 3
        for k in range(n):
            a = k / n * 2 * math.pi + ring * 0.3
            hot = (ring, k) == (3, 4)
            layer = "accent" if hot else "base"
            x, y = 500 + r * math.cos(a), 625 + r * math.sin(a) * 1.3
            rect(c, x - 16, y - 12, x + 16, y + 12, 1.0, layer, fill=0.7 if hot else 0.12)
            if hot:
                sphere_blob(c, x, y, 130, 0.03, "accent", 6000)
        circle(c, 500, 625, r, 0.15)
    band(c, "copilot")


if __name__ == "__main__":
    os.makedirs(first.PAGES, exist_ok=True)
    for fn in (chatbot_hero, chatbot_band, sales_hero, sales_band, sql_hero, sql_band, documents_hero, documents_band, cost_hero, cost_band, release_hero, release_band, copilot_hero, copilot_band):
        fn()
