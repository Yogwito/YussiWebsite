export function initContactMap() {
  const box = document.querySelector('.location-map[data-map-src]')
  if (!box) return

  const title = () => box.getAttribute(document.documentElement.lang === 'en' ? 'data-title-en' : 'data-title-es')

  // Google Maps solo se carga cuando la persona lo pide: antes de eso no se
  // envía ningún dato a Google (Ley 1581).
  const load = () => {
    if (box.querySelector('iframe')) return
    const frame = document.createElement('iframe')
    frame.src = box.dataset.mapSrc
    frame.title = title()
    frame.referrerPolicy = 'no-referrer-when-downgrade'
    frame.allowFullscreen = true
    frame.addEventListener('load', () => box.classList.add('is-loaded'), { once: true })
    box.append(frame)
  }

  box.querySelector('.location-map-btn')?.addEventListener('click', load)
  document.addEventListener('languagechange', () => {
    const frame = box.querySelector('iframe')
    if (frame) frame.title = title()
  })
}
