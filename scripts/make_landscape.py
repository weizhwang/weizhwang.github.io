#!/usr/bin/env python3
"""Draw the homepage art: a convex loss landscape for a ball to roll down to its minimum.

    python3 scripts/make_landscape.py    # writes images/landscape-light.svg and images/landscape-dark.svg

The page shows one of the two files depending on the site theme (see assets/css/site.css).
The ball is not part of the picture: assets/js/bowl.js rolls it over the bowl in the page,
using the geometry this script writes into that file.
"""
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PALETTES = {
    # on the light theme's white page; line = the site's accent colour
    "light": dict(fill_low="#cddbf7", fill_high="#ffffff", back="#eef3fb", line="#2257c9"),
    # on the dark theme's #0e1117 page
    "dark": dict(fill_low="#1c2c4c", fill_high="#0e1117", back="#151b25", line="#7aaaff"),
}

# --------------------------------------------------------------------- bowl
A, B, DEPTH = 190.0, 150.0, 80.0        # rim semi-axes and depth at r = 1 (world units)
R_MAX = 1.1                             # the surface runs a little past r = 1 and fades out
FADE = (0.86, 1.02)                     # the edge fade, in radii of the r = 1 level set
AZ, EL = math.radians(-8), math.radians(40)
TO_CAM = (-math.cos(EL) * math.sin(AZ), -math.cos(EL) * math.cos(AZ), math.sin(EL))
BALL_R = 10.0
R_START = 0.92                          # the ball starts at most this far out
MARGIN = 6.0


def height(x, y):
    return DEPTH * (x * x / (A * A) + y * y / (B * B))


def rotate(x, y):
    return x * math.cos(AZ) - y * math.sin(AZ), x * math.sin(AZ) + y * math.cos(AZ)


def project(x, y, z):
    """Screen position; the centre of the r = 1 level set sits at the origin."""
    xr, yr = rotate(x, y)
    return xr, -yr * math.sin(EL) - (z - DEPTH) * math.cos(EL)


def depth(x, y, z):
    return rotate(x, y)[1] * math.cos(EL) - z * math.sin(EL)


def polar(r, th):
    x, y = A * r * math.cos(th), B * r * math.sin(th)
    return x, y, height(x, y)


def frame():
    """Bounding box of everything visible: the faded rim, the bottom and the ball wherever it starts."""
    pts = [project(*polar(FADE[1], 2 * math.pi * j / 360)) for j in range(360)]
    pts.append(project(0.0, 0.0, 0.0))
    for j in range(360):
        px, py = project(*polar(R_START, 2 * math.pi * j / 360))
        pts += [(px - BALL_R, py - 2 * BALL_R), (px + BALL_R, py + BALL_R)]
    x0, y0 = min(p[0] for p in pts) - MARGIN, min(p[1] for p in pts) - MARGIN
    x1, y1 = max(p[0] for p in pts) + MARGIN, max(p[1] for p in pts) + MARGIN
    return x0, y0, x1 - x0, y1 - y0


# ---------------------------------------------------------------- rendering
def num(v, nd=1):
    return f"{v:.{nd}f}".rstrip("0").rstrip(".")


def hex2rgb(h):
    return [int(h[i:i + 2], 16) for i in (1, 3, 5)]


def rgb2hex(c):
    return "#" + "".join(f"{max(0, min(255, round(x))):02x}" for x in c)


def mix(a, b, t):
    return [x + (y - x) * t for x, y in zip(a, b)]


def poly_d(pts, close=False):
    s = "M" + " L".join(f"{num(x)} {num(y)}" for x, y in pts)
    return s + ("Z" if close else "")


def faces(P, nr=18, nt=72):
    """Softly shaded mesh of the bowl, far to near; the level sets are drawn on top."""
    rs = [R_MAX * math.sqrt(i / nr) for i in range(nr + 1)]
    ts = [2 * math.pi * j / nt for j in range(nt + 1)]
    low, high = hex2rgb(P["fill_low"]), hex2rgb(P["fill_high"])
    light = (-0.5, 0.45, 0.74)
    out = []
    for i in range(nr):
        for j in range(nt):
            corners = [polar(rs[i], ts[j]), polar(rs[i + 1], ts[j]),
                       polar(rs[i + 1], ts[j + 1]), polar(rs[i], ts[j + 1])]
            rm, tm = (rs[i] + rs[i + 1]) / 2, (ts[j] + ts[j + 1]) / 2
            # outward normal of z = DEPTH (x^2/A^2 + y^2/B^2), up-facing
            x, y, _ = polar(rm, tm)
            n = [-2 * DEPTH * x / (A * A), -2 * DEPTH * y / (B * B), 1.0]
            norm = math.sqrt(sum(c * c for c in n))
            lam = max(0.0, sum(n[c] / norm * light[c] for c in range(3)))
            t = min(1.0, rm * rm) ** 0.7
            if sum(n[c] * TO_CAM[c] for c in range(3)) > 0:
                fill = rgb2hex([c * (0.93 + 0.1 * lam) for c in mix(low, high, t)])
            else:
                fill = P["back"]                                # the outside of the near rim
            d = sum(depth(*c) for c in corners) / 4
            out.append((d, [project(*c) for c in corners], fill))
    out.sort(key=lambda f: -f[0])
    return out


def hidden(x, y, z):
    """True if the surface blocks the line of sight from (x, y, z) to the camera."""
    for k in range(1, 400):
        px, py, pz = (x + k * TO_CAM[0], y + k * TO_CAM[1], z + k * TO_CAM[2])
        if px * px / (A * A) + py * py / (B * B) > R_MAX * R_MAX:
            return False
        if height(px, py) > pz + 0.5:
            return True
    return False


def visible_runs(points):
    """Split a polyline on the surface into the projected pieces the camera can see."""
    runs, run = [], []
    for p in points:
        if hidden(*p):
            if len(run) > 1:
                runs.append(run)
            run = []
        else:
            run.append(project(*p))
    if len(run) > 1:
        runs.append(run)
    return runs


def svg(theme):
    P = PALETTES[theme]
    vx, vy, vw, vh = frame()
    box = f'x="{num(vx)}" y="{num(vy)}" width="{num(vw)}" height="{num(vh)}"'
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{num(vx)} {num(vy)} {num(vw)} {num(vh)}" '
         f'width="{num(vw)}" height="{num(vh)}" aria-hidden="true">']

    # projected r = 1 level set as an affine image of the unit circle, for the edge fade
    a, b = A * math.cos(AZ), -A * math.sin(AZ) * math.sin(EL)
    c, d = -B * math.sin(AZ), -B * math.cos(AZ) * math.sin(EL)
    o.append(f'<defs>'
             f'<radialGradient id="edge" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" '
             f'gradientTransform="matrix({num(a, 3)} {num(b, 3)} {num(c, 3)} {num(d, 3)} 0 0)">'
             f'<stop offset="{FADE[0]}" stop-color="#fff"/>'
             f'<stop offset="{FADE[1]}" stop-color="#fff" stop-opacity="0"/>'
             f'</radialGradient>'
             f'<mask id="fade" maskUnits="userSpaceOnUse" {box}>'
             f'<rect {box} fill="url(#edge)"/></mask>'
             f'</defs>')

    # the landscape: a softly shaded surface with its level sets and meridians as fine lines,
    # hidden where the near rim covers them
    o.append('<g mask="url(#fade)">')
    o.append('<g stroke-width=".6" stroke-linejoin="round">')
    for _, pts, fill in faces(P):
        o.append(f'<path d="{poly_d(pts, True)}" fill="{fill}" stroke="{fill}"/>')
    o.append("</g>")
    o.append(f'<g fill="none" stroke="{P["line"]}" stroke-linecap="round" stroke-linejoin="round">')
    for kk in range(1, 11):
        r = R_MAX * math.sqrt(kk / 10)
        ring = [polar(r, 2 * math.pi * j / 240) for j in range(241)]
        for run in visible_runs(ring):
            o.append(f'<path d="{poly_d(run)}" stroke-width="1" stroke-opacity=".55"/>')
    for kk in range(16):
        th = 2 * math.pi * kk / 16
        spoke = [polar(R_MAX * (0.12 + 0.88 * i / 40), th) for i in range(41)]
        for run in visible_runs(spoke):
            o.append(f'<path d="{poly_d(run)}" stroke-width=".7" stroke-opacity=".3"/>')
    o.append("</g></g>")
    o.append("</svg>")
    return "\n".join(o) + "\n"


def write_geometry():
    """Copy the bowl's geometry into the page script that rolls the ball."""
    js = ROOT / "assets" / "js" / "bowl.js"
    geometry = dict(A=A, B=B, DEPTH=DEPTH, AZ=round(math.degrees(AZ), 6), EL=round(math.degrees(EL), 6),
                    R_MAX=R_MAX, R_START=R_START, BALL_R=BALL_R, VIEW=[float(num(v)) for v in frame()])
    text, n = re.subn(r"(// BEGIN geometry[^\n]*\n).*?(\n[ \t]*// END geometry)",
                      lambda m: m.group(1) + "  var G = " + json.dumps(geometry) + ";" + m.group(2),
                      js.read_text(), flags=re.S)
    if n != 1:
        raise SystemExit(f"no geometry block in {js}")
    js.write_text(text)
    return js


def main():
    for theme in PALETTES:
        name = ROOT / "images" / f"landscape-{theme}.svg"
        name.write_text(svg(theme))
        print("wrote", name, f"{name.stat().st_size / 1024:.0f} KB")
    print("updated", write_geometry())


if __name__ == "__main__":
    main()
