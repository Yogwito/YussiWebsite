import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Galería de cada línea: las miniaturas cambian la foto principal.
// Sin reproducción automática; el texto alternativo sigue el idioma activo.
function initGalleries() {
  const altFor = (button) => button.dataset[document.documentElement.lang === 'en' ? 'altEn' : 'altEs']

  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const main = gallery.querySelector('.line-detail-main')
    const thumbs = [...gallery.querySelectorAll('.line-detail-thumb')]
    if (!main || !thumbs.length) return

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        if (thumb.getAttribute('aria-pressed') === 'true') return
        const base = `/media/productos/${thumb.dataset.photo}`
        const set = (ext) => [800, 1200, 1600].map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')
        const avif = main.closest('picture')?.querySelector('source[type="image/avif"]')
        if (avif) avif.srcset = set('avif')
        main.srcset = set('webp')
        main.src = `${base}-1200.webp`
        main.alt = altFor(thumb)
        thumbs.forEach((item) => item.setAttribute('aria-pressed', String(item === thumb)))
      })
    })

    document.addEventListener('languagechange', () => {
      const current = thumbs.find((item) => item.getAttribute('aria-pressed') === 'true')
      if (current) main.alt = altFor(current)
    })
  })
}

export function initProductExplorer() {
  initGalleries()
  const selector = document.querySelector('.product-selector')
  if (!selector) return
  // Las pestañas viven en .product-tabs; Dotación es un enlace a su propia sección.
  const tablist = selector.querySelector('.product-tabs') || selector
  const options = [...tablist.querySelectorAll('[data-product]')]
  const panels = options.map((option) => document.getElementById(`${option.dataset.product}-detalle`))
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let active = -1

  tablist.setAttribute('role', 'tablist')
  options.forEach((option, index) => {
    option.setAttribute('role', 'tab')
    option.setAttribute('aria-controls', panels[index].id)
    panels[index].setAttribute('role', 'tabpanel')
    panels[index].setAttribute('aria-labelledby', option.id)
    panels[index].tabIndex = 0
  })

  const select = (index, animate = false) => {
    if (index < 0 || index === active) return
    active = index
    options.forEach((option, i) => {
      option.setAttribute('aria-selected', String(i === index))
      option.tabIndex = i === index ? 0 : -1
      panels[i].hidden = i !== index
    })
    const panel = panels[index]
    const selected = options[index]
    // En móvil el selector es un carrusel: centra la tarjeta elegida, salvo al cargar.
    if (animate && selector.scrollWidth > selector.clientWidth) {
      const start = selector.firstElementChild.offsetLeft
      const left = selected.offsetLeft - start - (selector.clientWidth - selected.offsetWidth) / 2
      selector.scrollTo({ left: Math.max(0, left), behavior: 'instant' })
    }
    // Safari puede no cargar imágenes lazy que estaban en un panel oculto:
    // al abrir otra pestaña, sus fotos pasan a carga inmediata. En la carga
    // inicial se quedan lazy para no descargar una pestaña fuera de vista.
    if (animate) panel.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager' })
    panel.classList.add('is-visible')
    gsap.killTweensOf(panel.children)
    if (animate && !reducedMotion.matches) {
      gsap.fromTo(panel.children, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.4, stagger: 0.06, clearProps: 'opacity,transform'
      })
    } else gsap.set(panel.children, { clearProps: 'opacity,transform' })
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  const selectHash = () => {
    const hash = window.location.hash.slice(1).replace(/-detalle$/, '')
    const index = options.findIndex((option) => option.dataset.product === hash)
    if (index >= 0) select(index)
  }

  options.forEach((option, index) => {
    option.addEventListener('click', (event) => {
      event.preventDefault()
      select(index, true)
      window.history.replaceState({}, '', `#${option.dataset.product}`)
    })
    option.addEventListener('keydown', (event) => {
      let next = index
      if (event.key === 'ArrowRight') next = (index + 1) % options.length
      else if (event.key === 'ArrowLeft') next = (index + options.length - 1) % options.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = options.length - 1
      else if (event.key === ' ') {
        event.preventDefault()
        option.click()
        return
      } else return
      event.preventDefault()
      select(next, true)
      options[next].focus({ preventScroll: true })
      options[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
      window.history.replaceState({}, '', `#${options[next].dataset.product}`)
    })
  })

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link.matches('[data-product]')) return
    const id = link.getAttribute('href').slice(1).replace(/-detalle$/, '')
    const index = options.findIndex((option) => option.dataset.product === id)
    if (index >= 0) link.addEventListener('click', () => select(index))
  })

  document.querySelectorAll('[data-quote-product]').forEach((link) => {
    link.addEventListener('click', () => {
      const field = document.getElementById('f-service')
      if (!field) return
      field.value = link.dataset.quoteProduct
      field.dispatchEvent(new Event('change', { bubbles: true }))
      document.getElementById('f-name')?.focus({ preventScroll: true })
    })
  })

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return
    panels.forEach((panel) => {
      gsap.killTweensOf(panel.children)
      gsap.set(panel.children, { clearProps: 'opacity,transform' })
    })
  })
  window.addEventListener('hashchange', selectHash)
  window.addEventListener('popstate', selectHash)
  document.addEventListener('languagechange', () => ScrollTrigger.refresh())
  select(0)
  selectHash()
}
