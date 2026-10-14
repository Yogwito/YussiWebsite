import { verifiedClients } from './content/clients.js'
import { createScrollMarquee } from './brands-marquee.js'

// Intercala categorías para lograr variedad visual en el carrusel
// (no agrupar todas las instituciones juntas).
const interleaveByCategory = (items) => {
  const buckets = new Map()
  items.forEach((c) => {
    if (!buckets.has(c.category)) buckets.set(c.category, [])
    buckets.get(c.category).push(c)
  })
  const out = []
  while (out.length < items.length) {
    for (const list of buckets.values()) {
      if (list.length) out.push(list.shift())
    }
  }
  return out
}

// Tamaño óptico: cada logo ocupa la misma área visual sin importar su
// proporción, así un wordmark ancho y un escudo pesan lo mismo.
// El área depende del ancho de pantalla y se recalcula al cruzar el breakpoint.
const mobileQuery = window.matchMedia('(max-width: 600px)')
const AREAS = { featured: [7600, 4200], marquee: [2200, 1600] }
const areaFor = (kind) => AREAS[kind][mobileQuery.matches ? 1 : 0]

const sizeOptically = (img, area) => {
  const apply = () => {
    const ratio = img.naturalWidth / img.naturalHeight
    if (!ratio) return
    const maxHeight = Math.sqrt(area) * 1.15
    let height = Math.sqrt(area / ratio)
    if (height > maxHeight) height = maxHeight
    img.style.width = `${Math.round(height * ratio)}px`
    img.style.height = `${Math.round(height)}px`
  }
  if (img.complete && img.naturalWidth) apply()
  else img.addEventListener('load', apply, { once: true })
}

const buildLogo = (client, { kind, decorative = false }) => {
  const item = document.createElement('div')
  item.className = 'client-logo'
  const img = document.createElement('img')
  img.src = client.logo
  img.alt = decorative ? '' : client.name
  img.loading = 'lazy'
  img.decoding = 'async'
  img.dataset.kind = kind
  sizeOptically(img, areaFor(kind))
  item.appendChild(img)
  return item
}

export function initClients() {
  const section = document.querySelector('#clients')
  const wrapper = section?.querySelector('[data-clients-rows]')
  if (!wrapper) return
  if (!verifiedClients.length) {
    section.hidden = true
    return
  }

  const featured = verifiedClients
    .filter((c) => c.featured)
    .sort((a, b) => a.featured - b.featured)
  const rest = interleaveByCategory(verifiedClients.filter((c) => !c.featured))

  if (featured.length) {
    const grid = document.createElement('div')
    grid.className = 'clients-featured'
    featured.forEach((c) => grid.appendChild(buildLogo(c, { kind: 'featured' })))
    wrapper.appendChild(grid)
  }

  if (!rest.length) return

  const label = document.createElement('p')
  label.className = 'clients-more-label'
  label.dataset.es = `Y ${rest.length} empresas, colegios y marcas más`
  label.dataset.en = `And ${rest.length} more companies, schools and brands`
  label.textContent = document.documentElement.lang === 'en' ? label.dataset.en : label.dataset.es
  wrapper.appendChild(label)

  const marquee = document.createElement('div')
  marquee.className = 'clients-marquee'
  const track = document.createElement('div')
  track.className = 'clients-track'
  ;[false, true].forEach((decorative) => {
    const group = document.createElement('div')
    group.className = 'clients-group'
    if (decorative) group.setAttribute('aria-hidden', 'true')
    rest.forEach((c) => group.appendChild(buildLogo(c, { kind: 'marquee', decorative })))
    track.appendChild(group)
  })
  marquee.appendChild(track)
  wrapper.appendChild(marquee)

  createScrollMarquee(marquee)

  mobileQuery.addEventListener('change', () => {
    wrapper.querySelectorAll('img[data-kind]').forEach((img) => sizeOptically(img, areaFor(img.dataset.kind)))
  })
}
