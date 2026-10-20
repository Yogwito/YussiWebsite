import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initProduction() {
  const video = document.getElementById('production-video')
  const buttons = [...document.querySelectorAll('[data-film]')]
  if (!video) return
  const films = {
    bordado: { src: '/media/proceso/proceso-bordado.mp4?v=4', poster: '/media/proceso/proceso-bordado-poster.webp?v=2', es: 'Bordado en nuestra planta', en: 'Embroidery in our workshop' },
    confeccion: { src: '/media/proceso/proceso-confeccion.mp4?v=3',poster: '/media/proceso/proceso-confeccion-poster.webp', es: 'Confección en nuestra planta', en: 'Garment making in our workshop' }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const film = films[button.dataset.film]
      if (button.getAttribute('aria-pressed') !== 'true') {
        video.pause()
        video.poster = film.poster
        video.src = film.src
        video.dataset.ariaEs = film.es
        video.dataset.ariaEn = film.en
        video.setAttribute('aria-label', document.documentElement.lang === 'en' ? film.en : film.es)
        buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
        video.load()
      }
      // Playback follows an explicit action, including with reduced motion enabled.
      video.play().catch(() => {})
    })
  })

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) video.pause()
  })
  observer.observe(video)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause()
  })

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo('.process-track span', { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: '#process', start: 'top 80%', end: 'center 45%', scrub: 0.5 }
    })
    gsap.from('.process-steps li', {
      y: 18, opacity: 0, duration: 0.65, stagger: 0.12,
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: '.process-steps', start: 'top 88%', once: true }
    })
  })
}
