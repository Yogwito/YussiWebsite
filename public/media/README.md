# Medios del sitio

Todo lo que publica la página vive aquí y se sirve en `/media/...`. El inventario completo, con sección, alt ES/EN, dimensiones y peso de cada archivo, está en `media-manifest.json`, en la raíz del repo.

## Estructura

```
public/
  favicon.ico            excepción: los navegadores lo piden en /favicon.ico
  media/
    brand/               logo Yussi (webp para la página, png para JSON-LD), favicons PNG, apple-touch-icon, og-cover
    hero/                video del inicio (escritorio y -movil) y su póster
    productos/
      dotacion/  antifluido/  industrial/  escolares/  bordado/
                         galería: {nombre}-400|-800|-1200|-1600 en .webp y .avif
                         portada del selector: {linea}-portada-{nombre}-560.webp
    proceso/             videos, pósters, tarjetas y tira de fotos (4:3, 400-1600 px)
    nosotros/            foto principal y tira de fotos de la planta (4:3)
    clientes/            cliente-{slug}.svg|webp
    proveedores/         proveedor-{marca}.webp
    cobertura/           globo 3D: geojson de departamentos y países, e imagen estática para móvil

media-source/            originales en alta, FUERA de public/ (git y Vercel lo ignoran)
media-archive/public/    archivos que ya no se usan, con su ruta original (versionado, no se publica)
```

## Convención de nombres

- Minúsculas, kebab-case, sin espacios, tildes ni ñ: `dotacion-kit-flags-800.webp`, `cliente-terpel.webp`, `hero-produccion-movil.mp4`.
- Empieza por la sección o línea: `dotacion-…`, `proceso-…`, `nosotros-…`, `cliente-…`, `proveedor-…`.
- El ancho en píxeles va al final (`-400`, `-800`, `-1200`). Las galerías dependen de ese patrón: `src/product-explorer.js` arma `/media/productos/${data-photo}-800.webp` y `-1200.webp`, y `data-photo` incluye la carpeta (`dotacion/dotacion-kit-flags`).

## Dónde va cada archivo nuevo

| Archivo | Carpeta | Formato |
|---|---|---|
| Foto de producto | `productos/{linea}/` | WebP y AVIF en 400, 800, 1200 y 1600 px (recorte 1:1,12), menos de 250 KB a 1200 px |
| Portada del selector | `productos/{linea}/` | WebP 560×420 |
| Video del hero | `hero/` | MP4 H.264, sin audio, `faststart`; versión `-movil` vertical |
| Foto o video de planta | `proceso/` o `nosotros/` | WebP / MP4 |
| Logo de cliente | `clientes/` | SVG de solo trazos, o WebP de 240-320 px de alto. Registrarlo en `src/content/clients.js` |
| Logo de proveedor | `proveedores/` | WebP de ~240 px de alto |
| Logo, favicon u OG de Yussi | `brand/` | Favicons y apple-touch en PNG; OG en JPG 1200×630 |
| Original sin procesar | `media-source/` (no aquí) | Cualquiera |

Antes de agregar un archivo:
1. Optimízalo (WebP o AVIF para imágenes; video recodificado).
2. Pon la ruta en el HTML o JS.
3. Agrégalo a `media-manifest.json`.
4. Corre `npm run build` y `npm run test:quality`.

Lo que deje de usarse se mueve con `git mv` a `media-archive/public/...`; no se borra.

## Pipelines (en `media-source/`, solo local)

- `media-source/scripts/export_gallery.py [nombre ...] [--preview]`: exporta las fotos del sitio (lista `JOBS`: origen, carpeta, aspecto y foco) a WebP + AVIF en 400-1600 px, con calidad adaptativa; `--preview` genera una hoja de recortes.
- `media-source/scripts/export_photos.py SRC OUT`: fotos sueltas a WebP.
- `media-source/clientes/logo_pipeline.py SRC OUT`: logos de clientes. Los archivos de salida se renombran a `cliente-{slug}`.
