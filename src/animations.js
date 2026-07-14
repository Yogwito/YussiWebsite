import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  initLoader(prefersReduced)
  if (prefersReduced) return

  // The viewport can report 0×0 for the first few frames of a load (observed
  // in embedded/preview contexts). Every media-query and ScrollTrigger range
  // below depends on real metrics, so wait briefly for layout — but never
  // rely on rAF alone (it can be throttled in unfocused/embedded views), so a
  // timer acts as the guaranteed fallback.
  let started = false
  const start = () => {
    if (started) return
    started = true
    startMotion()
  }
  const navbar = document.getElementById('navbar')
  const ready = () =>
    document.documentElement.clientWidth > 0 &&
    window.innerHeight > 0 &&
    // stylesheet probe: navbar is position:fixed once main.css has applied
    // (dev servers inject CSS async, so DOM-ready ≠ styles-ready)
    (!navbar || getComputedStyle(navbar).position === 'fixed')

  if (ready()) { start(); return }
  const rafPoll = () => {
    if (started) return
    if (ready()) start()
    else requestAnimationFrame(rafPoll)
  }
  requestAnimationFrame(rafPoll)
  // Timer fallback for contexts that throttle rAF; caps at ~3s then forces.
  let tries = 0
  const iv = setInterval(() => {
    tries++
    if (started || ready() || tries > 60) {
      clearInterval(iv)
      start()
    }
  }, 50)
}

function startMotion() {
  initSmoothScroll()
  initScrollProgress()
  initLogo()
  initHeroStory()
  initTitleReveals()
  initImageReveals()
  initScrollReveals()
  initStatCounters()

  const mm = gsap.matchMedia()
  mm.add('(min-width: 768px)', () => {
    initParallax()
    initProcessLine()
    return () => {}
  })
  mm.add('(hover: hover) and (pointer: fine) and (min-width: 900px)', () => {
    initCursor()
    initMagneticButtons()
    initCardTilt()
    initThreadField()
    return () => {}
  })
}

// ─── Smooth scroll (Lenis) ───────────────────────────────────────────────────
// Native-scroll based, so position:fixed, ScrollTrigger pins and the navbar
// scroll listener all keep working; Lenis only eases the wheel input. Touch
// scrolling stays fully native (no hijacking on mobile).

let lenis = null

function initSmoothScroll() {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1.0 })
  window.lenis = lenis // programmatic scrolls must go through lenis.scrollTo
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Anchor navigation glides instead of jumping (offset clears the fixed navbar)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')
      if (id.length < 2) return
      const target = document.querySelector(id)
      if (!target) return
      e.preventDefault()
      lenis.scrollTo(target, { offset: -64, duration: 1.4 })
    })
  })
}

// ─── Scroll progress — thread sewn across the top edge ──────────────────────

function initScrollProgress() {
  const bar = document.createElement('div')
  bar.className = 'scroll-progress'
  bar.setAttribute('aria-hidden', 'true')
  const fill = document.createElement('span')
  bar.appendChild(fill)
  document.body.appendChild(bar)

  gsap.to(fill, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: 0.4 }
  })
}

// ─── Custom cursor (fine pointers only) ──────────────────────────────────────
// A small accent dot tracks the pointer 1:1; a ring eases behind it and grows
// over anything interactive. Native cursor is hidden except on form fields.

function initCursor() {
  const dot = document.createElement('div')
  dot.className = 'cursor-dot'
  const ring = document.createElement('div')
  ring.className = 'cursor-ring'
  document.body.append(dot, ring)
  document.documentElement.classList.add('has-cursor')

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

  window.addEventListener('mousemove', (e) => {
    dotX(e.clientX); dotY(e.clientY)
    ringX(e.clientX); ringY(e.clientY)
  }, { passive: true })

  const INTERACTIVE = 'a, button, [role="button"], .btn, label, summary, .faq-question'
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(INTERACTIVE)) gsap.to(ring, { scale: 1.7, duration: 0.3, ease: 'power3.out' })
  })
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(INTERACTIVE)) gsap.to(ring, { scale: 1, duration: 0.3, ease: 'power3.out' })
  })
  document.addEventListener('mousedown', () => gsap.to(ring, { scale: 0.8, duration: 0.15 }))
  document.addEventListener('mouseup', () => gsap.to(ring, { scale: 1, duration: 0.25 }))

  // hide over form fields (native cursor takes over there)
  document.addEventListener('mouseover', (e) => {
    const onField = e.target.closest('input, textarea, select')
    gsap.to([dot, ring], { opacity: onField ? 0 : 1, duration: 0.2 })
  })
  document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }))
  document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 }))
}

// ─── Magnetic CTAs ───────────────────────────────────────────────────────────

function initMagneticButtons() {
  const targets = document.querySelectorAll('.hero-buttons .btn, #cta-banner .btn, .btn-wa-nav')
  targets.forEach((btn) => {
    const strength = 0.32
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' })
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' })
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    })
    btn.addEventListener('mouseleave', () => { xTo(0); yTo(0) })
  })
}

// ─── Section titles — masked line reveal ────────────────────────────────────
// Each title is wrapped in an overflow:hidden mask and slides up into view.
// Wrapping (not splitting) keeps the bilingual data-es/data-en toggle intact.

function initTitleReveals() {
  document.querySelectorAll('.section-title').forEach((title) => {
    const mask = document.createElement('div')
    mask.className = 'title-mask'
    title.parentNode.insertBefore(mask, title)
    mask.appendChild(title)
    gsap.fromTo(title,
      { yPercent: 112 },
      {
        yPercent: 0, duration: 0.95, ease: 'power4.out',
        scrollTrigger: { trigger: mask, start: 'top 88%', once: true }
      }
    )
  })
}

// ─── Imagery — clip-path wipe reveals ────────────────────────────────────────

function initImageReveals() {
  const targets = document.querySelectorAll('.service-img, .about-photo, .hoop-frame')
  targets.forEach((el) => {
    el.classList.add('img-reveal')
    gsap.fromTo(el,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)', duration: 1.05, ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      }
    )
  })
}

// ─── Sector cards — 3D tilt ──────────────────────────────────────────────────

function initCardTilt() {
  document.querySelectorAll('.sector-card').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' })
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 10)
      rx(-py * 8)
    })
    card.addEventListener('mouseleave', () => { rx(0); ry(0) })
  })
}

// ─── CTA thread field — strings that bow toward the cursor ──────────────────
// A handful of horizontal "threads" drawn on canvas across the CTA band. Near
// the pointer they deflect like plucked thread and spring back. Runs its rAF
// loop only while the band is on screen.

function initThreadField() {
  const banner = document.getElementById('cta-banner')
  if (!banner) return
  const canvas = document.createElement('canvas')
  canvas.className = 'cta-threads'
  canvas.setAttribute('aria-hidden', 'true')
  banner.prepend(canvas)
  const ctx = canvas.getContext('2d')

  const THREADS = 9
  const SEGS = 60
  let w = 0, h = 0, dpr = 1
  let mouseX = -9999, mouseY = -9999
  const rows = []

  function resize() {
    const r = banner.getBoundingClientRect()
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    w = r.width; h = r.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    rows.length = 0
    for (let t = 0; t < THREADS; t++) {
      const y = h * (0.14 + (t / (THREADS - 1)) * 0.72)
      rows.push({ y, off: new Float32Array(SEGS + 1), vel: new Float32Array(SEGS + 1) })
    }
  }

  banner.addEventListener('mousemove', (e) => {
    const r = banner.getBoundingClientRect()
    mouseX = e.clientX - r.left
    mouseY = e.clientY - r.top
  }, { passive: true })
  banner.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999 })

  function step() {
    ctx.clearRect(0, 0, w, h)
    for (const row of rows) {
      const { y, off, vel } = row
      for (let i = 0; i <= SEGS; i++) {
        const x = (i / SEGS) * w
        const dx = x - mouseX
        const dy = y - mouseY
        const dist = Math.hypot(dx, dy)
        if (dist < 110) {
          const force = (1 - dist / 110) * 26
          vel[i] += (dy < 0 ? -force : force) * 0.12
        }
        // spring back + damping
        vel[i] += -off[i] * 0.085
        vel[i] *= 0.90
        off[i] += vel[i]
      }
      ctx.beginPath()
      ctx.moveTo(0, y + off[0])
      for (let i = 1; i <= SEGS; i++) {
        ctx.lineTo((i / SEGS) * w, y + off[i])
      }
      ctx.strokeStyle = 'rgba(21,140,140,0.32)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  let rafId = null
  const loop = () => { step(); rafId = requestAnimationFrame(loop) }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && rafId === null) {
      rafId = requestAnimationFrame(loop)
    } else if (!entry.isIntersecting && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })
  io.observe(banner)
  window.addEventListener('resize', resize, { passive: true })
  resize()
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

// ─── Hero frame-sequence scrubber ────────────────────────────────────────────
// The hero footage is scrubbed by scroll position, but instead of seeking a
// <video> (slow, unreliable to seek frame-by-frame, and what made earlier
// attempts hang the page), we pre-extract the clip as a sequence of images and
// draw the right one to a canvas each tick. Drawing a decoded <img> to canvas
// is essentially free, so this never janks — the technique Apple's product
// pages use for scroll-driven video.

function createFrameSequence(canvas, { isMobile, desktopCount, mobileCount }) {
  const count = isMobile ? mobileCount : desktopCount
  const prefix = isMobile ? 'm' : 'd'
  const pad = (n) => String(n).padStart(3, '0')
  const images = new Array(count)
  const ctx = canvas.getContext('2d')
  let canvasW = 0
  let canvasH = 0
  let lastIdx = 0

  function resize() {
    const rect = canvas.getBoundingClientRect()
    // During page load the pane/viewport can briefly measure 0 — retry until
    // real layout exists instead of locking in a 1px backing store.
    if (!rect.width || !rect.height) {
      requestAnimationFrame(resize)
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvasW = Math.round(rect.width * dpr)
    canvasH = Math.round(rect.height * dpr)
    canvas.width = canvasW
    canvas.height = canvasH
    drawIndex(lastIdx)
  }

  function findLoaded(idx) {
    const img = images[idx]
    if (img && img.complete && img.naturalWidth) return img
    for (let d = 1; d < count; d++) {
      const a = images[idx - d]
      if (a && a.complete && a.naturalWidth) return a
      const b = images[idx + d]
      if (b && b.complete && b.naturalWidth) return b
    }
    return null
  }

  function drawIndex(idx) {
    idx = Math.max(0, Math.min(count - 1, idx))
    lastIdx = idx
    if (!canvasW) return
    const img = findLoaded(idx)
    if (!img) return
    const ir = img.naturalWidth / img.naturalHeight
    const cr = canvasW / canvasH
    let dw, dh, dx, dy
    if (ir > cr) { dh = canvasH; dw = dh * ir; dx = (canvasW - dw) / 2; dy = 0 }
    else { dw = canvasW; dh = dw / ir; dx = 0; dy = (canvasH - dh) / 2 }
    ctx.clearRect(0, 0, canvasW, canvasH)
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  function preload(onFirstFrame) {
    for (let i = 0; i < count; i++) {
      const img = new Image()
      img.decoding = 'async'
      images[i] = img
      if (i === 0) {
        img.onload = () => { resize(); onFirstFrame && onFirstFrame() }
      }
      img.src = `/img/hero-frames/${prefix}_${pad(i + 1)}.webp`
    }
  }

  window.addEventListener('resize', resize, { passive: true })
  resize()

  return {
    count, drawIndex, preload,
    destroy() { window.removeEventListener('resize', resize) }
  }
}

// ─── Hero scroll story ───────────────────────────────────────────────────────
// The hero pins while the user scrolls through it: the story opens on a dark
// veil with the brand mark, then the veil lifts and the frame sequence scrubs
// forward in lockstep with the scrollbar while the copy builds up piece by
// piece (badge → headline → subtitle → CTAs). Everything stays visible at the
// end so the CTAs are clickable before the section unpins. Only runs when
// motion is allowed; without JS/reduced-motion the veil/brand layers stay
// hidden (CSS default) and the hero shows the static poster photo.

function splitWords(el) {
  const text = el.textContent.trim()
  el.innerHTML = ''
  text.split(/\s+/).forEach((word, i, arr) => {
    const span = document.createElement('span')
    span.style.cssText = 'display:inline-block'
    span.textContent = word
    el.appendChild(span)
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '))
  })
  return el.querySelectorAll('span')
}

function initHeroStory() {
  const veil = document.querySelector('.hero-veil')
  const brand = document.querySelector('.hero-brand')
  const hint = document.querySelector('.hero-scroll-hint')
  const canvas = document.getElementById('hero-canvas')
  const h1 = document.querySelector('#hero h1')
  if (!veil || !brand || !canvas || !h1) return

  // Very slow connections skip the frame sequence — reveal everything
  // statically over the poster photo instead of loading ~60 images.
  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection
  const slowNetwork = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))
  if (slowNetwork) return // CSS defaults: veil/brand hidden, content visible

  const words = splitWords(h1)
  const badge = document.querySelector('.hero-badge')
  const subtitle = document.querySelector('#hero .hero-content > p')
  const buttons = document.querySelectorAll('.hero-buttons > *')

  // gsap.matchMedia (instead of a one-shot isMobile check) means the whole
  // story tears down and rebuilds itself if the breakpoint changes — including
  // the pathological case where the viewport briefly reports 0×0 during load
  // and would otherwise lock in the wrong variant forever.
  const mm = gsap.matchMedia()
  mm.add(
    { mobile: '(max-width: 767px)', desktop: '(min-width: 768px)' },
    (ctx) => {
      const isMobile = ctx.conditions.mobile

      // Opening state — inside the context so a teardown restores the
      // no-JS/reduced-motion defaults automatically.
      gsap.set(veil, { opacity: 1 })
      gsap.set(brand, { opacity: 0, scale: 0.92 })
      if (hint) gsap.set(hint, { opacity: 1 })
      gsap.set(words, { opacity: 0, y: 40 })
      if (badge) gsap.set(badge, { opacity: 0, y: 24 })
      if (subtitle) gsap.set(subtitle, { opacity: 0, y: 24 })
      if (buttons.length) gsap.set(buttons, { opacity: 0, y: 20 })

      const seq = createFrameSequence(canvas, { isMobile, desktopCount: 60, mobileCount: 42 })
      seq.preload(() => {
        canvas.classList.add('is-ready')
        ScrollTrigger.refresh()
      })

      const scrub = { t: 0 }
      const applyFrame = () => seq.drawIndex(Math.round(scrub.t * (seq.count - 1)))

      // Timeline positions are abstract units over a 10-unit story; the pin
      // distance below decides how much real scrolling those units map to.
      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          // Percentage strings are re-resolved by ScrollTrigger on every
          // refresh — immune to the window reporting 0 during initial load.
          end: isMobile ? '+=220%' : '+=300%',
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      })

      const reveal = {
        badge: isMobile ? 3.3 : 4.0,
        words: isMobile ? 3.6 : 4.3,
        subtitle: isMobile ? 5.2 : 6.0,
        buttons: isMobile ? 6.1 : 7.0
      }

      tl.to(brand, { opacity: 1, scale: 1, duration: 1.2 }, 0)
      if (hint) tl.to(hint, { opacity: 0, duration: 0.6, ease: 'power1.out' }, 1.0)
      tl.to(scrub, { t: 1, duration: 8.2, ease: 'none', onUpdate: applyFrame }, 1.0)
        .to(veil, { opacity: 0, duration: 1.8, ease: 'power1.inOut' }, 1.6)
        .to(brand, { opacity: 0, y: -50, duration: 1.0, ease: 'power1.in' }, 3.0)
      if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.7 }, reveal.badge)
      tl.to(words, { opacity: 1, y: 0, duration: 1.1, stagger: isMobile ? 0.045 : 0.07 }, reveal.words)
      if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, reveal.subtitle)
      if (buttons.length) tl.to(buttons, { opacity: 1, y: 0, duration: 0.8, stagger: 0.16 }, reveal.buttons)
      tl.to({}, { duration: 1.5 }, 8.5) // hold: full composition over the final frames

      return () => seq.destroy()
    }
  )
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
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const dist = isMobile ? 12 : 22

  // Section eyebrows/subtitles get a quiet fade-up (titles have their own
  // masked line reveal in initTitleReveals). About's header rides the
  // about-text slide-in below, so it's excluded to avoid a double-fade.
  const headerEls = Array.from(
    document.querySelectorAll('.eyebrow, .section-subtitle')
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
