// Tiras de fotos (proceso y planta): flechas para avanzar en escritorio.
// El desplazamiento es nativo (scroll-snap); las flechas solo lo empujan.
const LABELS = {
  es: { prev: 'Fotos anteriores', next: 'Más fotos' },
  en: { prev: 'Previous photos', next: 'More photos' }
}
const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'es')

export function initPhotoStrips() {
  document.querySelectorAll('.photo-strip').forEach((strip) => {
    const wrap = document.createElement('div')
    wrap.className = 'photo-strip-wrap'
    strip.before(wrap)
    wrap.appendChild(strip)
    const make = (dir) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `photo-strip-nav photo-strip-${dir}`
      button.innerHTML = `<span aria-hidden="true">${dir === 'prev' ? '‹' : '›'}</span>`
      button.addEventListener('click', () => {
        const step = strip.querySelector('figure')?.getBoundingClientRect().width || strip.clientWidth / 2
        strip.scrollBy({ left: (dir === 'prev' ? -1 : 1) * (step + 16), behavior: 'smooth' })
      })
      wrap.appendChild(button)
      return button
    }
    const prev = make('prev')
    const next = make('next')
    const update = () => {
      prev.disabled = strip.scrollLeft < 8
      next.disabled = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 8
      strip.classList.toggle('is-end', next.disabled)
    }
    const label = () => {
      prev.setAttribute('aria-label', LABELS[lang()].prev)
      next.setAttribute('aria-label', LABELS[lang()].next)
    }
    strip.addEventListener('scroll', update, { passive: true })
    new ResizeObserver(update).observe(strip)
    document.addEventListener('languagechange', label)
    label()
    update()
  })
}
