import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Recorrido con scroll para una línea de producto (hoy: Dotación).
// Lee los pasos del HTML (.story-step) y arma sus fotos o videos; no tiene
// copy ni rutas propias. Ver el comentario sobre #dotacion en index.html.

const PHOTO_WIDTHS = [400, 800, 1200]
// La foto queda fija solo si hay espacio para verla junto al texto.
const pinQuery = window.matchMedia('(min-width: 900px) and (min-height: 700px)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const LABELS = {
  es: { step: (n, total) => `Ver paso ${n} de ${total}` },
  en: { step: (n, total) => `View step ${n} of ${total}` }
}

const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'es')
const altFor = (step) => step.dataset[lang() === 'en' ? 'altEn' : 'altEs'] || ''

// Foto (data-photo) o video (data-video + data-poster) de un paso.
function buildMedia(step, index) {
  const slide = document.createElement('figure')
  slide.className = 'story-slide'
  slide.dataset.index = String(index)

  if (step.dataset.video) {
    const video = document.createElement('video')
    video.src = step.dataset.video
    if (step.dataset.poster) video.poster = step.dataset.poster
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'none'
    video.setAttribute('aria-label', altFor(step))
    slide.appendChild(video)
  } else {
    const base = `/media/productos/${step.dataset.photo}`
    const img = document.createElement('img')
    img.src = `${base}-800.webp`
    img.srcset = PHOTO_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(', ')
    img.sizes = '(min-width: 900px) 560px, 86vw'
    img.width = 1200
    img.height = 1344
    img.alt = altFor(step)
    img.loading = 'lazy'
    img.decoding = 'async'
    slide.appendChild(img)
  }
  return slide
}

export function initScrollStories() {
  document.querySelectorAll('[data-scroll-story]').forEach(createStory)
}

function createStory(root) {
  const steps = [...root.querySelectorAll('.story-step')]
  const frame = root.querySelector('[data-story-frame]')
  const progress = root.querySelector('[data-story-progress]')
  if (!steps.length || !frame) return

  const slides = steps.map((step, i) => frame.appendChild(buildMedia(step, i)))
  const dots = steps.map((_, i) => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = 'story-dot'
    progress?.appendChild(dot)
    return dot
  })

  const renderLabels = () => {
    steps.forEach((step, i) => {
      const media = slides[i].firstElementChild
      if (media.tagName === 'IMG') media.alt = altFor(step)
      else media.setAttribute('aria-label', altFor(step))
      dots[i].setAttribute('aria-label', LABELS[lang()].step(i + 1, steps.length))
    })
  }

  const ctaFrom = Math.max(1, Number(root.dataset.ctaFrom) || 1) - 1
  let active = -1
  let mode = ''
  let cleanup = () => {}

  const setActive = (index) => {
    if (index === active) return
    active = index
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index))
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index)
      const video = slide.querySelector('video')
      if (!video) return
      if (i === index && mode !== 'static') video.play().catch(() => {})
      else video.pause()
    })
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)))
    root.classList.toggle('is-cta-visible', index >= ctaFrom)
  }

  // Escritorio: la columna de medios es sticky (CSS) y cada paso activa su
  // foto al cruzar el centro de la pantalla.
  const setupPin = () => {
    const header = document.querySelector('.site-header')
    root.style.setProperty('--story-top', `${(header?.offsetHeight || 96) + 24}px`)
    const triggers = steps.map((step, i) => ScrollTrigger.create({
      trigger: step,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setActive(i) }
    }))
    const goTo = (i) => {
      const rect = steps[i].getBoundingClientRect()
      window.scrollTo({ top: window.scrollY + rect.top + rect.height / 2 - window.innerHeight * 0.55, behavior: 'smooth' })
    }
    const handlers = dots.map((dot, i) => {
      const handler = () => goTo(i)
      dot.addEventListener('click', handler)
      return handler
    })
    const refresh = () => ScrollTrigger.refresh()
    document.addEventListener('languagechange', refresh)
    requestAnimationFrame(refresh)
    return () => {
      triggers.forEach((trigger) => trigger.kill())
      dots.forEach((dot, i) => dot.removeEventListener('click', handlers[i]))
      document.removeEventListener('languagechange', refresh)
      root.style.removeProperty('--story-top')
    }
  }

  const applyMode = () => {
    const next = reducedMotion.matches ? 'static' : pinQuery.matches ? 'pin' : 'static'
    if (next === mode) return
    cleanup()
    mode = next
    root.dataset.mode = mode
    active = -1
    cleanup = mode === 'pin' ? setupPin() : () => {}
    setActive(0)
  }

  renderLabels()
  applyMode()
  pinQuery.addEventListener('change', applyMode)
  reducedMotion.addEventListener('change', applyMode)
  document.addEventListener('languagechange', renderLabels)
}
