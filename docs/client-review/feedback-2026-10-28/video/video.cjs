// Mide LCP, CLS y la espera de los videos con red 4G simulada.
const { chromium } = require('playwright')
const URL = process.argv[2] || 'http://localhost:4173/'
const label = process.argv[3] || 'run'
const RUNS = Number(process.argv[4] || 3)

const profiles = {
  desktop: { viewport: { width: 1440, height: 900 }, isMobile: false, cpu: 1 },
  mobile: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, cpu: 4 }
}
// Perfil "4G" de WebPageTest: 9 Mbps bajada, 1,5 Mbps subida, 170 ms RTT.
const NET = process.env.SLOW ? { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 } : { offline: false, latency: 170, downloadThroughput: 9e6 / 8, uploadThroughput: 1.5e6 / 8 }

const instrument = () => {
  const t = (window.__m = { cls: 0, lcp: 0 })
  new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) t.cls += e.value })).observe({ type: 'layout-shift', buffered: true })
  new PerformanceObserver((l) => { const e = l.getEntries().pop(); t.lcp = e.startTime; t.lcpEl = e.element?.tagName + '.' + (e.element?.className || '') + ' ' + (e.url || '').split('/').pop() }).observe({ type: 'largest-contentful-paint', buffered: true })
  document.addEventListener('DOMContentLoaded', () => {
    for (const id of ['hero-video', 'production-video']) {
      const v = document.getElementById(id)
      if (!v) continue
      const k = id.split('-')[0]
      v.addEventListener('playing', () => {
        t[k + 'Playing'] ??= performance.now()
        if (k === 'production' && t.switchClick && t.switchPlaying == null) t.switchPlaying = performance.now()
      })
      v.addEventListener('loadeddata', () => { t[k + 'Data'] ??= performance.now() })
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && t[k + 'Visible'] == null) { t[k + 'Visible'] = performance.now(); t[k + 'PosterAtVisible'] = !!v.poster || k === 'hero' }
      }, { threshold: 0.05 }).observe(v)
    }
  })
}

;(async () => {
  const browser = await chromium.launch()
  const out = {}
  for (const [name, p] of Object.entries(profiles)) {
    out[name] = []
    for (let i = 0; i < RUNS; i++) {
      const ctx = await browser.newContext({ viewport: p.viewport, isMobile: p.isMobile, hasTouch: p.hasTouch, deviceScaleFactor: p.deviceScaleFactor })
      const page = await ctx.newPage()
      const cdp = await ctx.newCDPSession(page)
      await cdp.send('Network.enable')
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
      await cdp.send('Network.emulateNetworkConditions', NET)
      if (p.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu })
      await page.addInitScript(instrument)
      await page.goto(URL, { waitUntil: 'load', timeout: 120000 })
      const loadAt = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart)
      // Lectura del hero (3 s) y luego scroll continuo (~1.700 px/s) hasta el video de producción.
      await page.waitForTimeout(3000)
      const lcp = await page.evaluate(() => window.__m.lcp)
      await page.mouse.move(p.viewport.width / 2, p.viewport.height / 2)
      for (let s = 0; s < 400; s++) {
        const visible = await page.evaluate(() => window.__m.productionVisible != null)
        if (visible) break
        await page.mouse.wheel(0, 100)
        await page.waitForTimeout(60)
      }
      // Se queda mirando el video hasta 15 s.
      await page.waitForFunction(() => window.__m.productionPlaying != null, null, { timeout: 15000 }).catch(() => {})
      // Mira el primer clip 4 s y cambia a confección.
      await page.waitForTimeout(4000)
      await page.evaluate(() => { window.__m.switchClick = performance.now(); document.querySelector('[data-film="confeccion"]').click() })
      await page.waitForFunction(() => window.__m.switchPlaying != null, null, { timeout: 15000 }).catch(() => {})
      const m = await page.evaluate(() => window.__m)
      out[name].push({
        lcp: Math.round(lcp), lcpEl: m.lcpEl, load: loadAt, cls: +m.cls.toFixed(4),
        heroPlaying: m.heroPlaying && Math.round(m.heroPlaying),
        prodWait: m.productionPlaying ? Math.round(m.productionPlaying - m.productionVisible) : '>15000',
        prodPosterAtVisible: m.productionPosterAtVisible,
        switchWait: m.switchPlaying ? Math.round(m.switchPlaying - m.switchClick) : '>15000'
      })
      await ctx.close()
    }
  }
  await browser.close()
  console.log(JSON.stringify({ label, net: process.env.SLOW ? '4G lento 1.6Mbps/150ms' : '4G 9Mbps/170ms', out }, null, 1))
})()
