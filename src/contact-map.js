export function initContactMap() {
  const box = document.querySelector('.location-map[data-map-src]')
  if (!box) return
  let observer

  const title = () => box.getAttribute(document.documentElement.lang === 'en' ? 'data-title-en' : 'data-title-es')

  const load = (eager) => {
    if (box.querySelector('iframe')) return
    observer?.disconnect()
    const frame = document.createElement('iframe')
    frame.src = box.dataset.mapSrc
    frame.title = title()
    frame.loading = eager === true ? 'eager' : 'lazy'
    frame.referrerPolicy = 'no-referrer-when-downgrade'
    frame.allowFullscreen = true
    frame.addEventListener('load', () => box.classList.add('is-loaded'), { once: true })
    box.append(frame)
  }

  box.querySelector('.location-map-btn')?.addEventListener('click', () => load(true))
  document.addEventListener('languagechange', () => {
    const frame = box.querySelector('iframe')
    if (frame) frame.title = title()
  })

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) load()
    }, { rootMargin: '200px 0px' })
    observer.observe(box)
  }
}
