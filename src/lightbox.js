// Visor de fotos en grande. Se abre al tocar o hacer clic en cualquier imagen
// dentro de un grupo [data-lightbox] (tarjetas de planta, tiras de fotos,
// galerías de producto, Dotación, Nosotros) y muestra la versión más grande
// disponible: data-full / data-full-avif en la imagen, o el mayor tamaño de su
// srcset. Las galerías del explorador recorren todas sus fotos (data-photo).

const LABELS = {
  es: { open: 'Ampliar foto', close: 'Cerrar', prev: 'Foto anterior', next: 'Foto siguiente', dialog: 'Foto ampliada' },
  en: { open: 'Enlarge photo', close: 'Close', prev: 'Previous photo', next: 'Next photo', dialog: 'Enlarged photo' }
}
const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'es')
const largest = (srcset) => {
  if (!srcset) return ''
  return srcset.split(',').map((part) => part.trim().split(/\s+/)).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0][0]
}

// Foto (avif, webp, alt) a partir de una imagen del sitio.
function fromImage(img) {
  const avif = img.dataset.fullAvif || largest(img.closest('picture')?.querySelector('source[type="image/avif"]')?.srcset)
  const webp = img.dataset.full || largest(img.srcset) || img.src
  return { avif, webp, alt: img.alt }
}

// Las galerías del explorador: todas sus fotos, en el orden de las miniaturas.
function fromGallery(gallery) {
  const key = lang() === 'en' ? 'altEn' : 'altEs'
  return [...gallery.querySelectorAll('.line-detail-thumb')].map((thumb) => {
    const base = `/media/productos/${thumb.dataset.photo}`
    return { avif: `${base}-1600.avif`, webp: `${base}-1600.webp`, alt: thumb.dataset[key] || '' }
  })
}

export function initLightbox() {
  const groups = [...document.querySelectorAll('[data-lightbox]')]
  if (!groups.length) return

  const dialog = document.createElement('dialog')
  dialog.className = 'lightbox'
  dialog.setAttribute('data-lenis-prevent', '')
  dialog.innerHTML = `
    <figure class="lightbox-figure">
      <picture><source type="image/avif"><img alt="" decoding="async"></picture>
      <figcaption><span class="lightbox-caption"></span><span class="lightbox-count" aria-hidden="true"></span></figcaption>
    </figure>
    <button type="button" class="lightbox-close"><span aria-hidden="true">×</span></button>
    <button type="button" class="lightbox-nav lightbox-prev"><span aria-hidden="true">‹</span></button>
    <button type="button" class="lightbox-nav lightbox-next"><span aria-hidden="true">›</span></button>`
  document.body.appendChild(dialog)
  const source = dialog.querySelector('source')
  const image = dialog.querySelector('img')
  const caption = dialog.querySelector('.lightbox-caption')
  const count = dialog.querySelector('.lightbox-count')
  const prev = dialog.querySelector('.lightbox-prev')
  const next = dialog.querySelector('.lightbox-next')
  const close = dialog.querySelector('.lightbox-close')
  let items = []
  let index = 0
  let opener = null

  const renderLabels = () => {
    const t = LABELS[lang()]
    dialog.setAttribute('aria-label', t.dialog)
    close.setAttribute('aria-label', t.close)
    prev.setAttribute('aria-label', t.prev)
    next.setAttribute('aria-label', t.next)
  }

  const show = (i) => {
    index = (i + items.length) % items.length
    const item = items[index]
    dialog.classList.add('is-loading')
    if (item.avif) source.srcset = item.avif
    else source.removeAttribute('srcset')
    image.src = item.webp
    image.alt = item.alt
    caption.textContent = item.alt
    count.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : ''
    dialog.classList.toggle('is-single', items.length < 2)
  }
  image.addEventListener('load', () => dialog.classList.remove('is-loading'))

  const open = (list, start, trigger) => {
    items = list.filter((item) => item.webp)
    if (!items.length) return
    opener = trigger
    renderLabels()
    show(start)
    dialog.showModal()
    document.documentElement.classList.add('lightbox-open')
    document.dispatchEvent(new CustomEvent('lightbox:toggle', { detail: { open: true } }))
    close.focus({ preventScroll: true })
  }

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open')
    document.dispatchEvent(new CustomEvent('lightbox:toggle', { detail: { open: false } }))
    opener?.focus({ preventScroll: true })
  })
  close.addEventListener('click', () => dialog.close())
  prev.addEventListener('click', () => show(index - 1))
  next.addEventListener('click', () => show(index + 1))
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close() })
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1)
    if (event.key === 'ArrowRight') show(index + 1)
  })
  // Deslizar en pantallas táctiles.
  let startX = null
  dialog.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX }, { passive: true })
  dialog.addEventListener('touchend', (event) => {
    if (startX === null) return
    const dx = event.changedTouches[0].clientX - startX
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1))
    startX = null
  })

  // Cada imagen del grupo abre el visor (clic, toque, Enter o Espacio).
  groups.forEach((group) => {
    const gallery = group.matches('[data-gallery]') ? group : null
    const zoomable = () => (gallery
      ? [group.querySelector('.line-detail-main')]
      : [...group.querySelectorAll('img')].filter((img) => !img.closest('.line-detail-thumb')))
    const openFrom = (img) => {
      if (gallery) {
        const thumbs = [...gallery.querySelectorAll('.line-detail-thumb')]
        const start = Math.max(0, thumbs.findIndex((thumb) => thumb.getAttribute('aria-pressed') === 'true'))
        open(fromGallery(gallery), start, img)
      } else {
        const list = zoomable()
        open(list.map(fromImage), list.indexOf(img), img)
      }
    }
    const prepare = (img) => {
      if (!img || img.dataset.zoomReady) return
      img.dataset.zoomReady = 'true'
      img.classList.add('is-zoomable')
      img.tabIndex = 0
      img.setAttribute('role', 'button')
      img.addEventListener('click', () => openFrom(img))
      img.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        openFrom(img)
      })
    }
    zoomable().forEach(prepare)
    // Dotación arma sus fotos con JS: se preparan cuando aparecen.
    new MutationObserver(() => zoomable().forEach(prepare)).observe(group, { childList: true, subtree: true })
  })

  // El nombre accesible ("Ampliar foto: …") sigue el idioma activo.
  const labelImages = () => document.querySelectorAll('img.is-zoomable').forEach((img) => {
    img.setAttribute('aria-label', `${LABELS[lang()].open}: ${img.alt}`)
  })
  labelImages()
  document.addEventListener('languagechange', () => { labelImages(); renderLabels() })
  new MutationObserver(labelImages).observe(document.body, { subtree: true, attributeFilter: ['alt'] })
}
