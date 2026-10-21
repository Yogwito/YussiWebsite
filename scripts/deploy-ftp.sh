#!/usr/bin/env bash
# Despliega dist/ al public_html de cPanel por FTP con TLS explícito.
# Requiere FTP_USER y FTP_PASS en el entorno (cuenta FTP con raíz = public_html).
# Uso: DRY_RUN=1 npm run deploy:ftp   (solo muestra qué cambiaría; hacerlo siempre antes)
#      npm run deploy:ftp             (build + subida + zip y tag del despliegue)
# Opcionales:
#   FTP_HOST          host del FTP. Debe coincidir con el certificado del servidor FTP
#                     (si bordadosyussi.com no coincide, usar el hostname del servidor de cPanel).
#   FTP_INSECURE_TLS=1  desactiva la verificación del certificado (no recomendado: expone la contraseña a un MITM).
#   DEPLOY_ARCHIVE    carpeta donde se guarda el zip de cada despliegue (por defecto ~/yussi-deploys).
# Rollback: docs/operacion.md.
set -euo pipefail

: "${FTP_USER:?Falta FTP_USER}"
: "${FTP_PASS:?Falta FTP_PASS}"
FTP_HOST="${FTP_HOST:-bordadosyussi.com}"
archive="${DEPLOY_ARCHIVE:-$HOME/yussi-deploys}"

node scripts/build-htaccess.mjs

# Un despliegue real sale de un commit limpio (incluido el .htaccess generado),
# para poder volver a él.
if [ -z "${DRY_RUN:-}" ] && [ -n "$(git status --porcelain)" ]; then
  echo 'Hay cambios sin commit: haz commit antes de desplegar.' >&2
  exit 1
fi

npm run build
test -f dist/index.html || { echo 'dist/index.html no existe' >&2; exit 1; }
test -f dist/.htaccess || { echo 'dist/.htaccess no existe' >&2; exit 1; }

# Fuera de dist/ todo archivo oculto salvo .htaccess (.DS_Store y similares) y
# los README internos. Como no se excluyen del mirror, --delete también borra
# del servidor los que hayan quedado de despliegues anteriores.
find dist -name '.*' ! -name '.htaccess' -type f -print -delete
find dist -name 'README.md' -type f -print -delete

dry=''
[ -n "${DRY_RUN:-}" ] && dry='--dry-run'

verify='yes'
if [ -n "${FTP_INSECURE_TLS:-}" ]; then
  verify='no'
  echo 'AVISO: verificación TLS del FTP desactivada (FTP_INSECURE_TLS).' >&2
fi

# cgi-bin, .well-known (AutoSSL), .ftpquota, .user.ini/php.ini (cPanel) y
# bordadosyussi.com/ (homes de cuentas FTP) no son del sitio: se excluyen para
# que --delete no los borre.
LFTP_PASSWORD="$FTP_PASS" lftp -u "$FTP_USER" --env-password -p 21 "$FTP_HOST" <<LFTP
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate $verify
set net:max-retries 2
set net:timeout 30
mirror -R --delete --parallel=4 --verbose=1 $dry \
  -x '^cgi-bin/' -x '^\.well-known/' -x '^\.ftpquota$' -x '^\.user\.ini$' -x '^php\.ini$' -x '^bordadosyussi\.com/' \
  dist/ /
bye
LFTP

[ -n "$dry" ] && exit 0

# Registro del despliegue: zip del dist/ publicado y tag del commit.
stamp="$(date +%Y%m%d-%H%M)"
sha="$(git rev-parse --short HEAD)"
mkdir -p "$archive"
(cd dist && zip -qr "$archive/dist-$stamp-$sha.zip" .)
git tag -a "deploy-$stamp" -m "Despliegue FTP $stamp ($sha)"
git push origin "deploy-$stamp" || echo "No se pudo empujar el tag deploy-$stamp; empújalo a mano." >&2
echo "Desplegado $sha · zip: $archive/dist-$stamp-$sha.zip · tag: deploy-$stamp"
