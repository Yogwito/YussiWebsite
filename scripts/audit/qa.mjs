// QA funcional de auditoría (solo lectura). Uso:
//   node scripts/audit/qa.mjs http://localhost:4173 docs/audit-2026-10-21
// Requiere playwright y @axe-core/playwright instalados (no son dependencias del sitio).
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE = process.argv[2] || 'http://localhost:4173'
const OUT = process.argv[3] || 'docs/audit-2026-10-21'
const SHOTS = path.join(OUT, 'qa-shots')
fs.mkdirSync(SHOTS, { recursive: true })
const WIDTHS = [360, 390, 768, 1440, 1920]
const report = { base: BASE, browsers: {}, scenarios: {} }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })

async function open(opts = {}, url = BASE + '/') {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errors = []
  const failed = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('requestfailed', (r) => failed.push(r.url() + ' ' + r.failure()?.errorText))
  page.on('response', (r) => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()) })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  return { ctx, page, errors, failed }
}

async function scrollAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)) }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(800)
}

for (const width of WIDTHS) {
  const mobile = width < 768
  const { ctx, page, errors, failed } = await open({ viewport: { width, height: mobile ? 780 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 })
  await scrollAll(page)
  const r = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h.length > 1)
    const brokenAnchors = [...new Set(anchors.filter((h) => !document.getElementById(h.slice(1))))]
    const overflowX = document.documentElement.scrollWidth - window.innerWidth
    const small = [...document.querySelectorAll('a, button, input, select, textarea, summary, [role="button"]')].filter((el) => {
      const b = el.getBoundingClientRect(); const s = getComputedStyle(el)
      if (!b.width || !b.height || s.visibility === 'hidden' || s.display === 'none') return false
      if (el.closest('p, li') && el.tagName === 'A' && el.closest('p')) return false // enlaces en línea: excepción WCAG 2.5.8
      return b.width < 24 || b.height < 24 ? 'lt24' : (b.width < 44 || b.height < 44)
    }).map((el) => {
      const b = el.getBoundingClientRect()
      return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].slice(0, 2).join('.')} ${Math.round(b.width)}x${Math.round(b.height)}`
    })
    const imgs = [...document.images]
    return {
      h1: document.querySelectorAll('h1').length,
      landmarks: ['header', 'nav', 'main', 'footer'].map((t) => `${t}:${document.querySelectorAll(t).length}`).join(' '),
      brokenAnchors, overflowX,
      tapTargetsUnder44: small.length, tapSample: small.slice(0, 12),
      imgsNoAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
      imgsBroken: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc),
      oversizedImgs: imgs.filter((i) => i.naturalWidth && i.clientWidth && i.naturalWidth > i.clientWidth * window.devicePixelRatio * 2.2).map((i) => `${i.currentSrc.split('/').pop()} ${i.naturalWidth}px→${i.clientWidth}px`).slice(0, 10)
    }
  })
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  r.axe = axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) }))
  r.consoleErrors = errors
  r.failedRequests = [...new Set(failed)]
  await page.screenshot({ path: path.join(SHOTS, `full-${width}.png`), fullPage: false })
  report.scenarios[`viewport-${width}`] = r
  await ctx.close()
}

// Menú móvil
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true })
  const res = {}
  await page.click('#hamburger')
  await page.waitForTimeout(500)
  res.openVisible = await page.isVisible('#mobile-menu')
  res.ariaExpanded = await page.getAttribute('#hamburger', 'aria-expanded')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  res.closedByEscape = !(await page.evaluate(() => document.getElementById('mobile-menu').classList.contains('open') || document.getElementById('mobile-menu').getAttribute('aria-hidden') === 'false'))
  await page.click('#hamburger'); await page.waitForTimeout(400)
  const link = page.locator('#mobile-menu a[href^="#"]').first()
  const href = await link.getAttribute('href')
  await link.click(); await page.waitForTimeout(1500)
  res.linkNavigated = { href, targetTop: await page.evaluate((h) => Math.round(document.querySelector(h).getBoundingClientRect().top), href) }
  res.consoleErrors = errors
  report.scenarios.mobileMenu = res
  await ctx.close()
}

// Idioma ES/EN
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 } })
  await page.click('#lang-btn'); await page.waitForTimeout(400)
  const res = await page.evaluate(() => {
    const es = /\b(de|para|con|nuestros?|empresa|prendas?|bordado|cotiza|envíos?|producción|también|años|línea)\b|[áéíóúñ¿¡]/i
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const left = []
    while (walker.nextNode()) {
      const n = walker.currentNode; const t = n.textContent.trim(); const el = n.parentElement
      if (!t || t.length < 4 || !el || el.closest('script,style,[aria-hidden="true"],.page-loader') || !el.getClientRects().length) continue
      if (es.test(t) && !el.closest('[data-en]')) left.push(t.slice(0, 80))
    }
    const missingEn = [...document.querySelectorAll('[data-es]:not([data-en])')].length
    const altMissingEn = [...document.querySelectorAll('img[data-alt-es]:not([data-alt-en])')].length
    const imgsAltNotI18n = [...document.querySelectorAll('img[alt]:not([alt=""]):not([data-alt-en])')].length
    const placeholders = [...document.querySelectorAll('input[placeholder], textarea[placeholder]')].map((e) => e.placeholder)
    return { htmlLang: document.documentElement.lang, title: document.title, untranslatedVisible: [...new Set(left)].slice(0, 60), untranslatedCount: new Set(left).size, missingEn, altMissingEn, imgsAltNotI18n, placeholders }
  })
  res.consoleErrors = errors
  report.scenarios.langEN = res
  await ctx.close()
}

// Formulario → WhatsApp
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 } })
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return {} } })
  await page.fill('#f-name', 'José Peña')
  await page.fill('#f-company', 'Café & Señal S.A.S.')
  await page.fill('#f-phone', '+57 300 123 4567')
  await page.selectOption('#f-service', { index: 1 })
  await page.fill('#f-msg', 'Línea 1: 20 camisas\nLínea 2: logo #3 ¿precio?')
  await page.waitForTimeout(1100)
  await page.click('#contact-form [type="submit"]')
  await page.waitForTimeout(500)
  const url = (await page.evaluate(() => window.__opened))[0] || ''
  const text = url ? decodeURIComponent(new URL(url).searchParams.get('text') || '') : ''
  report.scenarios.formWhatsapp = { url: url.slice(0, 60) + '…', text, ok: text.includes('José Peña') && text.includes('Café & Señal') && text.includes('\n') && text.includes('¿precio?'), consoleErrors: errors }
  await ctx.close()
}

// Lightbox, FAQ, mapa, globo, videos
{
  const { ctx, page, errors } = await open({ viewport: { width: 1440, height: 900 } })
  const res = {}
  const trigger = page.locator('[data-lightbox] img:not(.line-detail-thumb img)').locator('visible=true').first()
  res.lightboxTriggers = await page.locator('[data-lightbox]').count()
  if (await trigger.count()) {
    await trigger.scrollIntoViewIfNeeded(); await trigger.click(); await page.waitForTimeout(600)
    res.lightboxOpen = await page.evaluate(() => document.querySelector('dialog.lightbox')?.open)
    const c1 = await page.textContent('.lightbox-count')
    await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400)
    res.arrowChangesImage = c1 !== (await page.textContent('.lightbox-count'))
    res.focusInside = await page.evaluate(() => !!document.activeElement?.closest('dialog.lightbox'))
    await page.keyboard.press('Escape'); await page.waitForTimeout(400)
    res.escapeCloses = !(await page.evaluate(() => document.querySelector('dialog.lightbox')?.open))
    res.focusRestored = await page.evaluate(() => !document.activeElement?.closest('dialog') && document.activeElement !== document.body)
  }
  const faq = page.locator('#faq summary, #faq button').first()
  if (await faq.count()) {
    await faq.scrollIntoViewIfNeeded(); await faq.click(); await page.waitForTimeout(500)
    res.faqToggles = await page.evaluate(() => { const d = document.querySelector('#faq details'); if (d) return d.open; const b = document.querySelector('#faq button[aria-expanded]'); return b?.getAttribute('aria-expanded') })
  }
  await page.locator('#coverage').scrollIntoViewIfNeeded(); await page.waitForTimeout(3000)
  res.globe = await page.evaluate(() => ({ canvas: !!document.querySelector('#coverage-canvas canvas, canvas#coverage-canvas'), fallbackHidden: document.getElementById('coverage-fallback')?.hidden ?? null, mapClass: document.getElementById('coverage-map')?.className }))
  await page.locator('.location-map').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500)
  res.mapIframeAfterScroll = await page.evaluate(() => !!document.querySelector('.location-map iframe'))
  res.videos = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ id: v.id, preload: v.preload, poster: !!(v.poster || v.dataset.poster), paused: v.paused, sources: [...v.querySelectorAll('source')].map((s) => s.getAttribute('src') || s.dataset.src).join(' ') })))
  res.marquees = await page.evaluate(() => [...document.querySelectorAll('[class*="marquee"]')].slice(0, 4).map((m) => m.className + ' anim=' + getComputedStyle(m).animationName))
  res.consoleErrors = errors
  report.scenarios.interactive = res
  await ctx.close()
}

// Swipe del lightbox y carrusel en móvil
{
  const { ctx, page, errors } = await open({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true })
  const trigger = page.locator('[data-lightbox] img:not(.line-detail-thumb img)').locator('visible=true').first()
  const res = {}
  if (await trigger.count()) {
    await trigger.scrollIntoViewIfNeeded(); await trigger.tap(); await page.waitForTimeout(600)
    const c1 = await page.textContent('.lightbox-count')
    const box = (await page.locator(".lightbox-figure").boundingBox()) || { y: 300, height: 100 }
    const cdp = await ctx.newCDPSession(page)
    const y = box.y + box.height / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 330, y }] })
    for (const x of [280, 200, 120, 60]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(500)
    res.swipeChangesImage = c1 !== (await page.textContent('.lightbox-count'))
  }
  res.consoleErrors = errors
  report.scenarios.mobileSwipe = res
  await ctx.close()
}

// Estados límite
const edge = {
  noJS: { javaScriptEnabled: false, viewport: { width: 390, height: 780 } },
  reducedMotion: { reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } },
  zoom200: { viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 },
  landscapePhone: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }
}
for (const [name, opts] of Object.entries(edge)) {
  const { ctx, page, errors, failed } = await open(opts)
  if (name !== 'noJS') await scrollAll(page)
  const res = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('main section, main h2')].filter((el) => {
      const s = getComputedStyle(el); return parseFloat(s.opacity) < 0.1 || s.visibility === 'hidden'
    }).map((el) => el.id || el.textContent.trim().slice(0, 40))
    const loader = document.getElementById('page-loader')
    return {
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      invisibleSectionsOrHeadings: hidden.slice(0, 20),
      loaderVisible: loader ? getComputedStyle(loader).display !== 'none' && parseFloat(getComputedStyle(loader).opacity) > 0.1 : false,
      imgsLoaded: [...document.images].filter((i) => i.complete && i.naturalWidth).length + '/' + document.images.length,
      runningAnimations: document.getAnimations ? document.getAnimations().filter((a) => a.playState === 'running').length : null
    }
  })
  res.consoleErrors = errors
  res.failedRequests = [...new Set(failed)].slice(0, 10)
  await page.screenshot({ path: path.join(SHOTS, `edge-${name}.png`) })
  report.scenarios[name] = res
  await ctx.close()
}

// Sin WebGL
{
  const b2 = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--disable-webgl', '--disable-3d-apis'] })
  const ctx = await b2.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage(); const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.locator('#coverage').scrollIntoViewIfNeeded(); await page.waitForTimeout(3000)
  const res = await page.evaluate(() => ({ fallbackHidden: document.getElementById('coverage-fallback')?.hidden, fallbackVisible: !!document.getElementById('coverage-fallback')?.getClientRects().length, mapClass: document.getElementById('coverage-map')?.className }))
  res.consoleErrors = errors
  await page.locator('#coverage').screenshot({ path: path.join(SHOTS, 'edge-noWebGL-coverage.png') })
  report.scenarios.noWebGL = res
  await b2.close()
}

// 3G simulada (Fast 3G de DevTools)
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true })
  const page = await ctx.newPage(); const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 })
  const t0 = Date.now()
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 120000 })
  const dcl = Date.now() - t0
  await page.waitForTimeout(6000)
  const res = await page.evaluate(() => ({
    lcp: performance.getEntriesByType('largest-contentful-paint').at(-1)?.startTime ?? null,
    h1Visible: (() => { const h = document.querySelector('h1'); return !!h && parseFloat(getComputedStyle(h).opacity) > 0.5 })(),
    loaderVisible: (() => { const l = document.getElementById('page-loader'); return !!l && getComputedStyle(l).display !== 'none' && parseFloat(getComputedStyle(l).opacity) > 0.1 })(),
    bytes: performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), 0)
  }))
  res.domContentLoadedMs = dcl
  res.errors = errors
  await page.screenshot({ path: path.join(SHOTS, 'edge-3g-6s.png') })
  report.scenarios.fast3G = res
  await ctx.close()
}

report.browsers = { chromium: browser.version(), webkit: 'no disponible en el contenedor', firefox: 'no disponible en el contenedor' }
await browser.close()
fs.writeFileSync(path.join(OUT, 'qa-report.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 1).slice(0, 200000))
