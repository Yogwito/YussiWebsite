import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  initLoader(prefersReduced)
  if (prefersReduced) return

  initLogo()
  initHero()
  initScrollReveals()

  const mm = gsap.matchMedia()
  mm.add('(min-width: 768px)', () => {
    initParallax()
    initProcessLine()
    return () => {}
  })
}

// ─── Loader ──────────────────────────────────────────────────────────────────

function initLoader(skip) {
  const loader = document.getElementById('page-loader')
  if (!loader) return
  if (skip) { loader.classList.add('hidden'); return }

  const hide = () => gsap.to(loader, {
    opacity: 0, duration: 0.4, delay: 0.1,
    onComplete: () => loader.classList.add('hidden')
  })

  if (document.readyState === 'complete') {
    hide()
  } else {
    window.addEventListener('load', hide, { once: true })
  }
  // Failsafe: never block content longer than 600ms
  setTimeout(() => {
    if (!loader.classList.contains('hidden')) loader.classList.add('hidden')
  }, 600)
}

// ─── Navbar logo ─────────────────────────────────────────────────────────────

function initLogo() {
  const logo = document.querySelector('.nav-logo')
  if (logo) gsap.from(logo, { scale: 0.9, opacity: 0, duration: 0.4, ease: 'power2.out' })
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function splitWords(el) {
  const text = el.textContent.trim()
  el.innerHTML = ''
  text.split(/\s+/).forEach((word, i, arr) => {
    const span = document.createElement('span')
    span.style.cssText = 'display:inline-block'
    span.textContent = word
    el.appendChild(span)
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '))
  })
  return el.querySelectorAll('span')
}

function initHero() {
  const isMobile = window.innerWidth < 768
  const dist = isMobile ? 15 : 25

  const h1 = document.querySelector('#hero h1')
  if (!h1) return

  const words = splitWords(h1)
  const badge = document.querySelector('.hero-badge')
  const subtitle = document.querySelector('#hero .hero-content > p')
  const buttons = document.querySelectorAll('.hero-buttons > *')
  const indicator = document.querySelector('.hero-scroll-indicator')

  const stitch = document.querySelector('.hero-stitch')

  const tl = gsap.timeline({ delay: 0.1, defaults: { ease: 'power2.out' } })

  if (badge) tl.from(badge, { opacity: 0, y: dist * 0.6, duration: 0.4 })
  tl.from(words, { opacity: 0, y: dist, duration: 0.55, stagger: 0.04 }, badge ? '-=0.15' : 0)
  // Signature: the needle embroiders the stitch line left → right
  if (stitch) tl.fromTo(stitch,
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power1.inOut' }, '-=0.1')
  if (subtitle) tl.from(subtitle, { opacity: 0, y: dist * 0.7, duration: 0.4 }, '-=0.3')
  if (buttons.length) tl.from(buttons, { opacity: 0, y: dist * 0.6, duration: 0.35, stagger: 0.1 }, '-=0.15')
  if (indicator) tl.from(indicator, { opacity: 0, duration: 0.4 }, '+=0.1')
}

// ─── Hero parallax (desktop only) ────────────────────────────────────────────

function initParallax() {
  const heroImg = document.querySelector('.hero-image img')
  if (!heroImg) return
  gsap.fromTo(heroImg,
    { scale: 1.0 },
    {
      scale: 1.12, ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5
      }
    }
  )
}

// ─── Process connector (desktop only) ────────────────────────────────────────

function initProcessLine() {
  const connector = document.querySelector('.process-connector')
  if (!connector) return
  // Clip wipe keeps the stitch dashes crisp (scaleX would distort them)
  gsap.fromTo(connector,
    { clipPath: 'inset(0 100% 0 0)' },
    {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.2,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: '.process-steps', start: 'top 75%', once: true }
    }
  )
}

// ─── Scroll reveals ──────────────────────────────────────────────────────────

function initScrollReveals() {
  const isMobile = window.innerWidth < 768
  const dist = isMobile ? 15 : 30

  const batchReveal = (selector, overrides = {}) => {
    if (!document.querySelector(selector)) return
    ScrollTrigger.batch(selector, {
      onEnter: batch => gsap.from(batch, {
        opacity: 0, y: dist, duration: 0.6, stagger: 0.1, ease: 'power2.out',
        clearProps: 'transform,opacity',
        ...overrides
      }),
      start: 'top 88%',
      once: true
    })
  }

  batchReveal('.why-card')
  batchReveal('.service-card')
  batchReveal('.sector-card', { stagger: 0.08 })
  batchReveal('.faq-item', { y: dist * 0.5, stagger: 0.07, duration: 0.5 })
  batchReveal('.contact-grid > *', { stagger: 0.15 })

  // Process — scale entrance
  if (document.querySelector('.process-step')) {
    ScrollTrigger.batch('.process-step', {
      onEnter: batch => gsap.from(batch, {
        opacity: 0, scale: 0.88, duration: 0.5, stagger: 0.12, ease: 'back.out(1.4)',
        clearProps: 'transform,opacity'
      }),
      start: 'top 88%', once: true
    })
  }

  // About — horizontal slide on desktop, vertical on mobile
  const aboutGrid = document.querySelector('.about-grid')
  if (aboutGrid) {
    gsap.from('.about-text', {
      opacity: 0, x: isMobile ? 0 : -40, y: isMobile ? dist : 0,
      duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: '.about-grid', start: 'top 82%', once: true }
    })
    gsap.from('.about-img', {
      opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? dist : 0,
      duration: 0.7, ease: 'power2.out', delay: 0.15,
      scrollTrigger: { trigger: '.about-grid', start: 'top 82%', once: true }
    })
  }

  // CTA banner content
  gsap.from('#cta-banner .container > *', {
    opacity: 0, y: dist * 0.8, duration: 0.6, stagger: 0.15, ease: 'power2.out',
    scrollTrigger: { trigger: '#cta-banner', start: 'top 85%', once: true }
  })

  // Footer
  gsap.from('#footer', {
    opacity: 0, y: dist * 0.5, duration: 0.55, ease: 'power2.out',
    scrollTrigger: { trigger: '#footer', start: 'top 92%', once: true }
  })
}
