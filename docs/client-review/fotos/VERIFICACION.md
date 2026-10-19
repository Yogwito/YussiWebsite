# Verificación · más fotos por sección (19 oct 2026)

Build de producción (`vite preview`), Chrome, 375×812, 768×1024 y 1440×900, con y sin `prefers-reduced-motion`. "Antes" = `main` sin esta rama.

| | Antes | Después |
|---|---|---|
| Imágenes en la carga inicial | 13 · 392 KB | 10 · 344 KB |
| Recorrido completo, 1440 | 49 · 1879 KB | 64 · 2196 KB |
| Recorrido completo, 375 | 31 · 1302 KB | 44 · 1752 KB |
| Recorrido con reduced motion, 768 (todas las fotos de Dotación y las tiras visibles) | 66 · 2816 KB | 81 · 4292 KB |
| CLS máximo | 0,227 (logos de clientes) | 0,027 |
| `public/media` en el repo y en el deploy | 14,5 MB | 54,7 MB (4 tamaños × WebP y AVIF) |

- Imágenes rotas: 0 en los 6 casos, forzando también la carga de las pestañas cerradas.
- Pestañas cerradas del explorador: 0 fotos descargadas mientras no se abren.
- `loading="lazy"` en 144 de 145 imágenes (la excepción es el logo del header).
- Los navegadores con soporte reciben AVIF; el resto, WebP.
- Sin errores de consola.

Fotos por sección:

| Sección | Antes | Después |
|---|---|---|
| Dotación | 3 | 6 |
| Antifluido | 3 | 7 |
| Industrial | 3 | 5 |
| Escolares | 3 | 2 (solo detalles sin rostro) |
| Bordado | 3 | 8 |
| Proceso | 2 tarjetas + video | 2 tarjetas + video + tira de 6 |
| Nosotros | 1 | 1 + tira de 4 |

Correcciones encontradas al verificar:
- El ajuste para Safari ya no carga de inmediato la pestaña activa al cargar la página, solo al cambiar de pestaña.
- Los logos de clientes ya no crecen a su tamaño natural antes de recibir su tamaño óptico, que era la causa del CLS.
