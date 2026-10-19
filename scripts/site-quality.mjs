import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const index = read('index.html')

const requiredAnchors = ['hero', 'services', 'work', 'process', 'coverage', 'about', 'brands', 'faq', 'contact', 'dotacion', 'medicos', 'industrial', 'escolar', 'bordado']
for (const id of requiredAnchors) {
  assert.match(index, new RegExp(`id="${id}"`), `Missing anchor: ${id}`)
}

assert.match(index, /class="skip-link" href="#main-content"/)
assert.match(index, /<main id="main-content" tabindex="-1">/)
assert.match(index, /data-endpoint="\/api\/quote"/)
assert.doesNotMatch(index, /<form[^>]+action="mailto:/)
assert.doesNotMatch(read('src/form.js'), /setTimeout\(/)
assert.match(read('src/animations.js'), /video\[data-autoplay\]/)
assert.match(read('src/animations.js'), /window\.history\.pushState/)
assert.match(read('src/css/site.css'), /\.nav-links \{\s*display: none;/)
assert.match(read('src/css/site.css'), /\.footer-bottom[\s\S]*color: rgba\(255, 255, 255, 0\.72\)/)
const vercelHeaders = JSON.parse(read('vercel.json')).headers
assert.ok(vercelHeaders.some((rule) => rule.has?.[0]?.type === 'host' && rule.headers.some((h) => h.key === 'X-Robots-Tag')), 'Preview hosts must send X-Robots-Tag: noindex')
assert.match(read('public/robots.txt'), /Allow: \/$/m)
assert.match(read('public/robots.txt'), /Sitemap: https:\/\/bordadosyussi\.com\/sitemap\.xml/)
assert.doesNotMatch(index, /noindex/)
assert.match(index, /rel="canonical" href="https:\/\/bordadosyussi\.com\/"/)
assert.match(read('public/sitemap.xml'), /https:\/\/bordadosyussi\.com\//)

for (const media of [
  'public/media/hero/hero-produccion.mp4',
  'public/media/hero/hero-produccion-movil.mp4',
  'public/media/proceso/proceso-bordado.mp4',
  'public/media/proceso/proceso-confeccion.mp4',
  'public/media/cobertura/paises.min.geojson',
  'public/media/cobertura/colombia-departamentos.min.geojson',
  'public/media/cobertura/cobertura-mapa-estatico.webp'
]) {
  assert.ok(fs.existsSync(path.join(root, media)), `Missing runtime asset: ${media}`)
}

// Medios organizados: todo lo publicado vive en public/media/ (ver public/media/README.md).
for (const legacy of ['public/img', 'public/marcasAsociadas', 'public/models', 'public/data', 'public/media-source', 'public/media-archive']) {
  assert.equal(fs.existsSync(path.join(root, legacy)), false, `Legacy media folder must not exist: ${legacy}`)
}
const ignored = read('.gitignore')
assert.match(ignored, /^media-source\/$/m, 'media-source/ must stay out of git')
assert.match(read('.vercelignore'), /^media-source\/$/m)
assert.match(read('.vercelignore'), /^media-archive\/$/m)
console.log('Static website quality checks passed')
