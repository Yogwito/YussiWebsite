"""Genera public/media/cobertura/cobertura-colombia.svg (mapa de la sección Cobertura).

Uso: python3 scripts/build-coverage-map.py
Lee los departamentos de media-archive/public/media/cobertura/colombia-departamentos.min.geojson,
simplifica los contornos y dibuja: departamentos, Caldas resaltado, rutas de puntada
desde Manizales hacia ciudades del país (solo puntos, sin rótulos) y arcos hacia el
exterior. Las clases cov-* las anima src/coverage-map.js.
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'media-archive/public/media/cobertura/colombia-departamentos.min.geojson'
OUT = ROOT / 'public/media/cobertura/cobertura-colombia.svg'

W = 560
PAD = 24
MANIZALES = (-75.5138, 5.0703)
# Ciudades de destino (sin rótulos en el mapa).
CITIES = [
    (-74.0721, 4.7110), (-75.5636, 6.2442), (-76.5320, 3.4516), (-74.7964, 10.9639),
    (-75.4794, 10.3910), (-73.1198, 7.1193), (-72.4967, 7.8939), (-75.2322, 4.4389),
    (-74.1990, 11.2408), (-77.2811, 1.2136), (-73.6266, 4.1420), (-75.6906, 4.5339),
]
SKIP = {'88'}  # San Andrés: queda fuera del encuadre continental
LAT0 = math.cos(math.radians(4.5))


def project_raw(lon, lat):
    return lon * LAT0, -lat


def rdp(points, eps):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    norm = math.hypot(dx, dy)
    idx, dmax = 0, 0.0
    for i in range(1, len(points) - 1):
        x0, y0 = points[i]
        # En un anillo cerrado los extremos coinciden: se mide al punto.
        d = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / norm if norm else math.hypot(x0 - x1, y0 - y1)
        if d > dmax:
            idx, dmax = i, d
    if dmax > eps:
        return rdp(points[: idx + 1], eps)[:-1] + rdp(points[idx:], eps)
    return [points[0], points[-1]]


geo = json.loads(SRC.read_text())
features = [f for f in geo['features'] if f['properties']['dpto_ccdgo'] not in SKIP]

rings = []
for f in features:
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        for ring in poly[:1]:  # solo el contorno exterior
            rings.append((f['properties']['dpto_ccdgo'], [project_raw(*p) for p in ring]))

xs = [x for _, r in rings for x, _ in r]
ys = [y for _, r in rings for _, y in r]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
scale = (W - 2 * PAD) / (maxx - minx)
H = round((maxy - miny) * scale + 2 * PAD)


def to_px(x, y):
    return (round((x - minx) * scale + PAD, 1), round((y - miny) * scale + PAD, 1))


def pt(lon, lat):
    return to_px(*project_raw(lon, lat))


by_dept = {}
for code, ring in rings:
    px = rdp([to_px(x, y) for x, y in ring], 0.9)
    if len(px) < 4:
        continue
    d = 'M' + 'L'.join(f'{x:g},{y:g}' for x, y in px) + 'Z'
    by_dept.setdefault(code, []).append(d)

ox, oy = pt(*MANIZALES)
out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" class="cov-svg" aria-hidden="true" focusable="false">']
out.append('<g class="cov-depts">')
for code, ds in by_dept.items():
    cls = 'cov-dept cov-caldas' if code == '17' else 'cov-dept'
    out.append(f'<path class="{cls}" d="{"".join(ds)}"/>')
out.append('</g><g class="cov-routes">')
for lon, lat in CITIES:
    x, y = pt(lon, lat)
    mx, my = (ox + x) / 2, (oy + y) / 2 - math.hypot(x - ox, y - oy) * 0.18
    out.append(f'<path class="cov-route" pathLength="1" d="M{ox:g},{oy:g}Q{mx:.1f},{my:.1f} {x:g},{y:g}"/>')
    out.append(f'<circle class="cov-city" cx="{x:g}" cy="{y:g}" r="3.2"/>')
out.append('</g><g class="cov-abroad">')
for tx, ty in [(-40, 40), (W + 40, 60), (W + 40, H * 0.55)]:
    mx, my = (ox + tx) / 2, min(oy, ty) - 120
    out.append(f'<path class="cov-arc" pathLength="1" d="M{ox:g},{oy:g}Q{mx:.1f},{my:.1f} {tx:g},{ty:g}"/>')
out.append('</g>')
out.append(f'<circle class="cov-pulse" cx="{ox:g}" cy="{oy:g}" r="7"/><circle class="cov-origin" cx="{ox:g}" cy="{oy:g}" r="5"/>')
out.append('</svg>')
OUT.write_text(''.join(out))
print(f'{OUT.relative_to(ROOT)}: {W}x{H}, {OUT.stat().st_size / 1024:.1f} KB, {len(by_dept)} departamentos')
