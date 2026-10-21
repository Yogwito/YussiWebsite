// Costo del globo en móvil con CPU 4x: long tasks, JS descargado y FPS al entrar a #coverage.
import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--enable-unsafe-swiftshader'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const p = await ctx.newPage()
const cdp = await ctx.newCDPSession(p)
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
let globeBytes = 0
p.on('response', async (r) => { if (/three|OrbitControls|geojson/.test(r.url())) { try { globeBytes += (await r.body()).length } catch {} } })
await p.addInitScript(() => { window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true }) })
await p.goto(process.argv[2] || 'http://localhost:4173/', { waitUntil: 'networkidle' })
const before = await p.evaluate(() => ({ n: window.__lt.length, ms: window.__lt.reduce((s, e) => s + e[1], 0) }))
const t0 = await p.evaluate(() => performance.now())
await p.locator('#coverage').scrollIntoViewIfNeeded()
const btn = p.locator('.coverage-activate')
const lite = await btn.count() > 0
if (lite) await btn.click()
await p.waitForTimeout(8000)
const res = await p.evaluate((t0) => {
  const lt = window.__lt.filter((e) => e[0] >= t0)
  return { longTasks: lt.length, longTaskMs: Math.round(lt.reduce((s, e) => s + e[1], 0)), maxTaskMs: Math.round(Math.max(0, ...lt.map((e) => e[1]))), canvas: !!document.querySelector('#coverage canvas'), state: document.getElementById('coverage-map').dataset.state }
}, t0)
const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; performance.now() - s < 3000 ? requestAnimationFrame(f) : r(Math.round(n / 3)) }; requestAnimationFrame(f) }))
console.log(JSON.stringify({ cpuThrottle: 4, liteButtonClicked: lite, pageLoadLongTasks: before, globe: res, fpsWhileGlobeVisible: fps, globeDownloadedBytes: globeBytes }, null, 1))
await b.close()
