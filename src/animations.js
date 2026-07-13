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
// Ambient autoplay loop — reliable on desktop AND mobile (iOS/Android need
// muted + playsinline). Loaded only when motion is allowed; reduced-motion and
// Save-Data/2G keep the poster with zero video bytes.

function loadHeroVideo(video, isMobile) {
  if (!video) return

  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
  const slowNetwork = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))
  if (slowNetwork) return

  const mp4 = document.createElement('source')
  mp4.src = isMobile ? '/img/hero-video-scrub-mobile.mp4' : '/img/hero-video-scrub.mp4'
  mp4.type = 'video/mp4'
  video.append(mp4)
  video.loop = true
  video.load()

  video.addEventListener('loadeddata', () => {
    video.play().then(() => video.removeAttribute('poster')).catch(() => {})
  }, { once: true })
}

// ─── Hero ────────────────────────────────────────────────────────────────────
// The copy is visible by default and its entrance is a pure CSS animation (see
// hero.css) — compositor-driven, so it always completes and can never get stuck
// hidden the way a time-based JS tween can if rAF is throttled. JS only loads
// the ambient video; a light transform-only scroll parallax lives in
// initParallax (no pin, no per-frame seeking, so it never janks on mobile).

function initHero() {
  const video = document.getElementById('hero-video')
  const isMobile = window.innerWidth < 768
  loadHeroVideo(video, isMobile)
}

// ─── Photo parallax (desktop only) ───────────────────────────────────────────
// Secondary photography receives only a very small depth shift.

function initParallax() {
  // Subtle Ken-Burns drift on secondary photography,
  // scoped to each element's own scroll range since they sit in overflow:hidden frames.
  const drift = (el, trigger) => {
    if (!el) return
    gsap.fromTo(el,
      { scale: 1.0 },
      {
        scale: 1.045, ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      }
    )
  }

  // Hero footage drifts up slightly as you scroll past — pure transform, no pin
  const heroVideo = document.querySelector('.hero-bg video')
  if (heroVideo) {
    gsap.to(heroVideo, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 }
    })
  }

  drift(document.querySelector('.about-img'), '.about-photo')
  // Every texture band (machine shot + embroidery macro) drifts on its own range
  document.querySelectorAll('.texture-band').forEach((band) => {
    drift(band.querySelector('img'), band)
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
