// Carruseles de logos ligados al scroll: avanzan siempre a una velocidad mínima
// y se aceleran con la velocidad del scroll. Al hacer scroll hacia arriba
// invierten el sentido. Se usan en la franja de marcas y en la de clientes.
const DEFAULTS = {
  baseSpeed: 40, // px/s cuando la página está quieta
  scrollFactor: 0.45, // px de franja por px de scroll
  maxSpeed: 900, // px/s
  ease: 5 // qué tan rápido vuelve a la velocidad base
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

// `marquee` debe contener un hijo con clase que termine en "-track" y, dentro,
// dos grupos idénticos (el segundo aria-hidden) para el loop sin saltos.
export function createScrollMarquee(marquee, options = {}) {
  const { baseSpeed, scrollFactor, maxSpeed, ease } = { ...DEFAULTS, ...options }
  const track = marquee?.querySelector('[class$="-track"]')
  const group = track?.firstElementChild
  if (!track || !group) return

  let groupWidth = group.getBoundingClientRect().width
  let x = 0
  let direction = -1
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
    if (dy) direction = dy > 0 ? -1 : 1

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

  const start = () => {
    if (frame || !visible || reducedMotion.matches) return
    lastTime = 0
    lastY = window.scrollY
    frame = requestAnimationFrame(tick)
  }

  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    visible ? start() : stop()
  }).observe(marquee)

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stop()
      track.style.transform = ''
    } else {
      start()
    }
  })
}

export function initBrandsMarquee() {
  createScrollMarquee(document.querySelector('.brands-marquee'))
}
