// Recorrido con scroll para una línea de producto (hoy: Dotación).
// Lee los pasos del HTML (.story-step) y arma sus fotos o videos; no tiene
// copy ni rutas propias. Ver el comentario sobre #dotacion en index.html.

const PHOTO_WIDTHS = [400, 800, 1200]
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

  root.dataset.mode = 'static'
  renderLabels()
  document.addEventListener('languagechange', renderLabels)
}
