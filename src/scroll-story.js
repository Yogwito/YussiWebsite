import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Recorrido con scroll para una línea de producto (hoy: Dotación).
// Lee los pasos del HTML (.story-step) y arma sus fotos o videos; no tiene
// copy ni rutas propias. Ver el comentario sobre #dotacion en index.html.
// Un paso puede tener varias tomas ([data-shot] dentro del paso); si no,
// la toma es el propio paso (data-photo o data-video).

const PHOTO_WIDTHS = [400, 800, 1200, 1600]
const PHOTO_SIZES = '(min-width: 900px) 560px, 86vw'
// La foto queda fija solo si hay espacio para verla junto al texto.
const pinQuery = window.matchMedia('(min-width: 900px) and (min-height: 700px)')
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const LABELS = {
  es: { shot: (n, total) => `Ver foto ${n} de ${total}` },
  en: { shot: (n, total) => `View photo ${n} of ${total}` }
}

const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'es')
const altFor = (el) => el.dataset[lang() === 'en' ? 'altEn' : 'altEs'] || ''

// Foto (data-photo, AVIF + WebP) o video (data-video + data-poster) de una toma.
function buildMedia(shot, index) {
  const slide = document.createElement('figure')
  slide.className = 'story-slide'
  slide.dataset.index = String(index)

  if (shot.dataset.video) {
    const video = document.createElement('video')
    video.src = shot.dataset.video
    if (shot.dataset.poster) video.poster = shot.dataset.poster
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.preload = 'none'
    video.setAttribute('aria-label', altFor(shot))
    slide.appendChild(video)
  } else {
    const base = `/media/productos/${shot.dataset.photo}`
    const set = (ext) => PHOTO_WIDTHS.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ')
    const picture = document.createElement('picture')
    const avif = document.createElement('source')
    avif.type = 'image/avif'
    avif.srcset = set('avif')
    avif.sizes = PHOTO_SIZES
    const img = document.createElement('img')
    img.src = `${base}-800.webp`
    img.srcset = set('webp')
    img.sizes = PHOTO_SIZES
    img.width = 1200
    img.height = 1344
    img.alt = altFor(shot)
    img.loading = 'lazy'
    img.decoding = 'async'
    picture.append(avif, img)
    slide.appendChild(picture)
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

  // Tomas en orden, con el paso al que pertenecen.
  const shots = steps.flatMap((step, s) => {
    const own = [...step.querySelectorAll('[data-shot]')]
    return (own.length ? own : [step]).map((el) => ({ el, step: s }))
  })
  const shotsIn = steps.map((_, s) => shots.filter((shot) => shot.step === s).length)
  steps.forEach((step, s) => step.style.setProperty('--shots', shotsIn[s]))

  const slides = shots.map((shot, i) => frame.appendChild(buildMedia(shot.el, i)))
  const dots = shots.map(() => {
    const dot = document.createElement('button')
    dot.type = 'button'
    dot.className = 'story-dot'
    progress?.appendChild(dot)
    return dot
  })

  // Contador "1 / N" del carrusel (decorativo; los puntos llevan la etiqueta).
  const count = document.createElement('p')
  count.className = 'story-count'
  count.setAttribute('aria-hidden', 'true')
  progress?.appendChild(count)

  const ctaFrom = Math.max(1, Number(root.dataset.ctaFrom) || 1) - 1
  let active = -1
  let mode = ''
  let cleanup = () => {}

  const renderCount = () => { count.textContent = `${Math.max(active, 0) + 1} / ${shots.length}` }
  const renderLabels = () => {
    shots.forEach((shot, i) => {
      const media = slides[i].querySelector('img, video')
      if (media.tagName === 'IMG') media.alt = altFor(shot.el)
      else media.setAttribute('aria-label', altFor(shot.el))
      dots[i].setAttribute('aria-label', LABELS[lang()].shot(i + 1, shots.length))
    })
  }

  const setActive = (index) => {
    if (index === active) return
    active = index
    const step = shots[index].step
    steps.forEach((el, s) => el.classList.toggle('is-active', s === step))
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index)
      const video = slide.querySelector('video')
      if (!video) return
      if (i === index && mode !== 'static') video.play().catch(() => {})
      else video.pause()
    })
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)))
    root.classList.toggle('is-cta-visible', step >= ctaFrom)
    renderCount()
  }

  // Primera toma de cada paso (índice global).
  const firstShot = steps.map((_, s) => shots.findIndex((shot) => shot.step === s))

  // Escritorio: la columna de medios es sticky (CSS). Cada paso ocupa una
  // altura por toma y, mientras cruza el 55 % de la pantalla, avanza sus tomas.
  const setupPin = () => {
    const header = document.querySelector('.site-header')
    root.style.setProperty('--story-top', `${(header?.offsetHeight || 96) + 24}px`)
    const triggers = steps.map((step, s) => ScrollTrigger.create({
      trigger: step,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setActive(firstShot[s] + Math.min(shotsIn[s] - 1, Math.floor(self.progress * shotsIn[s]))) },
      onUpdate: (self) => { if (self.isActive) setActive(firstShot[s] + Math.min(shotsIn[s] - 1, Math.floor(self.progress * shotsIn[s]))) }
    }))
    const goTo = (i) => {
      const { step } = shots[i]
      const k = i - firstShot[step]
      const rect = steps[step].getBoundingClientRect()
      const y = window.scrollY + rect.top + rect.height * ((k + 0.5) / shotsIn[step]) - window.innerHeight * 0.55
      window.scrollTo({ top: y, behavior: 'smooth' })
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

  // Móvil o pantalla baja: fotos en carrusel horizontal con scroll-snap; la
  // siguiente foto asoma para indicar que hay más. El texto va completo debajo.
  const setupCarousel = () => {
    frame.tabIndex = 0
    const nearest = () => {
      const start = slides[0].offsetLeft
      let best = 0
      slides.forEach((slide, i) => {
        if (Math.abs(slide.offsetLeft - start - frame.scrollLeft) < Math.abs(slides[best].offsetLeft - start - frame.scrollLeft)) best = i
      })
      return best
    }
    const onScroll = () => setActive(nearest())
    const goTo = (i) => frame.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' })
    const handlers = dots.map((dot, i) => {
      const handler = () => goTo(i)
      dot.addEventListener('click', handler)
      return handler
    })
    frame.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      frame.removeEventListener('scroll', onScroll)
      dots.forEach((dot, i) => dot.removeEventListener('click', handlers[i]))
      frame.removeAttribute('tabindex')
      frame.scrollLeft = 0
    }
  }

  // Movimiento reducido: todas las fotos visibles y apiladas, sin transiciones
  // ni reproducción automática; los videos se controlan a mano.
  const setupStatic = () => {
    const videos = slides.map((slide) => slide.querySelector('video')).filter(Boolean)
    videos.forEach((video) => { video.controls = true })
    return () => videos.forEach((video) => { video.controls = false })
  }

  const applyMode = () => {
    const next = reducedMotion.matches ? 'static' : pinQuery.matches ? 'pin' : 'carousel'
    if (next === mode) return
    cleanup()
    mode = next
    root.dataset.mode = mode
    active = -1
    const setup = { pin: setupPin, carousel: setupCarousel, static: setupStatic }[mode]
    cleanup = setup()
    setActive(0)
  }

  renderLabels()
  applyMode()
  pinQuery.addEventListener('change', applyMode)
  reducedMotion.addEventListener('change', applyMode)
  document.addEventListener('languagechange', renderLabels)
}
