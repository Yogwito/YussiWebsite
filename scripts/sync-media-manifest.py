"""Sincroniza media-manifest.json con public/media/.

Actualiza bytes y dimensiones, quita las entradas de archivos que ya no existen
y agrega los nuevos. Un archivo nuevo hereda sección y alt de otra variante del
mismo recurso (mismo nombre sin el ancho final, p. ej. foo-1600.webp → foo-2000.avif).

Uso: python3 scripts/sync-media-manifest.py   (requiere Pillow; ffprobe para videos)
"""
import datetime
import json
import re
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / 'media-manifest.json'
MEDIA = ROOT / 'public/media'
SKIP = {'.DS_Store', 'README.md'}
SECTION_BY_FOLDER = {'brand': 'marca', 'hero': 'hero', 'proceso': 'proceso', 'nosotros': 'nosotros',
                     'clientes': 'clientes', 'proveedores': 'proveedores', 'cobertura': 'cobertura', 'productos': 'productos'}


def family(path):
  return re.sub(r'(-\d{3,4})?\.[a-z0-9]+$', '', path)


def probe(file):
  info = {'bytes': file.stat().st_size}
  ext = file.suffix.lower()
  if ext in ('.webp', '.avif', '.jpg', '.jpeg', '.png'):
    try:
      with Image.open(file) as im:
        info['dimensions'] = f'{im.width}x{im.height}'
    except Exception:
      # Pillow sin soporte AVIF: se usa sips (macOS)
      out = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(file)], capture_output=True, text=True).stdout
      w, h = re.findall(r'pixel(?:Width|Height): (\d+)', out)
      info['dimensions'] = f'{w}x{h}'
  elif ext == '.mp4':
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:format=duration',
                          '-of', 'json', str(file)], capture_output=True, text=True).stdout
    j = json.loads(out)
    s = j['streams'][0]
    info['dimensions'] = f"{s['width']}x{s['height']}"
    info['duration_s'] = round(float(j['format']['duration']), 1)
  return info


data = json.loads(MANIFEST.read_text())
entries = {e['path']: e for e in data['files']}
on_disk = {'/' + str(f.relative_to(ROOT / 'public')): f for f in MEDIA.rglob('*') if f.is_file() and f.name not in SKIP}

removed = [p for p in entries if p not in on_disk and not (ROOT / entries[p]['file']).exists()]
for p in removed:
  del entries[p]

by_family = {}
for e in entries.values():
  by_family.setdefault(family(e['path']), e)

added = []
for path, e in entries.items():
  if path not in on_disk:
    e.update(probe(ROOT / e['file']))

for path, file in sorted(on_disk.items()):
  e = entries.get(path)
  if e is None:
    sibling = by_family.get(family(path), {})
    folder = path.split('/')[2]
    e = {'path': path, 'file': f'public{path}', 'section': sibling.get('section', SECTION_BY_FOLDER.get(folder, folder)),
         'alt_es': sibling.get('alt_es'), 'alt_en': sibling.get('alt_en')}
    entries[path] = e
    added.append(path)
  e.update(probe(file))

data['files'] = sorted(entries.values(), key=lambda e: e['path'])
data['count'] = len(data['files'])
data['generated'] = datetime.date.today().isoformat()
MANIFEST.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
print(f'{data["count"]} archivos · {len(added)} nuevos · {len(removed)} quitados')
for p in removed:
  print('  -', p)
