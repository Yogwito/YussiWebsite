export function initNavbar() {
  const navbar = document.getElementById('navbar')
  const hamburger = document.getElementById('hamburger')
  const mobileMenu = document.getElementById('mobile-menu')
  const mobileClose = document.getElementById('mobile-close')

  if (!navbar || !hamburger || !mobileMenu || !mobileClose) return

  const menuFocusables = [...mobileMenu.querySelectorAll('button, a[href]')]
  const mobileBreakpoint = window.matchMedia('(max-width: 900px)')

  const setMenuState = (isOpen, restoreFocus = false) => {
    hamburger.classList.toggle('open', isOpen)
    hamburger.setAttribute('aria-expanded', String(isOpen))
    hamburger.setAttribute('aria-label', getMenuLabel(isOpen))
    mobileMenu.classList.toggle('open', isOpen)
    mobileMenu.setAttribute('aria-hidden', String(!isOpen))

    if (isOpen) {
      window.setTimeout(() => mobileClose.focus({ preventScroll: true }), 0)
    } else if (restoreFocus) {
      window.setTimeout(() => hamburger.focus({ preventScroll: true }), 0)
    }
  }

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60)
  }, { passive: true })

  hamburger.addEventListener('pointerdown', (event) => {
    event.preventDefault()
  })

  const focusMenuClose = () => window.setTimeout(() => mobileClose.focus({ preventScroll: true }), 20)

  hamburger.addEventListener('focus', () => {
    if (mobileMenu.classList.contains('open')) focusMenuClose()
  })

  hamburger.addEventListener('click', () => {
    const isOpening = !mobileMenu.classList.contains('open')
    setMenuState(isOpening)
    if (isOpening) focusMenuClose()
  })

  const closeMobile = (restoreFocus = false) => {
    setMenuState(false, restoreFocus)
    if (restoreFocus) window.setTimeout(() => hamburger.focus({ preventScroll: true }), 20)
  }

  mobileClose.addEventListener('click', () => closeMobile(true))
  mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMobile()))
  mobileMenu.addEventListener('wheel', (event) => event.preventDefault(), { passive: false })
  mobileMenu.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || menuFocusables.length < 2) return
    const first = menuFocusables[0]
    const last = menuFocusables[menuFocusables.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !mobileMenu.classList.contains('open')) return
    event.preventDefault()
    closeMobile(true)
  })
  mobileBreakpoint.addEventListener('change', (event) => {
    if (!event.matches) closeMobile()
  })
  document.addEventListener('languagechange', () => {
    hamburger.setAttribute('aria-label', getMenuLabel(mobileMenu.classList.contains('open')))
  })

  const sections = document.querySelectorAll('section[id]')
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
        })
      }
    })
  }, { threshold: 0.35 })

  sections.forEach((section) => observer.observe(section))
}

function getMenuLabel(isOpen) {
  const english = document.documentElement.lang === 'en'
  if (isOpen) return english ? 'Close menu' : 'Cerrar menú'
  return english ? 'Open menu' : 'Abrir menú'
}
