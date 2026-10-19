# Website Audit

> Nota (oct 2026): las rutas de medios de este documento se actualizaron a la estructura de `MEDIA-PLAN.md` (`public/media/`, `media-source/`, `media-archive/`).

> Auditoría técnica, funcional, visual, de accesibilidad y de producto de Bordados Yussi.  
> Fecha de corte: 2026-08-07 · Zona horaria: America/Bogota  
> Rama inspeccionada: `main` (`4a80e45`) · Estado inicial: con cambios locales y archivos sin seguimiento  
> Esta auditoría es la baseline histórica anterior a la estabilización implementada después.

## Veredicto de auditoría

**Baseline histórica: FAIL por problemas técnicos del rediseño en ese momento.** El estado final de esta fase se documenta en `Implementation Report — Stabilization`.

La implementación nueva era visualmente sólida y, en el preview de producción de Vite y en Vercel, la mayoría de las interacciones funcionaban. El dominio público `bordadosyussi.com` servía deliberadamente el sitio anterior porque el cliente aún no había autorizado el cutover; esa diferencia no era un fallo del rediseño. Los problemas técnicos reales eran el formulario, la reproducibilidad en Git, la accesibilidad, responsive y el peso de medios.

**Confianza:** alta para estructura, código, Git, build y comportamiento local; media-alta para producción pública, porque se inspeccionaron ambos dominios pero no se dispone del panel DNS/Vercel ni de analítica real.

### Persona y tarea crítica usadas para evaluar UX

- **Persona:** responsable de compras o administración de una pyme, colegio, clínica o institución colombiana; usa móvil y escritorio, tiene poco tiempo y necesita justificar proveedor, calidad, cantidades, fecha y logística.
- **Tarea crítica:** entender la oferta, elegir una línea y abrir una cotización confiable por WhatsApp o correo.
- **Contexto:** servicio B2B/B2I con decisión asistida, no e-commerce autoservicio.

### Hard gates

| Gate | Resultado | Evidencia |
|---|---:|---|
| Dominio comercial entrega el producto auditado | Fuera de scope | El cliente mantiene deliberadamente la versión anterior; no se autoriza cutover |
| Tarea primaria de WhatsApp | Pass | CTA abre WhatsApp con teléfono y texto precargados; no se envió ningún mensaje |
| Tarea primaria de formulario | **Fail histórico** | `mailto:` + reset incondicional a los 300 ms |
| Errores de consola del sitio | Pass | 0 errores y 0 warnings durante el recorrido local |
| Recursos locales 4xx/5xx | Pass | No se observaron fallos de red del sitio |
| Axe `Critical`/`Serious` | **Fail histórico** | 1 violación `Serious` de contraste, 2 nodos |
| LCP local de preview | Pass condicionado | 108 ms; medición local, sin throttling, no sustituye datos de campo |
| CLS local de preview | Pass | 0.00003 |
| INP local de preview | Pass condicionado | 80 ms tras interacción de idioma |
| Responsive mínimo solicitado | Pass con defectos | Sin overflow en 375/430/768/1024/1440; hay defectos de navegación y solapamiento |

## Context Correction — Deployment Status

El dominio comercial continúa utilizando deliberadamente el website anterior porque el cliente aún no ha autorizado el cutover. Durante esta etapa, `https://yussi-website.vercel.app` es el entorno oficial de presentación y validación del rediseño. Esto no debe clasificarse como bug, P0 ni fallo de producción del proyecto actual.

Queda fuera de scope de esta fase:

- DNS, registros A/CNAME, MX, redirects y hosting de `bordadosyussi.com`.
- Migración o conexión del dominio comercial a Vercel.
- Cualquier cambio de cutover o reemplazo del website anterior.

El dominio se conserva como decisión de despliegue del cliente, no como defecto técnico. El `sitemap.xml`, canonical y JSON-LD quedan preparados para el futuro dominio, mientras que el entorno Vercel usa `noindex`/`Disallow` para evitar indexación accidental durante staging.

---

## 1. Resumen ejecutivo

Bordados Yussi es una landing comercial bilingüe, estática y de una sola página para vender dotación empresarial, uniformes médicos, ropa industrial, uniformes escolares y bordado. La propuesta central —producción propia en Manizales, muestra previa, experiencia desde 1999 y envíos nacionales— es clara y está bien expresada.

El rediseño actual tiene una dirección visual diferenciada, jerarquía sólida, buen comportamiento general entre 375 y 1920 px, navegación móvil accesible, FAQs funcionales, mapa 3D diferido y CTAs de WhatsApp válidos. El build termina correctamente, no se encontraron dependencias vulnerables y no aparecieron errores de consola o recursos rotos durante el recorrido.

La baseline histórica no debía darse por lista por cinco motivos técnicos reales:

1. **El formulario no confirma una entrega real.** Dependía de `mailto:` y borraba los datos 300 ms después del submit.
2. **El estado actual no era reproducible desde el repositorio.** Archivos centrales y medios estaban modificados o sin seguimiento.
3. **El peso transferido era excesivo.** Aproximadamente 20.9 MB antes de abrir el mapa y 23.2 MB después.
4. **La accesibilidad fallaba un gate formal.** Skip link, movimiento reducido y contraste.
5. **La navegación tablet tenía un hueco.** Entre 901 y 1120 px desaparecían destinos sin hamburger.

No se recomienda migrar de framework. La arquitectura estática con Vite es adecuada para el tamaño actual. La siguiente fase debería estabilizar publicación, formulario, Git, accesibilidad y medios antes de añadir funcionalidades.

---

## 2. Estado actual del proyecto

| Pregunta | Respuesta verificable |
|---|---|
| ¿Qué existe? | Una landing de una página, bilingüe por JavaScript, con catálogo visual, proceso, cobertura 3D, historia, marcas técnicas, FAQ, contacto y CTAs de WhatsApp/correo |
| ¿Qué funciona realmente? | Build, navegación principal visible, menú móvil, selector de idioma parcial, FAQ, tabs/mapa de cobertura, validación HTML del email, enlaces `tel:`, `mailto:` y WhatsApp |
| ¿Qué está parcial? | Inglés, formulario, SEO técnico, prueba comercial, medición, privacidad/legal, pipeline de assets y publicación por dominio |
| ¿Qué estaba roto? | Skip link; confirmación/reset del formulario; dos enlaces del nav desaparecían entre 901–1120 px; FAB tapaba parte del submit a 375 px |
| ¿Qué parece abandonado? | 16 archivos CSS seccionales antiguos no importados, estilos placeholder en ese legado y cientos de medios no referenciados |
| ¿Qué falta? | Proveedor de leads, validación legal final del aviso de datos, prueba social, analítica de conversión y cutover futuro autorizado |
| ¿Qué conservar? | Vite/vanilla JS, identidad visual, copy principal, estructura de catálogo, WhatsApp, FAQ, mapa lazy, menú móvil y reducción de motion por CSS |
| ¿Qué refactorizar después? | Formulario, navegación por anchors, localización, lifecycle de videos, pipeline de assets y responsabilidades de `coverage-map.js` |
| ¿Qué eliminar después de validar? | CSS legado, originales/raw dentro de `public`, assets no usados y modelos no referenciados; no eliminar durante esta fase |
| ¿Qué riesgo domina? | Que el rediseño no pueda reconstruirse fielmente o que el formulario se active sin proveedor configurado |

### Estado por entorno

| Entorno | Estado observado |
|---|---|
| Preview local Vite `http://127.0.0.1:4173/` | Rediseño funcional usado para auditoría |
| [Vercel](https://yussi-website.vercel.app) | Sirve el rediseño actual |
| [Dominio comercial](https://bordadosyussi.com) | Mantiene deliberadamente la versión anterior; fuera de scope de esta fase |
| Git `main` | Coincide con `origin/main` en commit, pero el worktree contiene cambios y archivos centrales no registrados |

---

## 3. Stack tecnológico

| Área | Implementación actual |
|---|---|
| Tipo | Sitio estático/marketing de una sola página |
| Build tool | Vite `6.4.3` |
| Lenguaje | JavaScript ES modules, HTML5 y CSS |
| Framework UI | Ninguno; DOM vanilla |
| Estilos | CSS propio; `src/css/site.css` es la hoja activa |
| Animación | GSAP `3.15.0`, ScrollTrigger y Lenis `1.3.25` |
| Visualización | Three.js `0.185.1`, `three-globe` `2.45.2`, OrbitControls |
| Paquetes | npm, `package-lock.json` lockfile v3 |
| Routing | Sin router; una ruta real y navegación por fragmentos `#...` |
| Estado | Variables locales, clases/atributos DOM y `sessionStorage` para el aviso de WhatsApp |
| Backend/API/DB | No existen |
| Auth/roles/uploads | No existen |
| CMS | No existe; contenido hardcodeado en `index.html` y `coverage-map.js` |
| TypeScript | No configurado |
| ESLint/Prettier/Tailwind | No configurados |
| Tests/CI | No configurados |
| Hosting visible | Vercel para el rediseño; Apache en el dominio comercial actual |

### Servicios e integraciones detectados

- WhatsApp mediante enlaces `wa.me`.
- Correo mediante `mailto:`.
- Google Fonts (`Archivo` y `Manrope`).
- GeoJSON local y WebGL para cobertura; no usa una API cartográfica externa en el rediseño.
- Metadata local de Vercel en `.vercel/project.json`; el proyecto identificado es `yussi-website`.
- Un `VERCEL_OIDC_TOKEN` local existe en `.env.local`, está ignorado y no se observó versionado. Su valor no se incluye en este informe.
- No se detectaron analítica, CRM, pagos, redes sociales, email transaccional ni almacenamiento externo.

---

## 4. Arquitectura

### Flujo de ejecución

1. `index.html` contiene todo el contenido y la semántica de la página.
2. `src/main.js` importa `src/css/site.css` e inicializa los módulos después de `DOMContentLoaded`.
3. Los módulos operan directamente sobre el DOM: idioma, FAQ, navbar, formulario, animaciones, WhatsApp y cobertura.
4. `src/coverage-map.js` se inicializa con `IntersectionObserver`; importa Three/three-globe de forma dinámica y carga dos GeoJSON locales.
5. Vite compila JS/CSS y copia íntegramente `public/` a `dist/`.

### Estructura relevante

```text
Yussi/
├── index.html                 # Página y contenido completo
├── package.json               # Scripts dev/build/preview
├── vite.config.js             # outDir dist
├── src/
│   ├── main.js                # Composición de inicializadores
│   ├── navbar.js              # Menú móvil y foco
│   ├── lang.js                # Traducción ES/EN en DOM
│   ├── faq.js                 # Accordion
│   ├── form.js                # Feedback/reset del mailto
│   ├── animations.js          # Loader, videos, Lenis, GSAP
│   ├── whatsapp.js            # Burbuja retardada
│   ├── coverage-map.js        # Tabs, copy, Three/Globe y fallback
│   └── css/
│       ├── site.css           # Estilos activos
│       └── 16 hojas legacy    # No importadas
└── public/
    ├── img/                   # Imágenes web y originales/raw locales
    ├── media/                 # Videos activos
    ├── data/                  # GeoJSON
    ├── models/                # GLB no referenciado
    └── proveedores/       # Logos de tecnología/insumos
```

### Evaluación arquitectónica

- **Adecuada para el producto actual:** Vite + HTML/CSS/JS evita complejidad innecesaria para una landing.
- **Buena separación inicial:** módulos pequeños y nombres claros, salvo el mapa.
- **Punto de concentración:** `coverage-map.js` mezcla copy bilingüe, tabs, carga, escena 3D, rendering y fallback en unas 430 líneas.
- **Routing limitado:** los fragmentos son suficientes para una sola página, pero Lenis evita que los clics actualicen URL/historial.
- **Despliegue no cerrado:** la configuración del proyecto Vercel existe localmente, pero el dominio comercial no apunta a esa entrega.
- **Assets sin frontera:** los originales están ignorados por Git/Vercel, pero siguen bajo `public`, por lo que Vite los copia al `dist` local.

---

## 5. Mapa de rutas

Sólo existe una ruta HTML real: `/`. El resto son destinos de fragmento dentro de la misma página, no rutas independientes ni páginas indexables.

| URL/fragmento | Propósito y componentes | CTA/integración | Datos dinámicos | Estado |
|---|---|---|---|---|
| `/` / `#hero` | Hero con video, propuesta, prueba rápida | WhatsApp; explorar productos | Video responsive | Funcional en el entorno oficial Vercel |
| `#services` | Encabezado y grid de cinco líneas | WhatsApp por línea | Slideshow escolar | Funcional |
| `#dotacion` | Dotación empresarial | WhatsApp precargado | No | Funcional |
| `#medicos` | Uniformes médicos | WhatsApp precargado | No | Funcional |
| `#industrial` | Ropa industrial | WhatsApp precargado | No | Funcional |
| `#escolar` | Uniformes escolares | WhatsApp precargado | Slideshow automático | Funcional |
| `#bordado` | Servicio de bordado | WhatsApp precargado | No | Funcional |
| `#work` | Galería de producción | Sin CTA directo | Dos videos y dos imágenes | Funcional |
| `#process` | Proceso en cuatro pasos | Iniciar cotización por WhatsApp | No | Funcional |
| `#coverage` | Cobertura Caldas/Colombia/Internacional | Ir a contacto | Tabs, GeoJSON y globo 3D lazy | Funcional con fallback |
| `#about` | Historia y producción propia | Ir a contacto | No | Funcional |
| `#brands` | Marcas de tecnología e insumos | Sin CTA | Marquee CSS | Funcional; no está en nav principal |
| `#faq` | Cinco objeciones frecuentes | Sin CTA dentro del bloque | Accordion ARIA | Funcional |
| `#contact` | WhatsApp, teléfono, email, dirección y formulario | WhatsApp/`tel:`/`mailto:` | Estado visual del formulario | Parcial: reset no confirma envío |
| `/ruta-inexistente` | No existe | No | No | 404 correcto en Vercel |

### Destinos no expuestos en la navegación superior

Los anchors de producto, cobertura, marcas y contacto no tienen todos un enlace propio en el navbar, aunque sí se alcanzan por CTAs y por scroll. No se encontraron páginas/componentes funcionales ocultos fuera de esta landing.

---

## 6. Funcionalidades existentes

### Inventario de componentes

| Categoría | Componentes |
|---|---|
| Layout | Announcement bar, navbar sticky, contenedores, `main`, footer, menú móvil dialog |
| UI | Botones/enlaces CTA, selector de idioma, cards, tabs, accordion, formulario, inputs, select, textarea, slideshow, loaders, FAB y burbuja WhatsApp |
| Marketing | Hero, banda de stats, catálogo, galería de trabajo, proceso, cobertura, historia, marcas técnicas, FAQ, contacto |
| Funcionales | Cambio ES/EN, menú con focus trap, scroll suave, videos por intersección, tabs 3D, validación HTML, `mailto:`, WhatsApp |
| No existen | Carrito, checkout, pagos, autenticación, reservas, dashboard, búsqueda, filtros, API, CMS |

### Matriz funcional verificada

| Interacción | Resultado |
|---|---|
| Abrir/cerrar menú móvil | Correcto; mueve foco, atrapa foco, Escape cierra y devuelve foco |
| Cambiar ES/EN | Cambia texto y `html[lang]`; traducción incompleta |
| Ir a una sección interna | Hace scroll; no actualiza hash ni historial |
| Abrir FAQ | Correcto; una respuesta abierta y ARIA actualizado |
| Cambiar escala del mapa | Correcto por click; copy, selección y globo cambian |
| Teclado en tabs | Código soporta flechas, Home y End |
| Validar email inválido | Bloqueado por validación nativa |
| Enviar formulario | Parcial y riesgoso; depende del cliente de correo y resetea sin confirmación |
| CTA WhatsApp principal | Correcto; abre destino con teléfono/texto, sin enviar automáticamente |
| Fallback del mapa | Implementado mediante imagen y mensaje de error |
| Movimiento reducido | Parcial; CSS detiene animaciones, videos siguen reproduciéndose |

### Duplicación y responsabilidades

- No se detectaron componentes JS duplicados funcionalmente.
- Los múltiples enlaces de WhatsApp repiten teléfono y textos hardcodeados; esto aumenta riesgo de inconsistencia futura.
- La presentación y el copy del mapa están mezclados con lógica WebGL.
- Las hojas CSS seccionales antiguas duplican conceptualmente estilos consolidados en `site.css`, aunque no forman parte del bundle actual.

---

## 7. Integraciones externas

| Integración | Ubicación | Estado | Riesgo/observación |
|---|---|---|---|
| WhatsApp | Múltiples links en `index.html` | Funcional | Mensajes permanecen en español al activar EN |
| Email `mailto:` | Formulario y enlaces | Parcial | No hay entrega verificable; depende del cliente local |
| Google Fonts | `<head>` | Funcional | Recurso externo; se usa `preconnect` |
| Three/three-globe | `coverage-map.js` | Funcional y lazy | Paquetes pesados, sólo se cargan al aproximarse al mapa |
| GeoJSON local | `public/data/` | Funcional | Sin API remota |
| Vercel | `.vercel/`, URL pública | Funcional | Dominio comercial no conectado a esta versión |
| Apache legado | `bordadosyussi.com` | Activo deliberadamente | Página anterior y key de Google Maps visible; fuera de scope de cutover |
| Analítica/CRM | No existe | Ausente | No se puede medir conversión por CTA/canal |
| Pagos/social/CMS | No existen | No aplica | Consistente con una landing asistida por cotización |

---

## 8. Estado del diseño y UX

### Lo que está bien resuelto

- Hero reconocible, alto contraste, mensaje directo y CTA prioritario.
- Sistema visual coherente: navy, cyan y verde; tipografía Archivo/Manrope; radios y espaciado consistentes.
- Fotografías y videos explican capacidad productiva en lugar de usar stock genérico.
- Buena jerarquía entre propuesta, catálogo, proceso, cobertura, objeciones y contacto.
- CTA de WhatsApp repetido en momentos de intención razonables.
- Menú móvil visualmente limpio y funcional por teclado.
- Mapa 3D aporta diferenciación y tiene fallback.
- Formularios con labels visibles, feedback de foco y validación nativa básica.

### Fricciones observadas

- Entre 901 y 1120 px se ocultan “Nosotros” y “Preguntas”, pero el hamburger sólo aparece a 900 px o menos.
- A 375 px el FAB de WhatsApp invade parcialmente el botón “Preparar correo de cotización”.
- El formulario presenta un mensaje de aparente progreso y borra contenido aunque la acción externa no se confirme.
- El inglés parece completo visualmente en textos principales, pero labels accesibles, alts, metadata y mensajes de WhatsApp siguen en español.
- El selector de idioma mide aproximadamente 52 × 18 px en móvil, por debajo del objetivo táctil mínimo de 24 × 24 px.
- El skip link es visible al foco, pero su acción queda anulada por el scroll suave.
- El footer usa texto muy pequeño y contraste insuficiente en la franja inferior.

### Top 5 de UX/producto

1. El dominio principal entrega la experiencia equivocada.
2. El formulario puede borrar una cotización no enviada.
3. El estado visible no es reproducible desde Git.
4. El peso de medios penaliza especialmente navegación móvil.
5. Accesibilidad: skip link, movimiento reducido y contraste impiden aprobar el gate.

### Interaction manifest

| Hora aprox. | Acción | Resultado esperado | Resultado observado | Evidencia |
|---|---|---|---|---|
| 17:08 | Cargar home 1440 | Hero utilizable | Correcto | `output/playwright/01-home-1440-before.png` |
| 17:08 | Cambiar a EN | Traducir experiencia | Texto principal cambia; ARIA/alts/metadata no | `02-language-en-1440.png` |
| 17:09 | Ir a productos | Scroll y contexto URL | Scroll correcto; hash no cambia | `03-products-1440.png` |
| 17:09 | Abrir cobertura Caldas | Mapa/copy regional | Correcto | `04-coverage-caldas-1440.png` |
| 17:09 | Cambiar Colombia | Estado de tab y mapa | Correcto | `05-coverage-colombia-1440.png` |
| 17:09 | Cambiar Internacional | Globo y copy global | Correcto | `06-coverage-world-1440.png` |
| 17:10 | Abrir FAQ | Expandir una respuesta | Correcto, ARIA actualizado | `07-faq-open-1440.png` |
| 17:10 | Llenar formulario | Preservar datos | Datos y caracteres se aceptan | `08-form-before-1440.png` |
| 17:10 | Email inválido | Bloquear submit | Validación nativa correcta | `09-form-validation-1440.png` |
| 17:12 | Abrir menú 768 | Dialog y foco | Correcto; Escape/restauración correctos | `12-menu-open-768.png` |
| 17:13 | Revisar 430 | Layout sin overflow | Correcto | `14-home-430.png`, `17-contact-430.png` |
| 17:14 | Revisar 375 | CTA accesible | FAB invade submit | `20-form-375.png` |
| 18:52 | Activar skip link | Saltar/focalizar `main` | No cambia foco, hash ni scroll | `23-skip-link-focus.png` |
| 18:53 | Emular reduced motion | Detener movimiento no esencial | Tres videos continúan reproduciéndose | `24-reduced-motion.png` |
| 19:02 | Abrir CTA WhatsApp | Llegar a WhatsApp con prefill | Correcto; no se envió mensaje | `25-whatsapp-cta.png` |

Se realizaron además lecturas repetidas de consola/red y capturas en 1024, 1280, 1440 y 1920. No se observaron periodos de espera usados como sustituto de interacción; las pausas fueron para carga/render y toma de evidencia.

### “Hold this in your hands”

Para una compradora que llega con una fecha de entrega próxima, la página se siente profesional y transmite que Yussi controla producción y bordado. Puede reconocer su tipo de uniforme, ver proceso, resolver mínimo y tiempos, y abrir WhatsApp con rapidez. La confianza se rompe en dos momentos: si entra por el dominio comercial ve otra empresa/ubicación visual, y si prefiere correo puede perder lo escrito sin saber si salió. Antes de añadir más espectáculo visual, la experiencia debe hacer que llegar, cotizar y recuperar el contexto sea inequívoco.

---

## 9. Estado responsive

| Viewport | Resultado |
|---:|---|
| 375 px | Sin overflow; hero/cards/form legibles; FAB tapa parcialmente submit |
| 430 px | Sin overflow; catálogo, mapa y contacto mantienen estructura |
| 768 px | Menú móvil correcto; layout estable |
| 1024 px | Sin overflow; dos links del navbar quedan ocultos y no hay hamburger |
| 1280 px | Layout estable |
| 1440 px | Experiencia objetivo correcta |
| 1920 px | Layout estable y contenido limitado por contenedor |

### Hallazgos responsive específicos

- No se detectaron textos cortados, tarjetas deformadas ni contenido fuera del viewport en los tamaños requeridos.
- Las imágenes conservan proporciones y el hero cambia a video móvil bajo 768 px.
- El bug de navegación afecta el intervalo completo `901–1120px`, no sólo 1024.
- El footer reserva espacio derecho para el FAB, pero el formulario no lo hace en 375 px.
- El control de idioma es visualmente legible, pero su alto táctil real es insuficiente.

---

## 10. Contenido y copy

### Posicionamiento comercial reconstruido

**Bordados Yussi se posiciona como fabricante local de uniformes y bordado para empresas e instituciones, con producción propia, asesoría previa, control de muestra y capacidad de despachar desde Manizales.** La venta es consultiva: el sitio no busca cerrar pago, sino iniciar una cotización informada.

### Fortalezas

- Propuesta de valor clara desde el H1.
- Diferenciadores concretos: desde 1999, producción propia, muestra antes de producir, desde una unidad.
- Segmentación útil por necesidad y sector.
- FAQ responde mínimo, tiempos, envíos, prendas del cliente y preparación del logo.
- Copy orientado a riesgo de comprador: consistencia, fecha, tallas, muestra y revisión.
- Información de contacto consistente: teléfono, email y dirección.
- No se encontró Lorem Ipsum ni texto placeholder visible como contenido final.

### Debilidades

- No hay testimonios, casos, logos de clientes, cifras de pedidos ni evidencias de entrega.
- “Internacional” aparece como cobertura, pero no se acompaña de ejemplos, condiciones o prueba.
- Las marcas mostradas son de tecnología/insumos, no clientes; el label “Marcas asociadas” puede interpretarse como alianza formal.
- No hay información legal, identificación empresarial, política de privacidad ni tratamiento de datos.
- No hay enlaces de redes sociales.
- En inglés, el texto visible cambia pero el contexto accesible y los mensajes de contacto siguen parcialmente en español.
- Los horarios usan formatos abreviados que podrían aclarar zona horaria y pausa de almuerzo.

---

## 11. SEO

### Implementado

- `<title>` descriptivo y localizado en Manizales.
- Meta description específica.
- Canonical a `https://bordadosyussi.com`.
- Open Graph: title, description, type, URL e image.
- Twitter card `summary_large_image`.
- Un solo H1 y jerarquía H2/H3 coherente.
- Imágenes de contenido principales tienen `alt`; duplicados decorativos del marquee usan `alt=""`.
- URL simple y HTTPS en ambos entornos públicos.

### Faltante o incorrecto

- El canonical apunta al dominio correcto de negocio, pero ese dominio no contiene el rediseño ni la metadata auditada.
- En el dominio comercial se observó un title antiguo que menciona New York, NY y metadata geográfica incompatible con Manizales.
- No existen `robots.txt` ni `sitemap.xml` en Vercel o en el dominio comercial; responden 404.
- No hay JSON-LD/Schema.org de `LocalBusiness`/`Organization`.
- Twitter no define title/description/image propios; depende de fallback de OG.
- El inglés se genera en cliente sobre la misma URL: no es una versión indexable separada, no hay `hreflang` ni metadata inglesa.
- Los clicks internos no actualizan hash, debilitando enlaces compartibles y navegación atrás.
- No hay páginas de servicio independientes; no existe canibalización entre rutas, pero tampoco profundidad SEO por línea.

---

## 12. Accesibilidad

### Resultado automatizado

Axe-core 4.10 reportó:

- **1 violación Serious — `color-contrast`**, 2 nodos: los dos textos de `.footer-bottom`, contraste aproximado 3.79:1 sobre `#041225`; requerido 4.5:1 para ese tamaño.
- **1 violación Moderate — `region`**, 4 nodos: contenido de la franja de anuncio fuera de landmarks.
- 47 reglas aprobadas y 2 verificaciones incompletas.

El gate formal falla porque existe una incidencia `Serious`.

### Teclado, foco y semántica

- Menú móvil: correcto, usa dialog modal, focus trap, Escape y restauración de foco.
- FAQ: botones reales, `aria-expanded`, `aria-controls`, regiones etiquetadas.
- Mapa: tablist/tab/tabpanel y soporte de flechas/Home/End en código.
- Formulario: labels asociados y tipos nativos correctos.
- Heading hierarchy: un H1 y secciones con H2/H3 coherentes.
- Focus visible: outline cyan de 3 px definido.
- **Skip link roto:** Enter no cambia foco, hash ni scroll porque Lenis intercepta todos los anchors.
- **Movimiento reducido incompleto:** se detienen transiciones/animaciones CSS, pero los tres videos autoplay siguen activos.
- **Target táctil pequeño:** selector de idioma de ~52 × 18 px en móvil.
- **Localización accesible incompleta:** varios `aria-label`, alts y nombres de región permanecen en español al cambiar a EN.

---

## 13. Performance

### Build de producción

`npm run build` finalizó correctamente en aproximadamente 2.0 s y transformó 363 módulos.

| Artefacto | Tamaño | Gzip aprox. |
|---|---:|---:|
| HTML | 43.49 kB | 9.86 kB |
| CSS | 32.84 kB | 7.45 kB |
| JS principal | 153.13 kB | 57.94 kB |
| OrbitControls | 19.75 kB | 4.47 kB |
| Three | 735.88 kB | 190.75 kB |
| three-globe | 1,192.14 kB | 359.20 kB |

Vite emitió warning por chunks mayores de 500 kB. El code splitting del mapa funciona: Three y three-globe no forman parte del JS inicial.

### Medición de preview local

Entorno: Vite preview, 1440 × 900, máquina local, sin throttling. Estos valores sirven para detectar regresiones estructurales, no para prometer experiencia real en red móvil.

| Métrica | Valor observado |
|---|---:|
| TTFB | 7 ms |
| DOMContentLoaded | 92 ms |
| Load complete | 131 ms |
| LCP | 108 ms |
| CLS | 0.00003 |
| INP | 80 ms |

### Peso y medios

- Transferencia inicial observada a los 2.2 s: ~7.8 MB.
- Transferencia estabilizada antes de cargar el mapa: ~20.9 MB.
- Transferencia después de llegar a cobertura: ~23.2 MB.
- Hero desktop: ~13.4 MB; hero mobile: ~5.7 MB.
- Videos de trabajo: ~3.7 MB y ~3.5 MB.
- Aunque los videos bajo el fold usan `preload="metadata"`, en el preview local terminaron transfiriendo los archivos completos.
- Los activos referenciados suman aproximadamente 29.6 MB; las imágenes individuales de producto están razonablemente comprimidas en WebP.
- `public/` ocupa ~556 MB y `dist/` ~624 MB porque Vite copia materiales raw/originales bajo `public`.
- Se estimaron 230 archivos no referenciados (~525.9 MB). `.vercelignore` excluye varias carpetas en upload, pero no corrige el artefacto local de Vite.

### Lectura

Las métricas de CPU/layout locales son verdes; el problema real es el volumen de bytes. En conexiones móviles colombianas, el costo y el tiempo de descarga pueden dominar antes de que LCP/INP de laboratorio se vuelvan representativos.

---

## 14. Seguridad

### Resultado

- `npm audit --omit=dev --json`: **0 vulnerabilidades** en 103 dependencias auditadas.
- El rediseño es estático: no hay auth, permisos, uploads, DB, endpoints, cookies de sesión, XSS de contenido remoto ni CSRF aplicable.
- Los enlaces externos con `target="_blank"` usan `rel="noopener"`.
- `coverage-map.js` usa `innerHTML` sólo con contenido constante controlado por el proyecto.
- No se encontraron secretos versionados. `.env.local` está ignorado; no se revela su contenido.

### Riesgos

- La página antigua servida por `bordadosyussi.com` expone en frontend una Google Maps API key (`AIza…`). Una key de Maps puede ser pública por diseño, por lo que el riesgo depende de restricciones HTTP/API, cuotas y facturación. Debe revisarse en Google Cloud, restringirse por dominio y API, y rotarse si no puede demostrarse control.
- No hay configuración explícita en el repositorio para CSP, Referrer-Policy o Permissions-Policy. Vercel sí respondió con HSTS; el resto debe definirse según la futura integración del formulario y analítica.
- El formulario recoge nombre, empresa, teléfono, email y detalles sin aviso de tratamiento de datos. Esto se reporta como riesgo de confianza/cumplimiento, no como conclusión legal.

---

## 15. Calidad de código

### Fortalezas

- ES modules pequeños, nombres `initFeature` consistentes y dos espacios/sin semicolon según convención del repositorio.
- `main.js` concentra la composición y no la lógica.
- Guards básicos cuando un elemento puede no existir.
- Carga diferida del mapa y fallback visual.
- FAQ/nav usan elementos semánticos y mantienen estado ARIA.
- No se encontraron IDs HTML duplicados; 55 IDs únicos.
- Las 32 referencias locales detectadas por el chequeo estático existen.
- `git diff --check` no reportó errores de whitespace.
- No se encontraron `TODO`, `FIXME`, `HACK`, `@ts-ignore`, `eslint-disable`, mocks activos ni `console.log`.

### Debilidades

- `form.js` acopla feedback visual a una acción externa no verificable.
- `animations.js` mezcla lifecycle de video, Lenis, GSAP, loader y enlaces globales; el listener global de anchors rompe skip link e historial.
- `lang.js` sólo reemplaza texto/placeholder/`data-aria-*`; no cubre metadata, alts, URLs/messages ni persistencia.
- `coverage-map.js` es grande y mezcla estado, UI, copy y rendering 3D.
- Teléfono y mensajes WhatsApp están repetidos en HTML.
- El `console.warn` del fallback del mapa es intencional; en entornos sin WebGL generará warning aunque el fallback funcione.
- No hay manejo verificable de error/éxito para el canal de formulario.
- No hay checks automáticos para accesibilidad, enlaces, build o regresión visual.

---

## 16. Dependencias

### Necesarias y usadas

| Dependencia | Uso | Evaluación |
|---|---|---|
| `gsap` 3.15.0 | ScrollTrigger, parallax y progreso | Usada; coste razonable frente a la interacción actual |
| `lenis` 1.3.25 | Scroll suave y anchors | Usada; introduce bugs de accesibilidad/historial corregibles |
| `three` 0.185.1 | Render WebGL y controles | Usada sólo por mapa; correctamente lazy |
| `three-globe` 2.45.2 | Globo de cobertura | Usada; pesada, pero diferida |
| `vite` 6.4.3 | Dev/build/preview | Necesaria |

### Potencialmente innecesarias o duplicadas

No se encontró una dependencia instalada y completamente sin uso. Lenis y el globo podrían reconsiderarse por coste/beneficio, pero no son técnicamente “muertos” en el estado actual. No hay librerías duplicadas funcionalmente.

### Actualizaciones

- Lenis: `1.3.25` → `1.3.26` disponible.
- Vite: proyecto en `6.4.3`; la última mayor observada fue `8.2.1`.
- El resto apareció actualizado en la consulta realizada.

No se recomienda actualizar por estar detrás de `latest` sin una fase separada de compatibilidad. La auditoría de seguridad está limpia.

---

## 17. Estado de Git

### Rama e historial

- Rama actual: `main`, tracking `origin/main`, commit `4a80e45`.
- Rama relevante: `feat/premium-visual-pass`, un commit por delante de su remoto.
- Historial reciente usa subjects concisos orientados a pases visuales/experiencia.

### Cambios locales encontrados

Modificados:

```text
.gitignore
index.html
package-lock.json
package.json
src/animations.js
src/faq.js
src/lang.js
src/main.js
src/navbar.js
```

Sin seguimiento:

```text
.vercelignore
public/data/
public/media/cobertura/cobertura-mapa-estatico.webp
public/media/ (proceso/, nosotros/, productos/) y media-archive/public/img/work/
public/media/
media-archive/public/models/
src/coverage-map.js
src/css/site.css
```

### Impacto

La versión auditada depende de `site.css`, `coverage-map.js`, GeoJSON, imágenes y videos que no están en el commit actual. Un clon limpio de `origin/main` no puede reconstruir fielmente lo que se vio en Vercel/local. Este es un riesgo P1 de integridad operativa, aunque no se realizó commit por instrucción expresa.

`.gitignore` excluye dependencias, build, artifacts, env, raw y originales. `.vercelignore` aplica una exclusión similar, pero también está sin seguimiento. No se encontró `.DS_Store` versionado.

---

## 18. Build / lint / tests

| Comando/check | Resultado |
|---|---|
| `npm run build` | **Pass**; 363 módulos, ~2.0 s; warning por chunks >500 kB |
| `npm run dev` | **Pass**; usado para recorrido inicial |
| `npm run preview` | **Pass**; usado para métricas de producción local |
| Lint | No existe script/configuración; no se ejecutó un comando inexistente |
| Typecheck | No usa TypeScript ni existe script; no aplica |
| Tests | No existe script ni suite; no se ejecutó un comando inexistente |
| `npm audit --omit=dev` | **Pass**; 0 vulnerabilidades |
| `npm outdated` | Informativo; Lenis patch y Vite major disponibles |
| `git diff --check` | **Pass** |
| IDs y assets locales | **Pass**; sin IDs duplicados y sin referencias faltantes detectadas |

No se instalaron dependencias.

---

## 19. Bugs encontrados

| ID | Pri. | Problema y reproducción | Evidencia/ubicación | Parche mínimo recomendado |
|---|---:|---|---|---|
| BUG-01 | OUT OF SCOPE | El dominio comercial conserva deliberadamente la web anterior; el cliente aún no autoriza cutover | Decisión de deployment documentada; Vercel es el entorno oficial de presentación | No modificar DNS/hosting; retirar esta clasificación sólo cuando exista autorización explícita |
| BUG-02 | P1 | En un submit válido, si no existe cliente de correo o el usuario cancela, el handler igualmente muestra éxito y borra datos a los 300 ms | `index.html:413`, `src/form.js:8-15` | No resetear hasta confirmación; sustituir por endpoint/servicio de leads o presentar copia recuperable |
| BUG-03 | P1 | Tab al skip link + Enter: foco sigue en el link, `scrollY=0`, hash no cambia | `src/animations.js:89-99`; `23-skip-link-focus.png` | Excluir `.skip-link` del interceptor y mover foco al `main` |
| BUG-04 | P1 | Emular `prefers-reduced-motion: reduce`: 3 videos autoplay continúan `paused=false` | `src/animations.js:10-15`, `40-74`; `24-reduced-motion.png` | Consultar reduced motion antes de iniciar videos; pausar y retirar autoplay |
| BUG-05 | P1 | En 1024 px faltan “Nosotros” y “Preguntas” y no aparece hamburger | `src/css/site.css:1851-1857`, hamburger desde `:1896`; `10-home-1024.png` | Mostrar menú móvil al mismo breakpoint o mantener todos los links |
| BUG-06 | P1 | En 375 px el FAB fijo invade el extremo del submit | `src/css/site.css:1796`, responsive `:2370`; `20-form-375.png` | Reubicar/ocultar contextualmente o añadir safe area al formulario |
| BUG-07 | P1* | Axe encuentra 3.79:1 en ambos textos inferiores del footer | `src/css/site.css:1747`; axe `Serious` | Aumentar opacidad/color o tamaño/peso hasta ≥4.5:1 |
| BUG-08 | P2 | Activar EN: labels accesibles, alts, metadata y mensajes WhatsApp permanecen en español | `src/lang.js:5-23`, `index.html:41-55`, `:95`, `:104`, `:339`, `:495`; `02-language-en-1440.png` | Centralizar traducciones de texto/aria/alt/URL/meta y persistir locale |
| BUG-09 | P2 | Click en “Explorar productos”: hace scroll, URL sigue en `/`; Back no representa la navegación | `src/animations.js:89-99` | Actualizar hash/history sin duplicar scroll y manejar `popstate/hashchange` |
| BUG-10 | P2 | En 430 px el selector de idioma tiene ~52 × 18 px | `src/css/site.css:267` | Dar min-height/min-width táctiles ≥24 px, preferible ~44 px |
| BUG-11 | P2 | Axe marca cuatro nodos del anuncio fuera de landmarks | `index.html:33-39` | Integrar la franja en `header` o asignar una región etiquetada apropiada |

\* BUG-07 es P1 porque rompe el hard gate de axe; por impacto localizado sería P2 en una priorización puramente comercial.

---

## 20. Deuda técnica

| Severidad | Problema | Consecuencia | Solución recomendada |
|---|---|---|---|
| Crítica | No hay deuda técnica de dominio en esta fase | El cliente mantiene la versión anterior deliberadamente | Registrar la decisión y preparar cutover futuro sólo con autorización |
| Alta | Estado actual no registrado en Git | Pérdida/release no reproducible | Revisar, versionar por lotes y etiquetar una baseline |
| Alta | Formulario basado en `mailto:` con reset | Leads perdidos y falsa confirmación | Endpoint serverless/servicio confiable + estado explícito |
| Alta | Medios activos transfieren 20.9–23.2 MB | Coste móvil y abandono | Re-encode, posters, preload correcto y carga por intención |
| Alta | Gate de accesibilidad fallido | Barreras y riesgo de release | Corregir skip/motion/contraste y automatizar axe |
| Media | `dist` de 624 MB por raw en `public` | Builds/deploys lentos o fallidos | Mover fuentes fuera de `public`; manifest de assets web |
| Media | Localización parcial | Experiencia inglesa incoherente | Modelo de traducción completo y URLs indexables si aplica |
| Media | SEO técnico incompleto | Descubrimiento y snippets débiles | robots, sitemap, schema y metadata por locale |
| Media | Falta aviso de datos/legal | Confianza y cumplimiento inciertos | Validar requisitos y publicar información correspondiente |
| Media | `coverage-map.js` mezcla responsabilidades | Cambios de mapa/copy difíciles de probar | Separar estado/copy, loader y renderer después de estabilizar |
| Baja | 1,845 líneas CSS legado no importado | Confusión y duplicación futura | Verificar referencias y retirar en PR separado |
| Baja | Sin lint/tests/CI | Regresiones dependen de revisión manual | Añadir checks mínimos proporcionales al sitio |
| Baja | Valores de contacto repetidos | Inconsistencias futuras | Fuente de configuración única en build |

---

## 21. Código muerto o sospechoso

- 16 hojas CSS antiguas bajo `src/css/` suman **1,845 líneas** y no son importadas por `main.js`; sólo `site.css` entra al build.
- Los estilos antiguos aún contienen clases de placeholder (`.img-placeholder`, `.map-placeholder`, comentarios de client-logo placeholders), pero no aparecen en la interfaz actual.
- `public/` contiene 265 archivos; se estimaron 230 no referenciados por la versión actual.
- `media-source/fotos/` y `media-source/fotos-editadas/` están ignorados, pero viven bajo `public`, por lo que Vite los copia localmente.
- `media-archive/public/models/` contiene un GLB no referenciado por el código actual.
- `media-archive/public/img/gobierno.jpg` es un activo grande no referenciado (~8.9 MB).
- No se encontraron bloques comentados extensos, TODO/FIXME, mocks activos ni logs de depuración. El único log es un `console.warn` intencional al activar fallback del mapa.

No se debe eliminar nada hasta comparar un build limpio, el despliegue real y las fuentes originales necesarias para marketing.

---

## 22. Funcionalidades incompletas

| Funcionalidad | Estado faltante |
|---|---|
| Publicación | El rediseño se presenta en Vercel; el cutover comercial está deliberadamente pendiente |
| Formulario | Entrega real, confirmación, error, retry, conservación de datos y privacidad |
| Inglés | Metadata, alt/ARIA, mensajes WhatsApp, persistencia e indexación |
| SEO | robots, sitemap, schema, verificación del dominio/canonical |
| Analítica | Eventos de WhatsApp, mailto/form y líneas de producto |
| Prueba comercial | Casos, testimonios, logos de clientes verificables y soporte de cobertura internacional |
| Legal/datos | Aviso/política acorde a la información recogida |
| Release engineering | Baseline Git, CI y checklist de producción |

---

## 23. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---:|---:|---|
| Usuarios/Google ven la página antigua | Decisión del cliente | Fuera de scope actual | Mantener Vercel como presentación y noindex hasta autorización |
| Pérdida de cotizaciones por correo | Alta | Alto | No borrar datos; canal de captura confiable |
| Pérdida del rediseño al clonar/release | Alta | Alto | Registrar archivos y producir build reproducible |
| Abandono por datos móviles | Media-alta | Alto | Reducir videos y carga bajo fold |
| Barreras de teclado/motion/contraste | Alta | Medio-alto | Resolver gate y repetir axe/teclado |
| Abuso/coste de Maps key antigua | Desconocida | Alto condicionado | Revisar restricciones/cuotas y rotar si procede |
| Claim internacional sin evidencia | Media | Medio | Aclarar alcance, condiciones y prueba |
| Recolección de datos sin información visible | Media | Medio-alto | Revisión legal local y copy de consentimiento/aviso |
| Dist/build gigantes | Media | Medio | Sacar originales de `public` y verificar deploy |
| Decidir sin medición | Alta | Medio | Añadir analítica mínima y respetuosa tras estabilizar |

---

## 24. Prioridades P0 / P1 / P2 / P3

### P0 — Bloqueantes

No quedan P0 técnicos dentro del scope autorizado de esta fase. El antiguo `BUG-01 / P0-01` se reclasifica como **OUT OF SCOPE — CLIENT DEPLOYMENT DECISION**.

### P1 — Alta prioridad

1. **P1-01 — Baseline reproducible en Git.**
2. **P1-02 — Formulario confiable** con endpoint y estados reales.
3. **P1-03 — Reducir el payload runtime de medios.**
4. **P1-04 — Reparar skip link y reduced motion.**
5. **P1-05 — Resolver navbar 901–1120 px.**
6. **P1-06 — Evitar que el FAB tape el submit en móvil.**
7. **P1-07 — Corregir contraste Serious del footer.**
8. **P1-08 — Revisar la antigua Maps key sólo como tarea separada de infraestructura del cliente.**

### P2 — Mejoras

1. Completar el pipeline de assets y mantener `dist` pequeño.
2. Completar localización EN y persistencia; decidir si requiere `/en/` indexable.
3. Añadir robots, sitemap, schema y metadata completa.
4. Actualizar hash/history en navegación interna.
5. Aumentar el target del selector de idioma.
6. Integrar la franja de anuncio en landmarks.
7. Añadir aviso/política de tratamiento de datos según revisión aplicable.
8. Añadir evidencia comercial verificable y precisar el claim internacional.
9. Incorporar medición de CTA y leads una vez estabilizado el funnel.
10. Definir headers de seguridad adecuados al deployment final.

### P3 — Polish/mantenibilidad

1. Retirar CSS legacy después de comparación visual.
2. Consolidar teléfono/textos WhatsApp en una fuente única.
3. Separar responsabilidades del mapa cuando ya exista baseline.
4. Añadir lint, tests de smoke/axe y CI mínimos.
5. Evaluar actualizaciones de dependencias en una tarea separada.
6. Pulir labels de “marcas asociadas” y formatos de horario.

---

## 25. Próximos pasos recomendados

### Fase 2A — Baseline y presentación en Vercel

1. Versionar el runtime actual en commits pequeños, sin mezclar raw.
2. Hacer build desde un clon/worktree limpio y comparar contra Vercel.
3. Mantener `yussi-website.vercel.app` como entorno oficial de presentación.
4. Mantener `noindex`/`Disallow` mientras sea staging.
5. Dejar documentado el checklist de DNS, canonical, OG, 404, robots y sitemap para el futuro cutover autorizado.
6. Revisar la Google Maps key antigua sólo si el cliente confirma que sigue bajo su responsabilidad.

### Fase 2B — Hacer confiable la conversión

1. Elegir un destino real para leads: función serverless, proveedor de formularios o CRM.
2. Mantener los datos hasta respuesta exitosa; diseñar loading, success, error y retry reales.
3. Añadir aviso de tratamiento de datos validado para Colombia y el negocio.
4. Instrumentar eventos de WhatsApp/form sin capturar contenido sensible.

### Fase 2C — Corregir UX, accesibilidad y peso

1. Skip link, reduced motion, contraste, landmarks y targets táctiles.
2. Breakpoint de navbar y posición del FAB.
3. Re-encode de hero/work videos y política de preload.
4. Sacar originales/raw de `public`; reconstruir y medir.
5. Repetir 375/430/768/1024/1440, teclado, axe, consola, red y performance.

### Fase 2D — Completar producto/SEO

1. Decidir alcance real del inglés y su indexación.
2. Publicar prueba social/casos verificables.
3. Añadir schema, sitemap, robots y metadata por locale.
4. Evaluar páginas por línea sólo si contenido/SEO justifican rutas adicionales.

---

## 26. Arquitectura recomendada a futuro

### Conservar

- Vite y render estático; no hay evidencia que justifique migrar a Next.js u otro framework.
- HTML semántico como fuente de contenido principal.
- Módulos JS pequeños con `initFeature`.
- WhatsApp como canal principal asistido.
- Carga dinámica del mapa y fallback no-WebGL.

### Evolución mínima recomendada

```text
Navegador
├── HTML estático ES (/)
├── HTML estático EN (/en/)      # sólo si el inglés es estratégico/indexable
├── assets web optimizados
├── JS de interacción
│   └── mapa 3D lazy
└── POST /api/quote               # función serverless pequeña
    ├── validación/sanitización
    ├── rate limit/honeypot
    ├── email/CRM
    └── respuesta success/error verificable
```

### Organización sugerida después de P0/P1

- `src/content/`: copy/contacto/locales centralizados.
- `src/features/coverage/`: estado, copy y renderer separados.
- `src/features/quote/`: validación, envío y estados.
- `public/media/`: sólo activos web finales.
- `media-source/` fuera de `public` o almacenamiento externo/LFS para originales.
- `tests/`: smoke de rutas/anchors, formulario, menú, idioma, axe y reduced motion.
- CI: install reproducible, build, smoke y chequeo de assets.

La prioridad es una arquitectura operable, no introducir abstracciones. El backend debe limitarse inicialmente a captura confiable de cotizaciones.

---

## 27. Resumen del contexto para continuar trabajando

### Qué es

Bordados Yussi es una landing B2B/B2I para dotación, uniformes y bordado en Manizales. Vende mediante cotización asistida por WhatsApp/correo. Su promesa es producción propia, muestra previa, experiencia desde 1999 y envíos.

### Estado actual

- El rediseño funciona localmente y en `https://yussi-website.vercel.app`.
- `https://bordadosyussi.com` sirve deliberadamente la versión anterior; el cliente aún no autoriza cutover y esto está fuera de scope.
- El build pasa y npm audit está limpio.
- El worktree está sucio y archivos/medios esenciales están sin seguimiento.
- La auditoría histórica terminaba en **FAIL** por formulario y gate axe; el dominio no debe contarse como fallo.

### Stack y arquitectura

- Vite 6, JavaScript vanilla, CSS, GSAP, Lenis, Three y three-globe.
- Una ruta real `/`; navegación por anchors.
- Sin backend, DB, auth, CMS, payments o analytics.
- `index.html` contiene contenido; `src/main.js` inicia módulos; `site.css` es el CSS activo.
- Mapa lazy con GeoJSON local y fallback.

### Funcionalidades implementadas

- Hero/video, catálogo de cinco líneas, galería, proceso, cobertura, historia, marcas, FAQ, contacto.
- Menú móvil con focus trap/Escape.
- Cambio ES/EN parcial.
- WhatsApp con mensajes precargados.
- Formulario con endpoint `/api/quote`, validación nativa y estados de envío.

### Pendientes y bugs conocidos

- Sin P0 técnico dentro del scope autorizado.
- P1: baseline Git; formulario confiable; payload alto; skip link; reduced motion; navbar 901–1120; FAB/submit; contraste; key antigua condicionada.
- P2: pipeline de assets, localización, SEO técnico, hash/history, target idioma, landmarks, privacidad, prueba social y medición.
- P3: CSS legado, centralización de constantes, modularización del mapa y automatización.

### Integraciones y datos

- WhatsApp: `+57 311 385 8494`.
- Email: `logosbordadosyussi@gmail.com`.
- Dirección: Cra 21 No 26-44, Manizales.
- Google Fonts; no otras APIs en el rediseño.
- Vercel project metadata local; variables de entorno ignoradas.

### Restricciones y convenciones

- ES modules, dos espacios, comillas simples, sin semicolons.
- Inicializadores `initFeature` llamados desde `main.js`.
- Estilos compartidos/activos en `src/css/site.css`; no reactivar CSS legacy sin intención.
- No versionar env, raw ni originales.
- Antes de cada entrega: `npm run build` y recorrido responsive/manual.
- En la fase inicial no se modificó código ni Git; esta fase posterior sí implementa la estabilización documentada al final.

### Riesgos para el siguiente agente

- No asumir que el dominio refleja el repositorio: la diferencia es deliberada hasta autorización del cliente.
- No hacer limpieza destructiva de assets/CSS antes de comparar contra Vercel.
- No mostrar ni copiar completa la key observada en el sitio antiguo.
- No resetear el formulario hasta tener confirmación real.
- No confundir buenas métricas locales con rendimiento móvil de campo.
- Preservar los cambios del usuario; el worktree ya estaba sucio.

### Siguiente paso lógico

Implementar P1 en orden controlado: baseline reproducible, captura de leads, accesibilidad/responsive y peso de medios. Cada cambio debe cerrar con build limpio, comparación local/Vercel, teclado, axe y viewports 320/375/390/430/768/900/901/1024/1120/1121/1280/1440/1920. No tocar DNS ni dominio comercial.

## Implementation Report — Stabilization

### 1. Corrección de contexto sobre deployment

El dominio `bordadosyussi.com` conserva intencionalmente el sitio anterior hasta que el cliente autorice el cutover. No se modificaron DNS, hosting, Apache, MX, redirects ni el dominio comercial. El entorno oficial de presentación de esta fase es `https://yussi-website.vercel.app`.

### 2. Estado final

Resultado técnico: **PASS WITH EXTERNAL ACTION REQUIRED**. No queda P0 técnico dentro del scope autorizado. La captura de cotizaciones está implementada, pero requiere configurar un proveedor externo mediante `QUOTE_WEBHOOK_URL` (y opcionalmente `QUOTE_WEBHOOK_SECRET`) antes de aceptar leads reales.

### 3. Baseline Git

Se conservaron los cambios existentes del rediseño y se incorporó una base reproducible con `package-lock.json`, scripts de calidad, archivos de configuración Vercel y un inventario explícito de medios. Los originales permanecen localmente fuera de `public/` y no se versionan.

### 4. Formulario

El formulario usa `POST /api/quote`, validación nativa más validación de servidor, JSON, códigos HTTP, honeypot, límite de payload y protección básica contra envíos demasiado rápidos. Tiene estados submitting/success/error, feedback accesible y conserva los datos ante error. Sin proveedor configurado responde `503 LEAD_PROVIDER_NOT_CONFIGURED`, sin fingir éxito ni perder la solicitud.

### 5. Accesibilidad

Se corrigieron skip link con foco real en `main`, landmarks, nombres de idioma, feedback live, foco del menú móvil, Escape, foco visible y contraste del footer. Axe en la página recorrida reportó 0 violaciones y 49 checks aprobados.

### 6. Responsive

La navegación cambia a menú en `<=1120px` y se verificó sin overflow en 901 y 1121px. El FAB de WhatsApp se oculta al entrar en contacto para no cubrir el submit; 320, 375, 390 y 430px quedaron sin overflow horizontal.

### 7. Performance antes/después

El inventario público histórico era aproximadamente 556 MB y el `dist` histórico 624 MB. Tras retirar originales del runtime, `public/` queda en aproximadamente 47 MB y `dist/` en 56 MB. Los cuatro videos activos pasaron de aproximadamente 26 MB combinados a aproximadamente 12 MB; la carga inicial medida localmente transfirió aproximadamente 7.5 MB antes de cargar el mapa lazy.

### 8. Assets

Los videos web se recomprimieron con H.264, `yuv420p` y `faststart`. Los originales se movieron a `media-source/` fuera de `public/`; se conservaron localmente. Los GeoJSON y el fallback del mapa permanecen en rutas públicas necesarias.

### 9. SEO/staging

Vercel incluye `noindex,nofollow`, `robots.txt` con `Disallow: /` y sitemap/canonical preparados para el futuro cutover. Se añadió JSON-LD de Organization usando únicamente datos verificados. No se activa indexación pública antes de la autorización comercial.

### 10. Seguridad

Se añadieron `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`. No se introdujo una CSP especulativa que pudiera romper GSAP, Three, fuentes o el mapa. No hay credenciales hardcodeadas.

### 11. Tests

`npm ci`, `npm test`, `npm run test:quality`, `npm run build` y `git diff --check` pasan. La suite de Node cubre normalización, límites, método HTTP, validación, honeypot, ausencia de proveedor y webhook simulado. La verificación manual cubrió carga, mapa lazy, teclado, skip link, axe, formulario y viewports críticos.

### 12. Deployment Vercel

El despliegue se realizó únicamente sobre el proyecto Vercel asociado a `yussi-website.vercel.app`. El alias estable quedó actualizado y listo: `https://yussi-website.vercel.app`. No se utilizó ni modificó `bordadosyussi.com`.

### 13. Archivos modificados

`index.html`, `src/form.js`, `src/animations.js`, `src/navbar.js`, `src/whatsapp.js`, `src/main.js`, `src/lang.js`, `src/faq.js`, `src/css/site.css`, `src/coverage-map.js`, `vite.config.js`, `package.json`, `package-lock.json`, `.gitignore`, `.vercelignore`, `vercel.json`, `scripts/site-quality.mjs` y `WEBSITE-AUDIT.md`.

### 14. Archivos movidos

Los originales de `media-source/fotos`, `media-source/fotos-editadas`, `media-source/proveedores` y `public/media/hero|proceso/*.mp4` fueron movidos a `media-source/` y permanecen ignorados por Git.

### 15. Commits

Commit lógico de estabilización: `feat: stabilize redesigned website`. Agrupa API/formulario, accesibilidad/responsive, optimización de assets, controles de calidad y documentación.

### 16. Configuración externa pendiente

Configurar `QUOTE_WEBHOOK_URL` en Vercel y, si el proveedor lo requiere, `QUOTE_WEBHOOK_SECRET`. El contrato enviado contiene `source`, `receivedAt` y los campos normalizados de cotización. La política formal de privacidad sigue pendiente de revisión comercial/legal.

### 17. Riesgos restantes

La versión pública antigua puede diferir del rediseño hasta el cutover autorizado. El rendimiento real en móviles de campo debe medirse con datos de usuarios; el mapa lazy sigue siendo el tramo más pesado después de la carga inicial.

### 18. P2/P3 pendientes

Localización completa de contenidos, canonical/sitemap cuando exista cutover, privacidad formal, analítica consentida, prueba social verificable, limpieza de CSS legado, modularización adicional del mapa y CI remoto.

### 19. Próximo paso recomendado

Publicar el staging actualizado, verificar la URL Vercel y configurar el webhook de leads en sus variables de entorno. Sólo después de la autorización explícita del cliente debe abrirse el checklist separado de cutover de dominio.

## Client Logo Showcase Implementation

> Fecha: 2026-08-07 · Sección nueva `#clients` — "Clientes que han confiado en nosotros".

### 1. Objetivo

Añadir una barra/marquee premium de logos de **clientes reales** de Bordados Yussi, separada de la barra de marcas de tecnología/insumos existente (`#brands`), reutilizando su arquitectura de animación y respetando la identidad visual, accesibilidad y performance del sitio.

### 2. Número de clientes proporcionados

64 clientes (el #14 "Otras instituciones/regiones" se omite por instrucción). Ver `docs/client-logo-sources.md`.

### 3. Logos verificados

9, implementados en producción: SENA, Once Caldas, Fiscalía General de la Nación, Policía Nacional de Colombia, Universidad Nacional de Colombia, Universidad de Caldas, Universidad de Manizales, Universidad Católica de Manizales, Universidad del Quindío.

### 4. Logos pendientes

- **NEEDS_USER_ASSET: 50** (incluye marcas reconocibles sin fuente oficial limpia: Cruz Roja, Federación de Cafeteros, Terpel, Juan Valdez, UAM).
- **NEEDS_USER_CONFIRMATION: 5** (Alcaldía, Gobernación, Cámara de Comercio, Tránsito, Agencia Nacional de Turismo).
- **SKIPPED: 1** (Otras instituciones/regiones).

Detalle completo y motivos por cliente en `docs/client-logo-sources.md`.

### 5. Fuentes utilizadas

Wikimedia Commons (SVG/PNG oficiales de entidades de identidad nacional/regional única), verificados visualmente uno a uno. No se usaron fuentes secundarias para producción.

### 6. Pipeline de normalización

Descarga del original (SVG preferido) → verificación visual de identidad → chequeo de SVG *paths puros* → SVG intactos / PNG `-trim → -resize x240 → -strip → WebP transparente`. Originales en `media-source/clientes/originals/` (git-ignored). **Sin rediseño**: tipografía, proporciones, geometría y color corporativo intactos; el look uniforme es solo CSS.

### 7. Assets finales

`public/media/clientes/`: `sena.svg`, `once-caldas.svg`, `fiscalia-general.svg`, `universidad-nacional.svg`, `universidad-de-caldas.svg` (SVG) · `policia-nacional.webp`, `universidad-de-manizales.webp`, `universidad-catolica-manizales.webp`, `universidad-del-quindio.webp` (WebP transparente).

### 8. Peso total

9 assets · **251.3 KB** total · promedio ~28 KB · más pesado `universidad-nacional.svg` (65 KB, SVG → gzip muy eficiente). Ningún asset supera los ~65 KB.

### 9. Implementación visual

- HTML: sección `#clients` con eyebrow "Clientes", heading y copy (bilingüe `data-es/data-en`), y contenedor `[data-clients-rows]`.
- Datos: manifiesto `src/content/clients.js` (64 entradas, categorizadas, con `status`). El renderer `src/clients.js` (init en `src/main.js`) monta **solo** los `verified`.
- Marquee: **dos filas** en direcciones opuestas (fila 2 con `animation-direction: reverse`), técnica de la barra existente (`@keyframes marquee` → `translateX(-50%)` con dos grupos idénticos para loop seamless), máscaras laterales en gradiente reforzadas (160px, 30% sólido) para un desvanecido limpio en los bordes, `object-fit: contain`.
- Estilo: **logos a color pleno** sobre tiles sutiles (`--ice` + borde `--mist`, radio 16px) que unifican alturas dispares, resuelven el caso de logos con blanco interior sobre fondo blanco (p.ej. Once Caldas) y dan un acabado premium; hover/focus eleva el tile con sombra suave (solo CSS, no se altera el archivo). Los SVG se dimensionan con `height` definido (evita el colapso a 0×0 de SVG con dimensiones intrínsecas en %). Sin duplicación física de archivos: el segundo grupo reutiliza las mismas URLs.

### 10. Responsive

Sección con `overflow: hidden`; el marquee desborda solo dentro de su propio viewport. Ajustes móviles (`<=767px`): altura de logo 46px, gaps 3rem, máscaras 46px, `max-width` 150px, velocidad 46s. Sin overflow horizontal del documento.

### 11. Accesibilidad

Sección con `aria-labelledby`. Grupo visible con `alt` = nombre del cliente; grupos/duplicados decorativos con `aria-hidden="true"` y `alt=""` (sin redundancia para lectores de pantalla). Con `prefers-reduced-motion: reduce` la animación se detiene (regla global) y los logos permanecen visibles y navegables.

### 12. Performance

SVG preferido; PNG→WebP comprimido; `loading="lazy"` y `decoding="async"` en todas las imágenes; sin duplicación de archivos. Impacto en CSS: +~2 KB. Build: 365 módulos (antes 363).

### 13. Tests

`npm test` (6/6 pass), `npm run test:quality` (pass), `npm run build` (pass), `git diff --check` (limpio). **Axe (wcag2a/2aa) sobre la página completa: 0 violaciones, 0 Critical/Serious.** Verificación visual del marquee (render, transparencia, grayscale→color, alineación) mediante harness estático servido por el dev server; assets confirmados 200 sin 404 ni errores de consola.

### 14. Archivos modificados

`index.html`, `src/main.js`, `src/css/site.css`, `.claude/launch.json`. **Nuevos:** `src/content/clients.js`, `src/clients.js`, `public/media/clientes/*` (9 assets), `docs/client-logo-sources.md`. Originales en `media-source/clientes/originals/` (git-ignored).

### 15. Commit

`feat: add trusted clients showcase` (assets verificados + marquee de clientes + manifest + docs).

### 16. Pendientes del usuario

Enviar los logos oficiales de los clientes marcados `NEEDS_USER_ASSET` y confirmar la entidad de los `NEEDS_USER_CONFIRMATION` (ver lista en la entrega y en `docs/client-logo-sources.md`). Al recibirlos se incorporan al mismo pipeline y basta marcar su entrada como `verified` con la ruta del asset en `src/content/clients.js`.
