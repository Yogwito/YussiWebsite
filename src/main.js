import './css/site.css'

import { initLang } from './lang.js'
import { initFaq } from './faq.js'
import { initNavbar } from './navbar.js'
import { initForm } from './form.js'
import { initAnimations } from './animations.js'
import { initWaBubble } from './whatsapp.js'
import { initCoverageMap } from './coverage-map.js'

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
  initAnimations()
  initWaBubble()
  initCoverageMap()
})
