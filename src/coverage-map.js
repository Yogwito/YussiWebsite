import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Cobertura: mapa SVG de Colombia (scripts/build-coverage-map.py) que avanza
// solo con el scroll, sin interacción: Caldas → rutas por el país → proyectos
// en el exterior. Con movimiento reducido se muestra todo de una vez.
const STAGES = ['caldas', 'colombia', 'abroad']
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

export function initCoverageMap() {
  const layout = document.querySelector('[data-coverage]')
  const visual = layout?.querySelector('.coverage-visual')
  const map = layout?.querySelector('[data-coverage-map]')
  if (!layout || !visual || !map) return
  const chapters = [...layout.querySelectorAll('.coverage-chapters [data-stage]')]
  let trigger = null

  const setStage = (stage) => {
    visual.dataset.stage = stage
    chapters.forEach((item) => {
      item.classList.toggle('is-active', stage === 'all' || item.dataset.stage === stage)
    })
  }

  const applyMotion = () => {
    trigger?.kill()
    trigger = null
    if (reducedMotion.matches) {
      setStage('all')
      return
    }
    setStage('caldas')
    trigger = ScrollTrigger.create({
      trigger: layout,
      start: 'top 65%',
      end: 'bottom 55%',
      onUpdate: (self) => setStage(STAGES[Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length))])
    })
  }

  // El SVG se descarga solo cuando la sección se acerca a la pantalla.
  const load = () => {
    fetch(map.dataset.src)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error(response.status))))
      .then((svg) => {
        map.innerHTML = svg
        map.dataset.state = 'ready'
      })
      .catch(() => { map.dataset.state = 'error' })
  }
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    observer.disconnect()
    load()
  }, { rootMargin: '600px 0px' })
  observer.observe(map)

  applyMotion()
  reducedMotion.addEventListener('change', applyMotion)
}
