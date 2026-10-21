// Genera public/.htaccess (hosting cPanel/Apache) a partir de vercel.json.
// Uso: node scripts/build-htaccess.mjs
import fs from 'node:fs'

const { redirects } = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))

// Páginas del sitio viejo con contenido real (docs/dns-actual.md §6)
const legacy = [
  ['quienes-somos', '/#about'],
  ['nuestros-servicios', '/#services'],
  ['precios', '/#contact'],
  ['contacta-con-nosotros', '/#contact']
]

// CSP propuesta en docs/audit-2026-10-21.md §3.1. Se publica primero en modo
// Report-Only; frame-ancestors no aplica en Report-Only y va en una CSP aparte.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.google.com https://maps.google.com',
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://wa.me https://api.whatsapp.com",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests'
].join('; ')

const escape = (path) => path.slice(1).replace(/[.+()[\]^$?*\\]/g, '\\$&')

const lines = [
  '# Generado por scripts/build-htaccess.mjs desde vercel.json. No editar a mano.',
  'Options -Indexes',
  'DirectoryIndex index.html',
  '',
  '<IfModule mod_rewrite.c>',
  '  RewriteEngine On',
  '',
  '  # Archivos y carpetas ocultos (.DS_Store, .git, .env…): prohibidos, salvo .well-known (AutoSSL)',
  '  RewriteCond %{REQUEST_URI} !^/\\.well-known/',
  '  RewriteRule (^|/)\\. - [F]',
  '',
  '  # HTTPS y www → raíz en un solo salto',
  '  RewriteCond %{HTTPS} !=on [OR]',
  '  RewriteCond %{HTTP_HOST} ^www\\. [NC]',
  '  RewriteCond %{REQUEST_URI} !^/\\.well-known/',
  '  RewriteRule ^ https://bordadosyussi.com%{REQUEST_URI} [L,R=301]',
  '',
  '  # Sitio viejo',
  ...legacy.map(([from, to]) => `  RewriteRule ^${from}/?$ ${to} [NE,L,R=301]`),
  '',
  `  # Medios renombrados (${redirects.length} reglas de vercel.json)`,
  ...redirects.map((r) => `  RewriteRule ^${escape(r.source)}$ ${r.destination} [L,R=301]`),
  '</IfModule>',
  '',
  '<IfModule mod_headers.c>',
  '  Header always set X-Content-Type-Options "nosniff"',
  '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
  '  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
  '  Header always set Strict-Transport-Security "max-age=31536000"',
  '  Header always set X-Frame-Options "SAMEORIGIN"',
  `  Header always set Content-Security-Policy "frame-ancestors 'self'"`,
  `  Header always set Content-Security-Policy-Report-Only "${csp}"`,
  '',
  '  <FilesMatch "\\.html?$">',
  '    Header set Cache-Control "no-cache, must-revalidate"',
  '  </FilesMatch>',
  '  <FilesMatch "\\.(webp|avif|jpe?g|png|gif|svg|ico|mp4|webm|geojson)$">',
  '    Header set Cache-Control "public, max-age=2592000"',
  '  </FilesMatch>',
  '  <If "%{REQUEST_URI} =~ m#^/assets/#">',
  '    Header set Cache-Control "public, max-age=31536000, immutable"',
  '  </If>',
  '</IfModule>',
  '',
  '<IfModule mod_mime.c>',
  '  AddType application/geo+json .geojson',
  '  AddType image/avif .avif',
  '  AddType image/webp .webp',
  '</IfModule>',
  '',
  '<IfModule mod_deflate.c>',
  '  AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml application/xml application/javascript text/javascript application/json application/geo+json image/svg+xml',
  '</IfModule>',
  '',
  '# php -- BEGIN cPanel-generated handler, do not edit',
  '# Set the “ea-php83” package as the default “PHP” programming language.',
  '<IfModule mime_module>',
  '  AddHandler application/x-httpd-ea-php83 .php .php8 .phtml',
  '</IfModule>',
  '# php -- END cPanel-generated handler, do not edit',
  ''
]

fs.writeFileSync('public/.htaccess', lines.join('\n'))
console.log(`public/.htaccess: ${redirects.length + legacy.length} redirecciones`)
