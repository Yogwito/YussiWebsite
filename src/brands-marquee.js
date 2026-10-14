// Franja de marcas: avanza siempre a una velocidad mínima y se acelera con la
// velocidad del scroll. Al hacer scroll hacia arriba invierte el sentido.
const BASE_SPEED = 40 // px/s cuando la página está quieta
const SCROLL_FACTOR = 0.45 // px de franja por px de scroll
const MAX_SPEED = 900 // px/s
const EASE = 5 // qué tan rápido vuelve a la velocidad base

export function initBrandsMarquee() {
  const marquee = document.querySelector('.brands-marquee')
  const track = marquee?.querySelector('.brands-track')
  const group = track?.querySelector('.brands-group')
  if (!track || !group) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let groupWidth = group.getBoundingClientRect().width
  let x = 0
  let direction = -1
  let speed = BASE_SPEED
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
    const target = Math.min(BASE_SPEED + scrollSpeed * SCROLL_FACTOR, MAX_SPEED)
    // Acelera de inmediato y desacelera de forma suave.
    speed = target > speed ? target : speed + (target - speed) * Math.min(1, dt * EASE)

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
