import { verifiedClients } from './content/clients.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Reparte los clientes en dos filas intercalando categorías para lograr
// variedad visual (no agrupar todas las instituciones juntas).
const balanceRows = (items) => {
  const shuffledByCategory = []
  const buckets = new Map()
  items.forEach((c) => {
    if (!buckets.has(c.category)) buckets.set(c.category, [])
    buckets.get(c.category).push(c)
  })
  // Round-robin entre categorías.
  let remaining = items.length
  while (remaining > 0) {
    for (const list of buckets.values()) {
      if (list.length) {
        shuffledByCategory.push(list.shift())
        remaining--
      }
    }
  }
  const rowA = []
  const rowB = []
  shuffledByCategory.forEach((c, i) => (i % 2 === 0 ? rowA : rowB).push(c))
  return [rowA, rowB.length ? rowB : rowA.slice()]
}

const buildItem = (client, { decorative }) => {
  const item = document.createElement('div')
  item.className = 'client-item'
  const img = document.createElement('img')
  img.src = client.logo
  img.loading = 'lazy'
  img.decoding = 'async'
  if (decorative) {
    img.alt = ''
    item.setAttribute('aria-hidden', 'true')
  } else {
    img.alt = client.name
  }
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

  const [first, second] = balanceRows(verifiedClients)
  const clients = verifiedClients.length === 1 ? first : [...first, ...second]
  const buildDirectory = (items) => {
    const grid = document.createElement('div')
    grid.className = 'client-directory'
    items.forEach((client) => grid.appendChild(buildItem(client, { decorative: false })))
    return grid
  }
  wrapper.appendChild(buildDirectory(clients.slice(0, 12)))
  if (clients.length > 12) {
    const details = document.createElement('details')
    details.className = 'client-more'
    details.innerHTML = '<summary><span class="clients-open" data-es="Ver más clientes" data-en="View more clients">Ver más clientes</span><span class="clients-close" data-es="Ver menos clientes" data-en="View fewer clients">Ver menos clientes</span></summary>'
    details.appendChild(buildDirectory(clients.slice(12)))
    details.addEventListener('toggle', () => ScrollTrigger.refresh())
    wrapper.appendChild(details)
  }
}
