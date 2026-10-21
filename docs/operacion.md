# Operación · despliegue, rollback y monitoreo

Producción: cPanel (Apache) en `bordadosyussi.com`, IP 174.142.126.22, DNS en `ns5/ns6.qpula.com`. El sitio es estático: `dist/` se sube por FTP con TLS.

## Desplegar

1. Trabajar en una rama, hacer commit y fusionar a `main`.
2. Desde un equipo con `lftp` y `zip`:
   ```bash
   export FTP_USER=… FTP_PASS=…           # nunca en archivos del repo
   DRY_RUN=1 npm run deploy:ftp           # revisar la lista de cambios
   npm run deploy:ftp                     # despliegue real
   ```
3. El despliegue real exige el árbol limpio y deja:
   - `~/yussi-deploys/dist-AAAAMMDD-HHMM-<sha>.zip` (lo que se publicó);
   - el tag `deploy-AAAAMMDD-HHMM` en GitHub.
4. Si el FTP falla por el certificado: usar `FTP_HOST=<hostname del servidor de cPanel>` (el que figura en cPanel → *Información general*), cuyo certificado sí es válido. `FTP_INSECURE_TLS=1` solo como último recurso y desde una red de confianza.

`mirror --delete` borra del servidor lo que no esté en `dist/`, salvo `cgi-bin/`, `.well-known/`, `.ftpquota`, `.user.ini`, `php.ini` y `bordadosyussi.com/`. Todo archivo oculto distinto de `.htaccess` se quita de `dist/` antes de subir, así que también se borra del servidor (p. ej. `/.DS_Store`).

Después de cada despliegue:
```bash
curl -sI https://bordadosyussi.com/ | grep -iE 'HTTP/|content-security|x-frame'
curl -s -o /dev/null -w '%{http_code}\n' https://bordadosyussi.com/.DS_Store   # 403 o 404
curl -s -o /dev/null -w '%{http_code}\n' https://bordadosyussi.com/.well-known/  # no 403 por la regla de dotfiles
```

## Volver atrás (rollback)

Opción rápida (sin compilar): descomprimir el zip anterior en `dist/` y subir.
```bash
rm -rf dist && mkdir dist && unzip -q ~/yussi-deploys/dist-<anterior>.zip -d dist
DRY_RUN=1 SKIP_BUILD=1 npm run deploy:ftp && SKIP_BUILD=1 npm run deploy:ftp
```
Opción reproducible: compilar el tag anterior.
```bash
git checkout deploy-<anterior> && npm ci && npm run deploy:ftp && git checkout main
```

## Respaldo

- Mensual: cPanel → *Copia de seguridad* → *Copia de seguridad completa*; descargarla y guardarla fuera del hosting (incluye correo y DNS de la zona).
- El código está en GitHub; los originales de medios (`media-source/`) solo en el equipo local: tener una segunda copia (disco externo o nube).

## Monitoreo gratuito (configurar una vez)

| Qué | Herramienta | Configuración |
|---|---|---|
| Caída del sitio | UptimeRobot (gratis) o Better Stack | Monitor HTTP(s) a `https://bordadosyussi.com/` cada 5 min, tipo *Keyword* con "Bordados Yussi"; alertas por correo y app |
| Vencimiento SSL | UptimeRobot (opción *SSL expiry*) | Aviso 14 y 7 días antes. El certificado actual vence el 30 nov 2026 (AutoSSL debería renovarlo antes del 31 oct) |
| Vencimiento del dominio | UptimeRobot (*Domain expiry*) o recordatorio en el calendario | Aviso 30 días antes; activar renovación automática en el registrador |
| Errores JS | Sentry (plan Developer, gratis) | Solo si se acepta un tercero más; requiere añadir su host a la CSP (`connect-src`) y mencionarlo en la política de datos |
| Indexación | Google Search Console | Verificar por DNS (TXT) y enviar `https://bordadosyussi.com/sitemap.xml` |

## CSP

La política completa está en modo `Content-Security-Policy-Report-Only` (no bloquea, solo avisa en la consola). Tras una semana sin avisos en la consola del navegador (mapa, globo, formulario, videos), pasarla a `Content-Security-Policy` en `scripts/build-htaccess.mjs`. `frame-ancestors 'self'` y `X-Frame-Options: SAMEORIGIN` ya están en vigor. Para probarla en local: `node scripts/audit/csp-check.mjs http://localhost:4173` con `npm run preview` corriendo (requiere `playwright`).

## HSTS

`max-age=31536000` sin `includeSubDomains` ni `preload`. Agregar `includeSubDomains` solo después de comprobar que `mail.`, `webmail.`, `cpanel.` y cualquier otro subdominio responden por HTTPS con certificado válido.
