import { verifiedClients } from './content/clients.js'

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

// Un grupo = artwork suficiente para cubrir el ancho del viewport. Si hay pocos
// logos se repite la lista para llenar, pero el alt real solo se asigna una vez.
const MIN_PER_GROUP = 8

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

const buildGroup = (items, { hidden }) => {
  const group = document.createElement('div')
  group.className = 'clients-group'
  if (hidden) group.setAttribute('aria-hidden', 'true')
  const target = Math.max(items.length, MIN_PER_GROUP)
  for (let i = 0; i < target; i++) {
    const client = items[i % items.length]
    // alt real solo en el grupo visible y solo la primera aparición de cada logo.
    const decorative = hidden || i >= items.length
    group.appendChild(buildItem(client, { decorative }))
  }
  return group
}

export function initClients() {
  const section = document.querySelector('#clients')
  if (!section) return
  const rowsWrap = section.querySelector('[data-clients-rows]')
  if (!rowsWrap) return

  if (!verifiedClients.length) {
    section.hidden = true
    return
  }

  const [rowA, rowB] = balanceRows(verifiedClients)
  const rows = [
    { items: rowA, reverse: false },
    { items: rowB, reverse: true }
  ]

  rows.forEach(({ items, reverse }) => {
    if (!items.length) return
    const marquee = document.createElement('div')
    marquee.className = 'clients-marquee'
    const track = document.createElement('div')
    track.className = 'clients-track'
    if (reverse) track.classList.add('clients-track--reverse')
    // Dos grupos idénticos → translateX(-50%) = loop sin salto.
    track.appendChild(buildGroup(items, { hidden: false }))
    track.appendChild(buildGroup(items, { hidden: true }))
    marquee.appendChild(track)
    rowsWrap.appendChild(marquee)
  })
}
