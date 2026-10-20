"""Genera public/media/brand/og-logo.jpg (1200x630) para vistas previas (WhatsApp, Facebook, X).

Fondo navy sólido, logo YUSSI original centrado (~45 % del ancho) y una línea de texto.
Uso: python3 scripts/build-og-logo.py   (requiere Pillow)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / 'public/media/brand/yussi-logo.png'
FONT = ROOT / 'scripts/og/fonts/Manrope.ttf'
OUT = ROOT / 'public/media/brand/og-logo.jpg'

W, H = 1200, 630
NAVY = (7, 26, 52)  # --navy de src/css/site.css
TEXT = 'Dotación, uniformes y bordado · Manizales'

img = Image.new('RGB', (W, H), NAVY)

logo = Image.open(LOGO).convert('RGBA')
logo_w = round(W * 0.45)
logo = logo.resize((logo_w, round(logo.height * logo_w / logo.width)), Image.LANCZOS)

font = ImageFont.truetype(str(FONT), 30)
font.set_variation_by_axes([500])
draw = ImageDraw.Draw(img)
tw = draw.textlength(TEXT, font=font)
gap = 44
block = logo.height + gap + 30
y = (H - block) // 2

img.paste(logo, ((W - logo_w) // 2, y), logo)
draw.text(((W - tw) / 2, y + logo.height + gap), TEXT, font=font, fill=(176, 190, 208))

img.save(OUT, 'JPEG', quality=90, subsampling=0, optimize=True, progressive=True)
print(f'{OUT.relative_to(ROOT)}: {W}x{H}, {OUT.stat().st_size // 1024} KB')
