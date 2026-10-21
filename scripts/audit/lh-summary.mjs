// Resume corridas de Lighthouse (mediana de 3). Uso: node scripts/audit/lh-summary.mjs <dir-json> > salida.md
import fs from 'node:fs'
const dir = process.argv[2]
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const out = []
for (const form of ['mobile', 'desktop']) {
  const runs = fs.readdirSync(dir).filter((f) => f.startsWith(form)).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`)))
  const a = (r, id) => r.audits[id]?.numericValue
  const row = (label, fn, unit = '') => out.push(`| ${form} | ${label} | ${runs.map(fn).map((v) => Math.round(v * 1000) / 1000).join(' / ')} | **${Math.round(med(runs.map(fn)) * 1000) / 1000}${unit}** |`)
  out.push(`\n### ${form}\n\n| perfil | métrica | corridas | mediana |\n|---|---|---|---|`)
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) row(c, (r) => r.categories[c].score * 100)
  for (const [id, l] of [['first-contentful-paint', 'FCP ms'], ['largest-contentful-paint', 'LCP ms'], ['cumulative-layout-shift', 'CLS'], ['total-blocking-time', 'TBT ms'], ['speed-index', 'SI ms'], ['server-response-time', 'TTFB ms (local)'], ['interactive', 'TTI ms'], ['bootup-time', 'JS boot ms'], ['mainthread-work-breakdown', 'main-thread ms'], ['total-byte-weight', 'bytes'], ['network-requests', 'requests']]) {
    row(l, (r) => id === 'network-requests' ? r.audits[id].details.items.length : a(r, id))
  }
  const r = runs[0]
  out.push(`\nElemento LCP (${form}): \`${r.audits['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet || 'n/d'}\``)
  const bytype = {}
  for (const it of r.audits['network-requests'].details.items) { const t = it.resourceType || 'Other'; bytype[t] = bytype[t] || [0, 0]; bytype[t][0]++; bytype[t][1] += it.transferSize || 0 }
  out.push(`\nPeso por tipo (${form}, corrida 1): ` + Object.entries(bytype).map(([t, [n, b]]) => `${t} ${n} req / ${Math.round(b / 1024)} KB`).join(' · '))
  for (const id of ['unused-javascript', 'unused-css-rules', 'uses-responsive-images', 'render-blocking-resources', 'legacy-javascript', 'bf-cache', 'mainthread-work-breakdown']) {
    const au = r.audits[id]; if (!au) continue
    const items = (au.details?.items || []).slice(0, 6).map((i) => `${(i.url || i.groupLabel || i.failureReason || '').toString().replace('http://localhost:4173', '')} ${i.wastedBytes ? Math.round(i.wastedBytes / 1024) + ' KB' : i.duration ? Math.round(i.duration) + ' ms' : ''}`)
    out.push(`\n- **${id}** (${au.displayValue || au.score}): ${items.join('; ')}`)
  }
  const fails = Object.values(r.audits).filter((x) => x.score !== null && x.score < 0.9 && x.scoreDisplayMode === 'binary').map((x) => x.id)
  out.push(`\n- Auditorías binarias fallidas: ${fails.join(', ') || 'ninguna'}`)
}
console.log(out.join('\n'))
