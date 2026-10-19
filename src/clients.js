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

// Tamaño óptico: todos los logos ocupan la misma área visual sin importar su
// proporción, así un wordmark ancho y un escudo pesan lo mismo (sin jerarquía).
// El área depende del ancho de pantalla y se recalcula al cruzar el breakpoint.
const mobileQuery = window.matchMedia('(max-width: 600px)')
const areaFor = () => (mobileQuery.matches ? 2000 : 3200)

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

const buildLogo = (client, decorative) => {
  const item = document.createElement('div')
  item.className = 'client-logo'
  const img = document.createElement('img')
  img.src = client.logo
  img.alt = decorative ? '' : client.name
  img.loading = 'lazy'
  img.decoding = 'async'
  sizeOptically(img, areaFor())
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

  // Un solo carrusel continuo con todos los clientes verificados.
  const clients = interleaveByCategory(verifiedClients)

  const marquee = document.createElement('div')
  marquee.className = 'clients-marquee'
  const track = document.createElement('div')
  track.className = 'clients-track'
  ;[false, true].forEach((decorative) => {
    const group = document.createElement('div')
    group.className = 'clients-group'
    if (decorative) group.setAttribute('aria-hidden', 'true')
    clients.forEach((c) => group.appendChild(buildLogo(c, decorative)))
    track.appendChild(group)
  })
  marquee.appendChild(track)
  wrapper.appendChild(marquee)

  createScrollMarquee(marquee)

  mobileQuery.addEventListener('change', () => {
    wrapper.querySelectorAll('.client-logo img').forEach((img) => sizeOptically(img, areaFor()))
  })
}
