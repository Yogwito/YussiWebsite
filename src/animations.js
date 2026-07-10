import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  initLoader(prefersReduced)
  if (prefersReduced) return

  initLogo()
  initHeroStory()
  initScrollReveals()
  initStatCounters()

  const mm = gsap.matchMedia()
  mm.add('(min-width: 768px)', () => {
    initParallax()
    initProcessLine()
    return () => {}
  })
  mm.add('(hover: hover) and (pointer: fine) and (min-width: 900px)', () => {
    initMagneticButtons()
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

// ─── Hero background video ───────────────────────────────────────────────────
// Only called when motion is allowed (initAnimations returns early otherwise),
// so the poster attribute alone covers the reduced-motion case with zero video
// bytes downloaded. Also skips on Save-Data / very slow connections.

function loadHeroVideo(video, isMobile) {
  if (!video) return

  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
  const slowNetwork = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))
  if (slowNetwork) return

  // Scrub-optimized encodes (5-frame GOP) so seeking tracks the scrollbar
  const mp4 = document.createElement('source')
  mp4.src = isMobile ? '/img/hero-video-scrub-mobile.mp4' : '/img/hero-video-scrub.mp4'
  mp4.type = 'video/mp4'
  video.append(mp4)
  video.load()
  video.pause()
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

// The hero pins while the user scrolls through it: the story opens on a dark
// veil with the brand mark, then the veil lifts and the footage scrubs forward
// in lockstep with the scrollbar while the copy builds up piece by piece
// (badge → headline → subtitle → CTAs). Everything stays visible at the end so
// the CTAs are clickable before the section unpins. Only runs when motion is
// allowed; without JS the veil/brand layers stay hidden and the hero is static.
function initHeroStory() {
  const veil = document.querySelector('.hero-veil')
  const brand = document.querySelector('.hero-brand')
  const hint = document.querySelector('.hero-scroll-hint')
  const video = document.getElementById('hero-video')
  const h1 = document.querySelector('#hero h1')
  if (!veil || !brand || !h1) return

  const isMobile = window.innerWidth < 768
  loadHeroVideo(video, isMobile)

  const words = splitWords(h1)
  const badge = document.querySelector('.hero-badge')
  const subtitle = document.querySelector('#hero .hero-content > p')
  const buttons = document.querySelectorAll('.hero-buttons > *')

  // Opening state — set from JS so a no-JS/reduced-motion visit never sees it
  gsap.set(veil, { opacity: 1 })
  gsap.set(brand, { opacity: 0, scale: 0.92 })
  if (hint) gsap.set(hint, { opacity: 1 })
  gsap.set(words, { opacity: 0, y: 40 })
  if (badge) gsap.set(badge, { opacity: 0, y: 24 })
  if (subtitle) gsap.set(subtitle, { opacity: 0, y: 24 })
  if (buttons.length) gsap.set(buttons, { opacity: 0, y: 20 })

  const scrub = { t: 0 }
  const applyVideoTime = () => {
    if (video && video.duration) video.currentTime = video.duration * scrub.t
  }

  // Timeline positions are abstract units over a 10-unit story; the pin
  // distance below decides how much real scrolling those units map to.
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: isMobile ? '+=220%' : '+=320%',
      pin: true,
      scrub: 1,
      anticipatePin: 1
    }
  })

  tl.to(brand, { opacity: 1, scale: 1, duration: 1.2 }, 0)
  if (hint) tl.to(hint, { opacity: 0, duration: 0.6, ease: 'power1.out' }, 1.0)
  tl.to(scrub, { t: 1, duration: 8.2, ease: 'none', onUpdate: applyVideoTime }, 1.0)
    .to(veil, { opacity: 0, duration: 1.8, ease: 'power1.inOut' }, 1.6)
    .to(brand, { opacity: 0, y: -50, duration: 1.0, ease: 'power1.in' }, 3.0)
  if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.7 }, 4.0)
  tl.to(words, { opacity: 1, y: 0, duration: 1.1, stagger: 0.07 }, 4.3)
  if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, 6.0)
  if (buttons.length) tl.to(buttons, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }, 7.0)
  tl.to({}, { duration: 1.5 }, 8.5) // hold: full composition over the final frames
}

// ─── Photo parallax (desktop only) ───────────────────────────────────────────
// The hero footage is scroll-scrubbed by initHeroStory, so no extra zoom there.

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
        scale: 1.1, ease: 'none',
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
  const dist = isMobile ? 15 : 30

  // Section headers (eyebrow / title / subtitle) — every section gets the same
  // quiet fade-up as it's approached, except About's own header which already
  // rides the about-text slide-in below (avoids a double-fade on those nodes).
  const headerEls = Array.from(
    document.querySelectorAll('.eyebrow, .section-title, .section-subtitle')
  ).filter((el) => !el.closest('#about'))
  if (headerEls.length) {
    ScrollTrigger.batch(headerEls, {
      onEnter: (batch) => gsap.from(batch, {
        opacity: 0, y: dist * 0.6, duration: 0.55, stagger: 0.08, ease: 'power2.out',
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
  batchReveal('.client-logo-box', { y: dist * 0.5, stagger: 0.05, duration: 0.45 })
  batchReveal('.brand-badge', { stagger: 0.08 })
  batchReveal('.cert-card', { stagger: 0.08 })
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
    gsap.from('.about-photo', {
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
      duration: 1.4,
      ease: 'power2.out',
      snap: { val: 1 },
      onUpdate: () => { el.textContent = prefix + counter.val + suffix },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    })
  })
}

// ─── Magnetic buttons (desktop, fine pointer only) ──────────────────────────
// The primary CTA pills pull gently toward the cursor within their own bounds,
// then spring back on leave — a small, tactile premium touch.

function initMagneticButtons() {
  const targets = document.querySelectorAll('.hero-buttons .btn, #cta-banner .btn')
  targets.forEach((btn) => {
    const strength = 0.35
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      xTo(relX * strength)
      yTo(relY * strength)
    })
    btn.addEventListener('mouseleave', () => {
      xTo(0)
      yTo(0)
    })
  })
}
