import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export function initAnimations() {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const videos = initAutoplayVideos(motionQuery)
  initLoader()
  initSkipLink()

  let motionLayersEnabled = false
  let smoothScrollCleanup = null

  const enableMotionLayers = () => {
    if (motionLayersEnabled) return
    motionLayersEnabled = true
    document.documentElement.classList.remove('reduced-motion')
    initHeroEntrance()
    initReveals()
    initParallax()
    initScrollProgress()
    smoothScrollCleanup = initSmoothScroll()
  }

  const disableMotionLayers = () => {
    document.documentElement.classList.add('reduced-motion')
    videos.setReduced(true)
    smoothScrollCleanup?.()
    smoothScrollCleanup = null
    motionLayersEnabled = false
    gsap.killTweensOf('*')
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    document.documentElement.classList.add('motion-ready')
  }

  const applyMotionPreference = () => {
    if (motionQuery.matches) disableMotionLayers()
    else {
      videos.setReduced(false)
      enableMotionLayers()
    }
  }

  applyMotionPreference()
  motionQuery.addEventListener?.('change', applyMotionPreference)
}

function initSkipLink() {
  const link = document.querySelector('.skip-link')
  if (!link) return

  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href')
    const target = selector ? document.querySelector(selector) : null
    if (!target) return

    event.preventDefault()
    window.history.pushState({}, '', selector)
    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset
    window.scrollTo({ top, behavior: 'auto' })
    target.focus({ preventScroll: true })
  })
}

function initLoader() {
  const loader = document.getElementById('page-loader')
  if (!loader) return

  let hidden = false
  const hide = () => {
    if (hidden) return
    hidden = true
    loader.classList.add('is-hidden')
    loader.addEventListener('transitionend', () => loader.remove(), { once: true })
  }

  window.setTimeout(hide, document.readyState === 'complete' ? 180 : 420)
}

function initAutoplayVideos(motionQuery) {
  const videos = [...document.querySelectorAll('video[data-autoplay]')]
  let reduced = motionQuery.matches

  if (!videos.length) return { setReduced: () => {} }

  const play = (video) => {
    if (reduced || document.hidden) return
    const promise = video.play()
    if (promise) promise.catch(() => {})
  }

  const isVisible = (video) => {
    const bounds = video.getBoundingClientRect()
    return bounds.bottom > 0 && bounds.top < window.innerHeight
  }

  const syncVideos = () => {
    videos.forEach((video) => {
      video.muted = true
      video.defaultMuted = true
      video.playsInline = true

      if (reduced) {
        video.pause()
        video.removeAttribute('autoplay')
      } else {
        // "in-view": solo se reproduce al llegar a la sección, sin descargarse antes.
        if (video.dataset.autoplay !== 'in-view') video.setAttribute('autoplay', '')
        if (isVisible(video)) play(video)
      }
    })
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target
      if (entry.isIntersecting && !reduced && !document.hidden) play(video)
      else video.pause()
    })
  }, { threshold: 0.05 })

  videos.forEach((video) => {
    video.muted = true
    video.defaultMuted = true
    video.playsInline = true
    if (reduced) video.removeAttribute('autoplay')
    else if (video.readyState >= 2) play(video)
    else video.addEventListener('canplay', () => play(video), { once: true })

    observer.observe(video)
    video.addEventListener('loadedmetadata', () => {
      if (!reduced) ScrollTrigger.refresh()
    }, { once: true })
  })

  const onVisibilityChange = () => {
    videos.forEach((video) => {
      if (document.hidden || reduced) video.pause()
      else if (isVisible(video)) play(video)
    })
  }

  document.addEventListener('visibilitychange', onVisibilityChange)
  motionQuery.addEventListener?.('change', () => {
    reduced = motionQuery.matches
    syncVideos()
  })

  return {
    setReduced(nextReduced) {
      reduced = nextReduced
      syncVideos()
    },
    destroy() {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }
}

function initSmoothScroll() {
  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1
  })
  const anchorHandlers = []
  const skipLink = document.querySelector('.skip-link')

  const ticker = (time) => lenis.raf(time * 1000)
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(ticker)
  gsap.ticker.lagSmoothing(0)

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link === skipLink || link.matches('[data-product]')) return
    const handler = (event) => {
      const selector = link.getAttribute('href')
      if (!selector || selector === '#') return

      const target = document.querySelector(selector)
      if (!target) return

      event.preventDefault()
      window.history.pushState({}, '', selector)
      const offset = -(document.querySelector('.site-header')?.offsetHeight || 0) - 16
      lenis.scrollTo(target, { duration: 1.1, offset })
    }
    link.addEventListener('click', handler)
    anchorHandlers.push(() => link.removeEventListener('click', handler))
  })

  const syncInitialHash = () => {
    if (!window.location.hash) return

    let id = window.location.hash.slice(1)
    try {
      id = decodeURIComponent(id)
    } catch {
      return
    }

    const target = document.getElementById(id)
    if (!target) return

    lenis.resize()
    const offset = -(document.querySelector('.site-header')?.offsetHeight || 0) - 16
    lenis.scrollTo(target, { immediate: true, force: true, offset })
  }

  window.requestAnimationFrame(syncInitialHash)
  window.addEventListener('load', syncInitialHash, { once: true })
  window.addEventListener('popstate', syncInitialHash)
  window.addEventListener('hashchange', syncInitialHash)
  document.fonts?.ready.then(syncInitialHash)
  window.setTimeout(syncInitialHash, 600)

  return () => {
    anchorHandlers.forEach((remove) => remove())
    window.removeEventListener('popstate', syncInitialHash)
    window.removeEventListener('hashchange', syncInitialHash)
    gsap.ticker.remove(ticker)
    lenis.destroy()
  }
}

function initHeroEntrance() {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => document.documentElement.classList.add('motion-ready'), 120)
  })
}

function initReveals() {
  const selectors = [
    '.section-header',
    '.product-card',
    '.work-item',
    '.process-media',
    '.process-copy > *',
    '.coverage-copy > *',
    '.coverage-visual',
    '.about-title',
    '.about-copy',
    '.faq-intro',
    '.faq-item',
    '.contact-copy',
    '.quote-form'
  ]

  const targets = document.querySelectorAll(selectors.join(','))
  targets.forEach((target) => target.classList.add('reveal'))

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    })
  }, {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.08
  })

  targets.forEach((target, index) => {
    target.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`
    observer.observe(target)
  })
}

function initParallax() {
  const media = document.querySelector('.hero-media video')
  if (media) {
    gsap.fromTo(media,
      { scale: 1.02 },
      {
        scale: 1.1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      }
    )
  }

  const desktop = window.matchMedia('(min-width: 900px)')
  if (!desktop.matches) return

  document.querySelectorAll('.product-card img, .product-card video, .work-item img, .work-item video').forEach((image) => {
    gsap.fromTo(image,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: image.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      }
    )
  })
}

function initScrollProgress() {
  document.querySelector('.scroll-progress')?.remove()
  const progress = document.createElement('div')
  progress.className = 'scroll-progress'
  progress.setAttribute('aria-hidden', 'true')
  progress.innerHTML = '<span></span>'
  document.body.appendChild(progress)

  gsap.to(progress.firstElementChild, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      scrub: 0.2
    }
  })
}
