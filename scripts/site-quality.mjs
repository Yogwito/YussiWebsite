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
assert.equal(JSON.parse(read('vercel.json')).headers.length, 1)
assert.match(read('public/robots.txt'), /Disallow: \/$/m)
assert.match(read('public/sitemap.xml'), /https:\/\/bordadosyussi\.com\//)

for (const media of [
  'public/media/yussi-hero-production.mp4',
  'public/media/yussi-hero-production-mobile.mp4',
  'public/media/bordado-en-proceso.mp4',
  'public/media/confeccion-en-proceso.mp4',
  'public/data/countries.min.geojson',
  'public/data/colombia-departments.min.geojson'
]) {
  assert.ok(fs.existsSync(path.join(root, media)), `Missing runtime asset: ${media}`)
}

assert.equal(fs.existsSync(path.join(root, 'public/img/FOTOS WEB')), false)
assert.equal(fs.existsSync(path.join(root, 'public/img/originals')), false)
assert.equal(fs.existsSync(path.join(root, 'public/marcasAsociadas/originals')), false)
console.log('Static website quality checks passed')
