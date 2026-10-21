// Aplica en modo obligatorio la CSP de public/.htaccess sobre un servidor local
// y recorre el sitio (scroll, globo, mapa, lightbox, formulario) buscando violaciones.
// Uso: node scripts/audit/csp-check.mjs http://localhost:4173
import fs from 'node:fs'
import { chromium } from 'playwright'
const base = process.argv[2] || 'http://localhost:4173'
const csp = fs.readFileSync(new URL('../../public/.htaccess', import.meta.url), 'utf8').match(/Content-Security-Policy-Report-Only "([^"]+)"/)[1]
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const out = {}
for (const [name, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', { viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true }]]) {
  const ctx = await b.newContext(opts)
  await ctx.route(`${base}/**`, async (route) => {
    const res = await route.fetch()
    const headers = { ...res.headers() }
    if ((headers['content-type'] || '').includes('text/html')) headers['content-security-policy'] = csp
    route.fulfill({ response: res, headers })
  })
  const p = await ctx.newPage(); const v = []; const errs = []
  await p.exposeFunction('__csp', (x) => v.push(x))
  await p.addInitScript(() => document.addEventListener('securitypolicyviolation', (e) => window.__csp(`${e.violatedDirective} ${e.blockedURI}`)))
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_PROXY|net::/.test(m.text())) errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push(e.message))
  await p.goto(base + '/', { waitUntil: 'networkidle' })
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)) } })
  await p.locator('#coverage').scrollIntoViewIfNeeded()
  if (await p.locator('.coverage-activate').count()) await p.click('.coverage-activate')
  await p.waitForTimeout(4000)
  await p.locator('.location-map-btn').scrollIntoViewIfNeeded(); await p.click('.location-map-btn'); await p.waitForTimeout(1500)
  const img = p.locator('[data-lightbox] img').locator('visible=true').first()
  await img.scrollIntoViewIfNeeded(); await img.click(); await p.waitForTimeout(800); await p.keyboard.press('Escape')
  out[name] = { violations: [...new Set(v)], consoleErrors: errs, globeCanvas: await p.evaluate(() => !!document.querySelector('#coverage canvas')), mapIframe: await p.evaluate(() => !!document.querySelector('.location-map iframe')) }
  await ctx.close()
}
await b.close()
console.log(JSON.stringify({ csp, ...out }, null, 1))
