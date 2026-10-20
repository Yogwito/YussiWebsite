#!/usr/bin/env bash
# Despliega dist/ al public_html de cPanel por FTP con TLS explícito.
# Requiere FTP_USER y FTP_PASS en el entorno (cuenta FTP con raíz = public_html).
# Uso: npm run deploy:ftp            (build + subida)
#      DRY_RUN=1 npm run deploy:ftp  (solo muestra qué cambiaría)
set -euo pipefail

: "${FTP_USER:?Falta FTP_USER}"
: "${FTP_PASS:?Falta FTP_PASS}"
FTP_HOST="${FTP_HOST:-bordadosyussi.com}"

node scripts/build-htaccess.mjs
npm run build
test -f dist/.htaccess || { echo 'dist/.htaccess no existe' >&2; exit 1; }

dry=''
[ -n "${DRY_RUN:-}" ] && dry='--dry-run'

# El certificado del FTP no cubre bordadosyussi.com, por eso no se verifica.
# cgi-bin, .well-known (AutoSSL), .ftpquota y bordadosyussi.com/ (homes de
# cuentas FTP) no son del sitio: se excluyen para que --delete no los borre.
LFTP_PASSWORD="$FTP_PASS" lftp -u "$FTP_USER" --env-password -p 21 "$FTP_HOST" <<LFTP
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set net:max-retries 2
set net:timeout 30
mirror -R --delete --parallel=4 --verbose=1 $dry \
  -x '^cgi-bin/' -x '^\.well-known/' -x '^\.ftpquota$' -x '^bordadosyussi\.com/' \
  dist/ /
bye
LFTP
