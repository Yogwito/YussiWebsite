# DNS actual de bordadosyussi.com y cambio mínimo para Vercel

Consultado el 18 oct 2026 con `dig` (contra los nameservers autoritativos), `whois` y la CLI de Vercel. **No se cambió ningún registro DNS.** Lo único que se hizo fue agregar los dominios al proyecto de Vercel (sección 4).

## 1. Quién administra el DNS

| Dato | Valor |
|---|---|
| Registrador | **Name.com, Inc.** (creado 31 may 2025, vence 31 may 2027) |
| Nameservers | `ns5.qpula.com`, `ns6.qpula.com` (TTL 86400) |
| Administra el DNS | **El hosting, Qpula**: zona DNS de cPanel en el servidor `dedserver.qpula.com` |
| Servidor (174.142.126.22) | Leaseweb Canada (red IWEB), PTR `dedserver.qpula.com` |
| Cloudflare | **No.** Solo el dominio propio de Qpula usa Cloudflare; bordadosyussi.com no. |
| SOA | `ns5.qpula.com. tamayolo.gmail.com. 2026090101` |

Los cambios se hacen en el **cPanel de Qpula → Zone Editor**, no en Name.com.

## 2. Registros consultables

| Nombre | Tipo | Valor | TTL |
|---|---|---|---|
| `bordadosyussi.com` | A | `174.142.126.22` | 14400 |
| `bordadosyussi.com` | AAAA | — (no existe) | |
| `www` | CNAME | `bordadosyussi.com.` | 14400 |
| `mail` | **CNAME** | `bordadosyussi.com.` | 14400 |
| `webmail` | A | `174.142.126.22` | 14400 |
| `cpanel` | A | `174.142.126.22` | 14400 |
| `ftp` | A | `174.142.126.22` | 14400 |
| `webdisk` | A | `174.142.126.22` | 14400 |
| `cpcalendars` | A | `174.142.126.22` | 14400 |
| `cpcontacts` | A | `174.142.126.22` | 14400 |
| `autodiscover` | A | `174.142.126.22` | 14400 |
| `autoconfig` | A | `174.142.126.22` | 14400 |
| `smtp`, `pop`, `imap` | — | no existen | |
| `bordadosyussi.com` | **MX** | `0 bordadosyussi.com.` | 14400 |
| `bordadosyussi.com` | TXT (SPF) | `v=spf1 +a +mx +ip4:174.142.126.22 ~all` | 14400 |
| `_dmarc` | TXT | `v=DMARC1; p=none;` | 14400 |
| `default._domainkey` | TXT (DKIM) | `v=DKIM1; k=rsa; p=MIIBIjAN…IDAQAB;` (clave RSA de cPanel) | 14400 |
| `_autodiscover._tcp` | SRV | `0 0 443 cpanelemaildiscovery.cpanel.net.` | 14400 |
| `_caldavs._tcp` | SRV | `0 0 2080 bordadosyussi.com.` | 14400 |
| `_carddavs._tcp` | SRV | `0 0 2080 bordadosyussi.com.` | 14400 |
| CAA | — | no existe (no limita a Let's Encrypt, que usa Vercel) | |
| Verificación de Google (`google-site-verification`) | — | no existe | |

## 3. ¿El correo depende de 174.142.126.22?

**Sí, y además depende del registro A del dominio raíz:**

- El único MX es `0 bordadosyussi.com.`, que apunta al propio dominio raíz, así que hoy resuelve a `174.142.126.22`.
- `mail.bordadosyussi.com` es un CNAME al raíz y también termina en `174.142.126.22`.
- Los SRV de calendario y contactos (`_caldavs`, `_carddavs`) apuntan al raíz.

**Si solo se cambia el A del raíz a Vercel, el correo entrante deja de llegar**: los servidores remitentes entregarían a Vercel, que no recibe correo. `mail.` también pasaría a Vercel.

Lo que no se ve afectado: `webmail`, `cpanel`, `ftp`, `webdisk`, `cpcalendars`, `cpcontacts`, `autodiscover` y `autoconfig` tienen A propio hacia la IP vieja.

> Dato a confirmar con el cliente: el correo que publica la web es `logosbordadosyussi@gmail.com`. Hay que confirmar si alguien usa buzones `@bordadosyussi.com`. Si nadie los usa, el riesgo es menor, pero igual conviene conservarlos.

## 4. Lo que pide Vercel

Se agregaron `bordadosyussi.com` y `www.bordadosyussi.com` al proyecto `yussi-website` con `vercel domains add`. Ambos quedan en estado "invalid configuration" hasta que cambie el DNS (es lo esperado).

| Host | Tipo | Valor que pide Vercel |
|---|---|---|
| `@` (raíz) | A | `216.198.79.1` **y** `64.29.17.1` (recomendado). Alternativa válida: un solo A `76.76.21.21` |
| `www` | CNAME | `5c4148079b3d61ba.vercel-dns-017.com.` (alternativa: `cname.vercel-dns.com.`) |

Vercel también ofrece mover los nameservers a `ns1/ns2.vercel-dns.com`. **No se recomienda**: obligaría a recrear en Vercel toda la zona de correo y cPanel.

## 5. Cambio mínimo

El MX y `mail` dependen del A del raíz, así que **no basta con cambiar solo el raíz y www**. Hay que separar primero el correo hacia un nombre propio. Son 4 cambios, en este orden, en el Zone Editor de cPanel (Qpula).

**Paso 0, un día antes:** bajar el TTL de `bordadosyussi.com` A, `www`, `mail` y MX de 14400 a **300**, para que el cambio y una eventual reversión propaguen en minutos.

**Paso 1, preparar el correo (sin efecto visible):**
1. `mail.bordadosyussi.com`: reemplazar el **CNAME** `bordadosyussi.com.` por un **A `174.142.126.22`**.
2. MX: cambiar `0 bordadosyussi.com.` por **`0 mail.bordadosyussi.com.`**.
3. *(Si usan calendario o contactos de cPanel)* SRV `_caldavs._tcp` y `_carddavs._tcp`: cambiar el destino `bordadosyussi.com.` por `mail.bordadosyussi.com.` (puerto 2080).

Verificar antes de seguir: `dig MX bordadosyussi.com` debe devolver `mail.bordadosyussi.com`, y `dig A mail.bordadosyussi.com` debe devolver `174.142.126.22`. Enviar un correo de prueba a un buzón `@bordadosyussi.com`.

**Paso 2, la web:**
4. `bordadosyussi.com` A: quitar `174.142.126.22` y poner **`216.198.79.1`** y **`64.29.17.1`**.
5. `www`: cambiar el CNAME `bordadosyussi.com.` por **`5c4148079b3d61ba.vercel-dns-017.com.`**.

Vercel emite el certificado HTTPS en cuanto ve el DNS (minutos). Verificar con `vercel domains verify bordadosyussi.com`, `curl -I https://bordadosyussi.com` (debe responder Vercel y **no** enviar `x-robots-tag: noindex`) y `curl -I https://www.bordadosyussi.com`.

### NO tocar

- Nameservers en Name.com (siguen siendo Qpula).
- `webmail`, `cpanel`, `ftp`, `webdisk`, `cpcalendars`, `cpcontacts`, `autodiscover` y `autoconfig` (A a 174.142.126.22).
- DKIM `default._domainkey`, DMARC `_dmarc` y SRV `_autodiscover._tcp`.
- SPF: puede quedar igual. `+mx` y `ip4:174.142.126.22` siguen cubriendo el servidor de correo. Opcional: quitar `+a`, que después del cambio autorizaría las IPs de Vercel, que no envían correo: `v=spf1 +mx +ip4:174.142.126.22 ~all`.

### Riesgos y avisos

- **Clientes de correo** (celulares, Outlook) configurados con servidor `bordadosyussi.com` dejarán de conectar. Deben usar `mail.bordadosyussi.com` (o el nombre del servidor de Qpula). Hay que revisarlo con quien use el correo **antes** del cambio.
- **AutoSSL de cPanel:** el certificado del raíz dejará de renovarse en cPanel (es lo esperado). El de `mail.` seguirá renovándose porque su A apunta al servidor.
- **Reversión:** volver a poner el A del raíz en `174.142.126.22` y el CNAME de `www` en `bordadosyussi.com.`. Los cambios de correo del paso 1 pueden quedarse: funcionan con o sin Vercel.

## 6. Sitio viejo y redirecciones 301

El sitio viejo es una **plantilla de constructor web ("webcard")** que nunca se personalizó del todo:
- su título dice "New York, NY" y tiene coordenadas de Nueva York;
- su `sitemap.xml` publica 36 URLs, entre ellas páginas de demo (`/real-estate-single-page-layout/…` con inmuebles en Chicago y Denver, `/blog-single-page-layout/blog-post-1…6`, `/jobs-1-item/…`, `/modules-1-item/…`);
- no tiene `robots.txt` (404).

**Indexación en Google:** un `site:bordadosyussi.com` en el buscador disponible no devolvió ninguna página, y no hay verificación de Search Console en el DNS. No se pudo confirmar contra Google directamente: conviene revisarlo en Search Console después del cambio.

Las únicas URLs con contenido real del negocio, que vale la pena redirigir:

| URL vieja | Destino nuevo |
|---|---|
| `/quienes-somos` | `/#about` |
| `/nuestros-servicios` | `/#services` |
| `/precios` | `/#contact` |
| `/contacta-con-nosotros` | `/#contact` |
| `/index.html` | `/` (Vercel ya lo sirve) |

`/legal-notice`, `/privacy` y `/subpage` no tienen equivalente: es mejor dejar que den 404 hasta que exista una política de datos. Las páginas de demo (inmuebles, blog, empleos, módulos) **no deben redirigirse**: no son del negocio y un 404 hace que Google las elimine.

Propuesta para `vercel.json` (**no aplicada**). El sitio viejo usa barra final, así que se cubren ambas formas:

```json
"redirects": [
  { "source": "/quienes-somos", "destination": "/#about", "permanent": true },
  { "source": "/quienes-somos/", "destination": "/#about", "permanent": true },
  { "source": "/nuestros-servicios", "destination": "/#services", "permanent": true },
  { "source": "/nuestros-servicios/", "destination": "/#services", "permanent": true },
  { "source": "/precios", "destination": "/#contact", "permanent": true },
  { "source": "/precios/", "destination": "/#contact", "permanent": true },
  { "source": "/contacta-con-nosotros", "destination": "/#contact", "permanent": true },
  { "source": "/contacta-con-nosotros/", "destination": "/#contact", "permanent": true }
]
```

Después del cambio de DNS, dar de alta el dominio en Google Search Console (verificación por TXT en Qpula) y enviar el `sitemap.xml` nuevo.
