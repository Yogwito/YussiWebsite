# Plan de organización de medios

Rama `chore/organizar-medios` (sale de `launch/fase-0`). **Fase 1: solo inventario y propuesta. Todavía no se movió ningún archivo.**

## Resumen

| Grupo | Archivos | Peso | Estado en git |
|---|---|---|---|
| `public/` (se publica) | 293 medios | 49,5 MB | versionado |
| · en uso por la página | 117 (incluye `favicon.ico`) | 13,8 MB | |
| · sin uso | 176 (102 son `hero-frames/`) | 35,7 MB | |
| Originales: `assets-source/`, `HighQualityimages/`, `assets-feria/` | 308 | ≈2,2 GB | ignorado, no se publica |

Fuera de alcance: `dist/` y `output/` (generados) y `docs/client-materials/` (material privado del cliente; nunca se versiona).

Cómo se contó "en uso": referencias en `index.html` (incluye `srcset`, `poster`, metadatos OG, JSON-LD y favicons), en los JS de `src/` y en las 5 hojas CSS que importa `src/main.js`. Se resolvieron también las rutas que se arman en tiempo de ejecución:
- `src/product-explorer.js:18` arma `/img/products/${slug}-800.webp` y `-1200.webp` a partir de `data-photo`;
- `src/production.js:11-12` tiene el mapa de videos;
- `src/coverage-map.js` carga los geojson;
- `src/content/clients.js` tiene los logos de los clientes verificados.

Ninguna hoja CSS usa imágenes con `url()`.

## Estructura propuesta

```
public/
  favicon.ico          se queda en la raíz: los navegadores lo piden en /favicon.ico
  robots.txt, sitemap.xml
  media/
    brand/             logo Yussi, favicons PNG, apple-touch-icon, imagen OG
    hero/              video del inicio (escritorio y móvil) y póster
    productos/
      dotacion/  antifluido/  industrial/  escolares/  bordado/
                       galería (-400/-800/-1200) y portada del selector (-560)
    proceso/           videos de bordado y confección, pósters, Wilcom, hilos
    nosotros/          foto de planta (Tajima)
    clientes/          logos de clientes (cliente-*.svg|webp)
    proveedores/       logos de proveedores (proveedor-*.webp)
    cobertura/         mapa estático y geojson del globo 3D
media-source/          originales en alta (FUERA de public/, ignorado en git y Vercel)
  fotos/               ← assets-source/FOTOS WEB
  video-crudo/         ← HighQualityimages
  feria/               ← assets-feria
  clientes/            ← assets-source/client-logos (con pipeline e incoming/)
  proveedores/         ← assets-source/brand-originals
  fotos-editadas/      ← assets-source/originals
  video/               ← assets-source/media-originals
  scripts/             ← export_gallery.py, export_photos.py
media-archive/         lo que no se usa, FUERA de public/ (versionado, no se publica)
  public/...           conserva la ruta original como subcarpeta
```

### Convención de nombres

- Minúsculas, kebab-case, sin espacios, tildes ni ñ.
- Formato: `{seccion o linea}-{descripcion}[-{variante}][-{ancho}].{ext}`.
- Ejemplos: `dotacion-kit-flags-800.webp`, `cliente-terpel.webp`, `proveedor-madeira.webp`, `hero-produccion-movil.mp4`.
- Los anchos van al final (`-400`, `-800`, `-1200`), porque el código depende de ese patrón para el `srcset`.
- Clientes con prefijo `cliente-` y proveedores con `proveedor-`.

### Cambio de código para las galerías

Hoy `data-photo="dotacion-kit-flags"` se convierte en `/img/products/dotacion-kit-flags-800.webp`. Propuesta: que `data-photo` incluya la carpeta de la línea (`data-photo="dotacion/dotacion-kit-flags"`) y que la plantilla sea `/media/productos/${photo}-800.webp`. Así no hace falta ningún mapa de línea a carpeta en JS.

## Tablas

### A. Archivos en uso → nueva ruta (116, más `favicon.ico`, que no se mueve)

| Ruta actual | Ruta nueva | Motivo |
|---|---|---|
| `public/apple-touch-icon.png` | `public/media/brand/apple-touch-icon.png` | Ícono iOS |
| `public/favicon-16.png` | `public/media/brand/favicon-16.png` | Favicon |
| `public/favicon-32.png` | `public/media/brand/favicon-32.png` | Favicon |
| `public/img/og-cover.jpg` | `public/media/brand/og-cover.jpg` | Imagen Open Graph |
| `public/img/yussi-logo-nav.png` | `public/media/brand/yussi-logo.png` | Logo en JSON-LD |
| `public/img/yussi-logo-nav.webp` | `public/media/brand/yussi-logo.webp` | Logo (navbar, loader, footer) |
| `public/img/clients/alcaldia-manizales.svg` | `public/media/clientes/cliente-alcaldia-manizales.svg` | Logo de cliente |
| `public/img/clients/arquidiocesis-manizales.svg` | `public/media/clientes/cliente-arquidiocesis-manizales.svg` | Logo de cliente |
| `public/img/clients/beauty-market.webp` | `public/media/clientes/cliente-beauty-market.webp` | Logo de cliente |
| `public/img/clients/cable-plaza.webp` | `public/media/clientes/cliente-cable-plaza.webp` | Logo de cliente |
| `public/img/clients/camara-comercio-manizales.webp` | `public/media/clientes/cliente-camara-comercio-manizales.webp` | Logo de cliente |
| `public/img/clients/cc-fundadores.webp` | `public/media/clientes/cliente-cc-fundadores.webp` | Logo de cliente |
| `public/img/clients/ceder.webp` | `public/media/clientes/cliente-ceder.webp` | Logo de cliente |
| `public/img/clients/comite-intergremial-caldas.webp` | `public/media/clientes/cliente-comite-intergremial-caldas.webp` | Logo de cliente |
| `public/img/clients/constructora-hungria.webp` | `public/media/clientes/cliente-constructora-hungria.webp` | Logo de cliente |
| `public/img/clients/cruz-roja.svg` | `public/media/clientes/cliente-cruz-roja.svg` | Logo de cliente |
| `public/img/clients/disblanco.webp` | `public/media/clientes/cliente-disblanco.webp` | Logo de cliente |
| `public/img/clients/dragon-jar.webp` | `public/media/clientes/cliente-dragon-jar.webp` | Logo de cliente |
| `public/img/clients/federacion-cafeteros.webp` | `public/media/clientes/cliente-federacion-cafeteros.webp` | Logo de cliente |
| `public/img/clients/fiscalia-general.svg` | `public/media/clientes/cliente-fiscalia-general.svg` | Logo de cliente |
| `public/img/clients/gobernacion-caldas.svg` | `public/media/clientes/cliente-gobernacion-caldas.svg` | Logo de cliente |
| `public/img/clients/hotel-carretero.webp` | `public/media/clientes/cliente-hotel-carretero.webp` | Logo de cliente |
| `public/img/clients/instituto-para-la-ciencia.webp` | `public/media/clientes/cliente-instituto-para-la-ciencia.webp` | Logo de cliente |
| `public/img/clients/juan-valdez.webp` | `public/media/clientes/cliente-juan-valdez.webp` | Logo de cliente |
| `public/img/clients/juicio.webp` | `public/media/clientes/cliente-juicio.webp` | Logo de cliente |
| `public/img/clients/kuma.webp` | `public/media/clientes/cliente-kuma.webp` | Logo de cliente |
| `public/img/clients/la-burguer.webp` | `public/media/clientes/cliente-la-burguer.webp` | Logo de cliente |
| `public/img/clients/la-vikina.webp` | `public/media/clientes/cliente-la-vikina.webp` | Logo de cliente |
| `public/img/clients/lumia-odontologia.webp` | `public/media/clientes/cliente-lumia-odontologia.webp` | Logo de cliente |
| `public/img/clients/natural-sun-time-spa.webp` | `public/media/clientes/cliente-natural-sun-time-spa.webp` | Logo de cliente |
| `public/img/clients/once-caldas.svg` | `public/media/clientes/cliente-once-caldas.svg` | Logo de cliente |
| `public/img/clients/oryza.webp` | `public/media/clientes/cliente-oryza.webp` | Logo de cliente |
| `public/img/clients/parque-caldas.webp` | `public/media/clientes/cliente-parque-caldas.webp` | Logo de cliente |
| `public/img/clients/policia-nacional.webp` | `public/media/clientes/cliente-policia-nacional.webp` | Logo de cliente |
| `public/img/clients/registraduria-nacional.webp` | `public/media/clientes/cliente-registraduria-nacional.webp` | Logo de cliente |
| `public/img/clients/sena.svg` | `public/media/clientes/cliente-sena.svg` | Logo de cliente |
| `public/img/clients/termales-del-ruiz.webp` | `public/media/clientes/cliente-termales-del-ruiz.webp` | Logo de cliente |
| `public/img/clients/terpel.webp` | `public/media/clientes/cliente-terpel.webp` | Logo de cliente |
| `public/img/clients/unique-detailing-center.webp` | `public/media/clientes/cliente-unique-detailing-center.webp` | Logo de cliente |
| `public/img/clients/universidad-autonoma-manizales.webp` | `public/media/clientes/cliente-universidad-autonoma-manizales.webp` | Logo de cliente |
| `public/img/clients/universidad-catolica-manizales.webp` | `public/media/clientes/cliente-universidad-catolica-manizales.webp` | Logo de cliente |
| `public/img/clients/universidad-de-caldas.svg` | `public/media/clientes/cliente-universidad-de-caldas.svg` | Logo de cliente |
| `public/img/clients/universidad-de-manizales.webp` | `public/media/clientes/cliente-universidad-de-manizales.webp` | Logo de cliente |
| `public/img/clients/universidad-del-quindio.webp` | `public/media/clientes/cliente-universidad-del-quindio.webp` | Logo de cliente |
| `public/img/clients/universidad-nacional.svg` | `public/media/clientes/cliente-universidad-nacional.svg` | Logo de cliente |
| `public/img/coverage-map-fallback.webp` | `public/media/cobertura/cobertura-mapa-estatico.webp` | Mapa estático (móvil) |
| `public/data/colombia-departments.min.geojson` | `public/media/cobertura/colombia-departamentos.min.geojson` | Datos del globo 3D |
| `public/data/countries.min.geojson` | `public/media/cobertura/paises.min.geojson` | Datos del globo 3D |
| `public/media/yussi-hero-production-mobile.mp4` | `public/media/hero/hero-produccion-movil.mp4` | Video del hero (móvil) |
| `public/img/work/hero-production.webp` | `public/media/hero/hero-produccion-poster.webp` | Póster del video del hero |
| `public/media/yussi-hero-production.mp4` | `public/media/hero/hero-produccion.mp4` | Video del hero |
| `public/img/work/produccion-tajima-1400.webp` | `public/media/nosotros/nosotros-planta-tajima-1400.webp` | Foto de Nosotros |
| `public/img/work/produccion-tajima-800.webp` | `public/media/nosotros/nosotros-planta-tajima-800.webp` | Foto de Nosotros |
| `public/img/work/bordado-maquina.webp` | `public/media/proceso/proceso-bordado-poster.webp` | Póster del video |
| `public/media/bordado-en-proceso.mp4` | `public/media/proceso/proceso-bordado.mp4` | Video de planta |
| `public/img/work/confeccion.webp` | `public/media/proceso/proceso-confeccion-poster.webp` | Póster del video |
| `public/media/confeccion-en-proceso.mp4` | `public/media/proceso/proceso-confeccion.mp4` | Video de planta |
| `public/img/work/digitalizacion-wilcom-320.webp` | `public/media/proceso/proceso-digitalizacion-wilcom-320.webp` | Tarjeta de planta |
| `public/img/work/hilos-320.webp` | `public/media/proceso/proceso-hilos-320.webp` | Tarjeta de planta |
| `public/img/products/antifluido-bata-1200.webp` | `public/media/productos/antifluido/antifluido-bata-1200.webp` | Galería de producto |
| `public/img/products/antifluido-bata-400.webp` | `public/media/productos/antifluido/antifluido-bata-400.webp` | Galería de producto |
| `public/img/products/antifluido-bata-800.webp` | `public/media/productos/antifluido/antifluido-bata-800.webp` | Galería de producto |
| `public/img/products/antifluido-chef-blanca-1200.webp` | `public/media/productos/antifluido/antifluido-chef-blanca-1200.webp` | Galería de producto |
| `public/img/products/antifluido-chef-blanca-400.webp` | `public/media/productos/antifluido/antifluido-chef-blanca-400.webp` | Galería de producto |
| `public/img/products/antifluido-chef-blanca-800.webp` | `public/media/productos/antifluido/antifluido-chef-blanca-800.webp` | Galería de producto |
| `public/img/products/antifluido-medica-1200.webp` | `public/media/productos/antifluido/antifluido-medica-1200.webp` | Galería de producto |
| `public/img/products/antifluido-medica-400.webp` | `public/media/productos/antifluido/antifluido-medica-400.webp` | Galería de producto |
| `public/img/products/antifluido-medica-800.webp` | `public/media/productos/antifluido/antifluido-medica-800.webp` | Galería de producto |
| `public/img/work/antifluido-duo-560.webp` | `public/media/productos/antifluido/antifluido-portada-duo-560.webp` | Tarjeta del selector |
| `public/img/products/bordado-detalle-cerdo-1200.webp` | `public/media/productos/bordado/bordado-detalle-cerdo-1200.webp` | Galería de producto |
| `public/img/products/bordado-detalle-cerdo-400.webp` | `public/media/productos/bordado/bordado-detalle-cerdo-400.webp` | Galería de producto |
| `public/img/products/bordado-detalle-cerdo-800.webp` | `public/media/productos/bordado/bordado-detalle-cerdo-800.webp` | Galería de producto |
| `public/img/products/bordado-gorras-palmo-1200.webp` | `public/media/productos/bordado/bordado-gorras-palmo-1200.webp` | Galería de producto |
| `public/img/products/bordado-gorras-palmo-400.webp` | `public/media/productos/bordado/bordado-gorras-palmo-400.webp` | Galería de producto |
| `public/img/products/bordado-gorras-palmo-800.webp` | `public/media/productos/bordado/bordado-gorras-palmo-800.webp` | Galería de producto |
| `public/img/products/bordado-la-carolina-1200.webp` | `public/media/productos/bordado/bordado-la-carolina-1200.webp` | Galería de producto |
| `public/img/products/bordado-la-carolina-400.webp` | `public/media/productos/bordado/bordado-la-carolina-400.webp` | Galería de producto |
| `public/img/products/bordado-la-carolina-800.webp` | `public/media/productos/bordado/bordado-la-carolina-800.webp` | Galería de producto |
| `public/img/work/bordado-gorras-dsc-560.webp` | `public/media/productos/bordado/bordado-portada-gorras-560.webp` | Tarjeta del selector |
| `public/img/products/dotacion-kit-flags-1200.webp` | `public/media/productos/dotacion/dotacion-kit-flags-1200.webp` | Galería de producto |
| `public/img/products/dotacion-kit-flags-400.webp` | `public/media/productos/dotacion/dotacion-kit-flags-400.webp` | Galería de producto |
| `public/img/products/dotacion-kit-flags-800.webp` | `public/media/productos/dotacion/dotacion-kit-flags-800.webp` | Galería de producto |
| `public/img/products/dotacion-polo-maquina-1200.webp` | `public/media/productos/dotacion/dotacion-polo-maquina-1200.webp` | Galería de producto |
| `public/img/products/dotacion-polo-maquina-400.webp` | `public/media/productos/dotacion/dotacion-polo-maquina-400.webp` | Galería de producto |
| `public/img/products/dotacion-polo-maquina-800.webp` | `public/media/productos/dotacion/dotacion-polo-maquina-800.webp` | Galería de producto |
| `public/img/products/dotacion-polos-luseny-1200.webp` | `public/media/productos/dotacion/dotacion-polos-luseny-1200.webp` | Galería de producto |
| `public/img/products/dotacion-polos-luseny-400.webp` | `public/media/productos/dotacion/dotacion-polos-luseny-400.webp` | Galería de producto |
| `public/img/products/dotacion-polos-luseny-800.webp` | `public/media/productos/dotacion/dotacion-polos-luseny-800.webp` | Galería de producto |
| `public/img/work/dotacion-equipo-polos-560.webp` | `public/media/productos/dotacion/dotacion-portada-equipo-polos-560.webp` | Tarjeta del selector |
| `public/img/products/escolar-lans-buzo-1200.webp` | `public/media/productos/escolares/escolar-lans-buzo-1200.webp` | Galería de producto |
| `public/img/products/escolar-lans-buzo-400.webp` | `public/media/productos/escolares/escolar-lans-buzo-400.webp` | Galería de producto |
| `public/img/products/escolar-lans-buzo-800.webp` | `public/media/productos/escolares/escolar-lans-buzo-800.webp` | Galería de producto |
| `public/img/products/escolar-lans-escudo-1200.webp` | `public/media/productos/escolares/escolar-lans-escudo-1200.webp` | Galería de producto |
| `public/img/products/escolar-lans-escudo-400.webp` | `public/media/productos/escolares/escolar-lans-escudo-400.webp` | Galería de producto |
| `public/img/products/escolar-lans-escudo-800.webp` | `public/media/productos/escolares/escolar-lans-escudo-800.webp` | Galería de producto |
| `public/img/products/escolar-lans-polo-1200.webp` | `public/media/productos/escolares/escolar-lans-polo-1200.webp` | Galería de producto |
| `public/img/products/escolar-lans-polo-400.webp` | `public/media/productos/escolares/escolar-lans-polo-400.webp` | Galería de producto |
| `public/img/products/escolar-lans-polo-800.webp` | `public/media/productos/escolares/escolar-lans-polo-800.webp` | Galería de producto |
| `public/img/work/escolar-lans-escalera-560.webp` | `public/media/productos/escolares/escolar-portada-lans-escalera-560.webp` | Tarjeta del selector |
| `public/img/products/industrial-contraloria-1200.webp` | `public/media/productos/industrial/industrial-contraloria-1200.webp` | Galería de producto |
| `public/img/products/industrial-contraloria-400.webp` | `public/media/productos/industrial/industrial-contraloria-400.webp` | Galería de producto |
| `public/img/products/industrial-contraloria-800.webp` | `public/media/productos/industrial/industrial-contraloria-800.webp` | Galería de producto |
| `public/img/work/industrial-reflectivo-560.webp` | `public/media/productos/industrial/industrial-portada-reflectivo-560.webp` | Tarjeta del selector |
| `public/img/products/industrial-reflectivo-1200.webp` | `public/media/productos/industrial/industrial-reflectivo-1200.webp` | Galería de producto |
| `public/img/products/industrial-reflectivo-400.webp` | `public/media/productos/industrial/industrial-reflectivo-400.webp` | Galería de producto |
| `public/img/products/industrial-reflectivo-800.webp` | `public/media/productos/industrial/industrial-reflectivo-800.webp` | Galería de producto |
| `public/img/products/industrial-servicontrol-1200.webp` | `public/media/productos/industrial/industrial-servicontrol-1200.webp` | Galería de producto |
| `public/img/products/industrial-servicontrol-400.webp` | `public/media/productos/industrial/industrial-servicontrol-400.webp` | Galería de producto |
| `public/img/products/industrial-servicontrol-800.webp` | `public/media/productos/industrial/industrial-servicontrol-800.webp` | Galería de producto |
| `public/marcasAsociadas/hilosCoatsfondoblanco.webp` | `public/media/proveedores/proveedor-coats.webp` | Logo de proveedor |
| `public/marcasAsociadas/flexfit.webp` | `public/media/proveedores/proveedor-flexfit.webp` | Logo de proveedor |
| `public/marcasAsociadas/groz-beckert.webp` | `public/media/proveedores/proveedor-groz-beckert.webp` | Logo de proveedor |
| `public/marcasAsociadas/lafayette.webp` | `public/media/proveedores/proveedor-lafayette.webp` | Logo de proveedor |
| `public/marcasAsociadas/MAderia.webp` | `public/media/proveedores/proveedor-madeira.webp` | Logo de proveedor |
| `public/marcasAsociadas/tajima.webp` | `public/media/proveedores/proveedor-tajima.webp` | Logo de proveedor |
| `public/marcasAsociadas/wilcome.webp` | `public/media/proveedores/proveedor-wilcom.webp` | Logo de proveedor |


### B. Archivos sin uso → media-archive/ (176)

Se conserva la ruta original como subcarpeta: `public/X` → `media-archive/public/X`.

| Ruta actual | Peso | Resolución | Nota |
|---|---|---|---|
| `public/Logo Yussi aviso no slogan.png` | 160 KB | 1700x2200 | no ref anywhere in repo code |
| `public/Logo Yussi aviso.pdf` | 405 KB | - | no ref anywhere in repo code |
| `public/img/Logo Yussi aviso.pdf` | 405 KB | pdf |  |
| `public/img/gobierno.jpg` | 8.5 MB | 5712x4284 |  |
| `public/img/hero-2.jpg` | 487 KB | 2000x2667 |  |
| `public/img/hero-2.webp` | 250 KB | 2000x2667 |  |
| `public/img/hero-video-poster.jpg` | 190 KB | 1440x1080 |  |
| `public/img/hero-video-poster.webp` | 126 KB | 1440x1080 |  |
| `public/img/hero.jpg` | 3.0 MB | 4032x3024 |  |
| `public/img/landingImage.jpg` | 201 KB | 1448x1086 |  |
| `public/img/landingImage.png` | 2.2 MB | 1448x1086 |  |
| `public/img/landingImage.webp` | 160 KB | 1448x1086 |  |
| `public/img/nosotros-2.jpg` | 55 KB | 500x667 |  |
| `public/img/nosotros-2.webp` | 39 KB | 500x667 |  |
| `public/img/nosotros.jpg` | 189 KB | 1400x1050 |  |
| `public/img/nosotros.webp` | 112 KB | 1400x1050 |  |
| `public/img/servicio-bordado.jpg` | 77 KB | 600x450 |  |
| `public/img/servicio-bordado.webp` | 61 KB | 600x450 |  |
| `public/img/servicio-dotacion.jpg` | 564 KB | 1800x1350 |  |
| `public/img/servicio-dotacion.webp` | 464 KB | 1800x1350 |  |
| `public/img/servicio-industrial.jpg` | 81 KB | 600x450 |  |
| `public/img/servicio-industrial.webp` | 77 KB | 600x450 |  |
| `public/img/servicio-medico.jpg` | 39 KB | 600x450 |  |
| `public/img/servicio-medico.webp` | 23 KB | 600x450 |  |
| `public/img/textura-bordado.jpg` | 225 KB | 2000x851 |  |
| `public/img/textura-bordado.webp` | 136 KB | 2000x851 |  |
| `public/img/work/antifluido-chef.webp` | 95 KB | 1600x1200 |  |
| `public/img/work/antifluido-duo.webp` | 99 KB | 1600x1200 |  |
| `public/img/work/bordado-detalle.webp` | 49 KB | 1400x788 |  |
| `public/img/work/bordado-gorras-dsc.webp` | 127 KB | 2016x877 |  |
| `public/img/work/bordado-la-carolina.webp` | 217 KB | 1400x1050 |  |
| `public/img/work/digitalizacion-wilcom.webp` | 29 KB | 1200x656 |  |
| `public/img/work/dotacion-empresarial-equipo.webp` | 225 KB | 1448x1086 |  |
| `public/img/work/dotacion-empresarial-hq.webp` | 1.2 MB | 2560x1920 |  |
| `public/img/work/dotacion-equipo-polos.webp` | 92 KB | 1752x762 |  |
| `public/img/work/dotacion-polos-rojos.webp` | 142 KB | 1370x1028 |  |
| `public/img/work/dotacion-stock.webp` | 194 KB | 1600x900 |  |
| `public/img/work/escolar-buzo.webp` | 55 KB | 1440x1080 |  |
| `public/img/work/escolar-conjunto.webp` | 68 KB | 1440x1080 |  |
| `public/img/work/escolar-falda.webp` | 97 KB | 1440x1080 |  |
| `public/img/work/escolar-lans-baranda.webp` | 115 KB | 1600x1200 |  |
| `public/img/work/escolar-lans-buzo-capucha.webp` | 115 KB | 1600x1200 |  |
| `public/img/work/escolar-lans-buzo.webp` | 119 KB | 1600x1200 |  |
| `public/img/work/escolar-lans-escalera.webp` | 116 KB | 1600x1200 |  |
| `public/img/work/escolar-lans-escudo.webp` | 101 KB | 1600x1200 |  |
| `public/img/work/escolar-lans-polo.webp` | 93 KB | 1600x1200 |  |
| `public/img/work/escolar-pantaloneta-detalle.webp` | 115 KB | 1440x1080 |  |
| `public/img/work/escolar-pantaloneta.webp` | 41 KB | 1440x1080 |  |
| `public/img/work/escolar-personalizacion.webp` | 108 KB | 1600x900 |  |
| `public/img/work/escolar-polo-pantalon.webp` | 54 KB | 1440x1080 |  |
| `public/img/work/escolar-sudadera.webp` | 39 KB | 1440x1080 |  |
| `public/img/work/gorras-bordadas.webp` | 57 KB | 1400x788 |  |
| `public/img/work/hero-production.jpg` | 194 KB | 1920x1080 |  |
| `public/img/work/hilos.webp` | 49 KB | 1400x788 |  |
| `public/img/work/industrial-maquinaria.webp` | 132 KB | 1600x900 |  |
| `public/img/work/industrial-polo-bordado.webp` | 152 KB | 1200x900 |  |
| `public/img/work/industrial-reflectivo-detalle.webp` | 218 KB | 1600x1200 |  |
| `public/img/work/industrial-reflectivo.webp` | 152 KB | 1428x1071 |  |
| `public/img/work/medicos-confeccion.webp` | 88 KB | 1600x900 |  |
| `public/img/work/produccion-tajima-hq.webp` | 438 KB | 2200x2933 |  |
| `public/img/work/produccion-tajima.webp` | 87 KB | 1400x788 |  |
| `public/img/work/ropa-industrial-hq.webp` | 699 KB | 1800x1350 |  |
| `public/img/work/uniformes-escolares-producto.webp` | 102 KB | 1800x1350 |  |
| `public/img/work/uniformes-medicos-hq.webp` | 615 KB | 1800x1350 |  |
| `public/img/yussi-logo-watermark.png` | 16 KB | 1812x332 |  |
| `public/landingImage.png` | 2.2 MB | 1448x1086 | no ref anywhere in repo code |
| `public/marcasAsociadas/MAderia.png` | 473 KB | 2048x276 | png source of webp used in index.html; no ref |
| `public/marcasAsociadas/flexfit.png` | 86 KB | 947x263 | png source of webp used in index.html; no ref |
| `public/marcasAsociadas/hilosCoatsfondoblanco.png` | 101 KB | 394x367 | png source of webp used in index.html; no ref |
| `public/marcasAsociadas/lafayette.png` | 92 KB | 988x664 | png source of webp used in index.html; no ref |
| `public/marcasAsociadas/tajima.png` | 287 KB | 1094x547 | png source of webp used in index.html; no ref |
| `public/marcasAsociadas/wilcome.png` | 95 KB | 925x270 | png source of webp used in index.html; no ref |
| `public/models/yussi-thread-marker.glb` | 1.4 MB | - | no ref in src/ (coverage-map.js uses three/three-globe but never loads |
| `public/noBg.png` | 1.2 MB | 1910x544 | no ref anywhere in repo code |
| `public/img/hero-frames/` (102 archivos d_001…d_102.webp) | 5.0 MB | — | Secuencia del hero anterior, sin referencias |

Peso en uso: 13.8 MB · sin uso: 35.7 MB

### C. Originales (fuera de git) → media-source/

Son carpetas ignoradas por git y Vercel, así que **no se puede usar `git mv`**: se mueven con `mv` normal y se actualizan `.gitignore` y `.vercelignore` para ignorar `media-source/`. No cambia nada de lo que se publica.

| Ruta actual | Ruta nueva | Contenido |
|---|---|---|
| `assets-source/FOTOS WEB/` | `media-source/fotos/` | 199 fotos y videos de celular (1,1 GB). 25 están referenciadas por los scripts de exportación. |
| `assets-source/originals/` | `media-source/fotos-editadas/` | 10 imágenes de hero/servicios y generadas (`gen-*`) |
| `assets-source/media-originals/` | `media-source/video/` | 4 MP4 maestros del hero y del proceso |
| `assets-source/brand-originals/` | `media-source/proveedores/` | 8 logos de proveedores en alta |
| `assets-source/client-logos/` | `media-source/clientes/` | 39 originales, `pending-confirmation/`, `incoming/LEE-ME.md`, `logo_pipeline.py` |
| `assets-source/export_gallery.py`, `export_photos.py` | `media-source/scripts/` | Pipelines (reciben carpetas por argumento, sin rutas fijas) |
| `HighQualityimages/` | `media-source/video-crudo/` | 26 clips de cámara MVI_* (963 MB) |
| `assets-feria/` | `media-source/feria/` | 20 piezas de feria: pendones, flyer, mockups Lans, logo |

### D. Duplicados

**Exactos (mismo sha256) dentro de `public/`:**
- `public/img/Logo Yussi aviso.pdf` = `public/Logo Yussi aviso.pdf`, ambos sin uso. También existe una copia idéntica en `assets-feria/`.
- `public/img/landingImage.png` = `public/landingImage.png`, ambos sin uso.

**Exactos entre `public/` y los originales**: la copia publicada sobra, porque el original ya está en `media-source/`.

| Publicado (sin uso) | Original idéntico |
|---|---|
| `public/img/gobierno.jpg` (8,5 MB) | `assets-source/FOTOS WEB/IMG_5398.jpg` |
| `public/img/hero.jpg` (3,0 MB) | `assets-source/FOTOS WEB/IMG_4489.jpg` |
| `public/Logo Yussi aviso no slogan.png` | `assets-feria/Logo Yussi aviso no slogan.png` |
| `public/noBg.png` | `assets-feria/noBg.png` |

Los 8 logos SVG de clientes en uso son idénticos a su original en `assets-source/client-logos/originals/`. Es normal: los SVG no pasan por el pipeline. Se mantienen ambos.

**Exactos dentro de los originales:**
- `FOTOS WEB/IMG_0467 copy.mov` = `IMG_0467.mov` (62 MB).
- 6 archivos de `originals/` son copias renombradas de `FOTOS WEB`:
  - `hero-2` = `IMG_5374`
  - `nosotros` = `IMG_5490`
  - `nosotros-2` = `IMG_4873`
  - `servicio-bordado` = `IMG_3834`
  - `servicio-dotacion` = `IMG_5203`
  - `servicio-industrial` = `IMG_5239`
- `client-logos/pending-confirmation/{alcaldia-manizales,gobernacion-caldas}-escudo.svg` son iguales a los de `originals/`.

**Versiones casi iguales (mismo motivo en otro formato o recorte):**
- `landingImage` en `.jpg`, `.png` y `.webp`; `hero-2`, `nosotros`, `nosotros-2`, `servicio-*`, `textura-bordado` y `hero-video-poster` en `.jpg` y `.webp`. Todos sin uso.
- `public/marcasAsociadas/*.png` son la fuente de los `.webp` en uso. Los PNG no se usan.
- En `public/img/work/` hay versiones grandes sin uso (`*-hq.webp`, `escolar-lans-*.webp` a 1600 px, `produccion-tajima.webp`) de las que salieron los recortes en uso (`-560`, `-800`, `-1400`).
- `Yussi-1-2.JPG` y `Yussi-1-2.JPEG` en `FOTOS WEB` tienen el mismo nombre pero contenido distinto.

Propuesta: **no borrar ningún duplicado**. Los de `public/` se archivan (tabla B) y los de los originales quedan como están. El usuario puede borrar `IMG_0467 copy.mov` a mano si quiere recuperar 62 MB.

### E. Sin optimizar (pendiente, NO se convierte en esta tarea)

**En uso:**

| Archivo | Peso | Recomendación |
|---|---|---|
| `media/hero/hero-produccion.mp4` | 3,5 MB, 1600×900, 16 s | Recodificar a ≈2 MB (CRF más alto o 1280 px). Es lo más pesado de la carga inicial en escritorio. |
| `media/proceso/proceso-confeccion.mp4` | 1,7 MB | Aceptable; opcional bajar a ≈1,2 MB |
| `productos/bordado/bordado-detalle-cerdo-1200.webp` | 280 KB | Recomprimir o pasar a AVIF (mucho detalle de puntada) |
| `productos/industrial/industrial-contraloria-1200.webp` | 232 KB | AVIF |
| `productos/industrial/industrial-servicontrol-1200.webp` | 206 KB | AVIF |
| `brand/yussi-logo.png` | 67 KB, 900×176 | Se mantiene en PNG por compatibilidad del JSON-LD; se puede recomprimir con pngquant |
| `proveedores/proveedor-madeira.webp` | 74 KB, 1781×240 | Bajar a ~900 px de ancho |
| `brand/og-cover.jpg` | 173 KB | Correcto para OG |

**Sin uso (se archivan, así que dejan de publicarse):** `gobierno.jpg` (8,5 MB), `hero.jpg` (3,0 MB), `landingImage.png` (2,2 MB ×2), `noBg.png` (1,2 MB), `work/dotacion-empresarial-hq.webp` (1,2 MB), `work/ropa-industrial-hq.webp` (699 KB), `work/uniformes-medicos-hq.webp` (615 KB), `servicio-dotacion.jpg` (564 KB) y `models/yussi-thread-marker.glb` (1,4 MB). En total, unos 21 MB más de 500 KB.

PNG que deberían ser WebP: todos los PNG sin uso. En uso solo quedan los favicons y el apple-touch-icon, que deben seguir en PNG.

### F. Referencias a actualizar en la Fase 2

| Archivo | Qué cambia |
|---|---|
| `index.html` | Todas las rutas `src`, `srcset`, `poster`, favicons, `og:image`, logo e imagen del JSON-LD, y los `data-photo` de las galerías |
| `src/product-explorer.js:18` | Plantilla `/media/productos/${photo}-{800,1200}.webp` |
| `src/production.js:11-12` | Rutas de videos y pósters |
| `src/coverage-map.js` | Rutas de los geojson (y del mapa estático si se arma en JS) |
| `src/content/clients.js` | Campo `logo` de los 39 clientes (y de los pendientes, para que apunten a la convención nueva) |
| `scripts/site-quality.mjs` | Lista de medios obligatorios |
| `docs/client-logo-sources.md`, `WEBSITE-AUDIT.md`, `AUDIT.md` | Rutas citadas en la documentación |
| `.gitignore`, `.vercelignore` | `media-source/` en lugar de `assets-source/`, `HighQualityimages/`, `assets-feria/` y las entradas viejas de `public/img/...` |
| `media-source/clientes/incoming/LEE-ME.md` | Ruta de salida del pipeline de logos (archivo no versionado) |

Verificación al terminar: `grep` de `/img/`, `marcasAsociadas`, `/data/` y de las rutas viejas de `/media/*.mp4` en código y docs = 0, más el build y la revisión en 375 y 1440 px.

### G. Decisiones para aprobar

1. **`favicon.ico` se queda en `public/`**: es la única excepción a `media/brand/`, porque los navegadores lo piden en esa ruta.
2. **`models/yussi-thread-marker.glb` (1,4 MB)**: ningún código lo carga, así que se archiva. El mapa 3D funciona sin él.
3. **Logo maestro** (`Logo Yussi aviso.pdf`, `Logo Yussi aviso no slogan.png`): no se usan en la página, pero son los archivos de marca. Propuesta: archivarlos como `media-archive/public/...` y además copiarlos a `media-source/brand/` como `yussi-logo-aviso.pdf` y `yussi-logo-aviso-sin-eslogan.png`. Alternativa: dejarlos publicados en `public/media/brand/` para que se puedan descargar.
4. **Los geojson pasan a `media/cobertura/`**: son datos, no imágenes, pero son assets del mapa como indica la estructura.
5. **Logos del JSON-LD y OG**: cambian de URL (`/img/...` → `/media/brand/...`). Google y las redes vuelven a leerlos solos; no hace falta redirección.
6. **No se cambian los nombres de las galerías de producto** (salvo la carpeta), para no romper el patrón de anchos ni el pipeline `export_gallery.py`.

---

## Resultado de la ejecución (Fases 2 y 3, 18 oct 2026)

Decisiones aprobadas:
- `favicon.ico` se queda en la raíz.
- El `.glb` va a `media-archive/`.
- El logo maestro va a `media-source/brand/` y sale de git.
- Los geojson van a `media/cobertura/`.
- `data-photo` incluye la carpeta de la línea.
- OG y logo del JSON-LD pasan a `/media/brand/`.

| | Antes | Después |
|---|---|---|
| Peso de `public/` | 50,1 MB (293 medios) | 14,0 MB (117 medios + `README.md`, `robots.txt` y `sitemap.xml`) |
| `media-archive/` (versionado, no se publica) | — | 35 MB, 174 archivos |
| `media-source/` (ignorado por git y Vercel) | 3 carpetas sueltas | 2,0 GB en una sola carpeta |
| `dist/` local | 63 MB | 20 MB |

Verificación:
- **Build:** `npm run build` pasa; solo queda el aviso de siempre por el tamaño de three/three-globe.
- **Pruebas:** `npm test` (6/6) y `npm run test:quality` pasan. El chequeo de calidad ahora falla si reaparece una carpeta de medios vieja en `public/` o si `media-source/` deja de estar ignorada.
- **Rutas viejas:** el `grep` en código y documentación da **0** resultados. Solo este plan conserva las rutas viejas a propósito, como registro.
- **Referencias:** las 159 rutas `/media/...` del HTML y el JS, incluidas las 45 que arma la galería por `data-photo`, apuntan a archivos que existen.
- **Navegador (375 y 1440 px, pestaña limpia):** cargan las 123 imágenes; los 4 videos, los geojson, los favicons, la imagen OG y el logo PNG responden 200; la galería cambia de foto con las rutas nuevas; se ven los 39 logos de clientes y los 7 de proveedores. Sin errores de consola ni scroll horizontal.

Pendiente de optimización (no convertido en esta tarea): ver la sección E. En uso, lo prioritario es `hero/hero-produccion.mp4` (3,5 MB) y tres fotos de galería de 200-280 KB que irían mejor en AVIF.
