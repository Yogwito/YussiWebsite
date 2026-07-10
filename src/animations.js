import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  initLoader(prefersReduced)
  if (prefersReduced) return

  initLogo()
  initHeroMotion()
  initScrollReveals()
  initStatCounters()

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
  if (logo) gsap.from(logo, { opacity: 0, y: -8, duration: 0.7, ease: 'power3.out' })
}

// ─── Hero background video ───────────────────────────────────────────────────
// Only called when motion is allowed (initAnimations returns early otherwise),
// so the poster attribute alone covers the reduced-motion case with zero video
// bytes downloaded. Also skips on Save-Data / very slow connections.

function loadHeroVideo(video, isMobile) {
  if (!video) return

  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
  const slowNetwork = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))
  if (slowNetwork) return

  // Lightweight encodes selected per viewport.
  const mp4 = document.createElement('source')
  mp4.src = isMobile ? '/img/hero-video-scrub-mobile.mp4' : '/img/hero-video-scrub.mp4'
  mp4.type = 'video/mp4'
  video.append(mp4)
  video.load()

  video.loop = true
  video.playbackRate = 0.72

  video.addEventListener('loadedmetadata', () => {
    video.play().then(() => {
      video.removeAttribute('poster')
    }).catch(() => {})
  }, { once: true })
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function initHeroMotion() {
  const video = document.getElementById('hero-video')
  const hero = document.querySelector('#hero')
  if (!hero) return

  const isMobile = window.innerWidth < 768
  loadHeroVideo(video, isMobile)

  const badge = document.querySelector('.hero-badge')
  const h1 = document.querySelector('#hero h1')
  const subtitle = document.querySelector('#hero .hero-content > p')
  const buttons = document.querySelectorAll('.hero-buttons > *')

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.12 })
  if (video) tl.fromTo(video, { scale: 1.035 }, { scale: 1, duration: 1.8 }, 0)
  if (badge) tl.from(badge, { opacity: 0, y: 12, duration: 0.75 }, 0.12)
  if (h1) tl.from(h1, { opacity: 0, y: 24, duration: 1.05 }, 0.22)
  if (subtitle) tl.from(subtitle, { opacity: 0, y: 18, duration: 0.85 }, 0.48)
  if (buttons.length) tl.from(buttons, { opacity: 0, y: 14, duration: 0.75, stagger: 0.1 }, 0.66)

  if (video) {
    gsap.to(video, {
      yPercent: 4,
      scale: 1.025,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1.2 }
    })
  }
}

// ─── Photo parallax (desktop only) ───────────────────────────────────────────
// Secondary photography receives only a very small depth shift.

function initParallax() {
  // Subtle Ken-Burns drift on secondary photography,
  // scoped to each element's own scroll range since both sit in overflow:hidden frames.
  const kenBurns = [
    { img: '.about-img', trigger: '.about-photo' },
    { img: '.texture-band img', trigger: '.texture-band' }
  ]
  kenBurns.forEach(({ img, trigger }) => {
    const el = document.querySelector(img)
    if (!el) return
    gsap.fromTo(el,
      { scale: 1.0 },
      {
        scale: 1.045, ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      }
    )
  })
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
  const dist = isMobile ? 12 : 22

  // Section headers (eyebrow / title / subtitle) — every section gets the same
  // quiet fade-up as it's approached, except About's own header which already
  // rides the about-text slide-in below (avoids a double-fade on those nodes).
  const headerEls = Array.from(
    document.querySelectorAll('.eyebrow, .section-title, .section-subtitle')
  ).filter((el) => !el.closest('#about'))
  if (headerEls.length) {
    ScrollTrigger.batch(headerEls, {
      onEnter: (batch) => gsap.from(batch, {
        opacity: 0, y: dist * 0.6, duration: 0.75, stagger: 0.07, ease: 'power3.out',
        clearProps: 'transform,opacity'
      }),
      start: 'top 90%',
      once: true
    })
  }

  const batchReveal = (selector, overrides = {}) => {
    if (!document.querySelector(selector)) return
    ScrollTrigger.batch(selector, {
      onEnter: batch => gsap.from(batch, {
        opacity: 0, y: dist, duration: 0.78, stagger: 0.08, ease: 'power3.out',
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
  batchReveal('.cert-card', { stagger: 0.08 })
  batchReveal('.faq-item', { y: dist * 0.5, stagger: 0.07, duration: 0.5 })
  batchReveal('.contact-grid > *', { stagger: 0.15 })

  // Process — quiet sequential entrance
  if (document.querySelector('.process-step')) {
    ScrollTrigger.batch('.process-step', {
      onEnter: batch => gsap.from(batch, {
        opacity: 0, y: dist, duration: 0.8, stagger: 0.1, ease: 'power3.out',
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
      duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.about-grid', start: 'top 82%', once: true }
    })
    gsap.from('.about-photo', {
      opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? dist : 0,
      duration: 0.9, ease: 'power3.out', delay: 0.1,
      scrollTrigger: { trigger: '.about-grid', start: 'top 82%', once: true }
    })
  }

  // CTA banner content
  gsap.from('#cta-banner .container > *', {
    opacity: 0, y: dist * 0.8, duration: 0.8, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '#cta-banner', start: 'top 85%', once: true }
  })

  // Footer
  gsap.from('#footer', {
    opacity: 0, y: dist * 0.5, duration: 0.75, ease: 'power3.out',
    scrollTrigger: { trigger: '#footer', start: 'top 92%', once: true }
  })
}

// ─── Stat / lead-number counters ────────────────────────────────────────────
// Parses the digits out of "25+", "6", "100%" etc., animates a proxy from 0,
// and re-appends whatever prefix/suffix characters weren't digits.

function initStatCounters() {
  const els = document.querySelectorAll('.stat-num, .why-num')
  els.forEach((el) => {
    const raw = el.textContent.trim()
    const match = raw.match(/\d+/)
    if (!match) return
    const target = parseInt(match[0], 10)
    const prefix = raw.slice(0, match.index)
    const suffix = raw.slice(match.index + match[0].length)
    const counter = { val: 0 }
    gsap.to(counter, {
      val: target,
      duration: 1.1,
      ease: 'power1.out',
      snap: { val: 1 },
      onUpdate: () => { el.textContent = prefix + counter.val + suffix },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    })
  })
}
