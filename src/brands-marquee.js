// Carruseles de logos ligados al scroll: avanzan siempre a una velocidad mínima
// y se aceleran con la velocidad del scroll. Al hacer scroll hacia arriba
// invierten el sentido. Se usan en la franja de marcas y en la de clientes.
// Con prefers-reduced-motion no se mueven: se muestran como grilla estática.
const DEFAULTS = {
  baseSpeed: 40, // px/s cuando la página está quieta
  scrollFactor: 0.45, // px de franja por px de scroll
  maxSpeed: 900, // px/s
  ease: 5, // qué tan rápido vuelve a la velocidad base
  reverse: false // true: avanza en sentido contrario al de las demás franjas
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// `marquee` debe contener un hijo con clase que termine en "-track" y, dentro,
// dos grupos idénticos (el segundo aria-hidden) para el loop sin saltos.
export function createScrollMarquee(marquee, options = {}) {
  const { baseSpeed, scrollFactor, maxSpeed, ease, reverse } = { ...DEFAULTS, ...options }
  const sense = reverse ? -1 : 1
  const track = marquee?.querySelector('[class$="-track"]')
  const group = track?.firstElementChild
  if (!track || !group) return

  let groupWidth = group.getBoundingClientRect().width
  let x = 0
  let direction = -sense
  let speed = baseSpeed
  let lastY = window.scrollY
  let lastTime = 0
  let frame = 0
  let visible = false

  new ResizeObserver(() => {
    groupWidth = group.getBoundingClientRect().width
  }).observe(group)

  const tick = (time) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0
    lastTime = time

    const y = window.scrollY
    const dy = y - lastY
    lastY = y
    if (dy) direction = (dy > 0 ? -1 : 1) * sense

    const scrollSpeed = dt ? Math.abs(dy) / dt : 0
    const target = Math.min(baseSpeed + scrollSpeed * scrollFactor, maxSpeed)
    // Acelera de inmediato y desacelera de forma suave.
    speed = target > speed ? target : speed + (target - speed) * Math.min(1, dt * ease)

    if (groupWidth) {
      x = (x + direction * speed * dt) % groupWidth
      if (x > 0) x -= groupWidth
      track.style.transform = `translate3d(${x}px, 0, 0)`
    }
    frame = requestAnimationFrame(tick)
  }

  const canRun = () => visible && !document.hidden && !reducedMotion.matches

  const start = () => {
    if (frame || !canRun()) return
    lastTime = 0
    lastY = window.scrollY
    frame = requestAnimationFrame(tick)
  }

  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  // Con movimiento reducido: grilla estática con todos los logos visibles.
  const applyMotionPreference = () => {
    const isStatic = reducedMotion.matches
    marquee.classList.toggle('is-static', isStatic)
    if (isStatic) {
      stop()
      track.style.transform = ''
    } else {
      start()
    }
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    visible ? start() : stop()
  }).observe(marquee)

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))
  reducedMotion.addEventListener('change', applyMotionPreference)

  applyMotionPreference()
}

export function initBrandsMarquee() {
  createScrollMarquee(document.querySelector('.brands-marquee'))
}
