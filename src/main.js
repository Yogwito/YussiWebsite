import './css/site.css'
import './css/corporate.css'
import './css/product-explorer.css'
import './css/production.css'
import './css/story.css'
import './css/mobile.css'

import { initLang } from './lang.js'
import { initFaq } from './faq.js'
import { initNavbar } from './navbar.js'
import { initForm } from './form.js'
import { initAnimations } from './animations.js'
import { initWaBubble } from './whatsapp.js'
import { initCoverageMap } from './coverage-map.js'
import { initClients } from './clients.js'
import { initProductExplorer } from './product-explorer.js'
import { initProduction } from './production.js'
import { initScrollStories } from './scroll-story.js'
import { initBrandsMarquee } from './brands-marquee.js'
import { initLightbox } from './lightbox.js'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const resetInitialScroll = () => {
  if (!window.location.hash) window.scrollTo(0, 0)
}

resetInitialScroll()

document.addEventListener('DOMContentLoaded', () => {
  resetInitialScroll()
  initNavbar()
  initLang()
  initFaq()
  initForm()
  initProductExplorer()
  initScrollStories()
  initProduction()
  initAnimations()
  initWaBubble()
  initCoverageMap()
  initClients()
  initBrandsMarquee()
  initLightbox()
})
